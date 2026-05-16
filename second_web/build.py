# -*- coding: utf-8 -*-
"""
second_draft 폴더의 모든 마크다운 문서를 단일 정적 사이트(index.html)로 묶는 빌드 스크립트.

- 한국어 라벨로 사이드바를 구성
- 마크다운은 <script type="text/markdown"> 블록에 임베드 (marked.js로 렌더링)
- 이미지 파일은 assets/images 로 복사
- 외부 의존: CDN의 marked.js 하나만 사용 (오프라인이면 vendor 폴더 fallback 사용 가능)
"""

import os
import shutil
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "second_draft"
OUT = ROOT / "second_web"
ASSETS = OUT / "assets" / "images"

# 영문 폴더/파일명 → 한국어 라벨 매핑
LABEL = {
    # 섹션(폴더) 라벨
    "01_worldview": "01. 세계관",
    "02_character_persona": "02. 캐릭터 페르소나",
    "03_art_direction": "03. 아트 디렉션",
    "04_story_arc": "04. 스토리 아크",
    "05_episode_draft": "05. 에피소드 초안",
    "06_character_assets": "06. 캐릭터 에셋",
    "07_storyboard": "07. 스토리보드",
    "99_review_revision_notes": "99. 검토 및 수정 노트",
    "콘티": "콘티",

    # 캐릭터 폴더
    "한서윤": "한서윤",
    "윤태하": "윤태하",
    "박도겸": "박도겸",
    "이름없는여자": "이름 없는 여자",
    "한서윤의_오빠": "한서윤의 오빠",
    "AI_차원번역기": "AI 차원번역기",
    "_review": "검수 템플릿",

    # 스토리보드 폴더
    "ep01_filter_leak": "EP01 · 필터의 누출",
    "panels": "패널",
    "review": "검증",

    # 개별 파일 (확장자 제외)
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
    "panel_list": "EP01 컷 리스트",
    "production_notes": "EP01 제작 노트",
    "story_validation": "스토리 검증",
    "logic_validation": "논리 검증",
    "review_summary": "검토 요약",
    "revision_log": "수정 내역",
    "콘티_sample": "콘티 샘플(55화 정령환술)",
}

# 사이드바에 표시할 섹션 순서
SECTION_ORDER = [
    "01_worldview",
    "02_character_persona",
    "03_art_direction",
    "04_story_arc",
    "05_episode_draft",
    "06_character_assets",
    "07_storyboard",
    "99_review_revision_notes",
    "콘티",
]


def kor(name: str, fallback: str | None = None) -> str:
    return LABEL.get(name, fallback if fallback is not None else name)


def slugify(parts: list[str]) -> str:
    s = "__".join(parts)
    s = re.sub(r"[^0-9A-Za-z가-힣_]+", "-", s)
    return s.strip("-_") or "doc"


def safe_markdown(text: str) -> str:
    # </script> 가 본문에 등장하면 임베드가 깨지므로 분리
    return text.replace("</script>", "<\\/script>")


def copy_images() -> dict[str, str]:
    """이미지 복사 후 (원본 경로 → 새 상대 경로) 맵 반환"""
    ASSETS.mkdir(parents=True, exist_ok=True)
    # 기존 파일 정리
    for f in ASSETS.glob("*"):
        f.unlink()
    mapping: dict[str, str] = {}
    for img in SRC.rglob("*"):
        if img.is_file() and img.suffix.lower() in {".png", ".jpg", ".jpeg", ".gif", ".webp"}:
            dest = ASSETS / img.name
            shutil.copy2(img, dest)
            rel_from_html = f"assets/images/{img.name}"
            # 다양한 경로 표현을 동일 키로 매핑
            mapping[str(img.relative_to(SRC)).replace("\\", "/")] = rel_from_html
            mapping[img.name] = rel_from_html
    return mapping


def collect_docs():
    """폴더를 순회하며 문서 트리 구성. 반환: [(section_key, [items])]"""
    tree: dict[str, list] = {k: [] for k in SECTION_ORDER}
    for section in SECTION_ORDER:
        section_dir = SRC / section
        if not section_dir.exists():
            continue
        # 섹션 바로 아래 마크다운 파일
        for md in sorted(section_dir.glob("*.md")):
            tree[section].append({
                "kind": "file",
                "rel": md.relative_to(SRC),
                "stem": md.stem,
            })
        # 하위 폴더(캐릭터/회차 등)
        for sub in sorted([p for p in section_dir.iterdir() if p.is_dir()]):
            group = {
                "kind": "group",
                "name": sub.name,
                "items": [],
            }
            # 하위 폴더의 마크다운들
            for md in sorted(sub.rglob("*.md")):
                # review 폴더 안 등 더 깊은 경로의 라벨 처리
                rel = md.relative_to(SRC)
                group["items"].append({
                    "kind": "file",
                    "rel": rel,
                    "stem": md.stem,
                    "parent_chain": [p for p in rel.parts[1:-1]],  # section 이후 ~ 파일 직전
                })
            if group["items"]:
                tree[section].append(group)
    return tree


HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>웹툰 기획 · 2차 초안 (송범규)</title>
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
  <nav id="nav" class="nav"></nav>
  <div class="foot">© second_draft → second_web 정적 빌드</div>
</aside>
<main class="content">
  <header class="topbar">
    <button id="menuBtn" class="menu-btn" aria-label="메뉴 열기">☰</button>
    <div id="crumb" class="crumb"></div>
  </header>
  <article id="article" class="article">
    <div class="welcome">
      <h1>웹툰 기획 · 2차 초안</h1>
      <p class="lead">왼쪽 메뉴에서 문서를 선택하세요. 모든 폴더/파일 이름은 한국어 라벨로 정리되어 있습니다.</p>
      <div class="cards">__CARDS__</div>
    </div>
  </article>
</main>

__SCRIPTS__

<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
<script src="app.js"></script>
</body>
</html>
"""


def build_nav_and_docs(tree, img_map):
    docs = {}  # slug -> {title, breadcrumbs[], markdown}
    nav_html_parts = []

    for section in SECTION_ORDER:
        items = tree.get(section, [])
        if not items:
            continue
        sec_label = kor(section)
        nav_html_parts.append(f'<div class="nav-section"><div class="nav-section-title">{html.escape(sec_label)}</div><ul class="nav-list">')

        for item in items:
            if item["kind"] == "file":
                stem = item["stem"]
                slug = slugify([section, stem])
                title = kor(stem, stem)
                doc = make_doc(section, [], item["rel"], title, img_map)
                docs[slug] = doc
                nav_html_parts.append(f'<li><a href="#{slug}" data-slug="{slug}">{html.escape(title)}</a></li>')
            else:
                # group
                gname = item["name"]
                glabel = kor(gname, gname)
                nav_html_parts.append(
                    f'<li class="nav-group"><div class="nav-group-title">{html.escape(glabel)}</div><ul class="nav-sublist">'
                )
                for sub in item["items"]:
                    stem = sub["stem"]
                    parents = sub.get("parent_chain", [])
                    slug = slugify([section, gname, *parents, stem])
                    # 깊은 폴더(예: review) 안의 README 등은 폴더명으로 보강
                    if parents:
                        sub_label = " · ".join(kor(p, p) for p in parents) + " · " + kor(stem, stem)
                    else:
                        sub_label = kor(stem, stem)
                    doc = make_doc(section, [gname, *parents], sub["rel"], f"{glabel} · {sub_label}", img_map)
                    docs[slug] = doc
                    nav_html_parts.append(
                        f'<li><a href="#{slug}" data-slug="{slug}">{html.escape(sub_label)}</a></li>'
                    )
                nav_html_parts.append("</ul></li>")
        nav_html_parts.append("</ul></div>")

    return "".join(nav_html_parts), docs


def make_doc(section, group_parts, rel_path, title, img_map):
    full = SRC / rel_path
    text = full.read_text(encoding="utf-8")
    # 이미지 경로 보정: ../../06_character_assets/.../images/foo.png → assets/images/foo.png
    def repl_img(m):
        url = m.group(2).strip()
        fname = os.path.basename(url.split("?")[0])
        if fname in img_map:
            return f"{m.group(1)}({img_map[fname]})"
        return m.group(0)
    text = re.sub(r"(!\[[^\]]*\])\(([^)]+)\)", repl_img, text)
    # 내부 .md 링크는 클릭 시 SPA 라우팅을 위해 #anchor 로 바꿔주지 않고 그냥 둠 (단순화)
    breadcrumb = [kor(section)] + [kor(g, g) for g in group_parts] + [title.split(" · ")[-1]]
    return {
        "title": title,
        "breadcrumbs": breadcrumb,
        "markdown": text,
    }


def render_scripts(docs: dict) -> str:
    parts = []
    # 메타 데이터(JSON)
    meta = {slug: {"title": d["title"], "breadcrumbs": d["breadcrumbs"]} for slug, d in docs.items()}
    parts.append(f'<script id="docs-meta" type="application/json">{json.dumps(meta, ensure_ascii=False)}</script>')
    # 각 마크다운 본문
    for slug, d in docs.items():
        body = safe_markdown(d["markdown"])
        parts.append(f'<script id="doc-{slug}" type="text/markdown">\n{body}\n</script>')
    return "\n".join(parts)


def render_welcome_cards(tree) -> str:
    cards = []
    for section in SECTION_ORDER:
        items = tree.get(section, [])
        if not items:
            continue
        sec_label = kor(section)
        # 섹션의 첫 문서로 진입
        first_slug = None
        for item in items:
            if item["kind"] == "file":
                first_slug = slugify([section, item["stem"]])
                break
            else:
                for sub in item["items"]:
                    parents = sub.get("parent_chain", [])
                    first_slug = slugify([section, item["name"], *parents, sub["stem"]])
                    break
                if first_slug:
                    break
        if not first_slug:
            continue
        n_docs = sum(1 if it["kind"] == "file" else len(it["items"]) for it in items)
        cards.append(
            f'<a class="card" href="#{first_slug}"><div class="card-title">{html.escape(sec_label)}</div>'
            f'<div class="card-meta">문서 {n_docs}건</div></a>'
        )
    return "".join(cards)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    img_map = copy_images()
    tree = collect_docs()
    nav_html, docs = build_nav_and_docs(tree, img_map)
    scripts_html = render_scripts(docs)
    welcome_cards = render_welcome_cards(tree)

    html_out = HTML_TEMPLATE.replace("__CARDS__", welcome_cards).replace("__SCRIPTS__", scripts_html)
    # nav 는 app.js 에서 주입하지 않고 미리 렌더 (검색 동작용)
    html_out = html_out.replace('<nav id="nav" class="nav"></nav>', f'<nav id="nav" class="nav">{nav_html}</nav>')

    (OUT / "index.html").write_text(html_out, encoding="utf-8")
    print(f"[OK] {OUT / 'index.html'} ({len(docs)} docs, {len(img_map)//2} images)")


if __name__ == "__main__":
    main()
