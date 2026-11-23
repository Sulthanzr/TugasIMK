/* ==================== KONSTANTA PENYIMPANAN & URUTAN LAYAR ==================== */
const STORAGE_KEY = "smashqueue_pro_data_v1";
const VIEW_ORDER = ["dashboard", "players", "generator", "sessions", "payment"];

/* ==================== FUNGSI MEMBUAT STATE AWAL KOSONG ==================== */
function buatStateKosong() {
  return {
    currentView: "dashboard",
    autoRotate: true,
    matchCounter: 0,
    nextPlayerId: 1,
    selectedEditPlayerId: null,
    selectedEditNewLevel: "B",
    playerSearch: "",
    playerLevelFilter: "ALL",
    playerPage: 1,
    playersPerPage: 8,
    waitingSessionPage: 1,
    mobileSessionTab: "waiting",
    paymentSelectedPlayerId: null,
    paymentMethod: "QRIS",
    genParams: {
      prioritizeZeroGame: true,
      balanceLevel: true,
      applyPairRequest: true,
      courtAllocation: "auto",
    },
    pairRequests: [],
    genDirty: false,
    swapMatchIndex: null,

    // Daftar pemain diawali kosong tanpa data dummy
    players: [],

    // Kondisi awal dua lapangan dalam keadaan kosong
    courts: [
      {
        id: 1,
        name: "Lapangan 1 (Court Karpet Hijau)",
        shortName: "Lapangan 1",
        matchNo: 0,
        category: "Belum ada pertandingan",
        active: false,
        elapsedSec: 0,
        team1Label: "TIM ALPHA (BIRU)",
        team2Label: "TIM BETA (MERAH)",
        team1: [],
        team2: [],
      },
      {
        id: 2,
        name: "Lapangan 2 (Court Parquet Kayu)",
        shortName: "Lapangan 2",
        matchNo: 0,
        category: "Belum ada pertandingan",
        active: false,
        elapsedSec: 0,
        team1Label: "PASANGAN 1",
        team2Label: "PASANGAN 2",
        team1: [],
        team2: [],
      },
    ],

    // Antrean aktif, pratinjau generator, dan riwayat pembayaran diawali kosong
    upNextQueue: [],
    genPreview: [],
    paymentHistory: [],
  };
}

let state = buatStateKosong();

/* ==================== PENYIMPANAN OTOMATIS LOCALSTORAGE ==================== */
// Menyimpan seluruh data operasional ke browser agar tidak hilang saat logout atau refresh
function simpanKePenyimpanan() {
  try {
    const dataSimpan = {
      autoRotate: state.autoRotate,
      matchCounter: state.matchCounter,
      nextPlayerId: state.nextPlayerId,
      genParams: state.genParams,
      pairRequests: state.pairRequests,
      genDirty: state.genDirty,
      players: state.players,
      courts: state.courts,
      upNextQueue: state.upNextQueue,
      genPreview: state.genPreview,
      paymentHistory: state.paymentHistory,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataSimpan));
  } catch (err) {
    // Abaikan jika browser membatasi akses localStorage
  }
}

// Memuat data tersimpan dari browser saat aplikasi dibuka
function muatDariPenyimpanan() {
  try {
    const mentah = localStorage.getItem(STORAGE_KEY);
    if (!mentah) return;
    const data = JSON.parse(mentah);
    if (Array.isArray(data.players)) state.players = data.players;
    if (Array.isArray(data.courts) && data.courts.length === 2) state.courts = data.courts;
    if (Array.isArray(data.upNextQueue)) state.upNextQueue = data.upNextQueue;
    if (Array.isArray(data.genPreview)) state.genPreview = data.genPreview;
    if (Array.isArray(data.paymentHistory)) state.paymentHistory = data.paymentHistory;
    if (Array.isArray(data.pairRequests)) state.pairRequests = data.pairRequests;
    if (typeof data.autoRotate === "boolean") state.autoRotate = data.autoRotate;
    if (typeof data.matchCounter === "number") state.matchCounter = data.matchCounter;
    if (typeof data.nextPlayerId === "number") state.nextPlayerId = data.nextPlayerId;
    if (typeof data.genDirty === "boolean") state.genDirty = data.genDirty;
    if (data.genParams) state.genParams = { ...state.genParams, ...data.genParams };
  } catch (err) {
    // Jika data rusak, gunakan state kosong
  }
}

// Menghapus seluruh data tersimpan dan mengembalikan aplikasi ke kondisi awal kosong
function resetSemuaData() {
  if (!confirm("Hapus seluruh data pemain, pertandingan, antrean, dan riwayat pembayaran?")) {
    return;
  }
  localStorage.removeItem(STORAGE_KEY);
  state = buatStateKosong();
  sinkronkanKontrolParameter();
  showToast("Seluruh data berhasil direset ke kondisi kosong.");
  renderAll();
}

