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
