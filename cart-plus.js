/* ═══ RONIN CART v1 — سبد خرید برای فروشگاه ═══
   فایل افزودنی: به 5-market.js و 6-owner.js دست نمی‌زند.
   - دکمهٔ 🛒 با شمارنده در هدر و روی هر کارت محصول
   - سبد: چند کالا، تعداد +/−، حذف، جمع کل
   - ثبت سفارش: برای هر فروشنده یک سفارش جدا در orders (همان ساختاری که پنل مالک می‌خواند)
   سبد در همین مرورگر (localStorage) نگه داشته می‌شود.
*/
"use strict";
(function () {
  if (!window.R || R.__cart) return;
  R.__cart = true;

  var KEY = "ronin-cart-v1";
  var CART = {};      /* { pid: qty } */

  function el(id) { return document.getElementById(id); }
  function esc(s) { return R.esc ? R.esc(s) : String(s == null ? "" : s); }
  function fa(n) { return R.fa ? R.fa(n) : String(n); }

  /* ── ۱. عدد (فارسی/عربی/جداکننده) ───────────────────────── */
  function toNum(v) {
    var fa9 = "۰۱۲۳۴۵۶۷۸۹", ar9 = "٠١٢٣٤٥٦٧٨٩";
    var s = String(v == null ? "" : v);
    s = s.replace(/[۰-۹]/g, function (d) { return String(fa9.indexOf(d)); });
    s = s.replace(/[٠-٩]/g, function (d) { return String(ar9.indexOf(d)); });
    s = s.replace(/[^\d]/g, "");
    return parseInt(s, 10) || 0;
  }

  /* ── ۲. ذخیره و بازیابی ─────────────────────────────────── */
  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      var o = raw ? JSON.parse(raw) : {};
      CART = {};
      Object.keys(o || {}).forEach(function (k) {
        var q = parseInt(o[k], 10);
        if (k && q > 0) CART[k] = Math.min(q, 99);
      });
    } catch (e) { CART = {}; }
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(CART)); } catch (e) {}
  }

  /* ── ۳. محاسبات ─────────────────────────────────────────── */
  function prod(id) { return (R.PRODS || {})[id] || null; }
  function lines() {
    var out = [];
    Object.keys(CART).forEach(function (id) {
      var p = prod(id);
      if (!p) return;                      /* آگهی حذف شده */
      var q = CART[id], unit = toNum(p.price);
      out.push({
        id: id, name: p.name || "کالا", icon: p.icon || "🎁",
        cur: p.cur || "تومان", unit: unit, qty: q, sum: unit * q,
        sellerUid: p.sellerUid || "", sellerName: p.sellerName || p.company || "فروشنده"
      });
    });
    return out;
  }
  function totalQty() { var n = 0; Object.keys(CART).forEach(function (k) { n += CART[k]; }); return n; }
  function totalSum() { var s = 0; lines().forEach(function (l) { s += l.sum; }); return s; }

  /* ── ۴. استایل ──────────────────────────────────────────── */
  function css() {
    if (el("cartCss")) return;
    var s = document.createElement("style");
    s.id = "cartCss";
    s.textContent =
      "#cartBtn{position:relative}" +
      "#cartBtn .cbadge{position:absolute;top:-3px;inset-inline-end:-3px;min-width:15px;height:15px;" +
        "border-radius:8px;font-size:9px;font-weight:800;color:#04060f;display:grid;place-items:center;" +
        "background:linear-gradient(135deg,#2fe6ff,#8b5cff)}" +
      "#cartBtn .cbadge.hide{display:none}" +
      ".crow{display:flex;align-items:center;gap:9px;padding:9px 0;border-top:1px solid rgba(150,120,255,.14)}" +
      ".crow:first-child{border-top:0}" +
      ".crow .cico{font-size:22px}" +
      ".crow .ctx{flex:1 1 auto;min-width:0}" +
      ".crow .cq{display:flex;align-items:center;gap:5px}" +
      ".crow .cq button{width:24px;height:24px;border-radius:8px;border:1px solid var(--ln2);" +
        "background:rgba(255,255,255,.05);color:#fff;font:inherit;font-size:14px;cursor:pointer}" +
      ".crow .cq b{min-width:20px;text-align:center;font-size:12.5px}" +
      ".ctotal{display:flex;justify-content:space-between;align-items:center;padding:11px 0;" +
        "border-top:1px dashed rgba(150,120,255,.3);margin-top:4px}" +
      ".ctotal b{font-size:16px;color:#2fe6ff}";
    document.head.appendChild(s);
  }

  /* ── ۵. دکمهٔ سبد در هدر ────────────────────────────────── */
  function ensureBtn() {
    if (el("cartBtn")) return;
    var tools = document.querySelector("#top .tools");
    if (!tools) return;
    var b = document.createElement("button");
    b.className = "icobtn";
    b.id = "cartBtn";
    b.type = "button";
    b.title = "سبد خرید";
    b.innerHTML = "🛒<span class=\"cbadge hide\" id=\"cartBadge\">0</span>";
    b.addEventListener("click", function () { openCart(); });
    var first = tools.firstChild;
    if (first) tools.insertBefore(b, first);
    else tools.appendChild(b);
    paintBadge();
  }

  function paintBadge() {
    var n = totalQty();
    var b = el("cartBadge");
    if (!b) return;
    b.textContent = n > 99 ? "99+" : fa(n);
    b.classList.toggle("hide", n <= 0);
  }

  /* ── ۶. افزودن/کم‌کردن ─────────────────────────────────── */
  function add(id, qty) {
    var p = prod(id);
    if (!p) return R.toast("این کالا پیدا نشد", "err");
    if (p.sellerUid && p.sellerUid === R.ME) return R.toast("این آگهی خودت است 🙂", "err");
    if (p.sold || p.st === "sold") return R.toast("این کالا فروخته شده", "err");
    CART[id] = Math.min(99, (CART[id] || 0) + (parseInt(qty, 10) || 1));
    save();
    paintBadge();
    R.toast("به سبد اضافه شد 🛒", "ok");
    if (el("cartMod") && el("cartMod").classList.contains("on")) render();
  }

  function setQty(id, q) {
    q = parseInt(q, 10) || 0;
    if (q <= 0) delete CART[id];
    else CART[id] = Math.min(99, q);
    save();
    paintBadge();
    render();
  }

  function remove(id) {
    delete CART[id];
    save();
    paintBadge();
    render();
  }

  /* ── ۷. ساخت مودال ──────────────────────────────────────── */
  function modal() {
    if (el("cartMod")) return;
    var w = document.createElement("div");
    w.className = "modal";
    w.id = "cartMod";
    w.innerHTML =
      '<div class="box">' +
        '<div class="between mb"><h3 class="h2">🛒 سبد خرید</h3>' +
          '<button class="icobtn" type="button" data-cartx="1">✕</button></div>' +
        '<div id="cartRows"></div>' +
        '<div id="cartFoot"></div>' +
      '</div>';
    document.body.appendChild(w);

    w.addEventListener("click", function (e) {
      if (e.target === w) return R.mod("cartMod", false);
      if (e.target.closest && e.target.closest("[data-cartx]")) return R.mod("cartMod", false);
    });
  }

  function render() {
    var rows = el("cartRows"), foot = el("cartFoot");
    if (!rows || !foot) return;
    var L = lines();

    if (!L.length) {
      rows.innerHTML = '<div class="empty">سبد خرید خالی است 🛒<br>' +
        '<span class="xs mut">از فروشگاه روی 🛒 هر کالا بزن.</span></div>';
      foot.innerHTML = "";
      return;
    }

    rows.innerHTML = L.map(function (l) {
      return '<div class="crow">' +
        '<div class="cico">' + esc(l.icon) + "</div>" +
        '<div class="ctx"><div class="sm b ellip">' + esc(l.name) + "</div>" +
          '<div class="xs mut">' + esc(R.money ? R.money(l.unit) : l.unit) + " " + esc(l.cur) +
          " × " + esc(fa(l.qty)) + "</div>" +
          '<div class="xs cy">' + esc(R.money ? R.money(l.sum) : l.sum) + " " + esc(l.cur) + "</div></div>" +
        '<div class="cq">' +
          '<button type="button" data-cq="' + esc(l.id) + ':-1">−</button>' +
          "<b>" + esc(fa(l.qty)) + "</b>" +
          '<button type="button" data-cq="' + esc(l.id) + ':1">+</button>' +
        "</div>" +
        '<button class="icobtn" type="button" data-cdel="' + esc(l.id) + '" title="حذف">🗑</button>' +
        "</div>";
    }).join("");

    var total = totalSum();
    var cur = L[0] ? L[0].cur : "تومان";
    foot.innerHTML =
      '<div class="ctotal"><span class="sm">جمع کل (' + esc(fa(L.length)) + " کالا)</span>" +
        "<b>" + esc(R.money ? R.money(total) : total) + " " + esc(cur) + "</b></div>" +
      '<div class="field"><label class="lbl">نام تو</label>' +
        '<input class="inp" id="cName" maxlength="30" value="' +
        esc((R.USER && R.USER.name) || "") + '"></div>' +
      '<div class="field"><label class="lbl">راه ارتباطی</label>' +
        '<input class="inp" id="cContact" maxlength="60" placeholder="ایمیل / تلگرام / شماره"></div>' +
      '<div class="field"><label class="lbl">توضیح سفارش (اختیاری)</label>' +
        '<textarea class="area" id="cNote" maxlength="300" placeholder="آدرس، رنگ، سایز…"></textarea></div>' +
      '<div class="xs mt" id="cMsg"></div>' +
      '<button class="btn p blk mt" type="button" id="cCheckout">📩 ثبت سفارش</button>' +
      '<div class="xs mut center" style="margin-top:6px">برای هر فروشنده یک سفارش جدا ثبت می‌شود — پرداخت و ارسال با فروشنده است.</div>';
  }

  function openCart() {
    modal();
    render();
    R.mod("cartMod", true);
  }

  /* ── ۸. ثبت سفارش ──────────────────────────────────────── */
  function cmsg(t, bad) {
    var e = el("cMsg");
    if (!e) return;
    e.textContent = t || "";
    e.className = "xs mt " + (bad ? "bad" : "ok");
  }

  function checkout() {
    if (!R.ME) { R.closeMod("cartMod"); return R.needLogin("ثبت سفارش"); }
    var L = lines();
    if (!L.length) return cmsg("سبد خالی است", 1);

    var v = function (id) { var e = el(id); return e ? e.value : ""; };
    var nm = R.clean ? R.clean(v("cName"), 30) : String(v("cName")).slice(0, 30);
    var ct = R.clean ? R.clean(v("cContact"), 60) : String(v("cContact")).slice(0, 60);
    var note = R.clean ? R.clean(v("cNote"), 300) : String(v("cNote")).slice(0, 300);
    if (!nm) return cmsg("نامت را بنویس", 1);
    if (!ct) return cmsg("راه ارتباطی را بنویس", 1);

    /* گروه‌بندی بر اساس فروشنده */
    var bySeller = {};
    L.forEach(function (l) {
      var k = l.sellerUid || "?";
      (bySeller[k] = bySeller[k] || []).push(l);
    });

    var keys = Object.keys(bySeller);
    cmsg("در حال ثبت…");
    var btn = el("cCheckout");
    if (btn) btn.disabled = true;

    var jobs = keys.map(function (k) {
      var items = bySeller[k];
      var sum = 0, qty = 0;
      items.forEach(function (i) { sum += i.sum; qty += i.qty; });
      var linesTxt = items.map(function (i) {
        return i.name + " × " + i.qty + " = " + (R.money ? R.money(i.sum) : i.sum) + " " + i.cur;
      }).join(" | ");
      var first = items[0];
      var pname = items.length > 1 ? first.name + " و " + (items.length - 1) + " کالای دیگر" : first.name;
      var msg = note ? note + " | " + linesTxt : linesTxt;

      return R.add("orders", {
        pid: items.map(function (i) { return i.id; }).join(","),
        pname: pname, price: String(sum), cur: first.cur,
        sellerUid: k === "?" ? "" : k, buyerUid: R.ME, buyerName: nm,
        contact: ct, qty: String(qty), msg: msg, st: "new", cart: 1
      }).then(function () {
        if (k !== "?" && R.notify) {
          R.notify(k, "🛒 سفارش جدید برای «" + pname + "»", "order", "store");
        }
      });
    });

    Promise.all(jobs).then(function () {
      if (R.notify) R.notify(R.OWNER_UID, "🛒 سفارش جدید: " + fa(keys.length) + " فروشنده", "order", "owner");
      CART = {};
      save();
      paintBadge();
      render();
      R.closeMod("cartMod");
      R.toast("سفارش ثبت شد ✅ فروشنده‌ها جواب می‌دهند", "ok");
      if (R.xp) R.xp(6);
    }).catch(function (e) {
      if (btn) btn.disabled = false;
      cmsg("ثبت نشد: " + ((e && e.message) || "خطا"), 1);
    });
  }

  /* ── ۹. دکمه روی کارت و مودال محصول ─────────────────────── */
  function wrapProdCard() {
    if (!R.prodCard || R.prodCard.__cartWrapped) return;
    var orig = R.prodCard;
    var wrapped = function (p) {
      var h = orig.apply(R, arguments);
      try {
        if (typeof h === "string" && p && p.id) {
          h = h.replace("مشاهده</button>",
            'مشاهده</button><button class="btn mini" type="button" data-cartadd="' +
            esc(p.id) + '" title="افزودن به سبد">🛒</button>');
        }
      } catch (e) {}
      return h;
    };
    wrapped.__cartWrapped = true;
    R.prodCard = wrapped;
  }

  function injectProdBtn() {
    var body = el("prodBody");
    if (!body || body.querySelector("[data-cartadd]")) return;
    var p = R.curProd;
    if (!p || !p.id) return;
    var b = document.createElement("button");
    b.className = "btn p blk mt";
    b.type = "button";
    b.setAttribute("data-cartadd", p.id);
    b.textContent = "🛒 افزودن به سبد خرید";
    var price = body.querySelector(".price");
    if (price && price.parentNode) price.parentNode.insertBefore(b, price.nextSibling);
    else body.appendChild(b);
  }

  function wrapOpenProd() {
    if (!R.openProd || R.openProd.__cartWrapped) return;
    var orig = R.openProd;
    var wrapped = function (id) {
      var out = orig.apply(R, arguments);
      try { setTimeout(injectProdBtn, 40); } catch (e) {}
      return out;
    };
    wrapped.__cartWrapped = true;
    R.openProd = wrapped;
  }

  /* ── ۱۰. رویدادها ──────────────────────────────────────── */
  function bind() {
    document.addEventListener("click", function (e) {
      var t = e.target.closest ? e.target.closest("[data-cartadd]") : null;
      if (t) {
        e.preventDefault();
        add(t.getAttribute("data-cartadd"), 1);
        return;
      }
      var q = e.target.closest ? e.target.closest("[data-cq]") : null;
      if (q) {
        e.preventDefault();
        var parts = String(q.getAttribute("data-cq")).split(":");
        var cur = CART[parts[0]] || 0;
        setQty(parts[0], cur + (parseInt(parts[1], 10) || 0));
        return;
      }
      var d = e.target.closest ? e.target.closest("[data-cdel]") : null;
      if (d) { e.preventDefault(); remove(d.getAttribute("data-cdel")); return; }
      if (e.target.id === "cCheckout") { e.preventDefault(); checkout(); }
    });
  }

  /* ── ۱۱. راه‌اندازی ────────────────────────────────────── */
  function boot() {
    css();
    ensureBtn();
    modal();
    wrapProdCard();
    wrapOpenProd();
    paintBadge();
    if (R.PRODS) { try { if (R.renderShop) R.renderShop(); } catch (e) {} }
  }

  R.cart = {
    add: add, set: setQty, remove: remove, open: openCart,
    count: totalQty, total: totalSum, lines: lines,
    clear: function () { CART = {}; save(); paintBadge(); render(); }
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  setTimeout(boot, 2000);

  load();
  bind();
})();
