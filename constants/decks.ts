// constants/decks.ts
export type GameMode = "PREVIA" | "DESTRUCCION" | "FAMILIAR" | "CITAS" | "HOT";

export interface CardData {
  id: string;
  deckId: string;
  title: string;
  mode: GameMode;
  isUnlocked: boolean;
  icon: string;
  rarity: "COMUN" | "RARA" | "EPICA" | "LEGENDARIA";
  description?: string;
  isActive: boolean; // Vital para La Forja
}

export interface DeckTheme {
  id: string;
  name: string;
  primaryText: string;
  primaryBg: string;
  // Propiedades estrictas para tu CardPreviewModal
  bg: readonly [string, string, ...string[]];
  border: string;
  iconBg: string;
}

export const DECK_THEMES: Record<string, DeckTheme> = {
  "d290f1ee-6c54-4b01-90e6-d701748f0851": {
    id: "d290f1ee-6c54-4b01-90e6-d701748f0851",
    name: "Previa Piola",
    primaryText: "text-cyan-400",
    primaryBg: "bg-cyan-600",
    bg: ["#0891b2", "#0e7490", "#155e75", "#164e63"],
    border: "border-cyan-400",
    iconBg: "bg-cyan-500/20",
  },
  "e439569b-9806-441d-91b7-60e0a4ec2912": {
    id: "e439569b-9806-441d-91b7-60e0a4ec2912",
    name: "Destrucción",
    primaryText: "text-purple-500",
    primaryBg: "bg-purple-600",
    bg: ["#a855f7", "#9333ea", "#7e22ce", "#581c87"],
    border: "border-purple-500",
    iconBg: "bg-purple-500/20",
  },
  "f6324908-412e-4b2e-84d4-28b3b3fa1094": {
    id: "f6324908-412e-4b2e-84d4-28b3b3fa1094",
    name: "Familiar",
    primaryText: "text-emerald-400",
    primaryBg: "bg-emerald-600",
    bg: ["#10b981", "#059669", "#047857", "#064e3b"],
    border: "border-emerald-400",
    iconBg: "bg-emerald-500/20",
  },
};

export const DECKS_LIST = Object.values(DECK_THEMES);

export const generateMockCards = (deckId: string): CardData[] => {
  return Array.from({ length: 30 }).map((_, i) => ({
    id: `card-${deckId}-${i}`,
    deckId,
    title: "RETO DE PRUEBA",
    mode: "PREVIA",
    isUnlocked: true,
    icon: ["🍻", "🔥", "🤡", "💖", "🌶️", "🎸"][i % 6],
    description:
      "INTERCAMBIA TU 'VENENO' (TU VASO, TU CIGARRO, ETC) CON PEDRO POR LO QUE QUEDA DE ESTE TURNO.",
    rarity: i % 8 === 0 ? "LEGENDARIA" : i % 4 === 0 ? "EPICA" : "COMUN",
    isActive: true,
  }));
};
