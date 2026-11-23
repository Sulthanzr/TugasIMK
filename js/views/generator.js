/* ==================== RENDER LAYAR 3: GENERATOR ANTREAN ==================== */
function getWaitingSorted() {
  const menunggu = state.players.filter((p) => p.status === "Menunggu");
  return [...menunggu].sort((a, b) => {
    if (state.genParams.prioritizeZeroGame && a.games !== b.games) {
      return a.games - b.games;
    }
    return a.id - b.id;
  });
}

// Menyusun pertandingan otomatis dari daftar pemain yang sedang menunggu
function generatePreviewMatches() {
  const menunggu = getWaitingSorted();
  if (menunggu.length < 4) {
    state.genPreview = [];
    state.genDirty = false;
    simpanKePenyimpanan();
    showToast(`Minimal dibutuhkan 4 pemain berstatus Menunggu (saat ini: ${menunggu.length} pemain).`);
    renderGeneratorView();
    return;
  }

  let pool = [...menunggu];
  const hasilPertandingan = [];
  let nomorLapangan = 1;

  // Proses pasangan dari permintaan pasangan jika parameter aktif
  const pasanganKhusus = [];
  if (state.genParams.applyPairRequest) {
    state.pairRequests.forEach((req) => {
      const i1 = pool.findIndex((p) => p.id === req.p1);
      const i2 = pool.findIndex((p) => p.id === req.p2);
      if (i1 !== -1 && i2 !== -1) {
        const p1 = pool[i1];
        const p2 = pool[i2];
        pool = pool.filter((p) => p.id !== req.p1 && p.id !== req.p2);
        pasanganKhusus.push([p1, p2]);
      }
    });
  }

  // Urutkan sisa pemain berdasarkan level dan jenis kelamin jika keseimbangan aktif
  if (state.genParams.balanceLevel) {
    pool.sort((a, b) => {
      if (state.genParams.prioritizeZeroGame && a.games !== b.games) return a.games - b.games;
      if (a.level !== b.level) return levelScore(b.level) - levelScore(a.level);
      return a.gender.localeCompare(b.gender);
    });
  }

  // Bentuk pasangan reguler dari sisa pemain
  const pasanganReguler = [];
  while (pool.length >= 2) {
    pasanganReguler.push([pool.shift(), pool.shift()]);
  }
  const semuaPasangan = [...pasanganKhusus, ...pasanganReguler];

  // Pasangkan tiap 2 tim menjadi 1 pertandingan
  while (semuaPasangan.length >= 2) {
    const pair1 = semuaPasangan.shift();
    const pair2 = semuaPasangan.shift();
    const team1 = pair1.map((p) => p.id);
    const team2 = pair2.map((p) => p.id);
    const meta = analyzeMatch(team1, team2);

    hasilPertandingan.push({
      id: `gen-${Date.now()}-${hasilPertandingan.length}`,
      courtId: nomorLapangan,
      team1,
      team2,
      categoryCode: meta.categoryCode,
      categoryLabel: meta.categoryLabel,
      balance: meta.balance,
      etaMin: (hasilPertandingan.length + 1) * 6,
    });
    nomorLapangan = nomorLapangan === 1 ? 2 : 1;
  }

  state.genPreview = hasilPertandingan;
  state.genDirty = true;
  simpanKePenyimpanan();
  showToast(`Berhasil menyusun ${hasilPertandingan.length} pertandingan dari ${menunggu.length} pemain menunggu.`);
  renderGeneratorView();
}

function renderGeneratorView() {
  const menunggu = getWaitingSorted();
  document.getElementById("genPreviewMeta").textContent = `${state.genPreview.length} pertandingan dari ${menunggu.length} pemain yang menunggu`;

  const statusBadge = document.getElementById("genStatusBadge");
  const applyNote = document.getElementById("genApplyNote");
  const btnApply = document.getElementById("btnApplyGen");
  const btnDiscard = document.getElementById("btnDiscardGen");

  if (state.genPreview.length === 0 && !state.genDirty) {
    statusBadge.className = "soft-pill neutral";
    statusBadge.textContent = "Belum ada pratinjau";
    applyNote.textContent = "Belum ada antrean untuk diterapkan";
    btnApply.disabled = true;
    btnDiscard.disabled = true;
  } else if (state.genDirty) {
    statusBadge.className = "soft-pill amber";
    statusBadge.textContent = "⚠ Belum disimpan";
    applyNote.textContent = "⚠ Perubahan belum diterapkan ke antrean aktif";
    btnApply.disabled = false;
    btnDiscard.disabled = false;
  } else {
    statusBadge.className = "soft-pill green";
    statusBadge.textContent = "✓ Diterapkan";
    applyNote.textContent = "✓ Pratinjau sinkron dengan antrean aktif di Dashboard";
    btnApply.disabled = true;
    btnDiscard.disabled = true;
  }

  const listEl = document.getElementById("genPreviewList");
  if (state.genPreview.length === 0) {
    listEl.innerHTML = `
      <div class="empty-box">
        <strong>Belum ada pratinjau pertandingan</strong>
        <p>${
          menunggu.length < 4
            ? `Tambahkan minimal ${4 - menunggu.length} pemain lagi di menu Data Pemain agar dapat melakukan generate.`
            : `Klik tombol "Generate Antrean" di atas untuk menyusun pasangan otomatis.`
        }</p>
      </div>
    `;
  } else {
    listEl.innerHTML = state.genPreview
      .map((m, idx) => {
        const renderTim = (ids, label, warna) => {
          const daftarHtml = ids
            .map((id) => {
              const p = getPlayer(id);
              return p
                ? `<div class="player-slot"><div class="player-slot-name">${p.name}</div><div class="player-slot-meta">Level ${p.level} • ${p.games} game</div></div>`
                : "";
            })
            .join("");
          return `<div class="team-box"><div class="team-label ${warna}">${label}</div>${daftarHtml}</div>`;
        };

        return `
          <div class="gen-match-card">
            <div class="gen-match-head">
              <div class="gen-match-tags">
                <span class="queue-order">#0${idx + 1}</span>
                <span class="soft-pill blue">${m.categoryLabel}</span>
                <span class="soft-pill green">✓ Balance ${m.balance}%</span>
              </div>
              <span class="text-muted" style="font-size:12px;">Lapangan ${m.courtId} • ±${m.etaMin} menit lagi</span>
            </div>

            <div class="matchup-box">
              ${renderTim(m.team1, "PASANGAN 1", "blue")}
              <div class="vs-circle">VS</div>
              ${renderTim(m.team2, "PASANGAN 2", "amber")}
            </div>

            <div class="gen-match-actions">
              <button class="btn btn-outline btn-sm" onclick="openSwapModal(${idx})">⇄ Tukar Pemain</button>
              <button class="btn btn-outline btn-sm" onclick="togglePreviewCourt(${idx})">Ubah Lapangan</button>
            </div>
          </div>
        `;
      })
      .join("");
  }

  // Daftar prioritas giliran
  document.getElementById("priorityCountBadge").textContent = `⏱ ${menunggu.length} menunggu`;
  document.getElementById("priorityList").innerHTML = menunggu.length
    ? menunggu
        .map(
          (p, i) => `
            <li class="priority-item">
              <div class="priority-left">
                <span class="priority-num">${String(i + 1).padStart(2, "0")}</span>
                <span>${p.name}</span>
              </div>
              <span class="mono text-muted" style="font-size:12px;">${p.games} game</span>
            </li>
          `
        )
        .join("")
    : `<li class="text-muted" style="font-size:12.5px;">Belum ada pemain yang menunggu.</li>`;

  // Dropdown & daftar permintaan pasangan
  const p1Select = document.getElementById("pairReqP1");
  const p2Select = document.getElementById("pairReqP2");
  const btnAddPair = document.getElementById("btnAddPairReq");

  const pemainAktif = state.players.filter((p) => p.status !== "Pulang");
  if (pemainAktif.length < 2) {
    p1Select.innerHTML = `<option value="">Pemain 1</option>`;
    p2Select.innerHTML = `<option value="">Pemain 2</option>`;
    p1Select.disabled = true;
    p2Select.disabled = true;
    btnAddPair.disabled = true;
  } else {
    const opsi = pemainAktif.map((p) => `<option value="${p.id}">${p.name}</option>`).join("");
    p1Select.innerHTML = opsi;
    p2Select.innerHTML = opsi;
    p2Select.selectedIndex = 1;
    p1Select.disabled = false;
    p2Select.disabled = false;
    btnAddPair.disabled = false;
  }

  document.getElementById("pairReqTitle").textContent = `Permintaan Pasangan (${state.pairRequests.length})`;
  const pairListEl = document.getElementById("pairReqList");
  if (state.pairRequests.length === 0) {
    pairListEl.innerHTML = `<p class="text-muted" style="font-size:12px;">Belum ada permintaan pasangan.</p>`;
  } else {
    pairListEl.innerHTML = state.pairRequests
      .map((req, idx) => {
        const nama1 = getPlayer(req.p1)?.name || "-";
        const nama2 = getPlayer(req.p2)?.name || "-";
        const aktif = state.genParams.applyPairRequest;
        return `
          <div class="pair-req-item">
            <span>${nama1} ⇄ ${nama2}</span>
            <div class="pair-req-actions">
              <span class="soft-pill ${aktif ? "green" : "neutral"}">${aktif ? "✓ Aktif" : "Nonaktif"}</span>
              <button type="button" class="btn-icon-remove" title="Hapus permintaan" onclick="removePairRequest(${idx})">&times;</button>
            </div>
          </div>
        `;
      })
      .join("");
  }
}

function removePairRequest(index) {
  state.pairRequests.splice(index, 1);
  simpanKePenyimpanan();
  showToast("Permintaan pasangan dihapus.");
  renderGeneratorView();
}

function togglePreviewCourt(idx) {
  const m = state.genPreview[idx];
  if (!m) return;
  m.courtId = m.courtId === 1 ? 2 : 1;
  state.genDirty = true;
  simpanKePenyimpanan();
  showToast(`Alokasi pertandingan #0${idx + 1} diubah ke Lapangan ${m.courtId}.`);
  renderGeneratorView();
}

function openSwapModal(matchIdx) {
  state.swapMatchIndex = matchIdx;
  const match = state.genPreview[matchIdx];
  if (!match) return;

  const sourceSelect = document.getElementById("swapSourceSelect");
  const targetSelect = document.getElementById("swapTargetSelect");

  const pemainMatch = [...match.team1, ...match.team2].map(getPlayer).filter(Boolean);
  sourceSelect.innerHTML = pemainMatch
    .map((p) => `<option value="${p.id}">${p.name} (Level ${p.level})</option>`)
    .join("");

  const menunggu = state.players.filter((p) => p.status === "Menunggu");
  targetSelect.innerHTML = menunggu
    .map((p) => `<option value="${p.id}">${p.name} (Level ${p.level} • ${p.games} game)</option>`)
    .join("");

  document.getElementById("swapPlayerModal").classList.add("open");
}

function confirmSwapPlayer() {
  const match = state.genPreview[state.swapMatchIndex];
  const srcId = Number(document.getElementById("swapSourceSelect").value);
  const tgtId = Number(document.getElementById("swapTargetSelect").value);

  if (!match || srcId === tgtId) {
    showToast("Pilih dua pemain yang berbeda untuk ditukar.");
    return;
  }

  // Tukar posisi kedua pemain pada seluruh daftar pratinjau
  state.genPreview.forEach((m) => {
    m.team1 = m.team1.map((id) => (id === srcId ? -1 : id === tgtId ? srcId : id));
    m.team2 = m.team2.map((id) => (id === srcId ? -1 : id === tgtId ? srcId : id));
  });
  state.genPreview.forEach((m) => {
    m.team1 = m.team1.map((id) => (id === -1 ? tgtId : id));
    m.team2 = m.team2.map((id) => (id === -1 ? tgtId : id));
    const meta = analyzeMatch(m.team1, m.team2);
    m.categoryCode = meta.categoryCode;
    m.categoryLabel = meta.categoryLabel;
    m.balance = meta.balance;
  });

  state.genDirty = true;
  simpanKePenyimpanan();
  document.getElementById("swapPlayerModal").classList.remove("open");
  showToast(`Penukaran ${getPlayer(srcId)?.name} ↔ ${getPlayer(tgtId)?.name} diterapkan pada pratinjau.`);
  renderGeneratorView();
}

