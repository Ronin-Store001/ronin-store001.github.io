/* RONIN NARUTO GUIDE ART v3 — naruto-guide.js
   ناروتو به سبک تمیز و دوست‌داشتنی همراه‌های دیگر: سر بزرگ، خطوط ساده،
   موی زرد پرپشت، هدبند آبی با پلاک، لباس نارنجی و چشم‌های آبی. */
"use strict";
(function () {
  if (window.__rnNaruto) return;
  window.__rnNaruto = true;

  var CSS = [
    "#gninja .rnArt[data-art='naruto']{filter:drop-shadow(0 8px 14px rgba(255,132,26,.26))}",
    ".rnArt[data-art='naruto'] .whisk{opacity:.45}",
    "#gninja.dance .rnArt[data-art='naruto'] .band-tail{animation:rnNBand 1s ease-in-out infinite}",
    "@keyframes rnNBand{0%,100%{transform:rotate(-6deg)}50%{transform:rotate(12deg)}}",
    "@media (prefers-reduced-motion:reduce){.rnArt[data-art='naruto'] *{animation:none!important}}"
  ].join("");
  var st = document.createElement("style");
  st.id = "rnNarutoCss";
  st.textContent = CSS;
  (document.head || document.documentElement).appendChild(st);

  var SKIN = "#ffd6ae", SKIN_D = "#f2b686", SUIT = "#ff8f2e", SUIT_D = "#e5711a",
      NIGHT = "#20283a", NIGHT_L = "#39435a", HAIR = "#ffd53d", HAIR_D = "#e9a80a",
      BLUE = "#2b62c4", BLUE_D = "#1b428c", METAL = "#dbe4f0";

  function svg() {
    return '<svg class="rnArt" data-art="naruto" viewBox="0 0 120 128" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<ellipse cx="60" cy="118" rx="24" ry="4.5" fill="#1a1030" opacity=".16"/>' +
      '<g class="l-l">' +
        '<rect x="47" y="90" width="10" height="21" rx="5" fill="' + NIGHT + '"/>' +
        '<rect x="42.5" y="107" width="18" height="8.5" rx="4.2" fill="' + NIGHT_L + '"/>' +
      "</g>" +
      '<g class="l-r">' +
        '<rect x="63" y="90" width="10" height="21" rx="5" fill="' + NIGHT + '"/>' +
        '<rect x="59.5" y="107" width="18" height="8.5" rx="4.2" fill="' + NIGHT_L + '"/>' +
      "</g>" +
      '<g class="bd">' +
        '<path d="M42 60q18-6 36 0l3.5 32q-21.5 7-43 0z" fill="' + SUIT + '"/>' +
        '<path d="M42 60q18-6 36 0l1 7q-19-5-38 0z" fill="' + SUIT_D + '"/>' +
        '<path d="M60 67v25" stroke="' + SUIT_D + '" stroke-width="2.4" opacity=".55"/>' +
        '<path d="M48 78q12 4 24 0" stroke="' + SUIT_D + '" stroke-width="2" fill="none" opacity=".3"/>' +
      "</g>" +
      '<g class="a-l">' +
        '<rect x="28" y="64" width="11" height="24" rx="5.5" fill="' + SUIT + '"/>' +
        '<circle cx="33.5" cy="89" r="5.2" fill="' + SKIN + '"/>' +
      "</g>" +
      '<g class="a-r">' +
        '<rect x="81" y="64" width="11" height="24" rx="5.5" fill="' + SUIT + '"/>' +
        '<circle cx="86.5" cy="89" r="5.2" fill="' + SKIN + '"/>' +
      "</g>" +
      '<g class="hd">' +
        '<rect x="54" y="52" width="12" height="10" rx="5" fill="' + SKIN_D + '"/>' +
        '<circle cx="60" cy="42" r="22.5" fill="' + SKIN + '"/>' +
        '<path d="M33 45l-2-10 9 5-1-11 9 7 2-11 7 8 5-9 5 9 6-7 1 11 8-5-2 11 7-3-5 8z" fill="' + HAIR + '"/>' +
        '<path d="M40 33l2 6M50 28l2 6M60 26l1 7M70 29l-1 6" stroke="' + HAIR_D + '" stroke-width="2" stroke-linecap="round" opacity=".7"/>' +
        '<rect x="37" y="34" width="46" height="9" rx="3.2" fill="' + BLUE + '"/>' +
        '<rect x="48" y="33.2" width="24" height="10.4" rx="2.6" fill="' + METAL + '" stroke="#93a2b8" stroke-width=".8"/>' +
        '<text x="60" y="41.2" text-anchor="middle" font-size="7.2" font-weight="700" fill="#33405a">忍</text>' +
        '<g class="band-tail" style="transform-origin:83px 38px">' +
          '<path d="M83 37q12 3 10 15l-5-3q2-7-5-8z" fill="' + BLUE_D + '"/>' +
        "</g>" +
        '<ellipse cx="51" cy="50" rx="6.2" ry="5.2" fill="#fff"/>' +
        '<ellipse cx="69" cy="50" rx="6.2" ry="5.2" fill="#fff"/>' +
        '<circle cx="51.6" cy="50.4" r="3.4" fill="#3f86e0"/>' +
        '<circle cx="68.4" cy="50.4" r="3.4" fill="#3f86e0"/>' +
        '<circle cx="51.6" cy="50.4" r="1.6" fill="#132a4a"/>' +
        '<circle cx="68.4" cy="50.4" r="1.6" fill="#132a4a"/>' +
        '<circle cx="52.9" cy="49" r="1.1" fill="#fff"/>' +
        '<circle cx="69.7" cy="49" r="1.1" fill="#fff"/>' +
        '<path class="whisk" d="M40.5 52.6q3.6-.7 7 0M40.5 55.8q3.6-.5 7 .3M72.5 52.6q-3.6-.7-7 0M72.5 55.8q-3.6-.5-7 .3" stroke="#d09a6a" stroke-width="1.4" stroke-linecap="round" fill="none"/>' +
        '<path d="M55 59.4q5 3.4 10 0" stroke="#b1703c" stroke-width="1.7" fill="none" stroke-linecap="round"/>' +
        '<circle cx="43" cy="57" r="3.2" fill="#ff9db1" opacity=".28"/>' +
        '<circle cx="77" cy="57" r="3.2" fill="#ff9db1" opacity=".28"/>' +
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
