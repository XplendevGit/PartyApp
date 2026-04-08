// src/infrastructure/repositories/DeckRepository.ts
import { Deck, DeckTheme } from "@/src/domain/entities/Deck";
import { supabase } from "@/src/lib/supabase";

// Tipado de lo que escupe Supabase crudo
interface SupabaseDeckRow {
  id: string;
  name: string;
  description: string | null;
  unlock_type: string;
  unlock_cost: number | null;
  ui_config: { icon?: string; theme?: DeckTheme } | null; // 👈 Nuestro nuevo JSONB
  user_unlocked_decks: { deck_id: string }[] | null;
}

export class DeckRepository {
  async getDecksForUser(): Promise<Deck[]> {
    const { data, error } = await supabase.from("decks").select(`
        id,
        name,
        description,
        unlock_type,
        unlock_cost,
        ui_config, 
        user_unlocked_decks ( deck_id )
      `);

    if (error) {
      console.error("❌ Error fetching decks:", error.message);
      throw error;
    }

    const rows = data as unknown as SupabaseDeckRow[];

    // Tema por defecto a prueba de fallos (fallback)
    const defaultTheme: DeckTheme = {
      bg: "bg-slate-900",
      border: "border-slate-800",
      borderBottom: "border-slate-700",
      textTitle: "text-slate-400",
      textDesc: "text-slate-400",
      particleColor: "rgba(255,255,255,0.2)",
    };

    return rows.map((row): Deck => {
      const unlockTypeUpper = (row.unlock_type || "FREE").toUpperCase() as
        | "FREE"
        | "FREEMIUM"
        | "PREMIUM";
      const isFree = unlockTypeUpper === "FREE";
      const hasUnlockedRecord =
        row.user_unlocked_decks !== null && row.user_unlocked_decks.length > 0;

      // Extraemos la UI de forma segura
      const ui = row.ui_config || {};

      return {
        id: row.id,
        title: row.name,
        description: row.description ?? "",
        type: unlockTypeUpper,
        cost: row.unlock_cost ?? 0,
        hasAccess: isFree || hasUnlockedRecord,
        icon: ui.icon ?? "🎲",
        theme: ui.theme ?? defaultTheme, // 👈 Se inyecta la UI limpia
      };
    });
  }
}
