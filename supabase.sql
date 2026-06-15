-- VIRTUAL ESCAPE 用テーブル。匿名利用なので anon に insert/select を許可する。
create table if not exists game_sessions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  mock_mode boolean default false,
  time_limit_sec integer default 180,
  completed boolean default false
);

create table if not exists game_answers (
  id uuid primary key default gen_random_uuid(),
  session_id uuid,
  challenge_id text not null,
  category text not null,
  answer_text text,
  score integer not null,
  max_score integer default 20,
  comment text,
  elapsed_sec integer,
  audio_duration_sec numeric,
  average_volume numeric,
  peak_volume numeric,
  silence_ratio numeric,
  volume_variance numeric,
  burst_count integer,
  created_at timestamptz default now()
);

create table if not exists game_results (
  id uuid primary key default gen_random_uuid(),
  session_id text,
  total_score integer not null,
  rank text not null,
  success boolean not null,
  title text,
  ai_comment text,
  created_at timestamptz default now()
);

alter table game_sessions enable row level security;
alter table game_answers enable row level security;
alter table game_results enable row level security;

drop policy if exists "anon insert game_sessions" on game_sessions;
drop policy if exists "anon insert game_answers" on game_answers;
drop policy if exists "anon insert game_results" on game_results;
drop policy if exists "anon select game_results" on game_results;

create policy "anon insert game_sessions" on game_sessions for insert to anon with check (true);
create policy "anon insert game_answers"  on game_answers  for insert to anon with check (true);
create policy "anon insert game_results"  on game_results  for insert to anon with check (true);
create policy "anon select game_results"  on game_results  for select to anon using (true);
