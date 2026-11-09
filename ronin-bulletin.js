/* ═══════════════════════════════════════════════════════════════
   RONIN STORE — BULLETIN  ·  ronin-bulletin.js
   بخش «🛰 اطلاعیهها» : خبر • اعلان پخش • تریلر • میم • کالای فروشی
   • انتشار: فقط مالک 👑 یا دارای دسترسی «اخبار»
   • عکس: لینک یا از گالری گوشی (خودکار فشرده میشود)
   • تریلر یوتیوب: فقط وقتی کلیک کنی داخل مدال لود میشود (سبک)
   ═══════════════════════════════════════════════════════════════ */
"use strict";
(function () {
  var PATH = "bulletins";
  var MAX = 15;
  var DATA = {};
  var ST = { kind: "news", tab: "all", img: "", q: "" };

  var KINDS = {
    news:    { ic: "📰", fa: "خبر",         cls: "cy" },
    air:     { ic: "📅", fa: "اعلان پخش",   cls: "ok" },
    trailer: { ic: "🎬", fa: "تریلر",       cls: "gd" },
    meme:    { ic: "😂", fa: "میم",         cls: ""   },
    sale:    { ic: "🛒", fa: "کالای فروشی", cls: "bad" }
  };

  function el(id) { return document.getElementById(id); }
  function esc(s) { return (window.R && R.esc) ? R.esc(s) : String(s == null ? "" : s); }
  function ok() { return !!(window.R && R.db); }
  function canPost() { return !!(window.R && (R.isOwner() || (R.can && R.can("news")))); }

  /* ── یوتیوب ─────────────────────────────────────────────── */
  function ytId(u) {
    u = String(u || "").trim();
    if (!u) return "";
    var m = u.match(/(?:youtu\.be\/|[?&]v=|embed\/|shorts\/)([A-Za-z0-9_-]{6,})/);
    if (m) return m[1];
    if (/^[A-Za-z0-9_-]{11}$/.test(u)) return u;
    return "";
  }

  /* ── استایل ─────────────────────────────────────────────── */
  function css() {
    if (el("bulCss")) return;
    var s = document.createElement("style");
    s.id = "bulCss";
    s.textContent =
      "#bulForm .brow{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0}" +
      "#bulForm .kindbtn{cursor:pointer;border:1px solid rgba(140,160,255,.2);background:rgba(255,255,255,.04);" +
      "color:inherit;border-radius:10px;padding:6px 10px;font-size:12px;font-family:inherit}" +
      "#bulForm .kindbtn.on{background:linear-gradient(135deg,#7c5cff,#22d3ee);color:#fff;border-color:transparent}" +
      "#bulWrap{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:12px;margin-top:12px}" +
      ".bulc{border:1px solid rgba(140,160,255,.18);border-radius:16px;overflow:hidden;background:rgba(255,255,255,.035);" +
      "display:flex;flex-direction:column;position:relative;transition:transform .25s,box-shadow .25s}" +
      ".bulc:hover{transform:translateY(-3px);box-shadow:0 14px 34px rgba(0,0,0,.45)}" +
      ".bulc .bimg{position:relative;aspect-ratio:16/9;background:#0a0e22;overflow:hidden}" +
      ".bulc .bimg img{width:100%;height:100%;object-fit:cover;display:block}" +
      ".bulc .play{position:absolute;inset:0;display:grid;place-items:center;border:0;cursor:pointer;" +
      "background:rgba(4,6,15,.34);color:#fff;font-size:30px}" +
      ".bulc .bd{padding:10px 12px 12px;display:flex;flex-direction:column;gap:7px}" +
      ".bulc .bt{font-weight:800;font-size:14px;line-height:1.65}" +
      ".bulc .bb{font-size:12px;opacity:.84;line-height:1.8}" +
      ".bulc .bmeta{display:flex;gap:7px;align-items:center;flex-wrap:wrap;font-size:10.5px;opacity:.72}" +
      ".bulc .bdate{font-size:11.5px;font-weight:700;color:#7ee7ff}" +
      ".bulc .btools{position:absolute;top:7px;inset-inline-end:7px;z-index:2}" +
      ".bulc .btools button{width:28px;height:28px;border-radius:9px;border:1px solid rgba(255,255,255,.2);" +
      "background:rgba(4,6,15,.62);color:#fff;cursor:pointer;font-size:13px}" +
      "#bulMod{position:fixed;inset:0;z-index:9500;display:none;place-items:center;padding:14px;" +
      "background:rgba(3,5,12,.84)}" +
      "#bulMod.on{display:grid}" +
      "#bulMod .bmBox{width:min(880px,100%);background:#0a0e22;border:1px solid rgba(140,160,255,.25);" +
      "border-radius:16px;overflow:hidden}" +
      "#bulMod .bmHead{display:flex;justify-content:space-between;align-items:center;padding:9px 12px;" +
      "border-bottom:1px solid rgba(140,160,255,.18);font-size:13px;font-weight:700}" +
      "#bulMod .bmVid{position:relative;aspect-ratio:16/9;background:#000}" +
      "#bulMod .bmVid iframe{position:absolute;inset:0;width:100%;height:100%;border:0}";
    document.head.appendChild(s);
  }

  /* ── ساخت بخش + منو + مدال ─────────────────────────────── */
  function build() {
    if (!window.R || !el("stage") || el("sec-bulletin")) return;
    css();

    var sec = document.createElement("section");
    sec.className = "sec";
    sec.id = "sec-bulletin";
    sec.innerHTML =
      '<div class="bulHero">' +
        '<div class="bulHeroCopy">' +
          '<span class="bulKicker">RONIN SIGNAL / 24</span>' +
          '<h2 class="bulTitle">اطلاعیه‌ها و تریلرها</h2>' +
          '<p class="bulLead">خبرها، اعلان پخش، تریلرها و سیگنال‌های تازهٔ رونین — همه در یک اتاق خبر زنده.</p>' +
          '<div class="bulHeroActions">' +
            '<button class="btn p mini" type="button" data-bulscroll="1">✍️ ارسال سیگنال</button>' +
            '<button class="btn mini" type="button" data-bulk="trailer">🎬 تماشای تریلرها</button>' +
          '</div>' +
        '</div>' +
        '<div class="bulHeroStats">' +
          '<div class="bulHStat"><b id="bulStatAll">۰</b><span>سیگنال</span></div>' +
          '<div class="bulHStat"><b id="bulStatTr">۰</b><span>تریلر</span></div>' +
          '<div class="bulHStat"><b id="bulStatNew">—</b><span>آخرین خبر</span></div>' +
        '</div>' +
      '</div>' +
      '<div class="bulToolbar">' +
        '<div class="bulSearch"><input id="bulSearch" type="search" placeholder="جستجو در اطلاعیه‌ها…" maxlength="60" autocomplete="off"><i aria-hidden="true">⌕</i></div>' +
        '<div class="tabs bulTabs" id="bulTabs">' +
          '<div class="tab on" data-bulk="all">همه</div>' +
          '<div class="tab" data-bulk="news">📰 خبر</div>' +
          '<div class="tab" data-bulk="air">📅 اعلان پخش</div>' +
          '<div class="tab" data-bulk="trailer">🎬 تریلر</div>' +
          '<div class="tab" data-bulk="meme">😂 میم</div>' +
          '<div class="tab" data-bulk="sale">🛒 فروش</div>' +
        '</div>' +
      '</div>' +
      '<div id="bulSpot" class="bulSpot hide"></div>' +
      '<div class="card mb hide" id="bulForm">' +
        '<div class="between"><span class="sm b">✍️ انتشار اطلاعیه</span>' +
        '<span class="chip gd" id="bulWho">مجاز</span></div>' +
        '<div class="brow" id="bulKinds"></div>' +
        '<input class="inp mb" id="bulTitle" placeholder="عنوان (مثلاً: فصل جدید Attack on Titan)" maxlength="120">' +
        '<textarea class="area mb" id="bulBody" placeholder="توضیحات / اطلاعات پخش / قیمت…" maxlength="1500"></textarea>' +
        '<div class="grid g2 mb">' +
        '<input class="inp" id="bulDate" placeholder="تاریخ/ساعت (جمعه ۲۱ آذر، ۲۱:۰۰)" maxlength="60">' +
        '<input class="inp" id="bulLink" placeholder="لینک یوتیوب یا لینک خرید" dir="ltr" maxlength="300">' +
        '</div>' +
        '<input class="inp mb" id="bulImg" placeholder="لینک عکس (اختیاری) — یا از گالری بگیر" dir="ltr" maxlength="500">' +
        '<div class="brow">' +
        '<label class="btn mini">🖼 عکس از گالری<input id="bulFile" type="file" accept="image/*" hidden></label>' +
        '<button class="btn mini" id="bulClear" type="button">پاک کردن</button>' +
        '<button class="btn p mini" id="bulGo" type="button">🚀 انتشار</button>' +
        '</div>' +
        '<div class="xs mut mt" id="bulPrev"></div>' +
      '</div>' +
      '<div class="bulSectionHead"><div><b>آخرین سیگنال‌ها</b><small>زنده از اتاق خبر رونین</small></div><span class="chip cy" id="bulCount">۰</span></div>' +
      '<div id="bulWrap"></div>';
    el("stage").appendChild(sec);

    /* آیتم منو: اگر در HTML نیست، خودمان در گروه «کاوش» بسازیم */
    if (!document.querySelector("#rail [data-go='bulletin']")) {
      var it = document.createElement("div");
      it.className = "ditem";
      it.setAttribute("data-go", "bulletin");
      it.innerHTML = "<i>📣</i>اطلاعیه‌ها";
      var host = document.querySelector("#rail .rgroup .rgbody") ||
                 document.querySelector("#rail .rnav");
      if (host) host.appendChild(it);
    }

    /* مدال ویدیو */
    if (!el("bulMod")) {
      var m = document.createElement("div");
      m.id = "bulMod";
      m.innerHTML = '<div class="bmBox"><div class="bmHead">' +
        '<span id="bmTitle">🎬 تریلر</span>' +
        '<button class="icobtn" type="button" id="bmClose">✕</button></div>' +
        '<div class="bmVid" id="bmVid"></div></div>';
      document.body.appendChild(m);
    }

    kinds();
    form();
    wire();
    watch();
  }

  /* ── دکمه‌های نوع ──────────────────────────────────────── */
  function kinds() {
    var box = el("bulKinds");
    if (!box) return;
    box.innerHTML = Object.keys(KINDS).map(function (k) {
      var K = KINDS[k];
      return '<button type="button" class="kindbtn' + (ST.kind === k ? " on" : "") +
        '" data-bulkind="' + k + '">' + K.ic + " " + K.fa + "</button>";
    }).join("");
  }

  /* ── نمایش فرم بر اساس دسترسی ──────────────────────────── */
  function form() {
    var f = el("bulForm");
    if (!f) return;
    var y = canPost();
    f.classList.toggle("hide", !y);
    if (y && el("bulWho")) el("bulWho").textContent = R.isOwner() ? "👑 مالک" : "🛡 مجاز";
  }

  /* ── رویدادها ──────────────────────────────────────────── */
  function wire() {
    var f = el("bulFile");
    if (f) f.addEventListener("change", function (e) {
      pick(e.target.files && e.target.files[0]);
      e.target.value = "";
    });
    var li = el("bulImg");
    if (li && window.R && R.debounce) li.addEventListener("input", R.debounce(prev, 260));
    var si = el("bulSearch");
    if (si && window.R && R.debounce) si.addEventListener("input", R.debounce(function () {
      ST.q = String(si.value || "").trim();
      render();
    }, 180));
  }

  /* ── فشرده‌سازی عکس گالری ─────────────────────────────── */
  function pick(file) {
    if (!window.R) return;
    if (!file) return;
    if (!file.type || file.type.indexOf("image/") !== 0) return R.toast("فقط عکس انتخاب کن 🖼", "err");
    if (file.size > 6 * 1024 * 1024) return R.toast("عکس بزرگ‌تر از ۶ مگه ❌", "err");
    R.toast("عکس داره آماده می‌شه… ⏳", "ok");
    var fr = new FileReader();
    fr.onload = function () {
      var im = new Image();
      im.onload = function () {
        try {
          var W = 720, r = Math.min(1, W / (im.width || W));
          var c = document.createElement("canvas");
          c.width = Math.max(1, Math.round((im.width || W) * r));
          c.height = Math.max(1, Math.round((im.height || W) * r));
          c.getContext("2d").drawImage(im, 0, 0, c.width, c.height);
          var out = c.toDataURL("image/webp", 0.62);
          if (out.indexOf("webp") === -1) out = c.toDataURL("image/jpeg", 0.62);
          if (out.length > 130000) out = c.toDataURL("image/jpeg", 0.42);
          if (out.length > 170000) return R.toast("عکس سنگینه، یکی سبک‌تر انتخاب کن ❌", "err");
          ST.img = out;
          prev();
          R.toast("عکس آماده شد ✅", "ok");
        } catch (e) { R.toast("پردازش عکس نشد ❌", "err"); }
      };
      im.onerror = function () { R.toast("این عکس خوانده نشد ❌", "err"); };
      im.src = fr.result;
    };
    fr.readAsDataURL(file);
  }

  function prev() {
    var p = el("bulPrev");
    if (!p) return;
    var lg = ST.img || (el("bulImg") ? el("bulImg").value : "");
    p.textContent = lg ? "✅ عکس آماده است" : "";
  }

  function reset() {
    ["bulTitle", "bulBody", "bulDate", "bulLink", "bulImg"].forEach(function (i) {
      var x = el(i); if (x) x.value = "";
    });
    ST.img = "";
    prev();
  }

  /* ── انتشار ────────────────────────────────────────────── */
  function publish() {
    if (!ok()) return R.toast("اتصال برقرار نشد ❌", "err");
    if (!canPost()) return R.toast("دسترسی انتشار نداری 🔒", "err");
    var t = R.clean(el("bulTitle") ? el("bulTitle").value : "", 120);
    if (t.length < 3) return R.toast("عنوان را بنویس", "err");
    var b = el("bulGo");
    if (b) { b.disabled = true; b.textContent = "در حال انتشار…"; }
    R.add(PATH, {
      t: Date.now(),
      kind: ST.kind || "news",
      title: t,
      body: R.clean(el("bulBody") ? el("bulBody").value : "", 1500),
      date: R.clean(el("bulDate") ? el("bulDate").value : "", 60),
      link: R.clean(el("bulLink") ? el("bulLink").value : "", 300),
      img: ST.img || R.clean(el("bulImg") ? el("bulImg").value : "", 500),
      by: R.ME,
      byn: (R.USER && R.USER.name) || "تیم رونین",
      views: 0
    }).then(function () {
      R.toast("اطلاعیه منتشر شد ✅", "ok");
      reset();
    }).catch(function (e) {
      R.toast("منتشر نشد: " + e.message, "err");
    }).then(function () {
      if (b) { b.disabled = false; b.textContent = "🚀 انتشار"; }
    });
  }

  /* ── رندر کارت‌ها ──────────────────────────────────────── */
  function card(d) {
    var K = KINDS[d.kind] || KINDS.news;
    var y = ytId(d.link);
    var img = d.img || (y ? "https://img.youtube.com/vi/" + y + "/hqdefault.jpg" : "");
    var mine = R.isOwner() || d.by === R.ME;
    var h = '<article class="bulc bulc-' + esc(d.kind || "news") + '">';
    if (mine) h += '<div class="btools"><button type="button" data-buldel="' + esc(d.id) + '" title="حذف">🗑</button></div>';
    if (img || y) {
      h += '<div class="bimg">' +
        (img ? '<img src="' + esc(img) + '" loading="lazy" alt="">' : "") +
        '<span class="bkindtag">' + K.ic + " " + K.fa + "</span>" +
        (y ? '<button type="button" class="play" data-bulyt="' + esc(y) + '" data-bult="' + esc(d.title || "") + '" aria-label="پخش تریلر"><span>▶</span><small>پخش تریلر</small></button>' : "") +
        "</div>";
    }
    h += '<div class="bd">' +
      '<div class="bmeta"><span class="chip ' + K.cls + '">' + K.ic + " " + K.fa + "</span>" +
      "<span>" + (R.time ? R.time(d.t) : "") + "</span></div>" +
      '<div class="bt">' + esc(d.title || "") + "</div>";
    if (d.date) h += '<div class="bdate">🗓 ' + esc(d.date) + "</div>";
    if (d.body) h += '<div class="bb">' + esc(d.body).replace(/\n/g, "<br>") + "</div>";
    if (y) h += '<button type="button" class="btn mini bulTrailerBtn" data-bulyt="' + esc(y) + '" data-bult="' + esc(d.title || "") + '">🎬 دیدن تریلر</button>';
    else if (d.link) h += '<a class="btn mini" href="' + esc(d.link) + '" target="_blank" rel="noopener">🔗 بازکردن لینک</a>';
    h += '<div class="bmeta"><span>👤 ' + esc(d.byn || "تیم رونین") + "</span></div></div></article>";
    return h;
  }

  function spotlight(d) {
    if (!d) return "";
    var y = ytId(d.link);
    var img = d.img || (y ? "https://img.youtube.com/vi/" + y + "/maxresdefault.jpg" : "");
    var fallback = y ? "https://img.youtube.com/vi/" + y + "/hqdefault.jpg" : "";
    var K = KINDS[d.kind] || KINDS.trailer;
    var play = y
      ? '<button type="button" class="bSpotPlay" data-bulyt="' + esc(y) + '" data-bult="' + esc(d.title || "") + '"><span>▶</span><b>پخش تریلر</b></button>'
      : (d.link ? '<a class="btn p mini" href="' + esc(d.link) + '" target="_blank" rel="noopener">🔗 تماشا</a>' : "");
    return '<div class="bSpotCard">' +
      '<div class="bSpotImg">' +
        (img ? '<img src="' + esc(img) + '" alt="" loading="lazy"' + (fallback ? ' onerror="this.onerror=null;this.src=\'' + fallback + '\'"' : "") + ">" : "") +
        '<span class="bSpotGlow"></span>' + play +
      "</div>" +
      '<div class="bSpotCopy">' +
        '<span class="bSpotKicker">' + K.ic + " SIgnal Spotlight</span>" +
        '<h3>' + esc(d.title || "تریلر ویژه") + "</h3>" +
        '<p>' + esc(d.body || d.date || "آخرین تریلر منتشرشده در اتاق خبر رونین را ببین.") + "</p>" +
        '<div class="bSpotMeta"><span>👤 ' + esc(d.byn || "تیم رونین") + "</span><span>🕒 " + (R.time ? R.time(d.t) : "") + "</span></div>" +
        play +
      "</div></div>";
  }

  function updateMeta(all, shown) {
    var trailers = all.filter(function (d) { return d.kind === "trailer"; }).length;
    var latest = all.length ? (R.time ? R.time(all[0].t) : "") : "—";
    var set = function (id, v) { var x = el(id); if (x) x.textContent = v; };
    set("bulStatAll", R.fa ? R.fa(all.length) : String(all.length));
    set("bulStatTr", R.fa ? R.fa(trailers) : String(trailers));
    set("bulStatNew", latest);
    set("bulCount", (R.fa ? R.fa(shown.length) : String(shown.length)) + " مورد");
  }

  function render() {
    var box = el("bulWrap");
    if (!box) return;
    var all = Object.keys(DATA).map(function (k) {
      var d = DATA[k] || {};
      d.id = k;
      return d;
    }).sort(function (a, b) {
      return (b.t || 0) - (a.t || 0);
    });
    var q = String(ST.q || "").toLowerCase();
    var arr = all.filter(function (d) {
      if (ST.tab !== "all" && d.kind !== ST.tab) return false;
      if (!q) return true;
      return String(d.title || "").toLowerCase().indexOf(q) >= 0 ||
        String(d.body || "").toLowerCase().indexOf(q) >= 0 ||
        String(d.byn || "").toLowerCase().indexOf(q) >= 0;
    });
    updateMeta(all, arr);

    var spot = el("bulSpot");
    if (spot) {
      var feat = arr.filter(function (d) { return d.kind === "trailer" && (ytId(d.link) || d.img); })[0] || null;
      if (feat) { spot.classList.remove("hide"); spot.innerHTML = spotlight(feat); }
      else { spot.classList.add("hide"); spot.innerHTML = ""; }
    }

    box.innerHTML = arr.length
      ? arr.map(card).join("")
      : '<div class="bulEmpty"><b>🔭 سیگنالی پیدا نشد</b><span>' +
        (q ? "عبارت دیگری را جستجو کن یا فیلتر را عوض کن." : "هنوز اطلاعیه‌ای در این دسته منتشر نشده.") +
        "</span></div>";
  }

  /* ── لیسنر دیتابیس ─────────────────────────────────────── */
  function watch() {
    if (!ok() || R._bulW) { render(); return; }
    R._bulW = true;
    R.db.ref(PATH).orderByChild("t").limitToLast(MAX).on("value", function (s) {
      DATA = s.val() || {};
      render();
    }, function (e) { console.warn("[Ronin] bulletins:", e.message); });
  }

  /* ── مدال ویدیو ────────────────────────────────────────── */
  function openVid(id, title) {
    var m = el("bulMod");
    if (!m || !id) return;
    if (el("bmTitle")) el("bmTitle").textContent = "🎬 " + (title || "تریلر");
    el("bmVid").innerHTML = '<iframe src="https://www.youtube.com/embed/' +
      encodeURIComponent(id) + '?autoplay=1&rel=0" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>';
    m.classList.add("on");
  }
  function closeVid() {
    var m = el("bulMod");
    if (!m) return;
    m.classList.remove("on");
    if (el("bmVid")) el("bmVid").innerHTML = "";
  }

  /* API کوچک برای «دنیای من» و سایر بخش‌ها */
  R.bulletin = {
    data: function () { return DATA; },
    open: openVid,
    render: render,
    tab: function (k) {
      ST.tab = KINDS[k] || k === "all" ? k : "all";
      R.qa("#bulTabs .tab").forEach(function (x) { x.classList.toggle("on", x.getAttribute("data-bulk") === ST.tab); });
      render();
    }
  };

  /* ── کلیک‌ها ───────────────────────────────────────────── */
  document.addEventListener("click", function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    if (t.closest("#bulGo")) { e.preventDefault(); return publish(); }
    if (t.closest("[data-bulscroll]")) {
      e.preventDefault();
      var f = el("bulForm");
      if (!f || f.classList.contains("hide")) {
        if (!canPost()) return R.toast("ارسال سیگنال فقط برای مالک یا دارندهٔ دسترسی اخبار است 🔒", "err");
        f = el("bulForm"); if (f) f.classList.remove("hide");
      }
      try { f.scrollIntoView({ behavior: "smooth", block: "center" }); } catch (er) {}
      return;
    }
    if (t.closest("#bulClear")) { e.preventDefault(); return reset(); }
    if (t.closest("#bmClose") || t.id === "bulMod") { e.preventDefault(); return closeVid(); }
    var pb = t.closest("[data-bulyt]");
    if (pb) { e.preventDefault(); return openVid(pb.getAttribute("data-bulyt"), pb.getAttribute("data-bult")); }
    var kb = t.closest("[data-bulk]");
    if (kb) {
      e.preventDefault();
      R.qa("#bulTabs .tab").forEach(function (x) { x.classList.toggle("on", x === kb); });
      ST.tab = kb.getAttribute("data-bulk");
      return render();
    }
    var kk = t.closest("[data-bulkind]");
    if (kk) { e.preventDefault(); ST.kind = kk.getAttribute("data-bulkind"); return kinds(); }
    var db = t.closest("[data-buldel]");
    if (db) {
      e.preventDefault();
      if (!R.isOwner() && !(R.can && R.can("mod"))) return R.toast("حذف فقط مالک 👑", "err");
      if (!window.confirm("این اطلاعیه حذف شود؟")) return;
      R.db.ref(PATH + "/" + db.getAttribute("data-buldel")).remove()
        .then(function () { R.toast("حذف شد 🗑", "ok"); })
        .catch(function (er) { R.toast("حذف نشد: " + er.message, "err"); });
    }
  }, true);

  /* ── فرم را هر بار که بخش باز شد دوباره بررسی کن ─────────── */
  function watchSection() {
    var sec = el("sec-bulletin");
    if (!sec || !window.MutationObserver || sec.__bulWatch) return;
    sec.__bulWatch = true;
    new MutationObserver(function () {
      if (sec.classList.contains("on")) { form(); watch(); }
    }).observe(sec, { attributes: true, attributeFilter: ["class"] });
  }

  /* ── راه‌اندازی ────────────────────────────────────────── */
  function boot() { build(); form(); watchSection(); }
  var prevLogin = window.R && R.onLogin;
  if (window.R) {
    R.onLogin = function () {
      if (prevLogin) { try { prevLogin(); } catch (e) {} }
      setTimeout(function () { build(); form(); }, 700);
    };
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  setTimeout(boot, 1500);
  setTimeout(boot, 3200);
})();
