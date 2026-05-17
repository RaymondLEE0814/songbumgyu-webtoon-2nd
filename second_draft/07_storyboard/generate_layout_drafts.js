const fs = require("fs");
const path = require("path");

const WIDTH = 720;

const prologuePanels = [
  ["01", 1000, "정박", "밝은 출근길 도시 UI", "사거리 와이드", "삑. 삑. 삑.", "햇빛, 유리 반사, 카페, 버스", "city"],
  ["02", 800, "정박", "인파 속 출근 중인 서윤", "서윤 미디엄", "알아요. 가는 중이에요.", "08:42, 방송국 출입증", "person"],
  ["03", 750, "정박", "정상 카운트다운", "신호등 클로즈업", "17, 16, 15", "노이즈 금지", "signal"],
  ["04", 850, "정박", "모두 같은 박자로 걷기", "횡단보도 측면", "", "질서와 반복 강조", "crosswalk"],
  ["05", 300, "엇박", "서윤의 감각 반응", "눈 극단 클로즈업", "삑.", "리듬 절단", "eye"],
  ["06", 1300, "엇박", "회색 재킷 남자 프레임 지연", "인파 대각선", "아니.", "귀신화 금지, 레이어 밀림", "delay"],
  ["07", 200, "강한 엇박", "신호등 02:17", "숫자 클로즈업", "무음", "짧고 날카롭게", "signalError"],
  ["white_01", 900, "침묵", "화이트아웃", "흰 공백", "", "밝은 불안", "white"],
  ["08", 900, "정박 복귀", "정상 복귀, 서윤만 정지", "횡단보도 중간", "방금...", "행인이 어깨 스침", "crosswalkStop"],
  ["09", 1600, "느린 확대", "햇빛 속 픽셀 먼지", "서윤 시점", "오늘은 아니라고 했잖아.", "밝은 데이터 누출", "pixelDust"],
  ["10", 650, "얇은 확인", "손목 픽셀 무늬", "손목 클로즈업", "삐----", "이명 텍스트 여백 침범", "wrist"],
  ["11", 850, "정박", "카메라에는 정상 거리", "휴대폰 오버숄더", "또 안 찍혔네.", "반복 기록 실패", "phoneCamera"],
  ["12", 950, "단서", "폐역_제보영상_1999.mp4", "휴대폰 클로즈업", "02:17 점멸", "본편 연결 단서", "phoneFile"],
  ["13", 1200, "정박", "아무 일 없는 사거리", "뒤쪽 와이드", "샜어.", "서윤만 현상 명명", "cityNormal"],
  ["14", 700, "잔상", "횡단보도 아래 ...역", "횡단보도 클로즈업", "...역", "폐역명 비공개", "stationTrace"],
  ["15", 500, "정지", "숫자 0, 완전 정상화", "신호등/횡단보도", "프롤로그 끝", "짧게 종료", "end"],
];

const ep01Panels = [
  ["01", 900, "정박", "폐역_제보영상_1999.mp4 재생 준비", "회의실 와이드", "제보 영상부터 볼게요.", "프롤로그 파일 알림 연결", "meeting"],
  ["02", 750, "정박", "동료들은 무관심, 서윤만 집중", "회의실 측면", "", "정상 업무 UI", "meetingSide"],
  ["03", 900, "정박", "폐역 CCTV, 작은 여자 형체", "모니터 클로즈업", "귀신이면 움직여야지.", "02:16:58", "cctv"],
  ["04", 650, "미세 엇박", "02:17:00, 윤곽 한 박자 지연", "CCTV 타임코드", "지직", "프롤로그 현상 반복", "cctvDelay"],
  ["05", 300, "강한 엇박", "화이트아웃", "모니터 전체", "무음", "블랙아웃 금지", "white"],
  ["06", 1300, "누출", "02:17, 폐역, 횡단보도, 교복", "흰 화면 중첩", "도...착...", "설명 없이 겹침", "whiteLeak"],
  ["07", 800, "정박 복귀", "팀장은 재생 오류로 인식", "회의실", "계속 틀어보세요.", "서윤은 확인 요구", "meetingReturn"],
  ["08", 700, "얇은 확인", "손목 픽셀 무늬", "손목 클로즈업", "횡단보도랑 같은 패턴.", "프롤로그 연결", "wrist"],
  ["09", 850, "정박", "사건 단어 정리", "회의 자료", "오늘 원본 먼저 확인하고요.", "다음 행동 목표", "notes"],
  ["10", 900, "단서", "업로더 없음, 02:17 고정", "파일 정보 창", "업로더가 없어요.", "파일 자체 이상", "fileInfo"],
  ["11", 800, "짧은 엇박", "직원 그림자 프레임 지연", "유리벽 너머", "사무실까지.", "현상 확산", "officeDelay"],
  ["12", 1000, "정박", "골든아워 지상 구간, 생활감 있는 승객들", "밝은 지상철 와이드", "덜컹. 덜컹. / 작은 대화", "어두운 지하철 톤 회피", "sunTrain"],
  ["13", 750, "정박", "폐역 / 02:17 / 1999 / 원본 확인", "봉투 클로즈업", "움직인 게 아니라, 밀렸어.", "패턴 분석", "folder"],
  ["14", 800, "정박", "운동화, 햇빛, 창문 프레임 그림자", "밝은 바닥 앵글", "", "평범한 오후 이동감", "sunFeet"],
  ["15", 200, "강한 엇박", "햇빛 플레어 속 02:17 겹침", "안내 모니터+창 반사", "무음", "눈부심처럼 시작", "flare"],
  ["white_01", 1200, "침묵", "햇빛 먼지 같은 픽셀 입자", "따뜻한 흰 공백", "", "어둡게 가라앉히지 않기", "whiteDust"],
  ["16", 2400, "누출", "밝은 가장자리부터 풀리는 바코드/하얀 픽셀", "승객 정면", "삐----", "괴물화 금지, 반사처럼", "brightPassenger"],
  ["17", 900, "폴리리듬", "폐역/교복 자락/승차권/아이 손/횡단보도", "반투명 정보 중첩", "도...착... / 2:17 / 기억하지...", "창문 반사처럼 얇게", "overlay"],
  ["18", 500, "얇은 확인", "휴대폰 녹화 시도", "서윤 얼굴", "이번엔 찍혀야지.", "기록자 성격", "record"],
  ["19", 850, "정박 복귀", "정상 안내방송, 녹화 실패", "열린 문", "이번 역은...", "과노출 흰 썸네일", "door"],
  ["20", 1000, "불안정 정박", "픽셀 가루가 스며듦", "발밑", "...또 샜어.", "물리 흔적 전 단계", "floorDust"],
  ["21", 850, "물증", "오래된 승차권 조각", "바닥 클로즈업", "1999 / 02:17", "폐역명 일부", "ticket"],
  ["22", 700, "훅", "저장명 없는 번호 경고 문자", "휴대폰 화면", "그쪽도 기록됩니다.", "발신자 정체 미공개", "message"],
];

const configs = [
  {
    name: "프롤로그",
    slug: "prologue_crosswalk_ui_leak",
    title: "프롤로그 구성도 초안: 횡단보도 UI 누출",
    purpose: "밝은 출근길 횡단보도에서 현실 UI가 한 박자 늦고 02:17 오류가 새는 흐름을 세로 스크롤 러프로 확인한다.",
    outDir: path.join(__dirname, "prologue_crosswalk_ui_leak", "layout_draft"),
    panels: prologuePanels,
  },
  {
    name: "EP01",
    slug: "ep01_filter_leak",
    title: "EP01 구성도 초안 v2: 필터의 누출",
    purpose: "프롤로그 파일 알림에서 방송국 회의실, 밝은 골든아워 지상철, 승차권 물증까지 이어지는 22컷 구조를 세로 스크롤 러프로 확인한다.",
    outDir: path.join(__dirname, "ep01_filter_leak", "layout_draft"),
    panels: ep01Panels,
  },
];

function esc(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function wrapText(text, maxChars = 20) {
  const raw = String(text || "");
  const parts = raw.split(/\s+/).flatMap((part) => {
    if (part.length <= maxChars) return [part];
    const chunks = [];
    for (let i = 0; i < part.length; i += maxChars) chunks.push(part.slice(i, i + maxChars));
    return chunks;
  });
  const lines = [];
  let line = "";
  for (const part of parts) {
    const next = line ? `${line} ${part}` : part;
    if (next.length > maxChars && line) {
      lines.push(line);
      line = part;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 5);
}

function textLines(text, x, y, opts = {}) {
  const size = opts.size || 24;
  const fill = opts.fill || "#1f2933";
  const anchor = opts.anchor || "middle";
  const weight = opts.weight ? ` font-weight="${opts.weight}"` : "";
  return wrapText(text, opts.maxChars || 22)
    .map((line, idx) => `<text x="${x}" y="${y + idx * (size + 8)}" font-size="${size}" text-anchor="${anchor}" fill="${fill}" font-family="Arial, 'Malgun Gothic', sans-serif"${weight}>${esc(line)}</text>`)
    .join("");
}

function panelFrame(panel) {
  const [id, height, rhythm, title, shot, dialogue, note, type] = panel;
  const fill = type.includes("white") ? "#fffdf5" : "#fbfbf7";
  const stroke = rhythm.includes("엇박") || rhythm.includes("누출") || rhythm.includes("폴리") ? "#ec6f35" : "#222";
  return [
    `<rect x="0" y="0" width="${WIDTH}" height="${height}" fill="${fill}"/>`,
    `<rect x="18" y="18" width="${WIDTH - 36}" height="${height - 36}" fill="none" stroke="${stroke}" stroke-width="4"/>`,
    `<text x="34" y="56" font-size="19" font-weight="700" fill="#111" font-family="Arial, 'Malgun Gothic', sans-serif">${esc(id)} / ${esc(rhythm)} / ${height}px</text>`,
    textLines(title, WIDTH / 2, height - 92, { size: 22, weight: "700", maxChars: 24 }),
    textLines(shot, WIDTH / 2, height - 44, { size: 16, fill: "#667085", maxChars: 26 }),
    dialogue ? `<text x="${WIDTH - 34}" y="58" font-size="22" text-anchor="end" font-weight="700" fill="#111" font-family="Arial, 'Malgun Gothic', sans-serif">${esc(dialogue)}</text>` : "",
    note ? textLines(note, 36, height - 44, { size: 14, fill: "#6b7280", anchor: "start", maxChars: 30 }) : "",
  ].join("");
}

function drawVisual(panel) {
  const [id, height, rhythm, title, shot, dialogue, note, type] = panel;
  const midY = height / 2;
  const commonSun = `<circle cx="610" cy="110" r="46" fill="#ffd166" opacity=".65"/><path d="M80 160 C260 80 470 80 680 150" stroke="#ffd166" stroke-width="18" opacity=".25" fill="none"/>`;
  if (type === "white" || type === "whiteDust") {
    const dust = Array.from({ length: 22 }, (_, i) => {
      const x = 70 + ((i * 97) % 570);
      const y = 100 + ((i * 149) % Math.max(120, height - 180));
      return `<rect x="${x}" y="${y}" width="5" height="5" fill="#f2c94c" opacity=".35"/>`;
    }).join("");
    return `<rect x="0" y="0" width="${WIDTH}" height="${height}" fill="#fffdf3"/>${dust}${textLines(title, WIDTH / 2, midY, { size: 32, weight: "700", maxChars: 18 })}`;
  }
  if (type.includes("signal")) {
    const value = type === "signalError" ? "02:17" : "17  16  15";
    return `${commonSun}<rect x="230" y="${midY - 120}" width="260" height="160" rx="12" fill="#222"/><text x="360" y="${midY - 18}" font-size="${type === "signalError" ? 60 : 42}" text-anchor="middle" fill="#7cff88" font-family="Arial, sans-serif" font-weight="700">${value}</text>`;
  }
  if (type.includes("phone") || type === "message" || type === "fileInfo") {
    return `<rect x="250" y="${midY - 210}" width="220" height="420" rx="28" fill="#111"/><rect x="270" y="${midY - 175}" width="180" height="350" rx="8" fill="#f8fafc"/><rect x="292" y="${midY - 122}" width="136" height="84" fill="#e5e7eb"/><text x="360" y="${midY - 80}" font-size="18" text-anchor="middle" fill="#111" font-family="Arial, 'Malgun Gothic', sans-serif">${esc(title).slice(0, 18)}</text><text x="360" y="${midY + 55}" font-size="28" text-anchor="middle" fill="#ef4444" font-family="Arial, sans-serif" font-weight="700">02:17</text>`;
  }
  if (type.includes("meeting") || type === "notes") {
    return `${commonSun}<rect x="100" y="${midY - 70}" width="520" height="170" rx="10" fill="#f2f4f7" stroke="#cbd5e1"/><rect x="185" y="${midY - 245}" width="350" height="190" fill="#111"/><rect x="207" y="${midY - 220}" width="306" height="140" fill="#f8fafc"/><text x="360" y="${midY - 140}" font-size="24" text-anchor="middle" fill="#111" font-family="Arial, 'Malgun Gothic', sans-serif">${esc(title).slice(0, 22)}</text><circle cx="210" cy="${midY + 60}" r="28" fill="#6b7280"/><circle cx="500" cy="${midY + 55}" r="28" fill="#9ca3af"/>`;
  }
  if (type.includes("cctv")) {
    return `<rect x="86" y="${midY - 210}" width="548" height="350" fill="#1f2933"/><rect x="130" y="${midY - 170}" width="460" height="250" fill="#d1d5db"/><text x="360" y="${midY - 120}" font-size="24" text-anchor="middle" fill="#111" font-family="Arial, sans-serif">1999.07.18</text><text x="360" y="${midY - 84}" font-size="34" text-anchor="middle" fill="#ef4444" font-family="Arial, sans-serif" font-weight="700">${type === "cctvDelay" ? "02:17:00" : "02:16:58"}</text><path d="M360 ${midY - 30} l28 90 h-56 z" fill="#111" opacity=".55"/><path d="M390 ${midY - 26} l28 90 h-56 z" fill="#ef4444" opacity=".25"/>`;
  }
  if (type.includes("Train") || type === "sunFeet" || type === "flare" || type === "door") {
    return `${commonSun}<rect x="40" y="${midY - 220}" width="640" height="360" rx="18" fill="#f8fafc" stroke="#94a3b8" stroke-width="3"/><rect x="80" y="${midY - 170}" width="180" height="120" fill="#dbeafe"/><rect x="460" y="${midY - 170}" width="180" height="120" fill="#dbeafe"/><path d="M70 ${midY + 120} L650 ${midY - 100}" stroke="#ffd166" stroke-width="24" opacity=".35"/><circle cx="230" cy="${midY + 28}" r="32" fill="#6b7280"/><circle cx="490" cy="${midY + 28}" r="32" fill="#9ca3af"/>${type === "flare" ? `<text x="360" y="${midY}" font-size="62" text-anchor="middle" fill="#ef4444" font-family="Arial, sans-serif" font-weight="700" opacity=".75">02:17</text>` : ""}`;
  }
  if (type === "brightPassenger" || type === "overlay" || type === "delay" || type === "pixelDust") {
    const blocks = Array.from({ length: 34 }, (_, i) => {
      const x = 270 + ((i * 37) % 190);
      const y = midY - 180 + ((i * 53) % 320);
      return `<rect x="${x}" y="${y}" width="${8 + (i % 4) * 5}" height="8" fill="${i % 3 ? "#38bdf8" : "#fbbf24"}" opacity=".55"/>`;
    }).join("");
    return `${commonSun}<ellipse cx="360" cy="${midY - 55}" rx="74" ry="90" fill="#d1d5db"/><rect x="290" y="${midY + 20}" width="140" height="220" rx="42" fill="#cbd5e1"/>${blocks}<path d="M250 ${midY - 180} C380 ${midY - 80} 470 ${midY + 130} 610 ${midY + 190}" stroke="#fff" stroke-width="22" opacity=".65" fill="none"/>`;
  }
  if (type === "wrist" || type === "record" || type === "person" || type === "eye") {
    return `${commonSun}<circle cx="360" cy="${midY - 100}" r="76" fill="#d6b28d"/><rect x="300" y="${midY - 20}" width="120" height="230" rx="38" fill="#374151"/><rect x="430" y="${midY + 30}" width="120" height="36" rx="18" fill="#d6b28d"/><text x="492" y="${midY + 58}" font-size="16" text-anchor="middle" fill="#ef4444" font-family="Arial, sans-serif">PIXEL</text>`;
  }
  if (type === "ticket" || type === "stationTrace" || type === "floorDust") {
    return `<rect x="0" y="0" width="${WIDTH}" height="${height}" fill="#f6f3ee"/><path d="M120 ${midY + 80} C260 ${midY + 25} 390 ${midY + 40} 600 ${midY - 30}" stroke="#e5e7eb" stroke-width="80"/><rect x="245" y="${midY - 90}" width="230" height="126" rx="8" fill="#f8fafc" stroke="#6b7280" stroke-dasharray="12 8"/><text x="360" y="${midY - 35}" font-size="38" text-anchor="middle" fill="#111" font-family="Arial, sans-serif" font-weight="700">1999</text><text x="360" y="${midY + 12}" font-size="30" text-anchor="middle" fill="#ef4444" font-family="Arial, sans-serif">02:17</text>`;
  }
  return `${commonSun}<rect x="90" y="${midY - 150}" width="540" height="260" rx="14" fill="#f3f4f6" stroke="#cbd5e1"/><text x="360" y="${midY}" font-size="28" text-anchor="middle" fill="#111" font-family="Arial, 'Malgun Gothic', sans-serif">${esc(title).slice(0, 24)}</text>`;
}

function panelSvg(panel) {
  const [, height] = panel;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${height}" viewBox="0 0 ${WIDTH} ${height}">
  <title>${esc(panel[0])} ${esc(panel[3])}</title>
  ${panelFrame(panel)}
  ${drawVisual(panel)}
</svg>
`;
}

function pageSvg(config) {
  const total = config.panels.reduce((sum, panel) => sum + panel[1], 0);
  let y = 0;
  const body = config.panels
    .map((panel) => {
      const svg = panelSvg(panel)
        .replace(/^<svg[^>]*>/, `<g transform="translate(0 ${y})">`)
        .replace(/<\/svg>\s*$/, "</g>");
      y += panel[1];
      return svg;
    })
    .join("\n");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${total}" viewBox="0 0 ${WIDTH} ${total}">
  <title>${esc(config.title)}</title>
  ${body}
</svg>
`;
}

function htmlBoard(config) {
  const rows = config.panels
    .map((panel) => {
      const id = panel[0];
      const filename = `${id.startsWith("white") ? id : `panel_${id}`}.svg`;
      return `<section class="panel"><h2>${esc(id)}. ${esc(panel[3])}</h2><p>${esc(panel[2])} / ${panel[1]}px / ${esc(panel[4])}</p><img src="images/${filename}" alt="${esc(panel[3])}"></section>`;
    })
    .join("\n");
  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(config.title)}</title>
  <style>
    body { margin: 0; background: #e9edf2; font-family: Arial, 'Malgun Gothic', sans-serif; color: #111827; }
    header { max-width: 920px; margin: 0 auto; padding: 28px 20px 16px; }
    main { width: ${WIDTH}px; max-width: 100%; margin: 0 auto 64px; background: white; box-shadow: 0 12px 30px rgba(15, 23, 42, .18); }
    h1 { margin: 0 0 8px; font-size: 24px; }
    p { line-height: 1.55; }
    .panel { border-bottom: 12px solid #e9edf2; }
    .panel h2 { margin: 0; padding: 14px 18px 2px; font-size: 17px; }
    .panel p { margin: 0; padding: 0 18px 12px; color: #667085; font-size: 13px; }
    img { display: block; width: 100%; height: auto; }
    a { color: #2563eb; }
  </style>
</head>
<body>
  <header>
    <h1>${esc(config.title)}</h1>
    <p>${esc(config.purpose)}</p>
    <p><a href="full_scroll_layout.svg">전체 스크롤 SVG 보기</a></p>
  </header>
  <main>${rows}</main>
</body>
</html>
`;
}

function readme(config) {
  const total = config.panels.reduce((sum, panel) => sum + panel[1], 0);
  const normalPanels = config.panels.filter((panel) => !panel[0].startsWith("white")).length;
  const whitespace = config.panels.filter((panel) => panel[0].startsWith("white")).length;
  const table = config.panels
    .map((panel) => `| ${panel[0]} | ${panel[1]}px | ${panel[2]} | ${panel[3]} | ${panel[5] || ""} |`)
    .join("\n");
  return `# ${config.title}

## 목적
${config.purpose}

## 구성 기준
- 기준 폭: ${WIDTH}px
- 총 세로 길이: ${total}px
- 본 컷: ${normalPanels}컷
- 연출 여백: ${whitespace}구간
- 이미지 형식: SVG 러프 스케치

## 사용 방법
- \`layout_board.html\`: 컷별 SVG를 순서대로 확인하는 보드.
- \`full_scroll_layout.svg\`: 전체 컷을 한 장으로 이어 붙인 스크롤 구성 이미지.
- \`images/\`: 컷별 러프 스케치 SVG.
- \`dialogue_table.tsv\`: 대사/효과음 확인용 표.

## 컷별 목록
| 컷 | 세로 | 리듬 | 화면 핵심 | 대사/텍스트 |
|---|---:|---|---|---|
${table}
`;
}

function dialogueTable(config) {
  return ["id\theight\trhythm\ttitle\tshot\tdialogue_or_sfx\tnote"]
    .concat(config.panels.map((panel) => panel.slice(0, 7).join("\t")))
    .join("\n") + "\n";
}

function ensureCleanDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
  fs.rmSync(path.join(dir, "images"), { recursive: true, force: true });
  fs.mkdirSync(path.join(dir, "images"), { recursive: true });
}

for (const config of configs) {
  ensureCleanDir(config.outDir);
  for (const panel of config.panels) {
    const id = panel[0];
    const filename = `${id.startsWith("white") ? id : `panel_${id}`}.svg`;
    fs.writeFileSync(path.join(config.outDir, "images", filename), panelSvg(panel), "utf8");
  }
  fs.writeFileSync(path.join(config.outDir, "full_scroll_layout.svg"), pageSvg(config), "utf8");
  fs.writeFileSync(path.join(config.outDir, "layout_board.html"), htmlBoard(config), "utf8");
  fs.writeFileSync(path.join(config.outDir, "dialogue_table.tsv"), dialogueTable(config), "utf8");
  fs.writeFileSync(path.join(config.outDir, "README.md"), readme(config), "utf8");
}
