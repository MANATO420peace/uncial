-- ==========================================
-- フォロー・DM 追加スキーマ
-- ==========================================

-- follows テーブル
create table if not exists follows (
  id uuid default uuid_generate_v4() primary key,
  follower_id uuid references users(id) on delete cascade not null,
  following_id uuid references users(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(follower_id, following_id)
);

create index if not exists idx_follows_follower on follows(follower_id);
create index if not exists idx_follows_following on follows(following_id);

alter table follows enable row level security;
create policy "Anyone can view follows" on follows for select using (true);
create policy "Authenticated users can follow" on follows for insert with check (auth.uid() = follower_id);
create policy "Users can unfollow" on follows for delete using (auth.uid() = follower_id);

-- conversations テーブル（1対1 DM）
create table if not exists conversations (
  id uuid default uuid_generate_v4() primary key,
  user1_id uuid references users(id) on delete cascade not null,
  user2_id uuid references users(id) on delete cascade not null,
  last_message_at timestamptz default now(),
  created_at timestamptz default now(),
  unique(user1_id, user2_id)
);

create index if not exists idx_conversations_user1 on conversations(user1_id);
create index if not exists idx_conversations_user2 on conversations(user2_id);

alter table conversations enable row level security;
create policy "Users can view own conversations" on conversations
  for select using (auth.uid() = user1_id or auth.uid() = user2_id);
create policy "Authenticated users can create conversations" on conversations
  for insert with check (auth.uid() = user1_id or auth.uid() = user2_id);

-- messages テーブル
create table if not exists messages (
  id uuid default uuid_generate_v4() primary key,
  conversation_id uuid references conversations(id) on delete cascade not null,
  sender_id uuid references users(id) on delete cascade not null,
  content text not null,
  read_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists idx_messages_conversation on messages(conversation_id);
create index if not exists idx_messages_created_at on messages(conversation_id, created_at desc);

alter table messages enable row level security;
create policy "Users can view messages in own conversations" on messages
  for select using (
    exists (
      select 1 from conversations
      where id = conversation_id
      and (user1_id = auth.uid() or user2_id = auth.uid())
    )
  );
create policy "Users can send messages in own conversations" on messages
  for insert with check (
    auth.uid() = sender_id
    and exists (
      select 1 from conversations
      where id = conversation_id
      and (user1_id = auth.uid() or user2_id = auth.uid())
    )
  );

-- conversations.last_message_at 自動更新
create or replace function update_conversation_last_message()
returns trigger as $$
begin
  update conversations set last_message_at = now() where id = new.conversation_id;
  return new;
end;
$$ language plpgsql;

create trigger messages_update_conversation
  after insert on messages
  for each row execute function update_conversation_last_message();

-- フォロワー数・フォロー数をusersテーブルで管理しない（クエリで集計する）
