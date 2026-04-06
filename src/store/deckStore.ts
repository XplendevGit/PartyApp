import { create } from "zustand";
import { Deck } from "../domain/entities/Deck";
import { GetDecksUseCase } from "../domain/use-cases/GetDecksUseCase";
import { DeckRepository } from "../infrastructure/repositories/DeckRepository";

interface DeckState {
  decks: Deck[];
  isLoading: boolean;
  error: string | null;
  fetchDecks: () => Promise<void>;
}

const deckRepository = new DeckRepository();
const getDecksUseCase = new GetDecksUseCase(deckRepository);

export const useDeckStore = create<DeckState>((set) => ({
  decks: [],
  isLoading: false,
  error: null,

  fetchDecks: async () => {
    set({ isLoading: true, error: null });
    try {
      const fetchedDecks = await getDecksUseCase.execute();
      set({ decks: fetchedDecks, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },
}));
