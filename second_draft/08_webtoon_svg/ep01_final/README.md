# EP01 최종 웹툰 SVG

이미지 생성 모델로 만든 1화 웹툰 시트를 기반으로 구성한 최종 SVG 초안입니다.

## 파일
- `ep01_webtoon_final.svg`: 프로젝트 내부에서 보기 좋은 일반 SVG. `assets/ep01_ai_generated_sheet.png`를 참조합니다.
- `ep01_webtoon_final_embedded.svg`: 이미지가 SVG 안에 base64로 포함된 단일 파일 버전입니다.
- `index.html`: 브라우저에서 웹툰처럼 스크롤하며 보기 위한 확인용 HTML입니다.
- `assets/ep01_ai_generated_sheet.png`: 이미지 생성 모델로 만든 원본 웹툰 시트입니다.
- `make_ep01_final_svg.js`: SVG 재생성 스크립트입니다.

## 구성
- 폭: 720px
- 총 세로 길이: 15,260px
- 본 컷: 22컷
- 연출 여백: 1구간

## 이미지 생성 프롬프트 요약
밝은 방송국 회의실, 폐역 CCTV, 화이트아웃 오류, 골든아워 지상철, 햇빛 속 노이즈 승객, 승차권 물증을 현대 한국 웹툰 스타일로 생성했습니다. 말풍선과 핵심 텍스트는 생성 이미지에 넣지 않고 SVG에서 별도로 배치했습니다.
