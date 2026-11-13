/* RONIN OWNER SITE PANEL — owner-site.js
   در پنل مالک دو چیز را نشان می‌دهد:
   • پیام‌های فرم تماس (site/contact) با پاسخ/خوانده/حذف
   • آمار بازدید صفحه‌ها (site/views) با نمودار ۱۴ روز
   فقط برای مالک بارگذاری و رندر می‌شود. */
"use strict";
(function () {
  if (window.__ownerSite) return;
  window.__ownerSite = true;

  var CSS = [
    "#ownerSite{margin:0 0 16px}",
    ".osw{border-radius:20px;border:1px solid rgba(140,160,255,.2);overflow:hidden;",
    "  background:linear-gradient(150deg,rgba(23,27,61,.92),rgba(12,15,36,.94));",
    "  box-shadow:0 26px 60px -40px rgba(124,92,255,.9)}",
    ".osw-h{display:flex;align-items:center;gap:8px;padding:11px 14px;border-bottom:1px solid rgba(140,160,255,.14);flex-wrap:wrap}",
    ".osw-h b{font-size:12px;font-weight:900}",
    ".osw-h .sp{margin-inline-start:auto;display:flex;gap:6px;flex-wrap:wrap}",
    ".ost{border:1px solid rgba(140,160,255,.2);background:rgba(255,255,255,.04);color:#cfd7f7;",
    "  font:inherit;font-size:10px;font-weight:800;padding:6px 11px;border-radius:9px;cursor:pointer;transition:.16s}",
    ".ost:hover{border-color:rgba(124,92,255,.55);background:rgba(124,92,255,.16)}",
    ".ost.on{color:#05060f;border-color:transparent;background:linear-gradient(135deg,#8ef0ff,#7c5cff)}",
    ".ost .bd{font-size:9px;margin-inline-start:5px;padding:1px 5px;border-radius:99px;background:rgba(255,107,129,.9);color:#fff}",
    ".osw-b{padding:12px 14px}",
    ".osM{display:flex;gap:10px;padding:10px;border:1px solid rgba(140,160,255,.13);border-radius:14px;",
    "  background:rgba(255,255,255,.03);margin-bottom:8px}",
    ".osM.unseen{border-color:rgba(255,92,168,.45);background:rgba(255,92,168,.07)}",
    ".osAv{flex:none;width:34px;height:34px;border-radius:11px;display:grid;place-items:center;font-size:15px;",
    "  background:linear-gradient(140deg,#7c5cff,#22d3ee);color:#05060f;font-weight:900}",
    ".osMb{flex:1;min-width:0}",
    ".osMb .r1{display:flex;align-items:center;gap:7px;flex-wrap:wrap;margin-bottom:3px}",
    ".osMb .r1 b{font-size:11.5px}",
    ".osTg{font-size:8.5px;font-weight:900;padding:2px 7px;border-radius:99px;",
    "  background:rgba(34,211,238,.14);color:#9fe9ff;border:1px solid rgba(34,211,238,.35)}",
    ".osTg.pr{background:rgba(255,203,82,.14);color:#ffd77a;border-color:rgba(255,203,82,.4)}",
    ".osTg.rp{background:rgba(255,107,129,.14);color:#ffb9c4;border-color:rgba(255,107,129,.4)}",
    ".osMb .ago{font-size:9px;color:#7f8ab6;margin-inline-start:auto}",
    ".osTxt{font-size:11px;line-height:1.95;color:#c4ceec;white-space:pre-wrap;word-break:break-word}",
    ".osCt{font-size:9.5px;color:#9fe9ff;direction:ltr;display:inline-block;margin-top:3px}",
    ".osActs{display:flex;gap:5px;flex-wrap:wrap;margin-top:7px}",
    ".osActs button,.osActs a{border:1px solid rgba(140,160,255,.2);background:transparent;color:#dfe6ff;",
    "  font:inherit;font-size:9px;font-weight:800;padding:4px 9px;border-radius:8px;cursor:pointer;text-decoration:none}",
    ".osActs button:hover,.osActs a:hover{border-color:rgba(124,92,255,.6);background:rgba(124,92,255,.16)}",
    ".osActs .del{border-color:rgba(255,107,129,.35);color:#ffb3bf}",
    ".osEmpty{border:1px dashed rgba(140,160,255,.28);border-radius:14px;padding:22px;text-align:center;",
    "  font-size:11px;color:#9aa6cc}",
    ".osKpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(104px,1fr));gap:8px;margin-bottom:12px}",
    ".osK{border:1px solid rgba(140,160,255,.16);border-radius:13px;padding:9px 11px;background:rgba(255,255,255,.03)}",
    ".osK span{display:block;font-size:9px;color:#8b97c4;margin-bottom:2px}",
    ".osK b{font-size:17px;font-weight:900;color:#eaf4ff}",
    ".osK.g b{color:#5df0b0}",".osK.c b{color:#9fe9ff}",
    ".osChart{display:flex;align-items:flex-end;gap:5px;height:120px;padding:8px 2px 0;",
    "  border-bottom:1px solid rgba(140,160,255,.16)}",
    ".osBar{flex:1;min-width:0;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;gap:4px;height:100%}",
    ".osBar i{display:block;width:100%;border-radius:6px 6px 2px 2px;min-height:3px;",
    "  background:linear-gradient(180deg,#8ef0ff,#7c5cff);box-shadow:0 0 14px -4px rgba(124,92,255,.9);transition:height .4s}",
    ".osBar em{font-size:8px;color:#7f8ab6;font-style:normal;white-space:nowrap}",
    ".osLg{display:flex;gap:12px;flex-wrap:wrap;font-size:9px;color:#9aa6cc;margin-top:8px}",
    ".osLg i{display:inline-block;width:9px;height:9px;border-radius:3px;margin-inline-end:4px;vertical-align:-1px}",
    ".osNote{font-size:9.5px;color:#7f8ab6;margin-top:8px;line-height:1.9}"
  ].join("");
  var st = document.createElement("style");
  st.id = "osCss";
  st.textContent = CSS;
  (document.head || document.documentElement).appendChild(st);

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function fa(n) { return String(n).replace(/[0-9]/g, function (d) { return "۰۱۲۳۴۵۶۷۸۹"[d]; }); }
  function money0(n) { return fa(String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",")); }

  function ago(ts) {
    if (!ts) return "";
    var s = Math.floor((Date.now() - ts) / 1000);
    if (s < 60) return "همین حالا";
    if (s < 3600) return fa(Math.floor(s / 60)) + " دقیقه پیش";
    if (s < 86400) return fa(Math.floor(s / 3600)) + " ساعت پیش";
    if (s < 172800) return "دیروز";
    return fa(Math.floor(s / 86400)) + " روز پیش";
  }
  function dayKey(d) {
    return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2);
  }
  var TOPICS = {
    support: ["پشتیبانی", ""], premium: ["پرمیوم", "pr"], report: ["گزارش", "rp"], ads: ["تبلیغات", "pr"], other: ["دیگر", ""]
  };

  var MSGS = {}, VIEWS = {}, TAB = "msg";

  function mount() {
    var sec = document.getElementById("sec-owner");
    if (!sec || !window.R || !R.isOwner || !R.isOwner()) return false;
    if (document.getElementById("ownerSite")) { paint(); return true; }
    var box = document.createElement("div");
    box.id = "ownerSite";
    box.innerHTML =
      '<div class="osw">' +
        '<div class="osw-h"><b>📬 پیام‌ها و آمار سایت</b>' +
          '<span class="sp">' +
            '<button class="ost on" type="button" data-ostab="msg">پیام‌ها<span class="bd" id="osUnseen" hidden></span></button>' +
            '<button class="ost" type="button" data-ostab="visits">آمار بازدید</button>' +
            '<button class="ost" type="button" id="osReload">↻ به‌روزرسانی</button>' +
          '</span>' +
        '</div>' +
        '<div class="osw-b" id="osBody"><div class="osEmpty">در حال خواندن…</div></div>' +
      '</div>';
    var top = document.getElementById("ohTop");
    if (top && top.parentNode) top.parentNode.insertBefore(box, top.nextSibling);
    else sec.insertBefore(box, sec.firstChild);

    box.addEventListener("click", function (e) {
      var t = e.target.closest("[data-ostab]");
      if (t) {
        TAB = t.getAttribute("data-ostab");
        $$("[data-ostab]", box).forEach(function (b) { b.classList.toggle("on", b === t); });
        paint();
        return;
      }
      if (e.target.closest("#osReload")) { load(true); return; }
      var del = e.target.closest("[data-osdel]");
      if (del) {
        var id = del.getAttribute("data-osdel");
        if (!window.confirm("این پیام حذف شود؟")) return;
        R.db.ref("site/contact/" + id).remove().then(function () {
          delete MSGS[id]; paint();
          if (R.toast) R.toast("پیام حذف شد", "ok");
        }).catch(function () { if (R.toast) R.toast("حذف نشد", "err"); });
        return;
      }
      var seen = e.target.closest("[data-osseen]");
      if (seen) {
        var sid = seen.getAttribute("data-osseen");
        R.db.ref("site/contact/" + sid).update({ seen: true }).then(function () {
          if (MSGS[sid]) MSGS[sid].seen = true;
          paint();
        }).catch(function () {});
      }
    });

    load(false);
    return true;
  }

  function load(force) {
    if (!window.R || !R.db) return;
    R.db.ref("site/contact").once("value").then(function (snap) {
      MSGS = snap.val() || {};
      paint();
    }).catch(function () {
      var b = document.getElementById("osBody");
      if (b && !Object.keys(MSGS).length) b.innerHTML = '<div class="osEmpty">خواندن پیام‌ها ممکن نشد.<br>دسترسی خواندن <b>site/contact</b> را در قواعد Firebase برای مالک باز کن.</div>';
    });
    R.db.ref("site/views").once("value").then(function (snap) {
      VIEWS = snap.val() || {};
      if (TAB === "visits") paint();
    }).catch(function () {});
  }

  function msgList() {
    var keys = Object.keys(MSGS).sort(function (a, b) { return (MSGS[b].at || 0) - (MSGS[a].at || 0); });
    if (!keys.length) return '<div class="osEmpty">هنوز پیامی از فرم تماس نیامده.<br>پیام‌های <b>contact.html</b> اینجا نشان داده می‌شوند.</div>';
    var unseen = keys.filter(function (k) { return !MSGS[k].seen; }).length;
    var bd = document.getElementById("osUnseen");
    if (bd) { bd.hidden = !unseen; bd.textContent = fa(unseen); }
    return keys.slice(0, 40).map(function (k) {
      var m = MSGS[k] || {};
      var tp = TOPICS[m.topic] || TOPICS.other;
      return '<div class="osM' + (m.seen ? "" : " unseen") + '">' +
        '<div class="osAv">' + esc((m.name || "?").trim().charAt(0)) + "</div>" +
        '<div class="osMb">' +
          '<div class="r1"><b>' + esc(m.name || "بدون نام") + "</b>" +
            '<span class="osTg ' + tp[1] + '">' + tp[0] + "</span>" +
            '<span class="ago">' + ago(m.at) + "</span></div>" +
          '<div class="osTxt">' + esc(m.msg || "") + "</div>" +
          (m.contact ? '<span class="osCt">' + esc(m.contact) + "</span>" : "") +
          '<div class="osActs">' +
            (m.contact && /@/.test(m.contact) ? '<a href="mailto:' + esc(m.contact) + '">✉ پاسخ</a>' : "") +
            (m.seen ? "" : '<button type="button" data-osseen="' + k + '">✓ خوانده شد</button>') +
            '<button class="del" type="button" data-osdel="' + k + '">حذف</button>' +
          "</div>" +
        "</div></div>";
    }).join("");
  }

  function visitPanel() {
    var days = [];
    for (var i = 13; i >= 0; i--) {
      var d = new Date();
      d.setDate(d.getDate() - i);
      days.push({ key: dayKey(d), label: fa(d.getDate() + "/" + (d.getMonth() + 1)) });
    }
    var idx = VIEWS.index || {}, cin = VIEWS.cinema || {}, tot = VIEWS._total || {};
    function sum(obj) {
      return Object.keys(obj).reduce(function (a, k) {
        var v = obj[k];
        return a + (typeof v === "number" ? v : 0);
      }, 0);
    }
    var series = days.map(function (d) {
      return { label: d.label, idx: +idx[d.key] || 0, cin: +cin[d.key] || 0, all: +tot[d.key] || 0 };
    });
    var max = Math.max.apply(null, series.map(function (s) { return Math.max(s.all, s.idx + s.cin); }).concat([1]));
    var today = series[series.length - 1];
    var allIdx = sum(idx), allCin = sum(cin);

    var bars = series.map(function (s) {
      var h = Math.round((Math.max(s.all, s.idx + s.cin) / max) * 100);
      return '<div class="osBar" title="' + esc(s.label) + " — " + fa(s.all) + ' بازدید">' +
        "<i style=\"height:" + Math.max(2, h) + '%\"></i><em>' + s.label + "</em></div>";
    }).join("");

    return '<div class="osKpis">' +
        '<div class="osK b"><span>امروز</span><b>' + money0(today.all) + "</b></div>" +
        '<div class="osK g"><span>صفحهٔ اصلی (کل)</span><b>' + money0(allIdx) + "</b></div>" +
        '<div class="osK c"><span>رونین فیلم (کل)</span><b>' + money0(allCin) + "</b></div>" +
        '<div class="osK"><span>۱۴ روز اخیر</span><b>' + money0(series.reduce(function (a, s) { return a + Math.max(s.all, s.idx + s.cin); }, 0)) + "</b></div>" +
      "</div>" +
      '<div class="osChart">' + bars + "</div>" +
      '<div class="osLg"><span><i style="background:linear-gradient(180deg,#8ef0ff,#7c5cff)"></i>کل بازدید روز</span>' +
        '<span>تفکیک صفحه‌ها در کارت‌های بالا</span></div>' +
      '<div class="osNote">شمارش سبک و بدون سرویس بیرونی است: هر نشست یک‌بار در <b>site/views/&lt;صفحه&gt;/&lt;تاریخ&gt;</b> ثبت می‌شود (بدون IP و بدون شناسهٔ کاربر).</div>';
  }

  function paint() {
    var body = document.getElementById("osBody");
    if (!body) return;
    body.innerHTML = TAB === "msg" ? msgList() : visitPanel();
    if (TAB === "msg") {
      var bd = document.getElementById("osUnseen");
      var unseen = Object.keys(MSGS).filter(function (k) { return !MSGS[k].seen; }).length;
      if (bd) { bd.hidden = !unseen; bd.textContent = fa(unseen); }
    }
  }

  function boot() {
    if (!window.R) { setTimeout(boot, 600); return; }
    if (!R.isOwner || !R.isOwner()) return;
    if (!mount()) setTimeout(boot, 900);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  setTimeout(boot, 1500);
})();
