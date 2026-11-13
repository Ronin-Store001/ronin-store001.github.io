/* RONIN FILM - ADS GATE
   جلوگیری از «بنر می‌آید و ناپدید می‌شود»:
   جایگاه تبلیغ تا معلوم‌شدن وضعیت کاربر پنهان می‌ماند؛
   اگر کاربر پرمیوم/مالک باشد، جایگاه با یک کارت «بدون تبلیغ» پر می‌شود نه اینکه خالی شود. */
"use strict";
(function () {
  function box() { return document.querySelector('[data-ad="cinema-top"]'); }

  var slot = box();
  if (slot) { slot.setAttribute("data-gate", "1"); slot.style.visibility = "hidden"; }

  function eliteCard(el) {
    el.className = "cx-ad";
    el.innerHTML =
      '<div class="cxad" style="grid-template-columns:minmax(0,1fr)">' +
        '<div class="cxad-main" style="align-items:center;text-align:center;padding:16px">' +
          '<div class="cxad-top"><span class="cxad-badge">ELITE</span>' +
            '<span class="cxad-brand">RONIN PREMIUM</span></div>' +
          '<b class="cxad-title">بدون تبلیغ، فقط تماشا</b>' +
          '<span class="cxad-copy">عضویت الیت فعال است؛ این جایگاه برای تو خالی می‌ماند.</span>' +
          '<div class="cxad-foot" style="justify-content:center">' +
            '<a class="cx-btn sm p" href="index.html#premium">مدیریت اشتراک</a>' +
            '<a class="cx-btn sm ghost" href="index.html">فروشگاه رونین</a>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  function finish(premium) {
    var el = box();
    if (!el) return;
    el.style.visibility = "";
    if (premium) { eliteCard(el); el.hidden = false; return; }
    if (!el.innerHTML.trim()) {
      el.innerHTML = '<div class="cxad-main" style="padding:16px"><div class="cxad-top"><span class="cxad-badge">AD</span>' +
        '<span class="cxad-brand">RONIN ADS</span></div><b class="cxad-title">جایگاه تبلیغ رونین</b>' +
        '<span class="cxad-copy">اینجا محصول یا کانالت را به بازدیدکنندگان رونین فیلم نشان بده.</span>' +
        '<div class="cxad-foot"><a class="cx-btn sm p" href="index.html#ads">رزرو جایگاه</a></div></div>';
    }
    el.hidden = false;
  }

  function boot() {
    var done = false;
    var reveal = function (prem) { if (!done) { done = true; finish(prem); } };
    if (window.firebase) {
      try {
        var app = firebase.apps && firebase.apps.length ? firebase.app() : null;
        if (app) {
          app.auth().onAuthStateChanged(function (u) {
            if (!u) return reveal(false);
            app.database().ref("users/" + u.uid).once("value").then(function (snap) {
              var v = snap.val() || {};
              var prem = v.role === "owner" || v.prem === true;
              if (v.premExp && v.premExp < Date.now()) prem = false;
              reveal(prem);
            }).catch(function () { reveal(false); });
          });
        }
      } catch (e) {}
    }
    setTimeout(function () { reveal(false); }, 2600);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
