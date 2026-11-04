/* ═══════════════════════════════════════════════════════════════
   RONIN STORE — COMPANION PLUS v4  ·  رونین‌همراه کامل
   همهٔ کارهای کاراکتر راهنما در همین یک فایل:
   🔎 جستجو · 🔦 چراغ‌قوه · 💬 بپرس · 🏁 تور · 🧭 منوی سریع
   🖐 کشیدن · 👀 نگاه به موس · 💤 خواب · 🙈 مخفی/نمایش · 🎭 آرشیو
   ───────────────────────────────────────────────────────────────
   نسخهٔ ۴ = ادغام companion-lab در همین فایل (فایل جدا لازم نیست).
   اگر نسخهٔ قدیمی lab هم لود شود، با R.__rcpLab اجرا نمی‌شود.
   ═══════════════════════════════════════════════════════════════ */
"use strict";
(function () {
  if (!window.R || R.__rcpPlus) return;
  R.__rcpPlus = true;
  R.__rcpLab = true;                 /* خنثی‌کردن نسخهٔ قدیمی companion-lab */

  var LS_POS = "ronin_npc_pos", LS_HIDE = "ronin_npc_hide";
  var ST = { dragId: null, moved: false, sleepT: 0, asleep: false };

  function el(id) { return document.getElementById(id); }
  function npc() { return el("gninja"); }
  function svg() { var n = npc(); return n ? n.querySelector("svg") : null; }
  function low() { return !!(window.R && R.lite); }
  function lite() {
    return !!(R.lite || (window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion:reduce)").matches));
  }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function num(n) { return R.fa ? R.fa(n) : String(n); }
  function say(t, ms) { if (R.npcSay) R.npcSay(t, ms); }
  function buzz() {
    var n = npc(); if (!n) return;
    n.classList.add("rcpBounce");
    setTimeout(function () { n.classList.remove("rcpBounce"); }, 1300);
  }

  /* ── استایل ─────────────────────────────────────────────── */
  function css() {
    if (el("rcpCss")) return;
    var s = document.createElement("style");
    s.id = "rcpCss";
    s.textContent =
      /* حرکات و حالت‌ها */
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
      "line-height:1;cursor:pointer;z-index:5;display:grid;place-items:center;padding:0}" +
      /* منو */
      "#rcpMenu{position:absolute;bottom:0;display:none;flex-direction:column;gap:5px;z-index:6;" +
      "max-height:62vh;overflow:auto}" +
      "#rcpMenu.on{display:flex}" +
      "#rcpMenu button{white-space:nowrap;border:1px solid rgba(140,160,255,.3);background:rgba(8,11,28,.95);" +
      "color:#eef1ff;border-radius:11px;padding:6px 10px;font-size:11.5px;font-family:inherit;cursor:pointer;" +
      "font-weight:700;text-align:start}" +
      "#rcpMenu button:hover{background:linear-gradient(135deg,#7c5cff,#22d3ee);color:#fff}" +
      "#rcpRestore{position:fixed;z-index:89;bottom:96px;inset-inline-end:12px;width:34px;height:34px;" +
      "border-radius:50%;border:1px solid rgba(140,160,255,.35);background:rgba(8,11,28,.9);color:#fff;" +
      "font-size:15px;cursor:pointer;display:none;place-items:center}" +
      "#rcpRestore.on{display:grid}" +
      "html.rshide #gninja{display:none!important}" +
      /* احساسات */
      "#gninja .mH,#gninja .mW,#gninja .brw{opacity:0;transition:opacity .16s}" +
      "#gninja .nEye{transform-box:fill-box;transform-origin:center;transition:transform .16s}" +
      "#gninja.emo-happy .mN{opacity:0}#gninja.emo-happy .mH{opacity:1}" +
      "#gninja.emo-happy .nEye{transform:scaleY(.3)}" +
      "#gninja.emo-wow .mN{opacity:0}#gninja.emo-wow .mW{opacity:1}" +
      "#gninja.emo-wow .nEye{transform:scale(1.3)}" +
      "#gninja.emo-angry .brw{opacity:1}#gninja.emo-angry .nEye{transform:scaleY(.65)}" +
      /* چراغ‌قوه */
      "#gninja .nLens{transition:fill .2s}" +
      "#gninja.torch-on .nLens{fill:#fff8c9}" +
      "#gninja.torch-on .nTorch{filter:drop-shadow(0 0 8px rgba(255,246,180,.95))}" +
      "#gninja.torch-on #njArm{animation:none!important}" +
      "#rcpTorch{position:fixed;inset:0;z-index:86;pointer-events:none;opacity:0;" +
      "transition:opacity .22s;will-change:opacity;" +
      "background:radial-gradient(circle 170px at var(--tx,50%) var(--ty,50%)," +
      "rgba(255,247,205,.16) 0%,rgba(255,247,205,.07) 45%," +
      "rgba(3,5,12,.55) 72%,rgba(3,5,12,.9) 100%)}" +
      "#rcpTorch.on{opacity:1}" +
      "@media(max-width:640px){#rcpTorch{background:radial-gradient(circle 115px at var(--tx,50%) var(--ty,50%)," +
      "rgba(255,247,205,.16) 0%,rgba(255,247,205,.07) 45%," +
      "rgba(3,5,12,.58) 74%,rgba(3,5,12,.92) 100%)}}" +
      "#rcpTorchBtn{position:fixed;z-index:96;width:40px;height:40px;border-radius:50%;font-size:18px;" +
      "display:none;place-items:center;background:rgba(12,16,32,.94);" +
      "border:1px solid rgba(189,238,99,.55);color:#eaffc4;cursor:pointer;padding:0}" +
      "#rcpTorchBtn.on{display:grid}" +
      "#rcpTorchBtn.act{background:#bdee63;color:#101426;box-shadow:0 0 16px rgba(189,238,99,.6)}" +
      /* تور و پرسش */
      "#rcpTour,#rcpAsk{position:fixed;z-index:97;inset-inline:12px;bottom:118px;" +
      "max-width:420px;margin:auto;display:none}" +
      "#rcpTour.on,#rcpAsk.on{display:block}" +
      "#rcpTour .card,#rcpAsk .card{background:rgba(10,14,32,.97);" +
      "border:1px solid rgba(189,238,99,.4);box-shadow:0 14px 34px rgba(0,0,0,.5)}" +
      ".rcplab-hi{outline:3px dashed #bdee63;outline-offset:3px;border-radius:14px}" +
      "#rcpAskIn{width:100%}" +
      "#rcpAskOut{font-size:12.5px;line-height:2}";
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
        closeMenu();
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

    function end() {
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
    say("دارم چرت می‌زنم… صدام کن 💤", 4200);
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

  /* ── ۴. احساسات ──────────────────────────────────────── */
  var emoT = null;
  R.npcEmo = function (s, ms) {
    var n = npc(); if (!n) return;
    n.classList.remove("emo-happy", "emo-angry", "emo-wow");
    if (s) n.classList.add("emo-" + s);
    clearTimeout(emoT);
    if (ms) emoT = setTimeout(function () {
      try { n.classList.remove("emo-" + s); } catch (e) {}
    }, ms);
  };

  /* ── ۵. واکنش به اعلان و کارها ──────────────────────── */
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
        R.npcEmo && R.npcEmo("happy", 1600);
        if (R.npcSay) R.npcSay(after > 1 ? (R.fa(after) + " اعلان جدید داری! 🔔") : "یه اعلان جدید داری! 🔔", 4200);
      }
      return out;
    };
  }

  var CHEER = ["آفرین! 🥷", "ایول! همین‌طور ادامه بده 🔥", "عالی بود! ✨", "داتِ‌بایو! 🥷"];
  function cheer(txt) {
    buzz();
    R.npcEmo && R.npcEmo("happy", 1500);
    say(txt || CHEER[Math.floor(Math.random() * CHEER.length)], 3200);
  }
  function bindToast() {
    if (!window.R || !R.toast || R._rcpToast) return;
    R._rcpToast = true;
    var prev = R.toast, last = 0;
    var KEYS = ["پست", "پرمیوم", "منتشر", "خوش آمدی", "لایک", "ذخیره شد", "امتیاز", "حساب"];
    R.toast = function (msg, kind) {
      var out = prev.apply(this, arguments);
      try {
        if (kind === "err") R.npcEmo && R.npcEmo("angry", 1500);
        else if (kind === "ok" && Date.now() - last > 9000) {
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

  function extrasHTML() {
    var h = '<button type="button" data-lab="search">🔎 جستجو</button>' +
            '<button type="button" data-lab="torch">🔦 چراغ‌قوه</button>' +
            '<button type="button" data-lab="ask">💬 بپرس</button>' +
            '<button type="button" data-lab="archive">🥷 آرشیو همراه</button>';
    if (R.isOwner && R.isOwner()) h += '<button type="button" data-lab="tour">🏁 تور سایت</button>';
    return h;
  }

  function buildMenu() {
    var d = el("rcpMenu"), n = npc();
    if (!d || !n) return;
    var h = LINKS.map(function (x) {
      return '<button type="button" data-rcpgo="' + x[2] + '">' + x[0] + " " + x[1] + "</button>";
    }).join("");
    if (window.R && R.isOwner && R.isOwner()) h += '<button type="button" data-rcpgo="owner">👑 پنل مالک</button>';
    if (window.R && R.isStaff && R.isStaff()) h += '<button type="button" data-rcpgo="team">🛡 شبکه فرماندهی</button>';
    h += extrasHTML();
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

  /* ── ۷. چراغ‌قوه ─────────────────────────────────────── */
  var T = { on: false, x: 0, y: 0, raf: 0, bound: false };

  function torchBox() {
    var t = el("rcpTorch");
    if (!t) {
      t = document.createElement("div");
      t.id = "rcpTorch";
      t.setAttribute("aria-hidden", "true");
      document.body.appendChild(t);
    }
    return t;
  }
  function torchPlace(x, y) {
    var t = el("rcpTorch");
    if (!t) return;
    t.style.setProperty("--tx", Math.round(x) + "px");
    t.style.setProperty("--ty", Math.round(y) + "px");
  }
  function torchFollow(e) {
    var p = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]) || e;
    if (!p || typeof p.clientX !== "number") return;
    T.x = p.clientX; T.y = p.clientY;
    if (T.raf) return;
    T.raf = requestAnimationFrame(function () { T.raf = 0; torchPlace(T.x, T.y); });
  }
  function torchBtn() {
    var b = el("rcpTorchBtn");
    if (b) return b;
    b = document.createElement("button");
    b.id = "rcpTorchBtn";
    b.type = "button";
    b.title = "چراغ‌قوه";
    b.setAttribute("aria-label", "چراغ‌قوه");
    b.textContent = "🔦";
    b.addEventListener("click", function (e) {
      e.preventDefault(); e.stopPropagation();
      toggleTorch();
    });
    document.body.appendChild(b);
    return b;
  }
  function showTorchBtn() {
    var n = npc(), b = torchBtn();
    if (n) {
      var r = n.getBoundingClientRect();
      b.style.left = Math.max(6, Math.round(r.left + r.width * 0.58)) + "px";
      b.style.right = "auto";
      b.style.top = Math.max(6, Math.round(r.top - 36)) + "px";
      b.style.bottom = "auto";
    } else {
      b.style.left = "auto";
      b.style.right = "18px";
      b.style.top = "auto";
      b.style.bottom = "180px";
    }
    b.classList.add("on");
    clearTimeout(showTorchBtn._t);
    showTorchBtn._t = setTimeout(function () { if (!T.on) b.classList.remove("on"); }, 9000);
  }
  function toggleTorch(v) {
    var t = torchBox(), n = npc(), b = torchBtn();
    T.on = (typeof v === "boolean") ? v : !T.on;
    t.classList.toggle("on", T.on);
    b.classList.toggle("act", T.on);
    if (n) n.classList.toggle("torch-on", T.on);
    if (T.on) {
      var r = n ? n.getBoundingClientRect()
        : { left: window.innerWidth - 130, top: window.innerHeight - 230, width: 80, height: 80 };
      T.x = r.left + r.width / 2; T.y = r.top + r.height / 2;
      torchPlace(T.x, T.y);
      if (!T.bound) {
        T.bound = true;
        window.addEventListener("pointermove", torchFollow, { passive: true });
        window.addEventListener("pointerdown", torchFollow, { passive: true });
        window.addEventListener("touchmove", torchFollow, { passive: true });
      }
      b.classList.add("on", "act");
      clearTimeout(showTorchBtn._t);
      showTorchBtn();
      R.npcEmo && R.npcEmo("wow", 1600);
      say("چراغ روشن شد 🔦 با انگشت یا ماوس نور را بچرخان", 3800);
    } else {
      b.classList.remove("act");
      say("چراغ خاموش شد 💡", 2200);
      showTorchBtn();
      R.npcEmo && R.npcEmo(null);
    }
  }
  R.npcTorch = toggleTorch;

  /* ── ۸. جستجو ───────────────────────────────────────── */
  function closeAsk() {
    var d = el("rcpAsk");
    if (d) d.classList.remove("on");
  }
  function openSearch(q) {
    q = String(q || "").trim();
    closeMenu();
    closeAsk();
    if (R.mod) R.mod("searchMod", true);
    setTimeout(function () {
      var inp = el("sqIn");
      if (inp) {
        try { inp.focus(); } catch (e) {}
        if (q) {
          inp.value = q;
          try { inp.dispatchEvent(new Event("input", { bubbles: true })); } catch (e) {}
          if (R.search) { try { R.search(q); } catch (e) {} }
        }
      }
      R.npcEmo && R.npcEmo("happy", 1100);
    }, 140);
    if (!el("searchMod") && R.toast) R.toast("بخش جستجو پیدا نشد", "err");
    say(q ? "دارم می‌گردم 🔍" : "دنبال چه می‌گردی؟ 🔍", 2600);
  }
  R.npcSearch = openSearch;

  /* ── ۹. تور شروع کار ─────────────────────────────────── */
  var STEPS = [
    { s: "#rail .ditem", t: "این منوی کناریه — از اینجا بین همه‌ی بخش‌ها جابه‌جا می‌شی 🧭" },
    { s: "#dock", t: "این نوار پایین برای حرکت سریع توی گوشیه 📱" },
    { s: '[data-go="bulletin"]', t: "اطلاعیه‌ها و تریلرها اینجا منتشر می‌شن 📣" },
    { s: '[data-go="market"]', t: "فروشگاه: آگهی بگذار یا کالا ببین 🛒" },
    { s: '[data-go="profile"]', t: "پروفایل و پیشرفتت اینجاست — ماموریت روزانه یادت نره 🏆" }
  ];
  var tour = { i: 0, on: false };

  function tourBox() {
    var d = el("rcpTour");
    if (d) return d;
    d = document.createElement("div");
    d.id = "rcpTour";
    d.innerHTML =
      '<div class="card">' +
        '<div class="between mb">' +
          '<span class="sm b">🏁 تور شروع کار</span>' +
          '<span class="xs cy" id="rcpTourN"></span>' +
        "</div>" +
        '<p class="sm" id="rcpTourT" style="line-height:2"></p>' +
        '<div class="row" style="gap:7px;margin-top:10px">' +
          '<button class="btn p mini" type="button" data-rcptour="next">بعدی ›</button>' +
          '<button class="btn mini" type="button" data-rcptour="skip">رد کن</button>' +
        "</div>" +
      "</div>";
    document.body.appendChild(d);
    return d;
  }
  function unhi() {
    var a = document.querySelectorAll(".rcplab-hi");
    for (var i = 0; i < a.length; i++) a[i].classList.remove("rcplab-hi");
  }
  function saveTour(v) {
    if (R.ME && R.upd) R.upd("users/" + R.ME, { tour: v }).catch(function () {});
  }
  function paintTour() {
    var s = STEPS[tour.i];
    if (!s) return endTour(true);
    unhi();
    var tg = document.querySelector(s.s);
    if (tg) {
      tg.classList.add("rcplab-hi");
      try { tg.scrollIntoView({ block: "center", behavior: lite() ? "auto" : "smooth" }); } catch (e) {}
    }
    var tt = el("rcpTourT"), nn = el("rcpTourN");
    if (tt) tt.textContent = s.t;
    if (nn) nn.textContent = num(tour.i + 1) + "/" + num(STEPS.length);
    say(s.t, 6000);
    R.npcEmo && R.npcEmo("happy", 1300);
  }
  function endTour(done) {
    tour.on = false;
    var b = el("rcpTour");
    if (b) b.classList.remove("on");
    unhi();
    saveTour(done ? 9 : 1);
  }
  function nextTour() {
    tour.i++;
    if (tour.i >= STEPS.length) {
      say("تور تموم شد — هر وقت سوال داشتی روی من بزن 🥷", 4600);
      R.npcEmo && R.npcEmo("happy", 2000);
      return endTour(true);
    }
    paintTour();
  }
  function startTour(force) {
    if (!R.ME) {
      if (force && R.toast) R.toast("برای دیدن تور اول وارد شو", "err");
      return;
    }
    if (!force && R.USER && R.USER.tour) return;
    tour.i = 0;
    tour.on = true;
    tourBox().classList.add("on");
    paintTour();
  }
  R.npcTour = startTour;

  /* ── ۱۰. بپرس (پاسخ پرتکرار) ─────────────────────────── */
  var FAQ = [
    { k: ["آگهی", "فروش", "محصول", "تبلیغ", "کالا"], go: "market", g: "برو به فروشگاه",
      a: "برای آگهی: فروشگاه → «ثبت آگهی»، عنوان و قیمت و عکس را پر کن و منتشر کن. خریدار مستقیم با تو تماس می‌گیرد." },
    { k: ["پرمیوم", "ویژه", "اشتراک", "پول"], go: "premium", g: "دیدن پرمیوم",
      a: "پرمیوم: نشان ویژه، رنگ نام، کاراکترهای بیشتر، ساخت گروه و قابلیت‌های ویژه 💎" },
    { k: ["پست", "نمی‌تونم", "اجازه", "خطا"], go: "community", g: "برو به انجمن",
      a: "برای پست و کامنت و چت باید وارد حساب باشی. اگر وارد شدی و نشد، یک‌بار صفحه را رفرش کن." },
    { k: ["قانون", "بن", "اخطار", "تخلف"], go: "", g: "",
      a: "بدون توهین، بدون اسپم، بدون تبلیغ بی‌ربط. تخلف = اخطار تا بن. متن کامل در فوتر → «قوانین انجمن»." },
    { k: ["اطلاعیه", "اعلان", "خبر", "تریلر"], go: "bulletin", g: "برو به اطلاعیه‌ها",
      a: "اطلاعیه‌ها و تریلرها از بخش «📣 اطلاعیه‌ها» منتشر می‌شن." },
    { k: ["چت", "گروه", "پیام"], go: "chat", g: "برو به چت",
      a: "چت عمومی و گروه‌ها از بخش «💬 چت»؛ پیام خصوصی از صندوق ورودی." },
    { k: ["سطح", "xp", "ماموریت", "جایزه", "دستاورد"], go: "progress", g: "پیشرفت من",
      a: "با پست، کامنت، چت و لایک XP می‌گیری. ماموریت روزانه در «🏆 پیشرفت من»." },
    { k: ["سبد", "خرید", "پرداخت", "سفارش"], go: "cart", g: "سبد خرید",
      a: "سبد خرید برای جمع‌کردن آگهی‌هاست؛ پرداخت آنلاین نداریم و هماهنگی با فروشنده انجام می‌شه." },
    { k: ["کاراکتر", "همراه", "اسکین", "چراغ"], go: "settings", g: "تنظیمات",
      a: "اسکین همراه را از «تنظیمات → آرشیو همراه» عوض کن. چراغ‌قوه هم از منوی خودم می‌آید 🔦" }
  ];

  function askBox() {
    var d = el("rcpAsk");
    if (d) return d;
    d = document.createElement("div");
    d.id = "rcpAsk";
    d.innerHTML =
      '<div class="card">' +
        '<div class="between mb">' +
          '<span class="sm b">💬 بپرس یا جستجو کن</span>' +
          '<button class="icobtn" type="button" data-rcpask="close">✕</button>' +
        "</div>" +
        '<input class="inp" id="rcpAskIn" placeholder="مثلاً: چطور آگهی بگذارم؟">' +
        '<div class="row" style="gap:6px;flex-wrap:wrap;margin:9px 0">' +
          '<button class="btn mini" type="button" data-rcpaskq="آگهی">🛒 آگهی</button>' +
          '<button class="btn mini" type="button" data-rcpaskq="پرمیوم">💎 پرمیوم</button>' +
          '<button class="btn mini" type="button" data-rcpaskq="قوانین">📜 قوانین</button>' +
        "</div>" +
        '<div id="rcpAskOut"></div>' +
      "</div>";
    document.body.appendChild(d);
    var i = el("rcpAskIn");
    if (i) i.addEventListener("keydown", function (e) {
      if (e.key === "Enter") { e.preventDefault(); ask(i.value); }
    });
    return d;
  }
  function askOpen(v) {
    var d = askBox();
    closeMenu();
    d.classList.add("on");
    var i = el("rcpAskIn");
    if (i) setTimeout(function () { try { i.focus(); } catch (e) {} }, 60);
    if (v) ask(v);
  }
  function out(html, go, label) {
    var o = el("rcpAskOut");
    if (!o) return;
    o.innerHTML = '<div class="sm" style="line-height:2">' + html + "</div>" +
      (go ? '<button class="btn p mini mt" type="button" data-rcpgo2="' + go + '">' + esc(label) + "</button>" : "");
  }
  function goSec(s) {
    if (!s) return;
    if (document.getElementById("sec-" + s) && R.go) { R.go(s); closeAsk(); return; }
    if (R.toast) R.toast("این بخش در دسترس نیست", "err");
  }
  function ask(q) {
    q = String(q || "").trim();
    if (!q) return;
    var l = q.toLowerCase(), hit = null;
    for (var i = 0; i < FAQ.length && !hit; i++) {
      var f = FAQ[i];
      for (var j = 0; j < f.k.length; j++) {
        if (l.indexOf(String(f.k[j]).toLowerCase()) > -1) { hit = f; break; }
      }
    }
    if (hit) {
      out(esc(hit.a), hit.go, hit.g);
      R.npcEmo && R.npcEmo("happy", 1300);
      say("پیداش کردم 👇", 2600);
      return;
    }
    out("این را نمی‌شناسم، جستجوی سایت را برایت باز می‌کنم 🔍", "", "");
    openSearch(q);
  }
  R.npcAsk = ask;

  /* ── ۱۱. مخفی / نمایش ───────────────────────────────── */
  function applyHide(v) {
    document.documentElement.classList.toggle("rshide", !!v);
    var b = el("rcpRestore");
    if (b) b.classList.toggle("on", !!v);
    try { v ? localStorage.setItem(LS_HIDE, "1") : localStorage.removeItem(LS_HIDE); } catch (e) {}
    if (v) { closeMenu(); closeAsk(); if (T.on) toggleTorch(false); }
  }
  function restoreBtn() {
    if (el("rcpRestore")) return;
    var b = document.createElement("button");
    b.id = "rcpRestore"; b.type = "button"; b.title = "نمایش همراه"; b.textContent = "🥷";
    b.addEventListener("click", function () { applyHide(false); });
    document.body.appendChild(b);
  }

  /* ── ۱۲. سلام شخصی و راهنمای بخش‌ها ─────────────────── */
  function greet() {
    if (!window.R || !R.USER || !R.npcSay) return;
    var nm = R.USER.name || "";
    var lv = (R.level && R.fa) ? R.fa(R.level(R.USER.xp || 0)) : "";
    R.npcSay("سلام " + nm + "! " + (lv ? "سطح " + lv + " — " : "") + "بریم جلو 🥷", 5200);
  }
  function tips() {
    if (!window.R || !R.NPC_TIPS) return;
    var T2 = {
      bulletin: "اینجا اطلاعیه، تریلر و اعلان پخش است 📣",
      groups: "گروه‌های چت — با پرمیوم یا اجازه مالک بساز 🏯",
      team: "شبکه فرماندهی — فقط تیم 👑 می‌بیند 🛡",
      ads: "از اینجا آگهی بساز 📢",
      myworld: "دنیای من 🧭",
      inbox: "صندوق پیام‌هایت 📥",
      archive: "آرشیو همراه — شخصیت‌های ویژه 🎭",
      progress: "پیشرفت و دستاوردهات 🏅"
    };
    Object.keys(T2).forEach(function (k) { if (!R.NPC_TIPS[k]) R.NPC_TIPS[k] = T2[k]; });
  }

  /* ── ۱۳. کلیک‌ها ────────────────────────────────────── */
  document.addEventListener("click", function (e) {
    var t = e.target;
    if (!t || !t.closest) return;

    if (t.closest("#rcpRestore")) { e.preventDefault(); return applyHide(false); }
    if (t.closest("#rcpHide")) { e.preventDefault(); e.stopPropagation(); return applyHide(true); }

    /* آیتم‌های خودمان */
    var lb = t.closest("[data-lab]");
    if (lb) {
      e.preventDefault();
      e.stopPropagation();
      var k = lb.getAttribute("data-lab");
      closeMenu();
      if (k === "torch") toggleTorch();
      else if (k === "search") openSearch("");
      else if (k === "ask") askOpen();
      else if (k === "tour") startTour(true);
      else if (k === "archive" && R.go) R.go("archive");
      return;
    }

    /* تور و پرسش */
    var tb = t.closest("[data-rcptour]");
    if (tb) {
      e.preventDefault();
      if (tb.getAttribute("data-rcptour") === "skip") endTour(false);
      else nextTour();
      return;
    }
    var ab = t.closest("[data-rcpask]");
    if (ab) { e.preventDefault(); return closeAsk(); }
    var aq = t.closest("[data-rcpaskq]");
    if (aq) { e.preventDefault(); return ask(aq.getAttribute("data-rcpaskq")); }
    var ag = t.closest("[data-rcpgo2]");
    if (ag) { e.preventDefault(); return goSec(ag.getAttribute("data-rcpgo2")); }

    /* منو */
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

    /* دکمهٔ شناور چراغ‌قوه */
    var b = el("rcpTorchBtn");
    if (b && b.classList.contains("on") && !T.on &&
        !t.closest("#rcpTorchBtn") && !t.closest("#gninja")) {
      b.classList.remove("on");
    }

    /* خود کاراکتر */
    if (t.closest("#gninja")) {
      if (ST.moved) { ST.moved = false; return; }
      e.preventDefault();
      showTorchBtn();
      return toggleMenu();
    }

    if (t.closest("#rcpAsk")) return;
    closeMenu();
    closeAsk();
  }, true);

  /* Esc همه‌چیز را می‌بندد */
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (T.on) { toggleTorch(false); return; }
    closeAsk();
    closeMenu();
  });

  /* ── ۱۴. راه‌اندازی ─────────────────────────────────── */
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
      setTimeout(function () {
        boot();
        restorePos();
        greet();
        if (R.USER && !R.USER.tour) setTimeout(function () { startTour(false); }, 6000);
      }, 900);
    };
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  [700, 1600, 3000, 5200].forEach(function (ms) { setTimeout(boot, ms); });
})();
