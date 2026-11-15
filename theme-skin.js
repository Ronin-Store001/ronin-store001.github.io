/* RONIN THEME SKIN — theme-skin.js
   تم‌ها را واقعاً روی کل سایت اعمال می‌کند: پس‌زمینهٔ صفحه، هدر، نوارها و کارت‌ها. */
"use strict";
(function () {
  if (window.__rnSkin) return;
  window.__rnSkin = true;

  var T = {
    neo:    { bg: "radial-gradient(1200px 700px at 78% -10%,#e8dfff 0%,#f5f3ff 38%,#eef1fb 100%)", ink: "#171a2b", surf: "rgba(255,255,255,.72)", line: "rgba(80,70,160,.14)", glow: "rgba(124,92,255,.22)" },
    sakura: { bg: "radial-gradient(1100px 700px at 20% -8%,#ffe3ef 0%,#fff6fa 42%,#fdf1f6 100%)", ink: "#2a1622", surf: "rgba(255,255,255,.76)", line: "rgba(190,70,120,.16)", glow: "rgba(255,120,180,.26)" },
    cyber:  { bg: "radial-gradient(1000px 700px at 70% -10%,#0c2a3a 0%,#07131f 45%,#050a12 100%)", ink: "#dff6ff", surf: "rgba(10,32,46,.62)", line: "rgba(0,220,255,.22)", glow: "rgba(0,220,255,.28)" },
    ember:  { bg: "radial-gradient(1000px 700px at 30% -8%,#3a1206 0%,#1a0b08 48%,#0d0605 100%)", ink: "#ffe6da", surf: "rgba(40,16,10,.6)", line: "rgba(255,120,60,.22)", glow: "rgba(255,110,50,.26)" },
    nebula: { bg: "radial-gradient(1100px 720px at 72% -10%,#2b1d55 0%,#140f2c 46%,#08061a 100%)", ink: "#ece7ff", surf: "rgba(26,20,54,.62)", line: "rgba(160,140,255,.24)", glow: "rgba(140,110,255,.3)" },
    jade:   { bg: "radial-gradient(1100px 700px at 22% -8%,#d9f7e9 0%,#f2fdf7 42%,#eafaf1 100%)", ink: "#0d2318", surf: "rgba(255,255,255,.78)", line: "rgba(20,140,90,.16)", glow: "rgba(32,180,134,.24)" },
    ocean:  { bg: "radial-gradient(1100px 720px at 70% -10%,#0a2d4a 0%,#06182b 46%,#030d18 100%)", ink: "#ddf2ff", surf: "rgba(8,32,54,.62)", line: "rgba(90,190,255,.22)", glow: "rgba(43,124,255,.3)" },
    mono:   { bg: "radial-gradient(1000px 700px at 60% -12%,#22262e 0%,#14161b 48%,#0b0c0f 100%)", ink: "#eef2f8", surf: "rgba(28,31,38,.66)", line: "rgba(200,210,225,.16)", glow: "rgba(200,210,225,.18)" }
  };

  var css = ["html[data-rn-theme]{transition:background .35s ease}"].concat(Object.keys(T).map(function (id) {
    var t = T[id];
    return [
      'html[data-rn-theme="' + id + '"] body{background:' + t.bg + '!important;background-attachment:fixed!important;color:' + t.ink + '}',
      'html[data-rn-theme="' + id + '"] body::after{content:"";position:fixed;inset:0;z-index:-1;pointer-events:none;',
      '  background:radial-gradient(620px 380px at 84% 4%,' + t.glow + ',transparent 70%)}',
      'html[data-rn-theme="' + id + '"] #top{background:' + t.surf + '!important;border-bottom-color:' + t.line + '!important}',
      'html[data-rn-theme="' + id + '"] #rail,html[data-rn-theme="' + id + '"] #dock .dwrap{background:' + t.surf + '!important;border-color:' + t.line + '!important}',
      'html[data-rn-theme="' + id + '"] .card,html[data-rn-theme="' + id + '"] .qc,html[data-rn-theme="' + id + '"] .pnl{',
      '  border-color:' + t.line + '!important}'
    ].join("");
  }));
  var st = document.createElement("style");
  st.id = "rnSkinCss";
  st.textContent = css.join("\n");
  (document.head || document.documentElement).appendChild(st);

  function mark() {
    var id = document.documentElement.getAttribute("data-rn-theme") || "neo";
    document.documentElement.setAttribute("data-rn-skin", id);
  }
  mark();
  if (window.MutationObserver) {
    new MutationObserver(mark).observe(document.documentElement, { attributes: true, attributeFilter: ["data-rn-theme"] });
  }
  document.addEventListener("click", function () { setTimeout(mark, 60); }, true);
  window.__rnSkinThemes = Object.keys(T);
})();
