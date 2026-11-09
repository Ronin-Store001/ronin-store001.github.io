/* ═══════════════════════════════════════════════════════════════
   RONIN STORE — VIDEO ADS · js/11-video-ads.js
   کمپین‌های ویدیویی واقعی (MP4) + پخش خودکار هنگام اقدام کاربر
   • پلیر اختصاصی با کنترل پخش/صدا/بعدی/قبلی
   • تبلیغ شناور پس از مشاهده محصول، افزودن به سبد یا ورود به بازار
   • محدودیت دفعات و دکمهٔ بستن (بدون آزار)
   • آمار Impression / Click / Complete در همین مرورگر
   ═══════════════════════════════════════════════════════════════ */
"use strict";
(function () {
  if (!window.R) return;
  var R = window.R;
  var C = [
    {
      id: "elite-drop",
      brand: "RONIN STORE",
      title: "ELITE DROP",
      copy: "کالکشن محدود فیگور و گجت‌های رونین — تا ۳۰٪ تخفیف.",
      cta: "مشاهدهٔ کالکشن",
      target: "market",
      video: "media/ronin-ad-elite.mp4",
      poster: "media/ronin-ad-elite.jpg",
      theme: "#7c5cff"
    },
    {
      id: "seller-spotlight",
      brand: "RONIN MARKET",
      title: "YOUR STORE",
      copy: "محصولت را در بازار رونین ثبت کن و مستقیم به خریدارها برس.",
      cta: "ثبت آگهی",
      target: "ads",
      video: "media/ronin-ad-seller.mp4",
      poster: "media/ronin-ad-seller.jpg",
      theme: "#ff4fd8"
    }
  ];
  var K_LAST = "ronin-ad-last", K_SNOOZE = "ronin-ad-snooze", K_STATS = "ronin-ad-stats";
  var state = { idx: 0, mounted: false, userPaused: false, video: null, floating: null };
  function q(id) { return document.getElementById(id); }
  function fa(n) { return R.fa ? R.fa(n) : String(n); }
  function read(key, fallback) {
    try { var v = localStorage.getItem(key); return v == null ? fallback : v; } catch (e) { return fallback; }
  }
  function write(key, value) { try { localStorage.setItem(key, value); } catch (e) {} }
  function stats() {
    var s = {};
    try { s = JSON.parse(read(K_STATS, "{}")) || {}; } catch (e) { s = {}; }
    return { impressions: +s.impressions || 0, clicks: +s.clicks || 0, completes: +s.completes || 0 };
  }
  function bump(key) {
    var s = stats();
    s[key] = (s[key] || 0) + 1;
    write(K_STATS, JSON.stringify(s));
    paintStats();
    try { document.dispatchEvent(new CustomEvent("ronin:adstat", { detail: s })); } catch (e) {}
  }
  function paintStats() {
    var s = stats();
    var set = function (id, v) { var e = q(id); if (e) e.textContent = fa(v); };
    set("vaImpr", s.impressions);
    set("vaImprSide", s.impressions);
    set("vaClicks", s.clicks);
    set("vaDone", s.completes);
  }
  function fmt(sec) {
    sec = Math.max(0, Math.floor(sec || 0));
    return Math.floor(sec / 60) + ":" + ("0" + (sec % 60)).slice(-2);
  }
  function current() { return C[state.idx] || C[0]; }
  function canAuto() {
    try { return !window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { return true; }
  }
  function play(v) {
    if (!v) return;
    v.muted = true;
    var p = v.play();
    if (p && p.catch) p.catch(function () {
      var stage = q("vaPosterPlay"); if (stage) stage.classList.add("on");
    });
  }
  function pause(v) { if (v && !v.paused) try { v.pause(); } catch (e) {} }
  function setCampaign(i, autoplay) {
    state.idx = (i + C.length) % C.length;
    var c = current();
    var v = q("vaVideo");
    var set = function (id, text) { var e = q(id); if (e) e.textContent = text; };
    set("vaBrand", c.brand);
    set("vaBigTitle", c.title);
    set("vaCopy", c.copy);
    var cta = q("vaCta");
    if (cta) {
      cta.textContent = c.cta;
      cta.setAttribute("data-go", c.target);
      cta.setAttribute("href", "#" + c.target);
    }
    if (v) {
      v.poster = c.poster;
      v.src = c.video;
      v.load();
      state.video = v;
      state.userPaused = false;
      if (autoplay && canAuto()) setTimeout(function () { play(v); }, 160);
    }
    Array.prototype.forEach.call(document.querySelectorAll("[data-vacamp]"), function (b) {
      b.classList.toggle("on", b.getAttribute("data-vacamp") === String(state.idx));
    });
    paintStats();
  }
  function bindDedicated() {
    var v = q("vaVideo"); if (!v) return;
    var playBtn = q("vaPlay"), muteBtn = q("vaMute");
    if (playBtn) playBtn.addEventListener("click", function () {
      state.userPaused = false;
      if (v.paused) play(v); else { state.userPaused = true; pause(v); }
    });
    if (muteBtn) muteBtn.addEventListener("click", function () {
      v.muted = !v.muted;
      muteBtn.textContent = v.muted ? "🔇" : "🔊";
      muteBtn.setAttribute("aria-label", v.muted ? "با صدا" : "بی‌صدا");
    });
    var nx = q("vaNext"), pr = q("vaPrev");
    if (nx) nx.addEventListener("click", function () { setCampaign(state.idx + 1, true); });
    if (pr) pr.addEventListener("click", function () { setCampaign(state.idx - 1, true); });
    var close = q("vaClose");
    if (close) close.addEventListener("click", function () { pause(v); R.go("ads"); });
    var cta = q("vaCta");
    if (cta) cta.addEventListener("click", function () { bump("clicks"); });
    v.addEventListener("play", function () { var p = q("vaPosterPlay"); if (p) p.classList.remove("on"); });
    v.addEventListener("timeupdate", function () {
      var bar = q("vaBar"), tm = q("vaTime");
      var d = v.duration || 8;
      if (bar) bar.style.width = Math.min(100, (v.currentTime / d) * 100) + "%";
      if (tm) tm.textContent = fmt(v.currentTime) + " / " + fmt(d);
    });
    v.addEventListener("ended", function () {
      bump("completes");
      var bar = q("vaBar"); if (bar) bar.style.width = "100%";
      var p = q("vaPosterPlay"); if (p) p.classList.add("on");
    });
    v.addEventListener("error", function () {
      var stage = q("vaStage"); if (stage) stage.classList.add("vaError");
    });
  }
  function buildCampaignList() {
    var box = q("vaCampaigns"); if (!box) return;
    box.innerHTML = C.map(function (c, i) {
      return '<button class="vaCampaign' + (i === state.idx ? " on" : "") + '" type="button" data-vacamp="' + i + '">' +
        '<i>' + (i === 0 ? "🎬" : "📢") + '</i><span><b>' + c.title + "</b><span>" + c.brand + "</span></span></button>";
    }).join("");
    box.addEventListener("click", function (e) {
      var b = e.target.closest("[data-vacamp]"); if (!b) return;
      setCampaign(parseInt(b.getAttribute("data-vacamp"), 10) || 0, true);
    });
  }

  /* ── تبلیغ شناور پس از اقدام ───────────────────────────── */
  function snoozed() {
    var until = parseInt(read(K_SNOOZE, "0"), 10) || 0;
    return Date.now() < until;
  }
  function showFloating() {
    if (state.floating || snoozed() || R.prem || q("sec-videoads") && q("sec-videoads").classList.contains("on")) return;
    if (document.querySelector(".modal.on")) return;
    var last = parseInt(read(K_LAST, "0"), 10) || 0;
    if (Date.now() - last < 150000) return;
    write(K_LAST, String(Date.now()));
    state.idx = (state.idx + 1) % C.length;
    var c = current();
    var wrap = document.createElement("div");
    wrap.id = "roninAdFloat";
    wrap.setAttribute("role", "complementary");
    wrap.setAttribute("aria-label", "تبلیغ ویدیویی");
    wrap.innerHTML =
      '<div class="vaFloatVideo"><video muted playsinline preload="metadata" poster="' + c.poster + '"></video>' +
        '<div class="vaFloatTop"><span class="vaFloatBadge">AD</span><div class="row" style="gap:4px">' +
          '<button class="vaFloatMute" type="button" aria-label="بی‌صدا">🔇</button>' +
          '<button class="vaFloatX" type="button" aria-label="بستن تبلیغ">✕</button></div></div>' +
        '<div class="vaFloatProg"><i></i></div></div>' +
      '<div class="vaFloatBody"><div class="vaFloatKicker">SPONSORED · RONIN</div>' +
        '<div class="vaFloatTitle">' + c.title + '</div><div class="vaFloatCopy">' + c.copy + "</div>" +
        '<div class="vaFloatFoot"><button class="btn p mini vaFloatCta" type="button">' + c.cta + '</button>' +
          '<button class="vaFloatLink" type="button">چرا این تبلیغ؟</button></div></div>';
    document.body.appendChild(wrap);
    state.floating = wrap;
    var v = wrap.querySelector("video");
    v.src = c.video;
    v.muted = true;
    v.play().then(function () { bump("impressions"); }).catch(function () {});
    v.addEventListener("timeupdate", function () {
      var bar = wrap.querySelector(".vaFloatProg i");
      var d = v.duration || 8;
      if (bar) bar.style.width = Math.min(100, (v.currentTime / d) * 100) + "%";
    });
    v.addEventListener("ended", function () { bump("completes"); });
    var mute = wrap.querySelector(".vaFloatMute");
    if (mute) mute.addEventListener("click", function () {
      v.muted = !v.muted; mute.textContent = v.muted ? "🔇" : "🔊";
    });
    var x = wrap.querySelector(".vaFloatX");
    if (x) x.addEventListener("click", function () {
      write(K_SNOOZE, String(Date.now() + 600000));
      pause(v); wrap.remove(); state.floating = null;
    });
    var cta = wrap.querySelector(".vaFloatCta");
    if (cta) cta.addEventListener("click", function () {
      bump("clicks"); pause(v); wrap.remove(); state.floating = null;
      if (R.go) R.go(c.target);
    });
    var why = wrap.querySelector(".vaFloatLink");
    if (why) why.addEventListener("click", function () {
      if (R.toast) R.toast("این تبلیغ خانگی رونین است؛ با پرمیوم می‌توانی تبلیغات را محدود کنی.", "ok");
    });
  }

  function mount() {
    if (state.mounted || !q("vaVideo")) return;
    state.mounted = true;
    bindDedicated();
    buildCampaignList();
    setCampaign(0, false);
    paintStats();
    R.hooks.videoads = function () {
      if (state.userPaused) return;
      setTimeout(function () { if (!state.userPaused) play(q("vaVideo")); }, 260);
    };
    if ("IntersectionObserver" in window) {
      try {
        new IntersectionObserver(function (entries) {
          entries.forEach(function (en) {
            if (en.isIntersecting && !state.userPaused) play(q("vaVideo"));
            else if (!en.isIntersecting) pause(q("vaVideo"));
          });
        }, { threshold: .35 }).observe(q("vaStage"));
      } catch (e) {}
    }
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) pause(q("vaVideo"));
    });
    document.addEventListener("ronin:action", function (e) {
      var type = e && e.detail && e.detail.type;
      if (type === "cart-add" || type === "product-open" || type === "ad-submitted") {
        setTimeout(showFloating, 900);
      }
    });
    document.addEventListener("click", function (e) {
      var t = e.target.closest ? e.target.closest(
        "[data-cartadd],[data-prod],[data-go=\"market\"],[data-go=\"community\"],[data-go=\"discover\"],[data-go=\"videoads\"]") : null;
      if (t) setTimeout(showFloating, 1200);
    }, true);
    document.addEventListener("ronin:adstat", function () {
      if (R.renderAdsDashboard) R.renderAdsDashboard();
    });
  }

  R.videoAds = {
    campaigns: C,
    stats: stats,
    show: showFloating,
    open: function (i) {
      if (typeof i === "number") setCampaign(i, false);
      R.go("videoads");
      setTimeout(function () { setCampaign(state.idx, true); }, 220);
    }
  };
  R.bootVideoAds = mount;
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { setTimeout(mount, 900); });
  else setTimeout(mount, 900);
  window.R = R;
})();
