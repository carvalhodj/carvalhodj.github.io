(function () {
  "use strict";

  var root = document.documentElement;
  var systemDark = window.matchMedia("(prefers-color-scheme: dark)");
  var KEY_THEME = "retro:theme";

  // Interface strings for the page's language (from _data/i18n.yml, embedded
  // by the default layout). Each call passes the English text as a fallback.
  var STRINGS = (function () {
    var el = document.getElementById("retro-strings");
    try { return (el && JSON.parse(el.textContent)) || {}; } catch (e) { return {}; }
  })();

  function tr(key, fallback, vars) {
    var text = STRINGS[key] || fallback;
    Object.keys(vars || {}).forEach(function (name) {
      text = text.split("{" + name + "}").join(vars[name]);
    });
    return text;
  }

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

    var label = theme === "dark"
      ? tr("theme_to_light", "Switch to light theme")
      : tr("theme_to_dark", "Switch to dark theme");
    document.querySelectorAll('[data-toggle="theme"]').forEach(function (button) {
      button.setAttribute("aria-label", label);
      button.setAttribute("title", label);
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
      what: tr("typeface", "Typeface"),
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
      what: tr("prompt_font", "Prompt font"),
      fonts: { fira: "Fira Code", bios: "IBM BIOS" }
    }
  ];

  function nextFont(switcher, font) {
    var keys = Object.keys(switcher.fonts);
    return keys[(keys.indexOf(font) + 1) % keys.length];
  }

  function applyFont(switcher, font) {
    root.setAttribute("data-" + switcher.name, font);
    var label = tr("font_label", "{what}: {font}. Switch to {next}", {
      what: switcher.what,
      font: switcher.fonts[font],
      next: switcher.fonts[nextFont(switcher, font)]
    });
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
        button.textContent = tr("copy", "copy");
        button.setAttribute("aria-label", tr("copy_label", "Copy code to clipboard"));
        button.addEventListener("click", function () {
          // Skip line-number gutters when present.
          var source = block.querySelector(".rouge-code pre") || code;
          navigator.clipboard.writeText(source.innerText.replace(/\n$/, "")).then(function () {
            button.textContent = tr("copied", "copied");
            button.setAttribute("data-copied", "");
            window.setTimeout(function () {
              button.textContent = tr("copy", "copy");
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

  // --- Back to top -----------------------------------------------------------
  // Shows the button once the page is scrolled past one screen.

  // --- Language --------------------------------------------------------------
  // Picking a language with the flag overrides the region-based guess.

  function rememberLanguage() {
    document.querySelectorAll(".lang-switch").forEach(function (link) {
      link.addEventListener("click", function () {
        write("retro:lang", link.getAttribute("hreflang"));
      });
    });
  }

  function setupBackToTop() {
    var button = document.querySelector("[data-back-to-top]");
    if (!button) return;

    var update = function () {
      button.classList.toggle("is-visible", window.scrollY > window.innerHeight);
    };
    window.addEventListener("scroll", update, { passive: true });
    update();

    button.addEventListener("click", function () {
      var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
      // The button hides at the top, so hand keyboard focus back to the header.
      var brand = document.querySelector(".brand");
      if (brand) brand.focus({ preventScroll: true });
    });
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

  // --- Search ----------------------------------------------------------------
  // Loads /search.json on first open. Matching is case- and accent-insensitive,
  // and every word of the query must appear in the title, tags or text.

  var IS_MAC = /mac|iphone|ipad|ipod/i.test(
    (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || ""
  );
  var MARKS = /[̀-ͯ]/g;
  var MAX_RESULTS = 10;

  function fold(text) {
    return text.normalize("NFD").replace(MARKS, "").toLowerCase();
  }

  // Folded text plus, for every folded character, its index in the original,
  // so matches found in folded text can be highlighted in the original.
  function foldWithMap(text) {
    var out = "", map = [];
    for (var i = 0; i < text.length; i++) {
      var folded = fold(text[i]);
      for (var j = 0; j < folded.length; j++) {
        out += folded[j];
        map.push(i);
      }
    }
    return { text: out, map: map };
  }

  function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function queryTerms(query) {
    return fold(query).split(/\s+/).filter(Boolean);
  }

  function highlight(text, terms) {
    var folded = foldWithMap(text);
    var ranges = [];
    terms.forEach(function (term) {
      var from = 0, at;
      while ((at = folded.text.indexOf(term, from)) !== -1) {
        ranges.push([folded.map[at], folded.map[at + term.length - 1] + 1]);
        from = at + term.length;
      }
    });
    ranges.sort(function (a, b) { return a[0] - b[0]; });

    var html = "", last = 0;
    ranges.forEach(function (range) {
      var start = Math.max(range[0], last);
      if (range[1] <= start) return;
      html += escapeHtml(text.slice(last, start)) + "<mark>" + escapeHtml(text.slice(start, range[1])) + "</mark>";
      last = range[1];
    });
    return html + escapeHtml(text.slice(last));
  }

  // A short excerpt around the first match in the body text.
  function snippet(doc, terms) {
    var text = doc.content || "";
    var at = -1;
    terms.some(function (term) { return (at = doc.body.text.indexOf(term)) !== -1; });
    if (at === -1) return escapeHtml(text.slice(0, 140)) + (text.length > 140 ? "…" : "");

    var start = doc.body.map[Math.max(0, at - 50)];
    var end = doc.body.map[Math.min(doc.body.text.length, at + 110) - 1] + 1;
    if (start > 0) start = text.lastIndexOf(" ", start) + 1;
    var space = text.indexOf(" ", end);
    if (space !== -1 && space - end < 20) end = space;

    return (start > 0 ? "…" : "") + highlight(text.slice(start, end), terms) + (end < text.length ? "…" : "");
  }

  function score(doc, terms) {
    var total = 0;
    for (var i = 0; i < terms.length; i++) {
      var term = terms[i];
      var points = (doc.titleKey.indexOf(term) !== -1 ? 10 : 0) +
        (doc.tagKey.indexOf(term) !== -1 ? 5 : 0) +
        (doc.body.text.indexOf(term) !== -1 ? 1 : 0);
      if (!points) return 0;
      total += points;
    }
    return total;
  }

  function search(docs, terms) {
    return docs
      .map(function (doc) { return { doc: doc, score: score(doc, terms) }; })
      .filter(function (hit) { return hit.score > 0; })
      .sort(function (a, b) {
        return b.score - a.score || String(b.doc.date || "").localeCompare(String(a.doc.date || ""));
      })
      .slice(0, MAX_RESULTS)
      .map(function (hit) { return hit.doc; });
  }

  function isTyping(target) {
    return target && (target.isContentEditable || /^(input|textarea|select)$/i.test(target.tagName));
  }

  function setupSearch() {
    var dialog = document.querySelector("[data-search]");
    if (!dialog || typeof dialog.showModal !== "function") return;

    var input = dialog.querySelector(".search-input");
    var list = dialog.querySelector("[data-search-results]");
    var status = dialog.querySelector("[data-search-status]");
    var docs = null, loading = null, results = [], active = -1, returnFocus = null;

    var shortcut = IS_MAC ? "⌘K" : "Ctrl K";
    document.querySelectorAll("[data-search-kbd]").forEach(function (kbd) {
      kbd.textContent = shortcut;
    });
    document.querySelectorAll("[data-search-open]").forEach(function (button) {
      button.setAttribute("title", tr("search_title", "Search ({shortcut})", { shortcut: shortcut }));
      button.setAttribute("aria-keyshortcuts", IS_MAC ? "Meta+K" : "Control+K");
      button.addEventListener("click", open);
    });

    function load() {
      if (!loading) {
        loading = fetch(dialog.getAttribute("data-index"))
          .then(function (response) {
            if (!response.ok) throw new Error(response.status);
            return response.json();
          })
          .then(function (items) {
            // Only search pages in the language being read.
            var lang = root.getAttribute("lang");
            docs = items.filter(function (item) {
              return !item.lang || !lang || item.lang === lang;
            }).map(function (item) {
              item.titleKey = fold(item.title || "");
              item.tagKey = fold((item.tags || []).join(" "));
              item.body = foldWithMap(item.content || "");
              return item;
            });
          })
          .catch(function () {
            loading = null; // allow a retry on next open
            status.textContent = tr("search_failed", "Search index could not be loaded.");
          });
      }
      return loading;
    }

    function open() {
      if (dialog.open) return;
      returnFocus = document.activeElement;
      dialog.showModal();
      input.select();
      render();
      load().then(render);
    }

    function close() {
      if (dialog.open) dialog.close();
      restoreFocus();
    }

    // Never leave focus in the hidden input, or "/" would stop working.
    function restoreFocus() {
      if (!dialog.contains(document.activeElement)) return;
      if (returnFocus && returnFocus !== document.body && document.contains(returnFocus)) returnFocus.focus();
      else document.activeElement.blur();
    }

    function render() {
      if (!docs) {
        if (!status.textContent) status.textContent = tr("search_loading", "Loading…");
        return;
      }
      var query = input.value.trim();
      var terms = queryTerms(query);
      results = terms.length ? search(docs, terms) : [];
      active = results.length ? 0 : -1;

      list.innerHTML = results.map(function (doc, i) {
        var meta = escapeHtml(tr("type_" + doc.type, doc.type)) + (doc.date ? " · " + escapeHtml(doc.date) : "");
        return '<li role="option" id="search-option-' + i + '">' +
          '<a href="' + escapeHtml(doc.url) + '" tabindex="-1">' +
          '<span class="search-meta">' + meta + "</span>" +
          '<span class="search-title">' + highlight(doc.title, terms) + "</span>" +
          '<span class="search-snippet">' + snippet(doc, terms) + "</span>" +
          "</a></li>";
      }).join("");

      if (!query) status.textContent = tr("search_hint", "Type to search {count} posts, projects and pages.", { count: docs.length });
      else if (!results.length) status.textContent = tr("search_none", "No matches for “{query}”.", { query: query });
      else status.textContent = "";

      input.setAttribute("aria-expanded", results.length > 0 ? "true" : "false");
      updateActive();
    }

    function updateActive() {
      list.querySelectorAll('[role="option"]').forEach(function (option, i) {
        option.setAttribute("aria-selected", i === active ? "true" : "false");
      });
      if (active < 0) {
        input.removeAttribute("aria-activedescendant");
        return;
      }
      input.setAttribute("aria-activedescendant", "search-option-" + active);
      document.getElementById("search-option-" + active).scrollIntoView({ block: "nearest" });
    }

    input.addEventListener("input", render);

    input.addEventListener("keydown", function (event) {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        if (!results.length) return;
        event.preventDefault();
        var step = event.key === "ArrowDown" ? 1 : -1;
        active = (active + step + results.length) % results.length;
        updateActive();
      } else if (event.key === "Enter" && active >= 0) {
        event.preventDefault();
        window.location.href = results[active].url;
      }
    });

    list.addEventListener("mousemove", function (event) {
      var option = event.target.closest('[role="option"]');
      if (!option) return;
      var index = Number(option.id.replace("search-option-", ""));
      if (index !== active) {
        active = index;
        updateActive();
      }
    });

    dialog.querySelector("[data-search-close]").addEventListener("click", close);

    dialog.addEventListener("close", restoreFocus); // Esc closes natively

    // A click on the backdrop lands on the <dialog> element itself.
    dialog.addEventListener("click", function (event) {
      if (event.target === dialog) close();
    });

    // ⌘K / Ctrl+K toggles search anywhere; "/" opens it when not typing.
    document.addEventListener("keydown", function (event) {
      if ((event.metaKey || event.ctrlKey) && !event.altKey && !event.shiftKey &&
          event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (dialog.open) close();
        else open();
      } else if (event.key === "/" && !dialog.open && !isTyping(event.target) &&
                 !event.metaKey && !event.ctrlKey && !event.altKey) {
        event.preventDefault();
        open();
      }
    });
  }

  // --- Contact form ----------------------------------------------------------
  // Submits to Web3Forms in the background. Without JavaScript the form posts
  // normally and Web3Forms redirects back with ?sent=1.

  function setupContactForm() {
    var form = document.querySelector("[data-contact-form]");
    if (!form) return;

    var status = form.querySelector("[data-contact-status]");
    var button = form.querySelector('button[type="submit"]');

    function show(state, message) {
      status.setAttribute("data-state", state);
      status.textContent = message;
    }

    if (/[?&]sent=1\b/.test(window.location.search)) {
      show("ok", tr("contact_sent", "Message sent. Thanks, I'll get back to you soon."));
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      if (!form.elements.access_key.value) {
        show("error", tr("contact_not_configured", "The contact form isn't configured yet."));
        return;
      }
      var captcha = form.querySelector('[name="h-captcha-response"]');
      if (captcha && !captcha.value) {
        show("error", tr("contact_captcha", "Please complete the captcha first."));
        return;
      }

      button.disabled = true;
      show("pending", tr("contact_sending", "Sending…"));

      fetch(form.action, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form)
      })
        .then(function (response) {
          return response.json().then(function (json) {
            if (!response.ok || !json.success) throw new Error(json.message || "Request failed");
          });
        })
        .then(function () {
          form.reset();
          show("ok", tr("contact_sent", "Message sent. Thanks, I'll get back to you soon."));
        })
        .catch(function (error) {
          show("error", tr("contact_failed", "Couldn't send: {error}. Please try again later.", { error: error.message }));
        })
        .then(function () {
          button.disabled = false;
          if (window.hcaptcha) window.hcaptcha.reset(); // a token works only once
        });
    });
  }

  // --- Boot ------------------------------------------------------------------

  document.addEventListener("DOMContentLoaded", function () {
    applyTheme(root.getAttribute("data-theme") || systemTheme(), false);
    FONT_SWITCHERS.forEach(setupFontSwitcher);
    rememberLanguage();

    document.querySelectorAll('[data-toggle="theme"]').forEach(function (button) {
      button.addEventListener("click", toggleTheme);
    });

    enhanceCodeBlocks();
    watchHeader();
    setupBackToTop();
    markActiveTag();
    setupSearch();
    setupContactForm();
  });
})();
