/*
 * Store — the single data layer for the whole app.
 *
 * It exposes ONE async interface used by both the customer app and the admin app.
 * Under the hood it picks a backend automatically:
 *   - If config.SUPABASE_URL + SUPABASE_ANON_KEY are set  -> Supabase (shared, multi-device)
 *   - Otherwise                                           -> localStorage (single-device demo)
 *
 * Everything returns Promises so the two backends are interchangeable.
 */
(function () {
  const cfg = window.STOKUP_CONFIG || {};
  const useSupabase = Boolean(cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY);

  const KEYS = {
    products: "stokup_products",
    orders: "stokup_orders",
    cart: "stokup_cart",
    shop: "stokup_shop" // remembered shop details for faster checkout
  };

  const ORDER_STATUSES = ["NEW", "CONFIRMED", "OUT_FOR_DELIVERY", "DELIVERED", "PAID", "CANCELLED"];
  const STATUS_LABELS = {
    NEW: "New",
    CONFIRMED: "Confirmed",
    OUT_FOR_DELIVERY: "Out for delivery",
    DELIVERED: "Delivered",
    PAID: "Paid",
    CANCELLED: "Cancelled"
  };

  // ---------- shared helpers ----------
  function lsGet(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }
  function lsSet(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function calcDeliveryFee(subtotal) {
    const d = cfg.deliveryFee || { base: 60, reducedThreshold: 1500, reduced: 40, freeThreshold: 3000 };
    if (subtotal >= d.freeThreshold) return 0;
    if (subtotal >= d.reducedThreshold) return d.reduced;
    return d.base;
  }

  // ---------- Supabase REST adapter (no SDK / no CDN needed) ----------
  const sb = {
    headers(extra) {
      return Object.assign(
        {
          apikey: cfg.SUPABASE_ANON_KEY,
          Authorization: "Bearer " + cfg.SUPABASE_ANON_KEY,
          "Content-Type": "application/json"
        },
        extra || {}
      );
    },
    async req(path, options) {
      const res = await fetch(cfg.SUPABASE_URL + "/rest/v1/" + path, options);
      if (!res.ok) {
        const text = await res.text();
        throw new Error("Supabase " + res.status + ": " + text);
      }
      if (res.status === 204) return null;
      return res.json();
    }
  };

  // ---------- product operations ----------
  async function getProducts(opts) {
    const activeOnly = opts && opts.activeOnly;
    if (useSupabase) {
      let path = "products?select=*&order=category.asc,name.asc";
      if (activeOnly) path += "&active=eq.true";
      return sb.req(path, { headers: sb.headers() });
    }
    // local
    let products = lsGet(KEYS.products, null);
    if (!products) {
      products = seedLocalProducts();
    }
    products = products.slice().sort(
      (a, b) => (a.category + a.name).localeCompare(b.category + b.name)
    );
    return activeOnly ? products.filter((p) => p.active !== false) : products;
  }

  function seedLocalProducts() {
    const seed = (window.STOKUP_SEED_PRODUCTS || []).map((p, i) => ({
      id: "p" + (i + 1),
      sku: p.sku,
      name: p.name,
      size: p.size,
      category: p.category,
      emoji: p.emoji || "📦",
      cost: p.cost,
      price: p.price,
      active: true
    }));
    lsSet(KEYS.products, seed);
    return seed;
  }

  async function saveProduct(product) {
    if (useSupabase) {
      if (product.id) {
        const rows = await sb.req("products?id=eq." + encodeURIComponent(product.id), {
          method: "PATCH",
          headers: sb.headers({ Prefer: "return=representation" }),
          body: JSON.stringify(stripId(product))
        });
        return rows[0];
      }
      const rows = await sb.req("products", {
        method: "POST",
        headers: sb.headers({ Prefer: "return=representation" }),
        body: JSON.stringify(stripId(product))
      });
      return rows[0];
    }
    // local
    const products = await getProducts({});
    if (product.id) {
      const idx = products.findIndex((p) => p.id === product.id);
      if (idx >= 0) products[idx] = Object.assign({}, products[idx], product);
    } else {
      product.id = "p" + Date.now();
      products.push(product);
    }
    lsSet(KEYS.products, products);
    return product;
  }

  function stripId(obj) {
    const copy = Object.assign({}, obj);
    delete copy.id;
    return copy;
  }

  // ---------- cart (always device-local) ----------
  function getCart() {
    return lsGet(KEYS.cart, {}); // { productId: qty }
  }
  function setCart(cart) {
    lsSet(KEYS.cart, cart);
  }
  function clearCart() {
    lsSet(KEYS.cart, {});
  }

  // ---------- remembered shop details ----------
  function getShop() {
    return lsGet(KEYS.shop, null);
  }
  function saveShop(shop) {
    lsSet(KEYS.shop, shop);
  }

  // ---------- orders ----------
  /**
   * orderInput = {
   *   shopName, ownerName, phone, zone, addressNotes, deliveryWindow, notes,
   *   items: [{ productId, sku, name, size, qty, price }]
   * }
   */
  async function placeOrder(orderInput) {
    const items = orderInput.items || [];
    const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0);
    const deliveryFee = calcDeliveryFee(subtotal);
    const total = subtotal + deliveryFee;
    const createdAt = new Date().toISOString();

    if (useSupabase) {
      const orderRows = await sb.req("orders", {
        method: "POST",
        headers: sb.headers({ Prefer: "return=representation" }),
        body: JSON.stringify({
          shop_name: orderInput.shopName,
          owner_name: orderInput.ownerName,
          phone: orderInput.phone,
          zone: orderInput.zone,
          address_notes: orderInput.addressNotes,
          delivery_window: orderInput.deliveryWindow,
          notes: orderInput.notes || "",
          status: "NEW",
          subtotal: subtotal,
          delivery_fee: deliveryFee,
          total: total
        })
      });
      const order = orderRows[0];
      const itemsPayload = items.map((it) => ({
        order_id: order.id,
        product_id: it.productId,
        sku: it.sku,
        name: it.name,
        size: it.size,
        qty: it.qty,
        unit_price: it.price,
        line_total: it.price * it.qty
      }));
      await sb.req("order_items", {
        method: "POST",
        headers: sb.headers(),
        body: JSON.stringify(itemsPayload)
      });
      return normalizeOrder(order, items, subtotal, deliveryFee, total, createdAt);
    }

    // local
    const orders = lsGet(KEYS.orders, []);
    const order = {
      id: "o" + Date.now(),
      shopName: orderInput.shopName,
      ownerName: orderInput.ownerName,
      phone: orderInput.phone,
      zone: orderInput.zone,
      addressNotes: orderInput.addressNotes,
      deliveryWindow: orderInput.deliveryWindow,
      notes: orderInput.notes || "",
      status: "NEW",
      subtotal: subtotal,
      deliveryFee: deliveryFee,
      total: total,
      createdAt: createdAt,
      items: items
    };
    orders.unshift(order);
    lsSet(KEYS.orders, orders);
    return order;
  }

  function normalizeOrder(row, items, subtotal, deliveryFee, total, createdAt) {
    // Map a Supabase row (snake_case) into the app's camelCase order shape.
    return {
      id: row.id,
      shopName: row.shop_name,
      ownerName: row.owner_name,
      phone: row.phone,
      zone: row.zone,
      addressNotes: row.address_notes,
      deliveryWindow: row.delivery_window,
      notes: row.notes,
      status: row.status,
      subtotal: row.subtotal != null ? Number(row.subtotal) : subtotal,
      deliveryFee: row.delivery_fee != null ? Number(row.delivery_fee) : deliveryFee,
      total: row.total != null ? Number(row.total) : total,
      createdAt: row.created_at || createdAt,
      items: (row.order_items || items || []).map((it) => ({
        productId: it.product_id != null ? it.product_id : it.productId,
        sku: it.sku,
        name: it.name,
        size: it.size,
        qty: it.qty,
        price: it.unit_price != null ? Number(it.unit_price) : it.price
      }))
    };
  }

  async function getOrders() {
    if (useSupabase) {
      const rows = await sb.req(
        "orders?select=*,order_items(*)&order=created_at.desc",
        { headers: sb.headers() }
      );
      return rows.map((r) => normalizeOrder(r));
    }
    return lsGet(KEYS.orders, []);
  }

  async function updateOrderStatus(id, status) {
    if (!ORDER_STATUSES.includes(status)) throw new Error("Unknown status: " + status);
    if (useSupabase) {
      await sb.req("orders?id=eq." + encodeURIComponent(id), {
        method: "PATCH",
        headers: sb.headers(),
        body: JSON.stringify({ status: status })
      });
      return;
    }
    const orders = lsGet(KEYS.orders, []);
    const idx = orders.findIndex((o) => String(o.id) === String(id));
    if (idx >= 0) {
      orders[idx].status = status;
      lsSet(KEYS.orders, orders);
    }
  }

  // ---------- expose ----------
  window.Store = {
    mode: useSupabase ? "supabase" : "local",
    ORDER_STATUSES: ORDER_STATUSES,
    STATUS_LABELS: STATUS_LABELS,
    calcDeliveryFee: calcDeliveryFee,
    getProducts: getProducts,
    saveProduct: saveProduct,
    getCart: getCart,
    setCart: setCart,
    clearCart: clearCart,
    getShop: getShop,
    saveShop: saveShop,
    placeOrder: placeOrder,
    getOrders: getOrders,
    updateOrderStatus: updateOrderStatus
  };
})();
