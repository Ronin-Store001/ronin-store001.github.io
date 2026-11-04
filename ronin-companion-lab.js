/* ═══════════════════════════════════════════════════════════════
   RONIN STORE — COMPANION LAB v2
   🔦 چراغ‌قوه • 🔎 جستجو • 🏁 تور شروع کار • 💬 بپرس
   سبک: بدون تصویر خارجی، بدون حلقه‌ی دائمی، بدون کتابخانه
   ───────────────────────────────────────────────────────────────
   تغییرات v2:
   ۱) آیتم‌های منو با R.npcMenuExtras به منوی همراه داده می‌شوند
      (قبلاً با تایمر و MutationObserver چسبانده می‌شدند و ممکن بود
      بعد از innerHTML شدن منو دیده نشوند).
   ۲) گزینهٔ «🔎 جستجو» اضافه شد و مودال جستجوی خود سایت را باز
      می‌کند (قبلاً فقط پنل «بپرس» بود).
   ۳) چراغ‌قوه از box-shadow غول‌آسا به radial-gradient متحرک با
      متغیرهای --tx/--ty تغییر کرد؛ نرم‌تر، بدون پرش و سبک‌تر.
   ═══════════════════════════════════════════════════════════════ */
"use strict";
(function () {
  if (!window.R || R.__rcpLab) return;
  R.__rcpLab = true;

  function el(i) { return document.getElementById(i); }
  function npc() { return el("gninja"); }
  function lite() {
    return !!(R.lite || (window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion:reduce)").matches));
  }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function num(n) { return R.fa ? R.fa(n) : String(n); }
  function say(t, ms) { if (R.npcSay) R.npcSay(t, ms); }

  /* ── ۱. استایل (یک‌بار) ───────────────────────────────────── */
  if (!el("rcplab-css")) {
    var st = document.createElement("style");
    st.id = "rcplab-css";
    st.textContent =
      /* احساسات */
      "#gninja .mH,#gninja .mW,#gninja .brw{opacity:0;transition:opacity .16s}" +
      "#gninja .nEye{transform-box:fill-box;transform-origin:center;transition:transform .16s}" +
      "#gninja.emo-happy .mN{opacity:0}#gninja.emo-happy .mH{opacity:1}" +
      "#gninja.emo-happy .nEye{transform:scaleY(.3)}" +
      "#gninja.emo-wow .mN{opacity:0}#gninja.emo-wow .mW{opacity:1}" +
      "#gninja.emo-wow .nEye{transform:scale(1.3)}" +
      "#gninja.emo-angry .brw{opacity:1}#gninja.emo-angry .nEye{transform:scaleY(.65)}" +
      /* چراغ‌قوه — نور با radial-gradient جابه‌جا می‌شود */
      "#gninja .nLens{transition:fill .2s}" +
      "#gninja.torch-on .nLens{fill:#fff8c9}" +
      "#gninja.torch-on .nTorch{filter:drop-shadow(0 0 8px rgba(255,246,180,.95))}" +
      "#gninja.torch-on #njArm{animation:none!important}" +
      "#rcpTorch{position:fixed;inset:0;z-index:86;pointer-events:none;opacity:0;" +
        "transition:opacity .22s;will-change:opacity;" +
        "background:radial-gradient(circle 170px at var(--tx,50%) var(--ty,50%)," +
        "rgba(255,247,205,.16) 0%,rgba(255,247,205,.07) 45%," +
        "rgba(3,5,12,.55) 72%,rgba(3,5,12,.9) 100%)}" +
      "#rcpTorch.on{opacity:1}" +
      "@media(max-width:640px){#rcpTorch{background:radial-gradient(circle 115px at var(--tx,50%) var(--ty,50%)," +
        "rgba(255,247,205,.16) 0%,rgba(255,247,205,.07) 45%," +
        "rgba(3,5,12,.58) 74%,rgba(3,5,12,.92) 100%)}}" +
      "#rcpTorchBtn{position:fixed;z-index:96;width:40px;height:40px;border-radius:50%;font-size:18px;" +
        "display:none;place-items:center;background:rgba(12,16,32,.94);" +
        "border:1px solid rgba(189,238,99,.55);color:#eaffc4;cursor:pointer;padding:0}" +
      "#rcpTorchBtn.on{display:grid}" +
      "#rcpTorchBtn.act{background:#bdee63;color:#101426;box-shadow:0 0 16px rgba(189,238,99,.6)}" +
      /* تور و پرسش */
      "#rcpTour,#rcpAsk{position:fixed;z-index:97;inset-inline:12px;bottom:118px;" +
        "max-width:420px;margin:auto;display:none}" +
      "#rcpTour.on,#rcpAsk.on{display:block}" +
      "#rcpTour .card,#rcpAsk .card{background:rgba(10,14,32,.97);" +
        "border:1px solid rgba(189,238,99,.4);box-shadow:0 14px 34px rgba(0,0,0,.5)}" +
      ".rcplab-hi{outline:3px dashed #bdee63;outline-offset:3px;border-radius:14px}" +
      "#rcpAskIn{width:100%}" +
      "#rcpAskOut{font-size:12.5px;line-height:2}";
    document.head.appendChild(st);
  }

  /* ── ۲. احساسات ──────────────────────────────────────────── */
  var emoT = null;
  R.npcEmo = function (s, ms) {
    var n = npc(); if (!n) return;
    n.classList.remove("emo-happy", "emo-angry", "emo-wow");
    if (s) n.classList.add("emo-" + s);
    clearTimeout(emoT);
    if (ms) emoT = setTimeout(function () {
      try { n.classList.remove("emo-" + s); } catch (e) {}
    }, ms);
  };

  /* موفق/خطا → خوشحال/عصبانی */
  var t0 = R.toast;
  if (typeof t0 === "function") {
    R.toast = function (m, k) {
      try { R.npcEmo(k === "err" ? "angry" : "happy", k === "err" ? 1500 : 1200); } catch (e) {}
      return t0.apply(this, arguments);
    };
  }

  /* ── ۳. چراغ‌قوه ─────────────────────────────────────────── */
  var T = { on: false, x: 0, y: 0, raf: 0, bound: false };

  function torchBox() {
    var t = el("rcpTorch");
    if (!t) {
      t = document.createElement("div");
      t.id = "rcpTorch";
      t.setAttribute("aria-hidden", "true");
      document.body.appendChild(t);
    }
    return t;
  }
  function place(x, y) {
    var t = el("rcpTorch");
    if (!t) return;
    t.style.setProperty("--tx", Math.round(x) + "px");
    t.style.setProperty("--ty", Math.round(y) + "px");
  }
  function follow(e) {
    var p = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]) || e;
    if (!p || typeof p.clientX !== "number") return;
    T.x = p.clientX; T.y = p.clientY;
    if (T.raf) return;
    T.raf = requestAnimationFrame(function () { T.raf = 0; place(T.x, T.y); });
  }
  function torchBtn() {
    var b = el("rcpTorchBtn");
    if (b) return b;
    b = document.createElement("button");
    b.id = "rcpTorchBtn";
    b.type = "button";
    b.title = "چراغ‌قوه";
    b.setAttribute("aria-label", "چراغ‌قوه");
    b.textContent = "🔦";
    b.addEventListener("click", function (e) {
      e.preventDefault(); e.stopPropagation();
      toggleTorch();
    });
    document.body.appendChild(b);
    return b;
  }
  function toggleTorch(v) {
    var t = torchBox(), n = npc(), b = torchBtn();
    T.on = (typeof v === "boolean") ? v : !T.on;
    t.classList.toggle("on", T.on);
    b.classList.toggle("act", T.on);
    if (n) n.classList.toggle("torch-on", T.on);
    if (T.on) {
      var r = n ? n.getBoundingClientRect()
        : { left: window.innerWidth - 130, top: window.innerHeight - 230, width: 80, height: 80 };
      T.x = r.left + r.width / 2; T.y = r.top + r.height / 2;
      place(T.x, T.y);
      if (!T.bound) {
        T.bound = true;
        window.addEventListener("pointermove", follow, { passive: true });
        window.addEventListener("pointerdown", follow, { passive: true });
        window.addEventListener("touchmove", follow, { passive: true });
      }
      b.classList.add("on", "act");
      clearTimeout(showTorchBtn._t);
      showTorchBtn();
      R.npcEmo && R.npcEmo("wow", 1600);
      say("چراغ روشن شد 🔦 با انگشت یا ماوس نور را بچرخان", 3800);
    } else {
      b.classList.remove("act");
      say("چراغ خاموش شد 💡", 2200);
      showTorchBtn();
      R.npcEmo && R.npcEmo(null);
    }
  }
  R.npcTorch = toggleTorch;

  function showTorchBtn() {
    var n = npc(), b = torchBtn();
    if (n) {
      var r = n.getBoundingClientRect();
      b.style.left = Math.max(6, Math.round(r.left + r.width * 0.58)) + "px";
      b.style.right = "auto";
      b.style.top = Math.max(6, Math.round(r.top - 36)) + "px";
      b.style.bottom = "auto";
    } else {
      b.style.left = "auto";
      b.style.right = "18px";
      b.style.top = "auto";
      b.style.bottom = "180px";
    }
    b.classList.add("on");
    clearTimeout(showTorchBtn._t);
    showTorchBtn._t = setTimeout(function () { if (!T.on) b.classList.remove("on"); }, 9000);
  }

  /* ── ۴. جستجوی سایت ──────────────────────────────────────── */
  function openSearch(q) {
    q = String(q || "").trim();
    closeMenu();
    closeAsk();
    var i = el("sqIn");
    if (R.mod) R.mod("searchMod", true);
    setTimeout(function () {
      var inp = el("sqIn");
      if (inp) {
        try { inp.focus(); } catch (e) {}
        if (q) {
          inp.value = q;
          try { inp.dispatchEvent(new Event("input", { bubbles: true })); } catch (e) {}
          if (R.search) { try { R.search(q); } catch (e) {} }
        }
      }
      R.npcEmo && R.npcEmo("happy", 1100);
    }, 140);
    if (!el("searchMod") && R.toast) R.toast("بخش جستجو پیدا نشد", "err");
    say(q ? "دارم می‌گردم 🔍" : "دنبال چه می‌گردی؟ 🔍", 2600);
  }
  R.npcSearch = openSearch;

  /* ── ۵. اقلام منوی همراه (companion-plus آن‌ها را می‌سازد) ── */
  R.npcMenuExtras = function () {
    var h = '<button type="button" data-lab="search">🔎 جستجو</button>' +
            '<button type="button" data-lab="torch">🔦 چراغ‌قوه</button>' +
            '<button type="button" data-lab="archive">🥷 آرشیو همراه</button>';
    if (R.isOwner && R.isOwner()) h += '<button type="button" data-lab="tour">🏁 تور سایت</button>';
    return h;
  };

  function closeMenu() {
    var m = el("rcpMenu");
    if (m) m.classList.remove("on");
  }
  function closeAsk() {
    var d = el("rcpAsk");
    if (d) d.classList.remove("on");
  }

  /* ── ۶. تور شروع کار ─────────────────────────────────────── */
  var STEPS = [
    { s: "#rail .ditem", t: "این منوی کناریه — از اینجا بین همه‌ی بخش‌ها جابه‌جا می‌شی 🧭" },
    { s: "#dock", t: "این نوار پایین برای حرکت سریع توی گوشیه 📱" },
    { s: '[data-go="bulletin"]', t: "اطلاعیه‌ها و تریلرها اینجا منتشر می‌شن 📣" },
    { s: '[data-go="market"]', t: "فروشگاه: آگهی بگذار یا کالا ببین 🛒" },
    { s: '[data-go="profile"]', t: "پروفایل و پیشرفتت اینجاست — ماموریت روزانه یادت نره 🏆" }
  ];
  var tour = { i: 0, on: false };

  function tourBox() {
    var d = el("rcpTour");
    if (d) return d;
    d = document.createElement("div");
    d.id = "rcpTour";
    d.innerHTML =
      '<div class="card">' +
        '<div class="between mb">' +
          '<span class="sm b">🏁 تور شروع کار</span>' +
          '<span class="xs cy" id="rcpTourN"></span>' +
        '</div>' +
        '<p class="sm" id="rcpTourT" style="line-height:2"></p>' +
        '<div class="row" style="gap:7px;margin-top:10px">' +
          '<button class="btn p mini" type="button" data-rcptour="next">بعدی ›</button>' +
          '<button class="btn mini" type="button" data-rcptour="skip">رد کن</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(d);
    return d;
  }
  function unhi() {
    var a = document.querySelectorAll(".rcplab-hi");
    for (var i = 0; i < a.length; i++) a[i].classList.remove("rcplab-hi");
  }
  function saveTour(v) {
    if (R.ME && R.upd) R.upd("users/" + R.ME, { tour: v }).catch(function () {});
  }
  function paintTour() {
    var s = STEPS[tour.i];
    if (!s) return endTour(true);
    unhi();
    var tg = document.querySelector(s.s);
    if (tg) {
      tg.classList.add("rcplab-hi");
      try { tg.scrollIntoView({ block: "center", behavior: lite() ? "auto" : "smooth" }); } catch (e) {}
    }
    var tt = el("rcpTourT"), nn = el("rcpTourN");
    if (tt) tt.textContent = s.t;
    if (nn) nn.textContent = num(tour.i + 1) + "/" + num(STEPS.length);
    say(s.t, 6000);
    R.npcEmo && R.npcEmo("happy", 1300);
  }
  function endTour(done) {
    tour.on = false;
    var b = el("rcpTour");
    if (b) b.classList.remove("on");
    unhi();
    saveTour(done ? 9 : 1);
  }
  function nextTour() {
    tour.i++;
    if (tour.i >= STEPS.length) {
      say("تور تموم شد — هر وقت سوال داشتی روی من بزن 🥷", 4600);
      R.npcEmo && R.npcEmo("happy", 2000);
      return endTour(true);
    }
    paintTour();
  }
  function startTour(force) {
    if (!R.ME) {
      if (force && R.toast) R.toast("برای دیدن تور اول وارد شو", "err");
      return;
    }
    if (!force && R.USER && R.USER.tour) return;
    tour.i = 0;
    tour.on = true;
    tourBox().classList.add("on");
    paintTour();
  }
  R.npcTour = startTour;

  /* ── ۷. پاسخ سوال‌های پرتکرار ────────────────────────────── */
  var FAQ = [
    { k: ["آگهی", "فروش", "محصول", "تبلیغ", "کالا"], go: "market", g: "برو به فروشگاه",
      a: "برای آگهی: فروشگاه → «ثبت آگهی»، عنوان و قیمت و عکس را پر کن و منتشر کن. خریدار مستقیم با تو تماس می‌گیرد." },
    { k: ["پرمیوم", "ویژه", "اشتراک", "پول"], go: "premium", g: "دیدن پرمیوم",
      a: "پرمیوم: نشان ویژه، رنگ نام، کاراکترهای بیشتر، ساخت گروه و قابلیت‌های ویژه 💎" },
    { k: ["پست", "نمی‌تونم", "اجازه", "خطا"], go: "community", g: "برو به انجمن",
      a: "برای پست و کامنت و چت باید وارد حساب باشی. اگر وارد شدی و نشد، یک‌بار صفحه را رفرش کن." },
    { k: ["قانون", "بن", "اخطار", "تخلف"], go: "", g: "",
      a: "بدون توهین، بدون اسپم، بدون تبلیغ بی‌ربط. تخلف = اخطار تا بن. متن کامل در فوتر → «قوانین انجمن»." },
    { k: ["اطلاعیه", "اعلان", "خبر", "تریلر"], go: "bulletin", g: "برو به اطلاعیه‌ها",
      a: "اطلاعیه‌ها و تریلرها از بخش «📣 اطلاعیه‌ها» منتشر می‌شن." },
    { k: ["چت", "گروه", "پیام"], go: "chat", g: "برو به چت",
      a: "چت عمومی و گروه‌ها از بخش «💬 چت»؛ پیام خصوصی از صندوق ورودی." },
    { k: ["سطح", "xp", "ماموریت", "جایزه", "دستاورد"], go: "progress", g: "پیشرفت من",
      a: "با پست، کامنت، چت و لایک XP می‌گیری. ماموریت روزانه در «🏆 پیشرفت من»." },
    { k: ["سبد", "خرید", "پرداخت", "سفارش"], go: "cart", g: "سبد خرید",
      a: "سبد خرید برای جمع‌کردن آگهی‌هاست؛ پرداخت آنلاین نداریم و هماهنگی با فروشنده انجام می‌شه." },
    { k: ["کاراکتر", "همراه", "اسکین", "چراغ"], go: "settings", g: "تنظیمات",
      a: "اسکین همراه را از «تنظیمات → آرشیو همراه» عوض کن. چراغ‌قوه هم از منوی خودم می‌آید 🔦" }
  ];

  function askBox() {
    var d = el("rcpAsk");
    if (d) return d;
    d = document.createElement("div");
    d.id = "rcpAsk";
    d.innerHTML =
      '<div class="card">' +
        '<div class="between mb">' +
          '<span class="sm b">💬 بپرس یا جستجو کن</span>' +
          '<button class="icobtn" type="button" data-rcpask="close">✕</button>' +
        '</div>' +
        '<input class="inp" id="rcpAskIn" placeholder="مثلاً: چطور آگهی بگذارم؟">' +
        '<div class="row" style="gap:6px;flex-wrap:wrap;margin:9px 0">' +
          '<button class="btn mini" type="button" data-rcpaskq="آگهی">🛒 آگهی</button>' +
          '<button class="btn mini" type="button" data-rcpaskq="پرمیوم">💎 پرمیوم</button>' +
          '<button class="btn mini" type="button" data-rcpaskq="قوانین">📜 قوانین</button>' +
        '</div>' +
        '<div id="rcpAskOut"></div>' +
      '</div>';
    document.body.appendChild(d);
    var i = el("rcpAskIn");
    if (i) i.addEventListener("keydown", function (e) {
      if (e.key === "Enter") { e.preventDefault(); ask(i.value); }
    });
    return d;
  }
  function askOpen(v) {
    var d = askBox();
    d.classList.add("on");
    var i = el("rcpAskIn");
    if (i) setTimeout(function () { try { i.focus(); } catch (e) {} }, 60);
    if (v) ask(v);
  }
  function askClose() {
    var d = el("rcpAsk");
    if (d) d.classList.remove("on");
  }
  function out(html, go, label) {
    var o = el("rcpAskOut");
    if (!o) return;
    o.innerHTML = '<div class="sm" style="line-height:2">' + html + "</div>" +
      (go ? '<button class="btn p mini mt" type="button" data-rcpgo2="' + go + '">' + esc(label) + "</button>" : "");
  }
  function nav(s) {
    if (!s) return;
    if (document.getElementById("sec-" + s) && R.go) { R.go(s); askClose(); return; }
    if (R.toast) R.toast("این بخش در دسترس نیست", "err");
  }
  function ask(q) {
    q = String(q || "").trim();
    if (!q) return;
    var low = q.toLowerCase(), hit = null;
    for (var i = 0; i < FAQ.length && !hit; i++) {
      var f = FAQ[i];
      for (var j = 0; j < f.k.length; j++) {
        if (low.indexOf(String(f.k[j]).toLowerCase()) > -1) { hit = f; break; }
      }
    }
    if (hit) {
      out(esc(hit.a), hit.go, hit.g);
      R.npcEmo && R.npcEmo("happy", 1300);
      say("پیداش کردم 👇", 2600);
      return;
    }
    out("این را نمی‌شناسم، جستجوی سایت را برایت باز می‌کنم 🔍", "", "");
    openSearch(q);
  }
  R.npcAsk = ask;

  /* ── ۸. کلیک‌ها ─────────────────────────────────────────── */
  document.addEventListener("click", function (e) {
    var t = e.target;
    if (!t || !t.closest) return;

    var lb0 = t.closest("[data-lab]");
    if (lb0) {
      e.preventDefault();
      e.stopPropagation();
      var k0 = lb0.getAttribute("data-lab");
      closeMenu();
      if (k0 === "torch") toggleTorch();
      else if (k0 === "search") openSearch("");
      else if (k0 === "ask") askOpen();
      else if (k0 === "tour") startTour(true);
      else if (k0 === "archive" && R.go) R.go("archive");
      return;
    }

    /* دکمهٔ شناور چراغ‌قوه بعد از مدتی بی‌حرکتی مخفی شود */
    var b = el("rcpTorchBtn");
    if (b && b.classList.contains("on") && !T.on &&
        !t.closest("#rcpTorchBtn") && !t.closest("#gninja")) {
      b.classList.remove("on");
    }

    var tb = t.closest("[data-rcptour]");
    if (tb) {
      e.preventDefault();
      if (tb.getAttribute("data-rcptour") === "skip") endTour(false);
      else nextTour();
      return;
    }
    var ab = t.closest("[data-rcpask]");
    if (ab) { e.preventDefault(); return askClose(); }
    var aq = t.closest("[data-rcpaskq]");
    if (aq) { e.preventDefault(); return ask(aq.getAttribute("data-rcpaskq")); }
    var ag = t.closest("[data-rcpgo2]");
    if (ag) { e.preventDefault(); return nav(ag.getAttribute("data-rcpgo2")); }
  });

  /* Esc همه‌چیز را می‌بندد */
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (T.on) { toggleTorch(false); return; }
    closeAsk();
    closeMenu();
  });

  /* ── ۹. راه‌اندازی ──────────────────────────────────────── */
  function boot() {
    if (R.ME && R.USER && !R.USER.tour) setTimeout(function () { startTour(false); }, 6000);
  }
  var prev = R.onLogin;
  R.onLogin = function () {
    if (prev) { try { prev(); } catch (e) {} }
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
