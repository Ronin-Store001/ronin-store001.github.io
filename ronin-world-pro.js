/* ═══════════════════════════════════════════════════════════════
   RONIN STORE — WORLD PRO v1
   • یک هاب واحد برای «چت عمومی» و «گروه‌های چت» با سوییچ زنده
   • «دنیای من» به‌عنوان داشبورد شخصی: آمار، پست‌ها، آگهی‌ها، تریلر
   • استودیوی تم: تاریک / روشن / خودکار + چهار لهجهٔ رنگی
   • هیچ ID یا لیسنر قبلی حذف نمی‌شود؛ فقط پوسته و چیدمان ارتقا می‌یابد.
   ═══════════════════════════════════════════════════════════════ */
"use strict";
(function () {
  if (!window.R) return;
  if (R.__worldPro) return;
  R.__worldPro = true;

  var W = {
    chatTab: "public",
    tab: "overview",
    bulletins: {},
    bulWatch: false,
    groupsMounted: false
  };
  var MODE_LABEL = { dark: "تاریک", light: "روشن", auto: "خودکار" };

  function $(id) { return document.getElementById(id); }
  function esc(s) { return R.esc ? R.esc(s) : String(s == null ? "" : s); }
  function fa(n) { return R.fa ? R.fa(String(n)) : String(n); }
  function toast(m, k) { try { if (R.toast) R.toast(m, k || "ok"); } catch (e) {} }
  function num(n) { return Number(n) || 0; }
  function arrOf(obj, filter, sorter) {
    var a = Object.keys(obj || {}).map(function (k) {
      var x = obj[k] || {};
      x.id = k;
      return x;
    });
    if (filter) a = a.filter(filter);
    a.sort(sorter || function (a, b) { return (b.t || 0) - (a.t || 0); });
    return a;
  }
  function ytId(u) {
    u = String(u || "");
    var m = u.match(/(?:youtu\.be\/|[?&]v=|embed\/|shorts\/)([A-Za-z0-9_-]{6,})/);
    if (m) return m[1];
    return /^[A-Za-z0-9_-]{11}$/.test(u) ? u : "";
  }
  function myPosts() {
    return arrOf(R.POSTS, function (p) {
      return p.uid === R.ME && p.status !== "pending";
    });
  }
  function myAds() {
    return arrOf(R.PRODS, function (p) {
      return (p.sellerUid || p.uid) === R.ME;
    });
  }
  function levelOf(xp) {
    try { return R.level ? R.level(xp || 0) : Math.max(1, Math.floor(Math.sqrt((xp || 0) / 45)) + 1); }
    catch (e) { return 1; }
  }
  function xpInfo(xp) {
    var lv = levelOf(xp), lo = 45 * (lv - 1) * (lv - 1), hi = 45 * lv * lv;
    var pct = hi > lo ? Math.max(0, Math.min(100, Math.round(((xp || 0) - lo) * 100 / (hi - lo)))) : 0;
    return { lv: lv, pct: pct, next: Math.max(0, hi - (xp || 0)) };
  }
  function hourGreeting() {
    var h = new Date().getHours();
    if (h < 5) return "شب‌زنده‌داری";
    if (h < 12) return "صبح بخیر";
    if (h < 17) return "ظهر بخیر";
    if (h < 21) return "عصر بخیر";
    return "شب بخیر";
  }
  function avatarBig(u) {
    u = u || {};
    if (u.av) return '<span class="mwAv"><img src="' + esc(u.av) + '" alt=""></span>';
    var ini = String(u.name || "؟").trim().slice(0, 2) || "؟";
    return '<span class="mwAv mwAvIni">' + esc(ini) + "</span>";
  }
  function postHTML(p) {
    try {
      if (!R.postCard) return "";
      var out = R.postCard(p);
      if (!out) return "";
      return typeof out === "string" ? out : (out.outerHTML || "");
    } catch (e) { return ""; }
  }
  function adHTML(p) {
    try {
      if (!R.prodCard) return "";
      var out = R.prodCard(p);
      return typeof out === "string" ? out : (out.outerHTML || "");
    } catch (e) { return ""; }
  }

  /* ── ۱. هاب چت ───────────────────────────────────────────── */
  function buildChatHub() {
    var sec = $("sec-chat");
    if (!sec || $("chatHubStage")) return;
    var chat = sec.querySelector(".chat");
    if (!chat) return;

    var oldHead = null;
    for (var i = 0; i < sec.children.length; i++) {
      if (sec.children[i].classList && sec.children[i].classList.contains("head")) {
        oldHead = sec.children[i]; break;
      }
    }
    if (oldHead) oldHead.parentNode.removeChild(oldHead);

    var head = document.createElement("div");
    head.className = "hubHead";
    head.innerHTML =
      '<div class="hubHeadCopy">' +
        '<span class="hubKicker">RONIN LIVE / ONE ROOM</span>' +
        '<h2 class="hubTitle">چت و گروه‌ها</h2>' +
        '<p class="hubLead">از گفتگوی زندهٔ اتاق رونین تا اتاق‌های خصوصی گروه‌ها؛ همه اینجا، با یک کلیک.</p>' +
        '<div class="hubHeadMeta">' +
          '<span class="hubLive"><i></i><b data-online></b></span>' +
          '<span class="hubMetaDot">•</span>' +
          '<span id="hubGroupMeta">گروه‌ها در حال بارگذاری</span>' +
        '</div>' +
      '</div>' +
      '<div class="hubSwitch" role="tablist" aria-label="نوع چت">' +
        '<button type="button" class="hubTab on" data-chat-tab="public" role="tab" aria-selected="true">' +
          '<span class="hubTabIcon">💬</span><b>چت عمومی</b><small>اتاق رونین</small>' +
        '</button>' +
        '<button type="button" class="hubTab" data-chat-tab="groups" role="tab" aria-selected="false">' +
          '<span class="hubTabIcon">🏯</span><b>گروه‌ها</b><small id="hubGroupCount">در حال بارگذاری</small>' +
        '</button>' +
      '</div>';
    sec.insertBefore(head, sec.firstChild);

    var stage = document.createElement("div");
    stage.id = "chatHubStage";
    stage.className = "chatHubStage";

    var pub = document.createElement("div");
    pub.id = "chatPublicPane";
    pub.className = "chatPane";
    pub.appendChild(chat);

    var grp = document.createElement("div");
    grp.id = "chatGroupPane";
    grp.className = "chatPane hide";
    grp.innerHTML =
      '<div class="hubGroupHero">' +
        '<div><span class="hubKicker">GROUP ROOMS / RONIN</span>' +
          '<h3>اتاق‌های گروهی</h3>' +
          '<p>گروه بساز، عضو شو و با دوست‌هات در اتاق‌های خصوصی یا باز گفتگو کن.</p></div>' +
        '<div class="hubGroupSide">' +
          '<div class="hubGroupPeek"><b id="hubGroupCount2">۰</b><span>گروه فعال</span></div>' +
          '<button type="button" class="btn p mini" data-hub-newgroup="1">➕ ساخت گروه</button>' +
        '</div>' +
      '</div>' +
      '<div id="grpMount"></div>';
    stage.appendChild(pub);
    stage.appendChild(grp);
    sec.appendChild(stage);

    document.addEventListener("click", function (e) {
      var t = e.target;
      if (!t || !t.closest) return;
      var tab = t.closest("[data-chat-tab]");
      if (tab) {
        e.preventDefault();
        var name = tab.getAttribute("data-chat-tab");
        if (R.cur !== "chat") {
          try { R.go("chat"); } catch (er) {}
        }
        switchChat(name);
        return;
      }
      if (t.closest("[data-hub-newgroup]")) {
        e.preventDefault();
        switchChat("groups");
        var b = $("grpNewBtn");
        if (b) setTimeout(function () { try { b.click(); } catch (er) {} }, 80);
        return;
      }
      var g = t.closest("[data-gopen]");
      if (g) {
        switchChat("groups");
        setTimeout(function () {
          var c = $("grpChat");
          if (c) try { c.scrollIntoView({ behavior: "smooth", block: "center" }); } catch (er) {}
        }, 120);
      }
    }, false);

    mountGroups();
  }

  function mountGroups() {
    if (W.groupsMounted) return;
    var src = $("sec-groups");
    var dst = $("grpMount");
    if (!src || !dst) return;
    while (src.firstChild) dst.appendChild(src.firstChild);
    W.groupsMounted = true;
    src.classList.add("hubGroupSource");
    src.setAttribute("aria-hidden", "true");
    for (var i = 0; i < dst.children.length; i++) {
      if (dst.children[i].classList && dst.children[i].classList.contains("head")) {
        dst.children[i].classList.add("hubGroupOldHead");
      }
    }
    paintGroupMeta();
  }

  function paintGroupMeta() {
    var src = $("grpCount");
    var txt = src ? String(src.textContent || "").trim() : "";
    if (!txt) {
      var n = 0;
      var list = $("grpList");
      if (list) n = list.querySelectorAll("[data-gopen]").length;
      txt = (n ? fa(n) : "۰") + " گروه";
    }
    ["hubGroupCount", "hubGroupCount2"].forEach(function (id) {
      var e = $(id); if (e) e.textContent = txt;
    });
    var meta = $("hubGroupMeta");
    if (meta) meta.textContent = txt + " آمادهٔ گفتگو";
  }

  function switchChat(tab) {
    if (tab !== "groups") tab = "public";
    W.chatTab = tab;
    var pub = $("chatPublicPane"), grp = $("chatGroupPane");
    if (!pub || !grp) return;
    pub.classList.toggle("hide", tab === "groups");
    grp.classList.toggle("hide", tab !== "groups");
    R.qa(".hubTab[data-chat-tab]").forEach(function (b) {
      var on = b.getAttribute("data-chat-tab") === tab;
      b.classList.toggle("on", on);
      b.setAttribute("aria-selected", on ? "true" : "false");
    });
    try { localStorage.setItem("ronin-chat-tab", tab); } catch (e) {}
    if (tab === "groups") {
      mountGroups();
      paintGroupMeta();
      var old = R.cur;
      try {
        R.cur = "groups";
        if (R.hooks && typeof R.hooks.groups === "function") R.hooks.groups();
      } catch (e) {}
      R.cur = old || "chat";
      setTimeout(paintGroupMeta, 300);
    } else {
      var box = $("chatBox");
      if (box) setTimeout(function () { box.scrollTop = box.scrollHeight; }, 80);
    }
  }

  function wrapNavigation() {
    if (R.__worldNavWrapped) return;
    R.__worldNavWrapped = true;
    var oldGo = R.go;
    R.go = function (name) {
      if (name === "groups") {
        oldGo.call(R, "chat");
        switchChat("groups");
        return;
      }
      if (name === "chat") {
        oldGo.call(R, "chat");
        switchChat("public");
        return;
      }
      return oldGo.apply(R, arguments);
    };

    var oldOpen = R.grpOpen;
    if (typeof oldOpen === "function") {
      R.grpOpen = function (gid) {
        switchChat("groups");
        var out = oldOpen.apply(this, arguments);
        setTimeout(function () {
          paintGroupMeta();
          var c = $("grpChat");
          if (c && !c.classList.contains("hide")) {
            try { c.scrollIntoView({ behavior: "smooth", block: "center" }); } catch (e) {}
          }
        }, 120);
        return out;
      };
    }
  }

  /* ── ۲. دنیای من ─────────────────────────────────────────── */
  function worldShell() {
    var sec = $("sec-myworld");
    if (!sec) return;
    if ($("mwShell")) return;
    sec.innerHTML =
      '<div class="mwShell" id="mwShell">' +
        '<div id="mwHero"></div>' +
        '<div class="mwStats" id="mwStats"></div>' +
        '<div class="mwGrid">' +
          '<div class="mwMain">' +
            '<div class="mwPanel card">' +
              '<div class="mwPanelHead">' +
                '<div><span class="hubKicker">MY UNIVERSE</span><b id="mwFeedTitle">یک نگاه به دنیای من</b></div>' +
                '<div class="mwTabs">' +
                  '<button type="button" class="on" data-mwtab="overview">نمای کلی</button>' +
                  '<button type="button" data-mwtab="posts">پست‌ها</button>' +
                  '<button type="button" data-mwtab="ads">آگهی‌ها</button>' +
                '</div>' +
              '</div>' +
              '<div id="mwFeed" class="mwFeed"></div>' +
            '</div>' +
          '</div>' +
          '<aside class="mwSide">' +
            '<div class="mwPanel card mwThemePanel">' +
              '<div class="mwPanelHead"><div><span class="hubKicker">THEME LAB</span><b>استودیوی تم</b></div><span class="chip cy">زنده</span></div>' +
              '<div class="mwModeRow">' +
                '<button type="button" class="mwMode" data-theme-set="dark"><i>🌙</i><b>تاریک</b><small>شبانه</small></button>' +
                '<button type="button" class="mwMode" data-theme-set="light"><i>☀️</i><b>روشن</b><small>روزانه</small></button>' +
                '<button type="button" class="mwMode" data-theme-set="auto"><i>🌗</i><b>خودکار</b><small>همراه سیستم</small></button>' +
              '</div>' +
              '<div class="mwAccentLabel">لهجهٔ رنگی</div>' +
              '<div class="mwAccents">' +
                '<button type="button" class="mwAccent aurora" data-accent-set="aurora" title="شفق"><i></i><span>شفق</span></button>' +
                '<button type="button" class="mwAccent sakura" data-accent-set="sakura" title="ساکورا"><i></i><span>ساکورا</span></button>' +
                '<button type="button" class="mwAccent ember" data-accent-set="ember" title="اخگر"><i></i><span>اخگر</span></button>' +
                '<button type="button" class="mwAccent mint" data-accent-set="mint" title="نعناع"><i></i><span>نعناع</span></button>' +
              '</div>' +
              '<div class="mwThemeHint" id="mwThemeHint">تغییرات فوری روی کل سایت اعمال می‌شود.</div>' +
            '</div>' +
            '<div class="mwPanel card" id="mwTrailerPanel"></div>' +
            '<div class="mwPanel card" id="mwActivityPanel"></div>' +
            '<div class="mwPanel card" id="mwShortcuts"></div>' +
          '</aside>' +
        '</div>' +
      '</div>';

    R.hooks = R.hooks || {};
    R.hooks.myworld = renderWorld;
    bindWorld();
  }

  function bindWorld() {
    if (document.__mwBound) return;
    document.__mwBound = true;
    document.addEventListener("click", function (e) {
      var t = e.target;
      if (!t || !t.closest) return;
      var tb = t.closest("[data-mwtab]");
      if (tb) {
        e.preventDefault();
        W.tab = tb.getAttribute("data-mwtab");
        R.qa("[data-mwtab]").forEach(function (b) {
          b.classList.toggle("on", b === tb);
        });
        renderWorld();
        return;
      }
      if (t.closest("[data-mwrefresh]")) {
        e.preventDefault();
        renderWorld();
        toast("دنیای من تازه شد ✨", "ok");
        return;
      }
      var tr = t.closest("[data-mwtrailer]");
      if (tr) {
        e.preventDefault();
        var id = tr.getAttribute("data-mwtrailer");
        var title = tr.getAttribute("data-mwtitle") || "تریلر";
        if (R.bulletin && R.bulletin.open) R.bulletin.open(id, title);
        else R.go("bulletin");
      }
    }, false);
    document.addEventListener("themechange", function () { paintThemeState(); });
  }

  function paintThemeState() {
    var api = R.theme;
    if (!api) return;
    var mode = api.mode ? api.mode() : "auto";
    var accent = api.accent ? api.accent() : "aurora";
    R.qa("[data-theme-set]").forEach(function (b) {
      b.classList.toggle("on", b.getAttribute("data-theme-set") === mode);
    });
    R.qa("[data-accent-set]").forEach(function (b) {
      b.classList.toggle("on", b.getAttribute("data-accent-set") === accent);
    });
    var hint = $("mwThemeHint");
    if (hint) hint.textContent = "تم " + (MODE_LABEL[mode] || "خودکار") + " • لهجهٔ " + (api.accentName ? api.accentName() : "شفق");
  }

  function latestTrailer() {
    var data = (R.bulletin && R.bulletin.data) ? R.bulletin.data() : W.bulletins;
    var arr = arrOf(data, function (d) { return d.kind === "trailer"; });
    for (var i = 0; i < arr.length; i++) {
      if (ytId(arr[i].link) || arr[i].img) return arr[i];
    }
    return null;
  }

  function renderWorld() {
    if (!$("mwShell")) { worldShell(); if (!$("mwShell")) return; }
    var u = R.USER || {}, me = R.ME;
    var posts = myPosts(), ads = myAds(), xp = num(u.xp), xi = xpInfo(xp);
    var online = Object.keys(R.ONLINE || {}).length;
    var trailer = latestTrailer();

    var hero = $("mwHero");
    if (hero) {
      if (!me) {
        hero.innerHTML =
          '<div class="mwHero mwGuest">' +
            '<div class="mwHeroCopy"><span class="hubKicker">MY UNIVERSE / GUEST</span>' +
              '<h2>دنیای من</h2>' +
              '<p>با ورود، آمار، پست‌ها، آگهی‌ها و هویت رونین‌ات اینجا زنده می‌شوند.</p>' +
              '<div class="mwHeroActions"><button class="btn p mini" data-authopen="login">🔑 ورود به دنیای من</button></div>' +
            '</div>' +
            '<div class="mwHeroBadge">🧭</div>' +
          '</div>';
      } else {
        hero.innerHTML =
          '<div class="mwHero">' +
            '<div class="mwAvaWrap">' + avatarBig(u) +
              '<span class="mwAvaRing"></span>' +
              '<span class="mwAvaLevel">Lv ' + fa(xi.lv) + '</span>' +
            '</div>' +
            '<div class="mwHeroCopy">' +
              '<span class="hubKicker">MY UNIVERSE / LIVE</span>' +
              '<h2>' + esc(hourGreeting()) + '، <b>' + esc(u.name || "رونین") + '</b></h2>' +
              '<p>' + (u.bio ? esc(u.bio) : "این دنیا مال توست؛ پست بساز، آگهی بگذار و ردپات را در رونین جا بگذار.") + '</p>' +
              '<div class="mwChips">' +
                '<span class="mwChip">💎 ' + (R.prem ? "پرمیوم" : "عضو رونین") + '</span>' +
                '<span class="mwChip">⭐ ' + fa(xp) + ' XP</span>' +
                '<span class="mwChip">🟢 ' + fa(online) + ' آنلاین</span>' +
              '</div>' +
              '<div class="mwXp"><div class="mwXpLine"><span>سطح ' + fa(xi.lv) + '</span><span>' + fa(xi.next) + ' XP تا سطح بعد</span></div><div class="mwXpBar"><i style="width:' + xi.pct + '%"></i></div></div>' +
              '<div class="mwHeroActions">' +
                '<button class="btn p mini" data-go="community">✍️ نوشتن پست</button>' +
                '<button class="btn mini" data-go="profile">👤 پروفایل من</button>' +
                '<button class="btn mini" data-mwrefresh="1">↻ تازه‌سازی</button>' +
              '</div>' +
            '</div>' +
          '</div>';
      }
    }

    var stats = $("mwStats");
    if (stats) {
      stats.innerHTML =
        '<div class="mwStat hi"><span>📝</span><b>' + fa(posts.length) + '</b><small>پست من</small></div>' +
        '<div class="mwStat"><span>📢</span><b>' + fa(ads.length) + '</b><small>آگهی من</small></div>' +
        '<div class="mwStat"><span>⭐</span><b>' + fa(xp) + '</b><small>XP</small></div>' +
        '<div class="mwStat"><span>🏯</span><b id="mwGroupStat">' + fa(countGroups()) + '</b><small>گروه</small></div>';
    }

    var title = $("mwFeedTitle");
    if (title) title.textContent = W.tab === "posts" ? "پست‌های من" : W.tab === "ads" ? "آگهی‌های من" : "یک نگاه به دنیای من";
    R.qa("[data-mwtab]").forEach(function (b) {
      b.classList.toggle("on", b.getAttribute("data-mwtab") === W.tab);
    });

    var feed = $("mwFeed");
    if (feed) {
      if (!me) {
        feed.innerHTML = '<div class="mwEmpty"><b>🔐 دنیای من پشت در است</b><span>وارد شو تا پست‌ها و آگهی‌هایت را ببینی.</span><button class="btn p mini" data-authopen="login">ورود</button></div>';
      } else if (W.tab === "posts") {
        feed.innerHTML = posts.length
          ? '<div class="mwFeedList">' + posts.map(postHTML).join("") + "</div>"
          : '<div class="mwEmpty"><b>📝 هنوز پستی نداری</b><span>اولین پستت را در انجمن بنویس و دنیایت را شروع کن.</span><button class="btn p mini" data-go="community">نوشتن پست</button></div>';
      } else if (W.tab === "ads") {
        feed.innerHTML = ads.length
          ? '<div class="mwAdGrid">' + ads.map(adHTML).join("") + "</div>"
          : '<div class="mwEmpty"><b>📢 هنوز آگهی نداری</b><span>یک آگهی بساز و آن را به بازار رونین بیاور.</span><button class="btn p mini" data-go="ads">ثبت آگهی</button></div>';
      } else {
        var top = posts.slice(0, 2), adTop = ads.slice(0, 2);
        var h = "";
        if (trailer) {
          h += '<div class="mwFeature">' + trailerMini(trailer, true) + "</div>";
        }
        h += '<div class="mwOverviewCols">';
        h += '<div><div class="mwMiniHead"><b>📝 آخرین پست‌ها</b><button class="btn mini" data-mwtab="posts">همه</button></div>' +
          (top.length ? '<div class="mwFeedList">' + top.map(postHTML).join("") + "</div>" : '<div class="mwEmpty small"><b>هنوز پستی نداری</b><span>از انجمن شروع کن.</span></div>') + "</div>";
        h += '<div><div class="mwMiniHead"><b>📢 آخرین آگهی‌ها</b><button class="btn mini" data-mwtab="ads">همه</button></div>' +
          (adTop.length ? '<div class="mwAdGrid one">' + adTop.map(adHTML).join("") + "</div>" : '<div class="mwEmpty small"><b>هنوز آگهی نداری</b><span>بازار منتظر توست.</span></div>') + "</div>";
        h += "</div>";
        feed.innerHTML = h;
      }
    }

    var tr = $("mwTrailerPanel");
    if (tr) {
      tr.innerHTML = '<div class="mwPanelHead"><div><span class="hubKicker">CINEMA FEED</span><b>آخرین تریلر</b></div><button class="btn mini" data-go="bulletin">اتاق خبر</button></div>' +
        (trailer ? trailerMini(trailer, false) : '<div class="mwEmpty small"><b>🎬 تریلری نیست</b><span>به‌زودی از اتاق خبر می‌رسد.</span></div>');
    }

    var act = $("mwActivityPanel");
    if (act) {
      var events = posts.slice(0, 3).map(function (p) {
        return { icon: "📝", text: "پست جدید: " + (p.title || String(p.text || "").slice(0, 42) || "بدون عنوان"), t: p.t };
      }).concat(ads.slice(0, 2).map(function (p) {
        return { icon: "📢", text: "آگهی: " + (p.name || "بدون نام"), t: p.t };
      })).sort(function (a, b) { return (b.t || 0) - (a.t || 0); }).slice(0, 4);
      act.innerHTML = '<div class="mwPanelHead"><div><span class="hubKicker">ACTIVITY</span><b>ردپای من</b></div></div>' +
        (events.length
          ? '<div class="mwTimeline">' + events.map(function (x) {
              return '<div class="mwEvent"><i>' + x.icon + '</i><div><b>' + esc(x.text) + '</b><span>' + (R.time ? R.time(x.t) : "") + "</span></div></div>";
            }).join("") + "</div>"
          : '<div class="mwEmpty small"><b>هنوز ردی نیست</b><span>اولین کارت را ثبت کن.</span></div>');
    }

    var sc = $("mwShortcuts");
    if (sc) {
      sc.innerHTML = '<div class="mwPanelHead"><div><span class="hubKicker">SHORTCUTS</span><b>دسترسی سریع</b></div></div>' +
        '<div class="mwShortcuts">' +
          '<button data-go="community">👥 انجمن</button>' +
          '<button data-go="market">🛒 بازار</button>' +
          '<button data-chat-tab="groups">🏯 گروه‌ها</button>' +
          '<button data-go="bulletin">🎬 تریلرها</button>' +
          '<button data-go="premium">💎 پرمیوم</button>' +
          '<button data-go="settings">⚙ تنظیمات</button>' +
        '</div>';
    }
    paintThemeState();
  }

  function trailerMini(d, feature) {
    if (!d) return "";
    var y = ytId(d.link);
    var img = d.img || (y ? "https://img.youtube.com/vi/" + y + "/hqdefault.jpg" : "");
    var inner = '<div class="mwTrailerImg">' +
      (img ? '<img src="' + esc(img) + '" alt="" loading="lazy">' : "") +
      '<span class="mwTrailerShade"></span>' +
      (y ? '<span class="mwTrailerPlay">▶</span>' : "") +
      "</div>" +
      '<div class="mwTrailerBody"><span class="hubKicker">' + (feature ? "FEATURED TRAILER" : "TRAILER") + "</span>" +
      '<b>' + esc(d.title || "تریلر ویژه") + "</b>" +
      '<small>' + esc(d.date || d.byn || "اتاق خبر رونین") + "</small>" +
      (y ? '<button class="btn p mini" type="button" data-mwtrailer="' + esc(y) + '" data-mwtitle="' + esc(d.title || "تریلر") + '">🎬 پخش تریلر</button>' : "") +
      "</div>";
    return '<div class="mwTrailer' + (feature ? " feature" : "") + '">' + inner + "</div>";
  }

  function countGroups() {
    var c = $("grpCount");
    if (c) {
      var m = String(c.textContent || "").match(/[0-9۰-۹]+/);
      if (m) {
        var digits = String(m[0]).replace(/[۰-۹]/g, function (x) { return "۰۱۲۳۴۵۶۷۸۹".indexOf(x); });
        return Number(digits) || 0;
      }
    }
    var list = $("grpList");
    return list ? list.querySelectorAll("[data-gopen]").length : 0;
  }

  function watchBulletins() {
    if (W.bulWatch) return;
    W.bulWatch = true;
    try {
      if (R.watch) R.watch("bulletins", function (v) {
        W.bulletins = v || {};
        if (R.cur === "myworld") renderWorld();
      });
    } catch (e) {}
  }

  /* ── ۳. راه‌اندازی ───────────────────────────────────────── */
  function boot() {
    buildChatHub();
    mountGroups();
    worldShell();
    wrapNavigation();
    paintGroupMeta();
    if ($("sec-myworld")) {
      R.hooks = R.hooks || {};
      R.hooks.myworld = renderWorld;
    }
    watchBulletins();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
  setTimeout(boot, 700);
  setTimeout(boot, 1800);
  setTimeout(boot, 3200);
  setInterval(function () {
    if (!document.hidden) {
      paintGroupMeta();
      if (R.cur === "myworld") {
        var stat = $("mwGroupStat");
        if (stat) stat.textContent = fa(countGroups());
      }
    }
  }, 4000);
})();
