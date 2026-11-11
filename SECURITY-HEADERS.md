# وضعیت هدرهای امنیتی — Ronin Store

## نتیجهٔ بررسی (۱۱ نوامبر ۲۰۲۶)

هدرهای واقعی پاسخ `https://ronin-store001.github.io/`:

```
HTTP/2 200
server: GitHub.com
content-type: text/html; charset=utf-8
access-control-allow-origin: *
strict-transport-security: max-age=31556952
cache-control: max-age=600
```

یعنی این چهار هدر ارسال نمی‌شوند:

| هدر | وضعیت |
| --- | --- |
| Content-Security-Policy | ندارد |
| X-Content-Type-Options | ندارد |
| X-Frame-Options | ندارد |
| Referrer-Policy | ندارد |

## علت

GitHub Pages یک هاست استاتیک است و **اجازهٔ تعریف هدر سفارشی نمی‌دهد**؛ نه با
فایل `_headers`، نه `netlify.toml`، نه `vercel.json` و نه در تنظیمات ریپو.
هر فایلی مثل `_headers` که در ریپو باشد، فقط به‌عنوان یک فایل متنی سرو می‌شود
و روی هدرهای پاسخ اثر ندارد. پس این ایراد از کد سایت نیست.

## راه‌حل‌ها (به ترتیب سادگی)

### ۱) گذاشتن Cloudflare جلوی دامنه (پیشنهاد اصلی)

1. دامنه را به Cloudflare اضافه کن (DNS رایگان).
2. در Cloudflare → Rules → Transform Rules → Modify Response Header چهار هدر را اضافه کن:
   - `X-Content-Type-Options: nosniff`
   - `X-Frame-Options: SAMEORIGIN`
   - `Referrer-Policy: strict-origin-when-cross-origin`
   - `Content-Security-Policy` (مقدار آماده در فایل `_headers` همین ریپو)
3. چون سایت روی GitHub Pages است، رکورد CNAME به `ronin-store001.github.io` بماند و ابر نارنجی روشن باشد.

مزیت: کد سایت دست نمی‌خورد و هدرها روی همهٔ فایل‌ها می‌آیند.

### ۲) انتقال هاست به Cloudflare Pages یا Netlify

هر دو فایل `_headers` را پشتیبانی می‌کنند. فایل `_headers` در ریشهٔ همین ریپو
آماده است و با اتصال ریپو به آن سرویس، خودکار اعمال می‌شود.

### ۳) اگر روی GitHub Pages ماندی

تنها چیزی که بدون هاست اضافه ممکن است: تگ `<meta name="referrer">` در
`index.html`. این فقط رفتار رفرر را در مرورگر تنظیم می‌کند و جای هدر واقعی را
نمی‌گیرد؛ `X-Frame-Options` و CSP واقعی هم با متا قابل جایگزینی نیستند.

## نکته‌های مهم دربارهٔ CSP این سایت

سایت از Firebase، فونت گوگل، استایل و اسکریپت inline زیاد استفاده می‌کند؛ پس:

- `'unsafe-inline'` و `'unsafe-eval'` لازم است، وگرنه کل صفحه سفید می‌شود.
- دامنه‌های Firebase و gstatic باید در `connect-src` / `script-src` باشند.
- با این حال CSP جلوی تزریق اسکریپت از دامنهٔ ناشناس و `object-src` و
  `base-uri` را می‌گیرد و ارزش امنیتی واقعی دارد.

## هدرهای موجود و قابل بهبود

- `strict-transport-security` از طرف گیت‌هاب هست (خوب).
- `access-control-allow-origin: *` روی کل سایت باز است؛ برای یک سایت عمومی
  مشکل جدی نیست، ولی اگر API شخصی اضافه شد باید محدود شود.
- `cache-control: max-age=600` یعنی تغییرات تا ۱۰ دقیقه دیده نمی‌شوند.
