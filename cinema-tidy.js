/* RONIN CINEMA TIDY v2 — cinema-tidy.js
   مرتب‌سازی و ظاهر صفحهٔ فیلم/سریال/انیمه. */
"use strict";
(function () {
  if (window.__cxTidy) return;
  window.__cxTidy = true;
  var CSS = [
    "#cxTabs{position:sticky;top:6px;z-index:120;display:flex;align-items:center;gap:6px;padding:5px;",
    "  margin:0 0 16px;border-radius:14px;overflow-x:auto;scrollbar-width:none;box-sizing:border-box;width:100%;",
    "  background:rgba(9,11,22,.82);border:1px solid rgba(140,160,255,.16);",
    "  backdrop-filter:blur(14px) saturate(140%);-webkit-backdrop-filter:blur(14px) saturate(140%);",
    "  box-shadow:0 18px 40px -30px rgba(0,0,0,.9)}",
    "#cxTabs::-webkit-scrollbar,.cx-tabs::-webkit-scrollbar{display:none}",
    ".cx-tabs{padding:5px;border-radius:14px;gap:6px;box-sizing:border-box;width:100%}",
    ".cx-tab{flex:0 0 auto;display:inline-flex;align-items:center;gap:6px;height:36px;padding:0 14px;",
    "  border-radius:10px;border:1px solid transparent;background:transparent;color:#aeb9d6;",
    "  font:inherit;font-size:11.5px;font-weight:800;cursor:pointer;transition:.16s;white-space:nowrap}",
    ".cx-tab:hover{color:#fff;background:rgba(255,255,255,.06)}",
    ".cx-tab.on,.cx-tab[aria-selected='true']{color:#07091a;background:linear-gradient(135deg,#8ef0ff,#7c5cff);",
    "  border-color:transparent;box-shadow:0 10px 24px -14px rgba(124,92,255,.95)}",
    ".cx-head{display:flex!important;align-items:center;gap:10px;flex-wrap:wrap;margin:0 0 14px!important;",
    "  padding:0!important;min-height:0!important}",
    ".cx-head>*{margin:0!important;flex:0 0 auto}",
    ".cx-head h1{order:0;font-size:22px!important;line-height:1.25!important}",
    ".cx-head .cx-count{order:1;font-size:10.5px!important;font-weight:800;color:#9fb0d8;padding:5px 10px;",
    "  border-radius:9px;background:rgba(124,92,255,.12);border:1px solid rgba(124,92,255,.22)}",
    ".cx-head .cx-sortbox{order:2;margin-inline-start:auto!important;display:flex;align-items:center;gap:6px;",
    "  height:34px;padding:0 10px;border-radius:11px;background:rgba(255,255,255,.05);",
    "  border:1px solid rgba(140,160,255,.18)}",
    ".cx-head .cx-sortbox select{background:transparent!important;border:0!important;height:auto!important;",
    "  font-size:11px!important;color:#dfe6ff!important;padding:0!important;border-radius:0!important}",
    ".cx-head>div:not(.cx-sortbox){order:3;display:flex;gap:6px;align-items:center;flex-wrap:wrap}",
    ".cx-head .cx-btn,.cx-head .cx-ico{height:34px!important;box-sizing:border-box;border-radius:11px!important;",
    "  font-size:11px!important;display:inline-flex;align-items:center;justify-content:center}",
    ".cx-grid{display:grid!important;grid-template-columns:repeat(auto-fill,minmax(172px,1fr))!important;",
    "  gap:16px!important;align-items:start}",
    ".cx-grid>*{min-width:0;border-radius:16px!important;overflow:hidden;transition:transform .18s,box-shadow .18s}",
    ".cx-grid>*:hover{transform:translateY(-3px);box-shadow:0 24px 44px -30px rgba(0,0,0,.85)}",
    ".cx-side{position:sticky;top:58px;align-self:start;max-height:calc(100vh - 76px);overflow:auto;",
    "  display:grid;gap:10px;scrollbar-width:thin;padding-inline-end:2px}",
    ".cx-side::-webkit-scrollbar{width:6px}",
    ".cx-side::-webkit-scrollbar-thumb{background:rgba(140,160,255,.28);border-radius:4px}",
    ".cx-side>*{border-radius:14px!important;margin:0!important}",
    ".cx-side .cx-btn,.cx-side button{height:28px!important;font-size:10px!important;padding:0 9px!important;",
    "  border-radius:8px!important;white-space:nowrap}",
    ".cx-search{background:rgba(255,255,255,.05);border:1px solid rgba(140,160,255,.18);border-radius:12px;padding:0 8px}",
    ".cx-search input,#cxq{height:36px!important;font-size:12px!important;background:transparent!important;border:0!important}",
    "#cxFilterBtn,#cxSetBtn,#cxUploadBtn,#cxAcct{width:36px!important;height:36px!important;flex:0 0 auto;border-radius:11px!important}",
    "@media (max-width:900px){.cx-side{position:static;max-height:none}}",
    "@media (max-width:760px){.cx-grid{grid-template-columns:repeat(2,1fr)!important;gap:10px!important}",
    "  .cx-head h1{font-size:18px!important}.cx-head .cx-sortbox{margin-inline-start:0!important}}"
  ].join("");
  var st = document.createElement("style");
  st.id = "cxTidyCss"; st.textContent = CSS;
  (document.head || document.documentElement).appendChild(st);

  function order() {
    var head = document.querySelector(".cx-head");
    if (!head) return;
    var title = head.querySelector("h1,h2,.cx-title");
    var count = head.querySelector(".cx-count");
    var sort = head.querySelector(".cx-sortbox");
    if (title && head.firstElementChild !== title) head.insertBefore(title, head.firstElementChild);
    if (count && title && count.previousElementSibling !== title) title.insertAdjacentElement("afterend", count);
    if (sort && count && sort.previousElementSibling !== count) count.insertAdjacentElement("afterend", sort);
  }
  order();
  document.addEventListener("click", function () { setTimeout(order, 120); }, true);
  if (window.MutationObserver) {
    var wrap = document.querySelector(".cx-wrap") || document.body;
    new MutationObserver(function () { order(); }).observe(wrap, { childList: true, subtree: false });
  }
})();
