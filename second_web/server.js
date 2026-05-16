// 로컬 정적 파일 서버 (Node.js 기본 모듈만 사용)
// 사용법:
//   node server.js              → http://localhost:5173
//   node server.js 8080         → 포트 변경
//   node server.js 8080 --open  → 브라우저 자동 열기
//   node server.js --watch      → second_draft 변경 시 자동 재빌드

const http = require("http");
const fs = require("fs");
const path = require("path");
const { spawn, execSync } = require("child_process");
const { URL } = require("url");

const ROOT = __dirname;
const SRC_DRAFT = path.resolve(ROOT, "..", "second_draft");

// ---- 인자 파싱 ----
const args = process.argv.slice(2);
const portArg = args.find((a) => /^\d+$/.test(a));
const PORT = portArg ? parseInt(portArg, 10) : 5173;
const HOST = "127.0.0.1";
const OPEN = args.includes("--open") || args.includes("-o");
const WATCH = args.includes("--watch") || args.includes("-w");

// ---- MIME ----
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
};

// ---- 보안: 경로 traversal 차단 ----
function safeResolve(urlPath) {
  let clean = decodeURIComponent(urlPath.split("?")[0]);
  if (clean === "/" || clean === "") clean = "/index.html";
  // 윈도우/유닉스 경로 모두 안전하게
  const full = path.normalize(path.join(ROOT, clean));
  if (!full.startsWith(ROOT)) return null;
  return full;
}

// ---- 초기 빌드 ----
function runBuildSync() {
  try {
    execSync(`node "${path.join(ROOT, "build.js")}"`, { stdio: "inherit" });
  } catch (e) {
    console.error("[build] failed:", e.message);
  }
}

// ---- 디바운스 감시 ----
let buildTimer = null;
function scheduleBuild() {
  clearTimeout(buildTimer);
  buildTimer = setTimeout(() => {
    console.log("[watch] changes detected → rebuilding...");
    runBuildSync();
  }, 200);
}

function watchSrc() {
  if (!fs.existsSync(SRC_DRAFT)) {
    console.warn(`[watch] ${SRC_DRAFT} 없음. 감시 비활성.`);
    return;
  }
  console.log(`[watch] watching ${SRC_DRAFT}`);
  try {
    fs.watch(SRC_DRAFT, { recursive: true }, (event, filename) => {
      if (!filename) return;
      // 빌드 산출물 자체 변화는 무시
      scheduleBuild();
    });
  } catch (e) {
    console.warn(`[watch] recursive watch 실패 (${e.message}). 수동 재빌드 사용.`);
  }
}

// ---- 서버 ----
function openBrowser(url) {
  const platform = process.platform;
  try {
    if (platform === "win32") {
      spawn("cmd", ["/c", "start", "", url], { stdio: "ignore", detached: true }).unref();
    } else if (platform === "darwin") {
      spawn("open", [url], { stdio: "ignore", detached: true }).unref();
    } else {
      spawn("xdg-open", [url], { stdio: "ignore", detached: true }).unref();
    }
  } catch (_) {}
}

const server = http.createServer((req, res) => {
  const full = safeResolve(req.url || "/");
  if (!full) {
    res.writeHead(400);
    res.end("bad request");
    return;
  }
  fs.stat(full, (err, st) => {
    let target = full;
    if (err) {
      res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      res.end("404 Not Found: " + (req.url || ""));
      return;
    }
    if (st.isDirectory()) target = path.join(full, "index.html");
    fs.readFile(target, (e, buf) => {
      if (e) {
        res.writeHead(404);
        res.end("not found");
        return;
      }
      const ext = path.extname(target).toLowerCase();
      res.writeHead(200, {
        "content-type": MIME[ext] || "application/octet-stream",
        "cache-control": "no-cache",
      });
      res.end(buf);
    });
  });
});

// 부팅 시 자동 빌드 (index.html 없거나 watch 모드)
const indexExists = fs.existsSync(path.join(ROOT, "index.html"));
if (!indexExists || WATCH) runBuildSync();

server.listen(PORT, HOST, () => {
  const url = `http://${HOST}:${PORT}/`;
  console.log("─".repeat(56));
  console.log(`  웹툰 기획 2차 초안 · 로컬 서버`);
  console.log(`  ${url}`);
  console.log(`  종료: Ctrl+C`);
  if (WATCH) console.log(`  watch 모드: second_draft 변경 시 자동 재빌드`);
  console.log("─".repeat(56));
  if (OPEN) openBrowser(url);
  if (WATCH) watchSrc();
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`포트 ${PORT} 이 이미 사용 중입니다. 다른 포트로 실행하세요: node server.js 8080`);
    process.exit(1);
  }
  throw err;
});
