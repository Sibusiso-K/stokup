# Supabase setup — go from demo to a real multi-device pilot

This switches StokUp from **demo mode** (each device has its own data) to **live mode**
(orders sync across phones through a shared database). ~15 minutes, free tier.

You do the account steps (they're your login — I can't do those for you). Everything on the
code side is already built; you're just pasting in 2 keys at the end.

---

## Step 1 — Create a Supabase project
1. Go to **https://supabase.com** → **Start your project** → sign in (GitHub is easiest).
2. **New project**:
   - **Name:** `stokup`
   - **Database password:** click *Generate*, then **save it somewhere safe** (you rarely
     need it again, but don't lose it).
   - **Region:** pick the one closest to South Africa (e.g. **West EU (London)** —
     Supabase has no Africa region; EU is the lowest latency).
3. Click **Create new project** and wait ~2 minutes while it provisions.

## Step 2 — Create the tables + seed the catalog
1. In your project, open the **SQL Editor** (left sidebar) → **New query**.
2. Open the file **`db/schema.sql`** from this project, copy **all** of it, paste it in.
3. Click **Run**. You should see success. This creates `products`, `orders`, `order_items`,
   the security policies, and seeds all 40 products.
4. (Optional check) Open **Table Editor → products** — you should see 40 rows.

## Step 3 — Copy your API keys
1. Go to **Project Settings** (gear icon) → **API**.
2. Copy two things:
   - **Project URL** — looks like `https://abcdefgh.supabase.co`
   - **Project API keys → `anon` `public`** — a long string starting with `eyJ...`
3. ⚠️ **Use the `anon` `public` key only.** NEVER copy or commit the **`service_role`** key —
   that one is a full-access admin secret.

## Step 4 — Paste the keys into the app
Open **`app/config.js`** and fill in:
```js
SUPABASE_URL: "https://abcdefgh.supabase.co",
SUPABASE_ANON_KEY: "eyJhbGciOi...your-anon-key...",
```
Save.

## Step 5 — Test, then ship
**Test locally first** (recommended):
```
python -m http.server 8000 --directory app
```
Open http://localhost:8000/ — the badge top-right of the header should now say **live**
(not **demo**). Place a test order, then open `/admin.html` — the order should appear.

**Then push to make it live on your phone:**
```
git add app/config.js
git commit -m "Wire up Supabase (live mode)"
git push
```
Vercel auto-redeploys. Now open the site on **two different phones** — an order placed on
one appears in the operator dashboard on the other. That's the real pilot setup. 🎉

---

## Verify it's really working
- Header badge shows **live**.
- An order on phone A shows up in `/admin.html` on phone B.
- In Supabase **Table Editor → orders**, you can see the rows appearing.

## Troubleshooting
| Symptom | Fix |
|---|---|
| Badge still says **demo** | Keys not saved / not loaded. Check `config.js` has both values, hard-refresh. |
| Empty catalog in live mode | The seed didn't run. Re-run `db/schema.sql` in the SQL Editor. |
| `401` / permission errors in console | Wrong key (used service_role or a typo), or the RLS policies from `schema.sql` didn't apply — re-run it. |
| Orders don't sync between phones | Confirm both phones load the **deployed Vercel URL** (not localhost), and badge says live on both. |

## Security notes (read before the pilot grows)
- The **anon key is safe to expose** in the app — it's a public client key, and the database
  is protected by the Row-Level-Security policies in `schema.sql`. This is the standard
  Supabase pattern.
- The **`service_role` key must never** be in the app or git. We don't use it.
- The `schema.sql` policies are **permissive for a fast pilot** (anyone can read/write). That's
  fine for a small trusted pilot. **Before scaling**, do the Phase-2 hardening: add Supabase
  Auth for the operator and restrict who can edit products / view all orders.
- **Change the admin PIN** in `config.js` and don't share the `/admin.html` link publicly.
