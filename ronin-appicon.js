/* ═══ RONIN STORE — APP ICON · AUTO · ronin-appicon.js ═══
   مالک عکس را انتخاب می‌کند → سه PNG ساخته می‌شود →
   همین فایل آن‌ها را در GitHub کامیت می‌کند. توکن فقط در مرورگر مالک. */
"use strict";
(function () {
  var REPO = "mohammadislam2367/Ronin", BRANCH = "main", TK = "ronin_gh_tok";
  var API = "https://api.github.com/repos/" + REPO + "/contents/";
  var FILES = [
    { p: "icon-192.png", s: 192 },
    { p: "icon-512.png", s: 512 },
    { p: "apple-touch-icon.png", s: 180 }
  ];
  function el(id) { return document.getElementById(id); }
  function tok() { try { return localStorage.getItem(TK) || ""; } catch (e) { return ""; } }
  function setTok(v) { try { v ? localStorage.setItem(TK, v) : localStorage.removeItem(TK); } catch (e) {} }

  function logoSrc() {
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
      : '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">' +
        '<rect width="64" height="64" rx="12" fill="#0a0e22"/>' +
        '<text x="32" y="45" text-anchor="middle" font-size="34" fill="#8fdcff">' + lg + "</text></svg>";
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
  function put(path, content, msg) {
    return gh(API + path + "?ref=" + BRANCH, { method: "GET" }).then(function (g) {
      var body = { message: msg, content: content, branch: BRANCH };
      if (g.ok && g.body && g.body.sha) body.sha = g.body.sha;
      return gh(API + path, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
    }).then(function (r) {
      if (r.ok) return true;
      if (r.status === 401) throw new Error("توکن نامعتبر یا منقضی شده (۴۰۱)");
      if (r.status === 403) throw new Error("دسترسی کافی نیست — Contents: write لازم است (۴۰۳)");
      if (r.status === 409) throw new Error("تضاد نسخه — یک بار دیگر بزن (۴۰۹)");
      if (r.status === 422) throw new Error("درخواست نامعتبر (۴۲۲)");
      throw new Error("خطای گیت‌هاب " + r.status + (r.body && r.body.message ? " — " + r.body.message : ""));
    });
  }
  function say(t) { var s = el("apicoState"); if (s) s.textContent = t; }
  function paint() {
    var s = el("apicoState");
    if (s && !s.textContent) s.textContent = tok() ? "🔑 توکن ذخیره شده — آماده ✅" : "🔑 هنوز توکنی ثبت نشده";
  }
  function test() {
    if (!tok()) return R.toast("اول توکن را بگذار 🔑", "err");
    R.toast("در حال بررسی…", "ok");
    gh("https://api.github.com/repos/" + REPO).then(function (r) {
      if (r.ok) R.toast("اتصال گیت‌هاب درست است ✅", "ok");
      else if (r.status === 401) R.toast("توکن نامعتبر است (۴۰۱) ❌", "err");
      else R.toast("خطا " + r.status, "err");
    }).catch(function () { R.toast("اتصال برقرار نشد 📡", "err"); });
  }
  function run() {
    if (!tok()) return R.toast("اول توکن گیت‌هاب را بگذار 🔑", "err");
    var i = 0;
    (function next() {
      if (i >= FILES.length) {
        say("✅ هر ۳ آیکن کامیت شد — حدود ۱ دقیقه بعد سایت آپدیت می‌شود.");
        R.toast("آیکن‌های اپ آپلود شد ✅", "ok");
        return;
      }
      var f = FILES[i++];
      say("ساخت " + f.p + " …");
      png(f.s, function (b) {
        if (!b) { say("❌ ساخت " + f.p + " ناموفق شد"); return; }
        b64(b, function (data) {
          say("آپلود " + f.p + " …");
          put(f.p, data, "chore(icon): " + f.p + " از پنل مالک")
            .then(next)
            .catch(function (e) { say("❌ " + e.message); R.toast(e.message, "err"); });
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
    var sec = el("sec-settings");
    if (!sec || el("apicoCard")) return;
    if (!el("apicoCss")) {
      var st = document.createElement("style"); st.id = "apicoCss";
      st.textContent =
        ".apico{display:flex;align-items:center;gap:12px;flex-wrap:wrap}" +
        ".apico img{width:72px;height:72px;border-radius:18px;object-fit:cover;" +
        "border:1px solid rgba(140,150,230,.35);background:rgba(10,14,34,.7)}";
      document.head.appendChild(st);
    }
    var d = document.createElement("div");
    d.innerHTML =
      '<div class="card mb" id="apicoCard">' +
        '<div class="between"><span class="sm b">📱 آیکون اپلیکیشن — آپدیت خودکار</span>' +
        '<span class="chip gd">👑 فقط مالک</span></div>' +
        '<div class="xs mut mt mb">از لوگوی فعلی سایت سه آیکن ساخته و <b>خودکار</b> در گیت‌هاب کامیت می‌شود. ' +
        'حدود ۱ دقیقه بعد آیکن اپ نصب‌شده و آیکن تب عوض می‌شود.</div>' +
        '<div class="apico mb"><img id="apicoPrev" alt="پیش‌نمایش">' +
          '<div class="col" style="gap:7px">' +
            '<button class="btn p mini" data-apic="go" type="button">🚀 ساخت و آپلود خودکار</button>' +
            '<button class="btn mini" data-apic="test" type="button">🔍 تست توکن</button>' +
          "</div></div>" +
        '<div class="field"><label class="lbl">توکن گیت‌هاب (Fine-grained · Contents: Read and write)</label>' +
        '<input class="inp" id="apicoTok" type="password" dir="ltr" placeholder="github_pat_..."></div>' +
        '<div class="row w" style="gap:7px">' +
          '<button class="btn mini" data-apic="save" type="button">💾 ذخیره توکن</button>' +
          '<button class="btn mini d" data-apic="clear" type="button">🗑 پاک کردن</button>' +
        "</div>" +
        '<div class="xs mut mt">توکن فقط در همین مرورگر ذخیره می‌شود و در دیتابیس نمی‌رود.</div>' +
        '<div class="sm b mt" id="apicoState"></div>' +
        '<div class="sm b mt mb">اگر خواستی دستی هم بگذاری:</div>' +
        '<div class="row w" style="gap:7px">' +
          '<button class="btn mini" data-apic="192" type="button">⬇ icon-192.png</button>' +
          '<button class="btn mini" data-apic="512" type="button">⬇ icon-512.png</button>' +
          '<button class="btn mini" data-apic="180" type="button">⬇ apple-touch-icon.png</button>' +
        "</div>" +
      "</div>";
    sec.appendChild(d.firstChild);
    var pv = el("apicoPrev");
    if (pv) png(192, function (b) { if (b) pv.src = URL.createObjectURL(b); });
    paint();
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
      say(""); paint();
      R.toast(tok() ? "توکن ذخیره شد ✅" : "توکن ثبت نشد", "ok");
      return;
    }
    if (a === "clear") { setTok(""); say(""); paint(); R.toast("توکن پاک شد", "ok"); return; }
    if (a === "test") return test();
    if (a === "go") return run();
    if (a === "512") return save(512, "icon-512.png");
    if (a === "180") return save(180, "apple-touch-icon.png");
    return save(192, "icon-192.png");
  });
  var prev = R.onLogin;
  R.onLogin = function () { if (prev) { try { prev(); } catch (e) {} } setTimeout(card, 700); };
  function boot() { card(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  setTimeout(card, 2600);
})();
