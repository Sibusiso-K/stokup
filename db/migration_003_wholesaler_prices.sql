-- StokUp — Migration 003: per-wholesaler price comparison
-- Run this in your Supabase project's SQL editor, after migration_002_wholesalers.sql.
--
-- WHAT THIS ADDS
-- A `wholesaler_prices` table: one row per (product, wholesaler) recording what
-- that item costs there, and whether it's currently a special. This is what
-- powers the admin's "cheapest option" comparison and the Specials board.
--
-- IMPORTANT — this starts with exactly ONE price recorded per product (seeded
-- from the existing products.cost at its assigned wholesaler). There is no
-- live price feed from any of these wholesalers; real comparison only becomes
-- useful once you've actually visited/called others and logged what you found
-- in the admin Catalog tab. No specials are seeded — add real ones as you spot
-- them, don't trust anything here as current until you've checked it yourself.

create table if not exists wholesaler_prices (
  id            bigint generated always as identity primary key,
  product_id    bigint not null references products(id) on delete cascade,
  wholesaler_id bigint not null references wholesalers(id) on delete cascade,
  price         numeric(10,2) not null,
  is_special    boolean not null default false,
  special_label text,
  special_until date,
  updated_at    timestamptz not null default now(),
  unique (product_id, wholesaler_id)
);

create index if not exists idx_wholesaler_prices_product on wholesaler_prices(product_id);

alter table wholesaler_prices enable row level security;
drop policy if exists p_wholesaler_prices_all on wholesaler_prices;
create policy p_wholesaler_prices_all on wholesaler_prices for all using (true) with check (true);

-- ---------- seed: one real data point per product (its current cost + assigned wholesaler) ----------
insert into wholesaler_prices (product_id, wholesaler_id, price)
select id, wholesaler_id, cost
from products
where wholesaler_id is not null and cost is not null
on conflict (product_id, wholesaler_id) do nothing;
