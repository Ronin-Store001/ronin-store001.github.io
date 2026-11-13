/* RONIN FILM - UX 2
   جست‌وجوی هوشمند با پیشنهاد زنده، فیلتر پیشرفته، حالت لیست، انتخاب شانسی
   هیچ چیزی از منطق قبلی را عوض نمی‌کند: فقط UI می‌سازد و روی همان دکمه‌ها کلیک می‌کند. */
"use strict";
(function () {
  if (window.__cinemaUx2) return;
  window.__cinemaUx2 = true;

  var STATE_KEY = "rn_cinema_f2";
  var RECENT_KEY = "rn_cinema_recent";
  var state = { rate: 0, from: 0, to: 0 };
  try {
    var saved = JSON.parse(localStorage.getItem(STATE_KEY) || "{}");
    if (saved && typeof saved === "object") {
      state.rate = +saved.rate || 0;
      state.from = +saved.from || 0;
      state.to = +saved.to || 0;
    }
  } catch (e) {}

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function saveState() { try { localStorage.setItem(STATE_KEY, JSON.stringify(state)); } catch (e) {} }
  function fa(n) { return String(n).replace(/[0-9]/g, function (d) { return "۰۱۲۳۴۵۶۷۸۹"[d]; }); }
  function debounce(fn, ms) { var t; return function () { clearTimeout(t); t = setTimeout(fn, ms); }; }

  function cardData(el) {
    var title = (el.querySelector(".cx-t") || {}).textContent || "";
    var rate = parseFloat(String((el.querySelector(".cx-rate") || {}).textContent || "").replace(/[^\d.]/g, "")) || 0;
    var year = parseInt(String((el.querySelector(".cx-s") || {}).textContent || "").replace(/[^\d]/g, "").slice(0, 4), 10) || 0;
    var kind = (el.querySelector(".cx-kind") || {}).textContent || "";
    var ph = el.querySelector(".cx-ph");
    return {
      el: el, id: el.getAttribute("data-id") || "",
      title: title.trim(), rate: rate, year: year, kind: kind.trim(),
      emoji: ph ? (ph.textContent || "").trim() : "",
      bg: ph ? ph.getAttribute("style") || "" : ""
    };
  }

  /* ---------- پیشنهاد جست‌وجو ---------- */
  var sugBox = null, sugItems = [], sugIdx = -1;

  function recentList() {
    try { return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]").filter(Boolean).slice(0, 5); }
    catch (e) { return []; }
  }
  function pushRecent(q) {
    q = String(q || "").trim();
    if (q.length < 2) return;
    var arr = recentList().filter(function (x) { return x !== q; });
    arr.unshift(q);
    try { localStorage.setItem(RECENT_KEY, JSON.stringify(arr.slice(0, 5))); } catch (e) {}
  }

  function closeSug() {
    if (sugBox) { sugBox.remove(); sugBox = null; }
    sugItems = []; sugIdx = -1;
  }

  function renderSug(query) {
    var input = $("#cxq");
    if (!input) return;
    var wrap = input.closest(".cx-search");
    if (!wrap) return;
    closeSug();

    var q = String(query || "").trim().toLowerCase();
    var all = $$(".cx-card").map(cardData);
    var rows = [];

    if (!q) {
      var rec = recentList();
      rows = rec.map(function (r) {
        return '<div class="rn-sg" role="option" data-asug-q="' + escAttr(r) + '" aria-selected="false">' +
          '<span class="th">🕘</span><span class="tx"><b>' + escHtml(r) + '</b><span>جست‌وجوی اخیر</span></span></div>';
      });
      if (!rows.length) {
        var top = all.slice().sort(function (a, b) { return b.rate - a.rate; }).slice(0, 5);
        rows = top.map(function (c) { return sugRow(c, "", "پیشنهاد رونین"); });
      }
    } else {
      var hits = all.filter(function (c) {
        var hay = (c.title + " " + c.kind + " " + c.year).toLowerCase();
        return hay.indexOf(q) >= 0;
      }).slice(0, 8);
      rows = hits.map(function (c, i) { return sugRow(c, q, i === 0 ? "بهترین تطابق" : ""); });
      if (!rows.length) {
        rows = ['<div class="rn-sug-h">همهٔ کاتالوگ</div>' +
          '<div class="rn-sg" role="option" data-asug-q="' + escAttr(query) + '" aria-selected="true">' +
          '<span class="th">🔍</span><span class="tx"><b>' + escHtml(query) + '</b><span>جست‌وجو در همهٔ عنوان‌ها</span></span></div>'];
      }
    }
    if (!rows.length) return;

    sugBox = document.createElement("div");
    sugBox.className = "rn-sug";
    sugBox.setAttribute("role", "listbox");
    sugBox.innerHTML = (q ? "" : '<div class="rn-sug-h">جست‌وجوهای اخیر</div>') + rows.join("");
    wrap.appendChild(sugBox);

    sugItems = $$(".rn-sg", sugBox);
    sugIdx = -1;
    sugBox.addEventListener("mousedown", function (e) {
      var row = e.target.closest(".rn-sg");
      if (!row) return;
      e.preventDefault();
      pickSug(row);
    });
  }

  function sugRow(c, q, badge) {
    var title = escHtml(c.title);
    if (q) {
      var re = new RegExp("(" + q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "ig");
      title = escHtml(c.title).replace(re, "<mark>$1</mark>");
    }
    return '<div class="rn-sg" role="option" aria-selected="false" data-asug-id="' + escAttr(c.id) + '">' +
      '<span class="th" style="' + escAttr(c.bg) + '">' + escHtml(c.emoji || "🎬") + "</span>" +
      '<span class="tx"><b>' + title + "</b><span>" + escHtml(c.kind) + (c.year ? " · " + fa(c.year) : "") +
      (badge ? " · " + badge : "") + "</span></span>" +
      (c.rate ? '<span class="rt">★ ' + fa(c.rate) + "</span>" : "") + "</div>";
  }

  function pickSug(row) {
    var id = row.getAttribute("data-asug-id");
    var q = row.getAttribute("data-asug-q");
    var input = $("#cxq");
    if (id) {
      var card = $('.cx-card[data-id="' + id + '"]');
      if (card) {
        if (input) { input.value = (card.querySelector(".cx-t") || {}).textContent || ""; }
        pushRecent(input ? input.value : "");
        closeSug();
        card.click();
        return;
      }
    }
    if (input && q) {
      input.value = q;
      input.dispatchEvent(new Event("input", { bubbles: true }));
      pushRecent(q);
    }
    closeSug();
    input && input.focus();
  }

  function escHtml(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function escAttr(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function bindSearch() {
    var input = $("#cxq");
    if (!input || input.getAttribute("data-ux2")) return;
    input.setAttribute("data-ux2", "1");
    input.setAttribute("autocomplete", "off");
    input.setAttribute("role", "combobox");
    input.setAttribute("aria-expanded", "false");

    var run = debounce(function () {
      if (!input.value.trim()) {
        if (input === document.activeElement) renderSug(""); else closeSug();
        var c0 = document.getElementById("cxqClear");
        if (c0) c0.hidden = true;
        return;
      }
      renderSug(input.value);
      var cls = document.getElementById("cxqClear");
      if (cls) cls.hidden = !input.value;
    }, 110);

    input.addEventListener("input", run);
    input.addEventListener("focus", function () { renderSug(input.value); });
    input.addEventListener("keydown", function (e) {
      if (!sugItems.length) return;
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        sugIdx += e.key === "ArrowDown" ? 1 : -1;
        if (sugIdx < 0) sugIdx = sugItems.length - 1;
        if (sugIdx >= sugItems.length) sugIdx = 0;
        sugItems.forEach(function (r, i) { r.setAttribute("aria-selected", i === sugIdx ? "true" : "false"); });
        sugItems[sugIdx].scrollIntoView({ block: "nearest" });
      } else if (e.key === "Enter") {
        if (sugIdx >= 0) { e.preventDefault(); pickSug(sugItems[sugIdx]); }
      } else if (e.key === "Escape") {
        closeSug();
        input.blur();
      }
    });
    document.addEventListener("click", function (e) {
      if (!sugBox) return;
      if (e.target.closest(".cx-search") || e.target.closest(".rn-sug")) return;
      closeSug();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "/" && !/input|textarea|select/i.test((document.activeElement || {}).tagName || "")) {
        e.preventDefault();
        input.focus();
        if (input.select) input.select();
      }
    });
  }

  /* ---------- فیلتر پیشرفته ---------- */
  function years() {
    var ys = $$(".cx-card").map(cardData).map(function (c) { return c.year; }).filter(Boolean);
    if (!ys.length) return [];
    var min = Math.min.apply(null, ys), max = Math.max.apply(null, ys);
    var out = [];
    for (var y = max; y >= min && out.length < 40; y--) out.push(y);
    return out;
  }

  function openSheet(html, onPick) {
    var sheet = $("#cxSheet");
    if (!sheet) return;
    sheet.hidden = false;
    sheet.innerHTML = '<div class="rn-fs">' + html + "</div>";
    var current = sheet.firstChild;
    current.addEventListener("click", function (e) {
      var b = e.target.closest("[data-fk]");
      var close = e.target.closest("[data-fclose]");
      var apply = e.target.closest("[data-fapply]");
      var reset = e.target.closest("[data-freset]");
      if (close) { sheet.hidden = true; sheet.innerHTML = ""; }
      if (b) onPick(b.getAttribute("data-fk"), b.getAttribute("data-fv"), b);
      if (apply) { sheet.hidden = true; sheet.innerHTML = ""; }
      if (reset) { resetFilters(); sheet.hidden = true; sheet.innerHTML = ""; }
    });
    if (!sheet.getAttribute("data-ux2-bg")) {
      sheet.setAttribute("data-ux2-bg", "1");
      sheet.addEventListener("click", function (e) {
        if (e.target === sheet) { sheet.hidden = true; sheet.innerHTML = ""; }
      });
    }
  }

  function sheetHTML() {
    var kinds = [["all", "همه"], ["anime", "🌸 انیمه"], ["film", "🎬 فیلم"], ["series", "📺 سریال"]];
    var gs = $$(".cx-pill").map(function (p) { return p.getAttribute("data-fg"); }).filter(Boolean).slice(0, 14);
    var onPill = $$(".cx-pill.on")[0];
    var activeGenre = onPill ? onPill.getAttribute("data-fg") : "";
    var onTab = $$(".cx-tab.on")[0];
    var activeKind = onTab ? onTab.getAttribute("data-tab") : "all";
    var ys = years();
    return '<h3>🎛 فیلتر پیشرفته</h3><p>هرچه می‌خواهی انتخاب کن؛ نتیجه همان لحظه روی کاتالوگ اعمال می‌شود.</p>' +
      '<div class="grp"><b>نوع محتوا</b><div class="opt">' +
        kinds.map(function (k) {
          return '<button type="button" data-fk="kind" data-fv="' + k[0] + '"' +
            (activeKind === k[0] ? ' class="on"' : "") + ">" + k[1] + "</button>";
        }).join("") + "</div></div>" +
      '<div class="grp"><b>ژانر</b><div class="opt">' +
        gs.map(function (g) {
          return '<button type="button" data-fk="genre" data-fv="' + escAttr(g) + '"' +
            (g === activeGenre ? ' class="on"' : "") + ">" + escHtml(g) + "</button>";
        }).join("") + "</div></div>" +
      '<div class="grp"><b>حداقل امتیاز</b><div class="opt">' +
        [0, 6, 7, 8, 9].map(function (r) {
          return '<button type="button" data-fk="rate" data-fv="' + r + '"' +
            (state.rate === r ? ' class="on"' : "") + ">" + (r ? "★ " + fa(r) + "+" : "همه") + "</button>";
        }).join("") + "</div></div>" +
      (ys.length ? '<div class="grp"><b>سال تولید</b><div class="opt">' +
        '<button type="button" data-fk="year" data-fv="0">همه</button>' +
        ys.slice(0, 10).map(function (y) {
          return '<button type="button" data-fk="year" data-fv="' + y + '"' +
            (state.from === y && state.to === y ? ' class="on"' : "") + ">" + fa(y) + "</button>";
        }).join("") + "</div></div>" : "") +
      '<div class="ft"><button class="cx-btn p" type="button" data-fapply="1">نمایش نتیجه</button>' +
        '<button class="cx-btn ghost" type="button" data-freset="1">پاک کردن فیلترها</button>' +
        '<button class="cx-btn ghost" type="button" data-fclose="1" aria-label="بستن">✕</button></div>' +
      '<p style="margin:10px 0 0">نکته: ژانر و نوع، روی کاتالوگ اصلی فیلتر می‌کند؛ امتیاز و سال روی نتیجه‌های نمایش‌داده‌شده.</p>';
  }

  function onPick(key, value, btn) {
    if (key === "kind") {
      var tab = $('.cx-tab[data-tab="' + value + '"]');
      if (tab) tab.click();
      $$("[data-fk=kind]").forEach(function (b) { b.classList.toggle("on", b === btn); });
    } else if (key === "genre") {
      var pill = $('.cx-pill[data-fg="' + value + '"]');
      if (pill) pill.click();
      $$("[data-fk=genre]").forEach(function (b) { b.classList.toggle("on", b === btn); });
    } else if (key === "rate") {
      state.rate = +value || 0; saveState(); applyFilters();
      $$("[data-fk=rate]").forEach(function (b) { b.classList.toggle("on", b === btn); });
    } else if (key === "year") {
      state.from = state.to = +value || 0; saveState(); applyFilters();
      $$("[data-fk=year]").forEach(function (b) { b.classList.toggle("on", b === btn); });
    }
  }

  function resetFilters() {
    state = { rate: 0, from: 0, to: 0 };
    saveState();
    var pill = $(".cx-pill.on");
    if (pill) pill.click();
    applyFilters();
  }

  function applyFilters() {
    var cards = $$(".cx-card");
    var shown = 0;
    cards.forEach(function (el) {
      var c = cardData(el);
      var ok = true;
      if (state.rate && c.rate < state.rate) ok = false;
      if (state.from && c.year && c.year < state.from) ok = false;
      if (state.to && c.year && c.year > state.to) ok = false;
      if (el.hidden === ok) el.hidden = !ok;
      else if (ok) el.hidden = false;
      if (ok) shown++;
    });
    var grid = $("#cxGrid");
    var empty = document.getElementById("rnEmpty");
    if (grid) {
      if (!shown && cards.length) {
        if (!empty) {
          empty = document.createElement("div");
          empty.id = "rnEmpty";
          empty.className = "rn-empty";
          empty.innerHTML = "<b>چیزی با این فیلترها پیدا نشد</b><span>امتیاز یا سال را بازتر کن یا فیلترها را پاک کن.</span>";
          grid.appendChild(empty);
        }
      } else if (empty) empty.remove();
    }
    renderChips(shown, cards.length);
  }

  function renderChips(shown, total) {
    var box = $("#cxChips");
    if (!box) return;
    var bits = [];
    if (state.rate) bits.push(chip("حداقل ★ " + fa(state.rate), "rate"));
    if (state.from || state.to) bits.push(chip("سال " + fa(state.from || state.to), "year"));
    var extra = shown !== total ? '<span class="cx-count" style="margin:0">' + fa(shown) + " از " + fa(total) + "</span>" : "";
    var html = bits.join("") + extra;
    if (box.getAttribute("data-h") === html) return;
    box.setAttribute("data-h", html);
    box.innerHTML = html;
    $$("[data-rmc]", box).forEach(function (b) {
      b.addEventListener("click", function () {
        var k = b.getAttribute("data-rmc");
        if (k === "rate") state.rate = 0;
        if (k === "year") state.from = state.to = 0;
        saveState(); applyFilters();
      });
    });
  }
  function chip(label, key) {
    return '<button class="cx-pill on" type="button" data-rmc="' + key + '" title="حذف فیلتر">' + label + " ✕</button>";
  }

  /* ---------- نوار ابزار ---------- */
  function buildToolbar() {
    var head = $(".cx-head");
    if (!head || document.getElementById("rnBar")) return;
    var bar = document.createElement("div");
    bar.id = "rnBar";
    bar.style.cssText = "display:flex;gap:6px;align-items:center;flex-wrap:wrap";
    bar.innerHTML =
      '<button class="cx-btn ghost sm" type="button" id="rnFilter" title="فیلتر پیشرفته (F)">🎛 فیلتر پیشرفته</button>' +
      '<button class="cx-btn ghost sm" type="button" id="rnView" title="حالت نمایش">☰ لیست</button>' +
      '<button class="cx-btn ghost sm" type="button" id="rnRand" title="یک عنوان شانسی">🎲 شانسی</button>';
    var sort = head.querySelector(".cx-sortbox");
    if (sort) head.insertBefore(bar, sort); else head.appendChild(bar);

    $("#rnFilter").addEventListener("click", function () { openSheet(sheetHTML(), onPick); });
    $("#rnView").addEventListener("click", function () {
      var g = $("#cxGrid");
      if (!g) return;
      var list = g.classList.toggle("rn-list");
      this.textContent = list ? "▦ شبکه" : "☰ لیست";
      try { localStorage.setItem("rn_view2", list ? "list" : "grid"); } catch (e) {}
    });
    $("#rnRand").addEventListener("click", function () {
      var vis = $$(".cx-card").filter(function (c) { return !c.hidden; });
      if (!vis.length) return;
      vis[Math.floor(Math.random() * vis.length)].click();
    });
    try {
      if (localStorage.getItem("rn_view2") === "list") {
        var g = $("#cxGrid");
        if (g) { g.classList.add("rn-list"); $("#rnView").textContent = "▦ شبکه"; }
      }
    } catch (e) {}
  }

  /* ---------- انیمیشن و بازتاب ---------- */
  function reveal() {
    var cards = $$(".cx-card").filter(function (c) { return !c.hasAttribute("data-rv"); });
    cards.forEach(function (c, i) {
      c.setAttribute("data-rv", "1");
      c.style.transitionDelay = Math.min(i, 12) * 18 + "ms";
      requestAnimationFrame(function () { c.classList.add("rv-in"); });
    });
  }

  function watch() {
    var grid = $("#cxGrid");
    if (!grid) return;
    var run = debounce(function () { buildToolbar(); applyFilters(); reveal(); }, 120);
    if (window.MutationObserver) new MutationObserver(run).observe(grid, { childList: true });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        var sheet = $("#cxSheet");
        if (sheet && !sheet.hidden) { sheet.hidden = true; sheet.innerHTML = ""; }
      }
      if ((e.key === "f" || e.key === "F") && !/input|textarea|select/i.test((document.activeElement || {}).tagName || "")) {
        e.preventDefault();
        var b = document.getElementById("rnFilter");
        if (b) b.click();
      }
    });
  }

  function init() {
    if (!$("#cxGrid")) return;
    bindSearch();
    buildToolbar();
    applyFilters();
    reveal();
    watch();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
  setTimeout(init, 1200);
})();
