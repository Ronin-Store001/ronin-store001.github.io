/* RONIN FILM EXTRAS — cinema-extras2.js
   لایهٔ سبک روی صفحهٔ فیلم/سریال/انیمه: نوار پیشرفت خواندن، دکمهٔ بازگشت به بالا
   و میان‌بر «/» برای جست‌وجو. چیدمان و انیمیشن‌های کارت‌ها را تغییر نمی‌دهد. */
"use strict";
(function () {
  if (window.__cxExtra2) return;
  window.__cxExtra2 = true;

  var CSS = [
    "#cxProg{position:fixed;top:0;left:0;right:0;height:3px;z-index:80;pointer-events:none;",
    "  background:transparent}",
    "#cxProg>i{display:block;height:100%;width:0;border-radius:0 3px 3px 0;",
    "  background:linear-gradient(90deg,#8ef0ff,#7c5cff 55%,#ff7ad9);",
    "  box-shadow:0 0 14px rgba(124,92,255,.9);transition:width .12s linear}",
    "#cxTop{position:fixed;inset-inline-end:16px;bottom:18px;z-index:79;width:44px;height:44px;",
    "  display:grid;place-items:center;border-radius:15px;cursor:pointer;font:inherit;font-size:17px;",
    "  color:#eaf4ff;border:1px solid rgba(140,160,255,.32);background:rgba(12,15,36,.82);",
    "  backdrop-filter:blur(10px);opacity:0;transform:translateY(10px);pointer-events:none;transition:.22s}",
    "#cxTop.on{opacity:1;transform:none;pointer-events:auto}",
    "#cxTop:hover{border-color:rgba(124,92,255,.7);background:rgba(124,92,255,.22)}",
    ".cx-kbd{position:fixed;inset-inline-start:14px;bottom:18px;z-index:79;font-size:9.5px;",
    "  color:#93a0c8;background:rgba(12,15,36,.7);border:1px solid rgba(140,160,255,.2);",
    "  padding:5px 9px;border-radius:9px;opacity:0;transition:.2s;pointer-events:none}",
    ".cx-kbd.on{opacity:1}",
    ".cx-kbd b{color:#9fe9ff;direction:ltr;display:inline-block}"
  ].join("");
  var st = document.createElement("style");
  st.id = "cxX2Css";
  st.textContent = CSS;
  (document.head || document.documentElement).appendChild(st);

  var prog = document.createElement("div");
  prog.id = "cxProg";
  prog.innerHTML = "<i></i>";
  document.body.appendChild(prog);
  var bar = prog.firstChild;

  var top = document.createElement("button");
  top.id = "cxTop";
  top.type = "button";
  top.title = "بازگشت به بالا";
  top.setAttribute("aria-label", "بازگشت به بالا");
  top.textContent = "↑";
  document.body.appendChild(top);

  var kbd = document.createElement("div");
  kbd.className = "cx-kbd";
  kbd.innerHTML = "برای جست‌وجو <b>/</b>";
  document.body.appendChild(kbd);

  function onScroll() {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    var p = h > 0 ? Math.min(100, Math.max(0, (window.scrollY / h) * 100)) : 0;
    bar.style.width = p.toFixed(1) + "%";
    top.classList.toggle("on", window.scrollY > 600);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  top.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /* میان‌بر جست‌وجو */
  document.addEventListener("keydown", function (e) {
    if (e.key !== "/" || e.ctrlKey || e.metaKey || e.altKey) return;
    var a = document.activeElement;
    if (a && (a.tagName === "INPUT" || a.tagName === "TEXTAREA" || a.isContentEditable)) return;
    var q = document.getElementById("cxq");
    if (!q) return;
    e.preventDefault();
    q.focus();
    q.select();
  });

  /* راهنما یک‌بار دیده می‌شود */
  try {
    if (!localStorage.getItem("cx_kbd_seen")) {
      kbd.classList.add("on");
      setTimeout(function () { kbd.classList.remove("on"); }, 5000);
      localStorage.setItem("cx_kbd_seen", "1");
    }
  } catch (e) {}
})();
