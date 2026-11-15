/* RONIN COMPANION EXTRA — companion-extra.js
   • سه همراه تازه: هیکاری (نور)، تاکه (بامبو)، آیریس (آب)
   • مِکا و نِکو از آرشیو برداشته می‌شوند
   با لایهٔ companion-pack2 هم‌زیستی دارد و کارش را خراب نمی‌کند. */
"use strict";
(function bootAll() {
  if (window.__compExtra) return;
  if (!window.R || !R.paintArchive) { setTimeout(bootAll, 300); return; }
  window.__compExtra = true;

  var HIDE = ["meka", "neko"];
  function isPrem() { return !!(R.prem || R.premium || (R.USER && (R.USER.prem || R.USER.premium))); }
  function cur() { return (R.USER && R.USER.npcChar) || R.npcCharCur || "naruto"; }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>\"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  var MY = {
    hikari: {
      n: "هیکاری", r: "رایگان", p: false, acc: "star",
      mood: "روشن", tempo: 34000, move: "p2bounce", err: "wow", ok: "happy",
      col: { a: "#fff2b8", b: "#f0b73a", c: "#2b2103" },
      lines: ["نور، ساده‌ترین راه است ✨", "چراغ من همیشه روشنه", "تاریکی هم مهمونه، ولی نه امروز",
        "بیا روشن کنیم 🌟"],
      moodLines: {
        happy: ["دیدی چقدر روشن شد؟ ✨"],
        angry: ["عصبانی نباش، نور کم می‌شه"],
        wow: ["این یکی برق زد! 🌟"],
        sad: ["چراغم کم‌سو شده… ولی خاموش نه"]
      }
    },
    take: {
      n: "تاکه", r: "پرمیوم", p: true, acc: "leaf",
      mood: "آرام", tempo: 44000, move: "p2nod", err: "nod", ok: "happy",
      col: { a: "#c8f08a", b: "#5b9e2f", c: "#101f06" },
      lines: ["بامبو خم می‌شود، نمی‌شکند 🎍", "آرام رشد کن، مثل من", "ریشه‌ها را محکم کن",
        "باد می‌آید؛ ما می‌مانیم 🌿"],
      moodLines: {
        happy: ["رشد کردیم 🌿"],
        angry: ["خم شو، نشکن"],
        wow: ["چه رویشی! 🎍"],
        sad: ["برگ‌ها می‌ریزند، ریشه می‌ماند"]
      }
    },
    airisu: {
      n: "آیریس", r: "پرمیوم", p: true, acc: "drop",
      mood: "روان", tempo: 40000, move: "p2floatmv", err: "wow", ok: "happy",
      col: { a: "#a8e8ff", b: "#2f8fd0", c: "#06182a" },
      lines: ["آب راهش را پیدا می‌کند 💧", "هر قطره یک داستان است", "جریان را حس کن",
        "آرام و پیوسته 🌊"],
      moodLines: {
        happy: ["جریان خوب است 💧"],
        angry: ["سنگ هم مانع آب نمی‌شود"],
        wow: ["موج تازه! 🌊"],
        sad: ["آب آرام است… بعد دوباره راه می‌افتد"]
      }
    }
  };
  var ORDER = ["hikari", "take", "airisu"];

  function svgOf(c) {
    var acc = "";
    if (c.acc === "star") {
      acc = '<path d="M60 6l4 9 10 1.5-7.4 7 1.8 10-8.4-4.6L51.6 33.5l1.8-10-7.4-7 10-1.5z" fill="#fff4c0" opacity=".95"/>';
    } else if (c.acc === "leaf") {
      acc = '<path d="M60 8c9 6 13 14 13 22S66 46 60 46s-13-8-13-16S51 14 60 8z" fill="#b7f07a" opacity=".9"/>' +
        '<path d="M60 12v30" stroke="#4f8a24" stroke-width="2"/>';
    } else if (c.acc === "drop") {
      acc = '<path d="M60 6c8 12 12 18 12 24a12 12 0 0 1-24 0c0-6 4-12 12-24z" fill="#bdefff" opacity=".92"/>';
    }
    return '<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<circle cx="60" cy="62" r="44" fill="' + c.col.c + '" opacity=".26"/>' +
      '<path d="M18 118q0-34 42-34t42 34z" fill="' + c.col.b + '"/>' +
      '<circle cx="60" cy="54" r="29" fill="' + c.col.a + '"/>' +
      '<path d="M31 52q0-29 29-29t29 29q-29-12-58 0z" fill="' + c.col.b + '"/>' +
      '<rect x="37" y="50" width="46" height="12.5" rx="6" fill="' + c.col.c + '" opacity=".85"/>' +
      '<circle cx="51" cy="56" r="3.8" fill="#fff"/><circle cx="69" cy="56" r="3.8" fill="#fff"/>' +
      '<path d="M53 69q7 5 14 0" stroke="' + c.col.c + '" stroke-width="2.5" fill="none" stroke-linecap="round"/>' +
      acc + "</svg>";
  }

  var persona0 = R.npcPersona;
  R.npcPersona = function () {
    var c = MY[cur()];
    if (c) return { n: c.n, r: c.r, p: c.p, mood: c.mood, tempo: c.tempo,
      lines: c.lines, moodLines: c.moodLines, move: c.move, err: c.err, ok: c.ok };
    return persona0 ? persona0() : { n: "رونین", mood: "آرام", lines: ["…"], move: "p2nod" };
  };

  function applyMine() {
    var n = R.$ && R.$("gninja"); if (!n) return;
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
    try { applyMine(); } catch (e) {}
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
    applyMine();
    if (R.npcSay) R.npcSay(c.lines[0], 3600);
    if (R.npcMove) R.npcMove(c.move);
    if (R.toast) R.toast(c.n + " انتخاب شد ✅", "ok");
  };

  var paint0 = R.paintArchive;
  R.paintArchive = function () {
    if (paint0) { try { paint0(); } catch (e) {} }
    try {
      var w = R.$("archWall"); if (!w) return;
      HIDE.forEach(function (id) {
        var el = w.querySelector('[data-char="' + id + '"]');
        if (el && el.parentNode) el.parentNode.removeChild(el);
      });
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
      var all = document.getElementById("ahAll"), pr = document.getElementById("ahPrem");
      var cards = w.querySelectorAll(".carc");
      if (all) all.textContent = R.fa ? R.fa(cards.length) : String(cards.length);
      if (pr) pr.textContent = R.fa ? R.fa(w.querySelectorAll(".carc.lk").length) : String(w.querySelectorAll(".carc.lk").length);
    } catch (e) {}
  };

  function boot() {
    applyMine();
    if (R.paintArchive) R.paintArchive();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  [1000, 2500, 5000].forEach(function (ms) { setTimeout(boot, ms); });
})();
