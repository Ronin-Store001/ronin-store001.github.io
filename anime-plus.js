/* RONIN ANIME PLUS — anime-plus.js
   ارتقای صفحهٔ انیمه با استاندارد سایت‌های جهانی انیمه (MyAnimeList / AniList / Crunchyroll):
   نوار آمار کاتالوگ، ریل استودیوها، رتبهٔ کارت‌ها و اطلاعات قسمت روی هر کارت. */
"use strict";
(function () {
  if (window.__cxAnimePlus) return;
  window.__cxAnimePlus = true;

  function fa(s) { return String(s).replace(/[0-9]/g, function (d) { return "۰۱۲۳۴۵۶۷۸۹"[d]; }); }
  function num(n) { var v = parseFloat(n); return isFinite(v) ? v : 0; }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function cat() {
    try { return (window.RoninCinema && RoninCinema.catalog()) || []; } catch (e) { return []; }
  }
  function anime() { return cat().filter(function (x) { return x.kind === "anime"; }); }
  function animeOn() {
    try {
      var s = window.RoninCinema && RoninCinema.state;
      if (s) return s.kind === "anime" && !s.mine;
    } catch (e) {}
    return document.body.classList.contains("cx-anime-mode");
  }
  function railHTML() {
    var list = anime().slice().sort(function (a, b) { return num(b.rate) - num(a.rate); }).slice(0, 10);
    if (!list.length) return "";
    return '<div class="cx-ar-head"><b>🔥 محبوب‌ترین انیمه‌ها</b><span>RONIN TOP ' + fa(list.length) + '</span></div>' +
      '<div class="cx-ar-track">' + list.map(function (x, i) {
        var r = num(x.rate), g = i < 3 ? " g" + (i + 1) : "";
        var h = 0, s = String(x.id || x.title);
        for (var k = 0; k < s.length; k++) h = (h * 31 + s.charCodeAt(k)) % 360;
        return '<button class="cx-ar-card" type="button" data-id="' + esc(x.id) + '">' +
          '<span class="cx-ar-rank' + g + '">' + fa(i + 1) + '</span>' +
          '<span class="cx-ar-art" style="background:linear-gradient(150deg,hsl(' + h + ' 68% 30%),hsl(' + ((h + 45) % 360) + ' 72% 18%))">' +
            (x.poster ? '<img src="' + esc(x.poster) + '" alt="' + esc(x.title) + '" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">' : "<i>🌸</i>") +
            '<span class="cx-ar-play">▶</span></span>' +
          '<span class="cx-ar-meta"><b>' + esc(x.title) + '</b><small>★ ' + fa(r.toFixed(1)) +
          " • " + esc(x.studio || x.country || "") + '</small><span class="cx-ar-bar"><i style="width:' +
          Math.max(4, Math.min(100, Math.round(r * 10))) + '%"></i></span></span></button>';
      }).join("") + "</div>";
  }
  function syncMode() {
    if (!animeOn()) return;
    if (!document.body.classList.contains("cx-anime-mode")) document.body.classList.add("cx-anime-mode");
    var rail = document.getElementById("cxAnimeRail");
    if (rail && (rail.hidden || !rail.querySelector(".cx-ar-card"))) {
      if (!rail.querySelector(".cx-ar-card")) rail.innerHTML = railHTML();
      rail.hidden = false;
    }
  }
  function byId(id) {
    var l = cat();
    for (var i = 0; i < l.length; i++) if (l[i].id === id) return l[i];
    return null;
  }

  var CSS = [
    "#cxAnStats{display:grid;grid-template-columns:repeat(auto-fit,minmax(126px,1fr));gap:10px;margin:0 0 14px}",
    "#cxAnStats[hidden]{display:none}",
    ".cx-an-stat{position:relative;padding:11px 12px;border-radius:14px;overflow:hidden;",
    "  background:linear-gradient(160deg,rgba(24,28,58,.92),rgba(12,15,32,.9));",
    "  border:1px solid rgba(140,160,255,.16)}",
    ".cx-an-stat::after{content:'';position:absolute;inset-inline-start:-30px;top:-30px;width:80px;height:80px;",
    "  border-radius:50%;background:radial-gradient(circle,rgba(255,79,216,.22),transparent 70%);pointer-events:none}",
    ".cx-an-stat span{display:block;font-size:9.5px;font-weight:800;letter-spacing:1px;color:#93a2c8;margin-bottom:5px}",
    ".cx-an-stat b{display:block;font-size:18px;font-weight:900;color:#eaf2ff;line-height:1.1;direction:ltr;text-align:start}",
    ".cx-an-stat b small{font-size:10px;font-weight:700;color:#9fb0d8;direction:rtl;margin-inline-start:3px}",
    ".cx-an-stat i{position:absolute;inset-inline-end:10px;bottom:8px;font-size:16px;opacity:.4;font-style:normal}",
    ".cx-an-stat.accent{border-color:rgba(255,79,216,.34);background:linear-gradient(160deg,rgba(58,18,58,.94),rgba(16,12,34,.92))}",
    "#cxAnStudios{margin:0 0 16px}",
    "#cxAnStudios[hidden]{display:none}",
    ".cx-an-shead{display:flex;align-items:center;gap:8px;margin:0 0 9px}",
    ".cx-an-shead b{font-size:13px;font-weight:900;color:#e8efff}",
    ".cx-an-shead span{font-size:9px;font-weight:800;letter-spacing:2px;color:#8d9cc4;margin-inline-start:auto}",
    ".cx-an-studios{display:flex;gap:8px;overflow-x:auto;padding-bottom:3px;scrollbar-width:none;",
    "  scroll-snap-type:x proximity;-webkit-overflow-scrolling:touch;overscroll-behavior-x:contain}",
    ".cx-an-studios::-webkit-scrollbar{display:none}",
    ".cx-an-studio{flex:0 0 auto;scroll-snap-align:start;display:inline-flex;align-items:center;gap:7px;",
    "  height:34px;padding:0 12px;border-radius:12px;cursor:pointer;font:inherit;font-size:11px;font-weight:800;",
    "  color:#dbe4ff;background:rgba(255,255,255,.05);border:1px solid rgba(140,160,255,.2);white-space:nowrap;",
    "  transition:.16s}",
    ".cx-an-studio:hover{color:#fff;border-color:rgba(255,79,216,.55);background:rgba(255,79,216,.14);transform:translateY(-1px)}",
    ".cx-an-studio b{font-size:9.5px;font-weight:900;color:#0a0f22;background:linear-gradient(135deg,#8ef0ff,#ff7ad9);",
    "  padding:2px 6px;border-radius:7px;direction:ltr}",
    ".cx-card .cx-an-rank{position:absolute;top:8px;inset-inline-start:8px;z-index:4;display:grid;",
    "  place-items:center;min-width:24px;height:24px;padding:0 6px;border-radius:9px;font-size:11px;font-weight:900;",
    "  color:#0a0f22;background:linear-gradient(135deg,#ffe066,#ff9f43);box-shadow:0 8px 18px -10px #000;direction:ltr}",
    ".cx-card .cx-an-info{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-top:5px;",
    "  font-size:9.5px;font-weight:700;color:#9fb0d8}",
    ".cx-card .cx-an-info i{font-style:normal;padding:1px 6px;border-radius:6px;background:rgba(124,92,255,.18);",
    "  border:1px solid rgba(124,92,255,.26);color:#c6d2ff}",
    ".cx-card .cx-an-info i.ok{background:rgba(46,204,113,.14);border-color:rgba(46,204,113,.3);color:#8ef0b8}",
    "@media (max-width:760px){#cxAnStats{grid-template-columns:repeat(2,1fr);gap:8px}",
    "  .cx-an-stat b{font-size:15px}.cx-an-stat{padding:9px 10px}}"
  ].join("");
  var st = document.createElement("style");
  st.id = "cxAnimePlusCss";
  st.textContent = CSS;
  (document.head || document.documentElement).appendChild(st);

  function box(id, cls) {
    var el = document.getElementById(id);
    if (!el) {
      el = document.createElement("div");
      el.id = id;
      if (cls) el.className = cls;
    }
    return el;
  }

  function statsHTML() {
    var list = anime();
    if (!list.length) return "";
    var sum = 0, rated = 0, playable = 0, gens = {}, studios = {};
    list.forEach(function (x) {
      var r = num(x.rate);
      if (r) { sum += r; rated++; }
      if (x.sources && x.sources.length) playable++;
      (x.genres || []).forEach(function (g) { gens[g] = (gens[g] || 0) + 1; });
      if (x.studio) studios[x.studio] = (studios[x.studio] || 0) + 1;
    });
    var avg = rated ? sum / rated : 0;
    var topG = Object.keys(gens).sort(function (a, b) { return gens[b] - gens[a]; })[0] || "—";
    var cards = [
      ["میانگین امتیاز", fa(avg.toFixed(1)), "از ۱۰", "★", "accent"],
      ["تعداد انیمه", fa(list.length), "عنوان", "🌸", ""],
      ["استودیوها", fa(Object.keys(studios).length), "استودیو", "🎬", ""],
      ["ژانر برتر", esc(topG), fa(gens[topG] || 0) + " عنوان", "🎴", ""],
      ["قابل پخش", fa(playable), "عنوان", "▶", ""]
    ];
    return cards.map(function (c) {
      return '<div class="cx-an-stat ' + c[4] + '"><span>' + c[0] + '</span><b>' + c[1] +
        '<small>' + c[2] + '</small></b><i>' + c[3] + "</i></div>";
    }).join("");
  }

  function studiosHTML() {
    var list = anime(), m = {};
    list.forEach(function (x) { if (x.studio) m[x.studio] = (m[x.studio] || 0) + 1; });
    var arr = Object.keys(m).sort(function (a, b) { return m[b] - m[a]; }).slice(0, 12);
    if (!arr.length) return "";
    return '<div class="cx-an-shead"><b>🏯 استودیوها</b><span>STUDIOS</span></div>' +
      '<div class="cx-an-studios">' + arr.map(function (s) {
        return '<button class="cx-an-studio" type="button" data-an-studio="' + esc(s) + '">' +
          esc(s) + "<b>" + fa(m[s]) + "</b></button>";
      }).join("") + "</div>";
  }

  function paintBars() {
    var main = document.querySelector(".cx-main");
    if (!main) return;
    var head = main.querySelector(".cx-head");
    if (!head) return;
    var stats = box("cxAnStats");
    if (stats.parentNode !== main || stats.previousElementSibling !== head) head.insertAdjacentElement("afterend", stats);
    var stud = box("cxAnStudios");
    if (!stud.parentNode) {
      var chips = document.getElementById("cxChips");
      if (chips && chips.parentNode === main) chips.insertAdjacentElement("beforebegin", stud);
      else main.appendChild(stud);
    }
    var on = animeOn();
    stats.hidden = !on;
    stud.hidden = !on;
    if (!on) { stats.innerHTML = ""; stud.innerHTML = ""; return; }
    var sh = statsHTML(), st2 = studiosHTML();
    if (stats.innerHTML !== sh) stats.innerHTML = sh;
    if (stud.innerHTML !== st2) stud.innerHTML = st2;
  }

  function paintCards() {
    var grid = document.getElementById("cxGrid");
    if (!grid || !animeOn()) return;
    var list = anime().slice().sort(function (a, b) { return num(b.rate) - num(a.rate); });
    var rank = {};
    list.slice(0, 10).forEach(function (x, i) { rank[x.id] = i + 1; });
    Array.prototype.forEach.call(grid.querySelectorAll(".cx-card[data-kind='anime']"), function (c) {
      var id = c.getAttribute("data-id");
      var it = byId(id);
      if (!it) return;
      var post = c.querySelector(".cx-post") || c;
      var r = rank[id];
      if (r && !post.querySelector(".cx-an-rank")) {
        var b = document.createElement("span");
        b.className = "cx-an-rank";
        b.textContent = "#" + fa(r);
        b.title = "رتبهٔ " + fa(r) + " بر اساس امتیاز";
        post.appendChild(b);
      }
      var body = c.querySelector(".cx-body");
      if (!body || body.querySelector(".cx-an-info")) return;
      var bits = [];
      if (it.eps && it.eps.length) bits.push("<i>" + fa(it.eps.length) + " قسمت</i>");
      if (it.studio) bits.push("<i>" + esc(it.studio) + "</i>");
      if (it.sources && it.sources.length) bits.push('<i class="ok">▶ پخش</i>');
      if (!bits.length) return;
      var d = document.createElement("div");
      d.className = "cx-an-info";
      d.innerHTML = bits.join("");
      body.appendChild(d);
    });
  }

  function refresh() {
    try { syncMode(); paintBars(); paintCards(); } catch (e) {}
  }

  function hook() {
    var grid = document.getElementById("cxGrid");
    if (grid && window.MutationObserver) {
      new MutationObserver(function () { setTimeout(refresh, 40); }).observe(grid, { childList: true });
    }
    var main = document.querySelector(".cx-main");
    if (main && window.MutationObserver) {
      new MutationObserver(function () { setTimeout(paintBars, 60); }).observe(main, { childList: true, subtree: false });
    }
    document.addEventListener("click", function (e) {
      var s = e.target.closest ? e.target.closest("[data-an-studio]") : null;
      if (s) {
        var q = document.getElementById("cxq");
        if (q) {
          q.value = s.getAttribute("data-an-studio");
          q.dispatchEvent(new Event("input", { bubbles: true }));
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
        return;
      }
      setTimeout(refresh, 160);
    }, true);
  }

  function start() {
    refresh();
    hook();
    [300, 900, 1800, 3200].forEach(function (ms) { setTimeout(refresh, ms); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
