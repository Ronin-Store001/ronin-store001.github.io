/* RONIN NARUTO GUIDE ART — naruto-guide.js
   کاراکتر راهنمای ناروتو را مثل همراه‌های تازه تمام‌تنه و متحرک می‌کند.
   از همان کلاس‌ها و انیمیشن‌های companion-art.js استفاده می‌کند (.rnArt / .a-l / .l-r / .hd …). */
"use strict";
(function () {
  if (window.__rnNaruto) return;
  window.__rnNaruto = true;

  var CSS = [
    ".rnArt[data-art='naruto'] .whisk{opacity:.55}",
    "#gninja .rnArt[data-art='naruto']{filter:drop-shadow(0 6px 14px rgba(255,138,20,.28))}",
    "#gninja.dance .rnArt[data-art='naruto'] .band-tail{animation:rnBand 1.1s ease-in-out infinite}",
    "@keyframes rnBand{0%,100%{transform:rotate(-4deg)}50%{transform:rotate(9deg)}}"
  ].join("");
  var st = document.createElement("style");
  st.id = "rnNarutoCss";
  st.textContent = CSS;
  (document.head || document.documentElement).appendChild(st);

  var SKIN = "#ffd9b0", SUIT = "#ff8a1f", SUITD = "#c85f0c", DARK = "#1d2333",
      HAIR = "#ffd23f", HAIRD = "#e0a80f", METAL = "#c9d4e4";

  function svg() {
    return '<svg class="rnArt" data-art="naruto" viewBox="0 0 120 128" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<ellipse cx="60" cy="119" rx="26" ry="5" fill="#0a1020" opacity=".24"/>' +
      '<g class="l-l"><rect x="46" y="90" width="10" height="22" rx="5" fill="' + DARK + '"/>' +
        '<rect x="41" y="108" width="19" height="9" rx="4.5" fill="#2b3244"/>' +
        '<rect x="41" y="108" width="19" height="3" rx="1.5" fill="#4d566e"/></g>' +
      '<g class="l-r"><rect x="64" y="90" width="10" height="22" rx="5" fill="' + DARK + '"/>' +
        '<rect x="60" y="108" width="19" height="9" rx="4.5" fill="#2b3244"/>' +
        '<rect x="60" y="108" width="19" height="3" rx="1.5" fill="#4d566e"/></g>' +
      '<g class="bd"><path d="M42 62q18-7 36 0l4 30q-22 8-44 0z" fill="' + SUIT + '"/>' +
        '<path d="M42 62q18-7 36 0v7q-18-5-36 0z" fill="' + SUITD + '"/>' +
        '<path d="M60 63v29" stroke="' + DARK + '" stroke-width="3.2" opacity=".75"/>' +
        '<path d="M44 74h12M64 74h12" stroke="' + DARK + '" stroke-width="2" opacity=".3"/></g>' +
      '<g class="a-l"><rect x="27" y="65" width="11" height="26" rx="5.5" fill="' + SUIT + '"/>' +
        '<circle cx="32.5" cy="92" r="5" fill="' + SKIN + '"/></g>' +
      '<g class="a-r"><rect x="82" y="65" width="11" height="26" rx="5.5" fill="' + SUIT + '"/>' +
        '<circle cx="87.5" cy="92" r="5" fill="' + SKIN + '"/></g>' +
      '<g class="hd">' +
        '<rect x="54" y="52" width="12" height="10" rx="5" fill="' + SUITD + '"/>' +
        '<circle cx="60" cy="42" r="23" fill="' + SKIN + '"/>' +
        '<path d="M30 44l-2-12 10 6-1-13 10 8 1-13 8 9 4-12 6 11 7-9 2 12 11-6-3 13 11-4-6 13z" fill="' + HAIR + '"/>' +
        '<path d="M34 34l4 8M47 28l3 9M60 26v10M73 30l-3 9M86 36l-2 7" stroke="' + HAIRD + '" stroke-width="2.4" stroke-linecap="round"/>' +
        '<rect x="36" y="34" width="48" height="9" rx="3" fill="#1f4fa8"/>' +
        '<rect x="48" y="33.5" width="24" height="10" rx="2.5" fill="' + METAL + '" stroke="#7f8ca8" stroke-width=".8"/>' +
        '<text x="60" y="41.6" text-anchor="middle" font-size="7.4" font-weight="700" fill="#33405a">忍</text>' +
        '<g class="band-tail" style="transform-origin:84px 38px"><path d="M84 37q13 4 11 16l-5-3q2-8-6-9z" fill="#1f4fa8"/></g>' +
        '<rect x="40.5" y="46" width="15" height="8" rx="4" fill="#1a2c4a"/>' +
        '<rect x="64.5" y="46" width="15" height="8" rx="4" fill="#1a2c4a"/>' +
        '<circle cx="48" cy="50" r="3.2" fill="#7ec8ff"/><circle cx="72" cy="50" r="3.2" fill="#7ec8ff"/>' +
        '<path class="whisk" d="M40 53h8M40 57h8M72 53h8M72 57h8" stroke="#c98a5c" stroke-width="1.6" stroke-linecap="round"/>' +
        '<path d="M55 60q5 4 10 0" stroke="#8c5a34" stroke-width="1.8" fill="none" stroke-linecap="round"/>' +
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
