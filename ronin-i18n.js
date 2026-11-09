/* ═══════════════════════════════════════════════════════════════
   RONIN STORE — I18N · ronin-i18n.js
   سه‌زبانه: فارسی (fa) · English (en) · Türkçe (tr)
   • دیکشنری فارسی→en/tr + جایگزینی متن در DOM
   • محتوای کاربر (پست/چت/اسم) هرگز ترجمه نمی‌شود
   • دکمه‌ی 🌐 روی هدر برای سوییچ زبان
   ═══════════════════════════════════════════════════════════════ */
"use strict";
(function () {
  var LS = "ronin_lang";
  var LANGS = ["fa", "en", "tr"];
  var NAMES = { fa: "فارسی", en: "English", tr: "Türkçe" };
  var DIR   = { fa: "rtl", en: "ltr", tr: "ltr" };

  /* ── دیکشنری ─────────────────────────────────────────── */
  var D = {
    /* ناوبری و منو */
    "خانه": { en: "Home", tr: "Ana Sayfa" },
    "انیمه": { en: "Anime", tr: "Anime" },
    "اخبار": { en: "News", tr: "Haberler" },
    "اخبار انیمه": { en: "Anime News", tr: "Anime Haberleri" },
    "انجمن": { en: "Community", tr: "Topluluk" },
    "فروشگاه": { en: "Store", tr: "Mağaza" },
    "پرمیوم": { en: "Premium", tr: "Premium" },
    "چت": { en: "Chat", tr: "Sohbet" },
    "چت عمومی": { en: "Public Chat", tr: "Genel Sohbet" },
    "گروه‌های چت": { en: "Chat Groups", tr: "Sohbet Grupları" },
    "رتبه‌بندی": { en: "Rankings", tr: "Sıralama" },
    "رویدادها": { en: "Events", tr: "Etkinlikler" },
    "تبلیغات": { en: "Ads", tr: "Reklamlar" },
    "تبلیغات و آگهی": { en: "Ads & Listings", tr: "Reklam ve İlan" },
    "کاوش": { en: "Explore", tr: "Keşfet" },
    "کشف تازه‌ها": { en: "Discover", tr: "Keşfet" },
    "اطلاعیه‌ها": { en: "Announcements", tr: "Duyurular" },
    "اطلاعیه و تریلر": { en: "Announcements & Trailers", tr: "Duyurular ve Fragmanlar" },
    "پروفایل": { en: "Profile", tr: "Profil" },
    "تنظیمات": { en: "Settings", tr: "Ayarlar" },
    "شبکه فرماندهی": { en: "Command Network", tr: "Komuta Ağı" },
    "پنل مالک": { en: "Owner Panel", tr: "Yönetici Paneli" },
    "ورود": { en: "Log in", tr: "Giriş" },
    "ثبت‌نام": { en: "Sign up", tr: "Kayıt Ol" },
    "ورود / ثبت‌نام": { en: "Log in / Sign up", tr: "Giriş / Kayıt Ol" },
    "خروج": { en: "Log out", tr: "Çıkış" },
    "ناوبری": { en: "Navigation", tr: "Gezinme" },
    "تیم": { en: "Team", tr: "Ekip" },
    "حساب": { en: "Account", tr: "Hesap" },
    "حساب من": { en: "My Account", tr: "Hesabım" },
    "مهمان": { en: "Guest", tr: "Misafir" },
    "کاربر": { en: "User", tr: "Kullanıcı" },
    "دنیای انیمه": { en: "Anime World", tr: "Anime Dünyası" },
    "جامعه رونین": { en: "Ronin Community", tr: "Ronin Topluluğu" },
    "بازار رونین": { en: "Ronin Market", tr: "Ronin Pazarı" },
    "مدیریت تیم": { en: "Team Management", tr: "Ekip Yönetimi" },
    "دنیای من": { en: "My World", tr: "Dünyam" },
    "آرشیو": { en: "Archive", tr: "Arşiv" },
    "پیشرفت": { en: "Progress", tr: "İlerleme" },
    "صندوق": { en: "Inbox", tr: "Gelen Kutusu" },
    "قابلیت‌های ویژه": { en: "Premium Features", tr: "Özel Özellikler" },
    "زبان": { en: "Language", tr: "Dil" },

    /* خانه / هیرو */
    "به دنیای Ronin Store خوش آمدی": { en: "Welcome to the Ronin Store universe", tr: "Ronin Store evrenine hoş geldin" },
    "انیمه، اخبار، جامعه، فروشگاه و دنیایی که خودت می‌سازی.": { en: "Anime, news, community, store — a world you build yourself.", tr: "Anime, haber, topluluk, mağaza ve kendi kurduğun bir dünya." },
    "شروع ماجراجویی": { en: "Start your journey", tr: "Yolculuğa başla" },
    "مشاهده انیمه‌ها": { en: "Browse anime", tr: "Animeleri gör" },
    "دسترسی سریع": { en: "Quick access", tr: "Hızlı erişim" },
    "شروع کن": { en: "Get started", tr: "Başla" },
    "بیشتر بدان": { en: "Learn more", tr: "Daha fazla" },
    "رونین استور چیست؟": { en: "What is Ronin Store?", tr: "Ronin Store nedir?" },
    "کشف و پیگیری انیمه‌ها": { en: "Discover and track anime", tr: "Animeleri keşfet ve takip et" },
    "آخرین خبرهای دنیای انیمه": { en: "Latest anime news", tr: "En son anime haberleri" },
    "آگهی محصولات و فروشندگان": { en: "Product & seller listings", tr: "Ürün ve satıcı ilanları" },
    "پست، لایک، کامنت، فالو": { en: "Posts, likes, comments, follows", tr: "Gönderi, beğeni, yorum, takip" },
    "گفتگوی زنده با کاربران": { en: "Live chat with users", tr: "Kullanıcılarla canlı sohbet" },
    "قابلیت‌های ویژه رونین": { en: "Exclusive Ronin features", tr: "Ronin'e özel özellikler" },
    "آنلاین": { en: "online", tr: "çevrimiçi" },

    /* بخش‌ها */
    "شبکه انیمه": { en: "Anime Network", tr: "Anime Ağı" },
    "خبرنامه رونین": { en: "Ronin News", tr: "Ronin Haberleri" },
    "انجمن رونین": { en: "Ronin Community", tr: "Ronin Topluluğu" },
    "مرکز فرماندهی رونین": { en: "Ronin Command Center", tr: "Ronin Komuta Merkezi" },
    "فروشگاه رونین": { en: "Ronin Market", tr: "Ronin Mağazası" },
    "رتبه‌بندی رونین": { en: "Ronin Rankings", tr: "Ronin Sıralaması" },

    /* ورود / ثبت‌نام */
    "ورود به رونین": { en: "Log in to Ronin", tr: "Ronin'e giriş" },
    "ایمیل": { en: "Email", tr: "E-posta" },
    "رمز عبور": { en: "Password", tr: "Şifre" },
    "نام نمایشی": { en: "Display name", tr: "Görünen ad" },
    "تکرار رمز عبور": { en: "Confirm password", tr: "Şifre tekrarı" },
    "رمزت را فراموش کردی؟": { en: "Forgot your password?", tr: "Şifreni mi unuttun?" },

    /* دکمه‌های عمومی */
    "ارسال": { en: "Send", tr: "Gönder" },
    "ذخیره": { en: "Save", tr: "Kaydet" },
    "ذخیره شد": { en: "Saved", tr: "Kaydedildi" },
    "حذف": { en: "Delete", tr: "Sil" },
    "ویرایش": { en: "Edit", tr: "Düzenle" },
    "تایید": { en: "Approve", tr: "Onayla" },
    "رد": { en: "Reject", tr: "Reddet" },
    "بستن": { en: "Close", tr: "Kapat" },
    "لغو": { en: "Cancel", tr: "İptal" },
    "جستجو": { en: "Search", tr: "Ara" },
    "اعلان‌ها": { en: "Notifications", tr: "Bildirimler" },
    "پیام‌ها": { en: "Messages", tr: "Mesajlar" },
    "همه خوانده شد": { en: "Mark all as read", tr: "Tümünü okundu say" },
    "در حال بارگذاری…": { en: "Loading…", tr: "Yükleniyor…" },

    /* انجمن */
    "چه خبر؟ از انیمه‌ای بگو، نظرسنجی بگذار…": { en: "What's up? Talk anime, add a poll…", tr: "Ne haber? Animeden bahset, anket ekle…" },
    "افزودن نظرسنجی": { en: "Add a poll", tr: "Anket ekle" },
    "انتشار پست": { en: "Publish post", tr: "Gönderiyi yayınla" },
    "گزینه ۱": { en: "Option 1", tr: "Seçenek 1" },
    "گزینه ۲": { en: "Option 2", tr: "Seçenek 2" },
    "گزینه ۳ (اختیاری)": { en: "Option 3 (optional)", tr: "Seçenek 3 (isteğe bağlı)" },
    "برای تو": { en: "For you", tr: "Sana özel" },
    "داغ": { en: "Trending", tr: "Trend" },
    "دنبال‌شده‌ها": { en: "Following", tr: "Takip Edilenler" },
    "پست‌های من": { en: "My posts", tr: "Gönderilerim" },

    /* فروشگاه / تبلیغات */
    "نام محصول": { en: "Product name", tr: "Ürün adı" },
    "قیمت": { en: "Price", tr: "Fiyat" },
    "دسته": { en: "Category", tr: "Kategori" },
    "توضیح": { en: "Description", tr: "Açıklama" },
    "ارسال آگهی": { en: "Submit listing", tr: "İlan gönder" },
    "ثبت آگهی جدید": { en: "New listing", tr: "Yeni ilan" },
    "آگهی‌های من": { en: "My listings", tr: "İlanlarım" },
    "خرید": { en: "Buy", tr: "Satın al" },
    "درخواست": { en: "Request", tr: "Talep" },
    "ارسال درخواست": { en: "Send request", tr: "Talep gönder" },

    /* پرمیوم */
    "مشاهده پرمیوم": { en: "View Premium", tr: "Premium'u gör" },
    "درخواست پرمیوم": { en: "Request Premium", tr: "Premium talep et" },
    "رنگ کاراکتر": { en: "Companion color", tr: "Yardımcı rengi" },
    "رنگ کاراکتر راهنما": { en: "Companion color", tr: "Yardımcı rengi" },
    "قاب پروفایل": { en: "Profile frame", tr: "Profil çerçevesi" },
    "نشان Elite": { en: "Elite badge", tr: "Elite rozeti" },

    /* پنل مالک */
    "کاربران": { en: "Users", tr: "Kullanıcılar" },
    "تایید محتوا": { en: "Content approval", tr: "İçerik onayı" },
    "آگهی‌ها": { en: "Listings", tr: "İlanlar" },
    "سفارش‌ها": { en: "Orders", tr: "Siparişler" },
    "گزارش‌ها": { en: "Reports", tr: "Şikayetler" },
    "نمای کلی": { en: "Overview", tr: "Genel bakış" },
    "پست‌ها": { en: "Posts", tr: "Gönderiler" },

    /* تنظیمات و فوتر */
    "حساب من": { en: "My Account", tr: "Hesabım" },
    "خروج از حساب": { en: "Log out", tr: "Hesaptan çık" },
    "موسیقی محیطی انیمه": { en: "Anime ambient music", tr: "Anime ortam müziği" },
    "تنظیمات اعلان‌ها": { en: "Notification settings", tr: "Bildirim ayarları" },
    "درباره ما": { en: "About us", tr: "Hakkımızda" },
    "قوانین انجمن": { en: "Community rules", tr: "Topluluk kuralları" },
    "حریم خصوصی": { en: "Privacy", tr: "Gizlilik" },
    "شرایط استفاده": { en: "Terms of use", tr: "Kullanım Şartları" },
    "پرسش‌های پرتکرار": { en: "FAQ", tr: "SSS" },
    "تماس با ما": { en: "Contact us", tr: "Bize ulaşın" },
    "ارسال پیام": { en: "Send message", tr: "Mesaj gönder" },

    /* ── ناوبری و بخش‌های اصلی ── */
    "خانه": { en: "Home", tr: "Ana Sayfa" },
    "کاوش": { en: "Explore", tr: "Keşfet" },
    "جامعه": { en: "Community", tr: "Topluluk" },
    "بازار": { en: "Market", tr: "Pazar" },
    "فروشگاه": { en: "Store", tr: "Mağaza" },
    "چت عمومی": { en: "Public Chat", tr: "Genel Sohbet" },
    "رتبه‌بندی": { en: "Rankings", tr: "Sıralama" },
    "رویدادها": { en: "Events", tr: "Etkinlikler" },
    "اطلاعیه‌ها": { en: "Announcements", tr: "Duyurular" },
    "تبلیغات": { en: "Ads", tr: "Reklamlar" },
    "حساب من": { en: "My Account", tr: "Hesabım" },
    "پروفایل": { en: "Profile", tr: "Profil" },
    "پرمیوم": { en: "Premium", tr: "Premium" },
    "تنظیمات": { en: "Settings", tr: "Ayarlar" },
    "پنل مالک": { en: "Owner Panel", tr: "Yönetici Paneli" },
    "شبکه فرماندهی": { en: "Command Network", tr: "Komuta Ağı" },
    "شبکه فرماندهی رونین": { en: "Ronin Command Network", tr: "Ronin Komuta Ağı" },
    "تیم": { en: "Team", tr: "Ekip" },
    "آرشیو": { en: "Archive", tr: "Arşiv" },
    "صندوق": { en: "Inbox", tr: "Gelen Kutusu" },
    "ورود": { en: "Log in", tr: "Giriş" },
    "ثبت‌نام": { en: "Sign up", tr: "Kayıt Ol" },
    "خروج": { en: "Log out", tr: "Çıkış" },
    "ورود / ثبت‌نام": { en: "Log in / Sign up", tr: "Giriş / Kayıt" },
    "جستجو": { en: "Search", tr: "Ara" },
    "اعلان‌ها": { en: "Notifications", tr: "Bildirimler" },
    "سبد خرید": { en: "Cart", tr: "Sepet" },
    "پست": { en: "Post", tr: "Gönderi" },
    "عضو": { en: "Member", tr: "Üye" },
    "آنلاین": { en: "Online", tr: "Çevrimiçi" },
    "کاربر": { en: "User", tr: "Kullanıcı" },
    "مالک": { en: "Owner", tr: "Yönetici" },
    "مدیر": { en: "Admin", tr: "Yönetici" },
    "کارمند": { en: "Staff", tr: "Personel" },
    "ناظر": { en: "Moderator", tr: "Moderatör" },
    "سطح": { en: "Level", tr: "Seviye" },
    "نفر آنلاین": { en: "people online", tr: "kişi çevrimiçi" },

    /* ── انجمن و جامعه ── */
    "قلب جامعه رونین": { en: "The heart of Ronin", tr: "Ronin topluluğunun kalbi" },
    "پست، گفتگو و آدم‌های تازه — جای تو اینجاست.": { en: "Posts, conversations and new people — your place is here.", tr: "Gönderiler, sohbetler ve yeni insanlar — yerin burada." },
    "نوشتن پست": { en: "Write a post", tr: "Gönderi yaz" },
    "یک پست تازه": { en: "A fresh post", tr: "Yeni bir gönderi" },
    "با جامعه به اشتراک بذار": { en: "Share it with the community", tr: "Toplulukla paylaş" },
    "صدای تو را می‌خواهیم": { en: "We want to hear you", tr: "Seni duymak istiyoruz" },
    "برای پست‌گذاشتن وارد شو": { en: "Log in to post", tr: "Gönderi için giriş yap" },
    "با احترام حرف بزن؛ توهین ممنوع.": { en: "Speak with respect; insults are forbidden.", tr: "Saygılı konuş; hakaret yasaktır." },
    "اسپم و تبلیغ بی‌ربط نفرست.": { en: "No spam or unrelated promotion.", tr: "Spam veya alakasız tanıtım gönderme." },
    "محتوای دیگران را با اجازه منتشر کن.": { en: "Share others' content with permission.", tr: "Başkalarının içeriğini izinle paylaş." },
    "قوانین": { en: "Rules", tr: "Kurallar" },
    "قوانین کامل ←": { en: "Full rules ←", tr: "Tüm kurallar ←" },
    "داغ‌ترین‌ها": { en: "Trending now", tr: "Şu an trend" },
    "همین حالا": { en: "Right now", tr: "Şu anda" },
    "صدای برتر": { en: "Top voices", tr: "Öne çıkanlar" },
    "قوانین کوتاه": { en: "Quick rules", tr: "Kısa kurallar" },
    "برای تو": { en: "For you", tr: "Sana özel" },
    "داغ": { en: "Trending", tr: "Trend" },
    "دنبال‌شده‌ها": { en: "Following", tr: "Takip edilenler" },
    "پست‌های من": { en: "My posts", tr: "Gönderilerim" },
    "چه خبر؟ یه پست بنویس، نظرسنجی بگذار…": { en: "What's up? Write a post, add a poll…", tr: "Ne haber? Gönderi yaz, anket ekle…" },
    "افزودن نظرسنجی": { en: "Add a poll", tr: "Anket ekle" },
    "گزینه ۱": { en: "Option 1", tr: "Seçenek 1" },
    "گزینه ۲": { en: "Option 2", tr: "Seçenek 2" },
    "گزینه ۳ (اختیاری)": { en: "Option 3 (optional)", tr: "Seçenek 3 (isteğe bağlı)" },
    "انتشار پست": { en: "Publish post", tr: "Gönderiyi yayınla" },
    "هنوز پستی اینجا نیست ✨": { en: "No posts here yet ✨", tr: "Burada henüz gönderi yok ✨" },
    "اولین نفر باش!": { en: "Be the first!", tr: "İlk sen ol!" },
    "چند نفر را دنبال کن تا پست‌هاشون بیاد": { en: "Follow some people to see their posts", tr: "Gönderilerini görmek için birkaç kişiyi takip et" },
    "هنوز گفتگویی داغ نشده — تو شروعش کن.": { en: "No hot conversation yet — start one.", tr: "Henüz hareketli bir sohbet yok — sen başlat." },
    "با اولین پست، صدای برتر اینجا شکل می‌گیرد.": { en: "The top voices will appear after the first posts.", tr: "İlk gönderilerle öne çıkanlar burada görünecek." },
    "پست بدون متن": { en: "Post without text", tr: "Metinsiz gönderi" },
    "هنوز کامنتی نیست — اولی باش 💬": { en: "No comments yet — be the first 💬", tr: "Henüz yorum yok — ilk sen ol 💬" },
    "کامنت بنویس…": { en: "Write a comment…", tr: "Yorum yaz…" },
    "برای کامنت وارد شو": { en: "Log in to comment", tr: "Yorum için giriş yap" },
    "برای رأی‌دادن بزن": { en: "Tap to vote", tr: "Oy vermek için dokun" },
    "رأی تو ثبت شد ✅": { en: "Your vote is saved ✅", tr: "Oyun kaydedildi ✅" },
    "رأی": { en: "votes", tr: "oy" },
    "نظرسنجی": { en: "Poll", tr: "Anket" },
    "گزارش": { en: "Report", tr: "Bildir" },
    "حذف": { en: "Delete", tr: "Sil" },
    "ذخیره": { en: "Save", tr: "Kaydet" },
    "ذخیره شد": { en: "Saved", tr: "Kaydedildi" },
    "ارسال": { en: "Send", tr: "Gönder" },
    "ارسال شد": { en: "Sent", tr: "Gönderildi" },
    "حذف شد": { en: "Deleted", tr: "Silindi" },
    "پست گذاشتن": { en: "posting", tr: "gönderi paylaşma" },

    /* ── چت، فروشگاه و بخش‌ها ── */
    "اتاق رونین": { en: "Ronin room", tr: "Ronin odası" },
    "گفتگوی زنده": { en: "Live conversation", tr: "Canlı sohbet" },
    "پیامت را بنویس…": { en: "Write your message…", tr: "Mesajını yaz…" },
    "برای چت وارد شو": { en: "Log in to chat", tr: "Sohbet için giriş yap" },
    "پیام…": { en: "Message…", tr: "Mesaj…" },
    "پیام تیم…": { en: "Team message…", tr: "Ekip mesajı…" },
    "کاربران عادی اینجا را نمی‌بینند": { en: "Regular users cannot see this", tr: "Normal kullanıcılar bunu göremez" },
    "فروشگاه رونین": { en: "Ronin Store", tr: "Ronin Mağazası" },
    "آگهی فعال:": { en: "Active listings:", tr: "Aktif ilanlar:" },
    "آگهی‌های کاربران عادی پس از تایید مالک منتشر می‌شوند.": { en: "Regular users' listings go live after owner approval.", tr: "Normal kullanıcı ilanları yönetici onayıyla yayınlanır." },
    "ثبت آگهی جدید": { en: "New listing", tr: "Yeni ilan" },
    "آگهی‌های من": { en: "My listings", tr: "İlanlarım" },
    "محصول": { en: "Product", tr: "Ürün" },
    "قیمت": { en: "Price", tr: "Fiyat" },
    "دسته": { en: "Category", tr: "Kategori" },
    "توضیح": { en: "Description", tr: "Açıklama" },
    "فروشنده": { en: "Seller", tr: "Satıcı" },
    "خرید": { en: "Buy", tr: "Satın al" },
    "جزئیات": { en: "Details", tr: "Ayrıntılar" },
    "تایید شده": { en: "Approved", tr: "Onaylandı" },
    "در انتظار تایید": { en: "Pending approval", tr: "Onay bekliyor" },
    "در انتظار تأیید": { en: "Pending approval", tr: "Onay bekliyor" },

    /* ── هیرو و خانه ── */
    "دنیای انیمه": { en: "Anime World", tr: "Anime Dünyası" },
    "کشف تازه‌ها": { en: "Discover", tr: "Keşfet" },
    "شروع ماجراجویی": { en: "Start the adventure", tr: "Maceralara başla" },
    "مشاهده انیمه‌ها": { en: "Browse anime", tr: "Animeleri gör" },
    "شروع کن": { en: "Get started", tr: "Başla" },
    "کشف و پیگیری انیمه‌ها": { en: "Discover and track anime", tr: "Animeleri keşfet ve takip et" },
    "آخرین خبرهای دنیای انیمه": { en: "Latest anime news", tr: "Son anime haberleri" },
    "آگهی محصولات و فروشندگان": { en: "Products and seller listings", tr: "Ürünler ve satıcı ilanları" },
    "پست، لایک، کامنت، فالو": { en: "Posts, likes, comments, follows", tr: "Gönderi, beğeni, yorum, takip" },
    "گفتگوی زنده با کاربران": { en: "Live chat with users", tr: "Kullanıcılarla canlı sohbet" },
    "قابلیت‌های ویژه رونین": { en: "Exclusive Ronin features", tr: "Ronin'e özel özellikler" },

    /* ── ورود و حساب ── */
    "ورود به رونین": { en: "Log in to Ronin", tr: "Ronin'e giriş" },
    "نام نمایشی": { en: "Display name", tr: "Görünen ad" },
    "ایمیل": { en: "Email", tr: "E-posta" },
    "رمز عبور": { en: "Password", tr: "Şifre" },
    "تکرار رمز عبور": { en: "Confirm password", tr: "Şifre tekrarı" },
    "حداقل ۶ کاراکتر": { en: "At least 6 characters", tr: "En az 6 karakter" },
    "مثلاً کِنجی": { en: "e.g. Kenji", tr: "ör. Kenji" },
    "رمزت را فراموش کردی؟": { en: "Forgot your password?", tr: "Şifreni mi unuttun?" },
    "خروج از حساب": { en: "Log out", tr: "Hesaptan çık" },

    /* ── تنظیمات و عمومی ── */
    "حالت کم‌مصرف": { en: "Lite mode", tr: "Hafif mod" },
    "انیمیشن و شیشه‌ی پس‌زمینه رو سبک می‌کنه تا سایت روون‌تر شه": { en: "Lightens animations and glass effects for a smoother site", tr: "Daha akıcı bir site için animasyonları ve cam efektlerini hafifletir" },
    "خاموش": { en: "Off", tr: "Kapalı" },
    "روشن": { en: "On", tr: "Açık" },
    "همه حقوق محفوظ است": { en: "All rights reserved", tr: "Tüm hakları saklıdır" },
    "انجمن • فروشگاه • پرمیوم": { en: "Community • Store • Premium", tr: "Topluluk • Mağaza • Premium" },
    "بستن": { en: "Close", tr: "Kapat" },
    "ویرایش": { en: "Edit", tr: "Düzenle" },
    "تایید": { en: "Approve", tr: "Onayla" },
    "رد": { en: "Reject", tr: "Reddet" },
    "لغو": { en: "Cancel", tr: "İptal" },
    "بازگشت": { en: "Back", tr: "Geri" },
    "بعدی": { en: "Next", tr: "Sonraki" },
    "قبلی": { en: "Previous", tr: "Önceki" },
    "همه": { en: "All", tr: "Tümü" },
    "بیشتر": { en: "More", tr: "Daha fazla" },
    "در حال بارگذاری…": { en: "Loading…", tr: "Yükleniyor…" },
    "مخفی — فقط تیم": { en: "Hidden — team only", tr: "Gizli — sadece ekip" },

    /* ── پشتیبانی و فوتر ── */
    "پشتیبانی": { en: "Support", tr: "Destek" },
    "پیام به پشتیبانی": { en: "Message support", tr: "Desteğe yaz" },
    "ایمیل پشتیبانی": { en: "Support email", tr: "Destek e-postası" },
    "دسترسی سریع": { en: "Quick access", tr: "Hızlı erişim" },
    "قوانین انجمن": { en: "Community rules", tr: "Topluluk kuralları" },
    "حریم خصوصی": { en: "Privacy", tr: "Gizlilik" },
    "شرایط استفاده": { en: "Terms of use", tr: "Kullanım Şartları" },
    "پرسش‌های پرتکرار": { en: "FAQ", tr: "SSS" },

    /* ── بخش‌های باقی‌ماندهٔ صفحه ── */
    "مدیریت": { en: "Management", tr: "Yönetim" },
    "تجربه رونین": { en: "Ronin experience", tr: "Ronin deneyimi" },
    "رنگ‌های ویژه و نشان پرمیوم": { en: "Special colors and premium badge", tr: "Özel renkler ve premium rozet" },
    "جامعه، فروشگاه و دنیایی که خودت می‌سازی.": { en: "Community, store and a world you build yourself.", tr: "Topluluk, mağaza ve kendi kurduğun bir dünya." },
    "حساب بساز": { en: "Create an account", tr: "Hesap oluştur" },
    "با ایمیل ثبت‌نام کن": { en: "Sign up with email", tr: "E-posta ile kaydol" },
    "پست بگذار": { en: "Share a post", tr: "Gönderi paylaş" },
    "توی انجمن فعالیت کن": { en: "Be active in the community", tr: "Toplulukta aktif ol" },
    "آگهی بده": { en: "Post a listing", tr: "İlan ver" },
    "محصولت را تبلیغ کن": { en: "Promote your product", tr: "Ürününü tanıt" },
    "اتصال به فایربیس برقرار نشد": { en: "Could not connect to Firebase", tr: "Firebase bağlantısı kurulamadı" },
    "اینترنت را بررسی کن و صفحه را رفرش کن.": { en: "Check your internet and refresh the page.", tr: "İnternetini kontrol et ve sayfayı yenile." },
    "کانال تیم": { en: "Team channel", tr: "Ekip kanalı" },
    "پیام خصوصی": { en: "Direct message", tr: "Özel mesaj" },
    "انتخاب دسته": { en: "Select a category", tr: "Kategori seç" },
    "برای ثبت آگهی وارد شو": { en: "Log in to post a listing", tr: "İlan vermek için giriş yap" },
    "ساخت رویداد (مالک)": { en: "Create event (owner)", tr: "Etkinlik oluştur (yönetici)" },
    "ساخت رویداد": { en: "Create event", tr: "Etkinlik oluştur" },
    "رنگ‌های ویژه همراه راهنما": { en: "Special companion colors", tr: "Özel yardımcı renkleri" },
    "نمایش نشان پرمیوم در پروفایل": { en: "Show premium badge on profile", tr: "Profilde premium rozeti göster" },
    "اولویت": { en: "Priority", tr: "Öncelik" },
    "دسترسی به قابلیت‌های ویژه": { en: "Access premium features", tr: "Premium özelliklere erişim" },
    "اعلان‌های ویژه": { en: "Premium notifications", tr: "Premium bildirimler" },
    "خبرهای مهم زودتر": { en: "Important news sooner", tr: "Önemli haberler daha erken" },
    "کنار نامت در انجمن و چت": { en: "Next to your name in community and chat", tr: "Topluluk ve sohbette adının yanında" },
    "اولویت در پاسخ‌دهی": { en: "Priority support", tr: "Öncelikli destek" },
    "پرداخت واقعی هنوز فعال نشده — درخواستت مستقیم به مالک می‌رسد و او فعال می‌کند.": { en: "Real payment is not enabled yet — your request goes directly to the owner for activation.", tr: "Gerçek ödeme henüz etkin değil — talebin etkinleştirme için doğrudan yöneticiye gider." },
    "درخواست پرمیوم 💎": { en: "Request premium 💎", tr: "Premium talep et 💎" },
    "فقط مالک": { en: "Owner only", tr: "Sadece yönetici" },
    "وارد حساب شو تا تنظیمات شخصی‌ات ذخیره شود": { en: "Log in to save your personal settings", tr: "Kişisel ayarlarını kaydetmek için giriş yap" },

    /* ── بازار، آگهی، کاوش و تبلیغ ویدیویی (نسخهٔ ۲) ── */
    "تبلیغ ویدیویی": { en: "Video ad", tr: "Video reklam" },
    "آگهی‌های تازه، فروشنده‌های واقعی و یک ویترین سریع برای پیدا کردن چیزی که دنبالش بودی.": { en: "Fresh listings, real sellers and a fast showcase for finding what you need.", tr: "Yeni ilanlar, gerçek satıcılar ve aradığını hızlıca bulman için bir vitrin." },
    "ثبت آگهی": { en: "Post a listing", tr: "İlan ver" },
    "آگهی فعال": { en: "Active listings", tr: "Aktif ilanlar" },
    "تازه امروز": { en: "New today", tr: "Bugün yeni" },
    "ویترین باز": { en: "Always open", tr: "Her zaman açık" },
    "جدیدترین": { en: "Newest", tr: "En yeni" },
    "ارزان‌ترین": { en: "Cheapest", tr: "En ucuz" },
    "گران‌ترین": { en: "Most expensive", tr: "En pahalı" },
    "پربازدیدترین": { en: "Most viewed", tr: "En çok görüntülenen" },
    "پاک کردن": { en: "Clear", tr: "Temizle" },
    "تازه رسیده": { en: "Just arrived", tr: "Yeni gelenler" },
    "آگهی و کمپین": { en: "Listings & campaigns", tr: "İlanlar ve kampanyalar" },
    "محصول یا خدمتت را با یک آگهی تمیز معرفی کن؛ آگهی تو بعد از تایید مالک در بازار و کاوش دیده می‌شود.": { en: "Introduce your product or service with a clean listing; after owner approval it appears in Market and Explore.", tr: "Ürününü veya hizmetini temiz bir ilanla tanıt; yönetici onayından sonra Pazar ve Keşfet'te görünür." },
    "دیدن بازار": { en: "Browse market", tr: "Pazarı gör" },
    "بازدید کل": { en: "Total views", tr: "Toplam görüntüleme" },
    "نمایش ویدیو": { en: "Video views", tr: "Video gösterimi" },
    "با پیش‌نمایش زنده، قبل از انتشار ببین چطور دیده می‌شود.": { en: "See how it looks with a live preview before publishing.", tr: "Yayınlamadan önce canlı önizlemeyle nasıl görüneceğini gör." },
    "دقیقه": { en: "min", tr: "dk" },
    "خدمات": { en: "Services", tr: "Hizmetler" },
    "برند": { en: "Brand", tr: "Marka" },
    "به‌روزرسانی پیش‌نمایش": { en: "Refresh preview", tr: "Önizlemeyi yenile" },
    "پیش‌نمایش آگهی": { en: "Listing preview", tr: "İlan önizlemesi" },
    "همان چیزی که خریدار می‌بیند": { en: "What buyers see", tr: "Alıcının gördüğü" },
    "تبلیغ ویدیویی هم داری؟": { en: "Have a video ad too?", tr: "Video reklamın var mı?" },
    "کمپین ویدیویی رونین را ببین و با پرمیوم از تبلیغات کمتر لذت ببر.": { en: "See Ronin's video campaign and enjoy fewer ads with Premium.", tr: "Ronin video kampanyasını gör ve Premium ile daha az reklamın tadını çıkar." },
    "تماشای تبلیغ": { en: "Watch the ad", tr: "Reklamı izle" },
    "مدیریت وضعیت": { en: "Manage status", tr: "Durumu yönet" },
    "فعال": { en: "Active", tr: "Aktif" },
    "در انتظار": { en: "Pending", tr: "Beklemede" },
    "رد شده": { en: "Rejected", tr: "Reddedildi" },
    "تبلیغ‌های ویدیویی": { en: "Video ads", tr: "Video reklamlar" },
    "ویدیوهای واقعی MP4 با پخش خودکار بی‌صدا؛ بعد از دیدن محصول، افزودن به سبد یا ورود به بازار یک تبلیغ کوتاه و قابل‌بستن پخش می‌شود.": { en: "Real MP4 ads autoplay muted; after viewing a product, adding to cart or entering Market, a short closable ad plays.", tr: "Gerçek MP4 reklamlar sessiz otomatik oynar; ürün görüntüleme, sepete ekleme veya Pazara girişten sonra kısa ve kapatılabilir bir reklam oynar." },
    "ساخت کمپین": { en: "Create campaign", tr: "Kampanya oluştur" },
    "نمایش": { en: "Impressions", tr: "Gösterim" },
    "کلیک": { en: "Clicks", tr: "Tıklama" },
    "تماشای کامل": { en: "Completed views", tr: "Tam izleme" },
    "کمپین فعال": { en: "Active campaigns", tr: "Aktif kampanyalar" },
    "کالکشن محدود فیگور و گجت‌های رونین.": { en: "A limited collection of Ronin figures and gadgets.", tr: "Sınırlı sayıda Ronin figür ve gadget koleksiyonu." },
    "مشاهدهٔ کالکشن": { en: "View collection", tr: "Koleksiyonu gör" },
    "کمپین‌های فعال": { en: "Active campaigns", tr: "Aktif kampanyalar" },
    "کمپین": { en: "Campaign", tr: "Kampanya" },
    "عملکرد این مرورگر": { en: "This browser's performance", tr: "Bu tarayıcının performansı" },
    "آمار محلی است و برای گزارش واقعی کمپین می‌توانی بعداً به پنل مالک وصلش کنی.": { en: "Stats are local; connect an owner dashboard later for real campaign reporting.", tr: "İstatistikler yereldir; gerçek kampanya raporu için sonra bir yönetici paneline bağlanabilir." },
    "پخش خودکار": { en: "Autoplay", tr: "Otomatik oynat" },
    "پس از ورود به بخش یا اقدام در بازار، ویدیو بی‌صدا و خودکار پخش می‌شود.": { en: "After entering this section or taking an action in Market, the video autoplays muted.", tr: "Bu bölüme girince veya Pazarda işlem yapınca video sessiz otomatik oynar." },
    "قابل بستن": { en: "Closable", tr: "Kapatılabilir" },
    "تبلیغ شناور تا ۱۰ دقیقه خاموش می‌شود و کاربر را اذیت نمی‌کند.": { en: "The floating ad can be dismissed for 10 minutes without bothering the user.", tr: "Yüzen reklam 10 dakika kapatılabilir ve kullanıcıyı rahatsız etmez." },
    "هدایت به فروشگاه": { en: "Store CTA", tr: "Mağazaya yönlendirme" },
    "هر کمپین یک CTA مستقل دارد و کلیک‌ها در همین مرورگر ثبت می‌شوند.": { en: "Each campaign has its own CTA and clicks are recorded in this browser.", tr: "Her kampanyanın kendi CTA'sı vardır ve tıklamalar bu tarayıcıda kaydedilir." },
    "یک جا برای پیدا کردن محصولات تازه، گفتگوهای داغ و آدم‌های تازهٔ جامعه.": { en: "One place for fresh products, hot conversations and new people in the community.", tr: "Yeni ürünler, sıcak sohbetler ve topluluktaki yeni insanlar için tek yer." }
  };

  /* ── محتوای کاربر این‌ها هرگز ترجمه نمی‌شوند ───────────── */
  var SKIP = ["#feedBox", "#chatBox", "#teamBox", "#dmBox", "#notifBox",
    "#ownerBody", "#myAds", "#shopWall", "#animeWall", "#newsWall", "#evWall",
    "#discBox", "#rankBox", "#profBox", "#bulWrap", "#groupsBox", "#infoBody",
    "#suggBox"];

  var LANG = "fa", SRC = new WeakMap(), ASRC = new WeakMap(), MISSING = {}, coll = false, busy = false;
  var TITLES = {
    fa: "RONIN STORE — انجمن، فروشگاه و دنیای پرمیوم",
    en: "RONIN STORE — Community & Marketplace",
    tr: "RONIN STORE — Topluluk ve Pazar"
  };
  var DESCS = {
    fa: "RONIN STORE — انجمن، فروشگاه، چت و دنیای پرمیوم رونین",
    en: "RONIN STORE — community, marketplace, chat and premium world",
    tr: "RONIN STORE — topluluk, mağaza, sohbet ve premium dünya"
  };

  function latn(s) {
    return String(s == null ? "" : s)
      .replace(/[۰-۹]/g, function (d) { return String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)); })
      .replace(/[٠-٩]/g, function (d) { return String("٠١٢٣٤٥٦٧٨٩".indexOf(d)); });
  }
  function trMixed(core) {
    var parts = String(core).split(/(\s*[•·|/—–]\s*)/);
    if (parts.length < 3) return null;
    var changed = false, out = parts.map(function (p, i) {
      if (i % 2) return p;
      var v = lookup(p.trim());
      if (v) { changed = true; return v; }
      return p;
    }).join("");
    return changed ? latn(out) : null;
  }

  function el(i) { return document.getElementById(i); }
  function isDigit(c) { return (c >= 0x06F0 && c <= 0x06F9) || (c >= 0x0660 && c <= 0x0669); }
  function isLetter(c) {
    if (isDigit(c)) return false;
    if (c >= 0x0600 && c <= 0x06FF) return true;
    if (c >= 0x0041 && c <= 0x005A) return true;
    if (c >= 0x0061 && c <= 0x007A) return true;
    return false;
  }
  function firstLetterIdx(s) {
    for (var i = 0; i < s.length; i++) if (isLetter(s.charCodeAt(i))) return i;
    return -1;
  }
  function lookup(core) { return D[core] ? (D[core][LANG] || null) : null; }
  function collect(core) {
    if (!coll || LANG === "fa" || firstLetterIdx(core) < 0) return;
    MISSING[core] = 1;
  }
  function isSkipped(n) {
    var e = n;
    while (e && e.nodeType) {
      if (e.nodeType === 1) {
        if (e.hasAttribute && e.hasAttribute("data-noi18n")) return true;
        var t = e.tagName;
        if (t === "SCRIPT" || t === "STYLE" || t === "TEXTAREA" || t === "CODE" || t === "PRE" || t === "NOSCRIPT") return true;
        if (e.isContentEditable) return true;
      }
      e = e.parentNode;
    }
    return false;
  }

  /* ── ترجمه‌ی متن و صفت‌ها ─────────────────────────────── */
  function applyText(t) {
    if (!t || !t.nodeValue || isSkipped(t)) return;
    var cur = t.nodeValue, core0 = cur.trim();
    if (!core0 || firstLetterIdx(core0) < 0) return;

    var st = SRC.get(t);
    if (LANG === "fa") {
      if (st && cur === st.out && cur !== st.src) t.nodeValue = st.src;
      return;
    }

    /* اگر متن از آخرین ترجمه عوض شده، منبع تازه است؛ وگرنه منبع فارسی قبلی */
    var src = (st && cur === st.out) ? st.src : cur;
    var i = firstLetterIdx(src); if (i < 0) return;
    var lead = src.slice(0, i), core = src.slice(i).trim();
    var tr = lookup(core) || trMixed(core);
    if (!tr) {
      var lm = core.match(/^سطح\s+([0-9۰-۹]+)$/);
      if (lm) tr = (LANG === "tr" ? "Seviye " : "Level ") + lm[1];
    }
    if (!tr) { collect(core); return; }
    var wsl = cur.match(/^\s*/)[0], wsr = cur.match(/\s*$/)[0];
    var prefix = lead.slice(wsl.length);
    var out = latn(prefix) + latn(tr);
    var next = wsl + out + wsr;
    if (cur !== next) {
      SRC.set(t, { src: src, out: next });
      t.nodeValue = next;
    }
  }

  var ATTRS = ["placeholder", "title", "aria-label", "alt"];
  function applyAttrs(e) {
    if (!e || e.nodeType !== 1 || isSkipped(e)) return;
    var st = ASRC.get(e); if (!st) { st = {}; ASRC.set(e, st); }
    for (var a = 0; a < ATTRS.length; a++) {
      var at = ATTRS[a], v = e.getAttribute(at);
      if (v == null || !v.trim()) continue;
      var prev = st[at];
      if (LANG === "fa") {
        if (prev && v === prev.out && v !== prev.src) e.setAttribute(at, prev.src);
        continue;
      }
      var src = (prev && v === prev.out) ? prev.src : v;
      var i = firstLetterIdx(src); if (i < 0) continue;
      var core = src.slice(i).trim(), tr = lookup(core) || trMixed(core);
      if (!tr) { collect(core); continue; }
      var next = latn(tr);
      if (v !== next) { st[at] = { src: src, out: next }; e.setAttribute(at, next); }
    }
    if (e.tagName === "INPUT" && /^(button|submit|reset)$/i.test(e.type || "") && e.value) {
      var vs = (st.value && e.value === st.value.out) ? st.value.src : e.value;
      if (LANG === "fa") { if (st.value && e.value === st.value.out) e.value = st.value.src; }
      else { var k = firstLetterIdx(vs); if (k >= 0) { var cv = vs.slice(k).trim(), tv = lookup(cv); if (tv && e.value !== tv) { st.value = { src: vs, out: tv }; e.value = tv; } } }
    }
  }

  function textsIn(root) {
    if (!root) return;
    var w = document.createTreeWalker(root, 4, null);
    var n; while ((n = w.nextNode())) applyText(n);
  }
  function attrsIn(root) {
    if (!root || root.nodeType !== 1) return;
    var ls = root.querySelectorAll("[placeholder],[title],[aria-label],[alt]");
    for (var i = 0; i < ls.length; i++) applyAttrs(ls[i]);
    applyAttrs(root);
  }
  function markSkip() {
    for (var i = 0; i < SKIP.length; i++) { var e = document.querySelector(SKIP[i]); if (e) e.setAttribute("data-noi18n", ""); }
  }
  function pass(root) {
    if (!document.body) return;
    markSkip();
    textsIn(root || document.body);
    attrsIn(root || document.body);
  }

  /* ── تماشای تغییرات (برای محتوای داینامیک و منو) ───────── */
  function observe() {
    if (!("MutationObserver" in window)) return;
    new MutationObserver(function (ms) {
      if (LANG === "fa" || busy) return;
      busy = true;
      for (var i = 0; i < ms.length; i++) {
        var m = ms[i];
        if (m.type === "childList") {
          for (var k = 0; k < m.addedNodes.length; k++) {
            var nd = m.addedNodes[k];
            if (nd.nodeType === 3) applyText(nd);
            else if (nd.nodeType === 1) { markSkip(); textsIn(nd); attrsIn(nd); }
          }
        } else if (m.type === "characterData" && m.target.nodeType === 3) {
          applyText(m.target);
        }
      }
      busy = false;
    }).observe(document.body, { childList: true, subtree: true, characterData: true });
  }

  /* ── سوییچ زبان + دکمه ────────────────────────────────── */
  function set(lang) {
    LANG = LANGS.indexOf(lang) >= 0 ? lang : "fa";
    try { localStorage.setItem(LS, LANG); } catch (e) {}
    var d = document.documentElement;
    d.setAttribute("lang", LANG);
    d.setAttribute("dir", DIR[LANG]);
    d.className = d.className.replace(/\brn-lang-\w+/g, "").trim();
    d.classList.add("rn-lang-" + LANG);
    var c = el("rnLangCur"); if (c) c.textContent = LANG.toUpperCase();
    var pop = el("rnLangPop"); if (pop) pop.classList.remove("on");
    document.title = TITLES[LANG] || TITLES.fa;
    var md = document.querySelector('meta[name="description"]');
    if (md) md.setAttribute("content", DESCS[LANG] || DESCS.fa);
    var og = document.querySelector('meta[property="og:description"]');
    if (og) og.setAttribute("content", DESCS[LANG] || DESCS.fa);
    var ogt = document.querySelector('meta[property="og:title"]');
    if (ogt) ogt.setAttribute("content", TITLES[LANG] || TITLES.fa);
    pass();
    try {
      document.dispatchEvent(new CustomEvent("ronin:lang", { detail: { lang: LANG } }));
    } catch (e) {}
  }

  function ui() {
    if (el("rnLang")) return;
    var css = document.createElement("style");
    css.textContent =
      "#rnLang{position:relative}#rnLangCur{font-size:9px;opacity:.75;margin-inline-start:2px}" +
      "#rnLangPop{position:fixed;z-index:9998;display:none;flex-direction:column;gap:2px;padding:6px;" +
      "border-radius:12px;background:#0b1130;border:1px solid rgba(140,160,255,.25);" +
      "box-shadow:0 18px 40px rgba(0,0,0,.55);min-width:130px}" +
      "#rnLangPop.on{display:flex}" +
      "#rnLangPop button{border:0;background:transparent;color:#eef1ff;font:inherit;font-size:13px;" +
      "text-align:start;padding:8px 10px;border-radius:8px;cursor:pointer;font-family:inherit}" +
      "#rnLangPop button:hover{background:rgba(124,92,255,.22)}" +
      "#rnLangPop button.on{background:linear-gradient(135deg,#7c5cff,#22d3ee);color:#fff}";
    document.head.appendChild(css);

    var b = document.createElement("button");
    b.type = "button"; b.id = "rnLang"; b.className = "icobtn";
    b.setAttribute("data-noi18n", "");
    b.title = "Language / زبان / Dil";
    b.innerHTML = "🌐<span id=\"rnLangCur\">" + LANG.toUpperCase() + "</span>";
    var host = document.querySelector("header .tools") || document.querySelector(".tools");
    if (host) host.appendChild(b);
    else { b.style.cssText = "position:fixed;inset-inline-end:14px;bottom:150px;z-index:9998"; document.body.appendChild(b); }

    var pop = document.createElement("div");
    pop.id = "rnLangPop"; pop.setAttribute("data-noi18n", "");
    pop.innerHTML = LANGS.map(function (l) {
      return '<button type="button" data-l="' + l + '" class="' + (l === LANG ? "on" : "") + '">' + NAMES[l] + "</button>";
    }).join("");
    document.body.appendChild(pop);

    b.addEventListener("click", function (ev) {
      ev.stopPropagation();
      var on = pop.classList.toggle("on");
      if (on) {
        var r = b.getBoundingClientRect();
        pop.style.top = (r.bottom + 6) + "px";
        pop.style.left = Math.max(8, Math.min(r.left, window.innerWidth - 150)) + "px";
      }
    });
    pop.addEventListener("click", function (ev) {
      var t = ev.target.closest("button[data-l]"); if (!t) return;
      set(t.getAttribute("data-l"));
      Array.prototype.forEach.call(pop.children, function (c) { c.classList.toggle("on", c === t); });
    });
    document.addEventListener("click", function () { pop.classList.remove("on"); });
  }

  /* ── راه‌اندازی ───────────────────────────────────────── */
  function init() {
    try { LANG = localStorage.getItem(LS) || "fa"; } catch (e) {}
    try { coll = localStorage.getItem("ronin_i18n_collect") === "1"; } catch (e) {}
    if (LANGS.indexOf(LANG) < 0) LANG = "fa";
    ui();
    set(LANG);
    observe();
    [500, 1500, 3000, 5000].forEach(function (ms) { setTimeout(function () { if (LANG !== "fa") pass(); }, ms); });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

  /* API */
  function trText(fa) {
    var key = String(fa == null ? "" : fa).trim();
    if (LANG === "fa") return fa;
    return lookup(key) || trMixed(key) || fa;
  }
  function numText(n) {
    var s = String(n == null ? "" : n);
    return LANG === "fa" ? s.replace(/[0-9]/g, function (d) { return "۰۱۲۳۴۵۶۷۸۹"[d]; }) : latn(s);
  }

  window.RoninI18n = {
    set: set, get: function () { return LANG; }, langs: LANGS,
    t: trText, num: numText, latn: latn,
    missing: function () { return Object.keys(MISSING); }
  };
  if (window.R) {
    R.i18n = window.RoninI18n;
    R.t = trText;
    var baseFa = R.fa, baseTime = R.time, baseRole = R.roleFa;
    R.fa = function (s) { return LANG === "fa" ? baseFa(s) : latn(s); };
    R.time = function (t) {
      if (LANG === "fa") return baseTime(t);
      var d = Math.floor((Date.now() - (t || 0)) / 1000);
      var m = Math.floor(d / 60), h = Math.floor(d / 3600), day = Math.floor(d / 86400);
      if (LANG === "tr") {
        if (d < 60) return "şimdi";
        if (d < 3600) return m + " dk önce";
        if (d < 86400) return h + " saat önce";
        if (d < 2592000) return day + " gün önce";
      } else {
        if (d < 60) return "now";
        if (d < 3600) return m + "m ago";
        if (d < 86400) return h + "h ago";
        if (d < 2592000) return day + "d ago";
      }
      try { return new Date(t).toLocaleDateString(LANG === "tr" ? "tr-TR" : "en-GB"); } catch (e) { return ""; }
    };
    R.roleFa = function (r) {
      var base = { owner: "مالک", admin: "مدیر", staff: "کارمند", user: "کاربر" }[r] || "کاربر";
      var out = trText(base);
      return r === "owner" ? out + " 👑" : out;
    };
  }
})();
