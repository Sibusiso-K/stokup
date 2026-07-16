/* Customer app — catalog, cart, checkout. */
(function () {
  const cfg = window.STOKUP_CONFIG || {};
  const $ = (sel) => document.querySelector(sel);

  const state = {
    products: [],
    cart: Store.getCart(), // { productId: qty }
    category: "All",
    search: ""
  };

  function money(n) {
    return cfg.currency + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  }
  function byId(id) {
    return state.products.find((p) => String(p.id) === String(id));
  }
  function cartEntries() {
    return Object.keys(state.cart)
      .filter((id) => state.cart[id] > 0)
      .map((id) => ({ product: byId(id), qty: state.cart[id] }))
      .filter((e) => e.product);
  }
  function subtotal() {
    return cartEntries().reduce((s, e) => s + e.product.price * e.qty, 0);
  }
  function itemCount() {
    return cartEntries().reduce((s, e) => s + e.qty, 0);
  }

  // ---------- init ----------
  async function init() {
    $("#brandName").textContent = cfg.brandName || "StokUp";
    $("#tagline").textContent = cfg.tagline || "";
    document.title = (cfg.brandName || "StokUp") + " — order stock";
    $("#modeFlag").textContent = Store.mode === "supabase" ? "live" : "demo";

    state.products = await Store.getProducts({ activeOnly: true });
    renderChips();
    renderCatalog();
    renderCartBar();
    wireEvents();
  }

  // ---------- category chips ----------
  function categories() {
    const set = [];
    state.products.forEach((p) => { if (!set.includes(p.category)) set.push(p.category); });
    return ["All"].concat(set);
  }
  function renderChips() {
    $("#chips").innerHTML = categories()
      .map((c) => `<div class="chip ${c === state.category ? "active" : ""}" data-cat="${esc(c)}">${esc(c)}</div>`)
      .join("");
  }

  // ---------- catalog ----------
  function filteredProducts() {
    const q = state.search.trim().toLowerCase();
    return state.products.filter((p) => {
      const inCat = state.category === "All" || p.category === state.category;
      const inSearch = !q || (p.name + " " + p.size + " " + p.category).toLowerCase().includes(q);
      return inCat && inSearch;
    });
  }
  function renderCatalog() {
    const list = filteredProducts();
    if (!list.length) {
      $("#catalog").innerHTML = `<div class="empty"><div class="big">🔍</div>No stock matches that search.</div>`;
      return;
    }
    // group by category
    const groups = {};
    list.forEach((p) => { (groups[p.category] = groups[p.category] || []).push(p); });
    let html = "";
    Object.keys(groups).forEach((cat) => {
      html += `<div class="cat-heading">${esc(cat)}</div>`;
      groups[cat].forEach((p) => { html += productRow(p); });
    });
    $("#catalog").innerHTML = html;
  }
  function productRow(p) {
    const qty = state.cart[p.id] || 0;
    const stepper =
      qty > 0
        ? `<div class="stepper">
             <button data-act="dec" data-id="${p.id}">−</button>
             <span class="qty">${qty}</span>
             <button class="add" data-act="inc" data-id="${p.id}">+</button>
           </div>`
        : `<div class="stepper">
             <button class="add" data-act="inc" data-id="${p.id}">+</button>
           </div>`;
    return `<div class="product">
      <div class="emoji">${p.emoji || "📦"}</div>
      <div class="info">
        <div class="name">${esc(p.name)}</div>
        <div class="meta">${esc(p.size)}</div>
        <div class="price">${money(p.price)}</div>
      </div>
      ${stepper}
    </div>`;
  }

  // ---------- cart bar ----------
  function renderCartBar() {
    const count = itemCount();
    const bar = $("#cartbar");
    if (count > 0) {
      bar.classList.add("show");
      $("#cartSummary").textContent = count + (count === 1 ? " item" : " items");
      $("#cartTotal").textContent = money(subtotal());
    } else {
      bar.classList.remove("show");
    }
  }

  // ---------- cart mutations ----------
  function changeQty(id, delta) {
    const cur = state.cart[id] || 0;
    const next = Math.max(0, cur + delta);
    if (next === 0) delete state.cart[id];
    else state.cart[id] = next;
    Store.setCart(state.cart);
    renderCatalog();
    renderCartBar();
    if ($("#sheet").classList.contains("show")) renderCartView();
  }

  // ---------- sheet ----------
  function openSheet() {
    $("#backdrop").classList.add("show");
    $("#sheet").classList.add("show");
  }
  function closeSheet() {
    $("#backdrop").classList.remove("show");
    $("#sheet").classList.remove("show");
  }

  function renderCartView() {
    $("#sheetTitle").textContent = "Your order";
    const entries = cartEntries();
    if (!entries.length) {
      $("#sheetBody").innerHTML = `<div class="empty"><div class="big">🛒</div>Your cart is empty.</div>`;
      return;
    }
    const sub = subtotal();
    const fee = Store.calcDeliveryFee(sub);
    let html = "";
    entries.forEach((e) => {
      html += `<div class="cart-line">
        <div class="emoji">${e.product.emoji || "📦"}</div>
        <div class="info">
          <div class="name">${esc(e.product.name)}</div>
          <div class="meta">${esc(e.product.size)} · ${money(e.product.price)}</div>
        </div>
        <div class="stepper">
          <button data-act="dec" data-id="${e.product.id}">−</button>
          <span class="qty">${e.qty}</span>
          <button class="add" data-act="inc" data-id="${e.product.id}">+</button>
        </div>
      </div>`;
    });
    html += `<div class="totals">
      <div class="row"><span>Subtotal</span><span>${money(sub)}</span></div>
      <div class="row"><span>Delivery</span><span>${fee === 0 ? "FREE" : money(fee)}</span></div>
      <div class="row grand"><span>Total</span><span>${money(sub + fee)}</span></div>
    </div>
    ${feeHint(sub, fee)}
    <div style="margin-top:16px"><button class="btn" id="toCheckout">Checkout →</button></div>`;
    $("#sheetBody").innerHTML = html;
    $("#toCheckout").addEventListener("click", renderCheckoutView);
  }

  function feeHint(sub, fee) {
    const d = cfg.deliveryFee || {};
    if (fee === 0) return `<div class="hint">🎉 You qualify for free delivery.</div>`;
    if (d.freeThreshold && sub < d.freeThreshold) {
      return `<div class="hint">Add ${money(d.freeThreshold - sub)} more for free delivery.</div>`;
    }
    return "";
  }

  function renderCheckoutView() {
    $("#sheetTitle").textContent = "Delivery details";
    const shop = Store.getShop() || {};
    const windows = (cfg.deliveryWindows || []).map((w) => `<option ${shop.deliveryWindow === w ? "selected" : ""}>${esc(w)}</option>`).join("");
    const zones = (cfg.zones || []).map((z) => `<option ${shop.zone === z ? "selected" : ""}>${esc(z)}</option>`).join("");
    $("#sheetBody").innerHTML = `
      <label>Shop name *</label>
      <input id="f_shop" value="${esc(shop.shopName || "")}" placeholder="e.g. Bandile's Tuck Shop" />
      <label>Your name *</label>
      <input id="f_owner" value="${esc(shop.ownerName || "")}" placeholder="Owner / contact name" />
      <label>Phone (WhatsApp) *</label>
      <input id="f_phone" type="tel" value="${esc(shop.phone || "")}" placeholder="0821234567" />
      <label>Area / zone *</label>
      <select id="f_zone">${zones}</select>
      <label>Street / directions to your shop *</label>
      <textarea id="f_addr" placeholder="Street & number, nearby landmark">${esc(shop.addressNotes || "")}</textarea>
      <label>Preferred delivery window</label>
      <select id="f_window">${windows}</select>
      <label>Order notes (optional)</label>
      <textarea id="f_notes" placeholder="Anything we should know?"></textarea>
      <div class="hint">💵 Payment is <b>cash on delivery</b>. No card needed.</div>
      <div style="margin-top:16px"><button class="btn" id="placeOrder">Place order · ${money(subtotal() + Store.calcDeliveryFee(subtotal()))}</button></div>
      <div style="margin-top:8px"><button class="btn secondary" id="backToCart">← Back to cart</button></div>
    `;
    $("#backToCart").addEventListener("click", renderCartView);
    $("#placeOrder").addEventListener("click", submitOrder);
  }

  async function submitOrder() {
    const shopName = $("#f_shop").value.trim();
    const ownerName = $("#f_owner").value.trim();
    const phone = $("#f_phone").value.trim();
    const zone = $("#f_zone").value;
    const addressNotes = $("#f_addr").value.trim();
    const deliveryWindow = $("#f_window").value;
    const notes = $("#f_notes").value.trim();

    if (!shopName || !ownerName || !phone || !addressNotes) {
      alert("Please fill in shop name, your name, phone and directions.");
      return;
    }

    const items = cartEntries().map((e) => ({
      productId: e.product.id,
      sku: e.product.sku,
      name: e.product.name,
      size: e.product.size,
      qty: e.qty,
      price: e.product.price
    }));

    const btn = $("#placeOrder");
    btn.disabled = true;
    btn.textContent = "Placing order…";

    try {
      Store.saveShop({ shopName, ownerName, phone, zone, addressNotes, deliveryWindow });
      const order = await Store.placeOrder({
        shopName, ownerName, phone, zone, addressNotes, deliveryWindow, notes, items
      });
      state.cart = {};
      Store.clearCart();
      renderCatalog();
      renderCartBar();
      renderSuccess(order);
    } catch (err) {
      btn.disabled = false;
      btn.textContent = "Place order";
      alert("Sorry, something went wrong placing the order:\n" + err.message);
    }
  }

  function renderSuccess(order) {
    $("#sheetTitle").textContent = "Order placed";
    const waHref = whatsappLink(order);
    $("#sheetBody").innerHTML = `
      <div class="success">
        <div class="check">✅</div>
        <h2>Thanks, ${esc(order.ownerName)}!</h2>
        <p>Order <b>#${esc(String(order.id))}</b> received.<br/>
        Total <b>${money(order.total)}</b> · cash on delivery.<br/>
        Delivery: ${esc(order.deliveryWindow || "we'll confirm")}.</p>
        <p class="hint">Tap below to send us a WhatsApp so we confirm and pack your order.</p>
        <a class="btn" href="${waHref}" target="_blank" rel="noopener">📲 Confirm on WhatsApp</a>
        <div style="margin-top:10px"><button class="btn secondary" id="newOrder">Start a new order</button></div>
      </div>`;
    $("#newOrder").addEventListener("click", () => { closeSheet(); });
  }

  function whatsappLink(order) {
    const lines = [];
    lines.push("*New StokUp order #" + order.id + "*");
    lines.push(order.shopName + " (" + order.ownerName + ")");
    lines.push("📍 " + order.zone + " — " + order.addressNotes);
    lines.push("🕒 " + (order.deliveryWindow || "any"));
    lines.push("");
    order.items.forEach((it) => {
      lines.push("• " + it.qty + " x " + it.name + " " + it.size);
    });
    lines.push("");
    lines.push("Subtotal: " + money(order.subtotal));
    lines.push("Delivery: " + (order.deliveryFee === 0 ? "FREE" : money(order.deliveryFee)));
    lines.push("*Total (COD): " + money(order.total) + "*");
    if (order.notes) lines.push("Notes: " + order.notes);
    const num = (cfg.whatsappBusinessNumber || "").replace(/[^0-9]/g, "");
    return "https://wa.me/" + num + "?text=" + encodeURIComponent(lines.join("\n"));
  }

  // ---------- events ----------
  function wireEvents() {
    $("#chips").addEventListener("click", (e) => {
      const chip = e.target.closest(".chip");
      if (!chip) return;
      state.category = chip.dataset.cat;
      renderChips();
      renderCatalog();
    });
    $("#search").addEventListener("input", (e) => {
      state.search = e.target.value;
      renderCatalog();
    });
    $("#catalog").addEventListener("click", onStepperClick);
    $("#sheetBody").addEventListener("click", onStepperClick);
    $("#openCart").addEventListener("click", () => { renderCartView(); openSheet(); });
    $("#closeSheet").addEventListener("click", closeSheet);
    $("#backdrop").addEventListener("click", closeSheet);
  }
  function onStepperClick(e) {
    const btn = e.target.closest("button[data-act]");
    if (!btn) return;
    const id = btn.dataset.id;
    if (btn.dataset.act === "inc") changeQty(id, +1);
    else if (btn.dataset.act === "dec") changeQty(id, -1);
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
    );
  }

  document.addEventListener("DOMContentLoaded", init);
})();
