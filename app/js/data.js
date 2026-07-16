/*
 * Seed catalog — ~40 fast-moving Soweto spaza SKUs.
 *
 * IMPORTANT: `cost` (wholesale) and `price` (what the shop pays you) are PLACEHOLDERS.
 * On Day 1, visit your cash-and-carry, record the real wholesale cost of each item,
 * and set `price` to include your markup (~5–8%). The admin dashboard shows your
 * margin per item so you can sanity-check pricing.
 *
 * Emoji stand in for product photos so the MVP needs zero image assets. Add real
 * `image` URLs later (Supabase storage) if you want photos.
 */
window.STOKUP_SEED_PRODUCTS = [
  // --- Staples ---
  { sku: "MZ10", name: "Maize meal (Super)", size: "10kg", category: "Staples", emoji: "🌽", cost: 89, price: 95 },
  { sku: "MZ05", name: "Maize meal (Super)", size: "5kg", category: "Staples", emoji: "🌽", cost: 48, price: 52 },
  { sku: "RC10", name: "Rice (long grain)", size: "10kg", category: "Staples", emoji: "🍚", cost: 145, price: 155 },
  { sku: "RC02", name: "Rice (long grain)", size: "2kg", category: "Staples", emoji: "🍚", cost: 35, price: 39 },
  { sku: "CF10", name: "Cake flour", size: "10kg", category: "Staples", emoji: "🌾", cost: 110, price: 119 },
  { sku: "CF25", name: "Cake flour", size: "2.5kg", category: "Staples", emoji: "🌾", cost: 33, price: 37 },
  { sku: "SG10", name: "White sugar", size: "10kg", category: "Staples", emoji: "🧂", cost: 165, price: 175 },
  { sku: "SG25", name: "White sugar", size: "2.5kg", category: "Staples", emoji: "🧂", cost: 45, price: 49 },
  { sku: "SM05", name: "Samp", size: "5kg", category: "Staples", emoji: "🌽", cost: 55, price: 60 },
  { sku: "SB02", name: "Sugar beans", size: "2kg", category: "Staples", emoji: "🫘", cost: 55, price: 60 },

  // --- Cooking ---
  { sku: "OL5L", name: "Sunflower cooking oil", size: "5L", category: "Cooking", emoji: "🛢️", cost: 175, price: 189 },
  { sku: "OL2L", name: "Sunflower cooking oil", size: "2L", category: "Cooking", emoji: "🛢️", cost: 72, price: 79 },
  { sku: "SLT1", name: "Salt", size: "1kg", category: "Cooking", emoji: "🧂", cost: 9, price: 12 },
  { sku: "TSC7", name: "Tomato sauce", size: "700ml", category: "Cooking", emoji: "🍅", cost: 28, price: 33 },
  { sku: "VIN7", name: "Brown vinegar", size: "750ml", category: "Cooking", emoji: "🧴", cost: 15, price: 19 },
  { sku: "NDL1", name: "2-minute noodles", size: "each", category: "Cooking", emoji: "🍜", cost: 5, price: 7 },

  // --- Cooldrinks & beverages ---
  { sku: "CC2L", name: "Coca-Cola", size: "2L", category: "Cooldrinks", emoji: "🥤", cost: 20, price: 25 },
  { sku: "FN2L", name: "Fanta / Sprite", size: "2L", category: "Cooldrinks", emoji: "🥤", cost: 19, price: 24 },
  { sku: "OR2L", name: "Oros concentrate", size: "2L", category: "Cooldrinks", emoji: "🧃", cost: 42, price: 48 },
  { sku: "WT50", name: "Bottled water", size: "500ml", category: "Cooldrinks", emoji: "💧", cost: 5, price: 8 },
  { sku: "JC1L", name: "Fruit juice", size: "1L", category: "Cooldrinks", emoji: "🧃", cost: 20, price: 25 },
  { sku: "MK1L", name: "Long-life milk", size: "1L", category: "Cooldrinks", emoji: "🥛", cost: 17, price: 21 },
  { sku: "TEA1", name: "Rooibos / black tea", size: "100 bags", category: "Cooldrinks", emoji: "🫖", cost: 55, price: 62 },
  { sku: "COF2", name: "Instant coffee", size: "250g", category: "Cooldrinks", emoji: "☕", cost: 45, price: 52 },

  // --- Bread & bakery ---
  { sku: "BRW1", name: "White bread loaf", size: "700g", category: "Bread", emoji: "🍞", cost: 16, price: 19 },
  { sku: "BRB1", name: "Brown bread loaf", size: "700g", category: "Bread", emoji: "🍞", cost: 15, price: 18 },

  // --- Snacks & sweets ---
  { sku: "CHP1", name: "Potato chips", size: "125g", category: "Snacks", emoji: "🥔", cost: 14, price: 18 },
  { sku: "NKN1", name: "NikNaks", size: "135g", category: "Snacks", emoji: "🧀", cost: 12, price: 16 },
  { sku: "BIS2", name: "Biscuits", size: "200g", category: "Snacks", emoji: "🍪", cost: 16, price: 21 },
  { sku: "SWT1", name: "Assorted sweets (jar)", size: "1 jar", category: "Snacks", emoji: "🍬", cost: 25, price: 32 },
  { sku: "CHW1", name: "Chappies bubblegum (box)", size: "1 box", category: "Snacks", emoji: "🫧", cost: 20, price: 26 },

  // --- Household ---
  { sku: "DSH7", name: "Dishwashing liquid", size: "750ml", category: "Household", emoji: "🧼", cost: 25, price: 30 },
  { sku: "AND7", name: "Cream cleaner", size: "750ml", category: "Household", emoji: "🧴", cost: 22, price: 27 },
  { sku: "WSH2", name: "Washing powder", size: "2kg", category: "Household", emoji: "🧺", cost: 55, price: 62 },
  { sku: "TLP9", name: "Toilet paper", size: "9 rolls", category: "Household", emoji: "🧻", cost: 48, price: 55 },
  { sku: "CDL1", name: "Candles", size: "6 pack", category: "Household", emoji: "🕯️", cost: 18, price: 23 },
  { sku: "MCH1", name: "Matches", size: "10 boxes", category: "Household", emoji: "🔥", cost: 10, price: 14 },

  // --- Personal care ---
  { sku: "SOP1", name: "Bath soap", size: "each", category: "Personal care", emoji: "🧼", cost: 8, price: 11 },
  { sku: "TPS1", name: "Toothpaste", size: "100ml", category: "Personal care", emoji: "🪥", cost: 15, price: 20 },
  { sku: "DEO1", name: "Roll-on deodorant", size: "50ml", category: "Personal care", emoji: "🧴", cost: 22, price: 28 }
];
