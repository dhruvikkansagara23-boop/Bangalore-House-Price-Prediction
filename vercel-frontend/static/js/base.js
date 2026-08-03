/* ---------------------------------------------------------
   base.js — shared across every page
   Handles: dark-mode theme toggle, mobile nav collapse
--------------------------------------------------------- */

function initTheme() {
    var toggle = document.getElementById("themeToggle");
    if (!toggle) return;

    var saved = localStorage.getItem("theme");

    if (saved === "dark") {
        document.documentElement.setAttribute("data-theme", "dark");
        toggle.textContent = "☀️";
    }

    toggle.addEventListener("click", function () {
        var isDark = document.documentElement.getAttribute("data-theme") === "dark";
        if (isDark) {
            document.documentElement.removeAttribute("data-theme");
            toggle.textContent = "🌙";
            localStorage.setItem("theme", "light");
        } else {
            document.documentElement.setAttribute("data-theme", "dark");
            toggle.textContent = "☀️";
            localStorage.setItem("theme", "dark");
        }
    });
}

function initMobileNav() {
    var navToggle = document.getElementById("navToggle");
    var navLinks  = document.getElementById("navLinks");
    if (!navToggle || !navLinks) return;

    navToggle.addEventListener("click", function () {
        navLinks.classList.toggle("open");
    });

    // Close the menu after a link is tapped (mobile UX nicety)
    navLinks.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", function () {
            navLinks.classList.remove("open");
        });
    });
}

function warmUpBackend() {
    if (typeof API_BASE === "undefined") return;
    // Fire-and-forget: wakes the Render free-tier instance as early as
    // possible so it's less likely to be cold by the time the user
    // actually submits the prediction form.
    fetch(API_BASE + "/get_location_names", { mode: "cors" }).catch(function () {});
}

document.addEventListener("DOMContentLoaded", function () {
    initTheme();
    initMobileNav();
    warmUpBackend();
});
