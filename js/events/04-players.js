document.addEventListener("DOMContentLoaded", () => {
  /* --- MANAJEMEN DATA PEMAIN --- */
  document.getElementById("searchPlayerInput").addEventListener("input", (e) => {
    state.playerSearch = e.target.value;
    state.playerPage = 1;
    renderPlayersView();
  });

  document.querySelectorAll("#levelFilterSeg .seg-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#levelFilterSeg .seg-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      state.playerLevelFilter = btn.dataset.level;
      state.playerPage = 1;
      renderPlayersView();
    });
  });

  // Tombol tampilkan/sembunyikan formulir tambah pemain di mobile
  const addCard = document.getElementById("addPlayerCard");
  addCard.classList.add("mobile-hidden");
  document.getElementById("btnMobileToggleAdd").addEventListener("click", () => {
    addCard.classList.toggle("mobile-hidden");
    if (!addCard.classList.contains("mobile-hidden")) {
      addCard.scrollIntoView({ behavior: "smooth" });
      document.getElementById("newPlayerName").focus();
    }
  });

  // Pilihan jenis kelamin & level pada formulir daftar pemain baru
  let jenisKelaminBaru = "L";
  let levelBaru = "B";
  document.querySelectorAll("#newGenderSeg .seg-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#newGenderSeg .seg-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      jenisKelaminBaru = btn.dataset.value;
    });
  });
  document.querySelectorAll("#newLevelSeg .seg-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#newLevelSeg .seg-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      levelBaru = btn.dataset.value;
    });
  });

  // Simpan pendaftaran pemain baru
  document.getElementById("addPlayerForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const inputNama = document.getElementById("newPlayerName");
    const nama = inputNama.value.trim();
    if (!nama) return;

    const idBaru = state.nextPlayerId++;
    state.players.push({
      id: idBaru,
      name: nama,
      gender: jenisKelaminBaru,
      level: levelBaru,
      status: "Menunggu",
      games: 0,
      joinedAt: Date.now(),
    });

    inputNama.value = "";
    simpanKePenyimpanan();
    showToast(`${nama} (Level ${levelBaru}) berhasil didaftarkan ke daftar tunggu.`);
    renderAll();
  });

  document.getElementById("btnResetAddForm").addEventListener("click", () => {
    document.getElementById("newPlayerName").value = "";
    addCard.classList.add("mobile-hidden");
  });

  // Aksi ubah level pemain (Pop-up Modal)
  document.querySelectorAll("#editLevelSeg .seg-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.selectedEditNewLevel = btn.dataset.value;
      renderEditLevelCard();
    });
  });

  document.getElementById("btnSaveLevel").addEventListener("click", () => {
    const p = getPlayer(state.selectedEditPlayerId);
    if (!p) return;
    if (p.level === state.selectedEditNewLevel) {
      showToast(`Level ${p.name} masih tetap Level ${p.level}.`);
      return;
    }
    const levelLama = p.level;
    p.level = state.selectedEditNewLevel;
    simpanKePenyimpanan();
    tutupModalEditLevel();
    showToast(`Level ${p.name} diperbarui dari Level ${levelLama} ke Level ${p.level}.`);
    renderAll();
  });

  document.getElementById("btnCancelLevel").addEventListener("click", tutupModalEditLevel);
  document.getElementById("btnCloseEditLevelModal").addEventListener("click", tutupModalEditLevel);

  // Tutup pop-up jika mengklik area gelap di luar kotak dialog
  document.getElementById("editLevelModal").addEventListener("click", (e) => {
    if (e.target.id === "editLevelModal") tutupModalEditLevel();
  });

});
