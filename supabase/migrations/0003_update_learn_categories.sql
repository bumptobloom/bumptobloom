-- Migration: Update content.category check constraint to the 5 unified MVP categories
-- Aligns database schema with the agreed 5 categories across Learn & Ask.
-- Safely updates any existing fixture/test rows before applying constraint in a single transaction.

begin;

-- Update existing fixture row from initial schema if present
update content
  set category = 'feeding'
  where category = 'developmental';

alter table content drop constraint if exists content_category_check;
alter table content add constraint content_category_check
  check (category in ('feeding', 'sleep', 'diaper_digestion', 'crying_soothing', 'mom_wellbeing'));

commit;
