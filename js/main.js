/* Project Bloodline — js/main.js | Main portal logic. Requires: data.js, store.js, ui.js (loaded before). */
let activeGroup = "All";
    let activeCompat = "O−";

    
    

    function initials(name) {
      return name.split(" ").map(p => p[0]).slice(0,2).join("").toUpperCase();
    }
    function badge(g) {
      return `<span class="badge ${BADGE[g] || "g-op"}">${g}</span>`;
    }
    function donorRow(d) {
      if (typeof donorCard === "function") { try { const html = donorCard(d); if (html && html.includes("donor-clickable")) return html; } catch (e) {} }
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
        ${badge(d.group)}
      </article>`;
    }
    function toast(msg) {
      const t = $("#toast");
      t.textContent = msg;
      t.classList.add("show");
      setTimeout(() => t.classList.remove("show"), 2600);
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

      $("#bellList").innerHTML = store.emerg.map(x =>
        `<div class="n-item"><strong>${x.status}: ${x.group}</strong>${x.location}</div>`
      ).join("") || `<div class="n-item">No open requests.</div>`;
    }

    function renderEmerg() {
      $("#eList").innerHTML = store.emerg.map(e => `
        <article class="e-card ${e.status==="Critical"?"critical":""}">
          <div>
            <h3>${e.group} · ${e.location}</h3>
            <p>${e.info}</p>
            <div style="margin-top:10px">
              <button class="btn btn-primary btn-sm" data-view="donors" data-filter="${e.group}">Search ${e.group} donors</button>
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
      $("#greet").textContent = `${g}, Alex`;
      $("#todayDate").textContent = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
    }

    function refresh() {
      renderMetrics();
      renderDirectory();
      renderEmerg();
      renderCompat();
      lucide.createIcons();
    }

    document.addEventListener("click", (e) => {
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

    $("#donorForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const f = e.target;
      const donor = {
        id: Date.now(),
        name: f.name.value.trim(),
        group: f.group.value,
        city: f.city.value.trim(),
        area: f.area.value.trim(),
        phone: f.phone.value.trim()
      };
      store.donors.push(donor);
      save();
      f.reset();
      toast(`${donor.name} added to the directory.`);
      refresh();
      setView("donors");
    });

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
