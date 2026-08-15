// Supabase Yapılandırması
const SUPABASE_URL = "https://ihsetoxxggiaeulpqhzg.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_HoqAcz7S0ANBNyQTj6fjew_YCa_71nb"; 

// Doğrudan Supabase Client Oluşturma
try {
    if (typeof supabase !== 'undefined' && supabase.createClient) {
        window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log("Supabase Başarıyla Başlatıldı:", window.supabaseClient);
    } else {
        console.error("Supabase CDN kütüphanesi henüz yüklenmedi!");
    }
} catch (err) {
    console.error("Supabase Başlatma Hatası:", err);
}
