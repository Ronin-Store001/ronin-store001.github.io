/* RONIN NARUTO GUIDE ART v2 — naruto-guide.js
   کاراکتر راهنمای ناروتو، تمام‌تنه و متحرک، هم‌تراز با همراه‌های تازه:
   موی پرپشت سه‌لایه، هدبند با پلاک «忍» و دنبالهٔ پارچه، چشم‌های آبی درخشان،
   خط‌های ریش، جلیقهٔ نارنجی با یقهٔ تیره و زیپ، کونای در دست و هالهٔ چاکرا زیر پا. */
"use strict";
(function () {
  if (window.__rnNaruto) return;
  window.__rnNaruto = true;

  var CSS = [
    ".rnArt[data-art='naruto'] .whisk{opacity:.6}",
    ".rnArt[data-art='naruto'] .chakra{animation:rnChakra 2.6s ease-in-out infinite;transform-origin:60px 118px}",
    ".rnArt[data-art='naruto'] .kunai{animation:rnGlint 1.9s ease-in-out infinite;transform-origin:34px 88px}",
    "#gninja .rnArt[data-art='naruto']{filter:drop-shadow(0 8px 16px rgba(255,120,20,.32))}",
    "#gninja.dance .rnArt[data-art='naruto'] .band-tail{animation:rnBand 1.1s ease-in-out infinite}",
    "#gninja.dance .rnArt[data-art='naruto'] .chakra{animation:rnChakraFast .8s ease-in-out infinite}",
    "@keyframes rnBand{0%,100%{transform:rotate(-4deg)}50%{transform:rotate(11deg)}}",
    "@keyframes rnChakra{0%,100%{opacity:.28;transform:scale(.94)}50%{opacity:.6;transform:scale(1.06)}}",
    "@keyframes rnChakraFast{0%,100%{opacity:.35;transform:scale(.9)}50%{opacity:.85;transform:scale(1.14)}}",
    "@keyframes rnGlint{0%,100%{filter:none}50%{filter:drop-shadow(0 0 3px rgba(160,220,255,.95))}}",
    "@media (prefers-reduced-motion:reduce){.rnArt[data-art='naruto'] *{animation:none!important}}"
  ].join("");
  var st = document.createElement("style");
  st.id = "rnNarutoCss";
  st.textContent = CSS;
  (document.head || document.documentElement).appendChild(st);

  var SKIN = "#ffd9b0", SKIN_D = "#f0b98c", SUIT = "#ff8a1f", SUIT_D = "#d1660c",
      NIGHT = "#1d2333", NIGHT_D = "#12161f", HAIR = "#ffd23f", HAIR_D = "#e8a80c",
      HAIR_L = "#ffe98a", METAL = "#cfd8e6", CHAKRA = "#6fd3ff";

  function svg() {
    return '<svg class="rnArt" data-art="naruto" viewBox="0 0 120 128" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<ellipse class="chakra" cx="60" cy="118" rx="30" ry="7" fill="' + CHAKRA + '" opacity=".35"/>' +
      '<ellipse cx="60" cy="119" rx="25" ry="4.5" fill="#12203a" opacity=".18"/>' +
      '<g class="l-l">' +
        '<rect x="47" y="88" width="10.5" height="24" rx="5" fill="' + NIGHT + '"/>' +
        '<rect x="47" y="88" width="4" height="24" rx="2" fill="' + NIGHT_D + '"/>' +
        '<rect x="41.5" y="108" width="19" height="9.5" rx="4.5" fill="#2b3244"/>' +
        '<rect x="41.5" y="108" width="19" height="3.2" rx="1.6" fill="#586180"/>' +
        '<path d="M45 108v9.5M49 108v9.5M53 108v9.5M57 108v9.5" stroke="#161c28" stroke-width="1" opacity=".5"/>' +
      "</g>" +
      '<g class="l-r">' +
        '<rect x="63" y="88" width="10.5" height="24" rx="5" fill="' + NIGHT + '"/>' +
        '<rect x="69.5" y="88" width="4" height="24" rx="2" fill="' + NIGHT_D + '"/>' +
        '<rect x="59.5" y="108" width="19" height="9.5" rx="4.5" fill="#2b3244"/>' +
        '<rect x="59.5" y="108" width="19" height="3.2" rx="1.6" fill="#586180"/>' +
        '<path d="M63 108v9.5M67 108v9.5M71 108v9.5M75 108v9.5" stroke="#161c28" stroke-width="1" opacity=".5"/>' +
      "</g>" +
      '<g class="bd">' +
        '<path d="M41 60q19-7 38 0l4 32q-23 8-46 0z" fill="' + SUIT + '"/>' +
        '<path d="M41 60q19-7 38 0l1 6q-20-6-40 0z" fill="' + NIGHT + '"/>' +
        '<path d="M43 74q17 5 34 0v6q-17 5-34 0z" fill="' + SUIT_D + '" opacity=".55"/>' +
        '<path d="M60 66v26" stroke="' + NIGHT + '" stroke-width="3" opacity=".8"/>' +
        '<path d="M60 66v26" stroke="#e8eef7" stroke-width="1" opacity=".55"/>' +
        '<circle cx="60" cy="80" r="2.4" fill="' + METAL + '"/>' +
        '<path d="M47 63q-3 12-1 24" stroke="' + SUIT_D + '" stroke-width="2" fill="none" opacity=".6"/>' +
        '<path d="M73 63q3 12 1 24" stroke="' + SUIT_D + '" stroke-width="2" fill="none" opacity=".6"/>' +
      "</g>" +
      '<g class="a-l">' +
        '<rect x="26.5" y="64" width="11" height="25" rx="5.5" fill="' + SUIT + '"/>' +
        '<rect x="26.5" y="64" width="3.6" height="25" rx="1.8" fill="' + SUIT_D + '" opacity=".6"/>' +
        '<circle cx="32" cy="91" r="5.2" fill="' + SKIN + '"/>' +
        '<g class="kunai"><path d="M32 91l-3.5 13 3.5 4 3.5-4z" fill="#9aa7bb"/>' +
          '<path d="M32 91l-1.6 12 1.6 2 1.6-2z" fill="#e6edf7"/>' +
          '<circle cx="32" cy="104" r="2" fill="' + NIGHT + '"/></g>' +
      "</g>" +
      '<g class="a-r">' +
        '<rect x="82.5" y="64" width="11" height="25" rx="5.5" fill="' + SUIT + '"/>' +
        '<rect x="82.5" y="64" width="3.6" height="25" rx="1.8" fill="' + SUIT_D + '" opacity=".6"/>' +
        '<circle cx="88" cy="91" r="5.2" fill="' + SKIN + '"/>' +
        '<circle cx="88" cy="76" r="3.4" fill="#fff3d6" opacity=".9"/>' +
        '<path d="M88 73.6l.9 1.9 2 .3-1.5 1.4.4 2-1.8-1-1.8 1 .4-2-1.5-1.4 2-.3z" fill="' + SUIT_D + '"/>' +
      "</g>" +
      '<g class="hd">' +
        '<rect x="54" y="50" width="12" height="11" rx="5" fill="' + SKIN_D + '"/>' +
        '<circle cx="60" cy="41" r="23" fill="' + SKIN + '"/>' +
        '<path d="M37.5 44a22.5 22.5 0 0 1 45 0q-6 4-12 1-6 3-12 0-6 3-12 0-5 2-9-1z" fill="' + SKIN_D + '" opacity=".35"/>' +
        '<path d="M30 45l-3-14 11 6-2-15 11 9 1-15 9 11 5-14 7 13 8-10 1 14 12-7-4 15 12-3-8 15z" fill="' + HAIR_D + '"/>' +
        '<path d="M33 41l-1-9 8 5-1-11 8 7 1-11 7 8 4-10 5 9 6-7 1 10 9-5-3 11 8-2-6 11z" fill="' + HAIR + '"/>' +
        '<path d="M41 30l3 7M52 25l2 8M63 23l1 9M74 27l-2 8" stroke="' + HAIR_L + '" stroke-width="2.2" stroke-linecap="round" opacity=".85"/>' +
        '<rect x="35.5" y="32.5" width="49" height="9.4" rx="3" fill="#1f4fa8"/>' +
        '<rect x="35.5" y="32.5" width="49" height="3" rx="1.5" fill="#2f66c9" opacity=".8"/>' +
        '<rect x="47.5" y="31.6" width="25" height="11" rx="2.6" fill="' + METAL + '" stroke="#7f8ca8" stroke-width=".9"/>' +
        '<path d="M47.5 34h25" stroke="#fff" stroke-width="1.2" opacity=".55"/>' +
        '<text x="60" y="40.6" text-anchor="middle" font-size="7.6" font-weight="700" fill="#33405a">忍</text>' +
        '<g class="band-tail" style="transform-origin:84px 37px">' +
          '<path d="M84 36q14 4 12 17l-5.5-3.4q2.2-8-6.5-9.2z" fill="#1f4fa8"/>' +
          '<path d="M84 36q14 4 12 17l-2.6-1.6q1-9-9.4-11.6z" fill="#2f66c9" opacity=".7"/>' +
        "</g>" +
        '<ellipse cx="49" cy="49.5" rx="6.4" ry="5" fill="#fff"/>' +
        '<ellipse cx="71" cy="49.5" rx="6.4" ry="5" fill="#fff"/>' +
        '<circle cx="49.5" cy="50" r="3.5" fill="#2f7fd4"/>' +
        '<circle cx="70.5" cy="50" r="3.5" fill="#2f7fd4"/>' +
        '<circle cx="49.5" cy="50" r="1.7" fill="#0d2b52"/>' +
        '<circle cx="70.5" cy="50" r="1.7" fill="#0d2b52"/>' +
        '<circle cx="50.8" cy="48.6" r="1.2" fill="#fff"/>' +
        '<circle cx="71.8" cy="48.6" r="1.2" fill="#fff"/>' +
        '<path d="M42.5 44.4q6.4-2.6 12.8-.6M64.8 43.8q6.4-2 12.8.6" stroke="#c98a3c" stroke-width="1.7" stroke-linecap="round" fill="none" opacity=".8"/>' +
        '<path class="whisk" d="M38.6 52.4q4-.8 8 0M38.6 56q4-.6 8 .4M73.4 52.4q-4-.8-8 0M73.4 56q-4-.6-8 .4" stroke="#c98a5c" stroke-width="1.5" stroke-linecap="round" fill="none"/>' +
        '<path d="M60 52v3.2" stroke="' + SKIN_D + '" stroke-width="1.6" stroke-linecap="round"/>' +
        '<path d="M54.6 58.4q5.4 3.6 10.8 0" stroke="#a8632f" stroke-width="1.8" fill="none" stroke-linecap="round"/>' +
      "</g></svg>";
  }

  function current() {
    try {
      var id = (window.R && R.USER && R.USER.npcChar) || (window.R && R.npcCharCur) || "naruto";
      return String(id);
    } catch (e) { return "naruto"; }
  }

  function ensure() {
    var n = document.getElementById("gninja");
    if (!n || current() !== "naruto") return;
    if (n.querySelector('.rnArt[data-art="naruto"]')) return;
    var tmp = document.createElement("div");
    tmp.innerHTML = svg();
    var sv = tmp.querySelector("svg");
    var old = n.querySelector("svg");
    if (old) old.parentNode.replaceChild(sv, old);
    else n.appendChild(sv);
  }

  document.addEventListener("click", function () { setTimeout(ensure, 200); }, true);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", ensure);
  else ensure();
  [400, 1200, 2600, 5000].forEach(function (ms) { setTimeout(ensure, ms); });
  setInterval(ensure, 1500);
})();
