/* Project Bloodline — js/donor.js | Donor portal logic. Requires: data.js, store.js, ui.js (loaded before). */
;
    
    
    function toast(msg) {
      const t = $("#toast");
      t.textContent = msg;
      t.classList.add("show");
      setTimeout(() => t.classList.remove("show"), 2600);
    }
    function digitsOnly(phone) { return String(phone).replace(/\D/g, ""); }
    function normalizePhone(phone) {
      var d = digitsOnly(phone);
      /* Accept 10-digit Indian mobile, with optional 91 / +91 / 0 prefix. */
      if (d.length === 12 && d.indexOf("91") === 0) d = d.slice(2);
      if (d.length === 11 && d.charAt(0) === "0") d = d.slice(1);
      return d;
    }
    function isValidIndianMobile(phone) {
      var d = normalizePhone(phone);
      return /^[6-9]\d{9}$/.test(d);
    }
    function isDuplicatePhone(phone) {
      var d = normalizePhone(phone);
      return store.donors.some(function (x) { return normalizePhone(x.phone) === d; });
    }
    function renderDonorEmerg() {
      var el = $("#donorEmergList");
      if (!el) return;
      el.innerHTML = store.emerg.map(function (e) {
        return `<article class="e-card ${e.status === "Critical" ? "critical" : ""}">` +
          `<div><h3>${e.group} · ${e.location}</h3><p>${e.info}</p></div>` +
          `<span class="status ${e.status === "Critical" ? "crit" : "urg"}">${e.status}</span></article>`;
      }).join("") || `<div class="empty">No emergency broadcasts right now.</div>`;
    }
    function showDonorSuccess(d) {
      var box = $("#donorSuccess");
      var form = $("#donorForm");
      if (!box || !form) return;
      $("#successName").textContent = d.name.split(" ")[0] || d.name;
      $("#successGroup").textContent = d.group;
      $("#successGroup2").textContent = d.group;
      $("#successCity").textContent = d.city;
      $("#successPhone").textContent = d.phone;
      form.hidden = true;
      box.hidden = false;
      refreshIcons();
      box.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    $("#donorForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const f = e.target;
      const name = f.name.value.trim();
      const group = f.group.value;
      const city = f.city.value.trim();
      const area = f.area.value.trim();
      const phone = f.phone.value.trim();
      if (name.length < 2) { toast("Please enter your full name."); return; }
      if (!group) { toast("Please select your blood group."); return; }
      if (!isValidIndianMobile(phone)) { toast("Enter a valid 10-digit Indian mobile number."); return; }
      if (isDuplicatePhone(phone)) { toast("This number is already registered."); return; }
      const d = { id: Date.now(), name, group, city, area, phone };
      store.donors.push(d);
      save(); f.reset();
      toast("Thank you, " + d.name.split(" ")[0] + "! You are registered.");
      showDonorSuccess(d);
    });
    $("#registerAnother")?.addEventListener("click", () => {
      $("#donorSuccess").hidden = true;
      $("#donorForm").hidden = false;
      $("#donorForm").scrollIntoView({ behavior: "smooth", block: "center" });
    });
    renderDonorEmerg();
    lucide.createIcons();
