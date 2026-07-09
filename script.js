/* ==========================================================================
   CIAWI TODAY — script.js
   Memuat data berita, render kartu, filter, dark mode, dan navigasi mobile.
   ========================================================================== */

// Data berita dimuat dari data.json. Kalau fetch gagal (mis. dibuka langsung
// via file:// tanpa server lokal), pakai salinan cadangan di FALLBACK_DATA.
let NEWS_DATA = [];

const FALLBACK_DATA_URL = "data.json";

async function loadNewsData() {
  try {
    const res = await fetch(FALLBACK_DATA_URL);
    if (!res.ok) throw new Error("gagal memuat data.json");
    NEWS_DATA = await res.json();
  } catch (err) {
    console.warn("Tidak bisa fetch data.json (mungkin dibuka via file://). Jalankan lewat local server, contoh: python3 -m http.server", err);
    NEWS_DATA = [];
  }
  onNewsDataReady();
}

function onNewsDataReady() {
  renderHero();
  renderSidebarTabs();
  renderGrids();
  renderArticleDetail();
  renderOpiniList();
}

/* ---------- Dark / Light mode ---------- */
function initTheme() {
  const saved = localStorage.getItem("ciawi-theme");
  if (saved === "light") document.body.classList.add("light");

  const toggle = document.querySelector("[data-theme-toggle]");
  if (!toggle) return;
  toggle.addEventListener("click", () => {
    document.body.classList.toggle("light");
    const isLight = document.body.classList.contains("light");
    localStorage.setItem("ciawi-theme", isLight ? "light" : "dark");
    toggle.textContent = isLight ? "☀️" : "🌙";
  });
  toggle.textContent = document.body.classList.contains("light") ? "☀️" : "🌙";
}

/* ---------- Mobile nav toggle ---------- */
function initNavToggle() {
  const btn = document.querySelector("[data-nav-toggle]");
  const links = document.querySelector(".nav-links");
  if (!btn || !links) return;
  btn.addEventListener("click", () => {
    links.style.display = links.style.display === "flex" ? "none" : "flex";
  });
}

/* ---------- Hero headline (index.html) ---------- */
function renderHero() {
  const el = document.querySelector("[data-hero]");
  if (!el) return;
  const headline = NEWS_DATA.find((n) => n.headline) || NEWS_DATA[0];
  if (!headline) return;

  el.querySelector(".hero-bg").style.backgroundImage = `url('${headline.image}')`;
  el.querySelector("[data-hero-cat]").textContent = headline.category;
  el.querySelector("[data-hero-date]").textContent = headline.date;
  el.querySelector("[data-hero-title]").innerHTML = highlightLastWords(headline.title);
  el.querySelector("[data-hero-desc]").textContent = headline.excerpt;
  el.querySelector("[data-hero-link]").href = `detail-berita.html?id=${headline.id}`;
}

// Kasih highlight warna aksen ke 2 kata terakhir judul, mirip desain referensi
function highlightLastWords(title) {
  const words = title.split(" ");
  if (words.length < 3) return title;
  const tail = words.splice(-2).join(" ");
  return `${words.join(" ")} <span class="highlight">${tail}</span>`;
}

/* ---------- Sidebar tabs: Terbaru / Populer / Trending ---------- */
function renderSidebarTabs() {
  const list = document.querySelector("[data-sidebar-list]");
  const tabs = document.querySelectorAll("[data-tab]");
  if (!list || tabs.length === 0) return;

  function getSet(mode) {
    if (mode === "trending") return NEWS_DATA.filter((n) => n.trending);
    if (mode === "populer") return [...NEWS_DATA].reverse();
    return NEWS_DATA; // terbaru = urutan asli
  }

  function draw(mode) {
    const items = getSet(mode).slice(0, 3);
    list.innerHTML = items
      .map(
        (n, i) => `
      <a href="detail-berita.html?id=${n.id}" class="news-list-item">
        <span class="idx">${String(i + 1).padStart(2, "0")}</span>
        <div>
          <h4>${n.title}</h4>
          <div class="meta">${n.date} • ${n.readTime}</div>
        </div>
      </a>`
      )
      .join("");
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      draw(tab.dataset.tab);
    });
  });

  draw("terbaru");
}

/* ---------- Grid berita (dipakai di banyak halaman) ---------- */
function renderGrids() {
  document.querySelectorAll("[data-news-grid]").forEach((grid) => {
    const category = grid.dataset.category || "";
    const limit = parseInt(grid.dataset.limit || "12", 10);
    let items = NEWS_DATA;
    if (category) items = items.filter((n) => n.category === category);
    items = items.slice(0, limit);
    grid.innerHTML = items.map(newsCardHTML).join("") || emptyStateHTML();
  });

  initFilterChips();
  initSearch();
}

function newsCardHTML(n) {
  return `
    <a href="detail-berita.html?id=${n.id}" class="news-card">
      <div class="thumb" style="background-image:url('${n.image}')"></div>
      <div class="body">
        <span class="cat">${n.category}</span>
        <h3>${n.title}</h3>
        <div class="meta">${n.date} • ${n.readTime}</div>
      </div>
    </a>`;
}

function emptyStateHTML() {
  return `<p style="color:var(--text-dim)">Belum ada berita untuk kategori ini.</p>`;
}

/* ---------- Filter chip kategori (berita.html) ---------- */
function initFilterChips() {
  const chips = document.querySelectorAll("[data-filter-chip]");
  const grid = document.querySelector("[data-news-grid]");
  if (chips.length === 0 || !grid) return;

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      chips.forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      const cat = chip.dataset.filterChip;
      const items = cat === "Semua" ? NEWS_DATA : NEWS_DATA.filter((n) => n.category === cat);
      grid.innerHTML = items.map(newsCardHTML).join("") || emptyStateHTML();
    });
  });
}

/* ---------- Search bar ---------- */
function initSearch() {
  const input = document.querySelector("[data-search-input]");
  const grid = document.querySelector("[data-news-grid]");
  if (!input || !grid) return;

  input.addEventListener("input", () => {
    const q = input.value.trim().toLowerCase();
    const items = NEWS_DATA.filter((n) => n.title.toLowerCase().includes(q));
    grid.innerHTML = items.map(newsCardHTML).join("") || emptyStateHTML();
  });
}

/* ---------- Detail artikel (detail-berita.html) ---------- */
function renderArticleDetail() {
  const wrap = document.querySelector("[data-article]");
  if (!wrap) return;

  const id = new URLSearchParams(window.location.search).get("id");
  const article = NEWS_DATA.find((n) => n.id === id) || NEWS_DATA[0];
  if (!article) return;

  document.title = `${article.title} — Ciawi Today`;
  wrap.querySelector("[data-a-cat]").textContent = article.category;
  wrap.querySelector("[data-a-title]").textContent = article.title;
  wrap.querySelector("[data-a-date]").textContent = article.date;
  wrap.querySelector("[data-a-read]").textContent = article.readTime;
  wrap.querySelector("[data-a-cover]").style.backgroundImage = `url('${article.image}')`;

  const body = wrap.querySelector("[data-a-body]");
  const paragraphs = [
    article.excerpt,
    `Pemerintah setempat menyatakan perkembangan ini menjadi bagian dari upaya berkelanjutan untuk meningkatkan kualitas hidup warga Ciawi dan sekitarnya. Berbagai pemangku kepentingan dilibatkan sejak tahap perencanaan hingga pelaksanaan di lapangan.`,
    `Warga diharapkan dapat memanfaatkan perkembangan ini secara optimal, sembari pemerintah terus memantau dampak sosial dan ekonomi yang muncul di lapangan dalam beberapa bulan ke depan.`,
  ];
  body.innerHTML = paragraphs.map((p) => `<p>${p}</p>`).join("");

  const tagRow = wrap.querySelector("[data-a-tags]");
  if (tagRow) {
    tagRow.innerHTML = [article.category, "Ciawi", "Tasikmalaya"]
      .map((t) => `<span class="tag">#${t.replace(/\s+/g, "")}</span>`)
      .join("");
  }
}

/* ---------- Opini list (opini.html) ---------- */
function renderOpiniList() {
  const wrap = document.querySelector("[data-opini-list]");
  if (!wrap) return;
  const items = NEWS_DATA.filter((n) => n.category === "Opini" || n.author);
  wrap.innerHTML = items
    .map(
      (n) => `
    <a href="detail-berita.html?id=${n.id}" class="opini-item">
      <div class="avatar"></div>
      <div>
        <h3>${n.title}</h3>
        <div class="author">${n.author || "Redaksi Ciawi Today"}</div>
        <p>${n.excerpt}</p>
      </div>
    </a>`
    )
    .join("");
}

/* ---------- Init ---------- */
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initNavToggle();
  loadNewsData();
});
