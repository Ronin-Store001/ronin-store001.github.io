/* ═══════════════════════════════════════════════════════════════
   RONIN ELITE — premium-pro.js
   • چیدمان و ظاهر تازهٔ بخش پرمیوم (هیرو، پلن‌ها، مزایا، اعتماد)
   • تایمر معکوس درست: روز/ساعت/دقیقه/ثانیه با جعبه‌های جدا
   • قیمت‌های تازه (بالاتر) + همگام‌سازی با سفارش ذخیره‌شده در Firebase
   ═══════════════════════════════════════════════════════════════ */
"use strict";
(function () {
  if (window.__premPro) return;
  window.__premPro = true;

  /* ── قیمت‌های تازه ─────────────────────────────────────────── */
  var OLD = { 15: 49000, 30: 89000, 60: 159000, 90: 219000 };
  var NEW = { 15: 59000, 30: 109000, 60: 199000, 90: 279000 };

  var CSS = [
    "/* ── هیرو پرمیوم ── */",
    ".ppx-hero{position:relative;overflow:hidden;isolation:isolate;border-radius:24px;padding:22px 18px 20px;",
    "  margin-bottom:14px;border:1px solid rgba(255,203,82,.35);text-align:center;",
    "  background:linear-gradient(150deg,rgba(255,203,82,.18),rgba(255,120,60,.08) 45%,rgba(124,92,255,.14));",
    "  box-shadow:0 30px 70px -40px rgba(255,203,82,.9),inset 0 1px 0 rgba(255,255,255,.08)}",
    ".ppx-hero::before{content:'';position:absolute;inset:-30% -10% auto;height:180px;z-index:-1;",
    "  background:radial-gradient(60% 100% at 50% 0,rgba(255,203,82,.4),transparent 70%);filter:blur(18px)}",
    ".ppx-k{display:block;font-size:9px;font-weight:900;letter-spacing:3px;color:#ffd88a;direction:ltr}",
    ".ppx-hero h2{margin:6px 0 4px;font-size:clamp(22px,4vw,32px);font-weight:900;line-height:1.3;",
    "  background:linear-gradient(90deg,#fff,#ffe6ac 45%,#ffcb52);-webkit-background-clip:text;background-clip:text;color:transparent}",
    ".ppx-hero p{margin:0 auto;max-width:520px;font-size:11px;line-height:2;color:#e7dcc4}",
    ".ppx-chips{display:flex;gap:6px;flex-wrap:wrap;justify-content:center;margin-top:12px}",
    ".ppx-chip{font-size:9.5px;font-weight:800;padding:4px 10px;border-radius:99px;",
    "  border:1px solid rgba(255,203,82,.35);background:rgba(255,203,82,.12);color:#ffe6b8}",
    "/* ── پلن‌ها ── */",
    ".pp-plans{gap:11px}",
    ".pp-plan{border-radius:18px;padding:18px 10px 13px;background:linear-gradient(170deg,rgba(255,255,255,.06),rgba(255,255,255,.02));",
    "  border-color:rgba(255,203,82,.22);transition:transform .2s,box-shadow .2s,border-color .2s}",
    ".pp-plan:hover{transform:translateY(-4px);box-shadow:0 22px 40px -26px rgba(255,203,82,.9)}",
    ".pp-plan.on{border-color:rgba(255,203,82,.95);background:linear-gradient(170deg,rgba(255,203,82,.22),rgba(255,140,60,.12));",
    "  box-shadow:0 0 0 1px rgba(255,203,82,.5) inset,0 24px 50px -28px rgba(255,203,82,1)}",
    ".pp-d{font-size:26px;text-shadow:0 6px 24px rgba(255,203,82,.4)}",
    ".pp-pr{font-size:12px;font-weight:800}",
    ".ppx-day{font-size:9px;color:#ffd88a;opacity:.85;margin-top:3px}",
    ".pp-tag{top:-9px;box-shadow:0 8px 18px -8px rgba(255,203,82,.9)}",
    "/* ── تایمر درست ── */",
    "#ppTimer{display:none!important}",
    ".ppx-timer{display:flex;gap:6px;justify-content:center;margin:12px 0 6px;direction:ltr}",
    ".ppx-tbox{min-width:54px;padding:8px 6px;border-radius:13px;",
    "  border:1px solid rgba(255,203,82,.32);background:rgba(0,0,0,.28);backdrop-filter:blur(6px)}",
    ".ppx-tbox b{display:block;font-size:20px;font-weight:900;line-height:1.1;color:#ffcb52;font-variant-numeric:tabular-nums}",
    ".ppx-tbox span{display:block;font-size:8px;color:#c8b48a;margin-top:2px}",
    ".ppx-tsep{align-self:center;color:rgba(255,203,82,.5);font-weight:900;font-size:16px}",
    ".ppx-timer.done .ppx-tbox b{color:#ff8f8f}",
    "/* ── مزایا ── */",
    ".pp-perk{border-bottom:0;border:1px solid rgba(255,203,82,.16);border-radius:14px;",
    "  background:rgba(255,203,82,.05);padding:10px 12px;margin-bottom:8px;transition:.18s}",
    ".pp-perk:hover{border-color:rgba(255,203,82,.4);background:rgba(255,203,82,.09)}",
    ".pp-ico{background:rgba(255,203,82,.18);box-shadow:0 0 18px -8px rgba(255,203,82,.9)}",
    "/* ── اعتماد ── */",
    ".ppx-trust{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:12px}",
    ".ppx-trust div{border:1px solid rgba(140,160,255,.14);border-radius:14px;padding:9px 8px;text-align:center;",
    "  background:rgba(255,255,255,.03)}",
    ".ppx-trust b{display:block;font-size:11px;margin-bottom:2px}",
    ".ppx-trust span{font-size:8.5px;color:#9aa6cc;line-height:1.7}",
    "/* ── هیرو فعال ── */",
    ".pp-hero{border-radius:22px;background:linear-gradient(160deg,rgba(255,203,82,.14),rgba(255,255,255,.02));",
    "  border:1px solid rgba(255,203,82,.3)}",
    ".pp-big{font-size:46px;text-shadow:0 10px 40px rgba(255,203,82,.55)}",
    ".pp-bar{height:11px}",
    "@media (max-width:420px){.ppx-tbox{min-width:46px}.ppx-trust{grid-template-columns:1fr}}"
  ].join("");
  var st = document.createElement("style");
  st.id = "ppxCSS";
  st.textContent = CSS;
  (document.head || document.documentElement).appendChild(st);

  /* ── قیمت‌ها: نمایش + ثبت سفارش ─────────────────────────── */
  function fa(n) { return String(n).replace(/[0-9]/g, function (d) { return "۰۱۲۳۴۵۶۷۸۹"[d]; }); }
  function money(n) {
    return fa(String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ",")) + " تومان";
  }
  var PAIRS = Object.keys(OLD).map(function (d) {
    return { days: d, oldTxt: money(OLD[d]), newTxt: money(NEW[d]), oldNum: String(OLD[d]) };
  });

  var R = window.R;
  if (!R) return;
  if (R.add && !R.add.__ppx) {
    var origAdd = R.add;
    R.add = function (path, obj) {
      try {
        if (path === "premreq" && obj && obj.days && NEW[obj.days]) {
          obj.price = NEW[obj.days];
        }
      } catch (e) {}
      return origAdd.apply(R, arguments);
    };
    R.add.__ppx = true;
  }

  function rewriteText(root) {
    if (!root) return;
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    var node, hits = [];
    while ((node = walker.nextNode())) {
      var t = node.nodeValue;
      if (!t || t.indexOf("تومان") < 0) continue;
      for (var i = 0; i < PAIRS.length; i++) {
        if (t.indexOf(PAIRS[i].oldTxt) >= 0) { hits.push(node); break; }
      }
    }
    hits.forEach(function (n) {
      var v = n.nodeValue;
      PAIRS.forEach(function (p) { v = v.split(p.oldTxt).join(p.newTxt); });
      n.nodeValue = v;
    });
  }

  /* ── تایمر معکوس درست ───────────────────────────────────── */
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function parts(ms) {
    var s = Math.max(0, Math.floor(ms / 1000));
    var d = Math.floor(s / 86400); s -= d * 86400;
    var h = Math.floor(s / 3600); s -= h * 3600;
    var m = Math.floor(s / 60); s -= m * 60;
    return { d: d, h: h, m: m, s: s };
  }
  function timerHTML() {
    return '<div class="ppx-timer" id="ppxTimer">' +
      boxHTML("d", "روز") + '<span class="ppx-tsep">:</span>' +
      boxHTML("h", "ساعت") + '<span class="ppx-tsep">:</span>' +
      boxHTML("m", "دقیقه") + '<span class="ppx-tsep">:</span>' +
      boxHTML("s", "ثانیه") + "</div>";
  }
  function boxHTML(k, label) {
    return '<div class="ppx-tbox"><b data-ppx="' + k + '">۰</b><span>' + label + "</span></div>";
  }
  function mountTimer() {
    var native = document.getElementById("ppTimer");
    if (!native) return;
    var exp = Number(native.getAttribute("data-exp")) || 0;
    var wrap = document.getElementById("ppxTimer");
    if (!wrap) {
      var holder = document.createElement("div");
      holder.innerHTML = timerHTML();
      native.parentNode.insertBefore(holder.firstChild, native.nextSibling);
      wrap = document.getElementById("ppxTimer");
    }
    updateTimer(exp);
  }
  function updateTimer(exp) {
    var wrap = document.getElementById("ppxTimer");
    if (!wrap) return;
    if (!exp) {
      wrap.classList.add("done");
      wrap.innerHTML = '<div class="ppx-tbox"><b>∞</b><span>دائمی</span></div>';
      return;
    }
    var left = exp - Date.now();
    var p = parts(left);
    var set = function (k, v) {
      var el = wrap.querySelector('[data-ppx="' + k + '"]');
      if (el) el.textContent = fa(pad(v));
    };
    set("d", p.d); set("h", p.h); set("m", p.m); set("s", p.s);
    wrap.classList.toggle("done", left <= 0);
    /* نوار پیشرفت هم درست بماند */
    var bar = document.getElementById("ppBar");
    var since = Number(document.querySelector("#ppTimer") && document.querySelector("#ppTimer").getAttribute("data-since")) || 0;
    if (bar && since && exp > since) {
      var pct = Math.max(0, Math.min(100, Math.round((Date.now() - since) * 100 / (exp - since))));
      bar.style.width = pct + "%";
    }
    /* تایمر کوچک پروفایل */
    var mini = document.getElementById("ppProfTimer");
    if (mini) {
      var me = Number(mini.getAttribute("data-exp")) || 0;
      if (me) mini.textContent = (p.d ? fa(p.d) + " روز " : "") + fa(pad(p.h) + ":" + pad(p.m) + ":" + pad(p.s));
    }
  }

  /* ── تزئین بخش ──────────────────────────────────────────── */
  function heroHTML() {
    return '<div class="ppx-hero">' +
      '<span class="ppx-k">RONIN ELITE · 忍</span>' +
      "<h2>💎 عضویت الیت رونین</h2>" +
      "<p>یک بار ارتقا بده، همه‌جا حسش کن: برچسب و قاب ویژه، دسترسی زودتر به قابلیت‌های تازه، تبلیغ کمتر و پشتیبانی با اولویت.</p>" +
      '<div class="ppx-chips">' +
        "<span class=\"ppx-chip\">🎬 تماشای عنوان‌های ویژه</span>" +
        "<span class=\"ppx-chip\">🏷 برچسب اختصاصی</span>" +
        "<span class=\"ppx-chip\">🖼 قاب پروفایل</span>" +
        "<span class=\"ppx-chip\">⚡ دسترسی زودتر</span>" +
        "<span class=\"ppx-chip\">🚫 تبلیغ کمتر</span>" +
      "</div></div>";
  }
  function trustHTML() {
    return '<div class="ppx-trust">' +
      "<div><b>🛡 پرداخت مطمئن</b><span>تأیید دستی مالک روی هر سفارش</span></div>" +
      "<div><b>⚡ فعال‌سازی سریع</b><span>بعد از تأیید، لحظه‌ای فعال می‌شود</span></div>" +
      "<div><b>💬 پشتیبانی</b><span>پاسخ با اولویت برای اعضای الیت</span></div>" +
      "</div>";
  }

  function decorate() {
    var sec = document.getElementById("sec-premium");
    if (!sec) return;

    if (!sec.querySelector(".ppx-hero")) {
      var head = sec.querySelector(".head");
      var anchor = sec.querySelector("#ppBody") || head;
      if (anchor && anchor.parentNode) {
        var wrap = document.createElement("div");
        wrap.innerHTML = heroHTML();
        anchor.parentNode.insertBefore(wrap.firstChild, anchor);
      }
    }

    /* زیرنویس قیمت روزانه روی هر پلن */
    Array.prototype.forEach.call(sec.querySelectorAll(".pp-plan"), function (btn) {
      if (btn.querySelector(".ppx-day")) return;
      var d = Number(btn.getAttribute("data-pp-pay") || btn.getAttribute("data-pp-plan")) || 0;
      if (!d || !NEW[d]) return;
      var per = Math.round(NEW[d] / d / 1000) + " هزار تومان / روز";
      var span = document.createElement("span");
      span.className = "ppx-day";
      span.textContent = fa(per);
      btn.appendChild(span);
    });

    /* باکس اعتماد زیر مزایا */
    if (!sec.querySelector(".ppx-trust")) {
      var perks = sec.querySelector(".pp-perk");
      if (perks) {
        var host = perks.parentNode;
        var t = document.createElement("div");
        t.innerHTML = trustHTML();
        host.appendChild(t.firstChild);
      }
    }

    mountTimer();
    rewriteText(sec);
    Array.prototype.forEach.call(document.querySelectorAll(".modal.on, .sheet.on"), rewriteText);
  }

  setInterval(function () {
    var native = document.getElementById("ppTimer");
    if (native) updateTimer(Number(native.getAttribute("data-exp")) || 0);
    else {
      var mini = document.getElementById("ppProfTimer");
      if (mini) updateTimer(0); /* فقط برای همگام‌سازی تایمر کوچک */
    }
  }, 1000);

  function boot() {
    decorate();
    var sec = document.getElementById("sec-premium");
    if (!sec || !window.MutationObserver) { setTimeout(decorate, 1500); return; }
    var mo = new MutationObserver(function () { decorate(); });
    mo.observe(sec, { childList: true, subtree: true });
    setTimeout(decorate, 600);
    setTimeout(decorate, 1800);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
