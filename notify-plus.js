/* ═══ RONIN NOTIFY+ v1 — اعلان پیام‌ها + ویرایش پست ═══ */
"use strict";
(function () {
  if (!window.R || R.__notifyPlus) return;
  R.__notifyPlus = true;

  var lastDM = {};
  var lastGRP = {};
  var editing = null;

  function el(id) { return document.getElementById(id); }
  function myName() { return (R.USER && R.USER.name) || "کاربر"; }
  function can(ms) { return Date.now() - (ms || 0) > 0; }

  /* ── ۱. اعلان پیام خصوصی و گروه ─────────────────────────── */
  function notifyDM(o) {
    if (!o || !o.uid || !o.to || o.uid === o.to) return;
    if (!R.notify) return;
    var k = o.uid + ">" + o.to;
    if (!can(lastDM[k])) return;
    lastDM[k] = Date.now() + 45000;
    R.notify(o.to, "💬 " + (o.n || myName()) + ": " + String(o.text || "").slice(0, 60),
      "info", "dm:" + o.uid);
  }

  function notifyGroup(gid, o) {
    if (!gid || !o || !o.uid || !R.notify || !R.db) return;
    if (!can(lastGRP[gid])) return;
    lastGRP[gid] = Date.now() + 60000;
    var me = o.uid;
    R.get("groups/" + gid + "/members").then(function (mem) {
      if (!mem) return;
      return R.get("groups/" + gid).then(function (g) {
        var gname = (g && (g.n || g.name)) || "گروه";
        Object.keys(mem).forEach(function (uid) {
          if (!uid || uid === me) return;
          R.notify(uid, "🏯 " + (o.n || myName()) + " در «" + gname + "» پیام داد", "info", "groups");
        });
      });
    }).catch(function () {});
  }

  function wrapAdd() {
    if (!R.add || R.add.__notifyWrapped) return;
    var orig = R.add;
    var wrapped = function (path, obj) {
      var p = orig.apply(R, arguments);
      try {
        var s = String(path || "");
        if (/^dm\/[^/]+$/.test(s)) notifyDM(obj);
        else if (/^groupMsgs\/[^/]+$/.test(s)) notifyGroup(s.split("/")[1], obj);
      } catch (e) {}
      return p;
    };
    wrapped.__notifyWrapped = true;
    R.add = wrapped;
  }

  /* ── ۲. اعلان‌های کلیک‌پذیر ─────────────────────────────── */
  function wrapBell() {
    if (!R.paintBell || R.paintBell.__notifyWrapped) return;
    var orig = R.paintBell;
    var wrapped = function () {
      var out = orig.apply(R, arguments);
      try {
        R.qa("#notifBox .notif[data-nread]").forEach(function (row) {
          row.setAttribute("data-nlink", row.getAttribute("data-nread"));
          row.style.cursor = "pointer";
        });
      } catch (e) {}
      return out;
    };
    wrapped.__notifyWrapped = true;
    R.paintBell = wrapped;
  }

  function openNotif(id) {
    var n = (R.MYNOTIF || {})[id];
    if (!n) return;
    var link = String(n.link || "");
    if (link.indexOf("dm:") === 0) {
      var uid = link.slice(3);
      if (uid && R.dmOpen) R.dmOpen(uid);
      return;
    }
    if (link.indexOf("post:") === 0) {
      if (R.OPEN_CMT) R.OPEN_CMT[link.slice(5)] = true;
      R.go("community");
      return;
    }
    if (link === "groups") { R.go("groups"); return; }
    if (link === "owner") { if (R.isOwner && R.isOwner()) R.go("owner"); return; }
    if (n.from && n.from !== R.ME && R.renderProfile) {
      R.VIEW = n.from;
      R.renderProfile(n.from);
      R.go("profile");
    }
  }

  function bindNotifClicks() {
    document.addEventListener("click", function (e) {
      var t = e.target.closest ? e.target.closest("[data-nlink]") : null;
      if (!t) return;
      var id = t.getAttribute("data-nlink");
      if (R.closeMod) R.closeMod("notifMod");
      setTimeout(function () { openNotif(id); }, 60);
    });
  }

  /* ── ۳. ویرایش پست ──────────────────────────────────────── */
  function editor() {
    if (el("epMod")) return;
    var w = document.createElement("div");
    w.className = "modal";
    w.id = "epMod";
    w.innerHTML =
      '<div class="box">' +
        '<div class="between mb"><h3 class="h2">✏️ ویرایش پست</h3>' +
          '<button class="icobtn" type="button" data-epx="1">✕</button></div>' +
        '<textarea class="area" id="epText" maxlength="1200" placeholder="متن پست…"></textarea>' +
        '<div class="xs mut mt" id="epMsg"></div>' +
        '<div class="row mt" style="gap:8px">' +
          '<button class="btn p" type="button" id="epSave">ذخیره</button>' +
          '<button class="btn" type="button" data-epx="1">انصراف</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(w);

    w.addEventListener("click", function (e) {
      if (e.target === w) { R.mod("epMod", false); return; }
      var x = e.target.closest ? e.target.closest("[data-epx]") : null;
      if (x) { R.mod("epMod", false); return; }
      if (e.target.id === "epSave") save();
    });
    var ta = el("epText");
    if (ta) ta.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); save(); }
    });
  }

  function openEditor(pid) {
    var p = (R.POSTS || {})[pid];
    if (!p) return R.toast("این پست پیدا نشد", "err");
    if (p.uid !== R.ME) return R.toast("فقط پست خودت را می‌توانی ویرایش کنی", "err");
    editor();
    editing = pid;
    var ta = el("epText");
    if (ta) ta.value = String(p.text || "");
    var m = el("epMsg"); if (m) m.textContent = "";
    R.mod("epMod", true);
    setTimeout(function () { if (ta) { try { ta.focus(); } catch (e) {} } }, 120);
  }

  function save() {
    if (!editing || !R.ME || !R.db) return;
    var ta = el("epText");
    var txt = R.clean ? R.clean(ta ? ta.value : "", 1200) : String(ta ? ta.value : "").trim().slice(0, 1200);
    if (txt.length < 2) {
      var m = el("epMsg");
      if (m) { m.textContent = "متن خیلی کوتاه است"; m.className = "sm mt bad"; }
      return;
    }
    var pid = editing;
    R.db.ref("posts/" + pid).update({ text: txt, ed: Date.now() }).then(function () {
      if (R.POSTS && R.POSTS[pid]) { R.POSTS[pid].text = txt; R.POSTS[pid].ed = Date.now(); }
      R.mod("epMod", false);
      if (R.renderFeed) R.renderFeed();
      if (R.renderProfile) R.renderProfile(R.VIEW || R.ME);
      R.toast("پست ویرایش شد ✅", "ok");
      editing = null;
    }).catch(function (e) { R.toast("ویرایش نشد: " + e.message, "err"); });
  }

  function wrapPostCard() {
    if (!R.postCard || R.postCard.__notifyWrapped) return;
    var orig = R.postCard;
    var wrapped = function (p) {
      var node = orig.apply(R, arguments);
      try {
        if (!node || !p) return node;
        if (p.ed) {
          var tm = node.querySelector(".grow .xs.mut");
          if (tm) tm.textContent = tm.textContent + " • ویرایش‌شده";
        }
        if (p.uid === R.ME && !node.querySelector("[data-epost]")) {
          var b = document.createElement("button");
          b.className = "icobtn";
          b.title = "ویرایش پست";
          b.type = "button";
          b.textContent = "✏️";
          b.setAttribute("data-epost", p.id);
          var del = node.querySelector("[data-del]");
          if (del && del.parentNode) del.parentNode.insertBefore(b, del);
          else {
            var row = node.querySelector(".row");
            if (row) row.appendChild(b);
          }
        }
      } catch (e) {}
      return node;
    };
    wrapped.__notifyWrapped = true;
    R.postCard = wrapped;
  }

  function bindEdit() {
    document.addEventListener("click", function (e) {
      var t = e.target.closest ? e.target.closest("[data-epost]") : null;
      if (!t) return;
      e.preventDefault();
      openEditor(t.getAttribute("data-epost"));
    });
  }

  /* ── ۴. راه‌اندازی ─────────────────────────────────────── */
  function boot() {
    wrapAdd();
    wrapBell();
    wrapPostCard();
    editor();
    bindNotifClicks();
    bindEdit();
    try { if (R.paintBell) R.paintBell(); } catch (e) {}
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  setTimeout(boot, 1800);
})();
