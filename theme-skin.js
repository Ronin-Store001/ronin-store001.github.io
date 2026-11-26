/* RONIN THEME SKIN — theme-skin.js v2
   تم‌ها را واقعاً روی کل سایت اعمال می‌کند: پس‌زمینهٔ صفحه، هدر، نوارها و کارت‌ها.
   هر تم دو چهره دارد (تیره / روشن) — قبلاً چهرهٔ روشن تم‌ها هدر و نوار پایین را
   حتی در تم تیره سفید می‌کرد و همین منبع نوارهای سفید بود. */
"use strict";
(function () {
  if (window.__rnSkin) return;
  window.__rnSkin = true;

  /* [bg, ink, surface, line, glow] — d = چهرهٔ تیره، l = چهرهٔ روشن */
  var T = {
    neo: {
      d: ["radial-gradient(1200px 700px at 78% -10%,#251d52 0%,#151033 42%,#08061a 100%)", "#ece9ff", "rgba(15,13,38,.74)", "rgba(150,130,255,.20)", "rgba(124,92,255,.30)"],
      l: ["radial-gradient(1200px 700px at 78% -10%,#e8dfff 0%,#f5f3ff 38%,#eef1fb 100%)", "#171a2b", "rgba(255,255,255,.84)", "rgba(80,70,160,.14)", "rgba(124,92,255,.22)"]
    },
    sakura: {
      d: ["radial-gradient(1100px 700px at 20% -8%,#3d1730 0%,#1c0d1c 46%,#0a0509 100%)", "#ffe6f1", "rgba(38,13,28,.74)", "rgba(255,120,180,.22)", "rgba(255,120,180,.30)"],
      l: ["radial-gradient(1100px 700px at 20% -8%,#ffe3ef 0%,#fff6fa 42%,#fdf1f6 100%)", "#2a1622", "rgba(255,255,255,.86)", "rgba(190,70,120,.16)", "rgba(255,120,180,.26)"]
    },
    cyber: {
      d: ["radial-gradient(1000px 700px at 70% -10%,#0c2a3a 0%,#07131f 45%,#050a12 100%)", "#dff6ff", "rgba(9,26,38,.76)", "rgba(0,220,255,.24)", "rgba(0,220,255,.28)"],
      l: ["radial-gradient(1000px 700px at 70% -10%,#dff6ff 0%,#f2fbff 42%,#eaf7fe 100%)", "#08222e", "rgba(255,255,255,.86)", "rgba(0,170,200,.22)", "rgba(0,190,220,.22)"]
    },
    ember: {
      d: ["radial-gradient(1000px 700px at 30% -8%,#3a1206 0%,#1a0b08 48%,#0d0605 100%)", "#ffe6da", "rgba(36,13,8,.74)", "rgba(255,120,60,.26)", "rgba(255,110,50,.26)"],
      l: ["radial-gradient(1000px 700px at 30% -8%,#ffe6d6 0%,#fff7f1 44%,#fdf1ea 100%)", "#2c1408", "rgba(255,255,255,.86)", "rgba(220,110,50,.20)", "rgba(255,140,80,.22)"]
    },
    nebula: {
      d: ["radial-gradient(1100px 720px at 72% -10%,#2b1d55 0%,#140f2c 46%,#08061a 100%)", "#ece7ff", "rgba(20,16,42,.74)", "rgba(160,140,255,.24)", "rgba(140,110,255,.30)"],
      l: ["radial-gradient(1100px 720px at 72% -10%,#ece6ff 0%,#f8f5ff 44%,#f2eeff 100%)", "#241a44", "rgba(255,255,255,.86)", "rgba(140,110,255,.22)", "rgba(150,120,255,.22)"]
    },
    jade: {
      d: ["radial-gradient(1100px 700px at 22% -8%,#0f3a2a 0%,#082018 46%,#04100b 100%)", "#dcfdec", "rgba(8,30,22,.74)", "rgba(40,200,140,.22)", "rgba(32,180,134,.28)"],
      l: ["radial-gradient(1100px 700px at 22% -8%,#d9f7e9 0%,#f2fdf7 42%,#eafaf1 100%)", "#0d2318", "rgba(255,255,255,.86)", "rgba(20,140,90,.16)", "rgba(32,180,134,.24)"]
    },
    ocean: {
      d: ["radial-gradient(1100px 720px at 70% -10%,#0a2d4a 0%,#06182b 46%,#030d18 100%)", "#ddf2ff", "rgba(6,24,42,.76)", "rgba(90,190,255,.24)", "rgba(43,124,255,.30)"],
      l: ["radial-gradient(1100px 720px at 70% -10%,#dcefff 0%,#f2f9ff 44%,#e9f4ff 100%)", "#062338", "rgba(255,255,255,.86)", "rgba(60,150,220,.20)", "rgba(43,124,255,.20)"]
    },
    mono: {
      d: ["radial-gradient(1000px 700px at 60% -12%,#22262e 0%,#14161b 48%,#0b0c0f 100%)", "#eef2f8", "rgba(20,23,28,.78)", "rgba(200,210,225,.18)", "rgba(200,210,225,.18)"],
      l: ["radial-gradient(1000px 700px at 60% -12%,#f2f4f8 0%,#fafbfd 44%,#f4f6fa 100%)", "#14171d", "rgba(255,255,255,.88)", "rgba(40,50,70,.14)", "rgba(120,140,170,.16)"]
    }
  };

  function shell(id, face, dark) {
    var bg = face[0], ink = face[1], surf = face[2], line = face[3], glow = face[4];
    var q = 'html[data-rn-theme="' + id + '"]' + (dark ? ':not([data-theme="light"])' : '[data-theme="light"]');
    return [
      q + ' body{background:' + bg + '!important;background-attachment:fixed!important;color:' + ink + '}',
      q + ' body::after{content:"";position:fixed;inset:0;z-index:-1;pointer-events:none;',
        'background:radial-gradient(620px 380px at 84% 4%,' + glow + ',transparent 70%)}',
      /* هدر، نوار پایین و منوی کناری همیشه با تن صفحه هم‌رنگ‌اند */
      q + ' #top,' + q + ' #rail,' + q + ' #dock .dwrap{',
        'background:' + surf + '!important;border-color:' + line + '!important;',
        'backdrop-filter:blur(22px) saturate(150%);-webkit-backdrop-filter:blur(22px) saturate(150%)}',
      q + ' #dock,' + q + ' #dock::before{background:transparent!important;border-color:' + line + '!important}',
      q + ' .card,' + q + ' .qc,' + q + ' .pnl{border-color:' + line + '!important}'
    ].join("");
  }

  var css = ["html[data-rn-theme]{transition:background .35s ease}"];
  Object.keys(T).forEach(function (id) {
    css.push(shell(id, T[id].d, true));
    css.push(shell(id, T[id].l, false));
  });
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
