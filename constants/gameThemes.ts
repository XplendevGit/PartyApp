// constants/gameThemes.ts

export interface DeckTheme {
  name: string;
  primaryText: string;
  primaryBorder: string;
  primaryBg: string;
  cardGradients: [string, string, string, string];
  shadowColor: string;
  bgOrbs: [string, string];
  accent: string;
}

export const DECK_THEMES: Record<string, DeckTheme> = {
  "d290f1ee-6c54-4b01-90e6-d701748f0851": {
    name: "Previa Piola",
    primaryText: "text-cyan-400",
    primaryBorder: "border-cyan-400",
    primaryBg: "bg-cyan-600",
    cardGradients: ["#0891b2", "#0e7490", "#155e75", "#164e63"],
    shadowColor: "rgba(34, 211, 238, 0.8)",
    bgOrbs: ["rgba(34, 211, 238, 0.15)", "rgba(56, 189, 248, 0.1)"],
    accent: "#22d3ee",
  },
  "e439569b-9806-441d-91b7-60e0a4ec2912": {
    name: "Modo Destrucción",
    primaryText: "text-purple-500",
    primaryBorder: "border-purple-500",
    primaryBg: "bg-purple-600",
    cardGradients: ["#a855f7", "#9333ea", "#7e22ce", "#581c87"],
    shadowColor: "rgba(168, 85, 247, 0.8)",
    bgOrbs: ["rgba(168, 85, 247, 0.15)", "rgba(147, 51, 234, 0.1)"],
    accent: "#a855f7",
  },
  "f6324908-412e-4b2e-84d4-28b3b3fa1094": {
    name: "Familiar",
    primaryText: "text-emerald-400",
    primaryBorder: "border-emerald-400",
    primaryBg: "bg-emerald-600",
    cardGradients: ["#10b981", "#059669", "#047857", "#064e3b"],
    shadowColor: "rgba(52, 211, 153, 0.8)",
    bgOrbs: ["rgba(52, 211, 153, 0.15)", "rgba(16, 185, 129, 0.1)"],
    accent: "#34d399",
  },
  "a82b9881-1921-4f18-bc71-70ab5570024f": {
    name: "2 Pa 2 / Citas",
    primaryText: "text-pink-400",
    primaryBorder: "border-pink-400",
    primaryBg: "bg-pink-600",
    cardGradients: ["#f472b6", "#db2777", "#be185d", "#831843"],
    shadowColor: "rgba(244, 114, 182, 0.8)",
    bgOrbs: ["rgba(244, 114, 182, 0.15)", "rgba(219, 39, 119, 0.1)"],
    accent: "#f472b6",
  },
  "c48e244b-4a53-43cb-8c9e-5e7b2cd90ab1": {
    name: "Modo HOT 🔥",
    primaryText: "text-red-500",
    primaryBorder: "border-red-500",
    primaryBg: "bg-red-600",
    cardGradients: ["#ef4444", "#dc2626", "#b91c1c", "#7f1d1d"],
    shadowColor: "rgba(239, 68, 68, 0.8)",
    bgOrbs: ["rgba(239, 68, 68, 0.15)", "rgba(185, 28, 28, 0.15)"],
    accent: "#ef4444",
  },
  default: {
    name: "La Arena",
    primaryText: "text-fuchsia-400",
    primaryBorder: "border-fuchsia-400",
    primaryBg: "bg-fuchsia-600",
    cardGradients: ["#d946ef", "#c026d3", "#a21caf", "#701a75"],
    shadowColor: "rgba(217, 70, 239, 0.8)",
    bgOrbs: ["rgba(217, 70, 239, 0.15)", "rgba(192, 38, 211, 0.1)"],
    accent: "#d946ef",
  },
};
