document.addEventListener("DOMContentLoaded", () => {
  /* --- TAB SESI PEMAIN (DESKTOP & MOBILE) --- */
  document.querySelectorAll("#sessionTabs .seg-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#sessionTabs .seg-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      state.mobileSessionTab = btn.dataset.stab;
      renderSessionsView();
    });
  });

});
