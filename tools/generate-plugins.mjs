// Oh! dsh tools — generate website/plugins.html from data/plugins.json
// Design language: shadcn-style directory (light, list layout, install commands, badges)
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

const GRADS = [
  'linear-gradient(135deg,#4d6bfe,#3a65c2)',
  'linear-gradient(135deg,#0ea5e9,#2563eb)',
  'linear-gradient(135deg,#8b5cf6,#6d28d9)',
  'linear-gradient(135deg,#f59e0b,#ea580c)',
  'linear-gradient(135deg,#10b981,#047857)',
  'linear-gradient(135deg,#ef4444,#b91c1c)',
  'linear-gradient(135deg,#14b8a6,#0f766e)',
  'linear-gradient(135deg,#6366f1,#4338ca)',
];

function avatar(p) {
  let h = 0;
  for (let i = 0; i < p.name.length; i++) h = (h * 31 + p.name.charCodeAt(i)) >>> 0;
  const grad = GRADS[h % GRADS.length];
  const seg = p.name.split(/[#/]/).pop();
  const letter = (seg.match(/[a-zA-Z0-9]/) || ['?'])[0].toUpperCase();
  return `<div class="flex-none w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-sm" style="background:${grad}">${esc(letter)}</div>`;
}

function card(p) {
  const isFeat = featuredSet.has(p.slug);
  const star = isFeat ? '<span class="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">★ Editor\u2019s pick</span>' : '';
  const cmd = 'dsh plugin add ' + p.name;
  const search = (p.name + ' ' + p.description + ' ' + (catName[p.category] || '')).toLowerCase();
  return `<div class="plugin-item flex items-start gap-4 rounded-xl border border-neutral-200 bg-white p-4 transition-all hover:border-neutral-300 hover:shadow-[0_4px_16px_-6px_rgba(0,0,0,0.08)]" data-cat="${esc(p.category)}" data-featured="${isFeat ? '1' : '0'}" data-search="${esc(search)}">
    ${avatar(p)}
    <div class="flex-1 min-w-0">
      <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
        <a href="${esc(p.url)}" target="_blank" rel="noopener noreferrer" class="font-semibold text-sm text-neutral-900 hover:text-[#4d6bfe] transition-colors truncate">${esc(p.name)}</a>
        ${star}
      </div>
      <p class="mt-1 text-sm text-neutral-500 leading-relaxed line-clamp-2">${esc(p.description)}</p>
      <div class="mt-2.5 flex flex-wrap items-center gap-2">
        <code class="inline-flex items-center rounded-md bg-neutral-100 border border-neutral-200 px-2 py-1 text-[11px] font-mono text-neutral-600 select-all">${esc(cmd)}</code>
        <button type="button" class="copy-btn inline-flex items-center rounded-md border border-neutral-200 bg-white px-2 py-1 text-[11px] font-medium text-neutral-500 hover:border-neutral-400 hover:text-neutral-800 transition-colors" data-cmd="${esc(cmd)}">Copy</button>
      </div>
    </div>
    <div class="hidden sm:flex flex-col items-end gap-2 flex-none">
      <span class="inline-flex items-center rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-0.5 text-[11px] font-medium text-neutral-500">${esc(catName[p.category])}</span>
      <a href="${esc(p.url)}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-400 hover:text-[#4d6bfe] transition-colors">GitHub <span aria-hidden="true">↗</span></a>
    </div>
  </div>`;
}

const tabs = ['featured', 'all', ...data.categories.map((c) => c.slug)]
  .map((s) => {
    const label = s === 'featured' ? '★ Featured' : s === 'all' ? 'All' : catName[s];
    return `<button type="button" class="filter-tab rounded-full border border-neutral-200 bg-white px-3.5 py-1.5 text-xs font-medium text-neutral-600 hover:border-neutral-400 transition-colors" data-filter="${esc(s)}">${esc(label)}</button>`;
  })
  .join('\n');

const sectionsHtml = data.categories
  .map((c) => {
    const items = byCat.get(c.slug).map(card).join('\n');
    return `<section id="cat-${c.slug}" class="plugin-section scroll-mt-36">
      <div class="flex items-baseline justify-between">
        <h2 class="text-lg font-bold tracking-tight text-neutral-900">${esc(c.name)}</h2>
        <span class="text-xs text-neutral-400">${byCat.get(c.slug).length} plugins</span>
      </div>
      <div class="mt-3 space-y-2.5">${items}</div>
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
    'Independent directory of DeepSeek Harness community plugins: search by capability, copy install commands, and jump straight to public source repositories.',
  mainEntity: { '@type': 'ItemList', numberOfItems: data.plugins.length },
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
        <!--seo:{"title":"DSH Plugins — ${data.plugins.length}+ DeepSeek Harness Plugins Directory | Oh! dsh","description":"Browse ${data.plugins.length}+ reviewed DeepSeek Harness (DSH) community plugins. Search by capability, copy install commands, and jump straight to each plugin's public source.","keywords":"DSH plugins, DeepSeek Harness plugins, DSH plugin list, DeepSeek Harness plugin directory","canonical":"https://ohdsh.com/plugins","og_title":"DSH Plugins — ${data.plugins.length}+ DeepSeek Harness Plugins Directory","og_description":"Search ${data.plugins.length}+ reviewed DeepSeek Harness community plugins, copy install commands, and jump straight to public source.","og_url":"https://ohdsh.com/plugins","og_site_name":"Oh! dsh"}-->
        <script type="application/ld+json">${JSON.stringify(collectionPage)}</script>
        <script type="application/ld+json">${JSON.stringify(itemList)}</script>
        <script type="application/ld+json">${JSON.stringify(breadcrumb)}</script>

        <!-- Hero -->
        <section class="pt-32 pb-14 px-6 text-center">
            <span class="section-badge"><span class="dot"></span>Independent directory for the DSH ecosystem</span>
            <h1 class="mt-6 text-4xl md:text-6xl font-bold tracking-tight leading-[1.1]">Find the right DSH plugin<br class="hidden md:block"> for your next workflow</h1>
            <p class="mt-5 text-base md:text-lg text-neutral-500 max-w-2xl mx-auto">Reviewed DeepSeek Harness extensions — search by capability, compare what they add, and jump straight to each plugin\u2019s public source.</p>
            <div class="mt-8 flex flex-wrap justify-center gap-3">
                <a href="#directory" class="btn-primary !bg-neutral-900 hover:!bg-neutral-700">Explore DSH Plugins</a>
                <a href="https://github.com/awesome-dsh-plugin/awesome-dsh-plugin" target="_blank" rel="noopener noreferrer" class="btn-secondary">Submit a plugin</a>
            </div>
            <div class="mt-8 flex flex-wrap justify-center gap-2 text-xs">
                <span class="px-3 py-1 rounded-full border border-neutral-200 bg-white text-neutral-600 font-medium">${data.plugins.length} launch plugins</span>
                <span class="px-3 py-1 rounded-full border border-neutral-200 bg-white text-neutral-600 font-medium">${data.categories.length} categories</span>
                <span class="px-3 py-1 rounded-full border border-neutral-200 bg-white text-neutral-600 font-medium">${featured.length} editor\u2019s picks</span>
                <span class="px-3 py-1 rounded-full border border-neutral-200 bg-white text-neutral-600 font-medium">Updated ${data.generated_at}</span>
            </div>
        </section>

        <!-- Toolbar -->
        <section class="sticky top-16 z-30 bg-[#f9f8f8]/90 backdrop-blur border-y border-neutral-200 py-4 px-6">
            <div class="max-w-6xl mx-auto">
                <div class="flex flex-col md:flex-row md:items-center gap-3">
                    <div class="relative w-full md:w-80">
                        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm" aria-hidden="true">⌕</span>
                        <input id="pluginSearch" type="search" placeholder="Search plugins\u2026" class="w-full rounded-lg border border-neutral-200 bg-white pl-9 pr-3 py-2 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#4d6bfe]/30 focus:border-[#4d6bfe]">
                    </div>
                    <div class="flex flex-wrap gap-2" id="filterTabs">${tabs}</div>
                </div>
                <div class="mt-3 flex items-center justify-between gap-3">
                    <span id="resultCount" class="text-xs text-neutral-500">${data.plugins.length} plugins</span>
                    <div id="pager" class="flex items-center gap-2"></div>
                </div>
            </div>
        </section>

        <!-- Directory -->
        <section id="directory" class="py-12 px-6 scroll-mt-36">
            <div class="max-w-6xl mx-auto space-y-14">${sectionsHtml}</div>
        </section>

        <!-- How it works -->
        <section class="py-14 px-6 border-t border-neutral-200">
            <div class="max-w-3xl mx-auto text-center">
                <h2 class="text-xl font-bold tracking-tight text-neutral-900">How it works</h2>
                <div class="mt-8 grid md:grid-cols-3 gap-4 text-left">
                    <div class="card">
                        <h3 class="text-sm font-semibold text-neutral-900">1. Search the directory</h3>
                        <p class="mt-1.5 text-xs text-neutral-500 leading-relaxed">Filter by category or keyword — every listing is a public GitHub project.</p>
                    </div>
                    <div class="card">
                        <h3 class="text-sm font-semibold text-neutral-900">2. Copy the install command</h3>
                        <p class="mt-1.5 text-xs text-neutral-500 leading-relaxed">Commands follow the upstream list; check each repo\u2019s README for exact package names.</p>
                    </div>
                    <div class="card">
                        <h3 class="text-sm font-semibold text-neutral-900">3. Review before installing</h3>
                        <p class="mt-1.5 text-xs text-neutral-500 leading-relaxed">Plugins run third-party code with your permissions — read the source first.</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Attribution / disclaimer -->
        <section class="py-10 px-6 border-t border-neutral-200">
            <div class="max-w-3xl mx-auto text-xs text-neutral-400 leading-relaxed">
                <p>This directory is a snapshot of the community-maintained
                <a href="https://github.com/awesome-dsh-plugin/awesome-dsh-plugin" class="text-[#4d6bfe] hover:underline underline-offset-4">awesome-dsh-plugin</a>
                list (updated ${data.generated_at}). Listings link to the authors\u2019 repositories; inclusion is not an endorsement or a security review. Missing a plugin? Contribute to the upstream list.</p>
            </div>
        </section>

        <script>
            (function () {
                var items = [].slice.call(document.querySelectorAll('.plugin-item'));
                var sections = [].slice.call(document.querySelectorAll('.plugin-section'));
                var tabs = [].slice.call(document.querySelectorAll('.filter-tab'));
                var search = document.getElementById('pluginSearch');
                var pagerEl = document.getElementById('pager');
                var countEl = document.getElementById('resultCount');
                var filter = 'all', query = '', page = 1, per = 30;

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
                        t.style.background = '#171717';
                        t.style.color = '#ffffff';
                        t.style.borderColor = '#171717';
                    }
                }

                function render() {
                    var list = items.filter(match);
                    var totalPages = Math.max(1, Math.ceil(list.length / per));
                    if (page > totalPages) page = totalPages;
                    var start = (page - 1) * per;
                    items.forEach(function (c) { c.style.display = 'none'; });
                    list.slice(start, start + per).forEach(function (c) { c.style.display = ''; });
                    sections.forEach(function (s) {
                        var any = [].slice.call(s.querySelectorAll('.plugin-item')).some(function (c) { return c.style.display !== 'none'; });
                        s.style.display = any ? '' : 'none';
                    });
                    if (countEl) countEl.textContent = 'Showing ' + (list.length ? start + 1 : 0) + '\u2013' + Math.min(start + per, list.length) + ' of ' + list.length + ' plugins';
                    if (pagerEl) {
                        var html = '';
                        html += '<button type="button" id="pgPrev" class="rounded-lg bg-[#171717] text-white px-3 py-1.5 text-xs font-medium disabled:opacity-30"' + (page <= 1 ? ' disabled' : '') + '>\u2190 Prev</button>';
                        html += '<span class="text-xs text-neutral-500">Page ' + page + ' / ' + totalPages + '</span>';
                        html += '<button type="button" id="pgNext" class="rounded-lg bg-[#171717] text-white px-3 py-1.5 text-xs font-medium disabled:opacity-30"' + (page >= totalPages ? ' disabled' : '') + '>Next \u2192</button>';
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

                // Copy install command
                document.addEventListener('click', function (e) {
                    var btn = e.target && e.target.closest ? e.target.closest('.copy-btn') : null;
                    if (!btn) return;
                    var cmd = btn.getAttribute('data-cmd');
                    var done = function () {
                        var old = btn.textContent;
                        btn.textContent = 'Copied \u2713';
                        setTimeout(function () { btn.textContent = old; }, 1500);
                    };
                    if (navigator.clipboard && navigator.clipboard.writeText) {
                        navigator.clipboard.writeText(cmd).then(done, function () {});
                    } else {
                        var ta = document.createElement('textarea');
                        ta.value = cmd;
                        document.body.appendChild(ta);
                        ta.select();
                        try { document.execCommand('copy'); done(); } catch (err) {}
                        document.body.removeChild(ta);
                    }
                });

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
console.log('generated -> ' + OUT + ' (' + Math.round(html.length / 1024) + ' KB, ' + data.plugins.length + ' items, ' + featured.length + ' featured)');
