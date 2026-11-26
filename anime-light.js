/* RONIN CINEMA SKIN — anime-light.js (v7)
   ظاهر تازهٔ صفحهٔ سینما/انیمه (همه / فیلم / سریال / انیمه) + منوی پایین شناور و شیت تنظیمات.
   فقط لایهٔ نمایش است: به داده‌ها، پلیر، فیلترها و بقیهٔ کد‌ها دست نمی‌زند. */
"use strict";
(function () {
  if (window.__rnLightCinema) return;
  window.__rnLightCinema = true;

  function css() {
    if (!document.getElementById("rnLightCss")) {
      var l = document.createElement("link");
      l.id = "rnLightCss";
      l.rel = "stylesheet";
      l.href = "anime-world.css?v=5";
      (document.head || document.documentElement).appendChild(l);
    }
    if (document.getElementById("rnAwCss")) return;
    var AC = "linear-gradient(135deg,#ff6fae,#8b5cf6 56%,#38d9ff)";
    var S = [
      /* ── صفحه و ستون‌ها ── */
      'body.aw-light{background:radial-gradient(900px 520px at 88% -6%,#e9e0ff 0%,rgba(233,224,255,0) 62%),' +
        'radial-gradient(760px 460px at 2% 0%,#dff6ff 0%,rgba(223,246,255,0) 64%),' +
        'radial-gradient(760px 620px at 50% 112%,#ffe6f2 0%,rgba(255,230,242,0) 62%),#fbfaff!important}',
      'body.aw-light .cx-wrap{max-width:1180px;padding-bottom:96px}',
      '@media(min-width:821px){body.aw-light .cx-wrap{padding-bottom:40px}}',

      /* ── هدر شناور ── */
      'body.aw-light .cx-top{background:linear-gradient(180deg,rgba(255,255,255,.94),rgba(252,251,255,.78))!important;' +
        'border-bottom:1px solid rgba(96,70,170,.12)!important;backdrop-filter:blur(22px) saturate(160%);' +
        '-webkit-backdrop-filter:blur(22px) saturate(160%);box-shadow:0 10px 30px -18px rgba(70,50,140,.45)}',
      'body.aw-light .cx-brand .cx-mark{background:' + AC + ';color:#fff;box-shadow:0 10px 22px -10px rgba(139,92,246,.9)}',
      'body.aw-light .cx-search{background:rgba(255,255,255,.9)!important;border:1px solid rgba(96,70,170,.14)!important;' +
        'border-radius:16px!important;box-shadow:0 8px 22px -16px rgba(70,50,140,.6)}',
      'body.aw-light .cx-search input{font-size:12.5px}',
      'body.aw-light .cx-ico{border-radius:14px!important;transition:transform .18s ease,background .18s ease}',
      'body.aw-light .cx-ico:active{transform:scale(.94)}',

      /* ── تب‌های سگمنتی ── */
      'body.aw-light #cxTabs{gap:6px!important;padding:6px!important;border-radius:18px!important;' +
        'background:rgba(255,255,255,.82)!important;border:1px solid rgba(96,70,170,.12)!important;' +
        'box-shadow:0 14px 30px -24px rgba(70,50,140,.8);overflow:auto;scrollbar-width:none}',
      'body.aw-light #cxTabs::-webkit-scrollbar{display:none}',
      'body.aw-light #cxTabs>*{border:0!important;border-radius:13px!important;font-weight:900!important;font-size:11.5px!important;' +
        'padding:9px 14px!important;transition:background .2s ease,color .2s ease,transform .18s ease}',
      'body.aw-light #cxTabs>*.on,body.aw-light #cxTabs>*.active{background:' + AC + '!important;color:#fff!important;' +
        'box-shadow:0 12px 24px -14px rgba(139,92,246,.95)!important}',

      /* ── هیرو ── */
      'body.aw-light .cx-hero{border-radius:26px!important;border:1px solid rgba(96,70,170,.12)!important;' +
        'box-shadow:0 34px 70px -46px rgba(70,50,140,.75)!important;overflow:hidden}',
      'body.aw-light .cx-hero-poster{border-radius:20px!important;box-shadow:0 22px 40px -22px rgba(60,40,120,.7)!important}' +
        '',
      'body.aw-light .cx-hero h2{font-weight:900!important;letter-spacing:-.2px;color:#180f36!important}',
      'body.aw-light .cx-hero-kick i{background:' + AC + '!important;box-shadow:0 0 0 4px rgba(255,111,174,.18)}',
      'body.aw-light .cx-hero-meta{color:#5b5478!important;font-size:11px!important}',
      'body.aw-light .cx-hero-tags span{background:rgba(255,255,255,.9)!important;border:1px solid rgba(96,70,170,.16)!important;' +
        'color:#4b2fb0!important;border-radius:999px!important;padding:4px 10px!important;font-weight:800;font-size:10.5px!important}',
      'body.aw-light .cx-hero-play{background:' + AC + '!important;color:#fff!important;border:0!important;border-radius:14px!important;' +
        'box-shadow:0 16px 30px -16px rgba(139,92,246,.95)!important;font-weight:900}',
      'body.aw-light .cx-hero-act .cx-btn{border-radius:14px!important;font-weight:800}',
      'body.aw-light .cx-hero-dot{height:6px!important;border-radius:999px!important;background:rgba(96,70,170,.22)!important;transition:width .25s ease}',
      'body.aw-light .cx-hero-dot.on{width:26px!important;background:' + AC + '!important}',

      /* ── بنر بخش انیمه ── */
      'body.aw-light .cx-anime-band{border:0!important;border-radius:26px!important;padding:0!important;overflow:hidden;' +
        'background:linear-gradient(135deg,#fff 0%,#f6f1ff 55%,#eefbff 100%)!important;' +
        'box-shadow:0 30px 60px -44px rgba(70,50,140,.85)!important}',
      'body.aw-light .cx-anime-band::before{content:"";position:absolute;inset:0;' +
        'background:radial-gradient(420px 220px at 92% 0%,rgba(255,111,174,.22),transparent 70%),' +
        'radial-gradient(420px 260px at 0% 100%,rgba(56,217,255,.20),transparent 70%);pointer-events:none}',
      'body.aw-light .cx-anime-band .cx-ab-in{padding:18px 18px 16px!important;position:relative;z-index:1}',
      'body.aw-light .cx-ab-k{font-size:9.5px!important;letter-spacing:2px;color:#7b6bb0!important;font-weight:900}',
      'body.aw-light .cx-anime-band h2{font-size:22px!important;font-weight:900!important;color:#170f33!important;letter-spacing:-.4px}',
      'body.aw-light .cx-anime-band h2::after{content:" 忍";background:' + AC + ';-webkit-background-clip:text;background-clip:text;color:transparent}',
      'body.aw-light .cx-anime-band p{font-size:11.5px!important;color:#615a80!important;line-height:1.9}',
      'body.aw-light .cx-ab-chip{background:rgba(255,255,255,.92)!important;border:1px solid rgba(96,70,170,.16)!important;' +
        'border-radius:999px!important;color:#4b2fb0!important;font-weight:900!important;font-size:10.5px!important;padding:6px 12px!important;' +
        'transition:transform .16s ease,box-shadow .16s ease}',
      'body.aw-light .cx-ab-chip:hover{transform:translateY(-1px);box-shadow:0 10px 20px -12px rgba(139,92,246,.9)}',
      'body.aw-light .cx-ab-mark{opacity:.14!important;font-size:96px!important;transform:rotate(-8deg)}',

      /* ── ریل محبوب‌ترین‌ها ── */
      'body.aw-light .cx-ar-head b{font-size:14.5px!important;font-weight:900!important;color:#170f33!important}',
      'body.aw-light .cx-ar-head span{font-size:9px!important;letter-spacing:1.6px;color:#8b7fb8!important;font-weight:900}',
      'body.aw-light .cx-ar-track{display:flex!important;gap:12px!important;overflow-x:auto!important;padding:4px 2px 10px!important;' +
        'scroll-snap-type:x mandatory;scrollbar-width:none}',
      'body.aw-light .cx-ar-track::-webkit-scrollbar{display:none}',
      'body.aw-light .cx-ar-card{flex:0 0 132px!important;width:132px!important;scroll-snap-align:start;background:transparent!important;' +
        'border:0!important;padding:0!important;text-align:start;transition:transform .2s ease}',
      'body.aw-light .cx-ar-card:hover{transform:translateY(-4px)}',
      'body.aw-light .cx-ar-art{aspect-ratio:2/3!important;height:auto!important;border-radius:18px!important;overflow:hidden;' +
        'box-shadow:0 18px 36px -22px rgba(50,30,110,.85);position:relative;display:block}',
      'body.aw-light .cx-ar-art img{width:100%;height:100%;object-fit:cover;display:block}',
      'body.aw-light .cx-ar-art::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,transparent 45%,rgba(12,6,30,.72))}',
      'body.aw-light .cx-ar-rank{position:absolute;top:8px;inset-inline-start:8px;z-index:2;width:24px;height:24px;border-radius:9px;' +
        'display:grid;place-items:center;font-size:11px;font-weight:900;background:rgba(255,255,255,.94);color:#3a2a7a;' +
        'box-shadow:0 6px 14px -8px rgba(0,0,0,.6)}',
      'body.aw-light .cx-ar-rank.g1{background:linear-gradient(135deg,#ffd76e,#ff9f43);color:#3a2400}',
      'body.aw-light .cx-ar-rank.g2{background:linear-gradient(135deg,#e6ecff,#b9c6ff);color:#22305f}',
      'body.aw-light .cx-ar-rank.g3{background:linear-gradient(135deg,#ffd7c2,#ffab84);color:#4a2208}',
      'body.aw-light .cx-ar-play{position:absolute;inset-inline-end:8px;bottom:8px;z-index:2;width:26px;height:26px;border-radius:50%;' +
        'display:grid;place-items:center;font-size:10px;color:#fff;background:rgba(255,255,255,.22);backdrop-filter:blur(6px);' +
        'border:1px solid rgba(255,255,255,.5)}',
      'body.aw-light .cx-ar-meta{display:block;padding-top:7px}',
      'body.aw-light .cx-ar-meta b{display:block;font-size:11px!important;font-weight:900;color:#1b1338!important;' +
        'white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
      'body.aw-light .cx-ar-meta small{display:block;font-size:9.5px!important;color:#7d7597!important;margin-top:2px;' +
        'white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
      'body.aw-light .cx-ar-bar{display:block;height:4px;border-radius:999px;background:rgba(96,70,170,.12);margin-top:6px;overflow:hidden}',
      'body.aw-light .cx-ar-bar i{display:block;height:100%;border-radius:999px;background:' + AC + '}',

      /* ── کاشی‌های ژانر ── */
      'body.aw-light .cx-anime-genres{display:grid!important;grid-template-columns:repeat(auto-fill,minmax(96px,1fr));gap:9px}',
      'body.aw-light .cx-ag-card{border-radius:18px!important;border:1px solid rgba(96,70,170,.12)!important;' +
        'background:linear-gradient(150deg,#fff,#f5f1ff)!important;padding:12px 10px!important;min-height:74px;' +
        'display:flex;flex-direction:column;justify-content:space-between;gap:6px;transition:transform .18s ease,box-shadow .18s ease}',
      'body.aw-light .cx-ag-card:hover{transform:translateY(-3px);box-shadow:0 18px 32px -22px rgba(70,50,140,.9)}',

      /* ── کارت‌های کاتالوگ ── */
      'body.aw-light .cx-grid{gap:12px!important}',
      'body.aw-light .cx-card{border-radius:20px!important;border:1px solid rgba(96,70,170,.12)!important;overflow:hidden;' +
        'background:#fff!important;box-shadow:0 18px 38px -30px rgba(50,30,110,.9)!important;' +
        'transition:transform .22s ease,box-shadow .22s ease}',
      'body.aw-light .cx-card:hover{transform:translateY(-4px);box-shadow:0 28px 52px -30px rgba(50,30,110,.95)!important}',
      'body.aw-light .cx-post{aspect-ratio:2/3}',
      'body.aw-light .cx-rate{background:' + AC + '!important;color:#fff!important;border:0!important;border-radius:10px!important;' +
        'font-weight:900!important;font-size:10px!important;padding:3px 7px!important;box-shadow:0 8px 18px -10px rgba(139,92,246,.95)}',
      'body.aw-light .cx-kind{background:rgba(255,255,255,.92)!important;color:#3a2a7a!important;border:0!important;' +
        'border-radius:999px!important;font-weight:900!important;font-size:9px!important;padding:3px 8px!important}',
      'body.aw-light .cx-wb{background:rgba(255,255,255,.94)!important;color:#3a2a7a!important;border:0!important;' +
        'border-radius:12px!important;box-shadow:0 8px 18px -12px rgba(0,0,0,.5)}',
      'body.aw-light .cx-wb.on{background:' + AC + '!important;color:#fff!important}',
      'body.aw-light .cx-body{padding:9px 10px 11px!important;background:#fff!important}',
      'body.aw-light .cx-body .cx-t{font-size:11.5px!important;font-weight:900!important;color:#1b1338!important;' +
        'display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}',
      'body.aw-light .cx-body .cx-s{font-size:9.5px!important;color:#7d7597!important;margin-top:3px}',

      /* ── بخش اطلاعات و فوتر ── */
      'body.aw-light .cx-info-card{border-radius:22px!important;background:rgba(255,255,255,.9)!important;' +
        'border:1px solid rgba(96,70,170,.12)!important;box-shadow:0 24px 50px -40px rgba(70,50,140,.9)}',

      /* ── منوی پایین شناور ── */
      'body.aw-light{padding-bottom:0}',
      '#awNav{position:fixed;bottom:0;inset-inline:0;z-index:80;display:flex;justify-content:center;' +
        'padding:8px 12px calc(10px + env(safe-area-inset-bottom));pointer-events:none}',
      '#awNav .aw-nv-in{pointer-events:auto;display:flex;align-items:center;gap:2px;width:min(540px,100%);' +
        'padding:7px;border-radius:22px;background:rgba(255,255,255,.86);backdrop-filter:blur(22px) saturate(170%);' +
        '-webkit-backdrop-filter:blur(22px) saturate(170%);border:1px solid rgba(96,70,170,.14);' +
        'box-shadow:0 22px 44px -22px rgba(50,30,110,.65)}',
      '#awNav .aw-nv{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;padding:7px 2px;' +
        'border:0;background:transparent;border-radius:16px;color:#6f6790;text-decoration:none;font:inherit;cursor:pointer;' +
        'transition:color .18s ease,background .18s ease,transform .18s ease}',
      '#awNav .aw-nv i{font-style:normal;font-size:18px;line-height:1;transition:transform .18s ease}',
      '#awNav .aw-nv b{font-size:9.5px;font-weight:900}',
      '#awNav .aw-nv:active{transform:scale(.94)}',
      '#awNav .aw-nv.on{color:#fff;background:' + AC + ';box-shadow:0 14px 26px -14px rgba(139,92,246,.95)}',
      '#awNav .aw-nv.on i{transform:translateY(-1px) scale(1.08)}',
      '@media(min-width:821px){#awNav{display:none}}',

      /* ── شیت تنظیمات ── */
      '#awSheet{position:fixed;inset:0;z-index:90;display:none}',
      '#awSheet.aw-on{display:block}',
      '#awSheet .aw-bd{position:absolute;inset:0;background:rgba(20,10,40,.42);backdrop-filter:blur(3px);' +
        'animation:awFade .2s ease both}',
      '#awSheet .aw-pn{position:absolute;inset-inline:0;bottom:0;max-height:82vh;overflow:auto;' +
        'background:linear-gradient(180deg,#fff,#faf8ff);border-radius:26px 26px 0 0;padding:10px 14px calc(18px + env(safe-area-inset-bottom));' +
        'box-shadow:0 -20px 50px -20px rgba(40,20,90,.5);animation:awUp .26s cubic-bezier(.2,.9,.2,1) both}',
      '@keyframes awUp{from{transform:translateY(24px);opacity:.4}to{transform:none;opacity:1}}',
      '@keyframes awFade{from{opacity:0}to{opacity:1}}',
      '#awSheet .aw-grab{width:44px;height:5px;border-radius:999px;background:rgba(96,70,170,.2);margin:6px auto 12px}',
      '#awSheet .aw-hd{display:flex;align-items:center;gap:8px;margin-bottom:12px}',
      '#awSheet .aw-hd b{font-size:15px;font-weight:900;color:#170f33}',
      '#awSheet .aw-hd button{margin-inline-start:auto;border:0;background:rgba(96,70,170,.1);color:#4b3a8c;' +
        'width:30px;height:30px;border-radius:12px;font-size:14px;cursor:pointer}',
      '#awSheet .aw-lb{font-size:10px;font-weight:900;color:#8b7fb8;letter-spacing:.6px;margin:10px 2px 7px}',
      '#awSheet .aw-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:8px}',
      '#awSheet .aw-tile{display:flex;align-items:center;gap:8px;padding:12px;border-radius:16px;border:1px solid rgba(96,70,170,.13);' +
        'background:#fff;color:#2a1f52;font-size:11.5px;font-weight:800;text-decoration:none;cursor:pointer;' +
        'transition:transform .16s ease,box-shadow .16s ease}',
      '#awSheet .aw-tile:hover{transform:translateY(-2px);box-shadow:0 16px 30px -24px rgba(70,50,140,.9)}',
      '#awSheet .aw-tile.on{border-color:transparent;background:' + AC + ';color:#fff;box-shadow:0 16px 30px -18px rgba(139,92,246,.9)}',
      '#awSheet .aw-tile i{font-style:normal;font-size:15px}'
    ];
    var st = document.createElement("style");
    st.id = "rnAwCss";
    st.textContent = S.join("\n");
    (document.head || document.documentElement).appendChild(st);
  }

  function state() {
    try { return (window.RoninCinema && RoninCinema.state) || null; } catch (e) { return null; }
  }

  function kind() {
    var s = state();
    if (s && s.kind) return s.mine ? "mine" : s.kind;
    var m = /(^|[?&])kind=(anime|film|series)(&|$)/.exec(location.search);
    if (m) return m[2];
    return /(^|[?&])mine=1(&|$)/.test(location.search) ? "mine" : "all";
  }

  /* ── منوی پایین ── */
  function navHTML() {
    return '<div class="aw-nv-in" role="tablist" aria-label="منوی صفحه">' +
      '<a class="aw-nv" data-aw="home" href="index.html"><i>🏠</i><b>خانه</b></a>' +
      '<a class="aw-nv" data-aw="all" href="cinema.html"><i>✨</i><b>همه</b></a>' +
      '<a class="aw-nv" data-aw="anime" href="cinema.html?kind=anime"><i>🌸</i><b>انیمه</b></a>' +
      '<a class="aw-nv" data-aw="film" href="cinema.html?kind=film"><i>🎬</i><b>فیلم</b></a>' +
      '<button class="aw-nv" id="awMore" type="button" data-aw="more"><i>⚙</i><b>بیشتر</b></button>' +
      '</div>';
  }

  function sheetHTML() {
    var k = kind();
    var sortOpts = [["new", "جدیدترین"], ["rate", "امتیاز"], ["year", "سال"], ["az", "الفبا"]];
    var skins = [["neo", "نئون"], ["sakura", "ساکورا"], ["cyber", "شب"]];
    var cur = "neo";
    try { cur = localStorage.getItem("ronin_hp_theme") || "neo"; } catch (e) {}
    return '<div class="aw-bd" data-aw-close="1"></div><div class="aw-pn" role="dialog" aria-label="تنظیمات">' +
      '<div class="aw-grab"></div>' +
      '<div class="aw-hd"><b>⚙ تنظیمات صفحه</b><button type="button" data-aw-close="1" aria-label="بستن">✕</button></div>' +
      '<div class="aw-lb">دسترسی سریع</div><div class="aw-grid">' +
        '<a class="aw-tile" data-aw="mine" href="cinema.html?mine=1"><i>🔖</i>لیست تماشای من</a>' +
        '<button class="aw-tile" type="button" data-aw-filters="1"><i>🎛</i>فیلترها</button>' +
        '<a class="aw-tile" data-aw="series" href="cinema.html?kind=series"><i>📺</i>سریال‌ها</a>' +
      '</div>' +
      '<div class="aw-lb">مرتب‌سازی</div><div class="aw-grid" id="awSort">' +
        sortOpts.map(function (o) { return '<button class="aw-tile" type="button" data-aw-sort="' + o[0] + '"><i>↕</i>' + o[1] + '</button>'; }).join("") +
      '</div>' +
      '<div class="aw-lb">پوستهٔ صفحه</div><div class="aw-grid" id="awSkin">' +
        skins.map(function (s2) {
          return '<button class="aw-tile' + (cur === s2[0] ? " on" : "") + '" type="button" data-aw-skin="' + s2[0] + '"><i>🎨</i>' + s2[1] + '</button>';
        }).join("") +
      '</div>' +
      '<div class="aw-lb">حساب</div><div class="aw-grid">' +
        '<a class="aw-tile" href="index.html#premium"><i>💎</i>پرمیوم</a>' +
        '<a class="aw-tile" href="index.html"><i>👤</i>حساب من</a>' +
      '</div>' +
      '<input type="hidden" id="awKindNow" value="' + k + '">' +
      '</div>';
  }

  function build() {
    if (!document.body || document.getElementById("awNav")) return;
    var n = document.createElement("nav");
    n.id = "awNav";
    n.innerHTML = navHTML();
    document.body.appendChild(n);
    var sh = document.createElement("div");
    sh.id = "awSheet";
    sh.innerHTML = sheetHTML();
    document.body.appendChild(sh);
    sh.addEventListener("click", function (e) {
      var t = e.target && e.target.closest ? e.target.closest("[data-aw-close],[data-aw-sort],[data-aw-skin],[data-aw-filters]") : null;
      if (!t) return;
      if (t.hasAttribute("data-aw-close")) { sh.classList.remove("aw-on"); return; }
      if (t.hasAttribute("data-aw-filters")) {
        sh.classList.remove("aw-on");
        var fb = document.getElementById("cxFilterBtn");
        if (fb) fb.click();
        return;
      }
      if (t.hasAttribute("data-aw-sort")) {
        var sel = document.getElementById("cxSort");
        if (sel) {
          sel.value = t.getAttribute("data-aw-sort");
          sel.dispatchEvent(new Event("change", { bubbles: true }));
        }
        sh.classList.remove("aw-on");
        return;
      }
      if (t.hasAttribute("data-aw-skin")) {
        var id = t.getAttribute("data-aw-skin");
        try { localStorage.setItem("ronin_hp_theme", id); } catch (e2) {}
        document.documentElement.setAttribute("data-rn-theme", id);
        var all = sh.querySelectorAll("[data-aw-skin]");
        for (var i = 0; i < all.length; i++) all[i].classList.toggle("on", all[i] === t);
      }
    });
    var more = document.getElementById("awMore");
    if (more) more.addEventListener("click", function () {
      sh.classList.add("aw-on");
    });
  }

  function syncNav() {
    var n = document.getElementById("awNav");
    if (!n) return;
    var k = kind();
    var want = k === "mine" ? "mine" : k;
    var items = n.querySelectorAll("[data-aw]");
    for (var i = 0; i < items.length; i++) {
      var id = items[i].getAttribute("data-aw");
      items[i].classList.toggle("on", id === want);
      if (id === "more" && (want === "mine" || want === "series")) items[i].classList.add("on");
    }
  }

  function sync() {
    var body = document.body;
    if (!body) return;
    var onCinema = !!document.querySelector(".cx-wrap") || !!document.getElementById("cxGrid");
    if (onCinema && !body.classList.contains("aw-light")) body.classList.add("aw-light");
    if (!onCinema) {
      if (body.classList.contains("aw-light")) body.classList.remove("aw-light");
      return;
    }
    var k = kind();
    if (body.getAttribute("data-aw-kind") !== k) body.setAttribute("data-aw-kind", k);
    if (k === "anime") {
      if (!body.classList.contains("cx-anime-mode")) body.classList.add("cx-anime-mode");
      var rail = document.getElementById("cxAnimeRail");
      if (rail && rail.hidden && rail.querySelector(".cx-ar-card")) rail.hidden = false;
    }
    build();
    syncNav();
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", "#fdfcff");
  }

  css();
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", sync);
  else sync();
  setInterval(sync, 700);
})();
