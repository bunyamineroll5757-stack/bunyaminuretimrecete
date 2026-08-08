const sbClient = window.supabaseClient || window.supabase;
let mevcutReceteId = null;

document.addEventListener("DOMContentLoaded", () => {
    receteleriListele();
    otomatikReceteNoOlustur();

    document.getElementById("kaydetBtn").addEventListener("click", receteKaydet);
    document.getElementById("yeniReceteBtn").addEventListener("click", formuTemizle);
    document.getElementById("arama").addEventListener("input", (e) => receteleriListele(e.target.value));
});

async function otomatikReceteNoOlustur() {
    const { data } = await sbClient.from("receteler").select("no").order("id", { ascending: false }).limit(1);
    const receteNoInput = document.getElementById("recete_no");
    
    if (!data || data.length === 0) {
        receteNoInput.value = "REC-001";
    } else {
        const sonNo = data[0].no;
        const sayi = parseInt(sonNo.replace("REC-", ""), 10) + 1;
        receteNoInput.value = "REC-" + String(sayi).padStart(3, "0");
    }
}

function formuTemizle() {
    mevcutReceteId = null;
    document.getElementById("urun_adi").value = "";
    otomatikReceteNoOlustur();
}

async function receteKaydet() {
    const no = document.getElementById("recete_no").value;
    const urun = document.getElementById("urun_adi").value;
    const tarih = new Date().toISOString().split("T")[0];

    if (!urun) { alert("Ürün adı boş olamaz!"); return; }

    const payload = { no, urun, tarih };

    let error;
    if (mevcutReceteId) {
        ({ error } = await sbClient.from("receteler").update(payload).eq("id", mevcutReceteId));
    } else {
        ({ error } = await sbClient.from("receteler").insert([payload]));
    }

    if (error) { alert("Hata: " + error.message); }
    else { alert("İşlem Başarılı!"); formuTemizle(); receteleriListele(); }
}

async function receteleriListele(arama = "") {
    let query = sbClient.from("receteler").select("*").order("id", { ascending: false });
    if (arama) query = query.or(`urun.ilike.%${arama}%,no.ilike.%${arama}%`);

    const { data } = await query;
    const listeEl = document.getElementById("liste");
    document.getElementById("toplamRecete").innerText = data ? data.length : 0;

    if (!data || data.length === 0) { listeEl.innerHTML = "<tr><td colspan='4'>Kayıt bulunamadı.</td></tr>"; return; }

    listeEl.innerHTML = data.map(item => `
        <tr>
            <td>${item.no}</td>
            <td>${item.urun}</td>
            <td>${item.tarih}</td>
            <td>
                <button onclick="receteDuzenle(${item.id})">Düzenle</button>
                <button class="sil-btn" onclick="receteSil(${item.id})">Sil</button>
            </td>
        </tr>
    `).join("");
}

async function receteDuzenle(id) {
    const { data } = await sbClient.from("receteler").select("*").eq("id", id).single();
    if (data) {
        mevcutReceteId = data.id;
        document.getElementById("recete_no").value = data.no;
        document.getElementById("urun_adi").value = data.urun;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

async function receteSil(id) {
    if (confirm("Silmek istediğinize emin misiniz?")) {
        await sbClient.from("receteler").delete().eq("id", id);
        receteleriListele();
    }
}
