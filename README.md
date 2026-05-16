# 송범규 웹툰 기획 · 2차 초안

인지·차원·무속 세계관 기반 웹툰의 2차 기획 초안과 그것을 열람할 수 있는 정적 사이트입니다.

## 폴더 구조

```
.
├── second_draft/      # 기획 원본 (마크다운 + 캐릭터 이미지 에셋)
│   ├── 01_worldview/
│   ├── 02_character_persona/
│   ├── 03_art_direction/
│   ├── 04_story_arc/
│   ├── 05_episode_draft/
│   ├── 06_character_assets/    # 캐릭터별 이미지/프롬프트/일관성 체크
│   ├── 07_storyboard/
│   ├── 99_review_revision_notes/
│   └── 콘티/
├── second_web/        # 위 내용을 한국어 라벨 + 검색 + 갤러리로 묶은 정적 사이트
│   ├── build.js       # 마크다운 → HTML 사전 렌더 빌드
│   ├── server.js      # 로컬 미리보기 서버 (Node 내장 모듈만 사용)
│   ├── app.js, styles.css
│   ├── vendor/marked.min.js   # 빌드 전용 (브라우저에 로드 안 함)
│   └── package.json
├── vercel.json        # Vercel 배포 설정 (root에서 second_web 빌드)
└── .gitignore
```

## 로컬에서 보기

```bash
cd second_web
node server.js --open       # http://127.0.0.1:5173/ 자동 열기
# 또는
npm run dev                 # watch + 자동 재빌드 + 브라우저 오픈
```

## 빌드만

```bash
cd second_web
node build.js               # second_draft → second_web/index.html 재생성
```

## Vercel 배포

`vercel.json` 이 root에 있어서 Vercel은 자동으로:

- Build Command: `node second_web/build.js`
- Output Directory: `second_web`
- 캐시 헤더: `/assets/*` 1년, JS/CSS는 짧게

`main` 브랜치에 push 시 자동 재빌드/재배포됩니다.

## 기획 시스템 노트

- 폴더 영문명(예: `01_worldview`, `core_concept.md`)은 모두 사이트에서 한국어 라벨로 표시됩니다. 매핑은 [second_web/build.js](second_web/build.js)의 `LABEL` 객체에서 관리합니다.
- `06_character_assets/{캐릭터}/images/`에 이미지를 추가하고 다시 빌드하면, 사이드바의 **비주얼 갤러리** 페이지와 해당 캐릭터의 페르소나/에셋 페이지 상단에 자동으로 노출됩니다.

## 라이선스

비공개 작업 자료입니다. 외부 인용 시 작가(송범규) 사전 동의가 필요합니다.
