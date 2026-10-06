/* ═══ RONIN STORE — TEAM NEWS · ronin-team-news.js ═══
   پنل انتشار خبر داخل «🛡 شبکه فرماندهی» (کنار چت خصوصی تیم)
   فقط: مالک 👑 یا کاربری که دسترسی «اخبار» دارد (R.can('news')) */
"use strict";
(function () {
  var HIDE_IN_NEWS = true;   /* فرم خبرِ بخش «اخبار» را برای تیم قایم کن ← فقط پنل تیم بماند */

  function el(id) { return document.getElementById(id); }
  function canNews() { return !!(window.R && (R.isOwner() || (R.can && R.can("news")))); }
  function isStaff() { return !!(window.R && R.isStaff && R.isStaff()); }

  function css() {
    if (el("tnCss")) return;
    var s = document.createElement("style"); s.id = "tnCss";
    s.textContent =
      (HIDE_IN_NEWS && isStaff() ? "#newsForm{display:none!important}" : "") +
      "#tnCard .tnrow{display:flex;gap:8px;flex-wrap:wrap}" +
      "#tnList .tnitem{display:flex;align-items:center;gap:10px;padding:9px 10px;border-radius:12px;" +
      "border:1px solid var(--r-line,rgba(140,160,255,.16));background:rgba(255,255,255,.03);margin-top:7px}" +
      "#tnList .tic{font-size:19px}" +
      "#tnList .grow{min-width:0;flex:1 1 auto}" +
      "#tnList b{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}";
    document.head.appendChild(s);
  }

  function clearForm() {
    ["tnTitle", "tnCat", "tnIcon", "tnBody"].forEach(function (i) { var x = el(i); if (x) x.value = ""; });
  }

  function publish() {
    if (!canNews()) return R.toast("دسترسی اخبار نداری 🔒", "err");
    var t = R.clean(el("tnTitle") ? el("tnTitle").value : "", 120);
    if (t.length < 3) return R.toast("تیتر خبر را بنویس", "err");
    var b = el("tnGo");
    if (b) { b.disabled = true; b.textContent = "در حال انتشار…"; }
    R.add("news", {
      title: t,
      body: R.clean(el("tnBody") ? el("tnBody").value : "", 3000),
      cat: R.clean(el("tnCat") ? el("tnCat").value : "", 30) || "عمومی",
      icon: R.clean(el("tnIcon") ? el("tnIcon").value : "", 4) || "📰",
      by: R.ME, views: 0
    }).then(function () {
      R.toast("خبر منتشر شد ✅", "ok");
      clearForm();
    }).catch(function (e) {
      R.toast("منتشر نشد: " + e.message, "err");
    }).then(function () {
      if (b) { b.disabled = false; b.textContent = "🚀 انتشار خبر"; }
    });
  }

  function panel() {
    if (!window.R || !el("sec-team") || el("tnCard")) return;
    if (!canNews()) return;                       /* بدون دسترسی: هیچی ساخته نمیشود */
    css();
    var d = document.createElement("div");
    d.innerHTML =
      '<div class="card mb" id="tnCard">' +
        '<div class="between"><span class="sm b">📰 انتشار خبر تیم</span>' +
        '<span class="chip gd">' + (R.isOwner() ? "👑 مالک" : "🛡 مجاز") + "</span></div>" +
        '<div class="xs mut mt mb">خبری که اینجا منتشر کنی، فوراً در بخش «📰 اخبار» سایت برای همه دیده میشود.</div>' +
        '<input class="inp mb" id="tnTitle" placeholder="تیتر خبر" maxlength="120">' +
        '<div class="grid g2 mb">' +
          '<input class="inp" id="tnCat" placeholder="دسته (انیمه، صنعت…)" maxlength="30">' +
          '<input class="inp" id="tnIcon" placeholder="ایموجی 📰" maxlength="4">' +
        "</div>" +
        '<textarea class="area" id="tnBody" placeholder="متن خبر" maxlength="3000"></textarea>' +
        '<div class="tnrow mt">' +
          '<button class="btn p mini" id="tnGo" type="button">🚀 انتشار خبر</button>' +
          '<button class="btn mini" id="tnClear" type="button">پاک کردن فرم</button>' +
        "</div>" +
        '<div class="sm b mt mb">آخرین خبرهای منتشرشده</div>' +
        '<div id="tnList"></div>' +
      "</div>";
    var tabs = el("teamTabs");
    if (tabs && tabs.parentNode) tabs.parentNode.insertBefore(d.firstChild, tabs.nextSibling);
    else el("sec-team").appendChild(d.firstChild);
    watch();
  }

  /* لیست آخرین خبرها (+ حذف برای مالک) */
  function watch() {
    if (!window.R || !R.db || R._tnW) return;
    R._tnW = true;
    R.db.ref("news").orderByChild("t").limitToLast(8).on("value", function (s) {
      var all = s.val() || {}, arr = [];
      Object.keys(all).forEach(function (k) { var n = all[k] || {}; n.id = k; arr.push(n); });
      arr.sort(function (a, b) { return (b.t || 0) - (a.t || 0); });
      var box = el("tnList");
      if (!box) return;
      box.innerHTML = arr.length ? arr.map(function (n) {
        return '<div class="tnitem"><span class="tic">' + R.esc(n.icon || "📰") + "</span>" +
          '<div class="grow"><b class="sm">' + R.esc(n.title || "") + "</b>" +
          '<span class="xs mut">' + R.esc(n.cat || "خبر") + " • " + R.time(n.t) + "</span></div>" +
          (R.isOwner() ? '<button class="btn mini d" data-tndel="' + n.id + '" type="button">🗑</button>' : "") +
          "</div>";
      }).join("") : '<div class="empty">هنوز خبری منتشر نشده 📰</div>';
    }, function () {});
  }

  /* کلیکها */
  document.addEventListener("click", function (e) {
    var t = e.target && e.target.closest ? e.target : null;
    if (!t || !t.closest) return;
    if (t.closest("#tnGo")) { e.preventDefault(); return publish(); }
    if (t.closest("#tnClear")) { e.preventDefault(); return clearForm(); }
    var del = t.closest("[data-tndel]");
    if (del) {
      e.preventDefault();
      if (!R.isOwner()) return R.toast("حذف خبر فقط مالک 👑", "err");
      if (!window.confirm("این خبر حذف شود؟")) return;
      R.db.ref("news/" + del.getAttribute("data-tndel")).remove()
        .then(function () { R.toast("حذف شد 🗑", "ok"); })
        .catch(function (er) { R.toast("حذف نشد: " + er.message, "err"); });
    }
  });

  /* راهاندازی */
  function boot() { panel(); watch(); }
  var prev = R.onLogin;
  R.onLogin = function () { if (prev) { try { prev(); } catch (e) {} } setTimeout(boot, 600); };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  setTimeout(boot, 1500);
  setTimeout(boot, 3200);
})();
