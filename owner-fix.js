/* RONIN OWNER FIX — owner-fix.js
   زیرنویس «هزار تومان / روز» را با واحد پول انتخاب‌شده هم‌تراز می‌کند. */
"use strict";
(function () {
  if (window.__owFix) return;
  window.__owFix = true;
  function tick() {
    var api = window.__owPrefsAPI;
    if (!api || !window.R) return;
    var P = api.prefs, label = (api.units[P.cur] || { l: "تومان" }).l;
    var plans = (R.premPlus && R.premPlus.plans) || [];
    Array.prototype.forEach.call(document.querySelectorAll("#sec-premium .pp-plan"), function (b) {
      var d = Number(b.getAttribute("data-pp-plan")) || 0, cap = b.querySelector(".pc-day"), p = null;
      if (!cap || !d) return;
      for (var i = 0; i < plans.length; i++) if (plans[i].d === d) p = plans[i];
      if (!p || !p.price) return;
      var day = p.price / d, txt;
      if (P.cur === "toman") txt = Math.round(day / 1000) + " هزار تومان / روز";
      else if (day >= 1) txt = Math.round(day) + " " + label + " / روز";
      else txt = (Math.round(day * 100) / 100) + " " + label + " / روز";
      if (cap.textContent !== txt) cap.textContent = txt;
    });
  }
  setInterval(tick, 1200);
  setTimeout(tick, 700);
})();
