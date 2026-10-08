/* ═══ RONIN GROUPS v1 — گروه‌های چت (افزودنی؛ به فایل‌های اصلی دست نمی‌زند) ═══
   بخش + آیتم منو خودکار ساخته می‌شوند. ساخت گروه فقط 💎 پرمیوم یا اجازه مالک */
(function () {
  if (!window.R || !R.chatRow) return;
  var cur = null, ref = null, listRef = null, all = {};
  function el(id) { return R.$(id); }
  function esc(s) { return R.esc ? R.esc(s) : String(s == null ? "" : s); }
  function canCreate() { return !!(R.ME && (R.prem || R.isOwner() || (R.can && R.can("groups")))); }

  /* استایل کوچک */
  (function () {
    if (document.getElementById("grpCss")) return;
    var s = document.createElement("style"); s.id = "grpCss";
    s.textContent = "#grpList .gcard{cursor:pointer;transition:.18s;position:relative;overflow:hidden}" +
      "#grpList .gcard:hover{transform:translateY(-3px);box-shadow:0 16px 40px rgba(0,0,0,.5),0 0 24px rgba(139,92,255,.25)}" +
      "#grpList .gicon{font-size:26px}#grpList .gmeta{display:flex;gap:8px;align-items:center;margin-top:6px}" +
      "#grpList .gcard::after{content:'';position:absolute;inset-inline:14px;bottom:0;height:2px;border-radius:2px;" +
      "background:linear-gradient(90deg,transparent,#2fe6ff,#8b5cff,transparent);opacity:.7}" +
      "#grpLock{border-color:rgba(255,206,86,.35)}";
    document.head.appendChild(s);
  })();

  /* ساخت خودکار بخش + آیتم منو */
  function injectUI() {
    if (!document.getElementById("sec-groups")) {
      var stage = document.getElementById("stage");
      if (stage) {
        var s = document.createElement("section");
        s.className = "sec"; s.id = "sec-groups";
        s.innerHTML =
          '<div class="head"><h2 class="h2">🏯 گروه‌های چت</h2><span class="chip cy" id="grpCount">۰ گروه</span></div>' +
          '<div class="card hide" id="grpLock"><div class="between"><span class="sm mut">🔒 ساخت گروه فقط با 💎 پرمیوم یا اجازه مالک فعال می‌شود.</span><button class="btn gd mini" type="button" data-go="premium">مشاهده پرمیوم</button></div></div>' +
          '<div class="card mb hide" id="grpForm"><div class="sm b mb">ساخت گروه جدید</div><div class="grid g2"><input class="inp" id="grpName" placeholder="نام گروه" maxlength="40"><input class="inp" id="grpIcon" placeholder="ایموجی (🏯)" maxlength="4"></div><input class="inp mt" id="grpDesc" placeholder="توضیح کوتاه (اختیاری)" maxlength="120"><button class="btn p mt" id="grpCreate" type="button">ساخت گروه</button></div>' +
          '<div class="card mb hide" id="grpChat"><div class="between mb"><b class="sm" id="grpTitle">گروه</b><button class="icobtn" id="grpBack" type="button" title="بستن">✕</button></div><div class="chat"><div class="cbody" id="grpBox"></div><div class="cbar"><input class="inp" id="grpIn" placeholder="پیام گروه…" maxlength="500"><button class="btn p mini" id="grpSend" type="button">ارسال</button></div></div></div>' +
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

  /* لیست گروه‌ها */
  function renderList() {
    var box = el("grpList"); if (!box) return;
    var arr = Object.keys(all).map(function (k) { var g = all[k]; g.id = k; return g; })
      .sort(function (a, b) { return (b.t || 0) - (a.t || 0); });
    var cnt = el("grpCount");
    if (cnt) cnt.textContent = (R.fa ? R.fa(arr.length) : arr.length) + " گروه";
    if (!arr.length) { box.innerHTML = '<div class="empty">هنوز گروهی ساخته نشده — اولین گروه را بساز 🏯</div>'; return; }
    box.innerHTML = arr.map(function (g) {
      return '<div class="card gcard" data-gopen="' + esc(g.id) + '">' +
        '<div class="gicon">' + esc(g.icon || "🏯") + '</div>' +
        '<div class="h3" style="margin-top:6px">' + esc(g.n || "گروه") + ' <span class="xs">' + (g.open === false ? "🔒" : "🔓") + '</span></div>' +
        (g.desc ? '<div class="sm mut" style="margin-top:3px">' + esc(g.desc) + '</div>' : '') +
        '<div class="gmeta"><span class="xs mut">سازنده: ' + esc(g.byn || "کاربر") + '</span><span class="xs mut">• ' + R.time(g.t) + '</span></div></div>';
    }).join("");
  }
  function watchList() {
    if (listRef || !R.db) return;
    listRef = R.db.ref("groups").orderByChild("t").limitToLast(60);
    listRef.on("value", function (s) { all = s.val() || {}; renderList(); },
      function (e) { console.warn("[Ronin] groups:", e.message); });
  }

  /* باز کردن گروه (هر کسی می‌تواند ببیند) */
  function open(gid) {
    cur = gid;
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
    var c = el("grpChat"); if (c) c.classList.add("hide");
  }

  /* ارسال پیام گروه */
  function send() {
    if (!R.ME) return R.needLogin("پیام گروه");
    if (!cur) return R.toast("اول یه گروه را باز کن", "err");
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

  /* ساخت گروه (💎 یا اجازه مالک) */
  function create() {
    if (!R.ME) return R.needLogin("ساخت گروه");
    if (!canCreate()) return R.toast("ساخت گروه فقط با 💎 پرمیوم یا اجازه مالک 🔒", "err");
    var n = el("grpName"), ic = el("grpIcon"), d = el("grpDesc");
    var name = R.clean ? R.clean(n.value, 40) : String(n.value || "").trim().slice(0, 40);
    if (!name) return R.toast("اسم گروه را بنویس", "err");
    var gid = "g" + Date.now().toString(36);
    var obj = {
      n: name, icon: String(ic.value || "🏯").trim().slice(0, 4) || "🏯",
      desc: String(d.value || "").trim().slice(0, 120),
      by: R.ME, byn: (R.USER && R.USER.name) || "کاربر", t: Date.now()
    };
    n.value = ""; ic.value = ""; d.value = "";
    R.db.ref("groups/" + gid).set(obj).then(function () {
      R.toast("گروه ساخته شد 🏯", "ok"); open(gid);
    }).catch(function (e) { R.toast("ساخته نشد: " + e.message, "err"); });
  }

  /* قفل/فرم بر اساس دسترسی */
  function paintAccess() {
    var f = el("grpForm"), l = el("grpLock");
    var ok = canCreate();
    if (f) f.classList.toggle("hide", !ok);
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

  /* کلیک‌ها */
  document.addEventListener("click", function (e) {
    var t = e.target; if (!t || !t.closest) return;
    var o = t.closest("[data-gopen]");
    if (o) { e.preventDefault(); return open(o.getAttribute("data-gopen")); }
    if (t.closest("#grpBack")) { e.preventDefault(); return close(); }
    if (t.closest("#grpSend")) { e.preventDefault(); return send(); }
    if (t.closest("#grpCreate")) { e.preventDefault(); return create(); }
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && e.target && e.target.id === "grpIn") { e.preventDefault(); send(); }
  });

  if (!R.hooks) R.hooks = {};
  R.hooks.groups = function () { watchList(); paintAccess(); };
  if (R.auth && R.auth.onAuthStateChanged) R.auth.onAuthStateChanged(function () { setTimeout(paintAccess, 900); });
  setTimeout(function () { watchList(); paintAccess(); }, 1600);
})();
