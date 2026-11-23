/* ==================== RENDER LAYAR 1: DASHBOARD UTAMA ==================== */
function renderDashboard() {
  const courtsEl = document.getElementById("courtsContainer");
  courtsEl.innerHTML = state.courts
    .map((court) => {
      if (!court.active) {
        return `
          <div class="court-card">
            <div class="court-head">
              <div class="court-id-wrap">
                <span class="court-num c${court.id}">${court.id}</span>
                <div>
                  <div class="court-name">${court.name}</div>
                </div>
              </div>
              <span class="soft-pill neutral">KOSONG</span>
            </div>
            <div class="court-empty">
              <p>Belum ada pertandingan berjalan di ${court.shortName}.</p>
              <button class="btn btn-primary btn-sm mt-12" onclick="assignNextToCourt(${court.id})">
                Panggil Antrean Berikutnya
              </button>
            </div>
          </div>
        `;
      }

      const renderSlotPemain = (daftarId) =>
        daftarId
          .map((id) => {
            const p = getPlayer(id);
            if (!p) return "";
            const labelJk = court.id === 2 ? ` (${p.gender === "L" ? "L" : "P"})` : "";
            return `
              <div class="player-slot">
                <div class="player-slot-name">${p.name}</div>
                <div class="player-slot-meta">Lvl ${p.level}${labelJk} • ${p.games} Game</div>
              </div>
            `;
          })
          .join("");

      return `
        <div class="court-card ${court.id === 1 ? "court-highlight" : ""}">
          <div class="court-head">
            <div class="court-id-wrap">
              <span class="court-num c${court.id}">${court.id}</span>
              <div>
                <div class="court-name">${court.name}</div>
                <div class="court-meta">${court.category} • Match #${court.matchNo}</div>
              </div>
            </div>
            <span class="soft-pill green">✓ SEDANG AKTIF</span>
          </div>

          <div class="matchup-box">
            <div class="team-box">
              <div class="team-label blue">${court.team1Label}</div>
              ${renderSlotPemain(court.team1)}
            </div>
            <div class="vs-circle">VS</div>
            <div class="team-box">
              <div class="team-label amber">${court.team2Label}</div>
              ${renderSlotPemain(court.team2)}
            </div>
          </div>

          <div class="court-footer">
            <div class="timer-wrap">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#254BF5" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <div>
                <div class="timer-label">Durasi Pertandingan:</div>
                <div class="timer-val" id="courtTimer-${court.id}">${formatDurationSec(court.elapsedSec)}</div>
              </div>
            </div>
            <button class="btn btn-green" onclick="finishMatch(${court.id})">
              ⚑ Selesaikan Match (Next)
            </button>
          </div>
        </div>
      `;
    })
    .join("");

  // Tabel antrean desktop dan kartu antrean mobile
  const tbody = document.getElementById("upNextTableBody");
  const mList = document.getElementById("upNextMobileList");

  if (state.upNextQueue.length === 0) {
    const jumlahMenunggu = state.players.filter((p) => p.status === "Menunggu").length;
    const pesanKosong =
      jumlahMenunggu < 4
        ? "Belum ada antrean aktif. Daftarkan minimal 4 pemain di menu Data Pemain terlebih dahulu."
        : "Belum ada antrean aktif. Buka Generator Antrean untuk menyusun pertandingan.";

    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center;color:#64748b;padding:28px 16px;">
          <div style="margin-bottom:10px;">${pesanKosong}</div>
          <div class="btn-row" style="justify-content:center;">
            <button class="btn btn-outline btn-sm" onclick="switchView('players')">+ Daftarkan Pemain</button>
            <button class="btn btn-soft-blue btn-sm" onclick="switchView('generator')">Buka Generator</button>
          </div>
        </td>
      </tr>
    `;

    mList.innerHTML = `
      <div class="empty-box">
        <p>${pesanKosong}</p>
        <div class="btn-row mt-8">
          <button class="btn btn-outline btn-sm" onclick="switchView('players')">+ Pemain</button>
          <button class="btn btn-soft-blue btn-sm" onclick="switchView('generator')">Generator</button>
        </div>
      </div>
    `;
    return;
  }

  tbody.innerHTML = state.upNextQueue
    .map((q, idx) => {
      const t1 = q.team1.map((id) => getPlayer(id)?.name || "-").join(" & ");
      const t2 = q.team2.map((id) => getPlayer(id)?.name || "-").join(" & ");
      const kelasPill = q.categoryCode === "WD" ? "purple" : "blue";
      return `
        <tr>
          <td class="queue-order">#0${idx + 1}</td>
          <td>
            <strong>${t1}</strong>
            <div class="matchup-sub">vs ${t2}</div>
          </td>
          <td><span class="soft-pill ${kelasPill}">↗ ${q.categoryCode} • Balance ${q.balance}%</span></td>
          <td>Lapangan ${q.courtId} (${state.genParams.courtAllocation === "auto" ? "Auto-Assign" : "Manual"})</td>
          <td class="mono ${idx === 0 ? "text-green" : "text-amber"}">~ ${q.etaMin} Menit lagi</td>
          <td class="text-right">
            <div class="btn-row" style="justify-content:flex-end;">
              <button class="btn btn-soft-blue btn-sm" onclick="callQueueNow(${idx})">Panggil Sekarang</button>
              <button class="btn btn-outline btn-sm" onclick="switchView('generator')">Sesuaikan</button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");

  mList.innerHTML = state.upNextQueue
    .map((q, idx) => {
      const t1 = q.team1.map((id) => getPlayer(id)?.name || "-").join(" & ");
      const t2 = q.team2.map((id) => getPlayer(id)?.name || "-").join(" & ");
      return `
        <div class="mobile-queue-item">
          <div class="gen-match-head" style="margin-bottom:0;">
            <span class="queue-order">#0${idx + 1}</span>
            <span class="soft-pill ${q.categoryCode === "WD" ? "purple" : "blue"}">${q.categoryCode} • Balance ${q.balance}%</span>
            <span class="text-muted" style="font-size:11.5px;">Lap. ${q.courtId} • ~${q.etaMin}m</span>
          </div>
          <div>
            <strong>${t1}</strong>
            <div class="matchup-sub">vs ${t2}</div>
          </div>
          <div class="btn-row">
            <button class="btn btn-soft-blue btn-sm flex-1" onclick="callQueueNow(${idx})">Panggil Sekarang</button>
            <button class="btn btn-outline btn-sm" onclick="switchView('generator')">Sesuaikan</button>
          </div>
        </div>
      `;
    })
    .join("");
}

// Menyelesaikan pertandingan aktif di lapangan tertentu
function finishMatch(courtId) {
  const court = state.courts.find((c) => c.id === courtId);
  if (!court || !court.active) return;

  // Kembalikan 4 pemain ke daftar tunggu dan tambah jumlah game masing-masing
  [...court.team1, ...court.team2].forEach((id) => {
    const p = getPlayer(id);
    if (p && p.status !== "Pulang") {
      p.games += 1;
      p.status = "Menunggu";
    }
  });

  court.active = false;
  court.team1 = [];
  court.team2 = [];
  court.elapsedSec = 0;

  showToast(`Match #${court.matchNo} di ${court.shortName} selesai! Jumlah game pemain diperbarui.`);

  if (state.autoRotate && state.upNextQueue.length > 0) {
    assignNextToCourt(courtId, true);
  } else {
    simpanKePenyimpanan();
    renderAll();
  }
}

// Memanggil antrean berikutnya untuk mengisi lapangan kosong
function assignNextToCourt(courtId, otomatis = false) {
  let qIdx = state.upNextQueue.findIndex((q) => q.courtId === courtId);
  if (qIdx === -1) qIdx = 0;

  if (state.upNextQueue.length === 0) {
    showToast("Antrean kosong. Susun pertandingan di Generator Antrean terlebih dahulu.");
    switchView("generator");
    return;
  }
  callQueueNow(qIdx, courtId, otomatis);
}

// Memasukkan item antrean terpilih ke lapangan
function callQueueNow(queueIndex, overrideCourtId = null, otomatis = false) {
  const item = state.upNextQueue[queueIndex];
  if (!item) return;

  const semuaId = [...item.team1, ...item.team2];
  const adaTidakSiap = semuaId.some((id) => {
    const p = getPlayer(id);
    return !p || p.status !== "Menunggu";
  });

  if (adaTidakSiap) {
    showToast("Sebagian pemain pada antrean ini sedang tidak menunggu. Silakan generate ulang antrean.");
    return;
  }

  const targetCourtId = overrideCourtId || item.courtId;
  const court = state.courts.find((c) => c.id === targetCourtId);
  if (!court) return;

  // Jika lapangan masih dipakai, selesaikan pertandingan yang sedang berjalan
  if (court.active) {
    [...court.team1, ...court.team2].forEach((id) => {
      const p = getPlayer(id);
      if (p && p.status !== "Pulang") {
        p.games += 1;
        p.status = "Menunggu";
      }
    });
  }

  semuaId.forEach((id) => {
    const p = getPlayer(id);
    if (p) p.status = "Bermain";
  });

  state.matchCounter += 1;
  const meta = analyzeMatch(item.team1, item.team2);
  court.active = true;
  court.matchNo = state.matchCounter;
  court.category = meta.fullCategory;
  court.team1 = [...item.team1];
  court.team2 = [...item.team2];
  court.elapsedSec = 0;

  state.upNextQueue.splice(queueIndex, 1);
  state.genPreview = JSON.parse(JSON.stringify(state.upNextQueue));
  state.genDirty = false;

  simpanKePenyimpanan();
  showToast(
    otomatis
      ? `Auto-Rotate: Match #${court.matchNo} dimulai di ${court.shortName}.`
      : `Match #${court.matchNo} dipanggil ke ${court.shortName}!`
  );
  renderAll();
}

