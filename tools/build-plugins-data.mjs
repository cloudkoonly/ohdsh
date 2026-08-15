// Oh! dsh tools — enrich data/plugins.json for the Twig-rendered plugins directory.
//
// Reads   data/plugins.json   raw snapshot produced by tools/fetch-plugins.mjs
//         data/featured.json  hand-maintained editor's picks (array of plugin slugs)
// Writes  data/plugins.json   same file, enriched in place (idempotent)
//
// The page itself (website/plugins.html) is a hand-maintained Twig template and is
// never generated: it renders whatever this file produces.
//
// Usage: node tools/build-plugins-data.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_DIR = path.resolve(__dirname, '..');
const DATA_PATH = path.join(REPO_DIR, 'data', 'plugins.json');
const FEATURED_PATH = path.join(REPO_DIR, 'data', 'featured.json');

// Items rendered per page when no ?per_page= is supplied.
const PAGE_SIZE = 24;

// Number of avatar gradients declared in the Twig template. Must stay in sync
// with the `gradients` array in website/plugins.html.
const GRADIENT_COUNT = 8;

const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
const featured = JSON.parse(fs.readFileSync(FEATURED_PATH, 'utf8'));
const featuredSet = new Set(featured);

if (!Array.isArray(data.categories) || !Array.isArray(data.plugins)) {
  throw new Error('data/plugins.json must contain "categories" and "plugins" arrays');
}

const categoryName = Object.fromEntries(data.categories.map((c) => [c.slug, c.name]));

// Deterministic gradient index so a plugin keeps the same colour across pages.
function gradientIndex(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return h % GRADIENT_COUNT;
}

const plugins = data.plugins.map((p) => ({
  slug: p.slug,
  name: p.name,
  url: p.url,
  description: p.description,
  category: p.category,
  category_name: categoryName[p.category] || p.category,
  featured: featuredSet.has(p.slug),
  grad: gradientIndex(p.name),
}));

const bySlug = new Map(plugins.map((p) => [p.slug, p]));

const counts = {};
for (const p of plugins) counts[p.category] = (counts[p.category] || 0) + 1;

const categories = data.categories.map((c) => ({
  name: c.name,
  slug: c.slug,
  count: counts[c.slug] || 0,
}));

// Editor's picks kept as a separate small array so the template can show them
// even though `plugins` is sliced server-side by the pagination layer.
const missing = featured.filter((slug) => !bySlug.has(slug));
if (missing.length) {
  console.warn('warning: featured slugs not found in plugins.json -> ' + missing.join(', '));
}
const featuredPlugins = featured.filter((slug) => bySlug.has(slug)).map((slug) => bySlug.get(slug));

const out = {
  generated_at: data.generated_at,
  source: data.source,
  count: plugins.length,
  featured_count: featuredPlugins.length,
  page_size: PAGE_SIZE,
  categories,
  featured_plugins: featuredPlugins,
  plugins,
};

fs.writeFileSync(DATA_PATH, JSON.stringify(out, null, 2));

const kb = Math.round(fs.statSync(DATA_PATH).size / 1024);
console.log('enriched -> ' + DATA_PATH + ' (' + kb + ' KB)');
console.log(
  '  ' + plugins.length + ' plugins · ' + categories.length + ' categories · ' +
  featuredPlugins.length + ' featured · page_size ' + PAGE_SIZE
);
