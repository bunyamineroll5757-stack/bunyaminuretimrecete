// ======================================================
// ÜRETİM REÇETE YÖNETİM SİSTEMİ
// Script.js - TÜM SORUNLARI DÜZELTİLMİŞ TAM SÜRÜM
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
        "ayar_ust_sevk_bandi", "ayar_alt_sevk_bandi", "ayar_tulbent_kati", "ayar_besleme_cekim",
        "ayar_serme_eni_on", "ayar_bant_cekim", "ayar_serme_eni_arka", "ayar_araba_cekim",
        "ayar_cikis_yuksekligi_sag", "ayar_cikis_hafiza", "ayar_on_cikis_hafiza", "ayar_cikis_yuksekligi_sol",
        "ayar_arka_cikis_hafiza", "ayar_trio1", "ayar_trio2", "ayar_trio3", "ayar_trio4", "ayar_trio5", "ayar_trio6",
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
        "ayar_ust_sevk_bandi", "ayar_alt_sevk_bandi", "ayar_tulbent_kati", "ayar_besleme_cekim",
        "ayar_serme_eni_on", "ayar_bant_cekim", "ayar_serme_eni_arka", "ayar_araba_cekim",
        "ayar_cikis_yuksekligi_sag", "ayar_cikis_hafiza", "ayar_on_cikis_hafiza", "ayar_cikis_yuksekligi_sol",
        "ayar_arka_cikis_hafiza", "ayar_trio1", "ayar_trio2", "ayar_trio3", "ayar_trio4", "ayar_trio5", "ayar_trio6",
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
        if (!db) {
            alert("Supabase bağlantısı bulunamadı.");
            return;
        }

        if (secilenId !== null) {
            await guncelle();
            return;
        }

        const urunAdiElement = document.getElementById("urun_adi");
        if (!urunAdiElement) {
            alert("Ürün Adı alanı bulunamadı.");
            return;
        }

        const urunAdi = urunAdiElement.value.trim();
        if (urunAdi === "") {
            alert("Ürün adı boş bırakılamaz.");
            urunAdiElement.focus();
            return;
        }

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

        const { data, error } = await db
            .from("receteler")
            .select("*")
            .order("id", { ascending: false });

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
        alert("Listeleme hatası:\n" + hata.message);
    }
}

async function listele() {
    await receteleriListele();
}

// ======================================================
// GÜVENLİ METİN & AYARLAMA YARDIMCILARI
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

function setValue(id, deger) {
    const eleman = document.getElementById(id);
    if (eleman) {
        eleman.value = (deger === null || deger === undefined) ? "" : deger;
    }
}

function setText(id, deger) {
    const eleman = document.getElementById(id);
    if (eleman) {
        eleman.innerText = (deger === null || deger === undefined || deger === "") ? "-" : deger;
    }
}

function getText(id) {
    const eleman = document.getElementById(id);
    return eleman ? (eleman.innerText || "") : "";
}

// ======================================================
// DETAY PENCERESİ VE KOPYALAMA
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
            alert("Reçete bulunamadı.");
            return;
        }

        detaydakiId = id;
        const ayarlarObj = data.uretim_ayarlari || data.ayarlar || {};

        setText("detay_recete_no", data.recete_no || "-");
        setText("detay_baslik_no", data.recete_no || "-");
        setText("detay_urun_adi", data.urun_adi || "-");
        setText("detay_makine_adi", data.makine_adi || ayarlarObj.makine_adi || "-");
        setText("detay_hiz", data.hiz || ayarlarObj.hiz || "-");
        setText("detay_sicaklik", data.sicaklik || ayarlarObj.sicaklik || "-");
        setText("detay_basinc", data.basinc || ayarlarObj.basinc || "-");
        setText("detay_notlar", data.notlar || ayarlarObj.notlar || "Not yok");

        const modal = document.getElementById("detayModal");
        if (modal) modal.style.display = "flex";

    } catch (hata) {
        console.error("DETAY HATASI:", hata);
        alert("Reçete alınamadı:\n" + hata.message);
    }
}

function detayKapat() {
    const modal = document.getElementById("detayModal");
    if (modal) modal.style.display = "none";
}

async function detaydanDuzenle() {
    if (detaydakiId === null) {
        alert("Düzenlenecek reçete bulunamadı.");
        return;
    }
    const id = detaydakiId;
    detayKapat();
    await duzenle(id);
}

function detayKopyala() {
    const urunAdi = getText("detay_urun_adi");
    const makineAdi = getText("detay_makine_adi");
    const hiz = getText("detay_hiz");
    const sicaklik = getText("detay_sicaklik");
    const basinc = getText("detay_basinc");
    const notlar = getText("detay_notlar");

    setValue("recete_no", "");
    setValue("urun_adi", urunAdi === "-" ? "" : urunAdi);
    setValue("makine_adi", makineAdi === "-" ? "" : makineAdi);
    setValue("hiz", hiz === "-" ? "" : hiz);
    setValue("sicaklik", sicaklik === "-" ? "" : sicaklik);
    setValue("basinc", basinc === "-" ? "" : basinc);
    setValue("notlar", notlar === "Not yok" ? "" : notlar);

    secilenId = null;
    const buton = document.getElementById("kaydetBtn");
    if (buton) buton.innerText = "Kaydet";

    detayKapat();
    const urun = document.getElementById("urun_adi");
    if (urun) urun.focus();

    alert("Reçete kopyalandı.\nBilgiler forma aktarıldı.\nYeni reçete olarak kaydetmek için Kaydet'e basın.");
}

// ======================================================
// DÜZENLE VE GÜNCELLE
// ======================================================
async function duzenle(id) {
    try {
        const db = getSupabase();
        if (!db) {
            alert("Supabase bağlantısı bulunamadı.");
            return;
        }

        const { data, error } = await db.from("receteler").select("*").eq("id", id).single();
        if (error || !data) {
            alert("Reçete bulunamadı.");
            return;
        }

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

        window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (hata) {
        console.error("DÜZENLE HATASI:", hata);
        alert("Reçete bilgileri alınamadı:\n" + hata.message);
    }
}

async function guncelle() {
    try {
        if (secilenId === null) {
            alert("Önce düzenlenecek reçeteyi seçin.");
            return;
        }

        const db = getSupabase();
        if (!db) {
            alert("Supabase bağlantısı bulunamadı.");
            return;
        }

        const urunAdi = document.getElementById("urun_adi")?.value.trim() || "";
        if (urunAdi === "") {
            alert("Ürün adı boş bırakılamaz.");
            return;
        }

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

        const guncelVeri = {
            recete_no: receteNo,
            urun_adi: urunAdi,
            makine_adi: makineAdi,
            hiz: hiz,
            sicaklik: sicaklik,
            basinc: basinc,
            notlar: notlar,
            uretim_ayarlari: ayarlarObj
        };

        const { error } = await db.from("receteler").update(guncelVeri).eq("id", secilenId);

        if (error) {
            alert("Güncelleme hatası:\n" + error.message);
            return;
        }

        alert("Reçete başarıyla güncellendi.");
        temizleForm();
        await receteleriListele();

    } catch (hata) {
        console.error("GÜNCELLEME HATASI:", hata);
        alert("Güncelleme sırasında hata oluştu:\n" + hata.message);
    }
}

// ======================================================
// SİL
// ======================================================
async function sil(id) {
    if (!confirm("Bu reçeteyi silmek istediğinize emin misiniz?")) return;

    try {
        const db = getSupabase();
        if (!db) return;

        const { error } = await db.from("receteler").delete().eq("id", id);

        if (error) {
            alert("Silme hatası:\n" + error.message);
            return;
        }

        alert("Reçete silindi.");
        await receteleriListele();

    } catch (hata) {
        console.error("SİLME HATASI:", hata);
        alert("Silme sırasında hata oluştu:\n" + hata.message);
    }
}

// ======================================================
// FORMU TEMİZLE / YENİ REÇETE
// ======================================================
function yeniRecete() {
    temizleForm();
    const urun = document.getElementById("urun_adi");
    if (urun) urun.focus();
}

function temizle() {
    temizleForm();
}

// ======================================================
// ARAMA
// ======================================================
function ara() {
    const arama = document.getElementById("arama");
    if (!arama) return;

    const kelime = arama.value.toLowerCase().trim();
    document.querySelectorAll("#liste tr").forEach(function(satir) {
        const metin = satir.innerText.toLowerCase();
        if (metin.includes(kelime)) {
            satir.style.display = "";
        } else {
            satir.style.display = "none";
        }
    });
}

// ======================================================
// PDF İNDİRME (DÜZELTİLDİ: INPUT VERİLERİ DÂHİL TAM ÇIKTI)
// ======================================================
function pdfIndir() {
    const element = document.querySelector('.excel-container') || 
                    document.querySelector('.container') || 
                    document.body;

    if (!element) {
        alert("Yazdırılacak üretim ayarları tablosu bulunamadı!");
        return;
    }

    const receteEl = document.getElementById('recete_no');
    const receteNo = (receteEl && receteEl.value.trim()) ? receteEl.value.trim() : 'Recete';

    const opt = {
        margin:       [5, 5, 5, 5],
        filename:     `Recete_${receteNo}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { 
            scale: 2, 
            useCORS: true,
            logging: false,
            onclone: (clonedDoc) => {
                const inputs = clonedDoc.querySelectorAll('input, select, textarea');
                inputs.forEach(input => {
                    if (input.value) {
                        input.setAttribute('value', input.value);
                    }
                });
            }
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    if (typeof html2pdf !== 'undefined') {
        html2pdf().set(opt).from(element).save();
    } else {
        alert('PDF kütüphanesi yüklenemedi. Lütfen index.html dosyasını kontrol edin.');
    }
}

// ======================================================
// YAZDIRMA
// ======================================================
function detayYazdir() {
    window.print();
}

// ======================================================
// PAYLAŞ (DÜZELTİLDİ: KESİM EBATLARI VE TÜM PARAMETRELER DÂHİL)
// ======================================================
async function paylas() {
    const getV = (id) => {
        const el = document.getElementById(id);
        return (el && el.value && el.value.trim() !== "") ? el.value.trim() : "-";
    };

    const metin = 
`📄 *ÜRETİM REÇETESİ TAM DETAYI*

📌 *GENEL BİLGİLER*
• Reçete No: ${getV('recete_no')}
• Ürün Adı: ${getV('urun_adi')}
• Makine Adı: ${getV('makine_adi')}
• Hız: ${getV('hiz')} | Sıcaklık: ${getV('sicaklik')} | Basınç: ${getV('basinc')}
• Gramaj: ${getV('ayar_gram')} | Renk: ${getV('ayar_renk')}
• Tarih: ${getV('ayar_tarih')} | Firma: ${getV('ayar_firma_adi')}

🌀 *TARAK & SERVOLAP*
• Servolap: ${getV('ayar_servolap')} | Tarak Hızı: ${getV('ayar_tarak_hizi')}
• Ana Tambur: ${getV('ayar_ana_tambur')} | Alt Ara Dofer: ${getV('ayar_alt_ara_dofer')}
• Sıyırıcı: ${getV('ayar_siyirici')} | Üst Ara Dofer: ${getV('ayar_ust_ara_dofer')}
• İşçi: ${getV('ayar_isci')} | Üst Sevk Doferi: ${getV('ayar_ust_sevk_doferi')}
• Alt Sevk Doferi: ${getV('ayar_alt_sevk_doferi')} | Üst Dofer Alıcı: ${getV('ayar_ust_dofer_alici')}
• Alt Dofer Alıcı: ${getV('ayar_alt_dofer_alici')} | Üst Sevk Bandı: ${getV('ayar_ust_sevk_bandi')}
• Alt Sevk Bandı: ${getV('ayar_alt_sevk_bandi')}

📐 *TÜLBENT & SERME*
• Tülbent Katı: ${getV('ayar_tulbent_kati')} | Besleme Çekim: ${getV('ayar_besleme_cekim')}
• Serme Eni Ön: ${getV('ayar_serme_eni_on')} | Serme Eni Arka: ${getV('ayar_serme_eni_arka')}
• Bant Çekim: ${getV('ayar_bant_cekim')} | Araba Çekim: ${getV('ayar_araba_cekim')}

💧 *TRİO & POMPALAR*
• Trio (1-6): ${getV('ayar_trio1')} / ${getV('ayar_trio2')} / ${getV('ayar_trio3')} / ${getV('ayar_trio4')} / ${getV('ayar_trio5')} / ${getV('ayar_trio6')}
• Pompalar (1-6): ${getV('ayar_pompa1')} / ${getV('ayar_pompa2')} / ${getV('ayar_pompa3')} / ${getV('ayar_pompa4')} / ${getV('ayar_pompa5')} / ${getV('ayar_pompa6')}

🔥 *HAT, FIRIN & BALKAN*
• Besleme 1-2: ${getV('ayar_besleme1')} / ${getV('ayar_besleme2')}
• Tambur 1-3: ${getV('ayar_tambur1')} / ${getV('ayar_tambur2')} / ${getV('ayar_tambur3')}
• Sıkma Fular: ${getV('ayar_sikma_fular')} | Fırın: ${getV('ayar_firin')}
• Fırın Isısı: ${getV('ayar_firin_isisi')} | Hat Hızı: ${getV('ayar_hat_hizi')}
• Balkan (1-3): ${getV('ayar_balkan1')} / ${getV('ayar_balkan2')} / ${getV('ayar_balkan3')}
• Hammadde: ${getV('ayar_hammadde')}

✂️ *KESİM EBATLARI & SARIM*
• Kesim Eni: ${getV('ayar_kesim_eni')}
• Çap: ${getV('ayar_cap')}
• Sarım Metresi: ${getV('ayar_sarim_metresi')}
• Saatlik KG: ${getV('ayar_saatlik_kg')}

📝 *NOTLAR:*
${getV('notlar')}
`;

    if (navigator.share) {
        try {
            await navigator.share({
                title: `Reçete No: ${getV('recete_no')}`,
                text: metin
            });
        } catch (err) {
            console.log("Paylaşım iptal edildi.");
        }
    } else {
        const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(metin)}`;
        window.open(whatsappUrl, '_blank');
    }
}

// ======================================================
// ADMIN GİRİŞ KONTROLÜ
// ======================================================
const ADMIN_USER = "bunyamin";
const ADMIN_PASS = "Busra.5744"; 

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

// ======================================================
// SAYFA AÇILIŞI VE OLAY DİNLEYİCİLERİ
// ======================================================
document.addEventListener("DOMContentLoaded", function() {
    const oturumAcik = localStorage.getItem("adminOturum");
    const loginModal = document.getElementById("loginModal");

    if (oturumAcik === "true") {
        if (loginModal) loginModal.style.display = "none";
    } else {
        if (loginModal) loginModal.style.display = "flex";
    }

    receteleriListele();

    const yeniBtn = document.getElementById("yeniReceteBtn");
    if (yeniBtn) {
        yeniBtn.addEventListener("click", yeniRecete);
    }
});

document.addEventListener("keydown", function(event) {
    if (event.key === "Escape") {
        detayKapat();
    }
});
