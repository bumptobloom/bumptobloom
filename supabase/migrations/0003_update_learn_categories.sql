-- Migration: Update content.category check constraint to the 5 unified MVP categories
-- Aligns database schema with the 5 categories across Learn & Ask.

begin;

-- the RLS fixture row predates this constraint and is the only row
-- still carrying the retired 'developmental' category
update content
set category = 'feeding'
where category = 'developmental';

alter table content drop constraint if exists content_category_check;
alter table content add constraint content_category_check
check (category in ('feeding', 'sleep', 'diaper_digestion', 'crying_soothing', 'mom_wellbeing'));

commit;
