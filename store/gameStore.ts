import { create } from "zustand";

interface Card {
  id: string;
  deck_id: string;
  content: string;
  penalty: string;
}

interface GameState {
  cards: Card[];
  isLoading: boolean;
  loserPhotoUri: string | null;
  setLoserPhotoUri: (uri: string | null) => void;
  fetchCards: (deckId: string) => Promise<void>;
}

export const useGameStore = create<GameState>((set) => ({
  cards: [],
  isLoading: false,
  loserPhotoUri: null,
  setLoserPhotoUri: (uri) => set({ loserPhotoUri: uri }),

  fetchCards: async (deckId: string) => {
    set({ isLoading: true });
    await new Promise((resolve) => setTimeout(resolve, 500));

    const premiumMockCards: Card[] = [
      {
        id: "c1",
        deck_id: deckId,
        content: "Muestra la última foto de tu galería, sin excusas.",
        penalty: "Si te niegas, toma 3 tragos 🥃",
      },
      {
        id: "c2",
        deck_id: deckId,
        content:
          "¡Cuidado! {random_player} decide un reto físico para ti en este momento.",
        penalty: "Si te acobardas, al seco 🌪️",
      },
      {
        id: "c3",
        deck_id: deckId,
        content:
          "El grupo debe votar a la cuenta de tres: ¿Quién de los presentes es más probable que termine en la cárcel?",
        penalty: "El más votado toma 2 tragos 🥃",
      },
      {
        id: "c4",
        deck_id: deckId,
        content: "Nombra 3 ex-parejas tuyas en menos de 5 segundos.",
        penalty: "Si tartamudeas, toma 1 trago 🥃",
      },
      {
        id: "c5",
        deck_id: deckId,
        content:
          "Intercambia tu 'veneno' (tu vaso, tu cigarro, etc) con {random_player} por lo que queda de este turno.",
        penalty: "Si uno de los dos se niega, ambos toman 4 tragos 🥃",
      },
      {
        id: "c6",
        deck_id: deckId,
        content:
          "Confiesa: ¿Has revisado el celular de tu pareja a escondidas alguna vez?",
        penalty: "Si mientes o no respondes, shot directo 🎯",
      },
      {
        id: "c7",
        deck_id: deckId,
        content:
          "Imita a alguien del grupo. Los demás tienen 10 segundos para adivinar quién es.",
        penalty:
          "Si no adivinan, tomas tú. Si adivinan, todos toman 1 trago 🥃",
      },
      {
        id: "c8",
        deck_id: deckId,
        content:
          "Regla del Dinosaurio: Hasta que vuelva a ser tu turno, debes caminar como un T-Rex. Si bajas los brazos...",
        penalty: "Toma 2 tragos 🥃 cada vez que te pillen.",
      },
    ];

    set({ cards: premiumMockCards, isLoading: false });
  },
}));
