/* ═══════════════════════════════════════════════════════════════
   RONIN STORE — COMPANION CORE (pack2) v4
   🥷 کاراکتر راهنما + 🥷 آرشیو همراه
   ۶ اسکین — هر کدام شخصیت، احساسات و حرکت خودش را دارد
   نینجای زرد قبلی (ناروتو) هم در پیش‌فرض‌ها هست
   ═══════════════════════════════════════════════════════════════ */
"use strict";
(function () {
if (!window.R) { console.error("[pack2] R نیست"); return; }

/* ── ۰. استایل ─────────────────────────────────────────────── */
if (!document.getElementById("pack2-css")) {
  var st = document.createElement("style");
  st.id = "pack2-css";
  st.textContent =
    "#gninja svg{filter:drop-shadow(0 6px 14px rgba(0,0,0,.5))}" +
    "#njHead{transform-box:fill-box;transform-origin:50% 100%}" +
    "#njArm{transform-box:fill-box;transform-origin:50% 94%}" +
    /* کارت آرشیو */
    ".carc{position:relative;display:flex;flex-direction:column;align-items:center;gap:4px;" +
      "padding:12px 9px;border-radius:18px;background:rgba(11,13,35,.7);" +
      "border:1px solid rgba(132,124,255,.22);transition:.2s;cursor:pointer}" +
    ".carc:hover{border-color:rgba(34,211,238,.55);transform:translateY(-3px)}" +
    ".carc.on{border-color:#ffd66b;box-shadow:0 0 18px rgba(255,214,107,.35)}" +
    ".carc .cw{width:66px;height:80px;display:grid;place-items:center;overflow:hidden}" +
    ".carc .cw svg{width:100%;height:100%;filter:drop-shadow(0 4px 8px rgba(0,0,0,.4))}" +
    ".carc .cn{font-size:12px;font-weight:800}" +
    ".carc .cr{font-size:10px;color:#a8a7c3;text-align:center;line-height:1.7}" +
    ".carc.lk{opacity:.55}" +
    ".carc .lk2{position:absolute;top:7px;inset-inline-end:7px;font-size:11px}" +
    "#archWall .cw .ja{fill:var(--ja)}#archWall .cw .jb{fill:var(--jb)}" +
    "#archWall .cw .jc{fill:var(--jc)}" +
    /* انیمیشن سر — مخصوص هر شخصیت */
    "@keyframes p2bob{0%,100%{transform:rotate(0)}50%{transform:rotate(3deg)}}" +
    "@keyframes p2sway{0%,100%{transform:rotate(-3.5deg)}50%{transform:rotate(4.5deg)}}" +
    "@keyframes p2twitch{0%,82%,100%{transform:rotate(0)}86%{transform:rotate(-6deg)}91%{transform:rotate(4deg)}}" +
    "@keyframes p2float{0%,100%{transform:translateY(0)}50%{transform:translateY(-3.5px)}}" +
    "@keyframes p2scan{0%,100%{transform:translate(0,0)}25%{transform:translate(1.6px,-1.2px)}" +
      "50%{transform:translate(-1.6px,1.2px)}75%{transform:translate(1.2px,1.2px)}}" +
    "@keyframes p2arm{0%,100%{transform:rotate(-4deg)}50%{transform:rotate(-15deg)}}" +
    "#gninja[data-skin=naruto] #njHead{animation:p2bob 2.1s ease-in-out infinite}" +
    "#gninja[data-skin=ninja] #njHead{animation:p2bob 3.4s ease-in-out infinite}" +
    "#gninja[data-skin=kitsune] #njHead{animation:p2sway 3.6s ease-in-out infinite}" +
    "#gninja[data-skin=neko] #njHead{animation:p2twitch 4.4s ease-in-out infinite}" +
    "#gninja[data-skin=yuki] #njHead{animation:p2float 4.6s ease-in-out infinite}" +
    "#gninja[data-skin=meka] #njHead{animation:p2scan 2.4s steps(2,end) infinite}" +
    "#gninja[data-skin=naruto] #njArm{animation:p2arm 1.2s ease-in-out infinite}" +
    "#gninja[data-skin=ninja] #njArm{animation:p2arm 2.8s ease-in-out infinite}" +
    "#gninja[data-skin=kitsune] #njArm{animation:p2arm 2.1s ease-in-out infinite}" +
    "#gninja[data-skin=neko] #njArm{animation:p2arm 3.6s ease-in-out infinite}" +
    "#gninja[data-skin=yuki] #njArm{animation:p2arm 4.2s ease-in-out infinite}" +
    "#gninja[data-skin=meka] #njArm{animation:p2arm 1.8s steps(3,end) infinite}" +
    "#gninja.wave #njArm{animation:njWave .36s ease-in-out 5!important}" +
    /* حرکت‌های کل بدن */
    "@keyframes p2jump{0%,100%{transform:translateY(0)}28%{transform:translateY(-10px)}" +
      "52%{transform:translateY(0)}72%{transform:translateY(-4px)}}" +
    "@keyframes p2dash{0%,100%{transform:translateX(0)}22%{transform:translateX(-14px)}" +
      "46%{transform:translateX(0)}70%{transform:translateX(14px)}}" +
    "@keyframes p2spin{0%,100%{transform:rotate(0)}50%{transform:rotate(-14deg) scale(1.04)}}" +
    "@keyframes p2nod{0%,100%{transform:translateY(0)}45%{transform:translateY(0) rotate(-6deg)}}" +
    "@keyframes p2bounce{0%,100%{transform:translateY(0)}35%{transform:translateY(-6px)}" +
      "70%{transform:translateY(-2px)}}" +
    "@keyframes p2shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-3px)}" +
      "40%{transform:translateX(3px)}60%{transform:translateX(-2px)}80%{transform:translateX(2px)}}" +
    "@keyframes p2floatmv{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}" +
    "@media(prefers-reduced-motion:reduce){#gninja #njHead,#gninja #njArm{animation:none!important}}";
  document.head.appendChild(st);
}

/* ── ۱. رنگ هر اسکین (هر کاراکتر رنگ خودش) ────────────────── */
var THEME = {
  naruto:  { a: "#ff8a1f", b: "#e0690f", c: "#2f4a8c" },
  ninja:   { a: "#bdee63", b: "#8ec63f", c: "#22330a" },
  kitsune: { a: "#ff5470", b: "#c9183c", c: "#3d0512" },
  neko:    { a: "#ff9ecb", b: "#e0509a", c: "#3a0b26" },
  yuki:    { a: "#8fe4ff", b: "#35a8d6", c: "#0a2333" },
  meka:    { a: "#b8a6ff", b: "#6a53da", c: "#150f33" }
};

/* ── ۲. شخصیت هر همراه (نام، لقب، حالت روحی، حرف‌ها، حرکت‌ها) ─ */
var CAST = {
  naruto: {
    n: "ناروتو", r: "رایگان", p: false, mood: "پرانرژی",
    move: "p2jump", emo: ["happy", "wow"],
    lines: [
      "داتِ‌بایو! 🍥",
      "من هیچ‌وقت کم نمی‌آرم!",
      "بریم جلو، با هم قوی می‌شیم!",
      "بعد از ماموریت، رامن 🍜",
      "یه بار دیگه هم تلاش می‌کنم!"
    ]
  },
  ninja: {
    n: "رونین", r: "رایگان", p: false, mood: "آرام",
    move: "p2nod", emo: ["happy"],
    lines: [
      "آرام باش، راه هست 🍃",
      "شمشیر نکشیده، راه بده",
      "هر قدم یک تمرین است",
      "قانون رونین: احترام 🥷",
      "نفس بگیر، بعد بزن"
    ]
  },
  kitsune: {
    n: "کیتسونه", r: "پرمیوم", p: true, mood: "شیطان",
    move: "p2spin", emo: ["happy", "wow"],
    lines: [
      "روباه همیشه یک نقشه دارد 🦊",
      "چشم‌هات رو ببند… حالا باز کن ✨",
      "من رنگ سرخ شبه‌ام 🔥",
      "آتش من گرم است، نه سوزان"
    ]
  },
  neko: {
    n: "نِکو", r: "پرمیوم", p: true, mood: "خواب‌آلود",
    move: "p2bounce", emo: ["happy"],
    lines: [
      "میو… پنج دقیقه دیگه 🐾",
      "گوش‌هام همه صداها رو می‌شنوه 🐱",
      "دمم رو تکون بدم؟ 🎀",
      "چرت می‌زنم، صدام کن 💤"
    ]
  },
  yuki: {
    n: "یوکی", r: "پرمیوم", p: true, mood: "سرد و آرام",
    move: "p2floatmv", emo: ["wow"],
    lines: [
      "برف آرام می‌بارد ❄️",
      "سکوت، بلندترین صداست",
      "من از زمستان آمده‌ام",
      "نفس سرد، قلب گرم 🌨"
    ]
  },
  meka: {
    n: "مِکا", r: "پرمیوم", p: true, mood: "محاسبه‌گر",
    move: "p2shake", emo: ["angry", "wow"],
    lines: [
      "سیستم آماده است ⚙️",
      "خطا: صفر — سرعت: بیشینه",
      "اسکن کامل شد 🛰",
      "پروتکل رونین فعال 🔋"
    ]
  }
};

/* ── ۳. اجزای مشترک SVG ───────────────────────────────────── */
var CH = {};

function npcEyes(ec) {
  ec = ec || "#171a2e";
  return '<g class="nEyes">' +
    '<ellipse class="nEye" cx="50" cy="46" rx="3.4" ry="4.2" fill="' + ec + '"/>' +
    '<ellipse class="nEye" cx="70" cy="46" rx="3.4" ry="4.2" fill="' + ec + '"/>' +
    '<circle cx="51.2" cy="44.6" r="1.2" fill="#fff"/>' +
    '<circle cx="71.2" cy="44.6" r="1.2" fill="#fff"/>' +
    '</g>' +
    '<g class="brw" opacity="0">' +
      '<path d="M45 38l9 3" stroke="#2a2e4a" stroke-width="2.4" stroke-linecap="round"/>' +
      '<path d="M75 38l-9 3" stroke="#2a2e4a" stroke-width="2.4" stroke-linecap="round"/>' +
    '</g>';
}
function npcMouth() {
  return '<path class="mN" d="M50 56q10 8 20 0" stroke="#2a2e4a" stroke-width="2.6" fill="none" stroke-linecap="round"/>' +
    '<path class="mH" opacity="0" d="M48 54q12 13 24 0z" fill="#2a2e4a"/>' +
    '<ellipse class="mW" opacity="0" cx="60" cy="59" rx="4.4" ry="5.4" fill="#2a2e4a"/>';
}
function npcBody(o) {
  return '<ellipse cx="60" cy="145" rx="33" ry="6.5" fill="rgba(0,0,0,.45)"/>' +
    '<rect x="44" y="105" width="12" height="34" rx="6" fill="' + o.leg + '"/>' +
    '<rect x="64" y="105" width="12" height="34" rx="6" fill="' + o.leg + '"/>' +
    '<rect x="41" y="132" width="18" height="11" rx="5.5" fill="#101426"/>' +
    '<rect x="61" y="132" width="18" height="11" rx="5.5" fill="#101426"/>' +
    '<path d="M38 62h44a10 10 0 0 1 10 10v34a10 10 0 0 1-10 10H38a10 10 0 0 1-10-10V72a10 10 0 0 1 10-10z" class="ja"/>' +
    '<rect x="58" y="66" width="4" height="46" rx="2" fill="rgba(0,0,0,.16)"/>' +
    '<path d="M40 88h40v8H40z" class="jc"/>';
}
/* دست چپ (با چراغ‌قوه) + دست راست */
function npcArms(face) {
  return '<rect x="72" y="70" width="12" height="30" rx="6" class="jb"/>' +
    '<g id="njArm">' +
      '<rect x="33" y="68" width="13" height="38" rx="6.5" class="ja"/>' +
      '<g class="nTorch" transform="rotate(-16 40 107)">' +
        '<rect x="27" y="103" width="22" height="8" rx="4" fill="#2b3350"/>' +
        '<rect x="22" y="102" width="6" height="10" rx="2" fill="#465273"/>' +
        '<rect x="18.5" y="103" width="4" height="8" rx="2" class="nLens" fill="#93a3bd"/>' +
      '</g>' +
      '<circle cx="46" cy="107" r="7" fill="' + face + '"/>' +
    '</g>';
}
function npcSVG(o) {
  var k = o.k, a = (o.col && o.col.a) || "#bdee63";
  return '<svg viewBox="0 0 120 152" xmlns="http://www.w3.org/2000/svg">' +
    '<defs>' +
      '<linearGradient id="sh-' + k + '" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#fff" stop-opacity=".42"/>' +
        '<stop offset="1" stop-color="#fff" stop-opacity="0"/>' +
      '</linearGradient>' +
      '<radialGradient id="au-' + k + '">' +
        '<stop offset="0" stop-color="' + a + '" stop-opacity=".45"/>' +
        '<stop offset=".6" stop-color="' + a + '" stop-opacity=".12"/>' +
        '<stop offset="1" stop-color="' + a + '" stop-opacity="0"/>' +
      '</radialGradient>' +
    '</defs>' +
    '<circle cx="60" cy="82" r="54" fill="url(#au-' + k + ')"/>' +
    npcBody(o) +
    (o.extra || "") +
    '<g id="njHead">' + o.head + npcEyes(o.eye) + npcMouth() + '</g>' +
    npcArms(o.face) +
    '<path d="M38 62h44a10 10 0 0 1 10 10v7H28v-7a10 10 0 0 1 10-10z" fill="url(#sh-' + k + ')"/>' +
    '</svg>';
}

/* ── ۴. اسکین‌ها ──────────────────────────────────────────── */
function add(id, opt) {
  CH[id] = {
    col: THEME[id], n: CAST[id].n, r: CAST[id].r,
    p: CAST[id].p, mood: CAST[id].mood, html: npcSVG(opt)
  };
}

/* ۰ ▸ ناروتو — نینجای زرد قبلی، رایگان و پیش‌فرض */
add("naruto", {
  k: "naruto", col: THEME.naruto,
  leg: "#2b3d6b", face: "#ffd9b3",
  head:
    '<circle cx="60" cy="42" r="26" fill="#ffd9b3"/>' +
    '<path d="M34 38q-7-24 13-28q4-13 16-7q13-7 18 7q15 3 9 25q-7-11-15-9' +
      'q-3-13-15-11q-11-8-17 4q-10 0-9 19z" fill="#ffcf3f"/>' +
    '<rect x="31" y="25" width="58" height="11" rx="5.5" class="jc"/>' +
    '<rect x="48" y="24" width="24" height="13" rx="3.5" fill="#c9cde0"/>' +
    '<path d="M60 30.5q-5 0-5-3t4-3q5 0 5 4" fill="none" stroke="#7a8099" ' +
      'stroke-width="1.6" stroke-linecap="round"/>' +
    '<path d="M40 52l-7 1M40 57l-7 1M40 62l-7 1M80 52l7 1M80 57l7 1M80 62l7 1" ' +
      'stroke="#d9a06a" stroke-width="1.6" stroke-linecap="round" opacity=".85"/>',
  extra: '<path d="M41 64q19 12 38 0v-9q-19 10-38 0z" fill="#e0690f" opacity=".9"/>'
});

/* ۱ ▸ رونین — رایگان */
add("ninja", {
  k: "ninja", col: THEME.ninja,
  leg: "#26304a", face: "#ffd8b0",
  head:
    '<circle cx="60" cy="42" r="26" fill="#ffd8b0"/>' +
    '<path d="M32 30q28-30 56 0q-28 10-56 0z" class="ja"/>' +
    '<path d="M32 30q28 9 56 0v6q-28 9-56 0z" class="jc"/>' +
    '<path d="M22 31h76" stroke="#0f1a12" stroke-width="3" stroke-linecap="round" class="jb"/>',
  extra: ""
});

/* ۲ ▸ کیتسونه — پرمیوم */
add("kitsune", {
  k: "kitsune", col: THEME.kitsune,
  leg: "#241f38", face: "#f7f3ea",
  head:
    '<path d="M36 28l-5-20 19 11z" fill="#f0d9b5"/><path d="M84 28l5-20-19 11z" fill="#f0d9b5"/>' +
    '<circle cx="60" cy="42" r="26" fill="#f7f3ea"/>' +
    '<path d="M34 40q26-16 52 0q-8-22-26-22t-26 22z" class="ja"/>' +
    '<path d="M60 20v8" stroke="#ffe1e6" stroke-width="3" stroke-linecap="round"/>' +
    '<path d="M47 40l-5 5M73 40l5 5" stroke="#ffe1e6" stroke-width="3" stroke-linecap="round"/>' +
    '<path d="M40 63q20 11 40 0" stroke="#c9183c" stroke-width="3" fill="none" stroke-linecap="round"/>',
  extra:
    '<path d="M84 96q22 2 22-18q0-14-12-18q12 12 2 24q-5 5-12 6z" class="jb"/>'
});

/* ۳ ▸ نِکو — پرمیوم */
add("neko", {
  k: "neko", col: THEME.neko,
  leg: "#2a2233", face: "#ffe2cd",
  head:
    '<path d="M37 26l-3-17 17 9z" class="ja"/><path d="M83 26l3-17-17 9z" class="ja"/>' +
    '<path d="M39 24l-2-12 12 7z" fill="#ffb3c7"/><path d="M81 24l2-12-12 7z" fill="#ffb3c7"/>' +
    '<circle cx="60" cy="42" r="26" fill="#ffe2cd"/>' +
    '<path d="M34 36q26-20 52 0q-6-20-26-20t-26 20z" class="jb"/>' +
    '<path d="M40 52q-8 2-8 8M80 52q8 2 8 8" stroke="#c9a08f" stroke-width="2" fill="none"/>',
  extra:
    '<path d="M86 104q22 2 20-18q-1-8-8-12" stroke="#ff9ecb" stroke-width="5.5" ' +
      'fill="none" stroke-linecap="round" opacity=".95"/>'
});

/* ۴ ▸ یوکی — پرمیوم */
add("yuki", {
  k: "yuki", col: THEME.yuki,
  leg: "#1d2a3d", face: "#dff1ff",
  head:
    '<circle cx="60" cy="42" r="26" fill="#dff1ff"/>' +
    '<path d="M30 44q0-30 30-30t30 30q-30-14-60 0z" class="ja"/>' +
    '<path d="M30 44q30-14 60 0v7q-30-13-60 0z" class="jc"/>' +
    '<path d="M60 10l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" fill="#eaffff"/>' +
    '<path d="M40 63q20 11 40 0" stroke="#7fd7ff" stroke-width="3" fill="none" stroke-linecap="round"/>',
  extra:
    '<path d="M28 76l-5 9 6.5.8z" fill="#e8fbff" opacity=".85"/>' +
    '<path d="M92 82l5 7-6.5 1.5z" fill="#e8fbff" opacity=".7"/>'
});

/* ۵ ▸ مِکا — پرمیوم */
add("meka", {
  k: "meka", col: THEME.meka,
  leg: "#2b3040", face: "#9fb0c9", eye: "#c6ff6b",
  head:
    '<rect x="34" y="18" width="52" height="48" rx="18" fill="#39415c"/>' +
    '<rect x="38" y="34" width="44" height="17" rx="8.5" fill="#0e1428"/>' +
    '<circle cx="50" cy="42.5" r="4" fill="#c6ff6b"/>' +
    '<circle cx="70" cy="42.5" r="4" fill="#c6ff6b"/>' +
    '<rect x="57" y="10" width="6" height="9" rx="3" class="jc"/>' +
    '<circle cx="60" cy="10" r="4" class="jc"/>' +
    '<path d="M46 60h28" stroke="#0e1428" stroke-width="4" stroke-linecap="round"/>',
  extra:
    '<circle cx="60" cy="84" r="5.5" fill="#c6ff6b" opacity=".9"/>' +
    '<circle cx="60" cy="84" r="9" fill="#c6ff6b" opacity=".22"/>'
});

/* ── ۵. کمکی‌ها ───────────────────────────────────────────── */
function av(id) { return CH[id] || CH.naruto; }
function isPrem() {
  return !!(R.prem || R.premium || (R.USER && (R.USER.prem || R.USER.premium)));
}
function curChar() {
  return (R.USER && R.USER.npcChar) || R.npcCharCur || "naruto";
}
function svgOf(id) {
  var c = av(id);
  if (c.html) return c.html;
  return String(R.NPC_SVG || "").replace(/<style>[\s\S]*?<\/style>/, "");
}
function esc(s) { return R.esc ? R.esc(s) : String(s); }
function slow() {
  return !!(R.lite || (window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion:reduce)").matches));
}

/* ── ۶. شخصیت و احساسات ───────────────────────────────────── */
var MOVES = {
  p2jump: 700, p2dash: 900, p2spin: 800, p2nod: 620,
  p2bounce: 760, p2shake: 700, p2floatmv: 1500
};

R.npcPersona = function () { return CAST[curChar()] || CAST.naruto; };

/* حرکت بدن — مخصوص شخصیت یا دستی */
R.npcMove = function (kind) {
  var n = R.$("gninja"); if (!n) return;
  if (slow()) return;
  var pf = R.npcPersona();
  var k = kind || pf.move;
  if (!MOVES[k]) k = pf.move;
  try {
    n.style.animation = "none";
    void n.offsetWidth;                        /* ری‌استارت انیمیشن */
    n.style.animation = k + " " + (MOVES[k] / 1000) + "s ease-in-out";
  } catch (e) { return; }
  clearTimeout(R._mvT);
  R._mvT = setTimeout(function () {
    try { n.style.animation = ""; } catch (e) {}
  }, MOVES[k] + 80);
};

/* احساس + حرکت + حرف، یک‌جا */
R.npcFeel = function (kind, line) {
  var pf = R.npcPersona();
  if (R.npcEmo) { try { R.npcEmo(kind, 1700); } catch (e) {} }
  R.npcMove({ happy: pf.move, wow: "p2spin", angry: "p2shake", sad: "p2nod" }[kind] || pf.move);
  if (line !== false && R.npcSay) {
    R.npcSay(line || pf.lines[Math.floor(Math.random() * pf.lines.length)], 3400);
  }
};

/* تشویق — برای موفقیت‌ها و آنلاک‌ها */
R.npcCheer = function (txt) { R.npcFeel("happy", txt || false); };

/* تپ روی کاراکتر → حرکت و حرف شخصیت خودش */
R.npcFun = function () {
  var pf = R.npcPersona();
  if (R.npcSay) R.npcSay(pf.lines[Math.floor(Math.random() * pf.lines.length)], 3200);
  R.npcMove(pf.move);
  if (R.npcEmo) { try { R.npcEmo(pf.emo[Math.floor(Math.random() * pf.emo.length)], 1400); } catch (e) {} }
};

/* حال‌وهوای خودکار — هر ۴۸ ثانیه یک احساس از شخصیت */
if (!R._moodT) {
  R._moodT = setInterval(function () {
    try {
      if (document.hidden || slow()) return;
      var pf = R.npcPersona();
      if (!pf || !pf.emo || !pf.emo.length) return;
      if (R.npcEmo) R.npcEmo(pf.emo[Math.floor(Math.random() * pf.emo.length)], 2600);
      if (Math.random() < 0.45) R.npcMove(pf.move);
    } catch (e) {}
  }, 48000);
}

/* ── ۷. نقاشی آرشیو ──────────────────────────────────────── */
R.paintArchive = function () {
  var w = R.$("archWall"); if (!w) return;
  var cur = curChar(), prem = isPrem();
  w.innerHTML = Object.keys(CH).map(function (id) {
    var c = CH[id], locked = c.p && !prem;
    return '<div class="carc' + (cur === id ? " on" : "") + (locked ? " lk" : "") +
      '" data-char="' + id + '" title="' + esc(c.mood + " • " + c.r) + '">' +
      (locked ? '<span class="lk2">💎</span>' : "") +
      '<div class="cw" style="--ja:' + c.col.a + ';--jb:' + c.col.b + ';--jc:' + c.col.c + '">' +
        svgOf(id) + '</div>' +
      '<div class="cn">' + esc(c.n) + '</div>' +
      '<div class="cr">' + esc(c.mood) + '</div></div>';
  }).join("");
};

/* ── ۸. انتخاب کاراکتر ───────────────────────────────────── */
R.pickChar = function (id) {
  var c = av(id);
  if (!R.ME) return R.needLogin ? R.needLogin("همراه ویژه") : alert("وارد شو");
  if (c.p && !isPrem()) return R.toast("این همراه مخصوص پرمیوم است 💎", "err");
  R.npcCharCur = id;
  if (R.upd) R.upd("users/" + R.ME, { npcChar: id }).catch(function () {});
  R._cNow = null;
  R.paintArchive();
  if (R.npcApply) R.npcApply();
  var pf = CAST[id] || CAST.naruto;
  if (R.npcSay) R.npcSay(pf.lines[0], 3600);
  R.npcMove(pf.move);
  R.toast(c.n + " انتخاب شد ✅", "ok");
};

/* ── ۹. جایگزینی کاراکتر روی صفحه ────────────────────────── */
var apply0 = R.npcApply;
R.npcApply = function () {
  if (apply0) { try { apply0(); } catch (e) {} }
  try {
    var n = R.$("gninja"); if (!n) return;
    var id = curChar();
    if (av(id).p && !isPrem()) id = "naruto";
    /* رنگ اختصاصی هر اسکین (اگر کاربر پالت خودش را انتخاب نکرده باشد) */
    var picked = !!(R.USER && R.USER.npc);
    var cc = av(id).col;
    if (cc && !picked) {
      n.style.setProperty("--ja", cc.a);
      n.style.setProperty("--jb", cc.b);
      n.style.setProperty("--jc", cc.c);
    }
    n.setAttribute("data-skin", id);
    if (R._cNow === id) return;
    var wrap = document.createElement("div");
    wrap.innerHTML = svgOf(id);
    var nsvg = wrap.querySelector("svg");
    var cur = n.querySelector("svg");
    if (nsvg && cur) { cur.parentNode.replaceChild(nsvg, cur); R._cNow = id; }
  } catch (e) { console.error("[pack2]", e); }
};

/* ── ۱۰. بخش آرشیو + آیتم منو ────────────────────────────── */
function build() {
  if (!R.$("sec-archive")) {
    var all = document.querySelectorAll(".sec");
    var ref = R.$("sec-settings") || R.$("sec-premium") || all[all.length - 1];
    var s = document.createElement("section");
    s.className = "sec"; s.id = "sec-archive";
    s.innerHTML = '<div class="head"><h2 class="h2">🥷 آرشیو همراه</h2>' +
      '<span class="xs mut">هر کدام شخصیت و حرکت خودش را دارد</span></div>' +
      '<div class="grid auto" id="archWall"></div>' +
      '<div class="card mt between">' +
        '<div class="xs mut">💡 رنگ هر همراه را از تنظیمات → پالت کاراکتر عوض کن.</div>' +
        '<button class="btn mini" type="button" data-move="1">🎬 حرکت</button>' +
      '</div>';
    if (ref && ref.parentNode) ref.parentNode.insertBefore(s, ref.nextSibling);
    else document.body.appendChild(s);
  }
  var rail = R.$("rail");
  if (rail && !R.$("archItem")) {
    var it = document.createElement("div");
    it.className = "ditem"; it.id = "archItem";
    it.setAttribute("data-go", "archive");
    it.innerHTML = "<i>🥷</i>آرشیو همراه";
    var base = R.$("dmItem") ||
      rail.querySelector('.ditem[data-go="premium"]') ||
      rail.querySelector('.ditem[data-go="chat"]');
    if (base && base.parentNode) base.parentNode.insertBefore(it, base.nextSibling);
    else rail.appendChild(it);
  }
  if (R.paintArchive) R.paintArchive();
}

/* ── ۱۱. کلیک‌ها ─────────────────────────────────────────── */
document.addEventListener("click", function (e) {
  var t = e.target && e.target.closest ? e.target : null;
  if (!t || !t.closest) return;
  var card = t.closest("[data-char]");
  if (card) return R.pickChar(card.getAttribute("data-char"));
  if (t.closest("[data-move]")) {
    R.npcMove();
    var pf = R.npcPersona();
    if (R.npcSay) R.npcSay(pf.n + " — " + pf.mood, 3000);
  }
});

/* ── ۱۲. اتصال به ناوبری ─────────────────────────────────── */
R.hooks = R.hooks || {};
R.hooks.archive = function () { R.paintArchive(); };

var prevLogin = R.onLogin;
R.onLogin = function () {
  if (prevLogin) { try { prevLogin(); } catch (e) {} }
  try { build(); } catch (e) { console.error(e); }
};

function start() {
  try { build(); } catch (e) { console.error(e); }
  [500, 1500, 3000, 5000].forEach(function (ms) {
    setTimeout(function () { try { build(); } catch (e) {} }, ms);
  });
  if (R.bootCompanion) { try { R.bootCompanion(); } catch (e) {} }
}
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", start);
} else { start(); }

console.log("%c🥷 RONIN COMPANION CORE v4 ready", "color:#a78bfa;font-weight:900");
})();
