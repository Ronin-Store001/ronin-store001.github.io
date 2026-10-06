/* ═══════════════════════════════════════════════════════════════
   RONIN STORE — COMPANION PLUS  ·  ronin-companion-plus.js
   ارتقای کاراکتر راهنما: کشیدن • نگاه به موس • خواب • واکنش به
   اعلان و کارها • منوی سریع • مخفی/نمایش • سلام شخصی
   روی هوک‌های موجود سوار می‌شود و به کد اصلی دست نمی‌زند.
   ═══════════════════════════════════════════════════════════════ */
"use strict";
(function () {
  var LS_POS = "ronin_npc_pos", LS_HIDE = "ronin_npc_hide";
  var ST = { dragId: null, moved: false, sleepT: 0, asleep: false };

  function el(id) { return document.getElementById(id); }
  function npc() { return document.getElementById("gninja"); }
  function svg() { var n = npc(); return n ? n.querySelector("svg") : null; }
  function low() { return !!(window.R && R.lite); }
  function buzz() {
    var n = npc(); if (!n) return;
    n.classList.add("rcpBounce");
    setTimeout(function () { n.classList.remove("rcpBounce"); }, 1300);
  }

  /* ── استایل ───────────────────────────────────────────── */
  function css() {
    if (el("rcpCss")) return;
    var s = document.createElement("style");
    s.id = "rcpCss";
    s.textContent =
      "#gninja{transition:opacity .25s}" +
      "#gninja.dragging{animation:none!important;transition:none!important;cursor:grabbing}" +
      "#gninja.rplaced{animation:none}" +
      "#gninja.rcpBounce svg{animation:rcpJump .55s ease 2}" +
      "@keyframes rcpJump{0%,100%{transform:translateY(0)}40%{transform:translateY(-15px)}}" +
      "#gninja.rsleep svg{filter:grayscale(.45) brightness(.82)}" +
      "#rcpZ{position:absolute;top:-6px;inset-inline-start:-8px;font-size:15px;opacity:0;" +
      "pointer-events:none;transition:.3s}" +
      "#gninja.rsleep #rcpZ{animation:rcpZn 2.6s ease-in-out infinite}" +
      "@keyframes rcpZn{0%,100%{transform:translateY(0);opacity:.35}50%{transform:translateY(-7px);opacity:.9}}" +
      "#rcpHide{position:absolute;top:-7px;inset-inline-end:-5px;width:20px;height:20px;border-radius:50%;" +
      "border:1px solid rgba(255,255,255,.22);background:rgba(6,9,22,.82);color:#fff;font-size:10px;" +
      "line-height:1;cursor:pointer;z-index:3;display:grid;place-items:center;padding:0}" +
      "#rcpMenu{position:absolute;bottom:0;display:none;flex-direction:column;gap:5px;z-index:4}" +
      "#rcpMenu.on{display:flex}" +
      "#rcpMenu button{white-space:nowrap;border:1px solid rgba(140,160,255,.3);background:rgba(8,11,28,.95);" +
      "color:#eef1ff;border-radius:11px;padding:6px 10px;font-size:11.5px;font-family:inherit;cursor:pointer;" +
      "font-weight:700;text-align:start}" +
      "#rcpMenu button:hover{background:linear-gradient(135deg,#7c5cff,#22d3ee);color:#fff}" +
      "#rcpRestore{position:fixed;z-index:89;bottom:96px;inset-inline-end:12px;width:34px;height:34px;" +
      "border-radius:50%;border:1px solid rgba(140,160,255,.35);background:rgba(8,11,28,.9);color:#fff;" +
      "font-size:15px;cursor:pointer;display:none;place-items:center}" +
      "#rcpRestore.on{display:grid}" +
      "html.rshide #gninja{display:none!important}";
    document.head.appendChild(s);
  }

  /* ── ۱. جابه‌جایی ─────────────────────────────────────── */
  function saved() {
    try { return JSON.parse(localStorage.getItem(LS_POS) || "null"); } catch (e) { return null; }
  }
  function clamp(x, y) {
    var n = npc();
    var w = (n && n.offsetWidth) || 70, h = (n && n.offsetHeight) || 110;
    return {
      x: Math.min(Math.max(4, x), Math.max(4, window.innerWidth - w - 4)),
      y: Math.min(Math.max(4, y), Math.max(4, window.innerHeight - h - 4))
    };
  }
  function place(x, y) {
    var n = npc(); if (!n) return;
    n.style.setProperty("inset-inline-end", "auto");
    n.style.setProperty("inset-inline-start", "auto");
    n.style.setProperty("right", "auto");
    n.style.setProperty("bottom", "auto");
    n.style.left = x + "px";
    n.style.top = y + "px";
    n.classList.add("rplaced");
  }
  function savePos(x, y) {
    try { localStorage.setItem(LS_POS, JSON.stringify({ x: x, y: y })); } catch (e) {}
    if (window.R && R.ME && R.upd) {
      R.upd("users/" + R.ME, { npcPos: { x: x, y: y } }).catch(function () {});
    }
  }
  function resetPos() {
    var n = npc(); if (!n) return;
    try { localStorage.removeItem(LS_POS); } catch (e) {}
    n.style.left = ""; n.style.top = "";
    ["inset-inline-end", "inset-inline-start", "right", "bottom"].forEach(function (p) {
      n.style.removeProperty(p);
    });
    n.classList.remove("rplaced");
    if (window.R && R.ME && R.upd) R.upd("users/" + R.ME, { npcPos: null }).catch(function () {});
    if (R.toast) R.toast("همراه برگشت سر جاش 🥷", "ok");
  }
  function restorePos() {
    var p = (window.R && R.USER && R.USER.npcPos && typeof R.USER.npcPos.x === "number")
      ? R.USER.npcPos : saved();
    if (!p || typeof p.x !== "number") return;
    var c = clamp(p.x, p.y);
    place(c.x, c.y);
  }
  function bindDrag() {
    var n = npc();
    if (!n || n.dataset.rcpDrag) return;
    n.dataset.rcpDrag = "1";
    var sx = 0, sy = 0, ox = 0, oy = 0;

    n.addEventListener("pointerdown", function (e) {
      if (e.target.closest && (e.target.closest("#rcpHide") || e.target.closest("#rcpMenu"))) return;
      var r = n.getBoundingClientRect();
      ST.dragId = e.pointerId;
      sx = e.clientX; sy = e.clientY; ox = r.left; oy = r.top;
      ST.moved = false;
      try { n.setPointerCapture(e.pointerId); } catch (er) {}
    });

    n.addEventListener("pointermove", function (e) {
      if (ST.dragId === null || e.pointerId !== ST.dragId) return;
      var dx = e.clientX - sx, dy = e.clientY - sy;
      if (!ST.moved && (Math.abs(dx) + Math.abs(dy)) > 6) {
        ST.moved = true;
        n.classList.add("dragging");
      }
      if (!ST.moved) return;
      e.preventDefault();
      var c = clamp(ox + dx, oy + dy);
      n.style.setProperty("inset-inline-end", "auto");
      n.style.setProperty("bottom", "auto");
      n.style.setProperty("right", "auto");
      n.style.left = c.x + "px";
      n.style.top = c.y + "px";
    });

    function end(e) {
      if (ST.dragId === null) return;
      try { n.releasePointerCapture(ST.dragId); } catch (er) {}
      ST.dragId = null;
      n.classList.remove("dragging");
      if (ST.moved) {
        n.classList.add("rplaced");
        var r = n.getBoundingClientRect();
        savePos(Math.round(r.left), Math.round(r.top));
        wake();
      }
    }
    n.addEventListener("pointerup", end);
    n.addEventListener("pointercancel", end);

    window.addEventListener("resize", function () {
      if (!n.classList.contains("rplaced")) return;
      var c = clamp(parseFloat(n.style.left) || 0, parseFloat(n.style.top) || 0);
      place(c.x, c.y);
    }, { passive: true });
  }

  /* ── ۲. نگاه به موس ──────────────────────────────────── */
  function bindLook() {
    if (low()) return;
    var s = svg(); if (!s || s.dataset.rcpLook) return;
    s.dataset.rcpLook = "1";
    s.style.transformOrigin = "50% 100%";
    var raf = 0, ang = 0;
    window.addEventListener("pointermove", function (e) {
      if (e.pointerType && e.pointerType !== "mouse") return;
      wake();
      var n = npc(); if (!n) return;
      var r = n.getBoundingClientRect();
      var dx = e.clientX - (r.left + r.width / 2);
      ang = Math.max(-6, Math.min(6, dx / Math.max(170, Math.abs(dx)) * 6));
      if (raf) return;
      raf = requestAnimationFrame(function () {
        raf = 0;
        s.style.transform = "rotate(" + ang.toFixed(2) + "deg)";
      });
    }, { passive: true });
  }

  /* ── ۳. خواب / بیداری ───────────────────────────────── */
  function sleep() {
    var n = npc(); if (!n) return;
    ST.asleep = true;
    n.classList.add("rsleep");
    if (window.R && R.npcSay) R.npcSay("دارم چرت می‌زنم… صدام کن 💤", 4200);
  }
  function wake() {
    ST.sleepT = Date.now();
    if (!ST.asleep) return;
    ST.asleep = false;
    var n = npc(); if (n) n.classList.remove("rsleep");
  }
  function bindIdle() {
    if (ST.sleepT) return;
    wake();
    ["pointerdown", "pointermove", "touchstart", "keydown", "scroll"].forEach(function (ev) {
      window.addEventListener(ev, wake, { passive: true });
    });
    setInterval(function () {
      if (!ST.asleep && Date.now() - ST.sleepT > 60000) sleep();
    }, 15000);
  }

  /* ── ۴. واکنش به اعلان ──────────────────────────────── */
  function bindBell() {
    if (!window.R || !R.paintBell || R._rcpBell) return;
    R._rcpBell = true;
    var prev = R.paintBell, first = true;
    R.paintBell = function () {
      var b = el("bellDot");
      var before = b ? (parseInt(b.textContent, 10) || 0) : 0;
      var out = prev.apply(this, arguments);
      var after = b ? (parseInt(b.textContent, 10) || 0) : 0;
      if (first) { first = false; return out; }
      if (after > before) {
        buzz();
        if (R.npcSay) R.npcSay(after > 1 ? (R.fa(after) + " اعلان جدید داری! 🔔") : "یه اعلان جدید داری! 🔔", 4200);
      }
      return out;
    };
  }

  /* ── ۵. واکنش به کارها ──────────────────────────────── */
  var CHEER = ["آفرین! 🥷", "ایول! همین‌طور ادامه بده 🔥", "عالی بود! ✨", "داتِ‌بایو! 🥷"];
  function cheer(txt) {
    buzz();
    if (window.R && R.npcSay) R.npcSay(txt || CHEER[Math.floor(Math.random() * CHEER.length)], 3200);
  }
  function bindToast() {
    if (!window.R || !R.toast || R._rcpToast) return;
    R._rcpToast = true;
    var prev = R.toast, last = 0;
    var KEYS = ["پست", "پرمیوم", "منتشر", "خوش آمدی", "لایک", "ذخیره شد", "امتیاز", "حساب"];
    R.toast = function (msg, kind) {
      var out = prev.apply(this, arguments);
      try {
        if (kind === "ok" && Date.now() - last > 9000) {
          for (var i = 0; i < KEYS.length; i++) {
            if (String(msg).indexOf(KEYS[i]) !== -1) { last = Date.now(); cheer(); break; }
          }
        }
      } catch (e) {}
      return out;
    };
  }

  /* ── ۶. منوی سریع ───────────────────────────────────── */
  var LINKS = [
    ["💬", "چت عمومی", "chat"],
    ["👥", "انجمن", "community"],
    ["📣", "اطلاعیه و تریلر", "bulletin"],
    ["🏆", "رتبه‌بندی", "rank"],
    ["👤", "پروفایل", "profile"]
  ];
  function menu() {
    var n = npc();
    if (!n || el("rcpMenu")) return;
    var d = document.createElement("div");
    d.id = "rcpMenu";
    n.appendChild(d);

    var hb = document.createElement("button");
    hb.id = "rcpHide"; hb.type = "button"; hb.title = "مخفی کردن همراه"; hb.textContent = "✕";
    n.appendChild(hb);

    var z = document.createElement("span");
    z.id = "rcpZ"; z.textContent = "💤";
    n.appendChild(z);
  }
  function buildMenu() {
    var d = el("rcpMenu"), n = npc();
    if (!d || !n) return;
    var h = LINKS.map(function (x) {
      return '<button type="button" data-rcpgo="' + x[2] + '">' + x[0] + " " + x[1] + "</button>";
    }).join("");
    if (window.R && R.isOwner && R.isOwner()) h += '<button type="button" data-rcpgo="owner">👑 پنل مالک</button>';
    if (window.R && R.isStaff && R.isStaff()) h += '<button type="button" data-rcpgo="team">🛡 شبکه فرماندهی</button>';
    if (saved() || (R.USER && R.USER.npcPos)) h += '<button type="button" data-rcpres="1">↺ برگشت به جای اول</button>';
    d.innerHTML = h;

    /* سمت چپ یا راست، بسته به جای همراه */
    var r = n.getBoundingClientRect();
    if (r.left + r.width / 2 < window.innerWidth / 2) {
      d.style.right = "auto"; d.style.left = "calc(100% + 10px)";
    } else {
      d.style.left = "auto"; d.style.right = "calc(100% + 10px)";
    }
  }
  function openMenu() {
    buildMenu();
    var d = el("rcpMenu"); if (!d) return;
    d.classList.add("on");
    wake();
  }
  function closeMenu() {
    var d = el("rcpMenu"); if (d) d.classList.remove("on");
  }
  function toggleMenu() {
    var d = el("rcpMenu"); if (!d) return;
    if (d.classList.contains("on")) closeMenu(); else openMenu();
  }

  /* ── ۷. مخفی / نمایش ────────────────────────────────── */
  function applyHide(v) {
    document.documentElement.classList.toggle("rshide", !!v);
    var b = el("rcpRestore");
    if (b) b.classList.toggle("on", !!v);
    try { v ? localStorage.setItem(LS_HIDE, "1") : localStorage.removeItem(LS_HIDE); } catch (e) {}
    if (v) closeMenu();
  }
  function restoreBtn() {
    if (el("rcpRestore")) return;
    var b = document.createElement("button");
    b.id = "rcpRestore"; b.type = "button"; b.title = "نمایش همراه"; b.textContent = "🥷";
    b.addEventListener("click", function () { applyHide(false); });
    document.body.appendChild(b);
  }

  /* ── ۸. سلام شخصی ───────────────────────────────────── */
  function greet() {
    if (!window.R || !R.USER || !R.npcSay) return;
    var nm = R.USER.name || "";
    var lv = (R.level && R.fa) ? R.fa(R.level(R.USER.xp || 0)) : "";
    R.npcSay("سلام " + nm + "! " + (lv ? "سطح " + lv + " — " : "") + "بریم جلو 🥷", 5200);
  }

  /* ── ۹. راهنمای بخش‌های جدید ────────────────────────── */
  function tips() {
    if (!window.R || !R.NPC_TIPS) return;
    var T = {
      bulletin: "اینجا خبر انیمه، تریلر و اعلان پخش هست 📣",
      groups: "گروه‌های چت — با پرمیوم یا اجازه مالک بساز 🏯",
      team: "شبکه فرماندهی — فقط تیم 👑 می‌بیند 🛡",
      ads: "از اینجا آگهی بساز 📢",
      myworld: "دنیای من 🧭",
      inbox: "صندوق پیام‌هایت 📥",
      archive: "آرشیو همراه — شخصیت‌های ویژه 🎭",
      progress: "پیشرفت و دستاوردهات 🏅"
    };
    Object.keys(T).forEach(function (k) { if (!R.NPC_TIPS[k]) R.NPC_TIPS[k] = T[k]; });
  }

  /* ── کلیک‌ها ────────────────────────────────────────── */
  document.addEventListener("click", function (e) {
    var t = e.target;
    if (!t || !t.closest) return;

    if (t.closest("#rcpRestore")) { e.preventDefault(); return applyHide(false); }
    if (t.closest("#rcpHide")) { e.preventDefault(); e.stopPropagation(); return applyHide(true); }
    if (t.closest("#rcpMenu") && !t.closest("[data-rcpgo]") && !t.closest("[data-rcpres]")) {
      return e.stopPropagation();
    }
    var r = t.closest("[data-rcpres]");
    if (r) { e.preventDefault(); e.stopPropagation(); closeMenu(); return resetPos(); }
    var g = t.closest("[data-rcpgo]");
    if (g) {
      e.preventDefault(); e.stopPropagation();
      var go = g.getAttribute("data-rcpgo");
      closeMenu();
      if (window.R && R.go) R.go(go);
      return;
    }
    if (t.closest("#gninja")) {
      if (ST.moved) { ST.moved = false; return; }
      e.preventDefault();
      return toggleMenu();
    }
    closeMenu();
  }, true);

  /* ── راه‌اندازی ─────────────────────────────────────── */
  function boot() {
    if (!window.R || !npc() || !svg()) return;
    css();
    menu();
    restoreBtn();
    bindDrag();
    bindLook();
    bindIdle();
    bindBell();
    bindToast();
    tips();
    restorePos();
    try { if (localStorage.getItem(LS_HIDE)) applyHide(true); } catch (e) {}
  }

  var prevLogin = window.R && R.onLogin;
  if (window.R) {
    R.onLogin = function () {
      if (prevLogin) { try { prevLogin(); } catch (e) {} }
      setTimeout(function () { boot(); restorePos(); greet(); }, 900);
    };
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  [700, 1600, 3000, 5200].forEach(function (ms) { setTimeout(boot, ms); });
})();
