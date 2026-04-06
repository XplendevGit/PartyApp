import { create } from "zustand";

// 🎨 PALETA DE COLORES NEÓN PARA JUGADORES (Escalable)
const PLAYER_COLORS = [
  "#ef4444", // Rojo
  "#3b82f6", // Azul
  "#10b981", // Verde
  "#f59e0b", // Ambar
  "#8b5cf6", // Violeta
  "#ec4899", // Rosa
  "#06b6d4", // Cyan
  "#f97316", // Naranja
];

export interface Player {
  id: string;
  name: string;
  fuel: number;
  color: string;
  isOwner: boolean;
}

interface PlayerStore {
  players: Player[];
  addPlayer: (name: string) => void;
  removePlayer: (id: string) => void;
  toggleFuel: (id: string) => void;
}

export const usePlayerStore = create<PlayerStore>((set) => ({
  players: [],

  addPlayer: (name) =>
    set((state) => {
      // Asignar color secuencial basado en la cantidad de jugadores actuales
      const nextColor =
        PLAYER_COLORS[state.players.length % PLAYER_COLORS.length];
      // El primer jugador en ser agregado es automáticamente el Host (isOwner: true)
      const isOwner = state.players.length === 0;

      const newPlayer: Player = {
        id: Date.now().toString(),
        name,
        fuel: 0,
        color: nextColor,
        isOwner,
      };

      return { players: [...state.players, newPlayer] };
    }),

  removePlayer: (id) =>
    set((state) => ({
      players: state.players.filter((p) => p.id !== id),
    })),

  toggleFuel: (id) =>
    set((state) => ({
      players: state.players.map((p) =>
        p.id === id ? { ...p, fuel: p.fuel + 1 } : p,
      ),
    })),
}));
