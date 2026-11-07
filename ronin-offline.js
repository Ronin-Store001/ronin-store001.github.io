/* ═══════════════════════════════════════════════════════════════
   RONIN STORE — OFFLINE + GAME · ronin-offline.js · v1
   ───────────────────────────────────────────────────────────────
   • صفحهٔ «آفلاین» با تم رونین (نوار بالا + کارت وسط)
   • بازی «شوریکن رانر»: دوندهٔ نئونی مثل دایناسور کروم
   • رکورد در localStorage • صدا با WebAudio • کنترل کیبورد و لمس
   • بدون وابستگی به R — روی offline.html هم کار می‌کند
   ═══════════════════════════════════════════════════════════════ */
"use strict";
(function () {
  if (window.__roninOff) return;
  window.__roninOff = true;

  var HI = "ronin_hi", MUTE = "ronin_mute";
  var G = {
    on: false, over: false, paused: false, score: 0, best: 0, speed: 1,
    t: 0, ob: [], coins: [], parts: [], dust: [], shake: 0, night: 0,
    raf: 0, last: 0, started: false, mute: false, dpr: 1
  };
  var P = { x: 96, y: 0, vy: 0, w: 34, h: 52, duck: false, jumps: 0, run: 0 };

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
      ".rnNet{position:fixed;top:0;inset-inline:0;z-index:9100;display:flex;align-items:center;gap:8px;" +
        "justify-content:center;padding:8px 12px;font-size:11.5px;font-weight:800;font-family:inherit;" +
        "color:#1a0b12;background:linear-gradient(90deg,#ffb03a,#ff5470);" +
        "box-shadow:0 10px 30px -14px rgba(255,84,112,.9);transform:translateY(-120%);" +
        "transition:transform .35s cubic-bezier(.16,1,.3,1)}",
      ".rnNet.on{transform:none}",
      ".rnNet button{cursor:pointer;border:0;border-radius:9px;padding:5px 10px;font-family:inherit;" +
        "font-size:11px;font-weight:900;color:#fff;background:rgba(0,0,0,.28)}",
      ".rnNet button:active{transform:scale(.96)}",

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
      "#rnOff .rnTip{font-size:10px;color:#8f9ac0;text-align:center;padding:0 12px 10px}",
      "@media(max-width:560px){#rnOff .rnBody{padding:10px;gap:10px}#rnOff .rnIntro h2{font-size:16px}}",
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
      b.innerHTML = '<span>📴 آفلاین شدی — می‌تونی بازی کنی</span>' +
        '<button type="button" data-rn="play">🎮 بازی</button>' +
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
    if (off) document.body.style.paddingTop = Math.max(0, b.offsetHeight - 6) + "px";
    else document.body.style.paddingTop = "";
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
        '<button class="ico" type="button" data-rn="sound" title="صدا">🔊</button>' +
        '<button class="ico" type="button" data-rn="close" title="بستن">✕</button>' +
      "</div>" +
      '<div class="rnBody">' +
        '<div class="rnIntro">' +
          "<h2>اینترنت قطع شده — وقت بازی است</h2>" +
          "<p>با فاصله/↑ بپر، دوبار بپر تا دوبل‌جامپ بزنی، با ↓ سر خم کن. سکه‌ها را بگیر و تا جای ممکن زنده بمان.</p>" +
          '<div class="rnRow">' +
            '<button class="rnBtn p" type="button" data-rn="start">شروع بازی 🎮</button>' +
            '<button class="rnBtn" type="button" data-rn="retry">↺ اتصال را چک کن</button>' +
          "</div>" +
        "</div>" +
        '<div class="rnStage">' +
          '<canvas id="rnCv"></canvas>' +
          '<div class="rnHud"><span id="rnScore">۰</span><span id="rnBest">رکورد ۰</span><span class="sp"></span></div>' +
          '<div class="rnCtr" id="rnCtr"><h3>آماده‌ای؟</h3>' +
            '<div class="s">فاصله یا ↑ = پرش • ↓ = خم • P = توقف</div>' +
            '<button class="rnBtn p" type="button" data-rn="start">شروع</button></div>' +
        "</div>" +
        '<div class="rnPads">' +
          '<button class="rnPad" type="button" data-rn="jump">⬆ پرش</button>' +
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
    G.ob = []; G.coins = []; G.parts = []; G.dust = [];
    G.score = 0; G.speed = 1; G.t = 0; G.over = false; G.paused = false;
    G.shake = 0; G.night = 0; G.started = true;
    P.y = GY - P.h; P.vy = 0; P.duck = false; P.jumps = 0;
    spawn(0);
    hud();
    var c = el("rnCtr"); if (c) c.classList.add("hide");
  }

  function spawn(extra) {
    var gap = Math.max(230, 470 - G.score * 0.05 - Math.random() * 140) + (extra || 0);
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

  function jump() {
    if (!G.started || G.over) { if (G.over) { reset(); } else { start(); } return; }
    if (P.jumps >= 2) return;
    P.vy = P.jumps === 0 ? -940 : -800;
    P.jumps++;
    P.duck = false;
    beep(P.jumps === 1 ? 520 : 660, 0.06);
    for (var i = 0; i < 7; i++) {
      G.dust.push({ x: P.x + P.w / 2, y: GY, vx: (Math.random() - 0.5) * 160, vy: -Math.random() * 90,
        life: 0.5, max: 0.5, r: 2 + Math.random() * 2 });
    }
  }
  function duck(on) {
    if (!G.started || G.over) return;
    P.duck = !!on && P.y + P.h >= GY - 1;
  }

  function hit(o) {
    var ph = P.duck ? 30 : P.h;
    var py = GY - ph;
    return P.x + P.w > o.x + 4 && P.x < o.x + o.w - 4 &&
      py + ph > o.y + 4 && py < o.y + o.h - 4;
  }

  function die() {
    if (G.over) return;
    G.over = true;
    G.shake = 1;
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

    P.vy += 2600 * dt;
    P.y += P.vy * dt;
    if (P.y >= GY - P.h) { P.y = GY - P.h; P.vy = 0; P.jumps = 0; }
    P.run += dt * (6 + G.speed * 4);

    var px = 300 * dt * G.speed;
    var i, o;
    for (i = 0; i < G.ob.length; i++) {
      o = G.ob[i];
      o.x -= px + dt * 40;
      if (o.fly) o.spin += dt * 9;
      if (hit(o)) return die();
    }
    G.ob = G.ob.filter(function (x) { return x.x > -80; });
    var last = G.ob.length ? Math.max.apply(null, G.ob.map(function (x) { return x.x; })) : 0;
    if (last < W - 120 || !G.ob.length) spawn(0);

    for (i = 0; i < G.coins.length; i++) {
      var c = G.coins[i];
      c.x -= px;
      c.spin = (c.spin || 0) + dt * 6;
      var dx = (P.x + P.w / 2) - c.x, dy = (GY - (P.duck ? 15 : P.h / 2)) - c.y;
      if (dx * dx + dy * dy < (c.r + 24) * (c.r + 24) && !c.got) {
        c.got = 1; G.score += 25; beep(880, 0.06);
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
    var a = el("rnScore"), b = el("rnBest");
    if (a) a.textContent = "امتیاز " + num(G.score);
    if (b) b.textContent = "رکورد " + num(Math.max(G.best, G.score));
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

    /* بازیکن */
    drawRunner();

    /* ذرات */
    G.parts.forEach(function (d) {
      cx.globalAlpha = Math.max(0, d.life / d.max);
      cx.fillStyle = "#ffb03a";
      cx.fillRect(d.x, d.y, d.r, d.r);
    });
    cx.globalAlpha = 1;
    cx.restore();
  }

  function drawRunner() {
    var ph = P.duck ? 30 : P.h;
    var px = P.x, py = GY - ph;
    var leg = Math.sin(P.run) * (P.y + P.h >= GY - 1 ? 7 : 3);

    cx.save();
    /* هاله */
    cx.fillStyle = "rgba(124,92,255,.22)";
    cx.beginPath(); cx.ellipse(px + P.w / 2, GY + 2, 26, 7, 0, 0, 7); cx.fill();

    /* شال */
    cx.strokeStyle = "#ff5470"; cx.lineWidth = 4; cx.lineCap = "round";
    cx.beginPath();
    cx.moveTo(px + 6, py + 16);
    cx.quadraticCurveTo(px - 18, py + 14 + Math.sin(P.run) * 4, px - 30, py + 30);
    cx.stroke();

    /* بدن */
    var g = cx.createLinearGradient(px, py, px + P.w, py + ph);
    g.addColorStop(0, "#cfd6ff");
    g.addColorStop(1, "#7c5cff");
    cx.fillStyle = g;
    cx.beginPath();
    if (cx.roundRect) cx.roundRect(px, py, P.w, ph, 9);
    else cx.rect(px, py, P.w, ph);
    cx.fill();

    /* سر و کلاه */
    cx.fillStyle = "#0b1022";
    cx.beginPath(); cx.arc(px + P.w / 2, py + 12, 10, 0, 7); cx.fill();
    cx.fillStyle = "#ffb03a";
    cx.fillRect(px + P.w / 2 - 12, py + 6, 24, 4);

    /* چشم */
    cx.fillStyle = "#8fe9ff";
    cx.fillRect(px + P.w / 2 + 2, py + 12, 4, 3);

    /* پاها */
    cx.strokeStyle = "#dfe6ff"; cx.lineWidth = 5; cx.lineCap = "round";
    cx.beginPath();
    cx.moveTo(px + 10, py + ph - 2); cx.lineTo(px + 10 + leg, GY);
    cx.moveTo(px + P.w - 12, py + ph - 2); cx.lineTo(px + P.w - 12 - leg, GY);
    cx.stroke();

    /* شمشیر */
    cx.strokeStyle = "#8fe9ff"; cx.lineWidth = 2;
    cx.beginPath(); cx.moveTo(px + P.w - 6, py + 20); cx.lineTo(px + P.w + 16, py + 6); cx.stroke();
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

  /* ── ۹. ورودی‌ها ────────────────────────────────────────── */
  document.addEventListener("click", function (e) {
    var t = e.target && e.target.closest ? e.target.closest("[data-rn]") : null;
    if (!t) return;
    e.preventDefault();
    var a = t.getAttribute("data-rn");
    if (a === "play") { open(true); }
    else if (a === "retry") { location.reload(); }
    else if (a === "x") { var b = el("rnNet"); if (b) b.classList.remove("on"); document.body.style.paddingTop = ""; }
    else if (a === "close") { close(); }
    else if (a === "start") { start(); }
    else if (a === "sound") { G.mute = !G.mute; lsSet(MUTE, G.mute ? "1" : "0"); paintSound(); }
    else if (a === "jump") { jump(); }
    else if (a === "duck") { duck(true); setTimeout(function () { duck(false); }, 420); }
  });

  document.addEventListener("keydown", function (e) {
    if (!G.on) return;
    var k = e.key;
    if (k === " " || k === "ArrowUp" || k === "w" || k === "W") { e.preventDefault(); jump(); }
    else if (k === "ArrowDown" || k === "s" || k === "S") { e.preventDefault(); duck(true); }
    else if (k === "p" || k === "P") { G.paused = !G.paused; }
    else if (k === "Escape") { close(); }
    else if (k === "r" || k === "R") { reset(); }
  });
  document.addEventListener("keyup", function (e) {
    if (!G.on) return;
    if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") duck(false);
  });

  /* لمس روی بوم = پرش */
  document.addEventListener("pointerdown", function (e) {
    if (!G.on || !e.target) return;
    if (e.target.id === "rnCv") { e.preventDefault(); jump(); }
  });

  window.addEventListener("resize", function () { if (G.on) { size(); } });
  document.addEventListener("visibilitychange", function () {
    if (G.on && document.hidden) G.paused = true;
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

  window.RoninGame = { open: open, close: close, start: start, state: G, player: P };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
