/* Project Bloodline — js/admin.js | Admin portal logic. Requires: data.js, store.js, ui.js (loaded before). */
let activeGroup = "All";
    let activeCompat = "O−";

    
    

    function initials(name) {
      return name.split(" ").map(p => p[0]).slice(0,2).join("").toUpperCase();
    }
    function badge(g) {
      return `<span class="badge ${BADGE[g] || "g-op"}">${g}</span>`;
    }
    function donorRow(d) {
      return `<article class="donor donor-clickable" data-donor-id="${d.id}" tabindex="0" role="button" aria-label="View details of ${d.name}">
        <div class="avatar">${initials(d.name)}</div>
        <div>
          <h3>${d.name}</h3>
          <div class="meta">
            <span>${d.area}, ${d.city}</span>
            <a href="tel:${String(d.phone).replace(/[\s\-()]/g,"")}">${d.phone}</a>
          </div>
          <span class="view-hint">Tap to view details →</span>
        </div>
        <div style="display:flex;gap:8px;align-items:center">${badge(d.group)}<button class="btn btn-line btn-sm" data-manage-donor="${d.id}" title="Manage donor (admin)">Manage</button></div>
      </article>`;
    }
    function toast(msg) {
      const t = $("#toast");
      t.textContent = msg;
      t.classList.add("show");
      setTimeout(() => t.classList.remove("show"), 2600);
    }
    function digitsOnly(phone) { return String(phone).replace(/\D/g, ""); }
    function normalizePhone(phone) {
      var d = digitsOnly(phone);
      if (d.length === 12 && d.indexOf("91") === 0) d = d.slice(2);
      if (d.length === 11 && d.charAt(0) === "0") d = d.slice(1);
      return d;
    }
    function isValidIndianMobile(phone) { return /^[6-9]\d{9}$/.test(normalizePhone(phone)); }

    /* Manage modal — reuses the exact donor-modal combo from ui.js (overlay, dialog, actions). */
    function closeManageModal() {
      var m = document.getElementById("adminManageModal");
      if (m && m.parentNode) m.parentNode.removeChild(m);
      document.body.style.overflow = "";
    }
    function openManageModal(id) {
      var d = null;
      try { d = store.donors.filter(function (x) { return String(x.id) === String(id); })[0] || null; } catch (e) { d = null; }
      if (!d) return;
      closeManageModal();
      var overlay = document.createElement("div");
      overlay.className = "donor-modal-overlay";
      overlay.id = "adminManageModal";
      overlay.innerHTML =
        '<div class="donor-modal" role="dialog" aria-modal="true" aria-label="Manage donor">' +
          '<button class="donor-modal-x" data-close-manage aria-label="Close">✕</button>' +
          '<div class="donor-modal-head"><div class="avatar avatar-lg">' + initials(d.name) + '</div>' +
          '<div><h2>' + d.name + '</h2><p>' + d.area + ', ' + d.city + '</p></div>' + badge(d.group) + '</div>' +
          '<form id="manageEditForm" style="margin-top:16px">' +
            '<label>Full name<input name="name" required maxlength="60" value="' + String(d.name).replace(/"/g, "") + '" /></label>' +
            '<div class="form-row">' +
              '<label>Blood group<select name="group" required>' + GROUPS.map(function (g) { return '<option' + (g === d.group ? ' selected' : '') + '>' + g + '</option>'; }).join('') + '</select></label>' +
              '<label>Contact number<input name="phone" required value="' + String(d.phone).replace(/"/g, "") + '" /></label>' +
            '</div>' +
            '<div class="form-row">' +
              '<label>City<input name="city" required value="' + String(d.city).replace(/"/g, "") + '" /></label>' +
              '<label>Neighbourhood / area<input name="area" required value="' + String(d.area).replace(/"/g, "") + '" /></label>' +
            '</div>' +
            '<div class="donor-modal-actions">' +
              '<button class="btn btn-primary" type="submit">Save changes</button>' +
              '<button class="btn btn-line" type="button" data-del-step="1">Delete donor</button>' +
            '</div>' +
          '</form>' +
        '</div>';
      document.body.appendChild(overlay);
      document.body.style.overflow = "hidden";
      overlay.addEventListener("click", function (e) {
        if (e.target === overlay || e.target.closest("[data-close-manage]")) { closeManageModal(); return; }
        var del = e.target.closest("[data-del-step]");
        if (del) {
          if (del.getAttribute("data-del-step") === "1") {
            del.setAttribute("data-del-step", "2");
            del.textContent = "Confirm delete?";
            del.classList.remove("btn-line");
            del.classList.add("btn-primary");
            toast("Click again to confirm delete.");
          } else {
            store.donors = store.donors.filter(function (x) { return String(x.id) !== String(d.id); });
            save(); closeManageModal(); refresh(); toast("Donor deleted by admin.");
          }
          return;
        }
      });
      overlay.querySelector("#manageEditForm").addEventListener("submit", function (e) {
        e.preventDefault();
        var f = e.target;
        var name = f.name.value.trim();
        var group = f.group.value;
        var city = f.city.value.trim();
        var area = f.area.value.trim();
        var phone = f.phone.value.trim();
        if (name.length < 2) { toast("Please enter a valid name."); return; }
        if (!isValidIndianMobile(phone)) { toast("Enter a valid 10-digit Indian mobile number."); return; }
        var dup = store.donors.some(function (x) { return String(x.id) !== String(d.id) && normalizePhone(x.phone) === normalizePhone(phone); });
        if (dup) { toast("This number belongs to another donor."); return; }
        d.name = name; d.group = group; d.city = city; d.area = area; d.phone = phone;
        save(); closeManageModal(); refresh(); toast("Donor updated.");
      });
      if (window.lucide) lucide.createIcons();
    }

    function setView(name) {
      $$(".view").forEach(v => v.classList.remove("active"));
      $("#view-" + name).classList.add("active");
      $$(".nav-links button").forEach(b => b.classList.toggle("active", b.dataset.view === name));
      $("#navLinks").classList.remove("open");
      window.scrollTo({ top: 0, behavior: "smooth" });
      if (name === "compat") renderCompat();
    }

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
      $("#donorList").innerHTML = list.length
        ? list.map(donorRow).join("")
        : `<div class="empty">No donors match this group and area. Try another neighbourhood or post an emergency request.</div>`;
    }

    function renderChips() {
      const wrap = $("#groupChips");
      wrap.innerHTML = ["All", ...GROUPS].map(g =>
        `<button class="chip ${g===activeGroup?"active":""}" data-g="${g}">${g}</button>`
      ).join("");
      wrap.onclick = e => {
        const b = e.target.closest("[data-g]");
        if (!b) return;
        activeGroup = b.dataset.g;
        renderChips();
        renderDirectory();
      };
    }

    function renderMetrics() {
      $("#mDonors").textContent = store.donors.length;
      $("#mEmerg").textContent = store.emerg.length;
      const covered = new Set(store.donors.map(d => d.group)).size;
      $("#mGroups").textContent = covered + "/8";

      const counts = Object.fromEntries(GROUPS.map(g => [g, store.donors.filter(d => d.group === g).length]));
      const max = Math.max(...Object.values(counts), 1);
      $("#groupBars").innerHTML = GROUPS.map(g => `
        <div class="bar-row">
          <span>${g}</span>
          <div class="track"><i style="width:${(counts[g]/max)*100}%"></i></div>
          <em>${counts[g]}</em>
        </div>`).join("");

      const pct = (g) => Math.round((counts[g] / store.donors.length) * 100) || 0;
      $("#ringOn").style.setProperty("--p", pct("O−"));
      $("#ringOnVal").textContent = pct("O−") + "%";
      $("#ringAbn").style.setProperty("--p", pct("AB−"));
      $("#ringAbnVal").textContent = pct("AB−") + "%";

      $("#insight").innerHTML = counts["O−"] < 3
        ? `<strong>Supply note.</strong> O− is thin in this directory (${counts["O−"]} donor${counts["O−"]===1?"":"s"}). It is the universal red-cell donor — ask eligible O− volunteers to register.`
        : `<strong>Supply note.</strong> ${counts["O−"]} O− donors are listed. AB+ remains the universal recipient; rare negatives still need neighbourhood coverage.`;

      $("#recentDonors").innerHTML = [...store.donors].slice(-5).reverse().map(donorRow).join("");

      const e = store.emerg[0];
      if (e) {
        $("#heroTitle").textContent = `${e.group} needed`;
        $("#heroText").textContent = e.info;
        $("#heroGroup").textContent = e.group;
        $("#heroLoc").textContent = e.location;
        const findBtn = document.querySelector('.hero-actions [data-filter]');
        if (findBtn) findBtn.dataset.filter = e.group;
      }

      const pending = Array.isArray(store.requests) ? store.requests : (store.requests = []);
      const pendHtml = pending.map(x =>
        `<div class="n-item"><strong>Pending: ${x.group}</strong>${x.location}</div>`
      ).join("");
      const liveHtml = store.emerg.map(x =>
        `<div class="n-item"><strong>${x.status}: ${x.group}</strong>${x.location}</div>`
      ).join("");
      $("#bellList").innerHTML = (pendHtml + liveHtml) || `<div class="n-item">No open requests.</div>`;
    }

    function renderEmerg() {
      if (!Array.isArray(store.requests)) store.requests = [];
      const reqEl = $("#reqList");
      if (reqEl) {
        reqEl.innerHTML = store.requests.map(r => `
          <article class="e-card">
            <div>
              <h3>${r.group} · ${r.location}</h3>
              <p>${r.info}</p>
              <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap">
                <button class="btn btn-primary btn-sm" data-approve-req="${r.id}">Approve & broadcast</button>
                <button class="btn btn-line btn-sm" data-reject-req="${r.id}">Reject</button>
              </div>
            </div>
            <span class="status ${r.status==="Critical"?"crit":"urg"}">${r.status} · pending</span>
          </article>
        `).join("") || `<div class="empty">No pending requests. Recipient posts appear here.</div>`;
      }
      $("#eList").innerHTML = store.emerg.map(e => `
        <article class="e-card ${e.status==="Critical"?"critical":""}">
          <div>
            <h3>${e.group} · ${e.location}</h3>
            <p>${e.info}</p>
            <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap">
              <button class="btn btn-primary btn-sm" data-view="donors" data-filter="${e.group}">Search ${e.group} donors</button>
              <button class="btn btn-line btn-sm" data-del-emerg="${e.id}">Close request</button>
            </div>
          </div>
          <span class="status ${e.status==="Critical"?"crit":"urg"}">${e.status}</span>
        </article>
      `).join("") || `<div class="empty">No emergency broadcasts right now.</div>`;
    }

    function renderMatrix() {
      const head = `<tr><th class="corner"></th>${GROUPS.map(g=>`<th>${g}</th>`).join("")}</tr>`;
      const body = GROUPS.map(rec => `<tr><th>${rec}</th>${
        GROUPS.map(don => {
          const yes = COMPAT[rec].receiveFrom.includes(don);
          const uni = don === "O−" && yes;
          return `<td class="${yes?"yes":""} ${uni?"uni":""}">${yes?"+":""}</td>`;
        }).join("")
      }</tr>`).join("");
      $("#matrix").innerHTML = head + body;
    }

    function renderCompat() {
      $("#compatBtns").innerHTML = GROUPS.map(g =>
        `<button class="chip ${g===activeCompat?"active":""}" data-c="${g}">${g}</button>`
      ).join("");
      const c = COMPAT[activeCompat];
      const tags = arr => arr.map(g => badge(g)).join("");
      $("#donateTo").innerHTML = tags(c.donateTo);
      $("#receiveFrom").innerHTML = tags(c.receiveFrom);
      let note = `${activeCompat} red cells can be given to ${c.donateTo.join(", ")}.`;
      if (activeCompat === "O−") note = "O− is the universal red-cell donor. It can be transfused to every group, which is why emergency stock is watched so closely.";
      if (activeCompat === "AB+") note = "AB+ is the universal red-cell recipient. It can receive from every group, but can donate only to other AB+ patients.";
      $("#compatNote").textContent = note;
      renderMatrix();
    }

    function greet() {
      const h = new Date().getHours();
      const g = h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
      $("#greet").textContent = `${g}, Admin`;
      $("#todayDate").textContent = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
    }

    function refresh() {
      renderMetrics();
      renderDirectory();
      renderEmerg();
      renderCompat();
      lucide.createIcons();
    }

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeManageModal();
    });
    document.addEventListener("click", (e) => {
      const manage = e.target.closest("[data-manage-donor]");
      if (manage) { openManageModal(manage.dataset.manageDonor); return; }
      const delE = e.target.closest("[data-del-emerg]");
      if (delE) {
        store.emerg = store.emerg.filter(x => String(x.id) !== delE.dataset.delEmerg);
        save(); refresh(); toast("Emergency request closed by admin.");
        return;
      }
      const approve = e.target.closest("[data-approve-req]");
      if (approve) {
        const req = (store.requests || []).filter(r => String(r.id) === approve.dataset.approveReq)[0];
        if (req) {
          store.requests = store.requests.filter(r => String(r.id) !== approve.dataset.approveReq);
          store.emerg.unshift({ id: req.id, group: req.group, location: req.location, status: req.status, info: req.info });
          save(); refresh(); toast("Request approved — now live.");
        }
        return;
      }
      const reject = e.target.closest("[data-reject-req]");
      if (reject) {
        store.requests = (store.requests || []).filter(r => String(r.id) !== reject.dataset.rejectReq);
        save(); refresh(); toast("Request rejected.");
        return;
      }
      const nav = e.target.closest("[data-view]");
      if (nav && nav.dataset.view) {
        if (nav.dataset.filter) {
          activeGroup = nav.dataset.filter;
          renderChips();
        }
        setView(nav.dataset.view);
        if (nav.dataset.filter) renderDirectory();
      }
      const c = e.target.closest("[data-c]");
      if (c) { activeCompat = c.dataset.c; renderCompat(); lucide.createIcons(); }
    });

    /* Admins manage — donors register via Donor portal. No admin-side donorForm by design. */

    $("#emergForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const f = e.target;
      store.emerg.unshift({
        id: Date.now(),
        group: f.group.value,
        location: f.location.value.trim(),
        status: f.status.value,
        info: f.info.value.trim()
      });
      save();
      f.reset();
      toast("Emergency broadcast is live on the dashboard.");
      refresh();
    });

    $("#areaSearch").addEventListener("input", renderDirectory);
    $("#menuBtn").addEventListener("click", () => $("#navLinks").classList.toggle("open"));
    $("#bellBtn").addEventListener("click", (e) => {
      e.stopPropagation();
      $("#bellPanel").classList.toggle("open");
    });
    document.addEventListener("click", () => $("#bellPanel").classList.remove("open"));

    greet();
    renderChips();
    refresh();
