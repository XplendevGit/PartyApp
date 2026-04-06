// src/infrastructure/config/supabase.ts
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_ANON_KEY || ""; // O el SERVICE_ROLE_KEY si es backend puro

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Faltan credenciales de Supabase en el .env");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
