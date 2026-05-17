(function () {
  "use strict";

  const article = document.getElementById("article");
  const crumb = document.getElementById("crumb");
  const nav = document.getElementById("nav");
  const sidebar = document.querySelector(".sidebar");
  const menuBtn = document.getElementById("menuBtn");
  const search = document.getElementById("q");

  const meta = JSON.parse(document.getElementById("docs-meta").textContent || "{}");

  // 홈 화면 복원용
  const homeHtml = article.innerHTML;

  // 홈에서 한 번만 그릴 "최근 코멘트가 달린 문서" 호스트 노드 준비
  function renderHomeActivityHost() {
    const host = document.createElement("div");
    host.id = "home-activity";
    article.querySelector(".welcome")?.appendChild(host);
    if (window.COMMENTS) window.COMMENTS.renderHomeActivity(host, meta);
  }

  function escapeHtml(s) {
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function getDocHtml(slug) {
    const el = document.getElementById("doc-" + slug);
    if (!el) return null;
    // <template> 이면 .content, 그 외엔 innerHTML
    if (el.content) {
      const wrap = document.createElement("div");
      wrap.appendChild(el.content.cloneNode(true));
      return wrap.innerHTML;
    }
    return el.innerHTML;
  }

  function setActiveNav(slug) {
    nav.querySelectorAll("a").forEach((a) => a.classList.remove("active"));
    if (!slug) return;
    const a = nav.querySelector(`a[data-slug="${slug}"]`);
    if (a) {
      a.classList.add("active");
      a.scrollIntoView({ block: "nearest" });
    }
  }

  function setCrumb(slug) {
    if (!slug || !meta[slug]) {
      crumb.innerHTML = '<span class="cur">홈</span>';
      return;
    }
    const parts = meta[slug].breadcrumbs || [];
    crumb.innerHTML = parts
      .map((p, i) => {
        const cls = i === parts.length - 1 ? "cur" : "";
        return `<span class="${cls}">${escapeHtml(p)}</span>`;
      })
      .join('<span class="sep">›</span>');
  }

  function show(slug) {
    if (!slug) {
      article.innerHTML = homeHtml;
      setCrumb(null);
      setActiveNav(null);
      document.title = "웹툰 기획 2차 초안";
      renderHomeActivityHost();
      return;
    }
    if (!meta[slug]) return;
    const html = getDocHtml(slug);
    if (html == null) return;
    const titleText = (meta[slug].breadcrumbs || []).slice(-1)[0] || meta[slug].title;
    article.innerHTML = `<div class="md"><h1>${escapeHtml(titleText)}</h1>${html}</div><div id="comments-host"></div>`;
    setCrumb(slug);
    setActiveNav(slug);
    document.title = `${titleText} · 웹툰 기획 2차 초안`;
    sidebar.classList.remove("open");
    window.scrollTo({ top: 0, behavior: "instant" });
    if (window.COMMENTS) {
      const host = document.getElementById("comments-host");
      window.COMMENTS.mount(slug, host);
    }
  }

  function currentSlug() {
    const h = location.hash || "";
    const raw = h.startsWith("#") ? h.slice(1) : h;
    // 브라우저가 한글 등 비ASCII 문자를 percent-encode 한 경우 디코드
    try { return decodeURIComponent(raw); } catch (_) { return raw; }
  }
  window.addEventListener("hashchange", () => show(currentSlug()));
  if (currentSlug()) show(currentSlug());
  else renderHomeActivityHost();

  menuBtn?.addEventListener("click", () => sidebar.classList.toggle("open"));
  document.addEventListener("click", (e) => {
    if (window.innerWidth > 900) return;
    if (!sidebar.contains(e.target) && e.target !== menuBtn) sidebar.classList.remove("open");
  });

  // 검색 인덱스 (제목 + 본문 텍스트)
  const index = {};
  for (const slug of Object.keys(meta)) {
    const title = meta[slug].title || "";
    const el = document.getElementById("doc-" + slug);
    let body = "";
    if (el) {
      if (el.content) {
        const tmp = document.createElement("div");
        tmp.appendChild(el.content.cloneNode(true));
        body = tmp.textContent || "";
      } else {
        body = el.textContent || "";
      }
    }
    index[slug] = (title + "\n" + body).toLowerCase();
  }

  function applySearch(q) {
    q = (q || "").trim().toLowerCase();
    const links = nav.querySelectorAll("a[data-slug]");
    if (!q) {
      links.forEach((a) => (a.parentElement.style.display = ""));
      nav.querySelectorAll(".nav-group, .nav-section").forEach((g) => (g.style.display = ""));
      return;
    }
    const visible = new Set();
    for (const slug of Object.keys(index)) if (index[slug].includes(q)) visible.add(slug);
    links.forEach((a) => {
      a.parentElement.style.display = visible.has(a.dataset.slug) ? "" : "none";
    });
    nav.querySelectorAll(".nav-group").forEach((g) => {
      const any = [...g.querySelectorAll("a[data-slug]")].some(
        (a) => a.parentElement.style.display !== "none"
      );
      g.style.display = any ? "" : "none";
    });
    nav.querySelectorAll(".nav-section").forEach((s) => {
      const any = [...s.querySelectorAll("a[data-slug]")].some(
        (a) => a.parentElement.style.display !== "none"
      );
      s.style.display = any ? "" : "none";
    });
  }

  let searchTimer;
  search?.addEventListener("input", (e) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => applySearch(e.target.value), 100);
  });
})();
