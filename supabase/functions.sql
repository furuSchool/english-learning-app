-- Function to increment activity log (upsert)
create or replace function increment_activity(p_date date)
returns void as $$
begin
  insert into activity_logs (user_id, date, task_count)
  values (auth.uid(), p_date, 1)
  on conflict (user_id, date)
  do update set task_count = activity_logs.task_count + 1;
end;
$$ language plpgsql security definer;
