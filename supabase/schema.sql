-- ==========================================
-- 大学コミュニティアプリ DB スキーマ
-- Supabase PostgreSQL
-- ==========================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ==========================================
-- universities テーブル
-- ==========================================
create table universities (
  id uuid default uuid_generate_v4() primary key,
  name text not null unique,
  created_at timestamptz default now()
);

-- サンプル大学データ
insert into universities (name) values
  ('東京大学'),
  ('京都大学'),
  ('早稲田大学'),
  ('慶應義塾大学'),
  ('東京工業大学'),
  ('一橋大学'),
  ('大阪大学'),
  ('名古屋大学'),
  ('東北大学'),
  ('北海道大学'),
  ('九州大学'),
  ('神戸大学'),
  ('筑波大学'),
  ('横浜国立大学'),
  ('千葉大学'),
  ('明治大学'),
  ('立命館大学'),
  ('同志社大学'),
  ('青山学院大学'),
  ('中央大学'),
  ('法政大学'),
  ('関西大学'),
  ('関西学院大学'),
  ('立教大学'),
  ('上智大学');

-- ==========================================
-- users テーブル (auth.users と連携)
-- ==========================================
create table users (
  id uuid references auth.users(id) on delete cascade primary key,
  nickname text not null,
  university_id uuid references universities(id),
  faculty text,
  grade text,
  created_at timestamptz default now()
);

-- ==========================================
-- posts テーブル
-- ==========================================
create type post_category as enum (
  'chat',
  'course',
  'easy_pass',
  'exam',
  'circle',
  'part_time',
  'trade',
  'love',
  'event'
);

create table posts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references users(id) on delete cascade not null,
  university_id uuid references universities(id) not null,
  category post_category not null,
  title text not null,
  content text not null,
  tags text[] default '{}',
  anonymous boolean default false,
  likes_count integer default 0,
  comments_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ==========================================
-- comments テーブル
-- ==========================================
create table comments (
  id uuid default uuid_generate_v4() primary key,
  post_id uuid references posts(id) on delete cascade not null,
  user_id uuid references users(id) on delete cascade not null,
  parent_id uuid references comments(id) on delete cascade,
  content text not null,
  anonymous boolean default false,
  likes_count integer default 0,
  created_at timestamptz default now()
);

-- ==========================================
-- likes テーブル
-- ==========================================
create table likes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references users(id) on delete cascade not null,
  post_id uuid references posts(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(user_id, post_id)
);

-- ==========================================
-- comment_likes テーブル
-- ==========================================
create table comment_likes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references users(id) on delete cascade not null,
  comment_id uuid references comments(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(user_id, comment_id)
);

-- ==========================================
-- course_reviews テーブル
-- ==========================================
create table course_reviews (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references users(id) on delete cascade not null,
  university_id uuid references universities(id) not null,
  course_name text not null,
  professor_name text,
  difficulty integer check (difficulty between 1 and 5) not null,
  attendance integer check (attendance between 1 and 5) not null,
  report_amount integer check (report_amount between 1 and 5) not null,
  test_difficulty integer check (test_difficulty between 1 and 5) not null,
  recommendation integer check (recommendation between 1 and 5) not null,
  review_text text,
  created_at timestamptz default now()
);

-- ==========================================
-- インデックス
-- ==========================================
create index idx_posts_university_id on posts(university_id);
create index idx_posts_category on posts(category);
create index idx_posts_created_at on posts(created_at desc);
create index idx_posts_likes_count on posts(likes_count desc);
create index idx_comments_post_id on comments(post_id);
create index idx_comments_parent_id on comments(parent_id);
create index idx_likes_post_id on likes(post_id);
create index idx_course_reviews_university_id on course_reviews(university_id);
-- 日本語全文検索は ilike で代替（supabase に japanese 設定なし）
-- create index idx_posts_search on posts using gin(to_tsvector('simple', title || ' ' || content));

-- ==========================================
-- 自動更新トリガー
-- ==========================================

-- posts の updated_at 自動更新
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger posts_updated_at
  before update on posts
  for each row execute function update_updated_at();

-- likes_count 自動更新
create or replace function update_post_likes_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update posts set likes_count = likes_count + 1 where id = new.post_id;
  elsif TG_OP = 'DELETE' then
    update posts set likes_count = likes_count - 1 where id = old.post_id;
  end if;
  return null;
end;
$$ language plpgsql;

create trigger likes_count_trigger
  after insert or delete on likes
  for each row execute function update_post_likes_count();

-- comments_count 自動更新
create or replace function update_post_comments_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update posts set comments_count = comments_count + 1 where id = new.post_id;
  elsif TG_OP = 'DELETE' then
    update posts set comments_count = comments_count - 1 where id = old.post_id;
  end if;
  return null;
end;
$$ language plpgsql;

create trigger comments_count_trigger
  after insert or delete on comments
  for each row execute function update_post_comments_count();

-- comment_likes_count 自動更新
create or replace function update_comment_likes_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update comments set likes_count = likes_count + 1 where id = new.comment_id;
  elsif TG_OP = 'DELETE' then
    update comments set likes_count = likes_count - 1 where id = old.comment_id;
  end if;
  return null;
end;
$$ language plpgsql;

create trigger comment_likes_count_trigger
  after insert or delete on comment_likes
  for each row execute function update_comment_likes_count();

-- ==========================================
-- Row Level Security (RLS)
-- ==========================================

alter table users enable row level security;
alter table posts enable row level security;
alter table comments enable row level security;
alter table likes enable row level security;
alter table comment_likes enable row level security;
alter table course_reviews enable row level security;

-- users ポリシー
create policy "Users can view all users" on users for select using (true);
create policy "Users can insert own profile" on users for insert with check (auth.uid() = id);
create policy "Users can update own profile" on users for update using (auth.uid() = id);

-- posts ポリシー
create policy "Anyone can view posts" on posts for select using (true);
create policy "Authenticated users can create posts" on posts for insert with check (auth.uid() = user_id);
create policy "Users can update own posts" on posts for update using (auth.uid() = user_id);
create policy "Users can delete own posts" on posts for delete using (auth.uid() = user_id);

-- comments ポリシー
create policy "Anyone can view comments" on comments for select using (true);
create policy "Authenticated users can create comments" on comments for insert with check (auth.uid() = user_id);
create policy "Users can update own comments" on comments for update using (auth.uid() = user_id);
create policy "Users can delete own comments" on comments for delete using (auth.uid() = user_id);

-- likes ポリシー
create policy "Anyone can view likes" on likes for select using (true);
create policy "Authenticated users can like" on likes for insert with check (auth.uid() = user_id);
create policy "Users can unlike own likes" on likes for delete using (auth.uid() = user_id);

-- comment_likes ポリシー
create policy "Anyone can view comment likes" on comment_likes for select using (true);
create policy "Authenticated users can like comments" on comment_likes for insert with check (auth.uid() = user_id);
create policy "Users can unlike own comment likes" on comment_likes for delete using (auth.uid() = user_id);

-- course_reviews ポリシー
create policy "Anyone can view reviews" on course_reviews for select using (true);
create policy "Authenticated users can create reviews" on course_reviews for insert with check (auth.uid() = user_id);
create policy "Users can update own reviews" on course_reviews for update using (auth.uid() = user_id);
create policy "Users can delete own reviews" on course_reviews for delete using (auth.uid() = user_id);

-- ==========================================
-- universities は公開読み取り
-- ==========================================
alter table universities enable row level security;
create policy "Anyone can view universities" on universities for select using (true);

-- ==========================================
-- ユーザー登録時の自動プロフィール作成を無効化
-- (アプリ側で処理)
-- ==========================================
