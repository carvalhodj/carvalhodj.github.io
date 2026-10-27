(function () {
  "use strict";

  var root = document.documentElement;
  var systemDark = window.matchMedia("(prefers-color-scheme: dark)");
  var KEY_THEME = "retro:theme";

  function read(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }

  function write(key, value) {
    try {
      if (value === null) localStorage.removeItem(key);
      else localStorage.setItem(key, value);
    } catch (e) {}
  }

  function systemTheme() {
    return systemDark.matches ? "dark" : "light";
  }

  // --- Theme ---------------------------------------------------------------

  function applyTheme(theme, animate) {
    if (animate) {
      root.classList.add("theme-switching");
      window.setTimeout(function () { root.classList.remove("theme-switching"); }, 300);
    }
    root.setAttribute("data-theme", theme);

    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", getComputedStyle(root).getPropertyValue("--bg").trim());

    var next = theme === "dark" ? "light" : "dark";
    document.querySelectorAll('[data-toggle="theme"]').forEach(function (button) {
      button.setAttribute("aria-label", "Switch to " + next + " theme");
      button.setAttribute("title", "Switch to " + next + " theme");
    });
  }

  function toggleTheme() {
    var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    // Choosing what the OS already prefers means "follow the system" again.
    write(KEY_THEME, next === systemTheme() ? null : next);
    applyTheme(next, true);
  }

  systemDark.addEventListener("change", function () {
    if (!read(KEY_THEME)) applyTheme(systemTheme(), true);
  });

  // --- Font ----------------------------------------------------------------

  // Each switcher cycles through its fonts in order. `name` is the toggle's
  // data-toggle value, the <html> attribute suffix and the storage key suffix.
  var FONT_SWITCHERS = [
    {
      name: "font",
      what: "Typeface",
      fonts: {
        plex: "IBM Plex Sans",
        helvetica: "Helvetica",
        inter: "Inter",
        "dm-sans": "DM Sans",
        miranda: "Miranda Sans"
      }
    },
    {
      name: "prompt-font",
      what: "Prompt font",
      fonts: { fira: "Fira Code", bios: "IBM BIOS" }
    }
  ];

  function nextFont(switcher, font) {
    var keys = Object.keys(switcher.fonts);
    return keys[(keys.indexOf(font) + 1) % keys.length];
  }

  function applyFont(switcher, font) {
    root.setAttribute("data-" + switcher.name, font);
    var label = switcher.what + ": " + switcher.fonts[font] +
      ". Switch to " + switcher.fonts[nextFont(switcher, font)];
    document.querySelectorAll('[data-toggle="' + switcher.name + '"]').forEach(function (button) {
      button.setAttribute("aria-label", label);
      button.setAttribute("title", label);
    });
  }

  function setupFontSwitcher(switcher) {
    var buttons = document.querySelectorAll('[data-toggle="' + switcher.name + '"]');
    if (!buttons.length) return;

    var current = root.getAttribute("data-" + switcher.name);
    applyFont(switcher, switcher.fonts[current] ? current : Object.keys(switcher.fonts)[0]);

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        var next = nextFont(switcher, root.getAttribute("data-" + switcher.name));
        write("retro:" + switcher.name, next);
        applyFont(switcher, next);
      });
    });
  }

  // --- Code blocks -----------------------------------------------------------

  function enhanceCodeBlocks() {
    var blocks = document.querySelectorAll("div.highlighter-rouge, figure.highlight");

    blocks.forEach(function (block) {
      var code = block.querySelector("pre code") || block.querySelector("pre");
      if (!code) return;

      var match = (block.className + " " + code.className).match(/language-([\w+#-]+)/);
      var lang = code.getAttribute("data-lang") || (match ? match[1] : "code");
      if (lang === "plaintext") lang = "text";

      var bar = document.createElement("div");
      bar.className = "code-bar";

      var label = document.createElement("span");
      label.className = "code-lang";
      label.textContent = lang;
      bar.appendChild(label);

      if (navigator.clipboard) {
        var button = document.createElement("button");
        button.type = "button";
        button.className = "code-copy";
        button.textContent = "copy";
        button.setAttribute("aria-label", "Copy code to clipboard");
        button.addEventListener("click", function () {
          // Skip line-number gutters when present.
          var source = block.querySelector(".rouge-code pre") || code;
          navigator.clipboard.writeText(source.innerText.replace(/\n$/, "")).then(function () {
            button.textContent = "copied";
            button.setAttribute("data-copied", "");
            window.setTimeout(function () {
              button.textContent = "copy";
              button.removeAttribute("data-copied");
            }, 1600);
          });
        });
        bar.appendChild(button);
      }

      block.insertBefore(bar, block.firstChild);
    });
  }

  // --- Sticky header ---------------------------------------------------------

  function watchHeader() {
    var header = document.querySelector(".site-header");
    if (!header) return;

    var update = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    window.addEventListener("scroll", update, { passive: true });
    update();
  }

  // --- Tags page -------------------------------------------------------------
  // CSS does the filtering via :target; this only marks the active chip.

  function markActiveTag() {
    var chips = document.querySelectorAll(".tag-chip");
    if (!chips.length) return;

    var mark = function (id) {
      var active = id && document.getElementById(id) ? id : "all";
      chips.forEach(function (chip) {
        if (chip.getAttribute("href") === "#" + active) chip.setAttribute("aria-current", "true");
        else chip.removeAttribute("aria-current");
      });
    };
    var fromHash = function () {
      mark(decodeURIComponent(window.location.hash.slice(1)));
    };

    // Mark on click right away; hashchange covers back/forward navigation.
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        mark(chip.getAttribute("href").slice(1));
      });
    });
    window.addEventListener("hashchange", fromHash);
    fromHash();
  }

  // --- Boot ------------------------------------------------------------------

  document.addEventListener("DOMContentLoaded", function () {
    applyTheme(root.getAttribute("data-theme") || systemTheme(), false);
    FONT_SWITCHERS.forEach(setupFontSwitcher);

    document.querySelectorAll('[data-toggle="theme"]').forEach(function (button) {
      button.addEventListener("click", toggleTheme);
    });

    enhanceCodeBlocks();
    watchHeader();
    markActiveTag();
  });
})();
