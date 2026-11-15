/* RONIN COMPANION ART v2 — companion-art.js
   همهٔ همراه‌های دست‌ساز (قدیمی و تازه) تمام‌تنه و متحرک: نفس کشیدن، تکان دست‌ها،
   راه رفتن و رقص. با کلیک روی همراهِ صفحه، حرکات رقص اجرا می‌شود. */
"use strict";
(function boot() {
  if (window.__compArt) return;
  if (!window.R || !R.paintArchive) { setTimeout(boot, 350); return; }
  window.__compArt = true;

  var SPEC = {
    ninja:   { a: "#3b4252", b: "#171b26", c: "#05070c", hair: "hood",    acc: "band",  eyes: "#c8f0ff", skin: "#f0c9a8", tone: "#9aa4b8" },
    kitsune: { a: "#ff9f43", b: "#c2410c", c: "#301005", hair: "fox",     acc: "tail",  eyes: "#fff3c4", skin: "#ffc58a", tone: "#ffe0b0" },
    yuki:    { a: "#a8e4ff", b: "#3b7ea8", c: "#0b2233", hair: "snow",    acc: "snow",  eyes: "#e8f7ff", skin: "#ffe9f0", tone: "#dff4ff" },
    kage:    { a: "#5a6ba8", b: "#2b3155", c: "#0b0e1c", hair: "hood",    acc: "horn",  eyes: "#bfe4ff", skin: "#e8d7c6", tone: "#8f9ec4" },
    hana:    { a: "#ffb3cd", b: "#c2456f", c: "#3a0d1e", hair: "pony",    acc: "petal", eyes: "#fff",    skin: "#ffe3ec", tone: "#ff9dc0" },
    raio:    { a: "#ffe066", b: "#e08b12", c: "#2c1c00", hair: "spike",   acc: "bolt",  eyes: "#fff",    skin: "#ffe6bf", tone: "#ffcf60" },
    tsuki:   { a: "#c9b6ff", b: "#6a4db8", c: "#170d33", hair: "long",    acc: "moon",  eyes: "#f3ecff", skin: "#f2e6ff", tone: "#b79dff" },
    hikari:  { a: "#fff2b8", b: "#e0a521", c: "#2b2103", hair: "bun",     acc: "star",  eyes: "#fff",    skin: "#fff3d6", tone: "#ffe08a" },
    take:    { a: "#c8f08a", b: "#4f8a24", c: "#101f06", hair: "topknot", acc: "leaf",  eyes: "#fff",    skin: "#e9f7d4", tone: "#a8dd63" },
    airisu:  { a: "#a8e8ff", b: "#2f8fd0", c: "#06182a", hair: "wave",    acc: "drop",  eyes: "#fff",    skin: "#e3f6ff", tone: "#7fd4f5" }
  };

  var CSS = [
    ".rnArt{width:100%;height:100%;overflow:visible}",
    ".rnArt g,.rnArt path,.rnArt rect,.rnArt circle{transform-box:view-box}",
    ".rnArt .a-l{transform-origin:32px 66px}",
    ".rnArt .a-r{transform-origin:88px 66px}",
    ".rnArt .l-l{transform-origin:50px 92px}",
    ".rnArt .l-r{transform-origin:70px 92px}",
    ".rnArt .hd{transform-origin:60px 48px}",
    ".rnArt .bd{transform-origin:60px 90px}",
    "@keyframes rnIdle{0%,100%{transform:translateY(0)}50%{transform:translateY(-2.5px)}}",
    "@keyframes rnArmL{0%,100%{transform:rotate(7deg)}50%{transform:rotate(-9deg)}}",
    "@keyframes rnArmR{0%,100%{transform:rotate(-7deg)}50%{transform:rotate(9deg)}}",
    "@keyframes rnHead{0%,100%{transform:rotate(-2.5deg)}50%{transform:rotate(2.5deg)}}",
    "@keyframes rnDanceL{0%{transform:rotate(10deg)}22%{transform:rotate(-125deg)}45%{transform:rotate(-35deg)}68%{transform:rotate(-130deg)}100%{transform:rotate(10deg)}}",
    "@keyframes rnDanceR{0%{transform:rotate(-10deg)}22%{transform:rotate(125deg)}45%{transform:rotate(35deg)}68%{transform:rotate(130deg)}100%{transform:rotate(-10deg)}}",
    "@keyframes rnBounce{0%,100%{transform:translateY(0) scale(1)}45%{transform:translateY(-9px) scale(1.045)}}",
    "@keyframes rnKickL{0%,100%{transform:rotate(0)}50%{transform:rotate(-16deg)}}",
    "@keyframes rnKickR{0%,100%{transform:rotate(0)}50%{transform:rotate(16deg)}}",
    "#gninja .rnArt .bd,#gninja .rnArt .hd{animation:rnIdle 2.8s ease-in-out infinite}",
    "#gninja .rnArt .a-l{animation:rnArmL 2.8s ease-in-out infinite}",
    "#gninja .rnArt .a-r{animation:rnArmR 2.8s ease-in-out infinite}",
    "#gninja .rnArt .l-l{animation:rnKickL 3.6s ease-in-out infinite}",
    "#gninja .rnArt .l-r{animation:rnKickR 3.6s ease-in-out infinite 0.4s}",
    "#gninja.dance .rnArt{animation:rnBounce .5s ease-in-out 9}",
    "#gninja.dance .rnArt .a-l{animation:rnDanceL .95s ease-in-out 5}",
    "#gninja.dance .rnArt .a-r{animation:rnDanceR .95s ease-in-out 5}",
    "#gninja.dance .rnArt .l-l{animation:rnKickL .48s ease-in-out 10}",
    "#gninja.dance .rnArt .l-r{animation:rnKickR .48s ease-in-out 10}",
    "#gninja.dance .rnArt .hd{animation:rnHead .32s ease-in-out 14}",
    ".carc .rnArt .a-l{animation:rnArmL 3.4s ease-in-out infinite}",
    ".carc .rnArt .a-r{animation:rnArmR 3.4s ease-in-out infinite}",
    "@media (prefers-reduced-motion:reduce){.rnArt *,.rnArt{animation:none!important}}"
  ].join("");
  var st = document.createElement("style");
  st.id = "rnArtCss"; st.textContent = CSS;
  (document.head || document.documentElement).appendChild(st);

  function accOf(t) {
    if (t.acc === "band") return '<rect x="36" y="30" width="48" height="7" rx="3.5" fill="#e5484d"/><path d="M84 33h12l-3 4 3 4H84z" fill="#e5484d"/>';
    if (t.acc === "tail") return '<path d="M92 86q22-4 20-24-2 16-20 16z" fill="' + t.a + '"/><circle cx="108" cy="60" r="6" fill="' + t.tone + '"/>';
    if (t.acc === "snow") return '<circle cx="34" cy="24" r="3" fill="#fff" opacity=".9"/><circle cx="48" cy="16" r="2.2" fill="#fff" opacity=".8"/><circle cx="74" cy="20" r="2.6" fill="#fff" opacity=".85"/>';
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
    if (t.hair === "hood") return '<path d="M30 44q0-26 30-26t30 26q0 10-6 14H36q-6-4-6-14z" fill="' + t.b + '"/>';
    if (t.hair === "fox") return '<path d="M32 42q0-22 28-22t28 22q-28-10-56 0z" fill="' + t.b + '"/>' +
      '<path d="M30 26l6-18 10 12z" fill="' + t.b + '"/><path d="M90 26l-6-18-10 12z" fill="' + t.b + '"/>' +
      '<path d="M62 44q10-6 20 0-10 8-20 0z" fill="' + t.tone + '"/>';
    if (t.hair === "snow") return '<path d="M31 44q0-25 29-25t29 25q-10-8-20-3-10 5-20 0-9-4-18 3z" fill="' + t.b + '"/>' +
      '<path d="M34 46q26-10 52 0v6H34z" fill="#eaf9ff" opacity=".85"/>';
    if (t.hair === "pony") return '<path d="M32 44q0-24 28-24t28 24q-28-10-56 0z" fill="' + t.b + '"/>' +
      '<path d="M86 40q12 4 10 22t-12 20q8-24 2-42z" fill="' + t.b + '"/>';
    if (t.hair === "spike") return '<path d="M30 46l6-16 6 12 6-16 8 14 6-14 8 14 6-12 6 14q-26-8-52 4z" fill="' + t.b + '"/>';
    if (t.hair === "long") return '<path d="M31 44q0-25 29-25t29 25v42H31z" fill="' + t.b + '"/>';
    if (t.hair === "bun") return '<path d="M33 44q0-23 27-23t27 23q-27-9-54 0z" fill="' + t.b + '"/>' +
      '<circle cx="60" cy="16" r="8" fill="' + t.b + '"/>';
    if (t.hair === "topknot") return '<path d="M33 45q0-24 27-24t27 24q-27-9-54 0z" fill="' + t.b + '"/>' +
      '<ellipse cx="60" cy="15" rx="7" ry="6" fill="' + t.c + '"/>';
    return '<path d="M31 45q0-25 29-25t29 25q-8-6-16-2-10 6-22 0-10-4-20 2z" fill="' + t.b + '"/>';
  }

  function svg(id, t) {
    return '<svg class="rnArt" viewBox="0 0 120 128" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<ellipse cx="60" cy="119" rx="26" ry="5" fill="' + t.c + '" opacity=".22"/>' +
      '<g class="l-l"><rect x="46" y="90" width="10" height="22" rx="5" fill="' + t.c + '" opacity=".85"/>' +
        '<rect x="42" y="108" width="18" height="9" rx="4.5" fill="' + t.b + '"/></g>' +
      '<g class="l-r"><rect x="64" y="90" width="10" height="22" rx="5" fill="' + t.c + '" opacity=".85"/>' +
        '<rect x="60" y="108" width="18" height="9" rx="4.5" fill="' + t.b + '"/></g>' +
      '<g class="bd"><path d="M42 62q18-7 36 0l4 30q-22 8-44 0z" fill="' + t.a + '"/>' +
        '<path d="M42 62q18-7 36 0v8q-18-5-36 0z" fill="' + t.c + '" opacity=".26"/>' +
        '<rect x="52" y="62" width="16" height="7" rx="3.5" fill="' + t.c + '" opacity=".5"/></g>' +
      '<g class="a-l"><rect x="27" y="65" width="11" height="26" rx="5.5" fill="' + t.a + '"/>' +
        '<circle cx="32.5" cy="92" r="5" fill="' + t.skin + '"/></g>' +
      '<g class="a-r"><rect x="82" y="65" width="11" height="26" rx="5.5" fill="' + t.a + '"/>' +
        '<circle cx="87.5" cy="92" r="5" fill="' + t.skin + '"/></g>' +
      '<g class="hd"><rect x="54" y="52" width="12" height="10" rx="5" fill="' + t.c + '" opacity=".5"/>' +
        '<circle cx="60" cy="42" r="23" fill="' + t.skin + '"/>' +
        hairOf(t) +
        '<rect x="41" y="38" width="38" height="10" rx="5" fill="' + t.c + '" opacity=".82"/>' +
        '<circle cx="51" cy="43" r="3.2" fill="' + t.eyes + '"/><circle cx="69" cy="43" r="3.2" fill="' + t.eyes + '"/>' +
        '<path d="M55 53q5 4 10 0" stroke="' + t.c + '" stroke-width="2" fill="none" stroke-linecap="round"/>' +
        accOf(t) + "</g>" +
      "</svg>";
  }

  function repaintWall() {
    var w = document.getElementById("archWall");
    if (!w) return;
    Array.prototype.forEach.call(w.querySelectorAll(".carc[data-char]"), function (d) {
      var id = d.getAttribute("data-char"), t = SPEC[id], cw = d.querySelector(".cw");
      if (!t || !cw || cw.getAttribute("data-art") === id) return;
      cw.innerHTML = svg(id, t);
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
    var cur = n.querySelector(".rnArt");
    if (cur && cur.getAttribute("data-art") === id) return;
    var tmp = document.createElement("div");
    tmp.innerHTML = svg(id, t);
    var sv = tmp.querySelector("svg");
    sv.setAttribute("data-art", id);
    if (cur) cur.parentNode.replaceChild(sv, cur);
    else n.appendChild(sv);
    n.style.setProperty("--ja", t.a);
    n.style.setProperty("--jb", t.b);
  }

  function dance(el) {
    var n = el && el.closest ? el.closest("#gninja") : null;
    if (!n) return;
    n.classList.remove("dance");
    void n.offsetWidth;
    n.classList.add("dance");
    clearTimeout(n._danceT);
    n._danceT = setTimeout(function () { n.classList.remove("dance"); }, 4600);
    try { if (R.npcMove) R.npcMove("p2bounce"); } catch (e) {}
  }

  function all() { try { repaintWall(); repaintHero(); } catch (e) {} }

  var p0 = R.paintArchive;
  R.paintArchive = function () {
    if (p0) { try { p0(); } catch (e) {} }
    setTimeout(all, 30);
  };
  window.__rnDance = dance;
  document.addEventListener("click", function (e) { dance(e.target); setTimeout(all, 120); }, true);
  var p8 = R.pickChar;
  R.pickChar = function (id) {
    var out = p8 ? p8(id) : null;
    setTimeout(function () { all(); dance(document.getElementById("gninja")); }, 400);
    return out;
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", all);
  else all();
  [800, 2000, 4000, 7000].forEach(function (ms) { setTimeout(all, ms); });
})();
