/* RONIN PLAYER ULTRA — player-ultra.js
   ارتقای پلیر صفحهٔ فیلم روی پلیر موجود، بدون تغییر فایل‌هایش:
   • حالت سینما (تئاتر)، قاب‌بندی تصویر، تکرار A-B، تایمر خواب، پنل اطلاعات
   • میان‌برهای کامل کیبورد + نمایش OSD روی تصویر
   • دابل‌تپ چپ/راست برای ۱۰ ثانیه عقب/جلو روی موبایل */
"use strict";
(function bootAll() {
  if (window.__puPlayer) return;
  window.__puPlayer = true;

  var CSS = [
    "#puBar{display:flex;align-items:center;gap:4px;flex-wrap:wrap;margin-inline-start:auto}",
    ".pu-b{display:inline-flex;align-items:center;justify-content:center;gap:4px;min-width:30px;height:30px;",
    "  padding:0 8px;border-radius:9px;cursor:pointer;font:inherit;font-size:11px;font-weight:800;",
    "  color:#dfe6ff;border:1px solid rgba(140,160,255,.22);background:rgba(255,255,255,.05);transition:.15s}",
    ".pu-b:hover{border-color:rgba(124,92,255,.6);background:rgba(124,92,255,.18)}",
    ".pu-b.on{color:#05060f;border-color:transparent;background:linear-gradient(135deg,#8ef0ff,#7c5cff)}",
    "#cxPlayer.pu-theat{position:fixed!important;inset:0!important;z-index:9999!important;margin:0!important;",
    "  padding:0!important;border-radius:0!important;background:#000!important;max-height:none!important;height:100vh!important}",
    "#cxPlayer.pu-theat .rpl-stage,#cxPlayer.pu-theat #rplStage{height:calc(100vh - 62px)!important;max-height:none!important}",
    "#puOsd{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) scale(.9);z-index:60;",
    "  display:flex;align-items:center;gap:8px;padding:12px 18px;border-radius:16px;pointer-events:none;",
    "  color:#fff;font-size:15px;font-weight:900;background:rgba(6,8,20,.78);border:1px solid rgba(140,160,255,.3);",
    "  backdrop-filter:blur(8px);opacity:0;transition:opacity .18s,transform .18s}",
    "#puOsd.on{opacity:1;transform:translate(-50%,-50%) scale(1)}",
    "#puInfo{position:absolute;top:14px;inset-inline-start:14px;z-index:60;padding:10px 12px;border-radius:13px;",
    "  display:none;font-size:10.5px;line-height:1.9;color:#cfd9ff;background:rgba(6,8,20,.8);",
    "  border:1px solid rgba(140,160,255,.28);backdrop-filter:blur(8px);direction:ltr}",
    "#puInfo.on{display:block}",
    "#puInfo b{color:#8ef0ff}"
  ].join("");
  var st = document.createElement("style");
  st.id = "puCss"; st.textContent = CSS;
  (document.head || document.documentElement).appendChild(st);

  var V = null, ROOT = null, OSD = null, INF = null;
  var AB = { a: 0, b: 0 };
  var sleepT = null, sleepMin = 0;

  function fmt(s) {
    s = Math.max(0, Math.floor(s || 0));
    var h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    return (h ? h + ":" + (m < 10 ? "0" : "") : "") + m + ":" + (sec < 10 ? "0" : "") + sec;
  }
  function osd(txt, ms) {
    if (!OSD) return;
    OSD.textContent = txt;
    OSD.classList.add("on");
    clearTimeout(OSD._t);
    OSD._t = setTimeout(function () { OSD.classList.remove("on"); }, ms || 900);
  }
  function fa(n) { return String(n).replace(/[0-9]/g, function (d) { return "۰۱۲۳۴۵۶۷۸۹"[d]; }); }
  function fullBtn() {
    return ROOT ? ROOT.querySelector('[data-a="full"],[data-a="fullscreen"],[data-a="fs"]') : null;
  }
  function togglePlay() {
    if (!V) return;
    if (V.paused) { var p = V.play(); if (p && p.catch) p.catch(function () {}); }
    else V.pause();
  }
  function nudge(d) {
    if (!V) return;
    V.currentTime = Math.max(0, Math.min((V.duration || 1e9), V.currentTime + d));
    osd((d > 0 ? "⏩ " : "⏪ ") + fmt(Math.abs(d)), 700);
  }
  function setVol(d) {
    if (!V) return;
    V.volume = Math.max(0, Math.min(1, Math.round((V.volume + d) * 100) / 100));
    osd((V.volume === 0 ? "🔇" : "🔊") + " " + fa(Math.round(V.volume * 100)) + "%", 700);
  }

  function fillInfo() {
    if (!INF || !V) return;
    var buf = 0;
    try {
      if (V.buffered.length) buf = (V.buffered.end(V.buffered.length - 1) / (V.duration || 1)) * 100;
    } catch (e) {}
    INF.innerHTML = "res <b>" + (V.videoWidth || 0) + "×" + (V.videoHeight || 0) + "</b><br>" +
      "time <b>" + fmt(V.currentTime) + " / " + fmt(V.duration) + "</b><br>" +
      "buffer <b>" + Math.round(buf) + "%</b><br>" +
      "speed <b>" + (V.playbackRate || 1) + "x</b><br>" +
      "loop <b>" + (AB.a && AB.b ? fmt(AB.a) + "-" + fmt(AB.b) : "off") + "</b>";
  }

  function paint() {
    var t = document.querySelector('[data-pu="ab"]');
    if (t) {
      t.classList.toggle("on", !!(AB.a || AB.b));
      t.textContent = AB.a && AB.b ? "A-B" : (AB.a ? "A…" : "A-B");
    }
    var th = document.querySelector('[data-pu="theat"]');
    if (th) th.classList.toggle("on", !!(ROOT && ROOT.classList.contains("pu-theat")));
    var sl = document.querySelector('[data-pu="sleep"]');
    if (sl) {
      sl.classList.toggle("on", !!sleepMin);
      sl.textContent = sleepMin ? "⏱ " + fa(sleepMin) : "⏱";
    }
    if (INF && INF.classList.contains("on")) fillInfo();
  }

  function theater() {
    if (!ROOT) return;
    ROOT.classList.toggle("pu-theat");
    if (ROOT.classList.contains("pu-theat")) {
      if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
        try { var r = ROOT.requestFullscreen(); if (r && r.catch) r.catch(function () {}); } catch (e) {}
      }
      osd("🎬 حالت سینما", 1100);
    } else {
      if (document.fullscreenElement) { try { document.exitFullscreen(); } catch (e) {} }
      osd("حالت سینما خاموش", 900);
    }
    paint();
  }

  function fitCycle() {
    if (!V) return;
    var mode = V.dataset.puFit || "contain";
    if (mode === "contain") { V.dataset.puFit = "cover"; V.style.objectFit = "cover"; V.style.transform = "none"; osd("🖼 پر کردن کادر", 800); }
    else if (mode === "cover") { V.dataset.puFit = "zoom"; V.style.objectFit = "contain"; V.style.transform = "scale(1.12)"; osd("🔍 بزرگ‌نمایی", 800); }
    else { V.dataset.puFit = "contain"; V.style.objectFit = "contain"; V.style.transform = "none"; osd("↔ اندازهٔ اصلی", 800); }
  }

  function abMark() {
    if (!V) return;
    if (!AB.a) { AB.a = V.currentTime; osd("🚩 نقطهٔ A: " + fmt(AB.a), 1000); }
    else if (!AB.b) {
      if (V.currentTime <= AB.a + 1) { AB.a = V.currentTime; osd("🚩 A جابه‌جا شد", 800); }
      else { AB.b = V.currentTime; osd("🏁 پخش تکراری " + fmt(AB.a) + " → " + fmt(AB.b), 1300); }
    } else { AB.a = 0; AB.b = 0; osd("تکرار A-B خاموش", 900); }
    paint();
  }

  function sleepCycle() {
    var order = [0, 15, 30, 45, 60];
    var i = order.indexOf(sleepMin);
    sleepMin = order[(i + 1) % order.length];
    if (sleepT) { clearTimeout(sleepT); sleepT = null; }
    if (sleepMin) {
      sleepT = setTimeout(function () {
        if (V) V.pause();
        osd("⏱ تایمر خواب: پخش متوقف شد", 1600);
        sleepMin = 0; paint();
      }, sleepMin * 60000);
      osd("⏱ خواب بعد از " + fa(sleepMin) + " دقیقه", 1100);
    } else {
      osd("تایمر خواب خاموش", 800);
    }
    paint();
  }

  function act(k) {
    if (k === "theat") return theater();
    if (k === "fit") return fitCycle();
    if (k === "ab") return abMark();
    if (k === "sleep") return sleepCycle();
    if (k === "info" && INF) { if (INF.classList.toggle("on")) fillInfo(); }
  }

  function mkBtn(k, txt, title) {
    var b = document.createElement("button");
    b.type = "button"; b.className = "pu-b"; b.textContent = txt;
    b.setAttribute("data-pu", k);
    b.title = title || txt;
    b.addEventListener("click", function (e) { e.stopPropagation(); act(k); });
    return b;
  }

  function injectBar() {
    var play = document.getElementById("rplPlay");
    if (!play || document.getElementById("puBar")) return;
    var bar = document.createElement("div");
    bar.id = "puBar";
    bar.appendChild(mkBtn("theat", "🎬", "حالت سینما (T)"));
    bar.appendChild(mkBtn("fit", "🖼", "قاب‌بندی تصویر"));
    bar.appendChild(mkBtn("ab", "A-B", "تکرار بخشی از ویدیو (A)"));
    bar.appendChild(mkBtn("sleep", "⏱", "تایمر خواب"));
    bar.appendChild(mkBtn("info", "ℹ", "اطلاعات پخش (I)"));
    play.parentNode.appendChild(bar);
  }

  function keys(e) {
    if (!V || !document.getElementById("rplV")) return;
    if (e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
    var k = e.key, handled = true;
    if (k === " " || k === "k" || k === "K") togglePlay();
    else if (k === "ArrowRight") nudge(e.shiftKey ? 30 : 10);
    else if (k === "ArrowLeft") nudge(e.shiftKey ? -30 : -10);
    else if (k === "l" || k === "L") nudge(10);
    else if (k === "j" || k === "J") nudge(-10);
    else if (k === "ArrowUp") setVol(0.05);
    else if (k === "ArrowDown") setVol(-0.05);
    else if (k === "m" || k === "M") { V.muted = !V.muted; osd(V.muted ? "🔇 بی‌صدا" : "🔊 صدا روشن", 700); }
    else if (k === "f" || k === "F") { var fb = fullBtn(); if (fb) fb.click(); else theater(); }
    else if (k === "t" || k === "T") theater();
    else if (k === "a" || k === "A") abMark();
    else if (k === "i" || k === "I") act("info");
    else if (k === ">" || k === ".") { V.playbackRate = Math.min(3, (V.playbackRate || 1) + 0.25); osd("سرعت " + V.playbackRate + "x", 700); }
    else if (k === "<" || k === ",") { V.playbackRate = Math.max(0.25, (V.playbackRate || 1) - 0.25); osd("سرعت " + V.playbackRate + "x", 700); }
    else handled = false;
    if (handled) { e.preventDefault(); e.stopPropagation(); }
  }

  function bindVideo() {
    if (!V || V.__puBound) return;
    V.__puBound = 1;
    V.addEventListener("timeupdate", function () {
      if (AB.a && AB.b && V.currentTime > AB.b) V.currentTime = AB.a;
      if (INF && INF.classList.contains("on")) fillInfo();
    });
    var lastTap = 0, lastX = 0;
    V.addEventListener("pointerup", function (e) {
      var now = Date.now();
      if (now - lastTap < 320 && Math.abs(e.clientX - lastX) < 60) {
        var r = V.getBoundingClientRect(), px = (e.clientX - r.left) / r.width;
        if (px < 0.4) nudge(-10); else if (px > 0.6) nudge(10);
        lastTap = 0; return;
      }
      lastTap = now; lastX = e.clientX;
    });
  }

  function init() {
    var v = document.getElementById("rplV");
    if (!v) { V = null; ROOT = null; return false; }
    V = v;
    ROOT = document.getElementById("cxPlayer") || v.closest(".rpl") || document.body;
    if (!ROOT.querySelector("#puOsd")) { OSD = document.createElement("div"); OSD.id = "puOsd"; ROOT.appendChild(OSD); }
    else OSD = ROOT.querySelector("#puOsd");
    if (!ROOT.querySelector("#puInfo")) { INF = document.createElement("div"); INF.id = "puInfo"; ROOT.appendChild(INF); }
    else INF = ROOT.querySelector("#puInfo");
    injectBar();
    bindVideo();
    paint();
    return true;
  }

  document.addEventListener("keydown", keys, true);
  setInterval(function () {
    if (document.getElementById("rplV")) init();
    else if (V) { V = null; ROOT = null; }
  }, 600);

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
