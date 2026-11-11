/* ═══════════════════════════════════════════════════════════════
   RONIN STORE — ANIME PLUS  ·  ronin-anime-plus.js
   هیرو سینمایی اسلایدری بالای بخش انیمه + نشان پخش/دوبله و رتبه
   روی افزونهٔ ronin-anime-pro.js سوار می‌شود و به کدهای اصلی دست
   نمی‌زند. داده را از همان R.ANIME (Firebase) می‌خواند.
   ═══════════════════════════════════════════════════════════════ */
"use strict";
(function () {
  if (!window.R) return;
  var R = window.R;
  if (R.__animePlus) return;
  R.__animePlus = true;

  function esc(s) {
    if (R.esc) return R.esc(s);
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function fa(n) { return R.fa ? R.fa(n) : String(n); }
  function num(x) { return Number(x) || 0; }
  function hash(s) {
    var h = 0, str = String(s || "");
    for (var i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 100000;
    return h;
  }

  /* نمونه‌های هیرو (وقتی هنوز داده‌ای در دیتابیس نیست) */
  var DEMO = [
    { id: "d1", title: "حمله به تایتان", jp: "進撃の巨人", icon: "⚔️", gen: "اکشن، درام", st: "اتمام پخش", rate: "9.1", year: 2013, ep: 25, season: 1, desc: "بشریت پشت دیوارها در برابر تایتان‌ها می‌جنگد؛ داستانی دربارهٔ آزادی و انتخاب." },
    { id: "d3", title: "شیطان‌کش", jp: "鬼滅の刃", icon: "🗡️", gen: "اکشن، فانتزی", st: "در حال پخش", rate: "8.9", year: 2019, ep: 26, season: 4, desc: "تانجیرو برای نجات خواهرش و انتقام خانواده‌اش شکارچی شیطان می‌شود." },
    { id: "d7", title: "فریرن", jp: "葬送のフリーレン", icon: "🌿", gen: "فانتزی، ماجراجویی", st: "اتمام پخش", rate: "9.3", year: 2023, ep: 28, season: 1, desc: "الف جادوگری پس از شکست پادشاه شیاطین، معنای زمان و دوستی را می‌فهمد." },
    { id: "d4", title: "وان پیس", jp: "ONE PIECE", icon: "🏴‍☠️", gen: "ماجراجویی، کمدی", st: "در حال پخش", rate: "9.0", year: 1999, ep: 1100, season: 20, desc: "لوفی و خدمه‌اش در جست‌وجوی گنج افسانه‌ای دریای بزرگ را می‌پیمایند." },
    { id: "d14", title: "فیلم: قلعهٔ بی‌پایان", jp: "無限城", icon: "🏯", gen: "سینمایی، فانتزی", st: "در حال پخش", rate: "8.9", year: 2025, ep: 1, season: 1, desc: "نبرد نهایی شکارچیان شیطان در قلعهٔ بی‌پایان آغاز می‌شود." }
  ];

  function norm(id, a, demo) {
    var h = hash(a.title || id);
    var st = String(a.st || "در حال پخش");
    var rate = num(String(a.rate || "").replace(/[^\d.]/g, "")) || (7 + (h % 25) / 10);
    return {
      id: id, demo: demo,
      title: String(a.title || "بدون نام"),
      jp: String(a.jp || ""),
      icon: String(a.icon || "🎬").slice(0, 4) || "🎬",
      gen: String(a.gen || "").split(/[،,\/|]/).map(function (g) { return g.trim(); }).filter(Boolean),
      st: st,
      live: /پخش/.test(st) && !/اتمام|پایان|تمام/.test(st),
      rate: rate,
      year: num(a.year) || 2019,
      ep: num(a.ep) || (1 + (h % 24)),
      season: num(a.season) || (1 + (h % 4)),
      dub: a.dub === true || (h % 3 === 0),
      desc: String(a.desc || ""),
      hue: h % 360
    };
  }

  function all() {
    var out = [];
    var src = R.ANIME || {};
    Object.keys(src).forEach(function (k) {
      var a = src[k];
      if (a && a.title) out.push(norm(k, a, false));
    });
    if (!out.length) DEMO.forEach(function (d) {
      var x = {}, k; for (k in d) x[k] = d[k];
      out.push(norm(d.id, x, true));
    });
    return out;
  }

  /* ── ساخت اسلاید ─────────────────────────────────────────── */
  function slide(a, i) {
    var c1 = "hsl(" + a.hue + " 72% 26%)";
    var c2 = "hsl(" + ((a.hue + 150) % 360) + " 64% 20%)";
    return '<div class="aphSlide' + (i === 0 ? " on" : "") + '" data-aph="' + i + '">' +
      '<div class="aphBg" style="--c1:' + c1 + ';--c2:' + c2 + '"></div>' +
      '<span class="aphArt">' + esc(a.icon) + "</span>" +
      '<div class="aphTx">' +
      '<span class="aphKick">RONIN PICK</span>' +
      '<h3 class="aphTitle">' + esc(a.title) + "</h3>" +
      (a.jp ? '<div class="aphJp">' + esc(a.jp) + "</div>" : "") +
      '<div class="aphMeta">' +
      '<span class="aphRate">⭐ ' + fa(a.rate.toFixed(1)) + "</span>" +
      '<span class="aphTag' + (a.live ? " live" : "") + '">' + (a.live ? "🟢 در حال پخش" : "اتمام پخش") + "</span>" +
      '<span class="aphTag">S' + fa(a.season) + " E" + fa(a.ep) + "</span>" +
      (a.gen[0] ? '<span class="aphTag">' + esc(a.gen[0]) + "</span>" : "") +
      (a.dub ? '<span class="aphTag">دوبله</span>' : "") +
      "</div>" +
      '<p class="aphDesc">' + esc(a.desc || "توضیحی ثبت نشده است.") + "</p>" +
      '<div class="aphBtns">' +
      '<button type="button" class="aphGo" data-aphgo="' + esc(a.id) + '">▶ تماشا</button>' +
      '<button type="button" class="aphGhost" data-aphgo="' + esc(a.id) + '">جزئیات</button>' +
      "</div></div></div>";
  }

  /* ── ساخت هیرو ───────────────────────────────────────────── */
  function build() {
    var wrap = document.querySelector("#sec-anime .apWrap");
    if (!wrap) return;
    var list = all().slice().sort(function (a, b) { return b.rate - a.rate; }).slice(0, 5);
    if (!list.length) return;

    var old = wrap.querySelector(".aphHero");
    if (old) old.parentNode.removeChild(old);

    var hero = document.createElement("div");
    hero.className = "aphHero";
    var html = "";
    list.forEach(function (a, i) { html += slide(a, i); });
    html += '<div class="aphNav"><button type="button" data-aphmove="-1" aria-label="قبلی">‹</button>' +
      '<button type="button" data-aphmove="1" aria-label="بعدی">›</button></div>';
    html += '<div class="aphDots">';
    list.forEach(function (a, i) { html += '<i class="' + (i === 0 ? "on" : "") + '" data-aphdot="' + i + '"></i>'; });
    html += "</div>";
    hero.innerHTML = html;
    wrap.insertBefore(hero, wrap.firstChild);

    startAuto(hero);
  }

  var timer = null, cur = 0;
  function show(hero, i) {
    var slides = hero.querySelectorAll(".aphSlide");
    if (!slides.length) return;
    cur = (i + slides.length) % slides.length;
    for (var k = 0; k < slides.length; k++) slides[k].classList.toggle("on", k === cur);
    var dots = hero.querySelectorAll("[data-aphdot]");
    for (var d = 0; d < dots.length; d++) dots[d].classList.toggle("on", d === cur);
  }
  function startAuto(hero) {
    if (timer) clearInterval(timer);
    var n = hero.querySelectorAll(".aphSlide").length;
    if (n < 2) return;
    timer = setInterval(function () {
      if (!document.body.contains(hero)) { clearInterval(timer); return; }
      if (hero.matches(":hover")) return;
      show(hero, cur + 1);
    }, 6500);
  }

  /* ── جزئیات ──────────────────────────────────────────────── */
  function detail(id) {
    var card = document.querySelector('[data-apopen="' + id + '"]');
    if (card) { card.click(); return; }
    var a = null;
    all().forEach(function (x) { if (x.id === id) a = x; });
    if (!a || !R.openInfo) return;
    var c1 = "hsl(" + a.hue + " 70% 32%)";
    var c2 = "hsl(" + ((a.hue + 60) % 360) + " 60% 12%)";
    R.openInfo("🎬 " + a.title,
      '<div class="apd"><div class="apdTop">' +
      '<div class="apdPoster" style="background:linear-gradient(160deg,' + c1 + ',' + c2 + ')">' +
      '<span class="apArt">' + esc(a.icon) + "</span></div>" +
      '<div><div class="apdTitle">' + esc(a.title) + "</div>" +
      (a.jp ? '<div class="apdJp">' + esc(a.jp) + "</div>" : "") +
      '<div class="apdDesc" style="border:0;padding-top:8px;font-size:11px;opacity:.7">' +
      "⭐ " + fa(a.rate.toFixed(1)) + " · " + fa(a.year) + " · S" + fa(a.season) + " E" + fa(a.ep) +
      " · " + (a.live ? "در حال پخش" : "اتمام پخش") + "</div></div></div>" +
      '<div class="apdDesc">' + esc(a.desc || "توضیحی ثبت نشده است.") + "</div>" +
      '<div class="apdBtns"><span class="chip">' + esc(a.gen.join(" • ") || "—") + "</span></div></div>");
  }

  /* ── نشان‌ها روی کارت‌ها ─────────────────────────────────── */
  function decorate() {
    var grid = document.getElementById("apGrid");
    if (!grid) return;
    var cards = grid.querySelectorAll(".apCard");
    for (var i = 0; i < cards.length; i++) {
      var c = cards[i], poster = c.querySelector(".apPoster");
      if (!poster) continue;
      if (!poster.querySelector(".apPlay")) {
        var p = document.createElement("span");
        p.className = "apPlay";
        p.textContent = "▶";
        poster.appendChild(p);
      }
      if (i < 10 && !poster.querySelector(".apRank")) {
        var r = document.createElement("span");
        r.className = "apRank";
        r.textContent = "#" + fa(i + 1);
        poster.appendChild(r);
      }
    }
  }

  /* ── رویدادها ───────────────────────────────────────────── */
  function bind() {
    var sec = document.getElementById("sec-anime");
    if (!sec || sec.__aphBound) return;
    sec.__aphBound = true;
    sec.addEventListener("click", function (e) {
      var go = e.target.closest ? e.target.closest("[data-aphgo]") : null;
      if (go) { detail(go.getAttribute("data-aphgo")); return; }
      var dot = e.target.closest ? e.target.closest("[data-aphdot]") : null;
      if (dot) {
        var hero = dot.closest(".aphHero");
        if (hero) { show(hero, num(dot.getAttribute("data-aphdot"))); startAuto(hero); }
        return;
      }
      var mv = e.target.closest ? e.target.closest("[data-aphmove]") : null;
      if (mv) {
        var h = mv.closest(".aphHero");
        if (h) { show(h, cur + num(mv.getAttribute("data-aphmove"))); startAuto(h); }
      }
    });
  }

  function run() {
    if (!document.getElementById("sec-anime")) return;
    bind();
    build();
    decorate();
  }

  /* هر بار داده/رندر عوض شد، هیرو و نشان‌ها را هم تازه کن */
  function hook() {
    if (typeof R.renderAnime === "function" && !R.renderAnime.__apl) {
      var prev = R.renderAnime;
      var wrapped = function () {
        try { prev.apply(R, arguments); } catch (e) {}
        try { run(); } catch (e) {}
      };
      wrapped.__apl = true;
      R.renderAnime = wrapped;
      R.hooks = R.hooks || {};
      R.hooks.anime = wrapped;
    }
  }

  /* CSS الگو‌های کارت (اگر ماژول اصلی دیرتر آمد) */
  function cssOnce() {
    if (document.getElementById("aphCSS")) return;
    var l = document.createElement("link");
    l.id = "aphCSS";
    l.rel = "stylesheet";
    l.href = "ronin-anime-plus.css?v=1";
    (document.head || document.documentElement).appendChild(l);
  }

  function start() {
    cssOnce();
    run();
    hook();
    setTimeout(run, 800);
    setTimeout(run, 2400);
    setTimeout(hook, 700);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
