/* ═══════════════════════════════════════════════════════════════
   RONIN STORE — OFFLINE RUNNER · ronin-offline.js · v3
   ───────────────────────────────────────────────────────────────
   بازی آفلاین از نو نوشته شد:
   • فیزیک ثابت و منصفانه: با یک پرش از همهٔ مانع‌ها رد می‌شوی،
     ولی از داخل مانع عبور نمی‌کنی (برخورد واقعی)
   • چهار درجهٔ سختی: آسان • متوسط • سخت • رونین
   • مانع زمینی و پرنده، سکه، کمبو، سپر، دوبل‌جامپ
   • شهر نئونی پارالاکس، ذرات، لرزش دوربین، صدا
   • رکورد جدا برای هر درجه در همین مرورگر
   • کنترل کیبورد و دکمه‌های لمسی — کاملاً بدون اینترنت
   ═══════════════════════════════════════════════════════════════ */
"use strict";
(function () {
  if (window.__roninOff) return;
  window.__roninOff = true;

  var HI = "ronin_hi3_", MUTE = "ronin_mute2", DIFF = "ronin_diff3";

  var DIFFS = {
    easy:   { fa: "آسان",   sp: 0.82, max: 1.45, fly: 0.12, tall: 0.2, gap: 1.28, color: "#7ee787" },
    normal: { fa: "متوسط",  sp: 1.00, max: 1.72, fly: 0.26, tall: 0.32, gap: 1.06, color: "#8fe9ff" },
    hard:   { fa: "سخت",    sp: 1.18, max: 2.05, fly: 0.38, tall: 0.46, gap: 0.95, color: "#ffd66b" },
    ronin:  { fa: "رونین",  sp: 1.40, max: 2.45, fly: 0.48, tall: 0.58, gap: 0.88, color: "#ff5470" }
  };
  var ORDER = ["easy", "normal", "hard", "ronin"];

  var G = {
    on: false, state: "menu", diff: "normal", score: 0, best: 0, dist: 0,
    speed: 1, obs: [], coins: [], picks: [], parts: [], shake: 0,
    shield: 0, invuln: 0, combo: 0, comboT: 0, t: 0, run: 0,
    raf: 0, last: 0, mute: false, flash: 0, pop: 0, best2: 0
  };
  var P = { x: 120, y: 284, vy: 0, w: 34, h: 52, duck: false, jumps: 0, sq: 0, spin: 0 };

  var GY = 336, VH = 400, cv, cx, W, H, VW, SCALE, DPR;

  function el(i) { return document.getElementById(i); }
  function qa(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function num(n) { return String(Math.floor(n)).replace(/[0-9]/g, function (d) { return "۰۱۲۳۴۵۶۷۸۹"[d]; }); }
  function ls(k, d) { try { var v = localStorage.getItem(k); return v == null ? d : v; } catch (e) { return d; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  /* ── ۱. استایل ──────────────────────────────────────────── */
  function css() {
    if (el("rnOffCss")) return;
    var s = document.createElement("style");
    s.id = "rnOffCss";
    s.textContent = [
      ".rnNet{position:fixed;z-index:100000;inset-inline:8px;bottom:calc(76px + env(safe-area-inset-bottom));" +
        "display:none;flex-wrap:wrap;align-items:center;gap:7px;padding:10px;border-radius:16px;font-family:inherit;" +
        "background:linear-gradient(135deg,#ffd66b,#ffb03a 45%,#ff5470);" +
        "box-shadow:0 18px 44px -18px rgba(255,84,112,.95)}",
      ".rnNet.on{display:flex;animation:rnIn .3s ease both}",
      ".rnNet>span{flex:1 1 100%;font-size:11.5px;font-weight:900;color:#1a0b12}",
      ".rnNet button{cursor:pointer;border:0;border-radius:11px;padding:0 12px;min-height:40px;font-family:inherit;" +
        "font-size:12px;font-weight:900;color:#1a0b12;background:rgba(0,0,0,.14)}",
      ".rnNet button[data-rn=goplay]{flex:1 1 auto;color:#8fe9ff;background:linear-gradient(135deg,#0b1022,#1b2a55)}",
      "@keyframes rnIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}",

      "#rnOff{position:fixed;inset:0;z-index:9200;display:none;flex-direction:column;font-family:inherit;color:#e9edff;" +
        "background:radial-gradient(120% 90% at 100% 0%,rgba(255,84,112,.14),transparent 60%)," +
        "radial-gradient(90% 80% at 0% 100%,rgba(124,92,255,.16),transparent 62%),rgba(4,6,15,.99)}",
      "#rnOff.on{display:flex;animation:rnFade .28s ease both}",
      "@keyframes rnFade{from{opacity:0}to{opacity:1}}",
      "#rnOff .rnTop{display:flex;align-items:center;gap:8px;padding:10px 12px;border-bottom:1px solid rgba(150,170,255,.16);" +
        "background:rgba(8,10,24,.75)}",
      "#rnOff .rnTop b{font-size:12.5px;letter-spacing:.2px}",
      "#rnOff .rnTop .st{display:inline-flex;align-items:center;gap:5px;padding:3px 9px;border-radius:99px;font-size:9.5px;" +
        "font-weight:800;color:#ffc2ce;background:rgba(255,84,112,.16);border:1px solid rgba(255,120,150,.35)}",
      "#rnOff .rnTop .st i{width:5px;height:5px;border-radius:50%;background:#ff5470;box-shadow:0 0 8px #ff5470}",
      "#rnOff .rnTop .sp{flex:1}",
      "#rnOff .ico{width:34px;height:34px;border-radius:11px;display:grid;place-items:center;cursor:pointer;" +
        "font-size:14px;padding:0;color:#dfe6ff;border:1px solid rgba(150,170,255,.24);background:rgba(255,255,255,.06)}",
      "#rnOff .ico:hover{border-color:#8fe9ff;color:#fff}",
      "#rnOff .ico:active{transform:scale(.94)}",

      "#rnOff .rnBody{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;" +
        "padding:12px;overflow:auto;min-width:0}",
      "#rnOff .rnStage{position:relative;width:100%;max-width:860px;flex:1;min-height:230px;border-radius:20px;overflow:hidden;" +
        "border:1px solid rgba(150,170,255,.22);background:#060913;" +
        "box-shadow:0 30px 70px -44px rgba(0,0,0,.95),inset 0 0 50px rgba(0,0,0,.6)}",
      "#rnOff canvas{display:block;width:100%;height:100%;touch-action:none}",
      "#rnOff .rnHud{position:absolute;inset:8px 10px auto 10px;display:flex;gap:6px;align-items:center;pointer-events:none;" +
        "font-size:10.5px;font-weight:900;flex-wrap:wrap}",
      "#rnOff .rnHud span{padding:4px 9px;border-radius:99px;background:rgba(6,10,24,.62);" +
        "border:1px solid rgba(150,170,255,.22);color:#dfe7ff}",
      "#rnOff .rnHud .sp{flex:1;border:0;background:none}",
      "#rnOff .rnHud .combo{color:#ffd66b;border-color:rgba(255,176,58,.55);background:rgba(50,25,4,.75)}",
      "#rnOff .rnHud .combo.off{display:none}",
      "#rnOff .rnHud .shield{color:#8fe9ff;border-color:rgba(143,233,255,.4)}",

      "#rnOff .rnCtr{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;" +
        "gap:8px;text-align:center;padding:14px;overflow:auto;" +
        "background:radial-gradient(80% 80% at 50% 40%,rgba(6,9,22,.7),rgba(6,9,22,.94))}",
      "#rnOff .rnCtr.hide{display:none}",
      "#rnOff .rnCtr h3{margin:0;font-size:17px;font-weight:900;" +
        "background:linear-gradient(100deg,#fff,#8fe9ff 60%,#ffd66b);-webkit-background-clip:text;background-clip:text;color:transparent}",
      "#rnOff .rnCtr .s{font-size:11px;color:#a9b2d6;line-height:1.9;max-width:420px}",
      "#rnOff .rnCtr .big{font-size:26px;font-weight:900;color:#8fe9ff;direction:ltr;letter-spacing:1px}",
      "#rnOff .rnDiffs{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin:6px 0 2px;width:min(440px,100%)}",
      "#rnOff .rnDiff{cursor:pointer;font-family:inherit;border-radius:12px;padding:8px 4px;font-size:11px;font-weight:900;" +
        "color:#dfe7ff;border:1px solid rgba(150,170,255,.25);background:rgba(255,255,255,.06);transition:.18s}",
      "#rnOff .rnDiff:hover{transform:translateY(-1px)}",
      "#rnOff .rnDiff.on{color:#06101f;border-color:transparent;background:linear-gradient(135deg,#8fe9ff,#7c5cff)}",
      "#rnOff .rnBtn{cursor:pointer;font-family:inherit;font-size:12px;font-weight:900;padding:9px 18px;border-radius:12px;" +
        "border:1px solid rgba(150,170,255,.3);color:#e9edff;background:rgba(255,255,255,.07)}",
      "#rnOff .rnBtn:hover{transform:translateY(-1px);border-color:#8fe9ff}",
      "#rnOff .rnBtn.p{border:0;color:#06101f;background:linear-gradient(135deg,#8fe9ff,#7c5cff);" +
        "box-shadow:0 14px 30px -14px rgba(124,92,255,.95)}",

      "#rnOff .rnPads{display:flex;gap:8px;justify-content:center;padding:2px 10px 10px;width:100%;max-width:860px}",
      "#rnOff .rnPad{flex:1;max-width:260px;height:46px;border-radius:14px;cursor:pointer;font-family:inherit;" +
        "font-size:13px;font-weight:900;color:#e9edff;border:1px solid rgba(150,170,255,.24);" +
        "background:rgba(255,255,255,.06);user-select:none}",
      "#rnOff .rnPad:active{background:rgba(124,92,255,.3)}",
      "#rnOff .rnTip{font-size:9.5px;color:#8f9ac0;text-align:center;padding:0 12px 8px}",
      "@media(max-width:560px){#rnOff .rnDiffs{grid-template-columns:repeat(2,1fr)}#rnOff .rnCtr h3{font-size:15px}" +
        "#rnOff .rnPad{font-size:11.5px;height:44px}}",
      "@media(prefers-reduced-motion:reduce){#rnOff.on{animation:none}}",
      "body.rnNoScroll{overflow:hidden!important}"
    ].join("\n");
    document.head.appendChild(s);
  }

  /* ── ۲. نوار آفلاین ────────────────────────────────────── */
  function banner() {
    var b = el("rnNet");
    if (!b) {
      b = document.createElement("div");
      b.id = "rnNet";
      b.className = "rnNet";
      b.setAttribute("data-noi18n", "");
      b.innerHTML = '<span>📴 آفلاین شدی — وقت بازی است</span>' +
        '<button type="button" data-rn="goplay">🎮 بازی کن</button>' +
        '<button type="button" data-rn="retry">↺ تلاش</button>' +
        '<button type="button" data-rn="hide">✕</button>';
      document.body.appendChild(b);
    }
    return b;
  }
  function netPaint() {
    var b = banner();
    b.classList.toggle("on", navigator.onLine === false && !G.on);
  }

  /* ── ۳. ساخت صفحه ───────────────────────────────────────── */
  function build() {
    var o = el("rnOff");
    if (o) return o;
    o = document.createElement("div");
    o.id = "rnOff";
    o.setAttribute("data-noi18n", "");
    o.innerHTML =
      '<div class="rnTop">' +
        '<b>🥷 رانر رونین</b>' +
        '<span class="st"><i></i>آفلاین</span>' +
        '<span class="sp"></span>' +
        '<button class="ico" type="button" data-rn="pause" title="توقف">⏸</button>' +
        '<button class="ico" type="button" data-rn="sound" title="صدا">🔊</button>' +
        '<button class="ico" type="button" data-rn="close" title="بستن">✕</button>' +
      "</div>" +
      '<div class="rnBody">' +
        '<div class="rnStage">' +
          '<canvas id="rnCv"></canvas>' +
          '<div class="rnHud">' +
            '<span id="rnScore">امتیاز ۰</span>' +
            '<span id="rnBest">رکورد ۰</span>' +
            '<span class="sp"></span>' +
            '<span id="rnCombo" class="combo off">×۲</span>' +
            '<span id="rnShield" class="shield">🛡 ۰</span>' +
          "</div>" +
          '<div class="rnCtr" id="rnCtr"></div>' +
        "</div>" +
        '<div class="rnPads">' +
          '<button class="rnPad" type="button" data-rn="jump">⬆ پرش</button>' +
          '<button class="rnPad" type="button" data-rn="duck">⬇ خم</button>' +
        "</div>" +
        '<div class="rnTip">فاصله/↑ پرش • دوبار = دوبل‌جامپ • ↓ خم • P توقف • R شروع دوباره</div>' +
      "</div>";
    document.body.appendChild(o);
    return o;
  }

  /* ── ۴. اندازه ───────────────────────────────────────────── */
  function size() {
    if (!cv) return;
    var r = cv.getBoundingClientRect();
    DPR = Math.min(2, window.devicePixelRatio || 1);
    W = Math.max(260, Math.floor(r.width || 320));
    H = Math.max(180, Math.floor(r.height || 240));
    cv.width = Math.floor(W * DPR);
    cv.height = Math.floor(H * DPR);
    cx = cv.getContext("2d");
    SCALE = H / VH;
    VW = W / SCALE;
    cx.setTransform(DPR * SCALE, 0, 0, DPR * SCALE, 0, 0);
    P.x = clamp(VW * 0.2, 64, 160);
    var floor = GY - P.h;
    if (G.state !== "run") P.y = floor;
    else if (P.y > floor) P.y = floor;
  }

  /* ── ۵. وضعیت ───────────────────────────────────────────── */
  function bestKey(d) { return HI + (d || G.diff); }
  function loadBest(d) {
    G.best = parseInt(ls(bestKey(d), "0"), 10) || 0;
    return G.best;
  }
  function saveBest() {
    if (G.score > G.best) {
      G.best = Math.floor(G.score);
      lsSet(bestKey(G.diff), String(G.best));
    }
  }
  function reset() {
    var d = DIFFS[G.diff] || DIFFS.normal;
    G.obs = []; G.coins = []; G.picks = []; G.parts = [];
    G.score = 0; G.dist = 0; G.speed = d.sp; G.shake = 0; G.t = 0;
    G.shield = 0; G.invuln = 0; G.combo = 0; G.comboT = 0;
    G.flash = 0; G.pop = 0; G.state = "run";
    P.y = GY - P.h; P.vy = 0; P.duck = false; P.jumps = 0; P.sq = 0; P.spin = 0;
    G.spawnAt = VW + 80;
    G.nextGap = speedPx() * (d.gap + rnd(0.1, 0.5));
    loadBest();
    paintHud(true);
  }

  function speedPx() {
    var d = DIFFS[G.diff] || DIFFS.normal;
    var ramp = 1 + Math.min(0.75, G.dist / 9000);
    return clamp(330 * d.sp * ramp, 200, 330 * d.max);
  }

  /* ── ۶. تولید ───────────────────────────────────────────── */
  function spawnOne() {
    var d = DIFFS[G.diff] || DIFFS.normal;
    var fly = Math.random() < d.fly && G.dist > 600;
    var x = VW + 50;
    if (fly) {
      G.obs.push({
        x: x, y: GY - 66, w: 32, h: 26, fly: 1, spin: 0, dead: 0
      });
    } else {
      var tall = Math.random() < d.tall;
      var w = tall ? 26 : (Math.random() < 0.5 ? 24 : 32);
      var h = tall ? 58 : (Math.random() < 0.5 ? 42 : 48);
      G.obs.push({ x: x, y: GY - h, w: w, h: h, fly: 0, spin: 0, dead: 0 });
    }
    /* سکه‌ها */
    if (Math.random() < 0.72) {
      var n = Math.random() < 0.4 ? 3 : 1;
      var baseY = GY - rnd(64, 150);
      for (var i = 0; i < n; i++) {
        G.coins.push({ x: x + 60 + i * 26, y: baseY - Math.sin(i / 2 * Math.PI) * 22, r: 7, spin: rnd(0, 6), got: 0 });
      }
    }
    /* سپر */
    if (Math.random() < 0.09 && G.dist > 900) {
      G.picks.push({ x: x + rnd(90, 160), y: GY - rnd(80, 130), r: 11, kind: "shield", spin: 0, got: 0 });
    }
  }

  /* ── ۷. ورودی بازی ──────────────────────────────────────── */
  function grounded() { return P.y >= GY - P.h - 0.6; }

  function jump() {
    if (!G.on) return;
    if (G.state === "menu" || G.state === "over") { start(); return; }
    if (G.state === "pause") { pause(false); return; }
    if (!grounded()) {
      if (P.jumps >= 2) return;
      P.vy = -760; P.jumps = 2; P.spin = 1; beep(760, 0.05, "triangle");
      puff(10, true);
      return;
    }
    P.vy = -900; P.jumps = 1; P.duck = false; P.sq = 0;
    beep(520, 0.05);
    puff(8, false);
  }
  function cutJump() { if (P.vy < -260) P.vy *= 0.55; }
  function duck(on) {
    if (G.state !== "run") return;
    P.duck = !!on && grounded();
  }

  function playerBox() {
    var h = P.duck ? 28 : P.h;
    var top = P.duck ? P.y + (P.h - h) : P.y;
    return { x: P.x + 5, y: top + 3, w: P.w - 10, h: h - 5 };
  }
  function hits(o) {
    var b = playerBox();
    return b.x + b.w > o.x + 3 && b.x < o.x + o.w - 3 &&
      b.y + b.h > o.y + 3 && b.y < o.y + o.h - 3;
  }

  /* ── ۸. به‌روزرسانی ─────────────────────────────────────── */
  function update(dt) {
    if (G.state !== "run") { G.t += dt; return; }
    G.t += dt;
    var sp = speedPx();
    G.speed = sp / 330;
    G.dist += sp * dt;
    G.score += sp * dt * 0.055;
    if (G.comboT > 0) { G.comboT -= dt; if (G.comboT <= 0) G.combo = 0; }
    if (G.flash > 0) G.flash = Math.max(0, G.flash - dt * 3);
    if (G.pop > 0) G.pop = Math.max(0, G.pop - dt * 3);
    if (G.invuln > 0) G.invuln = Math.max(0, G.invuln - dt);

    /* فیزیک بازیکن */
    P.vy += 2400 * dt;
    P.y += P.vy * dt;
    if (P.y >= GY - P.h) {
      if (P.vy > 260) P.sq = 1;
      P.y = GY - P.h; P.vy = 0; P.jumps = 0;
    }
    if (P.spin > 0) P.spin = Math.max(0, P.spin - dt * 2.4);
    if (P.sq > 0) P.sq = Math.max(0, P.sq - dt * 4);
    P.run += dt * (7 + G.speed * 5);

    /* موانع */
    for (var i = G.obs.length - 1; i >= 0; i--) {
      var o = G.obs[i];
      o.x -= sp * dt;
      if (o.fly) o.spin += dt * 8;
      if (hits(o)) {
        if (G.shield > 0) {
          G.shield = 0;
          G.obs.splice(i, 1);
          G.invuln = 1.1;
          G.shake = 0.8; G.flash = 0.4;
          beep(240, 0.14, "sawtooth");
          burst(o.x, o.y + o.h / 2, 18, "#8fe9ff");
          paintHud(true);
          continue;
        }
        if (G.invuln > 0) continue;
        return die();
      }
      if (o.x < -80) G.obs.splice(i, 1);
    }

    /* تولید مانع بر اساس فاصله */
    var right = 0;
    G.obs.forEach(function (o) { if (o.x + o.w > right) right = o.x + o.w; });
    if (!G.obs.length || right < VW - G.nextGap) {
      spawnOne();
      var d = DIFFS[G.diff] || DIFFS.normal;
      G.nextGap = sp * (d.gap + rnd(0.12, 0.55));
    }

    /* سکه‌ها */
    for (i = G.coins.length - 1; i >= 0; i--) {
      var c = G.coins[i];
      c.x -= sp * dt;
      c.spin += dt * 5;
      var dx = (P.x + P.w / 2) - c.x;
      var dy = (P.y + (P.duck ? 14 : P.h / 2)) - c.y;
      if (dx * dx + dy * dy < 26 * 26) {
        G.coins.splice(i, 1);
        G.combo = Math.min(5, G.combo + 1);
        G.comboT = 2.8;
        G.score += 20 * G.combo;
        G.pop = 1;
        beep(700 + G.combo * 90, 0.05);
        burst(c.x, c.y, 8, "#ffd66b");
        if (G.combo >= 5) G.shield = Math.min(1, G.shield + 0);
        paintHud(true);
        continue;
      }
      if (c.x < -30) G.coins.splice(i, 1);
    }

    /* سپر */
    for (i = G.picks.length - 1; i >= 0; i--) {
      var p = G.picks[i];
      p.x -= sp * dt;
      p.spin += dt * 2;
      var px = (P.x + P.w / 2) - p.x, py = (P.y + P.h / 2) - p.y;
      if (px * px + py * py < 30 * 30) {
        G.picks.splice(i, 1);
        G.shield = 1;
        G.flash = 0.4;
        beep(1150, 0.12, "triangle");
        toast("🛡 سپر گرفتی — یک برخورد را تحمل می‌کند");
        paintHud(true);
        continue;
      }
      if (p.x < -30) G.picks.splice(i, 1);
    }

    /* ذرات */
    G.parts = G.parts.filter(function (x) {
      x.life -= dt; x.x += x.vx * dt; x.y += x.vy * dt; x.vy += 520 * dt;
      return x.life > 0;
    });
    if (G.shake > 0) G.shake = Math.max(0, G.shake - dt * 2);
    paintHud();
  }

  function die() {
    if (G.state === "over") return;
    G.state = "over";
    G.shake = 1;
    beep(150, 0.24, "sawtooth");
    burst(P.x + P.w / 2, P.y + P.h / 2, 26, "#ff5470");
    saveBest();
    paintHud(true);
    paintOver();
  }

  function burst(x, y, n, color) {
    for (var i = 0; i < n; i++) {
      G.parts.push({
        x: x, y: y, vx: rnd(-240, 240), vy: rnd(-280, 120),
        life: rnd(0.35, 0.8), max: 0.8, r: rnd(1.5, 3.6), c: color
      });
    }
  }
  function puff(n, air) {
    for (var i = 0; i < n; i++) {
      G.parts.push({
        x: P.x + rnd(0, P.w), y: air ? P.y + P.h : GY,
        vx: rnd(-60, 20), vy: rnd(-90, -20), life: 0.4, max: 0.4, r: rnd(1.4, 3), c: "#8fe9ff"
      });
    }
  }

  /* ── ۹. HUD ─────────────────────────────────────────────── */
  var lastHud = "";
  function paintHud(force) {
    var s = Math.floor(G.score);
    var key = s + "|" + Math.max(G.best, s) + "|" + G.combo + "|" + G.shield;
    if (!force && key === lastHud) return;
    lastHud = key;
    var a = el("rnScore"), b = el("rnBest"), c = el("rnCombo"), sh = el("rnShield");
    if (a) a.textContent = "امتیاز " + num(s);
    if (b) b.textContent = "رکورد " + num(Math.max(G.best, s));
    if (c) {
      c.textContent = "×" + num(Math.min(5, G.combo));
      c.classList.toggle("off", G.combo < 2);
    }
    if (sh) sh.textContent = "🛡 " + num(G.shield);
  }

  /* ── ۱۰. نقاشی ──────────────────────────────────────────── */
  var STARS = [];
  for (var si = 0; si < 46; si++) STARS.push({ x: (si * 137) % 1000, y: (si * 71) % 250, r: 0.7 + (si % 3) * 0.5 });
  var FAR = [], NEAR = [];
  for (var fi = 0; fi < 22; fi++) FAR.push({ x: fi * 74 + (fi % 3) * 13, h: 44 + ((fi * 37) % 70), w: 52 });
  for (var ni = 0; ni < 18; ni++) NEAR.push({ x: ni * 96 + (ni % 4) * 17, h: 34 + ((ni * 53) % 92), w: 66 });

  function draw() {
    if (!cx) return;
    var sh = G.shake ? (Math.random() - 0.5) * 12 * G.shake : 0;
    cx.save();
    cx.clearRect(0, 0, VW + 2, VH);
    cx.translate(sh, sh * 0.5);

    /* آسمان */
    var sky = cx.createLinearGradient(0, 0, 0, GY);
    sky.addColorStop(0, "#080e26");
    sky.addColorStop(0.55, "#141a44");
    sky.addColorStop(1, "#2a1440");
    cx.fillStyle = sky;
    cx.fillRect(-20, 0, VW + 40, GY + 2);

    /* ماه */
    var mx = VW * 0.78, my = 78;
    var mg = cx.createRadialGradient(mx, my, 6, mx, my, 74);
    mg.addColorStop(0, "rgba(255,255,255,.35)");
    mg.addColorStop(0.4, "rgba(143,233,255,.16)");
    mg.addColorStop(1, "rgba(143,233,255,0)");
    cx.fillStyle = mg;
    cx.beginPath(); cx.arc(mx, my, 74, 0, 7); cx.fill();
    cx.fillStyle = "rgba(230,242,255,.16)";
    cx.beginPath(); cx.arc(mx, my, 26, 0, 7); cx.fill();

    /* ستاره‌ها */
    var sx0 = (G.dist * 0.05) % 1000;
    cx.fillStyle = "rgba(220,232,255,.75)";
    for (var i = 0; i < STARS.length; i++) {
      var st = STARS[i];
      var x = (st.x - sx0) % (VW + 120);
      if (x < 0) x += VW + 120;
      cx.globalAlpha = 0.2 + (i % 4) * 0.16;
      cx.fillRect(x, st.y, st.r, st.r);
    }
    cx.globalAlpha = 1;

    /* شهر دور */
    var f0 = (G.dist * 0.14) % 74;
    cx.fillStyle = "rgba(20,26,66,.62)";
    for (i = 0; i < FAR.length; i++) {
      var f = FAR[i];
      var fx = f.x - f0;
      while (fx < -90) fx += 74 * FAR.length;
      while (fx > VW + 90) fx -= 74 * FAR.length;
      cx.fillRect(fx, GY - f.h, f.w, f.h);
    }

    /* شهر نزدیک + پنجره */
    var n0 = (G.dist * 0.34) % 96;
    for (i = 0; i < NEAR.length; i++) {
      var nb = NEAR[i];
      var nx = nb.x - n0;
      while (nx < -110) nx += 96 * NEAR.length;
      while (nx > VW + 110) nx -= 96 * NEAR.length;
      cx.fillStyle = "rgba(9,13,34,.92)";
      cx.fillRect(nx, GY - nb.h, nb.w, nb.h);
      cx.fillStyle = "rgba(143,233,255,.16)";
      for (var q = 0; q < 3; q++) {
        if (nb.h > 52) cx.fillRect(nx + 10 + q * 17, GY - nb.h + 12, 6, 5);
      }
    }

    /* زمین */
    var gr = cx.createLinearGradient(0, GY, 0, VH);
    gr.addColorStop(0, "rgba(124,92,255,.22)");
    gr.addColorStop(1, "rgba(5,8,20,.98)");
    cx.fillStyle = gr;
    cx.fillRect(-20, GY, VW + 40, VH - GY);
    cx.strokeStyle = "rgba(143,233,255,.8)";
    cx.lineWidth = 2;
    cx.beginPath(); cx.moveTo(-20, GY + 1); cx.lineTo(VW + 20, GY + 1); cx.stroke();

    /* شبکهٔ زمین */
    var g0 = (G.dist * 0.9) % 46;
    cx.strokeStyle = "rgba(143,233,255,.14)";
    cx.lineWidth = 1;
    for (var gx = -g0; gx < VW + 46; gx += 46) {
      cx.beginPath(); cx.moveTo(gx, GY); cx.lineTo(gx - 24, VH); cx.stroke();
    }
    cx.strokeStyle = "rgba(143,233,255,.07)";
    for (var gy = GY + 14; gy < VH; gy += 18) {
      cx.beginPath(); cx.moveTo(-20, gy); cx.lineTo(VW + 20, gy); cx.stroke();
    }

    /* سکه‌ها */
    G.coins.forEach(function (c) {
      var s = Math.cos(c.spin);
      cx.save();
      cx.translate(c.x, c.y);
      cx.scale(Math.abs(s) * 0.75 + 0.25, 1);
      cx.fillStyle = "#ffd66b";
      cx.shadowColor = "#ffb03a"; cx.shadowBlur = 12;
      cx.beginPath(); cx.arc(0, 0, c.r, 0, 7); cx.fill();
      cx.shadowBlur = 0;
      cx.fillStyle = "rgba(120,70,0,.5)";
      cx.fillRect(-1.4, -3.5, 2.8, 7);
      cx.restore();
    });

    /* سپر */
    G.picks.forEach(function (p) {
      cx.save();
      cx.translate(p.x, p.y);
      cx.rotate(Math.sin(p.spin) * 0.2);
      cx.fillStyle = "rgba(143,233,255,.18)";
      cx.strokeStyle = "#8fe9ff";
      cx.lineWidth = 1.6;
      cx.shadowColor = "#8fe9ff"; cx.shadowBlur = 14;
      cx.beginPath();
      for (var k = 0; k < 6; k++) {
        var a = k / 6 * Math.PI * 2 - Math.PI / 2;
        cx[k ? "lineTo" : "moveTo"](Math.cos(a) * p.r, Math.sin(a) * p.r);
      }
      cx.closePath(); cx.fill(); cx.stroke();
      cx.restore();
    });
    cx.shadowBlur = 0;

    /* موانع */
    G.obs.forEach(function (o) {
      if (o.fly) {
        cx.save();
        cx.translate(o.x + o.w / 2, o.y + o.h / 2);
        cx.rotate(o.spin);
        cx.fillStyle = "#ff5470";
        cx.shadowColor = "#ff5470"; cx.shadowBlur = 15;
        cx.beginPath();
        for (var a = 0; a < 4; a++) {
          var an = a * Math.PI / 2;
          cx.lineTo(Math.cos(an) * 16, Math.sin(an) * 16);
          cx.lineTo(Math.cos(an + 0.45) * 5, Math.sin(an + 0.45) * 5);
        }
        cx.closePath(); cx.fill();
        cx.restore();
        cx.shadowBlur = 0;
      } else {
        var grad = cx.createLinearGradient(o.x, o.y, o.x + o.w, o.y + o.h);
        grad.addColorStop(0, "#3a4270");
        grad.addColorStop(1, "#141a38");
        cx.fillStyle = grad;
        cx.strokeStyle = "rgba(143,233,255,.75)";
        cx.lineWidth = 1.6;
        cx.shadowColor = "#22d3ee"; cx.shadowBlur = 10;
        cx.beginPath();
        cx.moveTo(o.x, o.y + o.h);
        cx.lineTo(o.x + o.w / 2, o.y);
        cx.lineTo(o.x + o.w, o.y + o.h);
        cx.closePath();
        cx.fill(); cx.stroke();
        cx.shadowBlur = 0;
      }
    });

    /* بازیکن */
    runner();

    /* ذرات */
    G.parts.forEach(function (p) {
      cx.globalAlpha = Math.max(0, p.life / p.max);
      cx.fillStyle = p.c || "#ffd66b";
      cx.fillRect(p.x, p.y, p.r, p.r);
    });
    cx.globalAlpha = 1;

    /* فلش */
    if (G.flash > 0) {
      cx.globalAlpha = Math.min(0.2, G.flash * 0.4);
      cx.fillStyle = "#8fe9ff";
      cx.fillRect(-20, 0, VW + 40, VH);
    }
    cx.globalAlpha = 1;
    cx.restore();
  }

  function runner() {
    var standing = P.duck ? 28 : P.h;
    var top = GY - standing;
    var cy = P.duck ? top : P.y;
    var air = P.y + P.h < GY - 3;
    var run = P.run;
    var sq = P.sq || 0;
    var spin = P.spin > 0 ? (1 - P.spin) * Math.PI * 2 : 0;
    var u = standing / 52;

    cx.save();
    /* سایه */
    cx.fillStyle = "rgba(0,0,0,.42)";
    cx.beginPath();
    cx.ellipse(P.x + P.w / 2, GY + 2, 18 * u, Math.max(2, 5 - (GY - (P.y + P.h)) * 0.012), 0, 0, 7);
    cx.fill();

    cx.translate(P.x + P.w / 2, cy + standing);
    if (spin) cx.rotate(spin);
    cx.scale(1 + sq * 0.12, 1 - sq * 0.16);

    var hh = 50 * u;
    var headR = 8 * u;
    var headY = -hh + headR + 2;
    var shoulder = -hh + headR * 2 + 4;
    var waist = -hh * 0.4;
    var wav = Math.sin(run * 1.7) * 3 * u;

    /* شال */
    cx.lineCap = "round";
    cx.strokeStyle = "#ff5470";
    cx.lineWidth = 4.4 * u;
    cx.beginPath();
    cx.moveTo(-1, shoulder + 2);
    cx.bezierCurveTo(-10 * u, shoulder + 3 + wav, -20 * u, shoulder + 9 - wav, -28 * u, shoulder - 1 + wav);
    cx.stroke();
    cx.strokeStyle = "#ffb03a";
    cx.lineWidth = 2.2 * u;
    cx.beginPath();
    cx.moveTo(-1, shoulder);
    cx.bezierCurveTo(-9 * u, shoulder - 2 - wav, -17 * u, shoulder + 5 + wav, -24 * u, shoulder - 4 - wav);
    cx.stroke();

    /* شمشیر */
    cx.strokeStyle = "#c7d4ff";
    cx.lineWidth = 2.4 * u;
    cx.beginPath(); cx.moveTo(-8 * u, -12 * u); cx.lineTo(7 * u, -34 * u); cx.stroke();
    cx.strokeStyle = "#ffb03a";
    cx.lineWidth = 3.2 * u;
    cx.beginPath(); cx.moveTo(-11 * u, -9 * u); cx.lineTo(-6.5 * u, -13.5 * u); cx.stroke();

    /* پاها */
    function leg(sign, front) {
      var a = air ? 0 : Math.sin(run + (sign > 0 ? Math.PI : 0)) * 0.9;
      var hipX = sign * 4 * u, hipY = waist + 1;
      var footX = hipX + (air ? sign * 3 * u : Math.sin(a) * 9 * u);
      var footY = air ? -9 * u : 0;
      var kneeX = (hipX + footX) / 2 + 3 * u;
      var kneeY = (hipY + footY) / 2;
      cx.strokeStyle = front ? "#2f377f" : "#1a1f48";
      cx.lineWidth = 6 * u;
      cx.beginPath();
      cx.moveTo(hipX, hipY);
      cx.quadraticCurveTo(kneeX, kneeY, footX, footY);
      cx.stroke();
      cx.fillStyle = front ? "#ffd66b" : "#c99a3f";
      cx.beginPath();
      cx.ellipse(footX + 1.4 * u, footY - 1, 4 * u, 2.2 * u, 0, 0, 7);
      cx.fill();
    }
    leg(-1, false);

    /* بدن */
    var tg = cx.createLinearGradient(-12 * u, shoulder, 12 * u, waist);
    tg.addColorStop(0, "#3d4498");
    tg.addColorStop(0.55, "#202a66");
    tg.addColorStop(1, "#0b1030");
    cx.fillStyle = tg;
    roundRect(-11 * u, shoulder, 22 * u, waist - shoulder, 5 * u);
    cx.fill();

    /* کمربند */
    cx.fillStyle = "#ff5470";
    cx.fillRect(-11 * u, waist - 4, 22 * u, 4);
    cx.fillStyle = "#ffd66b";
    cx.fillRect(-2 * u, waist - 4.5, 4 * u, 4.5);

    /* دست */
    function arm(sign, front) {
      var a = air ? (sign > 0 ? -1.1 : -0.4) : Math.sin(run + (sign > 0 ? 0 : Math.PI)) * 0.9;
      var sx = sign * 10.5 * u, sy = shoulder + 4;
      var ex = sx + Math.sin(a) * 7 * u;
      var ey = sy + Math.cos(a) * 8 * u;
      var hx = ex + Math.sin(a + 0.5) * 5 * u;
      var hy = ey + Math.cos(a + 0.5) * 5 * u;
      cx.strokeStyle = front ? "#39418f" : "#232a63";
      cx.lineWidth = 4.6 * u;
      cx.beginPath();
      cx.moveTo(sx, sy);
      cx.quadraticCurveTo(ex, ey, hx, hy);
      cx.stroke();
      cx.fillStyle = "#ffd9b3";
      cx.beginPath(); cx.arc(hx, hy, 2.2 * u, 0, 7); cx.fill();
    }
    arm(-1, false);

    /* سر */
    cx.fillStyle = "#1a2050";
    cx.beginPath(); cx.arc(0, headY, headR, 0, 7); cx.fill();
    cx.fillStyle = "#0a0f24";
    cx.beginPath();
    cx.arc(0, headY + headR * 0.25, headR * 0.86, 0, Math.PI);
    cx.fill();
    cx.fillStyle = "#ff5470";
    cx.fillRect(-headR, headY - headR * 0.55, headR * 2, headR * 0.4);
    cx.strokeStyle = "#ff5470";
    cx.lineWidth = 2.6 * u;
    cx.beginPath();
    cx.moveTo(-headR * 0.9, headY - headR * 0.35);
    cx.quadraticCurveTo(-headR * 2.2, headY - headR * 0.1 + wav, -headR * 3.3, headY + headR * 0.6 + wav);
    cx.stroke();
    cx.shadowColor = "#8fe9ff"; cx.shadowBlur = 8 * u;
    cx.fillStyle = "#8fe9ff";
    roundRect(1 * u, headY - 1.5 * u, 6 * u, 2.4 * u, 1.2 * u);
    cx.fill();
    cx.shadowBlur = 0;

    leg(1, true);
    arm(1, true);
    cx.restore();
  }

  function roundRect(x, y, w, h, r) {
    cx.beginPath();
    if (cx.roundRect) cx.roundRect(x, y, w, h, r);
    else cx.rect(x, y, w, h);
  }

  /* ── ۱۱. صفحه‌ها ────────────────────────────────────────── */
  function diffBtns(selected) {
    return '<div class="rnDiffs">' + ORDER.map(function (k) {
      return '<button class="rnDiff' + (k === selected ? " on" : "") + '" type="button" data-rn-diff="' + k + '">' +
        DIFFS[k].fa + "</button>";
    }).join("") + "</div>";
  }
  function paintMenu() {
    var c = el("rnCtr");
    if (!c) return;
    c.classList.remove("hide");
    c.innerHTML =
      "<h3>🥷 رانر رونین</h3>" +
      '<div class="s">بدون اینترنت هم بازی کن. از مانع‌ها بپر؛ اگر نپری، مانع جلویت را می‌گیرد. ' +
      "با ↓ زیر مانع‌های پرنده خم شو و سکه‌ها را بگیر.</div>" +
      diffBtns(G.diff) +
      '<div class="s">رکورد این درجه: <b id="rnMenuBest">' + num(loadBest(G.diff)) + "</b></div>" +
      '<button class="rnBtn p" type="button" data-rn="start">شروع بازی 🎮</button>';
  }
  function paintOver() {
    var c = el("rnCtr");
    if (!c) return;
    c.classList.remove("hide");
    c.innerHTML =
      "<h3>بازی تمام شد</h3>" +
      '<div class="big">' + num(G.score) + "</div>" +
      '<div class="s">رکورد این درجه: <b>' + num(G.best) + "</b> • درجه: " + DIFFS[G.diff].fa + "</div>" +
      diffBtns(G.diff) +
      '<div class="rnDiffs" style="grid-template-columns:1fr 1fr;max-width:320px">' +
        '<button class="rnBtn p" type="button" data-rn="start">دوباره 🔁</button>' +
        '<button class="rnBtn" type="button" data-rn="menu">منو</button>' +
      "</div>";
  }
  function paintPause() {
    var c = el("rnCtr");
    if (!c) return;
    c.classList.remove("hide");
    c.innerHTML = "<h3>⏸ بازی متوقف شد</h3>" +
      '<div class="s">هر وقت آماده بودی ادامه بده.</div>' +
      '<button class="rnBtn p" type="button" data-rn="resume">ادامه ▶</button>';
  }

  function start(which) {
    if (which && DIFFS[which]) G.diff = which;
    lsSet(DIFF, G.diff);
    var c = el("rnCtr"); if (c) c.classList.add("hide");
    if (!cv) open(false);
    size();
    reset();
    if (!G.raf) { G.last = 0; G.raf = requestAnimationFrame(loop); }
  }
  function menu() {
    G.state = "menu";
    saveBest();
    paintMenu();
  }
  function pause(on) {
    if (on === undefined) on = G.state !== "pause";
    if (G.state !== "run" && !(on === false && G.state === "pause")) return;
    if (on === false || G.state === "pause") {
      G.state = "run";
      var c = el("rnCtr"); if (c) c.classList.add("hide");
    } else {
      G.state = "pause";
      paintPause();
    }
  }

  /* ── ۱۲. حلقه ───────────────────────────────────────────── */
  function loop(ts) {
    if (!G.on) return;
    var dt = Math.min(0.05, (ts - (G.last || ts)) / 1000);
    G.last = ts;
    update(dt);
    draw();
    G.raf = requestAnimationFrame(loop);
  }

  /* ── ۱۳. صدا ────────────────────────────────────────────── */
  var AC = null;
  function beep(freq, dur, type) {
    if (G.mute) return;
    try {
      if (!AC) AC = new (window.AudioContext || window.webkitAudioContext)();
      if (AC.state === "suspended") AC.resume();
      var o = AC.createOscillator(), g = AC.createGain();
      o.type = type || "square";
      o.frequency.value = freq;
      g.gain.value = 0.04;
      o.connect(g); g.connect(AC.destination);
      o.start();
      g.gain.exponentialRampToValueAtTime(0.0001, AC.currentTime + (dur || 0.06));
      o.stop(AC.currentTime + (dur || 0.06) + 0.02);
    } catch (e) {}
  }
  function paintSound() {
    var b = document.querySelector('[data-rn="sound"]');
    if (b) { b.textContent = G.mute ? "🔇" : "🔊"; b.title = G.mute ? "صدا خاموش" : "صدا روشن"; }
  }
  function toast(msg) {
    try { if (window.R && R.toast) R.toast(msg, "ok"); } catch (e) {}
  }

  /* ── ۱۴. باز/بسته ───────────────────────────────────────── */
  function open(auto) {
    css();
    var o = build();
    o.classList.add("on");
    document.body.classList.add("rnNoScroll");
    G.on = true;
    netPaint();
    cv = el("rnCv");
    size();
    G.mute = ls(MUTE, "0") === "1";
    var saved = ls(DIFF, "normal");
    G.diff = DIFFS[saved] ? saved : "normal";
    loadBest();
    paintSound();
    paintHud(true);
    if (!G.raf) { G.last = 0; G.raf = requestAnimationFrame(loop); }
    if (auto) { setTimeout(function () { start(G.diff); }, 220); }
    else if (G.state !== "run" && G.state !== "pause") paintMenu();
  }
  function close() {
    var o = el("rnOff");
    if (o) o.classList.remove("on");
    document.body.classList.remove("rnNoScroll");
    G.on = false;
    netPaint();
    if (G.raf) { cancelAnimationFrame(G.raf); G.raf = 0; }
  }

  /* ── ۱۵. رویدادها ───────────────────────────────────────── */
  document.addEventListener("click", function (e) {
    var t = e.target && e.target.closest ? e.target.closest("[data-rn]") : null;
    if (t) {
      e.preventDefault();
      var a = t.getAttribute("data-rn");
      if (a === "goplay") return open(true);
      if (a === "retry") return location.reload();
      if (a === "hide") { var b = el("rnNet"); if (b) b.classList.remove("on"); return; }
      if (a === "close") return close();
      if (a === "start") { var c = el("rnCtr"); if (c) c.classList.add("hide"); return start(); }
      if (a === "menu") return menu();
      if (a === "resume") return pause(false);
      if (a === "pause") return pause();
      if (a === "sound") { G.mute = !G.mute; lsSet(MUTE, G.mute ? "1" : "0"); paintSound(); return; }
      if (a === "jump") return jump();
      if (a === "duck") { duck(true); setTimeout(function () { duck(false); }, 420); return; }
      return;
    }
    var d = e.target && e.target.closest ? e.target.closest("[data-rn-diff]") : null;
    if (d) {
      e.preventDefault();
      G.diff = d.getAttribute("data-rn-diff");
      lsSet(DIFF, G.diff);
      loadBest();
      if (G.state === "over") paintOver(); else paintMenu();
      paintHud(true);
    }
  });

  function jumpKey(e) {
    return e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW" ||
      e.key === " " || e.key === "ArrowUp" || e.key === "w" || e.key === "W";
  }
  function duckKey(e) {
    return e.code === "ArrowDown" || e.code === "KeyS" ||
      e.key === "ArrowDown" || e.key === "s" || e.key === "S";
  }
  window.addEventListener("keydown", function (e) {
    if (!G.on) return;
    if (jumpKey(e)) {
      e.preventDefault(); e.stopPropagation();
      if (!e.repeat) jump();
      return;
    }
    if (duckKey(e)) { e.preventDefault(); e.stopPropagation(); duck(true); return; }
    if (e.key === "p" || e.key === "P") { e.preventDefault(); pause(); }
    else if (e.key === "r" || e.key === "R") { e.preventDefault(); start(); }
    else if (e.key === "m" || e.key === "M") { G.mute = !G.mute; lsSet(MUTE, G.mute ? "1" : "0"); paintSound(); }
    else if (e.key === "Escape") { e.preventDefault(); close(); }
  }, true);
  window.addEventListener("keyup", function (e) {
    if (!G.on) return;
    if (jumpKey(e)) { e.preventDefault(); e.stopPropagation(); cutJump(); }
    else if (duckKey(e)) { e.preventDefault(); e.stopPropagation(); duck(false); }
  }, true);

  document.addEventListener("pointerdown", function (e) {
    if (!G.on) return;
    if (e.target && e.target.id === "rnCv") { e.preventDefault(); jump(); }
  });

  window.addEventListener("resize", function () { if (G.on) size(); });
  window.addEventListener("orientationchange", function () { setTimeout(function () { if (G.on) size(); }, 200); });
  document.addEventListener("visibilitychange", function () {
    if (G.on && document.hidden && G.state === "run") pause(true);
  });

  window.addEventListener("offline", netPaint);
  window.addEventListener("online", netPaint);

  /* ── ۱۶. راه‌اندازی ─────────────────────────────────────── */
  function boot() {
    css();
    banner();
    netPaint();
    G.mute = ls(MUTE, "0") === "1";
    var saved = ls(DIFF, "normal");
    G.diff = DIFFS[saved] ? saved : "normal";
    loadBest();
    if (window.__rnOpenGame) { window.__rnOpenGame = false; open(true); }
  }

  window.RoninGame = {
    open: open, close: close, start: start, menu: menu, pause: pause,
    jump: jump, duck: duck, state: G, player: P, diffs: DIFFS
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
