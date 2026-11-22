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
3. المساعد الذكي وخدمة الصوت يعملان عبر **Netlify AI Gateway** تلقائيًا، ولا حاجة لإضافة أي مفتاح API. تقوم Netlify بحقن بيانات الاتصال بـ Gemini داخل الوظائف وقت التشغيل، وتُحتسب التكلفة من رصيد حساب Netlify.
4. (اختياري) إذا أردت استخدام مفتاح Gemini خاص بك بدلاً من ذلك، أضف متغير البيئة `GEMINI_API_KEY` في إعدادات الموقع؛ Netlify لن تستبدل مفتاحك.
5. تحويل الصوت إلى نص يتم على الخادم عبر Gemini، أما قراءة الرد بصوت مسموع فتتم عبر قارئ الصوت العربي المدمج في المتصفح.
6. بعد النشر افتح `https://YOUR-SITE.netlify.app/api/health`؛ المفترض أن تظهر استجابة JSON فيها `ok: true`.
7. اختبر المساعد ثم خدمة الصوت. إذا فشل أي منهما، راجع سجلات الوظيفة المعنية في Netlify.

## إعدادات البناء

- Build command: `npm run build`
- Publish directory: `dist`
- Functions directory: `netlify/functions`
- Node: 20

## تنبيه

يعمل AI Gateway بعد وجود نشر إنتاجي واحد على الأقل، ولا يعمل الاتصال المباشر به من الجهاز المحلي في الخطة المجانية؛ اختبر المساعد على الموقع المنشور. كما أن بعض حدود حجم الطلبات والمدة تفرضها منصة Netlify نفسها.
