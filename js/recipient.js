/* Project Bloodline — js/recipient.js | Recipient portal logic. Requires: data.js, store.js, ui.js (loaded before). */
;
    ;
    
    let activeGroup = "All";
    let activeCompat = "O−";
    
    
    function initials(name) { return name.split(" ").map(p => p[0]).slice(0,2).join("").toUpperCase(); }
    function badge(g) { return `<span class="badge ${BADGE[g] || "g-op"}">${g}</span>`; }
    function donorRow(d) {
      if (typeof donorCard === "function" && donorCard !== donorRow) { try { return donorCard(d); } catch (e) {} }
      return `<article class="donor donor-clickable" data-donor-id="${d.id}" tabindex="0" role="button" aria-label="View details of ${d.name}"><div class="avatar">${initials(d.name)}</div><div><h3>${d.name}</h3><div class="meta"><span>${d.area}, ${d.city}</span><a href="tel:${String(d.phone).replace(/[\s\-()]/g,"")}">${d.phone}</a></div><span class="view-hint">Tap to view details →</span></div>${badge(d.group)}</article>`;
    }
    function toast(msg) { const t = $("#toast"); t.textContent = msg; t.classList.add("show"); setTimeout(() => t.classList.remove("show"), 2600); }
    function filteredDonors() {
      const q = ($("#areaSearch")?.value || "").trim().toLowerCase();
      return store.donors.filter(d => {
        const gOk = activeGroup === "All" || d.group === activeGroup;
        const hay = `${d.name} ${d.city} ${d.area} ${d.phone} ${d.group}`.toLowerCase();
        const qOk = !q || hay.includes(q);
        return gOk && qOk;
      });
    }
    function renderDirectory() {
      const list = filteredDonors();
      $("#donorList").innerHTML = list.length ? list.map(donorRow).join("") : `<div class="empty">No donors match this group and area.</div>`;
    }
    function renderChips() {
      const wrap = $("#groupChips");
      wrap.innerHTML = ["All", ...GROUPS].map(g => `<button class="chip ${g===activeGroup?"active":""}" data-g="${g}">${g}</button>`).join("");
      wrap.onclick = e => { const b = e.target.closest("[data-g]"); if (!b) return; activeGroup = b.dataset.g; renderChips(); renderDirectory(); };
    }
    function renderEmerg() {
      $("#eList").innerHTML = store.emerg.map(e => `
        <article class="e-card ${e.status==="Critical"?"critical":""}">
          <div><h3>${e.group} · ${e.location}</h3><p>${e.info}</p></div>
          <span class="status ${e.status==="Critical"?"crit":"urg"}">${e.status}</span>
        </article>`).join("") || `<div class="empty">No emergency broadcasts right now.</div>`;
    }
    function renderMatrix() {
      const head = `<tr><th class="corner"></th>${GROUPS.map(g=>`<th>${g}</th>`).join("")}</tr>`;
      const body = GROUPS.map(r => `<tr><th>${r}</th>${GROUPS.map(d => { const yes = COMPAT[r].receiveFrom.includes(d); const uni = d === "O−" && yes; return `<td class="${yes?"yes":""} ${uni?"uni":""}">${yes?"+":""}</td>`; }).join("")}</tr>`).join("");
      $("#matrix").innerHTML = head + body;
    }
    function renderCompat() {
      $("#compatBtns").innerHTML = GROUPS.map(g => `<button class="chip ${g===activeCompat?"active":""}" data-c="${g}">${g}</button>`).join("");
      const c = COMPAT[activeCompat];
      $("#donateTo").innerHTML = c.donateTo.map(g => badge(g)).join("");
      $("#receiveFrom").innerHTML = c.receiveFrom.map(g => badge(g)).join("");
      let note = `${activeCompat} red cells can be given to ${c.donateTo.join(", ")}.`;
      if (activeCompat === "O−") note = "O− is the universal red-cell donor.";
      if (activeCompat === "AB+") note = "AB+ is the universal red-cell recipient.";
      $("#compatNote").textContent = note;
      renderMatrix();
    }
    document.addEventListener("click", (e) => {
      const c = e.target.closest("[data-c]");
      if (c) { activeCompat = c.dataset.c; renderCompat(); }
    });
    $("#emergForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const f = e.target;
      store.emerg.unshift({ id: Date.now(), group: f.group.value, location: f.location.value.trim(), status: f.status.value, info: f.info.value.trim() });
      save(); f.reset(); toast("Emergency broadcast posted."); renderEmerg();
    });
    $("#areaSearch").addEventListener("input", renderDirectory);
    renderChips(); renderDirectory(); renderEmerg(); renderCompat();
    lucide.createIcons();
