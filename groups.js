/* ═══ RONIN GROUPS v2 — گروه‌های چت (بخش + منو خودکار) ═══════════════
   • دکمهٔ «ساخت گروه» — فرم فقط با زدن دکمه باز می‌شود و بعد از ساخت بسته می‌شود
   • عکس گروه: از گالری یا ۸ طرح پیش‌فرض
   • کارت‌های جمع‌وجور (کوچک‌تر و مرتب‌تر)
   • گروه باز (🔓) یا قفل (🔒) — قفل/باز کردن در groups-plus.js
   ساخت گروه: 💎 پرمیوم یا اجازه مالک
   ══════════════════════════════════════════════════════════════════ */
(function () {
  if (!window.R || !R.chatRow) return;
  var cur = null, ref = null, listRef = null, all = {};
  var avSel = "";
  function el(id) { return R.$(id); }
  function esc(s) { return R.esc ? R.esc(s) : String(s == null ? "" : s); }
  function canCreate() { return !!(R.ME && (R.prem || R.isOwner() || (R.can && R.can("groups")))); }

  /* عکس‌های پیش‌فرض گروه */
  var AVS = [
    { k: "🏯", g: "linear-gradient(150deg,#7c5cff,#2fe6ff)" },
    { k: "🦊", g: "linear-gradient(150deg,#ff8a4c,#ff5470)" },
    { k: "🐱", g: "linear-gradient(150deg,#ff9ecb,#e0509a)" },
    { k: "🌙", g: "linear-gradient(150deg,#6a53da,#8fe4ff)" },
    { k: "🐉", g: "linear-gradient(150deg,#53e5b1,#0f766e)" },
    { k: "🎧", g: "linear-gradient(150deg,#22d3ee,#6366f1)" },
    { k: "🎮", g: "linear-gradient(150deg,#f59e0b,#ef4444)" },
    { k: "🍜", g: "linear-gradient(150deg,#fbbf24,#f97316)" }
  ];
  function avBg(k) {
    for (var i = 0; i < AVS.length; i++) if (AVS[i].k === k) return AVS[i].g;
    return "linear-gradient(150deg,#2a2f55,#151a33)";
  }
  /* آواتار گروه: عکس آپلودی یا ایموجی پیش‌فرض */
  function avHTML(g) {
    var a = (g && (g.av || g.icon)) || "🏯";
    if (String(a).indexOf("data:") === 0) {
      return '<span class="gav"><img src="' + a + '" alt="عکس گروه" loading="lazy"></span>';
    }
    return '<span class="gav" style="background:' + avBg(a) + '">' + esc(a) + "</span>";
  }
  R.grpAvHTML = avHTML;

  /* ── استایل ─────────────────────────────────────────────── */
  (function () {
    if (document.getElementById("grpCss")) return;
    var s = document.createElement("style"); s.id = "grpCss";
    s.textContent =
      /* کارت‌های جمع‌وجور */
      "#grpList{display:grid!important;grid-template-columns:repeat(auto-fill,minmax(146px,1fr))!important;" +
        "gap:9px!important;align-items:start}" +
      "#grpList .gcard{cursor:pointer;transition:.18s;position:relative;overflow:hidden;" +
        "padding:10px 11px!important;border-radius:14px!important}" +
      "#grpList .gcard:hover{transform:translateY(-2px);box-shadow:0 12px 30px rgba(0,0,0,.45)," +
        "0 0 18px rgba(139,92,255,.22)}" +
      "#grpList .gcard::after{content:'';position:absolute;inset-inline:11px;bottom:0;height:2px;" +
        "border-radius:2px;background:linear-gradient(90deg,transparent,#2fe6ff,#8b5cff,transparent);opacity:.6}" +
      "#grpList .gav{width:36px;height:36px;border-radius:11px;display:grid;place-items:center;" +
        "font-size:18px;overflow:hidden;border:1px solid rgba(255,255,255,.14);flex:0 0 auto}" +
      "#grpList .gav img{width:100%;height:100%;object-fit:cover;display:block}" +
      "#grpList .gnm{font-size:12.5px;font-weight:800;margin-top:7px;line-height:1.6;" +
        "overflow:hidden;text-overflow:ellipsis;white-space:nowrap}" +
      "#grpList .gdesc{font-size:10px;color:#a8a7c3;margin-top:2px;line-height:1.6;" +
        "overflow:hidden;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical}" +
      "#grpList .gmeta{display:flex;gap:6px;align-items:center;margin-top:6px;font-size:9.5px}" +
      "#grpList .glk{position:absolute;top:8px;inset-inline-end:9px;font-size:11px}" +
      "#grpLock{border-color:rgba(255,206,86,.35)}" +
      /* فرم ساخت گروه */
      ".grpOpenRow{padding:9px 11px;border-radius:12px;background:rgba(47,230,255,.07);" +
        "border:1px solid rgba(47,230,255,.22)}" +
      ".grpOpenChk{width:22px;height:22px;flex:0 0 auto;accent-color:#2fe6ff;cursor:pointer}" +
      "#grpAvRow .gavbtn{width:38px;height:38px;border-radius:12px;border:2px solid transparent;" +
        "display:grid;place-items:center;font-size:17px;cursor:pointer;color:#fff;" +
        "background:transparent;padding:0;transition:.16s}" +
      "#grpAvRow .gavbtn:hover{transform:translateY(-2px)}" +
      "#grpAvRow .gavbtn.on{border-color:#ffd66b;box-shadow:0 0 14px rgba(255,214,107,.45)}" +
      "#grpAvRow .gavbtn img{width:100%;height:100%;object-fit:cover;border-radius:10px}" +
      "#grpAvFile{display:none}";
    document.head.appendChild(s);
  })();

  /* ── ساخت بخش + آیتم منو ────────────────────────────────── */
  function injectUI() {
    if (!document.getElementById("sec-groups")) {
      var stage = document.getElementById("stage");
      if (stage) {
        var s = document.createElement("section");
        s.className = "sec"; s.id = "sec-groups";
        s.innerHTML =
          '<div class="head"><h2 class="h2">🏯 گروه‌های چت</h2><span class="chip cy" id="grpCount">۰ گروه</span></div>' +
          '<div class="card hide" id="grpLock"><div class="between">' +
            '<span class="sm mut">🔒 ساخت گروه فقط با 💎 پرمیوم یا اجازه مالک فعال می‌شود.</span>' +
            '<button class="btn gd mini" type="button" data-go="premium">مشاهده پرمیوم</button></div></div>' +
          '<div class="between mb" id="grpBar">' +
            '<button class="btn p mini" type="button" id="grpNewBtn">➕ ساخت گروه</button>' +
            '<span class="xs mut" id="grpHint">روی گروه بزن تا چت باز شود</span></div>' +
          /* فرم — پیش‌فرض بسته است */
          '<div class="card mb hide" id="grpForm">' +
            '<div class="between mb"><div class="sm b">ساخت گروه جدید</div>' +
              '<button class="icobtn" type="button" id="grpFormX" title="بستن">✕</button></div>' +
            '<div class="grid g2">' +
              '<input class="inp" id="grpName" placeholder="نام گروه" maxlength="40">' +
              '<input class="inp" id="grpIcon" placeholder="ایموجی (🏯)" maxlength="4"></div>' +
            '<input class="inp mt" id="grpDesc" placeholder="توضیح کوتاه (اختیاری)" maxlength="120">' +
            '<div class="sm b mt mb">🖼 عکس گروه</div>' +
            '<div class="row w" id="grpAvRow" style="gap:6px;flex-wrap:wrap"></div>' +
            '<label class="btn mini mt" for="grpAvFile" style="display:inline-block;cursor:pointer">📷 از گالری</label>' +
            '<input type="file" id="grpAvFile" accept="image/*">' +
            '<div class="between mt grpOpenRow">' +
              '<div><div class="sm b">🔓 گروه باز</div>' +
                '<div class="xs mut">هر کاربر واردشده می‌تواند پیام بدهد؛ بدون تیک، گروه قفل و خصوصی می‌شود</div></div>' +
              '<input type="checkbox" id="grpOpen" value="1" class="grpOpenChk"></div>' +
            '<button class="btn p mt" id="grpCreate" type="button">ساخت گروه</button>' +
          '</div>' +
          '<div class="card mb hide" id="grpChat"><div class="between mb"><b class="sm" id="grpTitle">گروه</b>' +
            '<button class="icobtn" id="grpBack" type="button" title="بستن">✕</button></div>' +
            '<div class="chat"><div class="cbody" id="grpBox"></div>' +
            '<div class="cbar"><input class="inp" id="grpIn" placeholder="پیام گروه…" maxlength="500">' +
            '<button class="btn p mini" id="grpSend" type="button">ارسال</button></div></div></div>' +
          '<div class="grid auto" id="grpList"></div>';
        stage.appendChild(s);
      }
    }
    var rail = document.getElementById("rail");
    if (rail && !rail.querySelector('[data-go="groups"]')) {
      var it = document.createElement("div");
      it.className = "ditem";
      it.setAttribute("data-go", "groups");
      it.innerHTML = "<i>🏯</i>گروه‌های چت";
      var anchor = rail.querySelector('[data-go="chat"]');
      if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(it, anchor.nextSibling);
      else rail.appendChild(it);
    }
  }
  injectUI();

  /* ── فرم: باز/بسته ──────────────────────────────────────── */
  function formToggle(on) {
    var f = el("grpForm"); if (!f) return;
    if (on && !canCreate()) {
      if (!R.ME) { if (R.needLogin) R.needLogin("ساخت گروه"); return; }
      return R.toast("ساخت گروه فقط با 💎 پرمیوم یا اجازه مالک 🔒", "err");
    }
    f.classList.toggle("hide", !on);
    var b = el("grpNewBtn");
    if (b) b.textContent = on ? "✕ بستن فرم" : "➕ ساخت گروه";
    if (on) {
      paintAvatars();
      var n = el("grpName");
      if (n) setTimeout(function () { try { n.focus(); } catch (e) {} }, 90);
      try { f.scrollIntoView({ block: "center", behavior: "smooth" }); } catch (e) {}
    }
  }
  R.grpForm = formToggle;

  /* ── انتخاب عکس گروه ────────────────────────────────────── */
  function paintAvatars() {
    var w = el("grpAvRow"); if (!w) return;
    var h = AVS.map(function (a) {
      return '<button type="button" class="gavbtn' + (avSel === a.k ? " on" : "") +
        '" data-gav="' + esc(a.k) + '" title="' + esc(a.k) + '" style="background:' + a.g + '">' +
        a.k + "</button>";
    }).join("");
    if (String(avSel).indexOf("data:") === 0) {
      h = '<button type="button" class="gavbtn on" data-gav="" title="عکس انتخابی">' +
        '<img src="' + avSel + '" alt="عکس گروه"></button>' + h;
    }
    w.innerHTML = h;
  }
  function pickAv(k) { avSel = k; paintAvatars(); }

  /* فشرده‌سازی عکس آواتار (بدون کتابخانه) */
  function compress(file, cb) {
    var fr = new FileReader();
    fr.onload = function () {
      var im = new Image();
      im.onload = function () {
        try {
          var MAX = 240;
          var r = Math.min(1, MAX / Math.max(im.width, im.height));
          var c = document.createElement("canvas");
          c.width = Math.max(1, Math.round(im.width * r));
          c.height = Math.max(1, Math.round(im.height * r));
          var x = c.getContext("2d");
          x.fillStyle = "#0a0e22"; x.fillRect(0, 0, c.width, c.height);
          x.drawImage(im, 0, 0, c.width, c.height);
          var out = c.toDataURL("image/webp", 0.62);
          if (out.indexOf("webp") === -1) out = c.toDataURL("image/jpeg", 0.66);
          if (out.length > 42000) out = c.toDataURL("image/jpeg", 0.45);
          if (out.length > 60000) out = c.toDataURL("image/jpeg", 0.32);
          cb(out);
        } catch (e) { R.toast("پردازش عکس نشد ❌", "err"); }
      };
      im.onerror = function () { R.toast("این عکس خوانده نشد ❌", "err"); };
      im.src = fr.result;
    };
    fr.onerror = function () { R.toast("خواندن فایل نشد ❌", "err"); };
    fr.readAsDataURL(file);
  }
  function onAvFile(e) {
    var f = e.target.files && e.target.files[0];
    try { e.target.value = ""; } catch (er) {}
    if (!f) return;
    if (!/^image\//.test(f.type || "")) return R.toast("فقط عکس انتخاب کن 🖼", "err");
    if (f.size > 8 * 1024 * 1024) return R.toast("عکس بزرگ‌تر از ۸ مگه ❌", "err");
    R.toast("دارم عکس رو آماده می‌کنم… ⏳", "ok");
    compress(f, function (data) { avSel = data; paintAvatars(); R.toast("عکس گروه آماده شد ✅", "ok"); });
  }

  /* ── لیست گروه‌ها ───────────────────────────────────────── */
  function renderList() {
    var box = el("grpList"); if (!box) return;
    var arr = Object.keys(all).map(function (k) { var g = all[k]; g.id = k; return g; })
      .sort(function (a, b) { return (b.t || 0) - (a.t || 0); });
    var cnt = el("grpCount");
    if (cnt) cnt.textContent = (R.fa ? R.fa(arr.length) : arr.length) + " گروه";
    if (!arr.length) {
      box.innerHTML = '<div class="empty">هنوز گروهی ساخته نشده — اولین گروه را بساز 🏯</div>';
      return;
    }
    box.innerHTML = arr.map(function (g) {
      var locked = g.open !== true;
      return '<div class="card gcard" data-gopen="' + esc(g.id) + '">' +
        '<span class="glk">' + (locked ? "🔒" : "🔓") + "</span>" +
        avHTML(g) +
        '<div class="gnm">' + esc(g.n || "گروه") + "</div>" +
        (g.desc ? '<div class="gdesc">' + esc(g.desc) + "</div>" : "") +
        '<div class="gmeta"><span class="xs mut">' + esc(g.byn || "کاربر") +
          '</span><span class="xs mut">• ' + R.time(g.t) + "</span></div></div>";
    }).join("");
  }
  function watchList() {
    if (listRef || !R.db) return;
    listRef = R.db.ref("groups").orderByChild("t").limitToLast(60);
    listRef.on("value", function (s) { all = s.val() || {}; renderList(); },
      function (e) { console.warn("[Ronin] groups:", e.message); });
  }

  /* ── باز کردن گروه ─────────────────────────────────────── */
  function open(gid) {
    cur = gid;
    R.gcur = gid;   /* گروه فعال — برای groups-plus */
    var g = all[gid] || {};
    var chat = el("grpChat"), ttl = el("grpTitle");
    if (chat) chat.classList.remove("hide");
    if (ttl) ttl.textContent = (g.icon || "🏯") + " " + (g.n || "گروه");
    if (ref) { ref.off(); ref = null; }
    if (!R.db) return;
    ref = R.db.ref("groupMsgs/" + gid).orderByChild("t").limitToLast(80);
    ref.on("value", function (s) {
      var box = el("grpBox"); if (!box) return;
      var arr = R.msgList(s.val() || {});
      box.innerHTML = arr.length
        ? arr.map(function (m) { return R.chatRow(m, "groupMsgs/" + gid + "/" + m.id); }).join("")
        : '<div class="empty">گروه خالیه — اولین پیام را بفرست 💬</div>';
      try { if (R.cpAfter) R.cpAfter(); } catch (e) {}
      box.scrollTop = box.scrollHeight;
    }, function (e) { console.warn("[Ronin] groupMsgs:", e.message); });
  }
  function close() {
    if (ref) { ref.off(); ref = null; }
    cur = null;
    R.gcur = null;
    var c = el("grpChat"); if (c) c.classList.add("hide");
  }
  R.grpOpen = open;

  /* ── ارسال پیام ────────────────────────────────────────── */
  function send() {
    if (!R.ME) return R.needLogin("پیام گروه");
    if (!cur) return R.toast("اول یه گروه را باز کن", "err");
    if (R.grpGate && !R.grpGate(cur)) return R.toast("این گروه قفل است — اول عضو شو 🙋", "err");
    var i = el("grpIn"); if (!i) return;
    var txt = R.clean ? R.clean(i.value, 500) : String(i.value || "").trim().slice(0, 500);
    if (!txt) return;
    if (Date.now() - (R._gAt || 0) < 1200) return R.toast("یه کم آرام‌تر ⏳", "err");
    R._gAt = Date.now(); i.value = "";
    R.add("groupMsgs/" + cur, {
      uid: R.ME, n: (R.USER && R.USER.name) || "کاربر",
      av: (R.USER && R.USER.av) || "", text: txt, g: cur
    }).catch(function (e) { R.toast("پیام نرفت: " + e.message, "err"); });
  }

  /* ── ساخت گروه ─────────────────────────────────────────── */
  function create() {
    if (!R.ME) return R.needLogin("ساخت گروه");
    if (!canCreate()) return R.toast("ساخت گروه فقط با 💎 پرمیوم یا اجازه مالک 🔒", "err");
    var n = el("grpName"), ic = el("grpIcon"), d = el("grpDesc");
    var name = R.clean ? R.clean(n.value, 40) : String(n.value || "").trim().slice(0, 40);
    if (!name) return R.toast("اسم گروه را بنویس", "err");
    var gid = "g" + Date.now().toString(36);
    var mems = {};
    mems[R.ME] = {
      n: (R.USER && R.USER.name) || "کاربر", av: (R.USER && R.USER.av) || "",
      role: "owner", t: Date.now()
    };
    var emoji = String(ic.value || "").trim().slice(0, 4) || "🏯";
    var av = avSel || emoji;
    var obj = {
      n: name, icon: emoji, av: av,
      desc: String(d.value || "").trim().slice(0, 120),
      by: R.ME, byn: (R.USER && R.USER.name) || "کاربر", t: Date.now(),
      open: !!(el("grpOpen") && el("grpOpen").checked),
      members: mems
    };
    var btn = el("grpCreate");
    if (btn) { btn.disabled = true; btn.textContent = "دارم می‌سازم…"; }
    R.db.ref("groups/" + gid).set(obj).then(function () {
      n.value = ""; ic.value = ""; d.value = "";
      avSel = "";
      var ck = el("grpOpen"); if (ck) ck.checked = false;
      if (btn) { btn.disabled = false; btn.textContent = "ساخت گروه"; }
      formToggle(false);                 /* فرم بعد از ساخت بسته می‌شود */
      R.toast("گروه ساخته شد 🏯", "ok");
      open(gid);
    }).catch(function (e) {
      if (btn) { btn.disabled = false; btn.textContent = "ساخت گروه"; }
      R.toast("ساخته نشد: " + e.message, "err");
    });
  }

  /* ── قفل/فرم بر اساس دسترسی ────────────────────────────── */
  function paintAccess() {
    var f = el("grpForm"), l = el("grpLock"), nb = el("grpNewBtn");
    var ok = canCreate();
    if (nb) nb.style.display = ok ? "" : "none";
    if (!ok && f) { f.classList.add("hide"); }
    if (!l) return;
    if (ok) { l.classList.add("hide"); return; }
    l.classList.remove("hide");
    var tx = l.querySelector(".sm"), b = l.querySelector(".btn");
    if (tx) tx.textContent = R.ME
      ? "🔒 ساخت گروه فقط با 💎 پرمیوم یا اجازه مالک فعال می‌شود."
      : "برای ساخت گروه وارد حساب شو 🔑";
    if (b) {
      if (R.ME) { b.textContent = "مشاهده پرمیوم"; b.setAttribute("data-go", "premium"); b.removeAttribute("data-authopen"); }
      else { b.textContent = "ورود"; b.setAttribute("data-authopen", "login"); b.removeAttribute("data-go"); }
    }
  }

  /* ── کلیک‌ها ───────────────────────────────────────────── */
  document.addEventListener("click", function (e) {
    var t = e.target; if (!t || !t.closest) return;
    var o = t.closest("[data-gopen]");
    if (o) { e.preventDefault(); return open(o.getAttribute("data-gopen")); }
    var av = t.closest("[data-gav]");
    if (av) { e.preventDefault(); return pickAv(av.getAttribute("data-gav")); }
    if (t.closest("#grpNewBtn")) { e.preventDefault(); return formToggle(el("grpForm") && el("grpForm").classList.contains("hide")); }
    if (t.closest("#grpFormX")) { e.preventDefault(); return formToggle(false); }
    if (t.closest("#grpBack")) { e.preventDefault(); return close(); }
    if (t.closest("#grpSend")) { e.preventDefault(); return send(); }
    if (t.closest("#grpCreate")) { e.preventDefault(); return create(); }
  });
  document.addEventListener("change", function (e) {
    if (e.target && e.target.id === "grpAvFile") onAvFile(e);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && e.target && e.target.id === "grpIn") { e.preventDefault(); send(); }
  });

  if (!R.hooks) R.hooks = {};
  R.hooks.groups = function () { watchList(); paintAccess(); paintAvatars(); };
  if (R.auth && R.auth.onAuthStateChanged) R.auth.onAuthStateChanged(function () { setTimeout(paintAccess, 900); });
  setTimeout(function () { watchList(); paintAccess(); paintAvatars(); }, 1600);
})();
