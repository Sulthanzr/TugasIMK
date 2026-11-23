document.addEventListener("DOMContentLoaded", () => {
  /* --- ALUR LOGIN & LOGOUT --- */
  const loginScreen = document.getElementById("loginScreen");
  const appShell = document.getElementById("appShell");
  const welcomeModal = document.getElementById("welcomeModal");
  const passwordInput = document.getElementById("loginPassword");
  const eyeIcon = document.getElementById("eyeIcon");

  // Tombol tampilkan/sembunyikan password pada halaman login
  document.getElementById("btnTogglePassword").addEventListener("click", () => {
    const tersembunyi = passwordInput.type === "password";
    passwordInput.type = tersembunyi ? "text" : "password";
    eyeIcon.innerHTML = tersembunyi
      ? `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>`
      : `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`;
  });

  // Proses masuk ke dashboard dengan pop-up animasi centang melingkar
  document.getElementById("loginForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const userVal = document.getElementById("loginUsername").value.trim();
    const passVal = passwordInput.value.trim();

    if (!userVal || !passVal) {
      showToast("Mohon lengkapi username dan password.");
      return;
    }

    // Ulangi animasi SVG centang melingkar setiap kali pop-up ditampilkan
    const checkWrap = welcomeModal.querySelector(".check-anim-wrap");
    checkWrap.innerHTML = checkWrap.innerHTML;
    welcomeModal.classList.add("open");

    setTimeout(() => {
      welcomeModal.classList.remove("open");
      loginScreen.classList.add("hidden");
      appShell.classList.add("visible");
      switchView("dashboard");
      requestAnimationFrame(perbaruiIndikatorNav);
    }, 1450);
  });

  // Popover profil admin (Reset Data & Logout)
  const btnAdmin = document.getElementById("btnAdminInfo");
  const adminPopover = document.getElementById("adminPopover");

  btnAdmin.addEventListener("click", (e) => {
    e.stopPropagation();
    const terbuka = adminPopover.classList.toggle("open");
    btnAdmin.setAttribute("aria-expanded", String(terbuka));
  });

  document.addEventListener("click", (e) => {
    if (!adminPopover.contains(e.target) && e.target !== btnAdmin) {
      adminPopover.classList.remove("open");
      btnAdmin.setAttribute("aria-expanded", "false");
    }
  });

  document.getElementById("btnResetData").addEventListener("click", () => {
    adminPopover.classList.remove("open");
    resetSemuaData();
  });

  document.getElementById("btnLogout").addEventListener("click", () => {
    adminPopover.classList.remove("open");
    simpanKePenyimpanan();
    appShell.classList.remove("visible");
    loginScreen.classList.remove("hidden");
    showToast("Anda berhasil keluar. Seluruh data tetap tersimpan.");
  });

});
