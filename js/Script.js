const sbClient = window.supabaseClient || window.supabase;
let mevcutReceteId = null;

document.addEventListener("DOMContentLoaded", () => {
    receteleriListele();
    otomatikReceteNoOlustur();

    const kaydetBtn = document.getElementById("kaydetBtn");
    if (kaydetBtn) kaydetBtn.addEventListener("click", receteKaydet);

    const yeniBtn = document.getElementById("yeniReceteBtn");
    if (yeniBtn) yeniBtn.addEventListener("click", formuTemizle);

    const aramaInput = document.getElementById("arama");
    if (aramaInput) {
        aramaInput.addEventListener("input", (e) => receteleriListele(e.target.value));
    }
});

// Otomatik Reçete Numarası Oluşturma (REC-001, REC-002...)
async function otomatikReceteNoOlustur() {
    try {
        const receteNoInput = document.getElementById("recete_no");
        if (!receteNoInput) return;

        const { data, error } = await sbClient
            .from("receteler")
            .select("no")
            .order("id", { ascending: false })
            .limit(1);

        if (error || !data || data.length === 0 || !data[0].no) {
            receteNoInput.value = "REC-001";
        } else {
            const sonNo = data[0].no;
            const sayiKismi = parseInt(sonNo.replace("REC-", ""), 10);
            if (!isNaN(sayiKismi)) {
                receteNoInput.value = "REC-" + String(sayiKismi + 1).padStart(3, "0");
            } else {
                receteNoInput.value = "REC-001";
            }
        }
    } catch (err) {
        const receteNoInput = document.getElementById("recete_no");
        if (receteNoInput) receteNoInput.value = "REC-001";
    }
}

// Bütün ayar_ alanlarını JSONB için toplar
function uretimAyarlariniTopla() {
    const ayarlar = {};
    const ayarElemanlari = document.querySelectorAll('[id^="ayar_"]');
    ayarElemanlari.forEach((el) => {
        ayarlar[el.id] = el.value || "";
    });
    return ayarlar;
}

// JSONB verilerini forma geri yükler
function uretimAyarlariniDoldur(ayarlar) {
    if (!ayarlar) return;
    Object.keys(ayarlar).forEach((key) => {
        const el = document.getElementById(key);
        if (el) el.value = ayarlar[key];
    });
}

// Formu Temizler
function formuTemizle() {
    mevcutReceteId = null;

    const tumInputs = document.querySelectorAll("input, textarea");
    tumInputs.forEach((el) => {
        if (el.id !== "arama") el.value = "";
    });

    otomatikReceteNoOlustur();
}

// Reçete Kaydet / Güncelle
async function receteKaydet() {
    const no = document.getElementById("recete_no")?.value;
    const urun = document.getElementById("urun_adi")?.value;
    const uretim_ayarlari = uretimAyarlariniTopla();
    const tarih = new Date().toISOString().split("T")[0];

    if (!no || !urun) {
        alert("Lütfen Reçete Numarası ve Ürün Adı alanlarını doldurun!");
        return;
    }

    const payload = {
        no: no,
        urun: urun,
        miktar: 0,
        tarih: tarih,
        uretim_ayarlari: uretim_ayarlari
    };

    try {
        let error = null;
        if (mevcutReceteId) {
            const res = await sbClient.from("receteler").update(payload).eq("id", mevcutReceteId);
            error = res.error;
        } else {
            const res = await sbClient.from("receteler").insert([payload]);
            error = res.error;
        }

        if (error) {
            alert("Kayıt sırasında hata oluştu: " + error.message);
        } else {
            alert(mevcutReceteId ? "Reçete güncellendi!" : "Yeni reçete başarıyla kaydedildi!");
            formuTemizle();
            receteleriListele();
        }
    } catch (err) {
        alert("Beklenmeyen bir hata oluştu!");
    }
}

// Reçeteleri Listeleme
async function receteleriListele(aramaMetni = "") {
    const listeEl = document.getElementById("liste");
    const toplamEl = document.getElementById("toplamRecete");
    if (!listeEl) return;

    try {
        let query = sbClient.from("receteler").select("*").order("id", { ascending: false });

        if (aramaMetni.trim() !== "") {
            query = query.or(`urun.ilike.%${aramaMetni}%,no.ilike.%${aramaMetni}%`);
        }

        const { data, error } = await query;

        if (error) {
            listeEl.innerHTML = "<tr><td colspan='4'>Veriler alınırken hata oluştu.</td></tr>";
            return;
        }

        if (toplamEl) toplamEl.innerText = data.length;

        if (!data || data.length === 0) {
            listeEl.innerHTML = "<tr><td colspan='4'>Kayıtlı reçete bulunamadı.</td></tr>";
            return;
        }

        let html = "";
        data.forEach((item) => {
            html += `
                <tr>
                    <td><strong>${item.no || "-"}</strong></td>
                    <td>${item.urun || "-"}</td>
                    <td>${item.tarih || "-"}</td>
                    <td>
                        <button onclick="receteDetayGoster(${item.id})">Detay</button>
                        <button onclick="receteDuzenle(${item.id})">Düzenle</button>
                        <button onclick="receteKopyala(${item.id})">Kopyala</button>
                        <button style="background-color:#dc3545;" onclick="receteSil(${item.id})">Sil</button>
                    </td>
                </tr>
            `;
        });

        listeEl.innerHTML = html;
    } catch (err) {
        console.error("Listeleme hatası:", err);
    }
}

// Detay Göster
async function receteDetayGoster(id) {
    const { data, error } = await sbClient.from("receteler").select("*").eq("id", id).single();
    if (error || !data) {
        alert("Detay verisi alınamadı!");
        return;
    }

    if (document.getElementById("detay_recete_no")) document.getElementById("detay_recete_no").innerText = data.no || "";
    if (document.getElementById("detay_urun_adi")) document.getElementById("detay_urun_adi").innerText = data.urun || "";

    const detayAyarIcerik = document.getElementById("detay_ayarlar_icerik");
    if (detayAyarIcerik && data.uretim_ayarlari) {
        let ayarHtml = "<ul>";
        Object.keys(data.uretim_ayarlari).forEach(key => {
            if (data.uretim_ayarlari[key]) {
                ayarHtml += `<li><strong>${key}:</strong> ${data.uretim_ayarlari[key]}</li>`;
            }
        });
        ayarHtml += "</ul>";
        detayAyarIcerik.innerHTML = ayarHtml;
    }

    const modal = document.getElementById("detayModal");
    if (modal) modal.style.display = "block";
}

function detayModalKapat() {
    const modal = document.getElementById("detayModal");
    if (modal) modal.style.display = "none";
}

// Düzenleme
async function receteDuzenle(id) {
    const { data, error } = await sbClient.from("receteler").select("*").eq("id", id).single();
    if (error || !data) {
        alert("Reçete bilgisi alınamadı!");
        return;
    }

    mevcutReceteId = data.id;
    if (document.getElementById("recete_no")) document.getElementById("recete_no").value = data.no || "";
    if (document.getElementById("urun_adi")) document.getElementById("urun_adi").value = data.urun || "";

    if (data.uretim_ayarlari) {
        uretimAyarlariniDoldur(data.uretim_ayarlari);
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
}

// Kopyalama
async function receteKopyala(id) {
    await receteDuzenle(id);
    mevcutReceteId = null;
    await otomatikReceteNoOlustur();
    alert("Reçete kopyalandı. Yeni reçete numarası atandı. Kaydedebilirsiniz.");
}

// Silme
async function receteSil(id) {
    if (!confirm("Bu reçeteyi silmek istediğinize emin misiniz?")) return;

    const { error } = await sbClient.from("receteler").delete().eq("id", id);
    if (error) {
        alert("Silme hatası: " + error.message);
    } else {
        alert("Reçete silindi!");
        receteleriListele();
    }
}
