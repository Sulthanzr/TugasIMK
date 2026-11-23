/* ==================== RENDER LAYAR 4: MANAJEMEN SESI PEMAIN ==================== */
function renderSessionsView() {
  const menunggu = state.players.filter((p) => p.status === "Menunggu");
  const istirahat = state.players.filter((p) => p.status === "Istirahat");
  const pulang = state.players.filter((p) => p.status === "Pulang");

  // Daftar menunggu (4 pemain per halaman)
  const perHalaman = 4;
  const totalHalaman = Math.max(1, Math.ceil(menunggu.length / perHalaman));
  if (state.waitingSessionPage > totalHalaman) state.waitingSessionPage = totalHalaman;
  const awal = (state.waitingSessionPage - 1) * perHalaman;
  const halamanMenunggu = menunggu.slice(awal, awal + perHalaman);

  const waitEl = document.getElementById("sessionWaitingList");
  waitEl.innerHTML = halamanMenunggu.length
    ? halamanMenunggu
        .map(
          (p) => `
            <div class="sess-player-card">
              <div class="sess-player-top">
                <div class="sess-player-info">
                  <span class="avatar-initials blue">${getInitials(p.name)}</span>
                  <div>
                    <div class="sess-player-name">${p.name}</div>
                    <div class="sess-player-meta">Level ${p.level} • ${p.games} game</div>
                  </div>
                </div>
                <button class="btn btn-outline btn-sm" onclick="setPlayerStatus(${p.id}, 'Istirahat')">Istirahat</button>
              </div>
            </div>
          `
        )
        .join("")
    : `<div class="empty-box"><strong>Belum ada pemain menunggu</strong><p>Pemain yang baru didaftarkan akan muncul di kolom ini.</p></div>`;

  const pagerEl = document.getElementById("sessionWaitingPager");
  pagerEl.innerHTML = `
    <span>Menampilkan ${halamanMenunggu.length} dari ${menunggu.length} pemain menunggu</span>
    <button class="soft-pill blue" style="border:none;cursor:pointer;" onclick="cycleWaitingSessionPage(${totalHalaman})">
      ${state.waitingSessionPage}/${totalHalaman}
    </button>
  `;

  // Daftar istirahat
  const restEl = document.getElementById("sessionRestingList");
  restEl.innerHTML = istirahat.length
    ? istirahat
        .map(
          (p) => `
            <div class="sess-player-card">
              <div class="sess-player-top mb-12">
                <div class="sess-player-info">
                  <span class="avatar-initials amber">${getInitials(p.name)}</span>
                  <div>
                    <div class="sess-player-name">${p.name}</div>
                    <div class="sess-player-meta">Level ${p.level} • ${p.games} game</div>
                  </div>
                </div>
                <span class="soft-pill amber">Istirahat</span>
              </div>
              <div class="btn-row">
                <button class="btn btn-soft-blue btn-sm flex-1" onclick="setPlayerStatus(${p.id}, 'Menunggu')">Kembali Antre</button>
                <button class="btn btn-outline btn-sm flex-1" onclick="checkoutPlayer(${p.id})">Pulangkan</button>
              </div>
            </div>
          `
        )
        .join("")
    : `<div class="empty-box"><strong>Belum ada pemain istirahat</strong><p>Klik tombol "Istirahat" pada pemain yang ingin jeda sementara.</p></div>`;

  // Daftar pulang
  const leftEl = document.getElementById("sessionLeftList");
  leftEl.innerHTML = pulang.length
    ? pulang
        .map((p) => {
          const riwayat = state.paymentHistory.find((h) => h.playerId === p.id);
          return `
            <div class="sess-player-card">
              <div class="sess-player-top">
                <div class="sess-player-info">
                  <span class="avatar-initials green">${getInitials(p.name)}</span>
                  <div>
                    <div class="sess-player-name">${p.name}</div>
                    <div class="sess-player-meta">Level ${p.level} • ${p.games} game</div>
                  </div>
                </div>
                <span class="soft-pill green">Lunas – ${riwayat ? riwayat.method : "QRIS"}</span>
              </div>
            </div>
          `;
        })
        .join("")
    : `
      <div class="empty-box">
        <span class="mini-icon green">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
        </span>
        <strong>Belum ada pemain pulang</strong>
        <p>Pemain yang mengakhiri sesi akan ditampilkan bersama status pembayaran.</p>
      </div>
    `;

  // Tampilkan panel sesuai tab yang aktif (desktop & mobile)
  document.querySelectorAll(".session-panel").forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.scol === state.mobileSessionTab);
  });
}

function cycleWaitingSessionPage(totalHalaman) {
  state.waitingSessionPage = state.waitingSessionPage >= totalHalaman ? 1 : state.waitingSessionPage + 1;
  renderSessionsView();
}

function setPlayerStatus(playerId, statusBaru) {
  const p = getPlayer(playerId);
  if (!p) return;
  p.status = statusBaru;

  // Keluarkan dari antrean maupun pratinjau jika berpindah ke istirahat
  if (statusBaru === "Istirahat") {
    state.upNextQueue = state.upNextQueue.filter(
      (q) => !q.team1.includes(playerId) && !q.team2.includes(playerId)
    );
    state.genPreview = state.genPreview.filter(
      (q) => !q.team1.includes(playerId) && !q.team2.includes(playerId)
    );
  }

  simpanKePenyimpanan();
  showToast(`${p.name} dipindahkan ke status ${statusBaru}.`);
  renderAll();
}

function checkoutPlayer(playerId) {
  state.paymentSelectedPlayerId = playerId;
  document.getElementById("payConfirmCheck").checked = false;
  switchView("payment");
}

