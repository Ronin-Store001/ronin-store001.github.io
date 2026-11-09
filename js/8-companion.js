/* ═══════════════════════════════════════════════════════════════
   RONIN STORE — V19 «NEO RAIN CITY»             js/8-companion.js
   کاراکتر راهنمای انیمه‌ای (نینجا) — راه نمی‌رود، راهنمایی می‌کند
   ═══════════════════════════════════════════════════════════════ */
"use strict";
(function () {

/* ── ۱. تصویر کاراکتر (SVG سبک، بدون هیچ فایل خارجی) ─────── */
R.NPC_SVG = [
'<style>',
'#gninja{--ja:#ff9a3c;--jb:#e2661a;--jc:#e63946}',
'#gninja .ja{fill:var(--ja)} #gninja .jb{fill:var(--jb)} #gninja .jc{fill:var(--jc)}',
'#njArm{transform-box:fill-box;transform-origin:50% 94%;animation:njIdle 2.8s ease-in-out infinite}',
'@keyframes njIdle{0%,100%{transform:rotate(0)}50%{transform:rotate(-7deg)}}',
'#gninja.wave #njArm{animation:njWave .36s ease-in-out 5}',
'@keyframes njWave{0%,100%{transform:rotate(-6deg)}50%{transform:rotate(-48deg)}}',
'#njHead{transform-box:fill-box;transform-origin:50% 100%;animation:njBob 3.4s ease-in-out infinite}',
'@keyframes njBob{0%,100%{transform:rotate(0)}50%{transform:rotate(3deg)}}',
'</style>',
'<svg viewBox="0 0 120 152" xmlns="http://www.w3.org/2000/svg">',
'<ellipse cx="60" cy="145" rx="33" ry="6.5" fill="rgba(0,0,0,.45)"/>',
'<rect x="44" y="105" width="12" height="34" rx="6" fill="#2a2d47"/>',
'<rect x="64" y="105" width="12" height="34" rx="6" fill="#2a2d47"/>',
'<rect x="41" y="132" width="18" height="11" rx="5.5" fill="#141726"/>',
'<rect x="61" y="132" width="18" height="11" rx="5.5" fill="#141726"/>',
'<rect x="72" y="70" width="12" height="30" rx="6" class="jb"/>',
'<path d="M38 62h44a10 10 0 0 1 10 10v34a10 10 0 0 1-10 10H38a10 10 0 0 1-10-10V72a10 10 0 0 1 10-10z" class="ja"/>',
'<rect x="58" y="66" width="4" height="46" rx="2" fill="#b8500f"/>',
'<path d="M41 63q19 13 38 0v-9q-19 10-38 0z" class="jc"/>',
'<g id="njHead">',
'<circle cx="60" cy="42" r="26" fill="#ffd9b3"/>',
'<path d="M34 37q-6-22 12-27q5-12 17-6q14-6 18 8q14 2 8 23q-6-10-14-8q-2-13-14-11q-10-8-16 4q-10 1-11 17z" fill="#ffb03a"/>',
'<rect x="32" y="26" width="56" height="10" rx="5" class="jc"/>',
'<rect x="49" y="25" width="22" height="12" rx="3" fill="#c9cde0"/>',
'<path d="M60 31q-5 0-5-3t4-3q5 0 5 4" fill="none" stroke="#7a8099" stroke-width="1.6"/>',
'<ellipse cx="50" cy="46" rx="3.3" ry="4" fill="#1b1e33"/>',
'<ellipse cx="70" cy="46" rx="3.3" ry="4" fill="#1b1e33"/>',
'<circle cx="51.2" cy="44.6" r="1.2" fill="#fff"/>',
'<circle cx="71.2" cy="44.6" r="1.2" fill="#fff"/>',
'<path d="M38 52q22 16 44 0q-4 13-22 13t-22-13z" fill="#2a2e4a"/>',
'</g>',
'<g id="njArm"><rect x="30" y="68" width="12" height="30" rx="6" class="ja"/>',
'<circle cx="36" cy="69" r="8" fill="#ffd9b3"/></g>',
'</svg>'
].join("");

/* ── ۲. راهنمایی‌ها ───────────────────────────────────────── */
R.NPC_TIPS = {
  home:      "به رونین استور خوش آمدی! 🥷 هر جا گم شدی روی من بزن",
  anime:     "اینجا شبکه انیمه است — کارت‌ها را بزن تا جزئیات بیاید 🎬",
  news:      "آخرین اخبار انیمه و دنیای رونین 📰",
  community: "پست بگذار، لایک کن، کامنت بنویس 💬",
  discover:  "اینجا می‌بینی چه چیزی ترند است 🔥",
  market:    "فروشگاه! می‌خواهی خودت هم آگهی بگذاری؟ 📢",
  premium:   "پرمیوم چیزهای ویژه باز می‌کند 💎",
  chat:      "چت عمومی — سلام کن و دوست پیدا کن 💬",
  profile:   "پروفایل، سطح و تجربه‌ات اینجاست 👤",
  rank:      "جدول بهترین‌ها — تجربه جمع کن و بالا برو 🏆",
  events:    "رویدادهای رونین اینجاست 📅",
  owner:     "اینجا مرکز فرماندهی توست 👑",
  ads:       "آگهی‌هایت را از اینجا بساز 📢",
  settings:  "تنظیمات و رنگ کاراکترت 🎨"
};
R.NPC_FUN = [
  "داتِ‌بایو! 🥷", "آماده‌ام!", "بریم جلو!", "توی رونین همه رفیقن",
  "یه پست بزن، جانت درمیاد!", "Xp جمع کن تا قوی شی", "من همیشه اینجام 🧡"
];

/* ── ۳. ساخت کاراکتر ─────────────────────────────────────── */
R.npcBuild = function () {
  var n = R.$("gninja");
  if (!n) return;
  n.innerHTML = '<div class="nbub hide" id="nbub"></div>' + R.NPC_SVG;
  n.addEventListener("click", function () { R.npcWave(); R.npcFun(); });
  R.npcApply();

  setTimeout(function () { R.npcSay(R.NPC_TIPS.home, 6500); }, 2200);

  var oldGo = R.go;
  R.go = function (name) { oldGo(name); R.npcTip(name); };
};

/* ── ۴. حباب گفتگو ───────────────────────────────────────── */
R.npcSay = function (txt, ms) {
  var b = R.$("nbub"); if (!b) return;
  b.textContent = txt;
  b.classList.remove("hide");
  if (R._nt) clearTimeout(R._nt);
  R._nt = setTimeout(function () { b.classList.add("hide"); }, ms || 5200);
};
R.npcWave = function () {
  var n = R.$("gninja"); if (!n) return;
  n.classList.add("wave");
  setTimeout(function () { n.classList.remove("wave"); }, 1900);
};
R.npcFun = function () {
  R.npcSay(R.NPC_FUN[Math.floor(Math.random() * R.NPC_FUN.length)], 3000);
};
R.npcTip = function (sec) {
  if (Date.now() - (R._npAt || 0) < 20000) return;
  var t = R.NPC_TIPS[sec];
  if (!t) return;
  R._npAt = Date.now();
  R.npcWave();
  R.npcSay(t, 5200);
};

/* ── ۵. رنگ‌های کاراکتر ─────────────────────────────────── */
R.NPC_COLORS = [
  { id: "orange",  n: "نارنجی",   a: "#ff9a3c", b: "#e2661a", c: "#e63946", free: true },
  { id: "crimson", n: "سرخ",      a: "#ff7a7a", b: "#c92a2a", c: "#ffd66b" },
  { id: "violet",  n: "بنفش",     a: "#a78bfa", b: "#6d28d9", c: "#22d3ee" },
  { id: "cyan",    n: "فیروزه‌ای", a: "#67e8f9", b: "#0891b2", c: "#a78bfa" },
  { id: "gold",    n: "طلایی",    a: "#ffd66b", b: "#d99e0b", c: "#7c5cff" }
];
R.npcApply = function () {
  var n = R.$("gninja"); if (!n) return;
  var id = (R.USER && R.USER.npc) || R.npcCur || "orange";
  var c = null;
  R.NPC_COLORS.forEach(function (x) { if (x.id === id) c = x; });
  if (!c) c = R.NPC_COLORS[0];
  /* رنگ‌های ویژه فقط با پرمیوم */
  if (!c.free && !R.prem) c = R.NPC_COLORS[0];
  R.npcCur = c.id;
  n.style.setProperty("--ja", c.a);
  n.style.setProperty("--jb", c.b);
  n.style.setProperty("--jc", c.c);
};
R.npcColor = function (id) {
  var c = null;
  R.NPC_COLORS.forEach(function (x) { if (x.id === id) c = x; });
  if (!c) return;
  if (!c.free && !R.prem) return R.toast("این رنگ مخصوص پرمیوم است 💎", "err");
  R.npcCur = c.id;
  R.npcApply();
  if (R.ME) R.upd("users/" + R.ME, { npc: c.id }).catch(function () {});
  R.toast("رنگ کاراکتر عوض شد 🎨", "ok");
};
R.paintNpcPalette = function () {
  var w = R.$("npcPalette"); if (!w) return;
  w.innerHTML = R.NPC_COLORS.map(function (c) {
    var locked = !c.free && !R.prem;
    return '<button class="btn mini' + (R.npcCur === c.id ? " p" : "") + '" data-npc="' + c.id +
      '" style="border-color:' + c.a + '">' + c.n + (locked ? " 💎" : "") + "</button>";
  }).join("");
};

/* ── ۶. اتصال ─────────────────────────────────────────────── */
R.bindCompanion = function () {
  document.addEventListener("click", function (e) {
    var t = e.target.closest ? e.target.closest("[data-npc]") : null;
    if (t) R.npcColor(t.getAttribute("data-npc"));
  });
};

/* ── ۷. آماده‌سازی ───────────────────────────────────────── */
R.bootCompanion = function () {
  if (R.lite && window.innerWidth < 380) {
    var n = R.$("gninja"); if (n) n.style.transform = "scale(.85)";
  }
  R.npcBuild();
};
R.onCompanionLogin = function () { R.npcApply(); R.paintNpcPalette(); };

})();
