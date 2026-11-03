/* ═══════════════════════════════════════════════════════════════
   RONIN GROUPS+ v2 — گروه چت کامل (تمیزکاری‌شده)
   • اعضا و نقش‌ها (سازنده / مدیر / عضو)
   • 🔒 قفل / 🔓 باز کردن گروه (سازنده یا مدیر)
   • لینک دعوت (کپی + واتساپ + ساخت لینک جدید)
   • ارسال عکس در گروه (با کپشن) + نمایش بزرگ
   • فوروارد پیام + ریپلای (ریپلای از chat-plus می‌آید)
   • نشانه‌های وضعیت روی کارت گروه (باز/قفل • تعداد اعضا • عضو)
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

  /* ── ۰. کمکی‌ها ─────────────────────────────────────────── */
  function esc(s) { return R.esc ? R.esc(s) : String(s == null ? "" : s); }
  function el(id) { return document.getElementById(id); }
  function fa(n) { return R.fa ? R.fa(String(n)) : String(n); }
  function myName() { return (R.USER && R.USER.name) || "کاربر"; }
  function myAv() { return (R.USER && R.USER.av) || ""; }
  function now() { return Date.now(); }
  function memberCount(g) { return g && g.members ? Object.keys(g.members).length : 0; }
  function isMemberMode(g) { return memberCount(g) > 0; }
  function gObj(gid) { return (G.all && G.all[gid]) || {}; }

  /* ── ۱. استایل ──────────────────────────────────────────── */
  (function () {
    if (el("gpCss")) return;
    var s = document.createElement("style");
    s.id = "gpCss";
    s.textContent =
      /* پیام عکس‌دار */
      ".cpmsg .bub.gmsgimg{padding:6px}" +
      ".gmsgimg img{max-width:230px;max-height:230px;border-radius:13px;display:block;cursor:zoom-in;" +
        "border:1px solid rgba(255,255,255,.14);object-fit:cover}" +
      ".gcap{margin-top:7px;font-size:13px;line-height:1.7;opacity:.94}" +
      ".gfw{font-size:10.5px;opacity:.75;margin-bottom:5px;padding-inline-start:7px;" +
        "border-inline-start:2px solid #2fe6ff}" +
      /* پنل اعضا */
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
      /* لینک دعوت */
      "#gpInviteBox{display:flex;gap:6px;flex-wrap:wrap;align-items:center}" +
      "#gpInviteBox input{flex:1 1 190px;min-width:0;direction:ltr;font-size:11px}" +
      /* نمایش بزرگ عکس */
      ".gplight{position:fixed;inset:0;z-index:9996;background:rgba(3,5,12,.94);" +
        "display:grid;place-items:center;padding:14px;cursor:zoom-out}" +
      ".gplight img{max-width:100%;max-height:88vh;border-radius:16px;" +
        "box-shadow:0 20px 60px rgba(0,0,0,.8)}" +
      ".gplight .x{position:absolute;top:16px;inset-inline-end:16px}" +
      /* کارت دعوت */
      ".gpjoinhead{display:flex;align-items:center;gap:12px;margin-bottom:12px}" +
      ".gpjoinhead .gic{width:52px;height:52px;border-radius:16px;display:grid;place-items:center;" +
        "overflow:hidden;font-size:26px;" +
        "background:linear-gradient(150deg,rgba(124,92,255,.35),rgba(47,230,255,.25));" +
        "border:1px solid rgba(255,255,255,.14)}" +
      ".gpjoinhead .gic img{width:100%;height:100%;object-fit:cover;display:block}" +
      /* قفل */
      "#gpLockHint{display:none;align-items:center;gap:8px;margin:6px 4px;padding:8px 11px;" +
        "border-radius:12px;font-size:12px;background:rgba(255,206,86,.1);" +
        "border:1px solid rgba(255,206,86,.32);color:#ffe7a8}" +
      "#gpLockHint.on{display:flex}" +
      "#gpLockChip{white-space:nowrap}" +
      /* نشانه‌های کارت گروه */
      ".gstat{display:flex;gap:5px;flex-wrap:wrap;margin-top:7px}" +
      ".gpill{font-size:9.5px;padding:1px 7px;border-radius:999px;" +
        "border:1px solid rgba(255,255,255,.16);opacity:.9}" +
      ".gpill.op{color:#7fe9ff;border-color:rgba(47,230,255,.45)}" +
      ".gpill.lk{color:#ffe7a8;border-color:rgba(255,206,86,.45)}" +
      ".gpill.me{color:#bdee63;border-color:rgba(189,238,99,.45)}";
    document.head.appendChild(s);
  })();

  /* ── ۲. نقش و وضعیت عضویت ───────────────────────────────── */
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

  /* وضعیت گروه:
     open===true  → باز: هر کاربر واردشده می‌تواند پیام بدهد
     open===false → قفل: فقط اعضا
     بدون فیلد open و بدون عضو → گروه قدیمی، مثل قبل عمومی */
  function isOpen(g) {
    if (!g) return false;
    if (g.open === true) return true;
    if (g.open === false) return false;
    return !isMemberMode(g);
  }
  R.grpIsOpen = isOpen;

  function maySend(gid) {
    var g = gObj(gid);
    if (isOpen(g)) return !!R.ME;
    return isMemberOf(gid);
  }
  /* groups.js قبل از فرستادن می‌پرسد */
  R.grpGate = function (gid) { return maySend(gid); };

  /* قفل / باز کردن گروه — فقط سازنده یا مدیر */
  function toggleLock(gid) {
    gid = gid || R.gcur;
    if (!gid) return R.toast("اول یه گروه را باز کن", "err");
    if (!R.ME) return R.needLogin("قفل گروه");
    if (!isAdminOf(gid)) return R.toast("فقط سازنده یا مدیر می‌تواند قفل کند 🔒", "err");
    var g = gObj(gid), to = !isOpen(g);
    R.upd("groups/" + gid, { open: to }).then(function () {
      if (G.all[gid]) G.all[gid].open = to;
      R.toast(to
        ? "گروه باز شد 🔓 — هر کاربر واردشده می‌تواند پیام بدهد"
        : "گروه قفل شد 🔒 — فقط اعضا می‌بینند و پیام می‌دهند", "ok");
      paintHeader(); filterList(); decorate();
      if (el("gpMod") && el("gpMod").classList.contains("on")) openInfo(gid);
    }).catch(function (e) { R.toast("نشد: " + e.message, "err"); });
  }

  /* ── ۳. لیست گروه‌ها ────────────────────────────────────── */
  function watchAll() {
    if (!R.db || G.watch) return;
    G.watch = R.db.ref("groups").orderByChild("t").limitToLast(200);
    G.watch.on("value", function (s) {
      G.all = s.val() || {};
      paintHeader();
      filterList();
      decorate();
    }, function (e) { console.warn("[groups+] groups:", e.message); });
  }

  /* گروه‌های قفل‌شده برای غیرعضو توی لیست دیده نمی‌شوند */
  function filterList() {
    var box = el("grpList"); if (!box) return;
    R.qa("[data-gopen]", box).forEach(function (card) {
      var gid = card.getAttribute("data-gopen"), g = gObj(gid);
      var hide = !isOpen(g) && !isMemberOf(gid);
      card.style.display = hide ? "none" : "";
    });
  }
  function obsList() {
    var box = el("grpList");
    if (!box || box._gpObs) return;
    box._gpObs = new MutationObserver(function () { filterList(); });
    box._gpObs.observe(box, { childList: true });
  }

  /* ── ۴. هدر و دکمه‌های گروه ─────────────────────────────── */
  function injectHeader() {
    var chat = el("grpChat"); if (!chat) return;
    var bar = chat.querySelector(".between"); if (!bar) return;
    if (el("gpCount")) return;

    var make = function (id, txt, cls, title) {
      var b = document.createElement("button");
      b.type = "button"; b.id = id; b.title = title || "";
      b.className = cls || "icobtn"; b.textContent = txt;
      return b;
    };
    var lockChip = document.createElement("span");
    lockChip.id = "gpLockChip"; lockChip.className = "chip xs"; lockChip.style.display = "none";
    var cnt = document.createElement("span");
    cnt.id = "gpCount"; cnt.className = "chip cy xs";

    var box = document.createElement("span");
    box.className = "row"; box.style.gap = "4px";
    box.appendChild(lockChip);
    box.appendChild(make("gpLockBtn", "🔓", "icobtn", "قفل / باز کردن گروه"));
    box.appendChild(cnt);
    box.appendChild(make("gpInfoBtn", "👥", "icobtn", "اعضا و دعوت"));
    box.appendChild(make("gpInviteBtn", "🔗", "icobtn", "لینک دعوت"));

    var back = el("grpBack");
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
    var op = isOpen(g);
    var lc = el("gpLockChip");
    if (lc) {
      if (!gid) lc.style.display = "none";
      else {
        lc.style.display = "";
        lc.textContent = op ? "🔓 باز" : "🔒 قفل";
        lc.className = "chip xs " + (op ? "cy" : "gd");
      }
    }
    var lb = el("gpLockBtn");
    if (lb) {
      lb.textContent = op ? "🔒" : "🔓";
      lb.title = op
        ? "قفل کردن گروه (فقط اعضا پیام بدهند)"
        : "باز کردن گروه (هر کاربر واردشده پیام بدهد)";
      lb.style.display = isAdminOf(gid) ? "" : "none";
    }
    paintLock();
  }

  /* اگر گروه قفل است و کاربر عضو نیست، نوار «پیوستن» نشان بده */
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

  /* ── ۵. ردیف پیام (عکس + فوروارد) ───────────────────────── */
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

  /* ── ۶. عکس: فشرده‌سازی و ارسال ─────────────────────────── */
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
    if (inp) {
      cap = R.clean ? R.clean(inp.value, 300) : String(inp.value || "").trim().slice(0, 300);
      inp.value = "";
    }
    R.add("groupMsgs/" + gid, {
      uid: R.ME, n: myName(), av: myAv(), text: cap, img: img, g: gid
    }).then(function () {
      R.toast("عکس فرستاده شد 🖼", "ok");
    }).catch(function (e) { R.toast("عکس نرفت: " + e.message, "err"); });
  }

  /* ── ۷. نمایش بزرگ عکس ──────────────────────────────────── */
  function lightbox(src) {
    var w = document.createElement("div");
    w.className = "gplight";
    w.innerHTML = '<button class="icobtn x" type="button">✕</button><img src="' + esc(src) + '" alt="عکس">';
    w.addEventListener("click", function () { w.remove(); });
    document.body.appendChild(w);
  }

  /* ── ۸. لینک دعوت ──────────────────────────────────────── */
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
        (isAdminOf(gid)
          ? '<button class="btn gd mini" type="button" data-gprenew="' + esc(gid) + '">لینک جدید</button>'
          : "");
    });
  }

  /* ── ۹. مودال‌ها ────────────────────────────────────────── */
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
      if (role === "member") {
        btns += '<button class="btn mini" type="button" data-gpprom="' + esc(uid) + '">مدیر کن</button>';
      } else {
        btns += '<button class="btn mini" type="button" data-gpdemote="' + esc(uid) + '">عضو کن</button>';
      }
      btns += '<button class="btn gd mini" type="button" data-gprem="' + esc(uid) + '">حذف</button>';
    }
    return '<div class="gpmem">' +
      R.avHTML({ name: m.n, av: m.av }, "sm") +
      '<div class="grow"><b>' + esc(m.n || "کاربر") +
        (mine ? ' <span class="xs cy">(تو)</span>' : "") + "</b>" +
      roleChip(role) + "</div>" +
      '<div class="row" style="gap:5px">' + btns + "</div></div>";
  }

  /* آواتار گروه در هدر پنل: عکس یا ایموجی */
  function gAvatarHTML(g) {
    if (R.grpAvHTML) {
      var h = R.grpAvHTML(g);
      if (h) return h;
    }
    return esc(g.icon || "🏯");
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
    var av = gAvatarHTML(g);
    var h = '<div class="between mb"><h3 class="h2">' +
        (String(av).indexOf("<") === 0 ? av : esc(av)) + " " + esc(g.n || "گروه") + "</h3>" +
      '<button class="icobtn" type="button" data-gpclose>✕</button></div>';
    if (g.desc) h += '<div class="sm mut mb">' + esc(g.desc) + "</div>";
    h += '<div class="xs mut mb">سازنده: ' + esc(g.byn || "کاربر") + " • " + fa(uids.length) + " عضو</div>";

    /* کارت قفل / باز */
    if (admin) {
      var op = isOpen(g);
      h += '<div class="card mb" style="padding:12px;border-color:rgba(255,206,86,.28)">' +
        '<div class="between" style="gap:10px"><div>' +
        '<div class="sm b">' + (op ? "🔓 گروه باز است" : "🔒 گروه قفل است") + "</div>" +
        '<div class="xs mut">' + (op
          ? "هر کاربر واردشده می‌تواند این گروه را ببیند و پیام بدهد. با قفل کردن، فقط اعضا اجازه دارند."
          : "فقط اعضا می‌توانند پیام بدهند و گروه در لیست بقیه دیده نمی‌شود.") + "</div></div>" +
        '<button class="btn mini" type="button" data-gplock="' + esc(gid) + '">' +
        (op ? "🔒 قفل کن" : "🔓 باز کن") + "</button></div></div>";
    }

    /* لینک دعوت */
    var canInvite = admin || isMemberOf(gid) || !isMemberMode(g);
    if (canInvite) {
      h += '<div class="card mb" style="padding:12px"><div class="sm b mb">🔗 لینک دعوت</div>' +
        '<div class="xs mut mb">هر کس این لینک را باز کند عضو گروه می‌شود.</div>' +
        '<div id="gpInviteBox"></div></div>';
    } else {
      h += '<div class="card mb" style="padding:12px"><div class="xs mut">' +
        "🔒 لینک دعوت فقط برای اعضای گروه است.</div></div>";
    }

    /* اعضا */
    h += '<div class="sm b mb">👥 اعضا</div><div id="gpMemList">';
    if (!uids.length) {
      h += '<div class="empty">این گروه قبل از سیستم عضویت ساخته شده — عضوی ثبت نشده.</div>';
      if (owner) {
        h += '<button class="btn p mini mt" type="button" data-gpenable="' + esc(gid) + '">' +
          "فعال‌کردن مدیریت اعضا</button>" +
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

  /* ── ۱۱. نقش‌ها و مدیریت اعضا ───────────────────────────── */
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
      .then(function () {
        R.toast("حذف شد", "ok");
        setTimeout(function () { openInfo(gid); }, 250);
      })
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

  /* ── ۱۲. پیوستن به گروه ────────────────────────────────── */
  function joinGroup(gid, cb) {
    if (!R.ME) {
      R.toast("برای پیوستن اول وارد حساب شو 🔑", "err");
      if (R.openAuth) R.openAuth("login");
      return;
    }
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
      '<div class="gpjoinhead"><div class="gic">' + gAvatarHTML(g) + "</div>" +
      "<div><b>" + esc(g.n || "گروه") + "</b>" +
      '<div class="xs mut">' + (n ? fa(n) + " عضو" : "گروه عمومی") +
      " • سازنده: " + esc(g.byn || "کاربر") + "</div></div></div>" +
      (g.desc ? '<div class="sm mut mb">' + esc(g.desc) + "</div>" : "") +
      '<button class="btn p blk" type="button" data-gpjoin="' + esc(gid) +
        '" data-gpcode="' + esc(code) + '">' +
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

  /* ── ۱۳. فوروارد ───────────────────────────────────────── */
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
        if (!isOpen(g) && !isMemberOf(gid)) return;
        rows += '<button class="btn blk" type="button" data-gpfwto="groupMsgs/' + esc(gid) + '">' +
          esc(g.icon || "🏯") + " " + esc(g.n || "گروه") + "</button>";
      });
      rows += "</div>";
    }
    var prev = m.img
      ? '<img src="' + esc(m.img) + '" style="max-width:120px;border-radius:10px;margin-top:6px">'
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

  /* ── ۱۴. کلیک‌ها ───────────────────────────────────────── */
  document.addEventListener("click", function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var x;

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
    if (t.closest("#gpLockBtn")) { e.preventDefault(); return toggleLock(); }
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
      window.open("https://wa.me/?text=" + encodeURIComponent(
        "به گروه «" + ((g1 && g1.n) || "رونین") + "» دعوت شدی 🏯\n" + link), "_blank");
      return;
    }
    if ((x = t.closest("[data-gprenew]"))) { e.preventDefault(); return renewCode(x.getAttribute("data-gprenew")); }
    if ((x = t.closest("[data-gpenable]"))) { e.preventDefault(); return enableMembers(x.getAttribute("data-gpenable")); }
    if ((x = t.closest("[data-gplock]"))) { e.preventDefault(); return toggleLock(x.getAttribute("data-gplock")); }
    if ((x = t.closest("[data-gpprom]"))) { e.preventDefault(); return setRole(R.gcur, x.getAttribute("data-gpprom"), "admin"); }
    if ((x = t.closest("[data-gpdemote]"))) { e.preventDefault(); return setRole(R.gcur, x.getAttribute("data-gpdemote"), "member"); }
    if ((x = t.closest("[data-gprem]"))) { e.preventDefault(); return removeMem(R.gcur, x.getAttribute("data-gprem")); }
    if ((x = t.closest("[data-gpleave]"))) { e.preventDefault(); return leaveGroup(x.getAttribute("data-gpleave")); }
    if ((x = t.closest("[data-gpdel]"))) { e.preventDefault(); return deleteGroup(x.getAttribute("data-gpdel")); }
    if ((x = t.closest("[data-gpjoin]"))) {
      e.preventDefault();
      var jid = x.getAttribute("data-gpjoin");
      if (isMemberOf(jid)) { hide("gpJoinMod"); return openGroupAfterJoin(jid); }
      return joinGroup(jid, function () { hide("gpJoinMod"); openGroupAfterJoin(jid); });
    }
    if ((x = t.closest("[data-gpfwd]"))) { e.preventDefault(); return openForward(x.getAttribute("data-gpfwd")); }
    if ((x = t.closest("[data-gpfwto]"))) { e.preventDefault(); return doForward(x.getAttribute("data-gpfwto")); }
    if (t.closest(".gmsgimg img")) {
      var im = t.closest(".gmsgimg img");
      e.preventDefault();
      return lightbox(im.getAttribute("src"));
    }
  }, false);

  /* ── ۱۵. نشانه‌های وضعیت روی کارت گروه ─────────────────── */
  function decorate() {
    var box = el("grpList"); if (!box) return;
    R.qa("[data-gopen]", box).forEach(function (card) {
      var gid = card.getAttribute("data-gopen"), g = gObj(gid);
      var n = memberCount(g), op = isOpen(g), me = isMemberOf(gid);
      var d = card.querySelector(".gstat");
      if (!d) {
        d = document.createElement("div");
        d.className = "gstat";
        card.appendChild(d);
      }
      var html = '<span class="gpill ' + (op ? "op" : "lk") + '">' +
        (op ? "🔓 باز" : "🔒 قفل") + "</span>" +
        (n ? '<span class="gpill">👥 ' + fa(n) + "</span>" : "") +
        (me ? '<span class="gpill me">عضو</span>' : "");
      if (d.innerHTML !== html) d.innerHTML = html;
    });
  }

  /* ── ۱۶. حلقهٔ همگام‌سازی UI ────────────────────────────── */
  function sync() {
    if (R.gcur && R.gcur !== G.cur) {
      G.cur = R.gcur;
      injectHeader(); injectPhoto();
    }
    if (R.cur === "groups" && R.gcur) { injectHeader(); injectPhoto(); }
    obsList();
    filterList();
    decorate();
    paintHeader();
  }

  var started = false;
  function start() {
    if (started) { sync(); return; }
    started = true;
    watchAll();
    sync();
    setInterval(function () { if (!document.hidden) sync(); }, 3000);
    setTimeout(checkInvite, 1200);
  }

  /* ── ۱۷. اتصال به بقیهٔ برنامه ──────────────────────────── */
  R.hooks = R.hooks || {};
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
