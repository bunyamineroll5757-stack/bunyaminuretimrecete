let secilenId = null;
let detaydakiId = null;


// ======================================================
// ÜRETİM AYARLARI
// ======================================================

const ayarAlanlari = [
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
// AYARLARI OKU
// ======================================================

function ayarlariOku() {

    const ayarlar = {};

    ayarAlanlari.forEach(function(id) {

        const alan = document.getElementById(id);

        if (alan) {
            ayarlar[id] = alan.value;
        }

    });

    return ayarlar;
}


// ======================================================
// AYARLARI YÜKLE
// ======================================================

function ayarlariYukle(ayarlar) {

    if (!ayarlar) {
        return;
    }

    ayarAlanlari.forEach(function(id) {

        const alan = document.getElementById(id);

        if (alan) {
            alan.value = ayarlar[id] || "";
        }

    });
}


// ======================================================
// AYARLARI TEMİZLE
// ======================================================

function ayarlariTemizle() {

   
