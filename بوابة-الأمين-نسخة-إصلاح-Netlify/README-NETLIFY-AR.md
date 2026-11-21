# بوابة الأمين للإنترنت — نسخة مجهزة لوظائف Netlify

هذه النسخة تحافظ على واجهة الموقع وملفاته الأصلية، وتضيف وظائف خادمية مستقلة لمسارات المساعد الذكي والصوت.

## ما الذي أُضيف؟

- `netlify/functions/assistant-chat.ts` لمسار `/api/assistant/chat`
- `netlify/functions/voice-transcribe.ts` لمسار `/api/voice/transcribe`
- `netlify/functions/voice-analyze.ts` لمسار `/api/voice/analyze`
- `netlify/functions/voice-tts.ts` لمسار `/api/voice/tts`
- `netlify/functions/health.ts` لاختبار سلامة الوظائف عبر `/api/health`
- `netlify.toml` لضبط البناء والنشر وربط مسارات API بوظائف Netlify.

## مهم قبل النشر

1. ارفع **مجلد المشروع كاملاً بعد فك ضغط ZIP**، وليس مجلد `dist` وحده.
2. لا ترفع مجلد `dist` وحده. يجب أن يرى Netlify مجلد المشروع الأصلي وملف `netlify.toml` ومجلد `netlify/functions` حتى يبني الواجهة ويجمع الوظائف. الأفضل ربط المشروع بمستودع Git أو نشره عبر Netlify CLI. وإذا استخدمت السحب والإفلات، فاسحب مجلد المشروع بعد فك ZIP وأنت مسجل الدخول، وتأكد من أن Netlify نفّذ البناء واكتشف الوظائف؛ لا تسحب `dist` وحده.
3. في Netlify افتح إعدادات الموقع ثم متغيرات البيئة (Environment variables)، وأضف:
   - الاسم: `GEMINI_API_KEY`
   - القيمة: مفتاح Gemini الخاص بالمشروع.
4. لا تضع المفتاح في ملفات الواجهة أو في `netlify.toml` أو في ملف ZIP. لا ترسله في المحادثة.
5. بعد إضافة المتغير، أعد نشر الموقع حتى تلتقط الوظائف الإعداد الجديد.
6. بعد النشر افتح `https://YOUR-SITE.netlify.app/api/health`؛ المفترض أن تظهر استجابة JSON فيها `ok: true`.
7. اختبر المساعد ثم خدمة الصوت. إذا فشل أي منهما، راجع سجلات الوظيفة المعنية في Netlify.

## إعدادات البناء

- Build command: `npm run build`
- Publish directory: `dist`
- Functions directory: `netlify/functions`
- Node: 20

## تنبيه

وجود وظائف API لا يضمن عمل Gemini ما لم يكن متغير `GEMINI_API_KEY` صالحاً ومتاحاً لبيئة الإنتاج. كما أن بعض حدود حجم الطلبات والمدة تفرضها منصة Netlify نفسها.
