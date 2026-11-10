/* ═══════════════════════════════════════════════════════════════
   RONIN STORE — TEAM CHAT PRO · ronin-team-chat.js · v1
   ───────────────────────────────────────────────────────────────
   ارتقای چت «شبکه فرماندهی» (بدون تکرار قابلیت‌های chat-plus):
   • 📌 سنجاق پیام در هر کانال + نوار سنجاق
   • 🔍 جستجوی داخل کانال
   • «در حال نوشتن» مخصوص کانال تیم
   • 🗑 حذف پیام و پرش به پیام سنجاق‌شده
   • ابزار سریع در هدر کانال
   ═══════════════════════════════════════════════════════════════ */
"use strict";
(function () {
  if (!window.R || R.__tcp) return;
  R.__tcp = true;

  var S = { pin: null, q: "", ch: "", typing: {}, lastType: 0, typeTimer: 0 };

  function el(i) { return document.getElementById(i); }
  function qa(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function toast(m, k) { if (R.toast) R.toast(m, k || "ok"); }
  function can() {
    try {
      return !!(R.isOwner && R.isOwner()) || !!(R.isStaff && R.isStaff()) || !!R.team;
    } catch (e) { return false; }
  }
  function meName() { return (R.USER && R.USER.name) || "عضو تیم"; }

  /* ── ۱. استایل ──────────────────────────────────────────── */
  function css() {
    if (el("tcpCss")) return;
    var s = document.createElement("style");
    s.id = "tcpCss";
    s.textContent = [
      "#sec-team .chead{flex-wrap:wrap;gap:6px}",
      "#sec-team .chead .tcTools{display:flex;gap:4px;align-items:center;margin-inline-start:auto}",
      "#sec-team .chead .tcTool{cursor:pointer;border:1px solid rgba(255,140,160,.22);background:rgba(255,255,255,.06);" +
        "color:#ffd9e0;border-radius:9px;padding:3px 8px;font-size:10.5px;font-family:inherit;font-weight:800}",
      "#sec-team .chead .tcTool.on{background:linear-gradient(135deg,#ffd66b,#ff5470);color:#1a070d;border-color:transparent}",
      "#tcSearch{display:none;margin:6px 10px 0;height:34px;font-size:12px}",
      "#tcSearch.on{display:block}",
      "#tcPin{display:none;margin:8px 10px 0;padding:8px 10px;border-radius:12px;font-size:11px;line-height:1.8;" +
        "background:rgba(255,176,58,.1);border:1px solid rgba(255,176,58,.35);color:#ffe7bd}",
      "#tcPin.on{display:block}",
      "#tcPin b{color:#ffd66b}",
      "#tcPin .x{cursor:pointer;float:inline-end;color:#ff9db1;font-weight:900}",
      "#tcTyping{min-height:15px;padding:2px 14px 0;font-size:10px;color:#b9a6b1;display:flex;align-items:center;gap:5px}",
      "#tcTyping i{width:5px;height:5px;border-radius:50%;background:#ffd66b;display:inline-block;animation:tcpB 1s infinite}",
      "#tcTyping i:nth-child(2){animation-delay:.15s}#tcTyping i:nth-child(3){animation-delay:.3s}",
      "@keyframes tcpB{0%,100%{opacity:.25;transform:translateY(0)}50%{opacity:1;transform:translateY(-2px)}}",
      "#sec-team .msg.tcMsg{transition:background .2s;border-radius:12px}",
      "#sec-team .msg.tcMsg:hover{background:rgba(255,255,255,.03)}",
      "#sec-team .tcActs{display:none;gap:5px;flex-wrap:wrap;margin-top:4px}",
      "#sec-team .msg.tcMsg:hover .tcActs{display:flex}",
      "#sec-team .tcActs button{cursor:pointer;font-family:inherit;font-size:9.5px;padding:1px 6px;border-radius:8px;" +
        "color:#cbb9c4;background:rgba(255,255,255,.05);border:1px solid rgba(255,140,160,.16)}",
      "#sec-team .tcActs button:hover{color:#fff;border-color:#ffd66b}",
      "#sec-team .msg.tcHit{outline:2px solid rgba(255,176,58,.65);outline-offset:2px;border-radius:10px}",
      "#sec-team .msg.hide{display:none!important}",
      "@media(max-width:560px){#sec-team .chead .tcTool{padding:3px 6px;font-size:9.5px}}"
    ].join("\n");
    document.head.appendChild(s);
  }

  /* ── ۲. نوار ابزار ─────────────────────────────────────── */
  function buildBar() {
    var sec = el("sec-team");
    if (!sec) return;
    var head = sec.querySelector(".chead");
    if (head && !head.querySelector(".tcTools")) {
      var tools = document.createElement("div");
      tools.className = "tcTools";
      tools.innerHTML =
        '<button class="tcTool" type="button" data-tc="search" title="جستجو">🔍</button>' +
        '<button class="tcTool" type="button" data-tc="pin" title="پیام سنجاق‌شده">📌</button>' +
        '<button class="tcTool" type="button" data-tc="top" title="آخرین پیام">⤓</button>';
      head.appendChild(tools);
    }
    if (head && !el("tcSearch")) {
      var inp = document.createElement("input");
      inp.className = "inp";
      inp.id = "tcSearch";
      inp.placeholder = "جستجو در پیام‌های این کانال…";
      inp.setAttribute("autocomplete", "off");
      inp.setAttribute("maxlength", "50");
      head.insertAdjacentElement("afterend", inp);
    }
    if (!el("tcPin")) {
      var pin = document.createElement("div");
      pin.id = "tcPin";
      pin.setAttribute("data-noi18n", "");
      var after = el("tcSearch") || head;
      if (after && after.parentNode) after.insertAdjacentElement("afterend", pin);
    }
    if (!el("tcTyping")) {
      var ty = document.createElement("div");
      ty.id = "tcTyping";
      ty.setAttribute("data-noi18n", "");
      var body = sec.querySelector(".chat .cbody");
      if (body && body.parentNode) body.parentNode.insertBefore(ty, body);
    }
  }

  /* ── ۳. تزئین پیام‌ها ───────────────────────────────────── */
  function decorate() {
    var box = el("teamBox");
    if (!box || !R.teamCh) return;
    var arr = R.msgList ? R.msgList(R.TEAM || {}) : [];
    var nodes = qa(".msg", box);
    nodes.forEach(function (n, i) {
      var m = arr[i];
      if (!m) return;
      n.classList.add("tcMsg");
      n.setAttribute("data-tcmid", m.id);
      if (S.q) {
        var hit = String(m.text || "").toLowerCase().indexOf(S.q) > -1;
        n.classList.toggle("hide", !hit);
        n.classList.toggle("tcHit", !!hit);
      } else {
        n.classList.remove("hide", "tcHit");
      }
      var host = n.querySelector(".cpmain") || n.querySelector("div");
      if (!host || host.querySelector(".tcActs")) return;
      var acts = document.createElement("div");
      acts.className = "tcActs";
      acts.innerHTML =
        '<button type="button" data-tcpin="' + esc(m.id) + '">📌 سنجاق</button>' +
        (m.uid === R.ME || (R.isOwner && R.isOwner())
          ? '<button type="button" data-tcdel="' + esc(m.id) + '">🗑 حذف</button>' : "");
      host.appendChild(acts);
    });
    paintPin();
  }

  function paintPin() {
    var box = el("tcPin");
    if (!box) return;
    var p = S.pin;
    if (!p || !p.text) { box.classList.remove("on"); box.innerHTML = ""; return; }
    box.classList.add("on");
    box.innerHTML = '📌 <b>سنجاق:</b> ' + esc(p.text) +
      (p.byName ? ' <span class="xs mut">— ' + esc(p.byName) + "</span>" : "") +
      '<span class="x" data-tc="unpin">✕</span>';
  }

  /* ── ۴. کانال ───────────────────────────────────────────── */
  function watchChannel(ch) {
    if (!R.db || !ch) return;
    S.ch = ch;
    S.pin = null;
    S.q = "";
    var q = el("tcSearch");
    if (q) { q.value = ""; q.classList.remove("on"); q.classList.remove("on"); }
    paintPin();
    try {
      R.db.ref("settings/teamPin/" + ch).on("value", function (s) {
        S.pin = s.val() || null;
        paintPin();
      }, function () {});
      R.db.ref("typing/team/" + ch).on("value", function (s) {
        S.typing = s.val() || {};
        paintTyping();
      }, function () {});
    } catch (e) {}
  }

  function paintTyping() {
    var box = el("tcTyping");
    if (!box) return;
    var now = Date.now();
    var names = [];
    Object.keys(S.typing || {}).forEach(function (uid) {
      var x = S.typing[uid] || {};
      if (uid !== R.ME && x.t && now - x.t < 6000) names.push(x.n || "عضو");
    });
    box.innerHTML = names.length
      ? "<i></i><i></i><i></i><span>" + esc(names.slice(0, 2).join("، ")) +
        (names.length > 2 ? " و " + (names.length - 2) + " نفر" : "") + " در حال نوشتن…</span>"
      : "";
  }

  /* ── ۵. تایپینگ ─────────────────────────────────────────── */
  function stopTyping() {
    clearTimeout(S.typeTimer);
    if (!R.db || !R.ME || !R.teamCh) return;
    try { R.db.ref("typing/team/" + R.teamCh + "/" + R.ME).remove(); } catch (e) {}
  }
  function onType() {
    if (!R.db || !R.ME || !R.teamCh) return;
    var now = Date.now();
    if (now - S.lastType > 1200) {
      S.lastType = now;
      try {
        R.db.ref("typing/team/" + R.teamCh + "/" + R.ME).set({ n: meName(), t: now });
      } catch (e) {}
    }
    clearTimeout(S.typeTimer);
    S.typeTimer = setTimeout(stopTyping, 2400);
  }

  /* ── ۶. کلیک‌ها ─────────────────────────────────────────── */
  function toggleSearch() {
    var q = el("tcSearch");
    if (!q) return;
    q.classList.toggle("on");
    var b = el("tcSearch") && el("tcSearch").previousElementSibling;
    if (b) b.classList.toggle("on", q.classList.contains("on"));
    if (q.classList.contains("on")) { try { q.focus(); } catch (e) {} }
    else { S.q = ""; q.value = ""; decorate(); }
  }
  function scrollBottom() {
    var b = el("teamBox");
    if (b) b.scrollTop = b.scrollHeight;
  }

  document.addEventListener("click", function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var sec = el("sec-team");
    if (!sec || !sec.contains(t)) return;

    var tool = t.closest("[data-tc]");
    if (tool) {
      var a = tool.getAttribute("data-tc");
      if (a === "search") return toggleSearch();
      if (a === "pin") {
        if (!S.pin) return toast("هیچ پیامی سنجاق نشده", "err");
        var b = el("teamBox");
        var node = b && b.querySelector('[data-tcmid="' + S.pin.id + '"]');
        if (node) {
          node.scrollIntoView({ behavior: "smooth", block: "center" });
          node.classList.add("tcHit");
          setTimeout(function () { node.classList.remove("tcHit"); }, 1600);
        }
        return;
      }
      if (a === "top") return scrollBottom();
      if (a === "unpin") {
        if (!R.db || !R.teamCh) return;
        R.db.ref("settings/teamPin/" + R.teamCh).remove()
          .then(function () { toast("سنجاق برداشته شد", "ok"); }).catch(function () {});
        return;
      }
    }

    var pin = t.closest("[data-tcpin]");
    if (pin) {
      var pid = pin.getAttribute("data-tcpin");
      var list = R.msgList ? R.msgList(R.TEAM || {}) : [];
      var mm = null;
      list.forEach(function (x) { if (x.id === pid) mm = x; });
      if (!mm || !R.db || !R.teamCh) return;
      R.set("settings/teamPin/" + R.teamCh, {
        id: pid, text: String(mm.text || "").slice(0, 120), by: R.ME || "",
        byName: meName(), t: Date.now()
      }).then(function () { toast("📌 پیام سنجاق شد", "ok"); }).catch(function () {});
      return;
    }

    var dl = t.closest("[data-tcdel]");
    if (dl && R.db && R.teamCh) {
      var did = dl.getAttribute("data-tcdel");
      if (!window.confirm("این پیام حذف شود؟")) return;
      R.db.ref("team/" + R.teamCh + "/" + did).remove()
        .then(function () { toast("پیام حذف شد", "ok"); }).catch(function () {});
    }
  }, false);

  /* ── ۷. جستجو و تایپینگ ─────────────────────────────────── */
  document.addEventListener("input", function (e) {
    var t = e.target;
    if (!t) return;
    if (t.id === "tcSearch") {
      S.q = String(t.value || "").trim().toLowerCase();
      decorate();
      return;
    }
    if (t.id === "teamIn") onType();
  }, false);

  /* ── ۸. قلاب‌ها ─────────────────────────────────────────── */
  var render0 = R.renderTeam;
  if (typeof render0 === "function") {
    R.renderTeam = function () {
      var out = render0.apply(this, arguments);
      try { decorate(); } catch (e) {}
      return out;
    };
  }
  var teamOn0 = R.teamOn;
  if (typeof teamOn0 === "function") {
    R.teamOn = function (ch) {
      var out = teamOn0.apply(this, arguments);
      watchChannel(ch);
      return out;
    };
  }

  function boot() {
    if (!can()) return;
    css();
    buildBar();
    if (R.teamCh) watchChannel(R.teamCh);
    decorate();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  [900, 2000, 4000].forEach(function (ms) { setTimeout(boot, ms); });

  var in0 = R.onLogin;
  R.onLogin = function () {
    if (in0) { try { in0(); } catch (e) {} }
    setTimeout(boot, 800);
  };
  var out0 = R.onLogout;
  R.onLogout = function () {
    if (out0) { try { out0(); } catch (e) {} }
    S.pin = null; S.typing = {}; S.q = ""; S.ch = "";
    paintTyping(); paintPin();
  };

  window.RoninTeamChat = { state: S, decorate: decorate };
})();
