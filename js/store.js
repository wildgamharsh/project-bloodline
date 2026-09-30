/* Project Bloodline — js/store.js | localStorage-backed store. Keys preserved (helix.*) so existing user data survives. Requires js/data.js first. */
function looksIndianDonors(list) {
  if (!Array.isArray(list) || !list.length) return false;
  /* Indian seeds carry +91 phones and Indian cities. Old US seeds had 206-/312- style phones. */
  const indianPhones = list.filter(function (d) { return typeof d.phone === "string" && d.phone.indexOf("+91") === 0; }).length;
  return indianPhones >= Math.ceil(list.length * 0.7);
}
function loadStore() {
  var storedVersion = null;
  try { storedVersion = JSON.parse(localStorage.getItem("helix.version") || "null"); } catch (e) { storedVersion = null; }
  var donors = null, emerg = null, requests = null;
  try { donors = JSON.parse(localStorage.getItem("helix.donors") || "null"); } catch (e) { donors = null; }
  try { emerg = JSON.parse(localStorage.getItem("helix.emerg") || "null"); } catch (e) { emerg = null; }
  try { requests = JSON.parse(localStorage.getItem("helix.requests") || "null"); } catch (e) { requests = null; }
  var expected = (typeof SEED_VERSION !== "undefined") ? SEED_VERSION : 2;
  /* Migrate: first visit, version bump, or stale non-Indian seed → reseed with Indian data. */
  if (!donors || !looksIndianDonors(donors) || storedVersion !== expected) {
    donors = seedDonors;
  }
  if (!emerg || storedVersion !== expected) {
    emerg = seedEmerg;
  }
  /* Pending recipient requests: separate from live admin broadcasts. No reseed — default to empty. */
  if (!Array.isArray(requests)) {
    requests = [];
  }
  try {
    localStorage.setItem("helix.donors", JSON.stringify(donors));
    localStorage.setItem("helix.emerg", JSON.stringify(emerg));
    localStorage.setItem("helix.requests", JSON.stringify(requests));
    localStorage.setItem("helix.version", JSON.stringify(expected));
  } catch (e) { /* storage full / private mode — keep in-memory copy */ }
  return { donors: donors, emerg: emerg, requests: requests };
}
const store = loadStore();
/* Backfill for pages loaded with an older store shape (no requests array). */
if (!Array.isArray(store.requests)) { store.requests = []; }
function saveStore() {
  localStorage.setItem("helix.donors", JSON.stringify(store.donors));
  localStorage.setItem("helix.emerg", JSON.stringify(store.emerg));
  localStorage.setItem("helix.requests", JSON.stringify(store.requests || []));
  try { localStorage.setItem("helix.version", JSON.stringify(typeof SEED_VERSION !== "undefined" ? SEED_VERSION : 2)); } catch (e) {}
}
/* Legacy alias: original pages called save(). */
function save() { saveStore(); }
