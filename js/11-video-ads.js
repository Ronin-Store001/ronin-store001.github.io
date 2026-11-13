/* ═══════════════════════════════════════════════════════════════
   RONIN STORE — VIDEO ADS · js/11-video-ads.js  v2
   کمپین‌های ویدیویی واقعی (MP4) + پخش خودکار هنگام اقدام کاربر
   • کمپین‌ها از Firebase (ads/campaigns) خوانده می‌شوند؛ مالک می‌تواند اضافه/حذف کند
   • اگر دیتابیس در دسترس نباشد، کمپین‌های داخلی پخش می‌شوند
   • آمار Impression / Click / Complete هم محلی و هم تجمیعی در Firebase
   • پلیر اختصاصی، تبلیغ شناور، دکمهٔ بستن و محدودیت دفعات
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
      url: "",
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
      url: "",
      video: "media/ronin-ad-seller.mp4",
      poster: "media/ronin-ad-seller.jpg",
      theme: "#ff4fd8"
    }
  ];
  var K_LAST = "ronin-ad-last", K_SNOOZE = "ronin-ad-snooze", K_STATS = "ronin-ad-stats";
  var state = { idx: 0, mounted: false, userPaused: false, video: null, floating: null, seen: {}, ownerBuilt: false };
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
  function bump(key, id) {
    var s = stats();
    s[key] = (s[key] || 0) + 1;
    write(K_STATS, JSON.stringify(s));
    paintStats();
    try { document.dispatchEvent(new CustomEvent("ronin:adstat", { detail: s })); } catch (e) {}
    /* آمار واقعی و مشترک بین همهٔ بازدیدکننده‌ها */
    if (id && R.db) {
      try {
        R.db.ref("ads/stats/" + id + "/" + key).transaction(function (v) { return (+v || 0) + 1; }).catch(function () {});
      } catch (e) {}
    }
  }
  function paintStats() {
    var s = stats();
    var set = function (id, v) { var e = q(id); if (e) e.textContent = fa(v); };
    set("vaImpr", s.impressions);
    set("vaImprSide", s.impressions);
    set("vaClicks", s.clicks);
    set("vaDone", s.completes);
    Array.prototype.forEach.call(document.querySelectorAll("[data-vacount]"), function (b) {
      b.textContent = fa(C.length) + " کمپین";
    });
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

  /* ── کمپین‌ها: دیتابیس + داخلی ─────────────────────────── */
  function normalize(k, v) {
    if (!v || typeof v !== "object") return null;
    var video = String(v.video || v.src || "").trim();
    if (!video) return null;
    return {
      id: k || ("ad-" + Date.now()),
      brand: v.brand || "RONIN ADS",
      title: v.title || "RONIN AD",
      copy: v.copy || v.desc || "",
      cta: v.cta || "بیشتر بدانید",
      target: v.target || "market",
      url: /^https?:\/\//i.test(String(v.url || "")) ? String(v.url) : "",
      video: video,
      poster: v.poster || "",
      theme: v.theme || "#7c5cff",
      live: v.live !== false && v.active !== false
    };
  }
  function applyList(list) {
    var live = (list || []).filter(function (c) { return c && c.live !== false; });
    if (!live.length) return;
    var curId = current() && current().id;
    C = live;
    var i = 0;
    for (var j = 0; j < C.length; j++) if (C[j].id === curId) i = j;
    state.idx = i;
    buildCampaignList();
    setCampaign(state.idx, true);
    paintStats();
  }
  function loadCampaigns() {
    if (!R.db) return;
    try {
      R.db.ref("ads/campaigns").on("value", function (snap) {
        var val = snap.val();
        if (!val) return;                       /* کمپین اختصاصی نداریم → داخلی */
        var list = Object.keys(val).map(function (k) { return normalize(k, val[k]); }).filter(Boolean);
        if (list.length) applyList(list);
      }, function () {});
    } catch (e) {}
  }

  function setCampaign(i, autoplay) {
    if (!C.length) return;
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
      cta.setAttribute("href", c.url || ("#" + c.target));
      if (c.url) { cta.setAttribute("target", "_blank"); cta.setAttribute("rel", "noopener"); }
      else { cta.removeAttribute("target"); cta.removeAttribute("rel"); }
    }
    if (v) {
      if (c.poster) v.poster = c.poster; else v.removeAttribute("poster");
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
    if (cta) cta.addEventListener("click", function () { bump("clicks", current().id); });
    v.addEventListener("play", function () {
      var p = q("vaPosterPlay"); if (p) p.classList.remove("on");
      var c = current();
      if (c && !state.seen["d:" + c.id]) { state.seen["d:" + c.id] = 1; bump("impressions", c.id); }
    });
    v.addEventListener("timeupdate", function () {
      var bar = q("vaBar"), tm = q("vaTime");
      var d = v.duration || 8;
      if (bar) bar.style.width = Math.min(100, (v.currentTime / d) * 100) + "%";
      if (tm) tm.textContent = fmt(v.currentTime) + " / " + fmt(d);
    });
    v.addEventListener("ended", function () {
      var c = current();
      if (c) bump("completes", c.id);
      var bar = q("vaBar"); if (bar) bar.style.width = "100%";
      var p = q("vaPosterPlay"); if (p) p.classList.add("on");
      if (C.length > 1) setTimeout(function () { setCampaign(state.idx + 1, true); }, 1200);
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
    if (!box.getAttribute("data-bound")) {
      box.setAttribute("data-bound", "1");
      box.addEventListener("click", function (e) {
        var b = e.target.closest("[data-vacamp]"); if (!b) return;
        setCampaign(parseInt(b.getAttribute("data-vacamp"), 10) || 0, true);
      });
    }
  }

  /* ── تبلیغ شناور پس از اقدام ───────────────────────────── */
  function snoozed() {
    var until = parseInt(read(K_SNOOZE, "0"), 10) || 0;
    return Date.now() < until;
  }
  function openCampaign(c) {
    if (c.url) { window.open(c.url, "_blank", "noopener"); return; }
    if (R.go) R.go(c.target || "market");
  }
  function showFloating() {
    if (state.floating || snoozed() || R.prem || q("sec-videoads") && q("sec-videoads").classList.contains("on")) return;
    if (document.querySelector(".modal.on")) return;
    var last = parseInt(read(K_LAST, "0"), 10) || 0;
    if (Date.now() - last < 150000) return;
    if (!C.length) return;
    write(K_LAST, String(Date.now()));
    state.idx = (state.idx + 1) % C.length;
    var c = current();
    var wrap = document.createElement("div");
    wrap.id = "roninAdFloat";
    wrap.setAttribute("role", "complementary");
    wrap.setAttribute("aria-label", "تبلیغ ویدیویی");
    wrap.innerHTML =
      '<div class="vaFloatVideo"><video muted playsinline preload="metadata"' + (c.poster ? ' poster="' + c.poster + '"' : "") + '></video>' +
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
    if (v) {
      v.src = c.video;
      v.muted = true;
      v.play().then(function () { bump("impressions", c.id); }).catch(function () {});
      v.addEventListener("timeupdate", function () {
        var bar = wrap.querySelector(".vaFloatProg i");
        var d = v.duration || 8;
        if (bar) bar.style.width = Math.min(100, (v.currentTime / d) * 100) + "%";
      });
      v.addEventListener("ended", function () { bump("completes", c.id); });
    }
    var mute = wrap.querySelector(".vaFloatMute");
    if (mute) mute.addEventListener("click", function () {
      if (!v) return;
      v.muted = !v.muted; mute.textContent = v.muted ? "🔇" : "🔊";
    });
    var x = wrap.querySelector(".vaFloatX");
    if (x) x.addEventListener("click", function () {
      write(K_SNOOZE, String(Date.now() + 600000));
      pause(v); wrap.remove(); state.floating = null;
    });
    var cta = wrap.querySelector(".vaFloatCta");
    if (cta) cta.addEventListener("click", function () {
      bump("clicks", c.id); pause(v); wrap.remove(); state.floating = null;
      openCampaign(c);
    });
    var why = wrap.querySelector(".vaFloatLink");
    if (why) why.addEventListener("click", function () {
      if (R.toast) R.toast("این تبلیغ خانگی رونین است؛ با پرمیوم می‌توانی تبلیغات را محدود کنی.", "ok");
    });
  }

  /* ── پنل مالک: مدیریت کمپین‌ها ─────────────────────────── */
  function ownerPanelHTML() {
    return '<div class="vaPanel" id="vaOwnerPanel" style="margin-top:12px">' +
      '<div class="vaPanelHead"><b>🛠 مدیریت کمپین‌ها</b><span data-vacount>کمپین</span></div>' +
      '<div class="col" style="gap:6px">' +
        '<input class="inp" id="vacTitle" placeholder="عنوان کمپین (مثلاً ELITE DROP)" maxlength="40">' +
        '<input class="inp" id="vacCopy" placeholder="متن کوتاه تبلیغ" maxlength="120">' +
        '<input class="inp" id="vacCta" placeholder="متن دکمه (مثلاً مشاهده)" maxlength="24">' +
        '<input class="inp" id="vacVideo" dir="ltr" placeholder="https://.../ad.mp4">' +
        '<input class="inp" id="vacPoster" dir="ltr" placeholder="https://.../ad.jpg (اختیاری)">' +
        '<input class="inp" id="vacUrl" dir="ltr" placeholder="لینک مقصد بیرونی (اختیاری)">' +
        '<input class="inp" id="vacTarget" placeholder="صفحهٔ داخلی: market / ads / community" value="market">' +
        '<div class="row" style="gap:6px">' +
          '<button class="btn p mini" type="button" id="vacSave">افزودن کمپین</button>' +
          '<button class="btn d mini" type="button" id="vacReset">پاک کردن فرم</button>' +
        '</div>' +
        '<div class="xs mut">کمپین‌ها در Firebase ذخیره می‌شوند و در خانه و صفحهٔ فیلم پخش می‌شوند.</div>' +
        '<div id="vacList" class="col" style="gap:5px;margin-top:6px"></div>' +
      '</div></div>';
  }
  function paintOwnerList() {
    var box = q("vacList"); if (!box) return;
    if (!R.db) { box.innerHTML = '<div class="xs mut">دیتابیس در دسترس نیست</div>'; return; }
    R.db.ref("ads/campaigns").once("value").then(function (snap) {
      var val = snap.val() || {};
      var keys = Object.keys(val);
      if (!keys.length) { box.innerHTML = '<div class="xs mut">هنوز کمپین اختصاصی نساخته‌ای — کمپین‌های پیش‌فرض پخش می‌شوند.</div>'; return; }
      box.innerHTML = keys.map(function (k) {
        var c = normalize(k, val[k]) || {};
        return '<div class="row" style="gap:6px;align-items:center">' +
          '<span class="grow ellip xs">' + (c.title || k) + '</span>' +
          '<button class="btn d mini" type="button" data-vacdel="' + k + '">حذف</button></div>';
      }).join("");
    }).catch(function () {});
  }
  function buildOwnerPanel() {
    if (state.ownerBuilt) return;
    if (!R.isOwner || !R.isOwner()) return;
    var sec = q("sec-videoads"); if (!sec) return;
    state.ownerBuilt = true;
    var wrap = document.createElement("div");
    wrap.innerHTML = ownerPanelHTML();
    sec.appendChild(wrap.firstChild);
    var save = q("vacSave");
    if (save) save.addEventListener("click", function () {
      var title = (q("vacTitle") && q("vacTitle").value || "").trim();
      var video = (q("vacVideo") && q("vacVideo").value || "").trim();
      if (title.length < 2) return R.toast("عنوان کمپین را بنویس", "err");
      if (!/^https?:\/\//i.test(video)) return R.toast("لینک ویدیو باید با http شروع شود", "err");
      var obj = {
        title: title,
        brand: "RONIN ADS",
        copy: (q("vacCopy") && q("vacCopy").value || "").trim(),
        cta: (q("vacCta") && q("vacCta").value || "").trim() || "بیشتر بدانید",
        video: video,
        poster: (q("vacPoster") && q("vacPoster").value || "").trim(),
        url: (q("vacUrl") && q("vacUrl").value || "").trim(),
        target: (q("vacTarget") && q("vacTarget").value || "market").trim(),
        live: true,
        t: Date.now()
      };
      R.db.ref("ads/campaigns").push(obj).then(function () {
        R.toast("کمپین ساخته شد ✅", "ok");
        paintOwnerList();
      }).catch(function (e) { R.toast("ذخیره نشد: " + e.message, "err"); });
    });
    var reset = q("vacReset");
    if (reset) reset.addEventListener("click", function () {
      ["vacTitle", "vacCopy", "vacCta", "vacVideo", "vacPoster", "vacUrl"].forEach(function (id) {
        var e = q(id); if (e) e.value = "";
      });
    });
    document.addEventListener("click", function (e) {
      var b = e.target.closest ? e.target.closest("[data-vacdel]") : null;
      if (!b || !R.isOwner || !R.isOwner()) return;
      R.db.ref("ads/campaigns/" + b.getAttribute("data-vacdel")).remove().then(function () {
        R.toast("کمپین حذف شد", "ok"); paintOwnerList();
      }).catch(function () {});
    });
    paintOwnerList();
  }

  function mount() {
    if (state.mounted) return;
    state.mounted = true;
    bindDedicated();
    buildCampaignList();
    setCampaign(0, false);
    paintStats();
    loadCampaigns();
    buildOwnerPanel();
    R.hooks.videoads = function () {
      if (state.userPaused) return;
      setTimeout(function () { if (!state.userPaused) play(q("vaVideo")); }, 260);
      buildOwnerPanel();
      paintOwnerList();
    };
    if ("IntersectionObserver" in window) {
      try {
        var st = q("vaStage");
        if (st) new IntersectionObserver(function (entries) {
          entries.forEach(function (en) {
            if (en.isIntersecting && !state.userPaused) play(q("vaVideo"));
            else if (!en.isIntersecting) pause(q("vaVideo"));
          });
        }, { threshold: .35 }).observe(st);
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
    campaigns: function () { return C.slice(); },
    stats: stats,
    track: bump,
    show: showFloating,
    reload: loadCampaigns,
    open: function (i) {
      if (typeof i === "number") setCampaign(i, false);
      R.go("videoads");
      setTimeout(function () { setCampaign(state.idx, true); }, 220);
    }
  };
  /* برای صفحه‌های دیگر (فیلم) که می‌خواهند همان کمپین‌ها را پخش کنند */
  R.ads = {
    list: function () { return C.slice(); },
    track: bump,
    open: function (i) { R.videoAds.open(i); }
  };
  R.bootVideoAds = mount;
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { setTimeout(mount, 900); });
  else setTimeout(mount, 900);
  window.R = R;
})();
