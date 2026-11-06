/* ═══ RONIN STORE — APP ICON v5 · پنل مالک + لینک + منیفست ═══ */
"use strict";
(function () {
 var REPO = "Ronin-Store001/ronin-store001.github.io", BRANCH = "main", TK = "ronin_gh_tok";
  var API = "https://api.github.com/repos/" + REPO + "/contents/";
  var FILES = [
    { p: "icon-192.png", s: 192 },
    { p: "icon-512.png", s: 512 },
    { p: "apple-touch-icon.png", s: 180 }
  ];
  function el(i) { return document.getElementById(i); }
  function tok() { try { return localStorage.getItem(TK) || ""; } catch (e) { return ""; } }
  function setTok(v) { try { v ? localStorage.setItem(TK, v) : localStorage.removeItem(TK); } catch (e) {} }

  /* آیکن اختصاصی که مالک از تنظیمات انتخاب کرده */
  function customIcon() {
    var b = (window.R && R.brand) || {};
    return (typeof b.appIcon === "string" && b.appIcon) ? b.appIcon : "";
  }
  /* نشان دادن فوری آیکن روی تب مرورگر و «افزودن به صفحه اصلی» iOS */
  function applyLive(u) {
    if (!u) return;
    var old = document.head.querySelectorAll("link[rel='icon']");
    for (var i = 0; i < old.length; i++) document.head.removeChild(old[i]);
    var ic = document.createElement("link");
    ic.rel = "icon"; ic.href = u;
    document.head.appendChild(ic);
    var a = document.head.querySelector("link[rel='apple-touch-icon']");
    if (!a) {
      a = document.createElement("link");
      a.rel = "apple-touch-icon";
      document.head.appendChild(a);
    }
    a.href = u;
    rebuildManifest(u);
  }

  /* منیفست را با آیکن دلخواه بازنویسی کن (برای نصب تازه) */
  /* هر جا اسم منیفست مخزن متفاوت باشد هم کار می‌کند، و اگر هیچ‌کدام نبود خودش می‌سازد */
  var MANIFESTS = ["manifest.webmanifest", "manifest.json", "site.webmanifest"];
  function rebuildManifest(u) {
    try {
      var type = u.indexOf("data:image/svg") === 0 ? "image/svg+xml"
        : (u.indexOf("data:image/webp") === 0 ? "image/webp" : "image/png");
      var base = {
        name: "Ronin Store", short_name: "Ronin", start_url: "./", scope: "./",
        display: "standalone", background_color: "#0a0e22", theme_color: "#0a0e22"
      };
      function write(m) {
        m.icons = [
          { src: u, sizes: "192x192", type: type, purpose: "any" },
          { src: u, sizes: "512x512", type: type, purpose: "any" }
        ];
        var l = document.head.querySelector("link[rel='manifest']");
        if (!l) { l = document.createElement("link"); l.rel = "manifest"; document.head.appendChild(l); }
        var url = URL.createObjectURL(new Blob([JSON.stringify(m)], { type: "application/manifest+json" }));
        if (l.__aiBlob) { try { URL.revokeObjectURL(l.__aiBlob); } catch (e) {} }
        l.__aiBlob = url;
        l.href = url;
      }
      var i = 0;
      (function nxt() {
        if (i >= MANIFESTS.length) return write(base);
        fetch(MANIFESTS[i++] + "?v=" + Date.now(), { cache: "no-store" }).then(function (r) {
          if (!r.ok) throw 0;
          return r.json();
        }).then(function (m) {
          if (!m || typeof m !== "object" || m instanceof Array) throw 0;
          write(Object.assign(base, m));
        }).catch(nxt);
      })();
    } catch (e) {}
  }
  function refresh() {
    var pv = el("apicoPrev");
    if (!pv) return;
    var u = customIcon();
    if (u) { pv.src = u; return; }
    png(192, function (b) { if (b) pv.src = URL.createObjectURL(b); });
  }

  function logoSrc() {
    if (customIcon()) return customIcon();
    var b = (window.R && R.brand) || {};
    if (b.logo) return String(b.logo);
    var mk = document.querySelector("#top .brandmark");
    if (mk) {
      var im = mk.querySelector("img");
      if (im && im.src) return im.src;
      var tx = (mk.textContent || "").trim();
      if (tx) return tx;
    }
    return "忍";
  }
  function drawable(cb) {
    var lg = logoSrc();
    if (lg.indexOf("data:image") === 0) return cb(lg);
    var svg = lg.trim().indexOf("<svg") === 0 ? lg
      : '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#0a0e22"/><text x="32" y="45" text-anchor="middle" font-size="34" fill="#8fdcff">' + lg + "</text></svg>";
    cb("data:image/svg+xml," + encodeURIComponent(svg));
  }
  function png(size, cb) {
    drawable(function (u) {
      var im = new Image();
      im.onload = function () {
        try {
          var c = document.createElement("canvas");
          c.width = c.height = size;
          var x = c.getContext("2d");
          x.imageSmoothingQuality = "high";
          x.drawImage(im, 0, 0, size, size);
          c.toBlob(function (b) { cb(b); }, "image/png");
        } catch (e) { cb(null); }
      };
      im.onerror = function () { cb(null); };
      im.src = u;
    });
  }
  function b64(blob, cb) {
    var fr = new FileReader();
    fr.onload = function () { cb(String(fr.result).split(",")[1] || ""); };
    fr.readAsDataURL(blob);
  }
  function gh(url, opts) {
    opts = opts || {};
    opts.headers = Object.assign({
      "Authorization": "Bearer " + tok(),
      "Accept": "application/vnd.github+json"
    }, opts.headers || {});
    return fetch(url, opts).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) {
        return { ok: r.ok, status: r.status, body: j };
      });
    });
  }
  /* یک آپلود */
  function putOnce(path, content) {
    return gh(API + path + "?ref=" + BRANCH, { method: "GET" }).then(function (g) {
      var body = { message: "chore(icon): " + path + " از پنل مالک", content: content, branch: BRANCH };
      if (g.ok && g.body && g.body.sha) body.sha = g.body.sha;
      return gh(API + path, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
    }).then(function (r) {
      if (r.ok) return true;
      if (r.status === 401) throw new Error("توکن نامعتبر/منقضی (۴۰۱)");
      if (r.status === 403) throw new Error("دسترسی کافی نیست (۴۰۳)");
      if (r.status === 409) throw new Error("RETRY");
      if (r.status === 413 || r.status === 422) throw new Error("فایل بزرگ/نامعتبر (" + r.status + ")");
      throw new Error("خطای گیت‌هاب " + r.status);
    });
  }
  /* با ۳ تلاش */
  function put(path, content, n) {
    n = n || 3;
    return putOnce(path, content).catch(function (e) {
      if (n > 1) {
        var wait = e && e.message === "RETRY" ? 800 : 1600 * (4 - n);
        return new Promise(function (res) { setTimeout(res, wait); })
          .then(function () { return put(path, content, n - 1); });
      }
      throw e;
    });
  }

  /* ذخیره عکس آیکن در تنظیمات سایت (بدون نیاز به توکن) */
  function saveIcon(file) {
    if (!file || !file.type || file.type.indexOf("image/") !== 0) return R.toast("فقط عکس 🖼", "err");
    if (file.size > 10 * 1024 * 1024) return R.toast("عکس بزرگ‌تر از ۱۰ مگه ❌", "err");
    if (!R.db) return R.toast("دیتابیس آماده نیست ⏳", "err");
    var fr = new FileReader();
    fr.onload = function () {
      var im = new Image();
      im.onload = function () {
        try {
          var S = 512, c = document.createElement("canvas");
          c.width = c.height = S;
          var x = c.getContext("2d");
          x.imageSmoothingQuality = "high";
          var m = Math.min(im.width, im.height);
          x.drawImage(im, (im.width - m) / 2, (im.height - m) / 2, m, m, 0, 0, S, S);
          var u = c.toDataURL("image/png");
          if (u.length > 700000) u = c.toDataURL("image/webp", 0.85);
          R.brand = R.brand || {};
          R.brand.appIcon = u;
          R.db.ref("settings/brand").update({ appIcon: u }).then(function () {
            applyLive(u); refresh();
            line("✅ آیکن ذخیره شد · ~" + Math.round(u.length / 1365) + "KB", "b");
            R.toast("آیکن ذخیره شد ✅ — شورتکات را پاک کن و دوباره نصب کن", "ok");
          }).catch(function (e) { R.toast("ذخیره نشد: " + ((e && e.message) || "خطا"), "err"); });
        } catch (e) { R.toast("پردازش نشد ❌", "err"); }
      };
      im.onerror = function () { R.toast("عکس خوانده نشد ❌", "err"); };
      im.src = fr.result;
    };
    fr.readAsDataURL(file);
  }

  function resetIcon() {
    if (!R.db) return R.toast("دیتابیس آماده نیست ⏳", "err");
    R.db.ref("settings/brand/appIcon").remove().then(function () {
      if (R.brand) delete R.brand.appIcon;
      if (R.applyBrand) R.applyBrand(R.brand || {});
      refresh();
      line("↩️ آیکن به لوگوی سایت برگشت", "mut");
      R.toast("آیکن به لوگوی سایت برگشت ↩️", "ok");
    }).catch(function (e) { R.toast("نشد: " + ((e && e.message) || "خطا"), "err"); });
  }

  /* لینک عکس آیکن (https://…) — بدون آپلود فایل */
  function saveUrl(v) {
    v = String(v || "").trim();
    if (!v) return R.toast("لینک خالی است 🖼", "err");
    if (!/^https?:\/\//i.test(v) && v.indexOf("data:image") !== 0) return R.toast("لینک معتبر نیست ❌", "err");
    if (!R.db) return R.toast("دیتابیس آماده نیست ⏳", "err");
    R.brand = R.brand || {};
    R.brand.appIcon = v;
    R.db.ref("settings/brand").update({ appIcon: v }).then(function () {
      applyLive(v); refresh();
      line("✅ لینک آیکن ذخیره شد", "b");
      R.toast("آیکن ذخیره شد ✅ — شورتکات را حذف و دوباره نصب کن", "ok");
    }).catch(function (e) { R.toast("ذخیره نشد: " + ((e && e.message) || "خطا"), "err"); });
  }

  /* آیکن ذخیره‌شده را برای همه‌ی بازدیدکننده‌ها اعمال کن */
  function watchBrand() {
    if (!window.R || !R.db || R._aiw) return;
    R._aiw = true;
    R.db.ref("settings/brand").on("value", function (sn) {
      R.brand = sn.val() || R.brand || {};
      var u = customIcon();
      if (u) applyLive(u);
      else if (R.applyBrand) R.applyBrand(R.brand);
      refresh();
    }, function () {});
  }

  function line(t, cls) {
    var box = el("apicoList");
    if (!box) return;
    var d = document.createElement("div");
    d.className = "xs mt" + (cls ? " " + cls : "");
    d.textContent = t;
    box.appendChild(d);
    box.scrollTop = box.scrollHeight;
  }
  function clearList() { var b = el("apicoList"); if (b) b.innerHTML = ""; }

  function test() {
    if (!tok()) return R.toast("اول توکن را بگذار 🔑", "err");
    line("🔍 بررسی توکن…");
    gh("https://api.github.com/repos/" + REPO).then(function (r) {
      if (r.ok) { line("✅ اتصال گیت‌هاب درست است", "b"); R.toast("اتصال درست است ✅", "ok"); }
      else if (r.status === 401) { line("❌ توکن نامعتبر (۴۰۱)", "bad"); R.toast("توکن نامعتبر ❌", "err"); }
      else { line("❌ خطا " + r.status, "bad"); R.toast("خطا " + r.status, "err"); }
    }).catch(function () { line("❌ اتصال برقرار نشد 📡", "bad"); R.toast("اتصال برقرار نشد 📡", "err"); });
  }

  function run() {
    if (!tok()) return R.toast("اول توکن گیت‌هاب را بگذار 🔑", "err");
    if (navigator.onLine === false) return R.toast("اینترنت وصل نیست 📡", "err");
    clearList();
    var i = 0, fail = 0;
    (function next() {
      if (i >= FILES.length) {
        if (fail) {
          line("⚠ " + fail + " فایل نشد — دوباره 🚀 را بزن (فقط همان‌ها دوباره تلاش می‌شوند)", "bad");
          R.toast(fail + " فایل نشد — دوباره بزن", "err");
        } else {
          line("✅ تمام شد — حدود ۱ دقیقه بعد سایت آپدیت می‌شود", "b");
          R.toast("آیکن‌های اپ آپلود شد ✅", "ok");
        }
        return;
      }
      var f = FILES[i++];
      line("⏳ " + f.p + " …");
      png(f.s, function (b) {
        if (!b) { fail++; line("❌ " + f.p + " — ساخته نشد", "bad"); return next(); }
        b64(b, function (data) {
          var kb = Math.round(data.length / 1365);
          put(f.p, data).then(function () {
            line("✅ " + f.p + " · ~" + kb + "KB");
          }).catch(function (e) {
            fail++;
            line("❌ " + f.p + " · " + ((e && e.message) || "خطای شبکه") + " · ~" + kb + "KB", "bad");
          }).then(next);
        });
      });
    })();
  }

  function save(size, name) {
    png(size, function (b) {
      if (!b) return;
      var a = document.createElement("a");
      a.href = URL.createObjectURL(b);
      a.download = name;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 9000);
      R.toast("⬇ " + name + " ذخیره شد", "ok");
    });
  }

  function card() {
    if (!window.R || !R.isOwner || !R.isOwner()) return;
    var sec = el("apicoHost") || el("sec-settings");
    if (!sec || el("apicoCard")) return;
    if (!el("apicoCss")) {
      var st = document.createElement("style"); st.id = "apicoCss";
      st.textContent =
        ".apico{display:flex;align-items:center;gap:12px;flex-wrap:wrap}" +
        ".apico img{width:72px;height:72px;border-radius:18px;object-fit:cover;" +
        "border:1px solid rgba(140,150,230,.35);background:rgba(10,14,34,.7)}" +
        "#apicoList{max-height:190px;overflow:auto}";
      document.head.appendChild(st);
    }
    var d = document.createElement("div");
    d.innerHTML =
      '<div class="card mb" id="apicoCard">' +
        '<div class="between"><span class="sm b">📱 آیکون اپلیکیشن — آپدیت خودکار</span>' +
        '<span class="chip gd">👑 فقط مالک</span></div>' +
        '<div class="xs mut mt mb">عکسی که می‌خواهی روی آیکن شورتکات/اپ باشد را انتخاب کن (مربعی بریده می‌شود). ذخیره‌اش در تنظیمات سایت است و فوری روی تب مرورگر و «افزودن به صفحه اصلی» می‌نشیند.</div>' +
        '<div class="apico mb"><img id="apicoPrev" alt="پیش‌نمایش">' +
          '<div class="col" style="gap:7px">' +
            '<label class="btn p mini" style="display:inline-block;cursor:pointer;text-align:center">🖼 عکس آیکن از گالری' +
              '<input id="apicoFile" type="file" accept="image/*" hidden></label>' +
            '<button class="btn mini" data-apic="reset" type="button">↩️ بازگشت به لوگوی سایت</button>' +
            '<button class="btn mini" data-apic="go" type="button">🚀 آپلود روی گیت‌هاب</button>' +
            '<button class="btn mini" data-apic="test" type="button">🔍 تست توکن</button>' +
          "</div></div>" +
        '<div class="field"><label class="lbl">یا لینک عکس آیکن</label>' +
        '<input class="inp" id="apicoUrl" dir="ltr" placeholder="https://…/icon.png">' +
        '<button class="btn mini p mt" data-apic="url" type="button">💾 ذخیره لینک</button></div>' +
        '<div class="xs mut mb">آیکن شورتکات نصب‌شده فقط بعد از حذف و نصب دوباره عوض می‌شود (اندروید: حذف شورتکات → نصب مجدد · iOS: Remove از صفحه اصلی و دوباره Add). برای اینکه آیکن روی گیت‌هاب هم عوض شود، فایل‌ها را با 🚀 آپلود کن.</div>' +
        '<div class="field"><label class="lbl">توکن گیت‌هاب (Fine-grained · Contents: Read and write)</label>' +
        '<input class="inp" id="apicoTok" type="password" dir="ltr" placeholder="github_pat_..."></div>' +
        '<div class="row w" style="gap:7px">' +
          '<button class="btn mini" data-apic="save" type="button">💾 ذخیره توکن</button>' +
          '<button class="btn mini d" data-apic="clear" type="button">🗑 پاک کردن</button>' +
        "</div>" +
        '<div class="sm b mt mb">وضعیت:</div><div id="apicoList"></div>' +
        '<div class="xs mut mt mb">اگر خودکار نشد، دستی هم می‌شود:</div>' +
        '<div class="row w" style="gap:7px">' +
          '<button class="btn mini" data-apic="192" type="button">⬇ icon-192.png</button>' +
          '<button class="btn mini" data-apic="512" type="button">⬇ icon-512.png</button>' +
          '<button class="btn mini" data-apic="180" type="button">⬇ apple-touch-icon.png</button>' +
        "</div>" +
      "</div>";
    sec.appendChild(d.firstChild);
    refresh();
    var fi = el("apicoFile");
    if (fi) fi.addEventListener("change", function (e) {
      saveIcon(e.target.files && e.target.files[0]);
      e.target.value = "";
    });
    line(customIcon() ? "🖼 آیکن اختصاصی ذخیره شده ✅" : "🖼 آیکن فعلی = لوگوی سایت",
      customIcon() ? "b" : "mut");
    line(tok() ? "🔑 توکن ذخیره شده — آماده ✅" : "🔑 هنوز توکنی ثبت نشده", "mut");
  }

  document.addEventListener("click", function (e) {
    var t = e.target && e.target.closest ? e.target.closest("[data-apic]") : null;
    if (!t) return;
    e.preventDefault();
    if (!window.R || !R.isOwner || !R.isOwner()) return R.toast("فقط مالک سایت 👑", "err");
    var a = t.getAttribute("data-apic");
    if (a === "save") {
      var v = el("apicoTok");
      setTok(((v && v.value) || "").trim());
      if (v) v.value = "";
      clearList();
      line(tok() ? "🔑 توکن ذخیره شد ✅" : "🔑 توکن ثبت نشد", tok() ? "b" : "bad");
      R.toast(tok() ? "توکن ذخیره شد ✅" : "توکن ثبت نشد", "ok");
      return;
    }
    if (a === "clear") { setTok(""); clearList(); line("🗑 توکن پاک شد", "mut"); R.toast("توکن پاک شد", "ok"); return; }
    if (a === "reset") return resetIcon();
    if (a === "test") return test();
    if (a === "url") return saveUrl((el("apicoUrl") || {}).value);
    if (a === "go") return run();
    if (a === "512") return save(512, "icon-512.png");
    if (a === "180") return save(180, "apple-touch-icon.png");
    return save(192, "icon-192.png");
  });

  /* در پنل مالک هم سوار شود (تب تنظیمات دوباره رندر می‌شود) */
  var hostT = 0;
  function watchPanel() {
    try {
      var h = el("ownerBody");
      if (!h || h.__aiObs) return;
      h.__aiObs = 1;
      new MutationObserver(function () {
        clearTimeout(hostT);
        hostT = setTimeout(card, 120);
      }).observe(h, { childList: true });
    } catch (e) {}
  }

  R.appIcon = {
    apply: applyLive, manifest: rebuildManifest, setUrl: saveUrl,
    reset: resetIcon, refresh: refresh, saveFile: saveIcon, current: customIcon
  };

  var prev = R.onLogin;
  R.onLogin = function () { if (prev) { try { prev(); } catch (e) {} } setTimeout(function () { card(); watchBrand(); watchPanel(); }, 700); };
  function boot() { card(); watchBrand(); watchPanel(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  setTimeout(function () { card(); watchBrand(); watchPanel(); }, 2600);
})();
