/* ==================== RENDER LAYAR 2: MANAJEMEN DATA PEMAIN ==================== */
function renderPlayersView() {
  const pemainAktif = state.players.filter((p) => p.status !== "Pulang");
  const hasilFilter = pemainAktif.filter((p) => {
    const cocokNama = p.name.toLowerCase().includes(state.playerSearch.toLowerCase());
    const cocokLevel = state.playerLevelFilter === "ALL" || p.level === state.playerLevelFilter;
    return cocokNama && cocokLevel;
  });

  const totalHalaman = Math.max(1, Math.ceil(hasilFilter.length / state.playersPerPage));
  if (state.playerPage > totalHalaman) state.playerPage = totalHalaman;

  const awal = (state.playerPage - 1) * state.playersPerPage;
  const itemHalaman = hasilFilter.slice(awal, awal + state.playersPerPage);

  document.getElementById("playerListMeta").textContent = `${pemainAktif.length} pemain aktif hari ini`;

  const badgeStatus = (st) => {
    if (st === "Bermain") return `<span class="soft-pill green">▷ Bermain</span>`;
    if (st === "Istirahat") return `<span class="soft-pill amber">☕ Istirahat</span>`;
    return `<span class="soft-pill blue">⏱ Menunggu</span>`;
  };

  // Tabel desktop
  const tbody = document.getElementById("playersTableBody");
  if (pemainAktif.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:#64748b;padding:28px;">Belum ada pemain terdaftar. Gunakan formulir "Daftarkan Pemain Baru" di sebelah kanan.</td></tr>`;
  } else if (itemHalaman.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:#64748b;padding:24px;">Tidak ada pemain yang sesuai pencarian atau filter level.</td></tr>`;
  } else {
    tbody.innerHTML = itemHalaman
      .map((p, i) => {
        const terpilih = p.id === state.selectedEditPlayerId;
        return `
          <tr class="${terpilih ? "row-selected" : ""}">
            <td>${awal + i + 1}</td>
            <td><strong>${p.name}</strong></td>
            <td>${p.gender}</td>
            <td><span class="level-chip">Level ${p.level}</span></td>
            <td>${badgeStatus(p.status)}</td>
            <td class="mono">${p.games}</td>
            <td>
              <button class="btn ${terpilih ? "btn-soft-blue" : "btn-outline"} btn-sm" onclick="selectPlayerForEdit(${p.id})">
                ✎ Ubah Level
              </button>
            </td>
          </tr>
        `;
      })
      .join("");
  }

  // Daftar kartu mobile
  const mList = document.getElementById("playersMobileList");
  if (pemainAktif.length === 0) {
    mList.innerHTML = `
      <div class="empty-box">
        <strong>Belum ada pemain terdaftar</strong>
        <p>Tekan tombol "Daftarkan Pemain Baru" di bawah untuk menambahkan pemain pertama.</p>
      </div>
    `;
  } else if (itemHalaman.length === 0) {
    mList.innerHTML = `<div class="empty-box"><p>Tidak ada pemain yang sesuai pencarian.</p></div>`;
  } else {
    mList.innerHTML = itemHalaman
      .map((p) => {
        const terpilih = p.id === state.selectedEditPlayerId;
        const warna = p.status === "Istirahat" ? "amber" : "blue";
        return `
          <div class="mobile-player-card ${terpilih ? "row-selected" : ""}">
            <div class="sess-player-info">
              <span class="avatar-initials ${warna}">${getInitials(p.name)}</span>
              <div>
                <div class="sess-player-name">${p.name}</div>
                <div class="sess-player-meta">Level ${p.level} • ${p.status} • ${p.games} game</div>
              </div>
            </div>
            <button class="btn ${terpilih ? "btn-soft-blue" : "btn-outline"} btn-sm" onclick="selectPlayerForEdit(${p.id}, true)">
              ✎ Ubah
            </button>
          </div>
        `;
      })
      .join("");
  }

  // Paginasi
  const pagEl = document.getElementById("playersPagination");
  const indeksAkhir = Math.min(awal + itemHalaman.length, hasilFilter.length);
  const indeksAwal = hasilFilter.length ? awal + 1 : 0;
  let tombolHalaman = `<button class="page-btn" ${state.playerPage <= 1 ? "disabled" : ""} onclick="goPlayerPage(${state.playerPage - 1})">Sebelumnya</button>`;
  for (let i = 1; i <= totalHalaman; i++) {
    tombolHalaman += `<button class="page-btn ${i === state.playerPage ? "active" : ""}" onclick="goPlayerPage(${i})">${i}</button>`;
  }
  tombolHalaman += `<button class="page-btn" ${state.playerPage >= totalHalaman ? "disabled" : ""} onclick="goPlayerPage(${state.playerPage + 1})">Berikutnya</button>`;

  pagEl.innerHTML = `
    <span>Menampilkan ${indeksAwal}–${indeksAkhir} dari ${hasilFilter.length} pemain</span>
    <div class="page-btns">${tombolHalaman}</div>
  `;

  renderEditLevelCard();
}

function goPlayerPage(halaman) {
  state.playerPage = halaman;
  renderPlayersView();
}

function selectPlayerForEdit(playerId) {
  const p = getPlayer(playerId);
  if (!p) return;
  state.selectedEditPlayerId = playerId;
  state.selectedEditNewLevel = p.level;
  renderEditLevelCard();
  document.getElementById("editLevelModal").classList.add("open");
  renderPlayersView();
}

function tutupModalEditLevel() {
  document.getElementById("editLevelModal").classList.remove("open");
  state.selectedEditPlayerId = null;
  renderPlayersView();
}

function renderEditLevelCard() {
  const p = getPlayer(state.selectedEditPlayerId);
  if (!p) return;

  document.getElementById("editPlayerName").textContent = p.name;
  document.getElementById("editOldLevel").textContent = `Level ${p.level}`;
  document.getElementById("editNewLevelPreview").textContent = `Level ${state.selectedEditNewLevel}`;

  document.querySelectorAll("#editLevelSeg .seg-btn").forEach((b) => {
    b.classList.toggle("active", b.dataset.value === state.selectedEditNewLevel);
  });

  const levelSama = p.level === state.selectedEditNewLevel;
  const kotakPeringatan = document.getElementById("editLevelWarning");
  const tombolSimpan = document.getElementById("btnSaveLevel");

  if (levelSama) {
    kotakPeringatan.style.display = "flex";
    document.getElementById("editLevelWarningText").textContent =
      `Level saat ini adalah Level ${p.level}. Pilih level lain untuk memperbarui.`;
    tombolSimpan.disabled = true;
  } else {
    kotakPeringatan.style.display = "none";
    tombolSimpan.disabled = false;
  }
}

