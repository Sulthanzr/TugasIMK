document.addEventListener("DOMContentLoaded", () => {
  /* --- JAM REAL-TIME WIB & TIMER LAPANGAN --- */
  let hitunganSimpanTimer = 0;

  const perbaruiWaktu = () => {
    const sekarang = new Date();
    const teksJam = sekarang
      .toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      })
      .replace(/\./g, ":");
    const clockEl = document.getElementById("liveClock");
    if (clockEl) clockEl.textContent = `${teksJam} WIB`;
  };

  perbaruiWaktu();
  setInterval(() => {
    perbaruiWaktu();
    let adaTimerAktif = false;
    state.courts.forEach((c) => {
      if (c.active) {
        c.elapsedSec += 1;
        adaTimerAktif = true;
        const tEl = document.getElementById(`courtTimer-${c.id}`);
        if (tEl) tEl.textContent = formatDurationSec(c.elapsedSec);
      }
    });

    // Simpan progres timer lapangan ke localStorage tiap 5 detik
    if (adaTimerAktif) {
      hitunganSimpanTimer += 1;
      if (hitunganSimpanTimer >= 5) {
        hitunganSimpanTimer = 0;
        simpanKePenyimpanan();
      }
    }
  }, 1000);

});
