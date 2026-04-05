// constants/avatars.ts

export interface AvatarData {
  id: string;
  icon: string;
  name: string;
  unlocked: boolean;
  cost?: number;
  event?: string;
}

export const AVATARS_LIST: AvatarData[] = [
  { id: "1", icon: "👤", name: "Novato", unlocked: true },
  { id: "2", icon: "🤡", name: "Bufón", unlocked: true },
  { id: "3", icon: "🍺", name: "Borrachín", unlocked: true },
  { id: "4", icon: "👑", name: "Rey VIP", unlocked: false, cost: 500 },
  { id: "5", icon: "🎸", name: "Rockstar", unlocked: false, cost: 1000 },
  {
    id: "6",
    icon: "👽",
    name: "Abducido",
    unlocked: false,
    event: "Halloween 2026",
  },
  { id: "7", icon: "🤖", name: "Cyborg", unlocked: false, cost: 2000 },
  { id: "8", icon: "🧙‍♂️", name: "Mago", unlocked: false, event: "Torneo Anual" },
];
