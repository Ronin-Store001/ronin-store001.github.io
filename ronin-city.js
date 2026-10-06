/* ═══════════════════════════════════════════════════════════════
   RONIN CITY v5  ·  ronin-city.js
   پس‌زمینه‌ی کامل شهر انیمه‌ای زنده — جای animebg.js را می‌گیرد.
   همه‌چیز یکبار رندر می‌شود؛ هر فریم فقط چند blit سبک.
   ═══════════════════════════════════════════════════════════════ */
"use strict";
(function () {
  var D = document, E = D.documentElement;
  var RM = false;
  try { RM = matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) {}
  var MOB = innerWidth < 760 || /Mobi|Android/i.test(navigator.userAgent);

  var SIGNS = [
    ["RONIN", "34,211,238"], ["アニメ", "255,79,207"], ["NEON", "124,92,255"],
    ["ラーメン", "255,214,107"], ["東京", "255,150,90"], ["忍者", "34,211,238"],
    ["寿司", "255,120,150"], ["カフェ", "110,230,180"]
  ];

  var PAL = {
    dark: {
      sky: [[0, "#1c1546"], [.40, "#0b0a26"], [1, "#03040c"]],
      star: 1, moon: 1, glow: "rgba(124,92,255,.30)", street: "rgba(4,6,18,.97)",
      L: [
        { c1: "#1a2054", c2: "#0b0e2a", ed: "rgba(130,170,255,.45)", wc: "150,180,255", lit: .34, cols: 16, h: .30, s: .10 },
        { c1: "#141a40", c2: "#080b20", ed: "rgba(90,220,255,.50)", wc: "110,215,255", lit: .42, cols: 12, h: .44, s: .14 },
        { c1: "#0e1229", c2: "#05071a", ed: "rgba(180,120,255,.55)", wc: "185,140,255", lit: .50, cols: 9, h: .58, s: .18 }
      ]
    },
    light: {
      sky: [[0, "#ccd7f6"], [.45, "#e4eafb"], [1, "#f8f9ff"]],
      star: 0, moon: 0, glow: "rgba(255,214,170,.42)", street: "rgba(196,204,230,.94)",
      L: [
        { c1: "#c7d2ef", c2: "#a8b4dc", ed: "rgba(120,110,255,.40)", wc: "110,100,220", lit: .18, cols: 16, h: .30, s: .10 },
        { c1: "#b4c1e7", c2: "#93a2cf", ed: "rgba(34,150,205,.45)", wc: "30,120,190", lit: .24, cols: 12, h: .44, s: .14 },
        { c1: "#a0acd7", c2: "#7f8dbc", ed: "rgba(170,90,215,.40)", wc: "140,80,200", lit: .30, cols: 9, h: .58, s: .18 }
      ]
    }
  };

  var W, H2, DPR = 1, OV = 40, LY = 0, LH = 0, TY = 0, seed = 7, cur = "dark", pal = PAL.dark;
  var CV = null, X = null, sky = null, LAY = [], SIG = [], TWK = [], STR = [], strCv = [], TRAIN = null;
  var ptr = { x: 0, y: 0, tx: 0, ty: 0 };
  var raf = 0, lastT = 0, fN = 0, fT = 0, dec = 0, off = false, lite = false, trT = 0;

  function R() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
  function mk(w, h) { var c = D.createElement("canvas"); c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h)); return c; }
  function lin(c, x0, y0, x1, y1, st) {
    var g = c.createLinearGradient(x0, y0, x1, y1);
    for (var i = 0; i < st.length; i++) g.addColorStop(st[i][0], st[i][1]);
    return g;
  }
  function rr(c, x, y, w, h, r) {
    c.beginPath(); c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
  }

  /* ── آسمون ── */
  function buildSky() {
    sky = mk(W + OV * 2, H2);
    var c = sky.getContext("2d");
    c.fillStyle = lin(c, 0, 0, 0, H2, pal.sky); c.fillRect(0, 0, sky.width, H2);
    if (pal.star) {
      var n = MOB ? 90 : 210, i;
      for (i = 0; i < n; i++) {
        var x = R() * sky.width, y = R() * H2 * .72, r = (R() * 1.3 + .3) * DPR;
        c.globalAlpha = R() * .7 + .25; c.fillStyle = "#e8eeff";
        c.beginPath(); c.arc(x, y, r, 0, 6.283); c.fill();
        if (i % 7 === 0 && TWK.length < 26) TWK.push({ s: 1, x: x, y: y, r: r + DPR, ph: R() * 6.28 });
      }
      c.globalAlpha = 1;
    }
    if (pal.moon) {
      var mx = sky.width * .78, my = H2 * .15, mr = Math.min(W, H2) * .055;
      var g = c.createRadialGradient(mx, my, mr * .2, mx, my, mr * 4);
      g.addColorStop(0, "rgba(245,242,255,.55)"); g.addColorStop(.25, "rgba(180,170,255,.18)"); g.addColorStop(1, "transparent");
      c.fillStyle = g; c.beginPath(); c.arc(mx, my, mr * 4, 0, 6.283); c.fill();
      c.fillStyle = "#f6f2ff"; c.beginPath(); c.arc(mx, my, mr, 0, 6.283); c.fill();
      c.fillStyle = "rgba(205,198,238,.4)";
      c.beginPath(); c.arc(mx - mr * .32, my - mr * .18, mr * .17, 0, 6.283); c.fill();
      c.beginPath(); c.arc(mx + mr * .26, my + mr * .24, mr * .12, 0, 6.283); c.fill();
    }
    var hg = c.createRadialGradient(sky.width * .5, H2 * 1.02, H2 * .05, sky.width * .5, H2 * 1.02, H2 * .78);
    hg.addColorStop(0, pal.glow); hg.addColorStop(1, "transparent");
    c.fillStyle = hg; c.fillRect(0, H2 * .34, sky.width, H2 * .66);
  }

  /* ── یک لایه ساختمون ── */
  function buildLayer(p) {
    var cv = mk(W + OV * 2, LH), c = cv.getContext("2d"), tops = [];
    var colW = cv.width / p.cols, gut = Math.max(2, colW * .07), j, ix, iy;
    for (j = 0; j < p.cols; j++) {
      var bw = colW - gut, bx = j * colW + gut * .5;
      var bh = LH * ((p.h + R() * p.s) / .82);
      if (bh > LH) bh = LH;
      var by = LH - bh;
      c.fillStyle = lin(c, 0, by, 0, LH, [[0, p.c1], [.55, p.c1], [1, p.c2]]);
      c.fillRect(bx, by, bw, bh);
      c.fillStyle = p.ed; c.fillRect(bx, by, bw, 1.6 * DPR);
      var g2 = c.createLinearGradient(bx, by, bx + bw, by);
      g2.addColorStop(0, p.ed); g2.addColorStop(.14, "rgba(0,0,0,0)");
      c.fillStyle = g2; c.fillRect(bx, by, bw, bh);
      if (R() < .55) {
        var tw2 = bw * (R() * .18 + .07);
        c.fillStyle = p.c1; c.fillRect(bx + bw * .5 - tw2 * .5, by - tw2, tw2, tw2);
        c.fillStyle = p.ed; c.fillRect(bx + bw * .5 - tw2 * .5, by - tw2, tw2, 1.2 * DPR);
      }
      if (R() < .38) {
        c.strokeStyle = p.ed; c.lineWidth = 1 * DPR;
        c.beginPath(); c.moveTo(bx + bw * .5, by);
        c.lineTo(bx + bw * .5, by - LH * .07 * (R() * .6 + .7)); c.stroke();
      }
      var cw = Math.max(2.2 * DPR, bw / Math.max(3, Math.floor(bw / (9 * DPR)))), ch = cw * 1.5;
      var nx = Math.max(2, Math.floor(bw / (cw * 1.9))), ny = Math.max(3, Math.floor(bh / (ch * 1.9)));
      var padX = (bw - nx * cw * 1.9) / 2 + cw * .5;
      for (ix = 0; ix < nx; ix++) for (iy = 0; iy < ny; iy++) {
        if (R() > p.lit) continue;
        var wx = bx + padX + ix * cw * 1.9, wy = by + ch * 1.2 + iy * ch * 1.9;
        var warm = R() < .22, col = warm ? "255,205,130" : p.wc;
        c.globalAlpha = R() * .5 + .35;
        c.fillStyle = "rgba(" + col + ",1)";
        c.fillRect(wx, wy, cw, ch);
        if (TWK.length < 96 && R() < .0035) {
          TWK.push({ s: 0, x: wx, y: wy, r: cw, r2: ch, c: "rgba(" + col + ",1)", ph: R() * 6.28, z: LAY.length });
        }
      }
      c.globalAlpha = 1;
      tops.push({ x: bx, w: bw, y: by, h: bh });
    }
    return { cv: cv, tops: tops };
  }

  /* ── تابلوهای نئون روی ساختمون ── */
  function buildSigns() {
    for (var li = 1; li < LAY.length; li++) {
      var tops = LAY[li].tops;
      for (var i = 0; i < tops.length; i++) {
        if (R() > .34) continue;
        if (SIG.length >= (MOB ? 5 : 9)) return;
        var b = tops[i], s = SIGNS[Math.floor(R() * SIGNS.length)];
        var sw = Math.min(b.w * .96, (MOB ? 92 : 132) * DPR), sh = sw * .40;
        var sc = mk(sw, sh), c = sc.getContext("2d");
        c.save();
        c.shadowColor = "rgba(" + s[1] + ",0.95)"; c.shadowBlur = 13 * DPR;
        rr(c, 1.5 * DPR, 1.5 * DPR, sw - 3 * DPR, sh - 3 * DPR, 7 * DPR);
        c.fillStyle = cur === "light" ? "rgba(255,255,255,.72)" : "rgba(6,9,25,.66)"; c.fill();
        c.lineWidth = 1.8 * DPR; c.strokeStyle = "rgba(" + s[1] + ",1)"; c.stroke();
        var fs = Math.max(9 * DPR, sh * .5);
        c.font = "900 " + fs + "px Vazirmatn, system-ui, sans-serif";
        c.textAlign = "center"; c.textBaseline = "middle";
        c.fillStyle = "rgba(" + s[1] + ",1)";
        c.fillText(s[0], sw / 2, sh / 2 + fs * .04);
        c.restore();
        SIG.push({ cv: sc, x: b.x + (b.w - sw) / 2, y: b.y + b.h * (.05 + R() * .3), li: li, ph: R() * 6.28, fr: R() * 2 + 1 });
      }
    }
  }

  /* ── مسیرهای نور ── */
  function buildStreaks() {
    strCv = ["255,120,220", "90,200,255", "255,214,120"].map(function (cc) {
      var cv = mk(128, 6), x = cv.getContext("2d");
      x.fillStyle = lin(x, 0, 0, 128, 0, [[0, "rgba(" + cc + ",0)"], [.5, "rgba(" + cc + ",1)"], [1, "rgba(" + cc + ",0)"]]);
      x.fillRect(0, 0, 128, 6); return cv;
    });
    STR = [];
    var n = MOB ? 3 : 7;
    for (var i = 0; i < n; i++) STR.push({
      x: R() * W, y: H2 * (.80 + R() * .12), len: (R() * .28 + .12) * W,
      sp: (R() * 2.2 + 1.6) * DPR * (R() < .5 ? -1 : 1), a: R() * .4 + .3, c: Math.floor(R() * 3)
    });
  }

  /* ── قطار ── */
  function buildTrain() {
    var tw = Math.min(W * .42, 520 * DPR), th = Math.max(16 * DPR, W * .014);
    TRAIN = mk(tw, th);
    var c = TRAIN.getContext("2d");
    c.fillStyle = lin(c, 0, 0, 0, th, [[0, cur === "light" ? "#8b96be" : "#1c2554"], [1, cur === "light" ? "#6d78a4" : "#0a0f28"]]);
    rr(c, 0, 0, tw, th, 5 * DPR); c.fill();
    c.strokeStyle = "rgba(34,211,238,.75)"; c.lineWidth = 1.4 * DPR; rr(c, 0, 0, tw, th, 5 * DPR); c.stroke();
    c.fillStyle = "rgba(255,240,190,.95)";
    for (var x = 8 * DPR; x < tw - 14 * DPR; x += 22 * DPR) c.fillRect(x, th * .3, 11 * DPR, th * .34);
  }

  /* ── ساخت کامل ── */
  function build() {
    seed = 7;
    var dpr = Math.min(devicePixelRatio || 1, MOB ? 1.5 : 2);
    var px = (innerWidth || 1) * (innerHeight || 1), cap = 2000000;
    if (px * dpr * dpr > cap) dpr = Math.max(1, Math.sqrt(cap / px));
    DPR = dpr;
    W = Math.round(innerWidth * DPR); H2 = Math.round(innerHeight * DPR);
    OV = Math.round(40 * DPR); LY = Math.round(H2 * .18); LH = H2 - LY; TY = Math.round(H2 * .755);
    CV.width = W; CV.height = H2; X = CV.getContext("2d");
    pal = PAL[cur]; TWK = []; SIG = []; LAY = []; STR = []; strCv = []; TRAIN = null;
    buildSky();
    for (var i = 0; i < pal.L.length; i++) LAY.push(buildLayer(pal.L[i]));
    buildSigns(); buildStreaks(); buildTrain();
    draw(900, true, 16.7);
  }

  /* ── رسم ── */
  function draw(t, still, dt) {
    if (still) { ptr.x = ptr.tx * .6; ptr.y = ptr.ty * .6; }
    else { ptr.x += (ptr.tx - ptr.x) * .055; ptr.y += (ptr.ty - ptr.y) * .055; }
    var tm = t * .001, i, w, a, ox;

    X.clearRect(0, 0, W, H2);
    X.drawImage(sky, -OV + ptr.x * -6 * DPR, ptr.y * -4 * DPR);
    for (i = 0; i < LAY.length; i++) X.drawImage(LAY[i].cv, -OV + ptr.x * (-20 - i * 9) * DPR, LY);

    for (i = 0; i < TWK.length; i++) {
      w = TWK[i];
      ox = w.s ? ptr.x * -6 * DPR : ptr.x * (-20 - w.z * 9) * DPR;
      a = still ? .55 : (.32 + .55 * Math.abs(Math.sin(tm * 1.1 + w.ph)));
      X.globalAlpha = a;
      if (w.s) {
        X.fillStyle = "#eef3ff";
        X.beginPath(); X.arc(-OV + ox + w.x, w.y + ptr.y * -4 * DPR, w.r, 0, 6.283); X.fill();
      } else {
        X.fillStyle = w.c; X.fillRect(-OV + ox + w.x, LY + w.y, w.r, w.r2);
      }
    }
    X.globalAlpha = 1;

    for (i = 0; i < SIG.length; i++) {
      var s = SIG[i]; ox = ptr.x * (-20 - s.li * 9) * DPR; a = 1;
      if (!still) {
        var fl = Math.sin(tm * 7.3 * s.fr + s.ph) * Math.sin(tm * 2.1 + s.ph * 2);
        if (fl > .90) a = .35 + Math.random() * .4;
      }
      X.globalAlpha = a;
      X.drawImage(s.cv, -OV + ox + s.x, LY + s.y + (still ? 0 : Math.sin(tm * s.fr + s.ph) * 2 * DPR));
    }
    X.globalAlpha = 1;

    for (i = 0; i < STR.length; i++) {
      var k = STR[i];
      if (!still) {
        k.x += k.sp * (dt / 16.7);
        if (k.sp > 0 && k.x > W + k.len) k.x = -k.len;
        if (k.sp < 0 && k.x < -k.len) k.x = W + k.len;
      }
      X.globalAlpha = k.a;
      X.drawImage(strCv[k.c], k.x, k.y, k.len, 2.6 * DPR);
    }
    X.globalAlpha = 1;

    if (!still && TRAIN) {
      trT += dt; var ph2 = trT % 17000;
      if (ph2 < 5000) X.drawImage(TRAIN, W + 60 * DPR - (ph2 / 5000) * (W + TRAIN.width + 120 * DPR), TY);
    }

    var sg = X.createLinearGradient(0, H2 * .66, 0, H2);
    sg.addColorStop(0, "rgba(0,0,0,0)"); sg.addColorStop(1, pal.street);
    X.fillStyle = sg; X.fillRect(0, H2 * .66, W, H2 * .34);
  }

  function frame(t) {
    if (off || RM || lite) { raf = 0; return; }
    var dt = t - lastT; if (!(dt > 0) || dt > 220) dt = 16.7;
    lastT = t;
    fN++; fT += dt;
    if (fT > 1400) {
      var fps = 1000 / (fT / fN); fT = 0; fN = 0;
      if (fps < 40 && dec < 2) {
        dec++; E.classList.add("rc-lite" + dec);
        if (dec === 2 && TWK.length > 26) TWK = TWK.slice(0, 26);
      }
    }
    draw(t, false, dt);
    raf = requestAnimationFrame(frame);
  }
  function start() { if (RM || lite || off || raf) return; lastT = performance.now(); raf = requestAnimationFrame(frame); }
  function stop() { if (raf) { cancelAnimationFrame(raf); raf = 0; } }

  /* ── CSS ── */
  function css() {
    if (D.getElementById("rc-css")) return;
    var st = D.createElement("style"); st.id = "rc-css";
    st.textContent =
      "#rcCanvas{position:fixed;inset:0;z-index:-5;pointer-events:none;width:100%;height:100%}" +
      "#rcFog{position:fixed;inset:0;z-index:-4;pointer-events:none;overflow:hidden}" +
      "#rcFog i{position:absolute;border-radius:50%;filter:blur(46px);opacity:.40;mix-blend-mode:screen;animation:rcDrift 30s ease-in-out infinite alternate}" +
      "#rcFog i.a{width:60vw;height:32vh;right:-12vw;top:22%;background:radial-gradient(circle,rgba(124,92,255,.5),transparent 68%)}" +
      "#rcFog i.b{width:52vw;height:28vh;left:-14vw;top:48%;background:radial-gradient(circle,rgba(34,211,238,.42),transparent 68%);animation-delay:-11s}" +
      "@keyframes rcDrift{from{transform:translateX(0)}to{transform:translateX(7vw)}}" +
      "#rcRain{position:fixed;inset:0;z-index:-4;pointer-events:none;overflow:hidden}" +
      "#rcRain i{position:absolute;inset:-30% -10%;display:block;opacity:.26;" +
      "background-image:repeating-linear-gradient(104deg,rgba(190,225,255,.5) 0 1px,transparent 1px 26px);animation:rcRainf .6s linear infinite}" +
      "#rcRain i.b{opacity:.14;transform:scale(1.6);animation-duration:1s;" +
      "background-image:repeating-linear-gradient(100deg,rgba(255,255,255,.4) 0 1px,transparent 1px 46px)}" +
      "@keyframes rcRainf{from{background-position:0 0}to{background-position:-5px 62px}}" +
      "#rcVig{position:fixed;inset:0;z-index:-3;pointer-events:none;" +
      "background:radial-gradient(ellipse at 50% 18%,transparent 32%,rgba(2,3,10,.86))}" +
      'html[data-theme="light"] #rcVig{background:radial-gradient(ellipse at 50% 22%,transparent 42%,rgba(206,214,240,.5))}' +
      "html.rc-on #city,html.rc-on #rbCanvas,html.rc-on #rbVig{display:none!important}" +
      "html.rc-on body{background-color:transparent!important;background-image:none!important}" +
      "html.lite #rcFog,html.lite #rcRain{display:none!important}" +
      "html.rc-lite1 #rcFog,html.rc-lite1 #rcRain i.b{display:none!important}" +
      "@media(prefers-reduced-motion:reduce){#rcFog i,#rcRain i{animation:none!important}}";
    D.head.appendChild(st);
  }

  function makeDom() {
    CV = D.createElement("canvas"); CV.id = "rcCanvas";
    var fog = D.createElement("div"); fog.id = "rcFog"; fog.innerHTML = '<i class="a"></i><i class="b"></i>';
    var rain = D.createElement("div"); rain.id = "rcRain"; rain.innerHTML = '<i></i><i class="b"></i>';
    var vig = D.createElement("div"); vig.id = "rcVig";
    D.body.appendChild(CV); D.body.appendChild(fog); D.body.appendChild(rain); D.body.appendChild(vig);
  }

  function init() {
    css(); makeDom();
    lite = E.classList.contains("lite") || (D.body && D.body.classList.contains("lite"));
    cur = E.dataset.theme === "light" ? "light" : "dark";
    build();
    E.classList.add("rc-on");                 /* فقط بعد از موفقیت، پس‌زمینه‌ی قدیمی پنهان می‌شود */
    if (!RM && !lite) start();

    try {
      new MutationObserver(function () {
        var t2 = E.dataset.theme === "light" ? "light" : "dark";
        if (t2 === cur) return;
        cur = t2; build(); if (!RM && !lite) start();
      }).observe(E, { attributes: true, attributeFilter: ["data-theme"] });

      new MutationObserver(function () {
        var l = E.classList.contains("lite") || (D.body && D.body.classList.contains("lite"));
        if (l === lite) return;
        lite = l;
        if (lite) { stop(); draw(900, true, 16.7); } else { start(); }
      }).observe(E, { attributes: true, attributeFilter: ["class"] });
    } catch (e) {}

    var rt; addEventListener("resize", function () {
      clearTimeout(rt); rt = setTimeout(function () { build(); if (!RM && !lite) start(); }, 220);
    }, { passive: true });

    D.addEventListener("visibilitychange", function () { off = D.hidden; if (off) stop(); else start(); });

    addEventListener("pointermove", function (e) {
      ptr.tx = (e.clientX / innerWidth - .5) * 1.4;
      ptr.ty = (e.clientY / innerHeight - .5) * 1.4;
    }, { passive: true });
    addEventListener("deviceorientation", function (e) {
      if (e.gamma == null) return;
      ptr.tx = Math.max(-1, Math.min(1, e.gamma / 40));
      ptr.ty = Math.max(-1, Math.min(1, (e.beta - 45) / 45));
    }, { passive: true });
  }

  function ready() { try { init(); } catch (err) { E.classList.remove("rc-on"); } }
  if (D.readyState === "loading") D.addEventListener("DOMContentLoaded", ready);
  else ready();
})();
