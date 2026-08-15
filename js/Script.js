// ======================================================
// ÜRETİM REÇETE & BAKIM YÖNETİM SİSTEMİ
// Script.js - EKSİKSİZ TAM SÜRÜM
// ======================================================

// ======================================================
// DEĞİŞKENLER
// ======================================================
let secilenId = null;
let detaydakiId = null;

// ======================================================
// SUPABASE KONTROLÜ
// ======================================================
function getSupabase() {
    // 1. window.supabaseClient kontrolü
    if (window.supabaseClient && typeof window.supabaseClient.from === 'function') {
        return window.supabaseClient;
    }
    // 2. window.sbClient kontrolü
    if (window.sbClient && typeof window.sbClient.from === 'function') {
        return window.sbClient;
    }
    // 3. Doğrudan supabase nesnesi kontrolü
    if (typeof supabase !== 'undefined' && typeof supabase.from === 'function') {
        return supabase;
    }

    alert("Supabase istemcisi yüklenemedi! Lütfen sayfayı yenileyin veya internet bağlantınızı kontrol edin.");
    return null;
}

// ======================================================
// ÜRETİM AYARLARINI TOPLA
// ======================================================
function uretimAyarlariTopla() {
    const ayarlar = {};
    const alanlar = [
        "ayar_gram", "ayar_renk", "ayar_tarih", "ayar_servolap", "ayar_tarak_hizi", "ayar_firma_adi",
        "ayar_ana_tambur", "ayar_alt_ara_dofer", "ayar_siyirici", "ayar_ust_ara_dofer", "ayar_isci",
        "ayar_ust_sevk_doferi", "ayar_alt_sevk_doferi", "ayar_ust_dofer_alici", "ayar_alt_dofer_alici",
        "ayar_ust_sevk_bandi", "ayar_alt_sevk_bandi",
        "ayar_tulbent_kati", "ayar_besleme_cekim", "ayar_serme_eni_on", "ayar_bant_cekim",
        "ayar_serme_eni_arka", "ayar_araba_cekim", "ayar_cikis_yuksekligi_sag", "ayar_cikis_hafiza",
        "ayar_on_cikis_hafiza", "ayar_cikis_yuksekligi_sol", "ayar_arka_cikis_hafiza",
        "ayar_trio1", "ayar_trio2", "ayar_trio3", "ayar_trio4", "ayar_trio5", "ayar_trio6",
        "ayar_pompa1", "ayar_pompa2", "ayar_pompa3", "ayar_pompa4", "ayar_pompa5", "ayar_pompa6",
        "ayar_besleme1", "ayar_tambur1", "ayar_tambur2", "ayar_tambur3", "ayar_besleme2", "ayar_sikma_fular", "ayar_firin",
        "ayar_balkan1", "ayar_balkan2", "ayar_balkan3", "ayar_hammadde",
        "ayar_kesim_eni", "ayar_cap", "ayar_sarim_metresi", "ayar_saatlik_kg", "ayar_firin_isisi", "ayar_hat_hizi"
    ];

    alanlar.forEach(function(id) {
        const eleman = document.getElementById(id);
        if (eleman) {
            ayarlar[id] = eleman.value.trim();
        }
    });

    return ayarlar;
}

// ======================================================
// ÜRETİM AYARLARINI FORMA YÜKLE
// ======================================================
function uretimAyarlariYukle(ayarlar) {
    if (!ayarlar) return;
    Object.keys(ayarlar).forEach(function(id) {
        const eleman = document.getElementById(id);
        if (eleman) {
            eleman.value = (ayarlar[id] === null || ayarlar[id] === undefined) ? "" : ayarlar[id];
        }
    });
}

// ======================================================
// TÜM FORMU TEMİZLE
// ======================================================
function temizleForm() {
    const alanlar = [
        "recete_no", "urun_adi", "makine_adi", "recete_tarih", "notlar",
        "ayar_gram", "ayar_renk", "ayar_tarih", "ayar_servolap", "ayar_tarak_hizi", "ayar_firma_adi",
        "ayar_ana_tambur", "ayar_alt_ara_dofer", "ayar_siyirici", "ayar_ust_ara_dofer", "ayar_isci",
        "ayar_ust_sevk_doferi", "ayar_alt_sevk_doferi", "ayar_ust_dofer_alici", "ayar_alt_dofer_alici",
        "ayar_ust_sevk_bandi", "ayar_alt_sevk_bandi",
        "ayar_tulbent_kati", "ayar_besleme_cekim", "ayar_serme_eni_on", "ayar_bant_cekim",
        "ayar_serme_eni_arka", "ayar_araba_cekim", "ayar_cikis_yuksekligi_sag", "ayar_cikis_hafiza",
        "ayar_on_cikis_hafiza", "ayar_cikis_yuksekligi_sol", "ayar_arka_cikis_hafiza",
        "ayar_trio1", "ayar_trio2", "ayar_trio3", "ayar_trio4", "ayar_trio5", "ayar_trio6",
        "ayar_pompa1", "ayar_pompa2", "ayar_pompa3", "ayar_pompa4", "ayar_pompa5", "ayar_pompa6",
        "ayar_besleme1", "ayar_tambur1", "ayar_tambur2", "ayar_tambur3", "ayar_besleme2", "ayar_sikma_fular", "ayar_firin",
        "ayar_balkan1", "ayar_balkan2", "ayar_balkan3", "ayar_hammadde",
        "ayar_kesim_eni", "ayar_cap", "ayar_sarim_metresi", "ayar_saatlik_kg", "ayar_firin_isisi", "ayar_hat_hizi"
    ];

    alanlar.forEach(function(id) {
        const eleman = document.getElementById(id);
        if (eleman) eleman.value = "";
    });

    secilenId = null;
    const buton = document.getElementById("kaydetBtn");
    if (buton) buton.innerText = "Kaydet";
}

// ======================================================
// OTOMATİK REÇETE NUMARASI
// ======================================================
async function otomatikReceteNo() {
    const db = getSupabase();
    if (!db) throw new Error("Supabase bağlantısı bulunamadı.");

    const { data, error } = await db
        .from("receteler")
        .select("recete_no")
        .order("id", { ascending: false })
        .limit(1);

    if (error) throw error;

    let yeniNo = 1;
    if (data && data.length > 0) {
        const sonNo = String(data[0].recete_no || "");
        const sonuc = sonNo.match(/REC-(\d+)/i);
        if (sonuc) yeniNo = Number(sonuc[1]) + 1;
    }
    return "REC-" + String(yeniNo).padStart(3, "0");
}

// ======================================================
// KAYDET
// ======================================================
async function kaydet(event) {
    if (event) event.preventDefault();

    try {
        const db = getSupabase();
        if (!db) { alert("Supabase bağlantısı bulunamadı."); return; }

        if (secilenId !== null) {
            await guncelle();
            return;
        }

        const urunAdiElement = document.getElementById("urun_adi");
        if (!urunAdiElement) { alert("Ürün Adı alanı bulunamadı."); return; }

        const urunAdi = urunAdiElement.value.trim();
        if (urunAdi === "") { alert("Ürün adı boş bırakılamaz."); urunAdiElement.focus(); return; }

        const receteNoElement = document.getElementById("recete_no");
        let receteNo = receteNoElement ? receteNoElement.value.trim() : "";
        if (receteNo === "") receteNo = await otomatikReceteNo();

        const makineAdi = document.getElementById("makine_adi")?.value.trim() || "";
        const receteTarih = document.getElementById("recete_tarih")?.value.trim() || "";
        const notlar = document.getElementById("notlar")?.value.trim() || "";

        const ayarlarObj = uretimAyarlariTopla();
        ayarlarObj.makine_adi = makineAdi;
        ayarlarObj.recete_tarih = receteTarih;
        ayarlarObj.notlar = notlar;

        const veri = {
            recete_no: receteNo,
            urun_adi: urunAdi,
            makine_adi: makineAdi,
            tarih: receteTarih,
            notlar: notlar,
            uretim_ayarlari: ayarlarObj
        };

        const { data, error } = await db.from("receteler").insert([veri]).select();

        if (error) {
            console.error("Kayıt hatası:", error);
            alert("Kayıt hatası:\n" + error.message);
            return;
        }

        alert("Reçete kaydedildi.");
        temizleForm();
        await receteleriListele();

    } catch (hata) {
        console.error("KAYDET HATASI:", hata);
        alert("Kayıt sırasında hata oluştu:\n" + hata.message);
    }
}

// ======================================================
// REÇETELERİ LİSTELE
// ======================================================
async function receteleriListele() {
    try {
        const db = getSupabase();
        if (!db) return;

        const liste = document.getElementById("liste");
        if (!liste) return;

        const { data, error } = await db.from("receteler").select("*").order("id", { ascending: false });

        if (error) {
            alert("Listeleme hatası:\n" + error.message);
            return;
        }

        liste.innerHTML = "";

        if (!data || data.length === 0) {
            liste.innerHTML = `<tr><td colspan="5" style="text-align:center;">Henüz kayıtlı reçete yok.</td></tr>`;
            const toplam = document.getElementById("toplamRecete");
            if (toplam) toplam.innerText = "0";
            return;
        }

        data.forEach(function(r) {
            let ayarlarObj = r.uretim_ayarlari || r.ayarlar || {};
            const receteNo = r.recete_no || "";
            const urunAdi = r.urun_adi || "";
            const makine = r.makine_adi || ayarlarObj.makine_adi || "";
            const tarih = r.tarih || r.recete_tarih || ayarlarObj.recete_tarih || "";

            // HTML'deki 5 başlıkla tam uyumlu 5 sütun (Reçete No, Ürün, Makine, Tarih, İşlem)
            liste.innerHTML += `
                <tr onclick="detayGoster('${r.id}')" style="cursor: pointer;">
                    <td>${guvenliMetin(receteNo)}</td>
                    <td>${guvenliMetin(urunAdi)}</td>
                    <td>${guvenliMetin(makine)}</td>
                    <td>${guvenliMetin(tarih)}</td>
                    <td>
                        <button type="button" class="btn" style="background-color: #ff8c00; color: white;" onclick="event.stopPropagation(); detayGoster('${r.id}')">Detay</button>
                        <button type="button" class="btn" style="background-color: #007bff; color: white;" onclick="event.stopPropagation(); duzenle('${r.id}')">Düzenle</button>
                        <button type="button" class="btn-danger" onclick="event.stopPropagation(); sil('${r.id}')">Sil</button>
                    </td>
                </tr>
            `;
        });

        const toplam = document.getElementById("toplamRecete");
        if (toplam) toplam.innerText = data.length;

    } catch (hata) {
        console.error("Listeleme hatası:", hata);
    }
}
async function listele() {
    await receteleriListele();
}

// ======================================================
// GÜVENLİ METİN & TEXT YARDIMCILARI
// ======================================================
function guvenliMetin(deger) {
    if (deger === null || deger === undefined) return "";
    return String(deger)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function setText(id, deger) {
    const eleman = document.getElementById(id);
    if (eleman) {
        eleman.innerText = (deger === null || deger === undefined || deger === "") ? "-" : deger;
    }
}

function setValue(id, deger) {
    const eleman = document.getElementById(id);
    if (eleman) {
        eleman.value = (deger === null || deger === undefined) ? "" : deger;
    }
}

function getText(id) {
    const eleman = document.getElementById(id);
    return eleman ? (eleman.innerText || "") : "";
}

// ======================================================
// DETAY GÖSTER
// ======================================================
async function detayGoster(id) {
    try {
        const db = getSupabase();
        if (!db) { alert("Supabase bağlantısı bulunamadı."); return; }

        const { data, error } = await db.from("receteler").select("*").eq("id", id).single();

        if (error || !data) {
            alert("Reçete verisi alınamadı.");
            return;
        }

        detaydakiId = id;
        const a = data.uretim_ayarlari || data.ayarlar || {};

        // 1. Genel Bilgiler (Hız, Basınç, Sıcaklık yerine Tarih)
        setText("detay_recete_no", data.recete_no);
        setText("detay_baslik_no", data.recete_no);
        setText("detay_urun_adi", data.urun_adi);
        setText("detay_makine_adi", data.makine_adi || a.makine_adi);
        setText("detay_recete_tarih", data.tarih || data.recete_tarih || a.recete_tarih);
        setText("detay_notlar", data.notlar || a.notlar || "Not yok");

        // 2. Genel Ayarlar
        setText("detay_ayar_gram", a.ayar_gram);
        setText("detay_ayar_renk", a.ayar_renk);
        setText("detay_ayar_tarih", a.ayar_tarih);
        setText("detay_ayar_servolap", a.ayar_servolap);
        setText("detay_ayar_tarak_hizi", a.ayar_tarak_hizi);
        setText("detay_ayar_firma_adi", a.ayar_firma_adi);

        // 3. Tarak Ayarları
        setText("detay_ayar_ana_tambur", a.ayar_ana_tambur);
        setText("detay_ayar_alt_ara_dofer", a.ayar_alt_ara_dofer);
        setText("detay_ayar_siyirici", a.ayar_siyirici);
        setText("detay_ayar_ust_ara_dofer", a.ayar_ust_ara_dofer);
        setText("detay_ayar_isci", a.ayar_isci);
        setText("detay_ayar_ust_sevk_doferi", a.ayar_ust_sevk_doferi);
        setText("detay_ayar_alt_sevk_doferi", a.ayar_alt_sevk_doferi);
        setText("detay_ayar_ust_dofer_alici", a.ayar_ust_dofer_alici);
        setText("detay_ayar_alt_dofer_alici", a.ayar_alt_dofer_alici);
        setText("detay_ayar_ust_sevk_bandi", a.ayar_ust_sevk_bandi);
        setText("detay_ayar_alt_sevk_bandi", a.ayar_alt_sevk_bandi);

        // 4. Serici Ayarları
        setText("detay_ayar_tulbent_kati", a.ayar_tulbent_kati);
        setText("detay_ayar_besleme_cekim", a.ayar_besleme_cekim);
        setText("detay_ayar_serme_eni_on", a.ayar_serme_eni_on);
        setText("detay_ayar_bant_cekim", a.ayar_bant_cekim);
        setText("detay_ayar_serme_eni_arka", a.ayar_serme_eni_arka);
        setText("detay_ayar_araba_cekim", a.ayar_araba_cekim);
        setText("detay_ayar_cikis_yuksekligi_sag", a.ayar_cikis_yuksekligi_sag);
        setText("detay_ayar_cikis_hafiza", a.ayar_cikis_hafiza);
        setText("detay_ayar_on_cikis_hafiza", a.ayar_on_cikis_hafiza);
        setText("detay_ayar_cikis_yuksekligi_sol", a.ayar_cikis_yuksekligi_sol);
        setText("detay_ayar_arka_cikis_hafiza", a.ayar_arka_cikis_hafiza);

        // 5. Trio & Çektirme
        setText("detay_ayar_trio1", a.ayar_trio1);
        setText("detay_ayar_trio2", a.ayar_trio2);
        setText("detay_ayar_trio3", a.ayar_trio3);
        setText("detay_ayar_trio4", a.ayar_trio4);
        setText("detay_ayar_trio5", a.ayar_trio5);
        setText("detay_ayar_trio6", a.ayar_trio6);

        // 6. Su Jeti & Pompa Ayarları
        setText("detay_ayar_pompa1", a.ayar_pompa1);
        setText("detay_ayar_pompa2", a.ayar_pompa2);
        setText("detay_ayar_pompa3", a.ayar_pompa3);
        setText("detay_ayar_pompa4", a.ayar_pompa4);
        setText("detay_ayar_pompa5", a.ayar_pompa5);
        setText("detay_ayar_pompa6", a.ayar_pompa6);

        setText("detay_ayar_besleme1", a.ayar_besleme1);
        setText("detay_ayar_tambur1", a.ayar_tambur1);
        setText("detay_ayar_tambur2", a.ayar_tambur2);
        setText("detay_ayar_tambur3", a.ayar_tambur3);
        setText("detay_ayar_besleme2", a.ayar_besleme2);
        setText("detay_ayar_sikma_fular", a.ayar_sikma_fular);
        setText("detay_ayar_firin", a.ayar_firin);

        // 7. Balkan & Hammadde
        setText("detay_ayar_balkan1", a.ayar_balkan1);
        setText("detay_ayar_balkan2", a.ayar_balkan2);
        setText("detay_ayar_balkan3", a.ayar_balkan3);
        setText("detay_ayar_hammadde", a.ayar_hammadde);

        // 8. Kesim & Ebatlar
        setText("detay_ayar_kesim_eni", a.ayar_kesim_eni);
        setText("detay_ayar_cap", a.ayar_cap);
        setText("detay_ayar_sarim_metresi", a.ayar_sarim_metresi);
        setText("detay_ayar_saatlik_kg", a.ayar_saatlik_kg);
        setText("detay_ayar_firin_isisi", a.ayar_firin_isisi);
        setText("detay_ayar_hat_hizi", a.ayar_hat_hizi);

        const modal = document.getElementById("detayModal");
        if (modal) modal.style.display = "flex";

    } catch (hata) {
        console.error("DETAY GÖSTER HATA:", hata);
    }
}

function detayKapat() {
    const modal = document.getElementById("detayModal");
    if (modal) modal.style.display = "none";
}

async function detaydanDuzenle() {
    if (detaydakiId === null) return;
    const id = detaydakiId;
    detayKapat();
    await duzenle(id);
}

// ======================================================
// DÜZENLE & GÜNCELLE
// ======================================================
async function duzenle(id) {
    try {
        const db = getSupabase();
        if (!db) return;

        const { data, error } = await db.from("receteler").select("*").eq("id", id).single();
        if (error || !data) return;

        secilenId = id;
        const ayarlarObj = data.uretim_ayarlari || data.ayarlar || {};

        setValue("recete_no", data.recete_no || "");
        setValue("urun_adi", data.urun_adi || "");
        setValue("makine_adi", data.makine_adi || ayarlarObj.makine_adi || "");
        setValue("recete_tarih", data.tarih || data.recete_tarih || ayarlarObj.recete_tarih || "");
        setValue("notlar", data.notlar || ayarlarObj.notlar || "");

        uretimAyarlariYukle(ayarlarObj);

        const buton = document.getElementById("kaydetBtn");
        if (buton) buton.innerText = "Güncelle";

        const urun = document.getElementById("urun_adi");
        if (urun) urun.focus();

    } catch (hata) {
        console.error("DÜZENLE HATASI:", hata);
    }
}

async function guncelle() {
    try {
        if (secilenId === null) return;
        const db = getSupabase();
        if (!db) return;

        const urunAdi = document.getElementById("urun_adi")?.value.trim() || "";
        if (urunAdi === "") { alert("Ürün adı boş bırakılamaz."); return; }

        const receteNo = document.getElementById("recete_no")?.value.trim() || "";
        const makineAdi = document.getElementById("makine_adi")?.value.trim() || "";
        
        // --- DÜZELTİLEN KISIM ---
        // Tarih boşsa "" değil, Supabase'in kabul edeceği null değerini atıyoruz:
        const rawTarih = document.getElementById("recete_tarih")?.value.trim();
        const receteTarih = (rawTarih && rawTarih !== "") ? rawTarih : null;

        const notlar = document.getElementById("notlar")?.value.trim() || "";

        const ayarlarObj = uretimAyarlariTopla();
        ayarlarObj.makine_adi = makineAdi;
        ayarlarObj.recete_tarih = receteTarih;
        ayarlarObj.notlar = notlar;

        const veri = {
            recete_no: receteNo,
            urun_adi: urunAdi,
            makine_adi: makineAdi,
            tarih: receteTarih, // Boşsa null gidecek
            notlar: notlar,
            uretim_ayarlari: ayarlarObj
        };

        const { error } = await db.from("receteler").update(veri).eq("id", secilenId);

        if (error) {
            alert("Güncelleme hatası:\n" + error.message);
            return;
        }

        alert("Reçete güncellendi.");
        temizleForm();
        await receteleriListele();

    } catch (hata) {
        console.error("GÜNCELLEME HATASI:", hata);
    }
}

async function sil(id) {
    if (!confirm("Bu reçete silinsin mi?")) return;
    try {
        const db = getSupabase();
        if (!db) return;

        const { error } = await db.from("receteler").delete().eq("id", id);
        if (error) { alert("Silme hatası:\n" + error.message); return; }

        alert("Reçete silindi.");
        await receteleriListele();
    } catch (hata) {
        console.error("SİLME HATASI:", hata);
    }
}

function yeniRecete() {
    temizleForm();
    const urun = document.getElementById("urun_adi");
    if (urun) urun.focus();
}

function temizle() { temizleForm(); }

// ======================================================
// KOPYALA, YAZDIR, PDF, PAYLAŞ
// ======================================================
async function detayKopyala() {
    if (detaydakiId === null) return;
    try {
        const db = getSupabase();
        if (!db) return;

        const { data } = await db.from("receteler").select("*").eq("id", detaydakiId).single();
        if (!data) return;

        const ayarlarObj = data.uretim_ayarlari || data.ayarlar || {};

        setValue("recete_no", "");
        setValue("urun_adi", (data.urun_adi || "") + " (Kopya)");
        setValue("makine_adi", data.makine_adi || ayarlarObj.makine_adi || "");
        setValue("recete_tarih", data.tarih || data.recete_tarih || ayarlarObj.recete_tarih || "");
        setValue("notlar", data.notlar || ayarlarObj.notlar || "");

        uretimAyarlariYukle(ayarlarObj);
        secilenId = null;

        const buton = document.getElementById("kaydetBtn");
        if (buton) buton.innerText = "Kaydet";

        detayKapat();
        alert("Reçete forma kopyalandı.");
    } catch (e) {
        console.error(e);
    }
}

function detayYazdir() {
    const icerikEl = document.getElementById('detayIcerikAlani') || document.getElementById('detayIcerik');
    if (!icerikEl) return;
    const icerik = icerikEl.innerHTML;

    const yazdirPenceresi = window.open('', '', 'height=600,width=800');
    if (!yazdirPenceresi) return;

    yazdirPenceresi.document.write('<html><head><title>Reçete Detayı</title>');
    yazdirPenceresi.document.write('<style>');
    yazdirPenceresi.document.write(`
        body { font-family: Arial, sans-serif; padding: 10px; }
        .excel-container { width: 100%; }
        .excel-table { width: 100%; border-collapse: collapse; font-size: 11px; }
        .excel-table td { border: 1px solid #000; padding: 4px; }
        .excel-table .section-header { background-color: #FFFF00 !important; font-weight: bold; text-align: center; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .excel-table .label { font-weight: bold; background-color: #f8f9fa; }
    `);
    yazdirPenceresi.document.write('</style></head><body>');
    yazdirPenceresi.document.write(icerik);
    yazdirPenceresi.document.write('</body></html>');

    yazdirPenceresi.document.close();
    yazdirPenceresi.focus();
    setTimeout(() => {
        yazdirPenceresi.print();
        yazdirPenceresi.close();
    }, 500);
}

function pdfIndir() {
    const eleman = document.getElementById('detayIcerikAlani') || document.getElementById('detayIcerik');
    if (!eleman) return;
    const receteNo = document.getElementById('detay_recete_no')?.innerText || 'Recete';

    const ayarlar = {
        margin:       5,
        filename:     `Recete_${receteNo}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, scrollY: 0 },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    if (typeof html2pdf !== 'undefined') {
        html2pdf().set(ayarlar).from(eleman).save();
    } else {
        alert('PDF kütüphanesi (html2pdf) bulunamadı.');
    }
}

async function paylas() {
    const eleman = document.getElementById('detayIcerikAlani') || document.getElementById('detayIcerik');
    const receteNo = document.getElementById('detay_recete_no')?.innerText || 'Recete';

    if (typeof html2pdf !== 'undefined' && eleman) {
        const ayarlar = {
            margin: 5,
            filename: `Recete_${receteNo}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        try {
            const pdfBlob = await html2pdf().set(ayarlar).from(eleman).output('blob');
            const pdfDosyasi = new File([pdfBlob], `Recete_${receteNo}.pdf`, { type: 'application/pdf' });

            if (navigator.canShare && navigator.canShare({ files: [pdfDosyasi] })) {
                await navigator.share({
                    files: [pdfDosyasi],
                    title: `Üretim Reçetesi - ${receteNo}`,
                    text: `Üretim Reçetesi PDF (${receteNo})`
                });
                return;
            }
        } catch (hata) {
            console.error("PDF oluşturma hatası:", hata);
        }
    }

    // Fallback metin paylaşımı
    const urunAdi = getText('detay_urun_adi');
    const metin = `📄 *Üretim Reçetesi Detayı*\n\n*Reçete No:* ${receteNo}\n*Ürün Adı:* ${urunAdi}`;

    if (navigator.share) {
        try {
            await navigator.share({ title: `Reçete: ${receteNo}`, text: metin });
        } catch (e) {}
    } else {
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(metin)}`, '_blank');
    }
}

// ======================================================
// ARAMA VE OLAY DİNLEYİCİLERİ
// ======================================================
function ara() {
    const arama = document.getElementById("arama");
    if (!arama) return;
    const kelime = arama.value.toLowerCase().trim();

    document.querySelectorAll("#liste tr").forEach(function(satir) {
        satir.style.display = satir.innerText.toLowerCase().includes(kelime) ? "" : "none";
    });
}

document.addEventListener("keydown", function(event) {
    if (event.key === "Escape") {
        detayKapat();
        bakimDetayKapat();
    }
});

document.addEventListener("DOMContentLoaded", function() {
    receteleriListele();
    bakimListele();
    const yeniBtn = document.getElementById("yeniReceteBtn");
    if (yeniBtn) yeniBtn.addEventListener("click", yeniRecete);
});

// ==========================================
// ADMIN GİRİŞ KONTROLÜ
// ==========================================
const ADMIN_USER = "bunyamin";
const ADMIN_PASS = "Busra.5744"; 

document.addEventListener("DOMContentLoaded", function () {
    const oturumAcik = localStorage.getItem("adminOturum");
    const loginModal = document.getElementById("loginModal");

    if (oturumAcik === "true") {
        if (loginModal) loginModal.style.display = "none";
    } else {
        if (loginModal) loginModal.style.display = "flex";
    }
});

function adminGiris() {
    const user = document.getElementById("login_user")?.value.trim();
    const pass = document.getElementById("login_pass")?.value.trim();
    const errorMsg = document.getElementById("loginError");
    const loginModal = document.getElementById("loginModal");

    if (user === ADMIN_USER && pass === ADMIN_PASS) {
        localStorage.setItem("adminOturum", "true");
        if (loginModal) loginModal.style.display = "none";
        if (errorMsg) errorMsg.style.display = "none";
    } else {
        if (errorMsg) errorMsg.style.display = "block";
    }
}

function adminCikis() {
    localStorage.removeItem("adminOturum");
    location.reload();
}
// ==========================================
// BAKIM & ONARIM İŞLEMLERİ (GÜNCEL)
// ==========================================

async function bakimKaydet() {
    const tarih = document.getElementById('bakim_tarihi')?.value || '';
    const tip = document.getElementById('bakim_tipi')?.value || '';
    const personel = document.getElementById('bakim_yapan')?.value || '';
    const sonrakiTarih = document.getElementById('sonraki_bakim_tarihi')?.value || '';
    const aciklama = document.getElementById('bakim_aciklama')?.value || '';
    
    const receteNo = document.getElementById('recete_no')?.value || document.getElementById('genel_recete_no')?.value || '';
    const makine = document.getElementById('makine_adi')?.value || document.getElementById('genel_makine')?.value || '';

    if (!tarih && !receteNo) {
        alert("Lütfen en azından Bakım Tarihi veya Reçete No alanını doldurun!");
        return;
    }

    const bakimData = {
        recete_no: receteNo,
        makine: makine,
        bakim_tarihi: tarih || null,
        bakim_tipi: tip,
        bakim_yapan: personel,
        sonraki_bakim_tarihi: sonrakiTarih || null,
        aciklama: aciklama
    };

    const db = typeof getSupabase === 'function' ? getSupabase() : (window.db || window.supabase);

    if (db) {
        const { data, error } = await db
            .from('bakimlar')
            .insert([bakimData]);

        if (error) {
            console.error("Bakım kaydı eklenirken hata oluştu:", error);
            alert("Bakım kaydı kaydedilemedi! Hata: " + error.message);
            return;
        }
    } else {
        alert("Supabase bağlantısı kurulamadığı için kaydedilemedi.");
        return;
    }

    alert("Bakım kaydı başarıyla işlendi!");
    bakimFormTemizle();
    if (typeof bakimListele === 'function') await bakimListele();
}

function bakimFormTemizle() {
    const alanlar = ['bakim_tarihi', 'bakim_tipi', 'bakim_yapan', 'sonraki_bakim_tarihi', 'bakim_aciklama'];
    alanlar.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
}

async function bakimListele() {
    const tbody = document.getElementById('bakimListe');
    if (!tbody) return;

    const db = typeof getSupabase === 'function' ? getSupabase() : (window.db || window.supabase);
    if (!db) return;

    const { data, error } = await db
        .from('bakimlar')
        .select('*')
        .order('id', { ascending: false });

    if (error) {
        console.error("Bakımlar çekilemedi:", error);
        return;
    }

    if (!data || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Henüz kayıtlı bakım verisi yok.</td></tr>';
        return;
    }

    window.tumBakimlar = data;

    tbody.innerHTML = '';
    data.forEach(item => {
        tbody.innerHTML += `
            <tr>
                <td>
                    <a href="javascript:void(0)" onclick="bakimDetayGoster(${item.id})" style="color: #0056b3; font-weight: bold; text-decoration: underline;">
                        ${typeof guvenliMetin === 'function' ? guvenliMetin(item.bakim_tarihi || item.tarih) : (item.bakim_tarihi || item.tarih || '')}
                    </a>
                </td>
                <td>${typeof guvenliMetin === 'function' ? guvenliMetin(item.recete_no || item.makine) : (item.recete_no || item.makine || '')}</td>
                <td>${typeof guvenliMetin === 'function' ? guvenliMetin(item.bakim_tipi || item.tip) : (item.bakim_tipi || item.tip || '')}</td>
                <td>${typeof guvenliMetin === 'function' ? guvenliMetin(item.bakim_yapan || item.personel) : (item.bakim_yapan || item.personel || '')}</td>
                <td>${typeof guvenliMetin === 'function' ? guvenliMetin(item.sonraki_bakim_tarihi) : (item.sonraki_bakim_tarihi || '')}</td>
                <td>${typeof guvenliMetin === 'function' ? guvenliMetin(item.aciklama) : (item.aciklama || '')}</td>
                <td>
                    <button type="button" class="btn-danger" style="padding: 2px 6px; font-size:10px;" onclick="bakimSil(${item.id})">Sil</button>
                </td>
            </tr>
        `;
    });
}

// ======================================================
// BAKIM & ONARIM DETAY MODAL FONKSİYONLARI
// ======================================================
function bakimDetayGoster(id) {
    if (!window.tumBakimlar) return;
    
    const kayit = window.tumBakimlar.find(b => b.id === id);
    if (!kayit) return;

    const yaz = (elementId, deger) => {
        const el = document.getElementById(elementId);
        if (el) el.innerText = (deger && deger !== 'null') ? deger : '-';
    };

    yaz('bdetay_tarih', kayit.bakim_tarihi || kayit.tarih);
    yaz('bdetay_makine', kayit.makine || kayit.makine_adi || kayit.recete_no);
    yaz('bdetay_tip', kayit.bakim_tipi || kayit.tip);
    yaz('bdetay_personel', kayit.bakim_yapan || kayit.personel);
    yaz('bdetay_durum', kayit.durum || kayit.sonraki_bakim_tarihi);
    yaz('bdetay_parca', kayit.degisen_parca || kayit.parca);
    yaz('bdetay_aciklama', kayit.aciklama);

    const modal = document.getElementById('bakimDetayModal');
    if (modal) modal.style.display = 'block';
}

function bakimDetayKapat() {
    const modal = document.getElementById('bakimDetayModal');
    if (modal) modal.style.display = 'none';
}

// SAYFA YÜKLENDİĞİNDE LİSTEYİ BAŞLAT
document.addEventListener("DOMContentLoaded", function() {
    if (typeof receteleriListele === 'function') {
        receteleriListele();
    }
});
async function bakimSil(id) {
    if (!confirm("Bu bakım kaydını silmek istediğinize emin misiniz?")) return;

    const db = typeof getSupabase === 'function' ? getSupabase() : (window.db || window.supabase);
    if (!db) return;

    const { error } = await db
        .from('bakimlar')
        .delete()
        .eq('id', id);

    if (error) {
        alert("Silinirken hata oluştu: " + error.message);
    } else {
        await bakimListele();
    }
}

function bakimAra() {
    const aramaElemani = document.getElementById('bakimArama');
    if (!aramaElemani) return;
    const aramaMetni = aramaElemani.value.toLowerCase();
    const satirListesi = document.querySelectorAll('#bakimListe tr');

    satirListesi.forEach(satir => {
        const icerik = satir.innerText.toLowerCase();
        satir.style.display = icerik.includes(aramaMetni) ? '' : 'none';
    });
}

function sekmeDegistir(tabId, btnElement) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.style.display = 'none');
    
    const secilenTab = document.getElementById(tabId);
    if (secilenTab) secilenTab.style.display = 'block';

    document.querySelectorAll('.btn-tab').forEach(btn => btn.style.background = '#666');
    if (btnElement) btnElement.style.background = '#1976d2';

    if (tabId === 'bakimTab' && typeof bakimListele === 'function') {
        bakimListele();
    }
}
function sekmeDegistir(tabId, btnElement) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.style.display = 'none');

    const secilenTab = document.getElementById(tabId);
    if (secilenTab) secilenTab.style.display = 'block';

    document.querySelectorAll('.btn-tab').forEach(btn => btn.style.background = '#666');
    if (btnElement) btnElement.style.background = '#1976d2';

    if (tabId === 'bakimTab' && typeof bakimListele === 'function') {
        bakimListele();
    }
    
    // BURAYI EKLİYORUZ (870. Satırın Hemen Altı):
    if (tabId === 'parcaListesiSekmesi' && typeof parcaListeleriniGetir === 'function') {
        parcaListeleriniGetir();
    }
}
// ==========================================
// PARÇA LİSTESİ İŞLEMLERİ (GÜNCELLENMİŞ)
// ==========================================

// Supabase istemcisini tespit eden ve yoksa oluşturan fonksiyon
function getParcaSupabase() {
    // 1. Hazır tanımlanmış istemcileri kontrol et (en çok kullanılan isimler)
    if (typeof _supabase !== 'undefined' && typeof _supabase.from === 'function') return _supabase;
    if (typeof supabaseClient !== 'undefined' && typeof supabaseClient.from === 'function') return supabaseClient;
    if (window.supabaseClient && typeof window.supabaseClient.from === 'function') return window.supabaseClient;
    
    // 2. Eğer projedeki ana 'supabase' değişkeni bir istemciyse onu döndür
    if (typeof supabase !== 'undefined' && typeof supabase.from === 'function') return supabase;

    // 3. Eğer getSupabase() fonksiyonun varsa onu çağır
    if (typeof getSupabase === 'function') {
        const temp = getSupabase();
        if (temp && typeof temp.from === 'function') return temp;
    }

    // 4. Bulunamadıysa js/supabase.js içindeki bilgileri kullanarak sıfırdan oluştur
    if (typeof SUPABASE_URL !== 'undefined' && typeof SUPABASE_KEY !== 'undefined') {
        if (typeof supabase !== 'undefined' && typeof supabase.createClient === 'function') {
            window._supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
            return window._supabase;
        }
    }

    console.error("Supabase istemcisi bağlanamadı!");
    return null;
}

// Global değişkenler
let tumParcaListeleri = [];
let seciliParcaId = null;

// Sayfa yüklendediğinde listeleri açılır kutuya getir
document.addEventListener("DOMContentLoaded", function() {
    parcaListeleriniGetir();
});

// 1. Listeleri Supabase'den Getir ve Dropdown'ı Doldur
async function parcaListeleriniGetir() {
    const select = document.getElementById('kayitliParcaListesiSelect');
    if (!select) return;

    const db = getParcaSupabase();
    if (!db) return;

    const { data, error } = await db.from('parca_listeleri').select('*').order('created_at', { ascending: false });

    if (error) {
        console.error('Listeler çekilemedi:', error.message);
        return;
    }

    tumParcaListeleri = data || [];
    select.innerHTML = '<option value="">-- Bir Kayıt Seçin veya Yeni Oluşturun --</option>';

    tumParcaListeleri.forEach(item => {
        const tarih = new Date(item.created_at).toLocaleDateString('tr-TR');
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = `${item.baslik} (${tarih})`;
        select.appendChild(option);
    });
}

// 2. Açılır Kutudan Seçildiğinde Tablodaki 32 Kutucuğu Otomatik Doldur
function parcaSecildigindeDoldur(id) {
    if (document.getElementById('ekran_liste_basligi')) {
    document.getElementById('ekran_liste_basligi').value = 'MAKİNA PARÇA LİSTESİ';
}
    if (!id) {
        seciliParcaId = null;
        parcaFormTemizle();
        return;
    }

    const secilen = tumParcaListeleri.find(x => x.id == id);
    if (!secilen) return;

    seciliParcaId = secilen.id;

    if (document.getElementById('parca_liste_baslik')) {
        document.getElementById('parca_liste_baslik').value = secilen.baslik || '';
    }

    if (secilen.veriler && Array.isArray(secilen.veriler)) {
        secilen.veriler.forEach((satir, idx) => {
            const i = idx + 1;
            const elAit1 = document.getElementById(`p_ait_${(i*2)-1}`);
            const elOlc1 = document.getElementById(`p_olc_${(i*2)-1}`);
            const elAit2 = document.getElementById(`p_ait_${i*2}`);
            const elOlc2 = document.getElementById(`p_olc_${i*2}`);

            if (elAit1) elAit1.value = satir.ait1 || '';
            if (elOlc1) elOlc1.value = satir.olc1 || '';
            if (elAit2) elAit2.value = satir.ait2 || '';
            if (elOlc2) elOlc2.value = satir.olc2 || '';
        });
    }
}

// 3. YENİ KAYDET (16 Satır / 32 Kutucuk)
async function parcaKaydet() {
    const baslik = document.getElementById('parca_liste_baslik')?.value.trim() || 'Parça Listesi';

    const veriler = [];
    for (let i = 1; i <= 16; i++) {
        const ait1 = document.getElementById(`p_ait_${(i*2)-1}`)?.value || '';
        const olc1 = document.getElementById(`p_olc_${(i*2)-1}`)?.value || '';
        const ait2 = document.getElementById(`p_ait_${i*2}`)?.value || '';
        const olc2 = document.getElementById(`p_olc_${i*2}`)?.value || '';
        veriler.push({ ait1, olc1, ait2, olc2 });
    }

    const db = getParcaSupabase();
    if (!db) return;

    const { error } = await db.from('parca_listeleri').insert([{ baslik, veriler }]);

    if (error) {
        alert('Kaydedilirken hata oluştu: ' + error.message);
    } else {
        alert('Yeni parça listesi başarıyla kaydedildi!');
        parcaFormTemizle();
        parcaListeleriniGetir();
    }
}

// 4. MEVCUT KAYDI GÜNCELLE
async function parcaGuncelle() {
    if (!seciliParcaId) {
        alert('Lütfen önce güncellenecek bir kayıt seçin!');
        return;
    }

    const baslik = document.getElementById('parca_liste_baslik')?.value.trim() || 'Parça Listesi';
    const veriler = [];
    for (let i = 1; i <= 16; i++) {
        const ait1 = document.getElementById(`p_ait_${(i*2)-1}`)?.value || '';
        const olc1 = document.getElementById(`p_olc_${(i*2)-1}`)?.value || '';
        const ait2 = document.getElementById(`p_ait_${i*2}`)?.value || '';
        const olc2 = document.getElementById(`p_olc_${i*2}`)?.value || '';
        veriler.push({ ait1, olc1, ait2, olc2 });
    }

    const db = getParcaSupabase();
    if (!db) return;

    const { error } = await db.from('parca_listeleri').update({ baslik, veriler }).eq('id', seciliParcaId);

    if (error) {
        alert('Güncellenirken hata oluştu: ' + error.message);
    } else {
        alert('Parça listesi başarıyla güncellendi!');
        parcaListeleriniGetir();
    }
}

// 5. KAYDI SİL
async function parcaSil() {
    if (!seciliParcaId) {
        alert('Lütfen önce silinecek bir kayıt seçin!');
        return;
    }

    if (!confirm('Seçili parça listesini silmek istediğinize emin misiniz?')) return;

    const db = getParcaSupabase();
    if (!db) return;

    const { error } = await db.from('parca_listeleri').delete().eq('id', seciliParcaId);

    if (error) {
        alert('Silinirken hata oluştu: ' + error.message);
    } else {
        alert('Kayıt silindi.');
        parcaFormTemizle();
        parcaListeleriniGetir();
    }
}

// 6. FORM TEMİZLEME (32 Kutucuğu Temizler)
function parcaFormTemizle() {
    seciliParcaId = null;
    if (document.getElementById('ekran_liste_basligi')) {
    document.getElementById('ekran_liste_basligi').value = 'MAKİNA PARÇA LİSTESİ';
}
    if (document.getElementById('kayitliParcaListesiSelect')) {
        document.getElementById('kayitliParcaListesiSelect').value = '';
    }
    if (document.getElementById('parca_liste_baslik')) {
        document.getElementById('parca_liste_baslik').value = '';
    }
    for (let i = 1; i <= 32; i++) {
        if (document.getElementById(`p_ait_${i}`)) document.getElementById(`p_ait_${i}`).value = '';
        if (document.getElementById(`p_olc_${i}`)) document.getElementById(`p_olc_${i}`).value = '';
    }
}

// 7. YAZDIR, PDF, PAYLAŞ
function parcaYazdir() { window.print(); }
function parcaPdfIndir() { window.print(); }
function parcaPaylas() {
    if (navigator.share) {
        navigator.share({ title: 'Parça Listesi', url: window.location.href });
    } else {
        alert('Tarayıcınız paylaşımı desteklemiyor.');
    }
}
// ==============================================================
// MAKİNE FOTO GALERİ MANTIĞI & SUPABASE STORAGE INTEGRASYONU
// ==============================================================

let secilenFotograflar = [];

// Supabase İstemcisini Bağlam Biçimi
function getGaleriSupabase() {
    if (typeof supabase !== 'undefined') return supabase;
    if (typeof _supabase !== 'undefined') return _supabase;
    if (typeof getParcaSupabase === 'function') return getParcaSupabase();
    console.error("Supabase istemcisi bulunamadı!");
    return null;
}

// 1. FOTOĞRAF SEÇME VE SIKIŞTIRMA (MAX 10 ADET)
async function fotoSecildi(event) {
    const files = Array.from(event.target.files);
    
    if (secilenFotograflar.length + files.length > 10) {
        alert("En fazla 10 adet fotoğraf yükleyebilirsiniz!");
        return;
    }

    for (let file of files) {
        const compressedBlob = await fotoSikistir(file);
        secilenFotograflar.push({
            file: compressedBlob,
            name: `foto_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`,
            previewUrl: URL.createObjectURL(compressedBlob)
        });
    }

    fotoOnizlemeGuncelle();
    // Input değerini sıfırla ki aynı dosya tekrar seçilebilsin
    event.target.value = '';
}

function fotoSikistir(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                const maxDim = 1200;

                if (width > height && width > maxDim) {
                    height *= maxDim / width;
                    width = maxDim;
                } else if (height > maxDim) {
                    width *= maxDim / height;
                    height = maxDim;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.7);
            };
        };
    });
}

function fotoOnizlemeGuncelle() {
    const container = document.getElementById('fotoOnizlemeContainer');
    if (!container) return;
    container.innerHTML = '';

    secilenFotograflar.forEach((foto, index) => {
        const div = document.createElement('div');
        div.style.cssText = 'position: relative; width: 100px; height: 100px; border-radius: 6px; overflow: hidden; border: 1px solid #ccc;';
        
        div.innerHTML = `
            <img src="${foto.previewUrl}" style="width: 100%; height: 100%; object-fit: cover; cursor: pointer;" onclick="window.open('${foto.previewUrl}', '_blank')">
            <button type="button" onclick="fotoSil(${index})" style="position: absolute; top: 2px; right: 2px; background: rgba(255,0,0,0.8); color: white; border: none; border-radius: 50%; width: 20px; height: 20px; font-size: 11px; cursor: pointer;">✕</button>
        `;
        container.appendChild(div);
    });
}

function fotoSil(index) {
    // Bellek sızıntısını önlemek için URL'yi serbest bırak
    if (secilenFotograflar[index] && secilenFotograflar[index].previewUrl) {
        URL.revokeObjectURL(secilenFotograflar[index].previewUrl);
    }
    secilenFotograflar.splice(index, 1);
    fotoOnizlemeGuncelle();
}

async function galeriKaydet() {
    // Doğrudan istemciye erişim garantisi
    const db = window.supabaseClient || window.sbClient || (typeof supabase !== 'undefined' && supabase.createClient ? null : supabase); 
    
    // Eğer istemci henüz oluşturulmadıysa anında oluştur
    let client = db;
    if (!client || typeof client.from !== 'function') {
        if (typeof SUPABASE_URL !== 'undefined' && typeof SUPABASE_ANON_KEY !== 'undefined') {
            client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        } else {
            alert("Supabase bağlantısı kurulamadı! Lütfen sayfayı yenileyin.");
            return;
        }
    }

    const baslik = document.getElementById('galeri_baslik')?.value.trim();
    const makine = document.getElementById('galeri_makine')?.value.trim();
    const tarih = document.getElementById('galeri_tarih')?.value;
    const notlar = document.getElementById('galeri_notlar')?.value.trim();

    if (!baslik) {
        alert("Lütfen galeri başlığı giriniz!");
        return;
    }

    if (secilenFotograflar.length === 0) {
        alert("Lütfen en az 1 adet fotoğraf yükleyin!");
        return;
    }

    try {
        let yuklenenUrlListesi = [];

        // Fotoğrafları Storage Bucket'a Yükle
        for (let foto of secilenFotograflar) {
            const { data, error } = await client.storage
                .from('makine-fotograflari')
                .upload(foto.name, foto.file);

            if (error) throw error;

            // Görsel Public URL Adresini Al
            const { data: urlData } = client.storage
                .from('makine-fotograflari')
                .getPublicUrl(foto.name);

            yuklenenUrlListesi.push(urlData.publicUrl);
        }

        // Veritabanı Tablosuna Kaydet
        const { error: dbError } = await client
            .from('makine_galeri')
            .insert([{
                baslik: baslik,
                makine_adi: makine,
                tarih: tarih || null,
                notlar: notlar,
                fotograflar: yuklenenUrlListesi
            }]);

        if (dbError) throw dbError;

        alert("Galeri başarıyla kaydedildi! 🚀");
        galeriFormTemizle();
        galerileriGetir();

    } catch (err) {
        console.error(err);
        alert("Kaydetme hatası: " + err.message);
    }
}
async function galerileriGetir() {
    const client = window.supabaseClient || window.sbClient || (typeof supabase !== 'undefined' && typeof supabase.from === 'function' ? supabase : null);

    if (!client || typeof client.from !== 'function') {
        console.error("Galeriler getirilemedi: Supabase istemcisi hazır değil.");
        return;
    }

    try {
        const { data, error } = await client
            .from('makine_galeri')
            .select('*')
            .order('id', { ascending: false });

        if (error) throw error;

        // HTML üzerindeki liste konteynerini bul
        const galeriListesi = document.getElementById('galeriListesi') || document.getElementById('galeri_listesi');
        
        if (galeriListesi) {
            galeriListesi.innerHTML = '';

            if (data.length === 0) {
                galeriListesi.innerHTML = '<p style="text-align:center; padding:15px;">Henüz kayıtlı galeri bulunmuyor.</p>';
                return;
            }

            data.forEach(item => {
                let fotoHtml = '';
                if (item.fotograflar && item.fotograflar.length > 0) {
                    fotoHtml = item.fotograflar.map(url => 
                        `<img src="${url}" style="width:80px; height:80px; object-fit:cover; margin:3px; border-radius:6px; cursor:pointer;" onclick="window.open('${url}', '_blank')" />`
                    ).join('');
                }

                galeriListesi.innerHTML += `
                    <div style="border:1px solid #ddd; padding:12px; margin-bottom:12px; border-radius:8px; background:#fff;">
                        <h4 style="margin:0 0 5px 0;">${item.baslik || 'Başlıksız'}</h4>
                        <p style="margin:3px 0; font-size:13px;"><strong>Makine:</strong> ${item.makine_adi || '-'}</p>
                        <p style="margin:3px 0; font-size:13px;"><strong>Tarih:</strong> ${item.tarih || '-'}</p>
                        <p style="margin:3px 0; font-size:13px;"><strong>Not:</strong> ${item.notlar || '-'}</p>
                        <div style="display:flex; flex-wrap:wrap; margin-top:8px;">${fotoHtml}</div>
                    </div>
                `;
            });
        }
    } catch (err) {
        console.error("Galeriler getirilirken hata:", err);
    }
}
function galeriFormTemizle() {
    const baslik = document.getElementById('galeri_baslik');
    const makine = document.getElementById('galeri_makine');
    const tarih = document.getElementById('galeri_tarih');
    const notlar = document.getElementById('galeri_notlar');

    if (baslik) baslik.value = '';
    if (makine) makine.value = '';
    if (tarih) tarih.value = '';
    if (notlar) notlar.value = '';

    // Seçilen fotoğrafları temizle
    if (typeof secilenFotograflar !== 'undefined') {
        secilenFotograflar = [];
    }
    
    // Önizleme alanını temizle
    const onizlemeAlani = document.getElementById('foto_onizleme');
    if (onizlemeAlani) onizlemeAlani.innerHTML = '';
}
async function galerileriGetir() {
    const client = window.supabaseClient || window.sbClient || (typeof supabase !== 'undefined' && typeof supabase.from === 'function' ? supabase : null);

    if (!client || typeof client.from !== 'function') {
        console.error("Galeriler getirilemedi: Supabase istemcisi hazır değil.");
        return;
    }

    try {
        const { data, error } = await client
            .from('makine_galeri')
            .select('*')
            .order('id', { ascending: false });

        if (error) throw error;

        // HTML üzerindeki liste konteynerini bul
        const galeriListesi = document.getElementById('galeriListesi') || document.getElementById('galeri_listesi');
        
        if (galeriListesi) {
            galeriListesi.innerHTML = '';

            if (data.length === 0) {
                galeriListesi.innerHTML = '<p style="text-align:center; padding:15px;">Henüz kayıtlı galeri bulunmuyor.</p>';
                return;
            }

            data.forEach(item => {
                let fotoHtml = '';
                if (item.fotograflar && item.fotograflar.length > 0) {
                    fotoHtml = item.fotograflar.map(url => 
                        `<img src="${url}" style="width:80px; height:80px; object-fit:cover; margin:3px; border-radius:6px; cursor:pointer;" onclick="window.open('${url}', '_blank')" />`
                    ).join('');
                }

                galeriListesi.innerHTML += `
                    <div style="border:1px solid #ddd; padding:12px; margin-bottom:12px; border-radius:8px; background:#fff;">
                        <h4 style="margin:0 0 5px 0;">${item.baslik || 'Başlıksız'}</h4>
                        <p style="margin:3px 0; font-size:13px;"><strong>Makine:</strong> ${item.makine_adi || '-'}</p>
                        <p style="margin:3px 0; font-size:13px;"><strong>Tarih:</strong> ${item.tarih || '-'}</p>
                        <p style="margin:3px 0; font-size:13px;"><strong>Not:</strong> ${item.notlar || '-'}</p>
                        <div style="display:flex; flex-wrap:wrap; margin-top:8px;">${fotoHtml}</div>
                    </div>
                `;
            });
        }
    } catch (err) {
        console.error("Galeriler getirilirken hata:", err);
    }
}
