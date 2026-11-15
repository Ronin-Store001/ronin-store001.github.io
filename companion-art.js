/* RONIN COMPANION ART — companion-art.js
   نقاشی تمام‌تنه (نه نیم‌تنه) برای همراه‌های کاگه/هانا/رایو/تسوکی/هیکاری/تاکه/آیریس. */
"use strict";
(function boot() {
  if (window.__compArt) return;
  if (!window.R || !R.paintArchive) { setTimeout(boot, 350); return; }
  window.__compArt = true;

  var SPEC = {
    kage:    { a: "#5a6ba8", b: "#2b3155", c: "#0b0e1c", hair: "hood", acc: "horn",  eyes: "#bfe4ff" },
    hana:    { a: "#ffb3cd", b: "#c2456f", c: "#3a0d1e", hair: "pony", acc: "petal", eyes: "#fff" },
    raio:    { a: "#ffe066", b: "#e08b12", c: "#2c1c00", hair: "spike", acc: "bolt", eyes: "#fff" },
    tsuki:   { a: "#c9b6ff", b: "#6a4db8", c: "#170d33", hair: "long", acc: "moon", eyes: "#f3ecff" },
    hikari:  { a: "#fff2b8", b: "#e0a521", c: "#2b2103", hair: "bun",   acc: "star", eyes: "#fff" },
    take:    { a: "#c8f08a", b: "#4f8a24", c: "#101f06", hair: "topknot", acc: "leaf", eyes: "#fff" },
    airisu:  { a: "#a8e8ff", b: "#2f8fd0", c: "#06182a", hair: "wave",  acc: "drop", eyes: "#fff" }
  };

  function accOf(t) {
    if (t.acc === "horn") return '<path d="M40 30l5-13 6 13z" fill="#cfd8ff"/><path d="M66 30l5-13 6 13z" fill="#cfd8ff"/>';
    if (t.acc === "petal") return '<circle cx="36" cy="26" r="4.5" fill="#ffd6e6"/><circle cx="52" cy="20" r="3.6" fill="#ffe3ee"/><circle cx="74" cy="24" r="4.5" fill="#ffd6e6"/>';
    if (t.acc === "bolt") return '<path d="M78 16l-7 13h6l-4 12 12-17h-7z" fill="#fff3a8" stroke="#e0a521" stroke-width="1.4"/>';
    if (t.acc === "moon") return '<path d="M80 12a11 11 0 1 0 9 18 12 12 0 0 1-9-18z" fill="#efe6ff" opacity=".95"/>';
    if (t.acc === "star") return '<path d="M60 8l3.4 7.4 8 .8-6 5.6 1.6 8-7-4-7 4 1.6-8-6-5.6 8-.8z" fill="#fffbe0"/>';
    if (t.acc === "leaf") return '<path d="M66 10c7 5 10 11 10 17s-4 11-10 11-10-5-10-11 3-12 10-17z" fill="#b7f07a"/><path d="M66 14v22" stroke="#4a7d1c" stroke-width="1.8"/>';
    if (t.acc === "drop") return '<path d="M66 6c6 9 9 14 9 19a9 9 0 0 1-18 0c0-5 3-10 9-19z" fill="#c9f2ff" opacity=".95"/>';
    return "";
  }

  function hairOf(t) {
    if (t.hair === "hood") return '<path d="M30 44q0-26 30-26t30 26q0 10-6 14H36q-6-4-6-14z" fill="' + t.b + '"/>' +
      '<path d="M36 46q24-12 48 0v10H36z" fill="' + t.c + '" opacity=".55"/>';
    if (t.hair === "pony") return '<path d="M32 44q0-24 28-24t28 24q-28-10-56 0z" fill="' + t.b + '"/>' +
      '<path d="M86 40q12 4 10 22t-12 20q8-24 2-42z" fill="' + t.b + '"/>';
    if (t.hair === "spike") return '<path d="M30 46l6-16 6 12 6-16 8 14 6-14 8 14 6-12 6 14q-26-8-52 4z" fill="' + t.b + '"/>';
    if (t.hair === "long") return '<path d="M31 44q0-25 29-25t29 25v42H31z" fill="' + t.b + '"/>' +
      '<path d="M40 44q20-10 40 0v10H40z" fill="' + t.c + '" opacity=".45"/>';
    if (t.hair === "bun") return '<path d="M33 44q0-23 27-23t27 23q-27-9-54 0z" fill="' + t.b + '"/>' +
      '<circle cx="60" cy="16" r="8" fill="' + t.b + '"/>';
    if (t.hair === "topknot") return '<path d="M33 45q0-24 27-24t27 24q-27-9-54 0z" fill="' + t.b + '"/>' +
      '<ellipse cx="60" cy="15" rx="7" ry="6" fill="' + t.c + '"/>';
    return '<path d="M31 45q0-25 29-25t29 25q-8-6-16-2-10 6-22 0-10-4-20 2z" fill="' + t.b + '"/>';
  }

  function svg(t) {
    return '<svg viewBox="0 0 120 128" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<ellipse cx="60" cy="119" rx="26" ry="5" fill="' + t.c + '" opacity=".22"/>' +
      '<rect x="46" y="90" width="10" height="22" rx="5" fill="' + t.c + '" opacity=".85"/>' +
      '<rect x="64" y="90" width="10" height="22" rx="5" fill="' + t.c + '" opacity=".85"/>' +
      '<rect x="42" y="108" width="18" height="9" rx="4.5" fill="' + t.b + '"/>' +
      '<rect x="60" y="108" width="18" height="9" rx="4.5" fill="' + t.b + '"/>' +
      '<path d="M42 62q18-7 36 0l4 30q-22 8-44 0z" fill="' + t.a + '"/>' +
      '<path d="M42 62q18-7 36 0v8q-18-5-36 0z" fill="' + t.c + '" opacity=".28"/>' +
      '<rect x="52" y="62" width="16" height="7" rx="3.5" fill="' + t.c + '" opacity=".55"/>' +
      '<rect x="27" y="65" width="11" height="26" rx="5.5" fill="' + t.a + '"/>' +
      '<rect x="82" y="65" width="11" height="26" rx="5.5" fill="' + t.a + '"/>' +
      '<circle cx="32.5" cy="92" r="5" fill="' + t.c + '" opacity=".8"/>' +
      '<circle cx="87.5" cy="92" r="5" fill="' + t.c + '" opacity=".8"/>' +
      '<rect x="54" y="52" width="12" height="10" rx="5" fill="' + t.c + '" opacity=".5"/>' +
      '<circle cx="60" cy="42" r="23" fill="' + t.a + '"/>' +
      hairOf(t) +
      '<rect x="41" y="38" width="38" height="10" rx="5" fill="' + t.c + '" opacity=".8"/>' +
      '<circle cx="51" cy="43" r="3.2" fill="' + t.eyes + '"/><circle cx="69" cy="43" r="3.2" fill="' + t.eyes + '"/>' +
      '<path d="M55 53q5 4 10 0" stroke="' + t.c + '" stroke-width="2" fill="none" stroke-linecap="round"/>' +
      accOf(t) +
      "</svg>";
  }

  function repaintWall() {
    var w = document.getElementById("archWall");
    if (!w) return;
    Array.prototype.forEach.call(w.querySelectorAll(".carc[data-char]"), function (d) {
      var id = d.getAttribute("data-char"), t = SPEC[id], cw = d.querySelector(".cw");
      if (!t || !cw || cw.getAttribute("data-art") === id) return;
      cw.innerHTML = svg(t);
      cw.setAttribute("data-art", id);
      cw.style.setProperty("--ja", t.a);
      cw.style.setProperty("--jb", t.b);
    });
  }

  function repaintHero() {
    var n = document.getElementById("gninja");
    if (!n) return;
    var id = (R.USER && R.USER.npcChar) || R.npcCharCur;
    var t = SPEC[id];
    if (!t) return;
    n.setAttribute("data-skin", id);
    var cur = n.querySelector("svg");
    if (cur && cur.getAttribute("data-art") === id) return;
    var tmp = document.createElement("div");
    tmp.innerHTML = svg(t);
    var sv = tmp.querySelector("svg");
    sv.setAttribute("data-art", id);
    if (cur) cur.parentNode.replaceChild(sv, cur);
    else n.appendChild(sv);
    n.style.setProperty("--ja", t.a);
    n.style.setProperty("--jb", t.b);
  }

  function all() { try { repaintWall(); repaintHero(); } catch (e) {} }

  var p0 = R.paintArchive;
  R.paintArchive = function () {
    if (p0) { try { p0(); } catch (e) {} }
    setTimeout(all, 30);
  };
  if (window.MutationObserver) {
    var w = document.getElementById("archWall");
    if (w) new MutationObserver(function () { repaintWall(); }).observe(w, { childList: true, subtree: true });
  }
  document.addEventListener("click", function () { setTimeout(all, 120); }, true);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", all);
  else all();
  [800, 2000, 4000, 7000].forEach(function (ms) { setTimeout(all, ms); });
})();
