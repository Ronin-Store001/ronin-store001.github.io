/* ═══════════════════════════════════════════════════════════════
   RONIN STORE — MARKET PRO · js/10-market-pro.js
   فیلتر/جستجوی بازار • ثبت آگهی با پیش‌نمایش • آگهی‌های من
   کاوش تازه • موضوعات انجمن • آمار کمپین
   ═══════════════════════════════════════════════════════════════ */
"use strict";
(function () {
  if (!window.R) return;
  var R = window.R;
  var SHOP = R.SHOP || (R.SHOP = { q: "", cat: "", sort: "new" });
  var DISC = R.DISC || (R.DISC = { q: "", tag: "", cat: "" });
  var ADS = R.ADS || (R.ADS = { filter: "all" });

  function q(id) { return document.getElementById(id); }
  function esc(s) { return R.esc ? R.esc(s) : String(s == null ? "" : s); }
  function fa(n) { return R.fa ? R.fa(n) : String(n); }
  function num(v) {
    var fa9 = "۰۱۲۳۴۵۶۷۸۹", ar9 = "٠١٢٣٤٥٦٧٨٩";
    return parseInt(String(v == null ? "" : v)
      .replace(/[۰-۹]/g, function (d) { return String(fa9.indexOf(d)); })
      .replace(/[٠-٩]/g, function (d) { return String(ar9.indexOf(d)); })
      .replace(/[^\d]/g, ""), 10) || 0;
  }
  function safeUrl(v) {
    v = String(v == null ? "" : v).trim();
    return /^https?:\/\//i.test(v) ? v : "";
  }
  function tagsOf(p) {
    if (!p || !p.tags) return [];
    if (Object.prototype.toString.call(p.tags) === "[object Array]") return p.tags.slice(0, 6);
    return String(p.tags).split(/[,#]+/).map(function (x) { return x.trim(); })
      .filter(Boolean).slice(0, 6);
  }
  function kind(p) {
    var map = { product: "محصول", service: "خدمات", brand: "برند" };
    return map[p && p.kind] || "محصول";
  }
  function status(p) {
    if (p.st === "pending") return { text: "در انتظار تایید", cls: "gd" };
    if (p.st === "rejected") return { text: "رد شد", cls: "bad" };
    return { text: "فعال", cls: "ok" };
  }
  function postsList() {
    return R.feedList ? Object.keys(R.POSTS || {}).map(function (k) {
      var p = R.POSTS[k]; p.id = k; return p;
    }).filter(function (p) { return p.status !== "pending"; }) : [];
  }
  function usersList() {
    return Object.keys(R.USERS || {}).map(function (k) {
      var u = R.USERS[k]; u.uid = k; return u;
    });
  }
  function productsList() {
    return (R.prodList ? R.prodList() : []).filter(R.isLive);
  }
  function hashtags(text) {
    var out = [], m, re = /#([\w\u0600-\u06FF\u200c]+)/g;
    while ((m = re.exec(String(text || "")))) out.push("#" + m[1]);
    return out;
  }
  function topTags(posts, prods) {
    var seen = {}, out = [];
    posts.forEach(function (p) {
      hashtags(p.text).forEach(function (h) {
        if (!seen[h]) { seen[h] = 1; out.push(h); }
      });
    });
    if (!out.length) {
      prods.forEach(function (p) {
        if (p.cat && !seen[p.cat]) { seen[p.cat] = 1; out.push(p.cat); }
      });
    }
    return out.slice(0, 8);
  }

  /* ── ۱. کارت محصول ─────────────────────────────────────── */
  R.prodCard = function (p) {
    var mine = p.sellerUid === R.ME;
    var image = safeUrl(p.img);
    var tg = tagsOf(p);
    return '<div class="prod">' +
      '<div class="pimg">' +
        (image ? '<img src="' + esc(image) + '" alt="" loading="lazy" onerror="this.remove()">' :
          '<span aria-hidden="true">' + esc(p.icon || "🎁") + "</span>") +
        '<div class="pbadges">' +
          (mine ? '<span class="chip gd">آگهی من</span>' : "") +
          (p.kind && p.kind !== "product" ? '<span class="chip cy">' + esc(kind(p)) + "</span>" : "") +
        "</div>" +
      "</div>" +
      '<div class="pinfo">' +
        '<div class="sm b ellip">' + esc(p.name) + "</div>" +
        '<div class="xs mut ellip">' + esc(p.company || p.sellerName || "فروشنده") + "</div>" +
        (p.cat ? '<div class="xs cy mt" style="margin-top:4px">' + esc(p.cat) + "</div>" : "") +
        (tg.length ? '<div class="ptags">' + tg.map(function (t) { return "<span>" + esc(t) + "</span>"; }).join("") + "</div>" : "") +
        '<div class="pfoot"><span class="price">' + R.money(p.price) + " " + esc(p.cur || "تومان") + "</span>" +
          '<span class="pviews">👁 ' + fa(p.views || 0) + "</span></div>" +
        '<div class="row mt" style="gap:5px"><button class="btn p mini" type="button" data-prod="' + esc(p.id) + '">مشاهده</button></div>' +
      "</div></div>";
  };

  R.shopList = function () {
    var arr = productsList();
    var qq = String(SHOP.q || "").trim().toLowerCase();
    if (SHOP.cat) arr = arr.filter(function (p) { return p.cat === SHOP.cat; });
    if (qq) arr = arr.filter(function (p) {
      return [p.name, p.desc, p.company, p.sellerName, p.cat, p.loc, p.tags].join(" ").toLowerCase().indexOf(qq) > -1;
    });
    var sort = SHOP.sort || "new";
    arr.sort(function (a, b) {
      if (sort === "cheap") return num(a.price) - num(b.price);
      if (sort === "expensive") return num(b.price) - num(a.price);
      if (sort === "popular") return (b.views || 0) - (a.views || 0);
      return (b.t || 0) - (a.t || 0);
    });
    return arr;
  };

  R.renderShopFilters = function () {
    var box = q("shopCats");
    if (box) {
      var cats = [{ v: "", n: "همه" }].concat((R.CATS || []).map(function (c) { return { v: c, n: c }; }));
      box.innerHTML = cats.map(function (c) {
        return '<button class="mpCat' + (SHOP.cat === c.v ? " on" : "") + '" type="button" data-shopcat="' +
          esc(c.v) + '">' + esc(c.n) + "</button>";
      }).join("");
    }
    var sort = q("shopSort");
    if (sort && sort.value !== SHOP.sort) sort.value = SHOP.sort;
    var search = q("shopSearch");
    if (search && document.activeElement !== search && search.value !== SHOP.q) search.value = SHOP.q;
  };

  R.renderAdsDashboard = function () {
    var all = R.prodList ? R.prodList() : [];
    var live = all.filter(R.isLive), pending = all.filter(function (p) { return p.st === "pending"; });
    var views = live.reduce(function (a, p) { return a + (Number(p.views) || 0); }, 0);
    var stats = (R.videoAds && R.videoAds.stats) ? R.videoAds.stats() : { impressions: 0 };
    var set = function (id, v) { var e = q(id); if (e) e.textContent = fa(v); };
    set("shopCount", live.length);
    set("adsActive", live.length);
    set("adsPending", pending.length);
    set("adsViews", views);
    set("adsImpr", stats.impressions || 0);
    var sellers = {};
    live.forEach(function (p) { sellers[p.sellerUid || p.company || p.sellerName || "?"] = 1; });
    set("shopSellers", Object.keys(sellers).length);
    var day = 86400000, now = Date.now();
    set("shopFresh", live.filter(function (p) { return (p.t || 0) > now - day; }).length);
    var meta = q("shopMeta");
    if (meta) meta.textContent = fa(R.shopList().length) + " از " + fa(live.length) + " آگهی";
  };

  R.renderShop = function () {
    var wall = q("shopWall"), my = q("myAds");
    var all = R.prodList ? R.prodList() : [];
    var live = all.filter(R.isLive);
    var list = R.shopList();
    if (wall) {
      if (!live.length) {
        wall.innerHTML = '<div class="empty mpEmpty">هنوز آگهی‌ای ثبت نشده — تو اولی باش 📢<br>' +
          '<button class="btn p mini" type="button" data-go="ads">ثبت اولین آگهی</button></div>';
      } else if (!list.length) {
        wall.innerHTML = '<div class="empty mpEmpty">کالایی با این فیلتر پیدا نشد 🔎<br>' +
          '<button class="btn mini" type="button" data-shopclear="1">پاک کردن فیلترها</button></div>';
      } else {
        wall.innerHTML = list.map(R.prodCard).join("");
      }
    }
    if (my) {
      var mine = all.filter(function (p) { return p.sellerUid === R.ME; });
      if (!R.ME) my.innerHTML = '<div class="empty">برای دیدن آگهی‌هایت وارد شو</div>';
      else {
        if (ADS.filter !== "all") mine = mine.filter(function (p) {
          return ADS.filter === "live" ? R.isLive(p) : p.st === ADS.filter;
        });
        my.innerHTML = mine.length ? mine.map(function (p) {
          var st = status(p), image = safeUrl(p.img);
          return '<div class="myAd"><div class="maTop">' +
            '<div class="maIcon">' + (image ? '<img src="' + esc(image) + '" alt="" loading="lazy" onerror="this.remove()">' : esc(p.icon || "🎁")) + "</div>" +
            '<div class="grow" style="min-width:0"><div class="maName ellip">' + esc(p.name) + "</div>" +
              '<div class="maMeta">' + R.money(p.price) + " " + esc(p.cur || "تومان") + " • " + esc(kind(p)) +
              " • 👁 " + fa(p.views || 0) + '</div></div>' +
            '<span class="chip ' + st.cls + '">' + st.text + "</span></div>" +
            '<div class="maActions"><button class="btn mini" type="button" data-prod="' + esc(p.id) + '">نمایش</button>' +
              '<button class="btn d mini" type="button" data-delad="' + esc(p.id) + '">حذف</button></div></div>';
        }).join("") : '<div class="empty">آگهی‌ای در این وضعیت نیست</div>';
      }
    }
    R.renderShopFilters();
    R.renderAdsDashboard();
  };

  /* ── ۲. ثبت آگهی + پیش‌نمایش ───────────────────────────── */
  function field(id) { var e = q(id); return e ? e.value : ""; }
  function readAd() {
    var kindV = field("adKind") || "product";
    if (["product", "service", "brand"].indexOf(kindV) < 0) kindV = "product";
    return {
      name: R.clean(field("adName"), 60),
      icon: R.clean(field("adIcon"), 4) || "🎁",
      price: R.clean(field("adPrice"), 20),
      cur: R.clean(field("adCur"), 10) || "تومان",
      cat: R.clean(field("adCat"), 30) || "متفرقه",
      kind: kindV,
      company: R.clean(field("adCompany"), 40),
      contact: R.clean(field("adContact"), 60),
      loc: R.clean(field("adLoc"), 40),
      tags: R.clean(field("adTags"), 100),
      img: safeUrl(field("adImg")),
      link: safeUrl(field("adLink")),
      rawLink: field("adLink"),
      desc: R.clean(field("adDesc"), 600)
    };
  }

  R.previewAd = function () {
    var box = q("adPreview"); if (!box) return;
    var d = readAd();
    if (!d.name && !d.price) {
      box.innerHTML = '<div class="center xs mut" style="padding:18px">پیش‌نمایش آگهی اینجا ساخته می‌شود</div>';
      return;
    }
    var img = d.img;
    box.innerHTML = '<div class="adPrevCard">' +
      '<div class="adPrevTop"><div class="adPrevIcon">' +
        (img ? '<img src="' + esc(img) + '" alt="" onerror="this.remove()">' : esc(d.icon)) +
      '</div><div class="grow" style="min-width:0"><div class="adPrevName ellip">' + esc(d.name || "نام محصول") + "</div>" +
        '<div class="adPrevMeta">' + esc(d.company || "فروشنده") + " • " + esc(d.cat) + " • " + esc(kind(d)) + "</div></div></div>" +
      '<div class="adPrevDesc">' + esc(d.desc || "توضیح کوتاه محصول یا خدمت…") + "</div>" +
      '<div class="adPrevPrice">' + (d.price ? R.money(d.price) + " " + esc(d.cur) : "قیمت توافقی") + "</div>" +
      (d.tags ? '<div class="xs mut mt">' + esc(d.tags) + "</div>" : "") +
      "</div>";
  };

  R.submitAd = function () {
    if (!R.ME) return R.needLogin("ثبت آگهی");
    var d = readAd();
    if (d.name.length < 2) return R.toast("نام محصول را بنویس", "err");
    if (!d.price || !num(d.price)) return R.toast("قیمت را وارد کن", "err");
    if (d.rawLink && !d.link) return R.toast("لینک مقصد باید با http شروع شود", "err");
    var owner = R.isOwner();
    var p = {
      name: d.name, icon: d.icon, price: d.price, cur: d.cur, cat: d.cat,
      kind: d.kind, desc: d.desc, company: d.company, contact: d.contact,
      loc: d.loc, tags: d.tags, img: d.img, link: d.link,
      sellerUid: R.ME, sellerName: (R.USER && R.USER.name) || "فروشنده",
      t: Date.now(), views: 0, st: owner ? "live" : "pending"
    };
    R.add("products", p).then(function () {
      ["adName", "adPrice", "adDesc", "adCompany", "adContact", "adLoc", "adTags", "adImg", "adLink"].forEach(function (id) {
        var e = q(id); if (e) e.value = "";
      });
      R.previewAd();
      if (owner) R.toast("آگهی منتشر شد ✅", "ok");
      else {
        R.toast("⏳ آگهی برای تایید مالک فرستاده شد", "ok");
        R.notify(R.OWNER_UID, "📢 آگهی جدید در انتظار تایید", "mod", "owner");
      }
      R.xp(8);
    }).catch(function (e) { R.toast("ثبت نشد: " + e.message, "err"); });
  };

  /* ── ۳. جزئیات محصول: تگ و لینک ─────────────────────────── */
  var origProdBody = R.prodBody;
  R.prodBody = function (p) {
    var h = origProdBody ? origProdBody.apply(R, arguments) : "";
    var tg = tagsOf(p);
    if (tg.length) {
      h = h.replace('<div class="price"', '<div class="row w" style="gap:4px;margin-top:7px">' +
        tg.map(function (t) { return '<span class="chip cy">' + esc(t) + "</span>"; }).join("") +
        '</div><div class="price"');
    }
    if (p.link) {
      h = h.replace('<div class="head"><h3 class="h3">ثبت سفارش', '<a class="btn mini mb" dir="ltr" href="' +
        esc(p.link) + '" target="_blank" rel="noopener noreferrer">🔗 ' + esc(p.link) + "</a>" +
        '<div class="head"><h3 class="h3">ثبت سفارش');
    }
    return h;
  };

  /* ── ۴. کاوش ───────────────────────────────────────────── */
  function discTagList() {
    var posts = postsList(), prods = productsList();
    return topTags(posts, prods);
  }

  R.renderDiscTags = function () {
    var box = q("discChips"); if (!box) return;
    var tags = discTagList();
    var h = '<button class="discTag' + (!DISC.tag && !DISC.cat ? " on" : "") + '" type="button" data-discclear="1">همه</button>';
    h += tags.map(function (t) {
      return '<button class="discTag' + (DISC.tag === t ? " on" : "") + '" type="button" data-discq="' + esc(t) + '">' + esc(t) + "</button>";
    }).join("");
    h += (R.CATS || []).slice(0, 5).map(function (c) {
      return '<button class="discTag' + (DISC.cat === c ? " on" : "") + '" type="button" data-disccat="' + esc(c) + '">' + esc(c) + "</button>";
    }).join("");
    box.innerHTML = h;
  };

  R.renderDiscover = function () {
    var box = q("discBox"); if (!box) return;
    var posts = postsList(), prods = productsList(), users = usersList();
    var qq = String(DISC.q || "").trim().toLowerCase();
    var hit = function (s) { return String(s || "").toLowerCase().indexOf(qq) > -1; };
    R.renderDiscTags();
    var set = function (id, v) { var e = q(id); if (e) e.textContent = fa(v); };
    set("discProducts", prods.length);
    set("discPosts", posts.length);
    set("discPeople", users.length);

    if (qq || DISC.tag || DISC.cat) {
      var fp = prods.filter(function (p) {
        if (DISC.cat && p.cat !== DISC.cat) return false;
        if (DISC.tag && (!p.tags || String(p.tags).indexOf(DISC.tag.replace(/^#/, "")) < 0)) return false;
        return !qq || hit([p.name, p.desc, p.company, p.cat, p.tags].join(" "));
      });
      var fpost = posts.filter(function (p) {
        if (DISC.tag && String(p.text || "").indexOf(DISC.tag) < 0) return false;
        return !qq || hit([p.text, p.n].join(" "));
      });
      var fuser = users.filter(function (u) { return !qq || hit(u.name); });
      var h = '<div class="discSection"><div class="discSectionHead"><h3>🔎 نتیجهٔ جستجو</h3><span>' +
        fa(fp.length + fpost.length + fuser.length) + ' مورد</span></div>';
      if (!fp.length && !fpost.length && !fuser.length) {
        h += '<div class="empty">چیزی پیدا نشد 😕<br><button class="btn mini mt" type="button" data-discclear="1">پاک کردن جستجو</button></div>';
      } else {
        if (fp.length) h += '<div class="grid auto">' + fp.slice(0, 8).map(R.prodCard).join("") + "</div>";
        if (fpost.length) h += '<div class="head"><h3 class="h3">💬 پست‌ها</h3></div>' + fpost.slice(0, 6).map(function (p, i) {
          return '<div class="discPost"><div class="discNum">' + fa(i + 1) + '</div><div class="grow"><div class="discTxt">' +
            esc((p.text || "").slice(0, 100)) + '</div><div class="discMeta">' + esc(p.n || "کاربر") + " • ❤️ " +
            fa(p.lk ? Object.keys(p.lk).length : 0) + "</div></div></div>";
        }).join("");
        if (fuser.length) h += '<div class="head"><h3 class="h3">👤 کاربران</h3></div>' + fuser.slice(0, 6).map(function (u) {
          return '<div class="discUser"><div class="discAv">' + (u.av ? '<img src="' + esc(safeUrl(u.av)) + '" alt="" onerror="this.remove()">' : esc((u.name || "؟").slice(0, 1))) +
            '</div><div class="grow"><div class="discName">' + esc(u.name || "کاربر") + '</div><div class="discLevel">سطح ' +
            fa(R.level(u.xp || 0)) + "</div></div></div>";
        }).join("");
      }
      h += "</div>";
      box.innerHTML = h;
      return;
    }

    var hot = posts.slice().sort(function (a, b) { return R.score(b) - R.score(a); }).slice(0, 5);
    var fresh = prods.slice(0, 6);
    var voices = users.sort(function (a, b) { return (b.xp || 0) - (a.xp || 0); }).slice(0, 5);
    var tagList = discTagList();
    var h2 = "";

    h2 += '<div class="discSection"><div class="discSectionHead"><h3>🛒 تازه‌های فروشگاه</h3>' +
      '<button class="btn mini" type="button" data-go="market">همه ←</button></div>';
    h2 += fresh.length ? '<div class="grid auto">' + fresh.map(R.prodCard).join("") + "</div>" :
      '<div class="empty">هنوز کالایی ثبت نشده</div></div>';

    h2 += '<div class="discSection"><div class="discSectionHead"><h3>🔥 داغ‌ترین گفتگوها</h3><span>' + fa(hot.length) + '</span></div>';
    h2 += hot.length ? hot.map(function (p, i) {
      return '<div class="discPost"><div class="discNum">' + fa(i + 1) + '</div><div class="grow"><div class="discTxt">' +
        esc((p.text || "").slice(0, 100)) + '</div><div class="discMeta">' + esc(p.n || "کاربر") + " • ❤️ " +
        fa(p.lk ? Object.keys(p.lk).length : 0) + "</div></div></div>";
    }).join("") : '<div class="empty">بعد از چند پست، داغ‌ترین‌ها اینجا می‌آیند</div></div>';

    h2 += '<div class="discSection"><div class="discSectionHead"><h3>🏆 صدای برتر</h3><span>XP</span></div>';
    h2 += voices.length ? voices.map(function (u) {
      return '<div class="discUser"><div class="discAv">' + (u.av ? '<img src="' + esc(safeUrl(u.av)) + '" alt="" onerror="this.remove()">' : esc((u.name || "؟").slice(0, 1))) +
        '</div><div class="grow"><div class="discName">' + esc(u.name || "کاربر") + '</div><div class="discLevel">سطح ' +
        fa(R.level(u.xp || 0)) + '</div></div><div class="discXp">' + fa(u.xp || 0) + " XP</div></div>";
    }).join("") : '<div class="empty">هنوز کاربری ثبت‌نام نکرده</div></div>';

    if (tagList.length) {
      h2 += '<div class="discSection"><div class="discSectionHead"><h3>🧭 کالکشن‌ها</h3><span>بر اساس موضوع</span></div><div class="discCollections">' +
        tagList.slice(0, 6).map(function (t) {
          return '<button class="discCollection" type="button" data-discq="' + esc(t) + '"><b>' + esc(t) +
            '</b><span>دیدن تازه‌ها</span></button>';
        }).join("") + "</div></div>";
    }
    box.innerHTML = h2;
  };

  R.discoverSearch = function (text) {
    DISC.q = R.clean(text, 60); DISC.tag = ""; DISC.cat = "";
    var inp = q("discSearch"); if (inp) inp.value = DISC.q;
    R.go("discover");
    R.renderDiscover();
  };

  R.renderCommunityTopics = function () {
    var box = q("comTopics"); if (!box) return;
    var tags = discTagList().slice(0, 6);
    if (!tags.length) tags = ["#انیمه", "#فیگور", "#گیم", "#کلکسیونی"];
    box.innerHTML = '<span class="comTopicsLabel">موضوعات داغ:</span>' + tags.map(function (t) {
      return '<button class="comTopicPill" type="button" data-discq="' + esc(t) + '">' + esc(t) + "</button>";
    }).join("");
  };

  /* ── ۵. رویدادها ───────────────────────────────────────── */
  R.bindMarketPro = function () {
    var search = q("shopSearch");
    if (search) search.addEventListener("input", R.debounce(function (e) {
      SHOP.q = R.clean(e.target.value, 50); R.renderShop();
    }, 220));
    var sort = q("shopSort");
    if (sort) sort.addEventListener("change", function (e) {
      SHOP.sort = e.target.value || "new"; R.renderShop();
    });
    var form = q("sec-ads");
    if (form) form.addEventListener("input", function (e) {
      if (e.target && /^ad(Name|Icon|Price|Cur|Cat|Kind|Company|Contact|Loc|Tags|Img|Link|Desc)$/.test(e.target.id)) R.previewAd();
    });
    var dsearch = q("discSearch");
    if (dsearch) dsearch.addEventListener("input", R.debounce(function (e) {
      DISC.q = R.clean(e.target.value, 60); DISC.tag = ""; DISC.cat = ""; R.renderDiscover();
    }, 220));

    document.addEventListener("click", function (e) {
      var t = e.target.closest ? e.target.closest(
        "[data-shopcat],[data-shopclear],[data-adfilter],[data-discq],[data-disccat],[data-discclear]") : null;
      if (!t) return;
      if (t.hasAttribute("data-shopcat")) {
        SHOP.cat = t.getAttribute("data-shopcat") || ""; R.renderShop(); return;
      }
      if (t.hasAttribute("data-shopclear")) {
        SHOP.q = ""; SHOP.cat = ""; SHOP.sort = "new";
        var si = q("shopSearch"); if (si) si.value = "";
        R.renderShop(); return;
      }
      if (t.hasAttribute("data-adfilter")) {
        ADS.filter = t.getAttribute("data-adfilter") || "all";
        Array.prototype.forEach.call(document.querySelectorAll("#sec-ads [data-adfilter]"), function (b) {
          b.classList.toggle("on", b === t);
        });
        R.renderShop(); return;
      }
      if (t.hasAttribute("data-discq")) {
        DISC.tag = t.getAttribute("data-discq") || ""; DISC.q = ""; DISC.cat = "";
        var di = q("discSearch"); if (di) di.value = "";
        R.go("discover"); R.renderDiscover(); return;
      }
      if (t.hasAttribute("data-disccat")) {
        DISC.cat = t.getAttribute("data-disccat") || ""; DISC.tag = ""; DISC.q = "";
        var dc = q("discSearch"); if (dc) dc.value = "";
        R.go("discover"); R.renderDiscover(); return;
      }
      if (t.hasAttribute("data-discclear")) {
        DISC.q = ""; DISC.tag = ""; DISC.cat = "";
        var dx = q("discSearch"); if (dx) dx.value = "";
        R.renderDiscover();
      }
    });
    R.renderCommunityTopics();
    R.renderShop();
    R.renderDiscTags();
    R.renderDiscover();
    R.previewAd();
  };

  /* بازار و کاوش بعد از بوت اصلی آماده می‌شوند */
  R.bootMarketPro = R.bindMarketPro;
  window.R = R;
})();
