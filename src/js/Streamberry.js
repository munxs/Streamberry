/**
 * Streamberry — Bottom Navigation Bar v5
 * Inject via Jellyfin Dashboard → General → Custom JavaScript
 *
 * ── CDN INJECTION (Jellyfin Branding → Custom JS) ────────────
 * Use this snippet — NOT a bare script tag:
 *
 *   (function() {
 *     var s = document.createElement('script');
 *     s.src = 'https://cdn.jsdelivr.net/gh/munxs/Streamberry@main/src/js/Streamberry.js';
 *     s.async = false;
 *     document.head.appendChild(s);
 *   })();
 *
 * CDN cache note: jsDelivr caches for 24h. After pushing a new file,
 * use the purge URL to bust the cache:
 *   https://purge.jsdelivr.net/gh/munxs/Streamberry@main/src/js/Streamberry.js
 * ─────────────────────────────────────────────────────────────
 */

/* ── Fonts injected as <link> tags — no @import needed ── */
(function () {
  var fonts = [
    "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
    "https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded"
  ];
  fonts.forEach(function(href) {
    if (!document.querySelector('link[href="' + href + '"]')) {
      var l = document.createElement("link");
      l.rel = "stylesheet";
      l.href = href;
      document.head.appendChild(l);
    }
  });
})();

/* ── CSS injected as <link> tag — works on login page too ── */
(function () {
  var href = "https://cdn.jsdelivr.net/gh/munxs/Streamberry@main/src/css/Streamberry.css";
  if (!document.querySelector('link[href="' + href + '"]')) {
    var l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = href;
    document.head.appendChild(l);
  }
})();

/* ── Custom logo + favicon ── */
(function () {
  var FAVICON = "https://cdn.jsdelivr.net/gh/munxs/Streamberry@main/src/logo/sb_favicon.png";
  var LOGO    = "https://cdn.jsdelivr.net/gh/munxs/Streamberry@main/src/logo/sb_logo.png";

  /* ── Favicon ── */
  function setFavicon() {
    document.querySelectorAll('link[rel*="icon"]').forEach(function(f) { f.remove(); });
    ["shortcut icon", "icon", "apple-touch-icon"].forEach(function(rel) {
      var l = document.createElement("link");
      l.rel  = rel;
      l.type = "image/png";
      l.href = FAVICON;
      document.head.appendChild(l);
    });
  }
  setFavicon();

  /* ── Header logo ── */
  /* Jellyfin uses .pageTitleWithDefaultLogo as a CSS background-image element.
     We override it via JS to ensure it wins over theme.css                    */
  function replaceLogos() {
    // Header logo element
    document.querySelectorAll('.pageTitleWithDefaultLogo, .pageTitleWithLogo').forEach(function(el) {
      if (!el.dataset.sbLogo) {
        el.dataset.sbLogo = "1";
        el.style.backgroundImage  = 'url("' + LOGO + '")';
        el.style.backgroundSize   = "contain";
        el.style.backgroundRepeat = "no-repeat";
        el.style.backgroundPosition = "left center";
        el.style.minWidth  = "8em";
        el.style.minHeight = "2.5em";
        el.style.display   = "block";
      }
    });

    // Any actual img tags with Jellyfin branding (fallback)
    document.querySelectorAll('img[src*="banner-light"], img[src*="banner-dark"], img[src*="banner.png"], img[src*="Jellyfin_Logo"]').forEach(function(img) {
      if (!img.dataset.sbLogo) {
        img.dataset.sbLogo = "1";
        img.src = LOGO;
        img.style.cssText = "max-height:2em;width:auto;object-fit:contain;display:block;";
      }
    });
  }

  replaceLogos();
  new MutationObserver(replaceLogos).observe(document.documentElement, {
    childList: true, subtree: true
  });
})();

/* ═══════════════════════════════════════════════════════════
   DESKTOP PILL NAV BAR
   Frosted-glass pill, top-centre, desktop only.
   Icons: Home, Movies, TV, Favorites, Search | Cast, Syncplay, Settings
   ═══════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  const PILL_ID = "sbPillNav";

  const NAV_ITEMS = [
    { id: "home",      icon: "home",     label: "Home",      hash: "/web/#/home" },
    { id: "movies",    icon: "movie",    label: "Movies",    hash: "/web/#/movies" },
    { id: "tv",        icon: "tv",       label: "TV Shows",  hash: "/web/#/tv" },
    { id: "favorites", icon: "favorite", label: "Favorites", hash: "/web/#/home?tab=1" },
    { id: "search",    icon: "search",   label: "Search",    hash: "/web/#/search" },
  ];

  const ACTION_ITEMS = [
    { id: "cast",     icon: "cast",     label: "Cast",     action: "cast" },
    { id: "syncplay", icon: "sync",     label: "Syncplay", action: "syncplay", syncplayGated: true },
    { id: "settings", icon: "settings", label: "Settings", hash: "/web/#/mypreferencesmenu" },
  ];

  function isDesktop() {
    return document.documentElement.classList.contains("layout-desktop");
  }

  function getActiveId() {
    const p = location.hash || location.pathname || "";
    if (p.includes("/movies"))        return "movies";
    if (p.includes("/tv"))            return "tv";
    if (p.includes("tab=1"))          return "favorites";
    if (p.includes("/search"))        return "search";
    if (p.includes("/mypreferences")) return "settings";
    return "home";
  }

  function updateActive() {
    const active = getActiveId();
    document.querySelectorAll(".sbPillBtn[data-pill-id]").forEach(btn => {
      btn.classList.toggle("sbPillBtn--active", btn.dataset.pillId === active);
    });
  }

  function triggerCast() {
    const btn = document.querySelector(".headerCastButton, .btnCast, button[title*='Cast' i]");
    if (btn) { btn.click(); return; }
    if (window.cast && window.cast.framework) {
      try { window.cast.framework.CastContext.getInstance().requestSession(); } catch(e) {}
    }
  }

  function triggerSyncplay() {
    const btn = document.querySelector(".btnSyncPlay, .headerSyncPlayButton");
    if (btn) { btn.click(); return; }
    location.href = "/web/#/syncplay";
  }

  function checkSyncplay() {
    const pill = document.getElementById("sbPillSyncplay");
    if (!pill) return;
    if (document.querySelector(".btnSyncPlay, .headerSyncPlayButton")) {
      pill.classList.add("sbPillSyncplay--visible"); return;
    }
    if (typeof ApiClient !== "undefined") {
      try {
        ApiClient.getCurrentUser().then(u => {
          if (u?.Policy?.SyncPlayAccess && u.Policy.SyncPlayAccess !== "None")
            pill.classList.add("sbPillSyncplay--visible");
        }).catch(() => {});
      } catch(e) {}
    }
  }

  function isPlayerActive() {
    return !!(
      document.querySelector(".fullscreenVideo") ||
      document.querySelector("#videoOsdPage:not(.hide)") ||
      document.querySelector("#nowPlayingPage:not(.hide)") ||
      document.querySelector(".videoOsdBottom:not(.hide)")
    );
  }

  function isLoginVisible() {
    const el = document.getElementById("loginPage");
    return el && !el.classList.contains("hide");
  }

  function updatePillVisibility() {
    const pill = document.getElementById(PILL_ID);
    if (!pill) return;
    const hidden = !isDesktop() || isPlayerActive() || isLoginVisible();
    pill.style.setProperty("display", hidden ? "none" : "flex", "important");
  }

  function makeBtn(id, icon, label, onClick, extraId) {
    const btn = document.createElement("button");
    btn.className = "sbPillBtn";
    btn.dataset.pillId = id;
    btn.title = label;
    btn.setAttribute("aria-label", label);
    if (extraId) btn.id = extraId;
    btn.innerHTML = `<span class="sbPillIcon material-icons">${icon}</span>`;
    btn.addEventListener("click", e => { e.stopPropagation(); onClick(); });
    return btn;
  }

  function buildPill() {
    if (document.getElementById(PILL_ID) || !isDesktop()) return;
    const nav = document.createElement("nav");
    nav.id = PILL_ID;
    nav.setAttribute("aria-label", "Main navigation");
    NAV_ITEMS.forEach(item => {
      nav.appendChild(makeBtn(item.id, item.icon, item.label, () => { location.href = item.hash; }));
    });
    const div = document.createElement("div");
    div.className = "sbPillDivider";
    div.setAttribute("aria-hidden", "true");
    nav.appendChild(div);
    ACTION_ITEMS.forEach(item => {
      const extraId = item.syncplayGated ? "sbPillSyncplay" : undefined;
      const onClick = item.action === "cast"    ? triggerCast
                    : item.action === "syncplay" ? triggerSyncplay
                    : () => { location.href = item.hash; };
      nav.appendChild(makeBtn(item.id, item.icon, item.label, onClick, extraId));
    });
    document.body.appendChild(nav);
    updateActive();
    updatePillVisibility();
    setTimeout(checkSyncplay, 1500);
    setTimeout(checkSyncplay, 4500);
  }

  function init() {
    buildPill();
    const onRoute = () => { updateActive(); updatePillVisibility(); };
    window.addEventListener("hashchange", onRoute);
    window.addEventListener("popstate", onRoute);
    new MutationObserver(() => { updatePillVisibility(); checkSyncplay(); })
      .observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "style"] });
    new MutationObserver(() => {
      if (isDesktop()) { if (!document.getElementById(PILL_ID)) buildPill(); else updatePillVisibility(); }
      else { const p = document.getElementById(PILL_ID); if (p) p.style.setProperty("display", "none", "important"); }
    }).observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    setTimeout(init, 300);
  }
})();

/* ═══════════════════════════════════════════════════════════
   BOTTOM NAV BAR
   ═══════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  const NAV_ITEMS = [
    { id: "home",    label: "Home",      icon: "home",       hash: "/web/#/home" },
    { id: "movies",  label: "Movies",    icon: "movie",      hash: "/web/#/movies" },
    { id: "tv",      label: "TV",        icon: "tv",         hash: "/web/#/tv" },
    { id: "search",  label: "Search",    icon: "search",     hash: "/web/#/search" },
    { id: "more",    label: "My Vault",  icon: "more_horiz", hash: null },
  ];

  const MORE_ITEMS = [
    { id: "profile",      label: "Profile",       icon: "person",      action: "profile" },
    { id: "quickconnect", label: "Quick Connect",  icon: "qr_code",     action: "quickconnect" },
    { id: "favorites",    label: "Favorites",      icon: "favorite",    hash: "/web/#/home?tab=1" },
    { id: "requests",     label: "Requests",       icon: "add_circle",  action: "requests" },
    { id: "settings",     label: "Settings",       icon: "settings",    hash: "/web/#/mypreferencesmenu" },
    { id: "signout",      label: "Sign Out",       icon: "logout",      action: "signout" },
  ];

  /* ── Drawer suppression (safe — no panel selector) ──────── */
  function closeJellyfinDrawer() {
    document.querySelectorAll(".mainDrawer, #mainDrawer, .mainDrawerPanel, .drawerstyleoverlay").forEach(el => {
      el.classList.remove("mainDrawer-open");
      el.style.cssText += ";display:none!important;visibility:hidden!important;transform:translateX(-100%)!important;";
    });
    document.body.classList.remove("skinBody-overflowHidden");
  }

  /* ── Navigation with overlay ─────────────────────────────── */
  function navigateTo(path) {
    closeMore();
    closeJellyseerrOverlay();
    closeJellyfinDrawer();
    location.href = path;
  }

  function closeMore() {
    document.body.classList.remove("sbMoreOpen");
    updateActiveTab();
  }

  function openMore() {
    injectPanelHeader();
    injectAdminGear();
    document.body.classList.add("sbMoreOpen");
    setActive("more");
  }

  function isMoreOpen() {
    return document.body.classList.contains("sbMoreOpen");
  }

  /* ── Active tab ──────────────────────────────────────────── */
  function setActive(id) {
    document.querySelectorAll(".sbNavBtn").forEach(btn => {
      btn.classList.toggle("sbNavBtn--active", btn.dataset.navId === id);
    });
  }

  function updateActiveTab() {
    const path = location.hash || location.pathname || "";
    let active = "home";
    if (path.includes("/movies")) active = "movies";
    else if (path.includes("/tv")) active = "tv";
    else if (path.includes("/search")) active = "search";
    setActive(active);
  }

  /* ── Visibility ──────────────────────────────────────────── */
  function shouldHideNav() {
    const loginEl = document.getElementById("loginPage");
    if (loginEl && !loginEl.classList.contains("hide")) return true;
    const playerPages = ["videoOsdPage", "nowPlayingPage", "htmlvideoplayer"];
    return playerPages.some(id => {
      const el = document.getElementById(id);
      return el && !el.classList.contains("hide");
    }) || !!document.querySelector(".videoOsdBottom:not(.hide)")
       || !!document.querySelector(".fullscreenVideo");
  }

  function updateVisibility() {
    const nav = document.getElementById("sbBottomNav");
    if (!nav) return;
    nav.style.display = shouldHideNav() ? "none" : "";
  }

  /* ── More actions ────────────────────────────────────────── */
  function handleMoreAction(item) {
    closeMore();
    setTimeout(() => {
      if (item.action === "signout") {
        ApiClient.logout().then(() => navigateTo("/web/#/login"));
      } else if (item.action === "quickconnect") {
        navigateTo("/web/#/quickconnect");
      } else if (item.action === "profile") {
        navigateTo(`/web/#/userprofile?userId=${ApiClient.getCurrentUserId()}`);
      } else if (item.action === "requests") {
        openJellyseerrOverlay();
      } else if (item.hash) {
        navigateTo(item.hash);
      }
    }, 50);
  }

  /* ── Streamberry Config — server-backed via Branding API ─── */
  const SB_TAG = "[[sb-config]]";
  const SB_CACHE_KEY = "sb_config_cache";

  function getCachedConfig() {
    try { return JSON.parse(localStorage.getItem(SB_CACHE_KEY) || "{}"); }
    catch { return {}; }
  }

  function setCachedConfig(cfg) {
    try { localStorage.setItem(SB_CACHE_KEY, JSON.stringify(cfg)); }
    catch {}
  }

  function fetchSbConfigFromServer(callback) {
    if (typeof ApiClient === "undefined") { callback({}); return; }
    const token = (() => {
      try {
        if (typeof ApiClient.accessToken === "function") return ApiClient.accessToken();
        return ApiClient._accessToken || ApiClient.token || "";
      } catch { return ""; }
    })();
    const serverUrl = (() => {
      try {
        const s = typeof ApiClient.serverAddress === "function"
          ? ApiClient.serverAddress()
          : (ApiClient._serverAddress || ApiClient.serverUrl || window.location.origin);
        return s.replace(/\/$/, "");
      } catch { return window.location.origin; }
    })();
    fetch(`${serverUrl}/Branding/Configuration`, {
      headers: { "X-Emby-Authorization": `MediaBrowser Token="${token}"`, "Accept": "application/json" }
    })
    .then(r => r.json())
    .then(data => {
      const disclaimer = (data && data.LoginDisclaimer) || "";
      const idx = disclaimer.indexOf(SB_TAG);
      let cfg = {};
      if (idx !== -1) {
        try { cfg = JSON.parse(disclaimer.slice(idx + SB_TAG.length)); }
        catch {}
      }
      cfg._loaded = true;
      setCachedConfig(cfg);
      callback(cfg);
    })
    .catch(() => callback(getCachedConfig()));
  }

  function saveSbConfigToServer(cfg, onSuccess, onError) {
    if (typeof ApiClient === "undefined") { onError && onError(); return; }
    const token = (() => {
      try {
        if (typeof ApiClient.accessToken === "function") return ApiClient.accessToken();
        return ApiClient._accessToken || ApiClient.token || "";
      } catch { return ""; }
    })();
    const serverUrl = (() => {
      try {
        const s = typeof ApiClient.serverAddress === "function"
          ? ApiClient.serverAddress()
          : (ApiClient._serverAddress || ApiClient.serverUrl || window.location.origin);
        return s.replace(/\/$/, "");
      } catch { return window.location.origin; }
    })();
    const authHeader = `MediaBrowser Token="${token}"`;
    fetch(`${serverUrl}/Branding/Configuration`, {
      headers: { "X-Emby-Authorization": authHeader, "Accept": "application/json" }
    })
    .then(r => { if (!r.ok) throw new Error("GET " + r.status); return r.json(); })
    .then(data => {
      const existing = (data && data.LoginDisclaimer) || "";
      const clean = existing.includes(SB_TAG)
        ? existing.slice(0, existing.indexOf(SB_TAG)).trimEnd()
        : existing;
      const payload = {
        LoginDisclaimer: clean + (clean ? "\n" : "") + SB_TAG + JSON.stringify(cfg),
        CustomCss: (data && data.CustomCss) || ""
      };
      return fetch(`${serverUrl}/System/Configuration/Branding`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Emby-Authorization": authHeader },
        body: JSON.stringify(payload)
      });
    })
    .then(r => { if (!r.ok) throw new Error("POST " + r.status); })
    .then(() => {
      cfg._loaded = true;
      setCachedConfig(cfg);
      onSuccess && onSuccess();
    })
    .catch(err => {
      console.error("[Streamberry] Config save failed:", err);
      onError && onError();
    });
  }

  function getJellyseerrUrl() {
    let url = (getCachedConfig().jellyseerrUrl || "").trim().replace(/\/$/,"");
    if (url && !/^https?:\/\//i.test(url)) url = "https://" + url;
    return url;
  }

  /* ── Jellyfin token + server URL helpers ─────────────────── */
  function getJellyfinToken() {
    try {
      if (typeof ApiClient.accessToken === "function") return ApiClient.accessToken();
      return ApiClient._accessToken || ApiClient.token || "";
    } catch { return ""; }
  }

  function getJellyfinServerUrl() {
    try {
      const s = typeof ApiClient.serverAddress === "function"
        ? ApiClient.serverAddress()
        : (ApiClient._serverAddress || ApiClient.serverUrl || window.location.origin);
      return s.replace(/\/$/, "");
    } catch { return window.location.origin; }
  }

  /* ── Admin check ─────────────────────────────────────────── */
  function isAdmin() {
    try {
      const user = window._sbUserData;
      return !!(user && user.policy && user.policy.IsAdministrator === true);
    } catch { return false; }
  }

  /* ── Admin gear button ───────────────────────────────────── */
  function injectAdminGear() {
    if (document.getElementById("sbAdminGear")) return;
    if (!isAdmin()) return;
    const panel = document.getElementById("sbMorePanel");
    if (!panel) return;
    const gear = document.createElement("button");
    gear.id = "sbAdminGear";
    gear.title = "Streamberry Settings";
    gear.innerHTML = '<span class="material-icons">tune</span>';
    gear.addEventListener("click", (e) => {
      e.stopPropagation();
      closeMore();
      setTimeout(openSbSettings, 50);
    });
    panel.appendChild(gear);
  }

  /* ── Admin Settings Modal ────────────────────────────────── */
  function openSbSettings() {
    if (document.getElementById("sbSettingsModal")) return;
    const modal = document.createElement("div");
    modal.id = "sbSettingsModal";
    modal.innerHTML = `
      <div id="sbSettingsDialog">
        <div id="sbSettingsHeader">
          <span>Streamberry Settings</span>
          <button id="sbSettingsClose" aria-label="Close">
            <span class="material-icons">close</span>
          </button>
        </div>
        <div id="sbSettingsBody">
          <label class="sbSettingsLabel" for="sbJellyseerrInput">
            <span class="material-icons sbSettingsLabelIcon">add_circle</span>
            Jellyseerr URL
          </label>
          <input id="sbJellyseerrInput" class="sbSettingsInput" type="text"
            placeholder="https://requests.yourdomain.com"
            value="${getJellyseerrUrl()}" autocomplete="off" spellcheck="false" />
          <p class="sbSettingsHint">Applies to all users on all devices. Set by admin only.</p>
        </div>
        <div id="sbSettingsFooter">
          <button id="sbSettingsSave" class="sbSettingsBtn sbSettingsBtn--primary">Save for everyone</button>
          <button id="sbSettingsCancel" class="sbSettingsBtn">Cancel</button>
        </div>
      </div>`;
    document.body.appendChild(modal);
    modal.addEventListener("click", (e) => { if (e.target === modal) closeSbSettings(); });
    document.getElementById("sbSettingsClose").addEventListener("click", closeSbSettings);
    document.getElementById("sbSettingsCancel").addEventListener("click", closeSbSettings);
    document.getElementById("sbSettingsSave").addEventListener("click", () => {
      const val = document.getElementById("sbJellyseerrInput").value.trim().replace(/\/$/, "");
      const saveBtn = document.getElementById("sbSettingsSave");
      saveBtn.textContent = "Saving…";
      saveBtn.disabled = true;
      saveSbConfigToServer({ jellyseerrUrl: val },
        () => {
          const old = document.getElementById("sbJellyseerrOverlay");
          if (old) old.remove();
          closeSbSettings();
          showSbToast(val ? "Jellyseerr URL saved for all users!" : "Jellyseerr URL cleared.");
        },
        () => {
          saveBtn.textContent = "Save for everyone";
          saveBtn.disabled = false;
          showSbToast("Failed to save. Check your connection.");
        }
      );
    });
    requestAnimationFrame(() => modal.classList.add("sbSettingsModal--open"));
  }

  function closeSbSettings() {
    const modal = document.getElementById("sbSettingsModal");
    if (!modal) return;
    modal.classList.remove("sbSettingsModal--open");
    setTimeout(() => modal.remove(), 250);
  }

  function showSbToast(msg) {
    const t = document.createElement("div");
    t.className = "sbToast";
    t.textContent = msg;
    document.body.appendChild(t);
    requestAnimationFrame(() => t.classList.add("sbToast--show"));
    setTimeout(() => {
      t.classList.remove("sbToast--show");
      setTimeout(() => t.remove(), 300);
    }, 2800);
  }

  /* ── Jellyseerr Overlay ──────────────────────────────────── */
  function openJellyseerrOverlay() {
    const cached = getCachedConfig();
    if (!cached._loaded) {
      fetchSbConfigFromServer(() => _doOpenJellyseerrOverlay());
      return;
    }
    _doOpenJellyseerrOverlay();
  }

  function _doOpenJellyseerrOverlay() {
    const url = getJellyseerrUrl();
    if (!url) {
      if (isAdmin()) {
        closeMore();
        setTimeout(openSbSettings, 50);
        showSbToast("Set your Jellyseerr URL in Streamberry Settings first.");
      } else {
        showSbToast("Requests are not configured yet. Ask your admin.");
      }
      return;
    }

    // ── Build auto-login URL using the current user's Jellyfin token ──
    // Jellyseerr's /login/jellyfin SSO route only exists when Jellyfin is
    // configured as an auth provider in Jellyseerr settings. We check
    // /api/v1/settings/public first (unauthenticated JSON, no 404 risk) to
    // confirm jellyfinExternalUrl is set before attempting SSO — this
    // eliminates the 404 console error when SSO is not yet configured.
    const token = getJellyfinToken();
    const jellyfinHost = getJellyfinServerUrl();
    const ssoUrl = token
      ? `${url}/login/jellyfin?jellyfinHost=${encodeURIComponent(jellyfinHost)}&token=${encodeURIComponent(token)}`
      : null;

    // Check /api/v1/settings/public — unauthenticated, returns { jellyfinExternalUrl, ... }.
    // If jellyfinExternalUrl is set, Jellyfin SSO is active and /login/jellyfin exists.
    function _resolveIframeUrl(onResolved) {
      if (!ssoUrl) { onResolved(url); return; }
      fetch(`${url}/api/v1/settings/public`)
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(data => onResolved((data && data.jellyfinExternalUrl) ? ssoUrl : url))
        .catch(() => onResolved(ssoUrl)); // can't reach API — try SSO anyway
    }

    let overlay = document.getElementById("sbJellyseerrOverlay");
    if (overlay) {
      // If overlay already exists, update the iframe src to trigger a fresh
      // auto-login (e.g. after sign-out / sign-in with a different user).
      const existingFrame = document.getElementById("sbJellyseerrFrame");
      const existingLoader = document.getElementById("sbJellyseerrLoader");
      if (existingFrame && existingLoader) {
        _resolveIframeUrl(resolved => {
          existingLoader.style.display = "";
          existingLoader.innerHTML = `
            <span class="material-icons sbJellyseerrSpinner">autorenew</span>
            <p>Loading Seerr…</p>`;
          existingFrame.style.opacity = "0";
          existingFrame.src = resolved;
        });
      }
    } else {
      overlay = document.createElement("div");
      overlay.id = "sbJellyseerrOverlay";

      const header = document.createElement("div");
      header.id = "sbJellyseerrHeader";
      header.innerHTML = `
        <span id="sbJellyseerrTitle">Requests</span>
        <button id="sbJellyseerrClose" aria-label="Close">
          <span class="material-icons">close</span>
        </button>`;

      const loader = document.createElement("div");
      loader.id = "sbJellyseerrLoader";
      loader.innerHTML = `
        <span class="material-icons sbJellyseerrSpinner">autorenew</span>
        <p>Loading Seerr…</p>`;

      const iframe = document.createElement("iframe");
      iframe.id = "sbJellyseerrFrame";
      iframe.src = "about:blank";
      iframe.setAttribute("allowfullscreen", "true");
      iframe.setAttribute("allow", "fullscreen");

      iframe.addEventListener("load", () => {
        if (iframe.src === "about:blank") return;
        loader.style.display = "none";
        iframe.style.opacity = "1";
      });

      iframe.addEventListener("error", () => {
        loader.innerHTML = `
          <span class="material-icons" style="color:var(--accent);font-size:2.5em;">wifi_off</span>
          <p style="margin-top:0.75em;font-weight:600;font-family:Inter,sans-serif;color:var(--textColor);">Could not reach Jellyseerr</p>
          <p style="font-size:0.85em;color:var(--dimTextColor);margin-top:0.25em;font-family:Inter,sans-serif;">Make sure you're on your home network</p>`;
      });

      overlay.appendChild(header);
      overlay.appendChild(loader);
      overlay.appendChild(iframe);
      document.body.appendChild(overlay);
      document.getElementById("sbJellyseerrClose").addEventListener("click", closeJellyseerrOverlay);

      // Resolve SSO availability before setting iframe src
      _resolveIframeUrl(resolved => { iframe.src = resolved; });
    }

    overlay.style.display = "";
    overlay.classList.add("sbJellyseerrOverlay--open");
    document.body.classList.add("sbJellyseerrOpen");
  }

  function closeJellyseerrOverlay() {
    const overlay = document.getElementById("sbJellyseerrOverlay");
    if (overlay) {
      overlay.classList.remove("sbJellyseerrOverlay--open");
      overlay.style.display = "none";
    }
    document.body.classList.remove("sbJellyseerrOpen");
  }

  /* ── Hide sb-config from login disclaimer ────────────────── */
  function cleanLoginDisclaimer() {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      if (node.nodeValue && node.nodeValue.includes("[[sb-config]]")) {
        const idx = node.nodeValue.indexOf("[[sb-config]]");
        node.nodeValue = node.nodeValue.slice(0, idx).trim();
      }
    }
  }

  function buildNav() {
    if (document.getElementById("sbBottomNav")) return;

    const overlay = document.createElement("div");
    overlay.id = "sbTransitionOverlay";
    document.body.appendChild(overlay);

    const scrim = document.createElement("div");
    scrim.id = "sbMoreScrim";
    scrim.addEventListener("click", closeMore);
    document.body.appendChild(scrim);

    const panel = document.createElement("div");
    panel.id = "sbMorePanel";

    MORE_ITEMS.forEach(item => {
      const row = document.createElement("div");
      row.className = "sbMoreItem";
      row.setAttribute("data-nav-id", item.id);
      row.innerHTML = `
        <span class="sbMoreIcon material-icons">${item.icon}</span>
        <span>${item.label}</span>
        <span class="sbMoreChevron material-icons">chevron_right</span>
      `;
      row.addEventListener("click", (e) => {
        e.stopPropagation();
        handleMoreAction(item);
      });
      panel.appendChild(row);
    });

    document.body.appendChild(panel);

    const nav = document.createElement("nav");
    nav.id = "sbBottomNav";

    NAV_ITEMS.forEach(item => {
      const btn = document.createElement("div");
      btn.className = "sbNavBtn";
      btn.setAttribute("data-nav-id", item.id);
      btn.innerHTML = `
        <span class="sbNavIcon material-icons">${item.icon}</span>
        <span>${item.label}</span>
      `;
      if (item.id === "more") {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          isMoreOpen() ? closeMore() : openMore();
        });
      } else {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          closeMore();
          closeJellyseerrOverlay();
          setActive(item.id);
          location.href = item.hash;
        });
      }
      nav.appendChild(btn);
    });

    document.body.appendChild(nav);
    updateActiveTab();
  }

  /* ── Avatar ──────────────────────────────────────────────── */
  function loadUserAvatar() {
    if (typeof ApiClient === "undefined" || !ApiClient.getCurrentUserId()) {
      setTimeout(loadUserAvatar, 500);
      return;
    }
    const userId = ApiClient.getCurrentUserId();
    const avatarUrl = ApiClient.getUserImageUrl(userId, { type: "Primary", width: 80 });
    const moreBtn = document.querySelector(".sbNavBtn[data-nav-id='more']");
    if (moreBtn) {
      const iconEl = moreBtn.querySelector(".sbNavIcon, .sbNavAvatar");
      if (iconEl) {
        iconEl.innerHTML = "";
        iconEl.className = "sbNavAvatar";
        iconEl.style.cssText = "width:1.8em;height:1.8em;min-width:1.8em;overflow:hidden;border-radius:50%;";
        const img = document.createElement("img");
        img.src = avatarUrl;
        img.style.cssText = "width:1.8em;height:1.8em;max-width:1.8em;max-height:1.8em;border-radius:50%;object-fit:cover;display:block;";
        img.onerror = () => {
          iconEl.className = "sbNavIcon material-icons";
          iconEl.textContent = "account_circle";
        };
        iconEl.appendChild(img);
      }
    }
    window._sbUserData = { userId };
    ApiClient.getCurrentUser().then(user => {
      window._sbUserData.name = user.Name;
      window._sbUserData.policy = user.Policy;
    });
  }

  function injectPanelHeader() {
    if (document.getElementById("sbMoreHeader")) return;
    const panel = document.getElementById("sbMorePanel");
    if (!panel || !window._sbUserData) return;
    const { userId, name } = window._sbUserData;
    if (!userId) return;
    const headerAvatarUrl = ApiClient.getUserImageUrl(userId, { type: "Primary", width: 80 });
    const header = document.createElement("div");
    header.id = "sbMoreHeader";
    header.innerHTML = `
      <img src="${headerAvatarUrl}"
           style="width:2.75em;height:2.75em;max-width:2.75em;max-height:2.75em;border-radius:50%;object-fit:cover;display:block;"
           onerror="this.style.display='none'" />
      <span>${name || ""}</span>
    `;
    panel.insertBefore(header, panel.firstChild);
  }

  /* ── Search placeholder ──────────────────────────────────── */
  function injectSearchPlaceholder() {
    if (document.getElementById("sbSearchPlaceholder")) return;
    const searchPage = document.getElementById("searchPage");
    if (!searchPage) return;
    const placeholder = document.createElement("div");
    placeholder.id = "sbSearchPlaceholder";
    placeholder.innerHTML = `
      <p class="sbSearchTitle">Search your library</p>
      <p class="sbSearchSub">Find movies and TV shows across your library</p>
    `;
    searchPage.appendChild(placeholder);
    const input = searchPage.querySelector("input");
    if (input) {
      input.addEventListener("input", () => {
        placeholder.style.display = input.value.length > 0 ? "none" : "";
      });
    }
  }

  /* ── Init ────────────────────────────────────────────────── */
  function init() {
    buildNav();
    updateActiveTab();
    updateVisibility();

    function onRouteChange() {
      closeMore();
      closeJellyseerrOverlay();
      updateActiveTab();
      updateVisibility();
      const nav = document.getElementById("sbBottomNav");
      if (!nav || nav.style.display === "none") {
        setTimeout(() => {
          if (!document.getElementById("sbBottomNav")) {
            buildNav();
          }
          updateActiveTab();
          updateVisibility();
          if (!window._sbAvatarLoaded) {
            window._sbAvatarLoaded = true;
            setTimeout(loadUserAvatar, 600);
          }
        }, 500);
      }
    }

    window.addEventListener("hashchange", onRouteChange);
    window.addEventListener("popstate", onRouteChange);

    function isLoginVisible() {
      const el = document.getElementById("loginPage");
      console.log("[SB] isLoginVisible check — el:", !!el, "| classes:", el ? el.className : "N/A");
      return el && !el.classList.contains("hide");
    }
    let wasLoginVisible = isLoginVisible();
    new MutationObserver(() => {
      const nowVisible = isLoginVisible();
      if (wasLoginVisible && !nowVisible) {
        wasLoginVisible = false;
        setTimeout(() => {
          updateVisibility();
          if (!window._sbAvatarLoaded) {
            window._sbAvatarLoaded = true;
            setTimeout(loadUserAvatar, 600);
          }
        }, 300);
      } else if (!wasLoginVisible && nowVisible) {
        wasLoginVisible = true;
        updateVisibility();
      }
    }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });

    const ours = new Set(["sbBottomNav","sbMorePanel","sbMoreScrim","sbTransitionOverlay","sbMoreHeader"]);
    new MutationObserver((mutations) => {
      const relevant = mutations.some(m => !ours.has(m.target.id));
      if (relevant) updateVisibility();
    }).observe(document.body, {
      childList: true, subtree: true,
      attributes: true, attributeFilter: ["class"]
    });

    new MutationObserver(injectSearchPlaceholder)
      .observe(document.body, { childList: true, subtree: true });

    new MutationObserver(cleanLoginDisclaimer)
      .observe(document.body, { childList: true, subtree: true });
    cleanLoginDisclaimer();

    if (document.documentElement.classList.contains("layout-mobile")) {
      new MutationObserver(() => {
        document.querySelectorAll(".mainDrawer, #mainDrawer, .mainDrawerPanel, .drawerstyleoverlay").forEach(el => {
          if (el.classList.contains("mainDrawer-open") || el.style.visibility !== "hidden") {
            el.classList.remove("mainDrawer-open");
            el.style.cssText += ";display:none!important;visibility:hidden!important;transform:translateX(-100%)!important;";
          }
        });
        if (document.body.classList.contains("skinBody-overflowHidden")) {
          document.body.classList.remove("skinBody-overflowHidden");
        }
      }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "style"] });
    }

    try { const c = JSON.parse(localStorage.getItem("sb_config_cache") || "{}"); delete c._loaded; localStorage.setItem("sb_config_cache", JSON.stringify(c)); } catch {}
    setTimeout(() => fetchSbConfigFromServer(() => {}), 800);

    if (!window._sbAvatarLoaded) {
      window._sbAvatarLoaded = true;
      setTimeout(loadUserAvatar, 1000);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    setTimeout(init, 300);
  }
})();

/* ═══════════════════════════════════════════════════════════
   HEADER TABS → DROPDOWN (mobile only)
   ═══════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  function isMobile() {
    return document.documentElement.classList.contains("layout-mobile");
  }

  function initTabDropdown(container) {
    if (container.dataset.dropdownInit) return;
    const tabsEl = container.querySelector(".emby-tabs");
    if (!tabsEl) return;
    const buttons = tabsEl.querySelectorAll(".emby-tab-button");
    if (buttons.length === 0) return;
    container.dataset.dropdownInit = "true";

    const slider = tabsEl.querySelector(".emby-tabs-slider");
    if (slider && isMobile()) slider.style.display = "none";

    if (!isMobile()) return;

    const wrapper = document.createElement("div");
    wrapper.className = "sbTabDropdownWrapper";

    const trigger = document.createElement("div");
    trigger.className = "sbTabDropdownTrigger";

    const menu = document.createElement("div");
    menu.className = "sbTabDropdownMenu";
    document.body.appendChild(menu);

    function getActiveLabel() {
      const active = tabsEl.querySelector(".emby-tab-button-active .emby-button-foreground");
      return active ? active.textContent.trim() : "Browse";
    }

    function updateTrigger() {
      trigger.innerHTML = `
        <span>${getActiveLabel()}</span>
        <span class="sbTabDropdownArrow material-icons">expand_more</span>
      `;
    }

    function buildMenu() {
      menu.innerHTML = "";
      tabsEl.querySelectorAll(".emby-tab-button").forEach(btn => {
        const label = btn.querySelector(".emby-button-foreground")?.textContent?.trim() || "";
        const isActive = btn.classList.contains("emby-tab-button-active");
        const item = document.createElement("div");
        item.className = "sbTabDropdownItem" + (isActive ? " sbTabDropdownItem--active" : "");
        item.innerHTML = `
          <span>${label}</span>
          ${isActive ? '<span class="sbTabDropdownCheck material-icons">check</span>' : ""}
        `;
        item.addEventListener("click", (e) => {
          e.stopPropagation();
          btn.click();
          closeMenu();
        });
        menu.appendChild(item);
      });
    }

    function openMenu() {
      buildMenu();
      const rect = trigger.getBoundingClientRect();
      menu.style.top = (rect.bottom + 6) + "px";
      menu.style.left = rect.left + "px";
      menu.style.display = "block";
      wrapper.classList.add("sbTabDropdown--open");
    }

    function closeMenu() {
      menu.style.display = "none";
      wrapper.classList.remove("sbTabDropdown--open");
      updateTrigger();
    }

    trigger.addEventListener("click", (e) => {
      e.stopPropagation();
      wrapper.classList.contains("sbTabDropdown--open") ? closeMenu() : openMenu();
    });

    document.addEventListener("click", (e) => {
      if (!wrapper.contains(e.target) && !menu.contains(e.target)) closeMenu();
    });

    new MutationObserver(updateTrigger).observe(tabsEl, {
      attributes: true, subtree: true, attributeFilter: ["class"]
    });

    wrapper.appendChild(trigger);
    container.insertBefore(wrapper, container.firstChild);
    updateTrigger();
    menu.style.display = "none";
  }

  function scanForTabBars() {
    if (!isMobile()) return;
    document.querySelectorAll(".headerTabs.sectionTabs").forEach(container => {
      const hasWrapper = container.querySelector(".sbTabDropdownWrapper");
      if (!hasWrapper) {
        delete container.dataset.dropdownInit;
        const buttons = container.querySelectorAll(".emby-tab-button");
        if (buttons.length > 0) initTabDropdown(container);
      }
    });
  }

  new MutationObserver(scanForTabBars).observe(document.body, { childList: true, subtree: true });

  function onNavigate() {
    setTimeout(scanForTabBars, 300);
    setTimeout(scanForTabBars, 800);
    setTimeout(scanForTabBars, 1500);
  }

  window.addEventListener("hashchange", onNavigate);
  window.addEventListener("popstate", onNavigate);
  setTimeout(scanForTabBars, 800);
  setTimeout(scanForTabBars, 1500);
})();

/* ═══════════════════════════════════════════════════════════
   STREAMBERRY MEDIA BAR — Featured Content Carousel v2
   Full-bleed behind header, exactly like Moonfin.
   No plugin dependency. Works on desktop, mobile, TV clients.
   ═══════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  /* ── Config ─────────────────────────────────────────────── */
  const MB_ID      = "sbMediaBar";
  const MAX_ITEMS  = 6;    // cycle through max 6 items
  const SLIDE_MS   = 7000; // auto-advance every 7 s
  const IMG_QUALITY = 90;

  /* ── State ───────────────────────────────────────────────── */
  let _items       = [];
  let _current     = 0;
  let _timer       = null;
  let _paused      = false;
  let _built       = false;
  let _loading     = false;
  let _touchStartX = 0;

  /* ── API helpers ─────────────────────────────────────────── */
  function apiClient() {
    try { return window.ApiClient || (window.connectionManager && window.connectionManager.currentApiClient()); }
    catch { return null; }
  }
  function token() {
    try {
      const c = apiClient();
      if (!c) return "";
      return typeof c.accessToken === "function" ? c.accessToken() : (c._accessToken || c.token || "");
    } catch { return ""; }
  }
  function serverUrl() {
    try {
      const c = apiClient();
      if (!c) return window.location.origin;
      const s = typeof c.serverAddress === "function" ? c.serverAddress() : (c._serverAddress || c.serverUrl || window.location.origin);
      return s.replace(/\/$/, "");
    } catch { return window.location.origin; }
  }
  function userId() {
    try {
      const c = apiClient();
      if (!c) return "";
      return typeof c.getCurrentUserId === "function" ? c.getCurrentUserId() : (c._currentUserId || "");
    } catch { return ""; }
  }

  /* ── Page detection ─────────────────────────────────────── */
  function isHome() {
    const h = location.hash || "";
    return h === "" || h === "#/" || h.startsWith("#/home") || h.startsWith("#/index");
  }
  function isMob() { return document.documentElement.classList.contains("layout-mobile"); }

  /* ── Image URLs ──────────────────────────────────────────── */
  function imgUrl(item, type, opts) {
    const base = `${serverUrl()}/Items/${item.Id}/Images/${type}`;
    const params = new URLSearchParams({ quality: IMG_QUALITY, api_key: token(), ...opts });
    return `${base}?${params}`;
  }
  function backdropUrl(item) {
    if (item.BackdropImageTags?.length)
      return imgUrl(item, "Backdrop/0", { fillWidth: 1920, tag: item.BackdropImageTags[0] });
    if (item.ParentBackdropItemId && item.ParentBackdropImageTags?.length)
      return `${serverUrl()}/Items/${item.ParentBackdropItemId}/Images/Backdrop/0?fillWidth=1920&quality=${IMG_QUALITY}&tag=${item.ParentBackdropImageTags[0]}&api_key=${token()}`;
    return null;
  }
  function logoUrl(item) {
    if (item.ImageTags?.Logo)
      return imgUrl(item, "Logo", { fillHeight: 140, tag: item.ImageTags.Logo });
    if (item.ParentLogoItemId && item.ParentLogoImageTag)
      return `${serverUrl()}/Items/${item.ParentLogoItemId}/Images/Logo?fillHeight=140&quality=${IMG_QUALITY}&tag=${item.ParentLogoImageTag}&api_key=${token()}`;
    return null;
  }

  /* ── Data fetch ──────────────────────────────────────────── */
  function fetchItems(cb) {
    const srv = serverUrl(), tok = token(), uid = userId();
    if (!tok || !uid) { cb([]); return; }
    const headers = { "X-Emby-Authorization": `MediaBrowser Token="${tok}"`, "Accept": "application/json" };
    const fields  = "BackdropImageTags,ImageTags,Overview,Genres,ProductionYear,CommunityRating,OfficialRating,RunTimeTicks,SeriesName,ParentBackdropItemId,ParentBackdropImageTags,ParentLogoItemId,ParentLogoImageTag,SeasonName";

    const recentUrl = `${srv}/Users/${uid}/Items/Latest?Limit=10&IncludeItemTypes=Movie,Series&Fields=${fields}&IsPlayed=false&EnableImageTypes=Backdrop,Logo`;
    const resumeUrl = `${srv}/Users/${uid}/Items/Resume?Limit=4&IncludeItemTypes=Movie,Episode&Fields=${fields}&MediaTypes=Video&EnableImageTypes=Backdrop,Logo`;

    Promise.all([
      fetch(recentUrl, { headers }).then(r => r.ok ? r.json() : []),
      fetch(resumeUrl, { headers }).then(r => r.ok ? r.json() : { Items: [] })
    ]).then(([recent, resume]) => {
      const recentArr = Array.isArray(recent) ? recent : (recent.Items || []);
      const resumeArr = Array.isArray(resume) ? resume : (resume.Items || []);
      const seen = new Set(), merged = [];
      for (const item of [...resumeArr, ...recentArr]) {
        const key = item.SeriesId || item.Id;
        if (!seen.has(key)) { seen.add(key); merged.push(item); }
      }
      cb(merged.filter(i => backdropUrl(i)).slice(0, MAX_ITEMS));
    }).catch(() => cb([]));
  }

  /* ── Formatters ──────────────────────────────────────────── */
  function fmtRuntime(ticks) {
    if (!ticks) return "";
    const m = Math.round(ticks / 600000000);
    return m >= 60 ? `${Math.floor(m/60)}h${m%60 ? ` ${m%60}m` : ""}` : `${m}m`;
  }
  function itemTitle(item) { return item.SeriesName || item.Name || ""; }
  function itemSub(item) {
    // Only show subtitle for episodes (series + season + ep number)
    // Year is already shown in the meta row — don't duplicate it here
    if (item.Type === "Episode") {
      return [item.SeasonName, item.IndexNumber != null ? `E${item.IndexNumber}` : ""].filter(Boolean).join(" · ");
    }
    return "";
  }
  function detailUrl(item) {
    return `/web/#/details?id=${item.Type === "Episode" ? (item.SeriesId || item.Id) : item.Id}`;
  }

  /* ── Slide HTML ──────────────────────────────────────────── */
  function slideHTML(item, i) {
    const bg     = backdropUrl(item);
    const logo   = logoUrl(item);
    const title  = itemTitle(item);
    const sub    = itemSub(item);
    const rt     = fmtRuntime(item.RunTimeTicks);
    const year   = item.ProductionYear || "";
    const rating = item.OfficialRating ? `<span class="sbMbRating">${item.OfficialRating}</span>` : "";
    const score  = item.CommunityRating ? `<span class="sbMbScore">★ ${item.CommunityRating.toFixed(1)}</span>` : "";
    const genres = (item.Genres || []).slice(0, 3).map(g => `<span>${g}</span>`).join("");
    const ov     = item.Overview ? item.Overview.slice(0, 180) + (item.Overview.length > 180 ? "…" : "") : "";
    const meta   = [year, rt].filter(Boolean).join(" · ");

    return `
      <div class="sbMbSlide${i === 0 ? " sbMbSlide--active" : ""}" data-index="${i}" aria-hidden="${i !== 0}">
        <div class="sbMbBg" style="background-image:url('${bg}')"></div>
        <div class="sbMbScrim"></div>
        ${logo ? `<img class="sbMbLogo" src="${logo}" alt="${title}">` : ""}
        <div class="sbMbContent">
          ${sub ? `<p class="sbMbSub">${sub}</p>` : ""}
          <div class="sbMbMeta">
            ${meta   ? `<span class="sbMbMetaText">${meta}</span>` : ""}
            ${rating}${score}
            ${genres ? `<span class="sbMbGenreSep">·</span><span class="sbMbGenres">${genres}</span>` : ""}
          </div>
          ${ov ? `<p class="sbMbOverview">${ov}</p>` : ""}
          <div class="sbMbActions">
            <a class="sbMbBtn sbMbBtn--play" href="${detailUrl(item)}"><span class="material-icons">play_arrow</span>Play</a>
            <a class="sbMbBtn sbMbBtn--info" href="${detailUrl(item)}"><span class="material-icons">info</span>More Info</a>
          </div>
        </div>
      </div>`;
  }

  /* ── Bar DOM ─────────────────────────────────────────────── */
  function buildBar(items) {
    const el = document.createElement("div");
    el.id = MB_ID;
    el.setAttribute("role", "region");
    el.setAttribute("aria-label", "Featured content");
    el.setAttribute("tabindex", "0");

    const dotsHTML = items.length > 1
      ? items.map((_, i) => `<button class="sbMbDot${i===0?" sbMbDot--active":""}" data-dot="${i}" aria-label="Slide ${i+1}"></button>`).join("")
      : "";

    el.innerHTML = `
      <div class="sbMbTrack">${items.map((item, i) => slideHTML(item, i)).join("")}</div>
      ${items.length > 1 ? `
        <button class="sbMbArrow sbMbArrow--prev" aria-label="Previous"><span class="material-icons">chevron_left</span></button>
        <button class="sbMbArrow sbMbArrow--next" aria-label="Next"><span class="material-icons">chevron_right</span></button>
        <div class="sbMbDots">${dotsHTML}</div>
      ` : ""}`;
    return el;
  }

  /* ── Slide logic ─────────────────────────────────────────── */
  function slides()  { return document.querySelectorAll(`#${MB_ID} .sbMbSlide`); }
  function dots()    { return document.querySelectorAll(`#${MB_ID} .sbMbDot`); }

  function goTo(idx) {
    const ss = slides(), ds = dots();
    if (!ss.length) return;
    _current = ((idx % ss.length) + ss.length) % ss.length;
    ss.forEach((s, i) => {
      s.classList.toggle("sbMbSlide--active", i === _current);
      s.setAttribute("aria-hidden", String(i !== _current));
    });
    ds.forEach((d, i) => d.classList.toggle("sbMbDot--active", i === _current));
  }

  function startTimer() {
    clearInterval(_timer);
    if (_items.length <= 1 || _paused) return;
    _timer = setInterval(() => goTo(_current + 1), SLIDE_MS);
  }

  /* ── Injection ───────────────────────────────────────────── */
  function findTarget() {
    return (
      document.querySelector(".homeSectionsContainer") ||
      document.querySelector(".sections") ||
      document.querySelector("#homeTab") ||
      document.querySelector(".indexPage .padded-top")
    );
  }

  function inject() {
    if (!isHome() || document.getElementById(MB_ID) || !_items.length) return;
    const target = findTarget();
    if (!target) return;

    const bar = buildBar(_items);

    // Insert the bar as a sibling BEFORE the home sections, inside whatever
    // scroll container holds them — so it appears above all library rows.
    target.parentNode.insertBefore(bar, target);

    // Events
    bar.querySelector(".sbMbArrow--prev")?.addEventListener("click", e => { e.stopPropagation(); goTo(_current - 1); startTimer(); });
    bar.querySelector(".sbMbArrow--next")?.addEventListener("click", e => { e.stopPropagation(); goTo(_current + 1); startTimer(); });
    bar.querySelectorAll(".sbMbDot").forEach(d => d.addEventListener("click", e => { e.stopPropagation(); goTo(+d.dataset.dot); startTimer(); }));
    bar.addEventListener("mouseenter", () => { _paused = true;  clearInterval(_timer); });
    bar.addEventListener("mouseleave", () => { _paused = false; startTimer(); });
    bar.addEventListener("touchstart", e => { _touchStartX = e.touches[0].clientX; }, { passive: true });
    bar.addEventListener("touchend",   e => {
      const dx = e.changedTouches[0].clientX - _touchStartX;
      if (Math.abs(dx) > 45) {
        e.preventDefault();    // cancel any click/link navigation
        e.stopPropagation();
        goTo(_current + (dx < 0 ? 1 : -1));
        startTimer();
      }
    });
    bar.addEventListener("keydown", e => {
      if (e.key === "ArrowLeft")  { goTo(_current - 1); startTimer(); }
      if (e.key === "ArrowRight") { goTo(_current + 1); startTimer(); }
    });

    startTimer();
    _built = true;
  }

  function eject() {
    clearInterval(_timer);
    _built = false;
    document.getElementById(MB_ID)?.remove();
  }

  /* ── Boot ────────────────────────────────────────────────── */
  function load() {
    if (_loading) return;
    const c = apiClient();
    if (!c || !userId()) return;
    _loading = true;
    fetchItems(items => {
      _loading = false;
      _items   = items;
      if (items.length && isHome() && !document.getElementById(MB_ID)) inject();
    });
  }

  function onRoute() {
    if (isHome()) {
      if (!document.getElementById(MB_ID)) {
        _items.length ? setTimeout(inject, 350) : setTimeout(load, 350);
      }
    } else {
      eject();
    }
  }

  function init() {
    window.addEventListener("hashchange", onRoute);
    window.addEventListener("popstate",   onRoute);

    // Watch for the home container to appear (SPA navigation)
    new MutationObserver(() => {
      if (!isHome() || _built || document.getElementById(MB_ID)) return;
      if (findTarget() && _items.length) inject();
    }).observe(document.body, { childList: true, subtree: true });

    // Wait for ApiClient AND a valid userId — poll aggressively.
    // When loaded via CDN script injection the Jellyfin SPA may not have
    // finished bootstrapping yet, so we poll up to 60 × 500ms = 30 seconds.
    let tries = 0;
    const poll = () => {
      const c = apiClient();
      const uid = userId();
      if (c && uid) {
        load();
        return;
      }
      // Also try to hook into Jellyfin's own Events system as a faster signal
      if (tries === 0 && window.Events && window.ApiClient) {
        try {
          window.Events.on(window.ApiClient, "websocketmessage", function handler() {
            window.Events.off(window.ApiClient, "websocketmessage", handler);
            setTimeout(load, 200);
          });
        } catch(e) {}
      }
      if (++tries < 60) setTimeout(poll, 500);
    };
    // Start polling — delay slightly more for CDN injection scenario
    setTimeout(poll, 1200);

    // Also trigger on any hashchange that fires before ApiClient is ready
    // (covers the case where the user is already on home when script loads)
    const earlyRoute = () => {
      if (apiClient() && userId()) {
        window.removeEventListener("hashchange", earlyRoute);
        if (isHome() && !document.getElementById(MB_ID)) load();
      }
    };
    window.addEventListener("hashchange", earlyRoute);
  }

  // For CDN injection: the script tag fires after DOMContentLoaded in most cases.
  // We wait for requestAnimationFrame to ensure Jellyfin's own boot scripts have run.
  function boot() {
    // If Jellyfin's require/define is present, wait one more tick
    if (typeof require === "function" || typeof define === "function") {
      setTimeout(init, 500);
    } else {
      init();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    // Already past DOMContentLoaded — script was injected late (CDN case)
    requestAnimationFrame(() => setTimeout(boot, 300));
  }

})();

/* ═══════════════════════════════════════════════════════════
   SB LIBRARY OVERLAY — Moonfin-style
   Flash-free via body class added on hashchange before paint.
   ═══════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  const LETTERS = ['#','A','B','C','D','E','F','G','H','I','J','K','L','M',
                   'N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];

  const SORT_OPTIONS = [
    { key: 'SortName,Ascending',         label: 'Name (A–Z)' },
    { key: 'SortName,Descending',        label: 'Name (Z–A)' },
    { key: 'PremiereDate,Descending',    label: 'Release Date (New)' },
    { key: 'PremiereDate,Ascending',     label: 'Release Date (Old)' },
    { key: 'CommunityRating,Descending', label: 'Rating (High–Low)' },
    { key: 'CommunityRating,Ascending',  label: 'Rating (Low–High)' },
    { key: 'DateCreated,Descending',     label: 'Date Added (New)' },
    { key: 'DateCreated,Ascending',      label: 'Date Added (Old)' },
  ];

  const FILTER_OPTIONS = [
    { key: 'all',    label: 'All' },
    { key: 'Movie',  label: 'Movies' },
    { key: 'Series', label: 'TV Shows' },
  ];

  const BATCH = 100;
  const BODY_CLASS = 'sb-lib-page';

  /* ── State ── */
  let overlay    = null;
  let visible    = false;
  let libId      = null;
  let libName    = '';
  let colType    = '';
  let items      = [];
  let total      = 0;
  let startIdx   = 0;
  let sortKey    = 'SortName,Ascending';
  let filterKey  = 'all';
  let letter     = null;
  let loading    = false;
  let escHandler = null;

  /* ── API helpers ── */
  function apiClient() { return window.ApiClient || (typeof ApiClient !== 'undefined' ? ApiClient : null); }
  function userId() {
    const c = apiClient(); if (!c) return null;
    try { return c.getCurrentUserId ? c.getCurrentUserId() : (c._currentUserId || null); } catch(e) { return null; }
  }
  function serverUrl() {
    const c = apiClient(); if (!c) return window.location.origin;
    try { const s = c.serverAddress ? c.serverAddress() : (c._serverAddress || c.serverUrl || window.location.origin); return s.replace(/\/$/, ''); } catch(e) { return window.location.origin; }
  }
  function authHeader() {
    const c = apiClient(); if (!c) return '';
    try { const tok = c.accessToken ? c.accessToken() : (c._accessToken || c.token || ''); return `MediaBrowser Token="${tok}"`; } catch(e) { return ''; }
  }
  function posterUrl(item) {
    if (!item.ImageTags || !item.ImageTags.Primary) return null;
    return `${serverUrl()}/Items/${item.Id}/Images/Primary?maxWidth=280&tag=${item.ImageTags.Primary}&quality=90`;
  }

  /* ── Page detection ── */
  function h() { return (location.hash || '').toLowerCase(); }
  function isMoviesPage()    { return h().includes('/movies'); }
  function isTVPage()        { return h().includes('/tv'); }
  function isFavoritesPage() { return h().includes('tab=1') || h().includes('/favorites') || h().includes('/favorite'); }
  function isInterceptable() { return isMoviesPage() || isTVPage() || isFavoritesPage(); }

  /* ── Body class controls the CSS flash shield ── */
  function engageShield()  { document.body.classList.add(BODY_CLASS); }
  function releaseShield() { document.body.classList.remove(BODY_CLASS); }

  /* ── Fetch ── */
  async function fetchItems(reset) {
    if (reset) { startIdx = 0; items = []; loading = true; render(); }
    const [sortBy, sortOrder] = sortKey.split(',');
    const inclTypes = filterKey === 'all'
      ? (colType === 'movies' ? 'Movie' : colType === 'tvshows' ? 'Series' : 'Movie,Series')
      : filterKey;
    const params = new URLSearchParams({
      StartIndex: startIdx, Limit: BATCH,
      SortBy: sortBy, SortOrder: sortOrder,
      IncludeItemTypes: inclTypes, Recursive: 'true',
      Fields: 'PrimaryImageAspectRatio,CommunityRating,OfficialRating,ProductionYear',
      ImageTypeLimit: 1, EnableImageTypes: 'Primary', UserId: userId(),
    });
    if (colType === 'favorites') params.set('IsFavorite', 'true');
    else if (libId)              params.set('ParentId', libId);
    if (letter && letter !== '#') params.set('NameStartsWith', letter);
    if (letter === '#')           params.set('NameLessThan', 'A');
    try {
      const res  = await fetch(`${serverUrl()}/Items?${params}`, { headers: { 'X-Emby-Authorization': authHeader() } });
      const data = await res.json();
      total = data.TotalRecordCount || 0;
      items = reset ? (data.Items || []) : items.concat(data.Items || []);
    } catch(e) { console.error('[Streamberry] fetchItems:', e); }
    loading = false;
    render();
  }

  /* ── Dropdown ── */
  function showDropdown(title, options, currentKey, onSelect) {
    document.getElementById('sbLibDropdown')?.remove();
    const dd = document.createElement('div');
    dd.id = 'sbLibDropdown'; dd.className = 'sb-lib-dropdown';
    let html = `<div class="sb-lib-dropdown-backdrop"></div><div class="sb-lib-dropdown-box"><div class="sb-lib-dropdown-title">${title}</div>`;
    options.forEach(o => { html += `<button class="sb-lib-dropdown-opt${o.key === currentKey ? ' sb-active':''}" data-key="${o.key}">${o.label}</button>`; });
    dd.innerHTML = html + '</div>';
    document.body.appendChild(dd);
    requestAnimationFrame(() => dd.classList.add('sb-visible'));
    dd.querySelector('.sb-lib-dropdown-backdrop').addEventListener('click', () => { dd.classList.remove('sb-visible'); setTimeout(() => dd.remove(), 200); });
    dd.querySelectorAll('.sb-lib-dropdown-opt').forEach(btn => btn.addEventListener('click', () => { onSelect(btn.dataset.key); dd.classList.remove('sb-visible'); setTimeout(() => dd.remove(), 200); }));
  }

  /* ── Render ── */
  function render() {
    if (!overlay) return;
    const sortLabel   = (SORT_OPTIONS.find(o => o.key === sortKey)    || SORT_OPTIONS[0]).label;
    const filterLabel = (FILTER_OPTIONS.find(o => o.key === filterKey) || FILTER_OPTIONS[0]).label;
    const alphaHTML   = LETTERS.map(l => `<button class="sb-lib-alpha-btn${letter === l ? ' sb-active':''}" data-letter="${l}">${l}</button>`).join('');

    let bodyHTML = '';
    if (loading && items.length === 0) {
      bodyHTML = '<div class="sb-lib-loading"><div class="sb-lib-spinner"></div></div>';
    } else if (!loading && items.length === 0) {
      bodyHTML = '<div class="sb-lib-empty">No items found</div>';
    } else {
      bodyHTML = '<div class="sb-lib-grid">';
      items.forEach(item => {
        const img   = posterUrl(item);
        const year  = item.ProductionYear || '';
        const rat   = item.OfficialRating || '';
        const score = item.CommunityRating ? '★ ' + item.CommunityRating.toFixed(1) : '';
        const badge = item.Type === 'Movie' ? 'MOVIE' : item.Type === 'Series' ? 'SERIES' : '';
        bodyHTML += `<div class="sb-lib-card" data-id="${item.Id}">
          <div class="sb-lib-card-poster">
            ${img ? `<img class="sb-lib-card-img" src="${img}" alt="" loading="lazy">` : `<div class="sb-lib-card-no-img"><span class="material-icons">movie</span></div>`}
            ${badge ? `<span class="sb-lib-badge">${badge}</span>` : ''}
          </div>
          <div class="sb-lib-card-info">
            <div class="sb-lib-card-name">${(item.Name||'Unknown').replace(/</g,'&lt;')}</div>
            <div class="sb-lib-card-meta">
              ${year?`<span>${year}</span>`:''}${rat?`<span>${rat}</span>`:''}${score?`<span>${score}</span>`:''}
            </div>
          </div>
        </div>`;
      });
      if (items.length < total) bodyHTML += `<div class="sb-lib-load-more"><button class="sb-lib-btn" id="sbLibLoadMore">Load More</button></div>`;
      bodyHTML += '</div>';
    }

    overlay.innerHTML = `
      <div class="sb-lib-header">
        <h1 class="sb-lib-title">${libName}</h1>
        <span class="sb-lib-count">${total > 0 ? total.toLocaleString() + ' items' : ''}</span>
      </div>
      <div class="sb-lib-toolbar">
        <div class="sb-lib-toolbar-left">
          <button class="sb-lib-btn" id="sbLibSort"><span class="material-icons">sort</span><span>${sortLabel}</span></button>
          <button class="sb-lib-btn" id="sbLibFilter"><span class="material-icons">filter_list</span><span>${filterLabel}</span></button>
        </div>
        <div class="sb-lib-alpha-nav">${alphaHTML}</div>
      </div>
      ${bodyHTML}`;

    bindEvents();
  }

  function bindEvents() {
    overlay.querySelector('#sbLibSort')?.addEventListener('click', () => showDropdown('Sort By', SORT_OPTIONS, sortKey, k => { sortKey = k; fetchItems(true); }));
    overlay.querySelector('#sbLibFilter')?.addEventListener('click', () => showDropdown('Filter', FILTER_OPTIONS, filterKey, k => { filterKey = k; fetchItems(true); }));
    overlay.querySelectorAll('.sb-lib-alpha-btn').forEach(btn => btn.addEventListener('click', () => { const l = btn.dataset.letter; letter = letter === l ? null : l; fetchItems(true); }));
    overlay.querySelectorAll('.sb-lib-card').forEach(card => card.addEventListener('click', () => { const id = card.dataset.id; if (!id) return; hide(); location.href = `#!/details?id=${id}`; }));
    overlay.querySelector('#sbLibLoadMore')?.addEventListener('click', () => { startIdx = items.length; fetchItems(false); });
    overlay.addEventListener('scroll', () => {
      if (loading || items.length >= total) return;
      if (overlay.scrollTop + overlay.clientHeight >= overlay.scrollHeight - 500) { startIdx = items.length; fetchItems(false); }
    });
    if (escHandler) document.removeEventListener('keydown', escHandler);
    escHandler = e => { if (e.key === 'Escape' && visible) { e.preventDefault(); hide(); } };
    document.addEventListener('keydown', escHandler);
  }

  /* ── Show / Hide ── */
  function show(id, name, type) {
    libId = id; libName = name; colType = type;
    items = []; total = 0; startIdx = 0;
    sortKey   = 'SortName,Ascending';
    filterKey = colType === 'movies' ? 'Movie' : colType === 'tvshows' ? 'Series' : 'all';
    letter = null; loading = false; visible = true;
    overlay.classList.add('sb-visible');
    document.body.style.overflow = 'hidden';
    fetchItems(true);
  }

  function hide() {
    visible = false;
    overlay?.classList.remove('sb-visible');
    document.body.style.overflow = '';
    releaseShield();
    if (escHandler) { document.removeEventListener('keydown', escHandler); escHandler = null; }
  }

  function createOverlay() {
    if (overlay) return;
    overlay = document.createElement('div');
    overlay.className = 'sb-library-overlay';
    document.body.appendChild(overlay);
  }

  /* ── Library ID resolution ── */
  function getLibIdFromHash() {
    const m = (location.hash || '').match(/[?&]topParentId=([^&]+)/i);
    return m ? m[1] : null;
  }

  async function resolveLibId() {
    const fromHash = getLibIdFromHash();
    if (fromHash) return fromHash;
    const c = apiClient(), uid = userId();
    if (!c || !uid) return null;
    try {
      const res  = await fetch(`${serverUrl()}/Users/${uid}/Views`, { headers: { 'X-Emby-Authorization': authHeader() } });
      const data = await res.json();
      const views = data.Items || [];
      const type  = isMoviesPage() ? 'movies' : isTVPage() ? 'tvshows' : '';
      const match = views.find(v => (v.CollectionType || '').toLowerCase() === type);
      return match ? match.Id : (views[0] ? views[0].Id : null);
    } catch(e) { return null; }
  }

  /* ── Intercept ── */
  let _active = false;

  async function tryIntercept() {
    if (!isInterceptable()) {
      if (_active) { hide(); _active = false; }
      return;
    }
    if (visible) return;
    _active = true;
    engageShield(); // ← hide native page NOW, before API call

    // Wait for ApiClient
    if (!apiClient() || !userId()) {
      let tries = 0;
      await new Promise(resolve => {
        const poll = setInterval(() => {
          if ((apiClient() && userId()) || ++tries > 30) { clearInterval(poll); resolve(); }
        }, 200);
      });
    }

    if (!apiClient() || !userId()) { _active = false; releaseShield(); return; }

    if (isFavoritesPage()) { show(null, 'Favorites', 'favorites'); return; }

    const id = await resolveLibId();
    if (!id) { _active = false; releaseShield(); return; }

    const type = isMoviesPage() ? 'movies' : isTVPage() ? 'tvshows' : '';
    show(id, type === 'movies' ? 'Movies' : 'TV Shows', type);
  }

  /* ── Boot ── */
  createOverlay();

  // Engage shield IMMEDIATELY on hashchange — before Jellyfin renders anything
  window.addEventListener('hashchange', () => {
    if (visible) hide();
    _active = false;
    if (isInterceptable()) engageShield();
    setTimeout(tryIntercept, 200);
  }, true); // capture phase — fires before Jellyfin's own listener

  window.addEventListener('popstate', () => {
    if (isInterceptable()) engageShield();
    setTimeout(tryIntercept, 200);
  }, true);

  const _boot = () => {
    if (isInterceptable()) engageShield();
    setTimeout(tryIntercept, 700);
  };

  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', _boot); }
  else { _boot(); }

})();
