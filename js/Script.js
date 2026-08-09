// ======================================================
// ÜRETİM REÇETE YÖNETİM SİSTEMİ
// Script.js - MOBİL UYUMLU TAM VE DÜZELTİLMİŞ SÜRÜM
// ======================================================

let secilenId = null;
let detaydakiId = null;
let detaydakiVeri = null; // Kopyalama, Paylaşım ve Yazdırma için veriyi tutar

// ======================================================
// ADMİN OTURUM YÖNETİMİ
// ======================================================
window.adminGiris = function() {
    const user = document.getElementById("login_user")?.value.trim();
    const pass = document.getElementById("login_pass")?.value.trim();
    const errorMsg = document.getElementById("loginError");
    const loginModal = document.getElementById("loginModal");

    if (user === "bunyamin" && pass === "Busra.5744") {
        localStorage.setItem("adminOturum", "true");
        if (loginModal) loginModal.style.display = "none";
        if (errorMsg) errorMsg.style.display = "none";
        alert("Giriş başarılı!");
    } else {
        if (errorMsg) errorMsg.style.display = "block";
    }
};

window.adminCikis = function() {
    localStorage.removeItem("adminOturum");
    location.reload();
};

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
        "ayar_balkan1", "ayar_balkan2", "ayar_balkan3", "ayar_hammadde", "ayar_kesim_eni", "ayar_cap",
        "ayar_sarim_metresi", "ayar_saatlik_kg", "ayar_firin_isisi", "ayar_hat_hizi"
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
            eleman.value = ayarlar[id] ?? "";
        }
    });
}

// ======================================================
// TÜM FORMU TEMİZLE
// ======================================================
window.temizleForm = function() {
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
        "ayar_balkan1", "ayar_balkan2", "ayar_balkan3", "ayar_hammadde", "ayar_kesim_eni", "ayar_cap",
        "ayar_sarim_metresi", "ayar_saatlik_kg", "ayar_firin_isisi", "ayar_hat_hizi"
    ];

    alanlar.forEach(function(id) {
        const eleman = document.getElementById(id);
        if (eleman) eleman.value = "";
    });

    secilenId = null;
    const buton = document.getElementById("kaydetBtn");
    if (buton) buton.innerText = "Kaydet";
};

window.temizle = window.temizleForm;

window.yeniRecete = function() {
    window.temizleForm();
    document.getElementById("urun_adi")?.focus();
};

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
        if (sonuc) {
            yeniNo = Number(sonuc[1]) + 1;
        }
    }
    return "REC-" + String(yeniNo).padStart(3, "0");
}

// ======================================================
// KAYDET / GÜNCELLE
// ======================================================
window.kaydet = async function(event) {
    if (event) event.preventDefault();

    try {
        const db = getSupabase();
        if (!db) {
            alert("Supabase bağlantısı bulunamadı.");
            return;
        }

        if (secilenId !== null) {
            await window.guncelle();
            return;
        }

        const urunAdiElement = document.getElementById("urun_adi");
        if (!urunAdiElement || !urunAdiElement.value.trim()) {
            alert("Ürün adı boş bırakılamaz.");
            urunAdiElement?.focus();
            return;
        }

        const urunAdi = urunAdiElement.value.trim();
        const receteNoElement = document.getElementById("recete_no");
        let receteNo = receteNoElement?.value.trim() || "";

        if (receteNo === "") {
            receteNo = await otomatikReceteNo();
        }

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

        const { error } = await db.from("receteler").insert([veri]);

        if (error) {
            alert("Kayıt hatası:\n" + error.message);
            return;
        }

        alert("Reçete kaydedildi.");
        window.temizleForm();
        await window.receteleriListele();

    } catch (hata) {
        alert("Kayıt sırasında hata oluştu:\n" + hata.message);
    }
};

window.guncelle = async function() {
    try {
        if (secilenId === null) {
            alert("Önce düzenlenecek reçeteyi seçin.");
            return;
        }

        const db = getSupabase();
        if (!db) return;

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
        window.temizleForm();
        await window.receteleriListele();

    } catch (hata) {
        alert("Güncelleme hatası:\n" + hata.message);
    }
};

// ======================================================
// REÇETELERİ LİSTELE
// ======================================================
window.receteleriListele = async function() {
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
                </tr>`;
        });

        const toplam = document.getElementById("toplamRecete");
        if (toplam) toplam.innerText = data.length;

    } catch (hata) {
        alert("Listeleme hatası:\n" + hata.message);
    }
};

window.listele = window.receteleriListele;

// ======================================================
// GÜVENLİ METİN
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

// ======================================================
// DETAY GÖSTER / KAPAT
// ======================================================
window.detayGoster = async function(id) {
    try {
        const db = getSupabase();
        if (!db) {
            alert("Supabase bağlantısı bulunamadı.");
            return;
        }

        const { data, error } = await db
            .from("receteler")
            .select("*")
            .eq("id", id)
            .single();

        if (error || !data) {
            alert("Reçete alınamadı veya bulunamadı.");
            return;
        }

        detaydakiId = id;
        detaydakiVeri = data;
        const ayarlarObj = data.uretim_ayarlari || data.ayarlar || {};

        setText("detay_recete_no", data.recete_no || "-");
        setText("detay_baslik_no", data.recete_no || "-");
        setText("detay_urun_adi", data.urun_adi || "-");
        setText("detay_makine_adi", data.makine_adi || ayarlarObj.makine_adi || "-");
        setText("detay_hiz", data.hiz || ayarlarObj.hiz || "-");
        setText("detay_sicaklik", data.sicaklik || ayarlarObj.sicaklik || "-");
        setText("detay_basinc", data.basinc || ayarlarObj.basinc || "-");
        setText("detay_notlar", data.notlar || ayarlarObj.notlar || "Not yok");

        Object.keys(ayarlarObj).forEach(key => {
            setText("detay_" + key, ayarlarObj[key]);
        });

        const modal = document.getElementById("detayModal");
        if (modal) modal.style.display = "flex";

    } catch (hata) {
        alert("Reçete alınamadı:\n" + hata.message);
    }
};

function setText(id, deger) {
    const eleman = document.getElementById(id);
    if (eleman) {
        eleman.innerText = (deger === null || deger === undefined || deger === "") ? "-" : deger;
    }
}

window.detayKapat = function() {
    const modal = document.getElementById("detayModal");
    if (modal) modal.style.display = "none";
};

window.detaydanDuzenle = async function() {
    if (detaydakiId === null) {
        alert("Düzenlenecek reçete bulunamadı.");
        return;
    }
    const id = detaydakiId;
    window.detayKapat();
    await window.duzenle(id);
};

// ======================================================
// DÜZENLE / SİL
// ======================================================
window.duzenle = async function(id) {
    try {
        const db = getSupabase();
        if (!db) return;

        const { data, error } = await db
            .from("receteler")
            .select("*")
            .eq("id", id)
            .single();

        if (error || !data) {
            alert("Reçete alınamadı.");
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

        document.getElementById("urun_adi")?.focus();

    } catch (hata) {
        alert("Reçete alınamadı:\n" + hata.message);
    }
};

function setValue(id, deger) {
    const eleman = document.getElementById(id);
    if (eleman) {
        eleman.value = (deger === null || deger === undefined) ? "" : deger;
    }
}

window.sil = async function(id) {
    if (!confirm("Bu reçete silinsin mi?")) return;

    try {
        const db = getSupabase();
        if (!db) return;

        const { error } = await db.from("receteler").delete().eq("id", id);
        if (error) {
            alert("Silme hatası:\n" + error.message);
            return;
        }

        alert("Reçete silindi.");
        await window.receteleriListele();
    } catch (hata) {
        alert("Silme hatası:\n" + hata.message);
    }
};

// ======================================================
// KOPYALA
// ======================================================
window.detayKopyala = function() {
    if (!detaydakiVeri) {
        alert("Kopyalanacak veri bulunamadı.");
        return;
    }

    window.temizleForm();

    const data = detaydakiVeri;
    const ayarlarObj = data.uretim_ayarlari || data.ayarlar || {};

    setValue("recete_no", "");
    setValue("urun_adi", data.urun_adi || "");
    setValue("makine_adi", data.makine_adi || ayarlarObj.makine_adi || "");
    setValue("hiz", data.hiz || ayarlarObj.hiz || "");
    setValue("sicaklik", data.sicaklik || ayarlarObj.sicaklik || "");
    setValue("basinc", data.basinc || ayarlarObj.basinc || "");
    setValue("notlar", data.notlar || ayarlarObj.notlar || "");

    uretimAyarlariYukle(ayarlarObj);

    secilenId = null;
    const buton = document.getElementById("kaydetBtn");
    if (buton) buton.innerText = "Kaydet";

    window.detayKapat();
    document.getElementById("urun_adi")?.focus();

    alert("Reçete başarıyla kopyalandı.\nTüm makine ayarları forma yüklendi.\nYeni kayıt oluşturmak için 'Kaydet' butonuna basın.");
};

// ======================================================
// YAZDIR / PDF İNDİR (AKSİYONLARI BAĞLAMA)
// ======================================================
window.detayYazdir = function() {
    if (!detaydakiVeri) {
        alert("Yazdırılacak reçete bulunamadı.");
        return;
    }

    const data = detaydakiVeri;
    const ayarlarObj = data.uretim_ayarlari || data.ayarlar || {};

    let printArea = document.getElementById("mobilePrintArea");
    if (!printArea) {
        printArea = document.createElement("div");
        printArea.id = "mobilePrintArea";
        document.body.appendChild(printArea);
    }

    let detaySatirlari = "";
    Object.keys(ayarlarObj).forEach(key => {
        if (ayarlarObj[key]) {
            detaySatirlari += `<div style="border-bottom: 1px dotted #ccc; padding: 4px 0;"><b>${guvenliMetin(key)}:</b> ${guvenliMetin(ayarlarObj[key])}</div>`;
        }
    });

    printArea.innerHTML = `
        <div style="padding: 15px; font-family: sans-serif; color: #000; background: #fff;">
            <h2 style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 8px; margin-top: 0;">ÜRETİM REÇETESİ</h2>
            <div style="margin-bottom: 15px; line-height: 1.6;">
                <p style="margin: 3px 0;"><strong>Reçete No:</strong> ${guvenliMetin(data.recete_no || "-")}</p>
                <p style="margin: 3px 0;"><strong>Ürün Adı:</strong> ${guvenliMetin(data.urun_adi || "-")}</p>
                <p style="margin: 3px 0;"><strong>Makine Adı:</strong> ${guvenliMetin(data.makine_adi || ayarlarObj.makine_adi || "-")}</p>
                <p style="margin: 3px 0;"><strong>Hız:</strong> ${guvenliMetin(data.hiz || ayarlarObj.hiz || "-")}</p>
                <p style="margin: 3px 0;"><strong>Sıcaklık:</strong> ${guvenliMetin(data.sicaklik || ayarlarObj.sicaklik || "-")}</p>
                <p style="margin: 3px 0;"><strong>Basınç:</strong> ${guvenliMetin(data.basinc || ayarlarObj.basinc || "-")}</p>
                <p style="margin: 3px 0;"><strong>Notlar:</strong> ${guvenliMetin(data.notlar || ayarlarObj.notlar || "-")}</p>
            </div>
            <h3 style="border-bottom: 1px solid #000; padding-bottom: 4px;">Makine / Üretim Ayarları</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 11px;">
                ${detaySatirlari}
            </div>
        </div>
    `;

    window.print();
};

// PDF İndir Buton Takma Adı (HTML Tarafındaki `pdfIndir()` İle Tam Uyum İçin)
window.pdfIndir = window.detayYazdir;

// ======================================================
// MOBİL PAYLAŞ / WHATSAPP
// ======================================================
window.detayPaylas = async function() {
    if (!detaydakiVeri) {
        alert("Paylaşılacak reçete bulunamadı.");
        return;
    }

    const data = detaydakiVeri;
    const ayarlarObj = data.uretim_ayarlari || data.ayarlar || {};

    const paylasimMetni = 
`📋 *ÜRETİM REÇETESİ*
🔹 *Reçete No:* ${data.recete_no || "-"}
🔹 *Ürün Adı:* ${data.urun_adi || "-"}
🔹 *Makine:* ${data.makine_adi || ayarlarObj.makine_adi || "-"}
🔹 *Hız:* ${data.hiz || ayarlarObj.hiz || "-"}
🔹 *Sıcaklık:* ${data.sicaklik || ayarlarObj.sicaklik || "-"}
🔹 *Basınç:* ${data.basinc || ayarlarObj.basinc || "-"}`;

    if (navigator.share) {
        try {
            await navigator.share({
                title: `Reçete - ${data.recete_no}`,
                text: paylasimMetni
            });
        } catch (err) {
            console.log("Paylaşım iptal edildi:", err);
        }
    } else {
        const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(paylasimMetni)}`;
        window.open(waUrl, "_blank");
    }
};

// Paylaş Buton Takma Adı (HTML Tarafındaki `paylas()` İle Tam Uyum İçin)
window.paylas = window.detayPaylas;

// ======================================================
// ARAMA
// ======================================================
window.ara = function() {
    const arama = document.getElementById("arama");
    if (!arama) return;

    const kelime = arama.value.toLowerCase().trim();

    document.querySelectorAll("#liste tr").forEach(function(satir) {
        const metin = satir.innerText.toLowerCase();
        satir.style.display = metin.includes(kelime) ? "" : "none";
    });
};

// ======================================================
// YAZDIRMA CSS STİLLERİ
// ======================================================
function yazdirmaStilleriniEkle() {
    if (document.getElementById("printStyles")) return;
    const style = document.createElement("style");
    style.id = "printStyles";
    style.innerHTML = `
        #mobilePrintArea { display: none; }
        @media print {
            body * { visibility: hidden !important; }
            #mobilePrintArea, #mobilePrintArea * { visibility: visible !important; }
            #mobilePrintArea {
                display: block !important;
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                background: #fff !important;
            }
        }
    `;
    document.head.appendChild(style);
}

// ======================================================
// KLAVYE VE AÇILIŞ DİNLENİCİLERİ
// ======================================================
document.addEventListener("keydown", function(event) {
    if (event.key === "Escape") {
        window.detayKapat();
    }
});

document.addEventListener("DOMContentLoaded", function() {
    console.log("Script.js sorunsuz yüklendi.");
    
    yazdirmaStilleriniEkle();

    const oturumAcik = localStorage.getItem("adminOturum");
    const loginModal = document.getElementById("loginModal");

    if (oturumAcik === "true") {
        if (loginModal) loginModal.style.display = "none";
    } else {
        if (loginModal) loginModal.style.display = "flex";
    }

    window.receteleriListele();
});
