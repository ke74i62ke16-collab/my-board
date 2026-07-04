import type { Category } from "./types";

type CategoryConfig = {
  label: string;
  badgeClass: string;
  highlight: boolean;
};

export const CATEGORY_CONFIG: Record<Category, CategoryConfig> = {
  pack_opening: {
    label: "開封・神引き報告",
    badgeClass: "bg-amber-400 text-amber-950 font-semibold",
    highlight: true,
  },
  market: {
    label: "相場・高騰情報",
    badgeClass: "bg-emerald-800 text-emerald-50",
    highlight: false,
  },
  new_cards: {
    label: "新カード・新弾情報",
    badgeClass: "bg-blue-800 text-blue-50",
    highlight: false,
  },
  chat: {
    label: "雑談",
    badgeClass: "bg-zinc-600 text-zinc-100",
    highlight: false,
  },
  deck: {
    label: "デッキ・対戦相談",
    badgeClass: "bg-purple-800 text-purple-50",
    highlight: false,
  },
};

export const CATEGORY_ORDER: Category[] = [
  "pack_opening",
  "market",
  "new_cards",
  "chat",
  "deck",
];
