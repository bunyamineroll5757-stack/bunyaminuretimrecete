// ======================================================
// ÜRETİM REÇETE YÖNETİM SİSTEMİ
// Script.js - ÜRETİM AYARLARI JSONB TAM SÜRÜM
// ======================================================

let secilenId = null;
let detaydakiId = null;


// ======================================================
// SUPABASE
// ======================================================

function getSupabase() {

    if (window.supabaseClient) {
        return window.supabaseClient;
    }

    if (window.supabase) {
        return window.supabase;
    }

    console.error("Supabase bağlantısı bulunamadı.");

    return null;
}


// ======================================================
// ÜRETİM AYARLARI ALANLARI
// ======================================================

const AYAR_ALANLARI = [

    "ayar_gram",
    "ayar_renk",
    "ayar_tarih",
    "ayar_servolap",
    "ayar_tarak_hizi",
    "ayar_firma_adi",

    "ayar_ana_tambur",
    "ayar_alt_ara_dofer",
    "ayar_siyirici",
    "ayar_ust_ara_dofer",
    "ayar_isci",
    "ayar_ust_sevk_doferi",
    "ayar_alt_sevk_doferi",
    "ayar_ust_dofer_alici",
    "ayar_alt_dofer_alici",
    "ayar_ust_sevk_bandi",
    "ayar_alt_sevk_bandi",

    "ayar_tulbent_kati",
    "ayar_besleme_cekim",
    "ayar_serme_eni_on",
    "ayar_bant_cekim",
    "ayar_serme_eni_arka",
    "ayar_araba_cekim",
    "ayar_cikis_yuksekligi_sag",
    "ayar_cikis_hafiza",
    "ayar_on_cikis_hafiza",
    "ayar_cikis_yuksekligi_sol",
    "ayar_arka_cikis_hafiza",

    "ayar_trio1",
    "ayar_trio2",
    "ayar_trio3",
    "ayar_trio4",
    "ayar_trio5",
    "ayar_trio6",

    "ayar_pompa1",
    "ayar_pompa2",
    "ayar_pompa3",
    "ayar_pompa4",
    "ayar_pompa5",
    "ayar_pompa6",

    "ayar_besleme1",
    "ayar_tambur1",
    "ayar_tambur2",
    "ayar_tambur3",
    "ayar_besleme2",
    "ayar_sikma_fular",
    "ayar_firin",

    "ayar_balkan1",
    "ayar_balkan2",
    "ayar_balkan3",
    "ayar_hammadde",

    "ayar_kesim_eni",
    "ayar_cap",
    "ayar_sarim_metresi",
    "ayar_saatlik_kg",
    "ayar_firin_isisi",
    "ayar_hat_hizi"
];


// ======================================================
// ÜRETİM AYARLARINI TOPLA
// ======================================================

function uretimAyarlariTopla() {

    const ayarlar = {};

    AYAR_ALANLARI.forEach(function(id) {

        const eleman =
            document.getElementById(id);

        if (eleman) {

            ayarlar[id] =
                eleman.value.trim();

        }

    });

    return ayarlar;
}


// ======================================================
// GENEL BİLGİLERİ JSONB'YE EKLE
// ======================================================

function genelBilgileriAyarlarIcineEkle(ayarlar) {

    ayarlar.makine_adi =
        document.getElementById("makine_adi")?.value.trim() || "";

    ayarlar.hiz =
        document.getElementById("hiz")?.value.trim() || "";

    ayarlar.sicaklik =
        document.getElementById("sicaklik")?.value.trim() || "";

    ayarlar.basinc =
        document.getElementById("basinc")?.value.trim() || "";

    ayarlar.notlar =
        document.getElementById("notlar")?.value.trim() || "";

    return ayarlar;
}


// ======================================================
// ÜRETİM AYARLARINI FORMA YÜKLE
// ======================================================

function uretimAyarlariYukle(ayarlar) {

    if (!ayarlar) {
        return;
    }

    AYAR_ALANLARI.forEach(function(id) {

        const eleman =
            document.getElementById(id);

        if (eleman) {

            eleman.value =
                ayarlar[id] === null ||
                ayarlar[id] === undefined
                    ? ""
                    : ayarlar[id];

        }

    });
}


// ======================================================
// FORMU TEMİZLE
// ======================================================

function temizleForm() {

    const alanlar = [

        "recete_no",
        "urun_adi",
        "makine_adi",
        "hiz",
        "sicaklik",
        "basinc",
        "notlar",

        ...AYAR_ALANLARI

    ];

    alanlar.forEach(function(id) {

        const eleman =
            document.getElementById(id);

        if (eleman) {
            eleman.value = "";
        }

    });

    secilenId = null;

    const buton =
        document.getElementById("kaydetBtn");

    if (buton) {
        buton.innerText = "Kaydet";
    }
}


// ======================================================
// OTOMATİK REÇETE NUMARASI
// ======================================================

async function otomatikReceteNo() {

    const db = getSupabase();

    if (!db) {
        throw new Error(
            "Supabase bağlantısı bulunamadı."
        );
    }

    const { data, error } =
        await db
            .from("receteler")
            .select("no")
            .order("id", {
                ascending: false
            })
            .limit(1);

    if (error) {
        throw error;
    }

    let yeniNo = 1;

    if (data && data.length > 0) {

        const sonNo =
            String(data[0].no || "");

        const sonuc =
            sonNo.match(/REC-(\d+)/i);

        if (sonuc) {

            yeniNo =
                Number(sonuc[1]) + 1;

        }

    }

    return "REC-" +
        String(yeniNo).padStart(3, "0");
}


// ======================================================
// KAYDET
// ======================================================

async function kaydet() {

    try {

        const db = getSupabase();

        if (!db) {

            alert(
                "Supabase bağlantısı bulunamadı."
            );

            return;
        }


        // DÜZENLEME MODU

        if (secilenId !== null) {

            await guncelle();

            return;
        }


        // ÜRÜN

        const urunElement =
            document.getElementById("urun_adi");

        if (!urunElement) {

            alert(
                "Ürün Adı alanı bulunamadı."
            );

            return;
        }

        const urun =
            urunElement.value.trim();

        if (urun === "") {

            alert(
                "Ürün adı boş bırakılamaz."
            );

            urunElement.focus();

            return;
        }


        // REÇETE NO

        const noElement =
            document.getElementById("recete_no");

        let receteNo =
            noElement
                ? noElement.value.trim()
                : "";


        if (receteNo === "") {

            receteNo =
                await otomatikReceteNo();

        }


        // MİKTAR
        // HTML'de miktar alanı olmadığı için 0

        let miktar = 0;


        const miktarElement =
            document.getElementById("miktar");

        if (miktarElement) {

            const girilenMiktar =
                miktarElement.value.trim();

            if (girilenMiktar !== "") {

                miktar =
                    Number(girilenMiktar);

            }

        }


        // ==================================================
        // TÜM ÜRETİM AYARLARINI TOPLA
        // ==================================================

        const ayarlar =
            uretimAyarlariTopla();


        // Makine, hız, sıcaklık, basınç, notlar

        genelBilgileriAyarlarIcineEkle(
            ayarlar
        );


        console.log(
            "KAYDEDİLECEK ÜRETİM AYARLARI:",
            ayarlar
        );


        // ==================================================
        // VERİ
        // ==================================================

        const veri = {

            no: receteNo,

            urun: urun,

            miktar: miktar,

            tarih:
                new Date()
                    .toISOString()
                    .split("T")[0],

            uretim_ayarlari: ayarlar

        };


        console.log(
            "SUPABASE'E GÖNDERİLECEK TAM VERİ:",
            veri
        );


        // ==================================================
        // SUPABASE INSERT
        // ==================================================

        const { data, error } =
            await db
                .from("receteler")
                .insert([veri])
                .select();


        if (error) {

            console.error(
                "KAYIT HATASI:",
                error
            );

            alert(
                "Kayıt hatası:\n" +
                error.message
            );

            return;
        }


        console.log(
            "KAYIT BAŞARILI:",
            data
        );


        alert(
            "Reçete ve üretim ayarları kaydedildi."
        );


        temizleForm();


        await receteleriListele();


    } catch (hata) {

        console.error(
            "KAYDET HATASI:",
            hata
        );

        alert(
            "Kayıt sırasında hata oluştu:\n" +
            hata.message
        );

    }

}


// ======================================================
// REÇETELERİ LİSTELE
// ======================================================

async function receteleriListele() {

    try {

        const db = getSupabase();

        if (!db) {
            return;
        }

        const liste =
            document.getElementById("liste");

        if (!liste) {
            return;
        }


        const { data, error } =
            await db
                .from("receteler")
                .select("*")
                .order("id", {
                    ascending: false
                });


        if (error) {

            console.error(
                "Listeleme hatası:",
                error
            );

            alert(
                "Listeleme hatası:\n" +
                error.message
            );

            return;
        }


        liste.innerHTML = "";


        if (!data || data.length === 0) {

            liste.innerHTML = `
                <tr>
                    <td colspan="7"
                        style="text-align:center;">
                        Henüz kayıtlı reçete yok.
                    </td>
                </tr>
            `;

            const toplam =
                document.getElementById(
                    "toplamRecete"
                );

            if (toplam) {
                toplam.innerText = "0";
            }

            return;
        }


        data.forEach(function(r) {

            const ayarlar =
                r.uretim_ayarlari || {};


            liste.innerHTML += `

                <tr>

                    <td>
                        ${guvenliMetin(r.no)}
                    </td>

                    <td>
                        ${guvenliMetin(r.urun)}
                    </td>

                    <td>
                        ${guvenliMetin(
                            ayarlar.makine_adi || ""
                        )}
                    </td>

                    <td>
                        ${guvenliMetin(
                            ayarlar.hiz || ""
                        )}
                    </td>

                    <td>
                        ${guvenliMetin(
                            ayarlar.sicaklik || ""
                        )}
                    </td>

                    <td>
                        ${guvenliMetin(
                            ayarlar.basinc || ""
                        )}
                    </td>

                    <td>

                        <button
                            type="button"
                            class="btn"
                            onclick="detayGoster(${r.id})">
                            Detay
                        </button>

                        <button
                            type="button"
                            class="btn"
                            onclick="duzenle(${r.id})">
                            Düzenle
                        </button>

                        <button
                            type="button"
                            class="btn-danger"
                            onclick="sil(${r.id})">
                            Sil
                        </button>

                    </td>

                </tr>

            `;

        });


        const toplam =
            document.getElementById(
                "toplamRecete"
            );

        if (toplam) {
            toplam.innerText =
                data.length;
        }


    } catch (hata) {

        console.error(
            "Listeleme hatası:",
            hata
        );

    }

}


// ======================================================
// LİSTELE UYUMLULUĞU
// ======================================================

async function listele() {

    await receteleriListele();

}


// ======================================================
// GÜVENLİ METİN
// ======================================================

function guvenliMetin(deger) {

    if (
        deger === null ||
        deger === undefined
    ) {
        return "";
    }

    return String(deger)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ======================================================
// DETAY
// ======================================================

async function detayGoster(id) {

    try {

        const db = getSupabase();

        if (!db) {

            alert(
                "Supabase bağlantısı bulunamadı."
            );

            return;
        }


        const { data, error } =
            await db
                .from("receteler")
                .select("*")
                .eq("id", id)
                .single();


        if (error) {

            console.error(
                "DETAY HATASI:",
                error
            );

            alert(
                "Reçete alınamadı:\n" +
                error.message
            );

            return;
        }


        if (!data) {

            alert(
                "Reçete bulunamadı."
            );

            return;
        }


        detaydakiId = id;


        const ayarlar =
            data.uretim_ayarlari || {};


        setText(
            "detay_recete_no",
            data.no || "-"
        );


        setText(
            "detay_baslik_no",
            data.no || "-"
        );


        setText(
            "detay_urun_adi",
            data.urun || "-"
        );


        setText(
            "detay_makine_adi",
            ayarlar.makine_adi || "-"
        );


        setText(
            "detay_hiz",
            ayarlar.hiz || "-"
        );


        setText(
            "detay_sicaklik",
            ayarlar.sicaklik || "-"
        );


        setText(
            "detay_basinc",
            ayarlar.basinc || "-"
        );


        setText(
            "detay_notlar",
            ayarlar.notlar || "Not yok"
        );


        const modal =
            document.getElementById(
                "detayModal"
            );

        if (modal) {

            modal.style.display =
                "flex";

        }

    } catch (hata) {

        console.error(
            "DETAY HATASI:",
            hata
        );

        alert(
            "Reçete alınamadı:\n" +
            hata.message
        );

    }

}


// ======================================================
// TEXT AYARLA
// ======================================================

function setText(id, deger) {

    const eleman =
        document.getElementById(id);

    if (eleman) {

        eleman.innerText =
            deger === null ||
            deger === undefined ||
            deger === ""
                ? "-"
                : deger;

    }

}


// ======================================================
// VALUE AYARLA
// ======================================================

function setValue(id, deger) {

    const eleman =
        document.getElementById(id);

    if (eleman) {

        eleman.value =
            deger === null ||
            deger === undefined
                ? ""
                : deger;

    }

}


// ======================================================
// DETAY KAPAT
// ======================================================

function detayKapat() {

    const modal =
        document.getElementById(
            "detayModal"
        );

    if (modal) {

        modal.style.display =
            "none";

    }

}


// ======================================================
// DETAYDAN DÜZENLE
// ======================================================

async function detaydanDuzenle() {

    if (detaydakiId === null) {

        alert(
            "Düzenlenecek reçete bulunamadı."
        );

        return;
    }

    const id =
        detaydakiId;

    detayKapat();

    await duzenle(id);

}


// ======================================================
// DÜZENLE
// ======================================================

async function duzenle(id) {

    try {

        const db = getSupabase();

        if (!db) {

            alert(
                "Supabase bağlantısı bulunamadı."
            );

            return;
        }


        const { data, error } =
            await db
                .from("receteler")
                .select("*")
                .eq("id", id)
                .single();


        if (error) {

            console.error(
                "DÜZENLEME HATASI:",
                error
            );

            alert(
                "Reçete alınamadı:\n" +
                error.message
            );

            return;
        }


        if (!data) {

            alert(
                "Reçete bulunamadı."
            );

            return;
        }


        secilenId = id;


        const ayarlar =
            data.uretim_ayarlari || {};


        // Genel bilgiler

        setValue(
            "recete_no",
            data.no || ""
        );


        setValue(
            "urun_adi",
            data.urun || ""
        );


        setValue(
            "makine_adi",
            ayarlar.makine_adi || ""
        );


        setValue(
            "hiz",
            ayarlar.hiz || ""
        );


        setValue(
            "sicaklik",
            ayarlar.sicaklik || ""
        );


        setValue(
            "basinc",
            ayarlar.basinc || ""
        );


        setValue(
            "notlar",
            ayarlar.notlar || ""
        );


        // Miktar varsa

        if (
            document.getElementById("miktar")
        ) {

            setValue(
                "miktar",
                data.miktar || 0
            );

        }


        // TÜM ÜRETİM AYARLARI

        uretimAyarlariYukle(
            ayarlar
        );


        const buton =
            document.getElementById(
                "kaydetBtn"
            );

        if (buton) {

            buton.innerText =
                "Güncelle";

        }


        const urun =
            document.getElementById(
                "urun_adi"
            );

        if (urun) {

            urun.focus();

        }


    } catch (hata) {

        console.error(
            "DÜZENLE HATASI:",
            hata
        );

        alert(
            "Reçete alınamadı:\n" +
            hata.message
        );

    }

}


// ======================================================
// GÜNCELLE
// ======================================================

async function guncelle() {

    try {

        if (secilenId === null) {

            alert(
                "Önce düzenlenecek reçeteyi seçin."
            );

            return;
        }


        const db = getSupabase();

        if (!db) {

            alert(
                "Supabase bağlantısı bulunamadı."
            );

            return;
        }


        const urun =
            document.getElementById(
                "urun_adi"
            )?.value.trim() || "";


        if (urun === "") {

            alert(
                "Ürün adı boş bırakılamaz."
            );

            return;
        }


        const receteNo =
            document.getElementById(
                "recete_no"
            )?.value.trim() || "";


        // TÜM AYARLARI TOPLA

        const ayarlar =
            uretimAyarlariTopla();


        genelBilgileriAyarlarIcineEkle(
            ayarlar
        );


        console.log(
            "GÜNCELLENECEK ÜRETİM AYARLARI:",
            ayarlar
        );


        const veri = {

            no: receteNo,

            urun: urun,

            uretim_ayarlari: ayarlar

        };


        console.log(
            "GÜNCELLENECEK TAM VERİ:",
            veri
        );


        const { data, error } =
            await db
                .from("receteler")
                .update(veri)
                .eq("id", secilenId)
                .select();


        if (error) {

            console.error(
                "GÜNCELLEME HATASI:",
                error
            );

            alert(
                "Güncelleme hatası:\n" +
                error.message
            );

            return;
        }


        console.log(
            "GÜNCELLEME BAŞARILI:",
            data
        );


        alert(
            "Reçete ve üretim ayarları güncellendi."
        );


        temizleForm();


        await receteleriListele();


    } catch (hata) {

        console.error(
            "GÜNCELLEME HATASI:",
            hata
        );

        alert(
            "Güncelleme hatası:\n" +
            hata.message
        );

    }

}


// ======================================================
// SİL
// ======================================================

async function sil(id) {

    if (
        !confirm(
            "Bu reçete silinsin mi?"
        )
    ) {
        return;
    }


    try {

        const db = getSupabase();

        if (!db) {

            alert(
                "Supabase bağlantısı bulunamadı."
            );

            return;
        }


        const { error } =
            await db
                .from("receteler")
                .delete()
                .eq("id", id);


        if (error) {

            console.error(
                "SİLME HATASI:",
                error
            );

            alert(
                "Silme hatası:\n" +
                error.message
            );

            return;
        }


        alert(
            "Reçete silindi."
        );


        await receteleriListele();


    } catch (hata) {

        console.error(
            "SİLME HATASI:",
            hata
        );

        alert(
            "Silme hatası:\n" +
            hata.message
        );

    }

}


// ======================================================
// YENİ REÇETE
// ======================================================

function yeniRecete() {

    temizleForm();

    const urun =
        document.getElementById(
            "urun_adi"
        );

    if (urun) {
        urun.focus();
    }

}


// ======================================================
// TEMİZLE UYUMLULUĞU
// ======================================================

function temizle() {

    temizleForm();

}


// ======================================================
// KOPYALA
// ======================================================

async function detayKopyala() {

    if (detaydakiId === null) {

        alert(
            "Kopyalanacak reçete bulunamadı."
        );

        return;
    }


    try {

        const db = getSupabase();

        if (!db) {
            return;
        }


        const { data, error } =
            await db
                .from("receteler")
                .select("*")
                .eq("id", detaydakiId)
                .single();


        if (error) {

            alert(
                "Reçete alınamadı:\n" +
                error.message
            );

            return;
        }


        const ayarlar =
            data.uretim_ayarlari || {};


        // Yeni reçete numarası boş

        setValue(
            "recete_no",
            ""
        );


        setValue(
            "urun_adi",
            data.urun || ""
        );


        setValue(
            "makine_adi",
            ayarlar.makine_adi || ""
        );


        setValue(
            "hiz",
            ayarlar.hiz || ""
        );


        setValue(
            "sicaklik",
            ayarlar.sicaklik || ""
        );


        setValue(
            "basinc",
            ayarlar.basinc || ""
        );


        setValue(
            "notlar",
            ayarlar.notlar || ""
        );


        // TÜM ÜRETİM AYARLARINI KOPYALA

        uretimAyarlariYukle(
            ayarlar
        );


        secilenId = null;


        const buton =
            document.getElementById(
                "kaydetBtn"
            );

        if (buton) {
            buton.innerText =
                "Kaydet";
        }


        detayKapat();


        const urun =
            document.getElementById(
                "urun_adi"
            );

        if (urun) {
            urun.focus();
        }


        alert(
            "Reçete ve tüm üretim ayarları kopyalandı."
        );


    } catch (hata) {

        console.error(
            "KOPYALAMA HATASI:",
            hata
        );

        alert(
            "Kopyalama hatası:\n" +
            hata.message
        );

    }

}


// ======================================================
// YAZDIR
// ======================================================

function detayYazdir() {

    const receteNo =
        getText("detay_recete_no");

    const urunAdi =
        getText("detay_urun_adi");

    const makineAdi =
        getText("detay_makine_adi");

    const hiz =
        getText("detay_hiz");

    const sicaklik =
        getText("detay_sicaklik");

    const basinc =
        getText("detay_basinc");

    const notlar =
        getText("detay_notlar");


    const yazdir =
        window.open(
            "",
            "_blank",
            "width=700,height=800"
        );


    if (!yazdir) {

        alert(
            "Yazdırma penceresi açılamadı."
        );

        return;
    }


    yazdir.document.write(`

<!DOCTYPE html>

<html lang="tr">

<head>

<meta charset="UTF-8">

<title>Üretim Reçetesi</title>

<style>

body {
    font-family: Arial, sans-serif;
    padding: 30px;
    color: #222;
}

h1 {
    text-align: center;
    margin-bottom: 30px;
}

.bilgi {
    border: 1px solid #ddd;
    padding: 14px;
    margin-bottom: 10px;
    border-radius: 8px;
}

.etiket {
    display: block;
    font-weight: bold;
    margin-bottom: 5px;
}

.notlar {
    min-height: 100px;
    white-space: pre-wrap;
}

</style>

</head>

<body>

<h1>Üretim Reçetesi</h1>

<div class="bilgi">
<span class="etiket">Reçete No</span>
${guvenliMetin(receteNo)}
</div>

<div class="bilgi">
<span class="etiket">Ürün Adı</span>
${guvenliMetin(urunAdi)}
</div>

<div class="bilgi">
<span class="etiket">Makine Adı</span>
${guvenliMetin(makineAdi)}
</div>

<div class="bilgi">
<span class="etiket">Hız</span>
${guvenliMetin(hiz)}
</div>

<div class="bilgi">
<span class="etiket">Sıcaklık</span>
${guvenliMetin(sicaklik)}
</div>

<div class="bilgi">
<span class="etiket">Basınç</span>
${guvenliMetin(basinc)}
</div>

<div class="bilgi notlar">
<span class="etiket">Notlar</span>
${guvenliMetin(notlar)}
</div>

<script>

window.onload = function() {
    window.print();
};

<\/script>

</body>

</html>

`);


    yazdir.document.close();

}


// ======================================================
// TEXT GETİR
// ======================================================

function getText(id) {

    const eleman =
        document.getElementById(id);

    if (!eleman) {
        return "";
    }

    return eleman.innerText || "";

}


// ======================================================
// ARAMA
// ======================================================

function ara() {

    const arama =
        document.getElementById(
            "arama"
        );

    if (!arama) {
        return;
    }


    const kelime =
        arama.value
            .toLowerCase()
            .trim();


    document
        .querySelectorAll("#liste tr")
        .forEach(function(satir) {

            const metin =
                satir.innerText
                    .toLowerCase();


            satir.style.display =
                metin.includes(kelime)
                    ? ""
                    : "none";

        });

}


// ======================================================
// ESC
// ======================================================

document.addEventListener(
    "keydown",
    function(event) {

        if (event.key === "Escape") {

            detayKapat();

        }

    }
);


// ======================================================
// SAYFA AÇILIŞI
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        console.log(
            "Script.js çalıştı."
        );

        console.log(
            "Supabase:",
            typeof window.supabase
        );

        console.log(
            "SupabaseClient:",
            typeof window.supabaseClient
        );


        receteleriListele();


        const yeniBtn =
            document.getElementById(
                "yeniReceteBtn"
            );


        if (yeniBtn) {

            yeniBtn.addEventListener(
                "click",
                function() {

                    yeniRecete();

                }
            );

        }

    }
);
