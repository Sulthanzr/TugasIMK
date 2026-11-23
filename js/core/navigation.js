/* ==================== NAVIGASI HALUS & INDIKATOR BERGESER ==================== */
function perbaruiIndikatorNav() {
  // Indikator putih bergeser pada navigasi desktop
  const navAktif = document.querySelector("#desktopNav .nav-pill.active");
  const indikatorDesktop = document.getElementById("navIndicator");
  if (navAktif && indikatorDesktop && navAktif.offsetWidth > 0) {
    indikatorDesktop.style.width = `${navAktif.offsetWidth}px`;
    indikatorDesktop.style.transform = `translateX(${navAktif.offsetLeft}px)`;
  }

  // Indikator biru lembut bergeser pada navigasi bawah mobile
  const mnavAktif = document.querySelector("#mobileBottomNav .mnav-btn.active");
  const indikatorMobile = document.getElementById("mnavIndicator");
  if (mnavAktif && indikatorMobile && mnavAktif.offsetWidth > 0) {
    indikatorMobile.style.width = `${mnavAktif.offsetWidth}px`;
    indikatorMobile.style.transform = `translateX(${mnavAktif.offsetLeft}px)`;
  }
}

function switchView(namaLayar) {
  const indeksLama = VIEW_ORDER.indexOf(state.currentView);
  const indeksBaru = VIEW_ORDER.indexOf(namaLayar);
  const kelasArah = indeksBaru >= indeksLama ? "slide-from-right" : "slide-from-left";

  state.currentView = namaLayar;

  document.querySelectorAll(".view-section").forEach((sec) => {
    sec.classList.remove("active", "slide-from-right", "slide-from-left");
    if (sec.id === `view-${namaLayar}`) {
      sec.classList.add("active");
      // Paksa reflow agar animasi geser berjalan mulus tiap perpindahan
      void sec.offsetWidth;
      sec.classList.add(kelasArah);
    }
  });

  document.querySelectorAll(".nav-pill, .mnav-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.view === namaLayar);
  });

  requestAnimationFrame(perbaruiIndikatorNav);
  window.scrollTo({ top: 0, behavior: "smooth" });
  renderAll();
}

