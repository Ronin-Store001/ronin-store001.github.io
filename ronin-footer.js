/* ═══ RONIN STORE — FOOTER v6 · ronin-footer.js · سه‌زبانه و سبک
   برند • پشتیبانی • دسترسی سریع • قوانین و پرسش‌ها
   فرم پیام به پشتیبانی • کارت پیام‌ها در پنل مالک • وضعیت اتصال
   همهٔ متن‌ها با زبان سایت عوض می‌شوند. */
"use strict";
(function () {
  var MSG = "contact", CFG = "settings/contact", LS = "ronin_contact_at";
  var LANGS = ["fa", "en", "tr"], LNAMES = { fa: "فارسی", en: "English", tr: "Türkçe" };
  var VER = "v6", lastLang = null;

  function el(i) { return document.getElementById(i); }
  function esc(s) { return (window.R && R.esc) ? R.esc(s) : String(s == null ? "" : s); }
  function clean(s, n) { return (window.R && R.clean) ? R.clean(s, n || 200) : String(s || "").slice(0, n || 200); }
  function toast(m, k) { if (window.R && R.toast) R.toast(m, k || "ok"); }
  function count(o) { return o ? Object.keys(o).length : 0; }
  function lang() {
    try {
      if (window.R && R.i18n && R.i18n.get) {
        var l = R.i18n.get();
        return LANGS.indexOf(l) >= 0 ? l : "fa";
      }
    } catch (e) {}
    return "fa";
  }
  function isFa() { return lang() === "fa"; }
  function t(k) { var x = T[k]; return x ? (x[lang()] || x.fa) : k; }
  function num(n) { return (isFa() && window.R && R.fa) ? R.fa(String(n)) : String(n); }
  function when(ts) {
    if (!ts) return "";
    if (isFa() && window.R && R.time) return R.time(ts);
    try { return new Date(ts).toLocaleDateString(lang() === "tr" ? "tr-TR" : "en-GB"); } catch (e) { return ""; }
  }

  var T = {
    tagline: {
      fa: "دنیای انیمه: کشف انیمه، خبر و تریلر، انجمن و چت، فروشگاه و آگهی، و دنیای پرمیوم — جایی که خودت می‌سازی.",
      en: "Anime world: discover anime, news and trailers, community and chat, store and listings, plus premium.",
      tr: "Anime dünyası: anime, haber ve fragman, topluluk ve sohbet, mağaza ve ilanlar, premium dünya."
    },
    colRonin: { fa: "رونین", en: "Ronin", tr: "Ronin" },
    colQuick: { fa: "دسترسی سریع", en: "Quick access", tr: "Hızlı erişim" },
    colMe: { fa: "حساب من", en: "My account", tr: "Hesabım" },
    colHelp: { fa: "پشتیبانی", en: "Support", tr: "Destek" },
    support: { fa: "پشتیبانی", en: "Support", tr: "Destek" },
    about: { fa: "درباره ما", en: "About us", tr: "Hakkımızda" },
    rules: { fa: "قوانین انجمن", en: "Community rules", tr: "Topluluk kuralları" },
    privacy: { fa: "حریم خصوصی", en: "Privacy", tr: "Gizlilik" },
    terms: { fa: "شرایط استفاده", en: "Terms of use", tr: "Kullanım Şartları" },
    faq: { fa: "پرسش‌های پرتکرار", en: "FAQ", tr: "SSS" },
    anime: { fa: "انیمه", en: "Anime", tr: "Anime" },
    news: { fa: "اخبار", en: "News", tr: "Haberler" },
    bulletin: { fa: "اطلاعیه و تریلر", en: "Announcements & trailers", tr: "Duyurular ve fragmanlar" },
    community: { fa: "انجمن", en: "Community", tr: "Topluluk" },
    market: { fa: "فروشگاه", en: "Store", tr: "Mağaza" },
    premium: { fa: "پرمیوم", en: "Premium", tr: "Premium" },
    profile: { fa: "پروفایل", en: "Profile", tr: "Profil" },
    settings: { fa: "تنظیمات", en: "Settings", tr: "Ayarlar" },
    inbox: { fa: "صندوق پیام", en: "Inbox", tr: "Gelen kutusu" },
    archive: { fa: "آرشیو", en: "Archive", tr: "Arşiv" },
    login: { fa: "ورود / ثبت‌نام", en: "Log in / Sign up", tr: "Giriş / Kayıt" },
    ownerMail: { fa: "پشتیبانی", en: "Support", tr: "Destek" },
    ownerMailAlt: { fa: "پشتیبانی", en: "Support", tr: "Destek" },
    sendMsg: { fa: "پیام به پشتیبانی", en: "Message support", tr: "Desteğe yaz" },
    supportLine: { fa: "پیامت مستقیم به تیم پشتیبانی می‌رسد؛ ایمیلت منتشر نمی‌شود.", en: "Your message goes to the support team; your email is never published.", tr: "Mesajın destek ekibine gider; e-postan yayınlanmaz." },
    chatUsers: { fa: "چت با کاربران", en: "Chat with users", tr: "Kullanıcılarla sohbet" },
    yourName: { fa: "نام شما", en: "Your name", tr: "Adınız" },
    yourContact: { fa: "ایمیل یا راه ارتباطی", en: "Email or contact", tr: "E-posta veya iletişim" },
    msgBody: { fa: "پیامت را بنویس…", en: "Write your message…", tr: "Mesajını yaz…" },
    send: { fa: "ارسال پیام", en: "Send message", tr: "Mesaj gönder" },
    clear: { fa: "پاک کردن", en: "Clear", tr: "Temizle" },
    note: {
      fa: "پیامت مستقیم به تیم پشتیبانی می‌رسد. ایمیلت جایی منتشر نمی‌شود.",
      en: "Your message goes straight to the support team. Your email is never published.",
      tr: "Mesajın doğrudan destek ekibine gider. E-postan hiçbir yerde yayınlanmaz."
    },
    sub1: { fa: "پیشنهاد", en: "Suggestion", tr: "Öneri" },
    sub2: { fa: "گزارش مشکل", en: "Report a problem", tr: "Sorun bildir" },
    sub3: { fa: "تبلیغات و همکاری", en: "Ads & partnership", tr: "Reklam ve iş birliği" },
    sub4: { fa: "شکایت", en: "Complaint", tr: "Şikayet" },
    sub5: { fa: "درخواست پرمیوم", en: "Premium request", tr: "Premium talebi" },
    sub6: { fa: "سایر", en: "Other", tr: "Diğer" },
    rights: { fa: "همه حقوق محفوظ است", en: "All rights reserved", tr: "Tüm hakları saklıdır" },
    madeWith: { fa: "ساخته‌شده با ❤ برای دنیای انیمه", en: "Made with ❤ for the anime world", tr: "Anime dünyası için ❤ ile yapıldı" },
    statUsers: { fa: "کاربران", en: "Users", tr: "Kullanıcılar" },
    statPosts: { fa: "پست‌ها", en: "Posts", tr: "Gönderiler" },
    statAds: { fa: "آگهی‌ها", en: "Listings", tr: "İlanlar" },
    onNet: { fa: "آنلاین", en: "online", tr: "çevrimiçi" },
    offNet: { fa: "آفلاین", en: "offline", tr: "çevrimdışı" },
    toTop: { fa: "بالا", en: "Top", tr: "Yukarı" },
    share: { fa: "اشتراک سایت", en: "Share site", tr: "Siteyi paylaş" },
    shareOk: { fa: "🔗 لینک کپی شد", en: "🔗 Link copied", tr: "🔗 Bağlantı kopyalandı" },
    errConn: { fa: "اتصال برقرار نشد ❌", en: "Connection failed ❌", tr: "Bağlantı kurulamadı ❌" },
    errWait: { fa: "کمی صبر کن، بعد دوباره بفرست ⏳", en: "Please wait before sending again ⏳", tr: "Biraz bekle, sonra gönder ⏳" },
    errName: { fa: "نامت را بنویس", en: "Please write your name", tr: "Lütfen adını yaz" },
    errContact: { fa: "راه ارتباطی را بنویس", en: "Please add a contact", tr: "Lütfen iletişim bilgisi ekle" },
    errShort: { fa: "پیامت خیلی کوتاه است", en: "Your message is too short", tr: "Mesajın çok kısa" },
    sending: { fa: "در حال ارسال…", en: "Sending…", tr: "Gönderiliyor…" },
    sent: { fa: "پیامت رسید ✅ ممنون!", en: "Message sent ✅ thank you!", tr: "Mesajın ulaştı ✅ teşekkürler!" },
    sendFail: { fa: "ارسال نشد: ", en: "Failed to send: ", tr: "Gönderilemedi: " },
    ownerOnly: { fa: "فقط مالک 👑", en: "Owner only 👑", tr: "Sadece yönetici 👑" },
    saved: { fa: "ذخیره شد ✅", en: "Saved ✅", tr: "Kaydedildi ✅" },
    saveFail: { fa: "ذخیره نشد: ", en: "Not saved: ", tr: "Kaydedilemedi: " },
    deleted: { fa: "حذف شد 🗑", en: "Deleted 🗑", tr: "Silindi 🗑" },
    npcSent: { fa: "پیامت به پشتیبانی رسید! 📨", en: "Your message reached support! 📨", tr: "Mesajın desteğe ulaştı! 📨" },
    notifNew: { fa: "📨 پیام جدید از ", en: "📨 New message from ", tr: "📨 Yeni mesaj: " },
    ownerCardTitle: { fa: "📨 پیام‌های پشتیبانی", en: "📨 Support messages", tr: "📨 Destek mesajları" },
    ownerCardDesc: {
      fa: "پیام‌هایی که کاربران از فرم پشتیبانی سایت می‌فرستند.",
      en: "Messages users send from the site support form.",
      tr: "Kullanıcıların sitedeki destek formundan gönderdiği mesajlar."
    },
    ownerMailIn: {
      fa: "ایمیل پشتیبانی (برای دکمهٔ تماس فوتر)",
      en: "Support email (for the footer contact button)",
      tr: "Destek e-postası (alt bilgi iletişim düğmesi için)"
    },
    saveMail: { fa: "💾 ذخیره ایمیل پشتیبانی", en: "💾 Save support email", tr: "💾 Destek e-postasını kaydet" },
    unread: { fa: "نخوانده", en: "unread", tr: "okunmamış" },
    noMsg: { fa: "هنوز پیامی نیامده 📨", en: "No messages yet 📨", tr: "Henüz mesaj yok 📨" },
    msgFallback: { fa: "پیام", en: "Message", tr: "Mesaj" },
    userFallback: { fa: "کاربر", en: "User", tr: "Kullanıcı" }
  };

  var PAGES = {
    about: {
      fa: { t: "🏯 درباره رونین استور", p: [
        "رونین استور دنیای دیجیتال عاشقان انیمه است: کشف انیمه، خبر و تریلر، انجمن و چت، فروشگاه و آگهی، و دنیای پرمیوم.",
        "این‌جا هم انیمه می‌بینی، هم رفیق پیدا می‌کنی و هم خودت محتوا می‌سازی. فروشندگان آگهی می‌گذارند و خریدار مستقیم با آن‌ها تماس می‌گیرد."
      ] },
      en: { t: "🏯 About Ronin Store", p: [
        "Ronin Store is a digital world for anime fans: anime discovery, news and trailers, community and chat, store and listings, plus premium.",
        "Watch anime, find friends and create your own content. Sellers post listings and buyers contact them directly."
      ] },
      tr: { t: "🏯 Ronin Store Hakkında", p: [
        "Ronin Store anime severler için dijital bir dünya: anime keşfi, haber ve fragman, topluluk ve sohbet, mağaza ve ilanlar, premium.",
        "Anime izle, arkadaş bul, kendi içeriğini üret. Satıcılar ilan verir, alıcı doğrudan iletişime geçer."
      ] }
    },
    rules: {
      fa: { t: "📜 قوانین انجمن", p: [
        "توهین، تهدید و آزار ممنوع است. اسپم و تبلیغ بی‌ربط در پست و چت ممنوع است.",
        "محتوای کپی‌رایت‌دار را بدون اجازه منتشر نکنید؛ فروش کالا فقط از مسیر «فروشگاه».",
        "تخلف = حذف محتوا یا محدودیت حساب. گزارش: دکمهٔ 🚩 یا فرم پایین سایت."
      ] },
      en: { t: "📜 Community rules", p: [
        "Insults, threats and harassment are forbidden. No spam or unrelated promotion in posts or chat.",
        "Do not publish copyrighted content; selling goods only through the Store.",
        "Violation = content removal or account restriction. Report via 🚩 or the form below."
      ] },
      tr: { t: "📜 Topluluk kuralları", p: [
        "Hakaret, tehdit ve taciz yasaktır. Gönderi ve sohbette spam ve alakasız tanıtım yasaktır.",
        "Telif hakkı olan içeriği izinsiz yayınlamayın; ürün satışı yalnızca Mağaza üzerinden.",
        "İhlal = içeriğin kaldırılması veya hesap kısıtı. Bildirim: 🚩 veya aşağıdaki form."
      ] }
    },
    privacy: {
      fa: { t: "🔒 حریم خصوصی", p: [
        "ذخیره می‌کنیم: نام نمایشی، ایمیل، پروفایل و محتوایی که می‌سازی. عمومی است: نام، آواتار، پست‌ها و آمار (لایک/دنبال‌کننده).",
        "ایمیل هرگز عمومی نمی‌شود و رمز نزد ما نیست — ورود با سرویس امن فایربیس است.",
        "هر وقت بخواهی می‌توانی حساب و محتوات را حذف کنی؛ از فرم پایین پیام بده."
      ] },
      en: { t: "🔒 Privacy", p: [
        "We store: display name, email, profile and your content. Public: name, avatar, posts and stats (likes/followers).",
        "Your email is never public and we never store your password — sign-in uses Firebase.",
        "You can delete your account and content anytime; message us below."
      ] },
      tr: { t: "🔒 Gizlilik", p: [
        "Sakladıklarımız: görünen ad, e-posta, profil ve içeriğin. Herkese açık: ad, avatar, gönderiler ve istatistikler.",
        "E-postan asla herkese açık olmaz, şifreni saklamayız — giriş Firebase ile yapılır.",
        "Hesabını ve içeriğini istediğin zaman silebilirsin; aşağıdaki formdan yaz."
      ] }
    },
    terms: {
      fa: { t: "⚖️ شرایط استفاده", p: [
        "با ساخت حساب با قوانین رونین موافقت می‌کنی و مسئولیت محتوایی که منتشر می‌کنی با خودت است.",
        "معاملات فروشگاه بین خریدار و فروشنده است؛ رونین استور فقط پلتفرم آگهی است.",
        "محتوای خلاف قوانین حذف و دسترسی محدود می‌شود؛ تغییر قوانین در سایت اطلاع‌رسانی می‌شود."
      ] },
      en: { t: "⚖️ Terms of use", p: [
        "By creating an account you accept the Ronin rules and you are responsible for your content.",
        "Store deals are between buyer and seller; Ronin Store is only a listings platform.",
        "Rule-breaking content is removed and access limited; changes are announced on the site."
      ] },
      tr: { t: "⚖️ Kullanım Şartları", p: [
        "Hesap açarak Ronin kurallarını kabul edersin ve içeriğinden sen sorumlusun.",
        "Mağaza alışverişi alıcı ile satıcı arasındadır; Ronin Store yalnızca ilan platformudur.",
        "Kurallara aykırı içerik kaldırılır, erişim kısıtlanır; değişiklikler sitede duyurulur."
      ] }
    },
    faq: {
      fa: { t: "❓ پرسش‌های پرتکرار", p: [
        "<b>پرمیوم؟</b> از بخش 💎 پرمیوم درخواست بده؛ مالک بعد از بررسی فعال می‌کند.",
        "<b>آگهی؟</b> منو → بازار رونین → تبلیغات و آگهی. آگهی بعد از تایید مالک منتشر می‌شود.",
        "<b>گروه چت؟</b> با پرمیوم یا اجازه مالک — از بخش گروه‌های چت.",
        "<b>رمز را فراموش کردم؟</b> در صفحهٔ ورود «رمزت را فراموش کردی؟» را بزن."
      ] },
      en: { t: "❓ FAQ", p: [
        "<b>Premium?</b> Request it in 💎 Premium; the owner activates it after review.",
        "<b>Listing?</b> Menu → Ronin Market → Ads & listings. Listings go live after approval.",
        "<b>Chat group?</b> With premium or the owner's permission — from Chat Groups.",
        "<b>Forgot password?</b> On the login screen tap “Forgot your password?”."
      ] },
      tr: { t: "❓ SSS", p: [
        "<b>Premium?</b> 💎 Premium bölümünden talep et; yönetici incelemeden sonra açar.",
        "<b>İlan?</b> Menü → Ronin Pazarı → Reklam ve ilan. İlanlar onaydan sonra yayınlanır.",
        "<b>Sohbet grubu?</b> Premium veya yönetici izniyle — Sohbet Grupları bölümünden.",
        "<b>Şifremi unuttum?</b> Giriş ekranında “Şifreni mi unuttun?” seçeneğine dokun."
      ] }
    }
  };

  function page(k) {
    var p = PAGES[k]; if (!p) return null;
    var v = p[lang()] || p.fa;
    return { t: v.t, h: v.p.map(function (x) { return "<p>" + x + "</p>"; }).join("") };
  }

  function css() {
    if (el("ftCss")) return;
    var s = document.createElement("style"); s.id = "ftCss";
    s.textContent =
      "#rnFoot{margin-top:38px;padding:0;border:0;background:transparent}" +
      ".ftShell{display:grid;grid-template-columns:1.55fr 1fr 1fr;gap:24px;padding:22px 24px;border:1px solid rgba(130,215,255,.16);border-radius:24px;background:linear-gradient(150deg,rgba(18,24,55,.76),rgba(7,11,27,.72));box-shadow:0 20px 48px rgba(0,0,0,.28)}" +
      ".ftIntro{display:flex;flex-direction:column;gap:10px;min-width:0}" +
      ".ftSupport{display:flex;align-items:center;gap:10px;padding:10px;border:1px solid rgba(34,211,238,.24);border-radius:15px;background:linear-gradient(135deg,rgba(124,92,255,.15),rgba(34,211,238,.08));margin-top:2px}" +
      ".ftSupportIcon{flex:0 0 33px;width:33px;height:33px;display:grid;place-items:center;border-radius:10px;background:linear-gradient(135deg,#7c5cff,#22d3ee);font-size:15px}" +
      ".ftSupportBody{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:1px}" +
      ".ftSupportBody b{font-size:12px}" +
      ".ftSupportBody span{font-size:10px;color:#aeb8dc;line-height:1.7}" +
      ".ftSupportLink{flex:0 0 auto;font-size:10.5px;font-weight:800;color:#8ff5ff;white-space:nowrap;padding:6px 8px;border-radius:9px;background:rgba(34,211,238,.1);border:1px solid rgba(34,211,238,.16)}" +
      ".ftSupportLink:hover{color:#fff;background:rgba(34,211,238,.2)}" +
      ".ftIntroFoot{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}" +
      ".ftBar{margin:0;padding:12px 3px 0;border-top:1px solid rgba(140,160,255,.12);display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;align-items:center;font-size:11px;opacity:.75}" +
      ".ftMini{border:1px solid rgba(140,160,255,.2);background:rgba(255,255,255,.04);color:inherit;font:inherit;font-size:10px;padding:4px 8px;border-radius:20px;cursor:pointer}" +
      ".ftMini:hover{border-color:rgba(34,211,238,.5);background:rgba(34,211,238,.12)}" +
      ".ftCol{display:flex;flex-direction:column;gap:7px;min-width:0;padding-top:2px}" +
      ".ftCol>b{font-size:11px;font-weight:900;letter-spacing:.02em;opacity:.95;margin-bottom:2px;color:#dfe5ff}" +
      ".ftCol a{cursor:pointer;font-size:11.5px;opacity:.8;text-decoration:none;transition:.2s;width:fit-content}" +
      ".ftCol a:hover{opacity:1;color:#7ee7ff;transform:translateX(-2px)}" +
      "#rnFoot .ftLogo{display:flex;align-items:center;gap:9px;font-weight:900;font-size:16px}" +
      "#rnFoot .ftLogo i{font-style:normal;width:30px;height:30px;border-radius:9px;display:grid;place-items:center;background:linear-gradient(135deg,#7c5cff,#22d3ee);font-size:16px;color:#fff}" +
      "#rnFoot .ftTx{font-size:11.5px;opacity:.72;line-height:1.9;margin:0;max-width:340px}" +
      "#rnFoot .ftNet{display:inline-flex;align-items:center;gap:6px;font-size:10px;padding:3px 9px;border-radius:20px;border:1px solid rgba(140,160,255,.2);background:rgba(255,255,255,.04);opacity:.85;width:fit-content}" +
      "#rnFoot .ftNet b{width:7px;height:7px;border-radius:50%;background:#5df0b0;box-shadow:0 0 8px #5df0b0}" +
      "#rnFoot .ftNet.off b{background:#ff8fa3;box-shadow:0 0 8px #ff8fa3}" +
      ".ftPanel{margin-top:12px;border:1px solid rgba(130,215,255,.18);border-radius:18px;overflow:hidden;background:rgba(255,255,255,.035);display:none}" +
      ".ftPanel.on{display:block}" +
      ".ftPanel .ftPh{display:flex;justify-content:space-between;align-items:center;padding:10px 13px;border-bottom:1px solid rgba(130,215,255,.14);font-size:12.5px;font-weight:800}" +
      ".ftPanel .ftPb{padding:13px}" +
      "#ftOwnerList .ftm{display:flex;gap:9px;align-items:flex-start;padding:9px 10px;border-radius:12px;border:1px solid rgba(140,160,255,.16);background:rgba(255,255,255,.03);margin-top:7px}" +
      "#ftOwnerList .ftm.un{border-color:rgba(34,211,238,.55)}" +
      "#ftOwnerList .ftm .grow{flex:1 1 auto;min-width:0}" +
      "@media (max-width:900px){.ftShell{grid-template-columns:1.4fr 1fr 1fr;gap:16px;padding:18px}.ftSupportLink{display:none}}" +
      "@media (max-width:640px){.ftShell{grid-template-columns:1fr 1fr;gap:16px;padding:16px;border-radius:19px}.ftIntro{grid-column:1/-1}.ftSupportLink{display:inline-block}.ftBar{font-size:10px}}" +
      "@media (max-width:420px){.ftShell{grid-template-columns:1fr}.ftCol{gap:6px}.ftIntroFoot{justify-content:flex-start}}";
    document.head.appendChild(s);
  }

  function statsHTML() {
    var u = count(window.R && R.USERS), p = count(window.R && R.POSTS);
    var a = count(window.R && (R.PRODUCTS || R.PENDING)) || 0;
    if (!u && !p) return "";
    function box(v, k) { return "<div><b>" + num(v) + "</b>" + t(k) + "</div>"; }
    return '<div class="ftStats">' + box(u, "statUsers") + box(p, "statPosts") +
      (a ? box(a, "statAds") : "") + "</div>";
  }

  function accountHTML() {
    if (!(window.R && R.ME)) return '<a data-authopen="login">' + esc(t("login")) + "</a>";
    return '<a data-ftgo="profile">👤 ' + esc(t("profile")) + "</a>" +
      '<a data-ftgo="inbox">📥 ' + esc(t("inbox")) + "</a>" +
      '<a data-ftgo="settings">⚙ ' + esc(t("settings")) + "</a>" +
      '<a data-ftgo="archive">🗂 ' + esc(t("archive")) + "</a>";
  }

  function netHTML() {
    var off = !navigator.onLine;
    return '<div class="ftNet' + (off ? " off" : "") + '" id="ftNet"><b></b>' +
      "<span>" + esc(t(off ? "offNet" : "onNet")) + "</span></div>";
  }

  function bodyHTML() {
    var y = new Date().getFullYear();
    return '<div class="ftShell">' +
        '<div class="ftIntro">' +
          '<div class="ftLogo"><i>忍</i><b>RONIN STORE</b></div>' +
          '<p class="ftTx">' + esc(t("tagline")) + "</p>" +
          '<div class="ftSupport">' +
            '<div class="ftSupportIcon">✉</div>' +
            '<div class="ftSupportBody"><b>' + esc(t("support")) + '</b><span>' + esc(t("supportLine")) + '</span></div>' +
            '<a id="ftMail" class="ftSupportLink" href="#" data-ftopen="1">' + esc(t("support")) + '</a>' +
          '</div>' +
          '<div class="ftIntroFoot">' + netHTML() + "</div>" +
        '</div>' +
        '<div class="ftCol"><b>' + esc(t("colQuick")) + "</b>" +
          '<a data-ftgo="anime">' + esc(t("anime")) + "</a>" +
          '<a data-ftgo="community">' + esc(t("community")) + "</a>" +
          '<a data-ftgo="market">' + esc(t("market")) + "</a>" +
          '<a data-ftgo="chat">' + esc(t("chatUsers")) + "</a>" +
          '<a data-ftgo="premium">💎 ' + esc(t("premium")) + "</a></div>" +
        '<div class="ftCol"><b>' + esc(t("colHelp")) + "</b>" +
          '<a data-ftpage="faq">' + esc(t("faq")) + "</a>" +
          '<a data-ftpage="rules">' + esc(t("rules")) + "</a>" +
          '<a data-ftpage="privacy">' + esc(t("privacy")) + "</a>" +
          '<a data-ftpage="terms">' + esc(t("terms")) + "</a>" +
          '<a data-ftopen="1">📨 ' + esc(t("sendMsg")) + "</a></div>" +
      "</div>" +
      '<div class="ftPanel" id="ftPanel">' +
        '<div class="ftPh"><span>📨 ' + esc(t("sendMsg")) + "</span>" +
        '<button class="icobtn" type="button" id="ftClose">✕</button></div>' +
        '<div class="ftPb"><div class="grid g2 mb">' +
            '<input class="inp" id="ftName" placeholder="' + esc(t("yourName")) + '" maxlength="40">' +
            '<input class="inp" id="ftContact" placeholder="' + esc(t("yourContact")) + '" dir="ltr" maxlength="80">' +
          "</div>" +
          '<select class="sel mb" id="ftSubject">' +
            ["sub1", "sub2", "sub3", "sub4", "sub5", "sub6"].map(function (k) {
              return "<option>" + esc(t(k)) + "</option>";
            }).join("") + "</select>" +
          '<textarea class="area mb" id="ftText" placeholder="' + esc(t("msgBody")) + '" maxlength="1200"></textarea>' +
          '<input type="text" id="ftHp" style="display:none" tabindex="-1" autocomplete="off">' +
          '<div class="row" style="gap:8px;flex-wrap:wrap">' +
            '<button class="btn p mini" type="button" id="ftSend">🚀 ' + esc(t("send")) + "</button>" +
            '<button class="btn mini" type="button" id="ftClear">' + esc(t("clear")) + "</button>" +
          "</div>" +
          '<div class="xs mut mt" id="ftNote">' + esc(t("note")) + "</div></div>" +
      "</div>" +
      '<div class="ftBar"><span>© ' + (window.R && R.fa ? R.fa(y) : y) + " RONIN STORE — " +
        esc(t("rights")) + "</span>" +
        '<div class="side"><span>' + esc(t("madeWith")) + "</span>" +
          '<button class="ftMini" type="button" data-fttop="1">↑ ' + esc(t("toTop")) + "</button>" +
        "</div>" +
      "</div>";
  }

  function render() {
    if (!window.R || !el("stage")) return;
    css();
    var f = el("rnFoot");
    if (!f) {
      f = document.createElement("footer");
      f.id = "rnFoot";
      f.setAttribute("data-noi18n", "");
      el("stage").appendChild(f);
      lastLang = lang();
      f.innerHTML = bodyHTML();
      loadCfg();
      return;
    }
    var keep = {
      name: el("ftName") ? el("ftName").value : "",
      contact: el("ftContact") ? el("ftContact").value : "",
      text: el("ftText") ? el("ftText").value : "",
      subject: el("ftSubject") ? el("ftSubject").selectedIndex : 0,
      open: !!(el("ftPanel") && el("ftPanel").classList.contains("on"))
    };
    f.innerHTML = bodyHTML();
    lastLang = lang();
    if (el("ftName")) el("ftName").value = keep.name;
    if (el("ftContact")) el("ftContact").value = keep.contact;
    if (el("ftText")) el("ftText").value = keep.text;
    if (el("ftSubject") && keep.subject < el("ftSubject").options.length) el("ftSubject").selectedIndex = keep.subject;
    if (keep.open && el("ftPanel")) el("ftPanel").classList.add("on");
    loadCfg();
  }

  function sync() {
    if (!el("rnFoot")) { render(); return; }
    if (lang() !== lastLang) render();
  }

  function loadCfg() {
    if (!window.R || !R.get) return;
    R.get(CFG).then(function (v) {
      var a = el("ftMail"), c = (v && v.mail) || "";
      if (!a) return;
      a.textContent = "✉️ " + t("ownerMail");
      a.setAttribute("aria-label", t("ownerMail"));
      if (c) { a.href = "mailto:" + c; a.removeAttribute("data-ftopen"); }
      else {
        a.href = "javascript:void(0)";
        a.setAttribute("data-ftopen", "1");
      }
    }).catch(function () {});
  }

  function open() {
    var p = el("ftPanel"); if (!p) return;
    p.classList.add("on");
    try { p.scrollIntoView({ behavior: "smooth", block: "center" }); } catch (e) {}
    var n = el("ftName"); if (n) n.focus();
  }
  function close() { var p = el("ftPanel"); if (p) p.classList.remove("on"); }
  function reset() {
    ["ftName", "ftContact", "ftText", "ftHp"].forEach(function (i) { var x = el(i); if (x) x.value = ""; });
    if (el("ftSubject")) el("ftSubject").selectedIndex = 0;
  }

  function send() {
    if (!window.R || !R.db) return toast(t("errConn"), "err");
    if (el("ftHp") && el("ftHp").value) return;
    var last = 0;
    try { last = parseInt(localStorage.getItem(LS) || "0", 10) || 0; } catch (e) {}
    if (Date.now() - last < 45000) return toast(t("errWait"), "err");
    var nm = clean(el("ftName") ? el("ftName").value : "", 40);
    var ct = clean(el("ftContact") ? el("ftContact").value : "", 80);
    var tx = clean(el("ftText") ? el("ftText").value : "", 800);
    if (nm.length < 2) return toast(t("errName"), "err");
    if (ct.length < 3) return toast(t("errContact"), "err");
    if (tx.length < 10) return toast(t("errShort"), "err");
    var subj = el("ftSubject") ? el("ftSubject").value : "";
    var b = el("ftSend");
    if (b) { b.disabled = true; b.textContent = t("sending"); }
    R.add(MSG, {
      t: Date.now(), name: nm, contact: ct,
      subject: clean(subj, 30), text: tx, by: R.ME || "", read: false
    }).then(function () {
      try { localStorage.setItem(LS, String(Date.now())); } catch (e) {}
      toast(t("sent"), "ok");
      reset(); close();
      if (R.npcSay) R.npcSay(t("npcSent"), 3400);
      if (R.notify && R.OWNER_UID && R.ME !== R.OWNER_UID) {
        R.notify(R.OWNER_UID, t("notifNew") + nm + " — " + subj, "info", "");
      }
    }).catch(function (e) {
      toast(t("sendFail") + e.message, "err");
    }).then(function () {
      if (b) { b.disabled = false; b.textContent = "🚀 " + t("send"); }
    });
  }

  function ownerCard() {
    var sec = el("sec-owner");
    if (!sec || el("ftOwnerCard")) return;
    if (!window.R || !R.isOwner()) return;
    var d = document.createElement("div");
    d.className = "card mb";
    d.id = "ftOwnerCard";
    d.setAttribute("data-noi18n", "");
    d.innerHTML =
      '<div class="between"><span class="sm b">' + esc(t("ownerCardTitle")) + "</span>" +
      '<span class="chip cy" id="ftOwnerCnt">—</span></div>' +
      '<div class="xs mut mt mb">' + esc(t("ownerCardDesc")) + "</div>" +
      '<div class="grid g2 mb">' +
        '<input class="inp" id="ftMailIn" placeholder="' + esc(t("ownerMailIn")) + '" dir="ltr" maxlength="80">' +
        '<button class="btn p mini" type="button" id="ftMailSave">' + esc(t("saveMail")) + "</button>" +
      '</div><div id="ftOwnerList"></div>';
    var head = sec.querySelector(".tabs");
    if (head && head.parentNode) head.parentNode.insertBefore(d, head);
    else sec.appendChild(d);
    watchOwner();
  }

  function watchOwner() {
    if (!window.R || !R.db || R._ftW) return;
    R._ftW = true;
    R.db.ref(MSG).limitToLast(50).on("value", function (s) {
      renderOwner(s.val() || {});
    }, function () {});
    R.get(CFG).then(function (c) {
      var i = el("ftMailIn");
      if (i && c && c.mail && !i.value) i.value = c.mail;
    }).catch(function () {});
  }

  function renderOwner(v) {
    var box = el("ftOwnerList"); if (!box) return;
    var arr = Object.keys(v).map(function (k) { var m = v[k] || {}; m.id = k; return m; })
      .sort(function (a, b) { return (b.t || 0) - (a.t || 0); });
    var un = arr.filter(function (m) { return !m.read; }).length;
    if (el("ftOwnerCnt")) el("ftOwnerCnt").textContent = num(un) + " " + t("unread") + " / " + num(arr.length);
    if (!arr.length) { box.innerHTML = '<div class="empty">' + esc(t("noMsg")) + "</div>"; return; }
    box.innerHTML = arr.map(function (m) {
      return '<div class="ftm' + (m.read ? "" : " un") + '">' +
        '<div style="font-size:18px">📨</div><div class="grow">' +
          '<b class="sm">' + esc(m.name || t("userFallback")) + " — " + esc(m.subject || t("msgFallback")) + "</b>" +
          '<div class="xs mut" dir="ltr">' + esc(m.contact || "") + "</div>" +
          '<div class="sm mt" style="white-space:pre-wrap">' + esc(m.text || "") + "</div>" +
          '<div class="xs mut mt">' + esc(when(m.t)) + "</div></div>" +
        '<div class="col" style="gap:5px">' +
          (m.read ? "" : '<button class="btn mini" type="button" data-ftread="' + esc(m.id) + '">✓</button>') +
          '<button class="btn mini d" type="button" data-ftdel="' + esc(m.id) + '">🗑</button>' +
        "</div></div>";
    }).join("");
  }

  function share() {
    var url = location.origin + location.pathname, txt = "RONIN STORE — " + url;
    if (navigator.share) {
      try {
        var p = navigator.share({ title: "RONIN STORE", text: txt, url: url });
        if (p && p.catch) p.catch(function () {});
        return;
      } catch (e) {}
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(txt).then(function () { toast(t("shareOk"), "ok"); },
        function () { toast(url, "info"); });
      return;
    }
    toast(url, "info");
  }
  function toTop() {
    try { window.scrollTo({ top: 0, behavior: "smooth" }); } catch (e) { window.scrollTo(0, 0); }
  }
  function paintNet() {
    var n = el("ftNet"); if (!n) return;
    var off = !navigator.onLine;
    n.classList.toggle("off", off);
    var s = n.querySelector("span");
    if (s) s.textContent = t(off ? "offNet" : "onNet");
  }

  document.addEventListener("click", function (e) {
    var t0 = e.target;
    if (!t0 || !t0.closest) return;
    var lg = t0.closest("[data-ftlang]");
    if (lg) {
      e.preventDefault();
      var l = lg.getAttribute("data-ftlang");
      if (window.R && R.i18n && R.i18n.set) R.i18n.set(l);
      render();
      return;
    }
    var pg = t0.closest("[data-ftpage]");
    if (pg) {
      e.preventDefault();
      var p = page(pg.getAttribute("data-ftpage"));
      if (!p) return;
      if (window.R && R.openInfo) R.openInfo(p.t, p.h);
      else toast(p.t, "ok");
      return;
    }
    var go = t0.closest("[data-ftgo]");
    if (go) {
      e.preventDefault();
      if (window.R && R.go) R.go(go.getAttribute("data-ftgo"));
      return;
    }
    if (t0.closest("[data-authopen]")) return;
    if (t0.closest("[data-ftshare]")) { e.preventDefault(); return share(); }
    if (t0.closest("[data-fttop]")) { e.preventDefault(); return toTop(); }
    if (t0.closest("[data-ftopen]")) {
      e.preventDefault();
      var pn = el("ftPanel");
      if (pn && pn.classList.contains("on")) close(); else open();
      return;
    }
    if (t0.closest("#ftClose")) { e.preventDefault(); return close(); }
    if (t0.closest("#ftClear")) { e.preventDefault(); return reset(); }
    if (t0.closest("#ftSend")) { e.preventDefault(); return send(); }
    if (t0.closest("#ftMailSave")) {
      e.preventDefault();
      var v = clean(el("ftMailIn") ? el("ftMailIn").value : "", 80);
      R.upd(CFG, { mail: v }).then(function () {
        toast(t("saved"), "ok");
        loadCfg();
      }).catch(function (er) { toast(t("saveFail") + er.message, "err"); });
      return;
    }
    var rd = t0.closest("[data-ftread]");
    if (rd) {
      e.preventDefault();
      if (!R.isOwner()) return;
      R.upd(MSG + "/" + rd.getAttribute("data-ftread"), { read: true });
      return;
    }
    var dl = t0.closest("[data-ftdel]");
    if (dl) {
      e.preventDefault();
      if (!R.isOwner()) return toast(t("ownerOnly"), "err");
      R.db.ref(MSG + "/" + dl.getAttribute("data-ftdel")).remove()
        .then(function () { toast(t("deleted"), "ok"); });
      return;
    }
  }, true);

  window.addEventListener("online", paintNet);
  window.addEventListener("offline", paintNet);

  function hookI18n() {
    if (!window.R || !R.i18n || !R.i18n.set || R.i18n.set.__ft) return;
    var orig = R.i18n.set;
    var wrapped = function () {
      var out = orig.apply(R.i18n, arguments);
      try { render(); } catch (e) {}
      return out;
    };
    wrapped.__ft = true;
    R.i18n.set = wrapped;
  }

  function boot() {
    render();
    ownerCard();
    hookI18n();
    paintNet();
  }

  var prevLogin = window.R && R.onLogin;
  if (window.R) {
    R.onLogin = function () {
      if (prevLogin) { try { prevLogin(); } catch (e) {} }
      setTimeout(boot, 800);
    };
  }
  var prevOut = window.R && R.onLogout;
  if (window.R) {
    R.onLogout = function () {
      if (prevOut) { try { prevOut(); } catch (e) {} }
      setTimeout(render, 300);
    };
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  [800, 1800, 3200, 5200].forEach(function (ms) { setTimeout(boot, ms); });
  setInterval(function () {
    if (!el("rnFoot")) return;
    hookI18n();
    sync();
  }, 1200);

  window.RoninFooter = { render: render, pages: page, t: t, lang: lang, share: share, toTop: toTop, ver: VER };
})();
