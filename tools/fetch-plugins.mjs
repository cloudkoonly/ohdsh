// Oh! dsh tools — fetch the awesome-dsh-plugin community list and snapshot it to data/plugins.json
// Usage: node tools/fetch-plugins.mjs
import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_DIR = path.resolve(__dirname, '..');
const OUT = path.join(REPO_DIR, 'data', 'plugins.json');
const RAW_URL = 'https://raw.githubusercontent.com/awesome-dsh-plugin/awesome-dsh-plugin/main/README.md';

function fetchText(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'ohdsh-tools' } }, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error('HTTP ' + res.statusCode + ' for ' + url));
        return;
      }
      let b = '';
      res.on('data', (c) => (b += c));
      res.on('end', () => resolve(b));
    }).on('error', reject);
  });
}

async function fetchWithRetry(url, attempts = 3) {
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fetchText(url);
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

const md = await fetchWithRetry(RAW_URL);
const lines = md.split(/\r?\n/);
const categories = [];
const plugins = [];
const seenSlugs = new Set();
let inPlugins = false;
let category = null;

for (const line of lines) {
  const t = line.trim();
  if (!inPlugins) {
    if (/^## Plugins\s*$/.test(t)) inPlugins = true;
    continue;
  }
  if (/^## /.test(t)) break; // stop at Badge / Disclaimer sections

  const catMatch = t.match(/^### (.+)$/);
  if (catMatch) {
    category = { name: catMatch[1].trim(), slug: slugify(catMatch[1]) };
    categories.push(category);
    continue;
  }

  const entry = t.match(/^-\s*\[([^\]]+)\]\(([^)]+)\)\s*-\s*(.+)$/);
  if (entry && category) {
    const name = entry[1].trim();
    const url = entry[2].trim();
    const description = entry[3].trim();
    const repoPart = url.replace(/^https?:\/\/github\.com\//, '').split('/tree/')[0].split('/blob/')[0];
    const ownerRepo = repoPart.split('/').slice(0, 2).join('/');
    let slug = slugify(ownerRepo.replace('/', '-')) + '-' + slugify(name.split(/[#/]/).pop());
    while (seenSlugs.has(slug)) slug += '-2';
    seenSlugs.add(slug);
    plugins.push({
      slug,
      name,
      url,
      description,
      category: category.slug,
    });
  }
}

const out = {
  generated_at: new Date().toISOString().slice(0, 10),
  source: 'https://github.com/awesome-dsh-plugin/awesome-dsh-plugin',
  count: plugins.length,
  categories,
  plugins,
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(out, null, 2));
console.log('parsed ' + plugins.length + ' plugins in ' + categories.length + ' categories');
console.log('categories: ' + categories.map((c) => c.slug + '(' + plugins.filter((p) => p.category === c.slug).length + ')').join(', '));
console.log('written -> ' + OUT);
