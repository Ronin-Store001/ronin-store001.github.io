/* RONIN THEME PACK — theme-pack2.js
   • «طلای رونین» از فهرست تم‌ها حذف می‌شود (اگر انتخاب شده بود، خودکار به نئو برمی‌گردد)
   • چهار تم تازه: سحابی بنفش، یشم شرقی، اقیانوس عمیق، نوآر تک‌رنگ
   • یک انتخابگر تم تازه در «تنظیمات» با پیش‌نمایش رنگ
   تم‌های قبلی (نئو، شکوفه، سایبر، خاکستر) دست‌نخورده می‌مانند. */
"use strict";
(function () {
  if (window.__themePack2) return;
  window.__themePack2 = true;

  var KEY = "ronin_hp_theme";
  var T = [
    { id: "neo", n: "نئو رین سیتی", ic: "🌧", c: ["#8ef0ff", "#7c5cff", "#0b1020"] },
    { id: "sakura", n: "شکوفهٔ سرخ", ic: "🌸", c: ["#ff8ec4", "#ff5c9e", "#2a0b1c"] },
    { id: "cyber", n: "سایبر نئون", ic: "⚡", c: ["#5df0b0", "#22d3ee", "#04140f"] },
    { id: "ember", n: "خاکستر سرخ", ic: "🔥", c: ["#ff7a5c", "#ff5470", "#280a08"] },
    { id: "nebula", n: "سحابی بنفش", ic: "🌌", c: ["#b8a6ff", "#7c5cff", "#0d0824"] },
    { id: "jade", n: "یشم شرقی", ic: "🍃", c: ["#8ff0c0", "#20b486", "#04180f"] },
    { id: "ocean", n: "اقیانوس عمیق", ic: "🌊", c: ["#7fd8ff", "#2b7cff", "#031428"] },
    { id: "mono", n: "نوآر تک‌رنگ", ic: "🖤", c: ["#e6ecf5", "#98a3b8", "#0a0c12"] }
  ];
  var PAL = {
    nebula: "--bg1:#150f34;--bg2:#0e0a24;--bg3:#070412;--a1:rgba(180,166,255,.42);--a2:rgba(124,92,255,.32);" +
      "--a3:rgba(255,120,220,.22);--hG1:#c9bcff;--hG2:#7c5cff;--hG3:#efe8ff;--mk1:#9b86ff;--mk2:#d0c4ff;" +
      "--acc:#d8cfff;--accBg:rgba(124,92,255,.14);--accBd:rgba(124,92,255,.4);--r3:rgba(124,92,255,.42)",
    jade: "--bg1:#062018;--bg2:#04170f;--bg3:#020d08;--a1:rgba(143,240,192,.4);--a2:rgba(32,180,134,.3);" +
      "--a3:rgba(210,255,120,.2);--hG1:#a8ffd4;--hG2:#20b486;--hG3:#eafff4;--mk1:#35d69b;--mk2:#a8ffd4;" +
      "--acc:#b6ffe0;--accBg:rgba(32,180,134,.14);--accBd:rgba(32,180,134,.4);--r3:rgba(32,180,134,.4)",
    ocean: "--bg1:#04182f;--bg2:#031226;--bg3:#010a17;--a1:rgba(127,216,255,.4);--a2:rgba(43,124,255,.3);" +
      "--a3:rgba(120,255,220,.2);--hG1:#a5e6ff;--hG2:#2b7cff;--hG3:#eaf7ff;--mk1:#3f97ff;--mk2:#a5e6ff;" +
      "--acc:#bfe6ff;--accBg:rgba(43,124,255,.14);--accBd:rgba(43,124,255,.4);--r3:rgba(43,124,255,.4)",
    mono: "--bg1:#12151c;--bg2:#0c0e13;--bg3:#06070a;--a1:rgba(198,210,228,.32);--a2:rgba(150,165,190,.24);" +
      "--a3:rgba(255,255,255,.14);--hG1:#f2f6ff;--hG2:#9aa7bd;--hG3:#ffffff;--mk1:#b9c4d6;--mk2:#eef3fb;" +
      "--acc:#e3e9f4;--accBg:rgba(200,212,230,.1);--accBd:rgba(200,212,230,.28);--r3:rgba(200,212,230,.26)"
  };
  var GLOBAL = {
    nebula: "--cy:#c9bcff;--vio:#7c5cff;--mag:#ff78dc;--r-cy:rgba(201,188,255,.42);--r-vio:rgba(124,92,255,.4);--r-mg:rgba(255,120,220,.34)",
    jade: "--cy:#a8ffd4;--vio:#20b486;--mag:#d2ff78;--r-cy:rgba(168,255,212,.4);--r-vio:rgba(32,180,134,.4);--r-mg:rgba(210,255,120,.3)",
    ocean: "--cy:#a5e6ff;--vio:#2b7cff;--mag:#78ffdc;--r-cy:rgba(165,230,255,.4);--r-vio:rgba(43,124,255,.4);--r-mg:rgba(120,255,220,.3)",
    mono: "--cy:#eef3fb;--vio:#9aa7bd;--mag:#c9d3e3;--r-cy:rgba(238,243,251,.3);--r-vio:rgba(154,167,189,.28);--r-mg:rgba(201,211,227,.24)"
  };

  var CSS = [];
  Object.keys(PAL).forEach(function (id) {
    CSS.push(".hpBan[data-hp-theme=" + id + "]{" + PAL[id] + "}");
    CSS.push("html[data-rn-theme=" + id + "]{" + GLOBAL[id] + "}");
  });
  CSS.push("[data-hptheme=gold]{display:none!important}");
  CSS.push("#rnThemeCard{margin:0 0 14px}");
  CSS.push(".rtw{border-radius:18px;border:1px solid rgba(140,160,255,.2);overflow:hidden;",
    "background:linear-gradient(150deg,rgba(23,27,61,.9),rgba(12,15,36,.94))}");
  CSS.push(".rtw-h{display:flex;align-items:center;gap:8px;padding:11px 14px;border-bottom:1px solid rgba(140,160,255,.14)}");
  CSS.push(".rtw-h b{font-size:12px;font-weight:900}.rtw-h span{margin-inline-start:auto;font-size:9.5px;color:#93a0c8}");
  CSS.push(".rtg{display:grid;grid-template-columns:repeat(auto-fit,minmax(112px,1fr));gap:8px;padding:12px 14px}");
  CSS.push(".rtt{position:relative;border:1px solid rgba(140,160,255,.18);border-radius:14px;padding:9px;cursor:pointer;",
    "background:rgba(255,255,255,.03);font:inherit;color:#dfe6ff;text-align:center;transition:.16s}");
  CSS.push(".rtt:hover{border-color:rgba(124,92,255,.5);transform:translateY(-2px)}");
  CSS.push(".rtt.on{border-color:rgba(124,92,255,.9);box-shadow:0 0 0 1px rgba(124,92,255,.5) inset}");
  CSS.push(".rtt .sw{height:26px;border-radius:9px;margin-bottom:7px;display:flex;overflow:hidden}");
  CSS.push(".rtt .sw i{flex:1}");
  CSS.push(".rtt .tn{font-size:10px;font-weight:800}");
  CSS.push(".rtt .ti{font-size:14px;display:block;margin-bottom:2px}");
  CSS.push(".rtt.on::after{content:'';position:absolute;top:6px;inset-inline-end:6px;width:7px;height:7px;border-radius:50%;",
    "background:#8ef0ff;box-shadow:0 0 10px #8ef0ff}");
  var st = document.createElement("style");
  st.id = "tp2Css";
  st.textContent = CSS.join("");
  (document.head || document.documentElement).appendChild(st);

  function stored() {
    try { return localStorage.getItem(KEY) || "neo"; } catch (e) { return "neo"; }
  }
  function known(id) {
    for (var i = 0; i < T.length; i++) if (T[i].id === id) return true;
    return false;
  }

  /* تم طلایی بازنشسته شد */
  (function retireGold() {
    var s = stored();
    if (s === "gold") {
      try { localStorage.setItem(KEY, "neo"); } catch (e) {}
      document.documentElement.setAttribute("data-rn-theme", "neo");
    }
    Array.prototype.forEach.call(document.querySelectorAll('[data-hptheme="gold"]'), function (b) {
      if (b.parentNode) b.parentNode.removeChild(b);
    });
  })();

  function apply(id, quiet) {
    if (!known(id)) id = "neo";
    try { localStorage.setItem(KEY, id); } catch (e) {}
    document.documentElement.setAttribute("data-rn-theme", id);
    var ban = document.querySelector(".hpBan");
    if (ban) ban.setAttribute("data-hp-theme", id);
    var t = null;
    for (var i = 0; i < T.length; i++) if (T[i].id === id) t = T[i];
    Array.prototype.forEach.call(document.querySelectorAll("#rnThemeCard .rtt"), function (b) {
      b.classList.toggle("on", b.getAttribute("data-rtt") === id);
    });
    if (!quiet && window.R && R.toast) R.toast("تم سایت: " + (t ? t.n : id) + " " + (t ? t.ic : ""), "ok");
  }

  function tiles() {
    return T.map(function (t) {
      return '<button class="rtt" type="button" data-rtt="' + t.id + '" title="' + t.n + '">' +
        '<span class="sw"><i style="background:' + t.c[0] + '"></i>' +
        '<i style="background:' + t.c[1] + '"></i>' +
        '<i style="background:' + t.c[2] + '"></i></span>' +
        '<span class="ti">' + t.ic + '</span><span class="tn">' + t.n + "</span></button>";
    }).join("");
  }

  function card() {
    var sec = document.getElementById("sec-settings");
    if (!sec || document.getElementById("rnThemeCard")) return;
    var box = document.createElement("div");
    box.id = "rnThemeCard";
    box.innerHTML = '<div class="rtw"><div class="rtw-h"><b>🎨 تم سایت</b>' +
      '<span>روی هدر، کارت‌ها و صفحهٔ فیلم اثر می‌گذارد</span></div>' +
      '<div class="rtg">' + tiles() + "</div></div>";
    var head = sec.querySelector(".head");
    var first = sec.querySelector(".card");
    if (head && head.parentNode) head.parentNode.insertBefore(box, head.nextSibling);
    else if (first && first.parentNode) first.parentNode.insertBefore(box, first);
    else sec.insertBefore(box, sec.firstChild);
    box.addEventListener("click", function (e) {
      var b = e.target.closest("[data-rtt]");
      if (b) apply(b.getAttribute("data-rtt"));
    });
    apply(stored(), true);
  }

  /* اگر لایهٔ هیرو تم را برگرداند، تم انتخاب‌شده را دوباره می‌نشانیم */
  setInterval(function () {
    var want = stored();
    if (want === "gold") return;
    if (!known(want)) return;
    if (document.documentElement.getAttribute("data-rn-theme") !== want) {
      document.documentElement.setAttribute("data-rn-theme", want);
    }
    var ban = document.querySelector(".hpBan");
    if (ban && ban.getAttribute("data-hp-theme") !== want) ban.setAttribute("data-hp-theme", want);
    var g = document.querySelector('[data-hptheme="gold"]');
    if (g && g.parentNode) g.parentNode.removeChild(g);
  }, 1500);

  function boot() {
    card();
    if (!document.getElementById("rnThemeCard")) setTimeout(boot, 900);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  [1200, 2600, 5000].forEach(function (ms) { setTimeout(card, ms); });

  window.__themePack = { themes: T, apply: apply, removeGold: true };
})();
