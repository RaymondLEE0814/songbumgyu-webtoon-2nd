const fs = require("fs");
const path = require("path");

const OUT_DIR = __dirname;
const IMG_DIR = path.join(OUT_DIR, "images");
const WIDTH = 720;

const panels = [
  {
    id: "01",
    height: 800,
    rhythm: "정박",
    title: "늦은 밤 지하철, 서윤 전신",
    sketch: "서윤은 화면 왼쪽 1/3. 오른쪽은 빈 좌석과 반복되는 손잡이.",
    sfx: "덜컹... 덜컹...",
    dialogue: "",
    type: "subway_full",
  },
  {
    id: "02",
    height: 800,
    rhythm: "정박",
    title: "맞은편 승객의 발끝",
    sketch: "낮은 앵글. 발끝과 바닥 패턴만 보이게 평범함 유지.",
    sfx: "",
    dialogue: "",
    type: "feet",
  },
  {
    id: "03",
    height: 800,
    rhythm: "정박",
    title: "폐역 CCTV 제보 사진",
    sketch: "손과 사진 클로즈업. 사진 속 작은 여자 형체는 작지만 선명.",
    sfx: "",
    dialogue: "귀신이면 움직여야지.",
    type: "photo_close",
  },
  {
    id: "04",
    height: 800,
    rhythm: "정박",
    title: "눈 감았다 뜨는 서윤",
    sketch: "손잡이를 쥔 손가락에 힘. 표정은 피곤하고 예민.",
    sfx: "덜컹... 덜컹...",
    dialogue: "",
    type: "hand_face",
  },
  {
    id: "05",
    height: 200,
    rhythm: "엇박",
    title: "형광등 깜빡임",
    sketch: "얇은 컷. 화면 전체에 약한 화이트 노이즈.",
    sfx: "",
    dialogue: "",
    type: "flicker",
  },
  {
    id: "black_01",
    height: 1500,
    rhythm: "정지",
    title: "블랙 여백",
    sketch: "완전한 검정. 독자가 스크롤을 내리며 불편함을 느끼는 호흡 정지.",
    sfx: "",
    dialogue: "",
    type: "black",
  },
  {
    id: "06",
    height: 2500,
    rhythm: "누출",
    title: "노이즈 승객 거대 컷",
    sketch: "중앙의 사람 윤곽이 상단으로 갈수록 바코드, 픽셀, CCTV 블록으로 붕괴.",
    sfx: "삐----",
    dialogue: "",
    type: "noise_passenger",
  },
  {
    id: "07",
    height: 500,
    rhythm: "폴리리듬",
    title: "서윤 눈 클로즈업",
    sketch: "비명보다 관찰. 눈동자 안에 바코드 같은 선 반사.",
    sfx: "",
    dialogue: "",
    type: "eye",
  },
  {
    id: "08",
    height: 600,
    rhythm: "폴리리듬",
    title: "노이즈 내부 단서",
    sketch: "폐역 승강장, 젖은 교복, 찢어진 승차권, 어린아이 손이 겹쳐 보임.",
    sfx: "",
    dialogue: "도...착...",
    type: "fragments",
  },
  {
    id: "09",
    height: 700,
    rhythm: "폴리리듬",
    title: "터널이 정보 구조로 변함",
    sketch: "창밖 검은 터널이 부적 단면 같은 정보 구조로 가득함.",
    sfx: "",
    dialogue: "2:17",
    type: "tunnel_code",
  },
  {
    id: "10",
    height: 300,
    rhythm: "엇박",
    title: "손목 픽셀 무늬",
    sketch: "서윤이 손목을 움켜쥔다. 오래된 상처처럼 픽셀 무늬가 잠깐 뜸.",
    sfx: "",
    dialogue: "아니야. 오늘은 아니야.",
    type: "wrist",
  },
  {
    id: "11",
    height: 800,
    rhythm: "정박 복귀",
    title: "문 열림, 정상 안내방송",
    sketch: "문틈과 서윤 옆얼굴. 바깥 플랫폼은 평범함.",
    sfx: "\"이번 역은...\"",
    dialogue: "",
    type: "door",
  },
  {
    id: "black_02",
    height: 500,
    rhythm: "정지",
    title: "블랙 여백",
    sketch: "정상으로 돌아온 듯하지만 안심하지 못하게 하는 짧은 숨.",
    sfx: "",
    dialogue: "",
    type: "black",
  },
  {
    id: "12",
    height: 1000,
    rhythm: "불안정 정박",
    title: "바닥의 픽셀 가루",
    sketch: "서윤이 내리려는 발밑. 픽셀 가루가 바닥에 흩어져 스며듦.",
    sfx: "",
    dialogue: "...또 샜어.",
    type: "floor_dust",
  },
  {
    id: "13",
    height: 800,
    rhythm: "단서",
    title: "승차권 조각으로 변함",
    sketch: "픽셀 가루가 낡은 승차권 조각으로 변함. 서윤은 즉시 봉투에 넣음.",
    sfx: "",
    dialogue: "1999 / 02:17",
    type: "ticket",
  },
  {
    id: "14",
    height: 600,
    rhythm: "훅",
    title: "박도겸 문자",
    sketch: "휴대폰 화면 클로즈업. 마지막 문장만 살짝 노이즈 처리.",
    sfx: "",
    dialogue: "내일 오지 마십시오. 그 시간에 보면, 그쪽도 기록됩니다.",
    type: "phone",
  },
];

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function esc(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function wrapText(text, max = 15) {
  const normalized = text.trim();
  if (!normalized) return [];
  const lines = [];
  let current = "";
  for (const char of normalized) {
    current += char;
    if (current.length >= max || char === "." || char === " ") {
      lines.push(current.trim());
      current = "";
    }
  }
  if (current.trim()) lines.push(current.trim());
  return lines;
}

function textBlock(lines, x, y, size = 24, fill = "#111", anchor = "start") {
  return lines
    .map((line, index) => {
      return `<text x="${x}" y="${y + index * (size + 8)}" font-size="${size}" text-anchor="${anchor}" fill="${fill}" font-family="Arial, 'Malgun Gothic', sans-serif">${esc(line)}</text>`;
    })
    .join("\n");
}

function bubble(text, x, y, width, size = 24) {
  const lines = wrapText(text, Math.max(9, Math.floor(width / (size * 0.72))));
  const height = Math.max(64, lines.length * (size + 8) + 28);
  return `
  <g>
    <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="18" fill="#fff" stroke="#111" stroke-width="3"/>
    ${textBlock(lines, x + width / 2, y + 34, size, "#111", "middle")}
  </g>`;
}

function label(panel) {
  return `
  <g opacity="0.92">
    <rect x="18" y="18" width="260" height="64" fill="#fff" stroke="#111" stroke-width="2"/>
    <text x="34" y="44" font-size="20" font-weight="700" font-family="Arial, 'Malgun Gothic', sans-serif">CUT ${esc(panel.id)}</text>
    <text x="34" y="68" font-size="15" font-family="Arial, 'Malgun Gothic', sans-serif">${esc(panel.rhythm)} / ${panel.height}px</text>
  </g>`;
}

function subwayFrame(h) {
  return `
  <rect x="42" y="120" width="636" height="${Math.max(260, h - 210)}" fill="#f8f8f8" stroke="#111" stroke-width="4"/>
  <line x1="42" y1="210" x2="678" y2="210" stroke="#111" stroke-width="3"/>
  <line x1="42" y1="${h - 170}" x2="678" y2="${h - 170}" stroke="#111" stroke-width="3"/>
  <rect x="116" y="250" width="120" height="64" fill="#e9e9e9" stroke="#111" stroke-width="3"/>
  <rect x="246" y="250" width="120" height="64" fill="#e9e9e9" stroke="#111" stroke-width="3"/>
  <rect x="376" y="250" width="120" height="64" fill="#e9e9e9" stroke="#111" stroke-width="3"/>
  <rect x="506" y="250" width="120" height="64" fill="#e9e9e9" stroke="#111" stroke-width="3"/>
  <line x1="360" y1="120" x2="360" y2="${h - 170}" stroke="#111" stroke-width="2" opacity="0.4"/>`;
}

function seoyun(x, y, scale = 1) {
  return `
  <g transform="translate(${x} ${y}) scale(${scale})" stroke="#111" stroke-width="4" fill="none">
    <circle cx="0" cy="-90" r="36" fill="#fff"/>
    <path d="M-22 -125 Q0 -155 25 -122" />
    <line x1="0" y1="-54" x2="-10" y2="70"/>
    <line x1="-10" y1="-10" x2="-62" y2="34"/>
    <line x1="-6" y1="-2" x2="42" y2="30"/>
    <line x1="-10" y1="70" x2="-48" y2="160"/>
    <line x1="-10" y1="70" x2="28" y2="160"/>
    <rect x="46" y="4" width="52" height="72" fill="#fff"/>
  </g>`;
}

function noiseBlocks(x, y, w, h) {
  const blocks = [];
  for (let row = 0; row < 12; row += 1) {
    for (let col = 0; col < 6; col += 1) {
      if ((row + col) % 3 === 0) continue;
      const bw = 24 + ((row + col) % 4) * 13;
      const bh = 22 + ((row * col + 5) % 5) * 10;
      blocks.push(`<rect x="${x + col * 54}" y="${y + row * 54}" width="${bw}" height="${bh}" fill="${(row + col) % 2 ? "#111" : "#fff"}" stroke="#111" stroke-width="3"/>`);
    }
  }
  return `
  <g>
    <path d="M${x + w / 2} ${y + h} C${x + 80} ${y + h - 300}, ${x + 90} ${y + 220}, ${x + w / 2} ${y}" fill="none" stroke="#111" stroke-width="6" stroke-dasharray="20 12"/>
    ${blocks.join("\n")}
    ${Array.from({ length: 16 }, (_, i) => `<line x1="${x + 20 + i * 20}" y1="${y + 80}" x2="${x + 20 + i * 20}" y2="${y + 420}" stroke="#111" stroke-width="${i % 4 === 0 ? 7 : 2}"/>`).join("\n")}
  </g>`;
}

function scene(panel) {
  const h = panel.height;
  if (panel.type === "black") {
    return `<rect width="${WIDTH}" height="${h}" fill="#000"/>${textBlock([panel.title], WIDTH / 2, h / 2, 28, "#333", "middle")}`;
  }

  const base = `<rect width="${WIDTH}" height="${h}" fill="#fff"/><rect x="10" y="10" width="${WIDTH - 20}" height="${h - 20}" fill="none" stroke="#111" stroke-width="4"/>`;
  const caption = textBlock(wrapText(panel.title, 22), WIDTH / 2, h - 42, 20, "#111", "middle");

  const common = [];
  switch (panel.type) {
    case "subway_full":
      common.push(subwayFrame(h), seoyun(210, h - 330, 1.15));
      common.push(`<path d="M205 170 L205 315" stroke="#111" stroke-width="5"/><circle cx="205" cy="340" r="18" fill="#fff" stroke="#111" stroke-width="4"/>`);
      break;
    case "feet":
      common.push(`<rect x="40" y="105" width="640" height="${h - 180}" fill="#f7f7f7" stroke="#111" stroke-width="4"/>`);
      common.push(Array.from({ length: 8 }, (_, i) => `<line x1="70" y1="${170 + i * 65}" x2="650" y2="${170 + i * 65}" stroke="#aaa" stroke-width="2"/>`).join("\n"));
      common.push(`<path d="M265 430 q45 -30 92 0 l-18 50 h-78 z" fill="#fff" stroke="#111" stroke-width="5"/><path d="M390 430 q45 -30 92 0 l-18 50 h-78 z" fill="#fff" stroke="#111" stroke-width="5"/>`);
      break;
    case "photo_close":
      common.push(`<rect x="92" y="180" width="536" height="360" fill="#f7f7f7" stroke="#111" stroke-width="5" transform="rotate(-4 360 360)"/>`);
      common.push(`<rect x="194" y="245" width="332" height="210" fill="#ddd" stroke="#111" stroke-width="3"/><line x1="194" y1="370" x2="526" y2="370" stroke="#111" stroke-width="2"/><path d="M360 315 l-22 82 h44 z" fill="#111"/>`);
      common.push(`<path d="M100 505 C180 430 240 470 300 540" fill="none" stroke="#111" stroke-width="15" stroke-linecap="round"/>`);
      break;
    case "hand_face":
      common.push(subwayFrame(h), seoyun(360, h - 315, 1.35));
      common.push(`<path d="M280 270 C350 245 430 270 470 340" fill="none" stroke="#111" stroke-width="5"/><circle cx="325" cy="310" r="6"/><circle cx="405" cy="310" r="6"/>`);
      break;
    case "flicker":
      common.push(`<rect x="60" y="70" width="600" height="54" fill="#eee" stroke="#111" stroke-width="4"/>`);
      common.push(Array.from({ length: 90 }, (_, i) => `<circle cx="${20 + (i * 37) % 680}" cy="${35 + (i * 23) % 145}" r="${i % 3 + 1}" fill="#111" opacity="0.25"/>`).join("\n"));
      break;
    case "noise_passenger":
      common.push(subwayFrame(h));
      common.push(noiseBlocks(210, 360, 300, 1620));
      common.push(`<text x="675" y="620" font-size="64" font-family="Arial, sans-serif" transform="rotate(90 675 620)">삐----</text>`);
      common.push(`<text x="55" y="1520" font-size="18" font-family="Arial, sans-serif" transform="rotate(-90 55 1520)">CCTV BLOCK / BARCODE / LOW RESOLUTION LEAK</text>`);
      break;
    case "eye":
      common.push(`<ellipse cx="360" cy="250" rx="260" ry="120" fill="#fff" stroke="#111" stroke-width="6"/><circle cx="360" cy="250" r="74" fill="#fff" stroke="#111" stroke-width="5"/><circle cx="360" cy="250" r="28" fill="#111"/>`);
      common.push(Array.from({ length: 11 }, (_, i) => `<line x1="${272 + i * 17}" y1="190" x2="${292 + i * 13}" y2="310" stroke="#111" stroke-width="${i % 3 + 2}" opacity="0.65"/>`).join("\n"));
      break;
    case "fragments":
      common.push(`<rect x="88" y="110" width="544" height="390" fill="#f5f5f5" stroke="#111" stroke-width="5" stroke-dasharray="18 12"/>`);
      common.push(`<rect x="130" y="170" width="170" height="120" fill="#ddd" stroke="#111" stroke-width="3"/><path d="M390 170 l-40 170 h80 z" fill="none" stroke="#111" stroke-width="5"/><rect x="430" y="330" width="135" height="70" fill="#fff" stroke="#111" stroke-width="4" transform="rotate(-8 500 365)"/><path d="M210 420 q40 -65 80 0" fill="none" stroke="#111" stroke-width="12" stroke-linecap="round"/>`);
      break;
    case "tunnel_code":
      common.push(`<rect x="70" y="120" width="580" height="360" rx="12" fill="#0b0b0b" stroke="#111" stroke-width="5"/>`);
      common.push(Array.from({ length: 18 }, (_, i) => `<path d="M${90 + i * 30} 140 C${140 + i * 10} ${220 + (i % 5) * 30}, ${95 + i * 28} 390, ${170 + i * 18} 455" fill="none" stroke="#fff" stroke-width="${i % 4 + 1}" opacity="0.65"/>`).join("\n"));
      break;
    case "wrist":
      common.push(`<path d="M125 150 C250 110 390 120 585 150" fill="none" stroke="#111" stroke-width="46" stroke-linecap="round"/>`);
      common.push(Array.from({ length: 14 }, (_, i) => `<rect x="${285 + (i % 7) * 20}" y="${126 + Math.floor(i / 7) * 24}" width="15" height="15" fill="#fff" stroke="#111" stroke-width="2"/>`).join("\n"));
      break;
    case "door":
      common.push(`<rect x="90" y="120" width="240" height="520" fill="#fff" stroke="#111" stroke-width="5"/><rect x="390" y="120" width="240" height="520" fill="#f5f5f5" stroke="#111" stroke-width="5"/><path d="M360 120 V640" stroke="#111" stroke-width="8"/>`);
      common.push(seoyun(235, 520, 0.82));
      break;
    case "floor_dust":
      common.push(`<rect x="40" y="110" width="640" height="790" fill="#f9f9f9" stroke="#111" stroke-width="4"/>`);
      common.push(`<path d="M290 210 q40 -35 95 0 l-25 58 h-70 z" fill="#fff" stroke="#111" stroke-width="5"/><path d="M405 210 q40 -35 95 0 l-25 58 h-70 z" fill="#fff" stroke="#111" stroke-width="5"/>`);
      common.push(Array.from({ length: 80 }, (_, i) => `<rect x="${175 + (i * 47) % 360}" y="${410 + (i * 31) % 310}" width="${4 + (i % 5) * 3}" height="${4 + (i % 4) * 3}" fill="#111" opacity="${0.25 + (i % 6) * 0.1}"/>`).join("\n"));
      break;
    case "ticket":
      common.push(`<rect x="165" y="215" width="390" height="210" fill="#fff" stroke="#111" stroke-width="5" transform="rotate(-8 360 320)"/>`);
      common.push(`<text x="252" y="305" font-size="48" font-family="Arial, sans-serif" transform="rotate(-8 360 320)">1999</text><text x="350" y="370" font-size="42" font-family="Arial, sans-serif" transform="rotate(-8 360 320)">02:17</text>`);
      common.push(`<path d="M125 530 C260 450 360 520 470 460" fill="none" stroke="#111" stroke-width="18" stroke-linecap="round"/>`);
      break;
    case "phone":
      common.push(`<rect x="190" y="85" width="340" height="470" rx="38" fill="#fff" stroke="#111" stroke-width="7"/><rect x="220" y="150" width="280" height="330" fill="#f7f7f7" stroke="#111" stroke-width="3"/>`);
      common.push(`<rect x="245" y="210" width="230" height="160" rx="16" fill="#fff" stroke="#111" stroke-width="3"/>`);
      common.push(textBlock(wrapText(panel.dialogue, 12), 360, 250, 21, "#111", "middle"));
      common.push(`<line x1="330" y1="392" x2="455" y2="392" stroke="#111" stroke-width="4" stroke-dasharray="8 5"/>`);
      break;
    default:
      common.push(`<rect x="90" y="120" width="540" height="${h - 230}" fill="#f7f7f7" stroke="#111" stroke-width="4"/>`);
  }

  if (panel.sfx && panel.type !== "noise_passenger") {
    common.push(`<text x="580" y="118" font-size="28" font-weight="700" font-family="Arial, 'Malgun Gothic', sans-serif">${esc(panel.sfx)}</text>`);
  }
  if (panel.dialogue && panel.type !== "phone") {
    common.push(bubble(panel.dialogue, 70, Math.max(105, h - 190), 410, 24));
  }

  return `${base}${label(panel)}${common.join("\n")}${caption}`;
}

function svg(panel) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${panel.height}" viewBox="0 0 ${WIDTH} ${panel.height}">
  <title>EP01 ${esc(panel.id)} ${esc(panel.title)}</title>
  ${scene(panel)}
</svg>
`;
}

function makeMarkdown() {
  const totalHeight = panels.reduce((sum, panel) => sum + panel.height, 0);
  const rows = panels
    .map((panel) => {
      const file = `images/${panel.id.startsWith("black") ? panel.id : `panel_${panel.id}`}.svg`;
      return `| ${panel.id} | ${panel.height}px | ${panel.rhythm} | ${panel.title} | ${panel.dialogue || panel.sfx || "없음"} | [보기](${file}) |`;
    })
    .join("\n");

  return `# EP01 구성도 초안: 필터의 누출

## 목적
1화 스토리보드를 바탕으로 만든 웹툰 제작용 러프 구성도입니다. 컷별 세로 길이, 대사/효과음 위치, 주요 구도를 먼저 잡기 위한 초안이며 최종 작화 파일이 아닙니다.

## 구성 기준
- 기준 폭: ${WIDTH}px
- 총 세로 길이: ${totalHeight.toLocaleString("ko-KR")}px
- 본 컷: 14컷
- 연출 여백: 2구간
- 이미지 형식: SVG 러프 스케치
- 참고: 원본 \`panel_list.md\`의 예상 전체 길이는 13,700px로 적혀 있으나, 컷별 지정 높이를 실제로 합산하면 13,200px입니다. 이 구성도는 컷별 지정 높이를 우선했습니다.

## 컷별 목록
| 컷 | 세로 | 리듬 | 화면 핵심 | 대사/텍스트 | 스케치 |
|---|---:|---|---|---|---|
${rows}

## 사용 방법
- \`layout_board.html\`: 전체 스크롤 리듬을 확인하는 통합 구성도.
- \`full_scroll_layout.svg\`: 전체 컷을 한 장으로 이어 붙인 스크롤 구성 이미지.
- \`images/\`: 컷별 러프 스케치 이미지 파일.
- \`dialogue_table.tsv\`: 대사/효과음만 따로 확인하는 표.

## 작화 메모
- 정박 구간은 프레임을 반듯하게 유지합니다.
- 누출 구간은 정보 구조가 무너지는 느낌을 우선합니다.
- 노이즈 승객은 귀신이나 괴물이 아니라 깨진 데이터처럼 보여야 합니다.
- 서윤의 반응은 공포보다 관찰과 확인에 가깝게 둡니다.
`;
}

function makeFullSvg() {
  const totalHeight = panels.reduce((sum, panel) => sum + panel.height, 0);
  let y = 0;
  const groups = panels
    .map((panel) => {
      const group = `<g transform="translate(0 ${y})">${scene(panel)}</g>`;
      y += panel.height;
      return group;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${totalHeight}" viewBox="0 0 ${WIDTH} ${totalHeight}">
  <title>EP01 full scroll layout draft</title>
  ${groups}
</svg>
`;
}

function makeHtml() {
  const items = panels
    .map((panel) => {
      const file = `images/${panel.id.startsWith("black") ? panel.id : `panel_${panel.id}`}.svg`;
      return `<section class="panel-card">
  <div class="meta">
    <strong>${esc(panel.id)}</strong>
    <span>${esc(panel.rhythm)}</span>
    <span>${panel.height}px</span>
  </div>
  <img src="${file}" alt="EP01 ${esc(panel.id)} ${esc(panel.title)}">
  <div class="note">
    <h2>${esc(panel.title)}</h2>
    <p>${esc(panel.sketch)}</p>
    ${panel.dialogue ? `<p class="line">대사: ${esc(panel.dialogue)}</p>` : ""}
    ${panel.sfx ? `<p class="line">효과음/텍스트: ${esc(panel.sfx)}</p>` : ""}
  </div>
</section>`;
    })
    .join("\n");

  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>EP01 구성도 초안 - 필터의 누출</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: #d8d8d8;
      color: #111;
      font-family: Arial, "Malgun Gothic", sans-serif;
    }
    header {
      max-width: 900px;
      margin: 0 auto;
      padding: 32px 20px 20px;
    }
    h1 { margin: 0 0 8px; font-size: 28px; }
    header p { margin: 0; line-height: 1.6; }
    main {
      width: min(100%, 760px);
      margin: 0 auto 60px;
      padding: 0 20px 40px;
    }
    .panel-card {
      margin: 18px 0;
      background: #fff;
      border: 1px solid #aaa;
    }
    .meta {
      display: flex;
      gap: 12px;
      align-items: center;
      padding: 10px 12px;
      border-bottom: 1px solid #bbb;
      background: #f6f6f6;
      font-size: 14px;
    }
    .meta strong { font-size: 16px; }
    img {
      display: block;
      width: 100%;
      height: auto;
      background: #fff;
    }
    .note {
      border-top: 1px solid #bbb;
      padding: 12px 14px 16px;
    }
    .note h2 {
      margin: 0 0 6px;
      font-size: 17px;
    }
    .note p {
      margin: 4px 0;
      line-height: 1.55;
      font-size: 14px;
    }
    .line { font-weight: 700; }
  </style>
</head>
<body>
  <header>
    <h1>EP01 구성도 초안: 필터의 누출</h1>
    <p>스토리보드 기반 러프 스케치와 대사 배치 확인용입니다. 최종 작화 전 컷 리듬, 여백, 훅 위치를 점검합니다.</p>
  </header>
  <main>
${items}
  </main>
</body>
</html>
`;
}

function makeDialogueTable() {
  const header = "컷\t세로\t리듬\t화면 핵심\t효과음/텍스트\t대사\t스케치 메모";
  const rows = panels.map((panel) => {
    return [
      panel.id,
      `${panel.height}px`,
      panel.rhythm,
      panel.title,
      panel.sfx || "",
      panel.dialogue || "",
      panel.sketch,
    ]
      .map((value) => String(value).replace(/\t/g, " ").replace(/\n/g, " "))
      .join("\t");
  });
  return [header, ...rows].join("\n") + "\n";
}

ensureDir(IMG_DIR);
for (const panel of panels) {
  const name = panel.id.startsWith("black") ? panel.id : `panel_${panel.id}`;
  fs.writeFileSync(path.join(IMG_DIR, `${name}.svg`), svg(panel), "utf8");
}

fs.writeFileSync(path.join(OUT_DIR, "README.md"), makeMarkdown(), "utf8");
fs.writeFileSync(path.join(OUT_DIR, "layout_board.html"), makeHtml(), "utf8");
fs.writeFileSync(path.join(OUT_DIR, "dialogue_table.tsv"), makeDialogueTable(), "utf8");
fs.writeFileSync(path.join(OUT_DIR, "full_scroll_layout.svg"), makeFullSvg(), "utf8");

console.log(`Generated ${panels.length} layout images in ${IMG_DIR}`);
