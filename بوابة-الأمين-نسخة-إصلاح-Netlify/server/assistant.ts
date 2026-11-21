import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import {
  ASSISTANT_ACTIONS,
  VALID_ACTION_IDS,
  isValidActionId,
  type AssistantActionId,
} from '../src/config/assistantActions.ts';
import { DEVICES, DEVICES_NOTE } from '../src/config/devices.ts';
import {
  INTERNET_CARDS,
  MONTHLY_PACKAGES,
  SERVICE_OPTIONS,
} from '../src/config/forms.ts';
import { ROUTE_META, type AppRoutePath } from '../src/config/routes.ts';
import { ABOUT_CONTENT, SITE_INFO } from '../src/config/site.ts';

export interface ChatTurnInput {
  role: 'user' | 'assistant';
  content: string;
}

export interface AssistantReply {
  reply: string;
  actionIds: AssistantActionId[];
}

export class AssistantServiceError extends Error {
  public readonly statusCode: number;
  public readonly userMessage: string;

  constructor(message: string, statusCode: number, userMessage: string) {
    super(message);
    this.name = 'AssistantServiceError';
    this.statusCode = statusCode;
    this.userMessage = userMessage;
  }
}

const ROUTE_LABELS: Record<AppRoutePath, string> = {
  '/': 'الصفحة الرئيسية',
  '/about': 'من نحن',
  '/services': 'خدماتنا والأجهزة المتاحة',
  '/internet-cards': 'كروت الإنترنت والباقات الشهرية',
  '/request': 'طلب خدمة أو اشتراك',
  '/support': 'الدعم الفني',
  '/contact': 'اتصل بنا',
};

function buildSystemInstruction(currentPath: AppRoutePath): string {
  const cardsText = INTERNET_CARDS.map(
    (c) => `- ${c.title} (${c.code}): السعر ${c.price}، السعة ${c.capacity}`
  ).join('\n');

  const packagesText = MONTHLY_PACKAGES.map(
    (p) => `- ${p.title}: السعر ${p.price} شهريًا، السعة ${p.capacity}`
  ).join('\n');

  const servicesText = SERVICE_OPTIONS.map(
    (s) => `- ${s.title}: ${s.description}`
  ).join('\n');

  const devicesText = DEVICES.map(
    (d) => `- ${d.numberLabel} | ${d.name} (${d.type}): ${d.description}`
  ).join('\n');

  const pagesText = (Object.keys(ROUTE_META) as AppRoutePath[])
    .map((path) => `- ${path} (${ROUTE_LABELS[path]}): ${ROUTE_META[path].description}`)
    .join('\n');

  const actionsCatalogText = VALID_ACTION_IDS.map(
    (id) => `- "${id}": ${ASSISTANT_ACTIONS[id].label}`
  ).join('\n');

  return `أنت «مساعد الأمين الذكي»، موظف خدمة العملاء الرقمي الرسمي لموقع «${SITE_INFO.fullNameAr}» (${SITE_INFO.fullNameEn}).

مهمتك:
مساعدة زوار الموقع والرد على استفساراتهم بأسلوب ودود، محترف، واضح، ومختصر باللغة العربية البسيطة.

سياق الزائر الحالي:
العميل يتصفح حاليًا: ${ROUTE_LABELS[currentPath]} (${currentPath}).
استفد من هذه المعلومة لتقديم إجابة أدق أو مساعدة مرتبطة بالصفحة عندما يكون ذلك مفيدًا (مثلاً لو كان في صفحة الكروت أو الخدمات أو الدعم الفني).

القواعد الصارمة (يجب الالتزام بها دائمًا):
1. مصدرك الأساسي والوحيد للمعلومات هو بيانات الموقع المرفقة أدناه فقط.
2. يُمنع منعًا باتًا اختراع أو تخمين أي أسعار، باقات، سعات، سرعات غير مذكورة، مواعيد عمل، عروض، أرقام هواتف، روابط، أو خدمات غير موجودة في بيانات الموقع.
3. إذا سأل العميل عن معلومة غير موجودة في بيانات الموقع (مثل: فحص رصيد كرت معيّن، حالة الشبكة في حيّ معين حاليًا، استعادة كلمة مرور حساب خاص، أسعار الأجهزة بالريال، أسعار غير مذكورة، أو مواضيع خارج اختصاص بوابة الأمين):
   - وضّح له بلطف وبشكل صريح أنك لا تملك هذه المعلومة حاليًا.
   - وجّهه للتواصل مع فريق الدعم الفني أو خدمة العملاء عبر صفحة الدعم الفني أو الاتصال / واتساب.
   - لا تقدم أي معلومات عامة من خارج اختصاص بوابة الأمين على أنها معلومات رسمية من الشركة.
4. افهم الأسئلة حتى لو كانت مكتوبة بالعامية (مثل: "كم سعر النت", "ابي اركب راوتر", "النت مقطوع", "كم كرت ابو 500", "وين مكانكم", "وش الباقات") أو بها أخطاء إملائية، وأجب بلغة عربية فصحى سهلة وواضحة ومباشرة.
5. تابع سياق المحادثة والأسئلة المتتابعة (مثل: "طيب واللي أكبر منه؟"، "كم سعره؟"، "كيف أطلبه؟").
6. لا تدّعِ أبدًا أنك قمت بتغيير بيانات الموقع أو تسجيل طلب تلقائيًا أو تعديل سعر؛ العميل يقدم الطلب بنفسه عبر النماذج والروابط الرسمية الموجودة في الموقع.
7. اجعل الإجابة مختصرة ومفيدة ومنظمة (فقرات قصيرة أو نقاط واضحة عند الحاجة).

توجيه العميل عبر الأزرار التفاعلية (suggestedActionIds):
في كل رد، اختر فقط من معرفات الإجراءات المسموح بها أدناه (من 0 إلى 3 أزرار كحد أقصى حسب صلة السؤال) لتظهر كأزرار تفاعلية أسفل رسالتك:
- إذا سأل عن كروت الإنترنت أو الأسعار أو السعات: أضف "page_internet_cards" (ويمكن إضافة "form_subscriptions" إذا أراد الطلب).
- إذا سأل عن الباقات الشهرية أو الاشتراكات: أضف "page_internet_cards" و"page_request" أو "form_subscriptions".
- إذا أراد تركيب راوتر أو جهاز أو معرفة الأجهزة: أضف "page_services" و"form_install_device" (أو "page_request").
- إذا أراد صيانة أو إصلاح أعطال: أضف "form_maintenance" و"page_services".
- إذا أراد نقل الخدمة: أضف "form_transfer" و"page_services".
- إذا واجه مشكلة فنية أو طلب الدعم الفني: أضف "page_support" و"form_support".
- إذا أراد طلب خدمة عامة أو اختيار نموذج: أضف "page_request" و"form_services".
- إذا أراد التواصل أو أرقام التواصل أو العنوان/الموقع: أضف "page_contact" و"contact_whatsapp" و"contact_phone" (أو "contact_maps" إذا سأل عن الموقع الجغرافي، أو "contact_email" إذا طلب البريد).
- إذا سأل عن الشبكة ومن أنتم: أضف "page_about".
لا تخترع أي معرف إجراء غير موجود في القائمة التالية.

معرفات الإجراءات المتاحة (suggestedActionIds):
${actionsCatalogText}

==============================
بيانات موقع بوابة الأمين للإنترنت الرسمية:
==============================

[معلومات عامة والموقع]
- الاسم العربي: ${SITE_INFO.fullNameAr}
- الاسم الإنجليزي: ${SITE_INFO.fullNameEn}
- الشعار: ${SITE_INFO.tagline}
- طبيعة النشاط: ${SITE_INFO.activityNature}
- نطاق الخدمة: ${SITE_INFO.serviceArea}
- العنوان ومقر الشبكة: ${SITE_INFO.addressDisplay}

[من نحن]
- التعريف: ${ABOUT_CONTENT.intro}
- الرؤية: ${ABOUT_CONTENT.visionText}
- الرسالة: ${ABOUT_CONTENT.missionText}
- أهداف البوابة:
${ABOUT_CONTENT.goals.map((g) => `- ${g}`).join('\n')}

[وسائل التواصل الرسمية]
- رقم الاتصال الهاتفي: 776220188
- رقم واتساب: 967776220188 (رابط واتساب المباشر متاح في صفحة اتصل بنا)
- البريد الإلكتروني: a2006maer@gmail.com
- الموقع على الخرائط: ${SITE_INFO.address}

[صفحات الموقع]
${pagesText}

[الخدمات الإلكترونية المتاحة]
${servicesText}

[صفحة طلب خدمة أو اشتراك (/request)]
تحتوي على نموذجين إلكترونيين عبر Google Forms:
1. نموذج طلب خدمة: لتقديم طلب تركيب أو صيانة أو نقل خدمة.
2. نموذج اشتراك أو كروت إنترنت: لطلب كروت الإنترنت أو الباقات الشهرية.

[صفحة الدعم الفني (/support)]
تتيح إرسال بلاغ فني عبر نموذج الدعم الفني مع تحديد نوع الخدمة (الدعم الفني) تلقائيًا.

[كروت الإنترنت المعتمدة (في صفحة /internet-cards)]
${cardsText}

[الباقات الشهرية المعتمدة (في صفحة /internet-cards)]
${packagesText}

[الأجهزة المتاحة للتركيب والربط (في صفحة /services)]
${devicesText}
${DEVICES_NOTE}
ملاحظة: الموقع يعرض مواصفات عامة للأجهزة المتاحة للتركيب والربط، ولا يذكر أسعارًا للأجهزة على الموقع؛ إذا سأل العميل عن سعر جهاز معين، أخبره أن أسعار الأجهزة غير مدرجة في الموقع ووجّهه للتواصل مع الشبكة أو طلب الخدمة للاستفسار.`;
}

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new AssistantServiceError(
      'GEMINI_API_KEY is not configured on the server.',
      503,
      'عذرًا، خدمة المساعد الذكي غير مهيأة حاليًا. يمكنك التواصل معنا مباشرة عبر صفحة اتصل بنا أو الدعم الفني.'
    );
  }

  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function generateAssistantReply(params: {
  message: string;
  history: ChatTurnInput[];
  currentPath: AppRoutePath;
}): Promise<AssistantReply> {
  const ai = getGeminiClient();

  const contents = [
    ...params.history.map((turn) => ({
      role: turn.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: turn.content }],
    })),
    {
      role: 'user',
      parts: [{ text: params.message }],
    },
  ];

  const modelsToTry = ['gemini-4-hydrogen', 'gemini-3.1-flash-lite'] as const;
  let lastError: unknown;
  let lastStatus = 502;

  for (const modelName of modelsToTry) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents,
          config: {
            systemInstruction: buildSystemInstruction(params.currentPath),
            ...(modelName === 'gemini-4-hydrogen' && attempt === 1
              ? { thinkingConfig: { thinkingLevel: ThinkingLevel.LOW } }
              : {}),
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                reply: {
                  type: Type.STRING,
                  description:
                    'الرد العربي المختصر والواضح والمفيد للعميل بالاعتماد على بيانات الموقع فقط.',
                },
                suggestedActionIds: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.STRING,
                  },
                  description:
                    'قائمة بمعرفات الإجراءات المرتبطة بالرد من القائمة المسموح بها فقط (0 إلى 3 معرفات).',
                },
              },
              required: ['reply', 'suggestedActionIds'],
            },
          },
        });

        let rawText = (response.text ?? '').trim();
        if (!rawText) {
          throw new Error(`Empty response from ${modelName}`);
        }
        if (rawText.startsWith('```')) {
          rawText = rawText
            .replace(/^```(?:json)?\s*/i, '')
            .replace(/\s*```$/i, '')
            .trim();
        }

        let parsed: { reply?: unknown; suggestedActionIds?: unknown };
        try {
          parsed = JSON.parse(rawText) as {
            reply?: unknown;
            suggestedActionIds?: unknown;
          };
        } catch {
          return {
            reply: rawText,
            actionIds: [],
          };
        }

        const replyText =
          typeof parsed.reply === 'string' && parsed.reply.trim().length > 0
            ? parsed.reply.trim()
            : 'مرحبًا بك، كيف يمكنني مساعدتك في خدمات بوابة الأمين للإنترنت؟';

        const rawIds = Array.isArray(parsed.suggestedActionIds)
          ? parsed.suggestedActionIds
          : [];

        const uniqueValidIds: AssistantActionId[] = [];
        for (const item of rawIds) {
          if (
            typeof item === 'string' &&
            isValidActionId(item) &&
            !uniqueValidIds.includes(item)
          ) {
            uniqueValidIds.push(item);
            if (uniqueValidIds.length >= 3) break;
          }
        }

        return {
          reply: replyText,
          actionIds: uniqueValidIds,
        };
      } catch (error: unknown) {
        lastError = error;
        const errObj = error as { status?: number; message?: string };
        const status = errObj?.status;
        const msg = String(errObj?.message ?? error ?? '');
        console.error(`[AlAmeenAssistant] ${modelName} attempt ${attempt} error (${status ?? 'unknown'}):`, msg);

        if (
          status === 400 ||
          status === 401 ||
          status === 403 ||
          msg.includes('API_KEY_INVALID') ||
          msg.includes('PERMISSION_DENIED')
        ) {
          throw new AssistantServiceError(
            `Gemini auth error (${status}): ${msg}`,
            status === 401 ? 401 : status === 403 ? 403 : 503,
            'تعذر الاتصال بالمساعد الذكي حاليًا بسبب صلاحية مفتاح الخدمة. يرجى التحقق من مفتاح Gemini API أو التواصل مع الدعم الفني.'
          );
        }

        if (status === 429 || msg.includes('RESOURCE_EXHAUSTED')) {
          lastStatus = 429;
          // Immediately fall through to next model on 429 instead of burning retries on exhausted model
          break;
        }

        if (attempt < 2) {
          await sleep(300);
        }
      }
    }
  }

  const fallbackMsg = lastError instanceof Error ? lastError.message : String(lastError);
  if (lastStatus === 429) {
    throw new AssistantServiceError(
      `Gemini quota exceeded across models: ${fallbackMsg}`,
      429,
      'تم تجاوز حد الاستخدام المجاني لخدمة Gemini API حاليًا (429). يمكنك الانتظار قليلاً أو ترقية مفتاح API، أو التواصل مباشرة عبر واتساب وصفحة الدعم الفني.'
    );
  }
  throw new AssistantServiceError(
    `Gemini upstream failure: ${fallbackMsg}`,
    502,
    'حدث خطأ مؤقت أثناء تجهيز الإجابة. يرجى المحاولة مرة أخرى أو التواصل عبر صفحة اتصل بنا.'
  );
}
