// ======================================================
// ÜRETİM REÇETE YÖNETİM SİSTEMİ
// Script.js - DÜZELTİLMİŞ TAM SÜRÜM
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
// ÜRETİM AYARLARINI TOPLA
// ======================================================

function uretimAyarlariTopla() {

    const ayarlar = {};

    const alanlar = [

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

    if (!ayarlar) {
        return;
    }

    Object.keys(ayarlar).forEach(function(id) {

        const eleman = document.getElementById(id);

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


    alanlar.forEach(function(id) {

        const eleman = document.getElementById(id);

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
            .select("id,no")
            .order("id", {
                ascending: false
            })
            .limit(1);


    if (error) {

        console.error(
            "Numara alma hatası:",
            error
        );

        throw error;
    }


    let yeniNo = 1;


    if (data && data.length > 0) {

        const sonNo =
            String(data[0].no || "").trim();


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


        // Düzenleme modundaysa güncelle

        if (secilenId !== null) {

            await guncelle();

            return;
        }


        // Ürün adı

        const urunElement =
            document.getElementById("urun_adi");


        if (!urunElement) {

            alert(
                "Ürün Adı alanı bulunamadı."
            );

            return;
        }


        const urunAdi =
            urunElement.value.trim();


        if (urunAdi === "") {

            alert(
                "Ürün adı boş bırakılamaz."
            );

            urunElement.focus();

            return;
        }


        // ==================================================
        // REÇETE NUMARASI
        // ==================================================

        const receteNoElement =
            document.getElementById("recete_no");


        let receteNo = "";


        if (receteNoElement) {

            receteNo =
                receteNoElement.value.trim();

        }


        if (receteNo === "") {

            receteNo =
                await otomatikReceteNo();

        }


        // ==================================================
        // ÜRETİM AYARLARI
        // ==================================================

        const ayarlar =
            uretimAyarlariTopla();


        // Genel alanları JSON içine ekle

        ayarlar.makine_adi =
            document.getElementById(
                "makine_adi"
            )?.value.trim() || "";


        ayarlar.hiz =
            document.getElementById(
                "hiz"
            )?.value.trim() || "";


        ayarlar.sicaklik =
            document.getElementById(
                "sicaklik"
            )?.value.trim() || "";


        ayarlar.basinc =
            document.getElementById(
                "basinc"
            )?.value.trim() || "";


        ayarlar.notlar =
            document.getElementById(
                "notlar"
            )?.value.trim() || "";


        // ==================================================
        // TARİH
        // ==================================================

        const bugun =
            new Date()
                .toISOString()
                .split("T")[0];


        // ==================================================
        // GERÇEK SUPABASE TABLO YAPISI
        // ==================================================

        const veri = {

            no: String(receteNo),

            urun: String(urunAdi),

            miktar: 0,

            tarih: bugun,

            uretim_ayarlari: ayarlar

        };


        console.log(
            "================================"
        );

        console.log(
            "SUPABASE'E GÖNDERİLECEK VERİ:"
        );

        console.log(veri);

        console.log(
            "NO:",
            veri.no
        );

        console.log(
            "ÜRÜN:",
            veri.urun
        );

        console.log(
            "================================"
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
            "Reçete kaydedildi.\n\n" +
            "Reçete No: " +
            receteNo
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

        const db =
            getSupabase();


        if (!db) {

            console.error(
                "Supabase bağlantısı yok."
            );

            return;
        }


        const liste =
            document.getElementById("liste");


        if (!liste) {

            console.error(
                "liste elementi bulunamadı."
            );

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


        console.log(
            "Gelen reçeteler:",
            data
        );


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


            const makine =
                ayarlar.makine_adi || "";


            const hiz =
                ayarlar.hiz || "";


            const sicaklik =
                ayarlar.sicaklik || "";


            const basinc =
                ayarlar.basinc || "";


            liste.innerHTML += `

                <tr>

                    <td>
                        ${guvenliMetin(r.no)}
                    </td>

                    <td>
                        ${guvenliMetin(r.urun)}
                    </td>

                    <td>
                        ${guvenliMetin(makine)}
                    </td>

                    <td>
                        ${guvenliMetin(hiz)}
                    </td>

                    <td>
                        ${guvenliMetin(sicaklik)}
                    </td>

                    <td>
                        ${guvenliMetin(basinc)}
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


        alert(
            "Listeleme hatası:\n" +
            hata.message
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
// DETAY GÖSTER
// ======================================================

async function detayGoster(id) {

    try {

        const db =
            getSupabase();


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
                "Detay hatası:",
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

        const db =
            getSupabase();


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
                "Düzenleme hatası:",
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


        secilenId =
            id;


        const ayarlar =
            data.uretim_ayarlari || {};


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
                "urun
