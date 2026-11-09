/* ═══════════════════════════════════════════════════════════════
   RONIN STORE — OFFLINE + GAME · ronin-offline.js · v2
   ───────────────────────────────────────────────────────────────
   • صفحهٔ «آفلاین» با تم رونین (نوار بالا + کارت وسط)
   • بازی «شوریکن رانر ۲»: دوندهٔ نئونی، پرش واقعی روی مانع‌ها،
     کمبو، شوریکن قابل پرتاب و جلوه‌های نئونی
   • رکورد در localStorage • صدا با WebAudio • کنترل کیبورد و لمس
   • بدون وابستگی به R — روی offline.html هم کار می‌کند
   ═══════════════════════════════════════════════════════════════ */
"use strict";
(function () {
  if (window.__roninOff) return;
  window.__roninOff = true;

  /* ⚠ سیاست ذخیره‌سازی: رکورد بازی هیچ‌وقت به فایربیس/سرور فرستاده نمی‌شود.
     فقط دو کلید در حافظهٔ همین مرورگر (localStorage) نگه داشته می‌شود:
       ronin_hi   → بهترین امتیاز روی همین دستگاه
       ronin_mute → وضعیت صدا
     اگر مرورگر اجازه ندهد (حالت ناشناس/مسدود)، امتیاز فقط در حافظهٔ همین اجرا می‌ماند. */
  var HI = "ronin_hi", MUTE = "ronin_mute";
  var G = {
    on: false, over: false, paused: false, score: 0, best: 0, speed: 1,
    t: 0, ob: [], coins: [], parts: [], dust: [], shake: 0, night: 0,
    raf: 0, last: 0, started: false, mute: false, dpr: 1,
    combo: 0, comboT: 0, got: 0, ammo: 2, shots: [], cooldown: 0,
    jumpBuf: 0, groundT: 0, flash: 0, pop: 0
  };
  var P = { x: 92, y: 0, vy: 0, w: 38, h: 58, duck: false, jumps: 0, run: 0, sq: 0, spinT: 0 };

  function el(i) { return document.getElementById(i); }
  function num(n) { return String(Math.floor(n)).replace(/[0-9]/g, function (d) { return "۰۱۲۳۴۵۶۷۸۹"[d]; }); }
  function ls(k, d) { try { var v = localStorage.getItem(k); return v == null ? d : v; } catch (e) { return d; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  /* ── ۱. استایل ──────────────────────────────────────────── */
  function css() {
    if (el("rnOffCss")) return;
    var s = document.createElement("style");
    s.id = "rnOffCss";
    s.textContent = [
      ".rnNet{position:fixed;z-index:100000;inset-inline:8px;bottom:calc(76px + env(safe-area-inset-bottom));" +
        "flex-wrap:wrap;align-items:center;gap:7px;padding:10px;border-radius:16px;" +
        "font-family:inherit;background:linear-gradient(135deg,#ffd66b,#ffb03a 45%,#ff5470);" +
        "box-shadow:0 18px 44px -18px rgba(255,84,112,.95),inset 0 0 0 1px rgba(255,255,255,.2);" +
        "display:none}",
      ".rnNet.on{display:flex;animation:rnNetIn .32s cubic-bezier(.16,1,.3,1) both}",
      "@keyframes rnNetIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}",
      ".rnNet>span{flex:1 1 100%;font-size:11.5px;font-weight:900;color:#1a0b12;letter-spacing:.1px}",
      ".rnNet button{cursor:pointer;border:0;border-radius:11px;padding:0 12px;min-height:40px;" +
        "font-family:inherit;font-size:12px;font-weight:900;color:#1a0b12;background:rgba(0,0,0,.14)}",
      ".rnNet button[data-rn=play]{flex:1 1 auto;color:#8fe9ff;background:linear-gradient(135deg,#0b1022,#1b2a55);" +
        "box-shadow:0 10px 22px -12px #000}",
      ".rnNet button:active{transform:scale(.96)}",
      "@media(min-width:701px){.rnNet{inset-inline:auto;inset-inline-end:14px;bottom:14px;max-width:380px}}",

      "#rnOff{position:fixed;inset:0;z-index:9200;display:none;flex-direction:column;" +
        "font-family:inherit;color:#e9edff;" +
        "background:radial-gradient(120% 90% at 100% 0%,rgba(255,84,112,.16),transparent 60%)," +
        "radial-gradient(90% 80% at 0% 100%,rgba(124,92,255,.16),transparent 62%),rgba(4,6,15,.985);" +
        "backdrop-filter:blur(6px)}",
      "#rnOff.on{display:flex;animation:rnOffIn .3s ease both}",
      "@keyframes rnOffIn{from{opacity:0}to{opacity:1}}",

      "#rnOff .rnTop{display:flex;align-items:center;gap:8px;padding:11px 12px;" +
        "border-bottom:1px solid rgba(150,160,255,.16);background:rgba(8,10,24,.7)}",
      "#rnOff .rnTop b{font-size:12.5px;letter-spacing:.2px}",
      "#rnOff .rnTop .st{display:inline-flex;align-items:center;gap:5px;padding:3px 9px;border-radius:99px;" +
        "font-size:9.5px;font-weight:800;background:rgba(255,84,112,.16);" +
        "border:1px solid rgba(255,120,150,.35);color:#ffc2ce}",
      "#rnOff .rnTop .st i{width:5px;height:5px;border-radius:50%;background:#ff5470;box-shadow:0 0 8px #ff5470}",
      "#rnOff .rnTop .sp{flex:1}",
      "#rnOff .ico{width:34px;height:34px;border-radius:11px;display:grid;place-items:center;cursor:pointer;" +
        "font-size:14px;padding:0;color:#dfe6ff;border:1px solid rgba(150,170,255,.24);" +
        "background:rgba(255,255,255,.06);transition:.18s}",
      "#rnOff .ico:hover{border-color:#8fe9ff;color:#fff}",
      "#rnOff .ico:active{transform:scale(.94)}",

      "#rnOff{overflow:hidden}",
      "#rnOff .rnBody{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;" +
        "gap:14px;padding:14px;overflow:auto;overscroll-behavior:contain;min-width:0}",
      "#rnOff .rnBody>*{flex-shrink:0}",
      "#rnOff .rnIntro{text-align:center;max-width:520px}",
      "#rnOff .rnIntro h2{margin:0 0 6px;font-size:19px;font-weight:900;" +
        "background:linear-gradient(90deg,#fff,#8fe9ff 60%,#ffb03a);" +
        "-webkit-background-clip:text;background-clip:text;color:transparent}",
      "#rnOff .rnIntro p{margin:0;font-size:12px;line-height:1.9;color:#aab3d6}",
      "#rnOff .rnRow{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-top:12px}",
      "#rnOff .rnBtn{cursor:pointer;font-family:inherit;font-size:12px;font-weight:900;padding:10px 18px;" +
        "border-radius:13px;border:1px solid rgba(150,170,255,.3);color:#e9edff;background:rgba(255,255,255,.07);" +
        "transition:.18s}",
      "#rnOff .rnBtn:hover{transform:translateY(-1px);border-color:#8fe9ff}",
      "#rnOff .rnBtn.p{color:#06101f;border:0;background:linear-gradient(135deg,#8fe9ff,#7c5cff);" +
        "box-shadow:0 14px 30px -14px rgba(124,92,255,.95)}",

      "#rnOff .rnStage{position:relative;width:100%;max-width:760px;flex:1;min-height:230px;" +
        "border-radius:20px;overflow:hidden;border:1px solid rgba(150,170,255,.22);" +
        "background:#070a16;box-shadow:0 30px 70px -44px rgba(0,0,0,.95),inset 0 0 40px rgba(0,0,0,.6)}",
      "#rnOff canvas{display:block;width:100%;height:100%;touch-action:none}",
      "#rnOff .rnHud{position:absolute;inset:8px 10px auto 10px;display:flex;gap:8px;align-items:center;" +
        "pointer-events:none;font-size:11px;font-weight:900}",
      "#rnOff .rnHud span{padding:4px 10px;border-radius:99px;background:rgba(6,10,24,.6);" +
        "border:1px solid rgba(150,170,255,.22);color:#dfe7ff}",
      "#rnOff .rnHud .sp{flex:1}",
      "#rnOff .rnHud .combo{color:#ffd66b;border-color:rgba(255,176,58,.55);" +
        "background:rgba(50,25,4,.75);box-shadow:0 0 14px rgba(255,176,58,.18)}",
      "#rnOff .rnHud .combo.off{display:none}",
      "#rnOff .rnHud .ammo{color:#8fe9ff;border-color:rgba(143,233,255,.32)}",
      "#rnOff .rnCtr{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;" +
        "justify-content:center;gap:10px;text-align:center;padding:16px;" +
        "background:radial-gradient(80% 80% at 50% 40%,rgba(6,9,22,.55),rgba(6,9,22,.9))}",
      "#rnOff .rnCtr.hide{display:none}",
      "#rnOff .rnCtr h3{margin:0;font-size:16px;font-weight:900}",
      "#rnOff .rnCtr .s{font-size:11px;color:#aab3d6;line-height:1.9}",
      "#rnOff .rnPads{display:flex;gap:8px;justify-content:center;padding:8px 10px 10px}",
      "#rnOff .rnPad{flex:1;max-width:200px;height:46px;border-radius:14px;cursor:pointer;font-family:inherit;" +
        "font-size:13px;font-weight:900;color:#e9edff;border:1px solid rgba(150,170,255,.24);" +
        "background:rgba(255,255,255,.06);user-select:none;-webkit-user-select:none}",
      "#rnOff .rnPad:active{background:rgba(124,92,255,.28)}",
      "#rnOff .rnPad.throw{color:#ffd66b;border-color:rgba(255,176,58,.42);" +
        "background:linear-gradient(135deg,rgba(255,176,58,.12),rgba(255,84,112,.08))}",
      "#rnOff .rnPad.throw:active{background:rgba(255,176,58,.28)}",
      "#rnOff .rnTip{font-size:10px;color:#8f9ac0;text-align:center;padding:0 12px 10px}",
      "@media(max-width:560px){#rnOff .rnBody{padding:10px;gap:10px}#rnOff .rnIntro h2{font-size:16px}" +
        "#rnOff .rnPads{gap:6px}#rnOff .rnPad{font-size:11.5px;padding:0 4px}}",
      "@media(prefers-reduced-motion:reduce){#rnOff.on{animation:none}}",
      "body.rnNoScroll{overflow:hidden!important}"
    ].join("\n");
    document.head.appendChild(s);
  }

  /* ── ۲. نوار وضعیت شبکه ─────────────────────────────────── */
  function banner() {
    var b = el("rnNet");
    if (!b) {
      b = document.createElement("div");
      b.id = "rnNet";
      b.className = "rnNet";
      b.innerHTML = '<span>📴 آفلاین شدی — وقت بازی است</span>' +
        '<button type="button" data-rn="play">🎮 بازی کن</button>' +
        '<button type="button" data-rn="retry">↺ تلاش</button>' +
        '<button type="button" data-rn="x">✕</button>';
      document.body.appendChild(b);
    }
    return b;
  }
  function netPaint() {
    var b = banner();
    var off = navigator.onLine === false;
    b.classList.toggle("on", off && !G.on);
    document.body.style.paddingTop = "";
  }

  /* ── ۳. سازندهٔ صفحه ────────────────────────────────────── */
  function build() {
    var o = el("rnOff");
    if (o) return o;
    o = document.createElement("div");
    o.id = "rnOff";
    o.innerHTML =
      '<div class="rnTop">' +
        '<b>🥷 شوریکن رانر</b>' +
        '<span class="st"><i></i>آفلاین</span>' +
        '<span class="sp"></span>' +
        '<button class="ico" type="button" data-rn="pause" title="توقف">⏸</button>' +
        '<button class="ico" type="button" data-rn="sound" title="صدا">🔊</button>' +
        '<button class="ico" type="button" data-rn="close" title="بستن">✕</button>' +
      "</div>" +
      '<div class="rnBody">' +
        '<div class="rnIntro">' +
          "<h2>اینترنت قطع شده — وقت بازی است</h2>" +
          "<p>با فاصله/↑ بپر، دوبار بپر تا دوبل‌جامپ بزنی، با ↓ سر خم کن و با X شوریکن پرتاب کن. " +
          "روی مانع‌ها بپر، سکه‌ها را بگیر و تا جای ممکن زنده بمان.</p>" +
          '<div class="rnRow">' +
            '<button class="rnBtn p" type="button" data-rn="start">شروع بازی 🎮</button>' +
            '<button class="rnBtn" type="button" data-rn="retry">↺ اتصال را چک کن</button>' +
          "</div>" +
        "</div>" +
        '<div class="rnStage">' +
          '<canvas id="rnCv"></canvas>' +
          '<div class="rnHud"><span id="rnScore">امتیاز ۰</span><span id="rnBest">رکورد ۰</span>' +
            '<span class="sp"></span><span id="rnCombo" class="combo off">×۲</span>' +
            '<span id="rnAmmo" class="ammo">🌀 ۲</span></div>' +
          '<div class="rnCtr" id="rnCtr"><h3>آماده‌ای؟</h3>' +
            '<div class="s">فاصله یا ↑ = پرش • ↓ = خم • X = شوریکن • P = توقف</div>' +
            '<button class="rnBtn p" type="button" data-rn="start">شروع</button></div>' +
        "</div>" +
        '<div class="rnPads">' +
          '<button class="rnPad" type="button" data-rn="jump">⬆ پرش</button>' +
          '<button class="rnPad throw" type="button" data-rn="throw">🌀 شوریکن</button>' +
          '<button class="rnPad" type="button" data-rn="duck">⬇ خم</button>' +
        "</div>" +
        '<div class="rnTip">رکوردت همین‌جا روی گوشی ذخیره می‌شود — بدون اینترنت هم کار می‌کند.</div>' +
      "</div>";
    document.body.appendChild(o);
    return o;
  }

  /* ── ۴. موتور بازی ──────────────────────────────────────── */
  var cv, cx, W, H, GY;

  function size() {
    if (!cv) return;
    var r = cv.getBoundingClientRect();
    G.dpr = Math.min(2, window.devicePixelRatio || 1);
    W = Math.max(260, Math.floor(r.width));
    H = Math.max(180, Math.floor(r.height));
    cv.width = Math.floor(W * G.dpr);
    cv.height = Math.floor(H * G.dpr);
    cx = cv.getContext("2d");
    cx.setTransform(G.dpr, 0, 0, G.dpr, 0, 0);
    GY = H - Math.max(46, H * 0.18);
    P.y = GY - P.h;
  }

  function reset() {
    G.ob = []; G.coins = []; G.parts = []; G.dust = []; G.shots = [];
    G.score = 0; G.speed = 1; G.t = 0; G.over = false; G.paused = false;
    G.shake = 0; G.night = 0; G.started = true;
    G.combo = 0; G.comboT = 0; G.got = 0; G.ammo = 2; G.cooldown = 0;
    G.jumpBuf = 0; G.groundT = 0; G.flash = 0; G.pop = 0;
    P.y = GY - P.h; P.vy = 0; P.duck = false; P.jumps = 0;
    P.sq = 0; P.spinT = 0;
    spawn(0);
    hud();
    var c = el("rnCtr"); if (c) c.classList.add("hide");
  }

  function spawn(extra) {
    var gap = Math.max(270, 480 - G.score * 0.045 - Math.random() * 120) + (extra || 0);
    var lastX = G.ob.length ? Math.max.apply(null, G.ob.map(function (o) { return o.x; })) : W;
    var x = Math.max(W + 40, lastX + gap);
    var fly = Math.random() < 0.38 && G.score > 120;
    if (fly) {
      var lvl = Math.random() < 0.5 ? 0 : 1;
      G.ob.push({ x: x, y: GY - (lvl ? 96 : 46), w: 30, h: 30, fly: 1, spin: 0 });
    } else {
      var tall = Math.random() < 0.32 ? 1 : 0;
      G.ob.push({ x: x, y: GY - (tall ? 58 : 38), w: tall ? 26 : 20, h: tall ? 58 : 38, fly: 0 });
    }
    if (Math.random() < 0.55) {
      G.coins.push({ x: x + 120 + Math.random() * 160, y: GY - (60 + Math.random() * 90), r: 7, got: 0 });
    }
  }

  function dustPuff(n, air) {
    for (var i = 0; i < n; i++) {
      G.dust.push({ x: P.x + P.w / 2, y: air ? P.y + P.h : GY,
        vx: (Math.random() - 0.5) * 200, vy: -Math.random() * (air ? 150 : 100),
        life: 0.5, max: 0.5, r: 2 + Math.random() * 2.4 });
    }
  }

  function isGrounded() { return P.y >= GY - P.h - 0.75; }

  function doJump(ground) {
    if (ground) {
      P.vy = -985; P.jumps = 1; P.duck = false; P.sq = 0;
      G.groundT = -1; G.jumpBuf = 0;
      beep(540, 0.05);
      dustPuff(10, false);
    } else {
      P.vy = -860; P.jumps = 2; P.duck = false; P.spinT = 0.44;
      G.jumpBuf = 0;
      beep(780, 0.05);
      dustPuff(13, true);
    }
  }

  function jump() {
    if (!G.on || G.paused) return;
    if (!G.started || G.over) { if (G.over) { reset(); } else { start(); } return; }
    var coyote = G.groundT >= 0 && G.t - G.groundT < 0.11;
    if (isGrounded() || coyote) {
      doJump(true);
    } else if (P.jumps < 2) {
      doJump(false);
    } else {
      /* اگر وسط هوا دیر زدی، پرش را برای فرود نگه دار */
      G.jumpBuf = 0.14;
    }
  }
  function cutJump() { if (P.vy < -300) P.vy *= 0.56; }

  function duck(on) {
    if (!G.started || G.over || G.paused) return;
    P.duck = !!on && isGrounded();
  }

  function playerBox() {
    var ph = P.duck ? 30 : P.h;
    var top = P.duck ? P.y + (P.h - ph) : P.y;
    return { x: P.x + 5, y: top + 3, w: P.w - 10, h: ph - 4 };
  }

  function hit(o) {
    var b = playerBox();
    return b.x + b.w > o.x + 4 && b.x < o.x + o.w - 4 &&
      b.y + b.h > o.y + 3 && b.y < o.y + o.h - 3;
  }

  function throwShuriken() {
    if (!G.on || !G.started || G.over || G.paused || G.cooldown > 0) return;
    if (G.ammo <= 0) { G.cooldown = 0.2; beep(160, 0.06, "sawtooth"); return; }
    G.ammo--; G.cooldown = 0.18;
    G.shots.push({
      x: P.x + P.w + 4,
      y: P.y + (P.duck ? 20 : P.h * 0.46),
      spin: 0, life: 1.7
    });
    beep(1180, 0.04, "triangle");
    dustPuff(4, true);
    hud();
  }

  function die() {
    if (G.over) return;
    G.over = true;
    G.shake = 1;
    G.combo = 0; G.comboT = 0; G.shots = []; G.jumpBuf = 0;
    beep(150, 0.25, "sawtooth");
    for (var i = 0; i < 26; i++) {
      G.parts.push({ x: P.x + P.w / 2, y: GY - P.h / 2, vx: (Math.random() - 0.5) * 420,
        vy: (Math.random() - 0.6) * 420, life: 0.9, max: 0.9, r: 2 + Math.random() * 3 });
    }
    var best = parseInt(ls(HI, "0"), 10) || 0;
    if (G.score > best) { lsSet(HI, String(Math.floor(G.score))); best = Math.floor(G.score); }
    G.best = best;
    var c = el("rnCtr");
    if (c) {
      c.classList.remove("hide");
      c.innerHTML = "<h3>باختی — " + num(G.score) + " امتیاز</h3>" +
        '<div class="s">رکورد تو: ' + num(best) + " • برای شروع دوباره بزن</div>" +
        '<button class="rnBtn p" type="button" data-rn="start">دوباره 🔁</button>';
    }
    hud();
  }

  function update(dt) {
    if (!G.started || G.over || G.paused) return;
    G.t += dt;
    G.score += dt * 60 * G.speed;
    G.speed = Math.min(2.7, 1 + G.score / 1400);
    G.night = (Math.sin(G.score / 900) + 1) / 2;
    if (G.cooldown > 0) G.cooldown = Math.max(0, G.cooldown - dt);
    if (G.jumpBuf > 0) G.jumpBuf = Math.max(0, G.jumpBuf - dt);
    if (G.comboT > 0) { G.comboT -= dt; if (G.comboT <= 0) G.combo = 0; }
    if (G.flash > 0) G.flash = Math.max(0, G.flash - dt * 4);
    if (G.pop > 0) G.pop = Math.max(0, G.pop - dt * 4);

    if (isGrounded()) G.groundT = G.t;
    P.vy += 2600 * dt;
    P.y += P.vy * dt;
    if (P.y >= GY - P.h) {
      if (P.vy > 150) P.sq = 1;                       /* فرود: اسکواش */
      P.y = GY - P.h; P.vy = 0; P.jumps = 0; G.groundT = G.t;
      if (G.jumpBuf > 0) { G.jumpBuf = 0; doJump(true); }
    }
    if (P.spinT > 0) P.spinT = Math.max(0, P.spinT - dt);
    if (P.sq > 0) P.sq = Math.max(0, P.sq - dt * 4.2);
    P.run += dt * (6 + G.speed * 4);
    if (P.jumps === 0 && Math.random() < 0.16) {
      G.dust.push({ x: P.x + 4, y: GY, vx: -40 - Math.random() * 70, vy: -20 - Math.random() * 40,
        life: 0.4, max: 0.4, r: 1.4 + Math.random() * 2 });
    }

    var px = 300 * dt * G.speed;
    var i, j, o;
    for (i = 0; i < G.ob.length; i++) {
      o = G.ob[i];
      o.x -= px + dt * 40;
      if (o.fly) o.spin += dt * 9;
      if (hit(o)) return die();
    }
    G.ob = G.ob.filter(function (x) { return x.x > -80; });
    var last = G.ob.length ? Math.max.apply(null, G.ob.map(function (x) { return x.x; })) : 0;
    if (last < W - 120 || !G.ob.length) spawn(0);

    /* شوریکن‌های پرتابی: مانع اول را می‌شکنند */
    for (i = G.shots.length - 1; i >= 0; i--) {
      var s = G.shots[i];
      s.x += 980 * dt;
      s.spin += dt * 28;
      s.life -= dt;
      var boom = false;
      for (j = G.ob.length - 1; j >= 0; j--) {
        o = G.ob[j];
        if (s.x + 11 > o.x && s.x - 11 < o.x + o.w &&
            s.y + 9 > o.y && s.y - 9 < o.y + o.h) {
          G.ob.splice(j, 1);
          boom = true;
          G.score += 18;
          beep(230, 0.08, "sawtooth");
          for (var q = 0; q < 12; q++) {
            G.parts.push({ x: s.x, y: s.y, vx: (Math.random() - 0.5) * 260,
              vy: (Math.random() - 0.6) * 260, life: 0.5, max: 0.5,
              r: 1.5 + Math.random() * 2.5 });
          }
          break;
        }
      }
      if (boom || s.x > W + 40 || s.life <= 0) G.shots.splice(i, 1);
    }

    for (i = 0; i < G.coins.length; i++) {
      var c = G.coins[i];
      c.x -= px;
      c.spin = (c.spin || 0) + dt * 6;
      var dx = (P.x + P.w / 2) - c.x;
      var dy = (P.y + (P.duck ? 15 : P.h / 2)) - c.y;
      if (dx * dx + dy * dy < (c.r + 24) * (c.r + 24) && !c.got) {
        c.got = 1;
        G.got++;
        G.combo = Math.min(5, G.combo + 1);
        G.comboT = 2.6;
        G.score += 25 * G.combo;
        G.pop = 1; G.flash = Math.max(G.flash, 0.22);
        beep(760 + G.combo * 90, 0.06);
        if (G.got % 4 === 0 && G.ammo < 3) {
          G.ammo++;
          beep(1250, 0.08, "triangle");
        }
      }
    }
    G.coins = G.coins.filter(function (x) { return x.x > -40 && !x.got; });

    G.dust = G.dust.filter(function (d) {
      d.life -= dt; d.x += d.vx * dt; d.y += d.vy * dt; d.vy += 320 * dt; return d.life > 0;
    });
    G.parts = G.parts.filter(function (d) {
      d.life -= dt; d.x += d.vx * dt; d.y += d.vy * dt; d.vy += 620 * dt; return d.life > 0;
    });
    if (G.shake > 0) G.shake = Math.max(0, G.shake - dt * 2.2);
    hud();
  }

  function hud() {
    var a = el("rnScore"), b = el("rnBest"), c = el("rnCombo"), d = el("rnAmmo");
    if (a) a.textContent = "امتیاز " + num(G.score);
    if (b) b.textContent = "رکورد " + num(Math.max(G.best, G.score));
    if (c) {
      c.textContent = "×" + num(Math.min(5, G.combo));
      c.classList.toggle("off", G.combo < 2);
    }
    if (d) d.textContent = "🌀 " + num(G.ammo);
  }

  /* ── ۵. نقاشی ───────────────────────────────────────────── */
  function draw() {
    if (!cx) return;
    var sh = G.shake ? (Math.random() - 0.5) * 10 * G.shake : 0;
    cx.save();
    cx.clearRect(0, 0, W, H);
    cx.translate(sh, sh * 0.6);

    /* آسمان */
    var n = G.night;
    var sky = cx.createLinearGradient(0, 0, 0, GY);
    sky.addColorStop(0, n > 0.5 ? "#0a1030" : "#101a44");
    sky.addColorStop(1, n > 0.5 ? "#1a0f28" : "#2a1240");
    cx.fillStyle = sky; cx.fillRect(0, 0, W, GY + 2);

    /* ماه نئونی */
    var moonX = W * 0.76, moonY = Math.max(42, GY * 0.25);
    var mg = cx.createRadialGradient(moonX, moonY, 4, moonX, moonY, 62);
    mg.addColorStop(0, "rgba(255,255,255,.30)");
    mg.addColorStop(0.38, "rgba(143,233,255,.13)");
    mg.addColorStop(1, "rgba(143,233,255,0)");
    cx.fillStyle = mg;
    cx.beginPath(); cx.arc(moonX, moonY, 62, 0, 7); cx.fill();
    cx.fillStyle = "rgba(230,240,255,.13)";
    cx.beginPath(); cx.arc(moonX, moonY, 27, 0, 7); cx.fill();

    /* ستاره‌ها */
    cx.fillStyle = "rgba(220,230,255,.55)";
    for (var i = 0; i < 34; i++) {
      var sx = ((i * 97) % W) - (G.t * (8 + (i % 5) * 4)) % W;
      if (sx < 0) sx += W;
      var sy = (i * 53) % Math.max(60, GY - 40);
      cx.globalAlpha = 0.25 + ((i % 4) * 0.16);
      cx.fillRect(sx, sy, 2, 2);
    }
    cx.globalAlpha = 1;

    /* شهر دور دوم، با پارالاکس آرام‌تر */
    var off2 = (G.t * 9) % 170;
    cx.fillStyle = "rgba(18,22,56,.55)";
    for (var f = -1; f < W / 130 + 2; f++) {
      var fx = f * 130 - off2;
      var fh = 48 + ((f + 2) % 5) * 20;
      cx.fillRect(fx, GY - fh, 92, fh);
      cx.fillStyle = "rgba(255,176,58,.10)";
      for (var fq = 0; fq < 2; fq++) cx.fillRect(fx + 14 + fq * 26, GY - fh + 14, 6, 4);
      cx.fillStyle = "rgba(18,22,56,.55)";
    }

    /* شهر دور */
    cx.fillStyle = "rgba(10,14,36,.85)";
    var off = (G.t * 18) % 120;
    for (var k = -1; k < W / 90 + 2; k++) {
      var bx = k * 90 - off;
      var bh = 30 + ((k + 3) % 4) * 16;
      cx.fillRect(bx, GY - bh, 62, bh);
      cx.fillStyle = "rgba(143,233,255,.14)";
      for (var q = 0; q < 3; q++) cx.fillRect(bx + 8 + q * 15, GY - bh + 8, 5, 5);
      cx.fillStyle = "rgba(10,14,36,.85)";
    }

    /* زمین */
    var gr = cx.createLinearGradient(0, GY, 0, H);
    gr.addColorStop(0, "rgba(124,92,255,.20)");
    gr.addColorStop(1, "rgba(6,9,22,.95)");
    cx.fillStyle = gr; cx.fillRect(0, GY, W, H - GY);
    cx.strokeStyle = "rgba(143,233,255,.75)";
    cx.lineWidth = 2;
    cx.beginPath(); cx.moveTo(0, GY + 1); cx.lineTo(W, GY + 1); cx.stroke();

    /* خطوط شبکهٔ متحرک */
    cx.strokeStyle = "rgba(143,233,255,.14)";
    cx.lineWidth = 1;
    var gx = (G.t * 120 * G.speed) % 46;
    for (var x = -gx; x < W; x += 46) {
      cx.beginPath(); cx.moveTo(x, GY); cx.lineTo(x - 26, H); cx.stroke();
    }

    /* خطوط سرعت */
    if (G.speed > 1.15 || P.y + P.h < GY - 4) {
      cx.strokeStyle = "rgba(143,233,255,.16)";
      cx.lineWidth = 1;
      for (var sl = 0; sl < 7; sl++) {
        var ly = GY * 0.18 + ((sl * 53) % Math.max(40, GY * 0.65));
        var lx = W - ((G.t * (260 + sl * 55) + sl * 137) % (W + 160));
        cx.beginPath(); cx.moveTo(lx, ly); cx.lineTo(lx + 34 + G.speed * 18, ly); cx.stroke();
      }
    }

    /* گرد و خاک */
    G.dust.forEach(function (d) {
      cx.globalAlpha = Math.max(0, d.life / d.max) * 0.7;
      cx.fillStyle = "#8fe9ff";
      cx.beginPath(); cx.arc(d.x, d.y, d.r, 0, 7); cx.fill();
    });
    cx.globalAlpha = 1;

    /* سکه‌ها */
    G.coins.forEach(function (c) {
      var s = Math.cos(c.spin || 0);
      cx.save();
      cx.translate(c.x, c.y);
      cx.scale(Math.abs(s) * 0.8 + 0.2, 1);
      cx.fillStyle = "#ffd66b";
      cx.shadowColor = "#ffb03a"; cx.shadowBlur = 12;
      cx.beginPath(); cx.arc(0, 0, c.r, 0, 7); cx.fill();
      cx.shadowBlur = 0;
      cx.fillStyle = "rgba(120,70,0,.55)";
      cx.fillRect(-1.5, -4, 3, 8);
      cx.restore();
    });
    cx.shadowBlur = 0;

    /* موانع */
    G.ob.forEach(function (o) {
      if (o.fly) {
        cx.save();
        cx.translate(o.x + o.w / 2, o.y + o.h / 2);
        cx.rotate(o.spin);
        cx.fillStyle = "#ff5470";
        cx.shadowColor = "#ff5470"; cx.shadowBlur = 14;
        cx.beginPath();
        for (var a = 0; a < 4; a++) {
          var an = a * Math.PI / 2;
          cx.lineTo(Math.cos(an) * 15, Math.sin(an) * 15);
          cx.lineTo(Math.cos(an + 0.4) * 5, Math.sin(an + 0.4) * 5);
        }
        cx.closePath(); cx.fill();
        cx.restore();
        cx.shadowBlur = 0;
      } else {
        cx.fillStyle = "#8b93b8";
        cx.shadowColor = "#22d3ee"; cx.shadowBlur = 10;
        cx.beginPath();
        cx.moveTo(o.x, o.y + o.h);
        cx.lineTo(o.x + o.w / 2, o.y);
        cx.lineTo(o.x + o.w, o.y + o.h);
        cx.closePath(); cx.fill();
        cx.shadowBlur = 0;
        cx.strokeStyle = "rgba(143,233,255,.7)";
        cx.lineWidth = 1.5; cx.stroke();
      }
    });

    /* شوریکن‌های پرتابی */
    G.shots.forEach(function (s) {
      cx.save();
      cx.translate(s.x, s.y);
      cx.rotate(s.spin);
      cx.fillStyle = "#8fe9ff";
      cx.shadowColor = "#8fe9ff"; cx.shadowBlur = 16;
      cx.beginPath();
      for (var q = 0; q < 4; q++) {
        var an = q * Math.PI / 2;
        cx.lineTo(Math.cos(an) * 12, Math.sin(an) * 12);
        cx.lineTo(Math.cos(an + 0.42) * 4, Math.sin(an + 0.42) * 4);
      }
      cx.closePath(); cx.fill();
      cx.restore();
    });
    cx.shadowBlur = 0;

    /* دنبالهٔ نئونی بازیکن در هوا */
    if (P.y + P.h < GY - 4) {
      for (var tr = 3; tr > 0; tr--) {
        cx.globalAlpha = tr * 0.035;
        cx.fillStyle = "#8fe9ff";
        if (cx.roundRect) {
          cx.beginPath(); cx.roundRect(P.x - tr * 12, P.y + 5, P.w, P.h - 10, 11); cx.fill();
        } else {
          cx.fillRect(P.x - tr * 12, P.y + 5, P.w, P.h - 10);
        }
      }
      cx.globalAlpha = 1;
    }

    /* بازیکن */
    drawRunner();

    /* ذرات */
    G.parts.forEach(function (d) {
      cx.globalAlpha = Math.max(0, d.life / d.max);
      cx.fillStyle = "#ffb03a";
      cx.fillRect(d.x, d.y, d.r, d.r);
    });
    cx.globalAlpha = 1;

    /* فلش کوتاه برداشتن سکه */
    if (G.flash > 0) {
      cx.globalAlpha = Math.min(0.16, G.flash * 0.35);
      cx.fillStyle = "#8fe9ff";
      cx.fillRect(-10, -10, W + 20, H + 20);
    }
    cx.globalAlpha = 1;
    cx.restore();
  }

  function drawRunner() {
    var ph = P.duck ? 32 : P.h;
    var cx0 = P.x + P.w / 2, fy = GY;
    var air = P.y + P.h < GY - 2;
    var run = P.run;
    var sq = P.sq || 0;
    var spin = P.spinT > 0 ? (1 - P.spinT / 0.44) * Math.PI * 2 : 0;
    var u = ph / 58;

    cx.save();
    /* سایه */
    cx.fillStyle = "rgba(0,0,0,.4)";
    cx.beginPath();
    cx.ellipse(cx0, fy + 2, 20 * u, Math.max(2.5, 6 - (GY - (P.y + P.h)) * 0.01), 0, 0, 7);
    cx.fill();

    cx.translate(cx0, fy);
    if (spin) cx.rotate(spin);
    cx.scale(1 + sq * 0.16, 1 - sq * 0.2);

    var HR = 8.5 * u;
    var headY = -ph + HR + 1 * u;
    var torsoTop = -ph + 2 * HR + 5 * u;
    var waistY = -ph * 0.34;
    var torsoW = 21 * u;
    var torsoH = waistY - torsoTop;
    var wav = Math.sin(run * 1.6) * 3.2 * u;

    function rr(x, y, w, h, r) {
      cx.beginPath();
      if (cx.roundRect) cx.roundRect(x, y, w, h, r);
      else cx.rect(x, y, w, h);
    }

    /* شال */
    cx.lineCap = "round";
    cx.strokeStyle = "#ffb03a";
    cx.lineWidth = 2.6 * u;
    cx.beginPath();
    cx.moveTo(-2 * u, torsoTop + 2 * u);
    cx.bezierCurveTo(-12 * u, torsoTop + 6 * u - wav, -24 * u, torsoTop + 12 * u + wav, -34 * u, torsoTop + 6 * u + wav);
    cx.stroke();
    cx.strokeStyle = "#ff5470";
    cx.lineWidth = 4.6 * u;
    cx.beginPath();
    cx.moveTo(-2 * u, torsoTop + 3 * u);
    cx.bezierCurveTo(-10 * u, torsoTop + 2 * u + wav, -19 * u, torsoTop + 8 * u - wav, -27 * u, torsoTop + 1 * u - wav);
    cx.stroke();

    /* شمشیر روی کمر */
    cx.strokeStyle = "#c7d4ff";
    cx.lineWidth = 2.6 * u;
    cx.beginPath(); cx.moveTo(-9 * u, -12 * u); cx.lineTo(9 * u, -38 * u); cx.stroke();
    cx.strokeStyle = "#ffb03a";
    cx.lineWidth = 3.4 * u;
    cx.beginPath(); cx.moveTo(-12 * u, -9.5 * u); cx.lineTo(-7.5 * u, -14 * u); cx.stroke();

    /* پاها */
    function leg(sign, front) {
      var a = air ? 0 : Math.sin(run + (sign > 0 ? Math.PI : 0)) * 0.85;
      var hx = sign * 4.5 * u, hy = waistY + 1 * u;
      var fx = hx + (air ? sign * 3 * u : Math.sin(a) * 9 * u);
      var fy2 = air ? -8 * u - (sign > 0 ? 4 * u : 0) : 0;
      var kx = (hx + fx) / 2 + 3 * u;
      var ky = (hy + fy2) / 2;
      cx.strokeStyle = front ? "#2b3272" : "#1a1f48";
      cx.lineWidth = 6.2 * u;
      cx.lineCap = "round";
      cx.beginPath();
      cx.moveTo(hx, hy);
      cx.quadraticCurveTo(kx, ky, fx, fy2);
      cx.stroke();
      cx.fillStyle = front ? "#ffd66b" : "#c99a3f";
      cx.beginPath();
      cx.ellipse(fx + 1.5 * u, fy2 - 1 * u, 4.2 * u, 2.4 * u, 0, 0, 7);
      cx.fill();
    }
    leg(-1, false);

    /* بدن */
    var tg = cx.createLinearGradient(-torsoW / 2, torsoTop, torsoW / 2, waistY);
    tg.addColorStop(0, "#3d4498");
    tg.addColorStop(0.5, "#202a66");
    tg.addColorStop(1, "#0b1030");
    cx.fillStyle = tg;
    rr(-torsoW / 2, torsoTop, torsoW, torsoH, 6 * u);
    cx.fill();

    /* گردن */
    cx.fillStyle = "#101538";
    cx.fillRect(-3 * u, headY + HR - 1.5 * u, 6 * u, 6 * u);

    /* کمربند */
    cx.fillStyle = "#ff5470";
    cx.fillRect(-torsoW / 2, waistY - 4.5 * u, torsoW, 4.5 * u);
    cx.fillStyle = "#ffd66b";
    cx.fillRect(-2.2 * u, waistY - 5 * u, 4.4 * u, 5 * u);

    /* خط زره */
    cx.strokeStyle = "rgba(143,233,255,.55)";
    cx.lineWidth = 1.6 * u;
    cx.beginPath();
    cx.moveTo(-7 * u, torsoTop + 6 * u);
    cx.lineTo(7 * u, torsoTop + 6 * u);
    cx.stroke();

    /* دست‌ها */
    function arm(sign, front) {
      var a = air ? (sign > 0 ? -1.1 : -0.4) : Math.sin(run + (sign > 0 ? 0 : Math.PI)) * 0.9;
      var sx = sign * torsoW * 0.5, sy = torsoTop + 4 * u;
      var ex = sx + Math.sin(a) * 7 * u;
      var ey = sy + Math.cos(a) * 8 * u;
      var hx2 = ex + Math.sin(a + 0.5) * 5 * u;
      var hy2 = ey + Math.cos(a + 0.5) * 5 * u;
      cx.strokeStyle = front ? "#39418f" : "#232a63";
      cx.lineWidth = 5 * u;
      cx.lineCap = "round";
      cx.beginPath();
      cx.moveTo(sx, sy);
      cx.quadraticCurveTo(ex, ey, hx2, hy2);
      cx.stroke();
      cx.fillStyle = "#ffd9b3";
      cx.beginPath(); cx.arc(hx2, hy2, 2.3 * u, 0, 7); cx.fill();
    }
    arm(-1, false);

    /* سر */
    cx.fillStyle = "#1a2050";
    cx.beginPath(); cx.arc(0, headY, HR, 0, 7); cx.fill();
    cx.fillStyle = "#0a0f24";
    cx.beginPath();
    cx.arc(0, headY + HR * 0.25, HR * 0.86, 0, Math.PI);
    cx.fill();
    cx.fillStyle = "#ff5470";
    cx.fillRect(-HR, headY - HR * 0.55, HR * 2, HR * 0.42);
    cx.strokeStyle = "#ff5470";
    cx.lineWidth = 2.8 * u;
    cx.beginPath();
    cx.moveTo(-HR * 0.9, headY - HR * 0.35);
    cx.quadraticCurveTo(-HR * 2.4, headY - HR * 0.2 + wav, -HR * 3.6, headY + HR * 0.5 + wav);
    cx.stroke();
    cx.shadowColor = "#8fe9ff"; cx.shadowBlur = 8 * u;
    cx.fillStyle = "#8fe9ff";
    rr(0.5 * u, headY - 1.5 * u, 6 * u, 2.6 * u, 1.3 * u);
    cx.fill();
    cx.shadowBlur = 0;

    /* پا و دست جلو */
    leg(1, true);
    arm(1, true);

    cx.restore();
  }

  /* ── ۶. حلقه ────────────────────────────────────────────── */
  function loop(ts) {
    if (!G.on) return;
    var dt = Math.min(0.05, (ts - (G.last || ts)) / 1000);
    G.last = ts;
    update(dt);
    draw();
    G.raf = requestAnimationFrame(loop);
  }

  /* ── ۷. صدا ─────────────────────────────────────────────── */
  var AC = null;
  function beep(freq, dur, type) {
    if (G.mute) return;
    try {
      if (!AC) AC = new (window.AudioContext || window.webkitAudioContext)();
      var o = AC.createOscillator(), g = AC.createGain();
      o.type = type || "square";
      o.frequency.value = freq;
      g.gain.value = 0.045;
      o.connect(g); g.connect(AC.destination);
      o.start();
      g.gain.exponentialRampToValueAtTime(0.0001, AC.currentTime + (dur || 0.08));
      o.stop(AC.currentTime + (dur || 0.08) + 0.02);
    } catch (e) {}
  }

  /* ── ۸. باز و بسته کردن ─────────────────────────────────── */
  function open(auto) {
    css();
    var o = build();
    o.classList.add("on");
    document.body.classList.add("rnNoScroll");
    G.on = true;
    G.paused = false;
    cv = el("rnCv");
    size();
    G.best = parseInt(ls(HI, "0"), 10) || 0;
    G.mute = ls(MUTE, "0") === "1";
    var it0 = o.querySelector(".rnIntro");
    if (it0) it0.style.display = G.started && !G.over ? "none" : "";
    paintSound();
    hud();
    if (!G.raf) { G.last = 0; G.raf = requestAnimationFrame(loop); }
    if (auto) setTimeout(start, 240);
  }
  function close() {
    var o = el("rnOff");
    if (o) o.classList.remove("on");
    document.body.classList.remove("rnNoScroll");
    G.on = false;
    G.paused = false;
    if (G.raf) { cancelAnimationFrame(G.raf); G.raf = 0; }
  }
  function start() {
    var it = document.querySelector("#rnOff .rnIntro");
    if (it) it.style.display = "none";
    var ae = document.activeElement;
    if (ae && ae.closest && ae.closest("#rnOff") && ae.blur) ae.blur();
    if (!cv) { open(false); }
    size();
    reset();
    if (!G.raf) { G.last = 0; G.raf = requestAnimationFrame(loop); }
    try { if (AC && AC.state === "suspended") AC.resume(); } catch (e) {}
  }
  function paintSound() {
    var b = document.querySelector('[data-rn="sound"]');
    if (b) { b.textContent = G.mute ? "🔇" : "🔊"; b.title = G.mute ? "صدا خاموش" : "صدا روشن"; }
  }

  function paintPause() {
    var c = el("rnCtr");
    if (!c) return;
    if (G.paused && G.started && !G.over) {
      c.classList.remove("hide");
      c.innerHTML = '<h3>⏸ بازی متوقف شد</h3>' +
        '<div class="s">نفس بگیر؛ هر وقت آماده بودی ادامه بده.</div>' +
        '<button class="rnBtn p" type="button" data-rn="resume">ادامه ▶</button>';
    } else if (!G.over) {
      c.classList.add("hide");
    }
  }

  function togglePause(force) {
    if (!G.on || !G.started || G.over) return;
    G.paused = typeof force === "boolean" ? force : !G.paused;
    paintPause();
  }

  /* ── ۹. ورودی‌ها ────────────────────────────────────────── */
  document.addEventListener("click", function (e) {
    var t = e.target && e.target.closest ? e.target.closest("[data-rn]") : null;
    if (!t) return;
    e.preventDefault();
    if (t.blur) t.blur();
    var a = t.getAttribute("data-rn");
    if (a === "play") { open(true); }
    else if (a === "retry") { location.reload(); }
    else if (a === "x") { var b = el("rnNet"); if (b) b.classList.remove("on"); document.body.style.paddingTop = ""; }
    else if (a === "close") { close(); }
    else if (a === "start") { start(); }
    else if (a === "pause") { togglePause(); }
    else if (a === "resume") { togglePause(false); }
    else if (a === "sound") { G.mute = !G.mute; lsSet(MUTE, G.mute ? "1" : "0"); paintSound(); }
    else if (a === "jump") { jump(); }
    else if (a === "throw") { throwShuriken(); }
    else if (a === "duck") { duck(true); setTimeout(function () { duck(false); }, 420); }
  });

  function isJumpKey(e) {
    return e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW" ||
      e.key === " " || e.key === "ArrowUp" || e.key === "w" || e.key === "W";
  }
  function isDuckKey(e) {
    return e.code === "ArrowDown" || e.code === "KeyS" ||
      e.key === "ArrowDown" || e.key === "s" || e.key === "S";
  }
  function isThrowKey(e) {
    return e.code === "KeyX" || e.key === "x" || e.key === "X";
  }
  function onKey(e, down) {
    if (!G.on) return;
    if (isJumpKey(e)) {
      e.preventDefault(); e.stopPropagation();
      if (down) jump(); else cutJump();
      return;
    }
    if (isDuckKey(e)) {
      e.preventDefault(); e.stopPropagation();
      duck(down);
      return;
    }
    if (isThrowKey(e)) {
      e.preventDefault(); e.stopPropagation();
      if (down) throwShuriken();
      return;
    }
    if (!down) return;
    if (e.key === "p" || e.key === "P") { e.preventDefault(); togglePause(); }
    else if (e.key === "Escape") { e.preventDefault(); close(); }
    else if (e.key === "r" || e.key === "R") { e.preventDefault(); reset(); }
  }
  /* فاز capture تا هیچ اسکریپت دیگری (چت، اینترو…) اسپیس را قورت ندهد */
  window.addEventListener("keydown", function (e) { onKey(e, true); }, true);
  window.addEventListener("keyup", function (e) { onKey(e, false); }, true);

  /* لمس روی بوم = پرش */
  document.addEventListener("pointerdown", function (e) {
    if (!G.on || !e.target) return;
    if (e.target.id === "rnCv") { e.preventDefault(); jump(); }
  });

  window.addEventListener("resize", function () { if (G.on) { size(); } });
  document.addEventListener("visibilitychange", function () {
    if (G.on && document.hidden && G.started && !G.over) {
      G.paused = true;
      paintPause();
    }
  });

  /* ── ۱۰. شبکه ───────────────────────────────────────────── */
  window.addEventListener("offline", function () { netPaint(); });
  window.addEventListener("online", function () {
    netPaint();
    if (G.on) {
      var c = el("rnCtr");
      if (c && !G.over) {
        c.classList.remove("hide");
        c.innerHTML = "<h3>🟢 اتصال برگشت</h3>" +
          '<div class="s">می‌تونی برگردی به سایت یا همین بازی را ادامه بدی.</div>' +
          '<button class="rnBtn p" type="button" data-rn="close">برگرد به سایت</button>' +
          '<button class="rnBtn" type="button" data-rn="start">بازی دوباره</button>';
      }
      G.paused = true;
    }
  });

  /* ضربان شبکه: اگر پینگ شکست خورد، نوار را نشان بده */
  var bad = 0;
  function beat() {
    if (!navigator.onLine) { netPaint(); return; }
    try {
      fetch("manifest.json?hb=" + Date.now(), { method: "GET", cache: "no-store" })
        .then(function (r) { bad = 0; netPaint(); })
        .catch(function () { bad++; if (bad >= 2) { var b = banner(); b.classList.add("on"); } });
    } catch (e) {}
  }

  /* ── ۱۱. راه‌اندازی ─────────────────────────────────────── */
  function boot() {
    css();
    banner();
    netPaint();
    G.best = parseInt(ls(HI, "0"), 10) || 0;
    G.mute = ls(MUTE, "0") === "1";
    if (window.__rnOpenGame) { window.__rnOpenGame = false; open(true); }
    setInterval(beat, 25000);
  }

  window.RoninGame = { open: open, close: close, start: start, jump: jump, duck: duck,
    throw: throwShuriken, pause: togglePause, hit: hit, box: playerBox, state: G, player: P };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
