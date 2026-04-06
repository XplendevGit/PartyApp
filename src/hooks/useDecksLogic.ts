// hooks/useDecksLogic.ts
import * as Haptics from "expo-haptics";
import { useCallback, useMemo, useState } from "react";
import {
    CardData,
    DECKS_LIST,
    DECK_THEMES,
    generateMockCards,
} from "../constants/decks";

export function useDecksLogic() {
  const [selectedDeckId, setSelectedDeckId] = useState<string>(
    DECKS_LIST[0].id,
  );
  const [cardsState, setCardsState] = useState<Record<string, boolean>>({});
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null);

  const activeTheme = useMemo(
    () => DECK_THEMES[selectedDeckId],
    [selectedDeckId],
  );

  const currentCards = useMemo(() => {
    const baseCards = generateMockCards(selectedDeckId);
    return baseCards.map((card) => ({
      ...card,
      isActive: cardsState[card.id] ?? card.isActive,
    }));
  }, [selectedDeckId, cardsState]);

  const activeCount = currentCards.filter((c) => c.isActive).length;

  const toggleCard = useCallback((id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCardsState((prev) => ({ ...prev, [id]: !(prev[id] ?? true) }));
  }, []);

  const closePreview = useCallback(() => {
    setSelectedCard(null);
  }, []);

  return {
    selectedDeckId,
    setSelectedDeckId,
    activeTheme,
    currentCards,
    activeCount,
    selectedCard,
    setSelectedCard,
    toggleCard,
    closePreview,
  };
}
