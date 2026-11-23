document.addEventListener("DOMContentLoaded", () => {
  /* --- NAVIGASI UTAMA --- */
  document.querySelectorAll(".nav-pill, .mnav-btn").forEach((btn) => {
    btn.addEventListener("click", () => switchView(btn.dataset.view));
  });

  document.querySelectorAll("[data-goto]").forEach((btn) => {
    btn.addEventListener("click", () => switchView(btn.dataset.goto));
  });

  window.addEventListener("resize", () => requestAnimationFrame(perbaruiIndikatorNav));

});
