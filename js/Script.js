// ==========================================
// KÜRESEL DEĞİŞKENLER VE İLKLENDİRME
// ==========================================
window.tumReceteler = [];
window.tumBakimlar = [];

// Supabase İstemcisini Getir
function getSupabase() {
    return window.sbClient || (typeof supabase !== 'undefined' ? supabase : null);
}

// Sayfa Yüklendiğinde
document.addEventListener('DOMContentLoaded', function () {
    receteleriYukle();
    bakimYukle();
    
    // Bugünün tarihini varsayılan yap
    const bugün = new Date().toISOString().split('T')[0];
    const tarihInput = document.getElementById('u_tarih') || document.getElementById('bakim_tarih');
    if (tarihInput) tarihInput.value = bugün;
});

// ==========================================
// REÇETE İŞLEMLERİ & ÜRETİM AYARLARI
// ==========================================

// 1. REÇETE KAYDET
async function receteKaydet() {
    const db = getSupabase();
    if (!db) {
        alert("Supabase bağlantısı bulunamadı!");
        return;
    }

    // Üst Form Inputları
    const receteNo = document.getElementById('recete_no')?.value || '';
    const urunAdi = document.getElementById('urun_adi')?.value || '';
    const makineAdi = document.getElementById('makine_adi')?.value || '';
    const hiz = document.getElementById('hiz')?.value || '';
    const sicaklik = document.getElementById('sicaklik')?.value || '';
    const basinc = document.getElementById('basinc')?.value || '';
    const notlar = document.getElementById('notlar')?.value || '';

    // Üretim Ayarları Tablosu Inputları (Alt Yeşil Tablo)
    const gram = document.getElementById('u_gram')?.value || '';
    const renk = document.getElementById('u_renk')?.value || '';
    const tarih = document.getElementById('u_tarih')?.value || new Date().toISOString();

    if (!receteNo || !urunAdi) {
        alert("Lütfen en azından Reçete No ve Ürün Adı alanlarını doldurunuz!");
        return;
    }

    const yeniRecete = {
        recete_no: receteNo,
        urun_adi: urunAdi,
        makine: makineAdi,
        hiz: hiz,
        sicaklik: sicaklik,
        basinc: basinc,
        notlar: notlar,
        gram: gram,
        renk: renk,
        tarih: tarih
    };

    try {
        const { error } = await db
            .from('receteler')
            .insert([yeniRecete]);

        if (error) {
            alert("Kayıt oluşturulurken hata: " + error.message);
        } else {
            alert("Reçete başarıyla kaydedildi.");
            receteFormTemizle();
            receteleriYukle();
        }
    } catch (err) {
        alert("Bağlantı hatası: " + err.message);
    }
}

// 2. REÇETELERİ YÜKLE VE LİSTELE
async function receteleriYukle() {
    const db = getSupabase();
    if (!db) return;

    try {
        const { data, error } = await db
            .from('receteler')
            .select('*')
            .order('id', { ascending: false });

        if (error) {
            console.error("Reçeteler çekilemedi:", error.message);
            return;
        }

        window.tumReceteler = data || [];
        receteTablosuCiz(window.tumReceteler);
    } catch (err) {
        console.error("Hata:", err);
    }
}

function receteTablosuCiz(veri) {
    const tbody = document.getElementById('receteListe');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (!veri || veri.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Kayıtlı reçete verisi bulunamadı.</td></tr>';
        return;
    }

    veri.forEach((item, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${item.recete_no || '-'}</strong></td>
            <td>${item.urun_adi || '-'}</td>
            <td>${item.makine || '-'}</td>
            <td>${item.hiz || '-'}</td>
            <td>${item.sicaklik || '-'}</td>
            <td>${item.basinc || '-'}</td>
            <td>
                <button class="btn" style="padding: 4px 8px; font-size: 11px;" onclick="receteDoldur(${index})">Yükle</button>
                <button class="btn-danger" style="padding: 4px 8px; font-size: 11px;" onclick="receteSil('${item.id}')">Sil</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// 3. SEÇİLEN REÇETEYİ FORMA / TABLOYA DOLDURMA
function receteDoldur(index) {
    const r = window.tumReceteler[index];
    if (!r) return;

    const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };

    setVal('recete_no', r.recete_no);
    setVal('urun_adi', r.urun_adi);
    setVal('makine_adi', r.makine);
    setVal('hiz', r.hiz);
    setVal('sicaklik', r.sicaklik);
    setVal('basinc', r.basinc);
    setVal('notlar', r.notlar);

    // Üretim Ayarları Yeşil Tablosunu Doldur
    setVal('u_gram', r.gram);
    setVal('u_renk', r.renk);
    setVal('u_tarih', r.tarih ? r.tarih.split('T')[0] : '');
}

// 4. REÇETE FORM TEMİZLE
function receteFormTemizle() {
    const ids = ['recete_no', 'urun_adi', 'makine_adi', 'hiz', 'sicaklik', 'basinc', 'notlar', 'u_gram', 'u_renk'];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
}

// 5. REÇETE SİL
async function receteSil(id) {
    if (!confirm("Bu reçeteyi silmek istediğinize emin misiniz?")) return;
    const db = getSupabase();
    if (!db) return;

    const { error } = await db.from('receteler').delete().eq('id', id);
    if (error) alert("Silme hatası: " + error.message);
    else receteleriYukle();
}

// ==========================================
// BAKIM & ONARIM İŞLEMLERİ
// ==========================================

async function bakimYukle() {
    const db = getSupabase();
    if (!db) return;

    try {
        const { data, error } = await db
            .from('bakimlar')
            .select('*')
            .order('id', { ascending: false });

        if (error) {
            console.error("Bakım yükleme hatası:", error.message);
            return;
        }

        window.tumBakimlar = data || [];
        bakimListele(window.tumBakimlar);
    } catch (err) {
        console.error("Hata:", err);
    }
}

function bakimListele(veri) {
    const liste = document.getElementById('bakimListe');
    if (!liste) return;

    liste.innerHTML = '';

    if (!veri || veri.length === 0) {
        liste.innerHTML = '<tr><td colspan="6" style="text-align:center;">Kayıtlı bakım bulunamadı.</td></tr>';
        return;
    }

    veri.forEach((item, index) => {
        const tr = document.createElement('tr');
        const tarihFormatted = item.tarih ? item.tarih.replace('T', ' ') : '-';

        tr.innerHTML = `
            <td>${tarihFormatted}</td>
            <td><strong>${item.makine || '-'}</strong></td>
            <td>${item.tip || '-'}</td>
            <td>${item.personel || '-'}</td>
            <td><span class="durum-etiket">${item.durum || '-'}</span></td>
            <td>
                <button class="btn" style="padding: 4px 8px; font-size: 11px;" onclick="bakimDetayGoster(${index})">Detay</button>
                <button class="btn-danger" style="padding: 4px 8px; font-size: 11px;" onclick="bakimSil('${item.id}')">Sil</button>
            </td>
        `;
        liste.appendChild(tr);
    });
}

async function bakimKaydet() {
    const db = getSupabase();
    if (!db) return;

    const yeniBakim = {
        tarih: document.getElementById('bakim_tarih')?.value || new Date().toISOString(),
        makine: document.getElementById('bakim_makine')?.value || '',
        tip: document.getElementById('bakim_tipi')?.value || '',
        personel: document.getElementById('bakim_personel')?.value || '',
        durum: document.getElementById('bakim_durumu')?.value || '',
        parca: document.getElementById('bakim_parca')?.value || '',
        aciklama: document.getElementById('bakim_aciklama')?.value || ''
    };

    if (!yeniBakim.makine) {
        alert("Lütfen makine / ekipman adını giriniz!");
        return;
    }

    const { error } = await db.from('bakimlar').insert([yeniBakim]);

    if (error) {
        alert("Kayıt hatası: " + error.message);
    } else {
        alert("Bakım kaydı başarıyla eklendi.");
        bakimFormTemizle();
        bakimYukle();
    }
}

async function bakimSil(id) {
    if (!confirm("Bu bakım kaydını silmek istediğinize emin misiniz?")) return;
    const db = getSupabase();
    if (!db) return;

    const { error } = await db.from('bakimlar').delete().eq('id', id);
    if (error) alert("Silme hatası: " + error.message);
    else bakimYukle();
}

function bakimFormTemizle() {
    ['bakim_tarih', 'bakim_makine', 'bakim_personel', 'bakim_parca', 'bakim_aciklama'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    const t = document.getElementById('bakim_tipi'); if (t) t.selectedIndex = 0;
    const d = document.getElementById('bakim_durumu'); if (d) d.selectedIndex = 0;
}

function bakimDetayGoster(index) {
    const bakim = window.tumBakimlar ? window.tumBakimlar[index] : null;
    if (!bakim) return;

    const icerik = document.getElementById('bakimDetayIcerik');
    if (!icerik) return;

    icerik.innerHTML = `
        <table class="excel-table" style="width: 100%; margin-top: 10px;">
            <tr><td class="label">Tarih & Saat:</td><td><strong>${bakim.tarih || '-'}</strong></td></tr>
            <tr><td class="label">Makine / Ekipman:</td><td><strong>${bakim.makine || '-'}</strong></td></tr>
            <tr><td class="label">Bakım Tipi:</td><td>${bakim.tip || '-'}</td></tr>
            <tr><td class="label">Personel:</td><td>${bakim.personel || '-'}</td></tr>
            <tr><td class="label">Durum:</td><td><strong>${bakim.durum || '-'}</strong></td></tr>
            <tr><td class="label">Değişen Parça:</td><td>${bakim.parca || 'Yok / Belirtilmedi'}</td></tr>
            <tr><td class="label">Açıklama:</td><td style="text-align:left;">${bakim.aciklama || 'Açıklama yok.'}</td></tr>
        </table>
    `;

    const modal = document.getElementById('bakimDetayModal');
    if (modal) modal.style.display = 'flex';
}

function bakimModalKapat() {
    const modal = document.getElementById('bakimDetayModal');
    if (modal) modal.style.display = 'none';
}

// Sekmeler Arası Geçiş (Reçete <-> Bakım)
function sekmeDegistir(sekme) {
    const receteSec = document.getElementById('secenekRecete');
    const bakimSec = document.getElementById('secenekBakim');

    if (sekme === 'recete') {
        if (receteSec) receteSec.style.display = 'block';
        if (bakimSec) bakimSec.style.display = 'none';
    } else {
        if (receteSec) receteSec.style.display = 'none';
        if (bakimSec) bakimSec.style.display = 'block';
    }
}
