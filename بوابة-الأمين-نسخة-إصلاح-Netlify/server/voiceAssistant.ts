import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import {
  SERVICES_FORM_ENUMS,
  type OfficialServiceType,
  type VoiceServiceDraft,
} from '../src/config/forms.ts';
import { SITE_INFO } from '../src/config/site.ts';
import { AssistantServiceError } from './assistant.ts';

export interface VoiceTurnInput {
  role: 'user' | 'assistant';
  content: string;
}

export interface VoiceAnalyzeResult {
  assistantMessage: string;
  updatedDraft: VoiceServiceDraft;
  missingFields: string[];
  readyForConfirmation: boolean;
}

const ALLOWED_AUDIO_MIME_TYPES = new Set([
  'audio/webm',
  'audio/mp4',
  'audio/ogg',
  'audio/wav',
  'audio/mpeg',
  'audio/mp3',
  'audio/aac',
  'audio/x-m4a',
]);

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new AssistantServiceError(
      'GEMINI_API_KEY is not configured on the server.',
      503,
      'عذرًا، خدمة الذكاء الاصطناعي غير مهيأة حاليًا. يمكنك استخدام نموذج الطلب مباشرة أو التواصل معنا عبر الدعم الفني.'
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

export function normalizeAudioMimeType(rawMime: string): string | null {
  const base = rawMime.split(';')[0]?.trim().toLowerCase() ?? '';
  if (!ALLOWED_AUDIO_MIME_TYPES.has(base)) return null;
  if (base === 'audio/x-m4a') return 'audio/mp4';
  return base;
}

function pickExactEnum<T extends readonly string[]>(
  value: unknown,
  allowed: T
): T[number] | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return allowed.find((item) => item === trimmed);
}

function matchDeviceEnum(
  value: unknown,
  matchers: Array<{ value: string; keywords: string[] }>
): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const lower = trimmed.toLowerCase();
  for (const item of matchers) {
    if (trimmed === item.value) return item.value;
    if (item.keywords.some((kw) => lower.includes(kw))) {
      return item.value;
    }
  }
  return undefined;
}

function sanitizeDraft(raw: Partial<VoiceServiceDraft> | null | undefined): VoiceServiceDraft {
  if (!raw || typeof raw !== 'object') return {};

  const serviceType = (pickExactEnum(
    raw.serviceType,
    SERVICES_FORM_ENUMS.serviceTypes
  ) ||
    matchDeviceEnum(raw.serviceType, [
      { value: 'تركيب راوتر أو جهاز', keywords: ['تركيب', 'راوتر', 'مودم', 'جهاز', 'لاقط'] },
      { value: 'الدعم الفني', keywords: ['دعم', 'مشكلة', 'بطء', 'انقطاع', 'فني'] },
      { value: 'صيانة وإصلاح الأعطال', keywords: ['صيانة', 'عطل', 'اصلاح', 'إصلاح', 'خربان'] },
      { value: 'نقل الخدمة', keywords: ['نقل'] },
    ])) as OfficialServiceType | undefined;

  const cleanStr = (val: unknown, maxLen: number): string | undefined => {
    if (typeof val !== 'string') return undefined;
    const t = val.trim();
    return t.length > 0 ? t.slice(0, maxLen) : undefined;
  };

  const routerDevice = matchDeviceEnum(raw.routerDevice, [
    { value: 'A1 – ONE (TP-Link)', keywords: ['tp-link', 'tplink', 'tp link', 'a1', 'one'] },
    { value: 'A2 – TWO (راوتر لاسلكي)', keywords: ['totolink', 'toto', 'a2', 'two'] },
    { value: 'A3 – THREE (مودم KT)', keywords: ['kt', 'a3', 'three'] },
    { value: 'A4 – FOUR (مودم LG)', keywords: ['lg', 'a4', 'four'] },
  ]);

  const linkDevice = matchDeviceEnum(raw.linkDevice, [
    { value: 'B4 – NanoStation M5', keywords: ['nanostation m5', 'm5', 'b4'] },
    { value: 'B1 – NanoStation', keywords: ['nanostation', 'm2', 'b1', 'نانوستيشن'] },
    { value: 'B2 – PowerBeam', keywords: ['powerbeam', 'b2', 'باوربيم'] },
    { value: 'B3 – LiteBeam', keywords: ['litebeam', 'b3', 'لايت بيم'] },
  ]);

  let deviceCategory =
    pickExactEnum(raw.deviceCategory, SERVICES_FORM_ENUMS.deviceCategories) ||
    matchDeviceEnum(raw.deviceCategory, [
      { value: 'أجهزة الراوتر والمودم (A)', keywords: ['راوتر', 'مودم', '(a)'] },
      { value: 'أجهزة الربط واللاقِطات (B)', keywords: ['ربط', 'لاقط', 'خارجي', '(b)'] },
    ]);

  if (!deviceCategory) {
    if (routerDevice) deviceCategory = 'أجهزة الراوتر والمودم (A)';
    else if (linkDevice) deviceCategory = 'أجهزة الربط واللاقِطات (B)';
  }

  return {
    serviceType: serviceType ?? '',
    fullName: cleanStr(raw.fullName, 120),
    phone: cleanStr(raw.phone, 40),
    district: cleanStr(raw.district, 140),
    subscriberStatus:
      pickExactEnum(raw.subscriberStatus, SERVICES_FORM_ENUMS.subscriberStatuses) ||
      matchDeviceEnum(raw.subscriberStatus, [
        { value: 'نعم، لدي اشتراك حالي.', keywords: ['نعم', 'حالي', 'مشترك حال'] },
        { value: 'لا، أريد الاشتراك لأول مرة.', keywords: ['لا', 'جديد', 'أول مرة', 'اول مرة'] },
        { value: 'كنت مشتركاً سابقاً.', keywords: ['سابق'] },
      ]),
    deviceCategory,
    routerDevice,
    linkDevice,
    supportProblemType:
      pickExactEnum(raw.supportProblemType, SERVICES_FORM_ENUMS.supportProblems) ||
      matchDeviceEnum(raw.supportProblemType, [
        { value: 'انقطاع الإنترنت بالكامل.', keywords: ['انقطاع', 'مقطوع', 'ما يشتغل', 'لا يعمل'] },
        { value: 'بطء سرعة الإنترنت.', keywords: ['بطء', 'بطيء', 'ضعيف السرعة'] },
        { value: 'ضعف إشارة الواي فاي.', keywords: ['واي فاي', 'ضعف الإشارة', 'الاشارة'] },
        { value: 'عدم القدرة على الاتصال بالشبكة.', keywords: ['عدم القدرة', 'اتصال بالشبكة'] },
        { value: 'مشكلة في الراوتر أو المودم.', keywords: ['راوتر', 'مودم'] },
        { value: 'مشكلة أخرى.', keywords: ['أخرى', 'اخرى'] },
      ]),
    details: cleanStr(raw.details, 600),
    maintenanceDeviceName: cleanStr(raw.maintenanceDeviceName, 120),
    currentDistrict: cleanStr(raw.currentDistrict, 140),
    newDistrict: cleanStr(raw.newDistrict, 140),
  };
}

export async function transcribeArabicVoice(params: {
  audioBase64: string;
  mimeType: string;
}): Promise<string> {
  const cleanMime = normalizeAudioMimeType(params.mimeType);
  if (!cleanMime) {
    throw new AssistantServiceError(
      `Unsupported audio mimeType: ${params.mimeType}`,
      400,
      'صيغة الصوت غير مدعومة. يمكنك المحاولة مرة أخرى أو كتابة طلبك نصيًا.'
    );
  }

  const ai = getGeminiClient();
  const promptText =
    'فرّغ الكلام البشري المنطوق في هذا التسجيل الصوتي باللغة العربية بدقة وأمانة، وأرجع النص المنطوق فقط بدون مقدمات أو شروحات أو تنسيق. إذا كان التسجيل صامتًا أو لا يحتوي على صوت بشري واضح، أرجع نصًا فارغًا تمامًا ولا تخمّن أي كلام.';

  const modelsToTry = [
    'gemini-3.5-transcribe',
    'gemini-4-hydrogen',
    'gemini-3.1-flash-lite',
  ];
  let lastError: unknown;
  let lastStatus = 502;

  for (const modelName of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: cleanMime,
                data: params.audioBase64,
              },
            },
            { text: promptText },
          ],
        },
      });

      const text = (response.text ?? '').trim();
      if (!text) {
        throw new AssistantServiceError(
          'Empty transcription result',
          422,
          'لم نتمكن من سماع صوت واضح. يرجى التحدث بوضوح وإعادة المحاولة، أو كتابة طلبك مباشرة.'
        );
      }
      return text;
    } catch (error: unknown) {
      if (error instanceof AssistantServiceError) throw error;
      lastError = error;
      const errObj = error as { status?: number; message?: string };
      const status = errObj?.status;
      if (status === 429 || String(errObj?.message ?? '').includes('RESOURCE_EXHAUSTED')) {
        lastStatus = 429;
      }
      console.error(`[VoiceTranscribe] ${modelName} error:`, errObj?.message ?? error);
    }
  }

  const msg = lastError instanceof Error ? lastError.message : String(lastError);
  if (lastStatus === 429) {
    throw new AssistantServiceError(
      `Transcription quota exceeded: ${msg}`,
      429,
      'تم تجاوز حد الاستخدام المؤقت لخدمة تفريغ الصوت. يمكنك المحاولة بعد لحظات أو كتابة طلبك مباشرة بالأسفل.'
    );
  }
  throw new AssistantServiceError(
    `Transcription error: ${msg}`,
    502,
    'تعذر تحويل الصوت إلى نص حاليًا. يمكنك إعادة المحاولة أو كتابة طلبك نصيًا.'
  );
}

export async function analyzeVoiceServiceRequest(params: {
  message: string;
  history: VoiceTurnInput[];
  currentDraft: VoiceServiceDraft;
}): Promise<VoiceAnalyzeResult> {
  const ai = getGeminiClient();
  const safeCurrentDraft = sanitizeDraft(params.currentDraft);

  const systemInstruction = `أنت موظف خدمة عملاء صوتي محترف في «${SITE_INFO.fullNameAr}» (${SITE_INFO.serviceArea}).
مهمتك فهم طلبات العملاء الصوتية باللغة العربية واللهجة اليمنية والخليجية، وتحويلها إلى طلب خدمة منظم متوافق تمامًا مع نموذج خدمات بوابة الأمين الرسمي.

البيانات المجمّعة حتى الآن (currentDraft):
${JSON.stringify(safeCurrentDraft, null, 2)}

الخدمات الرسمية الأربعة في النموذج (اختر القيمة المطابقة حرفيًا فقط):
1. "تركيب راوتر أو جهاز": عند رغبة العميل بتركيب مودم، راوتر، لاقط، أو جهاز إنترنت جديد.
2. "الدعم الفني": عند وجود انقطاع، بطء، ضعف إشارة، عدم اتصال، أو مشكلة تقنية يطلب لها مساعدة فنية.
3. "صيانة وإصلاح الأعطال": عند وجود عطل مادي أو تلف في الجهاز/الراوتر/اللاقط ويحتاج صيانة أو إصلاحًا.
4. "نقل الخدمة": عند رغبة العميل بنقل خط/خدمة الإنترنت من منزل أو حي إلى مكان آخر.

ملاحظة تمييز مهم:
- إذا قال العميل مثلًا "النت عندي خربان وما يشتغل" أو "النت مقطوع"، افهم أن الخدمة الأقرب هي "الدعم الفني" (أو "صيانة وإصلاح الأعطال" إذا ذكر عطلًا واضحًا في الجهاز نفسه مثل احتراق/كسر/تعطل الراوتر)، واسأله بلطف لتأكيد التفاصيل الناقصة إن لزم.

القيم الدقيقة لحقول النموذج الرسمي (استخدم هذه النصوص حرفيًا عند تطابقها، ولا تخترع قيمًا أخرى):
- subscriberStatus:
  * "نعم، لدي اشتراك حالي."
  * "لا، أريد الاشتراك لأول مرة."
  * "كنت مشتركاً سابقاً."
- deviceCategory (يُستخدم في التركيب أو الصيانة):
  * "أجهزة الراوتر والمودم (A)"
  * "أجهزة الربط واللاقِطات (B)"
- routerDevice (عند اختيار تركيب فئة A):
  * "A1 – ONE (TP-Link)"
  * "A2 – TWO (راوتر لاسلكي)"
  * "A3 – THREE (مودم KT)"
  * "A4 – FOUR (مودم LG)"
- linkDevice (عند اختيار تركيب فئة B):
  * "B1 – NanoStation"
  * "B2 – PowerBeam"
  * "B3 – LiteBeam"
  * "B4 – NanoStation M5"
- supportProblemType (عند اختيار الدعم الفني):
  * "انقطاع الإنترنت بالكامل."
  * "بطء سرعة الإنترنت."
  * "ضعف إشارة الواي فاي."
  * "عدم القدرة على الاتصال بالشبكة."
  * "مشكلة في الراوتر أو المودم."
  * "مشكلة أخرى."

قواعد المحادثة الذكية:
1. احتفظ بجميع البيانات الصحيحة الموجودة سابقًا في currentDraft، وأضف أو حدّث فقط ما ذكره العميل في رسالته الجديدة (لا تمسح معلومات ذكرها العميل سابقًا).
2. اسأل العميل عن المعلومات الناقصة فقط، ولا تكرر أبدًا أي سؤال سبق أن أجاب عنه.
3. المعلومات المهمة لكل خدمة:
   - دائمًا: نوع الخدمة (serviceType) + المنطقة أو الحي (district، أو currentDistrict و newDistrict في حالة نقل الخدمة — استخرج أي حي أو مدينة يذكرها العميل مثل الشحر أو المنصورة أو السوق فورًا داخل الحقل) + تفاصيل الطلب أو المشكلة (details أو الجهاز المطلوب).
   - مفيد جدًا إن أمكن: الاسم الكامل (fullName) ورقم الهاتف (phone) لتجهيز النموذج بالكامل (اسأل عنهما بلطف إذا كانا ناقصين، ولكن إذا ذكر العميل الخدمة والمنطقة والتفاصيل وأبدى استعداده للتأكيد أو كان السؤال الثالث، لا تطِل الأسئلة).
4. إذا كانت المعلومات الأساسية قد اكتملت (serviceType واضح + المنطقة/الحي + تفاصيل المشكلة/الجهاز)، أو طلب العميل إتمام/مراجعة الطلب:
   - اجعل readyForConfirmation = true.
   - قدّم في assistantMessage تلخيصًا وديًا قصيرًا واطلب منه مراجعة ملخص الطلب الظاهر أمامه والضغط على زر التأكيد لفتح نموذج الطلب.
5. إذا كانت هناك معلومات أساسية ناقصة:
   - اجعل readyForConfirmation = false.
   - اسأل عن معلومة أو معلومتين ناقصتين فقط في جملة قصيرة وودودة سهلة السماع والرد (مثلاً: "فهمت أنك تريد تركيب راوتر. في أي حي أو منطقة تسكن، وما نوع الجهاز أو اسمك ورقم هاتفك لتسجيل الطلب؟").
6. لا تخترع أبدًا رقم هاتف أو اسمًا أو حيًّا لم يقله العميل. اترك الحقل غير المذكور فارغًا ("").`;

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
            systemInstruction,
            ...(modelName === 'gemini-4-hydrogen' && attempt === 1
              ? { thinkingConfig: { thinkingLevel: ThinkingLevel.LOW } }
              : {}),
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                assistantMessage: {
                  type: Type.STRING,
                  description:
                    'رد عربي قصير وودود يتفاعل مع العميل ويسأل عن المعلومات الناقصة فقط أو يدعوه لمراجعة الملخص وتأكيده.',
                },
                readyForConfirmation: {
                  type: Type.BOOLEAN,
                  description:
                    'true فقط عندما يصبح نوع الخدمة والتفاصيل الأساسية واضحة وجاهزة لعرض الملخص للتأكيد.',
                },
                missingFields: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'أسماء الحقول الأساسية التي ما زالت ناقصة باللغة العربية.',
                },
                draft: {
                  type: Type.OBJECT,
                  description: 'كائن يضم جميع الحقول المستخرجة من كلام العميل حتى الآن.',
                  properties: {
                    serviceType: {
                      type: Type.STRING,
                      description: 'نوع الخدمة المطابق حرفيًا لأحد الخيارات الأربعة.',
                    },
                    fullName: {
                      type: Type.STRING,
                      description: 'الاسم الكامل للعميل إذا ذكره.',
                    },
                    phone: {
                      type: Type.STRING,
                      description: 'رقم هاتف العميل إذا ذكره.',
                    },
                    district: {
                      type: Type.STRING,
                      description: 'المنطقة أو الحي أو المدينة التي ذكرها العميل مثل المنصورة أو الشحر.',
                    },
                    subscriberStatus: {
                      type: Type.STRING,
                      description: 'حالة الاشتراك الحالية إذا ذكرها العميل.',
                    },
                    deviceCategory: {
                      type: Type.STRING,
                      description: 'فئة الجهاز (A للراوتر أو B للربط الخارجي) إذا ذُكرت.',
                    },
                    routerDevice: {
                      type: Type.STRING,
                      description: 'موديل الراوتر المطابق مثل A1 – ONE (TP-Link) إذا ذكره العميل.',
                    },
                    linkDevice: {
                      type: Type.STRING,
                      description: 'جهاز الربط الخارجي مثل B1 – NanoStation إذا ذكره العميل.',
                    },
                    supportProblemType: {
                      type: Type.STRING,
                      description: 'تصنيف مشكلة الدعم الفني إذا ذُكر.',
                    },
                    details: {
                      type: Type.STRING,
                      description: 'تفاصيل المشكلة أو الطلب أو الملاحظات الإضافية.',
                    },
                    maintenanceDeviceName: {
                      type: Type.STRING,
                      description: 'اسم الجهاز المطلوب صيانته إذا ذُكر.',
                    },
                    currentDistrict: {
                      type: Type.STRING,
                      description: 'الحي الحالي في حالة نقل الخدمة.',
                    },
                    newDistrict: {
                      type: Type.STRING,
                      description: 'الحي الجديد في حالة نقل الخدمة.',
                    },
                  },
                },
              },
              required: [
                'assistantMessage',
                'readyForConfirmation',
                'missingFields',
                'draft',
              ],
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

        const parsed = JSON.parse(rawText) as {
          assistantMessage?: unknown;
          readyForConfirmation?: unknown;
          missingFields?: unknown;
          draft?: Partial<VoiceServiceDraft>;
        };

        const sanitizedIncoming = sanitizeDraft(parsed.draft);
        const mergedDraft: VoiceServiceDraft = {
          serviceType:
            sanitizedIncoming.serviceType || safeCurrentDraft.serviceType || '',
          fullName: sanitizedIncoming.fullName || safeCurrentDraft.fullName,
          phone: sanitizedIncoming.phone || safeCurrentDraft.phone,
          district: sanitizedIncoming.district || safeCurrentDraft.district,
          subscriberStatus:
            sanitizedIncoming.subscriberStatus || safeCurrentDraft.subscriberStatus,
          deviceCategory:
            sanitizedIncoming.deviceCategory || safeCurrentDraft.deviceCategory,
          routerDevice:
            sanitizedIncoming.routerDevice || safeCurrentDraft.routerDevice,
          linkDevice: sanitizedIncoming.linkDevice || safeCurrentDraft.linkDevice,
          supportProblemType:
            sanitizedIncoming.supportProblemType ||
            safeCurrentDraft.supportProblemType,
          details: sanitizedIncoming.details || safeCurrentDraft.details,
          maintenanceDeviceName:
            sanitizedIncoming.maintenanceDeviceName ||
            safeCurrentDraft.maintenanceDeviceName,
          currentDistrict:
            sanitizedIncoming.currentDistrict || safeCurrentDraft.currentDistrict,
          newDistrict:
            sanitizedIncoming.newDistrict || safeCurrentDraft.newDistrict,
        };

        const assistantMessage =
          typeof parsed.assistantMessage === 'string' &&
          parsed.assistantMessage.trim().length > 0
            ? parsed.assistantMessage.trim()
            : 'أهلاً بك، أخبرني بالخدمة التي تحتاجها وسأساعدك في تجهيز الطلب.';

        const missingFields = Array.isArray(parsed.missingFields)
          ? parsed.missingFields
              .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
              .slice(0, 6)
          : [];

        const hasServiceType = Boolean(mergedDraft.serviceType);
        const readyForConfirmation =
          Boolean(parsed.readyForConfirmation) && hasServiceType;

        return {
          assistantMessage,
          updatedDraft: mergedDraft,
          missingFields,
          readyForConfirmation,
        };
      } catch (error: unknown) {
        if (error instanceof AssistantServiceError) throw error;
        lastError = error;
        const errObj = error as { status?: number; message?: string };
        const status = errObj?.status;
        const errMsg = String(errObj?.message ?? error ?? '');
        console.error(`[VoiceAnalyze] ${modelName} attempt ${attempt} error (${status ?? 'unknown'}):`, errMsg);

        if (
          status === 400 ||
          status === 401 ||
          status === 403 ||
          errMsg.includes('API_KEY_INVALID') ||
          errMsg.includes('PERMISSION_DENIED')
        ) {
          throw new AssistantServiceError(
            `Gemini auth error (${status}): ${errMsg}`,
            status === 401 ? 401 : status === 403 ? 403 : 503,
            'تعذر الاتصال بخدمة الذكاء الاصطناعي حاليًا بسبب إعدادات مفتاح API. يمكنك تعبئة نموذج الطلب مباشرة.'
          );
        }

        if (status === 429 || errMsg.includes('RESOURCE_EXHAUSTED')) {
          lastStatus = 429;
          break;
        }

        if (attempt < 2) {
          await new Promise((r) => setTimeout(r, 350));
        }
      }
    }
  }

  const msg = lastError instanceof Error ? lastError.message : String(lastError);
  if (lastStatus === 429) {
    throw new AssistantServiceError(
      `Gemini quota exceeded across models: ${msg}`,
      429,
      'تم تجاوز حد الاستخدام المجاني لخدمة الذكاء الاصطناعي حاليًا (429). يمكنك الانتظار قليلاً أو تعبئة نموذج الطلب مباشرة.'
    );
  }
  throw new AssistantServiceError(
    `Voice analyze error: ${msg}`,
    502,
    'حدث خطأ مؤقت أثناء تحليل طلبك. يرجى المحاولة مرة أخرى أو تعبئة نموذج الخدمة مباشرة.'
  );
}

export async function synthesizeArabicSpeech(text: string): Promise<string> {
  const ai = getGeminiClient();
  const cleanText = text.trim().slice(0, 420);
  if (!cleanText) {
    throw new AssistantServiceError('Empty TTS text', 400, 'لا يوجد نص للقراءة.');
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: cleanText,
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio =
      response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      throw new Error('No audio data returned by TTS model');
    }
    return base64Audio;
  } catch (error: unknown) {
    const errObj = error as { status?: number; message?: string };
    const status = errObj?.status;
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`[VoiceTTS] error (${status ?? 'unknown'}):`, msg);
    if (status === 429 || msg.includes('RESOURCE_EXHAUSTED')) {
      throw new AssistantServiceError(
        `TTS quota exceeded (429): ${msg}`,
        429,
        'تم تجاوز حد الاستخدام المؤقت لنموذج الصوت (429)، يتم استخدام قارئ المتصفح كبديل.'
      );
    }
    throw new AssistantServiceError(
      `TTS error (${status ?? 502}): ${msg}`,
      502,
      'تعذر تشغيل الرد الصوتي من الخادم حاليًا، يمكنك قراءة الرد نصيًا.'
    );
  }
}
