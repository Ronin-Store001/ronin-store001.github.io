/* RONIN NAV — باز/بسته کردن گروه‌های منو (به بقیه‌ی کد دست نمی‌زند) */
(function(){
  function init(){
    var rail=document.getElementById("rail");
    if(!rail||rail.dataset.grpBound)return;
    rail.dataset.grpBound="1";
    rail.addEventListener("click",function(e){
      var h=e.target.closest&&e.target.closest(".rghead");
      if(!h)return;
      var g=h.parentNode;
      if(g&&g.classList)g.classList.toggle("open");
    });
    var on=rail.querySelector(".ditem.on");
    if(on&&on.closest){var g=on.closest(".rgroup");if(g)g.classList.add("open");}
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);
  else init();
  setTimeout(init,900);
})();

/* لودر عمومی ماژول‌های رونین */
function rl(src){
  if(document.querySelector('script[src^="'+src+'"]'))return;
  var s=document.createElement("script");
  s.src=src; s.defer=true;
  document.body.appendChild(s);
}

/* RONIN ANIME WORLD — بخش انیمه (خودش بخش، منو و استایل را می‌سازد) */
rl("ronin-anime-pro.js?v=1");

/* RONIN ANIME PLUS — هیرو اسلایدری انیمه */
rl("ronin-anime-plus.js?v=1");

/* RONIN ANIME PLAYER — پلیر کامل + دکمه بازگشت به خانه */
rl("ronin-anime-player.js?v=1");

/* RONIN PREMIUM VIP — تایمر معکوس و خرید از تلگرام */
rl("ronin-premium-vip.js?v=1");

/* RONIN LANG & MONEY — زبان انگلیسی و واحد پول */
rl("ronin-lang-money.js?v=1");
