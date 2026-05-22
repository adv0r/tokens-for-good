/* tokens-for-good — dashboard.js
 *
 * Standalone, no build step. Reads data.json, themes the page,
 * renders Chart.js v4 charts and an a11y-friendly table fallback.
 */

(() => {
  'use strict';

  // ---- theme -------------------------------------------------------------

  const STORAGE_KEY = 'tfg-theme';

  /**
   * Read the active theme. Pre-paint inline script in <head> already set
   * data-theme; this is the canonical accessor for the rest of the app.
   * @returns {'dark'|'light'}
   */
  function getTheme() {
    return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  }

  /**
   * Persist + apply a theme. Re-tints existing Chart instances in-place
   * so the toggle never re-renders the page.
   * @param {'dark'|'light'} theme
   */
  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem(STORAGE_KEY, theme); } catch (_) { /* private mode */ }
    const btn = document.getElementById('theme-toggle');
    if (btn) btn.setAttribute('aria-pressed', theme === 'light' ? 'true' : 'false');
    retintCharts();
  }

  // ---- palette (resolved at render-time from CSS custom properties) ----

  function readVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  function palette() {
    return {
      text:    readVar('--text'),
      mut:     readVar('--text-mut'),
      dim:     readVar('--text-dim'),
      grid:    readVar('--grid'),
      bg:      readVar('--bg'),
      bgElev:  readVar('--bg-elev'),
      border:  readVar('--border'),
      accent:  readVar('--accent'),
      merged:  readVar('--merged'),
      closed:  readVar('--closed'),
      open:    readVar('--open'),
      optout:  readVar('--opt-out'),
      tooltip: readVar('--tooltip-bg'),
    };
  }

  // ---- formatters --------------------------------------------------------

  const fmtInt = new Intl.NumberFormat();
  const fmtNum = (n) => (n == null ? '—' : fmtInt.format(n));
  const fmtPct = (r) => (r == null ? 'n/a' : `${Math.round(r * 100)}%`);

  function fmtTimestamp(iso) {
    if (!iso) return 'unknown';
    try {
      const d = new Date(iso);
      const opts = { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', timeZone: 'UTC' };
      return new Intl.DateTimeFormat('en-GB', opts).format(d) + ' UTC';
    } catch (_) { return iso; }
  }

  // ---- chart registry (so the theme toggle can re-tint) ----------------

  /** @type {Map<string, {chart: any, retint: (p: any) => void}>} */
  const charts = new Map();

  function registerChart(id, chart, retint) {
    charts.set(id, { chart, retint });
  }

  function retintCharts() {
    const p = palette();
    if (window.Chart) {
      window.Chart.defaults.color = p.mut;
      window.Chart.defaults.borderColor = p.grid;
    }
    charts.forEach(({ chart, retint }) => {
      try { retint(chart, p); chart.update('none'); } catch (e) { console.warn(e); }
    });
  }

  // ---- count-up animation ----------------------------------------------

  /**
   * Tween a number from 0 to `target`, formatting per `formatter`.
   * Skipped if user prefers reduced motion.
   * @param {HTMLElement} el
   * @param {number} target
   * @param {(n: number) => string} formatter
   * @param {number} ms
   */
  function countUp(el, target, formatter, ms = 700) {
    if (!el) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || target === 0) { el.textContent = formatter(target); return; }
    const start = performance.now();
    function tick(now) {
      const t = Math.min(1, (now - start) / ms);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = formatter(Math.round(target * eased));
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  // ---- KPIs + ministats -------------------------------------------------

  function renderKpis(data) {
    const kpi = data.kpi || {};
    const decided = (kpi.helpful_count || 0) + (kpi.unhelpful_count || 0);
    const rate = kpi.helpful_signal_rate;
    const ratePct = rate == null ? 0 : Math.round(rate * 100);

    // Hero KPI: count up percentage
    const heroEl = document.querySelector('#hero-kpi .hero-num');
    countUp(heroEl, ratePct, (n) => String(n));
    document.getElementById('hero-decided-count').textContent = fmtNum(decided);

    // Mini-stats: count up
    const stats = [
      ['ms-total',  kpi.total_prs || 0],
      ['ms-merged', kpi.merged || 0],
      ['ms-closed', kpi.closed_unmerged || 0],
      ['ms-open',   kpi.still_open || 0],
    ];
    stats.forEach(([id, n]) => countUp(document.getElementById(id), n, fmtNum));
  }

  // ---- a11y table fallbacks --------------------------------------------

  function fillTable(tableId, rows) {
    const tbody = document.querySelector(`#${tableId} tbody`);
    if (!tbody) return;
    tbody.innerHTML = rows.map(
      (cells) => `<tr>${cells.map((c) => `<td>${c}</td>`).join('')}</tr>`
    ).join('');
  }

  // ---- visible clickable link list (primary a11y; visible to all users) -

  /**
   * Fill a <ul>/<ol> with rows of clickable links + optional meta text.
   * Each row is rendered with textContent (defense against funky data);
   * the href is built via encodeURI to keep slashes intact in owner/name.
   * @param {string} elId
   * @param {Array} rows
   * @param {(row: any) => {href: string, label: string, meta?: string}} mapFn
   */
  function fillLinkList(elId, rows, mapFn) {
    const el = document.getElementById(elId);
    if (!el) return;
    el.innerHTML = '';
    for (const row of rows) {
      const item = mapFn(row);
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = item.href;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.textContent = item.label;
      li.appendChild(a);
      if (item.meta) {
        const span = document.createElement('span');
        span.className = 'meta';
        span.textContent = ' · ' + item.meta;
        li.appendChild(span);
      }
      el.appendChild(li);
    }
  }

  function showEmptyList(elId, msg) {
    const el = document.getElementById(elId);
    if (!el) return;
    el.innerHTML = '';
    const li = document.createElement('li');
    li.className = 'empty';
    li.textContent = msg;
    el.appendChild(li);
  }

  // ---- shared chart options --------------------------------------------

  function commonChartOpts(p) {
    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? false : { duration: 380, easing: 'easeOutQuart' },
      plugins: {
        legend: {
          display: true,
          labels: {
            color: p.mut,
            usePointStyle: true,
            pointStyle: 'circle',
            padding: 14,
            font: { size: 12, family: 'Inter, system-ui, sans-serif' },
          },
        },
        tooltip: {
          backgroundColor: p.tooltip,
          titleColor: '#fff',
          bodyColor: '#fff',
          borderColor: p.border,
          borderWidth: 1,
          padding: 10,
          cornerRadius: 6,
          displayColors: true,
          boxPadding: 4,
        },
      },
    };
  }

  // ---- chart: PR state donut -------------------------------------------

  function chartState(data) {
    const ctx = document.getElementById('chart-state');
    if (!ctx) return;
    const kpi = data.kpi || {};
    const open = kpi.still_open || 0;
    const merged = kpi.merged || 0;
    const closed = kpi.closed_unmerged || 0;
    const total = open + merged + closed;

    document.querySelector('#chart-state-center .donut-center-value').textContent = fmtNum(total);
    fillTable('chart-state-table', [
      ['Open', fmtNum(open)],
      ['Merged', fmtNum(merged)],
      ['Closed unmerged', fmtNum(closed)],
    ]);

    if (total === 0) { showEmpty(ctx, 'No PRs yet.'); return; }

    const p = palette();
    const chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Open', 'Merged', 'Closed'],
        datasets: [{
          data: [open, merged, closed],
          backgroundColor: [p.open, p.merged, p.closed],
          borderColor: p.bgElev,
          borderWidth: 2,
          hoverOffset: 6,
        }],
      },
      options: {
        ...commonChartOpts(p),
        cutout: '68%',
        plugins: {
          ...commonChartOpts(p).plugins,
          tooltip: {
            ...commonChartOpts(p).plugins.tooltip,
            callbacks: {
              label: (ctx) => ` ${ctx.label}  ${fmtNum(ctx.parsed)}`,
            },
          },
        },
      },
    });

    registerChart('state', chart, (c, np) => {
      c.data.datasets[0].backgroundColor = [np.open, np.merged, np.closed];
      c.data.datasets[0].borderColor = np.bgElev;
      c.options.plugins.legend.labels.color = np.mut;
      c.options.plugins.tooltip.backgroundColor = np.tooltip;
    });
  }

  // ---- chart: by org (horizontal bar, color by helpful rate) ----------

  function helpfulRateColor(rate, p) {
    // null = grey ("undecided"), 0 = closed-amber, 1 = merged-green; lerp between.
    if (rate == null) return p.dim;
    const r = Math.max(0, Math.min(1, rate));
    return mixHex(p.closed, p.merged, r);
  }

  function mixHex(a, b, t) {
    const pa = parseHex(a), pb = parseHex(b);
    const r = Math.round(pa[0] + (pb[0] - pa[0]) * t);
    const g = Math.round(pa[1] + (pb[1] - pa[1]) * t);
    const bl = Math.round(pa[2] + (pb[2] - pa[2]) * t);
    return `rgb(${r},${g},${bl})`;
  }
  function parseHex(s) {
    s = (s || '').trim();
    if (s.startsWith('#')) {
      const h = s.slice(1);
      const n = h.length === 3
        ? h.split('').map(c => parseInt(c + c, 16))
        : [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
      return n;
    }
    // rgb()
    const m = s.match(/rgb[a]?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
    if (m) return [Number(m[1]), Number(m[2]), Number(m[3])];
    return [128, 128, 128];
  }

  function chartOrg(data) {
    const ctx = document.getElementById('chart-org');
    if (!ctx) return;
    const baseRows = (data.by_org || []).slice(0, 10);
    const otherCount = data.by_org_other_count || 0;
    const otherOrgs = data.by_org_other_orgs || 0;
    const totalOrgs = data.by_org_total_orgs || baseRows.length;

    // Inject "X" into the card subtitle: "top 10 of X orgs · ...".
    document.querySelectorAll('[data-stat="by_org_total_orgs"]').forEach((el) => {
      el.textContent = fmtNum(totalOrgs);
    });

    fillTable(
      'chart-org-table',
      baseRows.map(r => [r.org, fmtNum(r.n), fmtPct(r.helpful_rate)])
        .concat(otherCount > 0
          ? [[`Other (${otherOrgs} orgs)`, fmtNum(otherCount), 'n/a']]
          : [])
    );
    fillLinkList('chart-org-list', baseRows, (r) => ({
      href: 'https://github.com/' + encodeURIComponent(r.org),
      label: r.org,
      meta: `${fmtNum(r.n)} PRs · ${fmtPct(r.helpful_rate)}`,
    }));
    if (otherCount > 0) {
      const list = document.getElementById('chart-org-list');
      if (list) {
        const li = document.createElement('li');
        li.className = 'link-list-other';
        const lbl = document.createElement('span');
        lbl.textContent = 'Other';
        li.appendChild(lbl);
        const meta = document.createElement('span');
        meta.className = 'meta';
        meta.textContent = ` · ${fmtNum(otherCount)} PRs · ${fmtNum(otherOrgs)} orgs`;
        li.appendChild(meta);
        list.appendChild(li);
      }
    }

    // Augment rows with an "Other" aggregate bar (non-clickable, muted color).
    const rows = baseRows.slice();
    if (otherCount > 0) {
      rows.push({
        org: `Other (${otherOrgs} orgs)`,
        n: otherCount,
        merged: 0, closed: 0, open: 0, decided: 0,
        helpful_rate: null,
        _other: true,
        _otherOrgs: otherOrgs,
      });
    }

    if (rows.length === 0) { showEmpty(ctx, 'No org breakdown yet.'); return; }

    const p = palette();
    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: rows.map(r => r.org),
        datasets: [{
          label: 'PRs',
          data: rows.map(r => r.n),
          backgroundColor: rows.map(r => r._other ? p.dim : helpfulRateColor(r.helpful_rate, p)),
          borderRadius: 4,
          borderSkipped: false,
          barPercentage: 0.85,
          categoryPercentage: 0.82,
        }],
      },
      options: {
        ...commonChartOpts(p),
        indexAxis: 'y',
        onClick: (evt, elements) => {
          if (!elements.length) return;
          const r = rows[elements[0].index];
          if (!r || r._other) return;
          window.open(
            'https://github.com/' + encodeURIComponent(r.org),
            '_blank',
            'noopener,noreferrer'
          );
        },
        onHover: (evt, elements) => {
          const t = evt && evt.native && evt.native.target;
          if (!t || !t.style) return;
          if (!elements.length) { t.style.cursor = 'default'; return; }
          const r = rows[elements[0].index];
          t.style.cursor = r && r._other ? 'default' : 'pointer';
        },
        plugins: {
          ...commonChartOpts(p).plugins,
          legend: { display: false },
          tooltip: {
            ...commonChartOpts(p).plugins.tooltip,
            callbacks: {
              label: (ctx) => {
                const r = rows[ctx.dataIndex];
                if (r._other) {
                  return [` ${fmtNum(r.n)} PRs across ${fmtNum(r._otherOrgs)} orgs`, ' (not shown individually)'];
                }
                const rate = fmtPct(r.helpful_rate);
                return [` PRs: ${fmtNum(r.n)}`, ` Helpful rate: ${rate}`, ` Merged: ${fmtNum(r.merged)} · Open: ${fmtNum(r.open)}`, ' (click to open on GitHub)'];
              },
            },
          },
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: { color: p.mut, precision: 0 },
            grid: { color: p.grid, drawBorder: false },
          },
          y: {
            ticks: { color: p.text, font: { size: 12 } },
            grid: { display: false, drawBorder: false },
          },
        },
      },
    });

    registerChart('org', chart, (c, np) => {
      c.data.datasets[0].backgroundColor = rows.map(r => r._other ? np.dim : helpfulRateColor(r.helpful_rate, np));
      c.options.scales.x.ticks.color = np.mut;
      c.options.scales.x.grid.color = np.grid;
      c.options.scales.y.ticks.color = np.text;
      c.options.plugins.tooltip.backgroundColor = np.tooltip;
    });
  }

  // ---- chart: cumulative timeline --------------------------------------

  function chartTime(data) {
    const ctx = document.getElementById('chart-time');
    if (!ctx) return;
    const rows = data.pr_timeline || [];
    if (rows.length === 0) { showEmpty(ctx, 'No timeline data yet.'); return; }

    let cumO = 0, cumM = 0;
    const labels = [], openedC = [], mergedC = [];
    rows.forEach(r => {
      cumO += r.opened || 0;
      cumM += r.merged || 0;
      labels.push(r.day);
      openedC.push(cumO);
      mergedC.push(cumM);
    });

    fillTable('chart-time-table', labels.map((d, i) => [d, fmtNum(openedC[i]), fmtNum(mergedC[i])]));

    const p = palette();
    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Opened',
            data: openedC,
            borderColor: p.accent,
            backgroundColor: hexA(p.accent, 0.18),
            fill: true,
            tension: 0.28,
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 5,
          },
          {
            label: 'Merged',
            data: mergedC,
            borderColor: p.merged,
            backgroundColor: 'transparent',
            fill: false,
            tension: 0.28,
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 5,
            borderDash: [0],
          },
        ],
      },
      options: {
        ...commonChartOpts(p),
        interaction: { mode: 'index', intersect: false },
        scales: {
          x: {
            ticks: { color: p.mut, maxRotation: 0, autoSkipPadding: 12 },
            grid: { display: false, drawBorder: false },
          },
          y: {
            beginAtZero: true,
            ticks: { color: p.mut, precision: 0 },
            grid: { color: p.grid, drawBorder: false },
          },
        },
      },
    });

    registerChart('time', chart, (c, np) => {
      c.data.datasets[0].borderColor = np.accent;
      c.data.datasets[0].backgroundColor = hexA(np.accent, 0.18);
      c.data.datasets[1].borderColor = np.merged;
      c.options.scales.x.ticks.color = np.mut;
      c.options.scales.y.ticks.color = np.mut;
      c.options.scales.y.grid.color = np.grid;
      c.options.plugins.legend.labels.color = np.mut;
      c.options.plugins.tooltip.backgroundColor = np.tooltip;
    });
  }

  function hexA(color, alpha) {
    const [r, g, b] = parseHex(color);
    return `rgba(${r},${g},${b},${alpha})`;
  }

  // ---- generic donut (by_type, by_model) --------------------------------

  function donutCard(canvasId, tableId, items, emptyMsg, paletteFn) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    fillTable(tableId, items.map(i => [i.label, fmtNum(i.value)]));
    if (items.length === 0 || items.every(i => i.value === 0)) {
      showEmpty(ctx, emptyMsg);
      return;
    }
    const p = palette();
    const colors = paletteFn(items, p);
    const chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: items.map(i => i.label),
        datasets: [{
          data: items.map(i => i.value),
          backgroundColor: colors,
          borderColor: p.bgElev,
          borderWidth: 2,
          hoverOffset: 6,
        }],
      },
      options: {
        ...commonChartOpts(p),
        cutout: '62%',
        plugins: {
          ...commonChartOpts(p).plugins,
          tooltip: {
            ...commonChartOpts(p).plugins.tooltip,
            callbacks: {
              label: (ctx) => ` ${ctx.label}  ${fmtNum(ctx.parsed)}`,
            },
          },
        },
      },
    });
    registerChart(canvasId, chart, (c, np) => {
      c.data.datasets[0].backgroundColor = paletteFn(items, np);
      c.data.datasets[0].borderColor = np.bgElev;
      c.options.plugins.legend.labels.color = np.mut;
      c.options.plugins.tooltip.backgroundColor = np.tooltip;
    });
  }

  function chartType(data) {
    const rows = (data.by_type || []).map(r => ({
      label: r.contribution_type || 'unknown',
      value: (r.merged || 0) + (r.closed || 0) + (r.open || 0) + (r.draft || 0),
    })).filter(i => i.value > 0);
    donutCard('chart-type', 'chart-type-table', rows,
      'No type breakdown yet — types fill in as we tag PRs.',
      (items, p) => spectrum(items.length, [p.merged, p.accent, p.closed, p.optout, p.open, p.mut])
    );
  }

  function chartModel(data) {
    const rows = (data.by_model || []).map(r => ({ label: r.model, value: r.n || 0 }));
    donutCard('chart-model', 'chart-model-table', rows,
      'Model attribution lands as we tag each PR with the model that drafted it.',
      (items, p) => spectrum(items.length, [p.accent, p.merged, p.optout, p.closed, p.open])
    );
  }

  function spectrum(n, base) {
    if (n <= base.length) return base.slice(0, n);
    const out = [];
    for (let i = 0; i < n; i++) out.push(base[i % base.length]);
    return out;
  }

  // ---- opt-outs card ----------------------------------------------------

  function renderOptouts(data) {
    const oo = data.opt_outs || { count: 0 };
    const numEl = document.getElementById('optout-num');
    const noteEl = document.getElementById('optout-note');
    countUp(numEl, oo.count || 0, fmtNum);
    noteEl.innerHTML = '';
    if ((oo.count || 0) === 0) {
      noteEl.appendChild(document.createTextNode('None yet — the opt-out path exists if needed.'));
      return;
    }
    noteEl.appendChild(document.createTextNode('Maintainers who asked us to stop; we did, immediately.'));
    const repo = oo.most_recent && oo.most_recent.repo;
    if (repo) {
      noteEl.appendChild(document.createTextNode(' Most recent: '));
      const a = document.createElement('a');
      a.href = 'https://github.com/' + encodeURI(repo);
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.textContent = repo;
      noteEl.appendChild(a);
      noteEl.appendChild(document.createTextNode('.'));
    }
  }

  // ---- top-friendly repos card (link list; empty state until populated) -

  function renderTopFriendly(data) {
    const rows = (data.top_friendly || []).slice(0, 10);
    if (rows.length === 0) {
      showEmptyList(
        'chart-friendly-list',
        'Repo affinity emerges as the agent runs more rounds. Currently silent.'
      );
      return;
    }
    fillLinkList('chart-friendly-list', rows, (r) => ({
      href: 'https://github.com/' + encodeURI(r.repo),
      label: r.repo,
      meta: `${fmtNum(r.merged || 0)} merged · ${fmtPct(r.helpful_rate)}`,
    }));
  }

  // ---- empty state helper ----------------------------------------------

  function showEmpty(canvas, msg) {
    const shell = canvas.parentElement;
    canvas.remove();
    const div = document.createElement('div');
    div.className = 'empty-state';
    div.textContent = msg;
    shell.appendChild(div);
  }

  // ---- lazy render below-fold charts -----------------------------------

  function lazyRender(renderFns) {
    const root = document.querySelector('.cards');
    if (!root || !('IntersectionObserver' in window)) {
      renderFns.forEach(({ fn }) => fn());
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const id = e.target.dataset.lazyId;
        const item = renderFns.find(r => r.id === id);
        if (item && !item.done) { item.done = true; item.fn(); }
        observer.unobserve(e.target);
      });
    }, { rootMargin: '120px' });

    renderFns.forEach(({ id, selector }) => {
      const el = document.querySelector(selector);
      if (el) { el.dataset.lazyId = id; observer.observe(el); }
    });
  }

  // ---- theme toggle wiring ---------------------------------------------

  function wireThemeToggle() {
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;
    btn.setAttribute('aria-pressed', getTheme() === 'light' ? 'true' : 'false');
    btn.addEventListener('click', () => {
      setTheme(getTheme() === 'dark' ? 'light' : 'dark');
    });
    // System pref changes: only follow if user hasn't expressed a choice.
    const mql = window.matchMedia('(prefers-color-scheme: light)');
    mql.addEventListener?.('change', (e) => {
      try {
        if (localStorage.getItem(STORAGE_KEY)) return;
      } catch (_) {}
      setTheme(e.matches ? 'light' : 'dark');
    });
  }

  // ---- bootstrap -------------------------------------------------------

  async function main() {
    wireThemeToggle();

    // Wait for Chart.js (defer + UMD => available on DOMContentLoaded).
    if (!window.Chart) {
      await new Promise(r => {
        const t = setInterval(() => { if (window.Chart) { clearInterval(t); r(); } }, 30);
      });
    }
    Chart.defaults.font.family = 'Inter, system-ui, -apple-system, sans-serif';
    Chart.defaults.color = palette().mut;
    Chart.defaults.borderColor = palette().grid;

    let data;
    try {
      const resp = await fetch('./data.json', { cache: 'no-store' });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      data = await resp.json();
    } catch (err) {
      document.getElementById('last-updated').textContent = 'failed to load';
      console.error('Failed to load data.json:', err);
      return;
    }

    // Header: last-updated + commit SHA
    const lu = document.getElementById('last-updated');
    lu.textContent = fmtTimestamp(data.generated_at);
    if (data.generated_at) lu.setAttribute('datetime', data.generated_at);
    const sha = document.getElementById('footer-sha');
    if (sha) sha.textContent = data.commit_sha || 'dev';

    // Above the fold
    renderKpis(data);
    chartState(data);
    chartOrg(data);

    // Below the fold: lazy-render as user scrolls
    lazyRender([
      { id: 'time',     selector: '.card-time',     fn: () => chartTime(data) },
      { id: 'type',     selector: '.card-type',     fn: () => chartType(data) },
      { id: 'model',    selector: '.card-model',    fn: () => chartModel(data) },
      { id: 'friendly', selector: '.card-friendly', fn: () => renderTopFriendly(data) },
      { id: 'oo',       selector: '.card-optout',   fn: () => renderOptouts(data) },
    ]);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
  } else {
    main();
  }
})();
