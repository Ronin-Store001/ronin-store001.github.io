/* تست cart-plus.js با DOM واقعی index.html */
const fs = require("fs");
const path = require("path");
const { JSDOM } = require("/tmp/ronin-test/node_modules/jsdom");

const ROOT = "/workspace/chats/1404b5064df3e5fcf5a5bc70";
const dom = new JSDOM(fs.readFileSync(path.join(ROOT, "index.html"), "utf8"),
  { runScripts: "outside-only", url: "https://x.test/" });
const { window } = dom;
const document = window.document;

let fails = 0, checks = 0;
function ok(name, cond, extra) {
  checks++;
  if (cond) console.log("  ✅ " + name);
  else { fails++; console.log("  ❌ " + name + (extra ? " → " + extra : "")); }
}

const orders = [], notifs = [], added = [];
const R = {
  ME: "u1", USER: { name: "خریدار" }, PRODS: {}, role: "user",
  $: (id) => document.getElementById(id),
  esc: (s) => String(s == null ? "" : s),
  fa: (n) => String(n).replace(/\d/g, d => "۰۱۲۳۴۵۶۷۸۹"[d]),
  money: (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ","),
  clean: (s, m) => String(s || "").trim().slice(0, m || 999),
  toast: (m) => { R.lastToast = m; },
  mod: (id, on) => { const m = document.getElementById(id); if (m) m.classList.toggle("on", on !== false); },
  closeMod: (id) => { const m = document.getElementById(id); if (m) m.classList.remove("on"); },
  needLogin: (w) => { R.needLoginFor = w; },
  notify: (to, text, kind, link) => notifs.push({ to, text, kind, link }),
  add: (p, o) => { added.push({ p, o }); orders.push(o); return Promise.resolve(); },
  xp: () => {},
  renderShop: () => {},
  curProd: null,
  prodCard: function (p) {
    return '<div class="prod"><div class="pinfo"><div class="sm b">' + p.name + "</div>" +
      '<div class="row between"><span class="price">' + p.price + "</span>" +
      '<button class="btn p mini" data-prod="' + p.id + '">مشاهده</button></div></div></div>';
  },
  openProd: function (id) {
    R.curProd = R.PRODS[id];
    const b = document.getElementById("prodBody");
    b.innerHTML = '<div class="sm">' + (R.curProd ? R.curProd.name : "") +
      '</div><div class="price">' + (R.curProd ? R.curProd.price : "") + "</div><div>desc</div>";
    R.mod("prodMod", true);
  }
};
window.R = R;
window.localStorage.clear();

/* محصولات آزمایشی: قیمت با رقم فارسی و جداکننده */
R.PRODS = {
  p1: { id: "p1", name: "فنر ناروتو", price: "۱۲۰,۰۰۰", cur: "تومان", sellerUid: "s1", sellerName: "فروشگاه A", icon: "🎁" },
  p2: { id: "p2", name: "پوستر ایتاچی", price: "80000", cur: "تومان", sellerUid: "s1", icon: "🖼" },
  p3: { id: "p3", name: "کتاب مانگا", price: "250000", cur: "تومان", sellerUid: "s2", icon: "📕" },
  p4: { id: "p4", name: "آگهی خودم", price: "1000", cur: "تومان", sellerUid: "u1", icon: "🎁" }
};

window.eval(fs.readFileSync(path.join(ROOT, "cart-plus.js"), "utf8"));
if (!window.R.cart || !document.getElementById("cartMod")) {
  document.dispatchEvent(new window.Event("DOMContentLoaded"));
}

const click = (elm) => elm.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
const wait = (ms) => new Promise(r => setTimeout(r, ms));

(async () => {
  console.log("\n— ۱) ساختار");
  ok("دکمهٔ سبد در هدر", !!document.getElementById("cartBtn"));
  ok("شمارنده مخفی در حالت خالی", document.getElementById("cartBadge").classList.contains("hide"));
  ok("مودال سبد ساخته شد", !!document.getElementById("cartMod"));

  console.log("\n— ۲) افزودن");
  R.cart.add("p1");
  ok("یک کالا در سبد", R.cart.count() === 1);
  ok("شمارنده دیده می‌شود", !document.getElementById("cartBadge").classList.contains("hide"));
  ok("در localStorage ذخیره شد", /p1/.test(window.localStorage.getItem("ronin-cart-v1")));
  R.cart.add("p1");
  ok("تعداد زیاد شد", R.cart.count() === 2);
  R.cart.add("p4");
  ok("آگهی خودم اضافه نمی‌شود", R.cart.count() === 2);

  console.log("\n— ۳) دکمهٔ کارت محصول");
  const card = R.prodCard(R.PRODS.p2);
  ok("دکمهٔ 🛒 روی کارت هست", /data-cartadd="p2"/.test(card));
  const wrap = document.createElement("div");
  wrap.innerHTML = card;
  document.body.appendChild(wrap);
  click(wrap.querySelector('[data-cartadd="p2"]'));
  ok("با کلیک اضافه شد", !!R.cart.lines().find(l => l.id === "p2"));

  console.log("\n— ۴) بازکردن سبد و محاسبهٔ جمع");
  R.cart.open();
  const rows = document.querySelectorAll("#cartRows .crow");
  ok("دو ردیف در سبد (p1 و p2)", rows.length === 2);
  ok("مودال باز است", document.getElementById("cartMod").classList.contains("on"));
  ok("جمع تعداد", R.cart.count() === 3);
  ok("جمع مبلغ درست (فارسی)", R.cart.total() === 120000 * 2 + 80000);

  const plus = document.querySelector('[data-cq="p2:1"]');
  click(plus);
  ok("دکمهٔ + تعداد را زیاد کرد", R.cart.total() === 120000 * 2 + 80000 * 2);
  click(document.querySelector('[data-cq="p2:-1"]'));
  ok("دکمهٔ − تعداد را کم کرد", R.cart.total() === 120000 * 2 + 80000);
  click(document.querySelector('[data-cq="p2:-1"]'));
  ok("کم‌کردن تا صفر کالا را حذف کرد", !R.cart.lines().find(l => l.id === "p2"));

  console.log("\n— ۵) حذف و بازگشت از localStorage");
  R.cart.add("p3");
  click(document.querySelector('[data-cdel="p3"]'));
  ok("حذف با 🗑", !R.cart.lines().find(l => l.id === "p3"));

  console.log("\n— ۶) اعتبارسنجی سفارش");
  R.cart.open();
  document.getElementById("cName").value = "";
  document.getElementById("cContact").value = "tel";
  click(document.getElementById("cCheckout"));
  ok("بدون نام رد می‌شود", /نامت/.test(document.getElementById("cMsg").textContent));
  document.getElementById("cName").value = "رضا";
  document.getElementById("cContact").value = "";
  click(document.getElementById("cCheckout"));
  ok("بدون راه ارتباطی رد می‌شود", /ارتباطی/.test(document.getElementById("cMsg").textContent));
  ok("سفارشی ثبت نشد", orders.length === 0);

  console.log("\n— ۷) ثبت سفارش");
  R.cart.add("p3");                       /* حالا s1 و s2 داریم */
  document.getElementById("cName").value = "رضا";
  document.getElementById("cContact").value = "@reza";
  document.getElementById("cNote").value = "تهران";
  click(document.getElementById("cCheckout"));
  await wait(60);

  ok("دو سفارش (یکی برای هر فروشنده)", orders.length === 2);
  const s1 = orders.find(o => o.sellerUid === "s1"), s2 = orders.find(o => o.sellerUid === "s2");
  ok("سفارش فروشندهٔ اول", !!s1 && s1.qty === "2" && s1.price === "240000");
  ok("سفارش فروشندهٔ دوم", !!s2 && s2.price === "250000" && /مانگا/.test(s2.pname));
  ok("نام و راه ارتباطی ذخیره شد", s1.buyerName === "رضا" && s1.contact === "@reza");
  ok("توضیح + ریز کالاها", /تهران/.test(s1.msg) && /فنر ناروتو/.test(s1.msg));
  ok("به هر دو فروشنده اعلان رفت", notifs.some(n => n.to === "s1") && notifs.some(n => n.to === "s2"));
  ok("اعلان به مالک", notifs.some(n => n.to === R.OWNER_UID));
  ok("سبد خالی شد", R.cart.count() === 0);
  ok("شمارنده مخفی شد", document.getElementById("cartBadge").classList.contains("hide"));
  ok("مودال بسته شد", !document.getElementById("cartMod").classList.contains("on"));

  console.log("\n— ۸) دکمه در مودال محصول");
  R.openProd("p2");
  await wait(60);
  ok("دکمهٔ افزودن در مودال محصول", !!document.querySelector('#prodBody [data-cartadd="p2"]'));

  console.log("\n— ۹) مهمان");
  R.ME = null;
  R.cart.add("p1");
  R.cart.open();
  document.getElementById("cName").value = "مهمان";
  document.getElementById("cContact").value = "x";
  click(document.getElementById("cCheckout"));
  await wait(40);
  ok("مهمان به ورود هدایت می‌شود", R.needLoginFor === "ثبت سفارش" && orders.length === 2);

  console.log("\n— ۱۰) بارگذاری مجدد سبد از localStorage");
  R.ME = "u1";
  R.cart.add("p2");
  const saved = window.localStorage.getItem("ronin-cart-v1");
  ok("سبد در localStorage هست", /p2/.test(saved));

  console.log("\n" + (fails ? "❌ " + fails + " از " + checks + " رد شد" : "✅ همهٔ " + checks + " بررسی پاس شد"));
  process.exit(fails ? 1 : 0);
})();
