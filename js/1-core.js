/* ═══════════════════════════════════════════════════════════════
   RONIN STORE — V19 «NEO RAIN CITY»                  js/1-core.js
   کانفیگ فایربیس • ابزارها • ناوبری • کمکی‌های دیتابیس
   (اولین فایل — همه چیز روی این ساخته می‌شود)
   ═══════════════════════════════════════════════════════════════ */
"use strict";
window.R = window.R || {};
R.V = "19.0";

/* ── ۱. کانفیگ فایربیس ─────────────────────────────────────── */
R.FB = {
  apiKey: "AIzaSyCoGypb6NCmmHr2sK4FLreF4He48QPcLL8",
  authDomain: "ronin-store-3d738.firebaseapp.com",
  databaseURL: "https://ronin-store-3d738-default-rtdb.firebaseio.com",
  projectId: "ronin-store-3d738",
  storageBucket: "ronin-store-3d738.firebasestorage.app",
  messagingSenderId: "7231014477",
  appId: "1:7231014477:web:1607de8a1f602d4ff9be04",
  measurementId: "G-2B6RH66NTW"
};

/* ⚠️ UID حساب مالک — بعداً با هم پرش می‌کنیم */
R.OWNER_UID = "ZMjtFoIcBEY5FhKid8jl8ef3fHe2";

/* ── ۲. راه‌اندازی ─────────────────────────────────────────── */
R.ok = false;
try {
  if (typeof firebase === "undefined") throw new Error("SDK فایربیس نیامد");
  if (!firebase.apps.length) firebase.initializeApp(R.FB);
  R.db = firebase.database();
  R.auth = firebase.auth();
  R.ok = true;
} catch (e) { console.error("[Ronin] init:", e); }

/* ── ۳. وضعیت کاربر ───────────────────────────────────────── */
R.ME = null;       /* uid */
R.USER = null;     /* رکورد کاربر از دیتابیس */
R.role = "user";   /* owner | admin | staff | user */
R.prem = false;    /* پرمیوم */
R.team = false;    /* دسترسی چت تیمی */

/* ── ۴. فهرست دسترسی‌ها ───────────────────────────────────── */
R.PERMS = ["users","posts","news","anime","market","ads","orders",
           "chat","mod","analytics","notifs","events"];

/* ── ۵. ابزارهای پایه ─────────────────────────────────────── */
R.$  = function (id) { return document.getElementById(id); };
R.q  = function (s, r) { return (r || document).querySelector(s); };
R.qa = function (s, r) {
  return Array.prototype.slice.call((r || document).querySelectorAll(s));
};
R.el = function (tag, cls, html) {
  var e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html != null) e.innerHTML = html;
  return e;
};
R.esc = function (s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
    return { "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c];
  });
};
R.setT = function (id, v) { var e = R.$(id); if (e) e.textContent = v; };
R.setH = function (id, v) { var e = R.$(id); if (e) e.innerHTML = v; };
R.btn = function (label, cls, fn) {
  var b = document.createElement("button");
  b.type = "button";
  b.className = "btn " + (cls || "mini");
  b.textContent = label;
  if (fn) b.addEventListener("click", fn);
  return b;
};
R.num = function (n) {
  n = Number(n) || 0;
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return String(n);
};
R.fa = function (s) {
  return String(s).replace(/[0-9]/g, function (d) { return "۰۱۲۳۴۵۶۷۸۹"[d]; });
};
R.time = function (t) {
  var d = Math.floor((Date.now() - (t || 0)) / 1000);
  if (d < 60) return "الان";
  if (d < 3600) return Math.floor(d / 60) + " دقیقه پیش";
  if (d < 86400) return Math.floor(d / 3600) + " ساعت پیش";
  if (d < 2592000) return Math.floor(d / 86400) + " روز پیش";
  try { return new Date(t).toLocaleDateString("fa-IR"); } catch (e) { return ""; }
};
R.day = function () { return new Date().toISOString().slice(0, 10); };
R.debounce = function (fn, ms) {
  var t; return function () {
    var a = arguments, self = this;
    clearTimeout(t);
    t = setTimeout(function () { fn.apply(self, a); }, ms || 300);
  };
};

/* ── ۶. اعلان کوچک (Toast) ────────────────────────────────── */
R.toast = function (msg, kind) {
  var box = R.$("toasts");
  if (!box) { console.log("[Ronin]", msg); return; }
  var el = R.el("div", "toast" + (kind === "err" ? " err" : kind === "ok" ? " ok" : ""));
  el.textContent = msg;
  box.appendChild(el);
  setTimeout(function () {
    el.style.transition = ".3s";
    el.style.opacity = "0";
    el.style.transform = "translateY(10px)";
    setTimeout(function () { el.remove(); }, 320);
  }, 3200);
};

/* ── ۷. دروازه ورود ───────────────────────────────────────── */
R.needLogin = function (what) {
  R.toast((what ? what + " — " : "") + "برای استفاده از این قابلیت وارد حساب شو", "err");
  if (R.openAuth) R.openAuth("login");
  return false;
};
R.isOwner = function () {
  if (!R.ME) return false;
  return (R.OWNER_UID && R.ME === R.OWNER_UID) || R.role === "owner";
};
R.can = function (perm) {
  if (R.isOwner()) return true;
  if (!R.USER || !R.USER.perms) return false;
  return R.USER.perms[perm] === true;
};
R.isStaff = function () { return R.role === "owner" || R.role === "admin" || R.role === "staff"; };

/* ── ۸. ناوبری بین بخش‌ها ─────────────────────────────────── */
R.cur = "home";
R.scrolls = {};
R.hooks = {};
R.go = function (name) {
  var target = R.$("sec-" + name);
  if (!target) return;
  R.scrolls[R.cur] = window.scrollY || 0;
  R.qa(".sec").forEach(function (s) { s.classList.toggle("on", s === target); });
  R.qa("[data-go]").forEach(function (a) {
    a.classList.toggle("on", a.getAttribute("data-go") === name);
  });
  R.cur = name;
  try { history.replaceState(null, "", "#" + name); } catch (e) {}
  var y = R.scrolls[name] || 0;
  requestAnimationFrame(function () { window.scrollTo(0, y); });
  if (R.hooks[name]) { try { R.hooks[name](); } catch (e) { console.error(e); } }
};
R.bindNav = function () {
  document.addEventListener("click", function (e) {
    var t = e.target.closest ? e.target.closest("[data-go]") : null;
    if (!t) return;
    e.preventDefault();
    R.go(t.getAttribute("data-go"));
  });
};

/* ── ۹. کمکی‌های دیتابیس ──────────────────────────────────── */
R.watch = function (path, cb) {
  if (!R.db) return function () {};
  var ref = R.db.ref(path);
  var fn = function (s) { cb(s.val() || {}, s); };
  ref.on("value", fn, function (err) { console.warn("[Ronin] " + path, err.message); });
  return function () { ref.off("value", fn); };
};
R.get = function (path) {
  if (!R.db) return Promise.resolve(null);
  return R.db.ref(path).once("value").then(function (s) { return s.val(); });
};
R.add = function (path, obj) {
  if (!R.db) return Promise.reject(new Error("no db"));
  var o = obj || {};
  if (!o.t) o.t = Date.now();
  return R.db.ref(path).push(o);
};
R.set = function (path, obj) {
  if (!R.db) return Promise.reject(new Error("no db"));
  return R.db.ref(path).set(obj);
};
R.upd = function (path, obj) {
  if (!R.db) return Promise.reject(new Error("no db"));
  return R.db.ref(path).update(obj);
};

/* ── ۱۰. تمیزکاری ورودی ───────────────────────────────────── */
R.clean = function (s, max) {
  s = String(s == null ? "" : s).trim().replace(/\s+/g, " ");
  if (max && s.length > max) s = s.slice(0, max);
  return s;
};
R.slug = function (s) {
  return String(s || "").toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]+/g, "-")
    .replace(/^-+|-+$/g, "").slice(0, 40);
};

/* ── ۱۱. حالت سبک برای گوشی ضعیف ──────────────────────────── */
R.lite = (navigator.hardwareConcurrency || 8) <= 4;
if (R.lite) document.documentElement.classList.add("lite");

/* ── ۱۲. نوار بالا کوچک‌شدن با اسکرول ─────────────────────── */
window.addEventListener("scroll", function () {
  var on = (window.scrollY || 0) > 40;
  var top = R.$("top");
  if (top) top.classList.toggle("small", on);
  document.body.classList.toggle("small", on);
}, { passive: true });

/* ── ۱۳. پرچم آماده بودن ─────────────────────────────────── */
R.ready = function () {
  if (!R.ok) R.toast("اتصال به فایربیس برقرار نشد — اینترنت را چک کن", "err");
  console.log("%cRONIN STORE v" + R.V + " 🤖", "color:#22d3ee;font-weight:900");
};
document.addEventListener("DOMContentLoaded", R.ready);
