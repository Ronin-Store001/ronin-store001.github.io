/* ═══════════════════════════════════════════════════════════════
   RONIN STORE — CHAT PRO v1                        chat-pro.js
   ارتقای چت عمومی (فایل افزودنی — به فایل‌های قبلی دست نمی‌زند)
   ───────────────────────────────────────────────────────────────
   • جداکنندهٔ روز (امروز / دیروز / تاریخ) برای هر سه اتاق
   • گروه‌بندی پیام‌های پشت‌سرهم یک نفر (آواتار و نام تکرار نمی‌شود)
   • لینک خودکار + هایلایت @منشن
   • سنجاق اعلان توسط مالک (نوار بالای چت)
   • ویرایش پیام خودت + برچسب «ویرایش‌شده»
   • جستجو در پیام‌های چت عمومی
   • حفظ جای اسکرول + دکمهٔ «پیام تازه ↓»
   • پیش‌نویس خودکار + ارسال دوباره در صورت خطا
   • شمارندهٔ کاراکتر + صدای نرم اعلان (پیش‌فرض خاموش)
   ═══════════════════════════════════════════════════════════════ */
"use strict";
(function () {
  if (!window.R || R.__cp2) return;
  R.__cp2 = true;

  var LIMIT = 500;
  var S = { pin: null, q: "", sound: false, seen: false, count: 0 };
  try { S.sound = localStorage.getItem("cp2_sound") === "1"; } catch (e) {}

  /* ── ۰. کمک‌ها ─────────────────────────────────────────── */
  function $(id) { return document.getElementById(id); }
  function qa(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) { return R.esc ? R.esc(s) : String(s == null ? "" : s); }
  function fa(n) { try { return R.fa ? R.fa(n) : String(n); } catch (e) { return String(n); } }
  function isOwner() { try { return !!R.isOwner(); } catch (e) { return false; } }
  function boxOf(which) { return which === "chat" ? $("chatBox") : which === "team" ? $("teamBox") : $("dmBox"); }
  function msgOf(path) { return (R.cpIndex && R.cpIndex[path]) || null; }
  function toast(m, k) { try { if (R.toast) R.toast(m, k || "ok"); } catch (e) {} }

  function pathOf(row) {
    var a = row.querySelector("[data-dm],[data-rpm]");
    if (!a) return null;
    return a.getAttribute("data-dm") || a.getAttribute("data-rpm");
  }

  function dayKey(t) {
    if (!t) return "";
    var d = new Date(t);
    return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
  }
  function dayLabel(t) {
    var k = dayKey(t), now = new Date();
    if (!k) return "";
    if (k === dayKey(now.getTime())) return "امروز";
    if (k === dayKey(now.getTime() - 86400000)) return "دیروز";
    try {
      return new Intl.DateTimeFormat("fa-IR", { day: "numeric", month: "long", year: "numeric" })
        .format(new Date(t));
    } catch (e) { return new Date(t).toLocaleDateString("fa-IR"); }
  }

  /* ── ۱. استایل ─────────────────────────────────────────── */
  function css() {
    if ($("cp2Css")) return;
    var s = document.createElement("style");
    s.id = "cp2Css";
    s.textContent =
      /* جداکنندهٔ روز */
      ".cp2sep{display:flex;align-items:center;gap:8px;margin:12px 2px 6px;font-size:10px;" +
      "color:#8f9ac9;font-weight:700;letter-spacing:.2px}" +
      ".cp2sep::before,.cp2sep::after{content:'';flex:1;height:1px;" +
      "background:linear-gradient(90deg,transparent,rgba(140,160,255,.35),transparent)}" +
      ".cp2sep b{padding:2px 9px;border-radius:99px;background:rgba(255,255,255,.05);" +
      "border:1px solid rgba(140,160,255,.18);font-weight:800}" +

      /* گروه‌بندی */
      ".cpmsg.cpg{margin-top:-4px}" +
      ".cpmsg.cpg .avw{visibility:hidden;height:0;margin:0}" +
      ".cpmsg.cpg .cpname{display:none}" +
      ".cpmsg.cpg .bub{border-top-inline-start-radius:8px}" +

      /* لینک و منشن */
      ".cp2a{color:#8fdcff;text-decoration:underline;text-underline-offset:2px;word-break:break-all}" +
      ".cp2a:hover{color:#c8f0ff}" +
      ".cp2m{color:#0a0d22;background:linear-gradient(135deg,#7c5cff,#22d3ee);" +
      "padding:0 5px;border-radius:6px;font-weight:800;font-size:.92em}" +
      ".cp2ed{color:#9aa4cf;font-size:9.5px;font-style:normal;opacity:.85}" +

      /* ابزار ردیف */
      ".cp2tools{display:inline-flex;gap:5px;align-items:center}" +
      ".cp2tb{cursor:pointer;font-size:11px;line-height:1;opacity:.55;transition:.15s;" +
      "padding:1px 3px;border-radius:6px}" +
      ".cp2tb:hover{opacity:1;background:rgba(124,92,255,.22)}" +

      /* ویرایش درجا */
      ".bub.cp2editing{padding:8px}" +
      ".cp2ta{width:100%;min-height:52px;resize:vertical;padding:7px 9px;border-radius:10px;" +
      "font-family:inherit;font-size:12.5px;line-height:1.7;color:inherit;" +
      "background:rgba(6,9,22,.5);border:1px solid rgba(47,230,255,.4);box-sizing:border-box}" +
      ".cp2row{display:flex;align-items:center;gap:6px;margin-top:6px;flex-wrap:wrap}" +
      ".cp2ok,.cp2no{font-family:inherit;font-size:10.5px;font-weight:800;cursor:pointer;" +
      "padding:4px 10px;border-radius:9px;border:1px solid transparent}" +
      ".cp2ok{background:linear-gradient(135deg,#7c5cff,#22d3ee);color:#fff;border:0}" +
      ".cp2no{background:transparent;color:#ff9a9a;border-color:rgba(255,154,154,.4)}" +
      ".cp2err{font-size:10px;color:#ff9a9a}" +

      /* نوار سنجاق */
      ".cp2pin{display:none;align-items:center;gap:8px;padding:8px 11px;margin-bottom:8px;" +
      "border-radius:12px;font-size:11px;color:#dfe6ff;" +
      "background:linear-gradient(135deg,rgba(124,92,255,.24),rgba(34,211,238,.14));" +
      "border:1px solid rgba(124,92,255,.45)}" +
      ".cp2pin.on{display:flex}" +
      ".cp2pi{font-size:14px;flex:0 0 auto}" +
      ".cp2pt{min-width:0;display:flex;flex-direction:column;gap:1px}" +
      ".cp2pt b{font-size:10px;color:#9fe8ff;font-weight:800}" +
      ".cp2pt small{font-size:11px;color:#e6eaff;overflow:hidden;text-overflow:ellipsis;" +
      "white-space:nowrap;max-width:100%}" +
      ".cp2pn{margin-inline-start:auto;border:0;background:transparent;cursor:pointer;" +
      "color:#ff9a9a;font-size:14px;padding:0 2px}" +

      /* دکمهٔ پیام تازه */
      ".cp2jump{position:absolute;bottom:64px;inset-inline-end:12px;z-index:8;display:none;" +
      "align-items:center;gap:5px;padding:6px 11px;border-radius:99px;cursor:pointer;" +
      "font-family:inherit;font-size:10.5px;font-weight:800;color:#fff;border:0;" +
      "background:linear-gradient(135deg,#7c5cff,#22d3ee);box-shadow:0 10px 24px -10px rgba(124,92,255,.9)}" +
      ".cp2jump.show{display:inline-flex}" +

      /* جستجو */
      ".cp2sw{display:inline-flex;align-items:center;gap:6px;margin-inline-start:auto}" +
      ".cp2srch{width:118px;padding:4px 9px;border-radius:99px;font-family:inherit;font-size:10.5px;" +
      "color:#e8ecff;background:rgba(6,9,22,.5);border:1px solid rgba(140,160,255,.25)}" +
      ".cp2srch:focus{outline:none;border-color:rgba(34,211,238,.6);width:150px}" +
      ".cp2shits{font-size:9.5px;color:#8f9ac9;white-space:nowrap}" +
      ".cpmsg.cp2dim{opacity:.26}" +

      /* شمارنده و صدا */
      ".cp2cc{font-size:9.5px;color:#8f9ac9;align-self:center;margin-inline-start:2px}" +
      ".cp2cc.warn{color:#ffd479}" +
      ".cp2snd{width:34px;height:34px;border-radius:11px;display:grid;place-items:center;" +
      "cursor:pointer;font-size:15px;padding:0;border:1px solid rgba(140,160,255,.22);" +
      "background:rgba(10,12,32,.45)}" +

      /* روشن */
      "html[data-theme='light'] .cp2sep b{background:rgba(255,255,255,.9);color:#3b4a80}" +
      "html[data-theme='light'] .cp2ta{background:#fff;color:#151a3a}" +
      "html[data-theme='light'] .cp2pin{color:#1b2350}" +
      "html[data-theme='light'] .cp2pt small{color:#1b2350}" +
      "html[data-theme='light'] .cp2srch{background:#fff;color:#151a3a}" +

      "@media(max-width:520px){" +
      ".cp2srch{width:92px}.cp2srch:focus{width:118px}" +
      ".cp2jump{bottom:58px;inset-inline-end:8px}" +
      "}";
    document.head.appendChild(s);
  }

  try { css(); } catch (e) {}

  /* ── ۲. لینک و منشن ───────────────────────────────────── */
  var RX = /(https?:\/\/[^\s<>"']+)|(@[\w\u0600-\u06FF]{2,24})/g;

  function linkifyBub(bub) {
    if (!bub || bub.querySelector(".cp2a,.cp2m")) return;
    var text = bub.textContent || "";
    if (!/https?:\/\/|@/.test(text)) return;
    var frag = document.createDocumentFragment(), last = 0, m;
    RX.lastIndex = 0;
    while ((m = RX.exec(text))) {
      if (m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)));
      if (m[1]) {
        var a = document.createElement("a");
        a.className = "cp2a";
        a.href = m[1];
        a.target = "_blank";
        a.rel = "noopener noreferrer nofollow";
        a.textContent = m[1];
        frag.appendChild(a);
      } else {
        var sp = document.createElement("span");
        sp.className = "cp2m";
        sp.textContent = m[2];
        frag.appendChild(sp);
      }
      last = m.index + m[0].length;
    }
    if (!frag.childNodes.length) return;
    if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
    bub.textContent = "";
    bub.appendChild(frag);
  }

  /* ── ۳. ابزار روی ردیف ────────────────────────────────── */
  function addTools(row, path, m) {
    if (!path) return;
    var meta = row.querySelector(".xs.mut.row") || row.lastElementChild;
    if (!meta || meta.querySelector(".cp2tools")) return;
    var w = document.createElement("span");
    w.className = "cp2tools";
    var html = "";
    if (m && m.uid && m.uid === R.ME) {
      html += '<a class="cp2tb" data-cp2edit="' + esc(path) + '" title="ویرایش">✏️</a>';
    }
    if (isOwner() && path.indexOf("chat/") === 0) {
      html += '<a class="cp2tb" data-cp2pin="' + esc(path) + '" title="سنجاق اعلان">📌</a>';
    }
    if (!html) return;
    w.innerHTML = html;
    meta.insertBefore(w, meta.firstChild);
  }

  function markEdited(row) {
    var meta = row.querySelector(".xs.mut.row") || row.lastElementChild;
    if (!meta || meta.querySelector(".cp2ed")) return;
    var i = document.createElement("i");
    i.className = "cp2ed";
    i.textContent = "ویرایش‌شده";
    meta.appendChild(i);
  }

  /* ── ۴. آرایش اتاق ────────────────────────────────────── */
  function decorate(box) {
    if (!box) return;
    qa(".cp2sep", box).forEach(function (n) { n.remove(); });
    var rows = qa(".cpmsg", box);
    var lastDay = "", prev = null;
    rows.forEach(function (row) {
      var path = pathOf(row);
      var m = msgOf(path);
      var t = (m && m.t) || 0;
      var dk = dayKey(t);
      if (dk && dk !== lastDay) {
        var sep = document.createElement("div");
        sep.className = "cp2sep";
        sep.innerHTML = "<b>" + esc(dayLabel(t)) + "</b>";
        box.insertBefore(sep, row);
        lastDay = dk;
        prev = null;
      }
      var grouped = !!(prev && m && prev.uid && prev.uid === m.uid &&
        t - (prev.t || 0) < 300000 && !row.querySelector(".cprp"));
      row.classList.toggle("cpg", grouped);
      prev = m || prev;

      if (!row.__cp2) {
        row.__cp2 = 1;
        qa(".bub", row).forEach(linkifyBub);
        addTools(row, path, m);
        if (m && m.ed) markEdited(row);
      }
    });
    if (box.id === "chatBox") filter();
    ensureJump(box);
  }
  R.afterRender = (function (prev) {
    return function (el) {
      if (typeof prev === "function") prev.call(R, el);
      try { decorate(el); } catch (e) {}
      try {
        var n = Object.keys(R.CHAT || {}).length;
        if (S.seen && n > S.count && R.cur !== "chat") beep();
        S.count = n;
        S.seen = true;
      } catch (e) {}
    };
  })(R.afterRender);

  /* ── ۵. اسکرول ────────────────────────────────────────── */
  function nearBottom(box) {
    if (!box) return true;
    return box.scrollHeight - box.scrollTop - box.clientHeight < 90;
  }
  function ensureJump(box) {
    if (!box) return;
    var chat = box.closest ? box.closest(".chat") : null;
    if (!chat) return;
    var b = chat.querySelector(".cp2jump");
    if (!b) {
      b = document.createElement("button");
      b.type = "button";
      b.className = "cp2jump";
      b.textContent = "پیام تازه ↓";
      b.addEventListener("click", function () {
        try { box.scrollTo({ top: box.scrollHeight, behavior: "smooth" }); }
        catch (e) { box.scrollTop = box.scrollHeight; }
        b.classList.remove("show");
      });
      chat.appendChild(b);
    }
    b.classList.toggle("show", !nearBottom(box));
  }
  ["chat", "team", "dm"].forEach(function (which) {
    var box = boxOf(which);
    if (!box) return;
    box.addEventListener("scroll", function () { ensureJump(box); }, { passive: true });
  });

  /* ── ۶. حفظ جای اسکرول در رندرهای تازه ────────────────── */
  [["renderChat", "chat"], ["renderTeam", "team"], ["renderDM", "dm"]].forEach(function (p) {
    var fn = p[0], which = p[1], orig = R[fn];
    if (typeof orig !== "function") return;
    R[fn] = function () {
      var box = boxOf(which);
      var keep = box && !nearBottom(box) ? box.scrollTop : null;
      var r = orig.apply(this, arguments);
      try {
        if (box && keep != null) box.scrollTop = keep;
        ensureJump(box);
      } catch (e) {}
      return r;
    };
  });

  /* ── ۷. سنجاق / اعلان ────────────────────────────────── */
  function ensurePinBar() {
    var chat = document.querySelector("#sec-chat .chat");
    if (!chat) return null;
    var b = chat.querySelector(".cp2pin");
    if (!b) {
      b = document.createElement("div");
      b.className = "cp2pin";
      var body = chat.querySelector(".cbody");
      chat.insertBefore(b, body || null);
    }
    return b;
  }
  function paintPin() {
    var b = ensurePinBar();
    if (!b) return;
    var p = S.pin;
    if (!p || !p.text) { b.classList.remove("on"); b.textContent = ""; return; }
    b.classList.add("on");
    b.innerHTML = '<span class="cp2pi">📌</span><div class="cp2pt"><b></b><small></small></div>' +
      (isOwner() ? '<button type="button" class="cp2pn" title="برداشتن سنجاق">✕</button>' : "");
    b.querySelector(".cp2pt b").textContent = p.n || "اعلان";
    b.querySelector(".cp2pt small").textContent = p.text;
    var x = b.querySelector(".cp2pn");
    if (x) x.addEventListener("click", function () {
      if (R.db) R.db.ref("settings/chat/pin").remove();
    });
  }
  function watchPin() {
    if (!R.db || S.pinW) return;
    S.pinW = 1;
    try {
      R.db.ref("settings/chat/pin").on("value", function (s) {
        S.pin = s.val() || null;
        paintPin();
      }, function () {});
    } catch (e) {}
  }

  /* ── ۸. ویرایش درجا ─────────────────────────────────── */
  function startEdit(row, path) {
    if (!row || !R.db) return;
    var bub = row.querySelector(".bub");
    if (!bub || bub.querySelector(".cp2ta")) return;
    var m = msgOf(path) || {};
    var old = m.text || bub.textContent || "";
    var lim = path.indexOf("chat/") === 0 ? LIMIT : 800;
    bub.classList.add("cp2editing");
    bub.textContent = "";
    var ta = document.createElement("textarea");
    ta.className = "cp2ta";
    ta.maxLength = lim;
    ta.value = old;
    var row2 = document.createElement("div");
    row2.className = "cp2row";
    var ok = document.createElement("button");
    ok.type = "button"; ok.className = "cp2ok"; ok.textContent = "ذخیره";
    var no = document.createElement("button");
    no.type = "button"; no.className = "cp2no"; no.textContent = "لغو";
    var er = document.createElement("span");
    er.className = "cp2err";
    row2.appendChild(ok); row2.appendChild(no); row2.appendChild(er);
    bub.appendChild(ta); bub.appendChild(row2);
    try { ta.focus(); ta.setSelectionRange(old.length, old.length); } catch (e) {}

    no.addEventListener("click", function () { if (R.renderChat) R.renderChat(); });
    ok.addEventListener("click", function () {
      var v = (R.clean ? R.clean(ta.value, lim) : ta.value.slice(0, lim)).trim();
      if (!v) { er.textContent = "متن خالی است"; return; }
      if (v === old) { if (R.renderChat) R.renderChat(); return; }
      ok.disabled = true;
      R.db.ref(path).update({ text: v, ed: Date.now() }).then(function () {
        toast("ویرایش شد ✅", "ok");
      }).catch(function (e) {
        ok.disabled = false;
        er.textContent = e.message || "ذخیره نشد";
      });
    });
  }

  /* ── ۹. جستجو در چت عمومی ─────────────────────────────── */
  function filter() {
    var box = $("chatBox");
    if (!box) return;
    var rows = qa(".cpmsg", box), hits = 0;
    rows.forEach(function (row) {
      var m = msgOf(pathOf(row));
      var txt = ((m && m.text) || row.textContent || "").toLowerCase();
      var hit = !S.q || txt.indexOf(S.q) > -1;
      row.classList.toggle("cp2dim", !hit);
      if (S.q && hit) hits++;
    });
    var c = document.querySelector("#sec-chat .cp2shits");
    if (c) c.textContent = S.q ? fa(hits) + " نتیجه" : "";
  }
  function ensureSearch() {
    var head = document.querySelector("#sec-chat .chead");
    if (!head || head.querySelector(".cp2sw")) return;
    var w = document.createElement("span");
    w.className = "cp2sw";
    var inp = document.createElement("input");
    inp.className = "cp2srch";
    inp.placeholder = "جستجو در پیام‌ها…";
    inp.maxLength = 40;
    inp.addEventListener("input", function () {
      S.q = inp.value.trim().toLowerCase();
      filter();
    });
    var b = document.createElement("b");
    b.className = "cp2shits";
    w.appendChild(inp); w.appendChild(b);
    head.appendChild(w);
  }

  /* ── ۱۰. پیش‌نویس، شمارنده، صدا ───────────────────────── */
  function dkey() { return "cp2_draft_" + (R.ME || "guest"); }
  function saveDraft(v) {
    try { if (v) localStorage.setItem(dkey(), v); else localStorage.removeItem(dkey()); } catch (e) {}
  }
  function restoreDraft() {
    var i = $("chatIn");
    if (!i || i.value) return;
    try { var v = localStorage.getItem(dkey()); if (v) i.value = v; } catch (e) {}
  }
  function paintCount() {
    var i = $("chatIn"), c = document.querySelector("#sec-chat .cp2cc");
    if (!i || !c) return;
    var n = i.value.length;
    c.textContent = fa(n) + "/" + fa(LIMIT);
    c.classList.toggle("warn", n > LIMIT - 60);
  }
  var AC = null;
  function beep() {
    if (!S.sound) return;
    try {
      AC = AC || new (window.AudioContext || window.webkitAudioContext)();
      var o = AC.createOscillator(), g = AC.createGain();
      o.type = "sine"; o.frequency.value = 660;
      g.gain.value = 0.035;
      o.connect(g); g.connect(AC.destination);
      o.start(); o.stop(AC.currentTime + 0.11);
    } catch (e) {}
  }
  function paintSoundBtn() {
    var b = document.querySelector("#sec-chat .cp2snd");
    if (b) b.textContent = S.sound ? "🔔" : "🔕";
  }

  /* ── ۱۱. ارسال مطمئن چت عمومی ─────────────────────────── */
  R.sendChat = function () {
    if (!R.ME) return R.needLogin ? R.needLogin("فرستادن پیام") : null;
    var i = $("chatIn");
    if (!i) return;
    var txt = (R.clean ? R.clean(i.value, LIMIT) : String(i.value).slice(0, LIMIT)).trim();
    if (!txt) return;
    if (Date.now() - (R._cp2At || 0) < 1500) return toast("یه کم آرام‌تر ⏳", "err");
    R._cp2At = Date.now();
    i.value = "";
    saveDraft("");
    paintCount();
    var p = R.add("chat", {
      uid: R.ME,
      n: (R.USER && R.USER.name) || "کاربر",
      av: (R.USER && R.USER.av) || "",
      text: txt
    });
    if (p && p.catch) {
      p.catch(function (e) {
        i.value = txt;
        saveDraft(txt);
        paintCount();
        toast("پیام نرفت — دوباره بفرست: " + (e.message || ""), "err");
      });
    }
  };

  /* ── ۱۲. رویدادها ─────────────────────────────────────── */
  document.addEventListener("click", function (e) {
    var t = e.target;
    if (!t || !t.closest) return;

    var pin = t.closest("[data-cp2pin]");
    if (pin) {
      e.preventDefault();
      if (!isOwner() || !R.db) return;
      var path = pin.getAttribute("data-cp2pin");
      var m = msgOf(path) || {};
      R.db.ref("settings/chat/pin").set({
        id: (m.id || path),
        n: m.n || "اعلان",
        text: String(m.text || "").slice(0, 140),
        t: Date.now()
      }).then(function () { toast("سنجاق شد 📌", "ok"); })
        .catch(function (er) { toast("نشد: " + er.message, "err"); });
      return;
    }

    var ed = t.closest("[data-cp2edit]");
    if (ed) {
      e.preventDefault();
      var row = ed.closest(".cpmsg");
      startEdit(row, ed.getAttribute("data-cp2edit"));
      return;
    }

    var snd = t.closest(".cp2snd");
    if (snd) {
      S.sound = !S.sound;
      try { localStorage.setItem("cp2_sound", S.sound ? "1" : "0"); } catch (er) {}
      paintSoundBtn();
      if (S.sound) beep();
      toast(S.sound ? "صدای اعلان روشن شد 🔔" : "صدای اعلان خاموش شد 🔕", "ok");
    }
  });

  /* ── ۱۳. راه‌اندازی ───────────────────────────────────── */
  function boot() {
    css();
    ensureSearch();
    ensurePinBar();
    watchPin();
    paintPin();

    var chat = document.querySelector("#sec-chat .chead");
    if (chat && !chat.querySelector(".cp2snd")) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "cp2snd";
      b.title = "صدای اعلان";
      b.addEventListener("click", function () {
        S.sound = !S.sound;
        try { localStorage.setItem("cp2_sound", S.sound ? "1" : "0"); } catch (e) {}
        paintSoundBtn();
        if (S.sound) beep();
      });
      chat.insertBefore(b, chat.firstChild ? chat.firstChild.nextSibling : null);
      paintSoundBtn();
    }

    var bar = document.querySelector("#sec-chat .cbar");
    if (bar && !bar.querySelector(".cp2cc")) {
      var c = document.createElement("b");
      c.className = "cp2cc";
      bar.appendChild(c);
      paintCount();
    }

    var inp = $("chatIn");
    if (inp && !inp.__cp2) {
      inp.__cp2 = 1;
      inp.addEventListener("input", function () { saveDraft(inp.value); paintCount(); });
      restoreDraft();
      paintCount();
    }

    ["chat", "team", "dm"].forEach(function (w) {
      var box = boxOf(w);
      if (box) { decorate(box); ensureJump(box); }
    });
  }

  /* قلاب ورود/خروج و شروع */
  var onIn = R.onLogin;
  R.onLogin = function () {
    if (typeof onIn === "function") { try { onIn(); } catch (e) {} }
    setTimeout(function () { boot(); restoreDraft(); }, 800);
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  [400, 1200, 2600].forEach(function (ms) { setTimeout(boot, ms); });
  if (R.cur === "chat" || !R.cur) setTimeout(boot, 3200);

  /* API برای تست */
  R.chatPro = {
    decorate: decorate, paintPin: paintPin, setPin: function (p) { S.pin = p; paintPin(); },
    filter: filter, dayKey: dayKey, dayLabel: dayLabel, linkifyBub: linkifyBub,
    saveDraft: saveDraft, restoreDraft: restoreDraft, nearBottom: nearBottom,
    state: S
  };
})();
