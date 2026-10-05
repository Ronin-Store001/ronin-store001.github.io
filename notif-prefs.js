/* ═══ RONIN NOTIF PREFS v1 — تنظیمات اعلانها (فایل جدید؛ به فایلهای اصلی دست نمیزند) ═══ */
(function () {
  if (!window.R || R.__npref) return;      // ضد wrap تکراری
  R.__npref = true;

  /* دستههای اعلان */
  var CATS = [
    { k: "like",    ic: "❤️", t: "لایکها",       d: "وقتی کسی پستت را لایک میکند" },
    { k: "comment", ic: "💬", t: "کامنتها",       d: "وقتی کسی کامنت میگذارد" },
    { k: "follow",  ic: "👤", t: "دنبالکنندهها", d: "وقتی کسی دنبالت میکند" },
    { k: "order",   ic: "🛒", t: "سفارشها",       d: "سفارش جدید برای محصولاتت" },
    { k: "premium", ic: "💎", t: "پرمیوم و نقش",  d: "فعال شدن پرمیوم یا تغییر نقش" },
    { k: "mod",     ic: "🛡", t: "مدیریت",        d: "گزارشها و تایید محتوا", staff: true },
    { k: "system",  ic: "🔔", t: "عمومی",         d: "اطلاعیهها و نتیجهٔ بررسیها" }
  ];

  var ME = {}, cache = {}, MYUID = null, prefRef = null;

  /* تعیین دسته از kind/text (پارامتر صریح ترجیح دارد) */
  function catOf(kind, text, explicit) {
    if (explicit) return explicit;
    if (kind === "mod") return "mod";
    if (kind === "order") return "order";
    var s = String(text || "");
    if (s.indexOf("❤️") === 0) return "like";
    if (s.indexOf("👤") === 0) return "follow";
    if (s.indexOf("💬") === 0) return "comment";
    if (s.indexOf("💎") >= 0 || s.indexOf("🎖") >= 0) return "premium";
    return "system";
  }

  /* خواندن تفضیلات یک کاربر (کشدار؛ خطا = اجازه بده) */
  function prefsFor(uid, cb) {
    if (!window.R || !R.db || !uid) return cb({});
    if (uid === MYUID) return cb(ME);
    if (cache[uid]) return cb(cache[uid]);
    R.db.ref("users/" + uid + "/notifPrefs").once("value").then(function (s) {
      cache[uid] = s.val() || {}; cb(cache[uid]);
    }).catch(function () { cache[uid] = {}; cb(cache[uid]); });
  }

  /* ── بستهبندی R.notify: اگر گیرنده خاموشش کرده باشد، اعلان ساخته نمیشود ── */
  var orig = R.notify;
  if (typeof orig === "function") {
    R.notify = function (toUid, text, kind, link, cat) {
      if (!toUid || !R.db || toUid === (R.ME || null)) return;
      var c = catOf(kind, text, cat);
      prefsFor(toUid, function (p) {
        if (p && p[c] === false) return;                 // خاموش → نساز
        try { orig.call(R, toUid, text, kind, link); } catch (e) {}
      });
    };
  }

  /* ── ساخت خودکار کارت تنظیمات داخل #sec-settings ── */
  function inject() {
    if (document.getElementById("npCard")) return;
    var sec = document.getElementById("sec-settings");
    if (!sec) return;
    var card = document.createElement("div");
    card.className = "card mb";
    card.id = "npCard";
    card.style.display = "none";
    card.innerHTML =
      '<div class="between mb">' +
        '<div><div class="sm b">🔔 تنظیمات اعلانها</div>' +
        '<div class="xs mut">انتخاب کن چه اعلانهایی بگیری</div></div>' +
        '<button class="btn mini" id="npAll" type="button">همه روشن</button>' +
      '</div><div id="npList" class="col"></div>';
    var head = sec.querySelector(".head");
    if (head && head.parentNode === sec) head.insertAdjacentElement("afterend", card);
    else sec.insertBefore(card, sec.firstChild);
  }

  function isStaffNow() {
    try { return !!(R.isOwner && R.isOwner()) || !!(R.isStaff && R.isStaff()); } catch (e) { return false; }
  }

  function rowHTML(c) {
    return '<div class="between" style="padding:7px 0;border-top:1px solid rgba(150,120,255,.12)">' +
      '<div style="min-width:0"><div class="sm">' + c.ic + " " + c.t + "</div>" +
      '<div class="xs mut">' + c.d + "</div></div>" +
      '<button class="btn mini npBtn" type="button" data-np="' + c.k + '">…</button></div>';
  }

  function paint() {
    var card = document.getElementById("npCard");
    if (!card) return;
    var on = !!(window.R && R.ME);
    card.style.display = on ? "" : "none";
    if (!on) return;
    var list = document.getElementById("npList");
    if (!list) return;
    var staff = isStaffNow();
    var cats = CATS.filter(function (c) { return !c.staff || staff; });
    if (list.dataset.staff !== String(staff) || !list.dataset.built) {
      list.innerHTML = cats.map(rowHTML).join("");
      list.dataset.built = "1";
      list.dataset.staff = String(staff);
    }
    cats.forEach(function (c) {
      var b = list.querySelector('[data-np="' + c.k + '"]');
      if (!b) return;
      var enabled = ME[c.k] !== false;
      b.textContent = enabled ? "روشن ✅" : "خاموش";
      b.classList.toggle("p", enabled);
    });
  }

  function setPref(cat, val) {
    if (!R.ME || !R.db) return;
    ME[cat] = val; cache[MYUID] = ME; paint();
    R.db.ref("users/" + R.ME + "/notifPrefs/" + cat).set(val).catch(function () {});
  }

  document.addEventListener("click", function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var b = t.closest("[data-np]");
    if (b) { e.preventDefault();
      var c = b.getAttribute("data-np"), en = ME[c] !== false;
      setPref(c, !en);
      if (R.toast) R.toast(en ? "🔕 اعلان خاموش شد" : "🔔 اعلان روشن شد", "ok");
      return;
    }
    if (t.closest("#npAll")) {
      e.preventDefault();
      if (!R.ME || !R.db) return;
      var o = {}; CATS.forEach(function (c) { o[c.k] = true; });
      ME = o; cache[MYUID] = ME; paint();
      R.db.ref("users/" + R.ME + "/notifPrefs").set(o).catch(function () {});
      if (R.toast) R.toast("همه اعلانها روشن شد ✅", "ok");
    }
  });

  function boot() {
    inject();
    if (!window.R || !R.db) return;
    var uid = R.ME || null;
    if (uid !== MYUID) {
      if (prefRef) { try { prefRef.off(); } catch (e) {} prefRef = null; }
      MYUID = uid; ME = {};
      if (uid) {
        prefRef = R.db.ref("users/" + uid + "/notifPrefs");
        prefRef.on("value", function (s) { ME = s.val() || {}; cache[uid] = ME; paint(); },
                   function () {});
      }
    }
    paint();
  }

  inject(); paint();
  setTimeout(boot, 900);
  setTimeout(boot, 2200);
  if (R.auth && R.auth.onAuthStateChanged) R.auth.onAuthStateChanged(function () { setTimeout(boot, 800); });
})();
