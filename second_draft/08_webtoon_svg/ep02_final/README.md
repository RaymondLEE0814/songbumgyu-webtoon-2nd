# EP02 최종 웹툰 SVG

이미지 생성 모델로 만든 2화 웹툰 시트를 기반으로 구성한 최종 SVG입니다.

## 파일
- `ep02_webtoon_final.svg`: 프로젝트 내부에서 보기 좋은 일반 SVG. `assets/ep02_ai_generated_sheet.png`를 참조합니다.
- `ep02_webtoon_final_embedded.svg`: 이미지가 SVG 안에 base64로 포함된 단일 파일 버전입니다.
- `ep02_webtoon_final_image_model.png`: 같은 대사 오버레이가 적용된 최종 PNG 버전입니다.
- `index.html`: 브라우저에서 웹툰처럼 스크롤하며 보기 위한 확인용 HTML입니다.
- `assets/ep02_ai_generated_sheet.png`: 이미지 생성 모델로 만든 원본 웹툰 시트입니다.
- `make_ep02_final_svg.js`: SVG 재생성 스크립트입니다.

## 구성
- 폭: 821px
- 총 세로 길이: 1,916px
- 본 컷: 이미지 생성 모델 기반 연속 패널
- 대사/출력문: SVG와 PNG 후처리로 별도 배치

## 이미지 생성 프롬프트 요약
윤태하의 새벽 분석실, AI 노이즈 분석 UI, 부적 획, 파형, 폐역 CCTV, 승차권 조각, 서윤과의 첫 통화, `관측자 교체 완료` 훅을 현대 한국 웹툰 스타일로 생성했습니다. 말풍선과 핵심 텍스트는 생성 이미지에 넣지 않고 후처리로 별도로 배치했습니다.
