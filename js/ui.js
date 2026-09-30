/* Project Bloodline — js/ui.js | Shared DOM helpers (function decls so pages may override). Requires nothing. */
function $(s, r) { return (r || document).querySelector(s); }
function $all(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
function $$(s, r) { return $all(s, r); }
function initials(name) {
  return name.split(" ").map(function (p) { return p[0]; }).slice(0, 2).join("").toUpperCase();
}
function badge(g) {
  return '<span class="badge ' + (BADGE[g] || "g-op") + '">' + g + "</span>";
}
function donorCard(d) {
  return '<article class="donor donor-clickable" data-donor-id="' + d.id + '" tabindex="0" role="button" aria-label="View details of ' + d.name.replace(/"/g, "") + '">' + '<div class="avatar">' + initials(d.name) + "</div><div><h3>" + d.name +
    '</h3><div class="meta"><span>' + d.area + ", " + d.city + "</span>" +
    '<a href="tel:' + String(d.phone).replace(/\s/g, "") + '" data-stop-modal>' + d.phone + "</a></div>" +
    '<span class="view-hint">Tap to view details →</span></div>' + badge(d.group) + "</article>";
}
/* donorRow alias kept for pages that call donorRow() directly. */
function donorRow(d) { return donorCard(d); }
function toast(msg) {
  const t = $("#toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(function () { t.classList.remove("show"); }, 2600);
}
function greeting(name) {
  const h = new Date().getHours();
  const g = h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
  return g + ", " + name;
}
function todayLong() {
  return new Date().toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric" });
}
function refreshIcons() { if (window.lucide) lucide.createIcons(); }

/* ---------- Donor detail modal (shared) ---------- */
/* Derives extra details not shown in the list row: age/gender, availability,
   donation history, next eligibility, compatibility. Falls back to deterministic
   pseudo-data for donors registered before these fields existed. */
function donorExtra(d) {
  var idNum = Number(d.id) || d.name.length;
  var age = d.age || (20 + (idNum % 18));
  var genders = ["Male", "Female"];
  var gender = d.gender || genders[idNum % 2];
  var availability = d.availability || (idNum % 7 === 0 ? "Busy until Oct" : "Available");
  var donations = (d.donations != null) ? d.donations : (1 + (idNum % 9));
  var lastDonation = d.lastDonation || (function () {
    var m = 1 + (idNum % 8), day = 1 + (idNum % 27);
    return "2026-" + ("0" + m).slice(-2) + "-" + ("0" + day).slice(-2);
  })();
  var nextEligible = (function () {
    try {
      var dt = new Date(lastDonation + "T00:00:00");
      dt.setDate(dt.getDate() + 90);
      return dt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    } catch (e) { return "90 days after last donation"; }
  })();
  var lastFmt = (function () {
    try { return new Date(lastDonation + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }); }
    catch (e) { return lastDonation; }
  })();
  var compat = (typeof COMPAT !== "undefined" && COMPAT[d.group]) ? COMPAT[d.group] : { donateTo: [], receiveFrom: [] };
  return { age: age, gender: gender, availability: availability, donations: donations, lastDonation: lastFmt, nextEligible: nextEligible, donateTo: compat.donateTo, receiveFrom: compat.receiveFrom };
}
function telHref(phone) { return "tel:" + String(phone).replace(/[\s\-()]/g, ""); }
function findDonorById(id) {
  try {
    var all = (typeof store !== "undefined" && store.donors) ? store.donors : [];
    return all.filter(function (d) { return String(d.id) === String(id); })[0] || null;
  } catch (e) { return null; }
}
function openDonorModal(donorOrId) {
  var d = (donorOrId && typeof donorOrId === "object") ? donorOrId : findDonorById(donorOrId);
  if (!d) return;
  closeDonorModal();
  var x = donorExtra(d);
  var availCls = String(x.availability).toLowerCase().indexOf("avail") === 0 ? "ok" : "busy";
  var overlay = document.createElement("div");
  overlay.className = "donor-modal-overlay";
  overlay.id = "donorModal";
  overlay.innerHTML =
    '<div class="donor-modal" role="dialog" aria-modal="true" aria-label="Donor details">' +
      '<button class="donor-modal-x" data-close-modal aria-label="Close">✕</button>' +
      '<div class="donor-modal-head"><div class="avatar avatar-lg">' + initials(d.name) + '</div>' +
      '<div><h2>' + d.name + '</h2><p>' + d.area + ", " + d.city + '</p></div>' + badge(d.group) + '</div>' +
      '<div class="donor-modal-status"><span class="avail ' + availCls + '">' + x.availability + '</span>' +
      '<span class="d-id">Donor ID · BL-' + String(d.id).slice(-6) + '</span></div>' +
      '<div class="donor-modal-grid">' +
        '<div><label>Age</label><b>' + x.age + ' yrs</b></div>' +
        '<div><label>Gender</label><b>' + x.gender + '</b></div>' +
        '<div><label>Blood group</label><b>' + d.group + '</b></div>' +
        '<div><label>Total donations</label><b>' + x.donations + '</b></div>' +
        '<div><label>Last donation</label><b>' + x.lastDonation + '</b></div>' +
        '<div><label>Next eligible</label><b>' + x.nextEligible + '</b></div>' +
      '</div>' +
      '<div class="donor-modal-sec"><h3>Contact</h3>' +
        '<a class="modal-phone" href="' + telHref(d.phone) + '">' + d.phone + '</a>' +
        '<p class="muted">' + d.area + ", " + d.city + ", India · prefers calls 10am–8pm IST</p></div>" +
      '<div class="donor-modal-sec"><h3>Can donate to</h3><div class="tag-list">' +
        x.donateTo.map(function (g) { return badge(g); }).join("") + '</div></div>' +
      '<div class="donor-modal-sec"><h3>Can receive from</h3><div class="tag-list">' +
        x.receiveFrom.map(function (g) { return badge(g); }).join("") + '</div></div>' +
      '<div class="donor-modal-actions">' +
        '<a class="btn btn-primary" href="' + telHref(d.phone) + '">Call donor</a>' +
        '<button class="btn btn-line" data-copy-phone="' + d.phone.replace(/"/g, "") + '">Copy number</button>' +
      '</div>' +
    '</div>';
  document.body.appendChild(overlay);
  document.body.style.overflow = "hidden";
  overlay.addEventListener("click", function (e) {
    if (e.target === overlay || e.target.closest("[data-close-modal]")) { closeDonorModal(); return; }
    var cp = e.target.closest("[data-copy-phone]");
    if (cp) {
      var num = cp.getAttribute("data-copy-phone");
      if (navigator.clipboard) { navigator.clipboard.writeText(num).then(function () { toast("Number copied: " + num); }); }
      else { toast(num); }
    }
  });
  refreshIcons();
}
function closeDonorModal() {
  var m = document.getElementById("donorModal");
  if (m && m.parentNode) m.parentNode.removeChild(m);
  document.body.style.overflow = "";
}
/* Global wiring: Escape closes, Enter/Space on focused card opens. Delegated
   donor-card clicks are attached per-page (recipient/admin/main) but this
   fallback covers any page that forgot to wire it. */
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") closeDonorModal();
  if ((e.key === "Enter" || e.key === " ") && e.target && e.target.classList && e.target.classList.contains("donor-clickable")) {
    e.preventDefault();
    openDonorModal(e.target.getAttribute("data-donor-id"));
  }
});
document.addEventListener("click", function (e) {
  /* Interactive children (call link, remove button) keep native behaviour — never open modal. */
  if (e.target.closest && e.target.closest("a, button")) return;
  var card = e.target.closest && e.target.closest(".donor-clickable[data-donor-id]");
  if (card) openDonorModal(card.getAttribute("data-donor-id"));
});
