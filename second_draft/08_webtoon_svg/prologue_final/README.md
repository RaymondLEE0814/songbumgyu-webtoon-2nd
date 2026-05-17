# 프롤로그 최종 웹툰 SVG

이미지 생성 모델로 만든 프롤로그 웹툰 시트를 기반으로 구성한 최종 SVG 초안입니다.

## 파일
- `prologue_webtoon_final.svg`: 프로젝트 내부에서 보기 좋은 일반 SVG. `assets/prologue_ai_generated_sheet.png`를 참조합니다.
- `prologue_webtoon_final_embedded.svg`: 이미지가 SVG 안에 base64로 포함된 단일 파일 버전입니다.
- `prologue_webtoon_dialogue.svg`: 대사와 효과음을 더 명확하게 넣은 일반 SVG 버전입니다.
- `prologue_webtoon_dialogue_embedded.svg`: 대사 강화판의 단일 파일 버전입니다.
- `index.html`: 브라우저에서 웹툰처럼 스크롤하며 보기 위한 확인용 HTML입니다.
- `dialogue_index.html`: 대사 강화판 확인용 HTML입니다.
- `assets/prologue_ai_generated_sheet.png`: 이미지 생성 모델로 만든 원본 웹툰 시트입니다.
- `make_prologue_final_svg.js`: SVG 재생성 스크립트입니다.
- `make_prologue_dialogue_svg.js`: 대사 강화판 SVG 재생성 스크립트입니다.

## 구성
- 폭: 720px
- 총 세로 길이: 10,620px
- 본 컷: 15컷
- 연출 여백: 1구간

## 이미지 생성 프롬프트 요약
밝은 서울 도심 출근길 횡단보도, 한서윤, 인파 속 프레임 지연 남자, 화이트 플레어와 픽셀 먼지를 현대 한국 웹툰 스타일로 생성했습니다. 텍스트와 말풍선은 생성 이미지에 넣지 않고 SVG에서 별도로 배치했습니다.
