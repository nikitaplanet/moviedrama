-- ============================================================
-- 私人放映室 · Supabase Schema
-- 在 Supabase Dashboard → SQL Editor 執行此檔案
-- ============================================================

-- Watchlist 片單
create table if not exists watchlist_entries (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        references auth.users(id) on delete cascade not null,
  title       text        not null,
  title_en    text,
  category    text        not null,
  country     text        not null default '',
  status      text        not null default '待看',
  rating      integer     not null default 0,
  note        text        not null default '',
  year        integer,
  added_at    timestamptz not null default now(),
  created_at  timestamptz not null default now()
);

alter table watchlist_entries enable row level security;

create policy "watchlist: own rows only"
  on watchlist_entries for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Ranking 排行
create table if not exists ranking_entries (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        references auth.users(id) on delete cascade not null,
  title       text        not null,
  title_en    text,
  category    text        not null,
  country     text        not null default '',
  status      text        not null default '看完',
  rating      integer     not null default 0,
  note        text        not null default '',
  year        integer,
  rank_order  integer     not null default 0,
  added_at    timestamptz not null default now(),
  created_at  timestamptz not null default now()
);

alter table ranking_entries enable row level security;

create policy "ranking: own rows only"
  on ranking_entries for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);
