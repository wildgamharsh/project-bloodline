/* Project Bloodline — js/theme.js | Dark-mode toggle (ported from dev script.js, adapted to split structure). Requires nothing; include after lucide. */
(function () {
  function currentTheme() {
    return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
  }
  function updateToggleIcon() {
    var btn = document.getElementById("themeToggle");
    if (!btn) return;
    var iconName = currentTheme() === "dark" ? "sun" : "moon";
    btn.innerHTML = '<i data-lucide="' + iconName + '" width="18" height="18"></i>';
    if (typeof refreshIcons === "function") refreshIcons();
    else if (window.lucide) lucide.createIcons();
  }
  function setTheme(t) {
    if (t === "dark") document.documentElement.setAttribute("data-theme", "dark");
    else document.documentElement.removeAttribute("data-theme");
    try { localStorage.setItem("helix.theme", t); } catch (e) {}
    updateToggleIcon();
  }
  /* Expose for inline handlers / debugging. */
  window.__bloodlineTheme = { currentTheme: currentTheme, setTheme: setTheme };
  document.addEventListener("DOMContentLoaded", function () {
    var toggle = document.getElementById("themeToggle");
    if (toggle) {
      toggle.addEventListener("click", function () {
        setTheme(currentTheme() === "dark" ? "light" : "dark");
      });
    }
    updateToggleIcon();
  });
  /* If DOM already ready (script at end of body), wire immediately. */
  if (document.readyState !== "loading") {
    var toggleNow = document.getElementById("themeToggle");
    if (toggleNow && !toggleNow.__themeWired) {
      toggleNow.__themeWired = true;
      toggleNow.addEventListener("click", function () {
        setTheme(currentTheme() === "dark" ? "light" : "dark");
      });
    }
  }
})();
