import { Player } from "../store/playerStore";

export const getDynamicContent = (
  text: string,
  currentPlayer: Player | undefined,
  players: Player[],
) => {
  if (!text || !text.includes("{random_player}") || !currentPlayer) return text;

  const otherPlayers = players.filter((p) => p.id !== currentPlayer.id);
  const randomVictim =
    otherPlayers.length > 0
      ? otherPlayers[Math.floor(Math.random() * otherPlayers.length)].name
      : "el de tu derecha";

  return text.replace(/{random_player}/g, randomVictim.toUpperCase());
};

export const applyFuelFilter = (text: string, fuel: string | undefined) => {
  if (!text || !fuel) return text;
  let filteredText = text;

  const isThirdPersonOrGroup =
    /(el que|los que|quien|alguien|nadie|regala|reparte|todos|último|primero|prohibido|el perdedor)/gi.test(
      text,
    ) || text.includes("{random_player}");

  if (isThirdPersonOrGroup) {
    filteredText = filteredText.replace(
      /toma (\d+) tragos?/gi,
      "asume $1 castigos 🎯",
    );
    filteredText = filteredText.replace(/(\d+) tragos?/gi, "$1 castigos 🎯");
    filteredText = filteredText.replace(/un trago/gi, "1 castigo 🎯");
    filteredText = filteredText.replace(/toma/gi, "asume");
  } else {
    if (fuel === "💧") {
      filteredText = filteredText.replace(/tragos?/gi, "vasos de agua 🚰");
      filteredText = filteredText.replace(/toma/gi, "toma agüita");
      filteredText = filteredText.replace(/al seco/gi, "haz 10 flexiones 💪");
      filteredText = filteredText.replace(/shot/gi, "sentadillas");
    } else if (fuel === "🚬") {
      filteredText = filteredText.replace(/tragos?/gi, "caladas 💨");
      filteredText = filteredText.replace(/toma/gi, "fuma");
      filteredText = filteredText.replace(
        /al seco/gi,
        "aguanta el humo 5 seg 😶‍🌫️",
      );
      filteredText = filteredText.replace(/shot/gi, "hit de bong 🌿");
    }
  }
  return filteredText;
};
