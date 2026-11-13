/* RONIN SITE ANALYTICS — شمارندهٔ بازدید سبک و بدون سرویس بیرونی
   هر بازدید یک‌بار در هر نشست در Firebase زیر site/views/<صفحه>/<تاریخ> ثبت می‌شود.
   هیچ اطلاعات شخصی ذخیره نمی‌شود. */
"use strict";
(function () {
  if (window.__rnStats) return;
  window.__rnStats = true;

  var DB = "https://ronin-store3d738-default-rtdb.firebaseio.com";
  var page = (location.pathname.split("/").pop() || "index.html").replace(/\.html$/, "") || "index";
  if (page === "" || page === "/") page = "index";
  var key = "rn_seen_" + page;

  try { if (sessionStorage.getItem(key)) return; } catch (e) {}

  var d = new Date();
  var day = d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2);
  var path = "site/views/" + page + "/" + day;

  function bump(node) {
    fetch(DB + "/" + node + ".json")
      .then(function (r) { return r.json(); })
      .then(function (v) {
        var n = (+v || 0) + 1;
        return fetch(DB + "/" + node + ".json", {
          method: "PUT", headers: { "Content-Type": "application/json" }, body: String(n)
        });
      })
      .then(function () { try { sessionStorage.setItem(key, "1"); } catch (e) {} })
      .catch(function () {});
  }

  bump(path);
  bump("site/views/_total/" + day);
  setTimeout(function () { bump("site/views/" + page + "/_last"); }, 1200);
})();
