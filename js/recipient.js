/* Project Bloodline — js/recipient.js | Recipient portal: search + post-only requests. Compatibility lives in donor cards + Admin matrix. */
;
    ;
    
    let activeGroup = "All";
    
    
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
      /* Post-only portal: recipients see only their own sent requests, never the live board. */
      if (!Array.isArray(store.requests)) store.requests = [];
      const myEl = $("#myReqList");
      if (!myEl) return;
      myEl.innerHTML = store.requests.map(r => `
          <article class="e-card">
            <div><h3>${r.group} · ${r.location}</h3><p>${r.info}</p><span class="status urg">Pending approval</span>
              <div style="margin-top:10px"><button class="btn btn-line btn-sm" data-cancel-req="${r.id}">Cancel request</button></div>
            </div>
            <span class="status ${r.status==="Critical"?"crit":"urg"}">${r.status}</span>
          </article>`).join("") || `<div class="empty">No requests sent yet. Your posts appear here until admin approves them.</div>`;
    }
    document.addEventListener("click", (e) => {
      const cancel = e.target.closest("[data-cancel-req]");
      if (cancel) {
        store.requests = (store.requests || []).filter(r => String(r.id) !== cancel.dataset.cancelReq);
        save(); renderEmerg(); toast("Request cancelled.");
      }
    });
    $("#emergForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const f = e.target;
      if (!Array.isArray(store.requests)) store.requests = [];
      store.requests.unshift({ id: Date.now(), group: f.group.value, location: f.location.value.trim(), status: f.status.value, info: f.info.value.trim() });
      save(); f.reset(); toast("Request sent for admin approval."); renderEmerg();
    });
    $("#areaSearch").addEventListener("input", renderDirectory);
    renderChips(); renderDirectory(); renderEmerg();
    lucide.createIcons();
