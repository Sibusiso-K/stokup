/* Operator dashboard — orders, pick list, catalog/prices. */
(function () {
  const cfg = window.STOKUP_CONFIG || {};
  const $ = (sel) => document.querySelector(sel);

  const state = { orders: [], products: [], tab: "orders" };

  const NEXT = {
    NEW: "CONFIRMED",
    CONFIRMED: "OUT_FOR_DELIVERY",
    OUT_FOR_DELIVERY: "DELIVERED",
    DELIVERED: "PAID"
  };
  const NEXT_LABEL = {
    NEW: "Confirm order",
    CONFIRMED: "Out for delivery",
    OUT_FOR_DELIVERY: "Mark delivered",
    DELIVERED: "Mark paid"
  };
  const ACTIVE_STATUSES = ["NEW", "CONFIRMED", "OUT_FOR_DELIVERY"];

  function money(n) {
    return cfg.currency + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
    );
  }
  function productById(id) {
    return state.products.find((p) => String(p.id) === String(id));
  }
  function productBySku(sku) {
    return state.products.find((p) => p.sku === sku);
  }
  // cost lookup for an order item (order_items don't store cost)
  function costFor(item) {
    const p = productById(item.productId) || productBySku(item.sku);
    return p && typeof p.cost === "number" ? p.cost : null;
  }

  // ---------- gate ----------
  function initGate() {
    $("#gateBrand").textContent = (cfg.brandName || "StokUp") + " operator";
    if (sessionStorage.getItem("stokup_admin_ok") === "1") return unlock();
    $("#unlock").addEventListener("click", tryUnlock);
    $("#pin").addEventListener("keydown", (e) => { if (e.key === "Enter") tryUnlock(); });
  }
  function tryUnlock() {
    if ($("#pin").value === String(cfg.adminPin)) {
      sessionStorage.setItem("stokup_admin_ok", "1");
      unlock();
    } else {
      $("#pinErr").textContent = "Wrong PIN. Try again.";
    }
  }
  function unlock() {
    $("#gate").style.display = "none";
    $("#app").style.display = "block";
    $("#modeFlag").textContent = Store.mode === "supabase" ? "live" : "demo";
    wireTabs();
    refresh();
  }

  // ---------- data ----------
  async function refresh() {
    [state.products, state.orders] = await Promise.all([
      Store.getProducts({}),
      Store.getOrders()
    ]);
    const active = state.orders.filter((o) => ACTIVE_STATUSES.includes(o.status)).length;
    $("#opSummary").textContent =
      state.orders.length + " orders · " + active + " open · mode: " + Store.mode;
    render();
  }

  // ---------- tabs ----------
  function wireTabs() {
    document.querySelectorAll(".tabbar button").forEach((b) => {
      b.addEventListener("click", () => {
        state.tab = b.dataset.tab;
        document.querySelectorAll(".tabbar button").forEach((x) => x.classList.remove("active"));
        b.classList.add("active");
        render();
      });
    });
  }

  function render() {
    if (state.tab === "orders") return renderOrders();
    if (state.tab === "pick") return renderPickList();
    if (state.tab === "catalog") return renderCatalog();
  }

  // ---------- orders ----------
  function renderOrders() {
    if (!state.orders.length) {
      $("#content").innerHTML = `<div class="empty"><div class="big">📭</div>No orders yet.<br/>
        <span class="hint">Place a test order in the customer app to see it here.</span></div>`;
      return;
    }
    $("#content").innerHTML = state.orders.map(orderCard).join("");
    $("#content").querySelectorAll("button[data-act]").forEach((btn) => {
      btn.addEventListener("click", () => onOrderAction(btn.dataset.id, btn.dataset.act));
    });
  }

  function orderCard(o) {
    let itemsHtml = "";
    let cost = 0;
    let costKnown = true;
    o.items.forEach((it) => {
      const c = costFor(it);
      if (c == null) costKnown = false;
      else cost += c * it.qty;
      itemsHtml += `<li>${it.qty} × ${esc(it.name)} <span class="hint">${esc(it.size)}</span></li>`;
    });
    const margin = o.subtotal - cost;
    const marginHtml = costKnown
      ? `<div class="margin-note">Est. goods cost ${money(cost)} · margin <span class="pill-margin">${money(margin)}</span></div>`
      : "";

    const next = NEXT[o.status];
    let actions = "";
    if (next) {
      actions += `<button class="btn" data-act="advance" data-id="${o.id}">${NEXT_LABEL[o.status]}</button>`;
    }
    if (o.status !== "PAID" && o.status !== "CANCELLED") {
      actions += `<button class="btn secondary" data-act="cancel" data-id="${o.id}">Cancel</button>`;
    }
    const waNum = (o.phone || "").replace(/[^0-9]/g, "").replace(/^0/, "27");
    const callBtn = o.phone
      ? `<button class="btn secondary" data-act="wa" data-id="${o.id}" data-num="${waNum}">WhatsApp shop</button>`
      : "";

    return `<div class="order-card">
      <div class="top">
        <div>
          <div class="shop">${esc(o.shopName)}</div>
          <div class="sub">${esc(o.ownerName)} · ${esc(o.phone || "")}</div>
          <div class="sub">📍 ${esc(o.zone || "")} — ${esc(o.addressNotes || "")}</div>
          <div class="sub">🕒 ${esc(o.deliveryWindow || "—")} · ${when(o.createdAt)}</div>
        </div>
        <span class="badge ${o.status}">${Store.STATUS_LABELS[o.status] || o.status}</span>
      </div>
      <ul>${itemsHtml}</ul>
      ${o.notes ? `<div class="sub">📝 ${esc(o.notes)}</div>` : ""}
      <div class="money"><span>Subtotal ${money(o.subtotal)} · delivery ${o.deliveryFee === 0 ? "FREE" : money(o.deliveryFee)}</span>
        <span><b>${money(o.total)}</b> COD</span></div>
      ${marginHtml}
      <div class="actions-row">${actions}${callBtn}</div>
    </div>`;
  }

  async function onOrderAction(id, act) {
    const order = state.orders.find((o) => String(o.id) === String(id));
    if (!order) return;
    if (act === "wa") {
      const btn = $(`button[data-act="wa"][data-id="${CSS.escape(String(id))}"]`);
      const num = btn ? btn.dataset.num : "";
      window.open("https://wa.me/" + num, "_blank");
      return;
    }
    if (act === "advance") {
      const next = NEXT[order.status];
      if (next) { await Store.updateOrderStatus(id, next); await refresh(); }
    }
    if (act === "cancel") {
      if (confirm("Cancel this order?")) { await Store.updateOrderStatus(id, "CANCELLED"); await refresh(); }
    }
  }

  function when(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleDateString() + " " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  // ---------- pick list ----------
  function renderPickList() {
    const active = state.orders.filter((o) => ACTIVE_STATUSES.includes(o.status));
    if (!active.length) {
      $("#content").innerHTML = `<div class="empty"><div class="big">🧾</div>No open orders to shop for.</div>`;
      return;
    }
    const agg = {}; // key -> { name, size, qty, cost }
    active.forEach((o) => {
      o.items.forEach((it) => {
        const key = it.sku || it.name + it.size;
        if (!agg[key]) agg[key] = { name: it.name, size: it.size, qty: 0, cost: costFor(it) };
        agg[key].qty += it.qty;
      });
    });
    let totalCost = 0;
    let costKnown = true;
    const rows = Object.keys(agg)
      .sort((a, b) => agg[a].name.localeCompare(agg[b].name))
      .map((k) => {
        const r = agg[k];
        if (r.cost == null) costKnown = false;
        else totalCost += r.cost * r.qty;
        return `<div class="picklist-item">
          <span><span class="q">${r.qty} ×</span> ${esc(r.name)} <span class="hint">${esc(r.size)}</span></span>
          <span>${r.cost != null ? money(r.cost * r.qty) : ""}</span>
        </div>`;
      })
      .join("");
    $("#content").innerHTML = `
      <div class="cat-heading">Buy this at the wholesaler (${active.length} open orders)</div>
      ${rows}
      <div class="totals">
        <div class="row grand"><span>Est. wholesale spend</span><span>${costKnown ? money(totalCost) : "—"}</span></div>
      </div>
      <div class="hint">Covers orders that are New, Confirmed or Out for delivery.</div>`;
  }

  // ---------- catalog / prices ----------
  function renderCatalog() {
    if (!state.products.length) {
      $("#content").innerHTML = `<div class="empty">No products.</div>`;
      return;
    }
    const rows = state.products.map((p) => {
      const margin = typeof p.cost === "number" ? p.price - p.cost : null;
      const pct = margin != null && p.cost ? Math.round((margin / p.cost) * 100) : null;
      return `<div class="product">
        <div class="emoji">${p.emoji || "📦"}</div>
        <div class="info">
          <div class="name">${esc(p.name)} <span class="hint">${esc(p.size)}</span></div>
          <div class="meta">cost ${p.cost != null ? money(p.cost) : "—"}${
            margin != null ? ` · margin <span class="pill-margin">${money(margin)}${pct != null ? ` (${pct}%)` : ""}</span>` : ""
          }</div>
        </div>
        <div style="display:flex;align-items:center;gap:6px">
          <span>${cfg.currency}</span>
          <input type="number" style="width:78px" value="${p.price}" data-price-id="${p.id}" />
        </div>
      </div>`;
    }).join("");
    $("#content").innerHTML =
      `<div class="cat-heading">Tap a price to edit — saves automatically</div>` + rows +
      `<div class="hint" style="margin-top:10px">Prices are what the shop pays. Update after each wholesaler visit.</div>`;

    $("#content").querySelectorAll("input[data-price-id]").forEach((inp) => {
      inp.addEventListener("change", async () => {
        const id = inp.dataset.priceId;
        const price = parseFloat(inp.value);
        if (isNaN(price) || price < 0) return;
        await Store.saveProduct({ id, price });
        state.products = await Store.getProducts({});
        if (state.tab === "catalog") renderCatalog();
      });
    });
  }

  document.addEventListener("DOMContentLoaded", initGate);
})();
