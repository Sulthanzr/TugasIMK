document.addEventListener("DOMContentLoaded", () => {
  /* --- GENERATOR ANTREAN --- */
  document.getElementById("btnGenerateQueue").addEventListener("click", generatePreviewMatches);

  document.getElementById("btnApplyGen").addEventListener("click", () => {
    state.upNextQueue = JSON.parse(JSON.stringify(state.genPreview));
    state.genDirty = false;
    simpanKePenyimpanan();
    showToast("Pratinjau pertandingan berhasil diterapkan ke Antrean Aktif!");
    renderAll();
  });

  document.getElementById("btnDiscardGen").addEventListener("click", () => {
    state.genPreview = JSON.parse(JSON.stringify(state.upNextQueue));
    state.genDirty = false;
    simpanKePenyimpanan();
    showToast("Perubahan pratinjau dibatalkan.");
    renderGeneratorView();
  });

  // Tambah permintaan pasangan baru
  document.getElementById("btnAddPairReq").addEventListener("click", () => {
    const p1 = Number(document.getElementById("pairReqP1").value);
    const p2 = Number(document.getElementById("pairReqP2").value);
    if (!p1 || !p2 || p1 === p2) {
      showToast("Pilih dua pemain yang berbeda untuk permintaan pasangan.");
      return;
    }

    const sudahAda = state.pairRequests.some(
      (r) => (r.p1 === p1 && r.p2 === p2) || (r.p1 === p2 && r.p2 === p1)
    );
    if (sudahAda) {
      showToast("Permintaan pasangan tersebut sudah terdaftar.");
      return;
    }

    state.pairRequests.push({ p1, p2 });
    simpanKePenyimpanan();
    showToast(`Permintaan pasangan ${getPlayer(p1)?.name} ⇄ ${getPlayer(p2)?.name} ditambahkan.`);
    renderGeneratorView();
  });

  // Sakelar parameter generator
  const hubungkanSakelar = (idInput, idLabel, kunciParam) => {
    document.getElementById(idInput).addEventListener("change", (e) => {
      state.genParams[kunciParam] = e.target.checked;
      const lbl = document.getElementById(idLabel);
      lbl.textContent = e.target.checked ? "Aktif" : "Nonaktif";
      lbl.style.color = e.target.checked ? "#2e7d5b" : "#94a3b8";
      simpanKePenyimpanan();
      renderGeneratorView();
    });
  };
  hubungkanSakelar("paramPrioritize", "lblParamPrioritize", "prioritizeZeroGame");
  hubungkanSakelar("paramBalance", "lblParamBalance", "balanceLevel");
  hubungkanSakelar("paramPairReq", "lblParamPairReq", "applyPairRequest");

  document.querySelectorAll("#paramCourtAlloc .seg-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#paramCourtAlloc .seg-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      state.genParams.courtAllocation = btn.dataset.value;
      document.getElementById("courtAllocHint").textContent =
        btn.dataset.value === "auto"
          ? "Otomatis mengisi Lapangan 1 dan 2 sesuai urutan."
          : "Gunakan tombol Ubah Lapangan pada setiap kartu pratinjau.";
      simpanKePenyimpanan();
      renderDashboard();
    });
  });

  // Dialog Tukar Pemain
  document.getElementById("btnCloseSwapModal").addEventListener("click", () => {
    document.getElementById("swapPlayerModal").classList.remove("open");
  });
  document.getElementById("btnCancelSwap").addEventListener("click", () => {
    document.getElementById("swapPlayerModal").classList.remove("open");
  });
  document.getElementById("btnConfirmSwap").addEventListener("click", confirmSwapPlayer);

});
