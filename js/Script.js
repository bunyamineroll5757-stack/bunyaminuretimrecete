// Global Değişkenler
let tumReceteler = [];
let detaydakiId = null;
let detaydakiData = null;

// Sayfa Yüklendiğinde
document.addEventListener("DOMContentLoaded", () => {
    receteleriYukle();

    const yeniBtn = document.getElementById("yeniReceteBtn");
    if (yeniBtn) {
        yeniBtn.addEventListener("click", formuTemizle);
    }
});

// ======================================================
// REÇETELERİ LİSTELE
// ======================================================
async function receteleriYukle() {
    try {
        const db = getSupabase();
        if (!db) return;

        const { data, error } = await db.from("receteler").select("*").order("created_at", { ascending: false });

        if (error) {
            console.error("Listeleme hatası:", error);
            return;
        }

        tumReceteler = data || [];
        tabloCiz(tumReceteler);

        const toplamEl = document.getElementById("toplamRecete");
        if (toplamEl) toplamEl.innerText = tumReceteler.length;

    } catch (err) {
        console.error("Yükleme Hatası:", err);
    }
}

function tabloCiz(liste) {
    const tbody = document.getElementById("liste");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (liste.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;">Kayıtlı reçete bulunamadı.</td></tr>`;
        return;
    }

    liste.forEach(item => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><b>${item.recete_no || '-'}</b></td>
            <td>${item.urun_adi || '-'}</td>
            <td>${item.makine_adi || '-'}</td>
            <td>${item.hiz || '-'}</td>
            <td>${item.sicaklik || '-'}</td>
            <td>${item.basinc || '-'}</td>
            <td>
                <button class="btn" type="button" onclick="detayGoster('${item.id}')">Detay</button>
                <button class="btn-danger" type="button" onclick="receteSil('${item.id}')">Sil</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function ara() {
    const query = document.getElementById("arama").value.toLowerCase();
    const filtreli = tumReceteler.filter(r => 
        (r.recete_no && r.recete_no.toLowerCase().includes(query)) ||
        (r.urun_adi && r.urun_adi.toLowerCase().includes(query)) ||
        (r.makine_adi && r.makine_adi.toLowerCase().includes(query))
    );
    tabloCiz(filtreli);
}

// ======================================================
// REÇETE KAYDET / GÜNCELLE
// ======================================================
async function kaydet() {
    const db = getSupabase();
    if (!db) {
        alert("Veritabanı bağlantısı kurulamadı!");
        return;
    }

    const recete_no = document.getElementById("recete_no").value.trim();
    if (!recete_no) {
        alert("Lütfen Reçete No giriniz.");
        return;
    }

    // Formdaki tüm input verilerini topluyoruz
    const ayarIds = [
        "ayar_gram", "ayar_renk", "ayar_tarih", "ayar_servolap", "ayar_tarak_hizi", "ayar_firma_adi",
        "ayar_ana_tambur", "ayar_alt_ara_dofer", "ayar_siyirici", "ayar_ust_ara_dofer", "ayar_isci",
        "ayar_ust_sevk_doferi", "ayar_alt_sevk_doferi", "ayar_ust_dofer_alici", "ayar_alt_dofer_alici",
        "ayar_ust_sevk_bandi", "ayar_alt_sevk_bandi", "ayar_tulbent_kati", "ayar_besleme_cekim",
        "ayar_serme_eni_on", "ayar_bant_cekim", "ayar_serme_eni_arka", "ayar_araba_cekim",
        "ayar_cikis_yuksekligi_sag", "ayar_cikis_hafiza", "ayar_cikis_yuksekligi_sol", "ayar_on_cikis_hafiza",
        "ayar_arka_cikis_hafiza", "ayar_trio1", "ayar_trio4", "ayar_trio2", "ayar_trio5", "ayar_trio3", "ayar_trio6",
        "ayar_besleme1", "ayar_pompa1", "ayar_tambur1", "ayar_pompa2", "ayar_tambur2", "ayar_pompa3", "ayar_tambur3",
        "ayar_pompa4", "ayar_besleme2", "ayar_pompa5", "ayar_sikma_fular", "ayar_pompa6", "ayar_firin",
        "ayar_balkan1", "ayar_balkan2", "ayar_balkan3", "ayar_hammadde", "ayar_kesim_eni", "ayar_cap",
        "ayar_sarim_metresi", "ayar_saatlik_kg", "ayar_firin_isisi", "ayar_hat_hizi"
    ];

    const uretim_ayarlari = {};
    ayarIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) uretim_ayarlari[id] = el.value;
    });

    const payload = {
        recete_no: recete_no,
        urun_adi: document.getElementById("urun_adi").value,
        makine_adi: document.getElementById("makine_adi").value,
        hiz: document.getElementById("hiz").value,
        sicaklik: document.getElementById("sicaklik").value,
        basinc: document.getElementById("basinc").value,
        notlar: document.getElementById("notlar").value,
        uretim_ayarlari: uretim_ayarlari
    };

    try {
        const { error } = await db.from("receteler").upsert([payload], { onConflict: "recete_no" });

        if (error) {
            alert("Kaydetme hatası: " + error.message);
        } else {
            alert("Reçete başarıyla kaydedildi.");
            formuTemizle();
            receteleriYukle();
        }
    } catch (err) {
        console.error("Kaydetme sırasında hata:", err);
    }
}

// ======================================================
// REÇETE SİL
// ======================================================
async function receteSil(id) {
    if (!confirm("Bu reçeteyi silmek istediğinize emin misiniz?")) return;

    try {
        const db = getSupabase();
        const { error } = await db.from("receteler").delete().eq("id", id);

        if (error) {
            alert("Silme başarısız: " + error.message);
        } else {
            receteleriYukle();
        }
    } catch (err) {
        console.error("Silme Hatası:", err);
    }
}

// ======================================================
// DETAY GÖSTER
// ======================================================
async function detayGoster(id) {
    try {
        const db = getSupabase();
        if (!db) {
            alert("Supabase bağlantısı bulunamadı.");
            return;
        }

        const { data, error } = await db.from("receteler").select("*").eq("id", id).single();
        if (error || !data) {
            alert("Reçete bilgileri alınamadı.");
            return;
        }

        // Global hafızaya al
        detaydakiId = id;
        detaydakiData = data;

        const a = data.uretim_ayarlari || data.ayarlar || {};

        const alan = document.getElementById("detayIcerikAlani");
        if (alan) {
            alan.innerHTML = `
                <div style="max-height: 60vh; overflow-y: auto; text-align: left; font-size: 12px; line-height: 1.5; padding: 5px;">
                    <h3 style="border-bottom: 2px solid #333; padding-bottom: 5px; margin-top:0;">Reçete No: ${data.recete_no || '-'}</h3>
                    <p><b>Ürün Adı:</b> ${data.urun_adi || '-'} | <b>Firma:</b> ${a.ayar_firma_adi || '-'}</p>
                    <p><b>Makine:</b> ${data.makine_adi || '-'}</p>
                    <p><b>Hız / Sıcaklık / Basınç:</b> ${data.hiz || '-'} / ${data.sicaklik || '-'} / ${data.basinc || '-'}</p>
                    <p><b>Gramaj / Renk / Tarih:</b> ${a.ayar_gram || '-'} / ${a.ayar_renk || '-'} / ${a.ayar_tarih || '-'}</p>

                    <h4 style="background:#eee; padding:4px; margin:8px 0 4px 0;">TARAK & SERVOLAP AYARLARI</h4>
                    <p><b>Servolap:</b> ${a.ayar_servolap || '-'} | <b>Tarak Hızı:</b> ${a.ayar_tarak_hizi || '-'}</p>
                    <p><b>Ana Tambur:</b> ${a.ayar_ana_tambur || '-'} | <b>Sıyırıcı:</b> ${a.ayar_siyirici || '-'} | <b>İşçi:</b> ${a.ayar_isci || '-'}</p>
                    <p><b>Alt Ara Dofer:</b> ${a.ayar_alt_ara_dofer || '-'} | <b>Üst Ara Dofer:</b> ${a.ayar_ust_ara_dofer || '-'}</p>
                    <p><b>Üst Sevk Doferi:</b> ${a.ayar_ust_sevk_doferi || '-'} | <b>Alt Sevk Doferi:</b> ${a.ayar_alt_sevk_doferi || '-'}</p>
                    <p><b>Üst Dofer Alıcı:</b> ${a.ayar_ust_dofer_alici || '-'} | <b>Alt Dofer Alıcı:</b> ${a.ayar_alt_dofer_alici || '-'}</p>
                    <p><b>Üst Sevk Bandı:</b> ${a.ayar_ust_sevk_bandi || '-'} | <b>Alt Sevk Bandı:</b> ${a.ayar_alt_sevk_bandi || '-'}</p>

                    <h4 style="background:#eee; padding:4px; margin:8px 0 4px 0;">SERİCİ AYARLARI</h4>
                    <p><b>Tülbent Katı:</b> ${a.ayar_tulbent_kati || '-'} | <b>Besleme Çekim:</b> ${a.ayar_besleme_cekim || '-'}</p>
                    <p><b>Serme Eni Ön / Arka:</b> ${a.ayar_serme_eni_on || '-'} / ${a.ayar_serme_eni_arka || '-'}</p>
                    <p><b>Bant Çekim:</b> ${a.ayar_bant_cekim || '-'} | <b>Araba Çekim:</b> ${a.ayar_araba_cekim || '-'}</p>
                    <p><b>Çıkış Yüksekliği Sağ / Sol:</b> ${a.ayar_cikis_yuksekligi_sag || '-'} / ${a.ayar_cikis_yuksekligi_sol || '-'}</p>

                    <h4 style="background:#eee; padding:4px; margin:8px 0 4px 0;">ÇEKTİRME (TRİO) AYARLARI</h4>
                    <p><b>Trio 1/2/3:</b> ${a.ayar_trio1 || '-'} / ${a.ayar_trio2 || '-'} / ${a.ayar_trio3 || '-'}</p>
                    <p><b>Trio 4/5/6:</b> ${a.ayar_trio4 || '-'} / ${a.ayar_trio5 || '-'} / ${a.ayar_trio6 || '-'}</p>

                    <h4 style="background:#eee; padding:4px; margin:8px 0 4px 0;">SU JETİ AYARLARI</h4>
                    <p><b>Besleme 1 / 2:</b> ${a.ayar_besleme1 || '-'} / ${a.ayar_besleme2 || '-'}</p>
                    <p><b>Pompalar (1-6):</b> ${a.ayar_pompa1 || '-'} / ${a.ayar_pompa2 || '-'} / ${a.ayar_pompa3 || '-'} / ${a.ayar_pompa4 || '-'} / ${a.ayar_pompa5 || '-'} / ${a.ayar_pompa6 || '-'}</p>
                    <p><b>Tambur 1/2/3:</b> ${a.ayar_tambur1 || '-'} / ${a.ayar_tambur2 || '-'} / ${a.ayar_tambur3 || '-'}</p>
                    <p><b>Sıkma Fular / Fırın:</b> ${a.ayar_sikma_fular || '-'} / ${a.ayar_firin || '-'}</p>

                    <h4 style="background:#eee; padding:4px; margin:8px 0 4px 0;">HAMMADDE AYARLARI</h4>
                    <p><b>Balkan 1/2/3 (%):</b> %${a.ayar_balkan1 || '-'} / %${a.ayar_balkan2 || '-'} / %${a.ayar_balkan3 || '-'}</p>
                    <p><b>Detay:</b> ${a.ayar_hammadde || '-'}</p>

                    <h4 style="background:#ffd1d1; padding:4px; margin:8px 0 4px 0; color:#900;">✂️ KESİM EBATLARI & HAT</h4>
                    <p><b>Kesim Eni / Çap:</b> ${a.ayar_kesim_eni || '-'} / ${a.ayar_cap || '-'}</p>
                    <p><b>Sarım Metresi / Saatlik KG:</b> ${a.ayar_sarim_metresi || '-'} / ${a.ayar_saatlik_kg || '-'}</p>
                    <p><b>Fırın Isısı / Hat Hızı:</b> ${a.ayar_firin_isisi || '-'} / ${a.ayar_hat_hizi || '-'}</p>

                    <h4 style="background:#eee; padding:4px; margin:8px 0 4px 0;">NOTLAR</h4>
                    <p>${data.notlar || 'Not yok'}</p>
                </div>
            `;
        }

        const modal = document.getElementById("detayModal");
        if (modal) modal.style.display = "flex";

    } catch (err) {
        console.error("Detay Hatası:", err);
        alert("Bir hata oluştu.");
    }
}

// ======================================================
// DETAY KAPAT
// ======================================================
function detayKapat() {
    const modal = document.getElementById("detayModal");
    if (modal) modal.style.display = "none";
}

// ======================================================
// DÜZENLE (Açık Reçeteyi Form Alanlarına Yükler)
// ======================================================
function detaydanDuzenle() {
    if (!detaydakiData) {
        alert("Düzenlenecek reçete verisi bulunamadı.");
        return;
    }

    const d = detaydakiData;
    const a = d.uretim_ayarlari || d.ayarlar || {};

    const setVal = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.value = val || "";
    };

    // Ana Alanlar
    setVal("recete_no", d.recete_no);
    setVal("urun_adi", d.urun_adi);
    setVal("makine_adi", d.makine_adi);
    setVal("hiz", d.hiz);
    setVal("sicaklik", d.sicaklik);
    setVal("basinc", d.basinc);
    setVal("notlar", d.notlar);

    // Bütün Tablo Inputlarını Otomatik Doldur
    Object.keys(a).forEach(key => {
        setVal(key, a[key]);
    });

    detayKapat();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ======================================================
// KOPYALA
// ======================================================
function detayKopyala() {
    if (!detaydakiData) {
        alert("Kopyalanacak reçete verisi bulunamadı.");
        return;
    }

    detaydanDuzenle();
    
    const receteInput = document.getElementById("recete_no");
    if (receteInput) {
        receteInput.value = receteInput.value + "-KOPYA";
    }

    alert("Reçete verileri forma yüklendi. Değişiklikleri yapıp 'Kaydet' butonuna basabilirsiniz.");
}

// ======================================================
// DİĞER AKSİYONLAR (Yazdır, PDF, Paylaş, Form Temizleme)
// ======================================================
function detayYazdir() {
    window.print();
}

function pdfIndir() {
    const el = document.getElementById("detayIcerikAlani");
    if (!el) return;
    
    const opt = {
        margin:       10,
        filename:     `Recete_${detaydakiData?.recete_no || 'Detay'}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    if (typeof html2pdf !== 'undefined') {
        html2pdf().set(opt).from(el).save();
    } else {
        alert("PDF kütüphanesi yüklenemedi.");
    }
}

function paylas() {
    if (!detaydakiData) return;
    const metin = `Üretim Reçetesi No: ${detaydakiData.recete_no}\nÜrün: ${detaydakiData.urun_adi}\nMakine: ${detaydakiData.makine_adi}`;
    if (navigator.share) {
        navigator.share({ title: 'Reçete Detayı', text: metin }).catch(() => {});
    } else {
        navigator.clipboard.writeText(metin);
        alert("Reçete özeti panoya kopyalandı!");
    }
}

function formuTemizle() {
    const inputs = document.querySelectorAll("input, textarea");
    inputs.forEach(i => {
        if (i.id !== "arama" && i.id !== "login_user" && i.id !== "login_pass") {
            i.value = "";
        }
    });
}

// Admin Giriş/Çıkış işlemleri
function adminGiris() {
    const user = document.getElementById("login_user")?.value;
    const pass = document.getElementById("login_pass")?.value;
    const err = document.getElementById("loginError");

    if (user === "admin" && pass === "1234") {
        document.getElementById("loginModal").style.display = "none";
        if (err) err.style.display = "none";
    } else {
        if (err) err.style.display = "block";
    }
}

function adminCikis() {
    const loginModal = document.getElementById("loginModal");
    if (loginModal) loginModal.style.display = "flex";
}
