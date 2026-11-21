import { useState } from 'react';
import {
  ArrowUpLeft,
  Check,
  FileText,
  Globe,
  Headset,
  Mail,
  MessageCircle,
  Mic,
  Phone,
  PhoneCall,
  Router,
  Ticket,
  Wifi,
} from 'lucide-react';
import { DEVICES } from '../config/devices';
import {
  INTERNET_CARDS,
  MONTHLY_PACKAGES,
  getInternetCardFormUrl,
  getMonthlyPackageFormUrl,
  getServiceFormUrl,
} from '../config/forms';
import { CONTACT_CONFIG, SITE_INFO } from '../config/site';
import { AppLink } from '../context/RouterContext';
import { useVoiceRequest } from '../context/VoiceRequestContext';
import { Hero } from '../components/Hero';
import { Reveal } from '../components/Reveal';

interface HomeServiceItem {
  id: string;
  title: string;
  description: string;
  to?: string;
  externalHref?: string;
  featured?: boolean;
  darkFeatured?: boolean;
  Icon: typeof Globe;
}

const HOME_SERVICES: HomeServiceItem[] = [
  {
    id: 'internet-services',
    title: 'خدمات الإنترنت',
    description: 'التعرف على خدمات الإنترنت اللاسلكي وطرق الاستفادة منها.',
    to: '/services',
    featured: true,
    darkFeatured: true,
    Icon: Globe,
  },
  {
    id: 'internet-cards',
    title: 'كروت الإنترنت',
    description: 'الاطلاع على أنواع كروت الإنترنت وأسعارها المعتمدة.',
    to: '/internet-cards',
    featured: true,
    Icon: Ticket,
  },
  {
    id: 'device-installation',
    title: 'تركيب الأجهزة',
    description: 'استقبال طلبات تركيب أجهزة المودم والراوتر.',
    to: `/request?tab=service&service=${encodeURIComponent('تركيب راوتر أو جهاز')}`,
    externalHref: getServiceFormUrl('تركيب راوتر أو جهاز'),
    Icon: Router,
  },
  {
    id: 'subscriptions',
    title: 'الاشتراكات',
    description: 'استقبال طلبات الاشتراك الجديدة إلكترونيًا.',
    to: '/request?tab=subscription',
    Icon: FileText,
  },
  {
    id: 'technical-support',
    title: 'الدعم الفني',
    description: 'استقبال استفسارات ومشكلات العملاء الفنية.',
    to: '/support',
    Icon: Headset,
  },
  {
    id: 'contact-us',
    title: 'التواصل معنا',
    description: 'تسهيل التواصل والاستفسار عن خدمات الشبكة.',
    to: '/contact',
    Icon: PhoneCall,
  },
];

const SHOWCASE_DEVICE_IDS = ['device-01', 'device-06', 'device-07', 'device-08'];

export function HomePage() {
  const { openVoiceModal } = useVoiceRequest();
  const [vaultMode, setVaultMode] = useState<'cards' | 'packages'>('cards');
  const [selectedCardId, setSelectedCardId] = useState<string>(
    INTERNET_CARDS[3]?.id ?? 'a4'
  );
  const [selectedPackageId, setSelectedPackageId] = useState<string>(
    MONTHLY_PACKAGES[1]?.id ?? 'gold'
  );
  const [selectedShowcaseId, setSelectedShowcaseId] = useState<string>(
    SHOWCASE_DEVICE_IDS[0]
  );
  const [infraImgError, setInfraImgError] = useState(false);

  const featuredServices = HOME_SERVICES.slice(0, 2);
  const coreServices = HOME_SERVICES.slice(2);

  const showcaseDevices = DEVICES.filter((d) =>
    SHOWCASE_DEVICE_IDS.includes(d.id)
  );
  const activeShowcaseDevice =
    showcaseDevices.find((d) => d.id === selectedShowcaseId) ?? showcaseDevices[0];

  const activeCard =
    INTERNET_CARDS.find((c) => c.id === selectedCardId) ?? INTERNET_CARDS[0];
  const activePackage =
    MONTHLY_PACKAGES.find((p) => p.id === selectedPackageId) ??
    MONTHLY_PACKAGES[0];

  return (
    <div>
      <Hero />

      {/* Section 2: 6-Service Architectural Matrix (Light Canvas) */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="w-[92%] max-w-[1280px] mx-auto">
          <Reveal>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 sm:mb-12">
              <div>
                <p className="text-[#0EA5E9] font-bold text-xs tracking-wide mb-2 m-0">
                  خدماتنا الإلكترونية
                </p>
                <h2 className="font-display text-2xl sm:text-[34px] font-black text-[#071426] m-0 text-balance">
                  منظومة خدمات متكاملة بين يديك
                </h2>
              </div>
              <p className="text-[#475569] text-sm sm:text-base m-0 max-w-md">
                تعرف على الخدمات التي تقدمها شبكة الأمين.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <div className="border border-[#E2E8F0] rounded-2xl overflow-hidden bg-[#E2E8F0] space-y-px">
              {/* Top Row: 2 Featured Pillars */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-[#E2E8F0]">
                {featuredServices.map((item, idx) => {
                  const Icon = item.Icon;
                  const numLabel = `0${idx + 1}`;
                  const isDark = item.darkFeatured;

                  return (
                    <AppLink
                      key={item.id}
                      to={item.to!}
                      className={`group relative overflow-hidden flex flex-col justify-between p-7 sm:p-10 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#0EA5E9] ${
                        isDark
                          ? 'bg-[#030A14] text-white hover:bg-[#07162B]'
                          : 'bg-[#F8FAFC] text-[#071426] hover:bg-white'
                      }`}
                    >
                      {isDark && (
                        <div
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-0 arch-grid-dark opacity-45"
                        />
                      )}

                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-8">
                          <div
                            aria-hidden="true"
                            className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-colors duration-150 ${
                              isDark
                                ? 'bg-[#07162B] border-[#22D3EE]/35 text-[#22D3EE] group-hover:bg-[#22D3EE] group-hover:text-[#030A14]'
                                : 'bg-white border-[#E2E8F0] text-[#071426] group-hover:bg-[#071426] group-hover:text-[#22D3EE]'
                            }`}
                          >
                            <Icon className="w-6 h-6" strokeWidth={1.85} />
                          </div>

                          <span
                            className={`font-mono-tech text-xs font-bold tabular-nums ${
                              isDark ? 'text-[#D6B56D]' : 'text-[#64748B]'
                            }`}
                          >
                            {numLabel}
                          </span>
                        </div>

                        <h3
                          className={`font-display text-2xl font-extrabold mb-2.5 transition-colors ${
                            isDark
                              ? 'text-white group-hover:text-[#22D3EE]'
                              : 'text-[#071426] group-hover:text-[#0EA5E9]'
                          }`}
                        >
                          {item.title}
                        </h3>
                        <p
                          className={`text-sm sm:text-[15px] leading-[1.85] mb-7 max-w-md ${
                            isDark ? 'text-[#CBD5E1]' : 'text-[#475569]'
                          }`}
                        >
                          {item.description}
                        </p>

                        {!isDark && (
                          <div className="flex flex-wrap items-center gap-2 text-xs font-mono-tech text-[#475569] mb-6">
                            {INTERNET_CARDS.map((c, cIdx) => (
                              <span key={c.id} className="inline-flex items-center gap-2">
                                <span className="font-bold text-[#071426]">
                                  {c.code}
                                </span>
                                {cIdx < INTERNET_CARDS.length - 1 && (
                                  <span aria-hidden="true" className="text-[#CBD5E1]">
                                    /
                                  </span>
                                )}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div
                        className={`relative z-10 flex items-center justify-between pt-5 border-t text-xs font-bold ${
                          isDark
                            ? 'border-white/12 text-[#22D3EE]'
                            : 'border-[#E2E8F0] text-[#071426] group-hover:text-[#0EA5E9]'
                        }`}
                      >
                        <span>الانتقال إلى الخدمة</span>
                        <ArrowUpLeft className="w-4 h-4 transition-transform duration-150 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5" />
                      </div>
                    </AppLink>
                  );
                })}
              </div>

              {/* Bottom Row: 4 Precision Cells */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[#E2E8F0]">
                {coreServices.map((item, idx) => {
                  const Icon = item.Icon;
                  const numLabel = `0${idx + 3}`;
                  const cellClasses =
                    'group flex flex-col justify-between bg-white hover:bg-[#F8FAFC] p-7 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#0EA5E9]';

                  return (
                    <AppLink
                      key={item.id}
                      to={item.to!}
                      className={cellClasses}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-6">
                          <div
                            aria-hidden="true"
                            className="w-11 h-11 rounded-xl flex items-center justify-center bg-[#F1F5F9] border border-[#E2E8F0] text-[#071426] group-hover:bg-[#071426] group-hover:text-[#22D3EE] group-hover:border-[#071426] transition-colors duration-150"
                          >
                            <Icon className="w-5 h-5" strokeWidth={1.85} />
                          </div>
                          <span className="font-mono-tech text-xs font-bold text-[#94A3B8] tabular-nums">
                            {numLabel}
                          </span>
                        </div>

                        <h3 className="font-display text-[18px] font-extrabold text-[#071426] mb-2 group-hover:text-[#0EA5E9] transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-[#475569] text-[13.5px] leading-[1.8] mb-6">
                          {item.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-[#E2E8F0] text-xs font-bold text-[#071426] group-hover:text-[#0EA5E9] transition-colors">
                        <span>الانتقال إلى الخدمة</span>
                        <ArrowUpLeft className="w-4 h-4 transition-transform duration-150 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5" />
                      </div>
                    </AppLink>
                  );
                })}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Section 3: Interactive Cards & Packages Comparator Vault (Dark Obsidian) */}
      <section className="relative overflow-hidden py-16 sm:py-24 bg-[#030A14] text-white border-y border-white/10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 arch-dot-dark opacity-50"
        />

        <div className="relative z-10 w-[92%] max-w-[1280px] mx-auto">
          <Reveal>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
              {/* Right Editorial Narrative */}
              <div className="lg:col-span-5">
                <div className="inline-flex items-center gap-2 text-[#22D3EE] font-bold text-xs tracking-wide mb-3">
                  <Wifi className="w-4 h-4" />
                  <span>كروت الإنترنت</span>
                </div>

                <h2 className="font-display text-2xl sm:text-[34px] font-black text-white mb-4 text-balance">
                  اكتشف كروت الإنترنت المتاحة
                </h2>

                <p className="text-[#CBD5E1] text-sm sm:text-base leading-[1.9] mb-7">
                  معلومات الكروت وأسعارها حسب القائمة المعتمدة. استعرض فئات
                  الكروت والباقات الشهرية المتاحة واختر ما يناسب استخدامك.
                </p>

                {/* Interactive Switcher */}
                <div
                  role="tablist"
                  aria-label="تبديل العرض بين الكروت والباقات"
                  className="inline-flex items-center gap-1 p-1 bg-[#07162B] border border-white/12 rounded-xl mb-6"
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={vaultMode === 'cards'}
                    onClick={() => setVaultMode('cards')}
                    className={`min-h-[40px] px-4 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#22D3EE] ${
                      vaultMode === 'cards'
                        ? 'bg-[#22D3EE] text-[#030A14]'
                        : 'text-[#94A3B8] hover:text-white'
                    }`}
                  >
                    كروت الإنترنت (A1–A6)
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={vaultMode === 'packages'}
                    onClick={() => setVaultMode('packages')}
                    className={`min-h-[40px] px-4 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#22D3EE] ${
                      vaultMode === 'packages'
                        ? 'bg-[#D6B56D] text-[#030A14]'
                        : 'text-[#94A3B8] hover:text-white'
                    }`}
                  >
                    الباقات الشهرية
                  </button>
                </div>

                {/* Live Selection Confirmation Strip */}
                <div className="bg-[#07162B] border border-white/12 rounded-2xl p-5 mb-6">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <span className="text-[11px] font-bold text-[#94A3B8]">
                      الاختيار المحدد حاليًا
                    </span>
                    <span className="text-xs font-bold text-[#D6B56D] tabular-nums">
                      {vaultMode === 'cards'
                        ? `${activeCard.title} · ${activeCard.capacity}`
                        : `${activePackage.title} · ${activePackage.capacity}`}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between gap-3 pb-4 mb-4 border-b border-white/10">
                    <span className="font-display text-2xl font-black text-white tabular-nums">
                      {vaultMode === 'cards'
                        ? activeCard.price
                        : activePackage.price}
                    </span>
                    <span
                      dir="ltr"
                      className="font-mono-tech text-sm font-bold text-[#22D3EE] tabular-nums"
                    >
                      {vaultMode === 'cards'
                        ? activeCard.capacity
                        : activePackage.capacity}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <a
                      href={
                        vaultMode === 'cards'
                          ? getInternetCardFormUrl(activeCard.formValue)
                          : getMonthlyPackageFormUrl(activePackage.formValue)
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-[#030A14] bg-[#22D3EE] hover:bg-[#67E8F9] active:scale-[0.98] transition-all whitespace-nowrap"
                    >
                      <span>طلب الاختيار عبر النموذج</span>
                      <ArrowUpLeft className="w-4 h-4" />
                    </a>
                    <AppLink
                      to={
                        vaultMode === 'cards'
                          ? `/request?tab=subscription&card=${encodeURIComponent(activeCard.id)}`
                          : `/request?tab=subscription&package=${encodeURIComponent(activePackage.id)}`
                      }
                      className="min-h-[44px] inline-flex items-center justify-center px-4 py-2 rounded-xl text-xs font-bold text-white border border-white/20 hover:border-[#22D3EE] transition-colors whitespace-nowrap"
                    >
                      تجهيز بالبوابة
                    </AppLink>
                  </div>
                </div>

                <div>
                  <AppLink
                    to="/internet-cards"
                    className="group inline-flex items-center gap-2 text-xs font-bold text-[#22D3EE] hover:text-white transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-white rounded"
                  >
                    <span>عرض جميع الكروت ومقارنة الأسعار</span>
                    <ArrowUpLeft className="w-4 h-4 transition-transform duration-150 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5" />
                  </AppLink>
                </div>
              </div>

              {/* Left Interactive Selector Grid */}
              <div className="lg:col-span-7">
                {vaultMode === 'cards' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {INTERNET_CARDS.map((card, idx) => {
                      const isSelected = card.id === activeCard.id;
                      const isTopTier = idx === 5;
                      return (
                        <button
                          key={card.id}
                          type="button"
                          onClick={() => setSelectedCardId(card.id)}
                          aria-pressed={isSelected}
                          className={`group text-right flex flex-col justify-between rounded-2xl p-5 border transition-all duration-150 hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-[#22D3EE] ${
                            isSelected
                              ? 'bg-[#0E294B] border-[#22D3EE] ring-2 ring-[#22D3EE]/35'
                              : isTopTier
                                ? 'bg-[#0B1F3A] border-[#D6B56D]/45 hover:border-[#D6B56D]'
                                : 'bg-[#07162B]/85 border-white/12 hover:border-[#22D3EE]/60'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-4 w-full">
                            <span
                              dir="ltr"
                              className={`font-mono-tech text-lg font-bold tabular-nums ${
                                isTopTier && !isSelected
                                  ? 'text-[#D6B56D]'
                                  : 'text-[#22D3EE]'
                              }`}
                            >
                              {card.code}
                            </span>
                            {isSelected ? (
                              <span className="w-6 h-6 rounded-full bg-[#22D3EE] text-[#030A14] flex items-center justify-center">
                                <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                              </span>
                            ) : (
                              <ArrowUpLeft className="w-4 h-4 text-[#64748B] group-hover:text-white transition-transform duration-150 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5" />
                            )}
                          </div>

                          <div className="mb-3 w-full">
                            <span className="block font-display text-base font-bold text-white mb-0.5">
                              {card.title}
                            </span>
                            <span
                              dir="ltr"
                              className="block font-mono-tech text-xs text-[#94A3B8] tabular-nums text-right"
                            >
                              {card.capacity}
                            </span>
                          </div>

                          <div className="pt-3 border-t border-white/10 flex items-center justify-between w-full">
                            <span className="font-display text-base font-extrabold text-white tabular-nums">
                              {card.price}
                            </span>
                            <span
                              className={`text-[11px] font-bold ${
                                isSelected ? 'text-white' : 'text-[#22D3EE]'
                              }`}
                            >
                              {isSelected ? 'محدد' : 'اختيار'}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {MONTHLY_PACKAGES.map((pkg) => {
                      const isGold = pkg.tier === 'gold';
                      const isSelected = pkg.id === activePackage.id;
                      return (
                        <button
                          key={pkg.id}
                          type="button"
                          onClick={() => setSelectedPackageId(pkg.id)}
                          aria-pressed={isSelected}
                          className={`group text-right flex flex-col justify-between rounded-2xl p-6 sm:p-7 border transition-all duration-150 hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-[#22D3EE] ${
                            isSelected
                              ? isGold
                                ? 'bg-[#0E294B] border-[#D6B56D] ring-2 ring-[#D6B56D]/35'
                                : 'bg-[#0E294B] border-[#22D3EE] ring-2 ring-[#22D3EE]/35'
                              : isGold
                                ? 'bg-[#0B1F3A] border-[#D6B56D]/45 hover:border-[#D6B56D]'
                                : 'bg-[#07162B]/90 border-white/15 hover:border-[#22D3EE]'
                          }`}
                        >
                          <div className="w-full">
                            <div className="flex items-center justify-between mb-4">
                              <span
                                className={`text-xs font-bold ${
                                  isGold ? 'text-[#D6B56D]' : 'text-[#22D3EE]'
                                }`}
                              >
                                اشتراك شهري
                              </span>
                              {isSelected ? (
                                <span
                                  className={`w-6 h-6 rounded-full text-[#030A14] flex items-center justify-center ${
                                    isGold ? 'bg-[#D6B56D]' : 'bg-[#22D3EE]'
                                  }`}
                                >
                                  <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                                </span>
                              ) : (
                                <ArrowUpLeft className="w-4 h-4 text-[#94A3B8] group-hover:text-white transition-transform group-hover:-translate-x-0.5 group-hover:-translate-y-0.5" />
                              )}
                            </div>
                            <h3 className="font-display text-2xl font-black text-white mb-4">
                              {pkg.title}
                            </h3>
                            <div className="py-4 border-y border-white/12 flex items-center justify-between mb-5">
                              <span className="font-display text-2xl font-black text-white tabular-nums">
                                {pkg.price}
                              </span>
                              <span
                                dir="ltr"
                                className="font-mono-tech text-xl font-bold text-[#22D3EE] tabular-nums"
                              >
                                {pkg.capacity}
                              </span>
                            </div>
                          </div>

                          <span
                            className={`w-full min-h-[44px] inline-flex items-center justify-center rounded-xl text-xs font-bold transition-colors ${
                              isGold
                                ? 'bg-[#D6B56D] text-[#030A14]'
                                : 'bg-[#22D3EE] text-[#030A14]'
                            }`}
                          >
                            {isSelected ? 'الباقة المختارة' : 'تحديد الباقة'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Section 4: About & Hardware Architectural Split (Soft Canvas) */}
      <section className="py-16 sm:py-24 bg-[#F1F5F9] border-b border-[#E2E8F0]">
        <div className="w-[92%] max-w-[1280px] mx-auto">
          <Reveal>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
              {/* Right: Editorial About Statement */}
              <div className="lg:col-span-6 flex flex-col justify-center">
                <p className="text-[#0EA5E9] font-bold text-xs tracking-wide mb-2.5 m-0">
                  من نحن
                </p>
                <h2 className="font-display text-[#071426] text-2xl sm:text-[36px] font-black mb-4 text-balance">
                  بوابتكم إلى عالم الاتصال
                </h2>
                <p className="text-[#475569] text-[15px] sm:text-base leading-[1.9] mb-6 max-w-xl">
                  بوابة الأمين للإنترنت واجهة إلكترونية تهدف إلى التعريف بخدمات
                  شبكة الأمين للإنترنت اللاسلكي، وتسهيل وصول العملاء إلى
                  المعلومات والخدمات وطلبات الاشتراك والتواصل والدعم الفني.
                </p>

                {/* Interactive Studio Hardware Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  {showcaseDevices.map((dev) => {
                    const isSelected = dev.id === activeShowcaseDevice.id;
                    return (
                      <button
                        key={dev.id}
                        type="button"
                        onClick={() => setSelectedShowcaseId(dev.id)}
                        aria-pressed={isSelected}
                        className={`group rounded-xl p-3 flex flex-col items-center justify-between transition-all border focus-visible:outline-2 focus-visible:outline-[#0EA5E9] ${
                          isSelected
                            ? 'bg-white border-[#0EA5E9] ring-2 ring-[#0EA5E9]/20'
                            : 'bg-white border-[#E2E8F0] hover:border-[#0EA5E9]/60'
                        }`}
                      >
                        <div className="h-16 w-full flex items-center justify-center mb-2">
                          <img
                            src={dev.imageSrc}
                            alt={dev.imageAlt}
                            loading="lazy"
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                          />
                        </div>
                        <span
                          dir="ltr"
                          className={`font-mono-tech text-[11px] font-bold truncate max-w-full ${
                            isSelected
                              ? 'text-[#0EA5E9]'
                              : 'text-[#475569] group-hover:text-[#071426]'
                          }`}
                        >
                          {dev.name.replace('Ubiquiti ', '')}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Live Device Spec Bar */}
                {activeShowcaseDevice && (
                  <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 mb-7 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-[#0EA5E9] m-0">
                        {activeShowcaseDevice.numberLabel} · {activeShowcaseDevice.type}
                      </p>
                      <p className="font-display text-sm font-extrabold text-[#071426] m-0 mt-0.5 truncate">
                        {activeShowcaseDevice.name}
                      </p>
                      <p className="text-xs text-[#475569] m-0 mt-1 line-clamp-2">
                        {activeShowcaseDevice.description}
                      </p>
                    </div>
                    <AppLink
                      to={`/services?device=${activeShowcaseDevice.id}`}
                      className="min-h-[40px] inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#071426] text-white text-xs font-bold hover:bg-[#0EA5E9] transition-colors whitespace-nowrap shrink-0"
                    >
                      <span>معاينة وطلب</span>
                      <ArrowUpLeft className="w-3.5 h-3.5 text-[#22D3EE]" />
                    </AppLink>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-3.5">
                  <AppLink
                    to="/about"
                    className="group min-h-[48px] inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl text-sm font-bold text-white bg-[#071426] hover:bg-[#0EA5E9] active:scale-[0.98] transition-all duration-150 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#0EA5E9]"
                  >
                    <span>تعرف علينا</span>
                    <ArrowUpLeft className="w-4 h-4 text-[#22D3EE] group-hover:text-white transition-colors" />
                  </AppLink>

                  <AppLink
                    to="/services"
                    className="min-h-[48px] inline-flex items-center justify-center px-6 py-3 rounded-xl text-sm font-bold text-[#071426] bg-white border border-[#E2E8F0] hover:border-[#071426] transition-colors whitespace-nowrap"
                  >
                    استعراض الأجهزة
                  </AppLink>
                </div>
              </div>

              {/* Left: Bespoke Studio Hardware Visual */}
              <div className="lg:col-span-6">
                <div className="relative h-full min-h-[320px] rounded-2xl overflow-hidden border border-[#E2E8F0] bg-[#030A14]">
                  {!infraImgError ? (
                    <img
                      src="/src/assets/images/telecom_infra_studio_1795295003563.jpg"
                      alt="تجهيزات البنية اللاسلكية وأجهزة الشبكة في بوابة الأمين للإنترنت"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      onError={() => setInfraImgError(true)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full min-h-[320px] arch-grid-dark flex flex-col items-center justify-center text-[#22D3EE]">
                      <Router className="w-12 h-12 mb-2" />
                      <span className="font-display font-bold text-sm">
                        {SITE_INFO.fullNameAr}
                      </span>
                    </div>
                  )}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-[#030A14]/90 via-[#030A14]/20 to-transparent"
                  />
                  <div className="absolute bottom-0 inset-x-0 p-6 sm:p-8 flex items-end justify-between gap-4 text-white">
                    <div>
                      <span className="block text-xs font-bold text-[#D6B56D] mb-1">
                        {SITE_INFO.serviceArea}
                      </span>
                      <p className="font-display text-lg font-extrabold m-0">
                        أجهزة ربط وتوزيع معتمدة
                      </p>
                    </div>
                    <span className="text-xs font-bold text-[#22D3EE] shrink-0">
                      {SITE_INFO.tagline}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Section 5: Architectural Service Request Band & Direct Contact Strip */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="w-[92%] max-w-[1280px] mx-auto space-y-12">
          <Reveal>
            <div className="relative overflow-hidden rounded-2xl bg-[#071426] text-white p-8 sm:p-12 lg:p-14 border border-[#0F2A4D]">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 arch-grid-dark opacity-50"
              />
              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div className="max-w-xl">
                  <p className="text-[#D6B56D] font-bold text-xs tracking-wide mb-2 m-0">
                    الطلبات الإلكترونية
                  </p>
                  <h2 className="font-display text-2xl sm:text-[34px] font-black mb-3 text-balance">
                    هل ترغب في طلب إحدى خدماتنا؟
                  </h2>
                  <p className="text-[#CBD5E1] text-sm sm:text-base m-0 leading-relaxed">
                    يمكنك تقديم طلب اشتراك أو طلب تركيب جهاز أو إرسال استفسار
                    للدعم الفني.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  <AppLink
                    to="/request"
                    className="group min-h-[52px] inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl text-sm font-bold text-[#030A14] bg-[#D6B56D] hover:brightness-110 active:scale-[0.98] transition-all duration-150 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-white"
                  >
                    <span>اطلب خدمتك الآن</span>
                    <ArrowUpLeft className="w-4 h-4 transition-transform duration-150 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5" />
                  </AppLink>

                  <button
                    type="button"
                    onClick={openVoiceModal}
                    className="min-h-[52px] inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-white border border-[#22D3EE]/50 bg-[#22D3EE]/10 hover:bg-[#22D3EE] hover:text-[#030A14] active:scale-[0.98] transition-all duration-150 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#22D3EE]"
                  >
                    <Mic className="w-4 h-4" />
                    <span>اطلب بصوتك</span>
                  </button>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <div className="border border-[#E2E8F0] rounded-2xl p-7 sm:p-10 bg-[#F8FAFC] flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="max-w-lg">
                <p className="text-[#0EA5E9] font-bold text-xs tracking-wide mb-2 m-0">
                  تواصل مباشر
                </p>
                <h2 className="font-display text-2xl sm:text-[30px] font-black text-[#071426] mb-2">
                  نسعد بتواصلكم
                </h2>
                <p className="text-[#475569] text-sm sm:text-base m-0">
                  نحن هنا لاستقبال استفساراتكم وطلباتكم.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={CONTACT_CONFIG.phoneHref}
                  className="min-h-[46px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-[#E2E8F0] hover:border-[#0EA5E9] text-sm font-bold text-[#071426] transition-colors whitespace-nowrap"
                >
                  <Phone className="w-4 h-4 text-[#0EA5E9]" />
                  <span>اتصال</span>
                </a>
                <a
                  href={CONTACT_CONFIG.whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[46px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-[#E2E8F0] hover:border-[#0EA5E9] text-sm font-bold text-[#071426] transition-colors whitespace-nowrap"
                >
                  <MessageCircle className="w-4 h-4 text-[#0EA5E9]" />
                  <span>واتساب</span>
                </a>
                <a
                  href={CONTACT_CONFIG.emailHref}
                  className="min-h-[46px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-[#E2E8F0] hover:border-[#0EA5E9] text-sm font-bold text-[#071426] transition-colors whitespace-nowrap"
                >
                  <Mail className="w-4 h-4 text-[#D6B56D]" />
                  <span>البريد الإلكتروني</span>
                </a>
                <AppLink
                  to="/contact"
                  className="group min-h-[46px] inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#071426] text-white hover:bg-[#0EA5E9] text-sm font-bold transition-colors whitespace-nowrap"
                >
                  <span>اتصل بنا</span>
                  <ArrowUpLeft className="w-4 h-4 transition-transform duration-150 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5" />
                </AppLink>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
