import { createClient } from "@supabase/supabase-js";

// Reemplaza esto con tu URL base (https://...)
const supabaseUrl = "https://xmqmfefjxirzfszwhczw.supabase.co"
// Reemplaza esto con tu llave anon/public (sb_publishable_...)
const supabaseAnonKey = "sb_publishable_pVS5quVCP91mCTpKXY5X4g__02Ufbn6"

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
