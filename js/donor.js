/* Project Bloodline — js/donor.js | Donor portal logic. Requires: data.js, store.js, ui.js (loaded before). */
;
    
    
    function toast(msg) {
      const t = $("#toast");
      t.textContent = msg;
      t.classList.add("show");
      setTimeout(() => t.classList.remove("show"), 2600);
    }
    $("#donorForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const f = e.target;
      const d = { id: Date.now(), name: f.name.value.trim(), group: f.group.value, city: f.city.value.trim(), area: f.area.value.trim(), phone: f.phone.value.trim() };
      store.donors.push(d);
      save(); f.reset();
      toast(d.name + " registered. Opening search…");
      setTimeout(() => window.location.href = "recipient.html", 900);
    });
    lucide.createIcons();
