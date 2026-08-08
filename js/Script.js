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

            ayarlar[input.id] =
                input.value || "";

        });

    return ayarlar;
}


// ======================================================
// ÜRETİM AYARLARINI YÜKLE
// ======================================================

function uretimAyarlariYukle(ayarlar) {

    document
        .querySelectorAll('[id^="ayar_"]')
        .forEach(function (input) {

            if (
                ayarlar &&
                Object.prototype.hasOwnProperty.call(
                    ayarlar,
                    input.id
                )
            ) {

                input.value =
                    ayarlar[input.id] || "";

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
// BUGÜNÜN TARİHİ
// ======================================================

function bugununTarihi() {

    const tarih = new Date();

    const yil =
        tarih.getFullYear();

    const ay =
        String(
            tarih.getMonth() + 1
        ).padStart(2, "0");

    const gun =
        String(
            tarih.getDate()
        ).padStart(2, "0");

    return `${yil}-${ay}-${gun}`;
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
                    ${
                        r.uretim_ayarlari
                            ? "Kayıtlı"
                            : ""
                    }
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
// SON REÇETE NUMARASINI AL
// ======================================================

async function sonrakiReceteNumarasi() {

    const { data, error } =
        await window.supabaseClient
            .from("receteler")
            .select("no")
            .order("id", {
                ascending: false
            })
            .limit(1);


    if (error) {

        console.error(
            "Reçete numarası sorgu hatası:",
            error
        );

        throw error;
    }


    // TABLO BOŞSA
    if (
        !data ||
        data.length === 0
    ) {

        return "REC-001";

    }


    const sonNo =
        data[0].no || "";


    const sonuc =
        String(sonNo)
            .match(
                /REC-(\d+)/i
            );


    if (!sonuc) {

        return "REC-001";

    }


    const sayi =
        Number(
            sonuc[1]
        );


    return (
        "REC-" +
        String(
            sayi + 1
        ).padStart(3, "0")
    );
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


    const urun =
        urunInput
            ? urunInput.value.trim()
            : "";


    if (urun === "") {

        alert(
            "Ürün adı boş bırakılamaz."
        );

        return;
    }


    // ==================================================
    // REÇETE NO
    // ==================================================

    let receteNo = "";


    const receteNoInput =
        document.getElementById(
            "recete_no"
        );


    if (receteNoInput) {

        receteNo =
            receteNoInput.value.trim();

    }


    if (receteNo === "") {

        try {

            receteNo =
                await sonrakiReceteNumarasi();

        } catch (error) {

            alert(
                "Reçete numarası alınamadı:\n" +
                error.message
            );

            return;
        }

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

        const miktarText =
            miktarInput.value.trim();


        if (miktarText !== "") {

            miktar =
                Number(
                    miktarText
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

    let tarih = "";


    const tarihInput =
        document.getElementById(
            "tarih"
        );


    if (tarihInput) {

        tarih =
            tarihInput.value;

    }


    if (!tarih) {

        tarih =
            bugununTarihi();

    }


    // ==================================================
    // ÜRETİM AYARLARI
    // ==================================================

    const uretimAyarlari =
        uretimAyarlariTopla();


    // ==================================================
    // VERİ
    // ==================================================

    const veri = {

        no: receteNo,

        urun: urun,

        miktar: miktar,

        tarih: tarih,

        uretim_ayarlari:
            uretimAyarlari

    };


    console.log(
        "Kaydedilecek veri:",
        veri
    );


    // ==================================================
    // SUPABASE INSERT
    // ==================================================

    const { data, error } =
        await window.supabaseClient
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
        "Kaydedilen kayıt:",
        data
    );


    alert(
        "Reçete kaydedildi."
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


    const miktar =
        data.miktar ?? "-";


    const tarih =
        data.tarih || "-";


    const makine =
        document.getElementById(
            "detay_makine_adi"
        );

    if (makine) {

        makine.innerText =
            "Miktar: " +
            miktar +
            " | Tarih: " +
            tarih;

    }


    const hiz =
        document.getElementById(
            "detay_hiz"
        );

    if (hiz) {

        hiz.innerText = "-";

    }


    const sicaklik =
        document.getElementById(
            "detay_sicaklik"
        );

    if (sicaklik) {

        sicaklik.innerText = "-";

    }


    const basinc =
        document.getElementById(
            "detay_basinc"
        );

    if (basinc) {

        basinc.innerText = "-";

    }


    const notlar =
        document.getElementById(
            "detay_notlar"
        );

    if (notlar) {

        notlar.innerText =
            "Üretim ayarları aşağıda gösterilmektedir.";

    }


    // ==================================================
    // ÜRETİM AYARLARI
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


    const ayarlar =
        data.uretim_ayarlari || {};


    let html =
        "<h3>Üretim Ayarları</h3>";


    const anahtarlar =
        Object.keys(
            ayarlar
        );


    if (
        anahtarlar.length === 0
    ) {

        html +=
            "<p>Üretim ayarı bulunmuyor.</p>";

    } else {

        anahtarlar.forEach(
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


                html += `

                    <div
                        class="detay-satir">

                        <b>
                            ${baslik}
                        </b>

                        :
                        ${deger}

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

    if (
        detaydakiId === null
    ) {

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

    if (
        secilenId === null
    ) {

        alert(
            "Önce düzenlenecek reçeteyi seçin."
        );

        return;
    }


    const urunInput =
        document.getElementById(
            "urun_adi"
        );


    const urun =
        urunInput
            ? urunInput.value.trim()
            : "";


    if (urun === "") {

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


    let miktar = null;


    const miktarInput =
        document.getElementById(
            "miktar"
        );


    if (miktarInput) {

        const miktarText =
            miktarInput.value.trim();


        if (miktarText !== "") {

            miktar =
                Number(
                    miktarText
                );


            if (isNaN(miktar)) {

                alert(
                    "Miktar sayısal olmalıdır."
                );

                return;
            }

        }

    }


    let tarih = "";


    const tarihInput =
        document.getElementById(
            "tarih"
        );


    if (tarihInput) {

        tarih =
            tarihInput.value;

    }


    if (!tarih) {

        tarih =
            bugununTarihi();

    }


    const uretimAyarlari =
        uretimAyarlariTopla();


    const veri = {

        no: receteNo,

        urun: urun,

        miktar: miktar,

        tarih: tarih,

        uretim_ayarlari:
            uretimAyarlari

    };


    const { error } =
        await window.supabaseClient
            .from("receteler")
            .update(veri)
            .eq(
                "id",
                secilenId
            );


    if (error) {

        console.error(error);

        alert(
            "Güncelleme hatası:\n" +
            error.message
        );

        return;
    }


    alert(
        "Reçete güncellendi."
    );


    temizle();


    await listele();
}


// ======================================================
// KOPYALA
// ======================================================

async function detayKopyala() {

    if (
        detaydakiId === null
    ) {

        alert(
            "Kopyalanacak reçete bulunamadı."
        );

        return;
    }


    const { data, error } =
        await window.supabaseClient
            .from("receteler")
            .select("*")
            .eq(
                "id",
                detaydakiId
            )
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

        tarih.value =
            "";

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
        "Üretim ayarları da aktarıldı.\n" +
        "Kaydet'e basarak yeni reçete oluşturabilirsiniz."
    );
}


// ======================================================
// YAZDIR
// ======================================================

async function detayYazdir() {

    if (
        detaydakiId === null
    ) {

        alert(
            "Yazdırılacak reçete bulunamadı."
        );

        return;
    }


    const { data, error } =
        await window.supabaseClient
            .from("receteler")
            .select("*")
            .eq(
                "id",
                detaydakiId
            )
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


    const ayarlar =
        data.uretim_ayarlari || {};


    let ayarlarHtml = "";


    Object.keys(
        ayarlar
    ).forEach(
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
    margin-bottom: 30px;
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

window.onload = function () {

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
            .eq(
                "id",
                id
            );


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
        "tarih",
        "makine_adi",
        "hiz",
        "sicaklik",
        "basinc",
        "notlar"

    ];


    alanlar.forEach(
        function (id) {

            const input =
                document.getElementById(
                    id
                );


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


    const tarih =
        document.getElementById(
            "tarih"
        );


    if (tarih) {

        tarih.value =
            bugununTarihi();

    }


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
                        .includes(
                            kelime
                        )
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
