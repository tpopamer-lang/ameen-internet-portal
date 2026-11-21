import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowUpLeft,
  CheckCircle2,
  Headset,
  MessageCircle,
  Mic,
  Phone,
  Wrench,
} from 'lucide-react';
import {
  SERVICES_FORM_ENUMS,
  buildVoiceServiceFormUrl,
  getServiceFormUrl,
} from '../config/forms';
import { CONTACT_CONFIG } from '../config/site';
import { useVoiceRequest } from '../context/VoiceRequestContext';
import { PageHero } from '../components/PageHero';
import { Reveal } from '../components/Reveal';

const QUICK_TIPS: Record<string, string[]> = {
  'انقطاع الإنترنت بالكامل.': [
    'تأكد من ثبات سلك الطاقة وكابل الشبكة في منفذ الراوتر.',
    'أعد تشغيل الراوتر أو جهاز الربط الخارجي لمدة 20 ثانية ثم أعد الفحص.',
  ],
  'بطء سرعة الإنترنت.': [
    'تحقق من عدم وجود تحديثات أو تنزيلات كبيرة على الأجهزة المتصلة.',
    'افحص مستوى الإشارة أو جرّب الاقتراب من الراوتر للتأكد من جودة البث.',
  ],
  'ضعف إشارة الواي فاي.': [
    'ضع الراوتر في مكان مفتوح ومرتفع بعيدًا عن الجدران السميكة.',
    'وجّه الهوائيات الخارجية للراوتر بشكل عمودي لتحسين التغطية.',
  ],
  'عدم القدرة على الاتصال بالشبكة.': [
    'أعد اختيار شبكة الواي فاي على جهازك وتأكد من صحة كلمة المرور أو رمز الكرت.',
    'افصل شبكة الواي فاي وأعد تشغيلها على الهاتف أو الحاسوب.',
  ],
  'مشكلة في الراوتر أو المودم.': [
    'راقب أضواء الحالة في مقدمة الراوتر وتحقق من إضاءة منفذ WAN/الإنترنت.',
    'لا تقم بإعادة ضبط المصنع قبل استشارة الدعم الفني حتى لا تضيع الإعدادات.',
  ],
  'مشكلة أخرى.': [
    'اكتب وصفًا مختصرًا لما يظهر لديك ومتى بدأت المشكلة.',
    'أرفق اسم المنطقة السكنية ليسهل على الفريق الفني تحديد أقرب نقطة تغطية.',
  ],
};

export function SupportPage() {
  const { openVoiceModal } = useVoiceRequest();
  const supportFormUrl = getServiceFormUrl('الدعم الفني');

  const [selectedProblem, setSelectedProblem] = useState<string>(
    SERVICES_FORM_ENUMS.supportProblems[0]
  );
  const [district, setDistrict] = useState('');
  const [phone, setPhone] = useState('');
  const [details, setDetails] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [districtError, setDistrictError] = useState<string | null>(null);
  const [prepared, setPrepared] = useState(false);

  const prefilledSupportUrl = useMemo(
    () =>
      buildVoiceServiceFormUrl({
        serviceType: 'الدعم الفني',
        supportProblemType: selectedProblem,
        district,
        phone,
        details,
      }),
    [selectedProblem, district, phone, details]
  );

  const activeTips = QUICK_TIPS[selectedProblem] ?? QUICK_TIPS['مشكلة أخرى.'];

  const handlePrepareSupportReport = (e: React.FormEvent) => {
    e.preventDefault();
    let hasError = false;

    if (district.trim().length < 2) {
      setDistrictError('يرجى إدخال الحي أو المنطقة لتسهيل سرعة الاستجابة.');
      hasError = true;
    } else {
      setDistrictError(null);
    }

    if (phone.trim().length > 0) {
      const digits = phone.replace(/[\s+\-()]/g, '');
      if (!/^\d{7,15}$/.test(digits)) {
        setPhoneError('رقم الهاتف يجب أن يحتوي على 7 إلى 15 رقمًا.');
        hasError = true;
      } else {
        setPhoneError(null);
      }
    } else {
      setPhoneError(null);
    }

    if (hasError) {
      setPrepared(false);
      return;
    }

    setPrepared(true);
  };

  return (
    <div>
      <PageHero
        eyebrow="مساعدة العملاء"
        title="الدعم الفني"
        description="شخّص مشكلتك بسرعة أو أرسل بلاغك الفني وسيتم تحديد نوع الخدمة تلقائيًا."
        breadcrumbLabel="الدعم الفني"
      />

      <section className="py-14 sm:py-20 bg-white">
        <div className="w-[92%] max-w-[920px] mx-auto space-y-8">
          <a
            href={supportFormUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative overflow-hidden block bg-[#030A14] text-white border border-white/15 rounded-2xl p-8 sm:p-12 text-center hover:border-[#22D3EE] transition-all duration-150 focus-visible:outline-2 focus-visible:outline-[#22D3EE]"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 arch-grid-dark opacity-50"
            />

            <div className="relative z-10">
              <div
                aria-hidden="true"
                className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center bg-[#07162B] border border-[#22D3EE]/35 text-[#22D3EE] group-hover:bg-[#22D3EE] group-hover:text-[#030A14] transition-colors duration-150"
              >
                <Headset className="w-8 h-8" strokeWidth={1.85} />
              </div>

              <h2 className="font-display text-2xl sm:text-[28px] font-black text-white mb-3">
                إرسال بلاغ فني
              </h2>
              <p className="text-[#CBD5E1] text-sm sm:text-base mb-8 leading-relaxed max-w-md mx-auto">
                فتح نموذج الدعم الفني مع تحديد الخدمة مسبقًا.
              </p>

              <span className="inline-flex items-center justify-center gap-2 min-h-[50px] px-8 py-3 rounded-xl bg-[#22D3EE] text-[#030A14] font-bold text-sm group-hover:bg-[#67E8F9] transition-colors duration-150 whitespace-nowrap">
                <span>فتح نموذج الدعم الفني</span>
                <ArrowUpLeft className="w-4 h-4 transition-transform duration-150 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </div>
          </a>

          {/* Interactive Technical Triage & Report Prep */}
          <Reveal>
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E2E8F0]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#071426] text-[#22D3EE] flex items-center justify-center shrink-0">
                    <Wrench className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-display text-lg sm:text-xl font-black text-[#071426] m-0">
                      تشخيص سريع وتجهيز البلاغ الفني
                    </h2>
                    <p className="text-xs text-[#475569] m-0 mt-0.5">
                      اختر نوع العطل لقراءة خطوات فحص أولية ثم جهّز بلاغك للنموذج.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={openVoiceModal}
                  className="min-h-[42px] inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#E2E8F0] text-xs font-bold text-[#071426] hover:border-[#0EA5E9] transition-colors whitespace-nowrap shrink-0"
                >
                  <Mic className="w-4 h-4 text-[#0EA5E9]" />
                  <span>اشرح مشكلتك بصوتك</span>
                </button>
              </div>

              <div>
                <p className="text-xs font-bold text-[#071426] mb-2.5 m-0">
                  1. ما نوع المشكلة التي تواجهها؟
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {SERVICES_FORM_ENUMS.supportProblems.map((prob) => {
                    const active = selectedProblem === prob;
                    return (
                      <button
                        key={prob}
                        type="button"
                        onClick={() => {
                          setSelectedProblem(prob);
                          setPrepared(false);
                        }}
                        className={`text-right px-4 py-3 rounded-xl text-xs font-bold border transition-all ${
                          active
                            ? 'bg-[#071426] text-[#22D3EE] border-[#071426]'
                            : 'bg-white text-[#071426] border-[#E2E8F0] hover:border-[#0EA5E9]'
                        }`}
                      >
                        {prob}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tailored Quick Checks */}
              <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5">
                <p className="text-xs font-extrabold text-[#0EA5E9] mb-2 m-0">
                  خطوات فحص مقترحة قبل إرسال البلاغ:
                </p>
                <ul className="space-y-1.5 text-xs sm:text-sm text-[#475569] pr-5 list-disc marker:text-[#0EA5E9] m-0">
                  {activeTips.map((tip) => (
                    <li key={tip}>{tip}</li>
                  ))}
                </ul>
              </div>

              <form onSubmit={handlePrepareSupportReport} noValidate className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="sup-district"
                      className="block text-xs font-bold text-[#071426] mb-1.5"
                    >
                      المنطقة أو الحي <span className="text-[#DC2626]">*</span>
                    </label>
                    <input
                      id="sup-district"
                      type="text"
                      value={district}
                      onChange={(e) => {
                        setDistrict(e.target.value);
                        if (districtError) setDistrictError(null);
                      }}
                      placeholder="مثال: الشحر - السوق"
                      className={`w-full min-h-[44px] rounded-xl bg-white border px-3.5 text-sm text-[#071426] focus:outline-none ${
                        districtError
                          ? 'border-[#DC2626]'
                          : 'border-[#E2E8F0] focus:border-[#0EA5E9]'
                      }`}
                    />
                    {districtError && (
                      <p className="mt-1 text-[11px] font-bold text-[#DC2626] flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{districtError}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="sup-phone"
                      className="block text-xs font-bold text-[#071426] mb-1.5"
                    >
                      رقم الهاتف للتواصل (اختياري)
                    </label>
                    <input
                      id="sup-phone"
                      type="tel"
                      dir="ltr"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (phoneError) setPhoneError(null);
                      }}
                      placeholder="77xxxxxxx"
                      className={`w-full min-h-[44px] rounded-xl bg-white border px-3.5 text-sm text-[#071426] text-right tabular-nums focus:outline-none ${
                        phoneError
                          ? 'border-[#DC2626]'
                          : 'border-[#E2E8F0] focus:border-[#0EA5E9]'
                      }`}
                    />
                    {phoneError && (
                      <p className="mt-1 text-[11px] font-bold text-[#DC2626] flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{phoneError}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="sup-details"
                    className="block text-xs font-bold text-[#071426] mb-1.5"
                  >
                    تفاصيل إضافية (اختياري)
                  </label>
                  <textarea
                    id="sup-details"
                    rows={2}
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="اكتب أي ملاحظات إضافية عن حالة الراوتر أو الإشارة..."
                    className="w-full rounded-xl bg-white border border-[#E2E8F0] p-3 text-sm text-[#071426] focus:outline-none focus:border-[#0EA5E9]"
                  />
                </div>

                <button
                  type="submit"
                  className="min-h-[46px] px-6 py-2.5 rounded-xl bg-[#071426] text-white font-bold text-xs sm:text-sm hover:bg-[#0EA5E9] transition-colors inline-flex items-center gap-2 whitespace-nowrap"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#22D3EE]" />
                  <span>تجهيز البلاغ الفني</span>
                </button>
              </form>

              {prepared && (
                <div
                  role="status"
                  aria-live="polite"
                  className="bg-[#030A14] text-white border border-[#22D3EE]/45 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <span className="block text-xs font-bold text-[#22D3EE] mb-0.5">
                      البلاغ جاهز للإرسال
                    </span>
                    <p className="text-xs sm:text-sm text-[#CBD5E1] m-0">
                      {selectedProblem} · {district}
                    </p>
                  </div>
                  <a
                    href={prefilledSupportUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#22D3EE] text-[#030A14] font-bold text-xs hover:bg-[#67E8F9] transition-colors whitespace-nowrap shrink-0"
                  >
                    <span>فتح نموذج الدعم المعبأ</span>
                    <ArrowUpLeft className="w-4 h-4" />
                  </a>
                </div>
              )}
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a
                href={CONTACT_CONFIG.phoneHref}
                className="flex items-center justify-between p-5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#0EA5E9] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-[#E2E8F0] text-[#071426] flex items-center justify-center">
                    <Phone className="w-4 h-4 text-[#0EA5E9]" />
                  </div>
                  <div>
                    <span className="block font-display text-sm font-extrabold text-[#071426]">
                      اتصال
                    </span>
                    <span dir="ltr" className="block text-xs text-[#475569] tabular-nums">
                      776220188
                    </span>
                  </div>
                </div>
                <ArrowUpLeft className="w-4 h-4 text-[#64748B]" />
              </a>

              <a
                href={CONTACT_CONFIG.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#0EA5E9] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-[#E2E8F0] text-[#071426] flex items-center justify-center">
                    <MessageCircle className="w-4 h-4 text-[#0EA5E9]" />
                  </div>
                  <div>
                    <span className="block font-display text-sm font-extrabold text-[#071426]">
                      واتساب
                    </span>
                    <span className="block text-xs text-[#475569]">
                      محادثة فورية عبر واتساب
                    </span>
                  </div>
                </div>
                <ArrowUpLeft className="w-4 h-4 text-[#64748B]" />
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
