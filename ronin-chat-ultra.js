/* ═══ RONIN STORE — CHAT ULTRA · ronin-chat-ultra.js · v1
   ارتقای چت عمومی (فایل افزودنی — به هیچ فایل قبلی دست نمی‌زند)
   ───────────────────────────────────────────────────────────────
   • قاب سینمایی بزرگ با هالهٔ نئونی و شیشهٔ مات (نه جعبهٔ کوچک)
   • حالت تمام‌صفحه (⛶) با خروج سریع و کلید Esc — یادش می‌ماند
   • حباب‌های شیشه‌ای، آواتار حلقه‌دار، نام گرادیانی، ورود پله‌پله
   • ساعت درست به‌جای Invalid Date + تاریخ کامل روی هاور
   • نوار ورودی شیشه‌ای با درخشش فوکوس و دکمهٔ ارسال گرادیانی
   • شمارندهٔ آنلاین زنده در هدر، دکمهٔ «پیام تازه» درخشان
   • انفجار ایموجی هنگام واکنش + تم روشن + احترام به کاهش حرکت
   ═══════════════════════════════════════════════════════════════ */
"use strict";
(function () {
  if (!window.R || R.__chx) return;
  R.__chx = true;

  var VER = "v1";
  var FULL_KEY = "chx_full";

  function $(s, r) { return (r || document).querySelector(s); }
  function qa(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function sec() { return $("#sec-chat"); }
  function card() { return $("#sec-chat .chat"); }
  function box() { return $("#chatBox"); }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function fa(s) { try { return R.fa ? R.fa(s) : String(s); } catch (e) { return String(s); } }
  function calm() { try { return matchMedia("(prefers-reduced-motion:reduce)").matches; } catch (e) { return false; } }

  /* ── ۱. استایل ───────────────────────────────────────────── */
  function css() {
    if ($("#chxCss")) return;
    var s = document.createElement("style");
    s.id = "chxCss";
    s.textContent = [
      /* ── قاب کارت ── */
      "#sec-chat>.head{display:none!important}",
      "#sec-chat{padding-top:10px!important;padding-bottom:6px!important}",
      "#sec-chat .chat{position:relative!important;isolation:isolate;overflow:hidden!important;" +
        "height:clamp(420px,calc(100dvh - 234px),820px)!important;margin-top:34px!important;" +
        "border-radius:26px!important;" +
        "border:1px solid rgba(124,92,255,.30)!important;" +
        "background:radial-gradient(120% 85% at 100% 0%,rgba(124,92,255,.22),transparent 58%)," +
        "radial-gradient(95% 70% at 0% 100%,rgba(255,79,216,.15),transparent 62%)," +
        "linear-gradient(180deg,rgba(12,16,42,.95),rgba(5,8,22,.97))!important;" +
        "box-shadow:0 36px 90px -40px rgba(96,64,240,.85),0 0 0 1px rgba(255,255,255,.04) inset!important;" +
        "transition:height .45s cubic-bezier(.16,1,.3,1),border-radius .4s,transform .4s}",

      /* نور جاروب‌شونده روی شیشه */
      "#sec-chat .chat::after{content:\"\";position:absolute;inset:0;z-index:1;pointer-events:none;" +
        "border-radius:inherit;opacity:.55;" +
        "background:linear-gradient(112deg,transparent 40%,rgba(255,255,255,.16) 50%,transparent 60%);" +
        "background-size:280% 100%;animation:chxSweep 8s ease-in-out infinite}",
      "@keyframes chxSweep{0%{background-position:150% 0}55%,100%{background-position:-50% 0}}",

      /* هاله‌ها و شبکه */
      ".chxAmb{position:absolute;inset:0;z-index:0;pointer-events:none;overflow:hidden}",
      ".chxAmb i{position:absolute;display:block;border-radius:50%;filter:blur(42px);opacity:.5}",
      ".chxAmb i:nth-child(1){width:230px;height:230px;top:-90px;inset-inline-end:-60px;" +
        "background:radial-gradient(circle,rgba(124,92,255,.9),transparent 70%);animation:chxFloat 11s ease-in-out infinite}",
      ".chxAmb i:nth-child(2){width:210px;height:210px;bottom:-100px;inset-inline-start:-70px;" +
        "background:radial-gradient(circle,rgba(47,230,255,.75),transparent 70%);animation:chxFloat 14s ease-in-out infinite reverse}",
      ".chxAmb i:nth-child(3){width:170px;height:170px;top:38%;inset-inline-start:52%;" +
        "background:radial-gradient(circle,rgba(255,79,216,.6),transparent 70%);animation:chxFloat 17s ease-in-out infinite}",
      "@keyframes chxFloat{0%,100%{transform:translate3d(0,0,0) scale(1)}50%{transform:translate3d(0,-26px,0) scale(1.12)}}",
      ".chxAmb b{position:absolute;inset:0;opacity:.16;" +
        "background-image:linear-gradient(rgba(160,180,255,.5) 1px,transparent 1px)," +
        "linear-gradient(90deg,rgba(160,180,255,.5) 1px,transparent 1px);background-size:34px 34px;" +
        "mask-image:radial-gradient(120% 90% at 50% 0%,#000 20%,transparent 78%);" +
        "-webkit-mask-image:radial-gradient(120% 90% at 50% 0%,#000 20%,transparent 78%)}",

      /* ── هدر ── */
      "#sec-chat .chead{position:relative;z-index:4;padding:13px 14px!important;gap:9px;" +
        "border-bottom:1px solid rgba(124,92,255,.22)!important;" +
        "background:linear-gradient(180deg,rgba(18,22,54,.92),rgba(10,13,34,.55))!important;" +
        "backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)}",
      "#sec-chat .chead b.sm{display:inline-flex;align-items:center;gap:8px;font-size:13.5px!important;" +
        "font-weight:900!important;letter-spacing:.2px;color:#fff!important}",
      "#sec-chat .chead b.sm::before{content:\"\";width:8px;height:8px;border-radius:50%;flex:0 0 auto;" +
        "background:#3ddf9b;box-shadow:0 0 10px #3ddf9b,0 0 20px rgba(61,223,155,.6);animation:chxPulse 2.1s ease-in-out infinite}",
      "@keyframes chxPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.45;transform:scale(.72)}}",
      "#sec-chat .chead .xs.mut{display:none!important}",
      ".chxLive{display:inline-flex;align-items:center;gap:5px;padding:3px 9px;border-radius:99px;" +
        "font-size:10px;font-weight:800;color:#bcffe4;white-space:nowrap;" +
        "background:rgba(61,223,155,.12);border:1px solid rgba(61,223,155,.35);" +
        "box-shadow:0 0 16px rgba(61,223,155,.18) inset}",
      ".chxLive i{width:5px;height:5px;border-radius:50%;background:#3ddf9b;box-shadow:0 0 8px #3ddf9b}",
      ".chxAct{width:34px;height:34px;flex:0 0 34px;border-radius:11px;display:grid;place-items:center;" +
        "cursor:pointer;font-size:15px;padding:0;color:#dfe6ff;" +
        "border:1px solid rgba(140,160,255,.24);background:rgba(10,12,32,.5);transition:.2s}",
      ".chxAct:hover{border-color:rgba(47,230,255,.6);color:#fff;box-shadow:0 0 16px rgba(47,230,255,.35)}",
      "#sec-chat .cp2snd{width:34px!important;height:34px!important;border-radius:11px!important;" +
        "border:1px solid rgba(140,160,255,.24)!important;background:rgba(10,12,32,.5)!important;transition:.2s}",
      "#sec-chat .cp2snd:hover{border-color:rgba(47,230,255,.55)!important}",
      "#sec-chat .cp2sw{margin-inline-start:auto}",
      "#sec-chat .cp2srch{border-radius:99px!important;background:rgba(6,9,22,.6)!important;" +
        "border:1px solid rgba(140,160,255,.25)!important;transition:width .25s,border-color .2s}",
      "#sec-chat .cp2srch:focus{border-color:rgba(47,230,255,.7)!important}" +
        "box-shadow:0 0 18px rgba(47,230,255,.25)",
      "#sec-chat .cp2shits{display:none!important}",

      /* ── نوار سنجاق ── */
      "#sec-chat .cp2pin{border-radius:14px!important;backdrop-filter:blur(8px);" +
        "box-shadow:0 10px 26px -16px rgba(124,92,255,.9)}",

      /* ── بدنهٔ پیام‌ها ── */
      "#sec-chat #chatBox{position:relative;z-index:3;padding:18px 14px 12px!important;gap:12px!important;" +
        "scrollbar-width:thin;scrollbar-color:rgba(124,92,255,.6) transparent}",
      "#sec-chat #chatBox::-webkit-scrollbar{width:6px}",
      "#sec-chat #chatBox::-webkit-scrollbar-thumb{border-radius:99px;" +
        "background:linear-gradient(180deg,rgba(124,92,255,.9),rgba(47,230,255,.8))}",
      "#sec-chat .cpmsg{max-width:88%!important}",
      "#sec-chat .cpmsg.chxIn{animation:chxMsg .5s cubic-bezier(.16,1,.3,1) both}",
      "@keyframes chxMsg{from{opacity:0;transform:translateY(14px) scale(.975)}" +
        "to{opacity:1;transform:none}}",

      /* آواتار */
      "#sec-chat .avw{position:relative}",
      "#sec-chat .avw .av{width:34px!important;height:34px!important;font-size:12px!important;" +
        "font-weight:900!important;border-radius:12px!important;overflow:hidden;" +
        "box-shadow:0 0 0 1px rgba(124,92,255,.45),0 8px 18px -8px rgba(0,0,0,.9)," +
        "0 0 14px rgba(124,92,255,.28)}",
      "#sec-chat .avw .av img{width:100%;height:100%;object-fit:cover}",
      "#sec-chat .cpmsg.me .avw .av{box-shadow:0 0 0 1px rgba(47,230,255,.55),0 0 16px rgba(47,230,255,.35)}",
      "#sec-chat .avw .ondot{width:9px!important;height:9px!important;bottom:-1px!important;" +
        "inset-inline-end:-1px!important;border-width:2px!important;border-color:#080c22!important}",

      /* نام و نشان */
      "#sec-chat .cpname{font-size:11.5px!important;font-weight:900!important;letter-spacing:.2px;" +
        "margin:0 5px 4px!important;background:linear-gradient(90deg,#a9ecff,#cfc2ff 70%);" +
        "-webkit-background-clip:text;background-clip:text;color:transparent}",
      "#sec-chat .cpname .cpbadge{-webkit-text-fill-color:#ffce56!important;color:#ffce56!important;" +
        "font-size:9px!important;padding:1px 5px!important}",
      "#sec-chat .cpmsg.me .cpname{background:linear-gradient(90deg,#c9b6ff,#9ff3ff);" +
        "-webkit-background-clip:text;background-clip:text}",

      /* حباب */
      "#sec-chat .cpmsg .bub{padding:10px 14px!important;font-size:13.5px!important;" +
        "line-height:1.85!important;border-radius:18px 18px 18px 6px!important;word-break:break-word;" +
        "background:linear-gradient(180deg,rgba(255,255,255,.085),rgba(255,255,255,.042))!important;" +
        "border:1px solid rgba(150,140,255,.2)!important;" +
        "box-shadow:0 14px 30px -18px rgba(0,0,0,.95),inset 0 1px 0 rgba(255,255,255,.06)!important;" +
        "transition:border-color .2s,transform .2s}",
      "#sec-chat .cpmsg:hover .bub{border-color:rgba(150,170,255,.4)!important}",
      "#sec-chat .cpmsg.me .bub{border-radius:18px 18px 6px 18px!important;color:#fff!important;" +
        "background:linear-gradient(135deg,rgba(124,92,255,.62),rgba(47,230,255,.34))!important;" +
        "border-color:rgba(120,200,255,.45)!important;" +
        "box-shadow:0 18px 34px -18px rgba(96,70,255,.95),inset 0 1px 0 rgba(255,255,255,.2)!important}",
      "#sec-chat .cpmsg.cpg{margin-top:-4px!important}",
      "#sec-chat .cpmsg.cpg .bub{border-top-inline-start-radius:8px!important}",
      "#sec-chat .cp2a{color:#8fdcff!important}",

      /* متادیتا و ساعت */
      "#sec-chat .chxMeta{display:flex!important;align-items:center;gap:7px;margin-top:5px!important;" +
        "font-size:10px!important;font-weight:700;letter-spacing:.2px;" +
        "color:rgba(180,192,230,.62)!important;opacity:1!important;transition:color .2s}",
      "#sec-chat .cpmsg:hover .chxMeta{color:rgba(210,220,255,.95)!important}",
      "#sec-chat .chxMeta a{font-size:11px!important;opacity:.55;text-decoration:none;transition:.18s}",
      "#sec-chat .chxMeta a:hover{opacity:1;transform:scale(1.1)}",
      "#sec-chat .cp2tools{opacity:0;transition:opacity .2s}",
      "#sec-chat .cpmsg:hover .cp2tools,#sec-chat .cpmsg.rxopen .cp2tools{opacity:1}",
      "#sec-chat .cp2ed{opacity:.6!important;font-size:9px!important}",

      /* واکنش‌ها */
      "#sec-chat .rxchip{border-radius:99px!important;font-size:10.5px!important;padding:3px 9px!important;" +
        "background:rgba(124,92,255,.16)!important;border:1px solid rgba(124,92,255,.32)!important;" +
        "transition:transform .16s,box-shadow .2s}",
      "#sec-chat .rxchip:hover{transform:translateY(-1px)}",
      "#sec-chat .rxchip.mine{border-color:rgba(47,230,255,.6)!important;" +
        "box-shadow:0 0 16px rgba(47,230,255,.3)!important}",
      "#sec-chat .rxb{border-radius:99px!important;background:rgba(10,14,34,.85)!important;" +
        "border:1px solid rgba(140,160,255,.28)!important;transition:.16s}",
      "#sec-chat .rxb:hover{transform:scale(1.16) translateY(-1px)!important;border-color:#2fe6ff!important}",
      ".chxPop{position:fixed;z-index:400;pointer-events:none;font-size:20px;" +
        "animation:chxPop .9s cubic-bezier(.2,.8,.3,1) forwards}",
      "@keyframes chxPop{0%{opacity:1;transform:translate(-50%,-50%) scale(.5)}" +
        "100%{opacity:0;transform:translate(-50%,-260%) scale(1.5)}}",

      /* جداکنندهٔ روز */
      "#sec-chat .cp2sep{margin:18px 2px 8px!important;font-size:10.5px!important}",
      "#sec-chat .cp2sep b{padding:3px 12px!important;border-radius:99px!important;color:#cfd6ff!important;" +
        "background:linear-gradient(135deg,rgba(124,92,255,.22),rgba(47,230,255,.12))!important;" +
        "border:1px solid rgba(124,92,255,.34)!important;font-weight:800;" +
        "box-shadow:0 0 20px rgba(124,92,255,.24)}",

      /* «در حال نوشتن» */
      "#sec-chat .cpTyping{bottom:96px!important;inset-inline-start:16px!important;" +
        "padding:7px 13px!important;border-radius:99px!important;" +
        "background:rgba(10,14,34,.92)!important;border:1px solid rgba(47,230,255,.35)!important;" +
        "box-shadow:0 12px 30px -14px rgba(0,0,0,.9),0 0 20px rgba(47,230,255,.18)!important}",

      /* دکمهٔ پیام تازه */
      "#sec-chat .cp2jump{bottom:92px!important;inset-inline-end:16px!important;padding:9px 15px!important;" +
        "border-radius:99px!important;font-family:inherit;font-size:11.5px!important;font-weight:900!important;" +
        "color:#06101f!important;border:0!important;cursor:pointer;" +
        "background:linear-gradient(135deg,#8fe9ff,#a48bff)!important;" +
        "box-shadow:0 16px 34px -14px rgba(47,230,255,.95),0 0 26px rgba(124,92,255,.45)!important;" +
        "animation:chxBob 2.6s ease-in-out infinite}",
      "@keyframes chxBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}",

      /* ── نوار نوشتن ── */
      "#sec-chat .cbar{position:relative;z-index:4;margin:4px 12px 12px!important;padding:7px!important;" +
        "gap:7px!important;border-radius:20px!important;" +
        "border:1px solid rgba(124,92,255,.3)!important;" +
        "background:linear-gradient(180deg,rgba(16,20,50,.95),rgba(8,11,28,.95))!important;" +
        "box-shadow:0 18px 40px -22px rgba(0,0,0,.95),inset 0 1px 0 rgba(255,255,255,.06)!important;" +
        "transition:border-color .25s,box-shadow .25s}",
      "#sec-chat .cbar:focus-within{border-color:rgba(47,230,255,.65)!important;" +
        "box-shadow:0 18px 44px -20px rgba(47,230,255,.35),0 0 0 3px rgba(47,230,255,.1)!important}",
      "#sec-chat .cbar input{flex:1;min-width:0;height:44px;background:transparent!important;" +
        "border:0!important;box-shadow:none!important;padding:0 8px!important;font-size:13.5px!important}",
      "#sec-chat .cbar input::placeholder{color:rgba(170,182,220,.65)}",
      "#sec-chat .cbar #chatSend{min-width:74px;height:44px!important;border-radius:15px!important;" +
        "font-weight:900!important;color:#06101f!important;border:0!important;" +
        "background:linear-gradient(135deg,#8fe9ff,#7c5cff)!important;" +
        "box-shadow:0 12px 26px -10px rgba(124,92,255,.95)!important;" +
        "transition:transform .16s,box-shadow .22s,filter .2s}",
      "#sec-chat .cbar .btn.p.blk{height:44px!important;border-radius:15px!important;font-weight:900!important;" +
        "color:#06101f!important;border:0!important;background:linear-gradient(135deg,#8fe9ff,#7c5cff)!important;" +
        "box-shadow:0 12px 26px -10px rgba(124,92,255,.9)!important}",
      "#sec-chat .cbar #chatSend:hover{transform:translateY(-1px) scale(1.03)!important;" +
        "box-shadow:0 16px 32px -10px rgba(47,230,255,.9),0 0 22px rgba(47,230,255,.45)!important}",
      "#sec-chat .cbar #chatSend:active{transform:scale(.95)!important}",
      "#sec-chat .cpemjBtn{width:44px!important;height:44px!important;border-radius:15px!important;" +
        "background:rgba(10,14,34,.75)!important;border:1px solid rgba(140,160,255,.26)!important;transition:.18s}",
      "#sec-chat .cpemjBtn:hover{border-color:rgba(47,230,255,.6)!important;transform:translateY(-1px)}",
      "#sec-chat .cpemojiPanel{border-radius:16px!important;" +
        "box-shadow:0 24px 50px -18px rgba(0,0,0,.95),0 0 24px rgba(124,92,255,.25)!important}",
      "#sec-chat .cp2cc{align-self:center;font-size:9.5px!important;color:rgba(160,175,220,.75)!important;" +
        "min-width:30px;text-align:center;font-variant-numeric:tabular-nums}",
      "#sec-chat .cp2cc.warn{color:#ffd479!important}",
      "#sec-chat .cpreplying{border-radius:12px!important;margin:0 10px 6px!important}",

      /* ── تمام‌صفحه ── */
      "body.chx-full{overflow:hidden!important}",
      "body.chx-full #sec-chat{position:fixed!important;inset:0!important;z-index:165!important;" +
        "margin:0!important;padding:0!important;display:flex!important;flex-direction:column;" +
        "background:radial-gradient(120% 90% at 100% 0%,rgba(124,92,255,.16),transparent 60%),rgba(3,5,16,.985);" +
        "animation:chxIn .4s cubic-bezier(.16,1,.3,1)}",
      "body.chx-full #sec-chat>.head{display:none!important}",
      "body.chx-full #sec-chat .chat{height:100dvh!important;max-height:none!important;margin:0!important;" +
        "flex:1;border-radius:0!important;border:0!important;box-shadow:none!important}",
      "@keyframes chxIn{from{opacity:0;transform:scale(.99)}to{opacity:1;transform:none}}",
      "#sec-chat .chxFull.on{background:linear-gradient(135deg,#ff6d8d,#ff9d4d)!important;" +
        "border-color:rgba(255,255,255,.35)!important;color:#1a0b12!important}",

      /* ── روشن ── */
      "html[data-theme='light'] #sec-chat .chat{background:" +
        "radial-gradient(120% 85% at 100% 0%,rgba(124,92,255,.14),transparent 58%)," +
        "linear-gradient(180deg,rgba(255,255,255,.97),rgba(240,244,255,.97))!important;" +
        "border-color:rgba(90,110,200,.3)!important}",
      "html[data-theme='light'] #sec-chat .chead{background:linear-gradient(180deg,#fff,rgba(244,247,255,.9))!important}",
      "html[data-theme='light'] #sec-chat .chead b.sm{color:#151a3a!important}",
      "html[data-theme='light'] #sec-chat .cpmsg .bub{background:#fff!important;color:#151a3a!important;" +
        "border-color:rgba(90,110,200,.24)!important}",
      "html[data-theme='light'] #sec-chat .cpmsg.me .bub{color:#101532!important}",
      "html[data-theme='light'] #sec-chat .cbar{background:#fff!important;border-color:rgba(90,110,200,.28)!important}",
      "html[data-theme='light'] #sec-chat .cbar input{color:#151a3a!important}",
      "html[data-theme='light'] #sec-chat .chxMeta{color:rgba(60,74,120,.6)!important}",
      "html[data-theme='light'] #sec-chat .cp2sep b{background:#fff!important;color:#3b4a80!important}",

      /* ── موبایل ── */
      "@media(max-width:560px){" +
        "#sec-chat .chat{border-radius:22px!important}" +
        "#sec-chat .chead{padding:11px 12px!important}" +
        "#sec-chat .cp2srch{width:86px!important}#sec-chat .cp2srch:focus{width:112px!important}" +
        "#sec-chat .cpmsg{max-width:92%!important}" +
        "#sec-chat .cp2jump{bottom:88px!important;inset-inline-end:12px!important}" +
        "}",

      "@media(prefers-reduced-motion:reduce){" +
        "#sec-chat .chat::after,.chxAmb i,.chxLive i,#sec-chat .cp2jump,#sec-chat .chead b.sm::before{" +
        "animation:none!important}" +
        "#sec-chat .cpmsg.chxIn{animation:none!important}" +
        "}"
    ].join("\n");
    (document.head || document.documentElement).appendChild(s);
  }

  /* ── ۲. پوسته: هاله‌ها، شمارندهٔ آنلاین، دکمهٔ تمام‌صفحه ── */
  function shell() {
    var c = card();
    if (!c) return false;

    if (!c.querySelector(".chxAmb")) {
      var amb = document.createElement("div");
      amb.className = "chxAmb";
      amb.innerHTML = "<i></i><i></i><i></i><b></b>";
      c.insertBefore(amb, c.firstChild);
    }

    var head = c.querySelector(".chead");
    var title = head && head.querySelector("b.sm");

    if (head && title && !head.querySelector(".chxLive")) {
      var lv = document.createElement("span");
      lv.className = "chxLive";
      lv.innerHTML = "<i></i><em></em>";
      lv.style.fontStyle = "normal";
      title.parentNode.insertBefore(lv, title.nextSibling);
      paintLive();
    }

    if (head && !head.querySelector(".chxFull")) {
      var fb = document.createElement("button");
      fb.type = "button";
      fb.className = "chxAct chxFull" + (isFull() ? " on" : "");
      fb.title = "تمام‌صفحه";
      fb.setAttribute("aria-label", "تمام‌صفحه");
      fb.innerHTML = isFull() ? "✕" : "⛶";
      fb.addEventListener("click", function (e) { e.stopPropagation(); toggleFull(); });
      var anchor = head.querySelector(".chxLive") || title;
      if (anchor && anchor.parentNode === head) head.insertBefore(fb, anchor.nextSibling);
      else head.appendChild(fb);
    }

    labelAll();
    return true;
  }

  /* ── ۳. شمارندهٔ آنلاین ─────────────────────────────────── */
  function paintLive() {
    var src = sec() && sec().querySelector("[data-online]");
    var txt = src ? String(src.textContent || "") : "";
    var digits = txt.replace(/[^0-9۰-۹]/g, "");
    var lv = $(".chxLive em");
    if (lv) lv.textContent = digits ? fa(digits) + " آنلاین" : "آنلاین";
  }
  setInterval(function () { try { paintLive(); } catch (e) {} }, 4000);

  /* ── ۴. ساعت پیام‌ها ────────────────────────────────────── */
  function clockOf(ts) {
    var d = new Date(ts);
    if (!ts || isNaN(d.getTime())) return "";
    return fa(pad(d.getHours()) + ":" + pad(d.getMinutes()));
  }
  function fullOf(ts) {
    try {
      return new Intl.DateTimeFormat("fa-IR", {
        weekday: "long", year: "numeric", month: "long", day: "numeric",
        hour: "2-digit", minute: "2-digit"
      }).format(new Date(ts));
    } catch (e) { return ""; }
  }
  function labelRow(row) {
    if (!row || !row.classList || !row.classList.contains("cpmsg")) return;
    var meta = row.querySelector(".xs.mut.row");
    if (!meta) return;
    var a = meta.querySelector("[data-dm],[data-rpm]");
    if (!a) return;
    var p = a.getAttribute("data-dm") || a.getAttribute("data-rpm");
    var m = (R.cpIndex || {})[p];
    var v = m && clockOf(m.t) ? clockOf(m.t) : "—";
    if (!v) return;
    for (var i = 0; i < meta.childNodes.length; i++) {
      var n = meta.childNodes[i];
      if (n.nodeType === 3 && n.nodeValue && n.nodeValue.trim()) {
        if (n.nodeValue.trim() !== v) n.nodeValue = v + " ";
        break;
      }
    }
    if (!meta.classList.contains("chxMeta")) meta.classList.add("chxMeta");
    var full = m && fullOf(m.t);
    if (full && meta.title !== full) meta.title = full;
    else if (!full) meta.removeAttribute("title");
  }
  function labelAll() {
    var b = box();
    if (!b) return;
    qa(".cpmsg", b).forEach(labelRow);
  }

  /* ── ۵. ورود پله‌پله ───────────────────────────────────── */
  function stagger() {
    if (calm()) return;
    var b = box();
    if (!b) return;
    var rows = qa(".cpmsg", b);
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      if (r.__chx) continue;
      r.__chx = 1;
      r.style.animationDelay = Math.min(i, 9) * 40 + "ms";
      r.classList.add("chxIn");
    }
  }

  /* ── ۶. تمام‌صفحه ──────────────────────────────────────── */
  function isFull() { return document.body.classList.contains("chx-full"); }
  function paintFullBtn() {
    var fb = $(".chxFull");
    if (!fb) return;
    fb.classList.toggle("on", isFull());
    fb.innerHTML = isFull() ? "✕" : "⛶";
    fb.title = isFull() ? "خروج از تمام‌صفحه" : "تمام‌صفحه";
    fb.setAttribute("aria-label", fb.title);
  }
  function toggleFull(force, quiet) {
    var on = typeof force === "boolean" ? force : !isFull();
    document.body.classList.toggle("chx-full", on);
    if (!quiet) {
      try { localStorage.setItem(FULL_KEY, on ? "1" : "0"); } catch (e) {}
      try { sessionStorage.setItem("chx_auto", on ? "1" : "0"); } catch (e) {}
    }
    paintFullBtn();
    setTimeout(function () {
      var b = box();
      if (b) { try { b.scrollTop = b.scrollHeight; } catch (e) {} }
      stagger(); labelAll();
      var i = $("#chatIn");
      if (on && i) { try { i.focus({ preventScroll: true }); } catch (e) {} }
    }, 60);
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && isFull()) { e.preventDefault(); toggleFull(false); }
  });

  /* ── ۷. انفجار ایموجی روی واکنش ────────────────────────── */
  document.addEventListener("click", function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var rx = t.closest("[data-rx]");
    if (!rx || !sec() || !sec().contains(rx)) return;
    if (calm()) return;
    var r = rx.getBoundingClientRect();
    var s = document.createElement("span");
    s.className = "chxPop";
    s.textContent = rx.getAttribute("data-rx") || "✨";
    s.style.left = (r.left + r.width / 2) + "px";
    s.style.top = (r.top + r.height / 2) + "px";
    document.body.appendChild(s);
    setTimeout(function () { if (s.parentNode) s.remove(); }, 950);
  });

  /* ── ۸. رصد رندرها ────────────────────────────────────── */
  function watch() {
    var b = box();
    if (!b || b.__chxWatch) return;
    b.__chxWatch = 1;
    try {
      var mo = new MutationObserver(function () {
        labelAll();
        stagger();
      });
      mo.observe(b, { childList: true, subtree: true });
    } catch (e) {}
    b.addEventListener("scroll", function () {
      var j = card() && card().querySelector(".cp2jump");
      if (j) j.classList.toggle("show", b.scrollHeight - b.scrollTop - b.clientHeight > 90);
    }, { passive: true });
  }

  /* ── ۹. راه‌اندازی ────────────────────────────────────── */
  function boot() {
    css();
    shell();
    watch();
    stagger();
    paintLive();
    paintFullBtn();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  [300, 900, 1800, 3200, 6000].forEach(function (ms) { setTimeout(boot, ms); });
  window.addEventListener("load", function () { boot(); }, { once: true });

  /* قلاب ورود به بخش چت */
  if (!R.hooks) R.hooks = {};
  var _h = R.hooks.chat;
  R.hooks.chat = function () {
    if (typeof _h === "function") { try { _h(); } catch (e) {} }
    setTimeout(function () {
      boot();
      var keep = false, auto = true;
      try { keep = localStorage.getItem(FULL_KEY) === "1"; } catch (e) {}
      try {
        var a = sessionStorage.getItem("chx_auto");
        if (a === "0") auto = false;
      } catch (e) {}
      if (isFull()) return;
      if (window.innerWidth <= 600) { if (auto) toggleFull(true, true); }
      else if (keep) toggleFull(true, true);
    }, 120);
  };

  /* ── ۱۰. API ──────────────────────────────────────────── */
  R.chatUltra = {
    ver: VER,
    shell: shell,
    full: toggleFull,
    isFull: isFull,
    label: labelAll,
    clock: clockOf
  };
  try { console.log("[Ronin] chat-ultra " + VER + " ✓"); } catch (e) {}
})();
