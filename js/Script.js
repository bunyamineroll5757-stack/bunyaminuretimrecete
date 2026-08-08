// ======================================================
// ÜRETİM REÇETE YÖNETİM SİSTEMİ
// SUPABASE TABLOSU:
//
// id
// no
// urun
// miktar
// tarih
// uretim_ayarlari
// ======================================================


let secilenId = null;
let detaydakiId = null;


// ======================================================
// YARDIMCI FONKSİYON
// ======================================================

function deger(id) {

    const eleman = document.getElementById(id);

    if (!eleman) {
        return "";
    }

    return eleman.value.trim();
}


// ======================================================
// HTML GÜVENLİK
// ======================================================

function htmlGuvenli(metin) {

    if (metin === null || metin === undefined) {
        return "";
    }

    return String(metin)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ======================================================
// ÜRETİM AYARLARI ID LİSTESİ
// ======================================================

const ayarIdleri = [

    // GENEL
    "ayar_gram",
    "ayar_renk",
    "ayar_tarih",
    "ayar_servolap",
    "ayar_tarak_hizi",
    "ayar_firma_adi",

    // TARAK
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

    // SERİCİ
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

    // ÇEKTİRME
    "ayar_trio1",
    "ayar_trio2",
    "ayar_trio3",
    "ayar_trio4",
    "ayar_trio5",
    "ayar_trio6",

    // SU JETİ
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

    // HAMMADDE
    "ayar_balkan1",
    "ayar_balkan2",
    "ayar_balkan3",
    "ayar_hammadde",

    // KESİM
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

    ayarIdleri.forEach(function(id) {

        const eleman = document.getElementById(id);

        if (eleman) {

            ayarlar[id] = eleman.value;

        }

    });

    return ayarlar;
}


// ======================================================
// ÜRETİM AYARLARINI FORMA YÜKLE
// ======================================================

function uretimAyarlariYukle(ayarlar) {

    if (!ayarlar) {
        return;
    }

    ayarIdleri.forEach(function(id) {

        const eleman = document.getElementById(id);

        if (
            eleman &&
            Object.prototype.hasOwnProperty.call(ayarlar, id)
        ) {

            eleman.value = ayarlar[id] ?? "";

        }

    });
}


// ======================================================
// TÜM ÜRETİM AYARLARINI TEMİZLE
// ======================================================

function uretimAyarlariTemizle() {

    ayarIdleri.forEach(function(id) {

        const eleman = document.getElementById(id);

        if (eleman) {

            eleman.value = "";

        }

    });
}


// ======================================================
// OTOMATİK REÇETE NUMARASI
// ======================================================

async function otomatikReceteNo() {

    const { data, error } =
        await window.supabaseClient
            .from("receteler")
            .select("no");

    if (error) {

        console.error(error);

        throw new Error(
            "Reçete numaraları alınamadı:\n" +
            error.message
        );
    }


    let enBuyuk = 0;


    if (data && data.length > 0) {

        data.forEach(function(kayit) {

            const no =
                String(kayit.no || "");

            const sonuc =
                no.match(/REC-(\d+)/i);

            if (sonuc) {

                const sayi =
                    parseInt(sonuc[1], 10);

                if (sayi > enBuyuk) {

                    enBuyuk = sayi;

                }

            }

        });

    }


    const yeniNo =
        enBuyuk + 1;


    return (
        "REC-" +
        String(yeniNo).padStart(3, "0")
    );
}


// ======================================================
// LİSTELE
// ======================================================

async function receteleriListele() {

    const liste =
        document.getElementById("liste");

    if (!liste) {
        return;
    }


    const { data, error } =
        await window.supabaseClient
            .from("receteler")
            .select("*")
            .order("id", {
                ascending: false
            });


    if (error) {

        console.error(error);

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

    } else {

        data.forEach(function(r) {

            const miktar =
                r.miktar === null ||
                r.miktar === undefined
                    ? ""
                    : r.miktar;

            const tarih =
                r.tarih || "";


            liste.innerHTML += `

                <tr>

                    <td>
                        ${htmlGuvenli(r.no || "")}
                    </td>

                    <td>
                        ${htmlGuvenli(r.urun || "")}
                    </td>

                    <td>
                        Üretim Ayarları
                    </td>

                    <td>
                        ${htmlGuvenli(miktar)}
                    </td>

                    <td>
                        ${htmlGuvenli(tarih)}
                    </td>

                    <td>
                        -
                    </td>

                    <td>

                        <button
                            type="button"
                            class="btn"
                            onclick="detayGoster(${Number(r.id)})">
                            Detay
                        </button>

                        <button
                            type="button"
                            class="btn"
                            onclick="duzenle(${Number(r.id)})">
                            Düzenle
                        </button>

                        <button
                            type="button"
                            class="btn-danger"
                            onclick="sil(${Number(r.id)})">
                            Sil
                        </button>

                    </td>

                </tr>

            `;

        });

    }


    const toplam =
        document.getElementById("toplamRecete");


    if (toplam) {

        toplam.innerText =
            data ? data.length : 0;

    }

}


// Eski isimle çağrılırsa da çalışsın
async function listele() {

    await receteleriListele();

}


// ======================================================
// KAYDET
// ======================================================

async function kaydet() {

    try {

        // Eğer düzenleme modundaysak
        if (secilenId !== null) {

            await guncelle();

            return;
        }


        const urun =
            deger("urun_adi");


        if (urun === "") {

            alert(
                "Ürün adı boş bırakılamaz."
            );

            return;
        }


        // Reçete numarası
        let no =
            deger("recete_no");


        if (no === "") {

            no =
                await otomatikReceteNo();

        }


        // Miktar
        // Üretim Ayarları bölümündeki Gram alanından alınır
        const gram =
            deger("ayar_gram");


        let miktar = null;


        if (gram !== "") {

            const sayisalMiktar =
                Number(
                    gram.replace(",", ".")
                );


            if (!isNaN(sayisalMiktar)) {

                miktar =
                    sayisalMiktar;

            } else {

                alert(
                    "Gram / Miktar alanına sayısal bir değer girin."
                );

                return;
            }

        }


        // Tarih
        const bugun =
            new Date()
                .toISOString()
                .split("T")[0];


        // Tüm üretim ayarlarını JSON olarak al
        const uretimAyarlari =
            uretimAyarlariTopla();


        const veri = {

            no: no,

            urun: urun,

            miktar: miktar,

            tarih: bugun,

            uretim_ayarlari:
                uretimAyarlari

        };


        console.log(
            "Kaydedilecek veri:",
            veri
        );


        const { data, error } =
            await window.supabaseClient
                .from("receteler")
                .insert([veri])
                .select();


        if (error) {

            console.error(error);

            alert(
                "Kayıt hatası:\n" +
                error.message
            );

            return;
        }


        console.log(
            "Kayıt başarılı:",
            data
        );


        alert(
            "Reçete kaydedildi.\n\n" +
            "Reçete No: " + no
        );


        temizle();


        await receteleriListele();

    }

    catch (hata) {

        console.error(hata);

        alert(
            "Kayıt sırasında hata oluştu:\n" +
            hata.message
        );

    }

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
            "Reçete alınamadı:\n" +
            error.message
        );

        return;
    }


    detaydakiId = id;


    // Reçete No
    const receteNo =
        document.getElementById(
            "detay_recete_no"
        );

    if (receteNo) {

        receteNo.innerText =
            data.no || "-";

    }


    // Başlık
    const baslik =
        document.getElementById(
            "detay_baslik_no"
        );

    if (baslik) {

        baslik.innerText =
            data.no || "";

    }


    // Ürün
    const urun =
        document.getElementById(
            "detay_urun_adi"
        );

    if (urun) {

        urun.innerText =
            data.urun || "-";

    }


    // Miktar
    const hiz =
        document.getElementById(
            "detay_hiz"
        );

    if (hiz) {

        hiz.innerText =
            data.miktar === null ||
            data.miktar === undefined
                ? "-"
                : data.miktar;

    }


    // Tarih
    const sicaklik =
        document.getElementById(
            "detay_sicaklik"
        );

    if (sicaklik) {

        sicaklik.innerText =
            data.tarih || "-";

    }


    // Basınç alanını üretim ayarı sayısı olarak kullan
    const basinc =
        document.getElementById(
            "detay_basinc"
        );


    const ayarlar =
        data.uretim_ayarlari || {};


    const ayarSayisi =
        Object.keys(ayarlar).length;


    if (basinc) {

        basinc.innerText =
            ayarSayisi +
            " ayar kayıtlı";

    }


    // Makine adı alanına bilgi
    const makine =
        document.getElementById(
            "detay_makine_adi"
        );


    if (makine) {

        makine.innerText =
            "Üretim Ayarları";

    }


    // Notlar bölümüne tüm ayarları yaz
    const notlar =
        document.getElementById(
            "detay_notlar"
        );


    if (notlar) {

        let metin = "";


        ayarIdleri.forEach(function(id) {

            if (
                Object.prototype.hasOwnProperty
                    .call(ayarlar, id)
            ) {

                const deger =
                    ayarlar[id];


                if (
                    deger !== null &&
                    deger !== undefined &&
                    String(deger) !== ""
                ) {

                    metin +=
                        id.replace("ayar_", "") +
                        ": " +
                        deger +
                        "\n";

                }

            }

        });


        notlar.innerText =
            metin || "Üretim ayarı yok";

    }


    // Modal
    const modal =
        document.getElementById(
            "detayModal"
        );


    if (modal) {

        modal.style.display =
            "flex";

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

        console.error(error);

        alert(
            "Reçete kopyalanamadı:\n" +
            error.message
        );

        return;
    }


    // Yeni reçete numarası
    let yeniNo;


    try {

        yeniNo =
            await otomatikReceteNo();

    }

    catch (e) {

        alert(e.message);

        return;
    }


    const receteNo =
        document.getElementById(
            "recete_no"
        );


    if (receteNo) {

        receteNo.value =
            yeniNo;

    }


    const urun =
        document.getElementById(
            "urun_adi"
        );


    if (urun) {

        urun.value =
            data.urun || "";

    }


    const gram =
        document.getElementById(
            "ayar_gram"
        );


    if (gram) {

        gram.value =
            data.miktar ?? "";

    }


    // Üretim ayarlarını yükle
    uretimAyarlariYukle(
        data.uretim_ayarlari || {}
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


    if (urun) {

        urun.focus();

    }


    alert(
        "Reçete kopyalandı.\n\n" +
        "Yeni reçete numarası: " +
        yeniNo +
        "\n\n" +
        "Kaydet'e basarak yeni reçeteyi oluşturabilirsiniz."
    );

}


// ======================================================
// YAZDIR
// ======================================================

async function detayYazdir() {

    if (detaydakiId === null) {

        alert(
            "Yazdırılacak reçete bulunamadı."
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
            "Yazdırma için reçete alınamadı:\n" +
            error.message
        );

        return;
    }


    const ayarlar =
        data.uretim_ayarlari || {};


    let ayarHTML = "";


    ayarIdleri.forEach(function(id) {

        const deger =
            ayarlar[id];


        if (
            deger !== null &&
            deger !== undefined &&
            String(deger) !== ""
        ) {

            let baslik =
                id
                    .replace("ayar_", "")
                    .replace(/_/g, " ");


            baslik =
                baslik.charAt(0).toUpperCase() +
                baslik.slice(1);


            ayarHTML += `

                <div class="bilgi">

                    <span class="etiket">
                        ${htmlGuvenli(baslik)}
                    </span>

                    ${htmlGuvenli(deger)}

                </div>

            `;

        }

    });


    const
