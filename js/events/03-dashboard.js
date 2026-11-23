document.addEventListener("DOMContentLoaded", () => {
  /* --- SAKELAR AUTO-ROTATE --- */
  document.getElementById("btnAutoRotate").addEventListener("click", function () {
    state.autoRotate = !state.autoRotate;
    this.classList.toggle("active", state.autoRotate);
    simpanKePenyimpanan();
    showToast(`Auto-Rotate ${state.autoRotate ? "diaktifkan" : "dinonaktifkan"}.`);
  });

});
