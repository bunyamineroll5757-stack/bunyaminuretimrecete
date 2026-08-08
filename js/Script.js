let secilenId = null;
let detaydakiId = null;


// ======================================================
// ÜRETİM AYARLARI - HTML ID'LERİ
// ======================================================

const ayarAlanlari = [

    // Genel
    "ayar_gram",
    "ayar_renk",
    "ayar_tarih",
    "ayar_servolap",
    "ayar_tarak_hizi",
    "ayar_firma_adi",

    // Tarak
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

    // Serici
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

    // Çektirme
    "ayar_trio1",
    "ayar_trio2",
    "ayar_trio3",
    "ayar_trio4",
    "ayar_trio5",
    "ayar_trio6",

    // Su Jeti
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

    // Hammadde
    "ayar_balkan1",
    "ayar_balkan2",
    "ayar_balkan3",
    "ayar_hammadde",

    // Kesim
    "ayar_kesim_eni",
    "ayar_cap",
    "ayar_sarim_metresi",
    "ayar_saatlik_kg",
    "ayar_firin_isisi",
    "ayar_hat_hizi"
];


// ======================================================
// AYARLARI FORMDA OKU
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
// AYARLARI FORMA YAZ
// ======================================================

function ayarlariYukle(ayarlar) {

    if (!ayarlar) {
        return;
    }

    ayarAlanlari.forEach(function(id) {

        const alan = document.getElementById(id);

        if (alan) {

            alan.value =
                ayarlar[id] !== undefined
                    ? ayarlar[id]
                    : "";

        }

    });
}


// ======================================================
// AYARLARI TEMİZLE
// ======================================================

function ayarlariTemizle() {

    ayarAlanlari.forEach(function(id) {

        const alan = document.getElementById(id);

        if (alan) {
            alan.value = "";
        }

    });
}


// ======================================================
// LİSTELE
// ======================================================

async function listele() {

    const liste = document.getElementById("liste");

    const { data, error } =
        await window.supabaseClient
            .from("receteler")
            .select("*")
            .order("id", { ascending: false });


    if (error) {

        console.error(error);

        alert(
            "Listeleme hatası:\n" +
            error.message
        );

        return;
    }


    liste.innerHTML = "";


    data.forEach(function(r) {

        liste.innerHTML += `

            <tr>

                <td>${r.recete_no || ""}</td>

                <td>${r.urun_adi || ""}</td>

                <td>${r.makine_adi || ""}</td>

                <td>${r.hiz || ""}</td>

                <td>${r.sicaklik || ""}</td>

                <td>${r.basinc || ""}</td>

                <td>

                    <button
                        type="button"
                        onclick="detayGoster(${r.id})">

                        Detay

                    </button>


                    <button
                        type="button"
                        onclick="duzenle(${r.id})">

                        Düzenle

                    </button>


                    <button
                        type="button"
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

}


// ======================================================
// KAYDET
// ======================================================

async function kaydet() {

    if (secilenId !== null) {

        await guncelle();

        return;

    }


    const urunAdi =
        document.getElementById(
            "urun_adi"
        ).value.trim();


    if (urunAdi === "") {

        alert(
            "Ürün adı boş bırakılamaz."
        );

        return;

    }


    let receteNo =
        document.getElementById(
            "recete_no"
        ).value.trim();


    const makineAdi =
        document.getElementById(
            "makine_adi"
        ).value.trim();


    const hiz =
        document.getElementById(
            "hiz"
        ).value.trim();


    const sicaklik =
        document.getElementById(
            "sicaklik"
        ).value.trim();


    const basinc =
        document.getElementById(
            "basinc"
        ).value.trim();


    const notlar =
        document.getElementById(
            "notlar"
        ).value.trim();


    // ==================================================
    // OTOMATİK REÇETE NUMARASI
    // ==================================================

    if (receteNo === "") {

        const { data, error } =
            await window.supabaseClient
                .from("receteler")
                .select("recete_no")
                .order("id", {
                    ascending: false
                })
                .limit(1);


        if (error) {

            alert(
                "Reçete numarası alınamadı:\n" +
                error.message
            );

            return;

        }


        let yeniNo = 1;


        if (
            data &&
            data.length > 0
        ) {

            const sonNo =
                data[0].recete_no || "";


            const sonuc =
                sonNo.match(
                    /REC-(\d+)/i
                );


            if (sonuc) {

                yeniNo =
                    Number(
                        sonuc[1]
                    ) + 1;

            }

        }


        receteNo =
            "REC-" +
            String(yeniNo)
                .padStart(3, "0");

    }


    // ==================================================
    // ÜRETİM AYARLARINI AL
    // ==================================================

    const ayarlar =
        ayarlariOku();


    const veri = {

        recete_no: receteNo,

        urun_adi: urunAdi,

        makine_adi: makineAdi,

        hiz: hiz,

        sicaklik: sicaklik,

        basinc: basinc,

        notlar: notlar,

        ayarlar: ayarlar

    };


    // ==================================================
    // SUPABASE KAYDET
    // ==================================================

    const { error } =
        await window.supabaseClient
            .from("receteler")
            .insert([veri]);


    if (error) {

        console.error(error);

        alert(
            "Kayıt hatası:\n" +
            error.message
        );

        return;

    }


    alert(
        "Reçete ve üretim ayarları kaydedildi."
    );


    temizle();

    await listele();

}


// ======================================================
// DETAY GÖSTER
// ======================================================

async function detayGoster(id) {

    const { data, error } =
        await window.supabaseClient
            .from("receteler")
            .select("*")
            .eq("id", id)
            .single();


    if (error) {

        console.error(error);

        alert(
            "Detay alınamadı:\n" +
            error.message
        );

        return;

    }


    detaydakiId = id;


    const alanlar = {

        detay_recete_no:
            data.recete_no,

        detay_urun_adi:
            data.urun_adi,

        detay_makine_adi:
            data.makine_adi,

        detay_hiz:
            data.hiz,

        detay_sicaklik:
            data.sicaklik,

        detay_basinc:
            data.basinc,

        detay_notlar:
            data.notlar || "Not yok"

    };


    Object.keys(alanlar)
        .forEach(function(id) {

            const alan =
                document.getElementById(id);

            if (alan) {

                alan.innerText =
                    alanlar[id] || "-";

            }

        });


    const modal =
        document.getElementById(
            "detayModal"
        );


    if (!modal) {

        alert(
            "Detay penceresi bulunamadı."
        );

        return;

    }


    modal.style.display = "flex";

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

        modal.style.display = "none";

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
// DETAYDAN KOPYALA
// ======================================================

async function detayKopyala() {

    if (detaydakiId === null) {

        alert(
            "Kopyalanacak reçete bulunamadı."
        );

        return;

    }


    const { data, error } =
        await window.supabaseClient
            .from("receteler")
            .select("*")
            .eq("id", detaydakiId)
            .single();


    if (error) {

        alert(
            "Reçete kopyalanamadı:\n" +
            error.message
        );

        return;

    }


    document.getElementById(
        "recete_no"
    ).value = "";


    document.getElementById(
        "urun_adi"
    ).value =
        data.urun_adi || "";


    document.getElementById(
        "makine_adi"
    ).value =
        data.makine_adi || "";


    document.getElementById(
        "hiz"
    ).value =
        data.hiz || "";


    document.getElementById(
        "sicaklik"
    ).value =
        data.sicaklik || "";


    document.getElementById(
        "basinc"
    ).value =
        data.basinc || "";


    document.getElementById(
        "notlar"
    ).value =
        data.notlar || "";


    // ÜRETİM AYARLARINI DA KOPYALA

    ayarlariYukle(
        data.ayarlar || {}
    );


    secilenId = null;


    const kaydetBtn =
        document.getElementById(
            "kaydetBtn"
        );


    if (kaydetBtn) {

        kaydetBtn.innerText =
            "Kaydet";

    }


    detayKapat();


    document.getElementById(
        "urun_adi"
    ).focus();


    alert(
        "Reçete ve üretim ayarları kopyalandı.\n\n" +
        "Yeni reçete olarak kaydetmek için Kaydet'e basın."
    );

}


// ======================================================
// YAZDIR
// ======================================================

function detayY
