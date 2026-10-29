/* ═══════════════════════════════════════════════════════════════
   RONIN GROUPS+ v1 — گروه چتِ واتساپی
   • اعضا و نقش‌ها (سازنده / مدیر / عضو)
   • لینک دعوت (کپی + واتساپ + ساخت لینک جدید)
   • ارسال عکس در گروه (با کپشن)
   • فوروارد پیام + ریپلای
   • نمایش عکس با اندازهٔ بزرگ
   (افزودنی — همه چیز روی R.hooks و R.chatRow سوار می‌شود)
   ═══════════════════════════════════════════════════════════════ */
"use strict";
(function () {
  if (!window.R) { console.warn("[groups+] R نیست"); return; }
  if (R.__gp) return;
  R.__gp = true;

  var G = R.GP = {
    all: {},          /* همهٔ گروه‌ها */
    watch: null,
    cur: null,        /* گروه فعال */
    lastSend: 0,
    fw: null,         /* پیامی که در حال فوروارد است */
    pending: null     /* گروهِ در انتظار پیوستن از لینک دعوت */
  };

  function esc(s) { return R.esc ? R.esc(s) : String(s == null ? "" : s); }
  function el(id) { return document.getElementById(id); }
  function fa(n) { return R.fa ? R.fa(String(n)) : String(n); }
  function myName() { return (R.USER && R.USER.name) || "کاربر"; }
  function myAv() { return (R.USER && R.USER.av) || ""; }
  function now() { return Date.now(); }
  function memberCount(g) { return g && g.members ? Object.keys(g.members).length : 0; }
  function isMemberMode(g) { return memberCount(g) > 0; }

  /* ── ۱. استایل ───────────────────────────────────────────── */
  (function () {
    if (el("gpCss")) return;
    var s = document.createElement("style");
    s.id = "gpCss";
    s.textContent =
      ".cpmsg .bub.gmsgimg{padding:6px}" +
      ".gmsgimg img{max-width:230px;max-height:230px;border-radius:13px;display:block;cursor:zoom-in;" +
        "border:1px solid rgba(255,255,255,.14);object-fit:cover}" +
      ".gcap{margin-top:7px;font-size:13px;line-height:1.7;opacity:.94}" +
      ".gfw{font-size:10.5px;opacity:.75;margin-bottom:5px;padding-inline-start:7px;" +
        "border-inline-start:2px solid #2fe6ff}" +
      "#gpMod .box{max-width:520px}" +
      ".gpmem{display:flex;align-items:center;gap:10px;padding:9px 4px;" +
        "border-bottom:1px solid rgba(255,255,255,.07)}" +
      ".gpmem:last-child{border-bottom:0}" +
      ".gpmem .grow{flex:1;min-width:0}" +
      ".gpmem .grow b{display:block;font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}" +
      ".gpmem .grow .xs{margin-top:2px;display:block}" +
      ".gprole{display:inline-block;font-size:10px;padding:1px 7px;border-radius:999px;" +
        "border:1px solid rgba(255,255,255,.18);opacity:.9}" +
      ".gprole.admin{color:#ffd76a;border-color:rgba(255,206,86,.5)}" +
      ".gprole.owner{color:#2fe6ff;border-color:rgba(47,230,255,.5)}" +
      "#gpInviteBox{display:flex;gap:6px;flex-wrap:wrap;align-items:center}" +
      "#gpInviteBox input{flex:1 1 190px;min-width:0;direction:ltr;font-size:11px}" +
      ".gplight{position:fixed;inset:0;z-index:9996;background:rgba(3,5,12,.94);" +
        "display:grid;place-items:center;padding:14px;cursor:zoom-out}" +
      ".gplight img{max-width:100%;max-height:88vh;border-radius:16px;" +
        "box-shadow:0 20px 60px rgba(0,0,0,.8)}" +
      ".gplight .x{position:absolute;top:16px;inset-inline-end:16px}" +
      ".gpjoinhead{display:flex;align-items:center;gap:12px;margin-bottom:12px}" +
      ".gpjoinhead .gic{width:52px;height:52px;border-radius:16px;display:grid;place-items:center;" +
        "font-size:26px;background:linear-gradient(150deg,rgba(124,92,255,.35),rgba(47,230,255,.25));" +
        "border:1px solid rgba(255,255,255,.14)}" +
      "#gpLockHint{display:none;align-items:center;gap:8px;margin:6px 4px;padding:8px 11px;" +
        "border-radius:12px;font-size:12px;background:rgba(255,206,86,.1);" +
        "border:1px solid rgba(255,206,86,.32);color:#ffe7a8}" +
      "#gpLockHint.on{display:flex}";
    document.head.appendChild(s);
  })();

  /* ── ۲. وضعیت عضویت ──────────────────────────────────────── */
  function gObj(gid) { return (G.all && G.all[gid]) || {}; }
  function isOwnerOf(gid) {
    var g = gObj(gid), m = (g.members && g.members[R.ME]) || null;
    return !!R.ME && (g.by === R.ME || (m && m.role === "owner"));
  }
  function isAdminOf(gid) {
    var g = gObj(gid), m = (g.members && g.members[R.ME]) || null;
    return isOwnerOf(gid) || !!(m && m.role === "admin");
  }
  function isMemberOf(gid) {
    var g = gObj(gid);
    return !!(R.ME && g.members && g.members[R.ME]);
  }
  function maySend(gid) {
    var g = gObj(gid);
    if (!isMemberMode(g)) return true;      /* گروه قدیمی/عمومی: مثل قبل */
    return isMemberOf(gid);
  }
  /* groups.js قبل از فرستادن می‌پرسد */
  R.grpGate = function (gid) { return maySend(gid); };

  /* ── ۳. لیست گروه‌ها (برای نقش‌ها و فوروارد) ─────────────── */
  function watchAll() {
    if (!R.db || G.watch) return;
    G.watch = R.db.ref("groups").orderByChild("t").limitToLast(200);
    G.watch.on("value", function (s) {
      G.all = s.val() || {};
      paintHeader();
      filterList();
    }, function (e) { console.warn("[groups+] groups:", e.message); });
  }

  /* گروه‌های خصوصی برای غیرعضو توی لیست دیده نمی‌شوند */
  function filterList() {
    var box = el("grpList"); if (!box) return;
    R.qa("[data-gopen]", box).forEach(function (card) {
      var gid = card.getAttribute("data-gopen"), g = gObj(gid);
      var hide = isMemberMode(g) && !isMemberOf(gid);
      card.style.display = hide ? "none" : "";
    });
  }
  function obsList() {
    var box = el("grpList");
    if (!box || box._gpObs) return;
    box._gpObs = new MutationObserver(function () { filterList(); });
    box._gpObs.observe(box, { childList: true });
  }

  /* ── ۴. دکمه‌های گروه (اعضا / لینک / عکس) ─────────────────── */
  function injectHeader() {
    var chat = el("grpChat"); if (!chat) return;
    var bar = chat.querySelector(".between"); if (!bar) return;
    if (el("gpCount")) return;
    var back = el("grpBack");
    var cnt = document.createElement("span");
    cnt.id = "gpCount"; cnt.className = "chip cy xs";
    var info = document.createElement("button");
    info.type = "button"; info.className = "icobtn"; info.id = "gpInfoBtn";
    info.title = "اعضا و دعوت"; info.textContent = "👥";
    var inv = document.createElement("button");
    inv.type = "button"; inv.className = "icobtn"; inv.id = "gpInviteBtn";
    inv.title = "لینک دعوت"; inv.textContent = "🔗";
    var box = document.createElement("span");
    box.className = "row"; box.style.gap = "4px";
    box.appendChild(cnt); box.appendChild(info); box.appendChild(inv);
    if (back && back.parentNode === bar) bar.insertBefore(box, back);
    else bar.appendChild(box);
  }
  function injectPhoto() {
    var chat = el("grpChat"); if (!chat) return;
    if (!el("gpFile")) {
      var f = document.createElement("input");
      f.type = "file"; f.id = "gpFile"; f.accept = "image/*";
      f.style.display = "none";
      f.addEventListener("change", onPick);
      chat.appendChild(f);
    }
    var bar = chat.querySelector(".cbar"); if (!bar) return;
    if (el("gpPhotoBtn")) return;
    var b = document.createElement("button");
    b.type = "button"; b.className = "icobtn"; b.id = "gpPhotoBtn";
    b.title = "ارسال عکس"; b.textContent = "🖼";
    b.addEventListener("click", function () {
      if (!R.ME) return R.needLogin("ارسال عکس");
      if (!R.gcur) return R.toast("اول یه گروه را باز کن", "err");
      if (!maySend(R.gcur)) return R.toast("اول عضو گروه شو 🙋", "err");
      if (el("gpFile")) el("gpFile").click();
    });
    var inp = el("grpIn");
    if (inp) bar.insertBefore(b, inp); else bar.appendChild(b);
  }
  function paintHeader() {
    var gid = R.gcur, g = gObj(gid), c = el("gpCount");
    if (c) {
      var n = memberCount(g);
      c.textContent = n ? "👥 " + fa(n) : "";
      c.style.display = n ? "" : "none";
    }
    paintLock();
  }
  function paintLock() {
    var chat = el("grpChat"), gid = R.gcur;
    if (!chat) return;
    var h = el("gpLockHint");
    if (!gid || maySend(gid)) { if (h) h.classList.remove("on"); return; }
    if (!h) {
      h = document.createElement("div");
      h.id = "gpLockHint";
      h.innerHTML = "<span>🔒 این گروه خصوصیه — برای پیام دادن باید عضو باشی</span>" +
        '<button class="btn mini" type="button" id="gpJoinNow">پیوستن</button>';
      var bar = chat.querySelector(".cbar");
      if (bar) chat.insertBefore(h, bar); else chat.appendChild(h);
    }
    h.classList.add("on");
  }

  /* ── ۵. ردیف پیام: عکس + فوروارد + دکمهٔ فوروارد ─────────── */
  var _row = R.chatRow;
  if (typeof _row === "function") {
    R.chatRow = function (m, path) {
      m = m || {};
      var out;
      if (m.img) {
        var copy = {}, k;
        for (k in m) copy[k] = m[k];
        var cap = m.text || "";
        copy.text = "";
        out = _row(copy, path);
        var bub = '<div class="bub gmsgimg"><img src="' + esc(m.img) + '" alt="عکس" loading="lazy">' +
          (cap ? '<div class="gcap">' + esc(cap) + "</div>" : "") + "</div>";
        if (out.indexOf('<div class="bub"></div>') > -1) {
          out = out.replace('<div class="bub"></div>', bub);
        } else {
          out = out.replace("</div></div>", '<div class="xs cy" style="margin-top:4px">🖼 عکس</div></div></div>');
        }
      } else {
        out = _row(m, path);
      }
      if (m.fw && m.fw.n) {
        out = out.replace('<div class="cpmain">',
          '<div class="cpmain"><div class="gfw">↪ فوروارد از <b>' + esc(m.fw.n) + "</b></div>");
      }
      out = out.replace("↩</button>",
        '↩</button><button type="button" class="rxb" data-gpfwd="' + esc(path) + '" title="فوروارد">↪</button>');
      return out;
    };
  }

  /* ── ۶. عکس: فشرده‌سازی و ارسال ───────────────────────────── */
  function compress(file, cb) {
    var fr = new FileReader();
    fr.onload = function () {
      var im = new Image();
      im.onload = function () {
        try {
          var MAX = 1000;
          var r = Math.min(1, MAX / Math.max(im.width, im.height));
          var c = document.createElement("canvas");
          c.width = Math.max(1, Math.round(im.width * r));
          c.height = Math.max(1, Math.round(im.height * r));
          var x = c.getContext("2d");
          x.fillStyle = "#0a0e22"; x.fillRect(0, 0, c.width, c.height);
          x.drawImage(im, 0, 0, c.width, c.height);
          var out = c.toDataURL("image/webp", 0.7);
          if (out.indexOf("webp") === -1) out = c.toDataURL("image/jpeg", 0.74);
          if (out.length > 230000) out = c.toDataURL("image/jpeg", 0.5);
          cb(out);
        } catch (e) { R.toast("پردازش عکس نشد ❌", "err"); }
      };
      im.onerror = function () { R.toast("این عکس خوانده نشد ❌", "err"); };
      im.src = fr.result;
    };
    fr.onerror = function () { R.toast("خواندن فایل نشد ❌", "err"); };
    fr.readAsDataURL(file);
  }
  function onPick(e) {
    var f = e.target.files && e.target.files[0];
    try { e.target.value = ""; } catch (er) {}
    if (!f) return;
    if (!/^image\//.test(f.type || "")) return R.toast("فقط عکس انتخاب کن 🖼", "err");
    if (f.size > 8 * 1024 * 1024) return R.toast("عکس بزرگ‌تر از ۸ مگه ❌", "err");
    R.toast("دارم عکس رو آماده می‌کنم… ⏳", "ok");
    compress(f, function (data) { sendImage(data); });
  }
  function sendImage(img) {
    var gid = R.gcur;
    if (!gid) return R.toast("اول یه گروه را باز کن", "err");
    if (!maySend(gid)) return R.toast("اول عضو گروه شو 🙋", "err");
    if (now() - G.lastSend < 1200) return R.toast("یه کم آرام‌تر ⏳", "err");
    G.lastSend = now();
    var inp = el("grpIn"), cap = "";
    if (inp) { cap = R.clean ? R.clean(inp.value, 300) : String(inp.value || "").trim().slice(0, 300); inp.value = ""; }
    R.add("groupMsgs/" + gid, {
      uid: R.ME, n: myName(), av: myAv(), text: cap, img: img, g: gid
    }).then(function () {
      R.toast("عکس فرستاده شد 🖼", "ok");
    }).catch(function (e) { R.toast("عکس نرفت: " + e.message, "err"); });
  }

  /* ── ۷. نمایش بزرگ عکس ───────────────────────────────────── */
  function lightbox(src) {
    var w = document.createElement("div");
    w.className = "gplight";
    w.innerHTML = '<button class="icobtn x" type="button">✕</button><img src="' + esc(src) + '" alt="عکس">';
    w.addEventListener("click", function () { w.remove(); });
    document.body.appendChild(w);
  }

  /* ── ۸. لینک دعوت ───────────────────────────────────────── */
  var ABC = "abcdefghjkmnpqrstuvwxyz23456789";
  function newCode() {
    var s = "";
    for (var i = 0; i < 7; i++) s += ABC[Math.floor(Math.random() * ABC.length)];
    return s;
  }
  function linkOf(code) {
    return location.origin + location.pathname + "?join=" + code;
  }
  function copyText(t, msg) {
    var done = function () { R.toast(msg || "کپی شد ✅", "ok"); };
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(t).then(done, fallback);
        return;
      }
    } catch (e) {}
    fallback();
    function fallback() {
      try {
        var ta = document.createElement("textarea");
        ta.value = t; ta.style.position = "fixed"; ta.style.opacity = "0";
        document.body.appendChild(ta); ta.select();
        document.execCommand("copy"); ta.remove(); done();
      } catch (e) { R.toast("کپی نشد — دستی انتخاب کن", "err"); }
    }
  }
  function ensureCode(gid, cb) {
    var g = gObj(gid);
    if (g.code) return cb(g.code);
    var code = newCode();
    R.upd("groups/" + gid, { code: code, codeAt: now() })
      .then(function () { return R.set("groupInvites/" + code, { g: gid, t: now(), by: R.ME }); })
      .then(function () { cb(code); })
      .catch(function (e) { R.toast("ساخت لینک نشد: " + e.message, "err"); });
  }
  function renewCode(gid) {
    var g = gObj(gid), old = g.code;
    var code = newCode();
    R.upd("groups/" + gid, { code: code, codeAt: now() })
      .then(function () {
        if (old) R.db.ref("groupInvites/" + old).remove().catch(function () {});
        return R.set("groupInvites/" + code, { g: gid, t: now(), by: R.ME });
      })
      .then(function () {
        R.toast("لینک قبلی باطل شد — لینک جدید ساخته شد 🔗", "ok");
        paintInviteBox(gid);
      })
      .catch(function (e) { R.toast("نشد: " + e.message, "err"); });
  }
  function paintInviteBox(gid) {
    var box = el("gpInviteBox"); if (!box) return;
    ensureCode(gid, function (code) {
      var link = linkOf(code);
      box.innerHTML =
        '<input class="inp" id="gpInviteInput" readonly value="' + esc(link) + '">' +
        '<button class="btn mini" type="button" data-gpcopy="' + esc(link) + '">📋 کپی</button>' +
        '<button class="btn mini" type="button" data-gpwa="' + esc(link) + '">واتساپ</button>' +
        (isAdminOf(gid) ? '<button class="btn gd mini" type="button" data-gprenew="' + esc(gid) + '">لینک جدید</button>' : "");
    });
  }

  /* ── ۹. مودال‌ها ─────────────────────────────────────────── */
  function modal(id) {
    var m = el(id);
    if (!m) {
      m = document.createElement("div");
      m.className = "modal"; m.id = id;
      m.innerHTML = '<div class="box" id="' + id + 'Box"></div>';
      document.body.appendChild(m);
    }
    return m;
  }
  function show(id) { modal(id).classList.add("on"); }
  function hide(id) { var m = el(id); if (m) m.classList.remove("on"); }
  function boxOf(id) { modal(id); return el(id + "Box"); }

  /* ── ۱۰. پنل اعضا ───────────────────────────────────────── */
  function roleChip(role) {
    if (role === "owner") return '<span class="gprole owner">سازنده</span>';
    if (role === "admin") return '<span class="gprole admin">مدیر</span>';
    return '<span class="gprole">عضو</span>';
  }
  function memRow(uid, m, canAdmin) {
    m = m || {};
    var role = m.role || "member", mine = uid === R.ME, btns = "";
    if (canAdmin && role !== "owner" && !mine) {
      if (role === "member") btns += '<button class="btn mini" type="button" data-gpprom="' + esc(uid) + '">مدیر کن</button>';
      else btns += '<button class="btn mini" type="button" data-gpdemote="' + esc(uid) + '">عضو کن</button>';
      btns += '<button class="btn gd mini" type="button" data-gprem="' + esc(uid) + '">حذف</button>';
    }
    return '<div class="gpmem">' +
      R.avHTML({ name: m.n, av: m.av }, "sm") +
      '<div class="grow"><b>' + esc(m.n || "کاربر") + (mine ? ' <span class="xs cy">(تو)</span>' : "") + "</b>" +
      roleChip(role) + "</div>" +
      '<div class="row" style="gap:5px">' + btns + "</div></div>";
  }
  function openInfo(gid) {
    gid = gid || R.gcur;
    if (!gid) return R.toast("اول یه گروه را باز کن", "err");
    if (!R.ME) return R.needLogin("اعضای گروه");
    var g = gObj(gid), mem = g.members || {};
    var admin = isAdminOf(gid), owner = isOwnerOf(gid);
    var uids = Object.keys(mem).sort(function (a, b) {
      var ra = (mem[a] && mem[a].role) || "member", rb = (mem[b] && mem[b].role) || "member";
      var w = { owner: 0, admin: 1, member: 2 };
      return (w[ra] || 2) - (w[rb] || 2);
    });
    var h = '<div class="between mb"><h3 class="h2">' + esc(g.icon || "🏯") + " " + esc(g.n || "گروه") + "</h3>" +
      '<button class="icobtn" type="button" data-gpclose>✕</button></div>';
    if (g.desc) h += '<div class="sm mut mb">' + esc(g.desc) + "</div>";
    h += '<div class="xs mut mb">سازنده: ' + esc(g.byn || "کاربر") + " • " + fa(uids.length) + " عضو</div>";

    var canInvite = admin || isMemberOf(gid) || !isMemberMode(g);
    if (canInvite) {
      h += '<div class="card mb" style="padding:12px"><div class="sm b mb">🔗 لینک دعوت</div>' +
        '<div class="xs mut mb">هر کس این لینک را باز کند عضو گروه می‌شود.</div>' +
        '<div id="gpInviteBox"></div></div>';
    } else {
      h += '<div class="card mb" style="padding:12px"><div class="xs mut">🔒 لینک دعوت فقط برای اعضای گروه است.</div></div>';
    }

    h += '<div class="sm b mb">👥 اعضا</div><div id="gpMemList">';
    if (!uids.length) {
      h += '<div class="empty">این گروه قبل از سیستم عضویت ساخته شده — عضوی ثبت نشده.</div>';
      if (owner) {
        h += '<button class="btn p mini mt" type="button" data-gpenable="' + esc(gid) + '">فعال‌کردن مدیریت اعضا</button>' +
          '<div class="xs mut mt">بعد از فعال‌سازی فقط اعضا می‌توانند پیام بدهند؛ لینک دعوت را برای بقیه بفرست.</div>';
      }
    } else {
      uids.forEach(function (uid) { h += memRow(uid, mem[uid], admin); });
    }
    h += "</div>";

    h += '<div class="row mt" style="gap:8px;flex-wrap:wrap">' +
      '<button class="btn mini" type="button" data-gpleave="' + esc(gid) + '">خروج از گروه</button>' +
      (owner ? '<button class="btn gd mini" type="button" data-gpdel="' + esc(gid) + '">حذف گروه</button>' : "") +
      "</div>";

    boxOf("gpMod").innerHTML = h;
    show("gpMod");
    paintInviteBox(gid);
  }

  /* ── ۱۱. تغییر نقش‌ها ───────────────────────────────────── */
  function setRole(gid, uid, role) {
    if (!R.ME) return R.needLogin();
    if (!isAdminOf(gid)) return R.toast("فقط مدیرها می‌توانند نقش عوض کنند 🔒", "err");
    if (uid === gObj(gid).by && role !== "owner") return R.toast("سازنده را نمی‌شود تغییر داد 👑", "err");
    R.db.ref("groups/" + gid + "/members/" + uid + "/role").set(role)
      .then(function () {
        R.toast(role === "admin" ? "مدیر شد ✅" : "به عضو عادی تغییر کرد", "ok");
        setTimeout(function () { openInfo(gid); }, 250);
      })
      .catch(function (e) { R.toast("نشد: " + e.message, "err"); });
  }
  function removeMem(gid, uid) {
    if (!isAdminOf(gid)) return R.toast("اجازه نداری 🔒", "err");
    if (uid === gObj(gid).by) return R.toast("سازنده را نمی‌شود حذف کرد 👑", "err");
    if (!window.confirm("این عضو از گروه حذف شود؟")) return;
    R.db.ref("groups/" + gid + "/members/" + uid).remove()
      .then(function () { R.toast("حذف شد", "ok"); setTimeout(function () { openInfo(gid); }, 250); })
      .catch(function (e) { R.toast("نشد: " + e.message, "err"); });
  }
  function leaveGroup(gid) {
    if (!R.ME) return R.needLogin();
    if (isOwnerOf(gid)) {
      R.toast("سازنده نمی‌تواند خارج شود — گروه را حذف کن یا کسی را مدیر کن 👑", "err");
      return;
    }
    if (!window.confirm("از گروه خارج می‌شوی؟")) return;
    R.db.ref("groups/" + gid + "/members/" + R.ME).remove()
      .then(function () {
        R.toast("از گروه خارج شدی 👋", "ok");
        hide("gpMod");
        if (R.cur === "groups" && R.gcur === gid) { try { R.go("groups"); } catch (e) {} }
      })
      .catch(function (e) { R.toast("نشد: " + e.message, "err"); });
  }
  function deleteGroup(gid) {
    if (!isOwnerOf(gid)) return R.toast("فقط سازنده 👑", "err");
    if (!window.confirm("گروه و همهٔ پیام‌هایش پاک شود؟ این کار برگشت‌پذیر نیست.")) return;
    R.db.ref("groups/" + gid).remove().catch(function () {});
    R.db.ref("groupMsgs/" + gid).remove()
      .then(function () {
        R.toast("گروه حذف شد 🗑", "ok");
        hide("gpMod");
        if (R.grpOpen) { try { R.go("groups"); } catch (e) {} }
      })
      .catch(function (e) { R.toast("نشد: " + e.message, "err"); });
  }
  function enableMembers(gid) {
    if (!isOwnerOf(gid)) return R.toast("فقط سازنده 👑", "err");
    if (!window.confirm("مدیریت اعضا فعال شود؟ بعدش فقط اعضا می‌توانند پیام بدهند و بقیه با لینک دعوت اضافه می‌شوند.")) return;
    R.db.ref("groups/" + gid + "/members/" + R.ME)
      .set({ n: myName(), av: myAv(), role: "owner", t: now() })
      .then(function () {
        R.toast("مدیریت اعضا فعال شد ✅ — لینک دعوت را بفرست", "ok");
        setTimeout(function () { openInfo(gid); }, 300);
      })
      .catch(function (e) { R.toast("نشد: " + e.message, "err"); });
  }

  /* ── ۱۲. پیوستن به گروه ─────────────────────────────────── */
  function joinGroup(gid, cb) {
    if (!R.ME) { R.toast("برای پیوستن اول وارد حساب شو 🔑", "err"); if (R.openAuth) R.openAuth("login"); return; }
    if (isMemberOf(gid)) { if (cb) cb(); return; }
    R.db.ref("groups/" + gid + "/members/" + R.ME)
      .set({ n: myName(), av: myAv(), role: "member", t: now() })
      .then(function () {
        R.toast("به گروه پیوستی 🎉", "ok");
        if (cb) cb();
      })
      .catch(function (e) { R.toast("پیوستن نشد: " + e.message, "err"); });
  }
  function openGroupAfterJoin(gid) {
    if (!R.grpOpen) return;
    try { R.go("groups"); } catch (e) {}
    setTimeout(function () { try { R.grpOpen(gid); } catch (e) {} }, 450);
  }
  function showJoinCard(gid, g, code) {
    var n = memberCount(g);
    boxOf("gpJoinMod").innerHTML =
      '<div class="between mb"><h3 class="h2">دعوت به گروه</h3>' +
      '<button class="icobtn" type="button" data-gpclose="gpJoinMod">✕</button></div>' +
      '<div class="gpjoinhead"><div class="gic">' + esc(g.icon || "🏯") + "</div>" +
      "<div><b>" + esc(g.n || "گروه") + "</b>" +
      '<div class="xs mut">' + (n ? fa(n) + " عضو" : "گروه عمومی") +
      " • سازنده: " + esc(g.byn || "کاربر") + "</div></div></div>" +
      (g.desc ? '<div class="sm mut mb">' + esc(g.desc) + "</div>" : "") +
      '<button class="btn p blk" type="button" data-gpjoin="' + esc(gid) + '" data-gpcode="' + esc(code) + '">' +
      (isMemberOf(gid) ? "باز کردن گروه" : "پیوستن به گروه") + "</button>";
    show("gpJoinMod");
  }
  function checkInvite() {
    var code = null;
    try { code = new URLSearchParams(location.search).get("join"); } catch (e) {}
    if (!code) return;
    try { history.replaceState(null, "", location.pathname + location.hash); } catch (e) {}
    R.get("groupInvites/" + code).then(function (v) {
      if (!v || !v.g) return R.toast("این لینک دعوت معتبر نیست ❌", "err");
      G.pending = { gid: v.g, code: code };
      R.get("groups/" + v.g).then(function (g) {
        if (!g) return R.toast("گروه پیدا نشد ❌", "err");
        showJoinCard(v.g, g, code);
      });
    }).catch(function () {});
  }

  /* ── ۱۳. فوروارد ────────────────────────────────────────── */
  function openForward(path) {
    if (!R.ME) return R.needLogin("فوروارد");
    var m = (R.cpIndex && R.cpIndex[path]) || null;
    if (!m) return R.toast("این پیام پیدا نشد — صفحه را رفرش کن", "err");
    G.fw = m;
    var rows = '<div class="card" style="padding:0">' +
      '<button class="btn blk" type="button" data-gpfwto="chat">💬 چت عمومی</button></div>';
    var gids = Object.keys(G.all);
    if (gids.length) {
      rows += '<div class="sm b mt mb">گروه‌ها</div><div class="card" style="padding:0">';
      gids.forEach(function (gid) {
        var g = G.all[gid];
        if (isMemberMode(g) && !isMemberOf(gid)) return;
        rows += '<button class="btn blk" type="button" data-gpfwto="groupMsgs/' + esc(gid) + '">' +
          esc(g.icon || "🏯") + " " + esc(g.n || "گروه") + "</button>";
      });
      rows += "</div>";
    }
    var prev = m.img ? '<img src="' + esc(m.img) + '" style="max-width:120px;border-radius:10px;margin-top:6px">'
      : '<div class="sm mut" style="margin-top:6px">' + esc(String(m.text || "").slice(0, 90)) + "</div>";
    boxOf("gpFwMod").innerHTML =
      '<div class="between mb"><h3 class="h2">↪ فوروارد</h3>' +
      '<button class="icobtn" type="button" data-gpclose="gpFwMod">✕</button></div>' +
      '<div class="xs mut">از طرف <b>' + esc(m.n || "کاربر") + "</b></div>" + prev +
      '<div class="mt">' + rows + "</div>";
    show("gpFwMod");
  }
  function doForward(target) {
    var m = G.fw;
    if (!m) return;
    var o = { uid: R.ME, n: myName(), av: myAv(), text: m.text || "", fw: { n: m.n || "کاربر" } };
    if (m.img) o.img = m.img;
    if (target !== "chat") o.g = String(target).split("/")[1];
    R.add(target, o).then(function () {
      R.toast("فوروارد شد ↪", "ok");
      hide("gpFwMod");
      G.fw = null;
    }).catch(function (e) { R.toast("فوروارد نشد: " + e.message, "err"); });
  }

  /* ── ۱۴. کلیک‌ها ────────────────────────────────────────── */
  document.addEventListener("click", function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var x, gid;

    if (t.classList && t.classList.contains("modal")) {
      if (t.id === "gpMod" || t.id === "gpFwMod" || t.id === "gpJoinMod") t.classList.remove("on");
      return;
    }
    if ((x = t.closest("[data-gpclose]"))) {
      e.preventDefault();
      hide(x.getAttribute("data-gpclose") || "gpMod");
      return;
    }
    if (t.closest("#gpInfoBtn")) { e.preventDefault(); return openInfo(); }
    if (t.closest("#gpInviteBtn")) {
      e.preventDefault();
      if (!R.gcur) return R.toast("اول یه گروه را باز کن", "err");
      openInfo();
      return;
    }
    if (t.closest("#gpJoinNow")) {
      e.preventDefault();
      if (!R.gcur) return;
      var g0 = gObj(R.gcur);
      if (!g0.code) return R.toast("لینک دعوت گروه را از مدیر بگیر 🔗", "err");
      return joinGroup(R.gcur, function () { openGroupAfterJoin(R.gcur); });
    }
    if ((x = t.closest("[data-gpcopy]"))) {
      e.preventDefault();
      return copyText(x.getAttribute("data-gpcopy"), "لینک دعوت کپی شد ✅");
    }
    if ((x = t.closest("[data-gpwa]"))) {
      e.preventDefault();
      var link = x.getAttribute("data-gpwa");
      var g1 = gObj(R.gcur);
      window.open("https://wa.me/?text=" + encodeURIComponent("به گروه «" + ((g1 && g1.n) || "رونین") + "» دعوت شدی 🏯\n" + link), "_blank");
      return;
    }
    if ((x = t.closest("[data-gprenew]"))) {
      e.preventDefault();
      return renewCode(x.getAttribute("data-gprenew"));
    }
    if ((x = t.closest("[data-gpenable]"))) {
      e.preventDefault();
      return enableMembers(x.getAttribute("data-gpenable"));
    }
    if ((x = t.closest("[data-gpprom]"))) {
      e.preventDefault();
      gid = R.gcur;
      return setRole(gid, x.getAttribute("data-gpprom"), "admin");
    }
    if ((x = t.closest("[data-gpdemote]"))) {
      e.preventDefault();
      return setRole(R.gcur, x.getAttribute("data-gpdemote"), "member");
    }
    if ((x = t.closest("[data-gprem]"))) {
      e.preventDefault();
      return removeMem(R.gcur, x.getAttribute("data-gprem"));
    }
    if ((x = t.closest("[data-gpleave]"))) {
      e.preventDefault();
      return leaveGroup(x.getAttribute("data-gpleave"));
    }
    if ((x = t.closest("[data-gpdel]"))) {
      e.preventDefault();
      return deleteGroup(x.getAttribute("data-gpdel"));
    }
    if ((x = t.closest("[data-gpjoin]"))) {
      e.preventDefault();
      var jid = x.getAttribute("data-gpjoin");
      if (isMemberOf(jid)) { hide("gpJoinMod"); return openGroupAfterJoin(jid); }
      return joinGroup(jid, function () { hide("gpJoinMod"); openGroupAfterJoin(jid); });
    }
    if ((x = t.closest("[data-gpfwd]"))) {
      e.preventDefault();
      return openForward(x.getAttribute("data-gpfwd"));
    }
    if ((x = t.closest("[data-gpfwto]"))) {
      e.preventDefault();
      return doForward(x.getAttribute("data-gpfwto"));
    }
    if (t.closest(".gmsgimg img")) {
      var im = t.closest(".gmsgimg img");
      e.preventDefault();
      return lightbox(im.getAttribute("src"));
    }
  }, false);

  /* ── ۱۵. حلقهٔ همگام‌سازی UI ─────────────────────────────── */
  function sync() {
    if (R.gcur && R.gcur !== G.cur) {
      G.cur = R.gcur;
      injectHeader(); injectPhoto();
    }
    if (R.cur === "groups" && R.gcur) { injectHeader(); injectPhoto(); }
    obsList();
    filterList();
    paintHeader();
  }

  var started = false;
  function start() {
    if (started) { sync(); return; }
    started = true;
    watchAll();
    sync();
    setInterval(sync, 800);
    setTimeout(checkInvite, 1200);
  }

  if (!R.hooks) R.hooks = {};
  var prevHook = R.hooks.groups;
  R.hooks.groups = function () {
    if (typeof prevHook === "function") { try { prevHook(); } catch (e) {} }
    sync();
  };
  if (R.auth && R.auth.onAuthStateChanged) {
    R.auth.onAuthStateChanged(function () {
      setTimeout(function () {
        sync();
        /* اگر لینک دعوت قبل از ورود باز شده بود، دوباره کارت را نشان بده */
        if (G.pending && R.ME && !isMemberOf(G.pending.gid)) {
          R.get("groups/" + G.pending.gid).then(function (g) {
            if (g) showJoinCard(G.pending.gid, g, G.pending.code);
          });
        }
      }, 900);
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
  setTimeout(start, 1800);
})();
