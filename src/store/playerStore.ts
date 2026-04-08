import { create } from "zustand";
import { supabase } from "../lib/supabase"; // Ajusta el path según tu arquitectura

export interface Venom {
  id: string;
  name: string;
  icon: string;
  multiplier: number;
  category: string;
}

export interface PlayerColor {
  id: string;
  hex_code: string;
}

export interface SessionPlayer {
  id: string;
  name: string;
  venom: Venom;
  color: string;
  isOwner: boolean;
  score: number;
}

interface PlayerStore {
  players: SessionPlayer[];
  availableVenoms: Venom[];
  availableColors: PlayerColor[];
  loading: boolean;
  error: string | null;

  fetchMasterData: (category: "standard" | "hot") => Promise<void>;
  addPlayer: (name: string) => void;
  removePlayer: (id: string) => void;
  cycleVenom: (id: string) => void;
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  players: [],
  availableVenoms: [],
  availableColors: [],
  loading: false,
  error: null,

  fetchMasterData: async (category) => {
    set({ loading: true, error: null });

    try {
      const [venomsRes, colorsRes] = await Promise.all([
        supabase
          .from("venoms")
          .select("*")
          .eq("category", category)
          .order("order_index", { ascending: true }),
        supabase
          .from("player_colors")
          .select("*")
          .order("order_index", { ascending: true }),
      ]);

      if (venomsRes.error) throw venomsRes.error;
      if (colorsRes.error) throw colorsRes.error;

      set({
        availableVenoms: venomsRes.data as Venom[],
        availableColors: colorsRes.data as PlayerColor[],
        loading: false,
      });
    } catch (err: any) {
      set({ error: err.message, loading: false });
      console.error("Store Error [fetchMasterData]:", err.message);
    }
  },

  addPlayer: (name) => {
    const { players, availableVenoms, availableColors } = get();

    if (!availableVenoms.length || !availableColors.length) {
      console.warn("Store Warning [addPlayer]: Master data not loaded.");
      return;
    }

    const nextColor =
      availableColors[players.length % availableColors.length].hex_code;
    const isOwner = players.length === 0;

    const newPlayer: SessionPlayer = {
      id: Date.now().toString(), // ID temporal para la sesión
      name,
      venom: availableVenoms[0],
      color: nextColor,
      isOwner,
      score: 0,
    };

    set({ players: [...players, newPlayer] });
  },

  removePlayer: (id) =>
    set((state) => ({
      players: state.players.filter((p) => p.id !== id),
    })),

  cycleVenom: (id) => {
    const { players, availableVenoms } = get();
    if (!availableVenoms.length) return;

    const updatedPlayers = players.map((p) => {
      if (p.id !== id) return p;
      const currentIndex = availableVenoms.findIndex(
        (v) => v.id === p.venom.id,
      );
      const nextIndex = (currentIndex + 1) % availableVenoms.length;
      return { ...p, venom: availableVenoms[nextIndex] };
    });
    set({ players: updatedPlayers });
  },
}));
