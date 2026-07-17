-- StokUp — Migration 002: wholesalers
-- Run this in your Supabase project's SQL editor (same project as schema.sql).
--
-- WHAT THIS ADDS
-- 1. A `wholesalers` table seeded from the research in docs/wholesalers.md.
-- 2. A `wholesaler_id` column on `products`, pointing to the wholesaler the
--    operator should buy that item from.
--
-- IMPORTANT — read before treating this as "stock availability":
-- There is no live inventory feed from any of these wholesalers. `wholesaler_id`
-- is a SOURCING RECOMMENDATION seeded from category fit (see the UPDATE
-- statements below), not a verified real-time stock count. It's fully editable
-- from the admin Catalog tab — treat it as a starting point, and correct it
-- once you've actually shopped at each place.

-- ---------- table ----------
create table if not exists wholesalers (
  id          bigint generated always as identity primary key,
  name        text not null,
  area        text not null,
  address     text,
  phone       text,
  notes       text,
  priority    integer not null default 99, -- lower = closer/preferred
  created_at  timestamptz default now()
);

alter table products
  add column if not exists wholesaler_id bigint references wholesalers(id);

-- ---------- row level security (MVP-permissive, matches products/orders) ----------
alter table wholesalers enable row level security;
drop policy if exists p_wholesalers_read  on wholesalers;
drop policy if exists p_wholesalers_write on wholesalers;
create policy p_wholesalers_read  on wholesalers for select using (true);
create policy p_wholesalers_write on wholesalers for all    using (true) with check (true);

-- ---------- seed wholesalers (see docs/wholesalers.md for sources) ----------
insert into wholesalers (name, area, address, phone, notes, priority) values
  ('Devland Cash and Carry', 'Devland, Soweto', '181 Houthammer Rd, Devland, Soweto, 1832', '011 989 8800',
   'FMCG wholesaler, general merchandise + food. Closest full-line wholesaler to the launch zones — default sourcing hub.', 1),
  ('Metro Cash & Carry (Devland)', 'Devland, Soweto', null, null,
   'Grocery-focused, same Devland industrial hub as Devland Cash and Carry.', 2),
  ('Alliance Cash & Carry (Devland)', 'Devland, Soweto', '2 Piston Rd, Soweto', null,
   'Same Devland industrial hub.', 3),
  ('Makro Crown Mines', 'Crown Mines, Johannesburg', '1 Hanover St (cnr Main Reef Rd), Selby, Johannesburg, 2001', null,
   'Big-box bulk retail/wholesale — good for large-volume cooldrinks and case buys.', 4),
  ('Continental Cash & Carry', 'Crown Mines, Johannesburg', '14 Mineral Crescent, Crown Mines, 2092', '011 594 2085',
   'Groceries, spices, bulk snacks — open Sundays & public holidays too.', 5),
  ('5 Star Cash & Carry', 'Lenasia', '22 Tugela Crescent, Ext 10, Lenasia', '+27 87 821 6742',
   'Household + perishables.', 6),
  ('Frontline Cash and Carry / Hyper Lenasia', 'Lenasia', '207 Protea Avenue, Ext 7, Lenasia', '067 419 9814',
   'Wholesaler + hypermarket (3 outlets).', 7),
  ('DB Cash and Carry', 'Lenasia', null, '011 854 5936',
   'Sweets, stationery, snacks.', 8),
  ('Rago Cash & Carry', 'Lenasia', null, null,
   'Snack specialist.', 9)
on conflict do nothing;

-- ---------- default sourcing assignment by category ----------
-- Devland is the default for most of the catalog (matches the business-plan
-- recommendation to buy from one nearby hub). Cooldrinks default to Makro
-- (bulk-case beverage volume) and Snacks to Continental (called out in
-- research for bulk snacks). Reassign per-product any time from the admin.
update products set wholesaler_id = (select id from wholesalers where name = 'Devland Cash and Carry')
  where category in ('Staples', 'Cooking', 'Bread', 'Household', 'Personal care');

update products set wholesaler_id = (select id from wholesalers where name = 'Makro Crown Mines')
  where category = 'Cooldrinks';

update products set wholesaler_id = (select id from wholesalers where name = 'Continental Cash & Carry')
  where category = 'Snacks';
