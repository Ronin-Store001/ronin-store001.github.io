/* RONIN ELITE CORE — premium-core.js
   یک مالک برای قیمت‌ها و تایمر پرمیوم:
   • قیمت‌های بالاتر + قابل ویرایش از پنل مالک (site/prices)
   • تایمر معکوس تک‌مالک (بدون درگیری با لایهٔ حذف‌شدهٔ premium-pro)
   • ظاهر شیشه‌ای/طلایی برای پلن‌ها و شمارش معکوس
   فقط با API عمومی R.premPlus کار می‌کند و فایل‌های دیگر را بازنویسی نمی‌کند. */
"use strict";
(function () {
  if (window.__premCore) return;
  window.__premCore = true;

  var DEF = { 15: 69000, 30: 129000, 60: 229000, 90: 329000 };
  var TAGS = { 15: "", 30: "محبوب", 60: "بهترین ارزش", 90: "حرفه‌ای" };
  var KEYS = [15, 30, 60, 90];

  var CSS = [
    "/* شمارش معکوس — تک مالک */",
    "#ppTimer{display:inline-flex!important;align-items:center;justify-content:center;gap:6px;",
    "  margin-top:10px;padding:9px 14px;border-radius:14px;direction:ltr;",
    "  font-size:19px!important;font-weight:900;letter-spacing:.5px;font-variant-numeric:tabular-nums;",
    "  color:#ffe6ac!important;border:1px solid rgba(255,203,82,.42);",
    "  background:linear-gradient(160deg,rgba(255,203,82,.16),rgba(0,0,0,.32));",
    "  box-shadow:0 14px 34px -22px rgba(255,203,82,.95),inset 0 1px 0 rgba(255,255,255,.08)}",
    "#ppTimer:empty{display:none!important}",
    ".pp-hero{position:relative;overflow:hidden;isolation:isolate}",
    ".pp-hero::before{content:'';position:absolute;inset:-40% -12% auto;height:200px;z-index:-1;",
    "  background:radial-gradient(60% 100% at 50% 0,rgba(255,203,82,.28),transparent 70%);filter:blur(20px)}",
    ".pp-big{font-size:52px!important;line-height:1!important;",
    "  background:linear-gradient(90deg,#fff,#ffe6ac 45%,#ffcb52);-webkit-background-clip:text;background-clip:text;color:transparent}",
    ".pp-bar>i{background:linear-gradient(90deg,#ffcb52,#ff9d3d,#ff7a59)!important}",
    "/* پلن‌ها */",
    ".pp-plan{border-radius:17px!important;transition:transform .2s,box-shadow .2s,border-color .2s!important}",
    ".pp-plan.on{box-shadow:0 0 0 1px rgba(255,203,82,.55) inset,0 26px 48px -30px rgba(255,203,82,1)!important}",
    ".pc-day{display:block;font-size:8.5px;margin-top:2px;color:#ffd88a;opacity:.85}",
    "/* کارت قیمت در پنل مالک */",
    "#premPriceBox{margin:0 0 14px}",
    ".pcw{border-radius:20px;border:1px solid rgba(255,203,82,.28);overflow:hidden;",
    "  background:linear-gradient(150deg,rgba(38,28,10,.92),rgba(14,12,26,.94));",
    "  box-shadow:0 26px 60px -42px rgba(255,203,82,.9)}",
    ".pcw-h{display:flex;align-items:center;gap:8px;padding:11px 14px;border-bottom:1px solid rgba(255,203,82,.18);flex-wrap:wrap}",
    ".pcw-h b{font-size:12px;font-weight:900;color:#ffe6ac}",
    ".pcw-h .sp{margin-inline-start:auto;display:flex;gap:6px}",
    ".pcw-b{padding:12px 14px}",
    ".pcg{display:grid;grid-template-columns:repeat(auto-fit,minmax(126px,1fr));gap:8px}",
    ".pcf{border:1px solid rgba(255,203,82,.2);border-radius:12px;padding:8px 9px;background:rgba(255,255,255,.03)}",
    ".pcf span{display:block;font-size:9px;color:#c8b48a;margin-bottom:4px}",
    ".pcf input{width:100%;box-sizing:border-box;font:inherit;font-size:12px;font-weight:800;",
    "  color:#ffe6ac;background:rgba(0,0,0,.35);border:1px solid rgba(255,203,82,.28);",
    "  border-radius:9px;padding:6px 8px;text-align:center;direction:ltr}",
    ".pcf input:focus{outline:0;border-color:rgba(255,203,82,.8);box-shadow:0 0 0 3px rgba(255,203,82,.14)}",
    ".pcb{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}",
    ".pcb button{font:inherit;font-size:10px;font-weight:900;padding:7px 12px;border-radius:10px;cursor:pointer;",
    "  border:1px solid rgba(255,203,82,.35);background:rgba(255,203,82,.12);color:#ffe6ac;transition:.16s}",
    ".pcb button:hover{background:rgba(255,203,82,.22)}",
    ".pcb button.main{color:#1b1405;border-color:transparent;background:linear-gradient(135deg,#ffd77a,#ff9d3d)}",
    ".pchint{font-size:9.5px;color:#b9a888;margin-top:8px;line-height:1.9}"
  ].join("");
  var st = document.createElement("style");
  st.id = "pcCss";
  st.textContent = CSS;
  (document.head || document.documentElement).appendChild(st);

  function fa(n) { return String(n).replace(/[0-9]/g, function (d) { return "۰۱۲۳۴۵۶۷۸۹"[d]; }); }
  function grp(n) { return fa(String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ",")); }
  function plans() {
    try { return (window.R && R.premPlus && R.premPlus.plans) || null; } catch (e) { return null; }
  }
  function apply(map) {
    var ps = plans();
    if (!ps) return false;
    ps.forEach(function (p) {
      var v = Number(map[p.d]);
      if (v && v > 0) p.price = v;
      if (p.d in TAGS) p.tag = TAGS[p.d];
    });
    return true;
  }
  function rerender() {
    try { if (window.R && R.premPlus && R.premPlus.render) R.premPlus.render(); } catch (e) {}
  }

  /* ── روز‌شمار روی هر پلن ───────────────────────────────── */
  function caption() {
    var sec = document.getElementById("sec-premium");
    if (!sec) return;
    var ps = plans() || [];
    Array.prototype.forEach.call(sec.querySelectorAll(".pp-plan"), function (b) {
      if (b.querySelector(".pc-day")) return;
      var d = Number(b.getAttribute("data-pp-plan")) || 0;
      var p = null;
      for (var i = 0; i < ps.length; i++) if (ps[i].d === d) p = ps[i];
      if (!p || !d) return;
      var s = document.createElement("span");
      s.className = "pc-day";
      s.textContent = grp(Math.round(p.price / d / 1000)) + " هزار تومان / روز";
      b.appendChild(s);
    });
  }

  /* ── کارت ویرایش قیمت برای مالک ─────────────────────────── */
  function ownerCard() {
    var sec = document.getElementById("sec-owner");
    if (!sec || !window.R || !R.isOwner || !R.isOwner()) return;
    if (document.getElementById("premPriceBox")) return;
    var ps = plans() || [];
    function val(d) {
      for (var i = 0; i < ps.length; i++) if (ps[i].d === d) return ps[i].price;
      return DEF[d];
    }
    var box = document.createElement("div");
    box.id = "premPriceBox";
    box.innerHTML = '<div class="pcw">' +
      '<div class="pcw-h"><b>💎 قیمت پرمیوم</b><span class="sp">' +
        '<button class="ost" type="button" id="pcReset">بازگشت به پیش‌فرض</button>' +
      '</span></div>' +
      '<div class="pcw-b"><div class="pcg">' +
        KEYS.map(function (d) {
          return '<label class="pcf"><span>' + fa(d) + ' روزه (تومان)</span>' +
            '<input type="number" min="1000" step="1000" inputmode="numeric" data-pcd="' + d +
            '" value="' + val(d) + '"></label>';
        }).join("") +
      '</div><div class="pcb">' +
        '<button class="main" type="button" id="pcSave">ذخیره و اعمال فوری</button>' +
      '</div><div class="pchint">قیمت‌ها روی صفحهٔ پرمیوم، درخواست خرید و پیام پرداخت تلگرام اعمال می‌شوند. ' +
        'حداقل ۱۰۰۰ تومان و مضرب ۱۰۰۰ پیشنهاد می‌شود.</div></div></div>';
    var anchor = document.getElementById("ownerBody") || sec.querySelector(":scope > .tabs");
    if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(box, anchor);
    else sec.appendChild(box);

    box.addEventListener("click", function (e) {
      if (e.target.closest("#pcSave")) save(false);
      else if (e.target.closest("#pcReset")) save(true);
    });
  }

  function save(reset) {
    var box = document.getElementById("premPriceBox");
    if (!box) return;
    var out = {};
    KEYS.forEach(function (d) {
      var inp = box.querySelector('[data-pcd="' + d + '"]');
      var v = reset ? DEF[d] : Math.round(Number(inp && inp.value) || 0);
      if (!v || v < 1000) v = DEF[d];
      out[d] = v;
      if (inp) inp.value = v;
    });
    if (!window.R || !R.set) return;
    R.set("site/prices", out).then(function () {
      apply(out);
      rerender();
      if (R.toast) R.toast(reset ? "قیمت‌ها به پیش‌فرض برگشت" : "قیمت‌های تازه اعمال شد 💎", "ok");
    }).catch(function (e) {
      apply(out);
      rerender();
      if (R.toast) R.toast("ذخیره نشد (" + ((e && e.message) || "") + ") — فقط روی همین دستگاه اعمال شد", "err");
    });
  }

  /* ── راه‌اندازی ─────────────────────────────────────────── */
  function loadPrices() {
    if (!window.R || !R.get) return;
    R.get("site/prices").then(function (v) {
      if (!v) return;
      if (apply(v)) { rerender(); }
    }).catch(function () {});
  }

  var applied = false;
  function boot() {
    if (!window.R) { setTimeout(boot, 400); return; }
    if (!applied) { applied = apply(DEF); if (applied) { rerender(); loadPrices(); } }
    caption();
    ownerCard();
  }

  /* بعد از هر رندر بخش پرمیوم، زیرنویس روزشمار را برگردان */
  var t = null;
  function watch() {
    var sec = document.getElementById("sec-premium");
    if (!sec || !window.MutationObserver) return;
    new MutationObserver(function () { clearTimeout(t); t = setTimeout(caption, 90); })
      .observe(sec, { childList: true, subtree: true });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  setInterval(boot, 1200);
  setTimeout(watch, 900);

  window.__premCoreAPI = {
    defaults: DEF, apply: apply, load: loadPrices, save: save, rerender: rerender
  };
})();
