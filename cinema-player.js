/* ═══════════════════════════════════════════════════════════════
   RONIN PLAYER — cinema-player.js  ·  v1
   ───────────────────────────────────────────────────────────────
   پلیر ویدیوی مستقل و حرفه‌ای:
   • MP4 / HLS (بومی یا hls.js) / امبد یوتیوب، آپارات، ویمئو
   • نوار زمان با بافر، تولتیپ زمان و درگ دقیق
   • ژست‌ها: دوبار-لمس پرش، نگه‌داشتن ۲×، کشیدن بالا/پایین صدا/روشنایی
   • سرعت، کیفیت، زیرنویس با استایل، نسبت تصویر، تکرار، پخش خودکار
   • آمار پخش، عکس از فریم، تایمر خواب، مینی‌پلیر، PiP، تمام‌صفحه
   • ادامهٔ تماشا، میان‌برهای صفحه‌کلید، Wake Lock و Media Session
   ───────────────────────────────────────────────────────────────
   API:  RoninPlayer.open({ id, title, subtitle, poster, sources:[{label,src,subs}],
                            subs, index, badges, onNext, onClose, onInfo })
         RoninPlayer.close();  RoninPlayer.isOpen();
   ═══════════════════════════════════════════════════════════════ */
"use strict";
(function () {
  if (window.RoninPlayer) return;

  var K = { pos: "rn_pl_pos", vol: "rn_pl_vol", set: "rn_pl_set" };

  var P = {
    open: false, o: null, idx: 0, v: null, hls: null, emb: false,
    subs: [], subIdx: -1, idleT: null, menuName: "", mini: false,
    longT: null, longOn: false, prevRate: 1, tapT: null, lastTap: 0,
    scrubbing: false, sleepT: null, statsT: null, countT: null,
    wake: null, dim: 0, pendingAt: 0, ended: false, built: false
  };
  var SET = { aspect: "contain", loop: false, autoNext: true, cueSize: 100, cueBg: "1", sleepMin: 0 };

  /* ── ابزارها ──────────────────────────────────────────────── */
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function fa(s) { return String(s).replace(/[0-9]/g, function (d) { return "۰۱۲۳۴۵۶۷۸۹"[d]; }); }
  function num(n, d) { var v = parseFloat(n); return isFinite(v) ? v : (d || 0); }
  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
  function fmt(t) {
    t = Math.max(0, Math.floor(num(t)));
    var h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = t % 60;
    var p = function (n) { return (n < 10 ? "0" : "") + n; };
    return fa(h ? h + ":" + p(m) + ":" + p(s) : m + ":" + p(s));
  }
  function ls(k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
  function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function hostOf(u) { try { return new URL(u, location.href).host; } catch (e) { return ""; } }
  function embedURL(url) {
    if (!url) return null;
    var yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{6,})/);
    if (yt) return "https://www.youtube.com/embed/" + yt[1] + "?rel=0&modestbranding=1&playsinline=1";
    var ap = url.match(/aparat\.com\/v\/([\w-]+)/);
    if (ap) return "https://www.aparat.com/video/video/embed/videohash/" + ap[1] + "/vt/frame";
    var vm = url.match(/vimeo\.com\/(\d+)/);
    if (vm) return "https://player.vimeo.com/video/" + vm[1];
    if (/player\.|\/embed\/|<iframe/i.test(url)) return url;
    return null;
  }
  function loadHls(cb) {
    if (window.Hls) return cb(window.Hls);
    var s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.15/dist/hls.min.js";
    s.onload = function () { cb(window.Hls); };
    s.onerror = function () { cb(null); };
    document.head.appendChild(s);
  }
  function posMap() { return ls(K.pos, {}) || {}; }
  function posGet(id, i) { return num(posMap()[id + "|" + i]); }
  function posSet(id, i, t) {
    if (!id || !(t > 8)) return;
    var m = posMap(); m[id + "|" + i] = Math.floor(t); lsSet(K.pos, m);
  }
  function posClear(id, i) { var m = posMap(); delete m[id + "|" + i]; lsSet(K.pos, m); }

  function loadSet() {
    var s = ls(K.set, null);
    if (s && typeof s === "object") {
      ["aspect", "loop", "autoNext", "cueSize", "cueBg", "sleepMin"].forEach(function (k) {
        if (s[k] != null) SET[k] = s[k];
      });
    }
    SET.aspect = SET.aspect === "cover" ? "cover" : "contain";
    SET.cueSize = [85, 100, 125, 150].indexOf(num(SET.cueSize)) >= 0 ? num(SET.cueSize) : 100;
    SET.cueBg = ["0", "1", "2"].indexOf(String(SET.cueBg)) >= 0 ? String(SET.cueBg) : "1";
  }
  function saveSet() { lsSet(K.set, SET); }

  /* ── ساخت DOM ─────────────────────────────────────────────── */
  var R = {}, d = {};

  function build() {
    if (P.built) return;
    loadSet();
    R.root = document.createElement("div");
    R.root.className = "rpl";
    R.root.id = "rpl";
    R.root.setAttribute("role", "dialog");
    R.root.setAttribute("aria-modal", "true");
    R.root.setAttribute("aria-label", "پلیر ویدیو");
    R.root.innerHTML =
      '<div class="rpl-amb" id="rplAmb"></div>' +
      '<div class="rpl-shell">' +
        '<div class="rpl-top">' +
          '<button class="rpl-back" type="button" data-a="close" title="بستن (Esc)">→</button>' +
          '<div class="rpl-ttl"><b id="rplTitle">—</b><span id="rplSub"></span></div>' +
          '<div class="rpl-badges" id="rplBadges"></div>' +
          '<span class="sp"></span>' +
          '<button class="rpl-ib" type="button" data-a="info" title="جزئیات">ℹ️</button>' +
          '<button class="rpl-ib" type="button" data-a="mini" title="مینی‌پلیر">▭</button>' +
          '<button class="rpl-ib" type="button" data-a="settings" title="تنظیمات">⚙️</button>' +
        '</div>' +
        '<div class="rpl-stage" id="rplStage">' +
          '<div class="rpl-frame" id="rplFrame">' +
            '<video id="rplV" playsinline preload="metadata"></video>' +
            '<div class="rpl-dim" id="rplDim"></div>' +
            '<div class="rpl-flash"></div>' +
            '<div class="rpl-glow"></div>' +
            '<button class="rpl-big" type="button" data-a="toggle" title="پخش / توقف">▶</button>' +
            '<div class="rpl-spin" id="rplSpin"><i></i><b id="rplPct"></b></div>' +
            '<div class="rpl-hud" id="rplHud"></div>' +
            '<div class="rpl-end" id="rplEnd">' +
              '<div class="rpl-card">' +
                '<div class="ic">🏁</div><h4 id="rplEndT">پخش تمام شد</h4>' +
                '<p id="rplEndP">می‌توانی دوباره ببینی یا به منبع بعدی بروی.</p>' +
                '<div class="row">' +
                  '<button class="rpl-btn" type="button" data-a="replay" style="border-color:rgba(255,255,255,.2)">↺ پخش دوباره</button>' +
                  '<button class="rpl-btn" type="button" data-a="next" style="border-color:rgba(255,255,255,.2)">پخش بعدی ›</button>' +
                '</div>' +
                '<div class="rpl-count" id="rplCount" hidden>پخش بعدی تا <b>۸</b> ثانیه <button class="rpl-mi" type="button" data-a="cancelnext" style="display:inline-flex;padding:0 4px;width:auto">لغو</button></div>' +
              '</div>' +
            '</div>' +
            '<div class="rpl-err" id="rplErr">' +
              '<div class="rpl-card"><div class="ic">⚠️</div><h4>پخش ممکن نشد</h4>' +
                '<p id="rplErrT">لینک منبع در دسترس نیست یا دامنه اجازهٔ پخش نمی‌دهد.</p>' +
                '<div class="row"><button class="rpl-btn" type="button" data-a="retry" style="border-color:rgba(255,255,255,.2)">تلاش دوباره</button>' +
                  '<button class="rpl-btn" type="button" data-a="next" style="border-color:rgba(255,255,255,.2)">منبع بعدی</button></div>' +
              '</div>' +
            '</div>' +
            '<div class="rpl-ctl" id="rplCtl">' +
              '<div class="rpl-track" id="rplTrack" role="slider" tabindex="0" aria-label="زمان پخش" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">' +
                '<div class="rpl-rail" id="rplRail">' +
                  '<div class="rpl-buf" id="rplBuf"></div>' +
                  '<div class="rpl-played" id="rplPlayed"></div>' +
                  '<div class="rpl-thumb" id="rplThumb"></div>' +
                  '<div id="rplChaps"></div>' +
                '</div>' +
                '<div class="rpl-bub" id="rplBub">۰:۰۰</div>' +
              '</div>' +
              '<div class="rpl-row">' +
                '<button class="rpl-btn ic" type="button" data-a="toggle" id="rplPlay" title="پخش / توقف (Space)">▶</button>' +
                '<button class="rpl-btn ic" type="button" data-a="back" title="۱۰ ثانیه عقب">↺۱۰</button>' +
                '<button class="rpl-btn ic" type="button" data-a="fwd" title="۱۰ ثانیه جلو">۱۰↻</button>' +
                '<div class="rpl-vol" id="rplVolBox">' +
                  '<button class="rpl-btn ic" type="button" data-a="mute" id="rplMute" title="بی‌صدا (M)">🔊</button>' +
                  '<input id="rplVol" type="range" min="0" max="100" value="100" aria-label="صدا">' +
                '</div>' +
                '<span class="rpl-time" id="rplTime" title="جابه‌جایی زمان گذشته/باقی‌مانده">۰:۰۰ <i>/</i> ۰:۰۰</span>' +
                '<span class="grow"></span>' +
                '<button class="rpl-btn" type="button" data-a="rate" id="rplRate" title="سرعت پخش">۱×</button>' +
                '<button class="rpl-btn top-hide" type="button" data-a="quality" title="کیفیت / منبع">کیفیت</button>' +
                '<button class="rpl-btn top-hide" type="button" data-a="subs" title="زیرنویس (C)">زیرنویس</button>' +
                '<button class="rpl-btn ic top-hide" type="button" data-a="pip" title="تصویر در تصویر">⧉</button>' +
                '<button class="rpl-btn ic top-hide" type="button" data-a="theater" title="حالت سینما (T)">▭</button>' +
                '<button class="rpl-btn ic" type="button" data-a="fs" title="تمام‌صفحه (F)">⛶</button>' +
              '</div>' +
            '</div>' +
            '<div class="rpl-menu" id="rplMenu"></div>' +
            '<div class="rpl-toast" id="rplToast"></div>' +
            '<div class="rpl-stats" id="rplStats"></div>' +
            '<div class="rpl-keys" id="rplKeys"></div>' +
            '<div class="rpl-mini-bar">' +
              '<span class="mt" id="rplMiniT">—</span><span class="sp"></span>' +
              '<button type="button" data-a="restore" title="بازگشت">▣</button>' +
              '<button type="button" data-a="close" title="بستن">✕</button>' +
            '</div>' +
            '<div class="rpl-mini-prog"><i id="rplMiniP"></i></div>' +
          '</div>' +
        '</div>' +
        '<div class="rpl-set" id="rplSet"></div>' +
      '</div>';

    document.body.appendChild(R.root);

    d = {
      root: R.root,
      amb: $("#rplAmb", R.root), shell: $(".rpl-shell", R.root), stage: $("#rplStage", R.root),
      frame: $("#rplFrame", R.root), v: $("#rplV", R.root), dim: $("#rplDim", R.root),
      big: $(".rpl-big", R.root), spin: $("#rplSpin", R.root), pct: $("#rplPct", R.root),
      hud: $("#rplHud", R.root), end: $("#rplEnd", R.root), endT: $("#rplEndT", R.root),
      endP: $("#rplEndP", R.root), count: $("#rplCount", R.root), err: $("#rplErr", R.root),
      errT: $("#rplErrT", R.root), ctl: $("#rplCtl", R.root), track: $("#rplTrack", R.root),
      rail: $("#rplRail", R.root), buf: $("#rplBuf", R.root), played: $("#rplPlayed", R.root),
      thumb: $("#rplThumb", R.root), bub: $("#rplBub", R.root), chaps: $("#rplChaps", R.root),
      play: $("#rplPlay", R.root), mute: $("#rplMute", R.root), vol: $("#rplVol", R.root),
      volBox: $("#rplVolBox", R.root), time: $("#rplTime", R.root), rate: $("#rplRate", R.root),
      menu: $("#rplMenu", R.root), set: $("#rplSet", R.root), keys: $("#rplKeys", R.root),
      stats: $("#rplStats", R.root), toast: $("#rplToast", R.root), title: $("#rplTitle", R.root),
      sub: $("#rplSub", R.root), badges: $("#rplBadges", R.root),
      miniT: $("#rplMiniT", R.root), miniP: $("#rplMiniP", R.root)
    };
    d.v.loop = !!SET.loop;
    R.root.classList.toggle("cover", SET.aspect === "cover");
    injectCue();
    bind();
    P.built = true;
  }

  function injectCue() {
    var st = $("#rplCueStyle");
    if (!st) { st = document.createElement("style"); st.id = "rplCueStyle"; document.head.appendChild(st); }
    var size = SET.cueSize, bg = SET.cueBg === "0" ? "transparent" : (SET.cueBg === "2" ? "rgba(0,0,0,.92)" : "rgba(0,0,0,.6)");
    st.textContent = "#rplV::cue{font-family:Vazirmatn,sans-serif;font-size:" + size + "%;color:#fff;background:" + bg + ";line-height:1.6}";
  }

  /* ── نمایش / شروع ─────────────────────────────────────────── */
  function open(o) {
    if (!o || !o.sources || !o.sources.length) return;
    build();
    resetPlayer();
    P.o = o;
    P.idx = clamp(num(o.index), 0, o.sources.length - 1);
    P.ended = false;
    P.mini = false;
    R.root.classList.remove("mini");
    R.root.classList.add("on");
    R.root.classList.remove("set-open", "idle", "theater", "playing");
    document.body.classList.add("lock");
    document.documentElement.style.overflow = "hidden";

    d.title.textContent = o.title || "بدون عنوان";
    d.amb.style.backgroundImage = o.poster ? 'url("' + o.poster + '")' : "none";
    R.root.classList.toggle("noamb", !o.poster);
    d.badges.innerHTML = (o.badges || []).map(function (b, i) {
      var hd = /4K|1080|HD|FHD/i.test(String(b));
      return '<span class="' + (hd || i === 0 ? "hd" : "") + '">' + esc(b) + "</span>";
    }).join("");
    d.miniT.textContent = o.title || "پخش";
    P.open = true;
    setSource(P.idx, posGet(o.id, P.idx));
    wakeUI();
    mediaSession();
  }

  function resetPlayer() {
    clearInterval(P.countT); clearInterval(P.statsT); clearTimeout(P.sleepT);
    P.sleepT = null; d.stats.classList.remove("on"); d.end.classList.remove("on");
    d.err.classList.remove("on"); closeMenu(); closeSet(); d.keys.classList.remove("on");
    destroyHls();
    var f = $("iframe", d.frame); if (f) f.remove();
    d.v.style.display = "";
    if (d.v) { try { d.v.pause(); } catch (e) {} }
    d.ctl.style.display = "";
    wakeOff();
  }

  function setSource(idx, at) {
    P.idx = clamp(num(idx), 0, (P.o.sources || []).length - 1);
    var src = P.o.sources[P.idx] || {};
    P.subs = (src.subs && src.subs.length) ? src.subs : (P.o.subs || []);
    P.subIdx = P.subs.length ? num(ls("rn_pl_sub", -1), -1) : -1;
    P.emb = !!embedURL(src.src);
    P.pendingAt = at || 0;
    d.end.classList.remove("on"); d.err.classList.remove("on");
    d.sub.textContent = [P.o.subtitle, src.label].filter(Boolean).join(" · ");
    d.play.textContent = "▶";
    d.big.hidden = false;
    R.root.classList.remove("playing");
    d.ctl.style.display = P.emb ? "none" : "";
    R.root.classList.toggle("mini", P.mini);

    if (P.emb) {
      destroyHls();
      d.v.pause(); d.v.style.display = "none"; d.v.removeAttribute("src");
      var old = $("iframe", d.frame); if (old) old.remove();
      var f = document.createElement("iframe");
      f.src = embedURL(src.src);
      f.allow = "accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture;fullscreen";
      f.allowFullscreen = true;
      f.referrerPolicy = "no-referrer";
      d.frame.insertBefore(f, d.frame.firstChild);
      toast("منبع امبد — کنترل‌ها در خود پلیر میزبان است", "ok");
      return;
    }
    var oldf = $("iframe", d.frame); if (oldf) oldf.remove();
    d.v.style.display = "";
    attach(d.v, src.src);
    d.v.muted = false;
    d.v.volume = clamp(num(ls(K.vol, 1), 1), 0, 1);
    syncVol();
    loadTracks();
    applySub();
    d.v.play().catch(function () {});
  }

  function attach(v, href) {
    destroyHls();
    href = String(href || "");
    if (!href) return;
    var isHls = /\.m3u8(\?|#|$)/i.test(href);
    if (!isHls) { v.src = href; return; }
    if (v.canPlayType("application/vnd.apple.mpegurl")) { v.src = href; return; }
    spin(true);
    loadHls(function (Hls) {
      if (!Hls || !Hls.isSupported()) { v.src = href; return; }
      P.hls = new Hls({ maxBufferLength: 40, capLevelToPlayerSize: true });
      P.hls.loadSource(href);
      P.hls.attachMedia(v);
      P.hls.on(Hls.Events.ERROR, function (e, data) {
        if (data && data.fatal) showErr("استریم HLS قطع شد یا منقضی شده است.");
      });
    });
  }
  function destroyHls() { if (P.hls) { try { P.hls.destroy(); } catch (e) {} P.hls = null; } }

  /* ── کنترل‌ها ─────────────────────────────────────────────── */
  function toggle() {
    if (P.emb || !d.v) return;
    if (d.v.paused) d.v.play().catch(function () {}); else d.v.pause();
  }
  function skip(s, x, y) {
    if (P.emb || !d.v || !isFinite(d.v.duration)) return;
    d.v.currentTime = clamp(d.v.currentTime + s, 0, d.v.duration);
    if (x != null) ripple(x, y, s);
    hud(s < 0 ? "⏪" : "⏩", (s < 0 ? "−" : "+") + fa(Math.abs(s)) + " ثانیه");
  }
  function ripple(x, y, s) {
    var r = d.frame.getBoundingClientRect();
    var sp = document.createElement("span");
    sp.className = "rpl-ripple";
    sp.style.left = (x - r.left) + "px";
    sp.style.top = (y - r.top) + "px";
    sp.innerHTML = (s < 0 ? "«" : "»") + "<br>" + fa(Math.abs(s));
    d.frame.appendChild(sp);
    setTimeout(function () { sp.remove(); }, 600);
  }
  function toggleMute() {
    d.v.muted = !d.v.muted;
    syncVol();
    hud(d.v.muted ? "🔇" : "🔊", d.v.muted ? "بی‌صدا" : "صدا روشن");
  }
  function syncVol() {
    var v = d.v, pct = Math.round((v.muted ? 0 : v.volume) * 100);
    d.vol.value = String(pct);
    d.vol.style.setProperty("--v", pct + "%");
    d.mute.textContent = (v.muted || v.volume === 0) ? "🔇" : (pct < 55 ? "🔉" : "🔊");
  }
  function setRate(r) {
    if (!d.v) return;
    r = clamp(num(r, 1), 0.25, 3);
    d.v.playbackRate = r;
    d.rate.textContent = (r === 1 ? "۱" : fa(r)) + "×";
    closeMenu();
    if (R.root.classList.contains("set-open")) renderSet();
    toast("سرعت پخش: " + fa(r) + "×", "ok");
  }
  function setSub(i) {
    P.subIdx = num(i, -1);
    lsSet("rn_pl_sub", P.subIdx);
    applySub();
    closeMenu();
    toast(P.subIdx < 0 ? "زیرنویس خاموش شد" : "زیرنویس روشن شد", "ok");
  }
  function applySub() {
    if (!d.v || !d.v.textTracks) return;
    var tr = d.v.textTracks;
    for (var i = 0; i < tr.length; i++) tr[i].mode = (i === P.subIdx ? "showing" : "disabled");
  }
  function loadTracks() {
    if (!d.v) return;
    $$("track", d.v).forEach(function (t) { t.remove(); });
    (P.subs || []).forEach(function (s, i) {
      if (!s || !s.src) return;
      var t = document.createElement("track");
      t.kind = "subtitles";
      t.label = s.label || ("زیرنویس " + (i + 1));
      t.srclang = s.lang || "fa";
      t.src = s.src;
      if (i === P.subIdx) t.default = true;
      d.v.appendChild(t);
    });
    setTimeout(applySub, 100);
  }
  function pip() {
    if (!d.v || P.emb) return toast("برای این منبع ممکن نیست", "err");
    if (!document.pictureInPictureEnabled || !d.v.requestPictureInPicture) return toast("مرورگر PiP را پشتیبانی نمی‌کند", "err");
    if (document.pictureInPictureElement) document.exitPictureInPicture().catch(function () {});
    else d.v.requestPictureInPicture().catch(function () { toast("PiP ممکن نشد", "err"); });
  }
  function theater() {
    R.root.classList.toggle("theater");
    toast(R.root.classList.contains("theater") ? "حالت سینما روشن" : "حالت سینما خاموش", "ok");
  }
  function fs() {
    var el = d.frame, doc = document;
    if (!doc.fullscreenElement && !doc.webkitFullscreenElement) {
      var req = el.requestFullscreen || el.webkitRequestFullscreen;
      if (!req) return;
      try { var p = req.call(el); if (p && p.catch) p.catch(function () {}); } catch (e) {}
    } else {
      var ex = doc.exitFullscreen || doc.webkitExitFullscreen;
      if (!ex) return;
      try { var q = ex.call(doc); if (q && q.catch) q.catch(function () {}); } catch (e) {}
    }
  }
  function toggleMini() {
    P.mini = !P.mini;
    R.root.classList.toggle("mini", P.mini);
    document.body.classList.toggle("lock", !P.mini);
    document.documentElement.style.overflow = P.mini ? "" : "hidden";
    if (P.mini) toast("مینی‌پلیر — برای برگشت ▣ را بزن", "ok");
  }
  function next() {
    var list = (P.o && P.o.sources) || [];
    if (list.length > 1) {
      setSource((P.idx + 1) % list.length, 0);
      toast("منبع بعدی: " + (list[(P.idx + 1) % list.length].label || ""), "ok");
      return;
    }
    if (P.o.onNext) { P.o.onNext(P.idx); return; }
    toast("منبع بعدی وجود ندارد", "err");
  }
  function restart() {
    if (!d.v) return;
    clearInterval(P.countT);
    P.ended = false;
    d.count.hidden = true;
    d.v.currentTime = 0;
    posClear(P.o.id, P.idx);
    d.end.classList.remove("on");
    d.v.play().catch(function () {});
    toast("از ابتدا پخش می‌شود", "ok");
  }

  /* ── منوها و پنل‌ها ───────────────────────────────────────── */
  function mi(label, on, attrs, icon) {
    return '<button class="rpl-mi' + (on ? " on" : "") + '" type="button" ' + attrs + ">" +
      "<span>" + (icon ? icon + " " : "") + esc(label) + "</span>" +
      (on ? '<span class="ck">✓</span>' : "") + "</button>";
  }
  function openMenu(name) {
    if (P.menuName === name && d.menu.classList.contains("on")) return closeMenu();
    P.menuName = name;
    closeSet();
    var h = "";
    if (name === "rate") {
      h = "<b>سرعت پخش</b>" + [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3].map(function (r) {
        return mi((r === 1 ? "عادی (۱×)" : fa(r) + "×"), Math.abs(d.v.playbackRate - r) < 0.01,
          'data-a="setrate" data-v="' + r + '"');
      }).join("");
    } else if (name === "quality") {
      h = "<b>کیفیت / منبع</b>" + (P.o.sources || []).map(function (s, i) {
        return mi(s.label || ("منبع " + (i + 1)), i === P.idx, 'data-a="setsrc" data-v="' + i + '"',
          /1080|4k|fhd/i.test(s.label || "") ? "💎" : (i === 0 ? "⚡" : "🎞"));
      }).join("") + '<div class="rpl-mi" style="opacity:.6;cursor:default;font-size:9.5px">سرعت اینترنت را خودت انتخاب کن</div>';
    } else if (name === "subs") {
      h = "<b>زیرنویس</b>" + mi("خاموش", P.subIdx < 0, 'data-a="setsub" data-v="-1"', "🚫") +
        (P.subs || []).map(function (s, i) {
          return mi(s.label || ("زیرنویس " + (i + 1)), i === P.subIdx, 'data-a="setsub" data-v="' + i + '"', "💬");
        }).join("") +
        (P.subs && P.subs.length ? "" : '<div class="rpl-mi" style="opacity:.6;cursor:default;font-size:9.5px">برای این عنوان زیرنویس ثبت نشده</div>');
    }
    d.menu.innerHTML = h;
    d.menu.classList.add("on");
  }
  function closeMenu() { d.menu.classList.remove("on"); P.menuName = ""; }

  function toggleSet() {
    if (R.root.classList.contains("set-open")) return closeSet();
    closeMenu();
    renderSet();
    R.root.classList.add("set-open");
  }
  function closeSet() { R.root.classList.remove("set-open"); }
  function renderSet() {
    var src = (P.o.sources || [])[P.idx] || {};
    var rates = [0.5, 0.75, 1, 1.25, 1.5, 2];
    var h = '<div class="rpl-set-h"><b>⚙️ تنظیمات پخش</b><button class="rpl-ib" type="button" data-a="settings">✕</button></div>';
    h += '<div class="rpl-sec"><h5>کیفیت و صدا</h5>' +
      '<div class="rpl-setrow"><span>منبع فعلی</span><span>' + esc(src.label || "—") + "</span></div>" +
      '<div class="rpl-setrow"><span>سرعت</span><span>' + fa(d.v ? d.v.playbackRate : 1) + "×</span></div>" +
      '<div class="rpl-pills">' + rates.map(function (r) {
        return '<button class="rpl-pill' + (Math.abs((d.v ? d.v.playbackRate : 1) - r) < 0.01 ? " on" : "") +
          '" type="button" data-a="setrate" data-v="' + r + '">' + (r === 1 ? "عادی" : fa(r) + "×") + "</button>";
      }).join("") + "</div></div>";
    h += '<div class="rpl-sec"><h5>تصویر</h5>' +
      '<div class="rpl-pills">' +
        '<button class="rpl-pill' + (SET.aspect === "contain" ? " on" : "") + '" type="button" data-a="aspect" data-v="contain">اندازهٔ اصلی</button>' +
        '<button class="rpl-pill' + (SET.aspect === "cover" ? " on" : "") + '" type="button" data-a="aspect" data-v="cover">پرکردن کادر</button>' +
      "</div>" +
      '<label class="rpl-tog">حالت سینما<input type="checkbox" data-tog="theater"' + (R.root.classList.contains("theater") ? " checked" : "") + "></label>" +
      "</div>";
    h += '<div class="rpl-sec"><h5>زیرنویس</h5><div class="rpl-pills">' +
      [[85, "کوچک"], [100, "معمولی"], [125, "بزرگ"], [150, "خیلی بزرگ"]].map(function (x) {
        return '<button class="rpl-pill' + (num(SET.cueSize) === x[0] ? " on" : "") + '" type="button" data-a="cuesize" data-v="' + x[0] + '">' + x[1] + "</button>";
      }).join("") + "</div><div class=\"rpl-pills\" style=\"margin-top:6px\">" +
      [["0", "بدون پس‌زمینه"], ["1", "نیمه‌شفاف"], ["2", "پررنگ"]].map(function (x) {
        return '<button class="rpl-pill' + (String(SET.cueBg) === x[0] ? " on" : "") + '" type="button" data-a="cuebg" data-v="' + x[0] + '">' + x[1] + "</button>";
      }).join("") + "</div></div>";
    h += '<div class="rpl-sec"><h5>پخش</h5>' +
      '<label class="rpl-tog">تکرار خودکار<input type="checkbox" data-tog="loop"' + (SET.loop ? " checked" : "") + "></label>" +
      '<label class="rpl-tog">پخش خودکار منبع بعدی<input type="checkbox" data-tog="auto"' + (SET.autoNext ? " checked" : "") + "></label>" +
      '<div class="rpl-setrow"><span>تایمر خواب</span><span>' + (SET.sleepMin ? fa(SET.sleepMin) + " دقیقه" : "خاموش") + "</span></div>" +
      '<div class="rpl-pills">' + [0, 15, 30, 60, 90].map(function (m) {
        return '<button class="rpl-pill' + (num(SET.sleepMin) === m ? " on" : "") + '" type="button" data-a="sleep" data-v="' + m + '">' + (m ? fa(m) : "خاموش") + "</button>";
      }).join("") + "</div></div>";
    h += '<div class="rpl-sec"><h5>ابزارها</h5>' +
      '<button class="rpl-setrow" type="button" data-a="snap"><span>📸 گرفتن عکس از فریم</span><span>PNG</span></button>' +
      '<button class="rpl-setrow" type="button" data-a="stats"><span>📊 آمار پخش</span><span>' + (d.stats.classList.contains("on") ? "روشن" : "خاموش") + "</span></button>" +
      '<button class="rpl-setrow" type="button" data-a="keys"><span>⌨️ میان‌برهای صفحه‌کلید</span><span>؟</span></button>' +
      '<button class="rpl-setrow" type="button" data-a="restart"><span>↺ پخش از ابتدا</span><span></span></button>' +
      '<button class="rpl-setrow" type="button" data-a="pip"><span>⧉ تصویر در تصویر</span><span></span></button>' +
      "</div>";
    d.set.innerHTML = h;
  }

  function toggleKeys() {
    var on = d.keys.classList.toggle("on");
    if (on) {
      d.keys.innerHTML =
        '<div class="box"><h4>⌨️ میان‌برهای پلیر</h4><div class="rpl-kgrid">' +
        [["Space", "پخش / توقف"], ["← →", "۱۰ ثانیه عقب/جلو"], ["↑ ↓", "صدا"],
         ["M", "بی‌صدا"], ["F", "تمام‌صفحه"], ["T", "حالت سینما"], ["P", "تصویر در تصویر"],
         ["C", "زیرنویس"], ["S", "عکس از فریم"], ["0-9", "پرش به درصد"], [", .", "فریم به فریم"],
         ["Esc", "بستن پلیر"]].map(function (k) {
          return '<div class="rpl-krow"><kbd>' + k[0] + "</kbd><span>" + k[1] + "</span></div>";
        }).join("") + "</div>" +
        '<div style="text-align:center;margin-top:12px"><button class="rpl-btn" type="button" data-a="keys" style="border-color:rgba(255,255,255,.2)">بستن</button></div></div>';
    }
  }

  function toggleStats() {
    var on = d.stats.classList.toggle("on");
    clearInterval(P.statsT);
    if (on) {
      renderStats();
      P.statsT = setInterval(renderStats, 600);
    }
    if (R.root.classList.contains("set-open")) renderSet();
  }
  function renderStats() {
    if (!d.stats.classList.contains("on")) return;
    var v = d.v;
    var q = v.getVideoPlaybackQuality ? v.getVideoPlaybackQuality() : {};
    var buf = 0;
    try {
      for (var i = 0; i < v.buffered.length; i++) {
        if (v.currentTime >= v.buffered.start(i) && v.currentTime <= v.buffered.end(i)) {
          buf = v.buffered.end(i) - v.currentTime; break;
        }
      }
    } catch (e) {}
    var rows = [
      ["منبع", (P.o.sources[P.idx] || {}).label || "—"],
      ["میزبان", hostOf((P.o.sources[P.idx] || {}).src) || "—"],
      ["نوع", P.emb ? "Embed" : (/\.m3u8/i.test((P.o.sources[P.idx] || {}).src || "") ? "HLS" : "MP4")],
      ["وضوح", v.videoWidth ? v.videoWidth + "×" + v.videoHeight : "—"],
      ["مدت", fmt(v.duration)],
      ["موقعیت", fmt(v.currentTime)],
      ["بافر جلوتر", buf ? fmt(buf) : "۰:۰۰"],
      ["افت فریم", q.droppedVideoFrames != null ? fa(q.droppedVideoFrames) : "—"],
      ["سرعت", fa(v.playbackRate) + "×"],
      ["صدا", Math.round((v.muted ? 0 : v.volume) * 100) + "٪"]
    ];
    d.stats.innerHTML = "<h5>آمار پخش</h5>" + rows.map(function (r) {
      return '<div class="r"><span>' + r[0] + "</span><b>" + esc(r[1]) + "</b></div>";
    }).join("");
  }

  /* ── عکس از فریم ─────────────────────────────────────────── */
  function snap() {
    if (P.emb || !d.v || !d.v.videoWidth) return toast("برای این منبع عکس‌گرفتن ممکن نیست", "err");
    var c = document.createElement("canvas");
    c.width = d.v.videoWidth; c.height = d.v.videoHeight;
    try { c.getContext("2d").drawImage(d.v, 0, 0, c.width, c.height); }
    catch (e) { return toast("به‌خاطر محدودیت CORS مرورگر، عکس گرفتن از این ویدیو ممکن نیست", "err"); }
    var a = document.createElement("a");
    a.download = (P.o.title || "ronin-frame").replace(/\s+/g, "-") + "-" + Math.floor(d.v.currentTime) + "s.png";
    try { a.href = c.toDataURL("image/png"); } catch (e) { return toast("خروجی گرفتن ممکن نشد", "err"); }
    document.body.appendChild(a); a.click(); a.remove();
    flash();
    toast("عکس فریم ذخیره شد 📸", "ok");
  }
  function flash() {
    R.root.classList.remove("flash");
    void R.root.offsetWidth;
    R.root.classList.add("flash");
    setTimeout(function () { R.root.classList.remove("flash"); }, 400);
  }

  /* ── تایمر خواب / Wake Lock / Media Session ───────────────── */
  function setSleep(min) {
    clearTimeout(P.sleepT); P.sleepT = null;
    SET.sleepMin = num(min);
    saveSet();
    if (SET.sleepMin > 0) {
      P.sleepT = setTimeout(function () {
        if (d.v) d.v.pause();
        toast("⏰ تایمر خواب: پخش متوقف شد", "ok");
        SET.sleepMin = 0; saveSet();
        if (R.root.classList.contains("set-open")) renderSet();
      }, SET.sleepMin * 60000);
      toast("تایمر خواب: " + fa(SET.sleepMin) + " دقیقه", "ok");
    } else toast("تایمر خواب خاموش شد", "ok");
    if (R.root.classList.contains("set-open")) renderSet();
  }
  function wakeOn() {
    if (!("wakeLock" in navigator) || P.wake) return;
    try {
      navigator.wakeLock.request("screen").then(function (w) {
        P.wake = w;
        w.addEventListener("release", function () { P.wake = null; });
      }).catch(function () {});
    } catch (e) {}
  }
  function wakeOff() { if (P.wake) { try { P.wake.release(); } catch (e) {} P.wake = null; } }
  function mediaSession() {
    if (!("mediaSession" in navigator)) return;
    try {
      if (window.MediaMetadata) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: P.o.title || "", artist: "RONIN STORE", album: P.o.subtitle || "",
          artwork: P.o.poster ? [{ src: P.o.poster, sizes: "512x512" }] : []
        });
      }
      navigator.mediaSession.setActionHandler("play", function () { if (d.v) d.v.play().catch(function () {}); });
      navigator.mediaSession.setActionHandler("pause", function () { if (d.v) d.v.pause(); });
      navigator.mediaSession.setActionHandler("seekbackward", function () { skip(-10); });
      navigator.mediaSession.setActionHandler("seekforward", function () { skip(10); });
      if (P.o.onNext) navigator.mediaSession.setActionHandler("nexttrack", function () { next(); });
    } catch (e) {}
  }

  /* ── نوار زمان ────────────────────────────────────────────── */
  function ratioAt(clientX) {
    var r = d.rail.getBoundingClientRect();
    return clamp((clientX - r.left) / Math.max(1, r.width), 0, 1);
  }
  function showBub(x, ratio) {
    if (!d.v || !isFinite(d.v.duration)) return;
    var t = ratio * d.v.duration;
    var label = fmt(t), extra = "";
    if (P.o && P.o.chapters && P.o.chapters.length) {
      for (var i = 0; i < P.o.chapters.length; i++) {
        var c = P.o.chapters[i];
        if (t >= num(c.t)) extra = c.title;
      }
    }
    d.bub.innerHTML = label + (extra ? "<i>" + esc(extra) + "</i>" : "");
    d.bub.style.left = (ratio * 100) + "%";
    d.bub.classList.add("on");
  }
  function hideBub() { d.bub.classList.remove("on"); }
  function onTrackDown(e) {
    if (P.emb || !d.v || !isFinite(d.v.duration)) return;
    P.scrubbing = true;
    R.root.classList.add("scrub");
    try { d.track.setPointerCapture(e.pointerId); } catch (err) {}
    var r = ratioAt(e.clientX);
    d.v.currentTime = r * d.v.duration;
    showBub(e.clientX, r);
  }
  function onTrackMove(e) {
    if (P.emb || !d.v || !isFinite(d.v.duration)) return;
    var r = ratioAt(e.clientX);
    showBub(e.clientX, r);
    if (P.scrubbing) {
      d.v.currentTime = r * d.v.duration;
      paint();
    }
  }
  function onTrackUp() {
    P.scrubbing = false;
    R.root.classList.remove("scrub");
    setTimeout(hideBub, 600);
    if (d.v) posSet(P.o.id, P.idx, d.v.currentTime);
  }

  /* ── رنگ‌آمیزی وضعیت ──────────────────────────────────────── */
  var lastPaint = 0;
  function paint() {
    var v = d.v;
    if (!v) return;
    var dur = isFinite(v.duration) ? v.duration : 0;
    var p = dur ? (v.currentTime / dur) * 100 : 0;
    d.rail.style.setProperty("--p", p.toFixed(3) + "%");
    d.miniP.style.setProperty("--p", p.toFixed(3) + "%");
    d.track.setAttribute("aria-valuenow", String(Math.round(p)));
    d.time.innerHTML = fmt(v.currentTime) + " <i>/</i> " + fmt(dur);
    d.big.hidden = !v.paused;
    R.root.classList.toggle("playing", !v.paused);
    d.play.textContent = v.paused ? "▶" : "⏸";
    if (P.o && Date.now() - lastPaint > 4000) { lastPaint = Date.now(); posSet(P.o.id, P.idx, v.currentTime); }
    if (dur && v.currentTime > dur - 0.4 && v.ended && !P.ended) ended();
  }

  function paintBuffer() {
    var v = d.v;
    if (!v || !isFinite(v.duration) || !v.duration) return;
    var end = 0;
    try {
      for (var i = 0; i < v.buffered.length; i++) {
        if (v.currentTime >= v.buffered.start(i) - 1) end = Math.max(end, v.buffered.end(i));
      }
    } catch (e) {}
    d.rail.style.setProperty("--buf", ((end / v.duration) * 100).toFixed(2) + "%");
  }

  function spin(on, pct) {
    d.spin.classList.toggle("on", !!on);
    if (pct != null) d.pct.textContent = pct + "٪";
  }
  function hud(icon, text) {
    d.hud.innerHTML = "<span>" + icon + "</span><span>" + esc(text) + "</span>";
    d.hud.classList.add("on");
    clearTimeout(d.hud._t);
    d.hud._t = setTimeout(function () { d.hud.classList.remove("on"); }, 1100);
  }
  var toastT;
  function toast(msg, kind) {
    d.toast.textContent = msg;
    d.toast.className = "rpl-toast on " + (kind || "");
    clearTimeout(toastT);
    toastT = setTimeout(function () { d.toast.classList.remove("on"); }, 2800);
  }
  function showErr(msg) {
    d.errT.textContent = msg || "لینک منبع در دسترس نیست یا دامنه اجازهٔ پخش نمی‌دهد.";
    d.err.classList.add("on");
    spin(false);
  }
  function ended() {
    P.ended = true;
    d.end.classList.add("on");
    d.endT.textContent = "پخش تمام شد";
    d.endP.textContent = "می‌توانی دوباره ببینی یا به منبع بعدی بروی.";
    if (SET.autoNext && (P.o.onNext || (P.o.sources || []).length > 1)) {
      d.count.hidden = false;
      var n = 8;
      d.count.innerHTML = "پخش بعدی تا <b>" + fa(n) + "</b> ثانیه " +
        '<button class="rpl-mi" type="button" data-a="cancelnext" style="display:inline-flex;padding:0 4px;width:auto">لغو</button>';
      clearInterval(P.countT);
      P.countT = setInterval(function () {
        n--;
        if (n <= 0) { clearInterval(P.countT); next(); return; }
        var b = d.count.querySelector("b"); if (b) b.textContent = fa(n);
      }, 1000);
    }
  }
  function wakeUI() {
    R.root.classList.remove("idle");
    clearTimeout(P.idleT);
    P.idleT = setTimeout(function () {
      if (!d.v || d.v.paused) return;
      if (R.root.classList.contains("set-open") || d.keys.classList.contains("on")) return;
      if (P.menuName) return;
      R.root.classList.add("idle");
    }, 3000);
  }

  /* ── رویدادها ─────────────────────────────────────────────── */
  function bind() {
    R.root.addEventListener("click", function (e) {
      var t = e.target;
      if (!t || !t.closest) return;
      var b = t.closest("[data-a]");
      if (!b) {
        if (t === d.stage || t === d.frame) wakeUI();
        return;
      }
      var a = b.getAttribute("data-a");
      act(a, b);
    });
    R.root.addEventListener("change", function (e) {
      var t = e.target;
      if (!t || !t.getAttribute) return;
      var tg = t.getAttribute("data-tog");
      if (!tg) return;
      if (tg === "loop") { SET.loop = t.checked; d.v.loop = t.checked; saveSet(); }
      if (tg === "auto") { SET.autoNext = t.checked; saveSet(); }
      if (tg === "theater") { R.root.classList.toggle("theater", t.checked); }
      renderSet();
    });
    R.root.addEventListener("input", function (e) {
      var t = e.target;
      if (t && t.id === "rplVol") {
        d.v.volume = clamp(num(t.value) / 100, 0, 1);
        d.v.muted = false;
        d.vol.style.setProperty("--v", t.value + "%");
        d.mute.textContent = d.v.volume === 0 ? "🔇" : (d.v.volume < 0.55 ? "🔉" : "🔊");
      }
    });

    /* نوار زمان */
    d.track.addEventListener("pointerdown", onTrackDown);
    d.track.addEventListener("pointermove", function (e) { if (!P.scrubbing) showBub(e.clientX, ratioAt(e.clientX)); });
    d.track.addEventListener("pointerup", onTrackUp);
    d.track.addEventListener("pointercancel", onTrackUp);
    d.track.addEventListener("pointerleave", function () { if (!P.scrubbing) hideBub(); });
    d.track.addEventListener("keydown", function (e) {
      if (!d.v || !isFinite(d.v.duration)) return;
      var step = e.shiftKey ? 30 : 5;
      if (e.key === "ArrowLeft") { e.preventDefault(); e.stopPropagation(); d.v.currentTime = clamp(d.v.currentTime - step, 0, d.v.duration); }
      if (e.key === "ArrowRight") { e.preventDefault(); e.stopPropagation(); d.v.currentTime = clamp(d.v.currentTime + step, 0, d.v.duration); }
    });

    /* ویدیو */
    var v = d.v;
    v.addEventListener("loadedmetadata", function () {
      spin(false); paint(); paintBuffer(); paintChaps();
      applySub();
      var at = P.pendingAt;
      if (at > 3 && at < v.duration - 5) { v.currentTime = at; hud("⏱", "ادامه از " + fmt(at)); }
      P.pendingAt = 0;
    });
    v.addEventListener("durationchange", function () { paint(); });
    v.addEventListener("timeupdate", function () { paint(); });
    v.addEventListener("progress", paintBuffer);
    v.addEventListener("play", function () { R.root.classList.add("playing"); d.big.hidden = true; d.play.textContent = "⏸"; wakeOn(); wakeUI(); });
    v.addEventListener("pause", function () {
      R.root.classList.remove("playing"); d.big.hidden = false; d.play.textContent = "▶"; wakeOff();
      R.root.classList.remove("idle");
      if (!v.ended) posSet(P.o.id, P.idx, v.currentTime);
    });
    v.addEventListener("waiting", function () { spin(true, ""); });
    v.addEventListener("playing", function () { spin(false); d.err.classList.remove("on"); });
    v.addEventListener("canplay", function () { spin(false); });
    v.addEventListener("volumechange", syncVol);
    v.addEventListener("ratechange", function () { d.rate.textContent = (v.playbackRate === 1 ? "۱" : fa(v.playbackRate)) + "×"; });
    v.addEventListener("error", function () {
      var host = hostOf(v.currentSrc || v.src || "");
      showErr(host ? "پخش از «" + host + "» ممکن نشد؛ ممکن است لینک منقضی شده یا دامنه اجازهٔ پخش نداده باشد." :
        "فایل پخش نشد؛ فرمت یا لینک را بررسی کن.");
    });
    v.addEventListener("ended", function () {
      posSet(P.o.id, P.idx, 0);
      posClear(P.o.id, P.idx);
      ended();
    });
    v.addEventListener("loadeddata", function () { paintBuffer(); });

    /* ژست‌ها */
    var g = { x0: 0, y0: 0, t0: 0, mode: "", side: "", sv: 1, sd: 0 };
    d.frame.addEventListener("pointerdown", function (e) {
      if (P.emb) return;
      if (e.target.closest("[data-a], .rpl-ctl, .rpl-menu, .rpl-set, .rpl-end, .rpl-err, .rpl-keys, .rpl-stats")) return;
      g.x0 = e.clientX; g.y0 = e.clientY; g.t0 = Date.now(); g.mode = ""; g.sv = d.v.volume; g.sd = P.dim;
      var r = d.frame.getBoundingClientRect();
      g.side = (e.clientX - r.left) < r.width / 2 ? "dim" : "vol";
      clearTimeout(P.longT);
      P.longT = setTimeout(function () {
        if (g.mode) return;
        P.longOn = true; P.prevRate = d.v.playbackRate || 1;
        d.v.playbackRate = 2;
        hud("⏩", "۲× سرعت (رها کن)");
      }, 480);
    });
    d.frame.addEventListener("pointermove", function (e) {
      if (!g.x0) return;
      var dx = e.clientX - g.x0, dy = e.clientY - g.y0;
      if (Math.abs(dy) > 24 && Math.abs(dy) > Math.abs(dx)) {
        if (P.longOn) return;
        g.mode = "v";
        var dlt = -dy / 170;
        if (g.side === "vol") {
          d.v.volume = clamp(g.sv + dlt, 0, 1);
          hud("🔊", "صدا " + fa(Math.round(d.v.volume * 100)) + "٪");
        } else {
          P.dim = clamp(g.sd + dlt, 0, 0.75);
          d.dim.style.opacity = P.dim;
          hud("☀️", "روشنایی " + fa(Math.round((1 - P.dim) * 100)) + "٪");
        }
      }
    });
    d.frame.addEventListener("pointerup", function (e) {
      clearTimeout(P.longT);
      g.x0 = 0;
      if (P.longOn) {
        P.longOn = false;
        d.v.playbackRate = P.prevRate || 1;
        hud("▶", "سرعت عادی");
        return;
      }
      if (g.mode === "v") { g.mode = ""; setTimeout(function () { d.hud.classList.remove("on"); }, 700); return; }
      if (Date.now() - g.t0 > 320) return;
      var now = Date.now();
      var r = d.frame.getBoundingClientRect();
      var left = (e.clientX - r.left) < r.width / 2;
      if (now - P.lastTap < 320) {
        clearTimeout(P.tapT);
        P.lastTap = 0;
        skip(left ? -10 : 10, e.clientX, e.clientY);
      } else {
        P.lastTap = now;
        P.tapT = setTimeout(toggle, 230);
      }
    });
    d.frame.addEventListener("pointerleave", function () { clearTimeout(P.longT); g.x0 = 0; });
    d.frame.addEventListener("mousemove", wakeUI);
    d.frame.addEventListener("touchstart", wakeUI, { passive: true });

    /* کلیدها */
    document.addEventListener("keydown", function (e) {
      if (!P.open) return;
      var tag = (e.target && e.target.tagName || "").toLowerCase();
      if (/input|textarea|select/.test(tag)) return;
      var k = e.key;
      if (k === " ") { e.preventDefault(); toggle(); }
      else if (k === "k" || k === "K") toggle();
      else if (k === "ArrowLeft") { e.preventDefault(); skip(-10); }
      else if (k === "ArrowRight") { e.preventDefault(); skip(10); }
      else if (k === "ArrowUp") { e.preventDefault(); d.v.volume = clamp(d.v.volume + 0.1, 0, 1); hud("🔊", fa(Math.round(d.v.volume * 100)) + "٪"); }
      else if (k === "ArrowDown") { e.preventDefault(); d.v.volume = clamp(d.v.volume - 0.1, 0, 1); hud("🔊", fa(Math.round(d.v.volume * 100)) + "٪"); }
      else if (k === "m" || k === "M") toggleMute();
      else if (k === "f" || k === "F") fs();
      else if (k === "t" || k === "T") theater();
      else if (k === "p" || k === "P") pip();
      else if (k === "c" || k === "C") openMenu("subs");
      else if (k === "s" || k === "S") snap();
      else if (k === "?") toggleKeys();
      else if (k === "," || k === ".") {
        e.preventDefault();
        if (d.v.paused && isFinite(d.v.duration)) d.v.currentTime = clamp(d.v.currentTime + (k === "." ? 1 / 25 : -1 / 25), 0, d.v.duration);
      } else if (/^[0-9]$/.test(k)) {
        if (d.v && isFinite(d.v.duration)) d.v.currentTime = (num(k) / 10) * d.v.duration;
      } else if (k === "Escape") {
        if (d.keys.classList.contains("on")) return toggleKeys();
        if (R.root.classList.contains("set-open")) return closeSet();
        if (d.menu.classList.contains("on")) return closeMenu();
        close();
      }
    });

    window.addEventListener("beforeunload", function () {
      if (d.v && P.open && P.o) posSet(P.o.id, P.idx, d.v.currentTime);
    });
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) { if (P.v) posSet(P.o.id, P.idx, d.v.currentTime); }
      else if (P.open && !d.v.paused) wakeOn();
    });
  }

  function act(a, el) {
    var val = el.getAttribute ? el.getAttribute("data-v") : null;
    switch (a) {
      case "close": close(); break;
      case "mini": toggleMini(); break;
      case "restore": toggleMini(); break;
      case "info": var cb = P.o && P.o.onInfo; close(); if (cb) cb(); break;
      case "settings": toggleSet(); break;
      case "toggle": toggle(); break;
      case "back": skip(-10); break;
      case "fwd": skip(10); break;
      case "mute": toggleMute(); break;
      case "rate": openMenu("rate"); break;
      case "quality": openMenu("quality"); break;
      case "subs": openMenu("subs"); break;
      case "setrate": setRate(val); break;
      case "setsrc": setSource(num(val), d.v ? d.v.currentTime : 0); break;
      case "setsub": setSub(num(val, -1)); break;
      case "pip": pip(); break;
      case "theater": theater(); break;
      case "fs": fs(); break;
      case "snap": snap(); break;
      case "stats": toggleStats(); break;
      case "keys": toggleKeys(); break;
      case "sleep": setSleep(num(val)); break;
      case "aspect": SET.aspect = val === "cover" ? "cover" : "contain"; saveSet(); R.root.classList.toggle("cover", SET.aspect === "cover"); renderSet(); break;
      case "cuesize": SET.cueSize = num(val, 100); saveSet(); injectCue(); renderSet(); break;
      case "cuebg": SET.cueBg = String(val || "1"); saveSet(); injectCue(); renderSet(); break;
      case "retry": setSource(P.idx, d.v ? d.v.currentTime : 0); break;
      case "replay": restart(); break;
      case "restart": restart(); break;
      case "next": clearInterval(P.countT); next(); break;
      case "cancelnext": clearInterval(P.countT); d.count.hidden = true; toast("پخش خودکار بعدی لغو شد", "ok"); break;
      default: break;
    }
  }

  function paintChaps() {
    d.chaps.innerHTML = "";
    var ch = (P.o && P.o.chapters) || [];
    if (!ch.length || !d.v || !isFinite(d.v.duration) || !d.v.duration) return;
    ch.forEach(function (c) {
      if (!c || !isFinite(num(c.t))) return;
      var s = document.createElement("span");
      s.className = "rpl-chap";
      s.style.left = ((num(c.t) / d.v.duration) * 100) + "%";
      d.chaps.appendChild(s);
    });
  }

  /* ── بستن ─────────────────────────────────────────────────── */
  function close() {
    if (!P.open) return;
    if (d.v) {
      posSet(P.o.id, P.idx, d.v.currentTime);
      try { d.v.pause(); } catch (e) {}
    }
    destroyHls();
    clearInterval(P.countT); clearInterval(P.statsT); clearTimeout(P.sleepT);
    clearTimeout(P.idleT); clearTimeout(P.longT); clearTimeout(P.tapT);
    wakeOff();
    var f = $("iframe", d.frame); if (f) f.remove();
    d.v.removeAttribute("src");
    try { d.v.load(); } catch (e) {}
    closeMenu(); closeSet();
    d.keys.classList.remove("on"); d.end.classList.remove("on");
    d.stats.classList.remove("on"); d.count.hidden = true;
    R.root.classList.remove("on", "mini", "theater", "set-open", "idle", "playing");
    P.open = false; P.mini = false;
    document.body.classList.remove("lock");
    document.documentElement.style.overflow = "";
    var cb = P.o && P.o.onClose;
    P.o = null;
    if (cb) cb();
  }

  window.RoninPlayer = {
    open: open,
    close: close,
    isOpen: function () { return P.open; },
    _state: P
  };
})();
