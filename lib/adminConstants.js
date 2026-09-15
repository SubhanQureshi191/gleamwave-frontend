import { API_URL } from "./config";

// ── COLOUR PALETTE ──────────────────────────────────────────────
export const C = {
  white: "#FFFFFF",
  whiteOff: "#FDF8F3",
  maroon: "#6F4E37",
  maroonDark: "#4A2E22",
  maroonLight: "#8B6F47",
  maroonPale: "#F0E6DA",
  gold: "#B8956A",
  goldLight: "#E8D9C0",
  goldPale: "#F5EDE0",
  text: "#3D2B1F",
  textMid: "#6B4F3A",
  textLight: "#A08070",
  pending: "#F59E0B",
  confirmed: "#3B82F6",
  shipped: "#8B5CF6",
  delivered: "#10B981",
  cancelled: "#EF4444",
  profitGreen: "#059669",
  lossRed: "#DC2626",
};

// ─── ALL CATEGORIES ──────────────────────────────────────────────
export const ALL_CATEGORIES = [
  "Resin Rings",
  "Resin Bracelets",
  "Resin Pendants",
  "Resin Studs",
  "Resin Jhumkas",
  "Resin MDFs",
  "Resin Trays",
  "Wooden Frames",
  "Silk Bouquet",
  "Trending Gajra",
  "Customized Certificates",
  "Booklet",
  "Resin Stationery",
  "Quran Rehal",
  "Baskets",
  "Customize Gleamwave Basket",
];

// Re-exported so every admin file that does
// `import { API_URL } from "@/lib/adminConstants"` keeps working
// unchanged — the real value now comes from lib/config.js.
export { API_URL };