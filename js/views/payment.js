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

  // Visual gambar QRIS berborder atau kalkulator tunai (Cash)
  const visualEl = document.getElementById("paymentVisualBox");
  if (state.paymentMethod === "QRIS") {
    visualEl.innerHTML = `
      <div class="qr-frame">
        <img src="qrissulthan.jpeg" alt="QRIS Pembayaran" class="qris-img" />
      </div>
      <small class="text-muted">Pindai kode QRIS di atas melalui dompet digital atau m-banking.</small>
    `;
  } else {
    visualEl.innerHTML = `
      <div class="cash-info-card">
        <div>
          <span class="soft-pill green">Pembayaran Tunai (Cash)</span>
        </div>

        <div class="form-group" style="margin-bottom:0;">
          <label for="cashReceivedInput" class="field-label">Uang diterima (Rp)</label>
          <input
            type="number"
            id="cashReceivedInput"
            class="input mono"
            placeholder="Contoh: 50000"
            min="0"
            step="1000"
            value="${state.cashReceived}"
            ${!p ? "disabled" : ""}
            oninput="ubahUangCash(this.value)"
          />
        </div>

        <div class="cash-quick-row">
          <button type="button" class="cash-quick-btn" ${!p ? "disabled" : ""} onclick="setUangCash(${biaya})">Uang Pas</button>
          <button type="button" class="cash-quick-btn" ${!p ? "disabled" : ""} onclick="setUangCash(50000)">Rp 50rb</button>
          <button type="button" class="cash-quick-btn" ${!p ? "disabled" : ""} onclick="setUangCash(100000)">Rp 100rb</button>
        </div>

        <div class="cash-change-box" id="cashChangeBox">
          <span class="cash-change-label" id="cashChangeLabel">Kembalian</span>
          <strong class="cash-change-val" id="cashChangeVal">Rp 0</strong>
        </div>
      </div>
    `;
    perbaruiKembalianCash();
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

// Memperbarui nominal uang tunai yang diketik tanpa memuat ulang kotak input
function ubahUangCash(nilai) {
  state.cashReceived = nilai;
  perbaruiKembalianCash();
}

// Mengisi cepat nominal uang tunai lewat tombol pecahan
function setUangCash(nominal) {
  state.cashReceived = String(nominal);
  const inputEl = document.getElementById("cashReceivedInput");
  if (inputEl) inputEl.value = state.cashReceived;
  perbaruiKembalianCash();
}

// Menghitung kembalian atau kekurangan uang tunai secara otomatis
function perbaruiKembalianCash() {
  const box = document.getElementById("cashChangeBox");
  const label = document.getElementById("cashChangeLabel");
  const val = document.getElementById("cashChangeVal");
  if (!box || !label || !val) return;

  const p = getPlayer(state.paymentSelectedPlayerId);
  if (!p) {
    box.classList.remove("kurang");
    label.textContent = "Kembalian";
    val.textContent = "—";
    return;
  }

  const tagihan = calcFee(p.games);
  const diterima = Number(state.cashReceived || 0);

  if (state.cashReceived === "") {
    box.classList.remove("kurang");
    label.textContent = "Kembalian";
    val.textContent = "Rp 0";
  } else if (diterima < tagihan) {
    box.classList.add("kurang");
    label.textContent = "Kurang";
    val.textContent = formatRupiah(tagihan - diterima);
  } else {
    box.classList.remove("kurang");
    label.textContent = "Kembalian";
    val.textContent = formatRupiah(diterima - tagihan);
  }
}

