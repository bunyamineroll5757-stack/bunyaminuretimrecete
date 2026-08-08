let secilenId = null;
let detaydakiId = null;


// ===============================
// LİSTELE
// ===============================

async function listele() {

    const liste = document.getElementById("liste");

    const { data, error } = await window.supabaseClient
        .from("receteler")
        .select("*")
        .order("id", { ascending: false });

    if (error) {
        console.error(error);
        alert("Listeleme hatası:\n" + error.message);
        return;
    }

    liste.innerHTML = "";

    data.forEach(function (r) {

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
        document.getElementById("toplamRecete");

    if (toplam) {
        toplam.innerText = data.length;
    }
}


// ===============================
// KAYDET
// ===============================

async function kaydet() {

    if (secilenId !== null) {
        await guncelle();
        return;
    }


    const urunAdi =
        document.getElementById("urun_adi").value.trim();

    if (urunAdi === "") {
        alert("Ürün adı boş bırakılamaz.");
        return;
    }


    let receteNo =
        document.getElementById("recete_no").value.trim();


    const makineAdi =
        document.getElementById("makine_adi").value.trim();

    const hiz =
        document.getElementById("hiz").value.trim();

    const sicaklik =
        document.getElementById("sicaklik").value.trim();

    const basinc =
        document.getElementById("basinc").value.trim();

    const notlar =
        document.getElementById("notlar").value.trim();


    // Otomatik reçete numarası
    if (receteNo === "") {

        const { data, error } =
            await window.supabaseClient
                .from("receteler")
                .select("recete_no")
                .order("id", { ascending: false })
                .limit(1);

        if (error) {
            alert(
                "Reçete numarası alınamadı:\n" +
                error.message
            );
            return;
        }


        let yeniNo = 1;


        if (data && data.length > 0) {

            const sonNo =
                data[0].recete_no || "";

            const sonuc =
                sonNo.match(/REC-(\d+)/i);

            if (sonuc) {
                yeniNo =
                    Number(sonuc[1]) + 1;
            }
        }


        receteNo =
            "REC-" +
            String(yeniNo).padStart(3, "0");
    }


    const veri = {

        recete_no: receteNo,

        urun_adi: urunAdi,

        makine_adi: makineAdi,

        hiz: hiz,

        sicaklik: sicaklik,

        basinc: basinc,

        notlar: notlar
    };


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


    alert("Reçete kaydedildi.");

    temizle();

    await listele();
}


// ===============================
// DETAY GÖSTER
// ===============================

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


    // Detay ID'sini sakla
    detaydakiId = id;


    // Bilgileri doldur

    document.getElementById(
        "detay_recete_no"
    ).innerText =
        data.recete_no || "-";


    document.getElementById(
        "detay_baslik_no"
    ).innerText =
        data.recete_no || "";


    document.getElementById(
        "detay_urun_adi"
    ).innerText =
        data.urun_adi || "-";


    document.getElementById(
        "detay_makine_adi"
    ).innerText =
        data.makine_adi || "-";


    document.getElementById(
        "detay_hiz"
    ).innerText =
        data.hiz || "-";


    document.getElementById(
        "detay_sicaklik"
    ).innerText =
        data.sicaklik || "-";


    document.getElementById(
        "detay_basinc"
    ).innerText =
        data.basinc || "-";


    document.getElementById(
        "detay_notlar"
    ).innerText =
        data.notlar || "Not yok";


    // Modalı aç

    const modal =
        document.getElementById("detayModal");


    if (!modal) {

        alert(
            "Detay penceresi bulunamadı."
        );

        return;
    }


    modal.style.display = "flex";
}


// ===============================
// DETAY KAPAT
// ===============================

function detayKapat() {

    const modal =
        document.getElementById("detayModal");


    if (modal) {

        modal.style.display = "none";

    }
}


// ===============================
// DETAYDAN DÜZENLE
// ===============================

async function detaydanDuzenle() {

    if (detaydakiId === null) {

        alert(
            "Düzenlenecek reçete bulunamadı."
        );

        return;
    }


    const id = detaydakiId;


    detayKapat();


    await duzenle(id);
}


// ===============================
// DETAYDAN KOPYALA
// ===============================

function detayKopyala() {

    const receteNo =
        document.getElementById(
            "detay_recete_no"
        ).innerText;


    const urunAdi =
        document.getElementById(
            "detay_urun_adi"
        ).innerText;


    const makineAdi =
        document.getElementById(
            "detay_makine_adi"
        ).innerText;


    const hiz =
        document.getElementById(
            "detay_hiz"
        ).innerText;


    const sicaklik =
        document.getElementById(
            "detay_sicaklik"
        ).innerText;


    const basinc =
        document.getElementById(
            "detay_basinc"
        ).innerText;


    const notlar =
        document.getElementById(
            "detay_notlar"
        ).innerText;


    // Forma aktar

    document.getElementById(
        "recete_no"
    ).value = "";


    document.getElementById(
        "urun_adi"
    ).value =
        urunAdi === "-"
            ? ""
            : urunAdi;


    document.getElementById(
        "makine_adi"
    ).value =
        makineAdi === "-"
            ? ""
            : makineAdi;


    document.getElementById(
        "hiz"
    ).value =
        hiz === "-"
            ? ""
            : hiz;


    document.getElementById(
        "sicaklik"
    ).value =
        sicaklik === "-"
            ? ""
            : sicaklik;


    document.getElementById(
        "basinc"
    ).value =
        basinc === "-"
            ? ""
            : basinc;


    document.getElementById(
        "notlar"
    ).value =
        notlar === "Not yok"
            ? ""
            : notlar;


    secilenId = null;


    document.getElementById(
        "kaydetBtn"
    ).innerText =
        "Kaydet";


    detayKapat();


    document.getElementById(
        "urun_adi"
    ).focus();


    alert(
        "Reçete kopyalandı.\n\n" +
        "Bilgiler forma aktarıldı.\n" +
        "Yeni reçete olarak kaydetmek için Kaydet'e basın."
    );
}


// ===============================
// YAZDIR
// ===============================

function detayYazdir() {

    const receteNo =
        document.getElementById(
            "detay_recete_no"
        ).innerText;


    const urunAdi =
        document.getElementById(
            "detay_urun_adi"
        ).innerText;


    const makineAdi =
        document.getElementById(
            "detay_makine_adi"
        ).innerText;


    const hiz =
        document.getElementById(
            "detay_hiz"
        ).innerText;


    const sicaklik =
        document.getElementById(
            "detay_sicaklik"
        ).innerText;


    const basinc =
        document.getElementById(
            "detay_basinc"
        ).innerText;


    const notlar =
        document.getElementById(
            "detay_notlar"
        ).innerText;


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


<h1>
    Üretim Reçetesi
</h1>


<div class="bilgi">

<span class="etiket">
Reçete No
</span>

${receteNo}

</div>


<div class="bilgi">

<span class="etiket">
Ürün Adı
</span>

${urunAdi}

</div>


<div class="bilgi">

<span class="etiket">
Makine Adı
</span>

${makineAdi}

</div>


<div class="bilgi">

<span class="etiket">
Hız
</span>

${hiz}

</div>


<div class="bilgi">

<span class="etiket">
Sıcaklık
</span>

${sicaklik}

</div>


<div class="bilgi">

<span class="etiket">
Basınç
</span>

${basinc}

</div>


<div class="bilgi notlar">

<span class="etiket">
Notlar
</span>

${notlar}

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


// ===============================
// DÜZENLE
// ===============================

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


    document.getElementById(
        "recete_no"
    ).value =
        data.recete_no || "";


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


    document.getElementById(
        "kaydetBtn"
    ).innerText =
        "Güncelle";


    document.getElementById(
        "urun_adi"
    ).focus();
}


// ===============================
// GÜNCELLE
// ===============================

async function guncelle() {

    if (secilenId === null) {

        alert(
            "Önce düzenlenecek reçeteyi seçin."
        );

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


    const veri = {

        recete_no:
            document.getElementById(
                "recete_no"
            ).value.trim(),

        urun_adi:
            document.getElementById(
                "urun_adi"
            ).value.trim(),

        makine_adi:
            document.getElementById(
                "makine_adi"
            ).value.trim(),

        hiz:
            document.getElementById(
                "hiz"
            ).value.trim(),

        sicaklik:
            document.getElementById(
                "sicaklik"
            ).value.trim(),

        basinc:
            document.getElementById(
                "basinc"
            ).value.trim(),

        notlar:
            document.getElementById(
                "notlar"
            ).value.trim()

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
        "Reçete güncellendi."
    );


    temizle();

    await listele();
}


// ===============================
// SİL
// ===============================

async function sil(id) {

    if (
        !confirm(
            "Bu reçete silinsin mi?"
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


// ===============================
// TEMİZLE
// ===============================

function temizle() {

    secilenId = null;


    document.getElementById(
        "recete_no"
    ).value = "";


    document.getElementById(
        "urun_adi"
    ).value = "";


    document.getElementById(
        "makine_adi"
    ).value = "";


    document.getElementById(
        "hiz"
    ).value = "";


    document.getElementById(
        "sicaklik"
    ).value = "";


    document.getElementById(
        "basinc"
    ).value = "";


    document.getElementById(
        "notlar"
    ).value = "";


    document.getElementById(
        "kaydetBtn"
    ).innerText =
        "Kaydet";
}


// ===============================
// YENİ REÇETE
// ===============================

function yeniRecete() {

    temizle();


    document.getElementById(
        "urun_adi"
    ).focus();
}


// ===============================
// ARAMA
// ===============================

function ara() {

    const arama =
        document.getElementById(
            "arama"
        );


    if (!arama) {
        return;
    }


    const kelime =
        arama.value.toLowerCase();


    document
        .querySelectorAll(
            "#liste tr"
        )
        .forEach(function(satir) {

            if (
                satir.innerText
                    .toLowerCase()
                    .includes(kelime)
            ) {

                satir.style.display = "";

            } else {

                satir.style.display = "none";

            }

        });
}


// ===============================
// ESC İLE DETAYI KAPAT
// ===============================

document.addEventListener(
    "keydown",
    function(event) {

        if (event.key === "Escape") {

            detayKapat();

        }

    }
);


// ===============================
// SAYFA AÇILIŞI
// ===============================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        listele();


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
