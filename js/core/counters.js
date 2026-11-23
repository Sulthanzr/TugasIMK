
/* ==================== RENDER PENGHITUNG GLOBAL ==================== */
function renderCounters() {
  const pemainAktif = state.players.filter((p) => p.status !== "Pulang");
  const menunggu = state.players.filter((p) => p.status === "Menunggu");
  const bermain = state.players.filter((p) => p.status === "Bermain");
  const istirahat = state.players.filter((p) => p.status === "Istirahat");
  const pulang = state.players.filter((p) => p.status === "Pulang");
  const lapanganAktif = state.courts.filter((c) => c.active).length;

  document.getElementById("topTotal").textContent = pemainAktif.length;
  document.getElementById("topWaiting").textContent = menunggu.length;
  document.getElementById("topPlaying").textContent = bermain.length;
  document.getElementById("topResting").textContent = istirahat.length;

  const badgeLive = document.getElementById("liveMatchBadge");
  badgeLive.style.display = lapanganAktif > 0 ? "inline-flex" : "none";

  const statusLapanganAtas = document.getElementById("topCourtStatus");
  if (lapanganAktif === 2) {
    statusLapanganAtas.textContent = "✓ Lapangan Terpakai 2/2 (Penuh)";
    statusLapanganAtas.classList.remove("available");
  } else if (lapanganAktif === 1) {
    statusLapanganAtas.textContent = "● Lapangan Terpakai 1/2 (Tersedia)";
    statusLapanganAtas.classList.add("available");
  } else {
    statusLapanganAtas.textContent = "● Lapangan Terpakai 0/2 (Kosong)";
    statusLapanganAtas.classList.add("available");
  }

  document.getElementById("kpiTotal").textContent = `${pemainAktif.length} Orang`;
  document.getElementById("kpiWaiting").textContent = `${menunggu.length} Pemain`;
  document.getElementById("kpiResting").textContent = `${istirahat.length} Pemain`;
  document.getElementById("kpiCourts").textContent = `${lapanganAktif} / 2 Lapangan`;
  document.getElementById("queueWaitingBadge").textContent = `Total ${menunggu.length} Pemain Dalam Daftar Tunggu`;

  document.getElementById("pillPlaying2").textContent = `▷ Bermain ${bermain.length}`;
  document.getElementById("pillWaiting2").textContent = `⏱ Menunggu ${menunggu.length}`;
  document.getElementById("pillResting2").textContent = `☕ Istirahat ${istirahat.length}`;

  document.getElementById("sessBadgeWaiting").textContent = `${menunggu.length} Menunggu`;
  document.getElementById("sessBadgeResting").textContent = `${istirahat.length} Istirahat`;
  document.getElementById("sessBadgeLeft").textContent = `${pulang.length} Pulang`;

  document.getElementById("mTabWaiting").textContent = `Menunggu ${menunggu.length}`;
  document.getElementById("mTabResting").textContent = `Istirahat ${istirahat.length}`;
  document.getElementById("mTabLeft").textContent = `Pulang ${pulang.length}`;
}

