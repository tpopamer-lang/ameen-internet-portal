import { useState } from 'react';
import {
  ArrowUpLeft,
  Check,
  ClipboardList,
  Copy,
  Headset,
  MapPin,
  Mic,
} from 'lucide-react';
import { CONTACT_CONFIG, SITE_INFO } from '../config/site';
import { AppLink } from '../context/RouterContext';
import { useVoiceRequest } from '../context/VoiceRequestContext';
import { ContactLinks } from '../components/ContactLinks';
import { PageHero } from '../components/PageHero';
import { Reveal } from '../components/Reveal';

export function ContactPage() {
  const { openVoiceModal } = useVoiceRequest();
  const [copiedAddress, setCopiedAddress] = useState(false);

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(SITE_INFO.address);
      setCopiedAddress(true);
      window.setTimeout(() => setCopiedAddress(false), 2200);
    } catch {
      // Ignore if clipboard API blocked
    }
  };

  return (
    <div>
      <PageHero
        eyebrow="التواصل المباشر"
        title="اتصل بنا"
        description="اختر وسيلة التواصل المناسبة."
        breadcrumbLabel="اتصل بنا"
      />

      <section className="py-14 sm:py-20 bg-white">
        <div className="w-[92%] max-w-[1140px] mx-auto space-y-10">
          <ContactLinks />

          {/* Interactive HQ Location Card */}
          <Reveal delay={0.06}>
            <div className="bg-[#030A14] text-white border border-white/12 rounded-2xl p-7 sm:p-9 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-right">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div
                  aria-hidden="true"
                  className="w-12 h-12 rounded-xl bg-[#07162B] border border-[#D6B56D]/40 text-[#D6B56D] flex items-center justify-center shrink-0"
                >
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-extrabold text-white m-0">
                    {SITE_INFO.serviceArea}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#CBD5E1] m-0 mt-1">
                    {SITE_INFO.addressDisplay}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => void handleCopyAddress()}
                  className="min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-white/20 text-white text-xs font-bold hover:border-[#22D3EE] transition-colors whitespace-nowrap"
                >
                  {copiedAddress ? (
                    <>
                      <Check className="w-4 h-4 text-[#22D3EE]" />
                      <span>تم نسخ العنوان</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-[#D6B56D]" />
                      <span>نسخ العنوان</span>
                    </>
                  )}
                </button>
                <a
                  href={CONTACT_CONFIG.mapsHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[44px] inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#22D3EE] text-[#030A14] text-xs font-bold hover:bg-[#67E8F9] transition-colors whitespace-nowrap"
                >
                  <span>عرض الموقع على الخرائط</span>
                  <ArrowUpLeft className="w-4 h-4" />
                </a>
              </div>
            </div>
          </Reveal>

          {/* Interactive Routing Strip */}
          <Reveal delay={0.1}>
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-6 sm:p-8">
              <div className="mb-5">
                <p className="text-[#0EA5E9] font-bold text-xs tracking-wide mb-1 m-0">
                  التوجيه السريع
                </p>
                <h2 className="font-display text-lg sm:text-xl font-black text-[#071426] m-0">
                  هل تريد إتمام طلب محدد مباشرة؟
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <AppLink
                  to="/request"
                  className="group flex items-center justify-between p-4 rounded-xl bg-white border border-[#E2E8F0] hover:border-[#0EA5E9] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <ClipboardList className="w-5 h-5 text-[#0EA5E9] shrink-0" />
                    <div>
                      <span className="block font-display text-sm font-extrabold text-[#071426]">
                        تقديم طلب خدمة أو اشتراك
                      </span>
                      <span className="block text-[11px] text-[#64748B]">
                        منشئ الطلب التفاعلي والنماذج الرسمية
                      </span>
                    </div>
                  </div>
                  <ArrowUpLeft className="w-4 h-4 text-[#64748B] group-hover:text-[#0EA5E9]" />
                </AppLink>

                <AppLink
                  to="/support"
                  className="group flex items-center justify-between p-4 rounded-xl bg-white border border-[#E2E8F0] hover:border-[#0EA5E9] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Headset className="w-5 h-5 text-[#0EA5E9] shrink-0" />
                    <div>
                      <span className="block font-display text-sm font-extrabold text-[#071426]">
                        بلاغ دعم فني أو عطل
                      </span>
                      <span className="block text-[11px] text-[#64748B]">
                        تشخيص سريع وإرسال البلاغ مباشرة
                      </span>
                    </div>
                  </div>
                  <ArrowUpLeft className="w-4 h-4 text-[#64748B] group-hover:text-[#0EA5E9]" />
                </AppLink>

                <button
                  type="button"
                  onClick={openVoiceModal}
                  className="group flex items-center justify-between p-4 rounded-xl bg-[#071426] text-white border border-[#071426] hover:border-[#22D3EE] transition-colors text-right"
                >
                  <div className="flex items-center gap-3">
                    <Mic className="w-5 h-5 text-[#22D3EE] shrink-0" />
                    <div>
                      <span className="block font-display text-sm font-extrabold text-white">
                        اطلب خدمتك بصوتك
                      </span>
                      <span className="block text-[11px] text-[#94A3B8]">
                        تحدث بالعربية وسنجهز طلبك
                      </span>
                    </div>
                  </div>
                  <ArrowUpLeft className="w-4 h-4 text-[#22D3EE]" />
                </button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
