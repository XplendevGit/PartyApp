import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import "react-native-url-polyfill/auto";

// TODO: Reemplazar estas variables con las tuyas en el siguiente paso
const supabaseUrl = "https://pnalndxkstvqshluzalf.supabase.co";
const supabaseAnonKey = "sb_publishable_EYD2d3O4WA8H3qfRez1b0A_Ds2Y0pKN";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
