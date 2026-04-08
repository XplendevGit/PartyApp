// src/domain/entities/Deck.ts

export type DeckTheme = {
  bg: string;
  border: string;
  borderBottom: string;
  textTitle: string;
  textDesc: string;
  particleColor: string;
};

export type DeckType = "FREE" | "FREEMIUM" | "PREMIUM";

export interface Deck {
  id: string;
  title: string;
  description: string;
  type: DeckType;
  cost: number;
  hasAccess: boolean;
  icon: string; // 👈 Viene directo de Supabase
  theme: DeckTheme; // 👈 Viene directo de Supabase
}
