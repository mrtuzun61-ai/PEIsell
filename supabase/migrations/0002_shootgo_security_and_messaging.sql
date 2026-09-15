create index if not exists blocks_blocked_idx on public.blocks(blocked_id);
create index if not exists conversations_buyer_idx on public.conversations(buyer_id);
create index if not exists conversations_seller_idx on public.conversations(seller_id);
create index if not exists favorites_listing_idx on public.favorites(listing_id);
create index if not exists listing_images_owner_idx on public.listing_images(owner_id);
create index if not exists messages_sender_idx on public.messages(sender_id);
create index if not exists payments_listing_idx on public.payments(listing_id);
create index if not exists payments_user_idx on public.payments(user_id);
create index if not exists reports_listing_idx on public.reports(listing_id);
create index if not exists reports_reported_user_idx on public.reports(reported_user_id);
create index if not exists reports_reporter_idx on public.reports(reporter_id);

alter function public.touch_updated_at() set search_path = public;
revoke execute on function public.handle_new_user() from anon, authenticated;
revoke execute on function public.calculate_listing_fee(numeric, uuid) from anon;
revoke execute on function public.publish_listing(uuid) from anon;
grant execute on function public.calculate_listing_fee(numeric, uuid) to authenticated;
grant execute on function public.publish_listing(uuid) to authenticated;

create policy admin_users_self_read on public.admin_users
for select to authenticated
using (user_id = (select auth.uid()));

create or replace function public.create_or_get_conversation(p_listing_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  l public.listings;
  cid uuid;
begin
  if auth.uid() is null then raise exception 'authentication_required'; end if;
  select * into l from public.listings where id = p_listing_id and status = 'active' and expires_at > now();
  if l.id is null then raise exception 'listing_unavailable'; end if;
  if l.seller_id = auth.uid() then raise exception 'cannot_message_self'; end if;
  if exists (
    select 1 from public.blocks b
    where (b.blocker_id = auth.uid() and b.blocked_id = l.seller_id)
       or (b.blocker_id = l.seller_id and b.blocked_id = auth.uid())
  ) then raise exception 'blocked'; end if;
  select id into cid from public.conversations
  where listing_id = l.id and buyer_id = auth.uid() and seller_id = l.seller_id;
  if cid is null then
    insert into public.conversations(listing_id,buyer_id,seller_id)
    values (l.id, auth.uid(), l.seller_id)
    returning id into cid;
  end if;
  return cid;
end $$;

revoke execute on function public.create_or_get_conversation(uuid) from anon;
grant execute on function public.create_or_get_conversation(uuid) to authenticated;
