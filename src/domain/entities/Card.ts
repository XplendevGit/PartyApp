// src/domain/entities/Card.ts

export type UsageType = "Reusable" | "OncePerGame";
export type IntensityLevel = 1 | 2 | 3 | 4 | 5;

export interface Card {
  id: string; // UUID de Supabase
  deckId: string; // Referencia al Deck
  cardCode: string; // Tu código del Excel: 'PREV-001'

  // Economía y Metadatos
  costTapitas: number;
  intensityLevel: IntensityLevel;
  targetAudience: string | null;
  visualUi: string | null;
  rarityModifier: string | null;

  // Contenido Jugable (La Carnaza)
  title: string | null;
  instruction: string; // En Supabase es 'content'
  penalty: string | null; // El famoso "Si no lo logra..."
  reward: string | null;
  usageType: UsageType;

  createdAt: Date;
}
