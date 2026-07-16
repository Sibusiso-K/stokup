# StokUp — Spaza stock, delivered

A buying-and-delivery middleman between wholesalers and spaza shops in Soweto.
Shop owners order fast-moving stock from their phone; we buy it wholesale and deliver
it to their door. Capital-light: **zero inventory, cash on delivery (COD)**.

> **StokUp** is a working placeholder name — change it in `app/config.js` (`brandName`).

---

## What's in here

```
app/                 The product — a dependency-free installable PWA
  index.html         Customer app: browse catalog → cart → checkout (COD)
  admin.html         Operator dashboard: orders, statuses, pick-list, price editing
  config.js          Settings: brand, WhatsApp number, delivery fee, zones, Supabase keys
  js/data.js         Seed catalog (~40 Soweto fast-movers) — CONFIRM PRICES AT WHOLESALER
  js/store.js        Data layer — localStorage now, Supabase when keys are set
  js/app.js          Customer app logic
  js/admin.js        Admin logic
  css/styles.css     Mobile-first styling
  manifest.webmanifest, sw.js, icon.svg   PWA install + offline
db/schema.sql        Supabase/Postgres schema + row-level security + seed
docs/                business-plan.md, mvp-spec.md, pilot-tracker.csv
```

---

## Run it locally (no Node required)

You need Python (already installed on this machine). From this folder:

```bash
python -m http.server 8000 --directory app
```

Then open:
- Customer app: <http://localhost:8000/index.html>
- Operator dashboard: <http://localhost:8000/admin.html>

> Open on your phone too: find your PC's IP (`ipconfig`), then visit
> `http://<your-ip>:8000/` on a phone on the same Wi-Fi. Use "Add to Home screen" to install.

---

## Two modes

**Local mode (default):** all data lives in the browser's `localStorage`. Great for demos and
development, but the customer's phone and the operator's phone do **not** share data (each
device has its own store). Use this to build and demo.

**Supabase mode (for the real pilot):** orders sync across devices through a shared database.
To switch:
1. Create a free project at <https://supabase.com> (you do this — never share keys with anyone).
2. In the Supabase SQL editor, run `db/schema.sql`.
3. Put your Project URL + anon key into `app/config.js` (`SUPABASE_URL`, `SUPABASE_ANON_KEY`).

That's the only change — `store.js` auto-detects the keys and switches backends.

---

## Deploy (free)

Because it's static files, drag the `app/` folder onto **Netlify Drop**
(<https://app.netlify.com/drop>) or deploy with **Vercel**. No build step.

---

## Day-1 checklist (see the plan + docs)
- [ ] Confirm real wholesale prices for the ~40 SKUs, update `js/data.js`.
- [ ] Set your WhatsApp business number + delivery fee + zones in `config.js`.
- [ ] Decide launch zone; recruit 5–10 pilot shops.
- [ ] (For pilot) stand up Supabase and switch modes.
