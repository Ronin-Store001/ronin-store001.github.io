/* ══════════════════════════════════════════════════════════
   RONIN STORE — CINEMATIC INTRO  v1  ·  ronin-intro.js
   فایل مستقل. جایگذاری در <head>. به هیچ فایل دیگر دست نمیزند.
   ══════════════════════════════════════════════════════════ */
(function () {
  var H = document.documentElement, KEY = "ronin_intro_done";
  var force = /[?&]intro=1/.test(location.search);
  var seen = false, reduce = false;
  try { seen = localStorage.getItem(KEY) === "1"; } catch (e) {}
  try { reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) {}
  if (!force && (seen || reduce)) return;          // فقط یکبار؛ و برای Redused-motion خاموش
  if (!force) { try { localStorage.setItem(KEY, "1"); } catch (e) {} }

  H.classList.add("rnIntroOn");                    // قفل از همین لحظه → بدون پرش تصویر
  var timers = [], finished = false;

  function at(ms, fn) { timers.push(setTimeout(fn, ms)); }
  function finish() {
    if (finished) return; finished = true;
    for (var i = 0; i < timers.length; i++) clearTimeout(timers[i]);
    timers.length = 0;
    var el = document.getElementById("rnIntro");
    H.classList.remove("rnIntroOn");
    if (!el) return;
    el.classList.add("out");
    setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 720);
  }

  /* شبکهی اطمینان: اگر مقدمه ساخته نشد، سایت حتماً آزاد شود */
  timers.push(setTimeout(function () {
    if (!document.getElementById("rnIntro")) H.classList.remove("rnIntroOn");
  }, 7000));

  function build() {
    try {
      if (document.getElementById("rnIntro")) return;
      var FIG =
        '<svg class="ri-fig" viewBox="0 0 84 118" aria-hidden="true">' +
          '<defs><linearGradient id="riBody" x1="0" y1="0" x2="0" y2="1">' +
            '<stop offset="0" stop-color="#2b3070"/><stop offset="1" stop-color="#101430"/>' +
          '</linearGradient></defs>' +
          '<g class="ri-leg-l"><rect x="26" y="76" width="13" height="36" rx="6.5" fill="url(#riBody)"/>' +
            '<rect x="28" y="99" width="9" height="11" rx="3.5" fill="#22d3ee" opacity=".5"/></g>' +
          '<g class="ri-leg-r"><rect x="45" y="76" width="13" height="36" rx="6.5" fill="url(#riBody)"/>' +
            '<rect x="47" y="99" width="9" height="11" rx="3.5" fill="#22d3ee" opacity=".5"/></g>' +
          '<g class="ri-arm-l"><rect x="13" y="48" width="11" height="33" rx="5.5" fill="url(#riBody)"/></g>' +
          '<g class="ri-arm-r"><rect x="60" y="48" width="11" height="33" rx="5.5" fill="url(#riBody)"/></g>' +
          '<rect x="22" y="42" width="40" height="40" rx="16" fill="url(#riBody)"/>' +
          '<rect x="22" y="70" width="40" height="5" rx="2.5" fill="#22d3ee" opacity=".7"/>' +
          '<rect x="34" y="50" width="16" height="4" rx="2" fill="#ff9a3c" opacity=".9"/>' +
          '<circle cx="42" cy="29" r="17" fill="#171b3c"/>' +
          '<rect x="27" y="23" width="30" height="12" rx="6" fill="#22d3ee" opacity=".8"/>' +
          '<circle cx="36" cy="29" r="2.6" fill="#eafcff"/><circle cx="48" cy="29" r="2.6" fill="#eafcff"/>' +
          '<rect x="23" y="15" width="38" height="6" rx="3" fill="#ff9a3c"/>' +
          '<path class="ri-scarf" d="M24 17 C9 13, 3 25, 11 35 C4 28, 14 22, 25 24 Z" fill="#ff9a3c" opacity=".85"/>' +
          '<ellipse cx="42" cy="114" rx="22" ry="5" fill="#000" opacity=".5"/>' +
        '</svg>';

      var root = document.createElement("div");
      root.id = "rnIntro";
      root.setAttribute("aria-hidden", "true");
      root.innerHTML =
        '<div class="ri-stars"></div><div class="ri-dust"></div>' +
        '<div class="ri-fog a"></div><div class="ri-fog b"></div>' +
        '<div class="ri-glow"></div><div class="ri-floor"></div>' +
        '<div class="ri-stage"><div class="ri-cast">' +
          '<div class="ri-sign"><b>RONIN</b></div>' + FIG +
        '</div></div>' +
        '<div class="ri-brand"><b>RONIN</b><span>STORE</span><em>THE ANIME UNIVERSE IS ALIVE</em></div>' +
        '<div class="ri-sweep"></div>' +
        '<button class="ri-skip" type="button">رد کردن مقدمه ›</button>';
      (document.body || H).appendChild(root);

      var cast = root.querySelector(".ri-cast");
      var brand = root.querySelector(".ri-brand");
      root.querySelector(".ri-skip").addEventListener("click", finish, { passive: true });

      var S = window.innerWidth < 620 ? 0.7 : 1;   // روی موبایل سریعتر
      at(150, function () { root.classList.add("lit"); });
      at(650, function () { root.classList.add("lit2"); });
      at(850, function () { cast.classList.add("on"); });                       // راه افتادن
      at(850 + 2150 * S, function () { cast.classList.add("placed"); });        // گذاشتن پرچم
      at(850 + 2350 * S, function () { root.classList.add("pulse"); });         // نور کف
      at(850 + 3000 * S, function () {
        root.classList.add("brand"); brand.classList.add("on");                 // RONIN STORE
      });
      at(850 + 5300 * S, finish);                                              // پایان
    } catch (e) {
      H.classList.remove("rnIntroOn");
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build);
  else build();

  /* برای تست/پخش دوباره از کنسول: RoninIntro.replay() */
  window.RoninIntro = { replay: function () { try { localStorage.removeItem(KEY); } catch (e) {} location.reload(); } };
})();
