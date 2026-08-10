// ======================================================
// ÜRETİM REÇETE YÖNETİM SİSTEMİ
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
    if (window.sbClient) return window.sbClient;
    if (window.supabaseClient) return window.supabaseClient;
    if (window.supabase) return window.supabase;
    console.error("Supabase bağlantısı bulunamadı.");
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
        "recete_no", "urun_adi", "makine_adi", "hiz", "sicaklik", "basinc", "notlar",
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
        const hiz = document.getElementById("hiz")?.value.trim() || "";
        const sicaklik = document.getElementById("sicaklik")?.value.trim() || "";
        const basinc = document.getElementById("basinc")?.value.trim() || "";
        const notlar = document.getElementById("notlar")?.value.trim() || "";

        const ayarlarObj = uretimAyarlariTopla();
        ayarlarObj.makine_adi = makineAdi;
        ayarlarObj.hiz = hiz;
        ayarlarObj.sicaklik = sicaklik;
        ayarlarObj.basinc = basinc;
        ayarlarObj.notlar = notlar;

        const veri = {
            recete_no: receteNo,
            urun_adi: urunAdi,
            makine_adi: makineAdi,
            hiz: hiz,
            sicaklik: sicaklik,
            basinc: basinc,
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
            liste.innerHTML = `<tr><td colspan="7" style="text-align:center;">Henüz kayıtlı reçete yok.</td></tr>`;
            const toplam = document.getElementById("toplamRecete");
            if (toplam) toplam.innerText = "0";
            return;
        }

        data.forEach(function(r) {
            let ayarlarObj = r.uretim_ayarlari || r.ayarlar || {};
            const receteNo = r.recete_no || "";
            const urunAdi = r.urun_adi || "";
            const makine = r.makine_adi || ayarlarObj.makine_adi || "";
            const hiz = r.hiz || ayarlarObj.hiz || "";
            const sicaklik = r.sicaklik || ayarlarObj.sicaklik || "";
            const basinc = r.basinc || ayarlarObj.basinc || "";

            liste.innerHTML += `
                <tr>
                    <td>${guvenliMetin(receteNo)}</td>
                    <td>${guvenliMetin(urunAdi)}</td>
                    <td>${guvenliMetin(makine)}</td>
                    <td>${guvenliMetin(hiz)}</td>
                    <td>${guvenliMetin(sicaklik)}</td>
                    <td>${guvenliMetin(basinc)}</td>
                    <td>
                        <button type="button" class="btn" onclick="detayGoster(${r.id})">Detay</button>
                        <button type="button" class="btn" onclick="duzenle(${r.id})">Düzenle</button>
                        <button type="button" class="btn-danger" onclick="sil(${r.id})">Sil</button>
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
// DETAY GÖSTER (HTML TAM UYUMLU DÜZELTME)
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

        // 1. Genel Bilgiler
        setText("detay_recete_no", data.recete_no);
        setText("detay_baslik_no", data.recete_no);
        setText("detay_urun_adi", data.urun_adi);
        setText("detay_makine_adi", data.makine_adi || a.makine_adi);
        setText("detay_hiz", data.hiz || a.hiz);
        setText("detay_sicaklik", data.sicaklik || a.sicaklik);
        setText("detay_basinc", data.basinc || a.basinc);
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
        setValue("hiz", data.hiz || ayarlarObj.hiz || "");
        setValue("sicaklik", data.sicaklik || ayarlarObj.sicaklik || "");
        setValue("basinc", data.basinc || ayarlarObj.basinc || "");
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
        const hiz = document.getElementById("hiz")?.value.trim() || "";
        const sicaklik = document.getElementById("sicaklik")?.value.trim() || "";
        const basinc = document.getElementById("basinc")?.value.trim() || "";
        const notlar = document.getElementById("notlar")?.value.trim() || "";

        const ayarlarObj = uretimAyarlariTopla();
        ayarlarObj.makine_adi = makineAdi;
        ayarlarObj.hiz = hiz;
        ayarlarObj.sicaklik = sicaklik;
        ayarlarObj.basinc = basinc;
        ayarlarObj.notlar = notlar;

        const veri = {
            recete_no: receteNo,
            urun_adi: urunAdi,
            makine_adi: makineAdi,
            hiz: hiz,
            sicaklik: sicaklik,
            basinc: basinc,
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
        setValue("hiz", data.hiz || ayarlarObj.hiz || "");
        setValue("sicaklik", data.sicaklik || ayarlarObj.sicaklik || "");
        setValue("basinc", data.basinc || ayarlarObj.basinc || "");
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
    const modalIcerik = document.getElementById("detayIcerik");
    if (!modalIcerik) return;

    const yazdir = window.open("", "_blank", "width=900,height=800");
    if (!yazdir) return;

    yazdir.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Üretim Reçetesi Detayı</title>
            <style>
                body { font-family: sans-serif; padding: 20px; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
                th, td { border: 1px solid #ccc; padding: 5px; font-size: 12px; }
            </style>
        </head>
        <body>
            ${modalIcerik.innerHTML}
            <script>window.onload = function() { window.print(); };<\/script>
        </body>
        </html>
    `);
    yazdir.document.close();
}

function pdfIndir() {
    const element = document.getElementById('detayIcerik');
    const receteNo = getText('detay_recete_no') || 'Recete';

    const opt = {
        margin: 10,
        filename: 'Recete_' + receteNo + '.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    if (typeof html2pdf !== 'undefined') {
        html2pdf().set(opt).from(element).save();
    } else {
        alert('PDF kütüphanesi bulunamadı.');
    }
}

async function paylas() {
    const receteNo = getText('detay_recete_no');
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
    if (event.key === "Escape") detayKapat();
});

document.addEventListener("DOMContentLoaded", function() {
    receteleriListele();
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
