/* ==================== FUNGSI BANTUAN ==================== */
const getPlayer = (id) => state.players.find((p) => p.id === id);

// Mengambil maksimal 2 huruf inisial dari nama pemain
const getInitials = (name) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((kata) => kata[0]?.toUpperCase() || "")
    .join("");

// Memformat durasi pertandingan dalam format MM : DD
const formatDurationSec = (detik) => {
  const m = String(Math.floor(detik / 60)).padStart(2, "0");
  const d = String(detik % 60).padStart(2, "0");
  return `${m} : ${d}`;
};

// Menghitung durasi sesi sejak pemain didaftarkan (JJ:MM)
const formatSessionDuration = (joinedAt) => {
  const totalMenit = Math.max(1, Math.floor((Date.now() - joinedAt) / 60000));
  const jam = String(Math.floor(totalMenit / 60)).padStart(2, "0");
  const menit = String(totalMenit % 60).padStart(2, "0");
  return `${jam}:${menit}`;
};

// Menghitung biaya sesi dasar Rp25.000 ditambah Rp5.000 per game
const calcFee = (jumlahGame) => 25000 + jumlahGame * 5000;

// Memformat angka menjadi format mata uang Rupiah
const formatRupiah = (nominal) =>
  "Rp " + Number(nominal).toLocaleString("id-ID");

// Mengonversi huruf level ke nilai angka untuk perhitungan keseimbangan
const levelScore = (lvl) => ({ A: 3, B: 2, C: 1 }[lvl] || 2);

// Menganalisis kategori pertandingan (MD/WD/XD) dan skor keseimbangan tim
function analyzeMatch(team1Ids, team2Ids) {
  const t1 = team1Ids.map(getPlayer).filter(Boolean);
  const t2 = team2Ids.map(getPlayer).filter(Boolean);
  const semua = [...t1, ...t2];
  const semuaPutra = semua.every((p) => p.gender === "L");
  const semuaPutri = semua.every((p) => p.gender === "P");

  let kode = "XD";
  let judul = "Ganda Campuran (XD)";
  if (semuaPutra) {
    kode = "MD";
    judul = "Ganda Putra (MD)";
  } else if (semuaPutri) {
    kode = "WD";
    judul = "Ganda Putri (WD)";
  }

  const skor1 = t1.reduce((acc, p) => acc + levelScore(p.level), 0);
  const skor2 = t2.reduce((acc, p) => acc + levelScore(p.level), 0);
  const selisih = Math.abs(skor1 - skor2);
  const balance = Math.max(76, 98 - selisih * 6);
  const rataRata = (skor1 + skor2) / 4;
  const labelLevel = rataRata >= 2.6 ? "Level A" : rataRata >= 1.6 ? "Level B" : "Level C";

  return {
    categoryCode: kode,
    categoryLabel: `${judul} • ${labelLevel}`,
    fullCategory:
      kode === "MD"
        ? "Ganda Putra (Men's Doubles)"
        : kode === "WD"
        ? "Ganda Putri (Women's Doubles)"
        : "Ganda Campuran (Mixed Doubles)",
    balance,
  };
}

// Menampilkan notifikasi toast singkat di sudut layar
function showToast(pesan) {
  const container = document.getElementById("toastContainer");
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = pesan;
  container.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

