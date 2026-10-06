/* ═══════════════════════════════════════════════════════════════
   RONIN STORE — MENU  ·  ronin-menu.js
   فقط اسم و آیکن منوها را معنی‌دار و دسته‌بندی‌شده می‌کند.
   به data-go / دسترسی‌ها / قابلیت‌ها دست نمی‌زند.
   ═══════════════════════════════════════════════════════════════ */
"use strict";
(function () {

  /* گروه‌ها — هر گروه با یکی از آیتم‌های داخلش شناسایی می‌شود */
  var GROUPS = [
    { key: "anime",     ic: "🎬", name: "دنیای انیمه" },
    { key: "community", ic: "💬", name: "جامعه رونین" },
    { key: "market",    ic: "🛍", name: "بازار رونین" },
    { key: "profile",   ic: "👤", name: "حساب من" },
    { key: "team",      ic: "🛡", name: "مدیریت تیم" }
  ];

  /* آیتم‌های منو */
  var ITEMS = {
    home:      { ic: "🏠", name: "خانه" },
    anime:     { ic: "🎬", name: "انیمه" },
    news:      { ic: "📰", name: "اخبار انیمه" },
    bulletin:  { ic: "📣", name: "اطلاعیه و تریلر" },
    discover:  { ic: "🧭", name: "کشف تازه‌ها" },
    rank:      { ic: "🏆", name: "رتبه‌بندی" },
    events:    { ic: "📅", name: "رویدادها" },
    community: { ic: "👥", name: "انجمن" },
    chat:      { ic: "💬", name: "چت عمومی" },
    groups:    { ic: "🏯", name: "گروه‌های چت" },
    market:    { ic: "🛒", name: "فروشگاه" },
    ads:       { ic: "📢", name: "تبلیغات و آگهی" },
    profile:   { ic: "👤", name: "پروفایل" },
    premium:   { ic: "💎", name: "پرمیوم" },
    settings:  { ic: "⚙", name: "تنظیمات" },
    team:      { ic: "🛡", name: "شبکه فرماندهی" },
    owner:     { ic: "👑", name: "پنل مالک" }
  };

  /* عنوان بخش‌ها داخل صفحه */
  var TITLES = { bulletin: "📣 اطلاعیه و تریلر" };

  function railItem(go) {
    return document.querySelector('#rail .ditem[data-go="' + go + '"]');
  }

  function groupOf(node) {
    var g = node;
    while (g && g.nodeType === 1) {
      if (g.classList && g.classList.contains("rgroup")) return g;
      g = g.parentNode;
    }
    return null;
  }

  /* متن را عوض می‌کند ولی <i> و شمارنده‌ها (مثل #ownCount) سالم می‌مانند */
  function setLabel(node, ic, name) {
    if (!node) return;
    var i = node.querySelector("i");
    if (i && ic) i.textContent = ic;

    /* ۱) اگر اسم داخل <span> است (سرگروه‌ها) — فقط همان span */
    var spans = node.querySelectorAll("span"), sp = null, k;
    for (k = 0; k < spans.length; k++) {
      if (!spans[k].classList.contains("cnt")) { sp = spans[k]; break; }
    }
    if (sp) { sp.textContent = name; return; }

    /* ۲) وگرنه متن مستقیم داخل خود عنصر */
    var texts = [];
    for (k = 0; k < node.childNodes.length; k++) {
      if (node.childNodes[k].nodeType === 3) texts.push(node.childNodes[k]);
    }
    if (texts.length) { texts[0].nodeValue = name; return; }

    /* ۳) اگر هیچ متنی نبود، بساز */
    node.insertBefore(document.createTextNode(name), i ? i.nextSibling : node.firstChild);
  }

  function doGroups() {
    for (var n = 0; n < GROUPS.length; n++) {
      var G = GROUPS[n];
      var it = railItem(G.key);
      if (!it) continue;
      var g = groupOf(it);
      if (!g) continue;
      var h = g.querySelector(".rghead");
      if (!h) continue;
      setLabel(h, G.ic, G.name);
    }
  }

  function doItems() {
    Object.keys(ITEMS).forEach(function (go) {
      var it = railItem(go);
      if (!it) return;
      setLabel(it, ITEMS[go].ic, ITEMS[go].name);
    });
  }

  function doTitles() {
    Object.keys(TITLES).forEach(function (go) {
      var sec = document.getElementById("sec-" + go);
      if (!sec) return;
      var h = sec.querySelector(".h2");
      if (h) h.textContent = TITLES[go];
    });
  }

  function run() {
    try { doGroups(); doItems(); doTitles(); } catch (e) {}
  }

  run();
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run);
  [400, 1000, 1800, 3000, 5000].forEach(function (ms) { setTimeout(run, ms); });
})();
