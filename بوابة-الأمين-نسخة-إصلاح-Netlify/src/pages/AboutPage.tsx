import { useState } from 'react';
import {
  ArrowUpLeft,
  Check,
  Compass,
  Copy,
  MapPin,
  Mic,
  Router,
  Target,
} from 'lucide-react';
import { ABOUT_CONTENT, CONTACT_CONFIG, SITE_INFO } from '../config/site';
import { AppLink } from '../context/RouterContext';
import { useVoiceRequest } from '../context/VoiceRequestContext';
import { PageHero } from '../components/PageHero';
import { Reveal } from '../components/Reveal';

const GOAL_DETAILS: Array<{
  route: string;
  actionLabel: string;
  summary: string;
}> = [
  {
    route: '/services',
    actionLabel: 'استعراض الخدمات والأجهزة',
    summary:
      'تعرف على تفاصيل خدمات التركيب والصيانة والدعم الفني ونقل الخدمة، إلى جانب استعراض قائمة الأجهزة الثمانية المعتمدة.',
  },
  {
    route: '/internet-cards',
    actionLabel: 'عرض الكروت والباقات الشهرية',
    summary:
      'استعرض كروت الإنترنت (A1 إلى A6) والباقات الشهرية (الفضية والذهبية) مع إمكانية المقارنة وحساب الاستخدام المناسب.',
  },
  {
    route: '/request',
    actionLabel: 'فتح صفحة طلب خدمة أو اشتراك',
    summary:
      'قدّم طلب اشتراك أو خدمة تركيب بسهولة عبر منشئ الطلب التفاعلي أو عبر خدمة «اطلب خدمتك بصوتك».',
  },
  {
    route: '/support',
    actionLabel: 'الانتقال إلى الدعم الفني',
    summary:
      'أرسل بلاغًا فنيًا محددًا بنوع المشكلة ليصل مباشرة لفريق الدعم الفني في مديرية الشحر.',
  },
];

export function AboutPage() {
  const { openVoiceModal } = useVoiceRequest();
  const [selectedGoalIdx, setSelectedGoalIdx] = useState<number>(0);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [imgError, setImgError] = useState(false);

  const activeGoal = GOAL_DETAILS[selectedGoalIdx] ?? GOAL_DETAILS[0];

  const handleCopyAddress = () => {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(SITE_INFO.addressDisplay).catch(() => undefined);
    }
    setCopiedAddress(true);
    window.setTimeout(() => setCopiedAddress(false), 2200);
  };

  return (
    <div>
      <PageHero
        eyebrow={SITE_INFO.fullNameAr}
        title={ABOUT_CONTENT.title}
        description={ABOUT_CONTENT.intro}
        breadcrumbLabel="من نحن"
      />

      {/* Vision & Mission Editorial Split */}
      <section className="py-14 sm:py-20 bg-white">
        <div className="w-[92%] max-w-[1200px] mx-auto">
          <Reveal>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-14">
              <div className="lg:col-span-7 border border-[#E2E8F0] rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-px bg-[#E2E8F0]">
                <article className="bg-[#F8FAFC] p-7 sm:p-9 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <span className="font-mono-tech text-xs font-bold text-[#0EA5E9]">
                        01 · التوجه
                      </span>
                      <div
                        aria-hidden="true"
                        className="w-11 h-11 rounded-xl bg-white border border-[#E2E8F0] text-[#071426] flex items-center justify-center"
                      >
                        <Compass className="w-5 h-5" strokeWidth={1.85} />
                      </div>
                    </div>
                    <h2 className="font-display text-2xl font-black text-[#071426] mb-3">
                      {ABOUT_CONTENT.visionTitle}
                    </h2>
                    <p className="text-[#475569] text-sm sm:text-[15px] leading-[1.9] m-0">
                      {ABOUT_CONTENT.visionText}
                    </p>
                  </div>
                </article>

                <article className="bg-white p-7 sm:p-9 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <span className="font-mono-tech text-xs font-bold text-[#B48A36]">
                        02 · الالتزام
                      </span>
                      <div
                        aria-hidden="true"
                        className="w-11 h-11 rounded-xl bg-[#FAF5E8] border border-[#D6B56D]/40 text-[#9A7426] flex items-center justify-center"
                      >
                        <Target className="w-5 h-5" strokeWidth={1.85} />
                      </div>
                    </div>
                    <h2 className="font-display text-2xl font-black text-[#071426] mb-3">
                      {ABOUT_CONTENT.missionTitle}
                    </h2>
                    <p className="text-[#475569] text-sm sm:text-[15px] leading-[1.9] m-0">
                      {ABOUT_CONTENT.missionText}
                    </p>
                  </div>
                </article>
              </div>

              <div className="lg:col-span-5">
                <div className="relative h-full min-h-[260px] rounded-2xl overflow-hidden border border-[#E2E8F0] bg-[#030A14]">
                  {!imgError ? (
                    <img
                      src="/src/assets/images/telecom_infra_studio_1795295003563.jpg"
                      alt={SITE_INFO.fullNameAr}
                      referrerPolicy="no-referrer"
                      onError={() => setImgError(true)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full min-h-[260px] arch-grid-dark flex flex-col items-center justify-center text-[#22D3EE]">
                      <Router className="w-12 h-12 mb-2" />
                      <span className="font-display font-bold text-sm">
                        {SITE_INFO.fullNameAr}
                      </span>
                    </div>
                  )}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-[#030A14]/85 via-transparent to-transparent"
                  />
                  <div className="absolute bottom-5 right-5 left-5 text-white">
                    <span className="block text-xs font-bold text-[#22D3EE] mb-0.5">
                      {SITE_INFO.tagline}
                    </span>
                    <span className="font-display text-base font-bold">
                      {SITE_INFO.fullNameAr}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Interactive Portal Goals Explorer */}
          <Reveal delay={0.05}>
            <div className="mb-14">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6">
                <h2 className="font-display text-2xl sm:text-3xl font-black text-[#071426] m-0">
                  {ABOUT_CONTENT.goalsTitle}
                </h2>
                <p className="text-xs font-bold text-[#0EA5E9] m-0">
                  اضغط على أي هدف للوصول مباشرة إلى القسم المرتبط به
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[#E2E8F0] border border-[#E2E8F0] rounded-2xl overflow-hidden">
                {ABOUT_CONTENT.goals.map((goal, idx) => {
                  const isActive = selectedGoalIdx === idx;
                  return (
                    <button
                      key={goal}
                      type="button"
                      onClick={() => setSelectedGoalIdx(idx)}
                      aria-pressed={isActive}
                      className={`text-right p-6 sm:p-7 flex flex-col justify-between transition-colors focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#0EA5E9] ${
                        isActive
                          ? 'bg-[#030A14] text-white'
                          : 'bg-white hover:bg-[#F8FAFC] text-[#071426]'
                      }`}
                    >
                      <span
                        className={`font-mono-tech text-xs font-bold mb-5 block tabular-nums ${
                          isActive ? 'text-[#22D3EE]' : 'text-[#0EA5E9]'
                        }`}
                      >
                        0{idx + 1}
                      </span>
                      <span className="text-sm sm:text-[15px] font-bold leading-relaxed">
                        {goal}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Active Goal Action Panel */}
              <div className="mt-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="max-w-2xl">
                  <p className="text-xs font-bold text-[#0EA5E9] mb-1 m-0">
                    0{selectedGoalIdx + 1} · {ABOUT_CONTENT.goals[selectedGoalIdx]}
                  </p>
                  <p className="text-sm text-[#475569] m-0 leading-relaxed">
                    {activeGoal.summary}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  <AppLink
                    to={activeGoal.route}
                    className="min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#071426] text-white text-xs font-bold hover:bg-[#0EA5E9] transition-colors whitespace-nowrap"
                  >
                    <span>{activeGoal.actionLabel}</span>
                    <ArrowUpLeft className="w-4 h-4 text-[#22D3EE]" />
                  </AppLink>
                  {selectedGoalIdx === 2 && (
                    <button
                      type="button"
                      onClick={openVoiceModal}
                      className="min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#22D3EE] text-[#030A14] text-xs font-bold hover:bg-[#67E8F9] transition-colors whitespace-nowrap"
                    >
                      <Mic className="w-3.5 h-3.5" />
                      <span>اطلب بصوتك</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </Reveal>

          {/* Service Area & HQ Band */}
          <Reveal delay={0.1}>
            <div className="relative overflow-hidden bg-[#030A14] text-white rounded-2xl p-8 sm:p-11 border border-white/12 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 arch-grid-dark opacity-50"
              />

              <div className="relative z-10 max-w-xl">
                <h2 className="font-display text-2xl font-extrabold text-[#22D3EE] mb-3">
                  نطاق الخدمة ومقر الشبكة
                </h2>
                <p className="text-[#CBD5E1] text-sm sm:text-[15px] leading-relaxed mb-4">
                  {SITE_INFO.activityNature}
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href={CONTACT_CONFIG.mapsHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-bold text-[#D6B56D] hover:text-white transition-colors"
                  >
                    <MapPin className="w-4 h-4 shrink-0" />
                    <span>
                      {SITE_INFO.serviceArea} · {SITE_INFO.addressDisplay}
                    </span>
                  </a>

                  <button
                    type="button"
                    onClick={handleCopyAddress}
                    className="min-h-[34px] inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 border border-white/15 text-[11px] font-bold text-white hover:border-[#22D3EE] transition-colors"
                  >
                    {copiedAddress ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#22D3EE]" />
                        <span>تم نسخ العنوان</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-[#D6B56D]" />
                        <span>نسخ العنوان</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="relative z-10 flex flex-wrap gap-3 shrink-0">
                <AppLink
                  to="/services"
                  className="min-h-[46px] inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-[#030A14] bg-[#22D3EE] hover:bg-[#67E8F9] active:scale-[0.98] transition-all whitespace-nowrap focus-visible:outline-2 focus-visible:outline-white"
                >
                  <span>استعراض الخدمات</span>
                  <ArrowUpLeft className="w-4 h-4" />
                </AppLink>
                <AppLink
                  to="/contact"
                  className="min-h-[46px] inline-flex items-center justify-center px-6 py-2.5 rounded-xl text-sm font-bold text-white border border-white/25 hover:bg-white hover:text-[#030A14] active:scale-[0.98] transition-all whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#22D3EE]"
                >
                  تواصل معنا
                </AppLink>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
