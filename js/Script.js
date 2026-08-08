// Supabase İstemcisi Başlatma
const supabase = window.supabaseClient;

let mevcutReceteId = null;

// Sayfa Yüklendiğinde
document.addEventListener("DOMContentLoaded", () => {
    receteleriListele();
    otomatikReceteNoOlustur();

    // Form Kayıt
    const kaydetBtn = document.getElementById("kaydetBtn");
    if (kaydetBtn) {
        kaydetBtn.addEventListener("click", receteKaydet);
    }

    // Yeni Reçete Butonu
    const yeniBtn = document.getElementById("yeniReceteBtn");
    if (yeniBtn) {
        yeniBtn.addEventListener("click", formuTemizle);
    }

    // Arama Kutusu
    const aramaInput = document.getElementById("arama");
    if (aramaInput) {
        aramaInput.addEventListener("input", (e) => {
            receteleriListele(e.target.value);
        });
    }
});

// Otomatik Reçete Numarası Oluşturma (REC-001, REC-002...)
async function otomatikReceteNoOlustur() {
    try {
        const receteNoInput = document.getElementById("recete_no");
        if (!receteNoInput) return;

        const { data, error } = await supabase
            .from("receteler")
            .select("no")
            .order("id", { ascending: false })
            .limit(1);

        if (error) {
            console.error("Reçete no çekme hatası:", error);
            receteNoInput.value = "REC-001";
            return;
        }

        if (!data || data.length === 0 || !data[0].no) {
            receteNoInput.value = "REC-001";
        } else {
            const sonNo = data[0].no;
            const sayiKismi = parseInt(sonNo.replace("REC-", ""), 10);
            if (!isNaN(sayiKismi)) {
                const yeniSayi = sayiKismi + 1;
                receteNoInput.value = "REC-" + String(yeniSayi).padStart(3, "0");
            } else {
                receteNoInput.value = "REC-001";
            }
        }
    } catch (err) {
        console.error("Beklenmeyen hata (Reçete No):", err);
        const receteNoInput = document.getElementById("recete_no");
        if (receteNoInput) receteNoInput.value = "REC-001";
    }
}

// Bütün ayar_ ile başlayan alanları JSON olarak toplama
function uretimAyarlariniTopla() {
    const ayarlar = {};
    const ayarElemanlari = document.querySelectorAll('[id^="ayar_"]');
    ayarElemanlari.forEach((el) => {
        ayarlar[el.id] = el.value || "";
    });
    return ayarlar;
}

// JSON verilerini HTML alanlarına doldurma
function uretimAyarlariniDoldur(ayarlar) {
    if (!ayarlar) return;
    Object.keys(ayarlar).forEach((key) => {
        const el = document.getElementById(key);
        if (el) {
            el.value = ayarlar[key];
        }
    });
}

// Formu Temizleme (Tüm Giriş Alanlarını Sıfırlar)
function formuTemizle() {
    mevcutReceteId = null;

    // Sayfadaki tüm input ve textarea alanlarını boşalt
    const tumInputs = document.querySelectorAll("input, textarea");
    tumInputs.forEach((el) => {
        if (el.id !== "arama") { // Arama kutusunu hariç tut
            el.value = "";
        }
    });

    // Otomatik yeni reçete numarasını yazdır
    otomatikReceteNoOlustur();
}

// Reçete Kaydet / Güncelle
async function receteKaydet() {
    const no = document.getElementById("recete_no")?.value;
    const urun = document.getElementById("urun_adi")?.value;
    const miktarVal = document.getElementById("hiz")?.value || 0;
    const uretim_ayarlari = uretimAyarlariniTopla();
    const tarih = new Date().toISOString().split("T")[0];

    if (!no || !urun) {
        alert("Lütfen Reçete Numarası ve Ürün Adı alanlarını doldurun!");
        return;
    }

    const payload = {
        no: no,
        urun: urun,
        miktar: parseFloat(miktarVal) || 0,
        tarih: tarih,
        uretim_ayarlari: uretim_ayarlari
    };

    try {
        let error = null;

        if (mevcutReceteId) {
            // Güncelleme
            const res = await supabase
                .from("receteler")
                .update(payload)
                .eq("id", mevcutReceteId);
            error = res.error;
        } else {
            // Yeni Kayıt
            const res = await supabase
                .from("receteler")
                .insert([payload]);
            error = res.error;
        }

        if (error) {
            alert("Kayıt sırasında hata oluştu: " + error.message);
            console.error(error);
        } else {
            alert(mevcutReceteId ? "Reçete güncellendi!" : "Yeni reçete başarıyla kaydedildi!");
            formuTemizle();
            receteleriListele();
        }
    } catch (err) {
        alert("Beklenmeyen bir hata oluştu!");
        console.error(err);
    }
}

// Reçeteleri Listeleme
async function receteleriListele(aramaMetni = "") {
    const listeEl = document.getElementById("liste");
    const toplamEl = document.getElementById("toplamRecete");
    if (!listeEl) return;

    try {
        let query = supabase.from("receteler").select("*").order("id", { ascending: false });

        if (aramaMetni.trim() !== "") {
            query = query.or(`urun.ilike.%${aramaMetni}%,no.ilike.%${aramaMetni}%`);
        }

        const { data, error } = await query;

        if (error) {
            console.error("Listeleme hatası:", error);
            listeEl.innerHTML = "<tr><td colspan='5'>Veriler alınırken hata oluştu.</td></tr>";
            return;
        }

        if (toplamEl) toplamEl.innerText = data.length;

        if (!data || data.length === 0) {
            listeEl.innerHTML = "<tr><td colspan='5'>Kayıtlı reçete bulunamadı.</td></tr>";
            return;
        }

        let html = "";
        data.forEach((item) => {
            html += `
                <tr>
                    <td><strong>${item.no || "-"}</strong></td>
                    <td>${item.urun || "-"}</td>
                    <td>${item.tarih || "-"}</td>
                    <td>${item.miktar || 0}</td>
                    <td>
                        <button onclick="receteDetayGoster(${item.id})">Detay</button>
                        <button onclick="receteDuzenle(${item.id})">Düzenle</button>
                        <button onclick="receteKopyala(${item.id})">Kopyala</button>
                        <button onclick="receteSil(${item.id})">Sil</button>
                    </td>
                </tr>
            `;
        });

        listeEl.innerHTML = html;

    } catch (err) {
        console.error("Beklenmeyen hata (Listeleme):", err);
    }
}

// Reçete Detay Gösterme
async function receteDetayGoster(id) {
    const { data, error } = await supabase.from("receteler").select("*").eq("id", id).single();
    if (error || !data) {
        alert("Detay verisi alınamadı!");
        return;
    }

    const modal = document.getElementById("detayModal");
    if (document.getElementById("detay_recete_no")) document.getElementById("detay_recete_no").innerText = data.no || "";
    if (document.getElementById("detay_urun_adi")) document.getElementById("detay_urun_adi").innerText = data.urun || "";

    if (modal) modal.style.display = "block";
}

// Reçete Düzenleme
async function receteDuzenle(id) {
    const { data, error } = await supabase.from("receteler").select("*").eq("id", id).single();
    if (error || !data) {
        alert("Reçete bilgisi alınamadı!");
        return;
    }

    mevcutReceteId = data.id;

    if (document.getElementById("recete_no")) document.getElementById("recete_no").value = data.no || "";
    if (document.getElementById("urun_adi")) document.getElementById("urun_adi").value = data.urun || "";
    if (document.getElementById("hiz")) document.getElementById("hiz").value = data.miktar || "";

    if (data.uretim_ayarlari) {
        uretimAyarlariniDoldur(data.uretim_ayarlari);
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
}

// Reçete Kopyalama
async function receteKopyala(id) {
    await receteDuzenle(id);
    mevcutReceteId = null;
    await otomatikReceteNoOlustur();
    alert("Reçete kopyalandı. Yeni reçete numarası atandı. Değişiklikleri yapıp kaydedebilirsiniz.");
}

// Reçete Silme
async function receteSil(id) {
    if (!confirm("Bu reçeteyi silmek istediğinize emin misiniz?")) return;

    const { error } = await supabase.from("receteler").delete().eq("id", id);
    if (error) {
        alert("Silme hatası: " + error.message);
    } else {
        alert("Reçete silindi!");
        receteleriListele();
    }
}
