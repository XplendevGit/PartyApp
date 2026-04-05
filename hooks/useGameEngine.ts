import { CameraView, useCameraPermissions } from "expo-camera";
import { router } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useGameStore } from "../store/gameStore";
import { usePlayerStore } from "../store/playerStore";
import { applyFuelFilter, getDynamicContent } from "../utils/gameFilters";

export function useGameEngine(deckId: string | undefined) {
  const { cards, fetchCards, isLoading, setLoserPhotoUri } =
    useGameStore() as any;
  const { players, updatePlayerScore, injectMockPlayers } =
    usePlayerStore() as any;

  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  useEffect(() => {
    if (deckId) {
      if (!players || players.length === 0) {
        if (injectMockPlayers) injectMockPlayers();
      }
      if (fetchCards) fetchCards(deckId);
      setCurrentCardIndex(0);
      setCurrentPlayerIndex(0);
    }
  }, [deckId]);

  useEffect(() => {
    if (!permission?.granted && permission?.canAskAgain) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const takeLoserPhotoInBackground = useCallback(async () => {
    if (permission?.granted && cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.1,
          base64: false,
          skipProcessing: true,
        });
        if (photo?.uri) setLoserPhotoUri(photo.uri);
      } catch (error) {
        console.log("Flashazo silenciado:", error);
      }
    }
  }, [permission, setLoserPhotoUri]);

  const handleAction = async (type: "success" | "fail") => {
    const currentPlayer = players?.[currentPlayerIndex];
    if (!currentPlayer) return;

    if (updatePlayerScore) {
      updatePlayerScore(String(currentPlayer.id), type);
    }

    if (type === "fail" && Math.random() > 0.5) {
      takeLoserPhotoInBackground();
    }

    if (currentCardIndex < cards.length - 1) {
      setCurrentCardIndex((prev: number) => prev + 1);
      setCurrentPlayerIndex((prev: number) => (prev + 1) % players.length);
      setIsProcessingAction(false); // Liberamos la acción instantáneamente
    } else {
      router.replace("/podium");
    }
  };

  const currentCard = cards?.[currentCardIndex];
  const currentPlayer = players?.[currentPlayerIndex];

  const processedContent = currentCard
    ? applyFuelFilter(
        getDynamicContent(currentCard.content, currentPlayer, players),
        currentPlayer?.fuel,
      )
    : "";

  const processedPenalty = currentCard
    ? applyFuelFilter(currentCard.penalty, currentPlayer?.fuel)
    : "";

  return {
    isLoading,
    players,
    cards,
    currentCardIndex,
    currentPlayer,
    processedContent,
    processedPenalty,
    permission,
    cameraRef,
    isProcessingAction,
    setIsProcessingAction, // Lo exportamos para controlar el bloqueo desde la UI
    handleAction,
  };
}
