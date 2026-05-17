-- =====================================================================
-- 송범규 웹툰 2차 초안 사이트 · 코멘트 스키마
-- 실행 방법: Supabase 프로젝트 → SQL Editor → New query → 전체 붙여넣고 Run
-- =====================================================================

-- 1) 코멘트 테이블 -----------------------------------------------------
create table if not exists public.comments (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null,                  -- 해당 문서 슬러그 (예: 02_character_persona__한서윤)
  author_name text not null,                  -- 작성자 닉네임 (1~40자)
  body        text not null,                  -- 본문 (1~2000자)
  created_at  timestamptz not null default now(),

  constraint author_len check (char_length(author_name) between 1 and 40),
  constraint body_len   check (char_length(body)        between 1 and 2000)
);

create index if not exists comments_slug_idx        on public.comments (slug);
create index if not exists comments_created_at_idx  on public.comments (created_at desc);

-- 2) 메인 페이지용 활동 요약 뷰 -----------------------------------------
create or replace view public.comment_activity as
select
  slug,
  count(*)::int                                                 as comment_count,
  max(created_at)                                               as last_comment_at,
  (array_agg(author_name order by created_at desc))[1]          as last_author,
  (array_agg(left(body, 140) order by created_at desc))[1]      as last_body_preview
from public.comments
group by slug
order by last_comment_at desc;

-- 3) Row Level Security ------------------------------------------------
alter table public.comments enable row level security;

-- 모두 읽기 허용
drop policy if exists "read_all_comments" on public.comments;
create policy "read_all_comments"
  on public.comments for select
  to anon
  using (true);

-- 작성 허용 (길이 제약은 테이블 check 가 처리)
drop policy if exists "insert_comments" on public.comments;
create policy "insert_comments"
  on public.comments for insert
  to anon
  with check (true);

-- 수정/삭제는 anon 차단 (Supabase 대시보드에서 service role 로만 가능)
-- (정책을 따로 안 만들면 기본적으로 거부됨)

-- 4) 확인 ---------------------------------------------------------------
-- 잘 들어갔는지 보기
-- select * from public.comments limit 5;
-- select * from public.comment_activity limit 20;
