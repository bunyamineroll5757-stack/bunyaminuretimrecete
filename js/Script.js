let secilenId = null;
let detaydakiId = null;


// ======================================================
// ÜRETİM AYARLARINI TOPLA
// ======================================================

function uretimAyarlariTopla() {

    const ayarlar = {};

    document
        .querySelectorAll('[id^="ayar_"]')
        .forEach(function (input) {

            ayarlar[input.id] = input.value || "";

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

    document
        .querySelectorAll('[id^="ayar_"]')
        .forEach(function (input) {

            if (
                Object.prototype.hasOwnProperty.call(
                    ayarlar,
                    input.id
                )
            ) {

                input.value = ayarlar[input.id] || "";

            } else {

                input.value = "";

            }

        });
}


// ======================================================
// ÜRETİM AYARLARINI TEMİZLE
// ======================================================

function uretimAyarlariTemizle() {

    document
        .querySelectorAll('[id^="ayar_"]')
        .forEach(function (input) {

            input.value = "";

        });
}


// ======================================================
// LİSTELE
// ======================================================

async function listele() {

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
                <td colspan="7">
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


    data.forEach(function (r) {

        liste.innerHTML += `

            <tr>

                <td>
                    ${r.no || ""}
                </td>

                <td>
                    ${r.urun || ""}
                </td>

                <td>
                    -
                </td>

                <td>
                    ${r.miktar ?? ""}
                </td>

                <td>
                    ${r.tarih || ""}
                </td>

                <td>
                    ${r.uretim_ayarlari
                        ? "Kayıtlı"
                        : ""}
                </td>

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


    const urunInput =
        document.getElementById(
            "urun_adi"
        );

    const urunAdi =
        urunInput
            ? urunInput.value.trim()
            : "";


    if (urunAdi === "") {

        alert(
            "Ürün adı boş bırakılamaz."
        );

        return;
    }


    let receteNo = "";

    const receteNoInput =
        document.getElementById(
            "recete_no"
        );

    if (receteNoInput) {

        receteNo =
            receteNoInput.value.trim();

    }


    // ==================================================
    // OTOMATİK REÇETE NUMARASI
    // ==================================================

    if (receteNo === "") {

        const { data, error } =
            await window.supabaseClient
                .from("receteler")
                .select("no")
                .order("id", {
                    ascending: false
                })
                .limit(1);

        if (error) {

            console.error(error);

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
                data[0].no || "";

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
    // MİKTAR
    // ==================================================

    let miktar = null;

    const miktarInput =
        document.getElementById(
            "miktar"
        );

    if (miktarInput) {

        const miktarDegeri =
            miktarInput.value.trim();

        if (miktarDegeri !== "") {

            miktar =
                Number(
                    miktarDegeri
                );

            if (isNaN(miktar)) {

                alert(
                    "Miktar sayısal olmalıdır."
                );

                return;
            }
        }
    }


    // ==================================================
    // TARİH
    // ==================================================

    let tarih = null;

    const tarihInput =
        document.getElementById(
            "tarih"
        );

    if (tarihInput) {

        tarih =
            tarihInput.value || null;

    } else {

        const bugun =
            new Date();

        tarih =
            bugun
                .toISOString()
                .split("T")[0];
    }


    // ==================================================
    // TÜM ÜRETİM AYARLARI
    // ==================================================

    const uretimAyarlari =
        uretimAyarlariTopla();


    // ==================================================
    // VERİ
    // ==================================================

    const veri = {

        no: receteNo,

        urun: urunAdi,

        miktar: miktar,

        tarih: tarih,

        uretim_ayarlari:
            uretimAyarlari

    };


    // ==================================================
    // SUPABASE KAYIT
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


    const receteNo =
        document.getElementById(
            "detay_recete_no"
        );

    if (receteNo) {

        receteNo.innerText =
            data.no || "-";

    }


    const baslik =
        document.getElementById(
            "detay_baslik_no"
        );

    if (baslik) {

        baslik.innerText =
            data.no || "";

    }


    const urun =
        document.getElementById(
            "detay_urun_adi"
        );

    if (urun) {

        urun.innerText =
            data.urun || "-";

    }


    const makine =
        document.getElementById(
            "detay_makine_adi"
        );

    if (makine) {

        makine.innerText =
            "-";

    }


    const hiz =
        document.getElementById(
            "detay_hiz"
        );

    if (hiz) {

        hiz.innerText =
            "-";

    }


    const sicaklik =
        document.getElementById(
            "detay_sicaklik"
        );

    if (sicaklik) {

        sicaklik.innerText =
            "-";

    }


    const basinc =
        document.getElementById(
            "detay_basinc"
        );

    if (basinc) {

        basinc.innerText =
            "-";

    }


    const notlar =
        document.getElementById(
            "detay_notlar"
        );

    if (notlar) {

        notlar.innerText =
            "Üretim ayarları kayıtlı.";

    }


    // ==================================================
    // ÜRETİM AYARLARI DETAYI
    // ==================================================

    let ayarKutusu =
        document.getElementById(
            "detayUretimAyarlari"
        );


    if (!ayarKutusu) {

        ayarKutusu =
            document.createElement(
                "div"
            );

        ayarKutusu.id =
            "detayUretimAyarlari";

        ayarKutusu.style.marginTop =
            "15px";

        const modalContent =
            document.querySelector(
                "#detayModal .modal-content"
            );

        if (modalContent) {

            modalContent.appendChild(
                ayarKutusu
            );

        }
    }


    let html =
        "<h3>Üretim Ayarları</h3>";


    const ayarlar =
        data.uretim_ayarlari || {};


    const anahtarlar =
        Object.keys(ayarlar);


    if (anahtarlar.length === 0) {

        html +=
            "<p>Üretim ayarı bulunmuyor.</p>";

    } else {

        anahtarlar.forEach(
            function (anahtar) {

                const deger =
                    ayarlar[anahtar] || "";

                const baslik =
                    anahtar
                        .replace(
                            "ayar_",
                            ""
                        )
                        .replace(
                            /_/g,
                            " "
                        );

                html += `

                    <div
                        class="detay-satir">

                        <b>
                            ${baslik}
                        </b>

                        :
                        ${deger || "-"}

                    </div>

                `;
            }
        );
    }


    ayarKutusu.innerHTML =
        html;


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
// DÜZENLE
// ======================================================

async function duzenle(id) {

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


    secilenId = id;


    const receteNo =
        document.getElementById(
            "recete_no"
        );

    if (receteNo) {

        receteNo.value =
            data.no || "";

    }


    const urun =
        document.getElementById(
            "urun_adi"
        );

    if (urun) {

        urun.value =
            data.urun || "";

    }


    const miktar =
        document.getElementById(
            "miktar"
        );

    if (miktar) {

        miktar.value =
            data.miktar ?? "";

    }


    const tarih =
        document.getElementById(
            "tarih"
        );

    if (tarih) {

        tarih.value =
            data.tarih || "";

    }


    // ==================================================
    // TÜM ÜRETİM AYARLARINI YÜKLE
    // ==================================================

    uretimAyarlariYukle(
        data.uretim_ayarlari
    );


    const kaydetBtn =
        document.getElementById(
            "kaydetBtn"
        );

    if (kaydetBtn) {

        kaydetBtn.innerText =
            "Güncelle";

    }


    if (urun) {

        urun.focus();

    }
}


// ======================================================
// GÜNCELLE
// ======================================================

async function guncelle() {

    if (secilenId === null) {

        alert(
            "Önce düzenlenecek reçeteyi seçin."
        );

        return;
    }


    const urunInput =
        document.getElementById(
            "urun_adi"
        );


    const urunAdi =
        urunInput
            ? urunInput.value.trim()
            : "";


    if (urunAdi === "") {

        alert(
            "Ürün adı boş bırakılamaz."
        );

        return;
    }


    const receteNoInput =
        document.getElementById(
            "recete_no"
        );


    const receteNo =
        receteNoInput
            ? receteNoInput.value.trim()
            : "";


    // ==================================================
    // MİKTAR
    // ==================================================

    let miktar = null;

    const miktarInput =
        document.getElementById(
            "miktar"
        );

    if (miktarInput) {

        const deger =
            miktarInput.value.trim();

        if (deger !== "") {

            miktar =
                Number(deger);

            if (isNaN(miktar)) {

                alert(
                    "Miktar sayısal olmalıdır."
                );

                return;
            }
        }
    }


    // ==================================================
    // TARİH
    // ==================================================

    let tarih = null;

    const tarihInput =
        document.getElementById(
            "tarih"
        );

    if (tarihInput) {

        tarih =
            tarihInput.value || null;

    } else {

        const bugun =
            new Date();

        tarih =
            bugun
                .toISOString()
                .split("T")[0];
    }


    // ==================================================
    // ÜRETİM AYARLARI
    // ==================================================

    const uretimAyarlari =
        uretimAyarlariTopla();


    const veri = {

        no: receteNo,

        urun: urunAdi,

        miktar: miktar,

        tarih: tarih,

        uretim_ayarlari:
            uretimAyarlari

    };


    const { error } =
        await window.supabaseClient
            .from("receteler")
            .update(veri)
            .eq("id", secilenId);


    if (error) {

        console.error(error);

        alert(
            "Güncelleme hatası:\n" +
            error.message
        );

        return;
    }


    alert(
        "Reçete ve üretim ayarları güncellendi."
    );


    temizle();

    await listele();
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
            "Reçete alınamadı:\n" +
            error.message
        );

        return;
    }


    const receteNo =
        document.getElementById(
            "recete_no"
        );

    if (receteNo) {

        receteNo.value = "";

    }


    const urun =
        document.getElementById(
            "urun_adi"
        );

    if (urun) {

        urun.value =
            data.urun || "";

    }


    const miktar =
        document.getElementById(
            "miktar"
        );

    if (miktar) {

        miktar.value =
            data.miktar ?? "";

    }


    const tarih =
        document.getElementById(
            "tarih"
        );

    if (tarih) {

        tarih.value = "";

    }


    uretimAyarlariYukle(
        data.uretim_ayarlari
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
        "Üretim ayarları da forma aktarıldı.\n" +
        "Yeni reçete olarak kaydetmek için Kaydet'e basın."
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
            "Yazdırma verisi alınamadı:\n" +
            error.message
        );

        return;
    }


    const yazdir =
        window.open(
            "",
            "_blank",
            "width=800,height=900"
        );


    if (!yazdir) {

        alert(
            "Yazdırma penceresi açılamadı."
        );

        return;
    }


    let ayarlarHtml = "";


    const ayarlar =
        data.uretim_ayarlari || {};


    Object.keys(ayarlar)
        .forEach(
            function (anahtar) {

                const deger =
                    ayarlar[anahtar] || "-";

                const baslik =
                    anahtar
                        .replace(
                            "ayar_",
                            ""
                        )
                        .replace(
                            /_/g,
                            " "
                        );

                ayarlarHtml += `

                    <div class="bilgi">

                        <span class="etiket">
                            ${baslik}
                        </span>

                        ${deger}

                    </div>

                `;
            }
        );


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
}

h2 {
    margin-top: 30px;
}

.bilgi {
    border: 1px solid #ddd;
    padding: 12px;
    margin-bottom: 8px;
    border-radius: 8px;
}

.etiket {
    display: block;
    font-weight: bold;
    margin-bottom: 5px;
    text-transform: capitalize;
}

</style>

</head>

<body>

<h1>
Üretim Reçetesi
</h1>

<div class="bilgi">

<span class="etiket">
Reçete No
</span>

${data.no || "-"}

</div>

<div class="bilgi">

<span class="etiket">
Ürün
</span>

${data.urun || "-"}

</div>

<div class="bilgi">

<span class="etiket">
Miktar
</span>

${data.miktar ?? "-"}

</div>

<div class="bilgi">

<span class="etiket">
Tarih
</span>

${data.tarih || "-"}

</div>

<h2>
Üretim Ayarları
</h2>

${ayarlarHtml}

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
// SİL
// ======================================================

async function sil(id) {

    if (
        !confirm(
            "Bu reçete ve tüm üretim ayarları silinsin mi?"
        )
    ) {

        return;

    }


    const { error } =
        await window.supabaseClient
            .from("receteler")
            .delete()
            .eq("id", id);


    if (error) {

        console.error(error);

        alert(
            "Silme hatası:\n" +
            error.message
        );

        return;
    }


    alert(
        "Reçete silindi."
    );


    await listele();
}


// ======================================================
// TEMİZLE
// ======================================================

function temizle() {

    secilenId = null;


    const alanlar = [

        "recete_no",
        "urun_adi",
        "miktar",
        "tarih"

    ];


    alanlar.forEach(
        function (id) {

            const input =
                document.getElementById(id);

            if (input) {

                input.value = "";

            }

        }
    );


    uretimAyarlariTemizle();


    const kaydetBtn =
        document.getElementById(
            "kaydetBtn"
        );


    if (kaydetBtn) {

        kaydetBtn.innerText =
            "Kaydet";

    }
}


// ======================================================
// YENİ REÇETE
// ======================================================

function yeniRecete() {

    temizle();


    const urun =
        document.getElementById(
            "urun_adi"
        );


    if (urun) {

        urun.focus();

    }
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
        .forEach(
            function (satir) {

                if (
                    satir.innerText
                        .toLowerCase()
                        .includes(kelime)
                ) {

                    satir.style.display =
                        "";

                } else {

                    satir.style.display =
                        "none";

                }

            }
        );
}


// ======================================================
// ESC İLE DETAY KAPAT
// ======================================================

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key ===
            "Escape"
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
    function () {

        listele();


        const yeniBtn =
            document.getElementById(
                "yeniReceteBtn"
            );


        if (yeniBtn) {

            yeniBtn.addEventListener(
                "click",
                function () {

                    yeniRecete();

                }
            );

        }

    }
);
