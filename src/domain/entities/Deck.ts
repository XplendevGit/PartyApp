export type DeckUnlockType = "FREE" | "FREEMIUM" | "PREMIUM";

export interface Deck {
  id: string;
  title: string; // Lo usaremos para el frontend (en BD es 'name')
  description: string;
  icon: string; // Emoji o icono
  unlockType: DeckUnlockType;
  unlockCost: number; // Costo en tapitas
}
