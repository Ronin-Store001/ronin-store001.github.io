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
/* ═══════════════════════════════════════════════════════════════
   RONIN STORE — SETTINGS EXTRA v1  ·  ارتقای بخش «⚙ تنظیمات»
   👁 نمایش و دسترس‌پذیری  •  💾 پشتیبان تنظیمات  •  🩺 سلامت حساب
   ───────────────────────────────────────────────────────────────
   افزودنی است: به index.html یا فایل‌های موجود دست نمی‌زند و
   سه کارت به انتهای #sec-settings اضافه می‌کند. تنظیمات نمایش فقط
   در همین مرورگر (localStorage) ذخیره می‌شوند؛ هیچ داده‌ای پاک
   نمی‌شود و هیچ نوشتنی روی دیتابیس انجام نمی‌دهد.
   ═══════════════════════════════════════════════════════════════ */
"use strict";
(function () {
  if (!window.R || R.__sx) return;
  R.__sx = true;

  var AKEY = "ronin_a11y";
  var A = { rm: false, hc: false, read: false, bg: false };
  var FONT = 0;                                   /* رزرو برای نسخه‌های بعد */

  function el(i) { return document.getElementById(i); }
  function esc(s) { return R.esc ? R.esc(s) : String(s == null ? "" : s); }
  function toast(m, k) { if (R.toast) R.toast(m, k || "ok"); }
  function ls(k, v) {
    try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); }
    catch (e) { return null; }
  }

  /* ── ۱. استایل ───────────────────────────────────────────── */
  function css() {
    if (el("sxCss")) return;
    var s = document.createElement("style");
    s.id = "sxCss";
    s.textContent =
      "html.a11y-rm *,html.a11y-rm *::before,html.a11y-rm *::after{" +
        "animation:none!important;transition:none!important}" +
      "html.a11y-hc .card,html.a11y-hc .post,html.a11y-hc .inp,html.a11y-hc .chat{" +
        "border-color:rgba(255,255,255,.55)!important}" +
      "html.a11y-hc .mut,html.a11y-hc .xs{opacity:.95!important}" +
      "html.a11y-read body{line-height:1.95}" +
      "html.a11y-bg .rain,html.a11y-bg .fog,html.a11y-bg .haze," +
        "html.a11y-bg .stars,html.a11y-bg .scan{display:none!important}" +
      "#sxCards .sxRow{display:flex;align-items:center;justify-content:space-between;" +
        "gap:10px;padding:9px 0;border-top:1px solid rgba(150,120,255,.12)}" +
      "#sxCards .sxRow:first-of-type{border-top:0}" +
      "#sxCards .sxHealth{display:flex;align-items:center;gap:9px;padding:5px 0;font-size:12px}" +
      "#sxCards .sxHealth.no{opacity:.55}" +
      "#sxCards .sxMeter{height:8px;border-radius:99px;background:rgba(255,255,255,.13);" +
        "overflow:hidden;margin:8px 0}" +
      "#sxCards .sxMeter>i{display:block;height:100%;border-radius:99px;" +
        "background:linear-gradient(90deg,#7c5cff,#22d3ee)}";
    document.head.appendChild(s);
  }

  /* ── ۲. اعمال تنظیمات نمایش ─────────────────────────────── */
  function loadA() {
    var raw = ls(AKEY);
    if (!raw) return;
    try {
      var o = JSON.parse(raw) || {};
      A.rm = !!o.rm; A.hc = !!o.hc; A.read = !!o.read; A.bg = !!o.bg;
    } catch (e) {}
  }

  function applyA() {
    var d = document.documentElement;
    d.classList.toggle("a11y-rm", A.rm);
    d.classList.toggle("a11y-hc", A.hc);
    d.classList.toggle("a11y-read", A.read);
    d.classList.toggle("a11y-bg", A.bg);
  }

  function saveA() {
    try { ls(AKEY, JSON.stringify(A)); } catch (e) {}
    applyA();
    paintToggles();
  }

  /* ── ۳. کارت نمایش ──────────────────────────────────────── */
  var TOGGLES = [
    { k: "rm", ic: "🌀", t: "کاهش انیمیشن", d: "حرکت‌ها و افکت‌ها خاموش می‌شوند" },
    { k: "hc", ic: "🔲", t: "کنتراست بالا", d: "خط‌ها و متن‌ها واضح‌تر دیده می‌شوند" },
    { k: "read", ic: "📖", t: "فاصلهٔ خطوط بیشتر", d: "برای خواندن طولانی راحت‌تر است" },
    { k: "bg", ic: "🌫", t: "خاموش‌کردن جلوه‌های پس‌زمینه", d: "باران، ستاره و افکت‌ها پنهان می‌شوند" }
  ];

  function rowsHTML() {
    return TOGGLES.map(function (x) {
      return '<div class="sxRow"><div style="min-width:0">' +
        '<div class="sm">' + x.ic + " " + esc(x.t) + "</div>" +
        '<div class="xs mut">' + esc(x.d) + "</div></div>" +
        '<button class="btn mini" type="button" data-sx-t="' + x.k + '">' + (A[x.k] ? "روشن" : "خاموش") + "</button></div>";
    }).join("");
  }

  function paintToggles() {
    var box = el("sxCard");
    if (!box) return;
    var body = el("sxToggles");
    if (body) body.innerHTML = rowsHTML();
  }

  /* ── ۴. پشتیبان تنظیمات ─────────────────────────────────── */
  function backupObj() {
    return {
      v: 1, at: Date.now(), kind: "ronin-settings",
      theme: (R.theme && R.theme.mode) ? R.theme.mode() : ls("ronin-theme"),
      lite: ls("ronin_lite") === "1",
      lang: (R.i18n && R.i18n.get) ? R.i18n.get() : ls("ronin_lang"),
      a11y: { rm: A.rm, hc: A.hc, read: A.read, bg: A.bg }
    };
  }

  function backup() {
    var d = backupObj();
    var txt = JSON.stringify(d, null, 2);
    var name = "ronin-settings-" + new Date().toISOString().slice(0, 10) + ".json";
    try {
      var b = new Blob([txt], { type: "application/json" });
      var u = URL.createObjectURL(b);
      var a = document.createElement("a");
      a.href = u; a.download = name;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(function () { try { URL.revokeObjectURL(u); } catch (e) {} }, 1500);
      toast("💾 فایل پشتیبان ساخته شد", "ok");
    } catch (e) {
      toast("لینک پشتیبان: " + name, "info");
    }
    return d;
  }

  function restore(obj) {
    if (!obj || typeof obj !== "object" || obj.kind !== "ronin-settings") {
      toast("فایل پشتیبان معتبر نیست", "err");
      return false;
    }
    if (obj.theme && R.theme && R.theme.set) { try { R.theme.set(obj.theme); } catch (e) {} }
    if (typeof obj.lite === "boolean") ls("ronin_lite", obj.lite ? "1" : "0");
    if (obj.lang && R.i18n && R.i18n.set) { try { R.i18n.set(obj.lang); } catch (e) {} }
    var a = obj.a11y || {};
    A.rm = !!a.rm; A.hc = !!a.hc; A.read = !!a.read; A.bg = !!a.bg;
    saveA();
    toast("✅ تنظیمات بازیابی شد — صفحه تازه می‌شود", "ok");
    setTimeout(function () { try { location.reload(); } catch (e) {} }, 900);
    return true;
  }

  function readFile(f) {
    if (!f) return;
    var fr = new FileReader();
    fr.onload = function () {
      var o = null;
      try { o = JSON.parse(String(fr.result || "")); }
      catch (e) { return toast("فایل خوانده نشد — JSON معتبر نیست", "err"); }
      restore(o);
    };
    fr.onerror = function () { toast("خواندن فایل نشد", "err"); };
    fr.readAsText(f);
  }

  /* ── ۵. سلامت حساب ──────────────────────────────────────── */
  function fbUser() {
    try {
      if (typeof firebase === "undefined" || !firebase.auth) return null;
      return firebase.auth().currentUser || null;
    } catch (e) { return null; }
  }

  function verified() {
    var u = fbUser();
    if (!u) return null;
    return !!u.emailVerified;
  }

  function notifOn(u) {
    var p = u.notifPrefs;
    if (!p || typeof p !== "object") return true;      /* پیش‌فرض: همه روشن */
    return Object.keys(p).some(function (k) { return p[k]; });
  }

  function health() {
    var u = R.USER || {};
    var v = verified();
    var prem = false;
    try {
      prem = R.premPlus && R.premPlus.isActive ? !!R.premPlus.isActive(u) : !!R.prem;
    } catch (e) { prem = !!R.prem; }
    var items = [
      { ok: !!v, t: v === null ? "وضعیت ایمیل نامشخص (بدون Firebase)" : (v ? "ایمیل تأیید شده" : "ایمیل تأیید نشده"), warn: !v && v !== null },
      { ok: String(u.name || "").trim().length >= 2, t: "نام نمایشی" },
      { ok: String(u.bio || "").trim().length >= 10, t: "بیو" },
      { ok: !!u.av, t: "آواتار" },
      { ok: notifOn(u), t: notifOn(u) ? "اعلان‌ها روشن است" : "همهٔ اعلان‌ها خاموش است" },
      { ok: true, t: prem ? "پرمیوم فعال 💎" : "حساب پایه" }
    ];
    var done = items.filter(function (i) { return i.ok; }).length;
    return { items: items, pc: Math.round(done * 100 / items.length), needVerify: v === false };
  }

  function healthHTML() {
    var h = health();
    var s = '<div class="between"><span class="sm b">🩺 سلامت حساب</span>' +
      '<span class="sm ' + (h.pc === 100 ? "ok" : "cy") + '">' + (R.fa ? R.fa(h.pc) : h.pc) + "٪</span></div>" +
      '<div class="sxMeter"><i style="width:' + h.pc + '%"></i></div>';
    s += h.items.map(function (i) {
      return '<div class="sxHealth' + (i.ok ? "" : " no") + '"><span>' + (i.ok ? "✅" : "⚠️") +
        "</span><span>" + esc(i.t) + "</span></div>";
    }).join("");
    if (h.needVerify) {
      s += '<button class="btn mini mt" type="button" data-sx="verify">✉️ ارسال ایمیل تأیید</button>';
    }
    s += '<div class="xs mut mt">وضعیت امنیت و پروفایل؛ چیزی تغییر نمی‌کند.</div>';
    return s;
  }

  function sendVerify() {
    var u = fbUser();
    if (!u || !u.sendEmailVerification) return toast("حساب Firebase پیدا نشد", "err");
    u.sendEmailVerification().then(function () {
      toast("✉️ ایمیل تأیید فرستاده شد — صندوقت را چک کن", "ok");
    }).catch(function (e) {
      toast("نشد: " + ((e && e.message) || ""), "err");
    });
  }

  /* ── ۶. ساخت کارت‌ها ────────────────────────────────────── */
  function build() {
    var sec = el("sec-settings");
    if (!sec) return;
    if (el("sxCards")) { sync(); return; }
    css();

    var wrap = document.createElement("div");
    wrap.id = "sxCards";

    var a = document.createElement("div");
    a.className = "card mb";
    a.id = "sxCard";
    a.innerHTML = '<div class="between mb"><div><div class="sm b">👁 نمایش و دسترس‌پذیری</div>' +
      '<div class="xs mut">فقط برای همین مرورگر ذخیره می‌شود</div></div>' +
      '<span class="chip cy">محلی</span></div><div id="sxToggles">' + rowsHTML() + "</div>";

    var b = document.createElement("div");
    b.className = "card mb";
    b.id = "sxBkCard";
    b.innerHTML = '<div class="sm b mb">💾 پشتیبان تنظیمات</div>' +
      '<div class="xs mut mb">تم، زبان، حالت کم‌مصرف و تنظیمات نمایش را در یک فایل ذخیره کن یا برگردان.</div>' +
      '<div class="row" style="gap:7px;flex-wrap:wrap">' +
        '<button class="btn mini p" type="button" data-sx="backup">⬇️ ساخت فایل پشتیبان</button>' +
        '<label class="btn mini" style="cursor:pointer">⬆️ بازیابی از فایل' +
          '<input id="sxBkFile" type="file" accept="application/json,.json" hidden></label>' +
      "</div>" +
      '<div class="xs mut mt">شامل رمز، ایمیل یا توکن نیست — فقط تنظیمات ظاهری.</div>';

    var c = document.createElement("div");
    c.className = "card mb";
    c.id = "sxHealthCard";
    c.innerHTML = healthHTML();

    wrap.appendChild(a);
    wrap.appendChild(b);
    wrap.appendChild(c);
    sec.appendChild(wrap);

    var f = el("sxBkFile");
    if (f) f.addEventListener("change", function () {
      var file = this.files && this.files[0];
      this.value = "";
      readFile(file);
    });

    sync();
  }

  function sync() {
    var on = !!R.ME;
    var hc = el("sxHealthCard");
    if (hc) {
      hc.classList.toggle("hide", !on);
      if (on) hc.innerHTML = healthHTML();
    }
  }

  /* ── ۷. کلیک‌ها ─────────────────────────────────────────── */
  document.addEventListener("click", function (e) {
    var t = e.target;
    if (!t || !t.closest || !el("sxCards")) return;

    var tg = t.closest("[data-sx-t]");
    if (tg) {
      e.preventDefault();
      var k = tg.getAttribute("data-sx-t");
      if (!(k in A)) return;
      A[k] = !A[k];
      saveA();
      toast(A[k] ? "روشن شد ✅" : "خاموش شد", "ok");
      return;
    }
    var b = t.closest("[data-sx]");
    if (!b) return;
    e.preventDefault();
    var a = b.getAttribute("data-sx");
    if (a === "backup") backup();
    else if (a === "verify") sendVerify();
  });

  /* ── ۸. راه‌اندازی ──────────────────────────────────────── */
  function boot() {
    loadA();
    applyA();
    build();
    sync();
  }

  if (R.hooks) {
    var prev = R.hooks.settings;
    R.hooks.settings = function () {
      if (prev) { try { prev(); } catch (e) {} }
      boot();
    };
  }

  var in0 = R.onLogin;
  R.onLogin = function () {
    if (in0) { try { in0(); } catch (e) {} }
    setTimeout(boot, 600);
  };
  var out0 = R.onLogout;
  R.onLogout = function () {
    if (out0) { try { out0(); } catch (e) {} }
    setTimeout(sync, 400);
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  [1200, 2800].forEach(function (ms) { setTimeout(boot, ms); });

  /* برای تست و استفادهٔ بیرونی */
  R.settingsExtra = {
    state: A, toggles: TOGGLES,
    apply: applyA, backup: backupObj, restore: restore, health: health, build: build
  };
})();
/* ═══════════════════════════════════════════════════════════════
   SETTINGS PRO SHELL — هیرو، تب‌بندی و میان‌برهای تنظیمات
   روی settings-plus + settings-extra سوار می‌شود.
   ═══════════════════════════════════════════════════════════════ */
"use strict";
(function () {
  if (!window.R || R.__settingsPro) return;
  R.__settingsPro = true;

  var TABS = [
    { k: "account",   n: "حساب",   ic: "👤" },
    { k: "security",  n: "امنیت",  ic: "🔐" },
    { k: "appearance", n: "ظاهر",  ic: "🎨" },
    { k: "tools",     n: "ابزار",  ic: "🧰" },
    { k: "danger",    n: "خطر",    ic: "⚠️" }
  ];
  var GROUPS = {
    stProfile: "account", npCard: "account",
    stSec: "security",
    stLook: "appearance", sxCard: "appearance",
    sxBkCard: "tools", sxHealthCard: "tools",
    stDanger: "danger"
  };
  var current = "account";

  function el(id) { return document.getElementById(id); }
  function qa(s) { return Array.prototype.slice.call(document.querySelectorAll(s)); }
  function esc(s) { return R.esc ? R.esc(s) : String(s == null ? "" : s); }
  function fa(n) { return R.fa ? R.fa(n) : String(n); }
  function val(fn, fallback) { try { return fn(); } catch (e) { return fallback; } }

  try {
    var saved = localStorage.getItem("ronin-settings-tab");
    if (saved && TABS.some(function (t) { return t.k === saved; })) current = saved;
  } catch (e) {}

  function health() {
    if (R.settingsExtra && R.settingsExtra.health) {
      var h = val(function () { return R.settingsExtra.health(); }, null);
      if (h && typeof h.pc === "number") return h;
    }
    var u = R.USER || {}, n = 0;
    if (String(u.name || "").trim().length >= 2) n++;
    if (String(u.bio || "").trim().length >= 10) n++;
    if (u.av) n++;
    if (u.emailVerified) n++;
    return { pc: Math.round(n * 25), items: [] };
  }

  function themeName() {
    var m = val(function () { return R.theme.mode(); }, "");
    return m === "light" ? "روشن" : m === "auto" ? "خودکار" : "تیره";
  }

  function avatar() {
    if (R.avHTML) {
      try { return R.avHTML(R.USER || {}, "lg"); } catch (e) {}
    }
    return '<div class="av lg">' + esc((((R.USER || {}).name || "؟")).slice(0, 1)) + "</div>";
  }

  function roleName() {
    if (R.isOwner && R.isOwner()) return "مالک";
    if (R.team) return "تیم رونین";
    return "عضو جامعه";
  }

  function emailVerified() {
    try {
      var u = window.firebase && firebase.auth && firebase.auth().currentUser;
      return u ? u.emailVerified !== false : null;
    } catch (e) { return null; }
  }

  function syncCards() {
    Object.keys(GROUPS).forEach(function (id) {
      var c = el(id);
      if (!c) return;
      c.classList.add("accCard");
      if (c.getAttribute("data-acc-group") !== GROUPS[id]) {
        c.setAttribute("data-acc-group", GROUPS[id]);
      }
    });
  }

  function countGroup(k) {
    return qa('.accCard[data-acc-group="' + k + '"]').filter(function (c) {
      return !c.classList.contains("hide") && c.style.display !== "none";
    }).length;
  }

  function applyTab(k, silent) {
    if (!TABS.some(function (t) { return t.k === k; })) k = "account";
    current = k;
    var sec = el("sec-settings");
    if (sec) sec.setAttribute("data-acc-tab", k);
    qa("#stProNav [data-sttab]").forEach(function (b) {
      b.classList.toggle("on", b.getAttribute("data-sttab") === k);
    });
    if (!silent) {
      try { localStorage.setItem("ronin-settings-tab", k); } catch (e) {}
      if (R.toast) {
        var t = TABS.filter(function (x) { return x.k === k; })[0];
        if (t) R.toast(t.ic + " تب " + t.n + " باز شد", "info");
      }
    }
  }

  function heroHTML() {
    var user = R.USER || {}, me = !!R.ME;
    var h = health();
    var v = emailVerified();
    var chips = '<span class="chip cy">' + esc(roleName()) + "</span>";
    if (R.prem) chips += '<span class="chip gd">💎 پرمیوم</span>';
    if (v === true) chips += '<span class="chip ok">✅ تأیید شده</span>';
    else if (v === false) chips += '<span class="chip rd">⚠️ تأیید نشده</span>';
    if (!me) chips += '<span class="chip">مهمان</span>';

    var unread = parseInt(R.accUnread, 10) || 0;
    var npc = val(function () { return R.npcPersona().n; }, "همراه پیش‌فرض");

    return '<div class="stProId">' + avatar() +
        '<div style="min-width:0"><span class="accKicker">RONIN ACCOUNT</span>' +
          '<b>' + esc(me ? (user.name || "کاربر رونین") : "مهمان رونین") + "</b>" +
          '<span>' + esc(me ? (user.email || "حساب رونین") : "برای ذخیره‌سازی وارد شو") + "</span>" +
          '<div class="stProChips">' + chips + "</div></div></div>" +
      '<div class="stProMetrics">' +
        '<div class="stProMetric"><b>' + esc(fa(h.pc)) + '٪</b><span>تکمیل حساب</span></div>' +
        '<div class="stProMetric"><b>' + esc(themeName()) + '</b><span>تم فعلی</span></div>' +
        '<div class="stProMetric"><b>' + esc(fa(unread)) + '</b><span>پیام نخوانده</span></div>' +
        '<div class="stProMetric"><b style="font-size:11px">' + esc(npc) + '</b><span>همراه فعال</span></div>' +
      '</div>' +
      '<div class="stProActions">' +
        '<button class="btn mini" type="button" data-go="profile">👤 پروفایل</button>' +
        '<button class="btn mini" type="button" data-go="archive">🏯 آرشیو</button>' +
        '<button class="btn mini" type="button" data-go="dm">📥 پیام‌ها</button>' +
        '<button class="btn mini p" type="button" data-stact="theme">🎨 تم</button>' +
        '<button class="btn mini" type="button" data-stact="backup">💾 پشتیبان</button>' +
      '</div>';
  }

  function navHTML() {
    return TABS.map(function (t) {
      return '<button type="button" data-sttab="' + t.k + '"' +
        (t.k === current ? ' class="on"' : "") + ">" + t.ic + " " + t.n +
        '<span class="n" data-stcount="' + t.k + '">۰</span></button>';
    }).join("");
  }

  function sync() {
    var sec = el("sec-settings");
    if (!sec) return;
    syncCards();
    var hero = el("stProHero");
    if (hero) hero.innerHTML = heroHTML();
    var nav = el("stProNav");
    if (nav) {
      qa("#stProNav [data-sttab]").forEach(function (b) {
        var k = b.getAttribute("data-sttab");
        b.classList.toggle("on", k === current);
        var n = b.querySelector("[data-stcount]");
        if (n) n.textContent = fa(countGroup(k));
      });
    }
    sec.setAttribute("data-acc-tab", current);
  }

  function ensure() {
    var sec = el("sec-settings");
    if (!sec) return;
    var head = sec.querySelector(".head");
    if (!head) return;

    if (!el("stProHero")) {
      var hero = document.createElement("div");
      hero.id = "stProHero";
      hero.className = "stProHero";
      head.parentNode.insertBefore(hero, head);
    }
    if (!el("stProNav")) {
      var nav = document.createElement("div");
      nav.id = "stProNav";
      nav.className = "stProNav";
      nav.setAttribute("role", "tablist");
      nav.innerHTML = navHTML();
      head.parentNode.insertBefore(nav, head);
    }
    sync();
    applyTab(current, true);
  }

  document.addEventListener("click", function (e) {
    var tab = e.target.closest ? e.target.closest("#stProNav [data-sttab]") : null;
    if (tab) {
      e.preventDefault();
      applyTab(tab.getAttribute("data-sttab"));
      return;
    }
    var act = e.target.closest ? e.target.closest("[data-stact]") : null;
    if (!act) return;
    var what = act.getAttribute("data-stact");
    if (what === "theme") {
      if (R.theme && R.theme.cycle) R.theme.cycle();
      else if (R.theme && R.theme.set) R.theme.set(R.theme.mode() === "dark" ? "light" : "dark");
      sync();
    } else if (what === "backup") {
      if (R.settingsExtra && R.settingsExtra.backup) R.settingsExtra.backup();
    } else if (what === "health") {
      if (R.toast) R.toast("🩺 سلامت حساب: " + fa(health().pc) + "٪", "ok");
    }
  });

  var prev = R.hooks && R.hooks.settings;
  R.hooks = R.hooks || {};
  R.hooks.settings = function () {
    if (prev) { try { prev(); } catch (e) {} }
    ensure();
    setTimeout(sync, 80);
  };

  var prevIn = R.onLogin;
  R.onLogin = function () {
    if (prevIn) { try { prevIn(); } catch (e) {} }
    setTimeout(ensure, 350);
  };
  var prevOut = R.onLogout;
  R.onLogout = function () {
    if (prevOut) { try { prevOut(); } catch (e) {} }
    setTimeout(ensure, 350);
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", ensure);
  else ensure();
  setTimeout(ensure, 900);
  setTimeout(sync, 2200);
  /* کارت‌های پویا (مثل notif-prefs) بدون interval خودشان گروه‌بندی می‌شوند */
  var secNow = el("sec-settings");
  if (secNow && window.MutationObserver) {
    try {
      new MutationObserver(function () { syncCards(); sync(); })
        .observe(secNow, { childList: true });
    } catch (e) {}
  }
})();
