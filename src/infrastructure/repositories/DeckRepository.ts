import { Deck, DeckUnlockType } from "../../domain/entities/Deck";
import { supabase } from "../../lib/supabase";

export class DeckRepository {
  async getAllDecks(): Promise<Deck[]> {
    const { data, error } = await supabase
      .from("decks")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching decks:", error);
      throw new Error(
        "No se pudieron cargar los mazos desde la base de datos.",
      );
    }

    // Mapeo EXACTO a la interfaz Deck que acabamos de definir
    return data.map((row) => ({
      id: row.id,
      title: row.name, // Transformamos el 'name' de la BD a 'title' para tu UI
      description: row.description || "Sin descripción",
      icon: "🔥", // Puedes agregar una columna de iconos en Supabase después
      unlockType: (row.unlock_type?.toUpperCase() || "FREE") as DeckUnlockType,
      unlockCost: row.unlock_cost || 0,
    }));
  }
}
