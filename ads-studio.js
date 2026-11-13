/* RONIN ADS STUDIO — ads-studio.js
   • تب‌بندی صفحهٔ ثبت آگهی: آگهی‌ها / کمپین ویدیویی
   • ساخت کمپین با آپلود ویدیو (Firebase Storage) یا لینک MP4
   • آپلود پوستر، پیش‌نمایش پخش، روشن/خاموش، ویرایش و حذف کمپین
   • ذخیره در ads/campaigns تا در خانه و صفحهٔ فیلم پخش شود */
"use strict";
(function () {
  if (window.__adsStudio) return;
  window.__adsStudio = true;

  var CSS = [
    "#adsStudio{margin-bottom:12px}",
    ".as-tabs{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px}",
    ".as-tab{border:1px solid rgba(140,160,255,.18);background:rgba(11,15,34,.7);color:#eef1ff;font:inherit;font-size:11.5px;font-weight:900;padding:8px 13px;border-radius:11px;cursor:pointer;transition:.16s}",
    ".as-tab:hover{border-color:rgba(124,92,255,.45)}",
    ".as-tab.on{background:linear-gradient(135deg,#7c5cff,#22d3ee);color:#08030f;border-color:transparent}",
    ".as-panel[hidden]{display:none}",
    ".as-grid{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,.9fr);gap:12px;align-items:start}",
    ".as-card{border:1px solid rgba(140,160,255,.16);border-radius:16px;background:rgba(14,18,40,.72);padding:12px}",
    ".as-card h4{margin:0 0 8px;font-size:12px;font-weight:900}",
    ".as-f{display:flex;flex-direction:column;gap:4px;font-size:10.5px;color:#9aa6cc;margin-bottom:8px}",
    ".as-f input,.as-f select,.as-f textarea{width:100%;padding:9px 11px;border-radius:11px;font:inherit;font-size:12px;border:1px solid rgba(140,160,255,.18);background:rgba(6,9,22,.78);color:#eef1ff}",
    ".as-f input:focus,.as-f textarea:focus{outline:none;border-color:rgba(124,92,255,.6);box-shadow:0 0 0 3px rgba(124,92,255,.16)}",
    ".as-row{display:flex;gap:7px;flex-wrap:wrap}",
    ".as-media{display:grid;grid-template-columns:132px minmax(0,1fr);gap:10px;align-items:start;border:1px dashed rgba(124,92,255,.4);border-radius:13px;padding:9px;background:rgba(124,92,255,.06);margin-bottom:9px}",
    ".as-prev{position:relative;border-radius:10px;overflow:hidden;background:#04060f;aspect-ratio:16/10;display:grid;place-items:center;font-size:22px}",
    ".as-prev video,.as-prev img{width:100%;height:100%;object-fit:cover;display:block}",
    ".as-file{font-size:10px;color:#9aa6cc;width:100%}",
    ".as-prog{height:6px;border-radius:99px;background:rgba(255,255,255,.14);overflow:hidden;display:none;margin-top:6px}",
    ".as-prog.on{display:block}",
    ".as-prog i{display:block;height:100%;width:0;background:linear-gradient(90deg,#7c5cff,#22d3ee);transition:width .2s}",
    ".as-list{display:flex;flex-direction:column;gap:7px;max-height:420px;overflow-y:auto}",
    ".as-item{display:flex;gap:9px;align-items:center;border:1px solid rgba(140,160,255,.14);border-radius:13px;background:rgba(255,255,255,.03);padding:7px}",
    ".as-thumb{width:74px;flex:none;aspect-ratio:16/10;border-radius:9px;overflow:hidden;background:#04060f;display:grid;place-items:center;font-size:16px}",
    ".as-thumb video,.as-thumb img{width:100%;height:100%;object-fit:cover}",
    ".as-info{flex:1;min-width:0}",
    ".as-info b{display:block;font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
    ".as-info span{display:block;font-size:9px;color:#9aa6cc;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
    ".as-mini{border:1px solid rgba(140,160,255,.2);background:transparent;color:#dfe5ff;font:inherit;font-size:9.5px;font-weight:800;padding:5px 8px;border-radius:8px;cursor:pointer}",
    ".as-mini:hover{border-color:rgba(124,92,255,.55);background:rgba(124,92,255,.16)}",
    ".as-mini.d{border-color:rgba(255,107,129,.35);color:#ffb3bf}",
    ".as-mini.on{background:linear-gradient(135deg,#5df0b0,#22d3ee);color:#04231a;border-color:transparent}",
    ".as-empty{border:1px dashed rgba(140,160,255,.3);border-radius:13px;padding:16px;text-align:center;font-size:10.5px;color:#9aa6cc}",
    "@media (max-width:760px){.as-grid{grid-template-columns:1fr}.as-media{grid-template-columns:96px minmax(0,1fr)}}"
  ].join("");
  var st = document.createElement("style");
  st.id = "asCSS";
  st.textContent = CSS;
  (document.head || document.documentElement).appendChild(st);

  var R = window.R;
  function esc(s) { return R && R.esc ? R.esc(s) : String(s == null ? "" : s); }
  function toast(m, k) { if (R && R.toast) R.toast(m, k); }
  function owner() { return !!(R && R.isOwner && R.isOwner()); }
  function safeUrl(v) { v = String(v || "").trim(); return /^https?:\/\//i.test(v) ? v : ""; }
  function val(id) { var e = document.getElementById(id); return e ? e.value : ""; }
  function fileOf(id) { var e = document.getElementById(id); return (e && e.files && e.files[0]) || null; }

  var EDIT = null, VIDEO = "", POSTER = "", busy = false, BOUND = false;

  function storageReady(cb) {
    if (window.firebase && firebase.storage) {
      try { return cb(firebase.storage()); } catch (e) { return cb(null); }
    }
    var s = document.createElement("script");
    s.src = "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage-compat.js";
    s.onload = function () { try { cb(firebase.storage()); } catch (e) { cb(null); } };
    s.onerror = function () { cb(null); };
    document.head.appendChild(s);
  }

  function upload(file, kind, prog, done) {
    storageReady(function (storage) {
      if (!storage) return done(new Error("storage-off"));
      var name = "ads/" + kind + "/" + Date.now() + "-" + file.name.replace(/[^\w.\-]+/g, "_");
      var task = storage.ref(name).put(file, { contentType: file.type || undefined });
      if (prog) task.on("state_changed", function (s) {
        prog(Math.round((s.bytesTransferred / s.totalBytes) * 100));
      });
      task.then(function (snap) {
        snap.ref.getDownloadURL().then(function (u) { done(null, u); }).catch(function (e) { done(e); });
      }).catch(function (e) { done(e); });
    });
  }

  function build() {
    var sec = document.getElementById("sec-ads");
    if (!sec || document.getElementById("adsStudio")) return;
    var old = document.getElementById("vaOwnerPanel");
    if (old) old.remove();

    var studio = document.createElement("div");
    studio.id = "adsStudio";
    studio.innerHTML =
      '<div class="as-tabs" role="tablist">' +
        '<button class="as-tab on" type="button" data-as-tab="ads">📢 آگهی‌ها</button>' +
        '<button class="as-tab" type="button" data-as-tab="campaigns">🎬 کمپین ویدیویی</button>' +
      '</div>' +
      '<div class="as-panel" data-as-panel="ads" id="asPanelAds"></div>' +
      '<div class="as-panel" data-as-panel="campaigns" id="asPanelCamp" hidden></div>';
    sec.insertBefore(studio, sec.firstChild);

    var panelAds = document.getElementById("asPanelAds");
    Array.prototype.slice.call(sec.children).forEach(function (n) {
      if (n !== studio) panelAds.appendChild(n);
    });

    studio.querySelector(".as-tabs").addEventListener("click", function (e) {
      var b = e.target.closest("[data-as-tab]");
      if (!b) return;
      var k = b.getAttribute("data-as-tab");
      Array.prototype.forEach.call(studio.querySelectorAll("[data-as-tab]"), function (x) {
        x.classList.toggle("on", x === b);
      });
      Array.prototype.forEach.call(studio.querySelectorAll("[data-as-panel]"), function (p) {
        p.hidden = p.getAttribute("data-as-panel") !== k;
      });
      if (k === "campaigns") paintCampaigns();
    });

    buildCampaignPanel();
  }

  function buildCampaignPanel() {
    var panel = document.getElementById("asPanelCamp");
    if (!panel) return;
    if (!owner()) {
      panel.innerHTML = '<div class="as-empty">ساخت کمپین ویدیویی مخصوص مالک سایت است.<br>برای ثبت آگهی از تب «آگهی‌ها» استفاده کن.</div>';
      return;
    }
    panel.innerHTML =
      '<div class="as-grid">' +
        '<div class="as-card" id="asFormCard">' +
          '<h4 id="asFormTitle">🎬 کمپین ویدیویی تازه</h4>' +
          '<div class="as-media">' +
            '<div class="as-prev" id="asVidPrev">🎬</div>' +
            '<div>' +
              '<label class="as-f">ویدیو تبلیغ (MP4)<input class="as-file" id="asVidFile" type="file" accept="video/mp4,video/webm,video/*"></label>' +
              '<label class="as-f">یا لینک مستقیم ویدیو<input id="asVidUrl" dir="ltr" placeholder="https://…/ad.mp4"></label>' +
              '<div class="as-prog" id="asVidProg"><i></i></div>' +
            '</div>' +
          '</div>' +
          '<div class="as-media">' +
            '<div class="as-prev" id="asPosPrev">🖼</div>' +
            '<div>' +
              '<label class="as-f">پوستر (اختیاری)<input class="as-file" id="asPosFile" type="file" accept="image/*"></label>' +
              '<label class="as-f">یا لینک پوستر<input id="asPosUrl" dir="ltr" placeholder="https://…/ad.jpg"></label>' +
              '<div class="as-prog" id="asPosProg"><i></i></div>' +
            '</div>' +
          '</div>' +
          '<label class="as-f">عنوان کمپین<input id="asTitle" maxlength="40" placeholder="ELITE DROP"></label>' +
          '<label class="as-f">برند<input id="asBrand" maxlength="30" placeholder="RONIN STORE"></label>' +
          '<label class="as-f">متن کوتاه<textarea id="asCopy" rows="2" maxlength="140" placeholder="کالکشن محدود…"></textarea></label>' +
          '<div class="as-row">' +
            '<label class="as-f" style="flex:1 1 120px">متن دکمه<input id="asCta" maxlength="24" placeholder="مشاهده"></label>' +
            '<label class="as-f" style="flex:1 1 120px">صفحهٔ داخلی<select id="asTarget"><option value="market">بازار</option><option value="ads">ثبت آگهی</option><option value="community">انجمن</option><option value="discover">کاوش</option><option value="premium">پرمیوم</option><option value="videoads">تبلیغ ویدیویی</option></select></label>' +
          '</div>' +
          '<label class="as-f">لینک مقصد بیرونی (اختیاری)<input id="asUrl" dir="ltr" placeholder="https://…"></label>' +
          '<div class="as-row" style="margin-top:4px">' +
            '<button class="as-mini on" type="button" id="asSave" style="font-size:11px;padding:8px 14px">💾 ذخیرهٔ کمپین</button>' +
            '<button class="as-mini" type="button" id="asReset">فرم تازه</button>' +
          '</div>' +
          '<div class="as-empty" id="asHint" style="margin-top:8px;text-align:start">حجم ویدیو را زیر ۲۵ مگابایت نگه دار. اگر Storage فعال نباشد، لینک مستقیم MP4 بگذار.</div>' +
        '</div>' +
        '<div class="as-card">' +
          '<h4>کمپین‌های سایت <span id="asCount" style="font-weight:400;color:#9aa6cc;font-size:10px"></span></h4>' +
          '<div class="as-list" id="asList"><div class="as-empty">در حال خواندن…</div></div>' +
        '</div>' +
      '</div>';

    bindCampaignForm();
    paintCampaigns();
  }

  function bindCampaignForm() {
    if (BOUND) return;
    BOUND = true;
    var f = document.getElementById("asVidFile");
    var vurl = document.getElementById("asVidUrl");
    var pf = document.getElementById("asPosFile");
    var purl = document.getElementById("asPosUrl");

    if (vurl) vurl.addEventListener("change", function () {
      VIDEO = safeUrl(vurl.value);
      var vp = document.getElementById("asVidPrev");
      if (vp) vp.innerHTML = VIDEO ? '<video src="' + esc(VIDEO) + '" muted playsinline controls preload="metadata"></video>' : "🎬";
    });
    if (purl) purl.addEventListener("change", function () {
      POSTER = safeUrl(purl.value);
      var pp = document.getElementById("asPosPrev");
      if (pp) pp.innerHTML = POSTER ? '<img src="' + esc(POSTER) + '" alt="">' : "🖼";
    });

    if (f) f.addEventListener("change", function () {
      var file = fileOf("asVidFile");
      if (!file) return;
      if (file.size > 25 * 1024 * 1024) { f.value = ""; return toast("حجم ویدیو بیشتر از ۲۵ مگابایت است", "err"); }
      if (!/^video\//.test(file.type)) { f.value = ""; return toast("فایل باید ویدیو باشد", "err"); }
      var vp = document.getElementById("asVidPrev");
      if (vp) vp.innerHTML = '<video src="' + URL.createObjectURL(file) + '" muted playsinline autoplay loop></video>';
      toast("ویدیو انتخاب شد — با «ذخیرهٔ کمپین» آپلود می‌شود", "ok");
    });

    if (pf) pf.addEventListener("change", function () {
      var file = fileOf("asPosFile");
      if (!file) return;
      if (file.size > 3 * 1024 * 1024) { pf.value = ""; return toast("حجم پوستر بیشتر از ۳ مگابایت است", "err"); }
      var pp = document.getElementById("asPosPrev");
      if (pp) pp.innerHTML = '<img src="' + URL.createObjectURL(file) + '" alt="">';
    });

    var save = document.getElementById("asSave");
    if (save) save.addEventListener("click", saveCampaign);
    var reset = document.getElementById("asReset");
    if (reset) reset.addEventListener("click", function () { resetForm(); });
  }

  function resetForm() {
    EDIT = null; VIDEO = ""; POSTER = "";
    ["asTitle", "asBrand", "asCopy", "asCta", "asUrl", "asVidUrl", "asPosUrl"].forEach(function (id) {
      var e = document.getElementById(id); if (e) e.value = "";
    });
    ["asVidFile", "asPosFile"].forEach(function (id) {
      var e = document.getElementById(id); if (e) e.value = "";
    });
    var vp = document.getElementById("asVidPrev"); if (vp) vp.textContent = "🎬";
    var pp = document.getElementById("asPosPrev"); if (pp) pp.textContent = "🖼";
    var t = document.getElementById("asFormTitle"); if (t) t.textContent = "🎬 کمپین ویدیویی تازه";
  }

  function progress(id, pct) {
    var box = document.getElementById(id);
    if (!box) return;
    if (pct == null) { box.classList.remove("on"); box.querySelector("i").style.width = "0%"; return; }
    box.classList.add("on");
    box.querySelector("i").style.width = Math.max(2, Math.min(100, pct)) + "%";
  }

  function saveCampaign() {
    if (busy) return toast("کمی صبر کن…", "ok");
    var title = val("asTitle").trim();
    var file = fileOf("asVidFile");
    var vurl = safeUrl(val("asVidUrl").trim()) || VIDEO;
    if (title.length < 2) return toast("عنوان کمپین را بنویس", "err");
    if (!file && !vurl) return toast("ویدیو را آپلود کن یا لینک MP4 بگذار", "err");

    busy = true;
    var posterFile = fileOf("asPosFile");
    var posterUrl = safeUrl(val("asPosUrl").trim()) || POSTER;
    var payload = {
      title: title,
      brand: val("asBrand").trim() || "RONIN ADS",
      copy: val("asCopy").trim(),
      cta: val("asCta").trim() || "بیشتر بدانید",
      target: val("asTarget") || "market",
      url: safeUrl(val("asUrl").trim()),
      live: true,
      at: Date.now()
    };

    function finish() {
      payload.video = vurl;
      payload.poster = posterUrl || "";
      var ref = EDIT
        ? R.db.ref("ads/campaigns/" + EDIT).update(payload)
        : R.db.ref("ads/campaigns").push(payload);
      ref.then(function () {
        toast(EDIT ? "کمپین به‌روز شد ✅" : "کمپین ساخته شد ✅", "ok");
        resetForm(); paintCampaigns(); busy = false;
      }).catch(function (e) {
        toast("ذخیره نشد: " + e.message, "err"); busy = false;
      });
    }

    function uploadPoster(next) {
      if (!posterFile) return next();
      progress("asPosProg", 4);
      upload(posterFile, "posters", function (p) { progress("asPosProg", p); }, function (err, u) {
        progress("asPosProg", null);
        if (u) { posterUrl = u; POSTER = u; }
        else if (err && err.message !== "storage-off") toast("پوستر آپلود نشد — لینک پوستر بگذار", "err");
        next();
      });
    }

    function uploadVideo(next) {
      if (!file) return next();
      progress("asVidProg", 3);
      upload(file, "videos", function (p) { progress("asVidProg", p); }, function (err, u) {
        progress("asVidProg", null);
        if (err && err.message === "storage-off") {
          busy = false;
          return toast("Storage فعال نیست؛ ویدیو را با لینک MP4 بگذار", "err");
        }
        if (err) {
          busy = false;
          return toast("آپلود نشد: " + (err.message || "خطا"), "err");
        }
        vurl = u; VIDEO = u; next();
      });
    }

    uploadVideo(function () { uploadPoster(finish); });
  }

  function paintCampaigns() {
    var box = document.getElementById("asList");
    if (!box || !R || !R.db) return;
    R.db.ref("ads/campaigns").on("value", function (snap) {
      var data = snap.val() || {};
      var keys = Object.keys(data).sort(function (a, b) { return (data[b].at || 0) - (data[a].at || 0); });
      var cnt = document.getElementById("asCount");
      if (cnt) cnt.textContent = "(" + keys.length + ")";
      if (!keys.length) {
        box.innerHTML = '<div class="as-empty">هنوز کمپینی نساخته‌ای.<br>فرم را پر کن و ذخیره کن.</div>';
        return;
      }
      box.innerHTML = keys.map(function (k) {
        var c = data[k] || {};
        var live = c.live !== false;
        var thumb = c.poster
          ? '<img src="' + esc(c.poster) + '" alt="" onerror="this.remove()">'
          : (c.video ? '<video src="' + esc(c.video) + '" muted preload="metadata"></video>' : "🎬");
        return '<div class="as-item">' +
          '<div class="as-thumb">' + thumb + '</div>' +
          '<div class="as-info"><b>' + esc(c.title || "بدون عنوان") + '</b><span>' +
            esc(c.brand || "RONIN ADS") + " · " + esc(c.cta || "—") + " · " + (live ? "فعال" : "خاموش") +
          '</span></div>' +
          '<div class="as-row" style="gap:4px">' +
            '<button class="as-mini' + (live ? " on" : "") + '" type="button" data-as-live="' + k + '">' + (live ? "روشن" : "خاموش") + '</button>' +
            '<button class="as-mini" type="button" data-as-edit="' + k + '">ویرایش</button>' +
            '<button class="as-mini d" type="button" data-as-del="' + k + '">حذف</button>' +
          '</div></div>';
      }).join("");
    }, function () {});

    if (box.getAttribute("data-bound")) return;
    box.setAttribute("data-bound", "1");
    box.addEventListener("click", function (e) {
      var liveB = e.target.closest("[data-as-live]");
      var editB = e.target.closest("[data-as-edit]");
      var delB = e.target.closest("[data-as-del]");
      if (!R || !R.db) return;
      if (liveB) {
        var id = liveB.getAttribute("data-as-live");
        R.db.ref("ads/campaigns/" + id).once("value").then(function (s) {
          var c = s.val() || {};
          return R.db.ref("ads/campaigns/" + id).update({ live: c.live === false });
        }).catch(function () {});
        return;
      }
      if (delB) {
        var did = delB.getAttribute("data-as-del");
        if (!window.confirm("کمپین حذف شود؟")) return;
        R.db.ref("ads/campaigns/" + did).remove().then(function () {
          toast("کمپین حذف شد", "ok");
        }).catch(function () {});
        return;
      }
      if (editB) {
        var eid = editB.getAttribute("data-as-edit");
        R.db.ref("ads/campaigns/" + eid).once("value").then(function (s) {
          var c = s.val() || {};
          EDIT = eid; VIDEO = c.video || ""; POSTER = c.poster || "";
          var set = function (id, v) { var el = document.getElementById(id); if (el) el.value = v == null ? "" : v; };
          set("asTitle", c.title); set("asBrand", c.brand); set("asCopy", c.copy);
          set("asCta", c.cta); set("asUrl", c.url); set("asVidUrl", c.video); set("asPosUrl", c.poster);
          set("asTarget", c.target || "market");
          var vp = document.getElementById("asVidPrev");
          if (vp) vp.innerHTML = c.video ? '<video src="' + esc(c.video) + '" muted playsinline preload="metadata" controls></video>' : "🎬";
          var pp = document.getElementById("asPosPrev");
          if (pp) pp.innerHTML = c.poster ? '<img src="' + esc(c.poster) + '" alt="">' : "🖼";
          var t = document.getElementById("asFormTitle"); if (t) t.textContent = "✏️ ویرایش کمپین";
          var card = document.getElementById("asFormCard");
          if (card && card.scrollIntoView) card.scrollIntoView({ behavior: "smooth", block: "center" });
        }).catch(function () {});
      }
    });
  }

  function boot() {
    R = window.R;
    if (!R) { setTimeout(boot, 500); return; }
    build();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
