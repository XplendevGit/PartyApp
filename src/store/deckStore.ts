// src/store/deckStore.ts
import { Deck } from "@/src/domain/entities/Deck";
import { DeckRepository } from "@/src/infrastructure/repositories/DeckRepository";
import { supabase } from "@/src/lib/supabase"; // Solo para la transacción de compra
import { create } from "zustand";

interface DeckState {
  decks: Deck[];
  isLoading: boolean;
  error: string | null;
  fetchDecks: () => Promise<void>;
  // 🔥 NUEVO: Función para comprar el mazo
  unlockPremiumDeck: (
    deckId: string,
    cost: number,
    userId: string,
  ) => Promise<boolean>;
}

// Instanciamos tu repositorio (La fuente de la verdad)
const deckRepository = new DeckRepository();

export const useDeckStore = create<DeckState>((set, get) => ({
  decks: [],
  isLoading: false,
  error: null,

  fetchDecks: async () => {
    set({ isLoading: true, error: null });
    try {
      // 🔥 CERO HARDCODEO: Usamos la lógica de tu Repository que ya verifica los mazos comprados
      const decks = await deckRepository.getDecksForUser();
      set({ decks, isLoading: false });
    } catch (error: any) {
      console.error("Error en fetchDecks:", error.message);
      set({ error: error.message, isLoading: false });
    }
  },

  unlockPremiumDeck: async (deckId: string, cost: number, userId: string) => {
    try {
      set({ isLoading: true, error: null });

      // 1. Obtener balance actual del usuario desde la DB para evitar fraudes
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("tapitas_balance")
        .eq("id", userId)
        .single();

      if (userError || !userData)
        throw new Error("No se pudo verificar el saldo.");
      if (userData.tapitas_balance < cost)
        throw new Error("No tienes suficientes Tapitas.");

      // 2. Descontar Tapitas al usuario
      const newBalance = userData.tapitas_balance - cost;
      const { error: updateError } = await supabase
        .from("users")
        .update({ tapitas_balance: newBalance })
        .eq("id", userId);

      if (updateError) throw updateError;

      // 3. Registrar el mazo como desbloqueado en la tabla pivote
      const { error: unlockError } = await supabase
        .from("user_unlocked_decks")
        .insert([{ user_id: userId, deck_id: deckId }]);

      if (unlockError) throw unlockError;

      // 4. Refrescar los mazos en el Store para que desaparezca el candado
      await get().fetchDecks();

      return true; // Compra exitosa
    } catch (error: any) {
      console.error("Error al comprar mazo:", error.message);
      set({ error: error.message, isLoading: false });
      return false; // Falló la compra
    }
  },
}));
