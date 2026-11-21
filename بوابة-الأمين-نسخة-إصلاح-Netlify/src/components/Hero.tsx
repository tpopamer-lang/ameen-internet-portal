import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowLeft,
  ArrowUpLeft,
  Headset,
  MapPin,
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
} from '../config/forms';
import { SITE_INFO } from '../config/site';
import { AppLink } from '../context/RouterContext';
import { NetworkMeshCanvas } from './NetworkMeshCanvas';

type HeroTab = 'devices' | 'cards' | 'packages';

const FEATURED_DEVICE_IDS = ['device-01', 'device-06', 'device-07'];

export function Hero() {
  const [activeTab, setActiveTab] = useState<HeroTab>('devices');
  const [selectedDeviceIdx, setSelectedDeviceIdx] = useState(0);
  const [heroBgError, setHeroBgError] = useState(false);
  const [deviceImgError, setDeviceImgError] = useState(false);

  const featuredDevices = DEVICES.filter((d) =>
    FEATURED_DEVICE_IDS.includes(d.id)
  );
  const currentDevice = featuredDevices[selectedDeviceIdx] ?? featuredDevices[0];

  return (
    <section className="relative overflow-hidden bg-[#030A14] text-white border-b border-white/10">
      {/* Architectural Telecom Photograph + Measured Contrast Scrim */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {!heroBgError && (
          <img
            src="/src/assets/images/telecom_hero_backdrop_1795295004171.jpg"
            alt=""
            referrerPolicy="no-referrer"
            onError={() => setHeroBgError(true)}
            className="w-full h-full object-cover opacity-30"
          />
        )}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(105deg, rgba(3, 10, 20, 0.96) 0%, rgba(3, 10, 20, 0.88) 54%, rgba(7, 22, 43, 0.78) 100%)',
          }}
        />
      </div>

      {/* Interactive Pointer-Reactive Network Mesh */}
      <NetworkMeshCanvas />

      {/* Crisp Architectural Grid Overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 arch-grid-dark opacity-60"
      />

      {/* Main 12-Column Asymmetric Split */}
      <div className="relative z-10 w-[92%] max-w-[1280px] mx-auto pt-12 pb-10 sm:pt-16 sm:pb-12 lg:pt-20 lg:pb-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
          {/* Editorial Column */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 flex flex-col justify-between text-right"
          >
            <div>
              <div className="flex flex-wrap items-center gap-2.5 text-xs font-bold text-[#22D3EE] mb-5">
                <span>عالم الاتصال والتقنية</span>
                <span aria-hidden="true" className="text-[#475569]">
                  ·
                </span>
                <span className="text-[#D6B56D]">{SITE_INFO.serviceArea}</span>
              </div>

              <h1
                className="font-display font-black leading-[1.22] mb-5 text-balance"
                style={{ fontSize: 'clamp(2.15rem, 4.1vw, 3.65rem)' }}
              >
                <span className="block text-[#CBD5E1] text-xl sm:text-2xl lg:text-[28px] font-bold mb-2">
                  مرحبًا بكم في
                </span>
                <span className="text-white">{SITE_INFO.fullNameAr}</span>
              </h1>

              <p className="text-[#CBD5E1] text-[15px] sm:text-[17px] leading-[1.9] max-w-[610px] mb-8">
                <strong className="text-white font-bold">
                  {SITE_INFO.tagline}
                </strong>{' '}
                تعرف على خدمات شبكة الأمين للإنترنت اللاسلكي، واستكشف خدمات
                الاشتراك وكروت الإنترنت وطلبات تركيب الأجهزة والدعم الفني.
              </p>

              {/* Primary CTA Hierarchy */}
              <div className="flex items-center flex-wrap gap-3.5 mb-8">
                <AppLink
                  to="/services"
                  className="group min-h-[50px] inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl text-sm font-bold text-[#030A14] bg-[#22D3EE] hover:bg-[#67E8F9] active:scale-[0.98] transition-all duration-150 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-white"
                >
                  <span>اكتشف خدماتنا</span>
                  <ArrowLeft className="w-4 h-4 transition-transform duration-150 group-hover:-translate-x-1" />
                </AppLink>

                <AppLink
                  to="/request"
                  className="group min-h-[50px] inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold text-white border border-white/25 bg-white/5 backdrop-blur-sm hover:border-[#D6B56D] hover:bg-[#D6B56D] hover:text-[#030A14] active:scale-[0.98] transition-all duration-150 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#D6B56D]"
                >
                  <span>اطلب خدمتك الآن</span>
                  <ArrowUpLeft className="w-4 h-4 text-[#D6B56D] group-hover:text-[#030A14] transition-colors duration-150" />
                </AppLink>
              </div>
            </div>

            {/* Clean Regional Location Anchor */}
            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-[13px] text-[#94A3B8] pt-5 border-t border-white/10">
              <MapPin className="w-4 h-4 text-[#D6B56D] shrink-0" />
              <span className="text-[#E2E8F0] font-medium">
                {SITE_INFO.addressDisplay}
              </span>
            </div>
          </motion.div>

          {/* Interactive Catalog Console */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 flex"
          >
            <div className="w-full bg-[#071426]/90 backdrop-blur-xl border border-white/15 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
              {/* Segmented Tab Bar */}
              <div
                role="tablist"
                aria-label="استعراض سريع لمحتويات البوابة"
                className="grid grid-cols-3 gap-1 p-1 bg-[#030A14] border border-white/10 rounded-xl mb-5"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'devices'}
                  onClick={() => setActiveTab('devices')}
                  className={`min-h-[42px] px-2 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-150 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#22D3EE] ${
                    activeTab === 'devices'
                      ? 'bg-[#0F2A4D] text-white border border-[#22D3EE]/40'
                      : 'text-[#94A3B8] hover:text-white'
                  }`}
                >
                  <Router className="w-3.5 h-3.5 text-[#22D3EE] shrink-0" />
                  <span>الأجهزة</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'cards'}
                  onClick={() => setActiveTab('cards')}
                  className={`min-h-[42px] px-2 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-150 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#22D3EE] ${
                    activeTab === 'cards'
                      ? 'bg-[#0F2A4D] text-white border border-[#22D3EE]/40'
                      : 'text-[#94A3B8] hover:text-white'
                  }`}
                >
                  <Ticket className="w-3.5 h-3.5 text-[#22D3EE] shrink-0" />
                  <span>الكروت</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'packages'}
                  onClick={() => setActiveTab('packages')}
                  className={`min-h-[42px] px-2 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-150 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#22D3EE] ${
                    activeTab === 'packages'
                      ? 'bg-[#0F2A4D] text-white border border-[#D6B56D]/40'
                      : 'text-[#94A3B8] hover:text-white'
                  }`}
                >
                  <Wifi className="w-3.5 h-3.5 text-[#D6B56D] shrink-0" />
                  <span>الباقات</span>
                </button>
              </div>

              <AnimatePresence mode="wait">
                {activeTab === 'devices' && (
                  <motion.div
                    key="devices-panel"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.16 }}
                    className="flex-1 flex flex-col justify-between"
                  >
                    <div>
                      <AppLink
                        to={`/services?device=${currentDevice.id}`}
                        aria-label={`معاينة وطلب ${currentDevice.name}`}
                        className="relative rounded-xl p-4 h-[196px] flex items-center justify-center mb-4 bg-white border border-white/15 overflow-hidden group"
                      >
                        {!deviceImgError ? (
                          <img
                            src={currentDevice.imageSrc}
                            alt={currentDevice.imageAlt}
                            referrerPolicy="no-referrer"
                            onError={() => setDeviceImgError(true)}
                            className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex flex-col items-center gap-2 text-[#071426]">
                            <Router className="w-9 h-9 text-[#0EA5E9]" />
                            <span className="text-xs font-bold">{currentDevice.name}</span>
                          </div>
                        )}
                      </AppLink>

                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <p className="text-[11px] font-bold text-[#D6B56D] m-0">
                            {currentDevice.numberLabel} · {currentDevice.type}
                          </p>
                          <h2 className="font-display text-lg font-extrabold text-white m-0 mt-0.5">
                            {currentDevice.name}
                          </h2>
                        </div>
                        <AppLink
                          to={`/services?device=${currentDevice.id}`}
                          className="text-xs font-bold text-[#22D3EE] hover:text-white transition-colors whitespace-nowrap shrink-0 px-1 py-1 rounded focus-visible:outline-2 focus-visible:outline-[#22D3EE]"
                        >
                          عرض 8 أجهزة ←
                        </AppLink>
                      </div>

                      <p className="text-xs text-[#94A3B8] leading-relaxed mb-4 line-clamp-2">
                        {currentDevice.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {featuredDevices.map((dev, idx) => (
                        <button
                          key={dev.id}
                          type="button"
                          onClick={() => {
                            setDeviceImgError(false);
                            setSelectedDeviceIdx(idx);
                          }}
                          className={`min-h-[38px] px-2 py-1.5 rounded-lg text-[11px] font-bold transition-all duration-150 truncate focus-visible:outline-2 focus-visible:outline-[#22D3EE] ${
                            selectedDeviceIdx === idx
                              ? 'bg-[#22D3EE] text-[#030A14]'
                              : 'bg-[#030A14] text-[#CBD5E1] border border-white/10 hover:border-[#22D3EE]/50'
                          }`}
                        >
                          {dev.name}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'cards' && (
                  <motion.div
                    key="cards-panel"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.16 }}
                    className="flex-1 flex flex-col justify-between"
                  >
                    <div className="divide-y divide-white/10 border border-white/10 rounded-xl bg-[#030A14]/70 mb-4 overflow-hidden">
                      {INTERNET_CARDS.map((card) => (
                        <a
                          key={card.id}
                          href={getInternetCardFormUrl(card.formValue)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center justify-between px-4 py-2.5 hover:bg-[#0F2A4D]/75 transition-colors text-xs"
                        >
                          <span className="font-display font-bold text-white group-hover:text-[#22D3EE] transition-colors">
                            {card.title}
                          </span>
                          <span
                            dir="ltr"
                            className="font-mono-tech text-[#94A3B8] tabular-nums"
                          >
                            {card.capacity}
                          </span>
                          <span className="font-bold text-[#22D3EE] tabular-nums">
                            {card.price}
                          </span>
                        </a>
                      ))}
                    </div>

                    <AppLink
                      to="/internet-cards"
                      className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 rounded-xl bg-[#22D3EE] text-[#030A14] font-bold text-xs hover:bg-[#67E8F9] active:scale-[0.98] transition-all"
                    >
                      <span>عرض تفاصيل وطلب الكروت</span>
                      <ArrowUpLeft className="w-4 h-4" />
                    </AppLink>
                  </motion.div>
                )}

                {activeTab === 'packages' && (
                  <motion.div
                    key="packages-panel"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.16 }}
                    className="flex-1 flex flex-col justify-between"
                  >
                    <div className="space-y-3 mb-4">
                      {MONTHLY_PACKAGES.map((pkg) => (
                        <a
                          key={pkg.id}
                          href={getMonthlyPackageFormUrl(pkg.formValue)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`group block p-4 rounded-xl border transition-all duration-150 ${
                            pkg.tier === 'gold'
                              ? 'bg-[#030A14] border-[#D6B56D]/45 hover:border-[#D6B56D]'
                              : 'bg-[#030A14]/75 border-white/12 hover:border-[#22D3EE]'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span
                              className={`font-display font-bold text-base ${
                                pkg.tier === 'gold'
                                  ? 'text-[#D6B56D]'
                                  : 'text-[#22D3EE]'
                              }`}
                            >
                              {pkg.title}
                            </span>
                            <span className="font-bold text-white text-base tabular-nums">
                              {pkg.price}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-[#94A3B8]">
                            <span className="tabular-nums">
                              السعة الشهرية:{' '}
                              <span
                                dir="ltr"
                                className="font-mono-tech font-bold text-white"
                              >
                                {pkg.capacity}
                              </span>
                            </span>
                            <span className="text-[#22D3EE] font-bold group-hover:underline">
                              طلب الباقة ←
                            </span>
                          </div>
                        </a>
                      ))}
                    </div>

                    <AppLink
                      to="/internet-cards"
                      className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 rounded-xl bg-[#D6B56D] text-[#030A14] font-bold text-xs hover:brightness-110 active:scale-[0.98] transition-all"
                    >
                      <span>الانتقال إلى الباقات الشهرية</span>
                      <ArrowUpLeft className="w-4 h-4" />
                    </AppLink>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* Full-Width 4-Column Quick-Navigation Architecture Strip */}
        <div className="mt-10 pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/10 rounded-xl overflow-hidden border border-white/10">
          <AppLink
            to="/services"
            className="group bg-[#05101E] hover:bg-[#0B1F3A] px-5 py-4 flex items-center justify-between transition-colors"
          >
            <div>
              <span className="block text-[11px] text-[#94A3B8] mb-0.5">
                الأجهزة والتركيب
              </span>
              <span className="font-display text-sm font-bold text-white group-hover:text-[#22D3EE] transition-colors">
                8 أجهزة متاحة للربط
              </span>
            </div>
            <Router className="w-4 h-4 text-[#22D3EE] shrink-0" />
          </AppLink>

          <AppLink
            to="/internet-cards"
            className="group bg-[#05101E] hover:bg-[#0B1F3A] px-5 py-4 flex items-center justify-between transition-colors"
          >
            <div>
              <span className="block text-[11px] text-[#94A3B8] mb-0.5">
                الفئات المعتمدة
              </span>
              <span className="font-display text-sm font-bold text-white group-hover:text-[#22D3EE] transition-colors">
                كروت الإنترنت A1 – A6
              </span>
            </div>
            <Ticket className="w-4 h-4 text-[#22D3EE] shrink-0" />
          </AppLink>

          <AppLink
            to="/internet-cards"
            className="group bg-[#05101E] hover:bg-[#0B1F3A] px-5 py-4 flex items-center justify-between transition-colors"
          >
            <div>
              <span className="block text-[11px] text-[#94A3B8] mb-0.5">
                الاشتراكات الشهرية
              </span>
              <span className="font-display text-sm font-bold text-white group-hover:text-[#D6B56D] transition-colors">
                الباقة الفضية والذهبية
              </span>
            </div>
            <Wifi className="w-4 h-4 text-[#D6B56D] shrink-0" />
          </AppLink>

          <AppLink
            to="/support"
            className="group bg-[#05101E] hover:bg-[#0B1F3A] px-5 py-4 flex items-center justify-between transition-colors"
          >
            <div>
              <span className="block text-[11px] text-[#94A3B8] mb-0.5">
                مساعدة العملاء
              </span>
              <span className="font-display text-sm font-bold text-white group-hover:text-[#22D3EE] transition-colors">
                الدعم الفني والبلاغات
              </span>
            </div>
            <Headset className="w-4 h-4 text-[#22D3EE] shrink-0" />
          </AppLink>
        </div>
      </div>
    </section>
  );
}
