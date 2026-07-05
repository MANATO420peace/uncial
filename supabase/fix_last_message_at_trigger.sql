-- conversations.last_message_at を自動更新するトリガーを再作成
-- Supabase SQL Editorで実行してください

create or replace function update_conversation_last_message()
returns trigger as $$
begin
  update conversations
  set last_message_at = now()
  where id = new.conversation_id;
  return new;
end;
$$ language plpgsql;

-- 既存のトリガーを一旦削除して再作成
drop trigger if exists messages_update_conversation on messages;

create trigger messages_update_conversation
  after insert on messages
  for each row execute function update_conversation_last_message();

-- 既存の会話のlast_message_atを最新メッセージの時刻に修正
update conversations c
set last_message_at = (
  select max(created_at)
  from messages m
  where m.conversation_id = c.id
)
where exists (
  select 1 from messages m where m.conversation_id = c.id
);
