/*
 * StokUp configuration.
 * Edit these values — no code changes needed elsewhere.
 */
window.STOKUP_CONFIG = {
  // --- Branding ---
  brandName: "StokUp",
  tagline: "Stock your spaza without leaving it.",
  currency: "R",

  // --- Operator contact ---
  // WhatsApp number in FULL international format, digits only (no +, no spaces).
  // Example for South Africa: 27 then the number without the leading 0 -> 27821234567
  whatsappBusinessNumber: "27000000000",

  // --- Delivery pricing (Rands) ---
  // Fee shrinks as the order grows, and is free above a threshold.
  deliveryFee: {
    base: 60,              // fee for a normal order
    reducedThreshold: 1500, // subtotal at/above which fee drops
    reduced: 40,
    freeThreshold: 3000     // subtotal at/above which delivery is free
  },

  // --- Delivery windows offered at checkout (batched runs) ---
  deliveryWindows: [
    "Tuesday 08:00–12:00",
    "Friday 08:00–12:00"
  ],

  // --- Launch zone(s). Keep it tight for delivery density. ---
  zones: [
    "Meadowlands",
    "Orlando East",
    "Orlando West",
    "Dube",
    "Diepkloof",
    "Zola",
    "Other"
  ],

  // --- Supabase (leave BOTH blank to run in local/single-device mode) ---
  // Fill these in for the real multi-shop pilot. See db/schema.sql + README.
  SUPABASE_URL: "",
  SUPABASE_ANON_KEY: "",

  // --- Simple admin gate (MVP only; not real security) ---
  // Change this before sharing the admin link. Real auth is a Phase-2 item.
  adminPin: "1234"
};
