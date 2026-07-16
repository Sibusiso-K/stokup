# StokUp — Business & Strategy Plan

*Working draft — v0.1. Numbers marked ⚠️ are placeholders to confirm at a real wholesaler in Week 1.*

---

## 1. The problem
Spaza shops (informal township convenience stores) in Soweto restock by physically
traveling to wholesalers / cash-and-carry stores several times a week. Each trip costs them:
- **Money:** ~R60–100 in taxi fare (round trip, often carrying heavy stock). ⚠️
- **Time:** 2–4 hours per trip — during which the shop is closed and **not making sales**.
- **Effort & risk:** carrying bulk stock on foot/taxi; safety and stock-damage risk.

For a shop running on thin margins, losing half a trading day to buy stock is a real cost.

## 2. The solution
**StokUp** is a buying-and-delivery middleman. A shop owner orders fast-moving stock from
their phone; we buy it at the wholesaler and deliver it to their door on a fixed schedule.
The owner never closes the shop, never pays a taxi, never carries stock.

> One line: *"Stock your spaza without leaving it."*

## 3. Why now / why us
- The model is **proven at scale elsewhere in Africa** (Wasoko in Kenya/Tanzania, MaxAB in
  Egypt, Sabi in Nigeria are large businesses doing exactly this). SA township retail is a
  large, underserved market.
- **Local trust is the moat.** Township retail runs on relationships and cash. A team that is
  *from Soweto* and starts with shops it already knows can win trust that outsiders can't.
- **We start capital-light** and hyper-local, so we can validate before spending big.

## 4. Business model
**Revenue = product markup + delivery fee.**
- **Markup:** a small margin (~5–8%) baked into the catalog price. The shop sees one price;
  the markup is invisible. ⚠️ confirm real wholesale prices to set this.
- **Delivery fee:** transparent, and shrinks as the order grows (encourages bigger baskets):
  - Base **R60**; drops to **R40** at ≥R1 500 subtotal; **free** at ≥R3 000. *(Configurable.)*
- **Payment:** **cash on delivery (COD)** — matches the cash economy, zero payment-tech cost.

### Capital-light operating model (fits < R5 000 start)
We hold **no inventory**. The cycle is:
1. Shop orders → 2. We buy exactly those items at the wholesaler → 3. Batched delivery →
4. Collect cash → 5. Repeat.

Because we only buy what's already ordered and collect cash on delivery, a small float
(enough for 1–2 orders at a time) is all that's needed to start.

## 5. Unit economics — worked example
*(Illustrative, using placeholder catalog numbers. Replace with real wholesale prices.)* ⚠️

| Item | What it means | Amount |
|---|---|---|
| Order subtotal (what shop pays for goods) | typical basket | R1 500 |
| Wholesale cost of those goods | what we pay | R1 410 |
| **Goods margin (~6%)** | | **R90** |
| Delivery fee charged | at R1 500 tier | R40 |
| **Gross revenue per order** | margin + fee | **R130** |
| Delivery cost per drop (batched, 1 zone) | fuel ÷ stops | ~R35 ⚠️ |
| **Contribution per order** | | **~R95** |

**The key ratio:** our delivery cost per order (~R35 when batched in one dense zone) must
stay well below what the trip costs the shop (R60–100 + hours). That gap is the business.
**Break-even** depends on fixed costs (mainly a vehicle/fuel); with ~15 batched drops per
run, contribution comfortably covers a run's fuel. Model this properly once real numbers land.

## 6. Go-to-market
1. **One zone first** (e.g. Meadowlands). Delivery economics live or die on **density** —
   many shops close together per run.
2. **Start with shops the team already knows** (brother's network) — de-risks COD and trust.
3. **Fixed delivery windows** (e.g. Tue & Fri mornings) so orders batch onto one vehicle run.
4. **Onboard in person:** show the app on the owner's phone, help them place order #1, add
   to home screen. WhatsApp is the support channel they already use.
5. **Grow by referral within the zone**, then add the next adjacent zone once the first is dense.

## 7. Operations / logistics (day one)
- **Ordering:** app (this repo). Orders land in the operator dashboard; shop confirms via WhatsApp.
- **Buying:** dashboard **pick list** aggregates all open orders into one wholesaler shopping list.
- **Delivery:** one vehicle (own / borrow / rent ⚠️), batched run within the zone on the window day.
- **Cash:** collected on delivery; reconciled against each order (mark **Paid** in dashboard).

## 8. Competition
- **Wholesalers themselves** (some offer delivery on big orders) — but not tailored to small
  spaza baskets or convenience.
- **Other SA players** exist (e.g. Vuleka, A2Pay-type services) — validation that the model
  works; our edge is local trust + hyper-local density in a specific Soweto zone.
- **Status quo:** the owner doing it themselves. This is the real competitor — we win on time
  and money saved.

## 9. Key risks & mitigations
| Risk | Mitigation |
|---|---|
| Cash-flow gap (COD before we're paid) | Keep ≤1–2 orders in flight; collect before restocking; partial prepay on large orders |
| Delivery cost eats margin | One zone, batched runs, fixed windows, minimum order size if needed |
| Trust / non-payment | Start with known shops; COD on delivery; build reputation before scaling |
| Wholesale price drift | Prices editable in one tap; re-check weekly |
| Owners not tech-comfortable | In-person onboarding; WhatsApp fallback ordering; dead-simple UI |
| Legal / registration | Run informal to validate; then register business + track VAT threshold (Phase 2) |

## 10. Roadmap
- **Phase 0 (now, 2 weeks):** MVP app + pilot in one zone, 5–10 shops, ≥10 orders delivered.
- **Phase 1:** tighten unit economics; add real product photos; simple credit/tab for trusted
  shops; second zone.
- **Phase 2:** operator auth + tighter data security; in-app payments (card/EFT/voucher);
  delivery-route batching; supplier partnerships for better buy prices; airtime/data.
- **Phase 3:** multi-operator/driver support; analytics; expand across Soweto.

## 11. What we need to confirm in Week 1 (⚠️ inputs)
- Real wholesale prices for the ~40 SKUs → set markup and confirm unit economics.
- Launch zone + count of shops the team can onboard immediately.
- Delivery vehicle arrangement and true cost per run.
- The one wholesaler we'll buy from to start.

---

## Success criteria for the 2-week pilot
- **Software:** a shop places an order end-to-end on their own phone; operator fulfills via dashboard.
- **Pilot:** ≥5 shops onboarded, ≥10 real orders delivered, positive goods margin, and
  **≥50% of shops say they'd order again.**
