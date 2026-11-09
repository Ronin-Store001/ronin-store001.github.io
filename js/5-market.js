/* ═══════════════════════════════════════════════════════════════
   RONIN STORE — V19 «NEO RAIN CITY»                js/5-market.js
   فروشگاه • ثبت آگهی • صفحه محصول • سفارش • مرکز فروشنده
   ═══════════════════════════════════════════════════════════════ */
"use strict";
(function () {

R.PRODS = {};          /* همه محصولات/آگهی‌ها */
R.curProd = null;      /* محصول باز */
R.CATS = ["انیمه", "فیگور و کلکسیونی", "گیم", "پوشاک", "الکترونیک",
          "کتاب و مانگا", "پوستر و آرت", "خدمات", "متفرقه"];

/* ── ۱. کمک‌ها ────────────────────────────────────────────── */
R.money = function (n) {
  var v = Number(n) || 0;
  try { return R.fa(v.toLocaleString("en-US")); } catch (e) { return R.fa(v); }
};
R.isLive = function (p) { return !p.st || p.st === "live"; };

/* ── ۲. خواندن و رسم ─────────────────────────────────────── */
R.watchShop = function () {
  if (!R.db) return;
  R.db.ref("products").orderByChild("t").limitToLast(200)
    .on("value", function (s) { R.PRODS = s.val() || {}; R.renderShop(); R.paintOwner && R.paintOwner(); },
        function (e) { console.warn("[Ronin] products:", e.message); });
};
R.prodList = function () {
  return Object.keys(R.PRODS).map(function (k) {
    var p = R.PRODS[k]; p.id = k; return p;
  }).sort(function (a, b) { return (b.t || 0) - (a.t || 0); });
};
R.prodCard = function (p) {
  var mine = p.sellerUid === R.ME;
  return '<div class="prod"><div class="pimg" style="position:relative">' + (p.icon || "🎁") +
    (mine ? '<span class="chip gd" style="position:absolute;top:8px;inset-inline-start:8px">آگهی من</span>' : "") +
    "</div><div class=\"pinfo\">" +
    '<div class="sm b ellip">' + R.esc(p.name) + "</div>" +
    '<div class="xs mut ellip">' + R.esc(p.company || p.sellerName || "فروشنده") + "</div>" +
    (p.cat ? '<div class="xs cy mt" style="margin-top:5px">' + R.esc(p.cat) + "</div>" : "") +
    '<div class="row between" style="margin-top:9px">' +
    '<span class="price">' + R.money(p.price) + " " + R.esc(p.cur || "تومان") + "</span>" +
    '<button class="btn p mini" data-prod="' + p.id + '">مشاهده</button></div></div></div>';
};
R.renderShop = function () {
  var w = R.$("shopWall"), my = R.$("myAds");
  var all = R.prodList();
  var live = all.filter(R.isLive);

  if (w) {
    if (!live.length) w.innerHTML = '<div class="empty">هنوز آگهی‌ای ثبت نشده — تو اولی باش 📢</div>';
    else w.innerHTML = live.map(R.prodCard).join("");
  }
  if (my) {
    var mine = all.filter(function (p) { return p.sellerUid === R.ME; });
    if (!R.ME) my.innerHTML = '<div class="empty">برای دیدن آگهی‌هایت وارد شو</div>';
    else if (!mine.length) my.innerHTML = '<div class="empty">هنوز آگهی‌ای نساخته‌ای</div>';
    else {
      my.innerHTML = mine.map(function (p) {
        var st = p.st === "pending" ? '<span class="chip gd">⏳ در انتظار تایید</span>'
               : p.st === "rejected" ? '<span class="chip bad">رد شد</span>'
               : '<span class="chip ok">✅ فعال</span>';
        return '<div class="card hov"><div class="row">' +
          '<div style="font-size:28px">' + (p.icon || "🎁") + "</div>" +
          '<div class="grow" style="min-width:0"><div class="sm b ellip">' + R.esc(p.name) + "</div>" +
          '<div class="xs mut">' + R.money(p.price) + " " + R.esc(p.cur || "تومان") + "</div></div>" +
          st + "</div>" +
          '<div class="row mt" style="gap:6px">' +
          '<button class="btn mini" data-prod="' + p.id + '">نمایش</button>' +
          '<button class="btn d mini" data-delad="' + p.id + '">حذف</button></div></div>';
      }).join("");
    }
  }
  R.setT("shopCount", R.fa(live.length));
};

/* ── ۳. ثبت آگهی ─────────────────────────────────────────── */
R.submitAd = function () {
  if (!R.ME) return R.needLogin("ثبت آگهی");
  var v = function (id) { var e = R.$(id); return e ? e.value : ""; };
  var name = R.clean(v("adName"), 60);
  var price = R.clean(v("adPrice"), 20);
  var desc = R.clean(v("adDesc"), 600);
  if (name.length < 2) return R.toast("نام محصول را بنویس", "err");
  if (!price) return R.toast("قیمت را وارد کن", "err");

  var owner = R.isOwner();
  var p = {
    name: name, icon: R.clean(v("adIcon"), 4) || "🎁",
    price: price, cur: R.clean(v("adCur"), 10) || "تومان",
    cat: R.clean(v("adCat"), 30) || "متفرقه",
    desc: desc, company: R.clean(v("adCompany"), 40),
    contact: R.clean(v("adContact"), 60), loc: R.clean(v("adLoc"), 40),
    sellerUid: R.ME, sellerName: (R.USER && R.USER.name) || "فروشنده",
    t: Date.now(), views: 0, st: owner ? "live" : "pending"
  };
  R.add("products", p).then(function () {
    ["adName", "adPrice", "adDesc", "adCompany", "adContact", "adLoc"].forEach(function (id) {
      var e = R.$(id); if (e) e.value = "";
    });
    if (owner) R.toast("آگهی منتشر شد ✅", "ok");
    else {
      R.toast("⏳ آگهی برای تایید مالک فرستاده شد", "ok");
      R.notify(R.OWNER_UID, "📢 آگهی جدید در انتظار تایید", "mod", "owner");
    }
    R.xp(8);
  }).catch(function (e) { R.toast("ثبت نشد: " + e.message, "err"); });
};

/* ── ۴. صفحه محصول ───────────────────────────────────────── */
R.prodBody = function (p) {
  var mine = p.sellerUid === R.ME;
  var h = '<div class="row" style="align-items:flex-start"><div style="font-size:44px">' +
    (p.icon || "🎁") + '</div><div class="grow" style="min-width:0">' +
    '<div class="h2">' + R.esc(p.name) + "</div>" +
    '<div class="xs mut">' + R.esc(p.company || p.sellerName || "فروشنده") +
    (p.loc ? " • 📍 " + R.esc(p.loc) : "") + "</div>" +
    '<div class="row mt" style="gap:6px"><span class="chip cy">' + R.esc(p.cat || "متفرقه") + "</span>" +
    '<span class="chip">👁 ' + R.fa(p.views || 0) + "</span></div></div>" +
    '<button class="icobtn" data-close="prodMod">✕</button></div>';

  h += '<div class="price" style="font-size:20px;margin:13px 0">' +
    R.money(p.price) + " " + R.esc(p.cur || "تومان") + "</div>";
  if (p.desc) h += '<div class="sm" style="line-height:1.9">' + R.esc(p.desc).replace(/\n/g, "<br>") + "</div>";

  h += '<div class="card mt" style="padding:12px"><div class="row between">' +
    '<div><div class="xs mut">فروشنده</div><div class="sm b">' +
    R.esc(p.sellerName || "فروشنده") + "</div></div>" +
    (!mine && p.sellerUid ? '<button class="btn mini" data-dmto="' + p.sellerUid + '">💬 پیام</button>' : "") +
    "</div>";
  if (p.contact) h += '<div class="sm mt cy">📞 ' + R.esc(p.contact) + "</div>";
  h += "</div>";

  if (!mine) {
    h += '<div class="head"><h3 class="h3">ثبت سفارش / درخواست</h3></div>' +
      '<div class="col">' +
      '<div class="field"><label class="lbl">نام تو</label>' +
      '<input class="inp" id="oName" maxlength="30" value="' +
        R.esc((R.USER && R.USER.name) || "") + '"></div>' +
      '<div class="field"><label class="lbl">راه ارتباطی</label>' +
      '<input class="inp" id="oContact" maxlength="60" placeholder="ایمیل / تلگرام / شماره"></div>' +
      '<div class="field"><label class="lbl">تعداد</label>' +
      '<input class="inp" id="oQty" maxlength="6" value="1"></div>' +
      '<div class="field"><label class="lbl">پیام</label>' +
      '<textarea class="area" id="oMsg" maxlength="300" placeholder="آدرس، رنگ، سایز…"></textarea></div>' +
      '<button class="btn p blk" data-order="' + p.id + '">📩 ثبت سفارش</button>' +
      '<div class="xs mut center">خرید و ارسال را خود فروشنده انجام می‌دهد — رونین فقط واسطه است.</div>' +
      "</div>";
  } else {
    h += '<div class="row mt" style="gap:7px">' +
      '<button class="btn d" data-delad="' + p.id + '">🗑 حذف آگهی</button></div>';
  }
  return h;
};
R.openProd = function (id) {
  var p = R.PRODS[id]; if (!p) return;
  R.curProd = p;
  R.setH("prodBody", R.prodBody(p));
  R.mod("prodMod", true);
  p.views = (p.views || 0) + 1;
  R.db.ref("products/" + id + "/views").set(p.views).catch(function () {});
};

/* ── ۵. ثبت سفارش ────────────────────────────────────────── */
R.order = function (id) {
  if (!R.ME) return R.needLogin("ثبت سفارش");
  var p = R.PRODS[id]; if (!p) return;
  var v = function (x) { var e = R.$(x); return e ? e.value : ""; };
  var nm = R.clean(v("oName"), 30), ct = R.clean(v("oContact"), 60);
  if (!nm) return R.toast("نامت را بنویس", "err");
  if (!ct) return R.toast("راه ارتباطی را بنویس", "err");

  R.add("orders", {
    pid: id, pname: p.name, price: p.price, cur: p.cur || "تومان",
    sellerUid: p.sellerUid || "", buyerUid: R.ME, buyerName: nm,
    contact: ct, qty: R.clean(v("oQty"), 6) || "1",
    msg: R.clean(v("oMsg"), 300), st: "new"
  }).then(function () {
    R.toast("سفارش ثبت شد ✅ فروشنده جواب می‌دهد", "ok");
    R.closeMod("prodMod");
    R.notify(p.sellerUid, "🛒 سفارش جدید برای «" + p.name + "»", "order", "store");
    R.notify(R.OWNER_UID, "🛒 سفارش جدید: " + p.name, "order", "owner");
    R.xp(6);
  }).catch(function (e) { R.toast("ثبت نشد: " + e.message, "err"); });
};

/* ── ۶. حذف آگهی ─────────────────────────────────────────── */
R.delAd = function (id) {
  var p = R.PRODS[id]; if (!p) return;
  var ok = p.sellerUid === R.ME || R.isOwner() || R.can("ads") || R.can("market");
  if (!ok) return R.toast("اجازه نداری", "err");
  if (!window.confirm("این آگهی حذف شود؟")) return;
  R.db.ref("products/" + id).remove().then(function () {
    R.closeMod("prodMod");
    R.toast("حذف شد", "ok");
  });
};

/* ── ۷. اتصال رویدادها ───────────────────────────────────── */
R.bindMarket = function () {
  if (R.$("adBtn")) R.$("adBtn").addEventListener("click", R.submitAd);
  var sel = R.$("adCat");
  if (sel && sel.options.length <= 1) {
    R.CATS.forEach(function (c) {
      var o = document.createElement("option"); o.value = c; o.textContent = c; sel.appendChild(o);
    });
  }
  document.addEventListener("click", function (e) {
    var t = e.target.closest ? e.target.closest("[data-prod],[data-order],[data-delad],[data-dmto]") : null;
    if (!t) return;
    if (t.hasAttribute("data-prod")) R.openProd(t.getAttribute("data-prod"));
    else if (t.hasAttribute("data-order")) R.order(t.getAttribute("data-order"));
    else if (t.hasAttribute("data-delad")) R.delAd(t.getAttribute("data-delad"));
    else if (t.hasAttribute("data-dmto")) {
      R.closeMod("prodMod");
      if (R.dmOpen) R.dmOpen(t.getAttribute("data-dmto"));
    }
  });
};

/* ── ۸. آماده‌سازی ───────────────────────────────────────── */
R.bootMarket = function () {
  R.bindMarket();
  R.watchShop();
};

})();
