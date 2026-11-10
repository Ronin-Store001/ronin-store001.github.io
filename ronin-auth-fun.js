/* ═══════════════════════════════════════════════════════════════
   RONIN STORE — AUTH FX · ronin-auth-fun.js · v1
   ───────────────────────────────────────────────────────────────
   فرم ورود/ثبت‌نام تازه:
   • قاب نئونی متحرک، ورود انیمیشنی، تب‌های لغزان
   • نمایش/مخفی کردن رمز + هشدار Caps Lock
   • شیطنت: اگر ایمیل/رمز خالی باشد و «ورود» را بزنی، دکمه فرار می‌کند
     (بعد از سه بار خودش برمی‌گردد و راهنمایی می‌کند)
   هیچ شناسه‌ای عوض نشده؛ ورود و ثبت‌نام واقعی سر جای خودش است.
   ═══════════════════════════════════════════════════════════════ */
"use strict";
(function () {
  if (!window.R || R.__af) return;
  R.__af = true;

  var D = { n: 0, moveT: 0, ready: false };

  function el(i) { return document.getElementById(i); }
  function btn() { return el("aBtn"); }
  function mail() { return el("aEmail"); }
  function pass() { return el("aPass"); }
  function box() { var b = btn(); return b ? b.closest(".box") : null; }

  function css() {
    if (el("afCss")) return;
    var s = document.createElement("style");
    s.id = "afCss";
    s.textContent = [
      "#authmod .box{position:relative;border-radius:26px;overflow:hidden;isolation:isolate;" +
        "border:1px solid rgba(143,233,255,.26);" +
        "background:radial-gradient(120% 100% at 100% 0%,rgba(124,92,255,.24),transparent 62%)," +
        "radial-gradient(110% 100% at 0% 100%,rgba(34,211,238,.16),transparent 60%)," +
        "linear-gradient(160deg,rgba(20,24,52,.98),rgba(7,9,20,.99));" +
        "box-shadow:0 40px 90px -46px rgba(124,92,255,.95),inset 0 1px 0 rgba(255,255,255,.07)}",
      "#authmod .box::before{content:'';position:absolute;inset:-40%;z-index:-1;opacity:.4;" +
        "background:conic-gradient(from 0deg,rgba(143,233,255,.55),rgba(124,92,255,.4),rgba(255,84,112,.45),rgba(143,233,255,.55));" +
        "filter:blur(52px);animation:afSpin 20s linear infinite}",
      "@keyframes afSpin{to{transform:rotate(1turn)}}",
      "@media(prefers-reduced-motion:reduce){#authmod .box::before{animation:none}}",
      "#authmod.on .box{animation:afIn .42s cubic-bezier(.16,1,.3,1) both}",
      "@keyframes afIn{from{opacity:0;transform:translateY(18px) scale(.97)}to{opacity:1;transform:none}}",
      "#authmod .box h3{background:linear-gradient(100deg,#fff,#bfe9ff 60%,#c9b6ff);" +
        "-webkit-background-clip:text;background-clip:text;color:transparent;font-size:18px;letter-spacing:-.2px}",
      "#authmod .tabs{position:relative;padding:4px;border-radius:14px;background:rgba(8,12,28,.6);" +
        "border:1px solid rgba(143,233,255,.18);display:flex;gap:4px;overflow:hidden}",
      "#authmod .tabs .tab{position:relative;z-index:2;flex:1;text-align:center;padding:8px 10px;border-radius:11px;" +
        "font-size:12px;font-weight:800;color:#b9c4e6;transition:color .2s;cursor:pointer}",
      "#authmod .tabs .tab.on{color:#08101f}",
      "#afPill{position:absolute;z-index:1;top:4px;bottom:4px;border-radius:11px;left:0;width:0;" +
        "background:linear-gradient(135deg,#8fe9ff,#7c5cff);box-shadow:0 10px 26px -12px rgba(124,92,255,.95);" +
        "transition:left .28s cubic-bezier(.16,1,.3,1),width .28s cubic-bezier(.16,1,.3,1)}",
      "#authmod .field{position:relative}",
      "#authmod .field .lbl{font-size:10.5px;letter-spacing:.2px;color:#a9b6dd}",
      "#authmod .field .inp{padding-inline-start:36px;height:46px;border-radius:13px;" +
        "background:rgba(6,10,24,.7);border:1px solid rgba(143,233,255,.2);transition:border-color .2s,box-shadow .2s}",
      "#authmod .field .inp:focus{border-color:#8fe9ff;box-shadow:0 0 0 3px rgba(143,233,255,.12)}",
      "#authmod .field::after{position:absolute;inset-inline-start:12px;top:31px;font-size:14px;opacity:.8;pointer-events:none}",
      "#authmod #fName::after{content:'🏷'}",
      "#authmod .field:nth-of-type(2)::after{content:'✉'}",
      "#authmod .field:nth-of-type(3)::after{content:'🔒'}",
      "#authmod #fPass2::after{content:'🔑'}",
      "#afEye{position:absolute;inset-inline-end:8px;bottom:8px;width:30px;height:30px;border-radius:9px;border:0;" +
        "cursor:pointer;font-size:13px;color:#cfe6ff;background:rgba(255,255,255,.07);display:grid;place-items:center}",
      "#afEye:hover{background:rgba(143,233,255,.18)}",
      "#afCaps{display:none;margin:4px 0 0;font-size:10px;color:#ffd66b}",
      "#afCaps.on{display:block}",
      "#authmod #aMsg{min-height:20px;font-size:11.5px;transition:.2s}",
      "#authmod #aMsg.ok{color:#7ef0c0}",
      "#authmod #aMsg.bad{color:#ffb3c4}",
      "#authmod #aBtn{position:relative;height:48px;border-radius:14px;font-size:13.5px;font-weight:900;" +
        "overflow:hidden;will-change:transform;transition:transform .28s cubic-bezier(.2,.9,.2,1),box-shadow .2s;" +
        "background:linear-gradient(135deg,#a8f06b,#7ee787 40%,#8fe9ff);color:#07130a;" +
        "box-shadow:0 18px 40px -18px rgba(126,231,135,.9)}",
      "#authmod #aBtn::after{content:'';position:absolute;inset:0;background:linear-gradient(100deg,transparent 20%," +
        "rgba(255,255,255,.55) 50%,transparent 80%);transform:translateX(-130%);animation:afShine 3.6s ease-in-out infinite}",
      "@keyframes afShine{0%,55%{transform:translateX(-130%)}85%,100%{transform:translateX(130%)}}",
      "#authmod #aBtn:hover{box-shadow:0 22px 46px -16px rgba(126,231,135,1)}",
      "#authmod #aBtn.rnFled{box-shadow:0 18px 40px -16px rgba(255,84,112,.8);" +
        "background:linear-gradient(135deg,#ffd66b,#ff9a76)}",
      "#authmac .box .center a,#authmod .center a{color:#8fe9ff}",
      "#authmod .rnHint{margin-top:8px;font-size:10px;line-height:1.9;color:#8f9ac0;text-align:center}",
      "@media(prefers-reduced-motion:reduce){#authmod #aBtn::after{animation:none}}"
    ].join("\n");
    document.head.appendChild(s);
  }

  function decorate() {
    var b = box();
    if (!b || b.getAttribute("data-af") === "1") return;
    b.setAttribute("data-af", "1");

    var tabs = b.querySelector(".tabs");
    if (tabs && !el("afPill")) {
      var pill = document.createElement("span");
      pill.id = "afPill";
      tabs.insertBefore(pill, tabs.firstChild);
      tabs.addEventListener("click", function () { setTimeout(movePill, 30); });
    }

    var p = pass();
    if (p && !el("afEye")) {
      var eye = document.createElement("button");
      eye.id = "afEye";
      eye.type = "button";
      eye.textContent = "👁";
      eye.title = "نمایش رمز";
      eye.setAttribute("aria-label", "نمایش رمز");
      eye.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        p.type = p.type === "password" ? "text" : "password";
        eye.textContent = p.type === "password" ? "👁" : "🙈";
      });
      var field = p.closest(".field") || p.parentNode;
      field.appendChild(eye);
    }

    if (!el("afCaps")) {
      var c = document.createElement("div");
      c.id = "afCaps";
      c.textContent = "⚠ Caps Lock روشن است";
      var host = p ? (p.closest(".field") || p.parentNode) : null;
      if (host && host.parentNode) host.parentNode.insertBefore(c, host.nextSibling);
    }
    if (!b.querySelector(".rnHint")) {
      var h = document.createElement("div");
      h.className = "rnHint";
      h.textContent = "بدون ایمیل و رمز، دکمهٔ ورود فرار می‌کند 😜";
      b.appendChild(h);
    }

    var bt = btn();
    if (bt) {
      bt.addEventListener("pointerenter", function () {
        if (!empty() || bt.disabled) return;
        if (Date.now() - D.moveT < 700) return;
        if (D.n >= 2) return;
        D.n++;
        D.moveT = Date.now();
        slide(true);
      });
      bt.addEventListener("click", function () {
        setTimeout(resetBtn, 2600);
      });
    }
    [mail(), pass()].forEach(function (i) {
      if (!i) return;
      i.addEventListener("input", function () {
        if (!empty()) resetBtn();
        movePill();
      });
    });
    p && p.addEventListener("keyup", function (e) {
      var on = false;
      try { on = e.getModifierState && e.getModifierState("CapsLock"); } catch (err) {}
      var c = el("afCaps");
      if (c) c.classList.toggle("on", !!on);
    });

    movePill();
  }

  function movePill() {
    var tabs = document.querySelector("#authmod .tabs");
    var pill = el("afPill");
    if (!tabs || !pill) return;
    var on = tabs.querySelector(".tab.on");
    if (!on) return;
    var tr = tabs.getBoundingClientRect(), r = on.getBoundingClientRect();
    pill.style.left = (r.left - tr.left) + "px";
    pill.style.width = r.width + "px";
  }

  function empty() {
    var m = mail(), p = pass();
    if (!m || !p) return true;
    return !String(m.value || "").trim() || !String(p.value || "");
  }

  function resetBtn() {
    var b = btn();
    if (!b) return;
    b.style.transform = "";
    b.classList.remove("rnFled");
    D.n = 0;
  }

  function slide(soft) {
    var b = btn(), bx = box();
    if (!b || !bx) return;
    var br = b.getBoundingClientRect(), rr = bx.getBoundingClientRect();
    if (!br.width || !rr.width) return;
    var maxX = Math.max(24, (rr.width - br.width) / 2 - 10);
    var maxY = Math.max(14, (rr.height - br.height) / 2 - 10);
    var dx = (Math.random() * 2 - 1) * maxX;
    var dy = (Math.random() * 2 - 1) * maxY * 0.7;
    if (Math.abs(dx) < maxX * 0.45) dx = (dx < 0 ? -1 : 1) * maxX * 0.7;
    b.style.transform = "translate(" + Math.round(dx) + "px," + Math.round(dy) + "px) rotate(" +
      Math.round((Math.random() * 2 - 1) * 6) + "deg)";
    b.classList.add("rnFled");
    if (soft) {
      var msgs = ["بوو! 😜 اول ایمیل و رمز را وارد کن", "دکمه فرار کرد 😅 آرام‌تر!", "باشه تسلیم شدم — ولی اول ایمیل و رمز 🙃"];
      R.amsg(msgs[Math.min(D.n - 1, 2)], 1);
    }
  }

  /* ── ورود: وقتی خالی است، دکمه فرار می‌کند ─────────────── */
  function install() {
    if (typeof R.doLogin !== "function" || R.doLogin.__af) return;
    var orig = R.doLogin;
    var wrapped = function () {
      if (empty()) {
        D.n = Math.min(3, D.n + 1);
        slide(true);
        setTimeout(function () {
          if (D.n >= 3) {
            resetBtn();
            R.amsg("دکمه خسته شد 😮‍💨 — ایمیل و رمزت را بنویس و دوباره بزن", 1);
          }
        }, 420);
        return;
      }
      return orig.apply(this, arguments);
    };
    wrapped.__af = true;
    R.doLogin = wrapped;

    var open = R.openAuth;
    if (typeof open === "function" && !open.__af) {
      var w2 = function () {
        var out = open.apply(this, arguments);
        D.n = 0;
        setTimeout(function () {
          resetBtn();
          decorate();
          movePill();
          var b = btn();
          if (b && b.classList) { b.classList.remove("rnFled"); }
        }, 60);
        return out;
      };
      w2.__af = true;
      R.openAuth = w2;
    }
  }

  function boot() {
    if (!el("authmod")) return;
    css();
    decorate();
    install();
    movePill();
    window.addEventListener("resize", movePill);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") D.n = 0;
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  [600, 1800, 3600].forEach(function (ms) { setTimeout(boot, ms); });

  var in0 = R.onLogin;
  R.onLogin = function () {
    if (in0) { try { in0(); } catch (e) {} }
    D.n = 0;
    setTimeout(function () { resetBtn(); decorate(); }, 300);
  };

  window.RoninAuthFX = { state: D, decorate: decorate };
})();
