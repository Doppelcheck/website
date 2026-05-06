/* Doppelcheck — landing page
   ------------------------------------
   - Language: defaults to system (de* → de, else en); user choice wins (localStorage)
   - Theme: cycles auto / light / dark; default = auto (follows system)
   - Reveal-on-scroll for sections (skipped under prefers-reduced-motion)
*/

(function () {
    "use strict";

    // ---------------------------------------------------------------
    // Language
    // ---------------------------------------------------------------
    const LANG_KEY = "doppelcheck:lang";

    function systemLang() {
        const langs = (navigator.languages && navigator.languages.length)
            ? navigator.languages
            : [navigator.language || "en"];
        for (const l of langs) {
            if (typeof l !== "string") continue;
            if (l.toLowerCase().startsWith("de")) return "de";
        }
        return "en";
    }

    function applyLang(lang) {
        document.documentElement.lang = lang;
        document.querySelectorAll("[data-de][data-en]").forEach((el) => {
            const value = el.getAttribute("data-" + lang);
            if (value === null) return;
            // If the value (or the existing markup) contains HTML tags, treat as HTML.
            if (value.indexOf("<") >= 0 || el.children.length > 0) {
                el.innerHTML = value;
            } else {
                el.textContent = value;
            }
        });
        document.querySelectorAll(".lang-switch__opt").forEach((opt) => {
            opt.classList.toggle("is-active", opt.dataset.lang === lang);
        });
        try { localStorage.setItem(LANG_KEY, lang); } catch (_) { /* private mode */ }
    }

    function initLangSwitch() {
        let initial = null;
        try {
            const stored = localStorage.getItem(LANG_KEY);
            if (stored === "de" || stored === "en") initial = stored;
        } catch (_) { /* ignore */ }
        if (!initial) initial = systemLang();
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
    // Theme — two-state, system-default
    //
    //   - First load with no stored preference: follow the OS via
    //     `color-scheme: light dark` + `light-dark()`; the topbar marks the
    //     icon that matches the system as active. The CSS already renders
    //     correctly without any data-theme being set.
    //   - First click on an icon: pin that side via [data-theme="…"], persist.
    //   - Subsequent clicks toggle between light and dark.
    //   - While no stored preference, listen to prefers-color-scheme and
    //     update the active marker live.
    // ---------------------------------------------------------------
    const THEME_KEY = "doppelcheck:theme";

    function readStoredTheme() {
        try {
            const v = localStorage.getItem(THEME_KEY);
            if (v === "light" || v === "dark") return v;
        } catch (_) { /* ignore */ }
        return null;
    }

    function systemTheme() {
        return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark" : "light";
    }

    /** Mark the option matching `effective` as active in the topbar. */
    function paintActiveOpt(effective) {
        document.querySelectorAll(".theme-switch__opt").forEach((opt) => {
            opt.classList.toggle("is-active", opt.dataset.themeOpt === effective);
        });
    }

    /**
     * Apply a theme.
     * - "light" / "dark": pin via data-theme + persist.
     * - null:             clear data-theme + clear storage (back to auto).
     */
    function applyTheme(theme) {
        const root = document.documentElement;
        if (theme === "light" || theme === "dark") {
            root.setAttribute("data-theme", theme);
            try { localStorage.setItem(THEME_KEY, theme); } catch (_) {}
            paintActiveOpt(theme);
        } else {
            root.removeAttribute("data-theme");
            try { localStorage.removeItem(THEME_KEY); } catch (_) {}
            paintActiveOpt(systemTheme());
        }
    }

    function initThemeSwitch() {
        const stored = readStoredTheme();
        applyTheme(stored);   // null → auto, otherwise pin

        const switchEl = document.querySelector(".theme-switch");
        if (!switchEl) return;

        // Click an option to pin that side. Click the active one to release
        // back to auto/system.
        switchEl.querySelectorAll(".theme-switch__opt").forEach((opt) => {
            opt.addEventListener("click", (e) => {
                e.stopPropagation();
                const want = opt.dataset.themeOpt;          // "light" | "dark"
                const current = readStoredTheme();
                applyTheme(current === want ? null : want);
            });
        });

        // While no stored preference, follow OS changes live.
        if (window.matchMedia) {
            const mq = window.matchMedia("(prefers-color-scheme: dark)");
            const onChange = () => {
                if (readStoredTheme() === null) paintActiveOpt(systemTheme());
            };
            if (mq.addEventListener) mq.addEventListener("change", onChange);
            else if (mq.addListener) mq.addListener(onChange); // legacy Safari
        }
    }


    // ---------------------------------------------------------------
    // Reveal-on-scroll
    // ---------------------------------------------------------------
    function initReveal() {
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (reduced || !("IntersectionObserver" in window)) return;

        const targets = document.querySelectorAll(
            ".block__head, .feature, .step, .faq, .demo, .devs__card, .about-grid"
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
        initThemeSwitch();
        initReveal();
    });
})();
