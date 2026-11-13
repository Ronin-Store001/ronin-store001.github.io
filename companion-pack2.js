/* RONIN COMPANION PACK — companion-pack2.js
   بدون دست‌زدن به pack2.js:
   • چهار همراه تازه با ظاهر، رنگ و شخصیت اختصاصی
   • ارتقای «آرشیو همراه»: نوار آمار، فیلتر رایگان/پرمیوم و نشان «تازه»
   همراهان قدیمی سر جایشان می‌مانند و همان‌طور کار می‌کنند. */
"use strict";
(function bootAll() {
  if (window.__compPack2) return;
  if (!window.R) { setTimeout(bootAll, 300); return; }
  window.__compPack2 = true;

  function isPrem() {
    return !!(R.prem || R.premium || (R.USER && (R.USER.prem || R.USER.premium)));
  }
  function cur() { return (R.USER && R.USER.npcChar) || R.npcCharCur || "naruto"; }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  /* ── ۱. همراهان تازه ────────────────────────────────────── */
  var MY = {
    kage: {
      n: "کاگه", r: "پرمیوم", p: true, acc: "horn",
      trait: "سایه و سکوت", mood: "مرموز", tempo: 48000,
      move: "p2floatmv", err: "nod", ok: "happy",
      col: { a: "#9fb0ff", b: "#4b5bb8", c: "#0b0f2a" },
      lines: ["سایه‌ها حرف نمی‌زنند 🌑", "من همان‌جایی هستم که نگاه نمی‌کنی",
        "آرام بیا، آرام برو", "در تاریکی، چشم‌ها روشن‌تر می‌بینند"],
      moodLines: {
        happy: ["خوب شد… سایه راضی است 🌑"],
        angry: ["خشم، سایه را عمیق‌تر می‌کند"],
        wow: ["این را ندیده بودم… 🌒"],
        sad: ["سکوت، خانهٔ من است"]
      }
    },
    hana: {
      n: "هانا", r: "رایگان", p: false, acc: "petal",
      trait: "مهربان و گرم", mood: "شاد", tempo: 30000,
      move: "p2bounce", err: "wow", ok: "happy",
      col: { a: "#ffb3d1", b: "#e75d9c", c: "#33101f" },
      lines: ["هر روز یک شکوفهٔ تازه 🌸", "حالت خوبه؟ من هستم 🌷", "آروم باش، همه‌چیز می‌گذره",
        "بوی بهار می‌آد 🌼"],
      moodLines: {
        happy: ["وای چقدر خوب! 🌸"],
        angry: ["ناراحتت نکنم… بذار کمک کنم 🌷"],
        wow: ["چه قشنگ! 🌺"],
        sad: ["گریه نکن، من کنارتم 🌼"]
      }
    },
    raio: {
      n: "رایو", r: "پرمیوم", p: true, acc: "bolt",
      trait: "پرهیجان و سریع", mood: "هیجانی", tempo: 22000,
      move: "p2dash", err: "angry", ok: "wow",
      col: { a: "#ffe066", b: "#22b8ff", c: "#1a1405" },
      lines: ["برق تو دستمه ⚡", "سریع‌تر! سریع‌تر!", "یه جرقه کافیه ⚡", "آسمون مال من بود"],
      moodLines: {
        happy: ["عجب حالی داد! ⚡"],
        angry: ["کند بود؛ دوباره بزن!"],
        wow: ["واو! مثل صاعقه ⚡"],
        sad: ["ولش کن، بارق بعدی از منه"]
      }
    },
    tsuki: {
      n: "تسوکی", r: "پرمیوم", p: true, acc: "moon",
      trait: "شاعرانه و آرام", mood: "ماه‌گرفتار", tempo: 56000,
      move: "p2spin", err: "nod", ok: "happy",
      col: { a: "#e6dcff", b: "#8f7bd6", c: "#161028" },
      lines: ["ماه، آینهٔ شب است 🌙", "شمارِ ستاره‌ها را بلدم", "شب که می‌شود، همه‌چیز آرام است",
        "با ماه حرف زدم، از تو گفت 🌙"],
      moodLines: {
        happy: ["شب زیباست امشب 🌙"],
        angry: ["ماه هم گاهی پشت ابر می‌رود"],
        wow: ["ستاره‌ای تازه پیدا شد ✨"],
        sad: ["ماه هم تنها است، اما می‌درخشد"]
      }
    }
  };
  var ORDER = ["kage", "hana", "raio", "tsuki"];

  /* ── ۲. ظاهر هر همراه (SVG ساده و تمیز) ─────────────────── */
  function svgOf(c) {
    var acc = "";
    if (c.acc === "horn") {
      acc = '<path d="M42 26l6-14 6 14z" fill="#9fb0ff" opacity=".9"/>' +
        '<path d="M66 26l6-14 6 14z" fill="#9fb0ff" opacity=".9"/>';
    } else if (c.acc === "petal") {
      acc = '<circle cx="38" cy="22" r="5" fill="#ffc7de"/><circle cx="52" cy="17" r="4" fill="#ffd9e8"/>' +
        '<circle cx="66" cy="22" r="5" fill="#ffc7de"/><circle cx="80" cy="20" r="3.4" fill="#ffd9e8"/>';
    } else if (c.acc === "bolt") {
      acc = '<path d="M64 8l-10 18h8l-6 16 16-22h-9z" fill="#ffe066" stroke="#ffb300" stroke-width="1.6"/>';
    } else if (c.acc === "moon") {
      acc = '<path d="M78 12a13 13 0 1 0 10 21 15 15 0 0 1-10-21z" fill="#e6dcff" opacity=".92"/>';
    }
    return '<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<circle cx="60" cy="60" r="44" fill="' + c.col.c + '" opacity=".28"/>' +
      '<path d="M18 118q0-34 42-34t42 34z" fill="' + c.col.b + '"/>' +
      '<circle cx="60" cy="52" r="30" fill="' + c.col.a + '"/>' +
      '<path d="M30 50q0-30 30-30t30 30q-30-12-60 0z" fill="' + c.col.b + '"/>' +
      '<rect x="36" y="48" width="48" height="13" rx="6.5" fill="' + c.col.c + '" opacity=".85"/>' +
      '<circle cx="50" cy="54.5" r="4" fill="#fff"/><circle cx="70" cy="54.5" r="4" fill="#fff"/>' +
      '<path d="M52 68q8 5 16 0" stroke="' + c.col.c + '" stroke-width="2.6" fill="none" stroke-linecap="round"/>' +
      acc + "</svg>";
  }

  /* ── ۳. شخصیت و انتخاب ──────────────────────────────────── */
  var persona0 = R.npcPersona;
  R.npcPersona = function () {
    var c = MY[cur()];
    if (c) {
      return { n: c.n, r: c.r, p: c.p, trait: c.trait, mood: c.mood, tempo: c.tempo,
        lines: c.lines, moodLines: c.moodLines, move: c.move, err: c.err, ok: c.ok };
    }
    return persona0 ? persona0() : { n: "رونین", mood: "آرام", lines: ["…"], move: "p2nod" };
  };

  function applyMy() {
    var n = R.$("gninja"); if (!n) return;
    var id = cur(), c = MY[id];
    if (!c || (c.p && !isPrem())) return;
    n.style.setProperty("--ja", c.col.a);
    n.style.setProperty("--jb", c.col.b);
    n.style.setProperty("--jc", c.col.c);
    n.setAttribute("data-skin", id);
    if (R._cNow === id) return;
    var wrap = document.createElement("div");
    wrap.innerHTML = svgOf(c);
    var nsvg = wrap.querySelector("svg"), old = n.querySelector("svg");
    if (nsvg && old) { old.parentNode.replaceChild(nsvg, old); R._cNow = id; }
  }

  var apply0 = R.npcApply;
  R.npcApply = function () {
    if (apply0) { try { apply0(); } catch (e) {} }
    try { applyMy(); } catch (e) {}
  };

  var pick0 = R.pickChar;
  R.pickChar = function (id) {
    var c = MY[id];
    if (!c) return pick0 ? pick0(id) : null;
    if (!R.ME) return R.needLogin ? R.needLogin("همراه ویژه") : null;
    if (c.p && !isPrem()) return R.toast ? R.toast("این همراه مخصوص پرمیوم است 💎", "err") : null;
    R.npcCharCur = id;
    if (R.upd) R.upd("users/" + R.ME, { npcChar: id }).catch(function () {});
    R._cNow = null;
    if (R.paintArchive) R.paintArchive();
    applyMy();
    if (R.npcSay) R.npcSay(c.lines[0], 3600);
    if (R.npcMove) R.npcMove(c.move);
    if (R.toast) R.toast(c.n + " انتخاب شد ✅", "ok");
  };

  /* ── ۴. ارتقای آرشیو ────────────────────────────────────── */
  var CSS = [
    "#archHead{margin:0 0 12px}",
    ".ahBar{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:11px 13px;border-radius:16px;",
    "  border:1px solid rgba(140,160,255,.18);background:linear-gradient(150deg,rgba(255,255,255,.05),rgba(255,255,255,.02))}",
    ".ahK{font-size:9.5px;color:#93a0c8}",
    ".ahK b{color:#eaf4ff;font-size:13px;margin-inline-start:3px}",
    ".ahC{display:flex;gap:5px;margin-inline-start:auto;flex-wrap:wrap}",
    ".ahC button{font:inherit;font-size:9.5px;font-weight:800;padding:5px 10px;border-radius:9px;cursor:pointer;",
    "  border:1px solid rgba(140,160,255,.22);background:transparent;color:#cfd7f7}",
    ".ahC button.on{color:#05060f;border-color:transparent;background:linear-gradient(135deg,#8ef0ff,#7c5cff)}",
    "#archWall[data-f=free] .carc.lk{display:none!important}",
    "#archWall[data-f=prem] .carc:not(.lk){display:none!important}",
    ".carc .nw{position:absolute;top:6px;inset-inline-start:6px;font-size:8px;font-weight:900;",
    "  padding:2px 6px;border-radius:99px;color:#05060f;background:linear-gradient(135deg,#8ef0ff,#7c5cff)}",
    ".carc{position:relative}"
  ].join("");
  var st = document.createElement("style");
  st.id = "cp2Css"; st.textContent = CSS;
  (document.head || document.documentElement).appendChild(st);

  function ensureHead(wall) {
    var sec = document.getElementById("sec-archive");
    if (!sec) return;
    var h = document.getElementById("archHead");
    if (!h) {
      h = document.createElement("div");
      h.id = "archHead";
      h.innerHTML = '<div class="ahBar">' +
        '<span class="ahK">همراه‌ها<b id="ahAll">۰</b></span>' +
        '<span class="ahK">پرمیوم<b id="ahPrem">۰</b></span>' +
        '<span class="ahK">فعال<b id="ahSel">—</b></span>' +
        '<div class="ahC">' +
          '<button class="on" type="button" data-ahf="all">همه</button>' +
          '<button type="button" data-ahf="free">رایگان</button>' +
          '<button type="button" data-ahf="prem">پرمیوم</button>' +
        '</div></div>';
      var head = sec.querySelector(".head");
      if (head && head.parentNode) head.parentNode.insertBefore(h, head.nextSibling);
      else sec.insertBefore(h, sec.firstChild);
      h.addEventListener("click", function (e) {
        var b = e.target.closest("[data-ahf]");
        if (!b) return;
        Array.prototype.forEach.call(h.querySelectorAll("[data-ahf]"), function (x) {
          x.classList.toggle("on", x === b);
        });
        var wall2 = document.getElementById("archWall");
        if (wall2) wall2.setAttribute("data-f", b.getAttribute("data-ahf"));
      });
    }
    var cards = wall.querySelectorAll(".carc");
    var prem = wall.querySelectorAll(".carc.lk");
    var all = document.getElementById("ahAll"), pr = document.getElementById("ahPrem"), selEl = document.getElementById("ahSel");
    if (all) all.textContent = R.fa ? R.fa(cards.length) : String(cards.length);
    if (pr) pr.textContent = R.fa ? R.fa(prem.length) : String(prem.length);
    if (selEl) {
      var c = MY[cur()];
      selEl.textContent = c ? c.n : "رونین";
    }
  }

  var paint0 = R.paintArchive;
  R.paintArchive = function () {
    if (paint0) { try { paint0(); } catch (e) {} }
    try {
      var w = R.$("archWall"); if (!w) return;
      var active = cur(), prem = isPrem();
      ORDER.forEach(function (id) {
        if (w.querySelector('[data-char="' + id + '"]')) return;
        var c = MY[id], locked = c.p && !prem;
        var d = document.createElement("div");
        d.className = "carc" + (active === id ? " on" : "") + (locked ? " lk" : "");
        d.setAttribute("data-char", id);
        d.setAttribute("title", c.mood + " • " + c.r);
        d.innerHTML = (locked ? '<span class="lk2">💎</span>' : '<span class="nw">تازه</span>') +
          '<div class="cw" style="--ja:' + c.col.a + ";--jb:" + c.col.b + ";--jc:" + c.col.c + '">' +
            svgOf(c) + "</div>" +
          '<div class="cn">' + esc(c.n) + "</div>" +
          '<div class="cr">' + esc(c.mood) + "</div>";
        w.appendChild(d);
      });
      Array.prototype.forEach.call(w.querySelectorAll(".carc"), function (d) {
        d.classList.toggle("on", d.getAttribute("data-char") === active);
      });
      ensureHead(w);
    } catch (e) {}
  };

  function boot() {
    applyMy();
    if (R.paintArchive) R.paintArchive();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  [800, 2000, 4000].forEach(function (ms) { setTimeout(boot, ms); });
  setTimeout(function () { var b = document.getElementById("archHead"); if (!b) boot(); }, 6000);
})();
