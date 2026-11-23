/* ==================== SINKRONISASI KONTROL PARAMETER ==================== */
function sinkronkanKontrolParameter() {
  document.getElementById("btnAutoRotate").classList.toggle("active", state.autoRotate);

  const aturSwitch = (idInput, idLabel, nilai) => {
    const inp = document.getElementById(idInput);
    const lbl = document.getElementById(idLabel);
    if (!inp || !lbl) return;
    inp.checked = nilai;
    lbl.textContent = nilai ? "Aktif" : "Nonaktif";
    lbl.style.color = nilai ? "#2e7d5b" : "#94a3b8";
  };

  aturSwitch("paramPrioritize", "lblParamPrioritize", state.genParams.prioritizeZeroGame);
  aturSwitch("paramBalance", "lblParamBalance", state.genParams.balanceLevel);
  aturSwitch("paramPairReq", "lblParamPairReq", state.genParams.applyPairRequest);

  document.querySelectorAll("#paramCourtAlloc .seg-btn").forEach((b) => {
    b.classList.toggle("active", b.dataset.value === state.genParams.courtAllocation);
  });
}
