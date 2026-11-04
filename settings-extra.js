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
