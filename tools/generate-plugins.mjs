// Oh! dsh tools — generate website/plugins.html from data/plugins.json
// Usage: node tools/generate-plugins.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_DIR = path.resolve(__dirname, '..');
const DATA_PATH = path.join(REPO_DIR, 'data', 'plugins.json');
const FEATURED_PATH = path.join(REPO_DIR, 'data', 'featured.json');
const OUT = path.join(REPO_DIR, 'website', 'plugins.html');

const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
const featured = JSON.parse(fs.readFileSync(FEATURED_PATH, 'utf8'));
const featuredSet = new Set(featured);

const esc = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const catName = Object.fromEntries(data.categories.map((c) => [c.slug, c.name]));
const byCat = new Map(data.categories.map((c) => [c.slug, []]));
for (const p of data.plugins) byCat.get(p.category).push(p);

const card = (p) => {
  const star = featuredSet.has(p.slug) ? '<span style="color:#f59e0b" title="Featured pick">★</span>' : '';
  const search = (p.name + ' ' + p.description + ' ' + (catName[p.category] || '')).toLowerCase();
  return `<a href="${esc(p.url)}" target="_blank" rel="noopener noreferrer" class="card block plugin-card" data-cat="${esc(p.category)}" data-featured="${featuredSet.has(p.slug) ? '1' : '0'}" data-search="${esc(search)}">
            <div class="flex items-center justify-between gap-2">
              <h3 class="font-semibold text-sm truncate">${esc(p.name)}</h3>${star}
            </div>
            <p class="mt-1.5 text-xs text-gray-500 leading-relaxed">${esc(p.description)}</p>
          </a>`;
};

const tabs = ['featured', 'all', ...data.categories.map((c) => c.slug)]
  .map((s) => {
    const label = s === 'featured' ? '★ Featured' : s === 'all' ? 'All' : catName[s];
    return `<button type="button" class="filter-tab px-3 py-1.5 rounded-full text-xs font-medium border border-black/10 bg-white text-gray-600" data-filter="${esc(s)}">${esc(label)}</button>`;
  })
  .join('\n');

const sectionsHtml = data.categories
  .map((c) => {
    const items = byCat.get(c.slug).map(card).join('\n');
    return `<section id="cat-${c.slug}" class="plugin-section scroll-mt-24">
      <h2 class="text-xl font-bold tracking-tight">${esc(c.name)}</h2>
      <div class="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">${items}</div>
    </section>`;
  })
  .join('\n');

const itemList = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'DSH Plugin Directory',
  numberOfItems: data.plugins.length,
  itemListElement: data.plugins.map((p, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: p.name,
    url: p.url,
  })),
};

const collectionPage = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'DSH Plugin Directory',
  url: 'https://ohdsh.com/plugins',
  description:
    'Curated directory of DeepSeek Harness community plugins, organized by category with direct links to source repositories.',
  mainEntity: {
    '@type': 'ItemList',
    numberOfItems: data.plugins.length,
  },
};

const breadcrumb = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://ohdsh.com/' },
    { '@type': 'ListItem', position: 2, name: 'Plugins', item: 'https://ohdsh.com/plugins' },
  ],
};

const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DSH Plugins | Oh! dsh</title>
</head>
<body>
    <header><!-- header placeholder --></header>

    <main>
        <!--seo:{"title":"DSH Plugins — ${data.plugins.length}+ DeepSeek Harness Plugins Directory | Oh! dsh","description":"Browse ${data.plugins.length}+ DeepSeek Harness (DSH) community plugins organized by category: UI, themes, memory, tools, workflows, integrations and more. Every listing links to its source repository.","keywords":"DSH plugins, DeepSeek Harness plugins, DSH plugin list, DeepSeek Harness plugin directory","canonical":"https://ohdsh.com/plugins","og_title":"DSH Plugins — ${data.plugins.length}+ DeepSeek Harness Plugins Directory","og_description":"Browse ${data.plugins.length}+ DeepSeek Harness community plugins organized by category, with direct links to source repositories.","og_url":"https://ohdsh.com/plugins","og_site_name":"Oh! dsh"}-->
        <script type="application/ld+json">${JSON.stringify(collectionPage)}</script>
        <script type="application/ld+json">${JSON.stringify(itemList)}</script>
        <script type="application/ld+json">${JSON.stringify(breadcrumb)}</script>

        <section class="pt-32 pb-10 px-6 text-center">
            <span class="section-badge"><span class="dot"></span>DeepSeek Harness · Plugin Directory</span>
            <h1 class="mt-6 text-4xl md:text-5xl font-bold tracking-tight">Find the right DSH plugin</h1>
            <p class="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
                ${data.plugins.length}+ community plugins for DeepSeek Harness — search, filter by category, and jump straight to each plugin's source repository.
            </p>
            <div class="mt-6 flex flex-wrap justify-center gap-2 text-xs text-gray-400">
                <span class="px-3 py-1 rounded-full border border-black/10 bg-white">${data.plugins.length} plugins</span>
                <span class="px-3 py-1 rounded-full border border-black/10 bg-white">${data.categories.length} categories</span>
                <span class="px-3 py-1 rounded-full border border-black/10 bg-white">Updated ${data.generated_at}</span>
            </div>
            <div class="mt-8 flex flex-wrap justify-center gap-3">
                <a href="#directory" class="btn-primary">Browse all</a>
                <a href="/docs/en/guide/quick-start" class="btn-secondary">How to install</a>
            </div>
        </section>

        <section class="pt-6 pb-4 px-6">
            <div class="max-w-6xl mx-auto">
                <div class="flex flex-col md:flex-row md:items-center gap-3">
                    <input id="pluginSearch" type="search" placeholder="Search ${data.plugins.length}+ plugins…" class="w-full md:max-w-xs px-4 py-2 rounded-lg border border-black/10 bg-white text-sm text-gray-700 focus:outline-none focus:border-[#4d6bfe]">
                    <div class="flex flex-wrap gap-2" id="filterTabs">${tabs}</div>
                </div>
                <div class="mt-3 flex items-center justify-between text-xs text-gray-400">
                    <span id="resultCount">${data.plugins.length} plugins</span>
                    <div id="pager" class="flex items-center gap-2"></div>
                </div>
            </div>
        </section>

        <section id="directory" class="py-10 px-6 scroll-mt-24">
            <div class="max-w-6xl mx-auto space-y-12">${sectionsHtml}</div>
        </section>

        <section class="py-12 px-6">
            <div class="max-w-3xl mx-auto text-xs text-gray-400 leading-relaxed">
                <p>This directory is a snapshot of the community-maintained
                <a href="https://github.com/awesome-dsh-plugin/awesome-dsh-plugin" class="text-[#4d6bfe] hover:underline underline-offset-4">awesome-dsh-plugin</a>
                list (updated ${data.generated_at}). Listings link to the authors' repositories; inclusion is not an endorsement or a security review — review the source before installing third-party code. Missing a plugin? Contribute to the upstream list.</p>
            </div>
        </section>

        <script>
            (function () {
                var cards = [].slice.call(document.querySelectorAll('.plugin-card'));
                var sections = [].slice.call(document.querySelectorAll('.plugin-section'));
                var tabs = [].slice.call(document.querySelectorAll('.filter-tab'));
                var search = document.getElementById('pluginSearch');
                var pagerEl = document.getElementById('pager');
                var countEl = document.getElementById('resultCount');
                var filter = 'all', query = '', page = 1, per = 48;

                function match(c) {
                    if (filter === 'featured' && c.getAttribute('data-featured') !== '1') return false;
                    if (filter !== 'all' && filter !== 'featured' && c.getAttribute('data-cat') !== filter) return false;
                    if (query && c.getAttribute('data-search').indexOf(query) === -1) return false;
                    return true;
                }

                function setActive(t) {
                    tabs.forEach(function (x) {
                        x.style.background = '';
                        x.style.color = '';
                        x.style.borderColor = '';
                    });
                    if (t) {
                        t.style.background = '#4d6bfe';
                        t.style.color = '#ffffff';
                        t.style.borderColor = 'transparent';
                    }
                }

                function render() {
                    var list = cards.filter(match);
                    var totalPages = Math.max(1, Math.ceil(list.length / per));
                    if (page > totalPages) page = totalPages;
                    cards.forEach(function (c) { c.style.display = 'none'; });
                    list.slice((page - 1) * per, page * per).forEach(function (c) { c.style.display = ''; });
                    sections.forEach(function (s) {
                        var any = [].slice.call(s.querySelectorAll('.plugin-card')).some(function (c) { return c.style.display !== 'none'; });
                        s.style.display = any ? '' : 'none';
                    });
                    if (countEl) countEl.textContent = list.length + ' plugins';
                    if (pagerEl) {
                        var html = '';
                        html += '<button type="button" id="pgPrev" class="px-3 py-1.5 rounded-md text-xs font-medium border border-black/10 bg-white text-gray-600 disabled:opacity-40"' + (page <= 1 ? ' disabled' : '') + '>← Prev</button>';
                        html += '<span class="text-gray-500">Page ' + page + ' / ' + totalPages + '</span>';
                        html += '<button type="button" id="pgNext" class="px-3 py-1.5 rounded-md text-xs font-medium border border-black/10 bg-white text-gray-600 disabled:opacity-40"' + (page >= totalPages ? ' disabled' : '') + '>Next →</button>';
                        pagerEl.innerHTML = html;
                        var prev = document.getElementById('pgPrev');
                        var next = document.getElementById('pgNext');
                        if (prev) prev.onclick = function () { page--; render(); };
                        if (next) next.onclick = function () { page++; render(); };
                    }
                }

                tabs.forEach(function (t) {
                    t.onclick = function () {
                        setActive(t);
                        filter = t.getAttribute('data-filter');
                        page = 1;
                        render();
                    };
                });

                if (search) {
                    search.oninput = function () {
                        query = search.value.trim().toLowerCase();
                        page = 1;
                        render();
                    };
                }

                var m = location.hash.match(/^#cat-(.+)$/);
                if (m) {
                    filter = m[1];
                    var tab = tabs.filter(function (t) { return t.getAttribute('data-filter') === filter; })[0];
                    setActive(tab || null);
                } else if (location.hash === '#featured') {
                    filter = 'featured';
                    var ftab = tabs.filter(function (t) { return t.getAttribute('data-filter') === 'featured'; })[0];
                    setActive(ftab || null);
                } else {
                    var allTab = tabs.filter(function (t) { return t.getAttribute('data-filter') === 'all'; })[0];
                    setActive(allTab || null);
                }

                render();

                if (m) {
                    var target = document.getElementById('cat-' + m[1]);
                    if (target) target.scrollIntoView({ block: 'start' });
                }
            })();
        </script>
    </main>

    <footer><!-- footer placeholder --></footer>
</body>
</html>
`;

fs.writeFileSync(OUT, html);
console.log('generated -> ' + OUT + ' (' + Math.round(html.length / 1024) + ' KB, ' + data.plugins.length + ' cards)');
