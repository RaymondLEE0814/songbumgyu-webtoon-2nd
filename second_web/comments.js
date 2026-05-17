// 코멘트 시스템
// - 게이트(공유 비밀번호) → localStorage 에 unlock 플래그
// - 닉네임 → localStorage 에 저장 (처음 작성 시 1회 입력)
// - 코멘트 CRUD: Supabase REST (anon) 사용. RLS 가 작성 길이 검증.
// - 메인 페이지 "최근 코멘트가 달린 문서" 섹션 자동 렌더.

(function () {
  "use strict";
  const cfg = window.SITE_CONFIG || {};
  if (!cfg.SUPABASE_URL || !cfg.SUPABASE_ANON_KEY) {
    console.warn("[comments] SITE_CONFIG 없음. 코멘트 비활성.");
    window.COMMENTS = { mount: () => {}, renderHomeActivity: () => {} };
    return;
  }

  const LS_GATE = "swp:gate:v1";
  const LS_NICK = "swp:nick:v1";

  // ---------- Supabase REST helpers ----------
  const SB = {
    url: cfg.SUPABASE_URL.replace(/\/+$/, ""),
    key: cfg.SUPABASE_ANON_KEY,
    headers(extra = {}) {
      return {
        apikey: this.key,
        Authorization: `Bearer ${this.key}`,
        "Content-Type": "application/json",
        ...extra,
      };
    },
    async select(path) {
      const r = await fetch(`${this.url}/rest/v1/${path}`, { headers: this.headers() });
      if (!r.ok) throw new Error(`select ${path}: ${r.status} ${await r.text()}`);
      return r.json();
    },
    async insert(table, row) {
      const r = await fetch(`${this.url}/rest/v1/${table}`, {
        method: "POST",
        headers: this.headers({ Prefer: "return=representation" }),
        body: JSON.stringify(row),
      });
      if (!r.ok) throw new Error(`insert ${table}: ${r.status} ${await r.text()}`);
      return r.json();
    },
  };

  // ---------- Gate ----------
  // 한글은 NFC/NFD 정규화로 같은 글자가 다르게 비교될 수 있어 둘 다 NFC 로 맞춰서 비교.
  function passwordMatches(input) {
    const a = (input || "").trim().normalize("NFC");
    const b = (cfg.GATE_PASSWORD || "").trim().normalize("NFC");
    return a === b;
  }

  function isUnlocked() {
    return localStorage.getItem(LS_GATE) === "1";
  }

  function unlock() {
    localStorage.setItem(LS_GATE, "1");
  }

  async function openGateModal() {
    return new Promise((resolve) => {
      const back = document.createElement("div");
      back.className = "modal-backdrop";
      back.innerHTML = `
        <div class="modal" role="dialog" aria-labelledby="gate-title">
          <h3 id="gate-title">코멘트 작성 비밀번호</h3>
          <p class="muted">기획팀 공유 비밀번호를 입력하면 코멘트 작성이 풀립니다. 한 번만 입력하면 이 브라우저에서는 다시 묻지 않습니다.</p>
          <input type="password" class="gate-input" placeholder="비밀번호" autocomplete="current-password">
          <div class="gate-err" hidden>비밀번호가 다릅니다.</div>
          <div class="modal-actions">
            <button type="button" class="btn-ghost gate-cancel">취소</button>
            <button type="button" class="btn-primary gate-ok">확인</button>
          </div>
        </div>`;
      document.body.appendChild(back);
      const input = back.querySelector(".gate-input");
      const err = back.querySelector(".gate-err");
      input.focus();
      const close = (v) => { back.remove(); resolve(v); };
      back.querySelector(".gate-cancel").onclick = () => close(false);
      back.addEventListener("click", (e) => { if (e.target === back) close(false); });
      const submit = () => {
        err.hidden = true;
        const v = input.value;
        if (!v.trim()) return;
        if (passwordMatches(v)) {
          unlock();
          close(true);
        } else {
          err.hidden = false;
          input.select();
        }
      };
      back.querySelector(".gate-ok").onclick = submit;
      input.addEventListener("keydown", (e) => { if (e.key === "Enter") submit(); });
      document.addEventListener("keydown", function esc(e) {
        if (e.key === "Escape") { close(false); document.removeEventListener("keydown", esc); }
      });
    });
  }

  async function ensureUnlocked() {
    if (isUnlocked()) return true;
    return await openGateModal();
  }

  // ---------- Nickname ----------
  function getNick() { return localStorage.getItem(LS_NICK) || ""; }
  function setNick(n) { localStorage.setItem(LS_NICK, n); }

  async function promptNick() {
    return new Promise((resolve) => {
      const back = document.createElement("div");
      back.className = "modal-backdrop";
      back.innerHTML = `
        <div class="modal" role="dialog" aria-labelledby="nick-title">
          <h3 id="nick-title">닉네임 설정</h3>
          <p class="muted">코멘트에 표시될 이름입니다. 한 번만 정하면 됩니다. (40자 이내)</p>
          <input type="text" class="nick-input" placeholder="예: 송범규" maxlength="40">
          <div class="modal-actions">
            <button type="button" class="btn-ghost nick-cancel">취소</button>
            <button type="button" class="btn-primary nick-ok">저장</button>
          </div>
        </div>`;
      document.body.appendChild(back);
      const input = back.querySelector(".nick-input");
      input.focus();
      const close = (v) => { back.remove(); resolve(v); };
      back.querySelector(".nick-cancel").onclick = () => close(null);
      back.addEventListener("click", (e) => { if (e.target === back) close(null); });
      const submit = () => {
        const v = input.value.trim().slice(0, 40);
        if (!v) return;
        setNick(v);
        close(v);
      };
      back.querySelector(".nick-ok").onclick = submit;
      input.addEventListener("keydown", (e) => { if (e.key === "Enter") submit(); });
      document.addEventListener("keydown", function esc(e) {
        if (e.key === "Escape") { close(null); document.removeEventListener("keydown", esc); }
      });
    });
  }

  // ---------- Data ----------
  async function listComments(slug) {
    const q = `comments?slug=eq.${encodeURIComponent(slug)}&order=created_at.asc&select=id,slug,author_name,body,created_at`;
    return await SB.select(q);
  }

  async function postComment(slug, author, body) {
    return await SB.insert("comments", { slug, author_name: author, body });
  }

  async function fetchActivity(limit = 20) {
    return await SB.select(
      `comment_activity?order=last_comment_at.desc&limit=${limit}&select=slug,comment_count,last_comment_at,last_author,last_body_preview`
    );
  }

  // ---------- Time formatting ----------
  function fmtTime(iso) {
    const d = new Date(iso);
    const now = new Date();
    const diff = (now - d) / 1000;
    if (diff < 60) return "방금 전";
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
    if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}일 전`;
    return d.toLocaleString("ko-KR", { dateStyle: "medium", timeStyle: "short" });
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));
  }

  // ---------- Comment widget mount ----------
  function renderCommentsHtml(items, slug, nick) {
    const list = items.length
      ? items.map((c) => `
        <li class="comment">
          <div class="comment-head">
            <span class="comment-author">${escapeHtml(c.author_name)}</span>
            <span class="comment-time">${escapeHtml(fmtTime(c.created_at))}</span>
          </div>
          <div class="comment-body">${escapeHtml(c.body).replace(/\n/g, "<br>")}</div>
        </li>`).join("")
      : '<li class="comment-empty">아직 코멘트가 없습니다. 첫 코멘트를 남겨보세요.</li>';
    return `
      <section class="comments" data-slug="${escapeHtml(slug)}">
        <h2 class="comments-heading">코멘트 <span class="comments-count">${items.length}</span></h2>
        <ul class="comment-list">${list}</ul>
        <form class="comment-form">
          <div class="comment-form-meta">
            <span>작성자: <strong class="comment-nick">${escapeHtml(nick || "닉네임 미설정")}</strong></span>
            <button type="button" class="link-btn nick-change">${nick ? "변경" : "닉네임 설정"}</button>
          </div>
          <textarea class="comment-input" placeholder="코멘트를 입력하세요 (2000자 이내)" maxlength="2000" rows="3"></textarea>
          <div class="comment-form-actions">
            <span class="comment-status muted"></span>
            <button type="submit" class="btn-primary">작성</button>
          </div>
        </form>
      </section>`;
  }

  async function mount(slug, container) {
    if (!container || !slug) return;
    let items = [];
    try { items = await listComments(slug); } catch (e) { console.warn("[comments] list failed", e); }
    container.innerHTML = renderCommentsHtml(items, slug, getNick());

    const form = container.querySelector(".comment-form");
    const input = container.querySelector(".comment-input");
    const status = container.querySelector(".comment-status");
    const nickEl = container.querySelector(".comment-nick");
    const nickBtn = container.querySelector(".nick-change");

    nickBtn.onclick = async () => {
      const n = await promptNick();
      if (n) nickEl.textContent = n;
    };

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const body = input.value.trim();
      if (!body) return;
      const ok = await ensureUnlocked();
      if (!ok) { status.textContent = "비밀번호 필요"; return; }
      let nick = getNick();
      if (!nick) {
        nick = await promptNick();
        if (!nick) { status.textContent = "닉네임 필요"; return; }
        nickEl.textContent = nick;
      }
      status.textContent = "작성 중…";
      try {
        await postComment(slug, nick, body);
        input.value = "";
        const fresh = await listComments(slug);
        container.innerHTML = renderCommentsHtml(fresh, slug, getNick());
        wireForm(); // re-bind after innerHTML refresh
      } catch (err) {
        console.error(err);
        status.textContent = "작성 실패: " + (err.message || err);
      }
    });

    function wireForm() {
      // 새로 그린 폼에 핸들러 재바인딩
      mount(slug, container);
    }
  }

  // ---------- Home page: recent activity ----------
  async function renderHomeActivity(container, metaMap) {
    if (!container) return;
    let rows = [];
    try { rows = await fetchActivity(20); } catch (e) { console.warn("[comments] activity failed", e); return; }
    if (!rows.length) return; // 코멘트가 하나도 없으면 섹션 자체를 숨김

    const cards = rows.map((r) => {
      const m = metaMap[r.slug];
      const title = m ? (m.breadcrumbs.slice(-1)[0] || m.title) : r.slug;
      const crumb = m ? (m.breadcrumbs.slice(0, -1).join(" › ") || "") : "";
      const preview = (r.last_body_preview || "").replace(/\s+/g, " ");
      return `<a class="activity-card" href="#${encodeURIComponent(r.slug)}">
        <div class="activity-head">
          <span class="activity-count">코멘트 ${r.comment_count}</span>
          <span class="activity-time">${escapeHtml(fmtTime(r.last_comment_at))}</span>
        </div>
        <div class="activity-title">${escapeHtml(title)}</div>
        <div class="activity-crumb">${escapeHtml(crumb)}</div>
        <div class="activity-preview"><span class="activity-author">${escapeHtml(r.last_author)}</span> ${escapeHtml(preview)}</div>
      </a>`;
    }).join("");

    container.innerHTML = `
      <section class="activity">
        <h2 class="activity-heading">최근 코멘트가 달린 문서</h2>
        <div class="activity-grid">${cards}</div>
      </section>`;
  }

  window.COMMENTS = { mount, renderHomeActivity };
})();
