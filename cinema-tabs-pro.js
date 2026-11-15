/* RONIN CINEMA TABS PRO — cinema-tabs-pro.js
   نوار تب صفحهٔ فیلم: آیکون SVG، شمارش به‌شکل نشان، اسکرول افقی نرم موبایل. */
"use strict";
(function () {
  if (window.__cxTabsPro) return;
  window.__cxTabsPro = true;

  var ICO = {
    all: '<path d="M4 6h16M4 12h16M4 18h10"/>',
    anime: '<path d="M12 3.6l2 4.4 4.8.6-3.6 3.3 1 4.7-4.2-2.4-4.2 2.4 1-4.7L5.2 8.6 10 8z"/>',
    film: '<rect x="3" y="5" width="18" height="14" rx="2.6"/><path d="M7.5 5v14M16.5 5v14M3 9.6h4.5M16.5 9.6H21M3 14.4h4.5M16.5 14.4H21"/>',
    series: '<rect x="3" y="4" width="18" height="12.4" rx="2.4"/><path d="M8.5 20h7M12 16.4V20"/>',
    mine: '<path d="M6.5 4h11v16l-5.5-3.8L6.5 20z"/>'
  };
  function icon(k) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICO[k] || ICO.all) + "</svg>";
  }

  var CSS = [
    "#cxTabs{position:sticky;top:8px;z-index:140;display:flex;align-items:center;gap:8px;padding:7px;",
    "  margin:0 0 18px;border-radius:18px;overflow-x:auto;overflow-y:hidden;scrollbar-width:none;",
    "  scroll-snap-type:x proximity;scroll-padding-inline:10px;-webkit-overflow-scrolling:touch;",
    "  overscroll-behavior-x:contain;width:100%;box-sizing:border-box;",
    "  background:linear-gradient(180deg,rgba(13,16,36,.94),rgba(9,11,24,.88));",
    "  border:1px solid rgba(140,160,255,.2);backdrop-filter:blur(16px) saturate(150%);",
    "  -webkit-backdrop-filter:blur(16px) saturate(150%);",
    "  box-shadow:0 24px 60px -42px #000,inset 0 1px 0 rgba(255,255,255,.06)}",
    "#cxTabs::-webkit-scrollbar{display:none}",
    "#cxTabs::after{content:'';position:absolute;inset-inline-end:0;top:0;bottom:0;width:26px;pointer-events:none;",
    "  background:linear-gradient(270deg,rgba(9,11,24,.85),transparent)}",
    ".cx-tab{flex:0 0 auto;scroll-snap-align:center;display:inline-flex;align-items:center;gap:7px;",
    "  height:38px;padding:0 12px 0 10px;border-radius:12px;border:1px solid rgba(140,160,255,.14);",
    "  background:rgba(255,255,255,.035);color:#b6c2df;font:inherit;font-size:11.5px;font-weight:800;",
    "  cursor:pointer;transition:transform .16s,background .16s,color .16s,border-color .16s,box-shadow .16s;",
    "  white-space:nowrap;position:relative;line-height:1}",
    ".cx-tab .cx-tabi{display:grid;place-items:center;width:20px;height:20px;border-radius:7px;",
    "  background:rgba(124,92,255,.14);color:#a9b8ff;transition:.16s;flex:0 0 auto}",
    ".cx-tab .cx-tabi svg{width:13px;height:13px;display:block}",
    ".cx-tab .cx-tabl{letter-spacing:.2px}",
    ".cx-tab .cx-tabc{display:inline-grid;place-items:center;min-width:20px;height:19px;padding:0 5px;",
    "  border-radius:7px;font-size:9.5px;font-weight:900;color:#cfe0ff;background:rgba(255,255,255,.09);",
    "  border:1px solid rgba(255,255,255,.08);direction:ltr;transition:.16s}",
    ".cx-tab:hover{color:#fff;background:rgba(255,255,255,.07);border-color:rgba(140,160,255,.32);",
    "  transform:translateY(-1px)}",
    ".cx-tab:hover .cx-tabi{background:rgba(124,92,255,.28);color:#dbe4ff}",
    ".cx-tab.on,.cx-tab[aria-selected='true']{color:#070a18;border-color:transparent;",
    "  background:linear-gradient(135deg,#8ef0ff,#7c5cff 78%);",
    "  box-shadow:0 14px 30px -18px rgba(124,92,255,1),inset 0 1px 0 rgba(255,255,255,.5)}",
    ".cx-tab.on .cx-tabi{background:rgba(6,10,26,.24);color:#060a18}",
    ".cx-tab.on .cx-tabc{background:rgba(6,10,26,.85);color:#eaf2ff;border-color:transparent}",
    ".cx-tab.on .cx-tabi svg{stroke-width:2.3}",
    ".cx-ar-track,.cx-ag-strip{scroll-snap-type:x proximity;-webkit-overflow-scrolling:touch;",
    "  overscroll-behavior-x:contain;scrollbar-width:none;padding-bottom:2px}",
    ".cx-ar-track::-webkit-scrollbar,.cx-ag-strip::-webkit-scrollbar,.cx-nav::-webkit-scrollbar{display:none}",
    ".cx-ar-track>*,.cx-ag-strip>*{scroll-snap-align:start}",
    ".cx-nav{overflow-x:auto;overscroll-behavior-x:contain;-webkit-overflow-scrolling:touch;scrollbar-width:none}",
    "@media (max-width:760px){",
    "  #cxTabs{top:4px;gap:6px;padding:6px;border-radius:16px;margin-bottom:14px}",
    "  #cxTabs::after{width:18px}",
    "  .cx-tab{height:36px;padding:0 9px;font-size:11px;border-radius:11px}",
    "  .cx-tab .cx-tabi{width:18px;height:18px;border-radius:6px}",
    "  .cx-tab .cx-tabi svg{width:12px;height:12px}",
    "  .cx-tab .cx-tabc{min-width:18px;height:18px;font-size:9px}",
    "  .cx-ar-track{scroll-snap-type:x mandatory;gap:10px}",
    "}",
    "@media (prefers-reduced-motion:reduce){#cxTabs{scroll-behavior:auto}.cx-tab{transition:none}}"
  ].join("");
  var st = document.createElement("style");
  st.id = "cxTabsProCss";
  st.textContent = CSS;
  (document.head || document.documentElement).appendChild(st);

  var busy = false;
  function center(box) {
    var on = box.querySelector(".cx-tab.on,.cx-tab[aria-selected='true']");
    if (!on) return;
    var br = box.getBoundingClientRect(), tr = on.getBoundingClientRect();
    if (!br.width) return;
    if (tr.left >= br.left + 8 && tr.right <= br.right - 8) return;
    var delta = (tr.left - br.left) - (br.width - tr.width) / 2;
    box.scrollTo({ left: box.scrollLeft + delta, behavior: "smooth" });
  }

  function build(b) {
    var k = b.getAttribute("data-tab") || "all";
    var cntEl = b.querySelector("b");
    var cnt = cntEl ? cntEl.textContent : "";
    var raw = (b.textContent || "").replace(cnt, "");
    var label = raw.replace(/[\u2190-\u2BFF\uD800-\uDFFF\uFE0F]/g, "").trim();
    if (!label) label = { all: "همه", anime: "انیمه", film: "فیلم", series: "سریال", mine: "لیست من" }[k] || "همه";
    b.innerHTML = '<i class="cx-tabi">' + icon(k) + '</i><span class="cx-tabl">' + label + "</span>" +
      (cnt ? '<b class="cx-tabc">' + cnt + "</b>" : "");
    b.setAttribute("role", "tab");
    if (!b.title) b.title = label;
  }

  function paint() {
    var box = document.getElementById("cxTabs");
    if (!box || busy) return;
    var tabs = box.querySelectorAll(".cx-tab");
    if (!tabs.length) return;
    busy = true;
    for (var i = 0; i < tabs.length; i++) {
      if (!tabs[i].querySelector(".cx-tabi")) build(tabs[i]);
    }
    busy = false;
    center(box);
  }

  function boot() {
    var box = document.getElementById("cxTabs");
    if (!box) return;
    paint();
    if (window.MutationObserver) {
      new MutationObserver(function () { setTimeout(paint, 20); }).observe(box, { childList: true });
    }
    box.addEventListener("wheel", function (e) {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      if (box.scrollWidth <= box.clientWidth + 2) return;
      box.scrollLeft += e.deltaY;
      e.preventDefault();
    }, { passive: false });
    var down = false, sx = 0, sl = 0, moved = false;
    box.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      down = true; moved = false; sx = e.clientX; sl = box.scrollLeft;
    });
    box.addEventListener("pointermove", function (e) {
      if (!down) return;
      var dx = e.clientX - sx;
      if (Math.abs(dx) > 6) moved = true;
      if (moved) { box.scrollLeft = sl - dx; e.preventDefault(); }
    });
    box.addEventListener("pointerup", function () { down = false; });
    box.addEventListener("pointercancel", function () { down = false; });
    box.addEventListener("click", function (e) {
      if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; }
    }, true);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
