document.addEventListener("DOMContentLoaded", () => {
  /* --- PEMBAYARAN & RIWAYAT --- */
  document.getElementById("payPlayerSelect").addEventListener("change", (e) => {
    state.paymentSelectedPlayerId = Number(e.target.value) || null;
    document.getElementById("payConfirmCheck").checked = false;
    renderPaymentView();
  });

  document.querySelectorAll("#payMethodSeg .seg-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#payMethodSeg .seg-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      state.paymentMethod = btn.dataset.value;
      renderPaymentView();
    });
  });

  document.getElementById("payConfirmCheck").addEventListener("change", renderPaymentView);

  document.getElementById("btnCancelPayment").addEventListener("click", () => {
    document.getElementById("payConfirmCheck").checked = false;
    renderPaymentView();
    showToast("Konfirmasi pembayaran direset.");
  });

  // Dialog Konfirmasi Pembayaran
  const payModal = document.getElementById("confirmPaymentModal");
  document.getElementById("btnOpenConfirmModal").addEventListener("click", () => {
    const p = getPlayer(state.paymentSelectedPlayerId);
    if (!p) return;
    document.getElementById("modalPayTitle").textContent = `Akhiri sesi ${p.name} dan konfirmasi pembayaran?`;
    document.getElementById("modalPayName").textContent = p.name;
    document.getElementById("modalPayLevel").textContent = `• Level ${p.level}`;
    document.getElementById("modalPayGames").textContent = `${p.games} game`;
    document.getElementById("modalPayMethod").textContent = state.paymentMethod;
    payModal.classList.add("open");
  });

  const tutupModalBayar = () => payModal.classList.remove("open");
  document.getElementById("btnClosePayModal").addEventListener("click", tutupModalBayar);
  document.getElementById("btnModalCancelPay").addEventListener("click", tutupModalBayar);

  document.getElementById("btnModalConfirmPay").addEventListener("click", () => {
    const p = getPlayer(state.paymentSelectedPlayerId);
    if (!p) return;

    if (p.status === "Bermain") {
      tutupModalBayar();
      showToast(`${p.name} masih bertanding di lapangan. Selesaikan pertandingan terlebih dahulu.`);
      return;
    }

    const sekarang = new Date();
    const jam = String(sekarang.getHours()).padStart(2, "0");
    const menit = String(sekarang.getMinutes()).padStart(2, "0");

    state.paymentHistory.unshift({
      playerId: p.id,
      time: `${jam}:${menit}`,
      name: p.name,
      duration: formatSessionDuration(p.joinedAt),
      games: p.games,
      method: state.paymentMethod,
      amount: calcFee(p.games),
    });

    p.status = "Pulang";

    // Bersihkan pemain yang sudah pulang dari antrean, pratinjau, dan permintaan pasangan
    state.upNextQueue = state.upNextQueue.filter(
      (q) => !q.team1.includes(p.id) && !q.team2.includes(p.id)
    );
    state.genPreview = state.genPreview.filter(
      (q) => !q.team1.includes(p.id) && !q.team2.includes(p.id)
    );
    state.pairRequests = state.pairRequests.filter(
      (r) => r.p1 !== p.id && r.p2 !== p.id
    );

    document.getElementById("payConfirmCheck").checked = false;
    tutupModalBayar();
    simpanKePenyimpanan();
    showToast(`Pembayaran ${p.name} (${state.paymentMethod}) dikonfirmasi. Status diubah ke Pulang.`);
    renderAll();
  });

});
