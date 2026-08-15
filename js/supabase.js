// Supabase Bilgileri
const SUPABASE_URL = "https://ihsetoxxggiaeulpqhzg.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_HoqAcz7S0ANBNyQTj6fjew_YCa_71nb"

// İstemciyi doğrudan küresel window.sbClient nesnesine atıyoruz
if (typeof supabase !== 'undefined') {
   window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else {
    console.error("Supabase SDK kütüphanesi yüklenemedi!");
}
