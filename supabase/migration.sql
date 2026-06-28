-- Migration: redesign task types and learned_expressions
-- Run this in Supabase SQL Editor

-- 1. Drop old tasks table and recreate with new types/categories
drop table if exists task_completions cascade;
drop table if exists learned_expressions cascade;
drop table if exists tasks cascade;
drop table if exists activity_logs cascade;

create table tasks (
  id uuid primary key default uuid_generate_v4(),
  type text not null check (type in (
    'rapid_fire_qa',
    'shadowing_drill',
    'video_listening',
    'tech_news_react',
    'podcast_listening',
    'quote_reaction',
    'ai_conversation',
    'devils_advocate',
    'information_gap',
    'news_discussion',
    'phrase_activation',
    'collocation_builder',
    'natural_expression',
    'discourse_marker_drill',
    'social_formula',
    'impromptu_speak',
    'situation_survival'
  )),
  category text not null check (category in ('warmup', 'input', 'interactive', 'expression', 'output')),
  content jsonb not null,
  difficulty int default 1 check (difficulty between 1 and 3),
  created_at timestamptz default now(),
  active boolean default true
);

-- 2. New learned_expressions: phrase-focused, no correction data
create table learned_expressions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  phrase text not null,
  meaning_ja text,
  task_type text,
  created_at timestamptz default now()
);

-- 3. Task completions
create table task_completions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  task_id uuid,
  task_type text not null,
  transcript text,
  completed_at timestamptz default now()
);

-- 4. Activity logs
create table activity_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  task_count int default 0,
  created_at timestamptz default now(),
  unique(user_id, date)
);

-- 5. RLS
alter table task_completions enable row level security;
alter table learned_expressions enable row level security;
alter table activity_logs enable row level security;

create policy "Users own completions" on task_completions for all using (auth.uid() = user_id);
create policy "Users own expressions" on learned_expressions for all using (auth.uid() = user_id);
create policy "Users own activity" on activity_logs for all using (auth.uid() = user_id);
create policy "Tasks readable by authenticated" on tasks for select using (auth.role() = 'authenticated');

-- 6. RPC: increment activity
create or replace function increment_activity(p_date date)
returns void as $$
begin
  insert into activity_logs (user_id, date, task_count)
  values (auth.uid(), p_date, 1)
  on conflict (user_id, date)
  do update set task_count = activity_logs.task_count + 1;
end;
$$ language plpgsql security definer;

-- 7. Seed: placeholder rows for live-fetch task types
-- (tech_news_react, podcast_listening, news_discussion fetch fresh content at runtime)
insert into tasks (type, category, content, difficulty) values
('tech_news_react', 'input', '{"live": true}', 1),
('tech_news_react', 'input', '{"live": true}', 1),
('tech_news_react', 'input', '{"live": true}', 1),
('podcast_listening', 'input', '{"live": true}', 2),
('podcast_listening', 'input', '{"live": true}', 2),
('news_discussion', 'interactive', '{"live": true}', 2),
('news_discussion', 'interactive', '{"live": true}', 2);
