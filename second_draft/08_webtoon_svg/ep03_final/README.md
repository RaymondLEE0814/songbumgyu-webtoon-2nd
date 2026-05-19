# EP03 최종 웹툰 SVG

이미지 생성 모델로 만든 3화 웹툰 시트 3장을 기반으로 구성한 최종 SVG입니다.

## 파일
- `ep03_webtoon_final_part_01.svg`: 컷 1~18.
- `ep03_webtoon_final_part_02.svg`: 컷 19~36.
- `ep03_webtoon_final_part_03.svg`: 컷 37~54.
- `ep03_webtoon_final_part_01_embedded.svg`, `part_02_embedded.svg`, `part_03_embedded.svg`: 이미지가 base64로 포함된 단일 파일 버전.
- `index.html`: 브라우저에서 3파트를 이어서 확인하는 HTML.
- `assets/ep03_part_01_ai_generated_sheet.png`, `part_02`, `part_03`: 이미지 생성 모델 원본 에셋.
- `make_ep03_final_svg.js`: SVG 재생성 스크립트.
- `ep03_overlays.json`: 컷 번호, 대사, AI 출력문 위치 데이터.

## 구성
- 총 54컷.
- 파트별 18컷.
- 대사/출력문은 생성 이미지에 직접 넣지 않고 후처리로 배치했다.
