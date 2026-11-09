/* ═══════════════════════════════════════════════════════════════
   RONIN STORE — V19 «NEO RAIN CITY»                  js/2-auth.js
   ثبت‌نام • ورود • خروج • بازیابی رمز • نقش‌ها • اعلان • XP
   ═══════════════════════════════════════════════════════════════ */
"use strict";
(function () {

/* ── ۱. پیام خطای فارسی ────────────────────────────────────── */
var ERR = {
  "auth/invalid-email": "ایمیل معتبر نیست",
  "auth/missing-password": "رمز را وارد کن",
  "auth/weak-password": "رمز خیلی ضعیفه — حداقل ۶ کاراکتر",
  "auth/email-already-in-use": "این ایمیل قبلاً ثبت شده — برو تب «ورود»",
  "auth/user-not-found": "کاربری با این ایمیل پیدا نشد",
  "auth/wrong-password": "رمز اشتباهه",
  "auth/invalid-credential": "ایمیل یا رمز اشتباهه",
  "auth/invalid-login-credentials": "ایمیل یا رمز اشتباهه",
  "auth/too-many-requests": "تلاش‌های زیاد — چند دقیقه صبر کن",
  "auth/network-request-failed": "اینترنت وصل نیست",
  "auth/user-disabled": "این حساب غیرفعال شده",
  "auth/operation-not-allowed":
    "ثبت‌نام با ایمیل/رمز در فایربیس خاموشه — کنسول → Authentication → Sign-in method → Email/Password → Enable"
};
R.authErr = function (e) {
  return ERR[(e && e.code) || ""] || (e && e.message) || "خطای نامشخص";
};

/* ── ۲. متن‌ها و کمکی‌ها ───────────────────────────────────── */
R.roleFa = function (r) {
  return { owner: "مالک 👑", admin: "مدیر", staff: "کارمند", user: "کاربر" }[r] || "کاربر";
};
R.initials = function (n) {
  n = R.clean(n) || "R";
  return n.slice(0, 1).toUpperCase();
};
R.avHTML = function (u, cls) {
  u = u || {};
  var ini = R.esc(R.initials(u.name));
  var inner = u.av ? '<img src="' + R.esc(u.av) + '" alt="">' : ini;
  return '<div class="av ' + (cls || "") + '">' + inner + "</div>";
};

/* ── ۳. سطح و XP ───────────────────────────────────────────── */
R.level = function (xp) { return Math.max(1, Math.floor(Math.sqrt((xp || 0) / 45)) + 1); };
R.xpFor = function (lv) { return Math.round(Math.pow(Math.max(1, lv - 1), 2) * 45); };
R.xp = function (n) {
  if (!R.ME || !R.USER || !n) return;
  R.USER.xp = (R.USER.xp || 0) + n;
  R.upd("users/" + R.ME, { xp: R.USER.xp });
  R.paintUser();
  R.toast("+" + R.fa(n) + " XP", "ok");
};

/* ── ۴. اعلان برای کاربر ──────────────────────────────────── */
R.notify = function (toUid, text, kind, link) {
  if (!toUid || !R.db || toUid === R.ME) return;
  R.add("notifs/" + toUid, {
    text: text, kind: kind || "info", link: link || "", from: R.ME || ""
  }).catch(function () {});
};

/* ── ۵. پیام‌های مودال ورود ───────────────────────────────── */
R.amsg = function (m, err) {
  var e = R.$("aMsg"); if (!e) return;
  e.textContent = m || "";
  e.className = "sm mt " + (err ? "bad" : "ok");
};
R.abtn = function (busy, label) {
  var b = R.$("aBtn"); if (!b) return;
  b.disabled = !!busy;
  b.textContent = busy ? (label || "کمی صبر کن…")
                       : (R.aMode === "reg" ? "ثبت‌نام" : "ورود");
};

/* ── ۶. باز/بسته کردن و تب‌ها ─────────────────────────────── */
R.mod = function (id, on) { var m = R.$(id); if (m) m.classList.toggle("on", on !== false); };
R.closeMod = function (id) { R.mod(id, false); };
R.authTab = function (w) {
  R.aMode = w === "reg" ? "reg" : "login";
  var reg = R.aMode === "reg";
  if (R.$("authTitle")) R.$("authTitle").textContent = reg ? "ساخت حساب رونین" : "ورود به رونین";
  if (R.$("aBtn")) R.$("aBtn").textContent = reg ? "ثبت‌نام" : "ورود";
  if (R.$("tabLogin")) R.$("tabLogin").classList.toggle("on", !reg);
  if (R.$("tabReg")) R.$("tabReg").classList.toggle("on", reg);
  ["fName", "fPass2"].forEach(function (id) {
    var f = R.$(id); if (f) f.style.display = reg ? "" : "none";
  });
  var fg = R.$("aForgot");
  if (fg) fg.parentElement.style.display = reg ? "none" : "";
  R.amsg("", 0);
};
R.aMode = "login";
R.openAuth = function (tab) {
  R.authTab(tab === "reg" ? "reg" : "login");
  R.mod("authmod", true);
  setTimeout(function () {
    var f = R.$("aEmail");
    if (f && !R.ME) { try { f.focus(); } catch (e) {} }
  }, 250);
};

/* ── ۷. ثبت‌نام ───────────────────────────────────────────── */
R.doRegister = function () {
  if (!R.ok) return R.amsg("اتصال به فایربیس برقرار نشد", 1);
  var name = R.clean(R.$("aName").value, 24) || "رونین";
  var email = R.clean(R.$("aEmail").value, 80);
  var p1 = R.$("aPass").value, p2 = R.$("aPass2").value;
  if (!email || email.indexOf("@") < 1) return R.amsg("ایمیل را درست وارد کن", 1);
  if (!p1 || p1.length < 6) return R.amsg("رمز باید حداقل ۶ کاراکتر باشه", 1);
  if (p1 !== p2) return R.amsg("دو رمز یکسان نیستن", 1);

  R.abtn(true, "در حال ساخت حساب…");
  R.pendingName = name;
  R.auth.createUserWithEmailAndPassword(email, p1)
    .then(function (cr) {
      return R.set("users/" + cr.user.uid, {
        name: name, email: email, role: "user", prem: false,
        joined: Date.now(), xp: 0, bio: "", av: "", perms: {}, last: R.day()
      });
    })
    .then(function () {
      R.amsg("خوش آمدی " + name + "! 🎉", 0);
      setTimeout(function () { R.closeMod("authmod"); }, 700);
    })
    .catch(function (e) { R.amsg(R.authErr(e), 1); })
    .then(function () { R.abtn(false); });
};

/* ── ۸. ورود ──────────────────────────────────────────────── */
R.doLogin = function () {
  if (!R.ok) return R.amsg("اتصال به فایربیس برقرار نشد", 1);
  var email = R.clean(R.$("aEmail").value, 80);
  var pass = R.$("aPass").value;
  if (!email || !pass) return R.amsg("ایمیل و رمز را وارد کن", 1);

  R.abtn(true, "در حال ورود…");
  R.auth.signInWithEmailAndPassword(email, pass)
    .then(function () {
      R.amsg("خوش آمدی! 👋", 0);
      setTimeout(function () { R.closeMod("authmod"); }, 600);
    })
    .catch(function (e) { R.amsg(R.authErr(e), 1); })
    .then(function () { R.abtn(false); });
};

/* ── ۹. بازیابی رمز ──────────────────────────────────────── */
R.forgot = function () {
  if (!R.ok) return R.amsg("اتصال به فایربیس برقرار نشد", 1);
  var email = R.clean(R.$("aEmail").value, 80);
  if (!email) return R.amsg("اول ایمیلت را بنویس", 1);
  R.amsg("کمی صبر کن…", 0);
  R.auth.sendPasswordResetEmail(email)
    .then(function () { R.amsg("لینک بازیابی به ایمیلت فرستاده شد 📧", 0); })
    .catch(function (e) { R.amsg(R.authErr(e), 1); });
};

/* ── ۱۰. خروج ─────────────────────────────────────────────── */
R.out = function () {
  if (!R.ok || !R.ME) return;
  R.auth.signOut().then(function () {
    R.toast("خارج شدی", "ok");
    R.go("home");
  }).catch(function () { R.toast("خروج ناموفق بود", "err"); });
};

/* ── ۱۱. رنگ‌آمیزی رابط کاربری ───────────────────────────── */
R.paintUser = function () {
  var u = R.USER;
  var ini = u ? R.initials(u.name) : "؟";
  var nm = u ? u.name : "مهمان";
  R.qa("[data-me-av]").forEach(function (e) { e.textContent = ini; });
  R.qa("[data-me-name]").forEach(function (e) { e.textContent = nm; });
  R.qa("[data-me-role]").forEach(function (e) { e.textContent = R.roleFa(R.role); });
  R.qa("[data-me-level]").forEach(function (e) {
    e.textContent = "سطح " + R.fa(R.level(u ? u.xp : 0));
  });
  R.qa("[data-prem]").forEach(function (e) { e.classList.toggle("hide", !R.prem); });
  R.qa("[data-staff]").forEach(function (e) { e.classList.toggle("hide", !R.isStaff()); });
  R.qa("[data-owner]").forEach(function (e) { e.classList.toggle("hide", !R.isOwner()); });
  R.qa("[data-guest]").forEach(function (e) { e.classList.toggle("hide", !!R.ME); });
  R.qa("[data-auth]").forEach(function (e) { e.classList.toggle("hide", !R.ME); });
};

/* ── ۱۲. ساخت/خواندن رکورد کاربر ─────────────────────────── */
R.applyUser = function (uid) {
  if (!R.db) return;
  R.get("users/" + uid).then(function (u) {
    if (!u) {
      var cu = (R.auth && R.auth.currentUser) || {};
      u = {
        name: R.pendingName || cu.displayName || "رونین",
        email: cu.email || "", role: "user", prem: false,
        joined: Date.now(), xp: 0, bio: "", av: "", perms: {}, last: R.day()
      };
      R.set("users/" + uid, u).catch(function () {});
      R.pendingName = null;
    }
    /* مالک واقعی = UID قفل‌شده */
    if (R.OWNER_UID && uid === R.OWNER_UID && u.role !== "owner") {
      u.role = "owner";
      R.upd("users/" + uid, { role: "owner" }).catch(function () {});
    }
    R.ME = uid;
    R.USER = u;
    R.role = R.OWNER_UID && uid === R.OWNER_UID ? "owner" : (u.role || "user");
    R.prem = (R.role === "owner") || u.prem === true;
    R.team = R.isStaff();
    R.paintUser();
    R.daily();
    if (R.onLogin) { try { R.onLogin(); } catch (e) { console.error(e); } }
  }).catch(function (e) { console.warn("[Ronin] profile:", e.message); });
};

/* ── ۱۳. XP ورود روزانه ──────────────────────────────────── */
R.daily = function () {
  if (!R.ME || !R.USER) return;
  var today = R.day();
  if (R.USER.last === today) return;
  R.USER.last = today;
  R.USER.xp = (R.USER.xp || 0) + 15;
  R.upd("users/" + R.ME, { last: today, xp: R.USER.xp }).catch(function () {});
  R.toast("ورود امروز: +۱۵ XP ☀️", "ok");
};

/* ── ۱۴. گوش دادن به وضعیت ورود ──────────────────────────── */
R.bindAuth = function () {
  if (!R.ok) return;
  R.auth.onAuthStateChanged(function (u) {
    if (u) {
      R.applyUser(u.uid);
    } else {
      R.ME = null; R.USER = null; R.role = "user";
      R.prem = false; R.team = false;
      R.paintUser();
      if (R.onLogout) { try { R.onLogout(); } catch (e) {} }
    }
  });
};

/* ── ۱۵. بستن همه‌ی مودال‌ها با کلیک بیرون ───────────────── */
R.bindModals = function () {
  document.addEventListener("click", function (e) {
    var t = e.target;
    if (t.classList && t.classList.contains("modal")) t.classList.remove("on");
    var c = t.closest ? t.closest("[data-close]") : null;
    if (c) R.closeMod(c.getAttribute("data-close"));
    var o = t.closest ? t.closest("[data-open]") : null;
    if (o) R.mod(o.getAttribute("data-open"), true);
    var a = t.closest ? t.closest("[data-authopen]") : null;
    if (a) R.openAuth(a.getAttribute("data-authopen") || "login");
    var lo = t.closest ? t.closest("[data-logout]") : null;
    if (lo) R.out();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    R.qa(".modal.on").forEach(function (m) { m.classList.remove("on"); });
  });
};

/* ── ۱۶. کلیدهای فرم ورود ────────────────────────────────── */
R.bindAuthForms = function () {
  function on(id, ev, fn) { var e = R.$(id); if (e) e.addEventListener(ev, fn); }
  on("aBtn", "click", function () { R.aMode === "reg" ? R.doRegister() : R.doLogin(); });
  on("tabLogin", "click", function () { R.authTab("login"); });
  on("tabReg", "click", function () { R.authTab("reg"); });
  on("aForgot", "click", R.forgot);
  on("aEmail", "keydown", function (e) {
    if (e.key === "Enter") { var p = R.$("aPass"); if (p) p.focus(); }
  });
  on("aPass", "keydown", function (e) {
    if (e.key !== "Enter") return;
    R.aMode === "reg" ? R.doRegister() : R.doLogin();
  });
  on("aPass2", "keydown", function (e) { if (e.key === "Enter") R.doRegister(); });
};

/* ── ۱۷. آماده‌سازی ───────────────────────────────────────── */
R.bootAuth = function () {
  R.bindModals();
  R.bindAuthForms();
  R.paintUser();
  R.bindAuth();
};

})();
