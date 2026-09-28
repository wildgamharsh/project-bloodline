// ========== DATA ==========
const GROUPS = ["O−", "O+", "A−", "A+", "B−", "B+", "AB−", "AB+"];
const COMPAT = {
  "O−": { donateTo: GROUPS.slice(), receiveFrom: ["O−"] },
  "O+": { donateTo: ["O+", "A+", "B+", "AB+"], receiveFrom: ["O−", "O+"] },
  "A−": { donateTo: ["A−", "A+", "AB−", "AB+"], receiveFrom: ["O−", "A−"] },
  "A+": { donateTo: ["A+", "AB+"], receiveFrom: ["O−", "O+", "A−", "A+"] },
  "B−": { donateTo: ["B−", "B+", "AB−", "AB+"], receiveFrom: ["O−", "B−"] },
  "B+": { donateTo: ["B+", "AB+"], receiveFrom: ["O−", "O+", "B−", "B+"] },
  "AB−": { donateTo: ["AB−", "AB+"], receiveFrom: ["O−", "A−", "B−", "AB−"] },
  "AB+": { donateTo: ["AB+"], receiveFrom: GROUPS.slice() }
};
const BADGE = { "O−": "g-on", "O+": "g-op", "A−": "g-an", "A+": "g-ap", "B−": "g-bn", "B+": "g-bp", "AB−": "g-abn", "AB+": "g-abp" };

const seedDonors = [
  { id: 1, name: "Amelia Hart", group: "O−", city: "Seattle", area: "Capitol Hill", phone: "206-555-0142" },
  { id: 2, name: "James Okonkwo", group: "O+", city: "Chicago", area: "Lincoln Park", phone: "312-555-0198" },
  { id: 3, name: "Priya Raman", group: "B+", city: "Austin", area: "East Cesar Chavez", phone: "512-555-0166" },
  { id: 4, name: "Noah Berger", group: "A+", city: "Boston", area: "West End", phone: "617-555-0114" },
  { id: 5, name: "Sofia Alvarez", group: "AB+", city: "Miami", area: "Coral Gables", phone: "305-555-0177" },
  { id: 6, name: "Owen MacLeod", group: "O−", city: "Seattle", area: "Ballard", phone: "206-555-0181" },
  { id: 7, name: "Hana Ito", group: "A−", city: "Portland", area: "Alberta Arts", phone: "503-555-0129" },
  { id: 8, name: "Marcus Reed", group: "B−", city: "Denver", area: "RiNo", phone: "303-555-0153" },
  { id: 9, name: "Leila Haddad", group: "O+", city: "Brooklyn", area: "Park Slope", phone: "718-555-0104" },
  { id: 10, name: "Theo Nilsen", group: "AB−", city: "Minneapolis", area: "Northeast", phone: "612-555-0190" },
  { id: 11, name: "Grace Adeyemi", group: "A+", city: "Atlanta", area: "Old Fourth Ward", phone: "404-555-0138" },
  { id: 12, name: "Callum Wright", group: "O−", city: "Boston", area: "Beacon Hill", phone: "617-555-0162" },
  { id: 13, name: "Maya Chen", group: "B+", city: "Seattle", area: "Fremont", phone: "206-555-0120" },
  { id: 14, name: "Diego Vargas", group: "O+", city: "Phoenix", area: "Roosevelt Row", phone: "602-555-0188" },
  { id: 15, name: "Elena Volkov", group: "A−", city: "Chicago", area: "Wicker Park", phone: "312-555-0144" },
  { id: 16, name: "Samir Patel", group: "AB+", city: "Austin", area: "Mueller", phone: "512-555-0171" }
];
const seedEmerg = [
  { id: 1, group: "O−", location: "Seattle · Harborview Medical", status: "Critical", info: "Trauma patient, surgery in 2 hours. Three units of O− red cells requested." },
  { id: 2, group: "AB−", location: "Boston · Mass General, West End", status: "Urgent", info: "Scheduled cardiac case tomorrow morning. One unit AB− preferred; compatible alternatives listed in the matrix." }
];

// ========== STATE ==========
const store = {
  donors: JSON.parse(localStorage.getItem("helix.donors") || "null") || seedDonors,
  emerg: JSON.parse(localStorage.getItem("helix.emerg") || "null") || seedEmerg
};
const save = () => {
  localStorage.setItem("helix.donors", JSON.stringify(store.donors));
  localStorage.setItem("helix.emerg", JSON.stringify(store.emerg));
};

let activeGroup = "All";
let activeCompat = "O−";

// ========== HELPERS ==========
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

function initials(name) {
  return name.split(" ").map(p => p[0]).slice(0, 2).join("").toUpperCase();
}
function badge(g) {
  const sup = g.replace('+', '<sup>+</sup>').replace('−', '<sup>−</sup>');
  return `<span class="badge ${BADGE[g] || "g-op"}">${sup}</span>`;
}
function donorRow(d) {
  return `<article class="donor">
    <div class="avatar">${initials(d.name)}</div>
    <div>
      <h3>${d.name}</h3>
      <div class="meta">
        <span>${d.area}, ${d.city}</span>
        <a href="tel:${d.phone.replace(/\s/g, "")}">${d.phone}</a>
      </div>
    </div>
    ${badge(d.group)}
  </article>`;
}
function toast(msg) {
  const t = $("#toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2600);
}

// ========== RENDER ==========
function filteredDonors() {
  const q = ($("#areaSearch")?.value || "").trim().toLowerCase();
  return store.donors.filter(d => {
    const gOk = activeGroup === "All" || d.group === activeGroup;
    const qOk = !q || d.city.toLowerCase().includes(q) || d.area.toLowerCase().includes(q);
    return gOk && qOk;
  });
}

function renderDirectory() {
  const list = filteredDonors();
  const emptyMsg = "No donors match this group and area. Try another neighbourhood or post an emergency request.";
  $("#donorList").innerHTML = list.length
    ? list.map(donorRow).join("")
    : `<div class="empty">${emptyMsg}</div>`;
}

function renderChips() {
  const wrap = $("#groupChips");
  if (!wrap) return;
  wrap.innerHTML = ["All", ...GROUPS].map(g =>
    `<button class="chip ${g === activeGroup ? "active" : ""}" data-g="${g}">${g}</button>`
  ).join("");
  wrap.onclick = e => {
    const b = e.target.closest("[data-g]");
    if (!b) return;
    activeGroup = b.dataset.g;
    renderChips();
    renderDirectory();
  };
}

function renderEmerg() {
  const list = $("#eList");
  if (!list) return;
  list.innerHTML = store.emerg.map(e => `
    <article class="e-card ${e.status === "Critical" ? "critical" : ""}">
      <div>
        <h3>${e.group} · ${e.location}</h3>
        <p>${e.info}</p>
      </div>
      <span class="status ${e.status === "Critical" ? "crit" : "urg"}">${e.status}</span>
    </article>`).join("") || `<div class="empty">No emergency broadcasts right now.</div>`;
}

function renderMatrix() {
  const matrix = $("#matrix");
  if (!matrix) return;
  const head = `<tr><th class="corner"></th>${GROUPS.map(g => `<th>${g}</th>`).join("")}</tr>`;
  const body = GROUPS.map(rec => `<tr><th>${rec}</th>${GROUPS.map(don => {
    const yes = COMPAT[rec].receiveFrom.includes(don);
    const uni = don === "O−" && yes;
    return `<td class="${yes ? "yes" : ""} ${uni ? "uni" : ""}">${yes ? "+" : ""}</td>`;
  }).join("")}</tr>`).join("");
  matrix.innerHTML = head + body;
}

function renderCompat() {
  const btns = $("#compatBtns");
  if (!btns) return;
  btns.innerHTML = GROUPS.map(g =>
    `<button class="chip ${g === activeCompat ? "active" : ""}" data-c="${g}">${g}</button>`
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

// ========== SHARED EVENTS ==========
document.addEventListener("click", (e) => {
  const c = e.target.closest("[data-c]");
  if (c) { activeCompat = c.dataset.c; renderCompat(); lucide.createIcons(); }
});

const menuBtn = $("#menuBtn");
if (menuBtn) {
  menuBtn.addEventListener("click", () => $("#navLinks")?.classList.toggle("open"));
}

const bellBtn = $("#bellBtn");
if (bellBtn) {
  bellBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    $("#bellPanel")?.classList.toggle("open");
  });
  document.addEventListener("click", () => $("#bellPanel")?.classList.remove("open"));
}

const areaSearch = $("#areaSearch");
if (areaSearch) {
  areaSearch.addEventListener("input", renderDirectory);
}

const donorForm = $("#donorForm");
if (donorForm) {
  donorForm.addEventListener("submit", (e) => {
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
    if (donorForm.dataset.redirect) {
      setTimeout(() => { window.location.href = donorForm.dataset.redirect; }, 900);
    } else {
      if (typeof refresh === "function") refresh();
      if (typeof setView === "function") setView("donors");
    }
  });
}

const emergForm = $("#emergForm");
if (emergForm) {
  emergForm.addEventListener("submit", (e) => {
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
    if (typeof refresh === "function") refresh();
  });
}

// ========== INIT ==========
lucide.createIcons();
