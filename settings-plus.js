/* ═══ RONIN SETTINGS+ v1 — تنظیمات کامل حساب ═══ */
"use strict";
(function () {
  if (!window.R || R.__settingsPlus) return;
  R.__settingsPlus = true;

  var busy = false;

  function el(id) { return document.getElementById(id); }
  function val(id) { var e = el(id); return e ? String(e.value || "").trim() : ""; }
  function msg(id, text, bad) {
    var e = el(id);
    if (!e) return;
    e.textContent = text || "";
    e.className = "xs mt " + (bad ? "bad" : "ok");
  }
  function disable(id, on) { var b = el(id); if (b) b.disabled = !!on; }

  /* ── ۱. ترجمهٔ خطاهای فایربیس ───────────────────────────── */
  function mapErr(e) {
    var c = (e && e.code) || "";
    var m = {
      "auth/wrong-password": "رمز فعلی درست نیست",
      "auth/invalid-credential": "رمز فعلی درست نیست",
      "auth/invalid-login-credentials": "رمز فعلی درست نیست",
      "auth/weak-password": "رمز جدید کوتاه است (حداقل ۶ کاراکتر)",
      "auth/invalid-email": "ایمیل معتبر نیست",
      "auth/email-already-in-use": "این ایمیل قبلاً ثبت شده",
      "auth/requires-recent-login": "برای این کار باید دوباره وارد شوی",
      "auth/too-many-requests": "تلاش زیاد — کمی بعد امتحان کن",
      "auth/network-request-failed": "اینترنت وصل نیست",
      "auth/user-mismatch": "حساب با این رمز هم‌خوانی ندارد"
    };
    return m[c] || (e && e.message) || "خطای نامشخص";
  }

  /* ── ۲. دسترسی به کاربر فایربیس ─────────────────────────── */
  function currentUser() {
    try {
      if (typeof firebase === "undefined" || !R.auth) return null;
      return R.auth.currentUser || null;
    } catch (e) { return null; }
  }

  function reauth(pass, ok, bad) {
    var u = currentUser();
    if (!u || !u.email) return bad("حساب وارد‌شده پیدا نشد");
    var cred;
    try { cred = firebase.auth.EmailAuthProvider.credential(u.email, pass); }
    catch (e) { return bad("ورود دوباره ممکن نشد"); }
    u.reauthenticateWithCredential(cred).then(ok).catch(function (e) { bad(mapErr(e)); });
  }

  /* ── ۳. ساخت کارت‌ها ────────────────────────────────────── */
  function css() {
    if (el("setCss")) return;
    var s = document.createElement("style");
    s.id = "setCss";
    s.textContent =
      "#sec-settings .srow{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:9px 0;" +
        "border-top:1px solid rgba(150,120,255,.12)}" +
      "#sec-settings .srow:first-child{border-top:0}" +
      "#stLangWrap{display:flex;flex-wrap:wrap;gap:6px}" +
      "#stLangWrap .on{background:linear-gradient(135deg,#7c5cff,#22d3ee);color:#fff}" +
      "#stAvPrev{margin-bottom:8px}" +
      ".bad{color:#ff8fa3!important}.ok{color:#5df0b0!important}";
    document.head.appendChild(s);
  }

  function card(id) {
    var c = document.createElement("div");
    c.className = "card mb";
    c.id = id;
    return c;
  }

  function build() {
    var sec = el("sec-settings");
    if (!sec || el("stProfile")) return;
    css();

    /* کارت حساب */
    var p = card("stProfile");
    p.innerHTML =
      '<div class="sm b mb">👤 حساب من</div>' +
      '<div id="stAvPrev"></div>' +
      '<input type="file" id="stAv" accept="image/*" style="display:none">' +
      '<div class="row mb" style="gap:8px"><button class="btn mini" type="button" id="stAvBtn">🖼 تغییر عکس</button>' +
        '<span class="xs mut">عکس در همین مرورگر فشرده و ذخیره می‌شود</span></div>' +
      '<div class="field"><label class="lbl">نام نمایشی</label>' +
        '<input class="inp" id="stName" maxlength="24" placeholder="نام تو"></div>' +
      '<div class="field"><label class="lbl">بیو</label>' +
        '<textarea class="area" id="stBio" maxlength="200" placeholder="یک خط دربارهٔ خودت"></textarea></div>' +
      '<div class="xs mt" id="stMsg"></div>' +
      '<button class="btn p mt" type="button" id="stSave">ذخیرهٔ پروفایل</button>';

    /* کارت امنیت */
    var s = card("stSec");
    s.innerHTML =
      '<div class="sm b mb">🔐 امنیت</div>' +
      '<div class="field"><label class="lbl">رمز فعلی</label>' +
        '<input class="inp" id="stPwCur" type="password" autocomplete="current-password" placeholder="••••••"></div>' +
      '<div class="grid g2"><div class="field"><label class="lbl">رمز جدید</label>' +
        '<input class="inp" id="stPwNew" type="password" autocomplete="new-password" placeholder="حداقل ۶ کاراکتر"></div>' +
        '<div class="field"><label class="lbl">تکرار رمز جدید</label>' +
        '<input class="inp" id="stPwRep" type="password" autocomplete="new-password" placeholder="••••••"></div></div>' +
      '<div class="xs mt" id="stPwMsg"></div>' +
      '<button class="btn mt" type="button" id="stPwBtn">تغییر رمز</button>' +
      '<div class="srow" style="margin-top:12px"><div class="sm b">✉️ ایمیل حساب</div></div>' +
      '<div class="field"><label class="lbl">ایمیل جدید</label>' +
        '<input class="inp" id="stEmNew" type="email" dir="ltr" placeholder="you@mail.com"></div>' +
      '<div class="field"><label class="lbl">رمز فعلی</label>' +
        '<input class="inp" id="stEmPass" type="password" autocomplete="current-password" placeholder="••••••"></div>' +
      '<div class="xs mt" id="stEmMsg"></div>' +
      '<button class="btn mt" type="button" id="stEmBtn">تغییر ایمیل</button>';

    /* کارت ظاهر و زبان */
    var t = card("stLook");
    t.innerHTML =
      '<div class="sm b mb">🎨 ظاهر و زبان</div>' +
      '<div class="srow"><div><div class="sm">تم</div><div class="xs mut">تیره یا روشن</div></div>' +
        '<div class="row" style="gap:6px">' +
          '<button class="btn mini" type="button" id="stDark">🌙 تیره</button>' +
          '<button class="btn mini" type="button" id="stLight">☀️ روشن</button></div></div>' +
      '<div class="srow"><div><div class="sm">زبان</div><div class="xs mut">متن‌های سایت</div></div>' +
        '<div id="stLangWrap"></div></div>';

    /* کارت حذف حساب */
    var d = card("stDanger");
    d.innerHTML =
      '<div class="sm b mb bad">⚠️ حذف حساب</div>' +
      '<div class="xs mut mb">این کار برگشت‌پذیر نیست: پروفایل، پست‌ها، پیام‌ها و دنبال‌کردن‌هایت پاک می‌شوند.</div>' +
      '<div class="field"><label class="lbl">برای تأیید بنویس: حذف</label>' +
        '<input class="inp" id="stDelWord" placeholder="حذف"></div>' +
      '<div class="field"><label class="lbl">رمز فعلی</label>' +
        '<input class="inp" id="stDelPass" type="password" autocomplete="current-password" placeholder="••••••"></div>' +
      '<div class="xs mt" id="stDelMsg"></div>' +
      '<button class="btn d mt" type="button" id="stDelBtn">حذف همیشگی حساب</button>';

    /* برای مهمان همهٔ کارت‌ها مخفی می‌مانند؛ پیام ورود از قبل در همین بخش هست */
    var after = sec.querySelector(".head");
    if (!after || after.parentNode !== sec) after = null;
    [p, s, t, d].forEach(function (c) {
      if (after) { after.insertAdjacentElement("afterend", c); after = c; }
      else sec.appendChild(c);
    });

    bind();
    sync();
    paintLang();
    paintTheme();
  }

  /* ── ۴. نمایش وضعیت ─────────────────────────────────────── */
  function sync() {
    var on = !!R.ME;
    ["stProfile", "stSec", "stLook", "stDanger"].forEach(function (id) {
      var e = el(id); if (e) e.classList.toggle("hide", !on);
    });
    if (!on) return;

    var u = R.USER || {};
    if (el("stName") && !el("stName").value) el("stName").value = u.name || "";
    if (el("stBio") && !el("stBio").value) el("stBio").value = u.bio || "";

    var prev = el("stAvPrev");
    if (prev) {
      prev.innerHTML = R.avHTML ? R.avHTML({ name: u.name, av: u.av, avFrame: u.avFrame }, "lg") : "";
    }
  }

  function paintTheme() {
    var cur = document.documentElement.dataset.theme || "dark";
    var d = el("stDark"), l = el("stLight");
    if (d) d.classList.toggle("p", cur === "dark");
    if (l) l.classList.toggle("p", cur === "light");
  }

  function setTheme(t) {
    document.documentElement.dataset.theme = t;
    try { localStorage.setItem("ronin-theme", t); } catch (e) {}
    var a = document.querySelector('meta[name="theme-color"]');
    if (a) a.content = t === "light" ? "#f4f6fb" : "#05070f";
    var b = document.querySelector('meta[name="color-scheme"]');
    if (b) b.content = t;
    var btn = el("themeToggle");
    if (btn) btn.textContent = t === "dark" ? "🌙" : "☀️";
    paintTheme();
  }

  function paintLang() {
    var wrap = el("stLangWrap");
    if (!wrap || !R.i18n) return;
    var cur = R.i18n.get ? R.i18n.get() : "fa";
    var names = { fa: "🇮🇷 فارسی", en: "🇬🇧 English", tr: "🇹🇷 Türkçe" };
    wrap.innerHTML = (R.i18n.langs || ["fa"]).map(function (l) {
      return '<button class="btn mini' + (l === cur ? " on" : "") + '" type="button" data-stlang="' +
        l + '">' + (names[l] || l) + "</button>";
    }).join("");
  }

  /* ── ۵. کنش‌ها ──────────────────────────────────────────── */
  function saveProfile() {
    if (!R.ME) return;
    var n = val("stName"), b = val("stBio");
    if (n.length < 2) return msg("stMsg", "نام خیلی کوتاه است", 1);
    R.upd("users/" + R.ME, { name: n, bio: b }).then(function () {
      if (R.USER) { R.USER.name = n; R.USER.bio = b; }
      if (R.paintUser) R.paintUser();
      sync();
      msg("stMsg", "ذخیره شد ✅");
      if (R.toast) R.toast("پروفایل ذخیره شد ✅", "ok");
    }).catch(function (e) { msg("stMsg", "ذخیره نشد: " + e.message, 1); });
  }

  function changePass() {
    var cur = val("stPwCur"), nw = val("stPwNew"), rp = val("stPwRep");
    if (!cur) return msg("stPwMsg", "رمز فعلی را بنویس", 1);
    if (nw.length < 6) return msg("stPwMsg", "رمز جدید حداقل ۶ کاراکتر باشد", 1);
    if (nw !== rp) return msg("stPwMsg", "رمز جدید و تکرارش یکی نیست", 1);
    msg("stPwMsg", "کمی صبر کن…");
    disable("stPwBtn", true);
    reauth(cur, function () {
      var u = currentUser();
      if (!u) { disable("stPwBtn", false); return msg("stPwMsg", "حساب پیدا نشد", 1); }
      u.updatePassword(nw).then(function () {
        disable("stPwBtn", false);
        ["stPwCur", "stPwNew", "stPwRep"].forEach(function (id) { var e = el(id); if (e) e.value = ""; });
        msg("stPwMsg", "رمز عوض شد ✅");
      }).catch(function (e) { disable("stPwBtn", false); msg("stPwMsg", mapErr(e), 1); });
    }, function (m) { disable("stPwBtn", false); msg("stPwMsg", m, 1); });
  }

  function changeEmail() {
    var nw = val("stEmNew"), ps = val("stEmPass");
    if (!nw || nw.indexOf("@") < 1) return msg("stEmMsg", "ایمیل معتبر نیست", 1);
    if (!ps) return msg("stEmMsg", "رمز فعلی را بنویس", 1);
    msg("stEmMsg", "کمی صبر کن…");
    disable("stEmBtn", true);
    reauth(ps, function () {
      var u = currentUser();
      if (!u) { disable("stEmBtn", false); return msg("stEmMsg", "حساب پیدا نشد", 1); }
      u.updateEmail(nw).then(function () {
        disable("stEmBtn", false);
        var e1 = el("stEmPass"); if (e1) e1.value = "";
        var e2 = el("stEmNew"); if (e2) e2.value = "";
        msg("stEmMsg", "ایمیل عوض شد ✅ (اگر اجباری شد دوباره وارد شو)");
        if (R.upd) R.upd("users/" + R.ME, { email: nw }).catch(function () {});
      }).catch(function (e) { disable("stEmBtn", false); msg("stEmMsg", mapErr(e), 1); });
    }, function (m) { disable("stEmBtn", false); msg("stEmMsg", m, 1); });
  }

  function wipe(uid) {
    var paths = ["users/", "online/", "follows/", "followers/", "dmBox/", "notifs/", "bm/"];
    return Promise.all(paths.map(function (p) {
      return R.db.ref(p + uid).remove().catch(function () {});
    }));
  }

  function delAccount() {
    if (!R.ME || busy) return;
    if (val("stDelWord") !== "حذف") return msg("stDelMsg", "برای تأیید دقیقاً بنویس: حذف", 1);
    if (!val("stDelPass")) return msg("stDelMsg", "رمز فعلی را بنویس", 1);
    msg("stDelMsg", "کمی صبر کن…");
    busy = true;
    disable("stDelBtn", true);
    var uid = R.ME;
    reauth(val("stDelPass"), function () {
      var u = currentUser();
      if (!u) { busy = false; disable("stDelBtn", false); return msg("stDelMsg", "حساب پیدا نشد", 1); }
      wipe(uid).then(function () { return u.delete(); }).then(function () {
        busy = false;
        msg("stDelMsg", "حساب حذف شد");
        if (R.toast) R.toast("حساب حذف شد — خداحافظ 👋", "ok");
        setTimeout(function () { location.reload(); }, 1200);
      }).catch(function (e) {
        busy = false; disable("stDelBtn", false);
        msg("stDelMsg", mapErr(e), 1);
      });
    }, function (m) { busy = false; disable("stDelBtn", false); msg("stDelMsg", m, 1); });
  }

  /* ── ۶. رویدادها ────────────────────────────────────────── */
  function bind() {
    if (el("stSave")) el("stSave").addEventListener("click", saveProfile);
    if (el("stPwBtn")) el("stPwBtn").addEventListener("click", changePass);
    if (el("stEmBtn")) el("stEmBtn").addEventListener("click", changeEmail);
    if (el("stDelBtn")) el("stDelBtn").addEventListener("click", delAccount);

    if (el("stAvBtn") && el("stAv")) {
      el("stAvBtn").addEventListener("click", function () { el("stAv").click(); });
      el("stAv").addEventListener("change", function () {
        var f = this.files && this.files[0];
        this.value = "";
        if (!f) return;
        if (R.pickPhoto) R.pickPhoto(f);
        else if (R.toast) R.toast("انتخاب عکس آماده نیست", "err");
        setTimeout(function () { sync(); }, 1600);
      });
    }

    if (el("stDark")) el("stDark").addEventListener("click", function () { setTheme("dark"); });
    if (el("stLight")) el("stLight").addEventListener("click", function () { setTheme("light"); });

    document.addEventListener("click", function (e) {
      var t = e.target.closest ? e.target.closest("[data-stlang]") : null;
      if (!t) return;
      var l = t.getAttribute("data-stlang");
      if (R.i18n && R.i18n.set) R.i18n.set(l);
      paintLang();
    });
  }

  /* ── ۷. راه‌اندازی ──────────────────────────────────────── */
  function boot() {
    build();
    if (R.hooks) {
      var prev = R.hooks.settings;
      R.hooks.settings = function () {
        if (prev) { try { prev(); } catch (e) {} }
        build();
        sync();
        paintLang();
        paintTheme();
      };
    }
  }

  var prevIn = R.onLogin;
  R.onLogin = function () {
    if (prevIn) { try { prevIn(); } catch (e) {} }
    if (el("stName")) { el("stName").value = ""; el("stBio").value = ""; }
    sync();
  };
  var prevOut = R.onLogout;
  R.onLogout = function () {
    if (prevOut) { try { prevOut(); } catch (e) {} }
    if (el("stName")) { el("stName").value = ""; el("stBio").value = ""; }
    sync();
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  setTimeout(boot, 1900);
})();
