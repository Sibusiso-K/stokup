-- StokUp — Supabase / Postgres schema
-- Run this in your Supabase project's SQL editor to enable multi-device mode.
-- After running it, put your Project URL + anon key into app/config.js.
--
-- SECURITY NOTE (read me): the policies below are permissive for a fast MVP pilot —
-- the anonymous key can read/write. That is acceptable for a small, trusted pilot but
-- is NOT production security. Phase 2: add Supabase Auth for the operator and tighten
-- these policies so only authenticated staff can edit products / see all orders.

-- ---------- tables ----------
create table if not exists products (
  id          bigint generated always as identity primary key,
  sku         text unique,
  name        text not null,
  size        text,
  category    text,
  emoji       text,
  cost        numeric(10,2),   -- wholesale cost (operator-only info)
  price       numeric(10,2) not null, -- what the shop pays
  active      boolean default true,
  created_at  timestamptz default now()
);

create table if not exists orders (
  id              bigint generated always as identity primary key,
  shop_name       text not null,
  owner_name      text,
  phone           text,
  zone            text,
  address_notes   text,
  delivery_window text,
  notes           text,
  status          text not null default 'NEW'
                  check (status in ('NEW','CONFIRMED','OUT_FOR_DELIVERY','DELIVERED','PAID','CANCELLED')),
  subtotal        numeric(10,2) not null default 0,
  delivery_fee    numeric(10,2) not null default 0,
  total           numeric(10,2) not null default 0,
  created_at      timestamptz default now()
);

create table if not exists order_items (
  id          bigint generated always as identity primary key,
  order_id    bigint not null references orders(id) on delete cascade,
  product_id  bigint references products(id),
  sku         text,
  name        text not null,
  size        text,
  qty         integer not null check (qty > 0),
  unit_price  numeric(10,2) not null,
  line_total  numeric(10,2) not null
);

create index if not exists idx_order_items_order on order_items(order_id);
create index if not exists idx_orders_status on orders(status);

-- ---------- row level security (MVP-permissive) ----------
alter table products    enable row level security;
alter table orders      enable row level security;
alter table order_items enable row level security;

-- products: anyone can read; anyone can write (MVP admin uses anon key — tighten in Phase 2)
drop policy if exists p_products_read  on products;
drop policy if exists p_products_write on products;
create policy p_products_read  on products for select using (true);
create policy p_products_write on products for all    using (true) with check (true);

-- orders + items: anyone can create and read (MVP). Tighten in Phase 2.
drop policy if exists p_orders_all on orders;
drop policy if exists p_items_all  on order_items;
create policy p_orders_all on orders      for all using (true) with check (true);
create policy p_items_all  on order_items for all using (true) with check (true);

-- ---------- seed catalog (mirror of app/js/data.js — CONFIRM PRICES AT WHOLESALER) ----------
insert into products (sku, name, size, category, emoji, cost, price) values
  ('MZ10','Maize meal (Super)','10kg','Staples','🌽',89,95),
  ('MZ05','Maize meal (Super)','5kg','Staples','🌽',48,52),
  ('RC10','Rice (long grain)','10kg','Staples','🍚',145,155),
  ('RC02','Rice (long grain)','2kg','Staples','🍚',35,39),
  ('CF10','Cake flour','10kg','Staples','🌾',110,119),
  ('CF25','Cake flour','2.5kg','Staples','🌾',33,37),
  ('SG10','White sugar','10kg','Staples','🧂',165,175),
  ('SG25','White sugar','2.5kg','Staples','🧂',45,49),
  ('SM05','Samp','5kg','Staples','🌽',55,60),
  ('SB02','Sugar beans','2kg','Staples','🫘',55,60),
  ('OL5L','Sunflower cooking oil','5L','Cooking','🛢️',175,189),
  ('OL2L','Sunflower cooking oil','2L','Cooking','🛢️',72,79),
  ('SLT1','Salt','1kg','Cooking','🧂',9,12),
  ('TSC7','Tomato sauce','700ml','Cooking','🍅',28,33),
  ('VIN7','Brown vinegar','750ml','Cooking','🧴',15,19),
  ('NDL1','2-minute noodles','each','Cooking','🍜',5,7),
  ('CC2L','Coca-Cola','2L','Cooldrinks','🥤',20,25),
  ('FN2L','Fanta / Sprite','2L','Cooldrinks','🥤',19,24),
  ('OR2L','Oros concentrate','2L','Cooldrinks','🧃',42,48),
  ('WT50','Bottled water','500ml','Cooldrinks','💧',5,8),
  ('JC1L','Fruit juice','1L','Cooldrinks','🧃',20,25),
  ('MK1L','Long-life milk','1L','Cooldrinks','🥛',17,21),
  ('TEA1','Rooibos / black tea','100 bags','Cooldrinks','🫖',55,62),
  ('COF2','Instant coffee','250g','Cooldrinks','☕',45,52),
  ('BRW1','White bread loaf','700g','Bread','🍞',16,19),
  ('BRB1','Brown bread loaf','700g','Bread','🍞',15,18),
  ('CHP1','Potato chips','125g','Snacks','🥔',14,18),
  ('NKN1','NikNaks','135g','Snacks','🧀',12,16),
  ('BIS2','Biscuits','200g','Snacks','🍪',16,21),
  ('SWT1','Assorted sweets (jar)','1 jar','Snacks','🍬',25,32),
  ('CHW1','Chappies bubblegum (box)','1 box','Snacks','🫧',20,26),
  ('DSH7','Dishwashing liquid','750ml','Household','🧼',25,30),
  ('AND7','Cream cleaner','750ml','Household','🧴',22,27),
  ('WSH2','Washing powder','2kg','Household','🧺',55,62),
  ('TLP9','Toilet paper','9 rolls','Household','🧻',48,55),
  ('CDL1','Candles','6 pack','Household','🕯️',18,23),
  ('MCH1','Matches','10 boxes','Household','🔥',10,14),
  ('SOP1','Bath soap','each','Personal care','🧼',8,11),
  ('TPS1','Toothpaste','100ml','Personal care','🪥',15,20),
  ('DEO1','Roll-on deodorant','50ml','Personal care','🧴',22,28)
on conflict (sku) do nothing;
