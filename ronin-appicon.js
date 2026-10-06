/* ═══ RONIN STORE — APP ICON v3 · رونین: تلاش دوباره + ادامه دادن ═══ */
"use strict";
(function () {
  var REPO = "mohammadislam2367/Ronin", BRANCH = "main", TK = "ronin_gh_tok";
  var API = "https://api.github.com/repos/" + REPO + "/contents/";
  var FILES = [
    { p: "icon-192.png", s: 192 },
    { p: "icon-512.png", s: 512 },
    { p: "apple-touch-icon.png", s: 180 }
  ];
  function el(i) { return document.getElementById(i); }
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
    var sec = el("sec-settings");
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
        '<div class="xs mut mt mb">از لوگوی فعلی سایت سه آیکن ساخته و در گیت‌هاب کامیت می‌شود.</div>' +
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
        '<div class="sm b mt mb">وضعیت:</div><div id="apicoList"></div>' +
        '<div class="xs mut mt mb">اگر خودکار نشد، دستی هم می‌شود:</div>' +
        '<div class="row w" style="gap:7px">' +
          '<button class="btn mini" data-apic="192" type="button">⬇ icon-192.png</button>' +
          '<button class="btn mini" data-apic="512" type="button">⬇ icon-512.png</button>' +
          '<button class="btn mini" data-apic="180" type="button">⬇ apple-touch-icon.png</button>' +
        "</div>" +
      "</div>";
    sec.appendChild(d.firstChild);
    var pv = el("apicoPrev");
    if (pv) png(192, function (b) { if (b) pv.src = URL.createObjectURL(b); });
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
