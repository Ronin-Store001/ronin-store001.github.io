/* ═══════════════════════════════════════════════════════════════
   RONIN STORE — VIP COUNTDOWN  ·  ronin-premium-vip.js
   • تایمر معکوس پرمیوم (روز / ساعت / دقیقه / ثانیه)
   • تایمر پیشنهاد ویژه
   • کارت خرید اشتراک از تلگرام
   روی premium-plus.js کار می‌کند و منطق پرمیوم را تغییر نمی‌دهد.
   ═══════════════════════════════════════════════════════════════ */
"use strict";
(function () {
  if (!window.R) return;
  var R = window.R;
  if (R.__premVip) return;
  R.__premVip = true;

  /* آیدی تلگرام برای خرید اشتراک — همین یک خط را عوض کن */
  var TG_USER = "RoninStore001";
  var TG_URL = "https://t.me/" + TG_USER;

  var OFFER_KEY = "ronin:vip:offerEnd";
  var DAY = 86400000;

  function el(id) { return document.getElementById(id); }
  function fa(n) { return R.fa ? R.fa(n) : String(n); }
  function num(x) { return Number(x) || 0; }
  function esc(s) {
    if (R.esc) return R.esc(s);
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function pad(n) { return String(n).length < 2 ? "0" + n : String(n); }
  function two(n) { return fa(pad(n)); }

  /* ── تایمر پیشنهاد (۱۲ ساعته، چرخشی و ماندگار) ────────────── */
  function offerEnd() {
    var end = 0;
    try { end = num(localStorage.getItem(OFFER_KEY)); } catch (e) {}
    if (!end || end < Date.now()) {
      end = Date.now() + 12 * 3600000;
      try { localStorage.setItem(OFFER_KEY, String(end)); } catch (e) {}
    }
    return end;
  }

  /* ── تایمر پرمیوم فعال ─────────────────────────────────────── */
  function premInfo() {
    var u = (R.ME && R.USER) ? R.USER : null;
    var pp = R.premPlus;
    if (!u || !pp) return { on: false };
    if (!pp.isActive(u)) return { on: false, expired: !!u.prem };
    if (pp.isPerm(u)) return { on: true, perm: true };
    var exp = pp.expOf(u), since = num(u.premSince) || 0;
    var left = Math.max(0, exp - Date.now());
    var pct = 100;
    if (exp && since && exp > since) pct = Math.max(2, Math.min(100, Math.round((Date.now() - since) * 100 / (exp - since))));
    return { on: true, perm: false, left: left, pct: pct, exp: exp };
  }

  function clockHTML(kind) {
    var p = kind === "active" ? "va" : "vo";
    return '<div class="vipClock" id="' + p + 'Clk">' +
      '<b id="' + p + 'D">۰<span>روز</span></b><i>:</i>' +
      '<b id="' + p + 'H">۰<span>ساعت</span></b><i>:</i>' +
      '<b id="' + p + 'M">۰<span>دقیقه</span></b><i>:</i>' +
      '<b id="' + p + 'S">۰<span>ثانیه</span></b></div>';
  }

  function setClock(prefix, ms) {
    var sec = Math.max(0, Math.floor(ms / 1000));
    var d = Math.floor(sec / 86400);
    var h = Math.floor((sec % 86400) / 3600);
    var m = Math.floor((sec % 3600) / 60);
    var s = sec % 60;
    var D = el(prefix + "D"), H = el(prefix + "H"), M = el(prefix + "M"), S = el(prefix + "S");
    function put(node, v, label) {
      if (!node) return;
      var t = null, i;
      for (i = 0; i < node.childNodes.length; i++) {
        if (node.childNodes[i].nodeType === 3) { t = node.childNodes[i]; break; }
      }
      if (t) t.nodeValue = v; else node.insertBefore(document.createTextNode(v), node.firstChild);
      if (!node.querySelector("span")) {
        var sp = document.createElement("span");
        sp.textContent = label;
        node.appendChild(sp);
      }
    }
    put(D, two(d), "روز");
    put(H, two(h), "ساعت");
    put(M, two(m), "دقیقه");
    put(S, two(s), "ثانیه");
  }

  /* ── ساخت بلوک ─────────────────────────────────────────────── */
  function html() {
    var info = premInfo();
    var h = "";

    if (info.on) {
      h += '<div class="vipActive">' +
        '<div class="vipActiveTx"><span>💎 پرمیوم فعال است</span>' +
        (info.perm ? '<span class="chip">دائمی</span>' : '<span class="chip">' + fa(Math.ceil(info.left / DAY)) + " روز مانده</span>") +
        "</div>";
      if (info.perm) {
        h += '<div class="vipActiveInf">∞<small>پرمیوم دائمی — بدون محدودیت زمان</small></div>';
      } else {
        h += clockHTML("active") +
          '<div class="vipBar"><i style="width:' + info.pct + '%"></i></div>';
      }
      h += "</div>";
    }

    h += '<div class="vipOffer">' +
      '<div class="vipOfferTx"><b>🔥 پیشنهاد ویژهٔ رونین</b>' +
      "<span>فرصت محدود برای ارتقا به الیت</span></div>" +
      clockHTML("offer") + "</div>";

    h += '<div class="vipBuy">' +
      '<div class="vipBuyTx"><b>💬 خرید اشتراک از تلگرام</b>' +
      "<span>پلن را انتخاب کن، در تلگرام پرداخت و فعال‌سازی انجام می‌شود.</span></div>" +
      '<a class="vipTg" href="' + esc(TG_URL) + '" target="_blank" rel="noopener">✈️ سفارش در تلگرام</a>' +
      '<button type="button" class="vipSite" id="vipSiteBtn">درخواست داخل سایت</button>' +
      "</div>";

    return h;
  }

  /* ── تزریق داخل بخش پرمیوم ─────────────────────────────────── */
  function mount() {
    var sec = el("sec-premium");
    if (!sec) return;
    var head = sec.querySelector(".head");
    if (!head) return;
    if (el("vipMnt")) return; /* از قبل هست */
    var box = document.createElement("div");
    box.id = "vipMnt";
    box.innerHTML = html();
    head.parentNode.insertBefore(box, head.nextSibling);
    bindOnce(box);
    tick();
  }

  function bindOnce(box) {
    if (box.__bound) return;
    box.__bound = true;
    box.addEventListener("click", function (e) {
      var t = e.target.closest ? e.target.closest("#vipSiteBtn") : null;
      if (!t) return;
      if (R.ME) {
        if (R.premPlus && R.premPlus.request) R.premPlus.request(R.premPlus.pick ? R.premPlus.pick() : 30);
        else if (R.premReq) R.premReq();
      } else if (R.needLogin) R.needLogin("پرمیوم");
      else if (R.mod) R.mod("loginMod", true);
    });
  }

  /* ── تیک هر ثانیه ──────────────────────────────────────────── */
  function tick() {
    if (!el("vipMnt")) return;
    setClock("vo", offerEnd() - Date.now());
    var info = premInfo();
    if (info.on && !info.perm) {
      setClock("va", info.left);
      var bar = document.querySelector("#vipMnt .vipBar>i");
      if (bar) bar.style.width = info.pct + "%";
    }
  }

  /* ── رصد رندر مجدد بخش پرمیوم ──────────────────────────────── */
  function watch() {
    var sec = el("sec-premium");
    if (!sec || sec.__vipWatch) return;
    sec.__vipWatch = true;
    var t = null;
    var obs = new MutationObserver(function () {
      if (t) clearTimeout(t);
      t = setTimeout(function () { try { mount(); } catch (e) {} }, 120);
    });
    obs.observe(sec, { childList: true });
  }

  function css() {
    if (el("vipCSS")) return;
    var l = document.createElement("link");
    l.id = "vipCSS";
    l.rel = "stylesheet";
    l.href = "ronin-premium-vip.css?v=1";
    (document.head || document.documentElement).appendChild(l);
  }

  function start() {
    css();
    mount();
    watch();
    setInterval(tick, 1000);
    setTimeout(mount, 1200);
    setTimeout(mount, 3000);
  }

  /* بعد از هر رندر/ورود هم دوباره بساز */
  if (typeof R.paintPrem === "function" && !R.paintPrem.__vip) {
    var p0 = R.paintPrem;
    var pw = function () {
      try { p0.apply(R, arguments); } catch (e) {}
      setTimeout(function () { try { mount(); tick(); } catch (e) {} }, 60);
    };
    pw.__vip = true;
    R.paintPrem = pw;
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
