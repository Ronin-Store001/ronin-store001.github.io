/* ═══════════════════════════════════════════════════════════════
   RONIN STORE — SUPPORT DESK · ronin-support.js · v1
   ───────────────────────────────────────────────────────────────
   🎫 بخش «پشتیبانی» داخل شبکه فرماندهی
   • صف تیکت‌های واقعی از فرم فوتر (contact) و تیکت‌های جدید (support)
   • پاسخ مستقیم به کاربر + اعلان واقعی در حساب کاربر
   • پاسخ‌های آماده (FAQ) و جستجو و فیلتر وضعیت
   • آمار زنده: باز، پاسخ‌داده، امروز، کل
   • فقط مالک/مدیر/کارمند؛ کاربر عادی اصلاً این بخش را نمی‌بیند
   ═══════════════════════════════════════════════════════════════ */
"use strict";
(function () {
  if (!window.R || R.__sp) return;
  R.__sp = true;

  var SRC = ["contact", "support"];
  var S = {
    open: false, filter: "all", q: "", openId: "", tickets: [],
    data: { contact: {}, support: {} }, busy: false, tab: null, desk: null
  };

  var CANNED = [
    { k: "ورود", t: "🔑 مشکل ورود", v: "سلام! از دکمهٔ «رمزت را فراموش کردی؟» در پنجرهٔ ورود استفاده کن؛ لینک بازیابی به ایمیلت می‌رود. اگر به ایمیل دسترسی نداری، همین‌جا بنویس تا دستی بررسی کنیم." },
    { k: "ثبت‌نام", t: "📝 ثبت‌نام", v: "سلام! برای ثبت‌نام روی «ثبت‌نام» بالای سایت بزن، ایمیل و یک رمز حداقل ۶ کاراکتری بگذار. اگر خطای «ایمیل قبلاً ثبت شده» دیدی، یعنی حسابت هست و باید از تب «ورود» وارد شوی." },
    { k: "پرمیوم", t: "💎 پرمیوم", v: "سلام! برای فعال‌سازی پرمیوم، از بخش «پرمیوم» درخواست بفرست. درخواستت مستقیم به مالک می‌رسد و بعد از تأیید، نشان 💎 روی حسابت فعال می‌شود." },
    { k: "آگهی", t: "📢 آگهی", v: "سلام! آگهی‌ات را از بخش «تبلیغات» ثبت کن. آگهی‌های کاربران عادی بعد از تأیید مالک در فروشگاه دیده می‌شوند؛ اگر تأیید نشد، عنوان و توضیح را کامل‌تر کن." },
    { k: "گزارش", t: "🚩 گزارش تخلف", v: "سلام و ممنون از دقتت 🙏 گزارش را از دکمهٔ 🚩 کنار همان پست یا پیام بفرست. تیم بررسی می‌کند و نتیجه را همین‌جا اطلاع می‌دهیم. لطفاً لینک یا نام کاربر را هم بنویس." },
    { k: "سفارش", t: "📦 سفارش", v: "سلام! وضعیت سفارشت را با نام محصول و تاریخ خرید بفرست. اگر پرداخت انجام شده و تحویل نگرفتی، شمارهٔ پیگیری یا اسکرین‌شات را هم بگذار تا سریع بررسی شود." },
    { k: "آرشیو", t: "🥷 آرشیو همراه", v: "سلام! آرشیو همراه داخل پروفایل و منوی «آرشیو» است. اگر رکوردهایت را نمی‌بینی، یک بار از حساب خارج و دوباره وارد شو؛ اگر مشکل ماند، نام کاربری‌ات را بفرست." },
    { k: "باگ", t: "🐞 گزارش باگ", v: "سلام! ممنون که گزارش دادی 🛠 لطفاً مرورگر و گوشی/کامپیوتر، صفحه‌ای که مشکل داشت و کاری که انجام دادی را بنویس. اگر اسکرین‌شات هم داری بفرست." }
  ];

  function el(i) { return document.getElementById(i); }
  function qa(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function fa(n) { try { return R.fa ? R.fa(n) : String(n); } catch (e) { return String(n); } }
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
  function meName() { return (R.USER && R.USER.name) || "تیم پشتیبانی"; }
  function when(t) {
    if (!t) return "—";
    try { if (R.time) return R.time(t); } catch (e) {}
    try { return new Date(t).toLocaleString("fa-IR"); } catch (e) { return "—"; }
  }

  /* ── ۱. استایل ──────────────────────────────────────────── */
  function css() {
    if (el("spCss")) return;
    var s = document.createElement("style");
    s.id = "spCss";
    s.textContent = [
      "#spDesk{display:none;margin-top:2px}",
      "#sec-team.sp-open #spDesk{display:block}",
      "#sec-team.sp-open>.chat,#sec-team.sp-open .tpxMain>.chat{display:none!important}",
      "#teamTabs #spTab{display:inline-flex;align-items:center;gap:6px;white-space:nowrap}",
      "#teamTabs #spTab .cnt{min-width:18px;height:18px;padding:0 5px;border-radius:99px;display:inline-grid;place-items:center;" +
        "font-size:9.5px;font-weight:900;color:#1a070d;background:linear-gradient(135deg,#ffd66b,#ff5470)}",
      "#teamTabs #spTab .cnt.hide{display:none}",
      "#spDesk .spHero{border-radius:20px;padding:14px;margin-bottom:10px;position:relative;overflow:hidden;" +
        "border:1px solid rgba(255,120,150,.22);background:radial-gradient(120% 120% at 100% 0%,rgba(255,176,58,.16),transparent 62%)," +
        "linear-gradient(180deg,rgba(26,12,20,.96),rgba(9,6,12,.98))}",
      "#spDesk .spHero h3{margin:0;font-size:15px;font-weight:900;color:#ffe6ec;display:flex;align-items:center;gap:8px}",
      "#spDesk .spHero p{margin:4px 0 0;font-size:11.5px;line-height:1.9;color:#bfaeb8}",
      "#spDesk .spStats{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:11px}",
      "#spDesk .spStat{padding:8px 4px;border-radius:12px;text-align:center;background:rgba(255,255,255,.05);border:1px solid rgba(255,140,160,.16)}",
      "#spDesk .spStat b{display:block;font-size:16px;font-weight:900;background:linear-gradient(135deg,#fff,#ffb03a);-webkit-background-clip:text;background-clip:text;color:transparent}",
      "#spDesk .spStat span{font-size:8.5px;color:#bfaeb8}",
      "#spDesk .spBar{display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-bottom:10px}",
      "#spDesk .spBar input{flex:1 1 170px;height:40px}",
      "#spDesk .spFilter{cursor:pointer;border-radius:11px;padding:8px 11px;font-size:11px;font-weight:800;color:#d8c8d2;" +
        "background:rgba(255,255,255,.05);border:1px solid rgba(255,140,160,.2);font-family:inherit;transition:.18s}",
      "#spDesk .spFilter.on{color:#1a070d;background:linear-gradient(135deg,#ffd66b,#ff5470);border-color:transparent}",
      "#spDesk .spTicket{border-radius:18px;padding:12px;margin-bottom:9px;position:relative;" +
        "border:1px solid rgba(255,140,160,.18);background:linear-gradient(180deg,rgba(24,13,21,.96),rgba(9,6,12,.98));transition:.2s}",
      "#spDesk .spTicket.unread{border-color:rgba(255,176,58,.5);box-shadow:0 0 0 1px rgba(255,176,58,.14) inset}",
      "#spDesk .spTicket.open{border-color:rgba(255,120,150,.55)}",
      "#spDesk .spT{display:flex;gap:8px;align-items:flex-start}",
      "#spDesk .spT .grow{min-width:0;flex:1}",
      "#spDesk .spT b{font-size:12.5px;color:#ffe6ec}",
      "#spDesk .spT .meta{font-size:10px;color:#a998a4;margin-top:2px;line-height:1.9}",
      "#spDesk .spT .meta a{color:#8fe9ff;text-decoration:none;direction:ltr;display:inline-block}",
      "#spDesk .spText{font-size:12.5px;line-height:2;margin:9px 0;white-space:pre-wrap;color:#efe4ea}",
      "#spDesk .spReplyBox{margin-top:8px;padding:10px;border-radius:14px;background:rgba(143,233,255,.06);" +
        "border:1px solid rgba(143,233,255,.24)}",
      "#spDesk .spReplyBox .who{font-size:10px;color:#9fd9e8;margin-bottom:4px}",
      "#spDesk .spReplyBox .txt{font-size:12px;line-height:1.95;white-space:pre-wrap;color:#e7f6ff}",
      "#spDesk .spChips{display:flex;gap:5px;flex-wrap:wrap;margin:8px 0}",
      "#spDesk .spChip{cursor:pointer;font-family:inherit;font-size:10px;font-weight:800;padding:5px 9px;border-radius:99px;" +
        "color:#ffd9e0;background:rgba(255,255,255,.06);border:1px solid rgba(255,140,160,.24)}",
      "#spDesk .spChip:hover{border-color:#ffd66b;color:#fff}",
      "#spDesk .spForm{margin-top:8px}",
      "#spDesk .spForm textarea{width:100%;min-height:74px;resize:vertical;font-family:inherit;font-size:12px;line-height:1.9;" +
        "padding:9px 11px;border-radius:12px;color:#eef1ff;background:rgba(8,10,22,.85);border:1px solid rgba(255,140,160,.26);outline:0}",
      "#spDesk .spForm textarea:focus{border-color:#ffd66b;box-shadow:0 0 0 3px rgba(255,176,58,.12)}",
      "#spDesk .spActs{display:flex;gap:5px;flex-wrap:wrap;margin-top:9px}",
      "#spDesk .spActs .btn{padding:6px 10px;font-size:10.5px}",
      "#spDesk .spEmpty{padding:24px 10px;text-align:center;color:#a998a4;font-size:12px;line-height:2}",
      "#spDesk .spEmpty em{display:block;font-size:28px;font-style:normal;margin-bottom:6px}",
      "#spDesk .spFaq{margin-top:12px;padding:11px;border-radius:16px;border:1px dashed rgba(143,233,255,.28);" +
        "background:rgba(10,20,32,.55)}",
      "#spDesk .spFaq b{font-size:11.5px;color:#bfe9f5}",
      "#spDesk .spFaq .s{font-size:10px;color:#8f9ab8;margin-top:3px;line-height:1.9}",
      "@media(max-width:560px){#spDesk .spStats{grid-template-columns:repeat(2,1fr)}}"
    ].join("\n");
    document.head.appendChild(s);
  }

  /* ── ۲. داده‌ها ─────────────────────────────────────────── */
  function norm(id, src, m) {
    m = m || {};
    return {
      id: id, src: src,
      name: m.name || "کاربر",
      contact: m.contact || "",
      subject: m.subject || "بدون موضوع",
      text: m.text || "",
      t: m.t || 0,
      read: !!m.read,
      st: m.st || (m.reply ? "answered" : "open"),
      reply: m.reply || "",
      replyAt: m.replyAt || 0,
      replyBy: m.replyBy || "",
      uid: m.uid || m.by || ""
    };
  }
  function all() {
    var out = [];
    SRC.forEach(function (src) {
      var box = S.data[src] || {};
      Object.keys(box).forEach(function (k) { out.push(norm(k, src, box[k])); });
    });
    return out.sort(function (a, b) { return (b.t || 0) - (a.t || 0); });
  }
  function counts(list) {
    var c = { open: 0, answered: 0, closed: 0, today: 0, unread: 0 };
    var t0 = new Date(); t0.setHours(0, 0, 0, 0);
    list.forEach(function (x) {
      if (x.st === "closed") c.closed++;
      else if (x.st === "answered" || x.reply) c.answered++;
      else c.open++;
      if (x.t >= t0.getTime()) c.today++;
      if (!x.read) c.unread++;
    });
    return c;
  }

  /* ── ۳. تب داخل شبکه فرماندهی ───────────────────────────── */
  function ensureTab() {
    var tabs = el("teamTabs");
    if (!tabs || !can()) return;
    var old = tabs.querySelector("#spTab");
    if (old) { S.tab = old; paintBadge(); return; }
    var b = document.createElement("div");
    b.className = "tab";
    b.id = "spTab";
    b.setAttribute("role", "button");
    b.innerHTML = "🎫 پشتیبانی <span class=\"cnt hide\">۰</span>";
    b.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      toggle();
    });
    tabs.appendChild(b);
    S.tab = b;
    paintBadge();
  }
  function paintBadge() {
    var c = S.tab && S.tab.querySelector(".cnt");
    if (!c) return;
    var n = counts(all()).unread;
    c.textContent = fa(n);
    c.classList.toggle("hide", !n);
  }
  function toggle(force) {
    var on = typeof force === "boolean" ? force : !S.open;
    S.open = on;
    var sec = el("sec-team");
    if (sec) sec.classList.toggle("sp-open", on);
    var tabs = el("teamTabs");
    if (tabs) qa("#teamTabs .tab", tabs).forEach(function (t) {
      if (t.id !== "spTab") t.classList.toggle("dim", on);
    });
    if (S.tab) S.tab.classList.toggle("on", on);
    if (on) { ensureDesk(); render(); }
  }

  /* ── ۴. کارت پشتیبانی ───────────────────────────────────── */
  function ensureDesk() {
    if (S.desk && document.body.contains(S.desk)) return S.desk;
    var sec = el("sec-team");
    if (!sec) return null;
    var d = document.createElement("div");
    d.id = "spDesk";
    d.className = "spDesk";
    d.setAttribute("data-noi18n", "");
    d.innerHTML =
      '<div class="spHero">' +
        '<h3>🎫 میز پشتیبانی رونین</h3>' +
        '<p>هر پیامی که کاربران از فرم فوتر یا بخش پشتیبانی می‌فرستند اینجا می‌آید. پاسخ تو مستقیم به حساب کاربر می‌رسد.</p>' +
        '<div class="spStats">' +
          '<div class="spStat"><b id="spOpen">۰</b><span>باز</span></div>' +
          '<div class="spStat"><b id="spAnswered">۰</b><span>پاسخ‌داده</span></div>' +
          '<div class="spStat"><b id="spToday">۰</b><span>امروز</span></div>' +
          '<div class="spStat"><b id="spAll">۰</b><span>کل تیکت</span></div>' +
        '</div>' +
      '</div>' +
      '<div class="spBar">' +
        '<input class="inp" id="spSearch" type="search" placeholder="جستجو در تیکت‌ها: نام، ایمیل، متن…" maxlength="60" autocomplete="off">' +
        '<button class="spFilter on" type="button" data-spf="all">همه</button>' +
        '<button class="spFilter" type="button" data-spf="open">باز</button>' +
        '<button class="spFilter" type="button" data-spf="answered">پاسخ‌داده</button>' +
        '<button class="spFilter" type="button" data-spf="closed">بسته</button>' +
      '</div>' +
      '<div id="spList"></div>' +
      '<div class="spFaq"><b>🧠 کمک سریع به تیم</b>' +
        '<div class="s">روی هر تیکت «پاسخ» را بزن؛ از پاسخ‌های آماده استفاده کن یا خودت بنویس. پاسخ به حساب کاربر اعلان می‌شود، پس فقط چیزی بنویس که واقعاً درست است.</div>' +
        '<div class="spChips" id="spFaqChips"></div></div>';

    var host = sec.querySelector(".tpxMain") || sec;
    var tabs = el("teamTabs");
    if (tabs && tabs.parentNode === host) tabs.insertAdjacentElement("afterend", d);
    else host.insertBefore(d, host.firstChild);

    S.desk = d;
    d.addEventListener("click", onClick);
    d.addEventListener("input", function (e) {
      if (e.target && e.target.id === "spSearch") { S.q = e.target.value; render(); }
    });
    return d;
  }

  /* ── ۵. رندر ────────────────────────────────────────────── */
  function render() {
    var box = el("spList");
    if (!box || !can()) return;
    var list = all();
    var c = counts(list);
    if (el("spOpen")) el("spOpen").textContent = fa(c.open);
    if (el("spAnswered")) el("spAnswered").textContent = fa(c.answered);
    if (el("spToday")) el("spToday").textContent = fa(c.today);
    if (el("spAll")) el("spAll").textContent = fa(list.length);
    paintBadge();

    var chips = el("spFaqChips");
    if (chips && !chips.children.length) {
      chips.innerHTML = CANNED.map(function (x, i) {
        return '<button class="spChip" type="button" data-spcanned="' + i + '">' + esc(x.t) + "</button>";
      }).join("");
    }

    var qq = S.q.trim().toLowerCase();
    var arr = list.filter(function (x) {
      if (S.filter === "open" && (x.st === "closed" || x.st === "answered" || x.reply)) return false;
      if (S.filter === "answered" && !(x.st === "answered" || x.reply)) return false;
      if (S.filter === "closed" && x.st !== "closed") return false;
      if (!qq) return true;
      return (x.name + " " + x.contact + " " + x.subject + " " + x.text).toLowerCase().indexOf(qq) > -1;
    });

    if (!arr.length) {
      box.innerHTML = '<div class="spEmpty"><em>🎫</em>' +
        (list.length ? "با این فیلتر تیکتی نیست." : "هنوز تیکتی نیامده — وقتی کاربر از فرم پشتیبانی پیام بفرستد همین‌جا ظاهر می‌شود.") +
        "</div>";
      return;
    }

    box.innerHTML = arr.map(function (x) {
      var cls = "spTicket" + (!x.read ? " unread" : "") + (S.openId === x.id ? " open" : "");
      var st = x.st === "closed" ? "بسته" : (x.reply || x.st === "answered") ? "پاسخ‌داده" : "باز";
      var stc = x.st === "closed" ? "" : (x.reply || x.st === "answered") ? "ok" : "bad";
      var h = '<div class="' + cls + '" data-spcard="' + esc(x.id) + '">' +
        '<div class="spT"><div class="grow">' +
          '<b>' + esc(x.subject) + "</b>" +
          '<div class="meta">' + esc(x.name) +
            (x.contact ? ' • <a href="mailto:' + esc(x.contact) + '">' + esc(x.contact) + "</a>" : "") +
            " • " + esc(when(x.t)) + "</div>" +
        "</div>" +
        '<span class="chip ' + stc + '" style="font-size:9px;padding:2px 7px">' + st + "</span></div>" +
        '<div class="spText">' + esc(x.text) + "</div>";

      if (x.reply) {
        h += '<div class="spReplyBox"><div class="who">✅ پاسخ ' + esc(x.replyBy || "تیم") +
          (x.replyAt ? " • " + esc(when(x.replyAt)) : "") + "</div>" +
          '<div class="txt">' + esc(x.reply) + "</div></div>";
      }

      h += '<div class="spActs">' +
        '<button class="btn p mini" type="button" data-spreply="' + esc(x.id) + '">↩ پاسخ</button>' +
        (x.read ? "" : '<button class="btn mini ok" type="button" data-spread="' + esc(x.id) + '">✓ خوانده شد</button>') +
        (x.uid ? '<button class="btn mini" type="button" data-spdm="' + esc(x.uid) + '">💬 پیام خصوصی</button>' : "") +
        '<button class="btn mini" type="button" data-spclose="' + esc(x.id) + '">' +
          (x.st === "closed" ? "↺ باز کن" : "✔ بستن") + "</button>" +
        '<button class="btn mini d" type="button" data-spdel="' + esc(x.id) + '">🗑</button>' +
        "</div>";

      if (S.openId === x.id) {
        h += '<div class="spForm">' +
          '<div class="spChips">' + CANNED.map(function (k, i) {
            return '<button class="spChip" type="button" data-spcanned="' + i + '">' + esc(k.t) + "</button>";
          }).join("") + "</div>" +
          '<textarea id="spReplyIn" maxlength="800" placeholder="پاسخ تو به ' + esc(x.name) + "…\"></textarea>" +
          '<div class="spActs">' +
            '<button class="btn p mini" type="button" data-spsend="' + esc(x.id) + '">🚀 ارسال پاسخ</button>' +
            '<button class="btn mini" type="button" data-spcancel="1">لغو</button>' +
            '<span class="xs mut" style="align-self:center">پاسخ در حساب کاربر اعلان می‌شود</span>' +
          "</div></div>";
      }
      return h + "</div>";
    }).join("");
  }

  /* ── ۶. عملیات ──────────────────────────────────────────── */
  function find(id) {
    var out = null;
    all().forEach(function (x) { if (x.id === id) out = x; });
    return out;
  }
  function reply(id) {
    var m = find(id);
    if (!m || !R.db) return;
    var ta = el("spReplyIn");
    var txt = ta ? String(ta.value || "").trim().slice(0, 800) : "";
    if (txt.length < 3) return toast("متن پاسخ خیلی کوتاه است", "err");
    S.busy = true;
    R.upd(m.src + "/" + id, {
      reply: txt, replyAt: Date.now(), replyBy: meName(), read: true, st: "answered"
    }).then(function () {
      S.busy = false;
      S.openId = "";
      try {
        if (R.add) {
          R.add("ownerLog", { by: R.ME || "", act: "supportReply", ticket: id, src: m.src });
        }
      } catch (e) {}
      if (m.uid && m.uid !== R.ME && R.notify) {
        R.notify(m.uid, "🎫 پاسخ پشتیبانی: " + m.subject, "info", "inbox");
      }
      toast("پاسخ ثبت شد و به کاربر اطلاع داده شد ✅", "ok");
      render();
    }).catch(function (e) {
      S.busy = false;
      toast("ارسال نشد: " + (e && e.message ? e.message : ""), "err");
    });
  }
  function markRead(id) {
    var m = find(id); if (!m || !R.db) return;
    R.upd(m.src + "/" + id, { read: true }).catch(function () {});
  }
  function closeTicket(id) {
    var m = find(id); if (!m || !R.db) return;
    var next = m.st === "closed" ? (m.reply ? "answered" : "open") : "closed";
    R.upd(m.src + "/" + id, { st: next, read: true }).then(function () {
      toast(next === "closed" ? "تیکت بسته شد" : "تیکت دوباره باز شد", "ok");
      render();
    }).catch(function () {});
  }
  function removeTicket(id) {
    var m = find(id); if (!m || !R.db) return;
    if (!window.confirm("این تیکت برای همیشه حذف شود؟")) return;
    R.db.ref(m.src + "/" + id).remove().then(function () {
      toast("تیکت حذف شد", "ok");
      if (S.openId === id) S.openId = "";
      render();
    }).catch(function (e) { toast("نشد: " + (e && e.message ? e.message : ""), "err"); });
  }

  function onClick(e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var f = t.closest("[data-spf]");
    if (f) {
      S.filter = f.getAttribute("data-spf");
      qa("#spDesk .spFilter").forEach(function (b) { b.classList.toggle("on", b === f); });
      render();
      return;
    }
    var r = t.closest("[data-spreply]");
    if (r) {
      var id = r.getAttribute("data-spreply");
      S.openId = S.openId === id ? "" : id;
      render();
      var ta = el("spReplyIn");
      if (ta) { try { ta.focus(); } catch (err) {} }
      return;
    }
    var c = t.closest("[data-spcanned]");
    if (c) {
      var box = el("spReplyIn");
      if (!box) { toast("اول روی «پاسخ» یک تیکت بزن", "err"); return; }
      box.value = CANNED[parseInt(c.getAttribute("data-spcanned"), 10)].v;
      try { box.focus(); } catch (err) {}
      return;
    }
    var s = t.closest("[data-spsend]");
    if (s) return reply(s.getAttribute("data-spsend"));
    if (t.closest("[data-spcancel]")) { S.openId = ""; render(); return; }
    var rd = t.closest("[data-spread]");
    if (rd) return markRead(rd.getAttribute("data-spread"));
    var cl = t.closest("[data-spclose]");
    if (cl) return closeTicket(cl.getAttribute("data-spclose"));
    var dl = t.closest("[data-spdel]");
    if (dl) return removeTicket(dl.getAttribute("data-spdel"));
    var dm = t.closest("[data-spdm]");
    if (dm && R.dmOpen) return R.dmOpen(dm.getAttribute("data-spdm"));
  }

  /* ── ۷. راه‌اندازی و هم‌گام با ورود/خروج ────────────────── */
  function watchAll() {
    if (!R.db) return;
    SRC.forEach(function (src) {
      try {
        R.watch(src, function (v) {
          S.data[src] = v || {};
          if (S.open) render(); else paintBadge();
        });
      } catch (e) {}
    });
  }
  function boot() {
    if (!can()) { toggle(false); return; }
    css();
    ensureTab();
    ensureDesk();
    if (!R.__spWatch) { R.__spWatch = true; watchAll(); }
    render();
  }
  function reset() {
    S.open = false; S.openId = ""; S.data = { contact: {}, support: {} };
    var sec = el("sec-team"); if (sec) sec.classList.remove("sp-open");
    var tab = el("spTab"); if (tab) tab.remove();
    var desk = el("spDesk"); if (desk) desk.remove();
    S.tab = null; S.desk = null;
  }

  document.addEventListener("click", function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    if (t.closest("#spTab")) return;
    if (S.open && t.closest("#teamTabs .tab")) {
      toggle(false);
    }
  });

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  [900, 2000, 4200].forEach(function (ms) { setTimeout(boot, ms); });

  var tabsEl = el("teamTabs");
  if (tabsEl && window.MutationObserver) {
    new MutationObserver(function () { if (can()) ensureTab(); })
      .observe(tabsEl, { childList: true });
  }

  var in0 = R.onLogin;
  R.onLogin = function () {
    if (in0) { try { in0(); } catch (e) {} }
    setTimeout(boot, 700);
  };
  var out0 = R.onLogout;
  R.onLogout = function () {
    if (out0) { try { out0(); } catch (e) {} }
    reset();
  };

  window.RoninSupport = { open: function () { toggle(true); }, close: function () { toggle(false); },
    state: S, canned: CANNED };
})();
