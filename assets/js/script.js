/* Doppelcheck — kritische Ausgabe
   ------------------------------------
   - DE/EN language toggle (data-de / data-en attributes)
   - Scroll-reveal for off-screen sections (IntersectionObserver)
   - Stops at the first user reduced-motion preference
*/

(function () {
    "use strict";

    // ---------------------------------------------------------------
    // Language toggle
    // ---------------------------------------------------------------
    const STORAGE_KEY = "doppelcheck:lang";
    const DEFAULT_LANG = document.documentElement.lang || "de";

    function applyLang(lang) {
        document.documentElement.lang = lang;
        document.querySelectorAll("[data-de][data-en]").forEach((el) => {
            const value = el.getAttribute("data-" + lang);
            if (value === null) return;
            // If the value (or the existing markup) contains HTML tags, treat as HTML.
            // Otherwise use textContent for safety.
            if (value.indexOf("<") >= 0 || el.children.length > 0) {
                el.innerHTML = value;
            } else {
                el.textContent = value;
            }
        });
        document.querySelectorAll(".lang-switch__opt").forEach((opt) => {
            opt.classList.toggle("is-active", opt.dataset.lang === lang);
        });
        try { localStorage.setItem(STORAGE_KEY, lang); } catch (_) { /* private mode */ }
    }

    function initLangSwitch() {
        let initial = DEFAULT_LANG;
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored === "de" || stored === "en") initial = stored;
        } catch (_) { /* ignore */ }
        applyLang(initial);

        const switchEl = document.querySelector(".lang-switch");
        if (!switchEl) return;
        switchEl.addEventListener("click", () => {
            const current = document.documentElement.lang === "en" ? "en" : "de";
            applyLang(current === "de" ? "en" : "de");
        });
        switchEl.querySelectorAll(".lang-switch__opt").forEach((opt) => {
            opt.addEventListener("click", (e) => {
                e.stopPropagation();
                applyLang(opt.dataset.lang);
            });
        });
    }

    // ---------------------------------------------------------------
    // Reveal-on-scroll for sections
    // ---------------------------------------------------------------
    function initReveal() {
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (reduced || !("IntersectionObserver" in window)) return;

        const targets = document.querySelectorAll(
            ".section-head, .feature, .repo, .anatomy__step, .install-card, .tier, .gemma-callout, .pull-quote, .changelog-card, .faq"
        );
        targets.forEach((el) => el.classList.add("reveal"));

        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-in");
                        io.unobserve(entry.target);
                    }
                });
            },
            { rootMargin: "0px 0px -10% 0px", threshold: 0.08 }
        );
        targets.forEach((el) => io.observe(el));
    }

    // ---------------------------------------------------------------
    // Bootstrap
    // ---------------------------------------------------------------
    function ready(fn) {
        if (document.readyState !== "loading") fn();
        else document.addEventListener("DOMContentLoaded", fn);
    }

    ready(() => {
        initLangSwitch();
        initReveal();
    });
})();
