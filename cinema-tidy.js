/* RONIN CINEMA TIDY — cinema-tidy.js
   مرتب‌سازی صفحهٔ فیلم/سریال/انیمه: نوار تب‌ها، سرصفحه، فیلترها و شبکهٔ کارت‌ها روی هم نمی‌افتند. */
"use strict";
(function () {
  if (window.__cxTidy) return;
  window.__cxTidy = true;
  var CSS = [
    ".cx-tabs,#cxTabs{position:sticky;top:8px;z-index:70;display:flex;align-items:center;gap:6px;",
    "  width:100%;box-sizing:border-box;padding:6px;margin:0 0 12px;border-radius:16px;",
    "  background:rgba(10,12,24,.9);border:1px solid rgba(140,160,255,.18);",
    "  backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);overflow-x:auto;scrollbar-width:none}",
    ".cx-tabs::-webkit-scrollbar,#cxTabs::-webkit-scrollbar{display:none}",
    ".cx-tabs>*,#cxTabs>*{flex:0 0 auto;height:34px!important;min-height:34px;box-sizing:border-box;",
    "  border-radius:11px!important;font-size:11.5px!important;line-height:1;display:inline-flex;",
    "  align-items:center;justify-content:center;gap:5px;white-space:nowrap}",
    ".cx-head{display:flex!important;align-items:center!important;gap:8px!important;flex-wrap:wrap!important;",
    "  margin:4px 0 14px!important;padding:0!important;min-height:40px}",
    ".cx-head>*{margin:0!important;flex:0 0 auto}",
    ".cx-head .cx-cnt,.cx-head .cx-count,.cx-head h1,.cx-head h2,.cx-head .cx-title{order:0!important}",
    ".cx-head .cx-sortbox{order:1!important;height:34px;display:flex;align-items:center}",
    ".cx-head .cx-btn,.cx-head .cx-ico{order:2!important;height:34px!important;box-sizing:border-box}",
    ".cx-head .cx-sortbox select,.cx-head select{height:30px!important;padding:0 8px!important;border-radius:9px!important}",
    ".cx-grid{grid-template-columns:repeat(auto-fill,minmax(168px,1fr))!important;gap:14px!important;align-items:start}",
    ".cx-grid>*{min-width:0}",
    ".cx-side{position:sticky;top:60px;align-self:start;max-height:calc(100vh - 80px);overflow:auto;",
    "  scrollbar-width:thin;display:grid;gap:10px}",
    ".cx-side::-webkit-scrollbar{width:6px}",
    ".cx-side::-webkit-scrollbar-thumb{background:rgba(140,160,255,.3);border-radius:4px}",
    ".cx-side .cx-info-card,.cx-side .cx-card,.cx-side section{margin:0!important}",
    ".cx-side button,.cx-side .cx-btn{font-size:10.5px!important;height:30px!important;padding:0 9px!important;",
    "  border-radius:9px!important;white-space:nowrap}",
    ".cx-top,.cx-bar{display:flex;align-items:center;gap:8px;flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none}",
    ".cx-search input,#cxq{height:38px!important}",
    "#cxFilterBtn,#cxSetBtn,#cxUploadBtn,#cxAcct{width:38px!important;height:38px!important;flex:0 0 auto}",
    "@media (max-width:760px){.cx-side{position:static;max-height:none}.cx-grid{grid-template-columns:repeat(2,1fr)!important;gap:10px!important}}"
  ].join("");
  var st = document.createElement("style");
  st.id = "cxTidyCss"; st.textContent = CSS;
  (document.head || document.documentElement).appendChild(st);

  function order() {
    var head = document.querySelector(".cx-head");
    if (!head) return;
    var title = head.querySelector("h1,h2,.cx-title");
    if (title && head.firstElementChild !== title) head.insertBefore(title, head.firstElementChild);
    var sort = head.querySelector(".cx-sortbox");
    if (sort && title && sort.previousElementSibling !== title) title.insertAdjacentElement("afterend", sort);
  }
  order();
  if (window.MutationObserver) {
    var main = document.querySelector(".cx-main") || document.body;
    new MutationObserver(function () { order(); }).observe(main, { childList: true, subtree: false });
  }
})();
