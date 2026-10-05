/* ═══ RONIN LITE — حالت کم‌مصرف (فایل جدید؛ به چیزی دست نمی‌زند) ═══ */
(function () {
  var K = "ronin_lite";
  function get() { try { return localStorage.getItem(K) === "1"; } catch (e) { return false; } }
  function set(v) { try { localStorage.setItem(K, v ? "1" : "0"); } catch (e) {} }
  function css() {
    if (document.getElementById("liteCss")) return;
    var s = document.createElement("style"); s.id = "liteCss";
    s.textContent =
      "html.lite .rain,html.lite .fog,html.lite .haze,html.lite .stars,html.lite .scan,html.lite .train{display:none!important}" +
      "html.lite .moon{opacity:.45!important}" +
      "html.lite .skyline,html.lite .sign,html.lite .street{animation:none!important}" +
      "html.lite #top,html.lite #rail,html.lite #dock .dwrap,html.lite .card,html.lite .qc{backdrop-filter:none!important;-webkit-backdrop-filter:none!important}";
    document.head.appendChild(s);
  }
  function paint() {
    var v = get();
    document.documentElement.classList.toggle("lite", v);
    var b = document.getElementById("liteBtn");
    if (b) { b.textContent = v ? "روشن ✅" : "خاموش"; b.classList.toggle("p", v); }
  }
  function flip() {
    set(!get()); paint();
    try { if (window.R && R.toast) R.toast(get() ? "حالت کم‌مصرف روشن شد ⚡" : "حالت کم‌مصرف خاموش شد", "ok"); } catch (e) {}
  }
  css(); paint();
  document.addEventListener("click", function (e) {
    if (e.target && e.target.closest && e.target.closest("#liteBtn")) { e.preventDefault(); flip(); }
  });
})();
