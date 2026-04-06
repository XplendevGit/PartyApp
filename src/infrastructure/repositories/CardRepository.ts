// src/infrastructure/repositories/CardRepository.ts
import { Card, IntensityLevel, UsageType } from "../../domain/entities/Card";
import { supabase } from "../config/supabase";

export class CardRepository {
  // Función para obtener todas las cartas de un mazo específico
  async getCardsByDeckId(deckId: string): Promise<Card[]> {
    const { data, error } = await supabase
      .from("cards")
      .select("*")
      .eq("deck_id", deckId); // Filtramos por Mazo

    if (error) {
      throw new Error(
        `Error obteniendo cartas del mazo ${deckId}: ${error.message}`,
      );
    }

    // Traducimos al formato estricto de nuestro Dominio
    return data.map((row) => ({
      id: row.id,
      deckId: row.deck_id,
      cardCode: row.card_code || "SIN-CODE",
      costTapitas: row.cost_tapitas || 0,
      intensityLevel: (row.intensity_level || 1) as IntensityLevel,
      targetAudience: row.target_audience,
      visualUi: row.visual_ui,
      rarityModifier: row.rarity_modifier,
      title: row.title,
      instruction: row.content, // OJO AQUÍ: Tu BD usa 'content', nuestro dominio 'instruction'
      penalty: row.penalty,
      reward: row.reward,
      usageType: (row.usage_type || "Reusable") as UsageType,
      createdAt: new Date(row.created_at),
    }));
  }
}
