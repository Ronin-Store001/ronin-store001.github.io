/* ═══════════════════════════════════════════════════════════════
   RONIN STORE — FOOTER  ·  ronin-footer.js
   فوتر کامل: درباره ما • قوانین • حریم خصوصی • شرایط استفاده •
   پرسش‌های پرتکرار • لینک‌های سریع • فرم ارسال پیام به مالک
   پیام‌ها در contact ذخیره می‌شوند و مالک در پنل + زنگ 🔔 می‌بیند.
   ═══════════════════════════════════════════════════════════════ */
"use strict";
(function () {
  var MSG = "contact", CFG = "settings/contact", LS = "ronin_contact_at";

  function el(i) { return document.getElementById(i); }
  function esc(s) { return (window.R && R.esc) ? R.esc(s) : String(s == null ? "" : s); }
  function fa(s) { return (window.R && R.fa) ? R.fa(s) : String(s); }
  function txt(c) { return (window.R && R.clean) ? R.clean(c, 800) : String(c || "").slice(0, 800); }

  /* ── متن صفحه‌های ثابت ─────────────────────────────────── */
  var PAGES = {
    about: { t: "🏯 درباره رونین استور", h:
      "<p>رونین استور یک دنیای دیجیتال برای عاشقان انیمه است: کشف انیمه، خبر و تریلر، انجمن و چت، فروشگاه و آگهی، و دنیای پرمیوم.</p>" +
      "<p>هدف ما ساختن جایی است که هم انیمه ببینی، هم رفیق پیدا کنی، هم چیز یاد بگیری و هم بتونی خودت محتوا بسازی.</p>" +
      "<p>رونین استور یک <b>پلتفرم تبلیغاتی</b> هم هست: فروشندگان آگهی می‌گذارند و خریدار مستقیم با فروشنده در تماس می‌شود.</p>" },
    rules: { t: "📜 قوانین انجمن", h:
      "<p>۱. توهین، توهین قومی، تهدید و آزار ممنوع است.</p>" +
      "<p>۲. اسپم و تبلیغ بی‌ربط در پست‌ها و چت ممنوع است.</p>" +
      "<p>۳. محتوای کپی‌رایت‌دار را بدون اجازه منتشر نکنید.</p>" +
      "<p>۴. هر پست حاوی فروش کالا باید از مسیر «فروشگاه» ثبت شود.</p>" +
      "<p>۵. تخلف = حذف محتوا یا محدودیت حساب.</p>" +
      "<p>۶. گزارش تخلف: از دکمه 🚩 روی محتوا یا فرم پایین سایت استفاده کن.</p>" },
    privacy: { t: "🔒 حریم خصوصی", h:
      "<p>چه چیزی ذخیره می‌کنیم: نام نمایشی، ایمیل، پروفایل و محتوایی که خودت می‌سازی.</p>" +
      "<p>چه چیزی نمایش داده می‌شود: نام نمایشی، آواتار، پست‌ها و آمار عمومی (لایک/دنبال‌کننده).</p>" +
      "<p>ایمیل شما هرگز به‌صورت عمومی نمایش داده نمی‌شود.</p>" +
      "<p>رمز عبور شما نزد ما نیست — ورود از طریق سرویس امن فایربیس انجام می‌شود.</p>" +
      "<p>می‌توانی هر وقت خواستی حساب و محتوا‌ت را حذف کنی؛ از فرم پایین پیام بده.</p>" },
    terms: { t: "⚖️ شرایط استفاده", h:
      "<p>با ساخت حساب، با قوانین رونین موافقت می‌کنی.</p>" +
      "<p>مسئولیت محتوایی که منتشر می‌کنی با خودت است.</p>" +
      "<p>معاملات فروشگاه بین خریدار و فروشنده است؛ رونین استور فقط پلتفرم آگهی است.</p>" +
      "<p>هر وقت لازم باشد، محتوای خلاف قوانین حذف و دسترسی محدود می‌شود.</p>" +
      "<p>مدیریت رونین می‌تواند قوانین را با اطلاع‌رسانی در سایت به‌روزرسانی کند.</p>" },
    faq: { t: "❓ پرسش‌های پرتکرار", h:
      "<p><b>چطور پرمیوم شوم؟</b> از بخش 💎 پرمیوم درخواست بده؛ مالک بعد از بررسی فعال می‌کند.</p>" +
      "<p><b>چطور آگهی بگذارم؟</b> منو → بازار رونین → تبلیغات و آگهی.</p>" +
      "<p><b>آگهی‌ام چرا دیده نمی‌شود؟</b> آگهی‌ها بعد از تایید مالک منتشر می‌شوند.</p>" +
      "<p><b>چطور گروه چت بسازم؟</b> با پرمیوم یا اجازه مالک — از بخش گروه‌های چت.</p>" +
      "<p><b>رمزمو فراموش کردم؟</b> از صفحه ورود، «رمزت را فراموش کردی؟» را بزن.</p>" +
      "<p><b>مشکلی داشتم؟</b> همین پایین فرم پیام به مالک را پر کن.</p>" }
  };

  /* ── استایل ────────────────────────────────────────────── */
  function css() {
    if (el("ftCss")) return;
    var s = document.createElement("style"); s.id = "ftCss";
    s.textContent =
      "#rnFoot{margin-top:34px;border-top:1px solid rgba(140,160,255,.18);padding:22px 4px 14px}" +
      ".ftGrid{display:grid;grid-template-columns:1.4fr 1fr 1fr 1fr;gap:18px}" +
      "@media (max-width:900px){.ftGrid{grid-template-columns:1fr 1fr}}" +
      "@media (max-width:520px){.ftGrid{grid-template-columns:1fr;gap:14px}}" +
      ".ftCol{display:flex;flex-direction:column;gap:7px;min-width:0}" +
      ".ftCol>b{font-size:12.5px;font-weight:900;opacity:.95;margin-bottom:2px}" +
      ".ftCol a{cursor:pointer;font-size:12.5px;opacity:.8;text-decoration:none;transition:.2s;width:fit-content}" +
      ".ftCol a:hover{opacity:1;color:#7ee7ff;transform:translateX(-2px)}" +
      ".ftLogo{display:flex;align-items:center;gap:9px;font-weight:900;font-size:16px}" +
      ".ftLogo i{font-style:normal;width:30px;height:30px;border-radius:9px;display:grid;place-items:center;" +
      "background:linear-gradient(135deg,#7c5cff,#22d3ee);font-size:16px;color:#fff}" +
      ".ftTx{font-size:12px;opacity:.72;line-height:1.9;margin:2px 0 0;max-width:340px}" +
      ".ftPanel{margin-top:16px;border:1px solid rgba(140,160,255,.2);border-radius:16px;overflow:hidden;" +
      "background:rgba(255,255,255,.035);display:none}" +
      ".ftPanel.on{display:block}" +
      ".ftPanel .ftPh{display:flex;justify-content:space-between;align-items:center;padding:10px 13px;" +
      "border-bottom:1px solid rgba(140,160,255,.16);font-size:13px;font-weight:800}" +
      ".ftPanel .ftPb{padding:13px}" +
      ".ftBar{margin-top:16px;padding-top:12px;border-top:1px solid rgba(140,160,255,.14);" +
      "display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;font-size:11.5px;opacity:.7}" +
      "#ftOwnerList .ftm{display:flex;gap:9px;align-items:flex-start;padding:9px 10px;border-radius:12px;" +
      "border:1px solid rgba(140,160,255,.16);background:rgba(255,255,255,.03);margin-top:7px}" +
      "#ftOwnerList .ftm.un{border-color:rgba(34,211,238,.55)}" +
      "#ftOwnerList .ftm .grow{flex:1 1 auto;min-width:0}";
    document.head.appendChild(s);
  }

  /* ── ساخت فوتر ─────────────────────────────────────────── */
  function build() {
    if (!window.R || !el("stage") || el("rnFoot")) return;
    css();
    var f = document.createElement("footer");
    f.id = "rnFoot";
    f.innerHTML =
      '<div class="ftGrid">' +
        '<div class="ftCol">' +
          '<div class="ftLogo"><i>忍</i><b>RONIN STORE</b></div>' +
          '<p class="ftTx">دنیای انیمه: کشف انیمه، خبر و تریلر، انجمن و چت، فروشگاه و آگهی، و دنیای پرمیوم — جایی که خودت می‌سازی.</p>' +
        '</div>' +
        '<div class="ftCol"><b>رونین</b>' +
          '<a data-ftpage="about">درباره ما</a>' +
          '<a data-ftpage="rules">قوانین انجمن</a>' +
          '<a data-ftpage="privacy">حریم خصوصی</a>' +
          '<a data-ftpage="terms">شرایط استفاده</a>' +
        '</div>' +
        '<div class="ftCol"><b>دسترسی سریع</b>' +
          '<a data-ftgo="anime">انیمه</a>' +
          '<a data-ftgo="news">اخبار</a>' +
          '<a data-ftgo="bulletin">اطلاعیه و تریلر</a>' +
          '<a data-ftgo="community">انجمن</a>' +
          '<a data-ftgo="market">فروشگاه</a>' +
        '</div>' +
        '<div class="ftCol"><b>پشتیبانی</b>' +
          '<a data-ftpage="faq">پرسش‌های پرتکرار</a>' +
          '<a id="ftMail" href="#">✉️ ایمیل مالک</a>' +
          '<a data-ftopen="1">📨 ارسال پیام به مالک</a>' +
          '<a data-ftgo="chat">💬 چت با کاربران</a>' +
        '</div>' +
      '</div>' +
      '<div class="ftPanel" id="ftPanel">' +
        '<div class="ftPh"><span>📨 ارسال پیام به مالک</span>' +
        '<button class="icobtn" type="button" id="ftClose">✕</button></div>' +
        '<div class="ftPb">' +
          '<div class="grid g2 mb">' +
            '<input class="inp" id="ftName" placeholder="نام شما" maxlength="40">' +
            '<input class="inp" id="ftContact" placeholder="ایمیل یا راه ارتباطی" dir="ltr" maxlength="80">' +
          '</div>' +
          '<select class="sel mb" id="ftSubject">' +
            '<option>پیشنهاد</option><option>گزارش مشکل</option>' +
            '<option>تبلیغات و همکاری</option><option>شکایت</option>' +
            '<option>درخواست پرمیوم</option><option>سایر</option>' +
          '</select>' +
          '<textarea class="area mb" id="ftText" placeholder="پیامت را بنویس…" maxlength="1200"></textarea>' +
          '<input type="text" id="ftHp" style="display:none" tabindex="-1" autocomplete="off">' +
          '<div class="row" style="gap:8px;flex-wrap:wrap">' +
            '<button class="btn p mini" type="button" id="ftSend">🚀 ارسال پیام</button>' +
            '<button class="btn mini" type="button" id="ftClear">پاک کردن</button>' +
          '</div>' +
          '<div class="xs mut mt" id="ftNote">پیامت مستقیم به مالک می‌رسد. ایمیلت جایی منتشر نمی‌شود.</div>' +
        '</div>' +
      '</div>' +
      '<div class="ftBar">' +
        '<span>© <span data-year>۲۰۲۶</span> RONIN STORE — همه حقوق محفوظ است</span>' +
        '<span>ساخته‌شده با ❤ برای دنیای انیمه</span>' +
      '</div>';
    el("stage").appendChild(f);

    loadCfg();
  }

  /* ── ایمیل/راه ارتباطی مالک ───────────────────────────── */
  function loadCfg() {
    if (!window.R || !R.get) return;
    R.get(CFG).then(function (v) {
      var a = el("ftMail"), c = (v && v.mail) || "";
      if (a) {
        if (c) { a.href = "mailto:" + c; a.textContent = "✉️ " + c; }
        else { a.href = "javascript:void(0)"; a.textContent = "✉️ ارسال پیام به مالک"; a.setAttribute("data-ftopen", "1"); }
      }
    }).catch(function () {});
  }

  /* ── ارسال پیام ────────────────────────────────────────── */
  function open() {
    var p = el("ftPanel"); if (!p) return;
    p.classList.add("on");
    try { p.scrollIntoView({ behavior: "smooth", block: "center" }); } catch (e) {}
    var n = el("ftName"); if (n) n.focus();
  }
  function close() { var p = el("ftPanel"); if (p) p.classList.remove("on"); }
  function reset() {
    ["ftName", "ftContact", "ftText", "ftHp"].forEach(function (i) { var x = el(i); if (x) x.value = ""; });
    if (el("ftSubject")) el("ftSubject").selectedIndex = 0;
  }

  function send() {
    if (!window.R || !R.db) return R.toast("اتصال برقرار نشد ❌", "err");
    if (el("ftHp") && el("ftHp").value) return;                 /* تله اسپم */
    var last = 0;
    try { last = parseInt(localStorage.getItem(LS) || "0", 10) || 0; } catch (e) {}
    if (Date.now() - last < 45000) return R.toast("کمی صبر کن، بعد دوباره بفرست ⏳", "err");

    var nm = R.clean(el("ftName") ? el("ftName").value : "", 40);
    var ct = R.clean(el("ftContact") ? el("ftContact").value : "", 80);
    var tx = txt(el("ftText") ? el("ftText").value : "");
    if (nm.length < 2) return R.toast("نامت را بنویس", "err");
    if (ct.length < 3) return R.toast("راه ارتباطی را بنویس", "err");
    if (tx.length < 10) return R.toast("پیامت خیلی کوتاه است", "err");

    var b = el("ftSend");
    if (b) { b.disabled = true; b.textContent = "در حال ارسال…"; }
    R.add(MSG, {
      t: Date.now(),
      name: nm,
      contact: ct,
      subject: R.clean(el("ftSubject") ? el("ftSubject").value : "", 30),
      text: tx,
      by: R.ME || "",
      read: false
    }).then(function () {
      try { localStorage.setItem(LS, String(Date.now())); } catch (e) {}
      R.toast("پیامت رسید ✅ ممنون!", "ok");
      reset(); close();
      if (R.npcSay) R.npcSay("پیامت به مالک رسید! 📨", 3400);
      if (R.notify && R.OWNER_UID && R.ME !== R.OWNER_UID) {
        R.notify(R.OWNER_UID, "📨 پیام جدید از " + nm + " — " + (el("ftSubject") ? el("ftSubject").value : ""), "info", "");
      }
    }).catch(function (e) {
      R.toast("ارسال نشد: " + e.message, "err");
    }).then(function () {
      if (b) { b.disabled = false; b.textContent = "🚀 ارسال پیام"; }
    });
  }

  /* ── کارت پیام‌ها در پنل مالک ─────────────────────────── */
  function ownerCard() {
    var sec = el("sec-owner");
    if (!sec || el("ftOwnerCard")) return;
    if (!window.R || !R.isOwner()) return;
    var d = document.createElement("div");
    d.className = "card mb";
    d.id = "ftOwnerCard";
    d.innerHTML =
      '<div class="between"><span class="sm b">📨 پیام‌های تماس</span>' +
      '<span class="chip cy" id="ftOwnerCnt">—</span></div>' +
      '<div class="xs mut mt mb">پیام‌هایی که کاربران از فرم پایین سایت می‌فرستند.</div>' +
      '<div class="grid g2 mb">' +
        '<input class="inp" id="ftMailIn" placeholder="ایمیل مالک (برای دکمه ایمیل فوتر)" dir="ltr" maxlength="80">' +
        '<button class="btn p mini" type="button" id="ftMailSave">💾 ذخیره ایمیل</button>' +
      '</div>' +
      '<div id="ftOwnerList"></div>';
    var head = sec.querySelector(".tabs");
    if (head && head.parentNode) head.parentNode.insertBefore(d, head);
    else sec.appendChild(d);
    watchOwner();
  }

  function watchOwner() {
    if (!window.R || !R.db || R._ftW) return;
    R._ftW = true;
    R.db.ref(MSG).limitToLast(50).on("value", function (s) {
      var v = s.val() || {};
      renderOwner(v);
    }, function () {});
    R.get(CFG).then(function (c) {
      var i = el("ftMailIn");
      if (i && c && c.mail) i.value = c.mail;
    }).catch(function () {});
  }

  function renderOwner(v) {
    var box = el("ftOwnerList");
    if (!box) return;
    var arr = Object.keys(v).map(function (k) { var m = v[k] || {}; m.id = k; return m; })
      .sort(function (a, b) { return (b.t || 0) - (a.t || 0); });
    var un = arr.filter(function (m) { return !m.read; }).length;
    if (el("ftOwnerCnt")) el("ftOwnerCnt").textContent = fa(un) + " نخوانده / " + fa(arr.length);
    if (!arr.length) { box.innerHTML = '<div class="empty">هنوز پیامی نیامده 📨</div>'; return; }
    box.innerHTML = arr.map(function (m) {
      return '<div class="ftm' + (m.read ? "" : " un") + '">' +
        '<div style="font-size:18px">📨</div>' +
        '<div class="grow">' +
          '<b class="sm">' + esc(m.name || "کاربر") + ' — ' + esc(m.subject || "پیام") + '</b>' +
          '<div class="xs mut" dir="ltr">' + esc(m.contact || "") + '</div>' +
          '<div class="sm mt" style="white-space:pre-wrap">' + esc(m.text || "") + '</div>' +
          '<div class="xs mut mt">' + (R.time ? R.time(m.t) : "") + '</div>' +
        '</div>' +
        '<div class="col" style="gap:5px">' +
          (m.read ? "" : '<button class="btn mini" type="button" data-ftread="' + esc(m.id) + '">✓</button>') +
          '<button class="btn mini d" type="button" data-ftdel="' + esc(m.id) + '">🗑</button>' +
        '</div></div>';
    }).join("");
  }

  /* ── کلیک‌ها ───────────────────────────────────────────── */
  document.addEventListener("click", function (e) {
    var t = e.target;
    if (!t || !t.closest) return;

    var pg = t.closest("[data-ftpage]");
    if (pg) {
      e.preventDefault();
      var k = pg.getAttribute("data-ftpage"), p = PAGES[k];
      if (!p) return;
      if (window.R && R.openInfo) R.openInfo(p.t, p.h);
      else R.toast(p.t, "ok");
      return;
    }
    var go = t.closest("[data-ftgo]");
    if (go) { e.preventDefault(); var gg = go.getAttribute("data-ftgo"); if (window.R && R.go) R.go(gg); return; }
    if (t.closest("[data-ftopen]")) { e.preventDefault(); if (el("ftPanel").classList.contains("on")) close(); else open(); return; }
    if (t.closest("#ftClose")) { e.preventDefault(); return close(); }
    if (t.closest("#ftClear")) { e.preventDefault(); return reset(); }
    if (t.closest("#ftSend")) { e.preventDefault(); return send(); }
    if (t.closest("#ftMailSave")) {
      e.preventDefault();
      var v = R.clean(el("ftMailIn") ? el("ftMailIn").value : "", 80);
      R.upd(CFG, { mail: v }).then(function () {
        R.toast("ذخیره شد ✅", "ok");
        loadCfg();
      }).catch(function (er) { R.toast("ذخیره نشد: " + er.message, "err"); });
      return;
    }
    var rd = t.closest("[data-ftread]");
    if (rd) {
      e.preventDefault();
      if (!R.isOwner()) return;
      R.upd(MSG + "/" + rd.getAttribute("data-ftread"), { read: true });
      return;
    }
    var dl = t.closest("[data-ftdel]");
    if (dl) {
      e.preventDefault();
      if (!R.isOwner()) return R.toast("فقط مالک 👑", "err");
      R.db.ref(MSG + "/" + dl.getAttribute("data-ftdel")).remove()
        .then(function () { R.toast("حذف شد 🗑", "ok"); });
      return;
    }
  }, true);

  /* ── راه‌اندازی ────────────────────────────────────────── */
  function boot() { build(); ownerCard(); }
  var prevLogin = window.R && R.onLogin;
  if (window.R) {
    R.onLogin = function () {
      if (prevLogin) { try { prevLogin(); } catch (e) {} }
      setTimeout(boot, 800);
    };
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  [800, 1800, 3200, 5200].forEach(function (ms) { setTimeout(boot, ms); });
})();
