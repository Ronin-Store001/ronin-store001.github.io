/* RONIN SEO PACK — تگ‌های اشتراک‌گذاری، canonical، دادهٔ ساختاریافته
   و بهینه‌سازی تصویر + لینک صفحات حقوقی در فوتر، بدون دست‌زدن به ظاهر موجود. */
"use strict";
(function () {
  if (window.__rnSeo) return;
  window.__rnSeo = true;

  var ORIGIN = location.origin;
  var PAGE = (location.pathname.split("/").pop() || "index.html");
  var isCinema = /cinema\.html/.test(PAGE);

  var META = {
    index: {
      desc: "رونین استور: بازار خرید و فروش، انجمن، چت، پرمیوم و کاتالوگ فیلم و انیمه با پلیر اختصاصی.",
      img: "media/ronin-ad-elite.jpg"
    },
    cinema: {
      desc: "تماشای آنلاین فیلم، سریال و انیمه با کیفیت بالا، جست‌وجوی هوشمند، فیلتر پیشرفته و پلیر اختصاصی رونین.",
      img: "media/ronin-ad-elite.jpg"
    }
  };
  var info = isCinema ? META.cinema : META.index;

  function head() { return document.head || document.documentElement; }
  function meta(attr, key, val) {
    if (!val) return;
    var sel = "meta[" + attr + '="' + key + '"]';
    var el = document.querySelector(sel);
    if (!el) { el = document.createElement("meta"); el.setAttribute(attr, key); head().appendChild(el); }
    el.setAttribute("content", val);
  }
  function link(rel, href) {
    if (!href) return;
    var el = document.querySelector('link[rel="' + rel + '"]');
    if (!el) { el = document.createElement("link"); el.setAttribute("rel", rel); head().appendChild(el); }
    el.setAttribute("href", href);
  }

  try {
    var url = ORIGIN + "/" + (PAGE === "" ? "" : PAGE);
    var img = ORIGIN + "/" + info.img;
    var title = document.title || "RONIN STORE";

    link("canonical", url);
    meta("name", "description", (document.querySelector('meta[name="description"]') || {}).content || info.desc);
    meta("name", "robots", "index,follow,max-image-preview:large");
    meta("name", "theme-color", "#05060f");

    meta("property", "og:type", "website");
    meta("property", "og:site_name", "RONIN STORE");
    meta("property", "og:locale", "fa_IR");
    meta("property", "og:url", url);
    meta("property", "og:title", title);
    meta("property", "og:description", info.desc);
    meta("property", "og:image", img);
    meta("property", "og:image:width", "960");
    meta("property", "og:image:height", "540");
    meta("property", "og:image:alt", "RONIN STORE");

    meta("name", "twitter:card", "summary_large_image");
    meta("name", "twitter:title", title);
    meta("name", "twitter:description", info.desc);
    meta("name", "twitter:image", img);

    var ld = document.getElementById("rnLd");
    if (!ld) { ld = document.createElement("script"); ld.type = "application/ld+json"; ld.id = "rnLd"; head().appendChild(ld); }
    ld.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebSite",
          "@id": ORIGIN + "/#website",
          url: ORIGIN + "/",
          name: "RONIN STORE",
          inLanguage: "fa-IR",
          potentialAction: {
            "@type": "SearchAction",
            target: ORIGIN + "/?q={q}",
            "query-input": "required name=q"
          }
        },
        {
          "@type": "Organization",
          "@id": ORIGIN + "/#org",
          name: "RONIN STORE",
          url: ORIGIN + "/",
          logo: ORIGIN + "/icon-512.png"
        }
      ].concat(isCinema ? [{
        "@type": "CollectionPage",
        name: "رونین فیلم",
        url: ORIGIN + "/cinema.html",
        isPartOf: { "@id": ORIGIN + "/#website" }
      }] : [])
    });
  } catch (e) {}

  var st = document.createElement("style");
  st.id = "rnSeo";
  st.textContent =
    "img:not([loading]){content-visibility:auto}" +
    ".sec{content-visibility:auto;contain-intrinsic-size:auto 780px}" +
    ".rn-legal{display:flex;gap:10px;flex-wrap:wrap;justify-content:center;padding:10px 12px 18px;font-size:10px;color:#7f8ab6}" +
    ".rn-legal a{color:#9fe9ff;text-decoration:none;border-bottom:1px dotted rgba(159,233,255,.4)}" +
    ".rn-legal a:hover{color:#fff}";
  head().appendChild(st);

  function lazy() {
    var imgs = document.querySelectorAll("img");
    Array.prototype.forEach.call(imgs, function (i) {
      if (i.dataset.rnLazy) return;
      i.dataset.rnLazy = "1";
      if (!i.getAttribute("loading")) i.setAttribute("loading", "lazy");
      if (!i.getAttribute("decoding")) i.setAttribute("decoding", "async");
    });
  }

  function legal() {
    var host = document.querySelector("footer, #siteFooter, .foot, .cx-foot");
    if (!host || host.querySelector(".rn-legal")) return;
    var bar = document.createElement("div");
    bar.className = "rn-legal";
    bar.innerHTML =
      '<a href="contact.html">تماس و درباره</a>' +
      '<span>·</span><a href="terms.html">قوانین</a>' +
      '<span>·</span><a href="privacy.html">حریم خصوصی</a>' +
      '<span>·</span><a href="cinema.html">رونین فیلم</a>';
    host.appendChild(bar);
  }

  function boot() { lazy(); legal(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  setTimeout(boot, 1500);
})();
