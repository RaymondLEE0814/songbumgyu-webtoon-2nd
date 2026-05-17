// Node.js 빌드 스크립트: second_draft 의 모든 마크다운을 단일 정적 사이트로 묶는다.
// 외부 패키지 의존 없이 동작 (Node 16+ 권장).

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "second_draft");
const OUT = path.join(ROOT, "second_web");
const ASSETS = path.join(OUT, "assets", "images");
const VENDOR_MARKED = path.join(OUT, "vendor", "marked.min.js");

// ---- marked 를 Node 컨텍스트에서 로드 (UMD 안전 처리) ----
function loadMarked() {
  if (!fs.existsSync(VENDOR_MARKED)) {
    throw new Error(`vendor/marked.min.js 가 없습니다. 한 번만 다음 명령으로 받아두세요:\n  curl -sSL -o vendor/marked.min.js https://cdn.jsdelivr.net/npm/marked@12.0.2/marked.min.js`);
  }
  const src = fs.readFileSync(VENDOR_MARKED, "utf8");
  // CommonJS 처럼 module.exports === exports 로 시작해서 UMD가 어디다 붙이든 캐치
  const moduleObj = { exports: {} };
  const sandbox = {
    module: moduleObj,
    exports: moduleObj.exports,
    console,
  };
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(src, sandbox);
  const candidates = [
    moduleObj.exports,
    sandbox.exports,
    sandbox.marked,
    sandbox.window?.marked,
  ];
  for (const c of candidates) {
    if (c && typeof c.parse === "function") return c;
  }
  throw new Error("marked 모듈 로드 실패: " + JSON.stringify(Object.keys(moduleObj.exports || {})));
}

const marked = loadMarked();
marked.setOptions({ gfm: true, breaks: false });

// ------------------------------------------------------------
// 영문 폴더/파일 → 한국어 라벨 매핑
// ------------------------------------------------------------
const LABEL = {
  // 섹션
  "01_worldview": "01. 세계관",
  "02_character_persona": "02. 캐릭터 페르소나",
  "03_art_direction": "03. 아트 디렉션",
  "04_story_arc": "04. 스토리 아크",
  "05_episode_draft": "05. 에피소드 초안",
  "06_character_assets": "06. 캐릭터 에셋",
  "07_storyboard": "07. 스토리보드",
  "08_webtoon_svg": "08. 최종 웹툰 SVG",
  "99_review_revision_notes": "99. 검토 및 수정 노트",
  "콘티": "콘티",
  // 캐릭터 폴더
  "한서윤": "한서윤",
  "윤태하": "윤태하",
  "박도겸": "박도겸",
  "이름없는여자": "이름 없는 여자",
  "한서윤의_오빠": "한서윤의 오빠",
  "AI_차원번역기": "AI 차원번역기",
  "_review": "검수 템플릿",
  // 스토리보드 폴더
  "ep01_filter_leak": "EP01 · 필터의 누출",
  "prologue_crosswalk_ui_leak": "프롤로그 · 횡단보도 UI 누출",
  "panels": "패널",
  "review": "검증",
  // 파일(확장자 제외)
  "core_concept": "핵심 세계관",
  "supernatural_rules": "초자연 현상의 규칙",
  "main_characters": "주요 캐릭터 페르소나",
  "relationships": "캐릭터 관계도",
  "panel_rhythm_guide": "컷 리듬 가이드",
  "visual_style": "비주얼 스타일",
  "main_plot": "메인 플롯",
  "test_publication_strategy": "테스트 연재 전략",
  "ep01_draft": "1화 스크립트 초안",
  "README": "개요(README)",
  "generation_queue": "이미지 생성 큐",
  "character_asset_review_template": "캐릭터 에셋 검수 템플릿",
  "prompts": "이미지 생성 프롬프트",
  "asset_log": "에셋 작업 로그",
  "consistency_check": "일관성 체크",
  "ep01_storyboard": "EP01 스토리보드",
  "prologue_storyboard": "프롤로그 스토리보드",
  "prologue_draft": "프롤로그 스크립트 초안",
  "panel_list": "컷 리스트",
  "production_notes": "제작 노트",
  "story_validation": "스토리 검증",
  "logic_validation": "논리 검증",
  "review_summary": "검토 요약",
  "revision_log": "수정 내역",
  "콘티_sample": "콘티 샘플 (55화 정령환술)",
};

const SECTION_ORDER = [
  "01_worldview",
  "02_character_persona",
  "03_art_direction",
  "04_story_arc",
  "05_episode_draft",
  "06_character_assets",
  "07_storyboard",
  "08_webtoon_svg",
  "99_review_revision_notes",
  "콘티",
];

// 사이드바/카드/검색에서 숨길 내부 자료 섹션.
// 이미지는 계속 스캔되어 갤러리·페르소나 자동 주입에는 사용됨.
const INTERNAL_SECTIONS = new Set([
  "06_character_assets",
  "08_webtoon_svg", // 트리에서는 제외하고 별도 가상 섹션(웹툰 최종본)으로 노출
]);

const kor = (name, fallback) => LABEL[name] ?? (fallback !== undefined ? fallback : name);

// ------------------------------------------------------------
// 유틸
// ------------------------------------------------------------
function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function slugify(parts) {
  return parts
    .join("__")
    .replace(/[^0-9A-Za-z가-힣_]+/g, "-")
    .replace(/^[-_]+|[-_]+$/g, "") || "doc";
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function emptyDirContents(p) {
  if (!fs.existsSync(p)) return;
  for (const f of fs.readdirSync(p)) {
    const fp = path.join(p, f);
    if (fs.statSync(fp).isFile()) fs.unlinkSync(fp);
  }
}

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fp = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(fp));
    else out.push(fp);
  }
  return out;
}

// ------------------------------------------------------------
// 이미지 복사 + 캐릭터별 이미지 인덱스 빌드
// ------------------------------------------------------------
function copyImages() {
  ensureDir(ASSETS);
  emptyDirContents(ASSETS);
  const map = {};
  // 캐릭터 폴더명 → [{file, webUrl, label}]
  const charImages = {};
  // 에피소드명 → { fullScroll: webUrl | null, panels: [{file, webUrl, label}] }
  const storyboardPanels = {};
  // 최종 웹툰 SVG: 에피소드 폴더명 → [{file, webUrl, viewBox: {w,h} | null, kind}]
  const finalWebtoons = {};

  const files = walk(SRC)
    .filter((f) => /\.(svg|png|jpe?g|gif|webp)$/i.test(f))
    // GitHub 50MB 초과 + 웹 부적합한 embedded SVG 제외
    .filter((f) => !/_embedded\.svg$/i.test(f));
  for (const f of files) {
    const dest = path.join(ASSETS, path.basename(f));

    // SVG 라면 내부 href="assets/foo.png" 를 같은 폴더(flatten 후) 경로로 재작성하여 복사
    if (/\.svg$/i.test(f)) {
      let content = fs.readFileSync(f, "utf8");
      // href="assets/something" → href="something" (둘 다 같은 /assets/images/ 로 평탄화되므로)
      content = content.replace(/(xlink:href|href)="assets\/([^"]+)"/g, '$1="$2"');
      fs.writeFileSync(dest, content, "utf8");
    } else {
      fs.copyFileSync(f, dest);
    }

    const rel = path.relative(SRC, f).replaceAll("\\", "/");
    const webUrl = `assets/images/${path.basename(f)}`;
    map[rel] = webUrl;
    map[path.basename(f)] = webUrl;

    const parts = rel.split("/");

    // 06_character_assets/{name}/images/foo.png → 캐릭터별 인덱스
    if (parts[0] === "06_character_assets" && parts[2] === "images") {
      const charName = parts[1];
      (charImages[charName] = charImages[charName] || []).push({
        file: path.basename(f),
        webUrl,
        label: humanizeFilename(path.basename(f, path.extname(f))),
      });
    }

    // 07_storyboard/{episode}/layout_draft/(full_scroll_layout.svg | images/*.svg) → 에피소드별 인덱스
    if (parts[0] === "07_storyboard" && parts[2] === "layout_draft") {
      const ep = parts[1];
      storyboardPanels[ep] = storyboardPanels[ep] || { fullScroll: null, panels: [] };
      if (parts[3] === "full_scroll_layout.svg") {
        storyboardPanels[ep].fullScroll = webUrl;
      } else if (parts[3] === "images" && parts[4]) {
        storyboardPanels[ep].panels.push({
          file: path.basename(f),
          webUrl,
          label: humanizeFilename(path.basename(f, path.extname(f))),
        });
      }
    }

    // 08_webtoon_svg/{episode}/*.svg → 최종 웹툰 인덱스 (assets 폴더의 PNG 는 SVG 가 알아서 참조)
    if (parts[0] === "08_webtoon_svg" && /\.svg$/i.test(parts[2] || "")) {
      const ep = parts[1];
      finalWebtoons[ep] = finalWebtoons[ep] || [];
      // viewBox 추출 (있으면 비율 유지에 사용)
      let viewBox = null;
      try {
        const head = fs.readFileSync(f, "utf8").slice(0, 800);
        const m = head.match(/viewBox="\s*0\s+0\s+([\d.]+)\s+([\d.]+)\s*"/i);
        if (m) viewBox = { w: parseFloat(m[1]), h: parseFloat(m[2]) };
      } catch (_) {}
      finalWebtoons[ep].push({
        file: path.basename(f),
        webUrl,
        viewBox,
        // dialogue 가 들어있는 파일은 "대사 강화판"
        kind: /dialogue/i.test(parts[2]) ? "dialogue" : "final",
      });
    }
  }
  for (const k of Object.keys(charImages)) {
    charImages[k].sort((a, b) => a.file.localeCompare(b.file));
  }
  for (const k of Object.keys(finalWebtoons)) {
    finalWebtoons[k].sort((a, b) => {
      // 일반 final 을 먼저, dialogue 를 뒤로
      if (a.kind !== b.kind) return a.kind === "final" ? -1 : 1;
      return a.file.localeCompare(b.file);
    });
  }
  for (const k of Object.keys(storyboardPanels)) {
    storyboardPanels[k].panels.sort((a, b) => a.file.localeCompare(b.file));
  }
  return { map, charImages, storyboardPanels, finalWebtoons };
}

function humanizeFilename(stem) {
  // ex) han_seoyun_reference_sheet_v01 → "han seoyun reference sheet v01"
  return stem.replaceAll("_", " ").replace(/\bv(\d+)\b/g, "v$1");
}

// 02_character_persona 의 파일명 stem (한서윤, 박도겸, ...) → 06_character_assets 폴더명 매핑
const PERSONA_TO_ASSET_FOLDER = {
  "한서윤": "한서윤",
  "윤태하": "윤태하",
  "박도겸": "박도겸",
  "이름없는여자": "이름없는여자",
  "한서윤의_오빠": "한서윤의_오빠",
  "AI_차원번역기": "AI_차원번역기",
};

// 에피소드별 컷 순서 (panel_list.md 기준, 블랙 여백 포함)
const STORYBOARD_SEQUENCES = {
  ep01_filter_leak: [
    { file: "panel_01.svg", caption: "컷 01 · 800px · 정박 · 늦은 밤 지하철, 서윤 전신", sfx: "덜컹... 덜컹..." },
    { file: "panel_02.svg", caption: "컷 02 · 800px · 정박 · 맞은편 승객의 발끝", sfx: "" },
    { file: "panel_03.svg", caption: "컷 03 · 800px · 정박 · 폐역 CCTV 제보 사진", sfx: "“귀신이면 움직여야지.”" },
    { file: "panel_04.svg", caption: "컷 04 · 800px · 정박 · 눈 감았다 뜨는 서윤", sfx: "덜컹... 덜컹..." },
    { file: "panel_05.svg", caption: "컷 05 · 200px · 엇박 · 형광등 깜빡임", sfx: "" },
    { file: "black_01.svg", caption: "여백 · 1500px · 정지 · 블랙 여백 (호흡 정지)", sfx: "", isBlack: true },
    { file: "panel_06.svg", caption: "컷 06 · 2500px · 누출 · 노이즈 승객 거대 컷", sfx: "삐----" },
    { file: "panel_07.svg", caption: "컷 07 · 500px · 폴리리듬 · 서윤 눈 클로즈업", sfx: "" },
    { file: "panel_08.svg", caption: "컷 08 · 600px · 폴리리듬 · 노이즈 내부 단서", sfx: "“도...착...”" },
    { file: "panel_09.svg", caption: "컷 09 · 700px · 폴리리듬 · 터널이 정보 구조로 변함", sfx: "“2:17”" },
    { file: "panel_10.svg", caption: "컷 10 · 300px · 엇박 · 손목 픽셀 무늬", sfx: "“아니야. 오늘은 아니야.”" },
    { file: "panel_11.svg", caption: "컷 11 · 800px · 정박 복귀 · 문 열림, 정상 안내방송", sfx: "“이번 역은...”" },
    { file: "black_02.svg", caption: "여백 · 500px · 정지 · 블랙 여백 (안심 직전의 숨)", sfx: "", isBlack: true },
    { file: "panel_12.svg", caption: "컷 12 · 1000px · 불안정 정박 · 바닥의 픽셀 가루", sfx: "“...또 샜어.”" },
    { file: "panel_13.svg", caption: "컷 13 · 800px · 단서 · 승차권 조각으로 변함", sfx: "“1999 / 02:17”" },
    { file: "panel_14.svg", caption: "컷 14 · 600px · 훅 · 박도겸 문자", sfx: "“내일 오지 마십시오. 그 시간에 보면, 그쪽도 기록됩니다.”" },
  ],
};

const EPISODE_LABEL = {
  ep01_filter_leak: "EP01 · 필터의 누출",
};

// 08_webtoon_svg 폴더명 라벨 (한국어)
const FINAL_EP_LABEL = {
  ep01_final: "EP01 · 필터의 누출",
  prologue_final: "프롤로그 · 횡단보도 UI 누출",
};
function finalFileLabel(file) {
  if (/dialogue/i.test(file)) return "대사 강화판";
  return "최종본";
}

// ------------------------------------------------------------
// 문서 트리 수집
// ------------------------------------------------------------
function collectTree() {
  const tree = {};
  for (const section of SECTION_ORDER) {
    if (INTERNAL_SECTIONS.has(section)) continue; // 내부 자료는 트리에서 제외
    const sdir = path.join(SRC, section);
    if (!fs.existsSync(sdir)) continue;
    const items = [];
    // 섹션 직속 md (README 는 폴더 안내용 메타라서 본문 사이드바에서 제외)
    const direct = fs
      .readdirSync(sdir, { withFileTypes: true })
      .filter((d) => d.isFile() && d.name.endsWith(".md") && d.name !== "README.md")
      .map((d) => d.name)
      .sort();
    for (const name of direct) {
      const rel = path.join(section, name);
      items.push({ kind: "file", rel, stem: name.replace(/\.md$/, "") });
    }
    // 하위 폴더(그룹)
    const subs = fs
      .readdirSync(sdir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
      .sort();
    for (const sub of subs) {
      const subdir = path.join(sdir, sub);
      const groupItems = [];
      const subFiles = walk(subdir)
        .filter((p) => p.endsWith(".md") && path.basename(p) !== "README.md")
        .sort((a, b) => {
          // *_storyboard.md 를 그룹 최상단으로, review/* 를 가장 뒤로
          const ax = path.basename(a), bx = path.basename(b);
          const aSb = ax.endsWith("_storyboard.md") ? 0 : 1;
          const bSb = bx.endsWith("_storyboard.md") ? 0 : 1;
          if (aSb !== bSb) return aSb - bSb;
          const aRev = a.includes("/review/") || a.includes("\\review\\") ? 1 : 0;
          const bRev = b.includes("/review/") || b.includes("\\review\\") ? 1 : 0;
          if (aRev !== bRev) return aRev - bRev;
          return a.localeCompare(b);
        });
      for (const f of subFiles) {
        const rel = path.relative(SRC, f).replaceAll("\\", "/");
        const parts = rel.split("/");
        const stem = parts[parts.length - 1].replace(/\.md$/, "");
        const parentChain = parts.slice(2, parts.length - 1); // section 다음부터 파일 직전까지
        groupItems.push({ kind: "file", rel, stem, parentChain });
      }
      if (groupItems.length) {
        items.push({ kind: "group", name: sub, items: groupItems });
      }
    }
    if (items.length) tree[section] = items;
  }
  return tree;
}

// ------------------------------------------------------------
// 문서 객체 생성
// ------------------------------------------------------------
function makeDoc(section, groupParts, relPath, title, imgMap, charImages) {
  const full = path.join(SRC, relPath);
  let text = fs.readFileSync(full, "utf8");
  // 이미지 경로 보정 (마크다운 안에 명시된 이미지)
  text = text.replace(/(!\[[^\]]*\])\(([^)]+)\)/g, (m, alt, url) => {
    const fname = path.basename(url.split("?")[0]);
    if (imgMap[fname]) return `${alt}(${imgMap[fname]})`;
    return m;
  });

  // 자동 이미지 주입 (마커만 박아둠)
  text = injectAutoImages(text, section, groupParts, relPath, charImages);

  const breadcrumbs = [kor(section), ...groupParts.map((g) => kor(g, g)), title.split(" · ").slice(-1)[0]];
  const html = renderMarkdownToHtml(text);
  return { title, breadcrumbs, html };
}

// CommonMark 가 한국어 인접 **bold** / *italic* 를 처리하지 못하는 케이스를 사전 보정.
// 코드 블록 / 인라인 코드 안은 건드리지 않는다.
function fixCjkEmphasis(md) {
  const segments = md.split(/(```[\s\S]*?```|`[^`\n]+`)/g);
  return segments
    .map((seg, i) => {
      if (i % 2 === 1) return seg; // 코드 영역
      // **굵게** (줄바꿈/별표 미포함)
      seg = seg.replace(/\*\*([^*\n]+?)\*\*/g, "<strong>$1</strong>");
      return seg;
    })
    .join("");
}

function renderMarkdownToHtml(text) {
  text = fixCjkEmphasis(text);
  let html = marked.parse(text);
  // GALLERY 마커 치환
  html = html.replace(/<!--GALLERY:([A-Za-z0-9+/=]+)-->/g, (m, b64) => {
    try {
      const { heading, payload } = JSON.parse(Buffer.from(b64, "base64").toString("utf8"));
      return renderGalleryHtml(heading, payload);
    } catch (_) {
      return "";
    }
  });
  // marked 가 마커를 <p>...</p> 로 감쌀 수 있어 그 케이스도 처리
  html = html.replace(/<p>(\s*<section class="gallery-block">[\s\S]*?<\/section>\s*)<\/p>/g, "$1");
  return html;
}

function injectAutoImages(text, section, groupParts, relPath, charImages) {
  // 1) 02_character_persona/{한서윤}.md → 해당 캐릭터 reference 이미지 자동 노출
  if (section === "02_character_persona" && relPath.endsWith(".md")) {
    const stem = path.basename(relPath, ".md");
    const charKey = PERSONA_TO_ASSET_FOLDER[stem];
    const imgs = charKey ? charImages[charKey] : null;
    if (imgs && imgs.length) {
      return buildImageBlock(`참조 이미지 (캐릭터 에셋에서 자동 연결됨)`, imgs) + "\n\n---\n\n" + text;
    }
  }
  // 2) 06_character_assets/{name}/README.md → 같은 폴더의 모든 이미지 갤러리
  if (section === "06_character_assets" && groupParts.length >= 1 && relPath.endsWith("README.md")) {
    const charKey = groupParts[0];
    const imgs = charImages[charKey];
    if (imgs && imgs.length) {
      return buildImageBlock(`이미지 갤러리 (${imgs.length}컷)`, imgs) + "\n\n---\n\n" + text;
    }
  }
  // 3) 06_character_assets/{name}/asset_log.md → 결과물 미리보기
  if (section === "06_character_assets" && groupParts.length >= 1 && relPath.endsWith("asset_log.md")) {
    const charKey = groupParts[0];
    const imgs = charImages[charKey];
    if (imgs && imgs.length) {
      return buildImageBlock(`현재까지 생성된 이미지`, imgs) + "\n\n---\n\n" + text;
    }
  }
  return text;
}

// 이미지 블록은 사전 렌더 단계에서 raw HTML 마커로 삽입.
// 마크다운 본문에는 텍스트 자리표시자만 두고, 사전 렌더 후 마커를 HTML 로 치환한다.
const GALLERY_MARKER = (heading, payload) => `\n\n<!--GALLERY:${Buffer.from(JSON.stringify({ heading, payload })).toString("base64")}-->\n\n`;

function buildImageBlock(heading, imgs) {
  return GALLERY_MARKER(heading, imgs);
}

function renderGalleryHtml(heading, imgs) {
  const cards = imgs
    .map(
      (img) => `<figure class="figure">
  <a class="figure-link" href="${img.webUrl}" target="_blank" rel="noopener">
    <img src="${img.webUrl}" alt="${escapeAttr(img.label)}" loading="lazy">
  </a>
  <figcaption>${escapeHtml(img.file)}</figcaption>
</figure>`
    )
    .join("\n");
  return `<section class="gallery-block">
<h2 class="gallery-heading">${escapeHtml(heading)}</h2>
<div class="gallery-grid">
${cards}
</div>
</section>`;
}

// 08_webtoon_svg/{ep}/*.svg → 뷰어 doc 생성
function buildWebtoonViewerDoc(epKey, svgEntry) {
  const epLabel = FINAL_EP_LABEL[epKey] || epKey;
  const fileLabel = finalFileLabel(svgEntry.file);
  const vb = svgEntry.viewBox;
  const sizeNote = vb ? `폭 ${vb.w.toLocaleString()}px × 세로 ${vb.h.toLocaleString()}px` : "";
  const html = `<p class="lead-note">${escapeHtml(epLabel)} · ${escapeHtml(fileLabel)}${sizeNote ? ` · ${escapeHtml(sizeNote)}` : ""}. 이미지 생성 모델로 만든 시트 위에 SVG 로 컷 경계·말풍선·대사를 얹은 최종본 초안입니다.</p>
<div class="webtoon-viewer">
  <object class="webtoon-svg" type="image/svg+xml" data="${svgEntry.webUrl}" aria-label="${escapeAttr(epLabel + ' ' + fileLabel)}">
    <a href="${svgEntry.webUrl}" target="_blank" rel="noopener">SVG 직접 열기</a>
  </object>
  <div class="webtoon-actions">
    <a class="btn-ghost" href="${svgEntry.webUrl}" target="_blank" rel="noopener">SVG 새 탭에서 보기</a>
    <a class="btn-ghost" href="${svgEntry.webUrl}" download>SVG 다운로드</a>
  </div>
</div>`;
  return {
    title: `${epLabel} · ${fileLabel}`,
    breadcrumbs: ["08. 최종 웹툰 SVG", epLabel, fileLabel],
    html,
  };
}

function buildStoryboardPanelDoc(epKey, panelsData) {
  const seq = STORYBOARD_SEQUENCES[epKey];
  const epLabel = EPISODE_LABEL[epKey] || epKey;
  if (!seq || !panelsData || !panelsData.panels.length) return null;

  const byFile = Object.fromEntries(panelsData.panels.map((p) => [p.file, p]));

  let strip = '<div class="panel-strip">';
  for (const item of seq) {
    const info = byFile[item.file];
    if (!info) continue;
    const cls = item.isBlack ? "panel panel-black" : "panel";
    strip += `
<figure class="${cls}">
  <a class="panel-link" href="${info.webUrl}" target="_blank" rel="noopener">
    <img src="${info.webUrl}" alt="${escapeAttr(item.caption)}" loading="lazy">
  </a>
  <figcaption>
    <span class="panel-caption-main">${escapeHtml(item.caption)}</span>${item.sfx ? `<span class="panel-caption-sfx">${escapeHtml(item.sfx)}</span>` : ""}
  </figcaption>
</figure>`;
  }
  strip += "\n</div>";

  const fullScrollBlock = panelsData.fullScroll
    ? `<details class="full-scroll-toggle">
  <summary>전체 스크롤 한 장으로 보기 (full_scroll_layout.svg · 720 × 13,200px)</summary>
  <div class="full-scroll-wrap">
    <img src="${panelsData.fullScroll}" alt="${escapeAttr(epLabel)} 풀 스크롤 레이아웃" loading="lazy">
  </div>
</details>`
    : "";

  const html = `<p class="lead-note">${escapeHtml(epLabel)} 의 러프 스크롤 레이아웃입니다. 컷 폭 720px, 본 컷 14개 + 블랙 여백 2구간, 총 세로 13,200px. 작화 전 컷 길이·리듬·대사 위치를 잡기 위한 SVG 초안이며 최종 작화 파일이 아닙니다.</p>
${fullScrollBlock}
<h2 class="gallery-heading">패널 시퀀스 (스크롤 순서)</h2>
${strip}`;

  return {
    title: `${epLabel} · 패널 시퀀스`,
    breadcrumbs: ["07. 스토리보드", epLabel, "패널 시퀀스"],
    html,
  };
}

function escapeAttr(s) {
  return String(s).replaceAll('"', "&quot;");
}

// ------------------------------------------------------------
// 네비 + 문서 dict 생성
// ------------------------------------------------------------
function buildNavAndDocs(tree, imgMap, charImages, storyboardPanels, finalWebtoons) {
  const docs = {};
  const navParts = [];

  // ---- 가상 섹션: 최종 웹툰 SVG (최상단, 가장 중요) ----
  const finalDocsByEp = {};
  const FINAL_EP_ORDER = ["prologue_final", "ep01_final"];
  const epKeysInOrder = [
    ...FINAL_EP_ORDER.filter((k) => finalWebtoons && finalWebtoons[k]),
    ...Object.keys(finalWebtoons || {}).filter((k) => !FINAL_EP_ORDER.includes(k)),
  ];
  if (epKeysInOrder.length) {
    navParts.push(`<div class="nav-section"><div class="nav-section-title">${escapeHtml(kor("08_webtoon_svg"))}</div><ul class="nav-list">`);
    for (const epKey of epKeysInOrder) {
      const items = finalWebtoons[epKey];
      const epLabel = FINAL_EP_LABEL[epKey] || epKey;
      navParts.push(`<li class="nav-group"><div class="nav-group-title">${escapeHtml(epLabel)}</div><ul class="nav-sublist">`);
      const list = [];
      for (const entry of items) {
        const doc = buildWebtoonViewerDoc(epKey, entry);
        const slug = slugify(["08_webtoon_svg", epKey, entry.file.replace(/\.svg$/i, "")]);
        docs[slug] = doc;
        list.push({ slug, fileLabel: finalFileLabel(entry.file) });
        navParts.push(`<li><a href="#${slug}" data-slug="${slug}">${escapeHtml(finalFileLabel(entry.file))}</a></li>`);
      }
      finalDocsByEp[epKey] = list;
      navParts.push("</ul></li>");
    }
    navParts.push("</ul></div>");
  }

  // ---- 가상 섹션: 캐릭터 비주얼 갤러리 ----
  const gallerySlug = "00_visual_gallery__all";
  docs[gallerySlug] = buildGalleryDoc(charImages);
  navParts.push(
    `<div class="nav-section"><div class="nav-section-title">비주얼 갤러리</div><ul class="nav-list">` +
    `<li><a href="#${gallerySlug}" data-slug="${gallerySlug}">캐릭터 비주얼 한눈에 보기</a></li>` +
    `</ul></div>`
  );

  // 에피소드별 패널 시퀀스 슬러그 (sub 항목 렌더링 시 그룹에 끼워넣기 위해 미리 빌드)
  const panelDocsByEp = {};
  for (const epKey of Object.keys(storyboardPanels || {})) {
    const doc = buildStoryboardPanelDoc(epKey, storyboardPanels[epKey]);
    if (!doc) continue;
    const slug = slugify(["07_storyboard", epKey, "panel_sequence"]);
    docs[slug] = doc;
    panelDocsByEp[epKey] = { slug, label: "패널 시퀀스 (러프 스크롤)" };
  }

  for (const section of SECTION_ORDER) {
    const items = tree[section];
    if (!items) continue;
    const secLabel = kor(section);
    navParts.push(`<div class="nav-section"><div class="nav-section-title">${escapeHtml(secLabel)}</div><ul class="nav-list">`);
    for (const item of items) {
      if (item.kind === "file") {
        const slug = slugify([section, item.stem]);
        const title = kor(item.stem, item.stem);
        docs[slug] = makeDoc(section, [], item.rel, title, imgMap, charImages);
        navParts.push(`<li><a href="#${slug}" data-slug="${slug}">${escapeHtml(title)}</a></li>`);
      } else {
        const gname = item.name;
        const glabel = kor(gname, gname);
        navParts.push(`<li class="nav-group"><div class="nav-group-title">${escapeHtml(glabel)}</div><ul class="nav-sublist">`);
        // 07_storyboard 그룹이면 패널 시퀀스를 최상단에 끼워넣기
        if (section === "07_storyboard" && panelDocsByEp[gname]) {
          const p = panelDocsByEp[gname];
          navParts.push(`<li><a href="#${p.slug}" data-slug="${p.slug}">${escapeHtml(p.label)}</a></li>`);
        }
        for (const sub of item.items) {
          const slug = slugify([section, gname, ...sub.parentChain, sub.stem]);
          const subLabel = sub.parentChain.length
            ? sub.parentChain.map((p) => kor(p, p)).join(" · ") + " · " + kor(sub.stem, sub.stem)
            : kor(sub.stem, sub.stem);
          docs[slug] = makeDoc(section, [gname, ...sub.parentChain], sub.rel, `${glabel} · ${subLabel}`, imgMap, charImages);
          navParts.push(`<li><a href="#${slug}" data-slug="${slug}">${escapeHtml(subLabel)}</a></li>`);
        }
        navParts.push("</ul></li>");
      }
    }
    navParts.push("</ul></div>");
  }
  return { navHtml: navParts.join(""), docs, gallerySlug, panelDocsByEp, finalDocsByEp };
}

function buildGalleryDoc(charImages) {
  const order = ["한서윤", "윤태하", "박도겸", "이름없는여자", "한서윤의_오빠", "AI_차원번역기"];
  const known = new Set(order);
  const sections = [...order, ...Object.keys(charImages).filter((k) => !known.has(k))];
  let blocks = "";
  for (const charKey of sections) {
    const imgs = charImages[charKey];
    if (!imgs || !imgs.length) continue;
    blocks += renderGalleryHtml(kor(charKey, charKey), imgs);
  }
  if (!blocks) blocks = `<p class="muted">아직 생성된 이미지가 없습니다.</p>`;
  const html = `<p class="lead-note">06_character_assets/{캐릭터}/images/ 폴더의 모든 결과물입니다. 이미지를 추가하고 <code>node build.js</code>만 다시 실행하면 자동으로 갱신됩니다.</p>${blocks}`;
  return {
    title: "캐릭터 비주얼 한눈에 보기",
    breadcrumbs: ["비주얼 갤러리", "캐릭터 비주얼 한눈에 보기"],
    html,
  };
}

// ------------------------------------------------------------
// 인덱스 카드 렌더
// ------------------------------------------------------------
function renderWelcomeCards(tree, gallerySlug, charImages, panelDocsByEp, finalDocsByEp) {
  const cards = [];
  // 1) 최종 웹툰 SVG (가장 중요한 산출물)
  if (finalDocsByEp) {
    if (finalDocsByEp.prologue_final && finalDocsByEp.prologue_final.length) {
      const first = finalDocsByEp.prologue_final[0];
      cards.push(
        `<a class="card card-accent" href="#${first.slug}"><div class="card-title">프롤로그 최종 웹툰</div><div class="card-meta">SVG · 횡단보도 UI 누출</div></a>`
      );
    }
    if (finalDocsByEp.ep01_final && finalDocsByEp.ep01_final.length) {
      const first = finalDocsByEp.ep01_final[0];
      cards.push(
        `<a class="card card-accent" href="#${first.slug}"><div class="card-title">EP01 최종 웹툰</div><div class="card-meta">SVG · 필터의 누출</div></a>`
      );
    }
  }
  // 2) 비주얼 갤러리
  const totalImgs = Object.values(charImages).reduce((a, arr) => a + arr.length, 0);
  cards.push(
    `<a class="card card-accent" href="#${gallerySlug}"><div class="card-title">비주얼 갤러리</div><div class="card-meta">캐릭터 이미지 ${totalImgs}컷</div></a>`
  );
  // 3) EP01 패널 시퀀스
  if (panelDocsByEp && panelDocsByEp.ep01_filter_leak) {
    cards.push(
      `<a class="card card-accent" href="#${panelDocsByEp.ep01_filter_leak.slug}"><div class="card-title">EP01 패널 시퀀스</div><div class="card-meta">러프 스크롤 16컷</div></a>`
    );
  }
  for (const section of SECTION_ORDER) {
    const items = tree[section];
    if (!items) continue;
    const secLabel = kor(section);
    let firstSlug = null;
    for (const item of items) {
      if (item.kind === "file") {
        firstSlug = slugify([section, item.stem]);
        break;
      } else {
        if (item.items.length) {
          const s = item.items[0];
          firstSlug = slugify([section, item.name, ...s.parentChain, s.stem]);
          break;
        }
      }
    }
    if (!firstSlug) continue;
    const nDocs = items.reduce((acc, it) => acc + (it.kind === "file" ? 1 : it.items.length), 0);
    cards.push(
      `<a class="card" href="#${firstSlug}"><div class="card-title">${escapeHtml(secLabel)}</div><div class="card-meta">문서 ${nDocs}건</div></a>`
    );
  }
  return cards.join("");
}

// ------------------------------------------------------------
// 스크립트(임베드된 마크다운 + 메타) 렌더
// ------------------------------------------------------------
function renderScripts(docs) {
  const meta = {};
  for (const [slug, d] of Object.entries(docs)) {
    meta[slug] = { title: d.title, breadcrumbs: d.breadcrumbs };
  }
  const parts = [];
  parts.push(`<script id="docs-meta" type="application/json">${JSON.stringify(meta).replaceAll("</", "<\\/")}</script>`);
  // 사전 렌더된 HTML을 <template>으로 임베드 (브라우저가 파싱하지 않음, JS로 활성화)
  for (const [slug, d] of Object.entries(docs)) {
    parts.push(`<template id="doc-${slug}">${d.html}</template>`);
  }
  return parts.join("\n");
}

// ------------------------------------------------------------
// HTML 템플릿
// ------------------------------------------------------------
const HTML = ({ navHtml, cards, scripts }) => `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>웹툰 기획 · 2차 초안 (송범규)</title>
<link rel="icon" type="image/svg+xml" href='data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 64 64%22><rect width=%2264%22 height=%2264%22 rx=%2214%22 fill=%22%2309090b%22/><text x=%2232%22 y=%2244%22 text-anchor=%22middle%22 font-family=%22system-ui,sans-serif%22 font-size=%2234%22 font-weight=%22700%22 fill=%22white%22>2</text></svg>'>
<link rel="stylesheet" href="styles.css">
</head>
<body>
<aside class="sidebar">
  <div class="brand">
    <div class="brand-kicker">webtoon planning</div>
    <div class="brand-title">2차 초안 · 송범규</div>
    <div class="brand-sub">인지 · 차원 · 무속 세계관</div>
  </div>
  <div class="search">
    <input id="q" type="search" placeholder="문서 검색 (제목/내용)" autocomplete="off">
  </div>
  <nav id="nav" class="nav">${navHtml}</nav>
  <div class="foot">© second_draft → second_web 정적 빌드</div>
</aside>
<main class="content">
  <header class="topbar">
    <button id="menuBtn" class="menu-btn" aria-label="메뉴 열기">☰</button>
    <div id="crumb" class="crumb"><span class="cur">홈</span></div>
  </header>
  <article id="article" class="article">
    <div class="welcome">
      <h1>웹툰 기획 · 2차 초안</h1>
      <p class="lead">왼쪽 메뉴에서 문서를 선택하세요. 모든 폴더/파일 이름은 한국어 라벨로 정리되어 있습니다.</p>
      <div class="cards">${cards}</div>
    </div>
  </article>
</main>

${scripts}

<script src="config.js"></script>
<script src="comments.js"></script>
<script src="app.js"></script>
</body>
</html>
`;

// ------------------------------------------------------------
// main
// ------------------------------------------------------------
function main() {
  ensureDir(OUT);
  const { map: imgMap, charImages, storyboardPanels, finalWebtoons } = copyImages();
  const tree = collectTree();
  const { navHtml, docs, gallerySlug, panelDocsByEp, finalDocsByEp } =
    buildNavAndDocs(tree, imgMap, charImages, storyboardPanels, finalWebtoons);
  const cards = renderWelcomeCards(tree, gallerySlug, charImages, panelDocsByEp, finalDocsByEp);
  const scripts = renderScripts(docs);
  const htmlOut = HTML({ navHtml, cards, scripts });
  fs.writeFileSync(path.join(OUT, "index.html"), htmlOut, "utf8");
  const imgCount = new Set(Object.values(imgMap)).size;
  const epCount = Object.keys(storyboardPanels).length;
  const panelCount = Object.values(storyboardPanels).reduce((a, e) => a + e.panels.length, 0);
  const finalCount = Object.values(finalWebtoons || {}).reduce((a, arr) => a + arr.length, 0);
  console.log(`[OK] ${path.join(OUT, "index.html")}`);
  console.log(`     docs: ${Object.keys(docs).length}, images: ${imgCount}, characters: ${Object.keys(charImages).length}, episodes: ${epCount} (${panelCount} panels), final SVGs: ${finalCount}`);
}

main();
