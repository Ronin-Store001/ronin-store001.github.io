/* ═══════════════════════════════════════════════════════════════
   RONIN STORE — FOOTER v3  ·  ronin-footer.js   (سه‌زبانه)
   فوتر کامل: درباره ما • قوانین • حریم خصوصی • شرایط استفاده •
   پرسش‌های پرتکرار • لینک‌های سریع • فرم ارسال پیام به مالک
   ───────────────────────────────────────────────────────────────
   🆕 هر متن فوتر با تغییر زبان سایت (فارسی/English/Türkçe)
      بلافاصله عوض می‌شود — از دکمهٔ 🌐 هدر یا سوییچ زبان خود فوتر.
   پیام‌ها در contact ذخیره می‌شوند و مالک در پنل + زنگ 🔔 می‌بیند.
   این فایل جایگزین نسخهٔ قبلی است (همان نام، همان مسیر).
   ═══════════════════════════════════════════════════════════════ */
"use strict";
(function () {
  var MSG = "contact", CFG = "settings/contact", LS = "ronin_contact_at";
  var LANGS = ["fa", "en", "tr"];
  var LNAMES = { fa: "فارسی", en: "English", tr: "Türkçe" };
  var lastLang = null;

  function el(i) { return document.getElementById(i); }
  function esc(s) { return (window.R && R.esc) ? R.esc(s) : String(s == null ? "" : s); }
  function clean(s, n) { return (window.R && R.clean) ? R.clean(s, n || 200) : String(s || "").slice(0, n || 200); }
  function toast(m, k) { if (window.R && R.toast) R.toast(m, k || "ok"); }

  /* ── ۱. زبان ────────────────────────────────────────────── */
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
  function num(n) {
    var s = String(n);
    return (isFa() && window.R && R.fa) ? R.fa(s) : s;
  }
  function when(ts) {
    if (!ts) return "";
    if (isFa() && window.R && R.time) return R.time(ts);
    try { return new Date(ts).toLocaleDateString(lang() === "tr" ? "tr-TR" : "en-GB"); }
    catch (e) { return ""; }
  }

  /* ── ۲. دیکشنری سه‌زبانه ────────────────────────────────── */
  var T = {
    tagline: {
      fa: "دنیای انیمه: کشف انیمه، خبر و تریلر، انجمن و چت، فروشگاه و آگهی، و دنیای پرمیوم — جایی که خودت می‌سازی.",
      en: "Anime world: discover anime, news and trailers, community and chat, store and listings, plus premium — a world you build yourself.",
      tr: "Anime dünyası: anime keşfet, haber ve fragman, topluluk ve sohbet, mağaza ve ilanlar, premium dünya — kendi kurduğun bir yer."
    },
    colRonin: { fa: "رونین", en: "Ronin", tr: "Ronin" },
    colQuick: { fa: "دسترسی سریع", en: "Quick access", tr: "Hızlı erişim" },
    colHelp: { fa: "پشتیبانی", en: "Support", tr: "Destek" },

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

    ownerMail: { fa: "ایمیل مالک", en: "Owner email", tr: "Yönetici e-postası" },
    ownerMailAlt: { fa: "ایمیل مالک", en: "Email the owner", tr: "Yöneticiye e-posta" },
    sendMsg: { fa: "ارسال پیام به مالک", en: "Message the owner", tr: "Yöneticiye mesaj gönder" },
    chatUsers: { fa: "چت با کاربران", en: "Chat with users", tr: "Kullanıcılarla sohbet" },
    langLabel: { fa: "زبان", en: "Language", tr: "Dil" },

    yourName: { fa: "نام شما", en: "Your name", tr: "Adınız" },
    yourContact: { fa: "ایمیل یا راه ارتباطی", en: "Email or contact", tr: "E-posta veya iletişim" },
    msgBody: { fa: "پیامت را بنویس…", en: "Write your message…", tr: "Mesajını yaz…" },
    send: { fa: "ارسال پیام", en: "Send message", tr: "Mesaj gönder" },
    clear: { fa: "پاک کردن", en: "Clear", tr: "Temizle" },
    note: {
      fa: "پیامت مستقیم به مالک می‌رسد. ایمیلت جایی منتشر نمی‌شود.",
      en: "Your message goes straight to the owner. Your email is never published.",
      tr: "Mesajın doğrudan yöneticiye gider. E-postan hiçbir yerde yayınlanmaz."
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

    errConn: { fa: "اتصال برقرار نشد ❌", en: "Connection failed ❌", tr: "Bağlantı kurulamadı ❌" },
    errWait: { fa: "کمی صبر کن، بعد دوباره بفرست ⏳", en: "Please wait a moment before sending again ⏳", tr: "Biraz bekle, sonra tekrar gönder ⏳" },
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
    npcSent: { fa: "پیامت به مالک رسید! 📨", en: "Your message reached the owner! 📨", tr: "Mesajın yöneticiye ulaştı! 📨" },
    notifNew: { fa: "📨 پیام جدید از ", en: "📨 New message from ", tr: "📨 Yeni mesaj: " },

    ownerCardTitle: { fa: "📨 پیام‌های تماس", en: "📨 Contact messages", tr: "📨 İletişim mesajları" },
    ownerCardDesc: {
      fa: "پیام‌هایی که کاربران از فرم پایین سایت می‌فرستند.",
      en: "Messages users send from the form at the bottom of the site.",
      tr: "Kullanıcıların sitenin altındaki formdan gönderdiği mesajlar."
    },
    ownerMailIn: {
      fa: "ایمیل مالک (برای دکمه ایمیل فوتر)",
      en: "Owner email (for the footer email button)",
      tr: "Yönetici e-postası (alt bilgi e-posta düğmesi için)"
    },
    saveMail: { fa: "💾 ذخیره ایمیل", en: "💾 Save email", tr: "💾 E-postayı kaydet" },
    unread: { fa: "نخوانده", en: "unread", tr: "okunmamış" },
    noMsg: { fa: "هنوز پیامی نیامده 📨", en: "No messages yet 📨", tr: "Henüz mesaj yok 📨" },
    msgFallback: { fa: "پیام", en: "Message", tr: "Mesaj" },
    userFallback: { fa: "کاربر", en: "User", tr: "Kullanıcı" }
  };

  /* ── ۳. صفحه‌های ثابت (سه‌زبانه) ─────────────────────────── */
  var PAGES = {
    about: {
      fa: { t: "🏯 درباره رونین استور", p: [
        "رونین استور یک دنیای دیجیتال برای عاشقان انیمه است: کشف انیمه، خبر و تریلر، انجمن و چت، فروشگاه و آگهی، و دنیای پرمیوم.",
        "هدف ما ساختن جایی است که هم انیمه ببینی، هم رفیق پیدا کنی، هم چیز یاد بگیری و هم بتونی خودت محتوا بسازی.",
        "رونین استور یک <b>پلتفرم تبلیغاتی</b> هم هست: فروشندگان آگهی می‌گذارند و خریدار مستقیم با فروشنده در تماس می‌شود."
      ] },
      en: { t: "🏯 About Ronin Store", p: [
        "Ronin Store is a digital world for anime fans: discover anime, news and trailers, community and chat, store and listings, plus a premium world.",
        "Our goal is a place where you can watch anime, find friends, learn something new and create your own content.",
        "Ronin Store is also an <b>advertising platform</b>: sellers post listings and buyers contact them directly."
      ] },
      tr: { t: "🏯 Ronin Store Hakkında", p: [
        "Ronin Store, anime severler için dijital bir dünya: anime keşfi, haber ve fragmanlar, topluluk ve sohbet, mağaza ve ilanlar, premium dünya.",
        "Amacımız anime izleyebileceğin, arkadaş bulabileceğin, bir şeyler öğrenebileceğin ve kendi içeriğini üretebileceğin bir yer.",
        "Ronin Store aynı zamanda bir <b>reklam platformudur</b>: satıcılar ilan verir, alıcı doğrudan satıcıyla iletişime geçer."
      ] }
    },
    rules: {
      fa: { t: "📜 قوانین انجمن", p: [
        "۱. توهین، توهین قومی، تهدید و آزار ممنوع است.",
        "۲. اسپم و تبلیغ بی‌ربط در پست‌ها و چت ممنوع است.",
        "۳. محتوای کپی‌رایت‌دار را بدون اجازه منتشر نکنید.",
        "۴. هر پست حاوی فروش کالا باید از مسیر «فروشگاه» ثبت شود.",
        "۵. تخلف = حذف محتوا یا محدودیت حساب.",
        "۶. گزارش تخلف: از دکمه 🚩 روی محتوا یا فرم پایین سایت استفاده کن."
      ] },
      en: { t: "📜 Community rules", p: [
        "1. Insults, hate speech, threats and harassment are forbidden.",
        "2. Spam and unrelated promotion in posts and chat are forbidden.",
        "3. Do not publish copyrighted content without permission.",
        "4. Any post selling goods must go through the Store.",
        "5. Violation = content removal or account restriction.",
        "6. Report abuse with the 🚩 button or the form at the bottom of the site."
      ] },
      tr: { t: "📜 Topluluk kuralları", p: [
        "1. Hakaret, nefret söylemi, tehdit ve taciz yasaktır.",
        "2. Gönderilerde ve sohbette spam ve alakasız tanıtım yasaktır.",
        "3. Telif hakkı olan içeriği izinsiz yayınlamayın.",
        "4. Ürün satışı içeren her gönderi Mağaza üzerinden yapılmalıdır.",
        "5. İhlal = içeriğin kaldırılması veya hesabın kısıtlanması.",
        "6. İhlal bildirimi: içerikteki 🚩 düğmesi veya sitenin altındaki form."
      ] }
    },
    privacy: {
      fa: { t: "🔒 حریم خصوصی", p: [
        "چه چیزی ذخیره می‌کنیم: نام نمایشی، ایمیل، پروفایل و محتوایی که خودت می‌سازی.",
        "چه چیزی نمایش داده می‌شود: نام نمایشی، آواتار، پست‌ها و آمار عمومی (لایک/دنبال‌کننده).",
        "ایمیل شما هرگز به‌صورت عمومی نمایش داده نمی‌شود.",
        "رمز عبور شما نزد ما نیست — ورود از طریق سرویس امن فایربیس انجام می‌شود.",
        "می‌توانی هر وقت خواستی حساب و محتوات را حذف کنی؛ از فرم پایین پیام بده."
      ] },
      en: { t: "🔒 Privacy", p: [
        "What we store: display name, email, profile and the content you create.",
        "What is public: display name, avatar, posts and public stats (likes/followers).",
        "Your email is never shown publicly.",
        "We never store your password — sign-in is handled by Firebase's secure service.",
        "You can delete your account and content at any time; message us via the form below."
      ] },
      tr: { t: "🔒 Gizlilik", p: [
        "Neyi saklıyoruz: görünen ad, e-posta, profil ve oluşturduğun içerik.",
        "Neyi herkes görür: görünen ad, avatar, gönderiler ve genel istatistikler (beğeni/takipçi).",
        "E-postan hiçbir zaman herkese açık gösterilmez.",
        "Şifreni biz saklamıyoruz — giriş Firebase'in güvenli servisiyle yapılır.",
        "Hesabını ve içeriğini istediğin zaman silebilirsin; aşağıdaki formdan yaz."
      ] }
    },
    terms: {
      fa: { t: "⚖️ شرایط استفاده", p: [
        "با ساخت حساب، با قوانین رونین موافقت می‌کنی.",
        "مسئولیت محتوایی که منتشر می‌کنی با خودت است.",
        "معاملات فروشگاه بین خریدار و فروشنده است؛ رونین استور فقط پلتفرم آگهی است.",
        "هر وقت لازم باشد، محتوای خلاف قوانین حذف و دسترسی محدود می‌شود.",
        "مدیریت رونین می‌تواند قوانین را با اطلاع‌رسانی در سایت به‌روزرسانی کند."
      ] },
      en: { t: "⚖️ Terms of use", p: [
        "By creating an account you agree to the Ronin rules.",
        "You are responsible for the content you publish.",
        "Store deals happen between buyer and seller; Ronin Store is only a listings platform.",
        "When needed, content that breaks the rules is removed and access is limited.",
        "Ronin's team may update these terms and will announce it on the site."
      ] },
      tr: { t: "⚖️ Kullanım Şartları", p: [
        "Hesap oluşturarak Ronin kurallarını kabul etmiş olursun.",
        "Yayınladığın içerikten sen sorumlusun.",
        "Mağaza alışverişi alıcı ve satıcı arasındadır; Ronin Store yalnızca bir ilan platformudur.",
        "Gerektiğinde kurallara aykırı içerik kaldırılır ve erişim kısıtlanır.",
        "Ronin yönetimi şartları güncelleyebilir ve bunu sitede duyurur."
      ] }
    },
    faq: {
      fa: { t: "❓ پرسش‌های پرتکرار", p: [
        "<b>چطور پرمیوم شوم؟</b> از بخش 💎 پرمیوم درخواست بده؛ مالک بعد از بررسی فعال می‌کند.",
        "<b>چطور آگهی بگذارم؟</b> منو → بازار رونین → تبلیغات و آگهی.",
        "<b>آگهی‌ام چرا دیده نمی‌شود؟</b> آگهی‌ها بعد از تایید مالک منتشر می‌شوند.",
        "<b>چطور گروه چت بسازم؟</b> با پرمیوم یا اجازه مالک — از بخش گروه‌های چت.",
        "<b>رمزمو فراموش کردم؟</b> از صفحه ورود، «رمزت را فراموش کردی؟» را بزن.",
        "<b>مشکلی داشتم؟</b> همین پایین فرم پیام به مالک را پر کن."
      ] },
      en: { t: "❓ FAQ", p: [
        "<b>How do I get premium?</b> Request it from 💎 Premium; the owner activates it after review.",
        "<b>How do I post a listing?</b> Menu → Ronin Market → Ads & listings.",
        "<b>Why is my listing not visible?</b> Listings are published after the owner approves them.",
        "<b>How do I create a chat group?</b> With premium or the owner's permission — from Chat Groups.",
        "<b>I forgot my password?</b> On the login screen tap “Forgot your password?”.",
        "<b>I have a problem.</b> Fill in the message form below."
      ] },
      tr: { t: "❓ SSS", p: [
        "<b>Premium nasıl alırım?</b> 💎 Premium bölümünden talep et; yönetici incelemeden sonra açar.",
        "<b>Nasıl ilan veririm?</b> Menü → Ronin Pazarı → Reklam ve ilan.",
        "<b>İlanım neden görünmüyor?</b> İlanlar yönetici onayından sonra yayınlanır.",
        "<b>Sohbet grubu nasıl oluştururum?</b> Premium veya yönetici izniyle — Sohbet Grupları bölümünden.",
        "<b>Şifremi unuttum.</b> Giriş ekranında “Şifreni mi unuttun?” seçeneğine dokun.",
        "<b>Bir sorunum var.</b> Aşağıdaki mesaj formunu doldur."
      ] }
    }
  };

  function page(k) {
    var p = PAGES[k];
    if (!p) return null;
    var v = p[lang()] || p.fa;
    return { t: v.t, h: v.p.map(function (x) { return "<p>" + x + "</p>"; }).join("") };
  }

  /* ── ۴. استایل ──────────────────────────────────────────── */
  function css() {
    if (el("ftCss")) return;
    var s = document.createElement("style"); s.id = "ftCss";
    s.textContent =
      "#rnFoot{margin-top:34px;border-top:1px solid rgba(140,160,255,.18);padding:22px 4px 14px}" +
      ".ftGrid{display:grid;grid-template-columns:1.4fr 1fr 1fr 1fr;gap:18px}" +
      "@media (max-width:900px){.ftGrid{grid-template-columns:1fr 1fr}}" +
      "@media (max-width:520px){.ftGrid{grid-template-columns:1fr;gap:14px}}" +
      ".ftCol{display:flex;flex-direction:column;gap:7px;min-width:0}" +
      ".ftCol>b{font-size:12.5px;font-weight:900;opacity:.95;margin-bottom:2px}" +
      ".ftCol a{cursor:pointer;font-size:12.5px;opacity:.8;text-decoration:none;transition:.2s;width:fit-content}" +
      ".ftCol a:hover{opacity:1;color:#7ee7ff;transform:translateX(-2px)}" +
      ".ftLogo{display:flex;align-items:center;gap:9px;font-weight:900;font-size:16px}" +
      ".ftLogo i{font-style:normal;width:30px;height:30px;border-radius:9px;display:grid;place-items:center;" +
      "background:linear-gradient(135deg,#7c5cff,#22d3ee);font-size:16px;color:#fff}" +
      ".ftTx{font-size:12px;opacity:.72;line-height:1.9;margin:2px 0 0;max-width:340px}" +
      ".ftLang{display:flex;gap:6px;flex-wrap:wrap;margin-top:4px}" +
      ".ftLang button{border:1px solid rgba(140,160,255,.25);background:rgba(255,255,255,.04);color:inherit;" +
      "font:inherit;font-size:11px;padding:4px 9px;border-radius:20px;cursor:pointer}" +
      ".ftLang button.on{background:linear-gradient(135deg,#7c5cff,#22d3ee);color:#fff;border-color:transparent}" +
      ".ftStats{display:flex;gap:12px;flex-wrap:wrap;margin-top:6px;font-size:11px;opacity:.68}" +
      ".ftStats b{display:block;font-size:13px;opacity:1}" +
      ".ftPanel{margin-top:16px;border:1px solid rgba(140,160,255,.2);border-radius:16px;overflow:hidden;" +
      "background:rgba(255,255,255,.035);display:none}" +
      ".ftPanel.on{display:block}" +
      ".ftPanel .ftPh{display:flex;justify-content:space-between;align-items:center;padding:10px 13px;" +
      "border-bottom:1px solid rgba(140,160,255,.16);font-size:13px;font-weight:800}" +
      ".ftPanel .ftPb{padding:13px}" +
      ".ftBar{margin-top:16px;padding-top:12px;border-top:1px solid rgba(140,160,255,.14);" +
      "display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;font-size:11.5px;opacity:.7}" +
      "#ftOwnerList .ftm{display:flex;gap:9px;align-items:flex-start;padding:9px 10px;border-radius:12px;" +
      "border:1px solid rgba(140,160,255,.16);background:rgba(255,255,255,.03);margin-top:7px}" +
      "#ftOwnerList .ftm.un{border-color:rgba(34,211,238,.55)}" +
      "#ftOwnerList .ftm .grow{flex:1 1 auto;min-width:0}";
    document.head.appendChild(s);
  }

  /* ── ۵. آمار کوچک ───────────────────────────────────────── */
  function count(o) { return o ? Object.keys(o).length : 0; }
  function statsHTML() {
    var u = count(window.R && R.USERS), p = count(window.R && R.POSTS);
    var a = count(window.R && (R.PRODUCTS || R.PENDING)) || 0;
    if (!u && !p) return "";
    function box(v, k) { return "<div><b>" + num(v) + "</b>" + t(k) + "</div>"; }
    return '<div class="ftStats">' + box(u, "statUsers") + box(p, "statPosts") +
      (a ? box(a, "statAds") : "") + "</div>";
  }

  /* ── ۶. بدنهٔ فوتر ──────────────────────────────────────── */
  function bodyHTML() {
    var year = new Date().getFullYear();
    return '<div class="ftGrid">' +
        '<div class="ftCol">' +
          '<div class="ftLogo"><i>忍</i><b>RONIN STORE</b></div>' +
          '<p class="ftTx">' + esc(t("tagline")) + "</p>" +
          statsHTML() +
          '<div class="ftLang">' + LANGS.map(function (l) {
            return '<button type="button" data-ftlang="' + l + '" class="' + (l === lang() ? "on" : "") +
              '">' + LNAMES[l] + "</button>";
          }).join("") + "</div>" +
        "</div>" +
        '<div class="ftCol"><b>' + esc(t("colRonin")) + "</b>" +
          '<a data-ftpage="about">' + esc(t("about")) + "</a>" +
          '<a data-ftpage="rules">' + esc(t("rules")) + "</a>" +
          '<a data-ftpage="privacy">' + esc(t("privacy")) + "</a>" +
          '<a data-ftpage="terms">' + esc(t("terms")) + "</a>" +
        "</div>" +
        '<div class="ftCol"><b>' + esc(t("colQuick")) + "</b>" +
          '<a data-ftgo="anime">' + esc(t("anime")) + "</a>" +
          '<a data-ftgo="news">' + esc(t("news")) + "</a>" +
          '<a data-ftgo="bulletin">' + esc(t("bulletin")) + "</a>" +
          '<a data-ftgo="community">' + esc(t("community")) + "</a>" +
          '<a data-ftgo="market">' + esc(t("market")) + "</a>" +
        "</div>" +
        '<div class="ftCol"><b>' + esc(t("colHelp")) + "</b>" +
          '<a data-ftpage="faq">' + esc(t("faq")) + "</a>" +
          '<a id="ftMail" href="#">✉️ ' + esc(t("ownerMail")) + "</a>" +
          '<a data-ftopen="1">📨 ' + esc(t("sendMsg")) + "</a>" +
          '<a data-ftgo="chat">💬 ' + esc(t("chatUsers")) + "</a>" +
        "</div>" +
      "</div>" +
      '<div class="ftPanel" id="ftPanel">' +
        '<div class="ftPh"><span>📨 ' + esc(t("sendMsg")) + "</span>" +
        '<button class="icobtn" type="button" id="ftClose">✕</button></div>' +
        '<div class="ftPb">' +
          '<div class="grid g2 mb">' +
            '<input class="inp" id="ftName" placeholder="' + esc(t("yourName")) + '" maxlength="40">' +
            '<input class="inp" id="ftContact" placeholder="' + esc(t("yourContact")) + '" dir="ltr" maxlength="80">' +
          "</div>" +
          '<select class="sel mb" id="ftSubject">' +
            ["sub1", "sub2", "sub3", "sub4", "sub5", "sub6"].map(function (k) {
              return "<option>" + esc(t(k)) + "</option>";
            }).join("") +
          "</select>" +
          '<textarea class="area mb" id="ftText" placeholder="' + esc(t("msgBody")) + '" maxlength="1200"></textarea>' +
          '<input type="text" id="ftHp" style="display:none" tabindex="-1" autocomplete="off">' +
          '<div class="row" style="gap:8px;flex-wrap:wrap">' +
            '<button class="btn p mini" type="button" id="ftSend">🚀 ' + esc(t("send")) + "</button>" +
            '<button class="btn mini" type="button" id="ftClear">' + esc(t("clear")) + "</button>" +
          "</div>" +
          '<div class="xs mut mt" id="ftNote">' + esc(t("note")) + "</div>" +
        "</div>" +
      "</div>" +
      '<div class="ftBar">' +
        "<span>© " + (isFa() ? (window.R && R.fa ? R.fa(year) : year) : year) +
          " RONIN STORE — " + esc(t("rights")) + "</span>" +
        "<span>" + esc(t("madeWith")) + "</span>" +
      "</div>";
  }

  /* ── ۷. ساخت و رندر دوباره ──────────────────────────────── */
  function render() {
    if (!window.R || !el("stage")) return;
    css();
    var f = el("rnFoot");
    if (!f) {
      f = document.createElement("footer");
      f.id = "rnFoot";
      f.setAttribute("data-noi18n", "");      /* متن‌ها را خودمان ترجمه می‌کنیم */
      el("stage").appendChild(f);
      lastLang = lang();
      f.innerHTML = bodyHTML();
      loadCfg();
      return;
    }
    /* نگه‌داشتن چیزی که کاربر تایپ کرده و حالت بازِ فرم */
    var keep = {
      name: el("ftName") ? el("ftName").value : "",
      contact: el("ftContact") ? el("ftContact").value : "",
      text: el("ftText") ? el("ftText").value : "",
      subject: el("ftSubject") ? el("ftSubject").selectedIndex : 0,
      open: !!(el("ftPanel") && el("ftPanel").classList.contains("on"))
    };
    lastLang = lang();
    f.innerHTML = bodyHTML();
    if (el("ftName")) el("ftName").value = keep.name;
    if (el("ftContact")) el("ftContact").value = keep.contact;
    if (el("ftText")) el("ftText").value = keep.text;
    if (el("ftSubject") && keep.subject < el("ftSubject").options.length) {
      el("ftSubject").selectedIndex = keep.subject;
    }
    if (keep.open && el("ftPanel")) el("ftPanel").classList.add("on");
    loadCfg();
  }

  function sync() {
    if (!el("rnFoot")) { render(); return; }
    if (lang() !== lastLang) render();
  }

  /* ── ۸. ایمیل/راه ارتباطی مالک ─────────────────────────── */
  function loadCfg() {
    if (!window.R || !R.get) return;
    R.get(CFG).then(function (v) {
      var a = el("ftMail"), c = (v && v.mail) || "";
      if (!a) return;
      if (c) { a.href = "mailto:" + c; a.textContent = "✉️ " + c; a.removeAttribute("data-ftopen"); }
      else {
        a.href = "javascript:void(0)";
        a.textContent = "✉️ " + t("ownerMailAlt");
        a.setAttribute("data-ftopen", "1");
      }
    }).catch(function () {});
  }

  /* ── ۹. فرم پیام ────────────────────────────────────────── */
  function open() {
    var p = el("ftPanel"); if (!p) return;
    p.classList.add("on");
    try { p.scrollIntoView({ behavior: "smooth", block: "center" }); } catch (e) {}
    var n = el("ftName"); if (n) n.focus();
  }
  function close() { var p = el("ftPanel"); if (p) p.classList.remove("on"); }
  function reset() {
    ["ftName", "ftContact", "ftText", "ftHp"].forEach(function (i) {
      var x = el(i); if (x) x.value = "";
    });
    if (el("ftSubject")) el("ftSubject").selectedIndex = 0;
  }

  function send() {
    if (!window.R || !R.db) return toast(t("errConn"), "err");
    if (el("ftHp") && el("ftHp").value) return;                 /* تله اسپم */
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
      t: Date.now(),
      name: nm,
      contact: ct,
      subject: clean(subj, 30),
      text: tx,
      by: R.ME || "",
      read: false
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

  /* ── ۱۰. کارت پیام‌ها در پنل مالک ───────────────────────── */
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
      "</div>" +
      '<div id="ftOwnerList"></div>';
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
    var box = el("ftOwnerList");
    if (!box) return;
    var arr = Object.keys(v).map(function (k) { var m = v[k] || {}; m.id = k; return m; })
      .sort(function (a, b) { return (b.t || 0) - (a.t || 0); });
    var un = arr.filter(function (m) { return !m.read; }).length;
    if (el("ftOwnerCnt")) {
      el("ftOwnerCnt").textContent = num(un) + " " + t("unread") + " / " + num(arr.length);
    }
    if (!arr.length) { box.innerHTML = '<div class="empty">' + esc(t("noMsg")) + "</div>"; return; }
    box.innerHTML = arr.map(function (m) {
      return '<div class="ftm' + (m.read ? "" : " un") + '">' +
        '<div style="font-size:18px">📨</div>' +
        '<div class="grow">' +
          '<b class="sm">' + esc(m.name || t("userFallback")) + " — " + esc(m.subject || t("msgFallback")) + "</b>" +
          '<div class="xs mut" dir="ltr">' + esc(m.contact || "") + "</div>" +
          '<div class="sm mt" style="white-space:pre-wrap">' + esc(m.text || "") + "</div>" +
          '<div class="xs mut mt">' + esc(when(m.t)) + "</div>" +
        "</div>" +
        '<div class="col" style="gap:5px">' +
          (m.read ? "" : '<button class="btn mini" type="button" data-ftread="' + esc(m.id) + '">✓</button>') +
          '<button class="btn mini d" type="button" data-ftdel="' + esc(m.id) + '">🗑</button>' +
        "</div></div>";
    }).join("");
  }

  /* ── ۱۱. کلیک‌ها ────────────────────────────────────────── */
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
      var gg = go.getAttribute("data-ftgo");
      if (window.R && R.go) R.go(gg);
      return;
    }
    if (t0.closest("[data-ftopen]")) {
      e.preventDefault();
      var pn = el("ftPanel");
      if (pn && pn.classList.contains("on")) close(); else open();
      return;
    }
    if (t0.closest("#ftClose")) { e.preventDefault(); return close(); }
    if (t0.closest("#
