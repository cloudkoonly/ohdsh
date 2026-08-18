// Oh! dsh tools — fetch the awesome-dsh-plugin community list and snapshot it to data/plugins.json
//
// Fetches BOTH the English (README.md) and Chinese (README.zh.md) upstream lists,
// then merges them so each plugin carries an English and a Chinese description
// (and each category an English and a Chinese name). The English list is the
// canonical source of truth for the plugin set; the Chinese list is matched by
// repo URL and provides description_zh / category name_zh where present.
//
// Usage: node tools/fetch-plugins.mjs
import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_DIR = path.resolve(__dirname, '..');
const OUT = path.join(REPO_DIR, 'data', 'plugins.json');

const RAW_BASE = 'https://raw.githubusercontent.com/awesome-dsh-plugin/awesome-dsh-plugin/main';
const API_BASE = 'https://api.github.com/repos/awesome-dsh-plugin/awesome-dsh-plugin/contents';

// raw.githubusercontent.com can intermittently fail DNS on some networks; fall
// back to the GitHub contents API, which returns the same raw bytes.
async function fetchFile(file) {
  const candidates = [
    { url: `${RAW_BASE}/${file}`, headers: {} },
    { url: `${API_BASE}/${file}`, headers: { Accept: 'application/vnd.github.raw+json' } },
  ];
  let lastErr;
  for (const c of candidates) {
    try {
      return await fetchWithRetry(c.url, 3, c.headers);
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr;
}

function fetchText(url, headers = {}, timeoutMs = 30000) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'User-Agent': 'ohdsh-tools', ...headers } }, (res) => {
      if (res.statusCode !== 200) {
        res.resume();
        reject(new Error('HTTP ' + res.statusCode + ' for ' + url));
        return;
      }
      let b = '';
      res.on('data', (c) => (b += c));
      res.on('end', () => resolve(b));
      res.on('error', reject);
    });
    req.on('error', reject);
    req.setTimeout(timeoutMs, () => {
      req.destroy(new Error('timeout while fetching ' + url));
    });
  });
}

async function fetchWithRetry(url, attempts = 5, headers = {}) {
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fetchText(url, headers);
    } catch (e) {
      lastErr = e;
      await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
    }
  }
  throw lastErr;
}

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Strip a leading emoji / decoration from a category heading ("🎨 UI 增强" -> "UI 增强").
function stripLeadingEmoji(s) {
  return s.replace(/^\s*[^\u4e00-\u9fa5A-Za-z0-9]+\s*/, '').trim();
}

// Parse one README body into categories + plugin entries.
//   pluginsHeading   — the `## ` heading that opens the plugin section
//   stripCategoryEmoji — whether to strip the emoji prefix from `### ` headings
function parseList(md, { pluginsHeading, stripCategoryEmoji }) {
  const lines = md.split(/\r?\n/);
  const categories = [];
  const plugins = [];
  let inPlugins = false;
  let category = null;

  for (const line of lines) {
    const t = line.trim();
    if (!inPlugins) {
      if (new RegExp('^## ' + pluginsHeading + '\\s*$').test(t)) inPlugins = true;
      continue;
    }
    if (/^## /.test(t)) break; // stop at Contributing / Badge / Disclaimer sections

    const catMatch = t.match(/^### (.+)$/);
    if (catMatch) {
      let name = catMatch[1].trim();
      if (stripCategoryEmoji) name = stripLeadingEmoji(name);
      category = { name, slug: slugify(name) };
      categories.push(category);
      continue;
    }

    // Upstream uses "-" (EN) or "—" (ZH) between the link and the description.
    const entry = t.match(/^-\s*\[([^\]]+)\]\(([^)]+)\)\s*[-—]\s*(.+)$/);
    if (entry && category) {
      plugins.push({
        name: entry[1].trim(),
        url: entry[2].trim(),
        description: entry[3].trim(),
        category: category.slug,
      });
    }
  }

  return { categories, plugins };
}

function pluginSlug(name, url) {
  const repoPart = url.replace(/^https?:\/\/github\.com\//, '').split('/tree/')[0].split('/blob/')[0];
  const ownerRepo = repoPart.split('/').slice(0, 2).join('/');
  return slugify(ownerRepo.replace('/', '-')) + '-' + slugify(name.split(/[#/]/).pop());
}

const [enMd, zhMd] = await Promise.all([
  fetchFile('README.md'),
  fetchFile('README.zh.md'),
]);

const en = parseList(enMd, { pluginsHeading: 'Plugins', stripCategoryEmoji: false });
const zh = parseList(zhMd, { pluginsHeading: '插件', stripCategoryEmoji: true });

// Canonical categories come from the English list; attach the Chinese name by
// position (both lists are kept in the same order by the upstream maintainers).
const categories = en.categories.map((c, i) => ({
  name: c.name,
  name_zh: zh.categories[i] ? zh.categories[i].name : null,
  slug: c.slug,
}));

// Match the Chinese list by repo URL to graft description_zh onto each plugin.
const zhByUrl = new Map(zh.plugins.map((p) => [p.url, p]));

const seenSlugs = new Set();
const plugins = [];
for (const p of en.plugins) {
  let slug = pluginSlug(p.name, p.url);
  while (seenSlugs.has(slug)) slug += '-2';
  seenSlugs.add(slug);

  const zhEntry = zhByUrl.get(p.url);
  plugins.push({
    slug,
    name: p.name,
    url: p.url,
    description: p.description,
    description_zh: zhEntry ? zhEntry.description : undefined,
    category: p.category,
  });
}

const out = {
  generated_at: new Date().toISOString().slice(0, 10),
  source: 'https://github.com/awesome-dsh-plugin/awesome-dsh-plugin',
  source_zh: 'https://github.com/awesome-dsh-plugin/awesome-dsh-plugin/blob/main/README.zh.md',
  count: plugins.length,
  categories,
  plugins,
};

// Merge hand-maintained first-party plugins (data/own-plugins.json) so that
// upstream refreshes never drop them from the snapshot.
const OWN_PATH = path.join(REPO_DIR, 'data', 'own-plugins.json');
if (fs.existsSync(OWN_PATH)) {
  const own = JSON.parse(fs.readFileSync(OWN_PATH, 'utf8'));
  let added = 0;
  for (const p of own) {
    if (!plugins.some((x) => x.slug === p.slug)) {
      plugins.push(p);
      added++;
    }
  }
  out.count = plugins.length;
  if (added) console.log('merged ' + added + ' own plugin(s) from data/own-plugins.json');
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(out, null, 2));

const zhMatched = plugins.filter((p) => p.description_zh).length;
console.log('parsed ' + plugins.length + ' plugins in ' + categories.length + ' categories');
console.log('  chinese descriptions matched: ' + zhMatched + ' / ' + plugins.length);
console.log('categories: ' + categories.map((c) => c.slug + '(' + plugins.filter((p) => p.category === c.slug).length + ')').join(', '));
console.log('written -> ' + OUT);
