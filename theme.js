(function () {
  var KEY = "xceedance-guide-theme";
  var channel = null;

  function cookieGet() {
    var parts = ("; " + document.cookie).split("; " + KEY + "=");
    if (parts.length < 2) return "";
    return decodeURIComponent(parts.pop().split(";").shift());
  }

  function cookieSet(theme) {
    document.cookie = KEY + "=" + theme + "; Path=/; Max-Age=31536000; SameSite=Lax";
  }

  function storedTheme() {
    var t = "";
    try { t = localStorage.getItem(KEY) || ""; } catch (e) {}
    if (t !== "dark" && t !== "light") t = cookieGet();
    if (t !== "dark" && t !== "light") {
      var attr = document.documentElement.getAttribute("data-theme");
      if (attr === "dark" || attr === "light") t = attr;
    }
    if (t !== "dark" && t !== "light") {
      t = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return t;
  }

  function paintButton(theme) {
    var btn = document.getElementById("theme-toggle");
    if (!btn) return;
    var dark = theme === "dark";
    btn.setAttribute("aria-pressed", dark ? "true" : "false");
    btn.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
    btn.title = dark ? "Switch to light mode" : "Switch to dark mode";
    btn.innerHTML = dark
      ? '<span class="theme-ico" aria-hidden="true">☀</span> Light'
      : '<span class="theme-ico" aria-hidden="true">☾</span> Dark';
  }

  function apply(theme, persist) {
    if (theme !== "dark" && theme !== "light") return;
    document.documentElement.setAttribute("data-theme", theme);
    paintButton(theme);
    if (persist === false) return;
    try { localStorage.setItem(KEY, theme); } catch (e) {}
    try { cookieSet(theme); } catch (e) {}
    if (channel) {
      try { channel.postMessage(theme); } catch (e) {}
    }
  }

  function toggle() {
    var next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    apply(next, true);
  }

  function init() {
    var btn = document.getElementById("theme-toggle");
    if (!btn) {
      btn = document.createElement("button");
      btn.id = "theme-toggle";
      btn.type = "button";
      document.body.appendChild(btn);
    }
    btn.addEventListener("click", toggle);
    apply(storedTheme(), true);

    window.addEventListener("storage", function (e) {
      if (e.key === KEY && (e.newValue === "dark" || e.newValue === "light")) {
        apply(e.newValue, false);
      }
    });

    window.addEventListener("pageshow", function () {
      apply(storedTheme(), false);
    });

    try {
      channel = new BroadcastChannel(KEY);
      channel.onmessage = function (e) {
        if (e.data === "dark" || e.data === "light") apply(e.data, false);
      };
    } catch (e) {}
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
