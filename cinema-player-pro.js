/* ═══════════════════════════════════════════════════════════════
   RONIN CINEMA — cinema-player-pro.js
   پوستهٔ تازهٔ پلیر + قابلیت‌های اضافه:
   • اسکین شیشه‌ای/نئونی روی کلاس‌های rpl
   • دابل‌کلیک روی تصویر = تمام‌صفحه
   • سوایپ چپ/راست روی موبایل = جلو/عقب
   • دکمهٔ PiP و چیپ سرعت پخش
   • نمایش زمان باقی‌مانده
   ═══════════════════════════════════════════════════════════════ */
"use strict";
(function () {
  if (window.__rnPlayerPro) return;
  window.__rnPlayerPro = true;

  var CSS = [
    "#rpl{border-radius:0;background:#04050c}",
    "#rpl .rpl-shell{border-radius:0}",
    "#rpl .rpl-top{",
    "  padding:11px 16px;border-bottom:1px solid rgba(140,160,255,.14);",
    "  background:linear-gradient(180deg,rgba(8,11,26,.96),rgba(8,11,26,.72));",
    "  backdrop-filter:blur(18px) saturate(1.3)}",
    "#rpl .rpl-ttl b{font-size:13px;font-weight:900}",
    "#rpl .rpl-ttl span{font-size:10px;color:#93a0c6}",
    "#rpl .rpl-ib{border-radius:11px;background:rgba(255,255,255,.06);transition:.18s}",
    "#rpl .rpl-ib:hover{background:rgba(124,92,255,.3);border-color:rgba(124,92,255,.55)}",
    "#rpl .rpl-back{border-radius:11px}",
    "#rpl .rpl-badges span{font-size:9px;border-radius:6px;letter-spacing:.4px}",
    "#rpl .rpl-frame{border-radius:0}",
    "#rpl .rpl-big{",
    "  width:74px;height:74px;font-size:24px;border-radius:50%;",
    "  background:rgba(124,92,255,.5);border:1px solid rgba(255,255,255,.45);",
    "  box-shadow:0 0 0 10px rgba(124,92,255,.14),0 20px 50px -16px #7c5cff;",
    "  backdrop-filter:blur(8px)}",
    "#rpl .rpl-ctl{padding:34px 16px 14px;",
    "  background:linear-gradient(0deg,rgba(2,4,10,.97) 10%,rgba(2,4,10,.55) 60%,transparent)}",
    "#rpl .rpl-track{padding:12px 0}",
    "#rpl .rpl-rail{height:6px;border-radius:99px;background:rgba(255,255,255,.16)}",
    "#rpl .rpl-buf{background:rgba(255,255,255,.24);border-radius:99px}",
    "#rpl .rpl-played{",
    "  border-radius:99px;",
    "  background:linear-gradient(90deg,#7c5cff,#22d3ee 70%,#5df0b0);",
    "  box-shadow:0 0 18px rgba(124,92,255,.7)}",
    "#rpl .rpl-thumb{",
    "  width:14px;height:14px;background:#fff;border-radius:50%;",
    "  box-shadow:0 0 0 5px rgba(124,92,255,.3),0 4px 14px rgba(0,0,0,.6)}",
    "#rpl .rpl-bub{",
    "  background:rgba(8,11,24,.95);border:1px solid rgba(124,92,255,.45);",
    "  border-radius:9px;font-size:10px;padding:3px 8px;box-shadow:0 10px 24px rgba(0,0,0,.55)}",
    "#rpl .rpl-row{gap:9px}",
    "#rpl .rpl-btn{border-radius:11px;transition:.16s}",
    "#rpl .rpl-btn.ic{width:38px;height:38px;font-size:13px}",
    "#rpl .rpl-btn:hover{border-color:rgba(124,92,255,.5);background:rgba(124,92,255,.2)}",
    "#rpl .rpl-vol input{accent-color:#7c5cff}",
    "#rpl .rpl-card{",
    "  border-radius:22px;border:1px solid rgba(124,92,255,.3);",
    "  background:linear-gradient(170deg,rgba(16,20,44,.98),rgba(7,10,24,.99));",
    "  box-shadow:0 40px 90px -34px #000,0 0 60px -30px rgba(124,92,255,.9)}",
    "#rpl .rpl-menu,#rpl .rpl-set{border-radius:16px;border-color:rgba(124,92,255,.3);",
    "  background:rgba(9,12,28,.98);box-shadow:0 30px 70px -30px #000}",
    "#rpl .rpl-hud{border-radius:14px;background:rgba(8,11,24,.86);backdrop-filter:blur(10px)}",
    "#rpl .rpl-spin i{border-top-color:#22d3ee}",
    "#rpl.mini .rpl-shell{border-radius:18px;box-shadow:0 30px 70px -24px #000}",
    "#rpl .rpl-glow{",
    "  background:radial-gradient(70% 70% at 50% 50%,rgba(124,92,255,.32),transparent 72%);",
    "  filter:blur(38px)}",
    "/* چیپ‌های تازه */",
    ".rplx-row{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-top:6px}",
    ".rplx-chip{",
    "  border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.05);color:#e8ecff;",
    "  font:inherit;font-size:10px;font-weight:800;padding:4px 9px;border-radius:9px;cursor:pointer;",
    "  transition:.16s;white-space:nowrap}",
    ".rplx-chip:hover{background:rgba(124,92,255,.28);border-color:rgba(124,92,255,.5)}",
    ".rplx-chip.on{background:linear-gradient(135deg,#7c5cff,#22d3ee);color:#08030f;border-color:transparent}",
    ".rplx-rem{font-size:10.5px;color:#b9c4e4;font-variant-numeric:tabular-nums;direction:ltr;margin-inline-start:auto}",
    ".rplx-hint{",
    "  position:absolute;inset-inline:0;bottom:96px;margin:auto;width:max-content;max-width:90%;",
    "  background:rgba(8,11,24,.92);border:1px solid rgba(124,92,255,.4);border-radius:12px;",
    "  padding:7px 12px;font-size:10.5px;color:#eef1ff;opacity:0;transform:translateY(8px);",
    "  transition:.2s;pointer-events:none;z-index:6}",
    ".rplx-hint.on{opacity:1;transform:none}"
  ].join("");

  var style = document.createElement("style");
  style.id = "rplxCSS";
  style.textContent = CSS;
  (document.head || document.documentElement).appendChild(style);

  function $(s, r) { return (r || document).querySelector(s); }
  function fa(n) { return String(n).replace(/[0-9]/g, function (d) { return "۰۱۲۳۴۵۶۷۸۹"[d]; }); }
  function fmt(t) {
    t = Math.max(0, Math.floor(t || 0));
    var h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = t % 60;
    var p = function (n) { return (n < 10 ? "0" : "") + n; };
    return fa(h ? h + ":" + p(m) + ":" + p(s) : m + ":" + p(s));
  }

  var SPEEDS = [1, 1.25, 1.5, 2];

  function hint(text) {
    var frame = $("#rplFrame");
    if (!frame) return;
    var el = $(".rplx-hint", frame);
    if (!el) {
      el = document.createElement("div");
      el.className = "rplx-hint";
      frame.appendChild(el);
    }
    el.textContent = text;
    el.classList.add("on");
    clearTimeout(el.__t);
    el.__t = setTimeout(function () { el.classList.remove("on"); }, 1400);
  }

  function enhance() {
    var root = $("#rpl");
    if (!root) { setTimeout(enhance, 400); return; }
    if (root.getAttribute("data-pro")) return;
    root.setAttribute("data-pro", "1");

    var v = $("#rplV");
    var ctl = $("#rplCtl");
    var row = ctl && $(".rpl-row", ctl);
    var stage = $("#rplStage");

    /* ── چیپ‌های سرعت + زمان باقی‌مانده ─────────────────── */
    if (ctl && row) {
      var bar = document.createElement("div");
      bar.className = "rplx-row";
      bar.innerHTML = SPEEDS.map(function (s) {
        return '<button class="rplx-chip' + (s === 1 ? " on" : "") + '" type="button" data-rplx-speed="' + s + '">' + fa(s) + "×</button>";
      }).join("") + '<span class="rplx-rem" id="rplxRem">—</span>';
      ctl.appendChild(bar);
      bar.addEventListener("click", function (e) {
        var b = e.target.closest("[data-rplx-speed]");
        if (!b || !v) return;
        var sp = parseFloat(b.getAttribute("data-rplx-speed")) || 1;
        v.playbackRate = sp;
        Array.prototype.forEach.call(bar.querySelectorAll("[data-rplx-speed]"), function (x) {
          x.classList.toggle("on", x === b);
        });
        hint("سرعت پخش: " + fa(sp) + "×");
      });
    }

    /* ── PiP ────────────────────────────────────────────── */
    var top = $(".rpl-top");
    if (top && v && document.pictureInPictureEnabled) {
      var pip = document.createElement("button");
      pip.className = "rpl-ib";
      pip.type = "button";
      pip.title = "تصویر در تصویر (P)";
      pip.textContent = "⧉";
      pip.addEventListener("click", function () {
        try {
          if (document.pictureInPictureElement) document.exitPictureInPicture();
          else v.requestPictureInPicture();
        } catch (err) { hint("PiP در این مرورگر پشتیبانی نمی‌شود"); }
      });
      var settingsBtn = top.querySelector('[data-a="settings"]');
      if (settingsBtn) top.insertBefore(pip, settingsBtn);
      else top.appendChild(pip);
    }

    /* ── زمان باقی‌مانده ─────────────────────────────────── */
    if (v) {
      v.addEventListener("timeupdate", function () {
        var rem = $("#rplxRem");
        if (!rem) return;
        var d = v.duration;
        if (!isFinite(d) || !d) { rem.textContent = "—"; return; }
        rem.textContent = "−" + fmt(d - v.currentTime);
      });
    }

    /* ── دابل‌کلیک = تمام‌صفحه ──────────────────────────── */
    if (stage) {
      stage.addEventListener("dblclick", function (e) {
        if (e.target.closest("button,input,.rplx-row")) return;
        if (document.fullscreenElement) document.exitFullscreen();
        else if (root.requestFullscreen) root.requestFullscreen().catch(function () {});
      });

      /* ── سوایپ چپ/راست روی موبایل ────────────────────── */
      var sx = 0, sy = 0, st = 0;
      stage.addEventListener("touchstart", function (e) {
        if (!v || e.touches.length !== 1) return;
        var t = e.touches[0];
        sx = t.clientX; sy = t.clientY; st = Date.now();
      }, { passive: true });
      stage.addEventListener("touchend", function (e) {
        if (!v || !sx) return;
        var t = (e.changedTouches && e.changedTouches[0]) || null;
        if (!t) return;
        var dx = t.clientX - sx, dy = t.clientY - sy, dt = Date.now() - st;
        sx = 0;
        if (dt > 700 || Math.abs(dx) < 60 || Math.abs(dy) > 70) return;
        if (!isFinite(v.duration)) return;
        var step = dx < 0 ? 10 : -10;
        v.currentTime = Math.max(0, Math.min(v.duration, v.currentTime + step));
        hint((step > 0 ? "⏩ +" : "⏪ −") + fa(Math.abs(step)) + " ثانیه");
      }, { passive: true });
    }

    /* ── کلید P برای PiP ────────────────────────────────── */
    document.addEventListener("keydown", function (e) {
      if (!root.classList.contains("on") || !v) return;
      var tag = (e.target && e.target.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea") return;
      if (e.key === "p" || e.key === "P") {
        if (!document.pictureInPictureEnabled) return;
        e.preventDefault();
        try {
          if (document.pictureInPictureElement) document.exitPictureInPicture();
          else v.requestPictureInPicture();
        } catch (err) {}
      }
      if (e.key === "t" || e.key === "T") {
        e.preventDefault();
        root.classList.toggle("theater");
        hint(root.classList.contains("theater") ? "حالت سینما" : "حالت عادی");
      }
    });

    /* ── بعد از هر منبع تازه، سرعت را دوباره اعمال کن ───── */
    root.addEventListener("click", function (e) {
      if (!e.target.closest("[data-a]") || !v) return;
      setTimeout(function () {
        var on = $(".rplx-chip.on", root);
        if (on && v) v.playbackRate = parseFloat(on.getAttribute("data-rplx-speed")) || 1;
      }, 260);
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", enhance);
  else enhance();
  setTimeout(enhance, 1200);
})();
