/* ==================== RENDER LAYAR 5: PEMBAYARAN & RIWAYAT ==================== */
function renderPaymentView() {
  const pemainAktif = state.players.filter((p) => p.status !== "Pulang");
  const selectEl = document.getElementById("payPlayerSelect");

  if (!pemainAktif.some((p) => p.id === state.paymentSelectedPlayerId)) {
    const sedangIstirahat = pemainAktif.find((p) => p.status === "Istirahat");
    state.paymentSelectedPlayerId = sedangIstirahat
      ? sedangIstirahat.id
      : pemainAktif[0]?.id || null;
  }

  if (pemainAktif.length === 0) {
    selectEl.innerHTML = `<option value="">Belum ada pemain aktif</option>`;
    selectEl.disabled = true;
  } else {
    selectEl.disabled = false;
    selectEl.innerHTML = pemainAktif
      .map(
        (p) =>
          `<option value="${p.id}" ${p.id === state.paymentSelectedPlayerId ? "selected" : ""}>${p.name} (${p.status})</option>`
      )
      .join("");
  }

  const p = getPlayer(state.paymentSelectedPlayerId);
  const durasiSesi = p ? formatSessionDuration(p.joinedAt) : "—";
  const biaya = p ? calcFee(p.games) : 0;

  document.getElementById("payDuration").textContent = durasiSesi;
  document.getElementById("payGames").textContent = p ? `${p.games} game` : "—";
  document.getElementById("payFee").textContent = p ? formatRupiah(biaya) : "Rp —";

  document.getElementById("sumName").textContent = p ? p.name : "—";
  document.getElementById("sumLevel").textContent = p ? `Level ${p.level}` : "—";
  document.getElementById("sumGames").textContent = p ? `${p.games} game` : "—";
  document.getElementById("sumDuration").textContent = durasiSesi;
  document.getElementById("sumMethod").textContent = state.paymentMethod;
  document.getElementById("sumTotal").textContent = p ? formatRupiah(biaya) : "Rp —";

  // Visual QRIS atau informasi rekening Transfer Bank
  const visualEl = document.getElementById("paymentVisualBox");
  if (state.paymentMethod === "QRIS") {
    visualEl.innerHTML = `
      <div class="qr-frame">
        <svg width="110" height="110" viewBox="0 0 100 100" fill="none">
          <rect x="6" y="6" width="28" height="28" rx="4" stroke="#254BF5" stroke-width="5"/>
          <rect x="14" y="14" width="12" height="12" rx="2" fill="#254BF5"/>
          <rect x="66" y="6" width="28" height="28" rx="4" stroke="#254BF5" stroke-width="5"/>
          <rect x="74" y="14" width="12" height="12" rx="2" fill="#254BF5"/>
          <rect x="6" y="66" width="28" height="28" rx="4" stroke="#254BF5" stroke-width="5"/>
          <rect x="14" y="74" width="12" height="12" rx="2" fill="#254BF5"/>
          <rect x="44" y="10" width="10" height="10" fill="#254BF5"/>
          <rect x="44" y="28" width="10" height="10" fill="#64748b"/>
          <rect x="44" y="44" width="12" height="12" fill="#254BF5"/>
          <rect x="64" y="44" width="10" height="10" fill="#254BF5"/>
          <rect x="82" y="44" width="10" height="10" fill="#254BF5"/>
          <rect x="44" y="66" width="10" height="10" fill="#254BF5"/>
          <rect x="62" y="66" width="14" height="14" fill="#254BF5"/>
          <rect x="82" y="74" width="10" height="18" fill="#254BF5"/>
          <rect x="44" y="84" width="14" height="8" fill="#64748b"/>
        </svg>
      </div>
      <strong>Kode QRIS • SmashQueue Pro</strong>
      <small class="text-muted">Pindai kode QR di atas melalui dompet digital atau m-banking.</small>
      <span class="outline-pill-blue">Area ilustrasi pembayaran</span>
    `;
  } else {
    visualEl.innerHTML = `
      <div class="bank-info-card">
        <span class="soft-pill blue mb-8">Transfer Bank BCA</span>
        <div class="bank-acc-num">8410 9283 11</div>
        <div style="font-size:12.5px;font-weight:600;">a.n. Admin SmashQueue Pro</div>
        <button type="button" class="btn btn-outline btn-sm mt-12 btn-block" onclick="copyBankAcc()">
          Salin Nomor Rekening
        </button>
      </div>
      <small class="text-muted">Pastikan nominal transfer sesuai total tagihan sesi.</small>
    `;
  }

  // Aktifkan tombol konfirmasi hanya jika ada pemain dan kotak centang terisi
  const checkbox = document.getElementById("payConfirmCheck");
  checkbox.disabled = !p;
  if (!p) checkbox.checked = false;
  document.getElementById("btnOpenConfirmModal").disabled = !checkbox.checked || !p;

  // Tabel riwayat transaksi
  const histBody = document.getElementById("historyTableBody");
  const histEmpty = document.getElementById("historyEmptyState");
  if (state.paymentHistory.length === 0) {
    histBody.innerHTML = "";
    histEmpty.style.display = "flex";
  } else {
    histEmpty.style.display = "none";
    histBody.innerHTML = state.paymentHistory
      .map(
        (h) => `
          <tr>
            <td class="mono">${h.time}</td>
            <td><strong>${h.name}</strong></td>
            <td class="mono">${h.duration}</td>
            <td class="mono">${h.games}</td>
            <td><span class="level-chip">${h.method}</span></td>
            <td class="mono"><strong>${formatRupiah(h.amount)}</strong></td>
            <td><span class="soft-pill green">✓ Lunas</span></td>
          </tr>
        `
      )
      .join("");
  }
}

function copyBankAcc() {
  if (navigator.clipboard) {
    navigator.clipboard.writeText("8410928311");
  }
  showToast("Nomor rekening BCA 8410 9283 11 berhasil disalin.");
}

