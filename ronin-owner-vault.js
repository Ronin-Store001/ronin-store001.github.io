/* ═══════════════════════════════════════════════════════════════
   RONIN STORE — OWNER VAULT · ronin-owner-vault.js · v1
   ───────────────────────────────────────────────────────────────
   🧠 حافظهٔ فایربیس: اسکن دیتابیس، عکس/ویدیوی آپلودشده، Storage
   🎛 مدیریت کاربر: نقش، عنوان، پرمیوم و سوال دوگزینه‌ای
   📣 کمپین: ثبت واقعی تبلیغ + تایید مالک
   • فقط مالک تب‌های پنل را می‌بیند و اجرا می‌کند
   • کاربر عادی فقط سوال دوگزینه‌ایِ خودش را می‌بیند
   ═══════════════════════════════════════════════════════════════ */
"use strict";
(function () {
  if (!window.R || R.__ov) return;
  R.__ov = true;

  var ROOTS = [
    "users", "groups", "posts", "products", "bulletin", "anime", "news",
    "events", "chat", "dm", "orders", "reports", "contact", "support",
    "premreq", "userQuestions", "campaigns", "notifs", "ownerLog", "settings"
  ];
  var DEL_ROOTS = {
    ownerLog: 1, contact: 1, support: 1, premreq: 1, campaigns: 1,
    reports: 1, orders: 1, userQuestions: 1, questions: 1
  };
  var MEDIA_CAP = 120000;
  var CLEAN_DAYS = 30;

  var S = {
    vault: {
      scan: null, busy: false, showAll: false,
      storage: { folder: "cinema", files: null, busy: false, err: "", loading: false }
    },
    manage: { sel: "", uq: "", title: "", q: "", a: "", b: "" },
    q: { all: {}, mine: {}, open: null, hidden: {} },
    profTitles: {},
    camps: {},
    offs: [],
    watchKey: ""
  };

  function el(i) { return document.getElementById(i); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function fa(n) { try { return R.fa ? R.fa(n) : String(n); } catch (e) { return String(n); } }
  function toast(m, k) { try { if (R.toast) R.toast(m, k || "ok"); } catch (e) {} }
  function isOwner() { try { return !!(R.isOwner && R.isOwner()); } catch (e) { return false; } }
  function when(t) { try { return R.time ? R.time(t) : ""; } catch (e) { return ""; } }
  function clean(s, n) { try { return R.clean ? R.clean(s, n) : String(s || "").trim().slice(0, n || 999); } catch (e) { return String(s || "").trim().slice(0, n || 999); } }
  function safeHttp(v) {
    v = String(v == null ? "" : v).trim();
    return /^https?:\/\//i.test(v) ? v : "";
  }
  function fmtBytes(n) {
    n = Number(n) || 0;
    if (n < 1024) return fa(Math.round(n)) + " B";
    if (n < 1048576) return fa((n / 1024).toFixed(1)) + " KB";
    return fa((n / 1048576).toFixed(2)) + " MB";
  }
  function userName(uid) {
    var u = (R.USERS || {})[uid] || (R.ME === uid ? R.USER : null);
    return (u && u.name) || uid || "کاربر";
  }
  function userAv(uid) {
    var u = (R.USERS || {})[uid] || (R.ME === uid ? R.USER : null);
    if (u && R.avHTML) { try { return R.avHTML(u, "sm"); } catch (e) {} }
    return '<div class="av sm"><span>' + esc((userName(uid) || "؟").slice(0, 1)) + "</span></div>";
  }
  function refresh() {
    if (!isOwner()) return;
    if (["vault", "manage", "campaigns"].indexOf(R.ownerTab) < 0) return;
    if (typeof R.renderOwner === "function") {
      try { R.renderOwner(); } catch (e) { console.warn("[Ronin] owner render:", e); }
    }
  }

  /* ── ۱. استایل ───────────────────────────────────────────── */
  function css() {
    if (el("ovCss")) return;
    var s = document.createElement("style");
    s.id = "ovCss";
    s.textContent = [
      ".ovWrap{display:flex;flex-direction:column;gap:10px}",
      ".ovBar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;justify-content:space-between}",
      ".ovBar b{font-size:13px}",
      ".ovStat{font-size:10px;color:#9fb0d8}",
      ".ovKpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(112px,1fr));gap:8px}",
      ".ovKpi{border:1px solid rgba(143,233,255,.18);border-radius:14px;padding:10px;background:rgba(255,255,255,.04)}",
      ".ovKpi b{display:block;font-size:17px;font-weight:900;color:#bfefff;direction:ltr;text-align:center}",
      ".ovKpi span{display:block;text-align:center;font-size:9.5px;color:#9fb0d8;margin-top:3px}",
      ".ovTable{display:flex;flex-direction:column;gap:5px}",
      ".ovRow{display:flex;align-items:center;gap:8px;padding:7px 9px;border-radius:11px;background:rgba(255,255,255,.035);border:1px solid rgba(150,160,210,.12);font-size:11px}",
      ".ovRow .grow{min-width:0}",
      ".ovRow b{font-size:11.5px}",
      ".ovRow .p{font-size:9px;color:#8fa0cc;direction:ltr;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
      ".ovRow .n{font-size:10px;color:#9fb0d8;white-space:nowrap}",
      ".ovMediaGrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:8px}",
      ".ovMedia{display:flex;gap:8px;align-items:center;padding:7px;border-radius:12px;background:rgba(255,255,255,.04);border:1px solid rgba(150,160,210,.14);min-width:0}",
      ".ovThumb{width:46px;height:46px;flex:0 0 auto;border-radius:9px;overflow:hidden;background:#0b1024;display:grid;place-items:center;font-size:18px}",
      ".ovThumb img,.ovThumb video{width:100%;height:100%;object-fit:cover}",
      ".ovMedia .grow{min-width:0}",
      ".ovMedia .p{font-size:8.5px;color:#8fa0cc;direction:ltr;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
      ".ovMedia .s{font-size:9.5px;color:#ffd66b}",
      ".ovDanger{border-color:rgba(255,84,112,.3)!important;background:rgba(255,84,112,.07)!important}",
      ".ovInputs{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:7px;margin-top:8px}",
      ".ovInputs .full{grid-column:1/-1}",
      ".ovNote{font-size:10px;color:#9fb0d8;line-height:1.9}",
      ".ovHint{font-size:10.5px;color:#ffd66b;line-height:1.9}",
      ".ovErr{font-size:10px;color:#ff9db0;line-height:1.9}",
      ".ovQ{border:1px solid rgba(143,233,255,.2);border-radius:14px;padding:10px;background:rgba(255,255,255,.04)}",
      ".ovQ .qq{font-size:12px;font-weight:800;margin-bottom:4px}",
      ".ovQ .opts{display:flex;gap:6px;flex-wrap:wrap;margin-top:7px}",
      ".ovQ .opt{flex:1;min-width:120px;padding:8px;border-radius:10px;border:1px solid rgba(143,233,255,.24);background:rgba(143,233,255,.06);color:#eef4ff;font-family:inherit;font-size:11px;cursor:pointer}",
      ".ovQ .opt:hover{border-color:#8fe9ff}",
      ".ovQMod{position:fixed;inset:0;z-index:10030;display:none;place-items:center;padding:16px;background:rgba(4,7,18,.72);backdrop-filter:blur(7px)}",
      ".ovQMod.on{display:grid}",
      ".ovQCard{width:min(460px,100%);border-radius:20px;padding:18px;color:#eef4ff;border:1px solid rgba(143,233,255,.3);background:linear-gradient(160deg,#171b3d,#0c0f24 60%,#141a38);box-shadow:0 30px 80px -30px #000}",
      ".ovQCard .k{font-size:10px;color:#8fe9ff;font-weight:800;letter-spacing:.4px}",
      ".ovQCard h3{margin:6px 0 10px;font-size:15px;line-height:1.8}",
      ".ovQCard .opt{display:block;width:100%;margin-top:7px;padding:11px;border-radius:12px;border:1px solid rgba(143,233,255,.3);background:rgba(143,233,255,.08);color:#eef4ff;font-family:inherit;font-size:12.5px;font-weight:800;cursor:pointer;text-align:right}",
      ".ovQCard .opt:hover{background:rgba(143,233,255,.16)}",
      ".ovQCard .later{margin-top:10px;background:none;border:0;color:#9fb0d8;font-size:10.5px;cursor:pointer;font-family:inherit}",
      ".ovQBadge{position:fixed;bottom:18px;inset-inline-start:18px;z-index:10020;display:none;align-items:center;gap:7px;padding:10px 13px;border-radius:99px;border:1px solid #8fe9ff;background:linear-gradient(135deg,#7c5cff,#22d3ee);color:#07101c;font-family:inherit;font-weight:900;font-size:11px;cursor:pointer;box-shadow:0 16px 34px -14px #000}",
      ".ovQBadge.on{display:inline-flex}",
      ".ovTitleChip{font-size:10px!important;padding:2px 8px!important}",
      "@media(max-width:560px){.ovMediaGrid{grid-template-columns:1fr 1fr}.ovQCard h3{font-size:13.5px}}"
    ].join("\n");
    document.head.appendChild(s);
  }

  /* ── ۲. تب‌های پنل مالک ──────────────────────────────────── */
  function ensureTabs() {
    if (!isOwner()) return;
    var box = document.querySelector("#sec-owner .tabs");
    if (!box) return;
    var defs = [
      ["manage", "🎛 کاربر"],
      ["vault", "🧠 حافظه"],
      ["campaigns", "📣 کمپین"]
    ];
    defs.forEach(function (d) {
      if (box.querySelector('[data-otab="' + d[0] + '"]')) return;
      var t = document.createElement("div");
      t.className = "tab";
      t.setAttribute("data-otab", d[0]);
      t.setAttribute("data-ovnewtab", "1");
      t.textContent = d[1];
      box.appendChild(t);
    });
  }
  function markTabs() {
    var t = R.ownerTab || "overview";
    Array.prototype.forEach.call(document.querySelectorAll("#sec-owner .tabs .tab"), function (x) {
      x.classList.toggle("on", x.getAttribute("data-otab") === t);
    });
  }

  /* ── ۳. رندر سفارشی پنل ─────────────────────────────────── */
  var baseRender = R.renderOwner;
  R.renderOwner = function () {
    if (!isOwner()) return baseRender ? baseRender.apply(this, arguments) : undefined;
    ensureTabs();
    var t = R.ownerTab || "overview";
    if (t === "vault" || t === "manage" || t === "campaigns") {
      var b = el("ownerBody");
      if (b) b.innerHTML = t === "vault" ? vaultHTML() : t === "manage" ? manageHTML() : campaignsHTML();
      markTabs();
      if (t === "manage") fillSelect();
      return;
    }
    return baseRender ? baseRender.apply(this, arguments) : undefined;
  };

  /* ── ۴. حافظهٔ فایربیس ──────────────────────────────────── */
  function walk(node, path, st, depth) {
    if (!node || st.nodes >= MEDIA_CAP) { if (st.nodes >= MEDIA_CAP) st.truncated = true; return; }
    if (typeof node === "string") {
      st.nodes++;
      st.bytes += node.length * 2;
      if (/^data:(image|video)\//i.test(node) && node.length > 600) {
        var m = node.slice(5, node.indexOf(";") > 0 ? node.indexOf(";") : node.indexOf(","));
        st.media.push({
          path: path, mime: m || "media", size: Math.round(node.length * 0.75),
          len: node.length, src: node
        });
      }
      return;
    }
    if (typeof node === "number" || typeof node === "boolean") { st.nodes++; st.bytes += 8; return; }
    if (typeof node !== "object") return;
    Object.keys(node).forEach(function (k) {
      st.bytes += (k.length * 2) + 4;
      walk(node[k], path + "/" + k, st, depth + 1);
    });
  }

  function scanAll() {
    if (!isOwner()) return;
    if (S.vault.busy || !R.db) return;
    S.vault.busy = true;
    S.vault.scan = null;
    refresh();
    var roots = {}, media = [], totalNodes = 0, totalBytes = 0, errors = [];
    var chain = Promise.resolve();
    var done = 0;

    ROOTS.forEach(function (root) {
      chain = chain.then(function () {
        done++;
        setScanStat("در حال اسکن " + root + "… (" + fa(done) + "/" + fa(ROOTS.length) + ")");
        return R.get(root).then(function (v) {
          if (v == null) return;
          var st = { nodes: 0, bytes: 0, media: [], truncated: false };
          walk(v, root, st, 0);
          roots[root] = st;
          totalNodes += st.nodes;
          totalBytes += st.bytes;
          media = media.concat(st.media);
        }, function (e) {
          errors.push(root + ": " + ((e && e.message) || e || "خطا"));
        });
      });
    });

    chain.then(function () {
      media.sort(function (a, b) { return b.size - a.size; });
      S.vault.scan = {
        roots: roots, media: media, totalNodes: totalNodes, totalBytes: totalBytes,
        errors: errors, at: Date.now()
      };
      S.vault.busy = false;
      toast("اسکن حافظه تمام شد ✅", "ok");
      refresh();
    }).catch(function (e) {
      S.vault.busy = false;
      S.vault.scan = { roots: roots, media: media, totalNodes: totalNodes, totalBytes: totalBytes, errors: errors.concat([(e && e.message) || "خطا"]), at: Date.now() };
      toast("اسکن نیمه‌کاره ماند", "err");
      refresh();
    });
  }

  function setScanStat(t) {
    var e = el("ovScanStat");
    if (e) e.textContent = t;
    var b = document.querySelector("[data-ovscan]");
    if (b) b.disabled = !!S.vault.busy;
  }

  function delPath(path, label) {
    if (!isOwner()) return;
    if (!R.db) return toast("اتصال به دیتابیس نیست", "err");
    if (!window.confirm("«" + label + "» برای همیشه حذف شود؟\n\n" + path)) return;
    var p;
    try { p = R.db.ref(path).remove(); }
    catch (e) { return toast("مسیر قابل حذف نیست: " + e.message, "err"); }
    p.then(function () {
      if (S.vault.scan) {
        S.vault.scan.media = S.vault.scan.media.filter(function (x) { return x.path !== path; });
      }
      toast("حذف شد 🗑", "ok");
      log("vaultDel", { path: path });
      refresh();
    }).catch(function (e) { toast("حذف نشد: " + ((e && e.message) || ""), "err"); });
  }

  function delRoot(root) {
    if (!isOwner()) return;
    if (!DEL_ROOTS[root]) return toast("حذف ریشهٔ این بخش از اینجا مجاز نیست", "err");
    if (!R.db) return;
    var st = S.vault.scan && S.vault.scan.roots[root];
    if (!window.confirm("کل «" + root + "» (" + fa(st ? st.nodes : 0) + " مورد) حذف شود؟ این کار برگشت‌پذیر نیست.")) return;
    R.db.ref(root).remove().then(function () {
      S.vault.scan = null;
      toast("«" + root + "» پاک شد", "ok");
      log("vaultRoot", { root: root });
      scanAll();
    }).catch(function (e) { toast("نشد: " + ((e && e.message) || ""), "err"); });
  }

  function log(act, extra) {
    var o = { by: R.ME || "", byName: (R.USER && R.USER.name) || "مالک", act: act, t: Date.now() };
    if (extra) Object.keys(extra).forEach(function (k) { o[k] = extra[k]; });
    if (R.add) R.add("ownerLog", o).catch(function () {});
  }

  /* ── ۴.۱ Storage ─────────────────────────────────────────── */
  function loadStorage(cb) {
    if (window.firebase && firebase.storage) return cb(null);
    if (S.vault.storage.loading) return;
    S.vault.storage.loading = true;
    var s = document.createElement("script");
    s.src = "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage-compat.js";
    s.onload = function () {
      S.vault.storage.loading = false;
      if (window.firebase && firebase.storage) cb(null);
      else cb(new Error("Storage SDK آماده نشد"));
    };
    s.onerror = function () {
      S.vault.storage.loading = false;
      cb(new Error("دانلود SDK استوریج ناموفق بود"));
    };
    document.head.appendChild(s);
  }

  function listRefDeep(ref, depth, out, errs) {
    return ref.listAll().then(function (res) {
      var jobs = res.items.map(function (it) {
        return it.getMetadata().then(function (m) {
          out.push({
            path: it.fullPath, name: it.name, size: m.size || 0,
            type: m.contentType || "", updated: m.updated || ""
          });
        }).catch(function () {
          out.push({ path: it.fullPath, name: it.name, size: 0, type: "", updated: "" });
        });
      });
      if (depth < 3) {
        res.prefixes.forEach(function (p) {
          jobs.push(listRefDeep(p, depth + 1, out, errs).catch(function (e) { errs.push(p.fullPath); }));
        });
      }
      return Promise.all(jobs);
    });
  }

  function listStorage() {
    if (!isOwner()) return;
    var folderEl = el("ovStoreFolder");
    if (folderEl) S.vault.storage.folder = clean(folderEl.value, 80).replace(/^\/+|\/+$/g, "");
    var folder = S.vault.storage.folder;
    S.vault.storage.busy = true;
    S.vault.storage.err = "";
    refresh();
    loadStorage(function (err) {
      if (err) {
        S.vault.storage.busy = false;
        S.vault.storage.err = err.message;
        refresh();
        return;
      }
      var out = [], errs = [];
      var ref;
      try { ref = firebase.storage().ref(folder); }
      catch (e) {
        S.vault.storage.busy = false;
        S.vault.storage.err = (e && e.message) || "Storage در دسترس نیست";
        refresh();
        return;
      }
      listRefDeep(ref, 0, out, errs).then(function () {
        out.sort(function (a, b) { return String(b.updated).localeCompare(String(a.updated)); });
        S.vault.storage.files = out;
        S.vault.storage.busy = false;
        if (!out.length) S.vault.storage.err = "در این مسیر فایلی پیدا نشد (یا قوانین اجازهٔ لیست نمی‌دهد).";
        refresh();
      }).catch(function (e) {
        S.vault.storage.busy = false;
        S.vault.storage.files = [];
        S.vault.storage.err = "لیست نشد: " + ((e && e.message) || e) +
          " — قوانین Firebase Storage باید خواندن برای مالک را اجازه دهند.";
        refresh();
      });
    });
  }

  function delStorage(path) {
    if (!isOwner()) return;
    if (!window.confirm("فایل استوریج حذف شود؟\n\n" + path)) return;
    loadStorage(function (err) {
      if (err) return toast(err.message, "err");
      firebase.storage().ref(path).delete().then(function () {
        if (S.vault.storage.files) {
          S.vault.storage.files = S.vault.storage.files.filter(function (f) { return f.path !== path; });
        }
        toast("فایل حذف شد 🗑", "ok");
        log("storageDel", { path: path });
        refresh();
      }).catch(function (e) { toast("حذف نشد: " + ((e && e.message) || ""), "err"); });
    });
  }

  function openStorage(path) {
    if (!isOwner()) return;
    loadStorage(function (err) {
      if (err) return toast(err.message, "err");
      firebase.storage().ref(path).getDownloadURL().then(function (url) {
        window.open(url, "_blank", "noopener");
      }).catch(function (e) { toast("لینک نشد: " + ((e && e.message) || ""), "err"); });
    });
  }

  /* ── ۴.۲ پاک‌سازی ───────────────────────────────────────── */
  function collectClean(kind) {
    var cut = Date.now() - CLEAN_DAYS * 86400000;
    function map(path, filter) {
      return R.get(path).then(function (v) {
        var out = [];
        Object.keys(v || {}).forEach(function (k) {
          if (filter(v[k] || {})) out.push(path + "/" + k);
        });
        return out;
      }).catch(function () { return []; });
    }
    if (kind === "logs") return map("ownerLog", function (x) { return (x.t || 0) < cut; });
    if (kind === "tickets") {
      return Promise.all(["contact", "support"].map(function (p) {
        return map(p, function (m) { return (m.reply || m.st === "closed") && (m.t || 0) < cut; });
      })).then(function (a) { return a[0].concat(a[1]); });
    }
    if (kind === "prem") return map("premreq", function (x) { return (x.t || 0) < cut; });
    if (kind === "rejected") return map("campaigns", function (x) { return x.st === "rejected" && (x.t || 0) < cut; });
    if (kind === "notifs") {
      return R.get("notifs").then(function (v) {
        var out = [];
        Object.keys(v || {}).forEach(function (uid) {
          Object.keys(v[uid] || {}).forEach(function (id) {
            var n = v[uid][id] || {};
            if (n.read && (n.t || 0) < cut) out.push("notifs/" + uid + "/" + id);
          });
        });
        return out;
      }).catch(function () { return []; });
    }
    return Promise.resolve([]);
  }

  var CLEAN_LABEL = {
    logs: "لاگ‌های قدیمی مالک", tickets: "تیکت‌های بسته/پاسخ‌داده‌شده",
    prem: "درخواست‌های پرمیوم قدیمی", rejected: "کمپین‌های ردشده",
    notifs: "اعلان‌های خوانده‌شدهٔ قدیمی"
  };

  function cleanNow(kind) {
    if (!isOwner()) return;
    if (S.vault.cleanBusy) return;
    S.vault.cleanBusy = true;
    toast("در حال شمارش…", "ok");
    collectClean(kind).then(function (list) {
      if (!list.length) {
        S.vault.cleanBusy = false;
        return toast("چیزی برای پاک‌سازی نبود ✅", "ok");
      }
      if (!window.confirm(CLEAN_LABEL[kind] + ": " + fa(list.length) + " مورد حذف شود؟")) {
        S.vault.cleanBusy = false;
        return;
      }
      var slice = list.slice(0, 500);
      return Promise.all(slice.map(function (p) {
        return R.db.ref(p).remove().catch(function () {});
      })).then(function () {
        S.vault.cleanBusy = false;
        log("cleanup", { kind: kind, count: slice.length });
        toast(fa(slice.length) + " مورد پاک شد 🧹", "ok");
        scanAll();
      });
    }).catch(function (e) {
      S.vault.cleanBusy = false;
      toast("پاک‌سازی نشد: " + ((e && e.message) || ""), "err");
    });
  }

  /* ── ۴.۳ HTML حافظه ─────────────────────────────────────── */
  function vaultHTML() {
    var v = S.vault, sc = v.scan;
    var h = '<div class="ovWrap">';
    h += '<div class="card ovBar"><div><b>🧠 حافظهٔ فایربیس</b>' +
      '<div class="ovNote">اینجا می‌بینی چه چیزی حافظهٔ دیتابیس و استوریج را خورده؛ عکس، ویدیو و داده‌های اضافه را حذف کن.</div></div>' +
      '<button class="btn p mini" type="button" data-ovscan' + (v.busy ? " disabled" : "") + ">" +
      (v.busy ? "در حال اسکن…" : "🔄 اسکن حافظه") + "</button></div>";

    h += '<div id="ovScanStat" class="ovStat">' +
      (v.busy ? "در حال خواندن دیتابیس…" : sc ? "آخرین اسکن: " + esc(when(sc.at)) : "هنوز اسکن نشده — دکمهٔ اسکن را بزن.") +
      "</div>";

    h += '<div class="ovKpis">' +
      kpi(sc ? fa(sc.totalNodes) : "—", "نود دیتابیس") +
      kpi(sc ? fmtBytes(sc.totalBytes) : "—", "حجم تقریبی") +
      kpi(sc ? fa(sc.media.length) : "—", "عکس/ویدیو") +
      kpi(sc ? fmtBytes(sc.media.reduce(function (a, x) { return a + x.size; }, 0)) : "—", "حجم مدیا") +
      "</div>";

    if (sc) {
      h += '<div class="card"><div class="sm b mb">📚 بخش‌های دیتابیس</div><div class="ovTable">';
      ROOTS.forEach(function (root) {
        var st = sc.roots[root];
        h += '<div class="ovRow"><div class="grow"><b>' + esc(root) + "</b>" +
          '<div class="p">' + (st ? fa(st.nodes) + " نود • " + fmtBytes(st.bytes) : "خالی / خوانده نشد") +
          (st && st.truncated ? " • ناقص" : "") + "</div></div>" +
          '<div class="n">' + (st ? fa(st.media.length) + " مدیا" : "—") + "</div>" +
          (st && st.media.length ? '<button class="btn mini" type="button" data-ovmediaall="1">دیدن</button>' : "") +
          (DEL_ROOTS[root] ? '<button class="btn d mini" type="button" data-ovdelroot="' + esc(root) + '">حذف</button>' : "") +
          "</div>";
      });
      h += "</div></div>";

      h += '<div class="card"><div class="between mb"><div class="sm b">🖼 عکس و ویدیوی آپلودشده</div>' +
        '<span class="chip cy">' + fa(sc.media.length) + "</span></div>";
      if (sc.media.length) {
        var list = v.showAll ? sc.media : sc.media.slice(0, 40);
        h += '<div class="ovMediaGrid">';
        list.forEach(function (m) {
          var isVideo = /^video\//i.test(m.mime);
          h += '<div class="ovMedia">' +
            '<div class="ovThumb">' + (isVideo
              ? '<video src="' + esc(m.src) + '" muted preload="metadata"></video>'
              : '<img src="' + esc(m.src) + '" alt="" loading="lazy">') + "</div>" +
            '<div class="grow"><div class="s">' + fmtBytes(m.size) + " • " + esc(m.mime) + "</div>" +
            '<div class="p" title="' + esc(m.path) + '">' + esc(m.path) + "</div></div>" +
            '<button class="btn d mini" type="button" data-ovdelmedia="' + esc(m.path) + '" data-ovlabel="' + esc(m.mime) + '">حذف</button></div>';
        });
        h += "</div>";
        if (sc.media.length > 40) {
          h += '<button class="btn mini mt" type="button" data-ovmediaall="1">' +
            (v.showAll ? "نمایش کمتر" : "نمایش همه (" + fa(sc.media.length) + ")") + "</button>";
        }
      } else {
        h += '<div class="empty">عکس یا ویدیوی حجیمی پیدا نشد ✅</div>';
      }
      h += "</div>";

      if (sc.errors.length) {
        h += '<div class="card ovDanger"><div class="sm b mb">⚠️ بخش‌هایی که خوانده نشد</div><div class="ovErr">' +
          sc.errors.slice(0, 12).map(esc).join("<br>") + "</div></div>";
      }
    }

    /* Storage */
    var st = v.storage;
    h += '<div class="card"><div class="between mb"><div><div class="sm b">🗄 Firebase Storage</div>' +
      '<div class="ovNote">ویدیوها و فایل‌های استوریج (مثلاً پوشهٔ cinema). اگر قوانین اجازه دهند لیست می‌شود.</div></div>' +
      '<span class="chip">' + (st.files ? fa(st.files.length) + " فایل" : "اسکن نشده") + "</span></div>" +
      '<div class="row" style="gap:6px"><input class="inp" id="ovStoreFolder" value="' + esc(st.folder) + '" placeholder="cinema" dir="ltr" maxlength="80">' +
      '<button class="btn p mini" type="button" data-ovstorage' + (st.busy ? " disabled" : "") + ">" +
      (st.busy ? "…" : "لیست فایل‌ها") + "</button></div>";
    if (st.err) h += '<div class="ovErr mt">' + esc(st.err) + "</div>";
    if (st.files && st.files.length) {
      h += '<div class="ovTable mt">';
      st.files.slice(0, 80).forEach(function (f) {
        h += '<div class="ovRow"><div class="grow"><b>' + esc(f.name) + "</b>" +
          '<div class="p">' + esc(f.path) + "</div></div>" +
          '<div class="n">' + fmtBytes(f.size) + "</div>" +
          '<button class="btn mini" type="button" data-ovstoreopen="' + esc(f.path) + '">باز کردن</button>' +
          '<button class="btn d mini" type="button" data-ovstoredel="' + esc(f.path) + '">حذف</button></div>';
      });
      h += "</div>";
      if (st.files.length > 80) h += '<div class="ovNote mt">فقط ۸۰ فایل اول نمایش داده شد.</div>';
    }
    if (st.files && st.files.length === 0 && !st.err) h += '<div class="empty mt">فایلی نیست</div>';
    h += '<div class="ovInputs mt"><input class="inp" id="ovStorePath" dir="ltr" maxlength="250" placeholder="cinema/…">' +
      '<button class="btn d mini" type="button" data-ovstorepathdel="1">حذف با مسیر</button></div>' +
      '<div class="ovNote mt">اگر قوانین Storage اجازهٔ لیست نداد، مسیر دقیق فایل را وارد کن و مستقیم حذف کن.</div></div>';

    /* Cleanup */
    h += '<div class="card"><div class="sm b mb">🧹 پاک‌سازی سریع</div>' +
      '<div class="ovNote mb">فقط موارد قدیمی‌تر از ' + fa(CLEAN_DAYS) + " روز و بسته/رسیدگی‌شده حذف می‌شوند. قبل از حذف تعداد نشان داده می‌شود.</div>" +
      '<div class="row" style="gap:6px;flex-wrap:wrap">' +
      '<button class="btn mini" type="button" data-ovclean="logs">🧾 لاگ قدیمی</button>' +
      '<button class="btn mini" type="button" data-ovclean="tickets">🎫 تیکت بسته</button>' +
      '<button class="btn mini" type="button" data-ovclean="prem">💎 درخواست پرمیوم</button>' +
      '<button class="btn mini" type="button" data-ovclean="rejected">📣 کمپین ردشده</button>' +
      '<button class="btn mini" type="button" data-ovclean="notifs">🔔 اعلان خوانده‌شده</button>' +
      "</div></div>";

    h += "</div>";
    return h;
  }

  function kpi(v, l) {
    return '<div class="ovKpi"><b>' + v + "</b><span>" + l + "</span></div>";
  }

  /* ── ۵. مدیریت کاربر ────────────────────────────────────── */
  function usersArr() {
    return Object.keys(R.USERS || {}).map(function (k) {
      var u = R.USERS[k] || {}; u.uid = k; return u;
    }).sort(function (a, b) { return (b.joined || 0) - (a.joined || 0); });
  }
  function filteredUsers() {
    var q = (S.manage.uq || "").toLowerCase();
    return usersArr().filter(function (u) {
      if (!q) return true;
      return (u.name || "").toLowerCase().indexOf(q) > -1 ||
        (u.email || "").toLowerCase().indexOf(q) > -1 ||
        (u.title || "").toLowerCase().indexOf(q) > -1;
    });
  }
  function selectedUser() {
    var uid = S.manage.sel;
    if (!uid) return null;
    var u = (R.USERS || {})[uid];
    if (!u) return null;
    u.uid = uid;
    return u;
  }
  function fillSelect() {
    var sel = el("ovUserSel");
    if (!sel) return;
    var arr = filteredUsers();
    if (!S.manage.sel && arr.length) S.manage.sel = arr[0].uid;
    var found = false;
    sel.innerHTML = arr.map(function (u) {
      var on = u.uid === S.manage.sel;
      if (on) found = true;
      return '<option value="' + esc(u.uid) + '"' + (on ? " selected" : "") + ">" +
        esc(u.name || "کاربر") + " — " + esc(roleFa(u.role)) + (u.prem ? " 💎" : "") + "</option>";
    }).join("");
    if (!found && arr.length) {
      S.manage.sel = arr[0].uid;
      sel.value = arr[0].uid;
    }
  }
  function roleFa(r) {
    try { return R.roleFa ? R.roleFa(r) : (r || "کاربر"); } catch (e) { return r || "کاربر"; }
  }

  function manageHTML() {
    var arr = filteredUsers();
    if (!S.manage.sel && arr.length) S.manage.sel = arr[0].uid;
    var u = selectedUser();
    var h = '<div class="ovWrap">';

    h += '<div class="card"><div class="between mb"><div><b>🎛 مدیریت کاربر</b>' +
      '<div class="ovNote">یک کاربر را انتخاب کن؛ نقش و عنوان بده، پرمیوم را روشن/خاموش کن یا سوال دوگزینه‌ای بپرس.</div></div>' +
      '<span class="chip cy">' + fa(arr.length) + " کاربر</span></div>" +
      '<input class="inp" id="ovUq" placeholder="جستجوی نام، ایمیل یا عنوان…" value="' + esc(S.manage.uq) + '">' +
      '<select class="sel mt" id="ovUserSel" size="6" style="width:100%">' +
      (arr.length ? "" : '<option>کاربری پیدا نشد</option>') + "</select></div>";

    if (!u) {
      h += '<div class="empty">برای شروع یک کاربر انتخاب کن</div>';
      return h + "</div>";
    }

    var me = u.uid === R.ME;
    h += '<div class="card"><div class="row">' + userAv(u.uid) +
      '<div class="grow" style="min-width:0"><div class="row w" style="gap:5px"><b class="sm">' + esc(u.name || "کاربر") + "</b>" +
      '<span class="chip" style="padding:1px 7px;font-size:9.5px">' + esc(roleFa(u.role)) + "</span>" +
      (u.prem ? '<span class="chip gd" style="padding:1px 7px;font-size:9.5px">💎 پرمیوم</span>' : "") +
      (u.banned ? '<span class="chip bad" style="padding:1px 7px;font-size:9.5px">مسدود</span>' : "") +
      (u.title ? '<span class="chip gd" style="padding:1px 7px;font-size:9.5px">🏷 ' + esc(u.title) + "</span>" : "") +
      "</div>" +
      '<div class="xs mut ellip" dir="ltr">' + esc(u.email || "—") + "</div>" +
      '<div class="xs mut">سطح ' + fa(R.level ? R.level(u.xp || 0) : 1) + " • " + fa(u.xp || 0) + " XP • عضو از " + esc(when(u.joined)) + "</div></div>" +
      '<button class="btn mini" type="button" data-ovdm="' + esc(u.uid) + '">💬</button></div>' +
      '<div class="row w mt" style="gap:6px">' +
      (me ? "" :
        '<button class="btn ' + (u.role === "admin" ? "p" : "") + ' mini" type="button" data-ovrole="' + esc(u.uid) + ':admin">مدیر</button>' +
        '<button class="btn ' + (u.role === "staff" ? "p" : "") + ' mini" type="button" data-ovrole="' + esc(u.uid) + ':staff">کارمند</button>' +
        '<button class="btn ' + (!u.role || u.role === "user" ? "p" : "") + ' mini" type="button" data-ovrole="' + esc(u.uid) + ':user">کاربر عادی</button>') +
      '<button class="btn ' + (u.prem ? "d" : "gd") + ' mini" type="button" data-ovprem="' + esc(u.uid) + '">' +
      (u.prem ? "غیرفعال کردن پرمیوم" : "فعال کردن پرمیوم 💎") + "</button>" +
      '<button class="btn mini" type="button" data-ovban="' + esc(u.uid) + '">' + (u.banned ? "رفع مسدودی" : "مسدود") + "</button>" +
      "</div>" +
      '<div class="ovInputs"><input class="inp" id="ovTitle" maxlength="24" placeholder="عنوان اختصاصی (مثلاً: مدیر بازار)" value="' + esc(S.manage.title || u.title || "") + '">' +
      '<button class="btn p mini" type="button" data-ovtitlesave="1">🏷 ذخیره عنوان</button></div></div>';

    h += '<div class="card"><div class="sm b mb">❓ سوال دوگزینه‌ای</div>' +
      '<div class="ovNote mb">سوال برای همین کاربر ارسال می‌شود و او باید یکی از دو گزینه را انتخاب کند؛ پاسخ در همین صفحه ثبت می‌شود.</div>' +
      '<input class="inp full" id="ovQText" maxlength="140" placeholder="مثلاً: برای مدیر شدن آماده‌ای؟" value="' + esc(S.manage.q) + '">' +
      '<div class="ovInputs"><input class="inp" id="ovQA" maxlength="40" placeholder="گزینهٔ ۱" value="' + esc(S.manage.a) + '">' +
      '<input class="inp" id="ovQB" maxlength="40" placeholder="گزینهٔ ۲" value="' + esc(S.manage.b) + '"></div>' +
      '<button class="btn p mini mt" type="button" data-ovqsend="1">📨 ارسال سوال برای ' + esc(u.name || "کاربر") + "</button></div>";

    var qs = allQuestions().filter(function (x) { return x.uid === u.uid; }).slice(0, 12);
    h += '<div class="card"><div class="between mb"><div class="sm b">📥 پاسخ‌های همین کاربر</div><span class="chip">' + fa(qs.length) + "</span></div>" +
      (qs.length ? qs.map(qRow).join("") : '<div class="empty">هنوز سوالی برای این کاربر ثبت نشده</div>') + "</div>";

    if (!me) h += '<div class="ovNote center">برای تغییر نقش خودت از مالک استفاده کن 👑</div>';
    h += "</div>";
    return h;
  }

  function allQuestions() {
    var out = [];
    Object.keys(S.q.all || {}).forEach(function (uid) {
      Object.keys(S.q.all[uid] || {}).forEach(function (id) {
        var x = S.q.all[uid][id] || {};
        out.push({
          uid: uid, id: id, q: x.q || "", a: x.a || "", b: x.b || "",
          st: x.st || "open", ans: x.ans || "", at: x.at || 0, t: x.t || 0
        });
      });
    });
    return out.sort(function (a, b) { return (b.t || 0) - (a.t || 0); });
  }

  function qRow(x) {
    var open = x.st !== "answered";
    return '<div class="ovQ mb"><div class="between"><div class="qq">' + esc(x.q) + "</div>" +
      '<span class="chip ' + (open ? "gd" : "ok") + '">' + (open ? "در انتظار" : "پاسخ داده شد") + "</span></div>" +
      '<div class="xs mut">' + esc(userName(x.uid)) + " • " + esc(when(x.t)) +
      (x.at ? " • پاسخ " + esc(when(x.at)) : "") + "</div>" +
      '<div class="opts"><span class="btn mini">۱) ' + esc(x.a) + '</span><span class="btn mini">۲) ' + esc(x.b) + "</span></div>" +
      (x.ans ? '<div class="sm mt cy">انتخاب کاربر: <b>' + esc(x.ans) + "</b></div>" : "") +
      '<button class="btn d mini mt" type="button" data-ovqdel="' + esc(x.uid + ":" + x.id) + '">حذف سوال</button></div>';
  }

  function sendQuestion() {
    if (!isOwner()) return;
    var u = selectedUser();
    if (!u) return toast("اول یک کاربر انتخاب کن", "err");
    if (u.uid === R.ME) return toast("برای خودت سوال نفرست 🙂", "err");
    var q = clean(S.manage.q, 140), a = clean(S.manage.a, 40), b = clean(S.manage.b, 40);
    if (q.length < 4) return toast("متن سوال خیلی کوتاه است", "err");
    if (!a || !b) return toast("هر دو گزینه را بنویس", "err");
    if (a === b) return toast("دو گزینه نباید یکسان باشند", "err");
    if (!window.confirm("سوال برای «" + (u.name || "کاربر") + "» ارسال شود؟\n\n" + q + "\n۱) " + a + "\n۲) " + b)) return;
    if (!R.ME || !R.db) return toast("اتصال برقرار نیست", "err");
    var obj = {
      q: q, a: a, b: b, st: "open", by: R.ME || "",
      byName: (R.USER && R.USER.name) || "مالک",
      to: u.uid, toName: u.name || "", t: Date.now()
    };
    R.add("userQuestions/" + u.uid, obj).then(function () {
      try { if (R.notify) R.notify(u.uid, "❓ مالک از تو یک سوال دوگزینه‌ای دارد", "info", "question"); } catch (e) {}
      log("question", { uid: u.uid, q: q });
      S.manage.q = ""; S.manage.a = ""; S.manage.b = "";
      toast("سوال برای " + (u.name || "کاربر") + " رفت ✅", "ok");
      refresh();
    }).catch(function (e) { toast("ارسال نشد: " + ((e && e.message) || ""), "err"); });
  }

  function saveTitle() {
    if (!isOwner()) return;
    var u = selectedUser();
    if (!u) return;
    var v = clean(S.manage.title || (el("ovTitle") && el("ovTitle").value), 24);
    if (R.db) {
      R.upd("users/" + u.uid, { title: v }).then(function () {
        if (R.USERS[u.uid]) R.USERS[u.uid].title = v;
        if (R.USER && u.uid === R.ME) R.USER.title = v;
        delete S.profTitles[u.uid];
        try { if (R.notify) R.notify(u.uid, v ? "🏷 عنوانت شد: " + v : "عنوانت برداشته شد", "info", "profile"); } catch (e) {}
        log("title", { uid: u.uid, title: v });
        toast("عنوان ذخیره شد ✅", "ok");
        refresh();
      }).catch(function (e) { toast("نشد: " + ((e && e.message) || ""), "err"); });
    }
  }

  /* ── ۶. سوال برای کاربر عادی ────────────────────────────── */
  function qModal() {
    if (el("ovQMod")) return el("ovQMod");
    var d = document.createElement("div");
    d.id = "ovQMod";
    d.className = "ovQMod";
    d.innerHTML = '<div class="ovQCard"><div class="k">❓ سوال از طرف مالک رونین</div>' +
      '<h3 id="ovQTextShow">…</h3>' +
      '<button class="opt" type="button" id="ovQOptA" data-ovans="a">—</button>' +
      '<button class="opt" type="button" id="ovQOptB" data-ovans="b">—</button>' +
      '<button class="later" type="button" data-ovqlater="1">بعداً پاسخ می‌دهم</button></div>';
    document.body.appendChild(d);
    return d;
  }
  function qBadge() {
    if (el("ovQBadge")) return el("ovQBadge");
    var b = document.createElement("button");
    b.type = "button";
    b.id = "ovQBadge";
    b.className = "ovQBadge";
    b.setAttribute("data-ovqbadge", "1");
    document.body.appendChild(b);
    return b;
  }
  function openQuestionCount() {
    var v = S.q.mine || {};
    return Object.keys(v).filter(function (k) { return v[k] && v[k].st !== "answered"; }).length;
  }
  function maybeShowQuestion(force) {
    if (isOwner()) return;
    qBadge();
    var n = openQuestionCount();
    var b = el("ovQBadge");
    if (b) {
      b.classList.toggle("on", n > 0 && !S.q.open);
      b.textContent = "❓ سوال مالک (" + fa(n) + ")";
    }
    if (!n) { hideQ(); return; }
    var v = S.q.mine || {};
    var ids = Object.keys(v).filter(function (k) {
      return v[k] && v[k].st !== "answered" && (force || !S.q.hidden[k]);
    }).sort(function (a, b2) { return (v[b2].t || 0) - (v[a].t || 0); });
    var id = ids[0];
    if (!id) return;
    showQ(id, v[id]);
  }
  function showQ(id, q) {
    if (!q) return;
    S.q.open = id;
    var d = qModal();
    d.classList.add("on");
    if (el("ovQTextShow")) el("ovQTextShow").textContent = q.q || "";
    if (el("ovQOptA")) el("ovQOptA").textContent = "۱) " + (q.a || "بله");
    if (el("ovQOptB")) el("ovQOptB").textContent = "۲) " + (q.b || "خیر");
    var b = el("ovQBadge"); if (b) b.classList.remove("on");
  }
  function hideQ() {
    S.q.open = null;
    var d = el("ovQMod"); if (d) d.classList.remove("on");
  }
  function answerQ(key) {
    var id = S.q.open;
    if (!id || !R.ME || !R.db) return;
    var q = (S.q.mine || {})[id] || {};
    var label = key === "b" ? (q.b || "خیر") : (q.a || "بله");
    R.upd("userQuestions/" + R.ME + "/" + id, {
      st: "answered", ans: label, ansKey: key, at: Date.now()
    }).then(function () {
      try { R.notify(R.OWNER_UID, "✅ " + ((R.USER && R.USER.name) || "کاربر") + " پاسخ داد: " + label, "info", "owner"); } catch (e) {}
      toast("پاسخ ثبت شد ✅", "ok");
      S.q.hidden[id] = true;
      hideQ();
      S.q.mine[id] = Object.assign({}, q, { st: "answered", ans: label, at: Date.now() });
      setTimeout(maybeShowQuestion, 450);
    }).catch(function (e) { toast("ثبت نشد: " + ((e && e.message) || ""), "err"); });
  }

  function startWatchers() {
    stopWatchers();
    if (!R.ME) return;
    S.watchKey = R.ME + ":" + (isOwner() ? "o" : "u");
    if (isOwner()) {
      S.offs.push(R.watch("userQuestions", function (v) {
        S.q.all = v || {};
        if (R.ownerTab === "manage") refresh();
      }));
      S.offs.push(R.watch("campaigns", function (v) {
        S.camps = v || {};
        renderCampaignBox();
        if (R.ownerTab === "campaigns") refresh();
      }));
    } else {
      S.offs.push(R.watch("userQuestions/" + R.ME, function (v) {
        S.q.mine = v || {};
        maybeShowQuestion();
      }));
      S.offs.push(R.watch("campaigns", function (v) {
        S.camps = v || {};
        renderCampaignBox();
      }));
    }
  }
  function stopWatchers() {
    (S.offs || []).forEach(function (off) { try { off(); } catch (e) {} });
    S.offs = [];
    S.watchKey = "";
  }

  /* ── ۷. کمپین تبلیغات ───────────────────────────────────── */
  function injectCampaignBox() {
    var sec = el("sec-ads");
    if (!sec || el("ovCampBox")) return;
    var anchor = sec.querySelector(".adsWorkspace") || sec.querySelector(".adsHero");
    var box = document.createElement("div");
    box.id = "ovCampBox";
    box.className = "card ovCampBox hide";
    box.setAttribute("data-auth", "");
    box.innerHTML =
      '<div class="between mb"><div><b>📣 ثبت کمپین تبلیغاتی</b>' +
      '<div class="ovNote">این فرم واقعی است: درخواست در دیتابیس ذخیره و برای مالک جهت تایید ارسال می‌شود.</div></div>' +
      '<span class="chip cy">در انتظار تایید مالک</span></div>' +
      '<div class="ovInputs">' +
      '<input class="inp full" id="ovCampTitle" maxlength="70" placeholder="عنوان کمپین">' +
      '<select class="sel" id="ovCampType"><option value="banner">بنر</option><option value="video">ویدیو</option></select>' +
      '<input class="inp" id="ovCampBudget" maxlength="20" placeholder="بودجه (اختیاری)">' +
      '<input class="inp" id="ovCampDays" maxlength="4" placeholder="مدت / روز (اختیاری)">' +
      '<input class="inp" id="ovCampContact" maxlength="60" placeholder="راه ارتباطی">' +
      '<input class="inp" id="ovCampLink" dir="ltr" maxlength="300" placeholder="لینک مقصد https://…">' +
      '<input class="inp" id="ovCampImg" dir="ltr" maxlength="300" placeholder="لینک بنر/پوستر (اختیاری)">' +
      '<textarea class="area full" id="ovCampDesc" maxlength="400" placeholder="توضیح کوتاه کمپین…"></textarea>' +
      "</div>" +
      '<div class="row mt" style="gap:8px;flex-wrap:wrap"><button class="btn p mini" type="button" data-ovcampsend="1">📨 ارسال برای تایید</button>' +
      '<span class="xs mut">پس از تایید مالک، کمپین در همین بخش نمایش داده می‌شود.</span></div>' +
      '<div id="ovCampMine" class="col mt"></div>';
    if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(box, anchor.nextSibling);
    else sec.appendChild(box);

    /* لیست کمپین‌های فعال عمومی است و نباید داخل باکس data-auth برود */
    if (!el("ovCampLiveCard")) {
      var lc = document.createElement("div");
      lc.id = "ovCampLiveCard";
      lc.className = "card hide";
      lc.innerHTML = '<div class="sm b mb">🎬 کمپین‌های فعال</div><div id="ovCampLive"></div>';
      if (box.parentNode) box.parentNode.insertBefore(lc, box.nextSibling);
    }
    try { if (R.paintUser) R.paintUser(); } catch (e) {}
    renderCampaignBox();
  }

  function campList() {
    return Object.keys(S.camps || {}).map(function (k) {
      var c = S.camps[k] || {}; c.id = k; return c;
    }).sort(function (a, b) { return (b.t || 0) - (a.t || 0); });
  }
  function campsOfMine() {
    return campList().filter(function (c) { return c.uid === R.ME; });
  }
  function renderCampaignBox() {
    var mine = el("ovCampMine");
    if (mine) {
      var arr = campsOfMine();
      mine.innerHTML = arr.length ? '<div class="sm b mb">📌 کمپین‌های من</div>' + arr.map(function (c) {
        var st = c.st === "live" ? '<span class="chip ok">تایید شد</span>' :
          c.st === "rejected" ? '<span class="chip bad">رد شد</span>' : '<span class="chip gd">در انتظار</span>';
        return '<div class="ovRow"><div class="grow"><b>' + esc(c.title) + "</b><div class=\"p\">" +
          esc(c.type === "video" ? "ویدیو" : "بنر") + " • " + esc(when(c.t)) + "</div></div>" + st + "</div>";
      }).join("") : "";
    }
    var live = el("ovCampLive"), lc = el("ovCampLiveCard");
    if (live) {
      var l = campList().filter(function (c) { return c.st === "live"; });
      if (lc) lc.classList.toggle("hide", !l.length);
      live.innerHTML = l.length ? l.slice(0, 6).map(function (c) {
        var link = safeHttp(c.link), img = safeHttp(c.img);
        return '<div class="ovRow"><div class="ovThumb">' +
          (img ? '<img src="' + esc(img) + '" alt="" loading="lazy">' : "📣") +
          '</div><div class="grow"><b>' + esc(c.title) + '</b><div class="p">' +
          esc(c.desc || "") + "</div></div>" +
          (link ? '<a class="btn mini" href="' + esc(link) + '" target="_blank" rel="noopener noreferrer">مشاهده</a>' : "") +
          "</div>";
      }).join("") : "";
    }
  }

  function submitCampaign() {
    if (!R.ME) return R.needLogin ? R.needLogin("ثبت کمپین") : toast("وارد شو", "err");
    var title = clean((el("ovCampTitle") || {}).value, 70);
    var type = clean((el("ovCampType") || {}).value, 10) === "video" ? "video" : "banner";
    var link = clean((el("ovCampLink") || {}).value, 300);
    var contact = clean((el("ovCampContact") || {}).value, 60);
    var budget = clean((el("ovCampBudget") || {}).value, 20);
    var days = clean((el("ovCampDays") || {}).value, 4);
    var img = clean((el("ovCampImg") || {}).value, 300);
    var desc = clean((el("ovCampDesc") || {}).value, 400);
    if (title.length < 3) return toast("عنوان کمپین را بنویس", "err");
    if (link && !safeHttp(link)) return toast("لینک باید با http شروع شود", "err");
    if (!contact) return toast("راه ارتباطی را بنویس", "err");
    R.add("campaigns", {
      title: title, type: type, link: safeHttp(link), img: safeHttp(img),
      contact: contact, budget: budget, days: days, desc: desc,
      uid: R.ME, name: (R.USER && R.USER.name) || "", st: "pending", t: Date.now()
    }).then(function () {
      try { if (R.notify) R.notify(R.OWNER_UID, "📣 کمپین جدید: " + title, "mod", "campaigns"); } catch (e) {}
      ["ovCampTitle", "ovCampLink", "ovCampContact", "ovCampBudget", "ovCampDays", "ovCampImg", "ovCampDesc"].forEach(function (id) {
        var e = el(id); if (e) e.value = "";
      });
      toast("کمپین ثبت شد و برای تایید مالک رفت ✅", "ok");
    }).catch(function (e) { toast("ثبت نشد: " + ((e && e.message) || ""), "err"); });
  }

  function campaignsHTML() {
    var arr = campList();
    var pending = arr.filter(function (c) { return c.st !== "live" && c.st !== "rejected"; });
    var live = arr.filter(function (c) { return c.st === "live"; });
    var rej = arr.filter(function (c) { return c.st === "rejected"; });
    var h = '<div class="ovWrap"><div class="card"><div class="between"><div><b>📣 کمپین‌های تبلیغاتی</b>' +
      '<div class="ovNote">درخواست‌های ثبت‌شده از فرم واقعی فروشگاه؛ تایید یا رد کن.</div></div>' +
      '<span class="chip cy">' + fa(pending.length) + " در انتظار</span></div></div>";
    h += '<div class="card"><div class="sm b mb">⏳ در انتظار تایید</div>' +
      (pending.length ? pending.map(function (c) {
        return '<div class="ovQ mb"><div class="between"><div class="qq">' + esc(c.title) + "</div>" +
          '<span class="chip gd">' + esc(c.type === "video" ? "ویدیو" : "بنر") + "</span></div>" +
          '<div class="xs mut">' + esc(c.name || userName(c.uid)) + " • " + esc(when(c.t)) +
          (c.budget ? " • بودجه " + esc(c.budget) : "") + (c.days ? " • " + fa(c.days) + " روز" : "") + "</div>" +
          (c.desc ? '<div class="sm mt">' + esc(c.desc) + "</div>" : "") +
          '<div class="xs cy mt" dir="ltr">' + esc(c.contact || "") + (c.link ? " • " + esc(c.link) : "") + "</div>" +
          '<div class="row w mt" style="gap:6px"><button class="btn ok mini" type="button" data-ovcampap="' + esc(c.id) + '">✅ تایید</button>' +
          '<button class="btn d mini" type="button" data-ovcamprj="' + esc(c.id) + '">❌ رد</button>' +
          '<button class="btn mini" type="button" data-ovcampdel="' + esc(c.id) + '">🗑 حذف</button></div></div>';
      }).join("") : '<div class="empty">کمپین در انتظاری نیست ✅</div>') + "</div>";
    h += '<div class="card"><div class="sm b mb">✅ فعال</div>' +
      (live.length ? live.slice(0, 20).map(function (c) {
        return '<div class="ovRow"><div class="grow"><b>' + esc(c.title) + '</b><div class="p">' +
          esc(c.name || userName(c.uid)) + " • " + esc(when(c.t)) + "</div></div>" +
          '<button class="btn d mini" type="button" data-ovcampdel="' + esc(c.id) + '">حذف</button></div>';
      }).join("") : '<div class="empty">هنوز کمپینی فعال نیست</div>') + "</div>";
    if (rej.length) {
      h += '<div class="card"><div class="sm b mb">❌ ردشده</div>' + rej.slice(0, 10).map(function (c) {
        return '<div class="ovRow"><div class="grow"><b>' + esc(c.title) + '</b><div class="p">' + esc(when(c.t)) + "</div></div>" +
          '<button class="btn mini" type="button" data-ovcampap="' + esc(c.id) + '">تایید</button>' +
          '<button class="btn d mini" type="button" data-ovcampdel="' + esc(c.id) + '">حذف</button></div>';
      }).join("") + "</div>";
    }
    h += "</div>";
    return h;
  }

  function campAction(id, act) {
    if (!id || !isOwner() || !R.db) return;
    var c = (S.camps || {})[id] || {};
    if (act === "del") {
      if (!window.confirm("کمپین حذف شود؟")) return;
      R.db.ref("campaigns/" + id).remove().then(function () { toast("حذف شد", "ok"); log("campDel", { id: id }); });
      return;
    }
    var st = act === "ap" ? "live" : "rejected";
    R.upd("campaigns/" + id, { st: st, at: Date.now() }).then(function () {
      try {
        if (c.uid && R.notify) R.notify(c.uid, st === "live" ? "✅ کمپین «" + (c.title || "") + "» تایید شد" : "❌ کمپین «" + (c.title || "") + "» رد شد", "info", "ads");
      } catch (e) {}
      log("camp" + act, { id: id });
      toast(st === "live" ? "کمپین فعال شد ✅" : "کمپین رد شد", "ok");
    }).catch(function (e) { toast("نشد: " + ((e && e.message) || ""), "err"); });
  }

  /* ── ۸. عنوان در پروفایل ────────────────────────────────── */
  function addTitleChip(row, title, uid) {
    var old = row.querySelector(".ovTitleChip");
    if (old && old.getAttribute("data-uid") === uid) return;
    if (old) old.remove();
    var c = document.createElement("span");
    c.className = "chip gd ovTitleChip";
    c.setAttribute("data-uid", uid);
    c.textContent = "🏷 " + title;
    row.appendChild(c);
  }

  function decorateProfileTitle() {
    var uid = R.VIEW || R.ME;
    if (!uid) return;
    var box = el("profBox");
    if (!box) return;
    var row = box.querySelector(".prof .pinfo .row.w");
    if (!row) return;
    var old = row.querySelector(".ovTitleChip");
    if (old && old.getAttribute("data-uid") === uid) return;
    if (old) old.remove();
    var u = (R.USER && uid === R.ME) ? R.USER : (R.USERS || {})[uid];
    if (u && u.title) return addTitleChip(row, u.title, uid);
    if (S.profTitles[uid]) return addTitleChip(row, S.profTitles[uid], uid);
    if (S.profTitles[uid] === "") return; /* قبلاً خوانده شده و عنوانی ندارد */
    S.profTitles[uid] = "";
    R.get("users/" + uid).then(function (x) {
      if (!x || !x.title) return;
      S.profTitles[uid] = x.title;
      if ((R.VIEW || R.ME) === uid) decorateProfileTitle();
    }).catch(function () {});
  }
  var profBoxWatch = false;
  function watchProfile() {
    var box = el("profBox");
    if (!box || profBoxWatch || !window.MutationObserver) return;
    profBoxWatch = true;
    new MutationObserver(function () { setTimeout(decorateProfileTitle, 0); })
      .observe(box, { childList: true, subtree: true });
  }

  /* ── ۹. رویدادها ────────────────────────────────────────── */
  function onClick(e) {
    var t = e.target;
    if (!t || !t.closest) return;

    var tab = t.closest("[data-ovnewtab]");
    if (tab) {
      e.preventDefault();
      var key = tab.getAttribute("data-otab");
      var bodyEl = el("ownerBody");
      if (R.ownerTab === key && bodyEl && bodyEl.querySelector(".ovWrap")) return;
      R.ownerTab = key;
      markTabs();
      R.renderOwner();
      return;
    }

    var b;
    if ((b = t.closest("[data-ovscan]"))) { e.preventDefault(); return scanAll(); }
    if ((b = t.closest("[data-ovmediaall]"))) {
      e.preventDefault();
      S.vault.showAll = !S.vault.showAll;
      return refresh();
    }
    if ((b = t.closest("[data-ovdelmedia]"))) {
      e.preventDefault();
      return delPath(b.getAttribute("data-ovdelmedia"), b.getAttribute("data-ovlabel") || "فایل");
    }
    if ((b = t.closest("[data-ovdelroot]"))) {
      e.preventDefault();
      return delRoot(b.getAttribute("data-ovdelroot"));
    }
    if ((b = t.closest("[data-ovclean]"))) {
      e.preventDefault();
      return cleanNow(b.getAttribute("data-ovclean"));
    }
    if ((b = t.closest("[data-ovstorage]"))) { e.preventDefault(); return listStorage(); }
    if ((b = t.closest("[data-ovstoreopen]"))) { e.preventDefault(); return openStorage(b.getAttribute("data-ovstoreopen")); }
    if ((b = t.closest("[data-ovstoredel]"))) { e.preventDefault(); return delStorage(b.getAttribute("data-ovstoredel")); }
    if ((b = t.closest("[data-ovstorepathdel]"))) {
      e.preventDefault();
      var pe = el("ovStorePath");
      var sp = String((pe && pe.value) || "").trim().replace(/^\/+|\/+$/g, "");
      if (!sp) return toast("مسیر فایل را وارد کن", "err");
      return delStorage(sp);
    }

    if ((b = t.closest("[data-ovrole]"))) {
      e.preventDefault();
      var a = b.getAttribute("data-ovrole").split(":");
      if (R.setRole) R.setRole(a[0], a[1]);
      return;
    }
    if ((b = t.closest("[data-ovprem]"))) {
      e.preventDefault();
      if (R.togglePrem) R.togglePrem(b.getAttribute("data-ovprem"));
      return;
    }
    if ((b = t.closest("[data-ovban]"))) {
      e.preventDefault();
      if (R.toggleBan) R.toggleBan(b.getAttribute("data-ovban"));
      return;
    }
    if ((b = t.closest("[data-ovtitlesave]"))) { e.preventDefault(); return saveTitle(); }
    if ((b = t.closest("[data-ovqsend]"))) { e.preventDefault(); return sendQuestion(); }
    if ((b = t.closest("[data-ovqdel]"))) {
      e.preventDefault();
      var p = b.getAttribute("data-ovqdel").split(":");
      if (!window.confirm("این سوال حذف شود؟")) return;
      return R.db.ref("userQuestions/" + p[0] + "/" + p[1]).remove().then(function () {
        toast("سوال حذف شد", "ok");
        if (S.q.all[p[0]]) delete S.q.all[p[0]][p[1]];
        refresh();
      }).catch(function (err) { toast("نشد: " + ((err && err.message) || ""), "err"); });
    }
    if ((b = t.closest("[data-ovdm]"))) {
      e.preventDefault();
      if (R.dm) { try { R.dm(b.getAttribute("data-ovdm")); } catch (err) {} }
      return;
    }
    if ((b = t.closest("[data-ovcampsend]"))) { e.preventDefault(); return submitCampaign(); }
    if ((b = t.closest("[data-ovcampap]"))) { e.preventDefault(); return campAction(b.getAttribute("data-ovcampap"), "ap"); }
    if ((b = t.closest("[data-ovcamprj]"))) { e.preventDefault(); return campAction(b.getAttribute("data-ovcamprj"), "rj"); }
    if ((b = t.closest("[data-ovcampdel]"))) { e.preventDefault(); return campAction(b.getAttribute("data-ovcampdel"), "del"); }

    if ((b = t.closest("[data-ovans]"))) { e.preventDefault(); return answerQ(b.getAttribute("data-ovans")); }
    if ((b = t.closest("[data-ovqlater]"))) {
      e.preventDefault();
      if (S.q.open) S.q.hidden[S.q.open] = true;
      hideQ();
      maybeShowQuestion();
      return;
    }
    if ((b = t.closest("[data-ovqbadge]"))) { e.preventDefault(); return maybeShowQuestion(true); }
  }

  function onInput(e) {
    var id = e.target && e.target.id;
    if (!id) return;
    if (id === "ovUq") {
      S.manage.uq = e.target.value;
      fillSelect();
      return;
    }
    if (id === "ovUserSel") return;
    if (id === "ovTitle") { S.manage.title = e.target.value; return; }
    if (id === "ovQText") { S.manage.q = e.target.value; return; }
    if (id === "ovQA") { S.manage.a = e.target.value; return; }
    if (id === "ovQB") { S.manage.b = e.target.value; return; }
    if (id === "ovStoreFolder") { S.vault.storage.folder = e.target.value; return; }
  }

  function onChange(e) {
    var id = e.target && e.target.id;
    if (id === "ovUserSel") {
      S.manage.sel = e.target.value;
      S.manage.title = "";
      var u = selectedUser();
      S.manage.title = (u && u.title) || "";
      refresh();
    }
  }

  /* ── ۱۰. راه‌اندازی ─────────────────────────────────────── */
  function boot() {
    if (!window.R) return;
    css();
    ensureTabs();
    injectCampaignBox();
    watchProfile();
    decorateProfileTitle();
    if (R.ME && S.watchKey !== R.ME + ":" + (isOwner() ? "o" : "u")) startWatchers();
    if (isOwner() && el("sec-owner") && ["vault", "manage", "campaigns"].indexOf(R.ownerTab) >= 0) {
      try { R.renderOwner(); } catch (e) {}
    }
  }

  document.addEventListener("click", onClick);
  document.addEventListener("input", onInput);
  document.addEventListener("change", onChange);

  var in0 = R.onLogin;
  R.onLogin = function () {
    if (in0) { try { in0(); } catch (e) {} }
    setTimeout(function () {
      ensureTabs();
      injectCampaignBox();
      startWatchers();
      try { if (R.paintUser) R.paintUser(); } catch (e) {}
      if (isOwner() && ["vault", "manage", "campaigns"].indexOf(R.ownerTab) >= 0) {
        try { R.renderOwner(); } catch (e) {}
      }
    }, 400);
  };
  var out0 = R.onLogout;
  R.onLogout = function () {
    if (out0) { try { out0(); } catch (e) {} }
    stopWatchers();
    hideQ();
    var b = el("ovQBadge"); if (b) b.classList.remove("on");
    S.q = { all: {}, mine: {}, open: null, hidden: {} };
    S.manage.sel = "";
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  [600, 1500, 3000, 6000].forEach(function (ms) { setTimeout(boot, ms); });

  window.RoninVault = {
    state: S, scan: scanAll, listStorage: listStorage, refresh: refresh,
    sendQuestion: sendQuestion, answer: answerQ, campaigns: campAction
  };
})();
