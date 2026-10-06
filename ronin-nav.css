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
