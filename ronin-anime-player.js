/* ═══════════════════════════════════════════════════════════════
   RONIN STORE — ANIME PLAYER  ·  ronin-anime-player.js
   پلیر تمام‌صفحه: تایم‌لاین بافر، صدا، سرعت، زیرنویس، PiP،
   تمام‌صفحه، ±۱۰ ثانیه، لیست قسمت، ادامه از آخرین جای تماشا،
   کلیدهای میان‌بر و دکمه بازگشت به صفحه اصلی.
   منبع پخش از فیلدهای anime خوانده می‌شود:
   video / src / file / trailer / url  یا  episodes[{n,t,src}]
   ═══════════════════════════════════════════════════════════════ */
"use strict";
(function () {
  if (!window.R) return;
  var R = window.R;
  if (R.__rpPlayer) return;
  R.__rpPlayer = true;

  var DEMO = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4";
  var POSK = "ronin:player:pos:";
  var LISTK = "ronin:player:list";
  var SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

  function $(id) { return document.getElementById(id); }
  function num(x) {
    var n = Number(String(x == null ? "" : x).replace(/[^\d.]/g, ""));
    return isFinite(n) ? n : 0;
  }
  function esc(s) {
    if (R.esc) return R.esc(s);
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function fa(n) { return R.fa ? R.fa(n) : String(n); }
  function toast(t) { return R.toast ? R.toast(t, "ok") : null; }
  function pad(n) { return n < 10 ? "0" + n : "" + n; }
  function clock(s) {
    s = Math.max(0, Math.floor(s || 0));
    var h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60;
    return fa(h ? h + ":" + pad(m) + ":" + pad(x) : m + ":" + pad(x));
  }

  /* ── دادهٔ عنوان و قسمت‌ها ─────────────────────────────────── */
  function dataOf(id) {
    var a = (R.ANIME || {})[id] || {};
    var eps = [], e = a.episodes, k;
    function push(n, src, t, poster) {
      if (!src) return;
      eps.push({ n: num(n) || eps.length + 1, src: String(src), t: String(t || "قسمت " + (num(n) || eps.length + 1)), poster: poster || "" });
    }
    if (Array.isArray(e)) {
      e.forEach(function (x, i) {
        if (typeof x === "string") push(i + 1, x, "قسمت " + (i + 1));
        else if (x) push(x.n || i + 1, x.src || x.url || x.file, x.t || x.title, x.poster);
      });
    } else if (e && typeof e === "object") {
      Object.keys(e).forEach(function (key) {
        var v = e[key];
        if (typeof v === "string") push(key, v, "قسمت " + key);
        else if (v) push(v.n || key, v.src || v.url || v.file, v.t || v.title, v.poster);
      });
    }
    var main = a.video || a.src || a.file || a.trailer || a.url || "";
    if (!eps.length && main) push(1, main, "قسمت ۱");
    if (!eps.length) push(1, DEMO, "نسخهٔ نمونه");
    eps.sort(function (x, y) { return x.n - y.n; });
    return {
      id: id,
      title: String(a.title || "انیمه"),
      jp: String(a.jp || ""),
      icon: String(a.icon || "🎬"),
      gen: String(a.gen || ""),
      st: String(a.st || ""),
      rate: a.rate || "",
      year: a.year || "",
      desc: String(a.desc || ""),
      subs: Array.isArray(a.subtitles) ? a.subtitles : (a.sub ? [{ src: a.sub, label: "فارسی", lang: "fa" }] : []),
      eps: eps,
      demo: !main
    };
  }

  /* ── وضعیت ─────────────────────────────────────────────────── */
  var ST = { id: null, d: null, ep: 0, built: false, hideT: null };
  function video() { return $("rpVideo"); }

  function savedPos(id, ep) {
    try { return num(localStorage.getItem(POSK + id + ":" + ep)) || 0; } catch (e) { return 0; }
  }
  function savePos(t) {
    if (!ST.id) return;
    try { localStorage.setItem(POSK + ST.id + ":" + ST.ep, String(Math.floor(t || 0))); } catch (e) {}
  }

  /* ── ساخت پوسته ────────────────────────────────────────────── */
  function build() {
    if (ST.built) return;
    ST.built = true;
    var wrap = document.createElement("div");
    wrap.id = "rpModal";
    wrap.innerHTML =
      '<div id="rpShell">' +
        '<div class="rpStage"><div class="rpBox paused" id="rpBox">' +
          '<video id="rpVideo" playsinline preload="metadata"></video>' +
          '<button type="button" class="rpBig" id="rpBig"><i>▶</i></button>' +
          '<div class="rpSpin" id="rpSpin"><i></i></div>' +
          '<div class="rpErr" id="rpErr"><b>پخش ممکن نشد</b><span id="rpErrTx">لینک پخش این عنوان ثبت نشده است.</span></div>' +
          '<div class="rpToast" id="rpToast"></div>' +
          '<div class="rpCtrls" id="rpCtrls">' +
            '<div class="rpTrack" id="rpTrack"><div class="rpRail"><div class="rpBufP" id="rpBuf"></div><div class="rpPlayP" id="rpFill"></div></div>' +
              '<div class="rpKnob" id="rpKnob"></div><div class="rpTip" id="rpTip">۰:۰۰</div></div>' +
            '<div class="rpRow">' +
              '<button type="button" class="rpBtn" id="rpPlay" title="پخش/توقف (Space)">▶</button>' +
              '<button type="button" class="rpBtn" id="rpBack" title="۱۰ ثانیه عقب (J)">⟲۱۰</button>' +
              '<button type="button" class="rpBtn" id="rpFwd" title="۱۰ ثانیه جلو (L)">۱۰⟳</button>' +
              '<span class="rpTime" id="rpTime"><b>۰:۰۰</b> / ۰:۰۰</span>' +
              '<span class="rpVol"><button type="button" class="rpBtn" id="rpMute" title="صدا (M)">🔊</button>' +
              '<input type="range" id="rpVol" min="0" max="100" value="100" aria-label="صدا"></span>' +
              '<span class="rpGrow"></span>' +
              '<select class="rpSel" id="rpSpeed" aria-label="سرعت پخش"></select>' +
              '<select class="rpSel" id="rpSrc" aria-label="منبع پخش"></select>' +
              '<button type="button" class="rpBtn" id="rpCc" title="زیرنویس (C)">CC</button>' +
              '<button type="button" class="rpBtn" id="rpPip" title="تصویر در تصویر">⧉</button>' +
              '<button type="button" class="rpBtn" id="rpFs" title="تمام‌صفحه (F)">⛶</button>' +
            '</div>' +
          '</div>' +
        '</div></div>' +
        '<aside class="rpSide">' +
          '<div class="rpTop"><button type="button" class="rpBtn rpX" id="rpClose" title="بستن (Esc)">✕</button>' +
            '<div class="rpTt"><b id="rpTitle">—</b><span id="rpSub">—</span></div></div>' +
          '<div class="rpSideBody">' +
            '<div class="rpSecT">فصل و قسمت</div><div class="rpEps" id="rpEps"></div>' +
            '<div class="rpMeta" id="rpMeta"></div>' +
            '<p class="rpDesc" id="rpDesc"></p>' +
            '<div class="rpActs">' +
              '<button type="button" class="rpAct" id="rpList">＋ لیست تماشا</button>' +
              '<button type="button" class="rpAct" id="rpShare">↗ اشتراک</button>' +
              '<button type="button" class="rpAct" id="rpHome">🏠 صفحه اصلی</button>' +
            '</div>' +
          '</div>' +
        '</aside>' +
      '</div>';
    document.body.appendChild(wrap);
    $("rpTrack").style.direction = "ltr";
    var sp = $("rpSpeed"), i;
    sp.innerHTML = SPEEDS.map(function (s) {
      return '<option value="' + s + '">' + fa(String(s)) + '×</option>';
    }).join("");
    sp.value = "1";
    bindUI();
  }

  /* ── رندر اطلاعات ──────────────────────────────────────────── */
  function render() {
    var d = ST.d;
    $("rpTitle").textContent = d.title;
    $("rpSub").textContent = (d.jp ? d.jp + " • " : "") + (d.st || "") + (d.year ? " • " + d.year : "");
    $("rpDesc").textContent = d.desc || "توضیحی برای این عنوان ثبت نشده است.";
    var meta = '';
    if (d.rate) meta += '<span class="rpChip gold">⭐ ' + fa(String(d.rate)) + "</span>";
    if (d.st) meta += '<span class="rpChip">' + esc(d.st) + "</span>";
    if (d.gen) meta += '<span class="rpChip">' + esc(d.gen) + "</span>";
    if (d.demo) meta += '<span class="rpChip">نسخهٔ نمونه</span>';
    $("rpMeta").innerHTML = meta;

    $("rpEps").innerHTML = d.eps.map(function (e, i) {
      return '<button type="button" class="rpEp' + (i === ST.ep ? " on" : "") + '" data-ep="' + i + '">' +
        "<i>" + fa(e.n) + "</i><span>" + esc(e.t) + "</span>" +
        '<b style="font-size:9px;opacity:.6">' + fa((savedPos(d.id, i) / 60).toFixed(0)) + "′</b></button>";
    }).join("");

    var src = $("rpSrc");
    src.innerHTML = d.eps.map(function (e, i) {
      return '<option value="' + i + '">' + esc(e.t) + "</option>";
    }).join("");
    src.value = String(ST.ep);

    var on = isListed(d.id);
    $("rpList").classList.toggle("on", on);
    $("rpList").textContent = on ? "✓ در لیست تماشا" : "＋ لیست تماشا";
  }

  /* ── بارگذاری قسمت ─────────────────────────────────────────── */
  function loadEp(i, autoplay) {
    var d = ST.d;
    ST.ep = Math.max(0, Math.min(d.eps.length - 1, i));
    var e = d.eps[ST.ep], v = video();
    $("rpErr").classList.remove("on");
    $("rpSpin").classList.add("on");
    v.innerHTML = "";
    while (v.firstChild) v.removeChild(v.firstChild);
    v.src = e.src;
    v.poster = e.poster || "";
    (d.subs || []).forEach(function (s, k) {
      var tr = document.createElement("track");
      tr.kind = "subtitles";
      tr.label = s.label || "فارسی";
      tr.srclang = s.lang || "fa";
      tr.src = s.src;
      if (k === 0) tr.default = true;
      v.appendChild(tr);
    });
    $("rpCc").style.display = (d.subs && d.subs.length) ? "" : "none";
    v.playbackRate = num($("rpSpeed").value) || 1;
    var pos = savedPos(d.id, ST.ep);
    v.addEventListener("loadedmetadata", function once() {
      v.removeEventListener("loadedmetadata", once);
      $("rpSpin").classList.remove("on");
      if (pos > 3 && pos < v.duration - 5) {
        v.currentTime = pos;
        showToast("ادامه از " + clock(pos));
      }
      if (autoplay) v.play().catch(function () {});
      paint();
    });
    render();
  }

  /* ── نمایش/توقف ────────────────────────────────────────────── */
  function toggle() {
    var v = video();
    if (!v) return;
    if (v.paused) { v.play().catch(function () {}); }
    else v.pause();
  }
  function seek(t) {
    var v = video();
    if (!v || !isFinite(v.duration)) return;
    v.currentTime = Math.max(0, Math.min(v.duration, v.currentTime + t));
  }
  function showToast(t) {
    var n = $("rpToast");
    if (!n) return;
    n.textContent = t;
    n.classList.add("on");
    clearTimeout(ST.hideT);
    ST.hideT = setTimeout(function () { n.classList.remove("on"); }, 1500);
  }
  function paint() {
    var v = video();
    if (!v) return;
    var dur = isFinite(v.duration) ? v.duration : 0;
    var pct = dur ? (v.currentTime / dur) * 100 : 0;
    $("rpFill").style.width = pct + "%";
    $("rpKnob").style.insetInlineStart = pct + "%";
    var buf = 0;
    try { if (v.buffered.length) buf = (v.buffered.end(v.buffered.length - 1) / dur) * 100; } catch (e) {}
    $("rpBuf").style.width = Math.max(0, Math.min(100, buf)) + "%";
    $("rpTime").innerHTML = "<b>" + clock(v.currentTime) + "</b> / " + clock(dur);
    $("rpPlay").textContent = v.paused ? "▶" : "❚❚";
    $("rpBig").classList.toggle("hide", !v.paused);
    $("rpBox").classList.toggle("paused", v.paused);
    $("rpMute").textContent = v.muted || v.volume === 0 ? "🔇" : (v.volume > 0.5 ? "🔊" : "🔉");
  }

  /* ── رویدادها ──────────────────────────────────────────────── */
  function bindUI() {
    var v = video(), track = $("rpTrack");
    v.addEventListener("timeupdate", paint);
    v.addEventListener("play", paint);
    v.addEventListener("pause", function () { paint(); savePos(v.currentTime); });
    v.addEventListener("progress", paint);
    v.addEventListener("waiting", function () { $("rpSpin").classList.add("on"); });
    v.addEventListener("playing", function () { $("rpSpin").classList.remove("on"); paint(); });
    v.addEventListener("canplay", function () { $("rpSpin").classList.remove("on"); });
    v.addEventListener("ended", function () {
      savePos(0);
      if (ST.ep < ST.d.eps.length - 1) { loadEp(ST.ep + 1, true); showToast("قسمت بعدی"); }
      else { showToast("پایان قسمت‌ها"); }
    });
    v.addEventListener("error", function () {
      $("rpSpin").classList.remove("on");
      $("rpErr").classList.add("on");
      $("rpErrTx").textContent = "فایل این قسمت باز نشد؛ لینک پخش در دیتابیس را بررسی کن.";
    });
    setInterval(function () { if (ST.id && !v.paused) savePos(v.currentTime); }, 5000);

    $("rpPlay").addEventListener("click", toggle);
    $("rpBig").addEventListener("click", toggle);
    $("rpBack").addEventListener("click", function () { seek(-10); });
    $("rpFwd").addEventListener("click", function () { seek(10); });
    $("rpMute").addEventListener("click", function () {
      v.muted = !v.muted;
      if (!v.muted && v.volume === 0) { v.volume = 1; $("rpVol").value = 100; }
      paint();
    });
    $("rpVol").addEventListener("input", function (e) {
      v.volume = num(e.target.value) / 100;
      v.muted = v.volume === 0;
      paint();
    });
    $("rpSpeed").addEventListener("change", function (e) {
      v.playbackRate = num(e.target.value) || 1;
      showToast("سرعت " + fa(e.target.value) + "×");
    });
    $("rpSrc").addEventListener("change", function (e) { loadEp(num(e.target.value), true); });
    $("rpCc").addEventListener("click", function () {
      var t = v.textTracks && v.textTracks[0];
      if (!t) return;
      t.mode = t.mode === "showing" ? "hidden" : "showing";
      $("rpCc").classList.toggle("on", t.mode === "showing");
      showToast(t.mode === "showing" ? "زیرنویس روشن" : "زیرنویس خاموش");
    });
    $("rpPip").addEventListener("click", function () {
      try {
        if (document.pictureInPictureElement) document.exitPictureInPicture();
        else v.requestPictureInPicture();
      } catch (e) { showToast("مرورگر PiP را پشتیبانی نمی‌کند"); }
    });
    $("rpFs").addEventListener("click", function () {
      var sh = $("rpShell");
      try {
        if (document.fullscreenElement) document.exitFullscreen();
        else sh.requestFullscreen();
      } catch (e) {}
    });
    $("rpClose").addEventListener("click", close);
    $("rpModal").addEventListener("click", function (e) { if (e.target.id === "rpModal") close(); });

    $("rpEps").addEventListener("click", function (e) {
      var b = e.target.closest("[data-ep]");
      if (b) loadEp(num(b.getAttribute("data-ep")), true);
    });
    $("rpList").addEventListener("click", function () { toggleList(); });
    $("rpShare").addEventListener("click", function () {
      var url = location.origin + location.pathname + "#anime";
      try {
        if (navigator.share) navigator.share({ title: ST.d.title, url: url });
        else if (navigator.clipboard) navigator.clipboard.writeText(url).then(function () { showToast("لینک کپی شد"); });
      } catch (e) {}
    });
    $("rpHome").addEventListener("click", goHome);

    /* تایم‌لاین */
    function ratio(e) {
      var r = track.querySelector(".rpRail").getBoundingClientRect();
      var x = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
      return Math.max(0, Math.min(1, x / r.width));
    }
    function apply(e) {
      var v2 = video();
      if (isFinite(v2.duration)) v2.currentTime = ratio(e) * v2.duration;
      paint();
    }
    track.addEventListener("pointerdown", function (e) {
      track.classList.add("drag");
      try { track.setPointerCapture(e.pointerId); } catch (er) {}
      apply(e);
    });
    track.addEventListener("pointermove", function (e) {
      var tip = $("rpTip"), r = track.querySelector(".rpRail").getBoundingClientRect();
      var p = ratio(e);
      if (isFinite(video().duration)) tip.textContent = clock(p * video().duration);
      tip.style.left = (p * r.width) + "px";
      tip.style.insetInlineStart = (p * r.width) + "px";
      if (track.classList.contains("drag")) apply(e);
    });
    track.addEventListener("pointerup", function () { track.classList.remove("drag"); });

    document.addEventListener("keydown", function (e) {
      if (!ST.id || !$("rpModal").classList.contains("on")) return;
      var tg = e.target.tagName;
      if (tg === "INPUT" || tg === "SELECT" || tg === "TEXTAREA") return;
      var k = e.key.toLowerCase();
      if (k === " " || k === "k") { e.preventDefault(); toggle(); }
      else if (k === "arrowright") { e.preventDefault(); seek(-5); }
      else if (k === "arrowleft") { e.preventDefault(); seek(5); }
      else if (k === "j") seek(-10);
      else if (k === "l") seek(10);
      else if (k === "arrowup") { e.preventDefault(); v.volume = Math.min(1, v.volume + 0.1); $("rpVol").value = v.volume * 100; paint(); }
      else if (k === "arrowdown") { e.preventDefault(); v.volume = Math.max(0, v.volume - 0.1); $("rpVol").value = v.volume * 100; paint(); }
      else if (k === "m") { v.muted = !v.muted; paint(); }
      else if (k === "f") $("rpFs").click();
      else if (k === "c") $("rpCc").click();
      else if (k === "escape") close();
    });
  }

  /* ── لیست تماشا ────────────────────────────────────────────── */
  function listOf() { try { return JSON.parse(localStorage.getItem(LISTK) || "[]") || []; } catch (e) { return []; } }
  function isListed(id) { return listOf().indexOf(id) > -1; }
  function toggleList() {
    var l = listOf(), i = l.indexOf(ST.id);
    if (i > -1) l.splice(i, 1); else l.push(ST.id);
    try { localStorage.setItem(LISTK, JSON.stringify(l)); } catch (e) {}
    render();
    toast(i > -1 ? "از لیست تماشا حذف شد" : "به لیست تماشا اضافه شد");
  }

  /* ── باز/بسته ──────────────────────────────────────────────── */
  function goHome() {
    if (document.getElementById("sec-home") && R.go) R.go("home");
    else location.hash = "";
  }
  function close() {
    var v = video();
    if (v) { savePos(v.currentTime); v.pause(); }
    $("rpModal").classList.remove("on");
    document.documentElement.style.overflow = "";
    if (document.fullscreenElement) { try { document.exitFullscreen(); } catch (e) {} }
  }
  function open(id, ep) {
    build();
    ST.id = id;
    ST.d = dataOf(id);
    ST.ep = 0;
    if (ST.d.demo && R.toast) R.toast("برای این عنوان لینک پخش ثبت نشده؛ نسخهٔ نمونه پخش می‌شود", "info");
    $("rpModal").classList.add("on");
    document.documentElement.style.overflow = "hidden";
    loadEp(num(ep) || 0, true);
    paint();
  }

  /* ── اتصال به کارت‌ها ──────────────────────────────────────── */
  document.addEventListener("click", function (e) {
    var t = e.target.closest ? e.target.closest(".apPlay, .aphGo") : null;
    if (!t) return;
    var host = t.closest("[data-apopen]") || t.closest("[data-aphgo]");
    var id = host && (host.getAttribute("data-apopen") || host.getAttribute("data-aphgo"));
    if (!id) return;
    e.preventDefault();
    e.stopPropagation();
    open(id);
  }, true);

  /* ── دکمه بازگشت به صفحه اصلی ─────────────────────────────── */
  function homeButton() {
    var sec = document.getElementById("sec-anime");
    if (!sec || sec.querySelector(".rpHm")) return;
    var b = document.createElement("button");
    b.type = "button";
    b.className = "rpHm";
    b.textContent = "🏠 صفحه اصلی";
    b.addEventListener("click", goHome);
    var head = sec.querySelector(".head") || sec.querySelector("h2");
    if (head && head.parentNode) head.parentNode.insertBefore(b, head.nextSibling);
    else {
      var wrap = sec.querySelector(".apWrap") || sec;
      wrap.insertBefore(b, wrap.firstChild);
    }
  }

  function css() {
    if ($("rpCSS")) return;
    var l = document.createElement("link");
    l.id = "rpCSS";
    l.rel = "stylesheet";
    l.href = "ronin-anime-player.css?v=1";
    (document.head || document.documentElement).appendChild(l);
  }

  function start() {
    css();
    homeButton();
    setTimeout(homeButton, 1200);
    setTimeout(homeButton, 3000);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
