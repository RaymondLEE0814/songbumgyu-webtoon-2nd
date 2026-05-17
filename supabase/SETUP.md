# Supabase 코멘트 DB 셋업 (5분)

## 1) 프로젝트 생성

1. https://supabase.com 에 GitHub 계정으로 로그인 (RaymondLEE0814 그대로 사용 가능)
2. **New project** 클릭
3. 입력:
   - **Name**: `songbumgyu-webtoon` (자유)
   - **Database Password**: 자동 생성 클릭 → 안전한 곳에 보관 (지금 당장은 안 씀)
   - **Region**: `Northeast Asia (Seoul)` ← 한국 사용자에게 가장 빠름
   - **Plan**: Free
4. **Create new project** 클릭 → 약 1~2분 대기

## 2) 스키마 적용

1. 좌측 메뉴 **SQL Editor** → 우측 상단 **+ New query**
2. `supabase/schema.sql` 파일 내용을 전체 복사해서 붙여넣기
3. 우측 하단 **Run** (또는 `Ctrl+Enter`)
4. "Success. No rows returned" 가 뜨면 OK

## 3) 키 복사

1. 좌측 메뉴 **Project Settings** (톱니바퀴 아이콘) → **API**
2. 두 값을 복사:
   - **Project URL** : `https://xxxxxxx.supabase.co`
   - **anon · public** 키 : `eyJhbGciOi...` 로 시작하는 긴 JWT
3. 채팅창에 두 값을 알려주세요. 동시에 원하시는 **공유 비밀번호** 한 줄도 같이 알려주세요 (예: `songbumgyu2026`).
   - 비밀번호는 SHA-256 해시로 저장되니 평문은 코드에 남지 않습니다.

> ⚠ `service_role` 키는 절대 공유하지 마세요. 우리는 `anon` 키만 씁니다. anon 키는 공개돼도 RLS 로 보호됩니다.

## 4) 받으면 제가 하는 일

- `second_web/config.js` 생성 (URL + anon key + 비밀번호 해시)
- 코멘트 위젯 (`comments.js`) 모든 문서 페이지 하단에 부착
- 메인 페이지에 "최근 코멘트가 달린 문서" 섹션 추가
- 게이트(공유 비밀번호) 모달
- 빌드/푸시 → Vercel 자동 재배포

## 보안 메모

- anon key 는 공개 키입니다. 누가 보든 RLS 정책 안에서만 작동합니다.
- 공유 비밀번호는 "사이트에 들어와 본 사람이 코멘트 폼을 보고 무작정 누르는 것"을 막는 용도입니다. 절대 깰 수 없는 보안은 아닙니다. (작정한 사람은 anon key 로 직접 호출 가능)
- 스팸이 실제로 들어오기 시작하면 Supabase Edge Function 으로 한 단계 더 강화할 수 있습니다.
