// ======================================================
// ÜRETİM REÇETE YÖNETİM SİSTEMİ
// Script.js - DÜZELTİLMİŞ TAM SÜRÜM
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

    if (window.sbClient) {
        return window.sbClient;
    }

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
// TÜM FORMU TEMİZLE
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
        throw new Error("Supabase bağlantısı bulunamadı.");
    }


    const { data, error } =
        await db
            .from("receteler")
            .select("recete_no")
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
            String(data[0].recete_no || "");


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

async function kaydet(event) {

    if (event) {
        event.preventDefault();
    }

    try {

        const db = getSupabase();


        if (!db) {

            alert(
                "Supabase bağlantısı bulunamadı."
            );

            return;
        }


        // Eğer düzenleme modundaysak
        if (secilenId !== null) {

            await guncelle();

            return;
        }


        const urunAdiElement =
            document.getElementById("urun_adi");


        if (!urunAdiElement) {

            alert(
                "Ürün Adı alanı bulunamadı."
            );

            return;
        }


        const urunAdi =
            urunAdiElement.value.trim();


        if (urunAdi === "") {

            alert(
                "Ürün adı boş bırakılamaz."
            );

            urunAdiElement.focus();

            return;
        }


        // Reçete numarası

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


        // Diğer genel alanlar
        const makineAdi = document.getElementById("makine_adi")?.value.trim() || "";
        const hiz = document.getElementById("hiz")?.value.trim() || "";
        const sicaklik = document.getElementById("sicaklik")?.value.trim() || "";
        const basinc = document.getElementById("basinc")?.value.trim() || "";
        const notlar = document.getElementById("notlar")?.value.trim() || "";


        // Üretim ayarları
        const ayarlarObj = uretimAyarlariTopla();

        ayarlarObj.makine_adi = makineAdi;
        ayarlarObj.hiz = hiz;
        ayarlarObj.sicaklik = sicaklik;
        ayarlarObj.basinc = basinc;
        ayarlarObj.notlar = notlar;


        // Supabase sütunlarını doğrudan hedefleyen veri objesi
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


        console.log(
            "Kaydedilecek veri:",
            veri
        );


        const { data, error } =
            await db
                .from("receteler")
                .insert([veri])
                .select();


        if (error) {

            console.error(
                "Kayıt hatası:",
                error
            );


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
            "Reçete kaydedildi."
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
                "Listeleme Supabase hatası:",
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

            let ayarlarObj =
                r.uretim_ayarlari || r.ayarlar || {};


            const receteNo = r.recete_no || "";

            const urunAdi = r.urun_adi || "";

            const makine = r.makine_adi || ayarlarObj.makine_adi || "";

            const hiz = r.hiz || ayarlarObj.hiz || "";

            const sicaklik = r.sicaklik || ayarlarObj.sicaklik || "";

            const basinc = r.basinc || ayarlarObj.basinc || "";


            liste.innerHTML += `

                <tr>

                    <td>
                        ${guvenliMetin(receteNo)}
                    </td>

                    <td>
                        ${guvenliMetin(urunAdi)}
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
// ESKİ FONKSİYON ADIYLA UYUMLULUK
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


        const ayarlarObj =
            data.uretim_ayarlari || data.ayarlar || {};


        setText(
            "detay_recete_no",
            data.recete_no || "-"
        );


        setText(
            "detay_baslik_no",
            data.recete_no || "-"
        );


        setText(
            "detay_urun_adi",
            data.urun_adi || "-"
        );


        setText(
            "detay_makine_adi",
            data.makine_adi || ayarlarObj.makine_adi || "-"
        );


        setText(
            "detay_hiz",
            data.hiz || ayarlarObj.hiz || "-"
        );


        setText(
            "detay_sicaklik",
            data.sicaklik || ayarlarObj.sicaklik || "-"
        );


        setText(
            "detay_basinc",
            data.basinc || ayarlarObj.basinc || "-"
        );


        setText(
            "detay_notlar",
            data.notlar || ayarlarObj.notlar || "Not yok"
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


        const ayarlarObj =
            data.uretim_ayarlari || data.ayarlar || {};


        setValue(
            "recete_no",
            data.recete_no || ""
        );


        setValue(
            "urun_adi",
            data.urun_adi || ""
        );


        setValue(
            "makine_adi",
            data.makine_adi || ayarlarObj.makine_adi || ""
        );


        setValue(
            "hiz",
            data.hiz || ayarlarObj.hiz || ""
        );


        setValue(
            "sicaklik",
            data.sicaklik || ayarlarObj.sicaklik || ""
        );


        setValue(
            "basinc",
            data.basinc || ayarlarObj.basinc || ""
        );


        setValue(
            "notlar",
            data.notlar || ayarlarObj.notlar || ""
        );


        // Diğer üretim ayarlarını yükle

        uretimAyarlariYukle(
            ayarlarObj
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


        const db =
            getSupabase();


        if (!db) {

            alert(
                "Supabase bağlantısı bulunamadı."
            );

            return;
        }


        const urunAdi =
            document.getElementById(
                "urun_adi"
            )?.value.trim() || "";


        if (urunAdi === "") {

            alert(
                "Ürün adı boş bırakılamaz."
            );

            return;
        }


        const receteNo =
            document.getElementById(
                "recete_no"
            )?.value.trim() || "";


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


        console.log(
            "Güncellenecek veri:",
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
                "Güncelleme hatası:",
                error
            );


            alert(
                "Güncelleme hatası:\n" +
                error.message
            );

            return;
        }


        console.log(
            "Güncelleme başarılı:",
            data
        );


        alert(
            "Reçete güncellendi."
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

        const db =
            getSupabase();


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
                "Silme hatası:",
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
// ESKİ TEMİZLE FONKSİYONU
// ======================================================

function temizle() {

    temizleForm();

}


// ======================================================
// KOPYALA
// ======================================================

function detayKopyala() {

    const receteNo =
        getText(
            "detay_recete_no"
        );


    const urunAdi =
        getText(
            "detay_urun_adi"
        );


    const makineAdi =
        getText(
            "detay_makine_adi"
        );


    const hiz =
        getText(
            "detay_hiz"
        );


    const sicaklik =
        getText(
            "detay_sicaklik"
        );


    const basinc =
        getText(
            "detay_basinc"
        );


    const notlar =
        getText(
            "detay_notlar"
        );


    setValue(
        "recete_no",
        ""
    );


    setValue(
        "urun_adi",
        urunAdi === "-"
            ? ""
            : urunAdi
    );


    setValue(
        "makine_adi",
        makineAdi === "-"
            ? ""
            : makineAdi
    );


    setValue(
        "hiz",
        hiz === "-"
            ? ""
            : hiz
    );


    setValue(
        "sicaklik",
        sicaklik === "-"
            ? ""
            : sicaklik
    );


    setValue(
        "basinc",
        basinc === "-"
            ? ""
            : basinc
    );


    setValue(
        "notlar",
        notlar === "Not yok"
            ? ""
            : notlar
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
        "Reçete kopyalandı.\n\n" +
        "Bilgiler forma aktarıldı.\n" +
        "Yeni reçete olarak kaydetmek için Kaydet'e basın."
    );

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
        .querySelectorAll(
            "#liste tr"
        )
        .forEach(function(satir) {

            const metin =
                satir.innerText
                    .toLowerCase();


            if (
                metin.includes(kelime)
            ) {

                satir.style.display =
                    "";

            } else {

                satir.style.display =
                    "none";

            }

        });

}


// ======================================================
// ESC İLE DETAYI KAPAT
// ======================================================

document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "Escape"
        ) {

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


        // Supabase bağlantısını kontrol et

        console.log(
            "Supabase:",
            typeof window.supabase
        );


        console.log(
            "SupabaseClient:",
            typeof window.supabaseClient
        );


        // Reçeteleri getir

        receteleriListele();


        // Yeni reçete butonu

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

// Reçeteyi PDF Olarak İndirme
function pdfIndir() {
    // 1. Sadece id'si detayIcerik olan div'i yakala
    const element = document.getElementById('detayIcerik');

    if (!element) {
        alert("Yazdırılacak detay alanı (detayIcerik) bulunamadı!");
        return;
    }

    // 2. Ekranı en üste kaydır
    window.scrollTo(0, 0);

    // 3. Gizlenecek butonları belirle
    const butonlar = document.querySelectorAll('button, #arama, #loginModal, .modal-backdrop');
    butonlar.forEach(b => b.style.visibility = 'hidden');

    // 4. Reçete numarasını al
    const receteNoEl = document.getElementById('detay_recete_no') || document.getElementById('recete_no');
    const receteNo = receteNoEl ? (receteNoEl.value || receteNoEl.innerText.trim()) : 'Detay';

    // 5. PDF Ayarları
    const opt = {
        margin:       [5, 5, 5, 5],
        filename:     `Recete_${receteNo}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { 
            scale: 2, 
            useCORS: true, 
            logging: false,
            windowWidth: 1200 // Mobilde masaüstü görünümü simüle ederek kaymayı önler
        },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // 6. PDF Oluştur ve İndir
    html2pdf().set(opt).from(element).save().then(() => {
        butonlar.forEach(b => b.style.visibility = 'visible');
    }).catch(err => {
        console.error("PDF Hatası:", err);
        butonlar.forEach(b => b.style.visibility = 'visible');
    });
}lse,
            windowWidth: document.body.scrollWidth,
            scrollY: -window.scrollY
        },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // 6. PDF Oluştur
    html2pdf().set(opt).from(element).save().then(() => {
        butonlar.forEach(b => b.style.visibility = 'visible');
    }).catch(err => {
        console.error("PDF Hatası:", err);
        butonlar.forEach(b => b.style.visibility = 'visible');
        alert("PDF oluşturulamadı: " + err.message);
    });
}
}

// Reçeteyi WhatsApp/E-Posta ile Paylaşma
async function paylas() {
    const getVal = (id) => {
        const el = document.getElementById(id);
        return el ? el.innerText.trim() : '-';
    };

    const receteNo = getVal('detay_recete_no');
    const urunAdi = getVal('detay_urun_adi');
    const makine = getVal('detay_makine_adi');
    const hiz = getVal('detay_hiz');
    const sicaklik = getVal('detay_sicaklik');
    const basinc = getVal('detay_basinc');

    const metin = `📄 *Üretim Reçetesi Detayı*\n\n` +
                  `*Reçete No:* ${receteNo}\n` +
                  `*Ürün Adı:* ${urunAdi}\n` +
                  `*Makine:* ${makine}\n` +
                  `*Hız:* ${hiz}\n` +
                  `*Sıcaklık:* ${sicaklik}\n` +
                  `*Basınç:* ${basinc}\n\n` +
                  `Üretim Reçete Sisteminden Gönderildi.`;

    if (navigator.share) {
        try {
            await navigator.share({
                title: `Reçete No: ${receteNo}`,
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
    const user = document.getElementById("login_user").value.trim();
    const pass = document.getElementById("login_pass").value.trim();
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
