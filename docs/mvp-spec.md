# StokUp — MVP Product Spec (as built)

*v0.1 — describes what's in this repo today.*

## Goal
A dependency-free web app (installable PWA) that lets a spaza owner order stock from their
phone and lets the operator fulfill it — proving the business in a 2-week pilot with no
build toolchain and near-zero cost.

## Users & roles
1. **Shop owner (customer)** — browses catalog, builds a cart, places a COD order, confirms
   on WhatsApp, sees a confirmation.
2. **Operator (you/brother)** — logs in with a PIN, sees orders, generates a wholesaler pick
   list, advances order status, edits products/prices.

## User stories (all implemented)
- As an owner, I can **browse ~40 fast-moving products** grouped by category and **search**.
- As an owner, I can **add/remove quantities** with + / − steppers and see a **running total**.
- As an owner, I can **checkout** with my shop details and get a **delivery fee** that shrinks
  with order size; payment is **cash on delivery** (no card).
- As an owner, I get a **confirmation** and a one-tap **WhatsApp message** pre-filled with my
  order, sent to the operator.
- As an owner, my **shop details are remembered** for faster repeat orders.
- As an operator, I can **log in with a PIN** and see **all orders** with status, items,
  totals, and **estimated margin**.
- As an operator, I can **advance an order** through New → Confirmed → Out for delivery →
  Delivered → Paid (or Cancel).
- As an operator, I can open a **pick list** that aggregates all open orders into one
  wholesaler shopping list with estimated spend.
- As an operator, I can **edit prices** (and see margin %) — saved instantly.

## Screens
| Screen | File | Notes |
|---|---|---|
| Catalog + cart | `app/index.html` + `js/app.js` | Search, category chips, steppers, fixed cart bar |
| Cart / checkout / success | (same, bottom sheet) | Totals, delivery fee, COD form, WhatsApp confirm |
| Operator login | `app/admin.html` | PIN gate (MVP only) |
| Orders / Pick list / Catalog | `app/admin.html` + `js/admin.js` | Three tabs |

## Order status flow
`NEW → CONFIRMED → OUT_FOR_DELIVERY → DELIVERED → PAID` (plus `CANCELLED`).
Defined in `js/store.js` (`ORDER_STATUSES`) and driven from the operator dashboard.

## Data model
See `db/schema.sql`. Tables: **products**, **orders**, **order_items** (+ device-local cart
and remembered shop details in `localStorage`).

- `products`: sku, name, size, category, emoji, **cost** (operator-only), **price**, active
- `orders`: shop_name, owner_name, phone, zone, address_notes, delivery_window, notes,
  status, subtotal, delivery_fee, total, created_at
- `order_items`: order_id, product_id, sku, name, size, qty, unit_price, line_total

## Architecture
- **Frontend:** plain HTML/CSS/JS. No framework, no build step. Mobile-first, light/dark aware.
- **Data layer:** `js/store.js` exposes one async API and auto-selects a backend:
  - **Local mode** (default): `localStorage` — single device, perfect for demo/dev.
  - **Supabase mode**: set `SUPABASE_URL` + `SUPABASE_ANON_KEY` in `config.js` → orders sync
    across devices via Supabase REST (no SDK/CDN needed). Run `db/schema.sql` first.
- **Offline/instalable:** `manifest.webmanifest` + `sw.js` (network-first so edits show live).
- **Notifications:** WhatsApp via `wa.me` deep links (no paid API).

## Configuration (`app/config.js`)
Brand name, tagline, currency, operator WhatsApp number, delivery-fee tiers, delivery
windows, zones, Supabase keys, admin PIN. **No code changes needed to configure.**

## Explicitly out of scope (Phase 2+)
In-app payments, credit/tab accounts, delivery-route optimization, ratings, real operator
auth + tightened row-level security, product photos, multi-driver, native/Play Store app.

## Known MVP limitations (by design)
- **Local mode data is per-device** — the real multi-shop pilot needs Supabase mode.
- **Admin PIN is not real security** — it's a soft gate; add Supabase Auth in Phase 2.
- **Supabase RLS policies are permissive** for pilot speed — tighten before scaling.
- **Prices/costs are placeholders** — confirm at the wholesaler (`js/data.js`).

## How to run / deploy / verify
See `README.md`. Quick version: `python -m http.server 8000 --directory app`, open
`/index.html` (customer) and `/admin.html` (operator, PIN in `config.js`). Deploy the `app/`
folder to Netlify Drop or Vercel (static, no build).
