import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowUpLeft, ChevronLeft, ChevronRight, Mic, Search, X } from 'lucide-react';
import { DEVICES, DEVICES_NOTE, DeviceItem } from '../config/devices';
import {
  SERVICE_OPTIONS,
  buildVoiceServiceFormUrl,
  getServiceFormUrl,
} from '../config/forms';
import { AppLink, useRouter } from '../context/RouterContext';
import { useVoiceRequest } from '../context/VoiceRequestContext';
import { DeviceCard } from '../components/DeviceCard';
import { PageHero } from '../components/PageHero';
import { Reveal } from '../components/Reveal';
import { ServiceCard } from '../components/ServiceCard';

type DeviceCategory = 'all' | 'routers' | 'outdoor';

export function ServicesPage() {
  const { currentSearch } = useRouter();
  const { openVoiceModal } = useVoiceRequest();
  const [category, setCategory] = useState<DeviceCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectedDevice, setInspectedDevice] = useState<DeviceItem | null>(
    null
  );

  // Open specific device lightbox if linked with ?device=device-01
  useEffect(() => {
    const params = new URLSearchParams(currentSearch);
    const targetId = params.get('device');
    if (targetId) {
      const found = DEVICES.find((d) => d.id === targetId);
      if (found) {
        setInspectedDevice(found);
      }
    }
  }, [currentSearch]);

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredDevices = DEVICES.filter((device) => {
    const matchesCat =
      category === 'routers'
        ? device.type.includes('راوتر') || device.type.includes('مودم')
        : category === 'outdoor'
          ? device.type.includes('خارجي') || device.type.includes('لاقط')
          : true;

    if (!matchesCat) return false;
    if (!normalizedQuery) return true;

    return (
      device.name.toLowerCase().includes(normalizedQuery) ||
      device.type.toLowerCase().includes(normalizedQuery) ||
      device.description.toLowerCase().includes(normalizedQuery)
    );
  });

  const inspectedIndex = inspectedDevice
    ? DEVICES.findIndex((d) => d.id === inspectedDevice.id)
    : -1;

  const handleStepDevice = (dir: -1 | 1) => {
    if (inspectedIndex === -1) return;
    const nextIdx = (inspectedIndex + dir + DEVICES.length) % DEVICES.length;
    setInspectedDevice(DEVICES[nextIdx]);
  };

  useEffect(() => {
    if (!inspectedDevice) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setInspectedDevice(null);
      } else if (e.key === 'ArrowLeft') {
        handleStepDevice(1);
      } else if (e.key === 'ArrowRight') {
        handleStepDevice(-1);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  return (
    <div>
      <PageHero
        eyebrow="الخدمات الإلكترونية"
        title="خدماتنا"
        description="اختر الخدمة المطلوبة وسيفتح نموذج الطلب مع تحديد الخدمة تلقائيًا."
        breadcrumbLabel="خدماتنا"
      />

      {/* Section 1: 4 Interactive Service Matrix */}
      <section className="py-14 sm:py-20 bg-white">
        <div className="w-[92%] max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#E2E8F0] border border-[#E2E8F0] rounded-2xl overflow-hidden mb-8">
            {SERVICE_OPTIONS.map((service, idx) => (
              <ServiceCard
                key={service.id}
                id={service.id}
                index={idx}
                icon={service.icon}
                title={service.title}
                description={service.description}
                actionLabel={service.actionLabel}
                href={getServiceFormUrl(service.formValue)}
                requestPath={`/request?tab=service&service=${encodeURIComponent(service.formValue)}`}
              />
            ))}
          </div>

          <div className="bg-[#030A14] text-white border border-white/12 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-right">
              <h2 className="font-display text-base sm:text-lg font-extrabold text-white m-0">
                تفضل طلب الخدمة بالتحدث بدل الكتابة؟
              </h2>
              <p className="text-xs sm:text-sm text-[#94A3B8] m-0 mt-1">
                يمكنك شرح طلبك بالصوت وسنحدد الخدمة والبيانات المناسبة لك تلقائيًا.
              </p>
            </div>
            <button
              type="button"
              onClick={openVoiceModal}
              className="min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#22D3EE] text-[#030A14] text-xs sm:text-sm font-bold hover:bg-[#67E8F9] active:scale-[0.98] transition-all whitespace-nowrap shrink-0"
            >
              <Mic className="w-4 h-4" />
              <span>اطلب خدمتك بصوتك</span>
            </button>
          </div>
        </div>
      </section>

      {/* Section 2: 8-Device Professional Catalog */}
      <section className="py-14 sm:py-20 bg-[#F1F5F9] border-t border-[#E2E8F0]">
        <div className="w-[92%] max-w-[1200px] mx-auto">
          <Reveal>
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 mb-8">
              <div>
                <p className="text-[#0EA5E9] font-bold text-xs tracking-wide mb-2 m-0">
                  معرض الأجهزة
                </p>
                <h2 className="font-display text-2xl sm:text-3xl font-black text-[#071426] mb-2">
                  الأجهزة المتاحة للتركيب والربط
                </h2>
                <p className="text-[#475569] text-sm sm:text-base m-0">
                  تعرّف على أنواع الأجهزة التي يمكن طلب تركيبها أو إعدادها.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {/* Instant Device Search */}
                <div className="relative">
                  <Search className="w-4 h-4 text-[#64748B] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ابحث باسم الجهاز أو نوعه..."
                    aria-label="ابحث في الأجهزة المتاحة"
                    className="w-full sm:w-56 min-h-[44px] rounded-xl bg-white border border-[#E2E8F0] pr-10 pl-3 text-xs text-[#071426] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#0EA5E9]"
                  />
                </div>

                {/* Category Filter Segmented Control */}
                <div
                  role="group"
                  aria-label="تصفية الأجهزة حسب الفئة"
                  className="inline-flex flex-wrap items-center gap-1 p-1 bg-white border border-[#E2E8F0] rounded-xl self-start"
                >
                  <button
                    type="button"
                    onClick={() => setCategory('all')}
                    className={`min-h-[40px] px-4 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#0EA5E9] ${
                      category === 'all'
                        ? 'bg-[#071426] text-[#22D3EE]'
                        : 'text-[#475569] hover:text-[#071426]'
                    }`}
                  >
                    الكل (8)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategory('routers')}
                    className={`min-h-[40px] px-4 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#0EA5E9] ${
                      category === 'routers'
                        ? 'bg-[#071426] text-[#22D3EE]'
                        : 'text-[#475569] hover:text-[#071426]'
                    }`}
                  >
                    راوتر ومودم (4)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategory('outdoor')}
                    className={`min-h-[40px] px-4 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#0EA5E9] ${
                      category === 'outdoor'
                        ? 'bg-[#071426] text-[#22D3EE]'
                        : 'text-[#475569] hover:text-[#071426]'
                    }`}
                  >
                    أجهزة ربط خارجية (4)
                  </button>
                </div>
              </div>
            </div>

            {filteredDevices.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDevices.map((device) => (
                  <DeviceCard
                    key={device.id}
                    device={device}
                    onInspect={(d) => setInspectedDevice(d)}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white border border-[#E2E8F0] rounded-2xl p-10 text-center">
                <p className="font-display text-lg font-bold text-[#071426] mb-2">
                  لا توجد أجهزة مطابقة لعبارة البحث
                </p>
                <p className="text-xs sm:text-sm text-[#475569] mb-5">
                  جرّب البحث بكلمة أخرى مثل TP-Link أو NanoStation أو اختر عرض الكل.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setCategory('all');
                    setSearchQuery('');
                  }}
                  className="min-h-[42px] px-5 py-2 rounded-xl bg-[#071426] text-white text-xs font-bold hover:bg-[#0EA5E9] transition-colors"
                >
                  عرض جميع الأجهزة (8)
                </button>
              </div>
            )}

            <p className="mt-8 p-5 rounded-xl bg-white border border-[#E2E8F0] text-[#475569] text-xs sm:text-[13px] leading-relaxed">
              {DEVICES_NOTE}
            </p>
          </Reveal>
        </div>
      </section>

      {/* Interactive Device Lightbox Modal */}
      <AnimatePresence>
        {inspectedDevice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => setInspectedDevice(null)}
            className="fixed inset-0 z-50 bg-[#030A14]/85 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="device-modal-title"
              initial={{ opacity: 0, scale: 0.97, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 10 }}
              transition={{ duration: 0.18 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white border border-[#E2E8F0] rounded-2xl max-w-xl w-full overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.5)]"
            >
              <div className="relative h-72 sm:h-80 p-6 flex items-center justify-center bg-white border-b border-[#E2E8F0]">
                <img
                  src={inspectedDevice.imageSrc}
                  alt={inspectedDevice.imageAlt}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain"
                />
                <button
                  type="button"
                  onClick={() => setInspectedDevice(null)}
                  aria-label="إغلاق المعاينة"
                  className="absolute top-4 left-4 w-11 h-11 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#071426] flex items-center justify-center hover:bg-[#071426] hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-[#0EA5E9]"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="absolute bottom-4 inset-x-4 flex items-center justify-between pointer-events-none">
                  <button
                    type="button"
                    onClick={() => handleStepDevice(-1)}
                    aria-label="الجهاز السابق"
                    className="pointer-events-auto w-10 h-10 rounded-xl bg-white border border-[#E2E8F0] text-[#071426] flex items-center justify-center hover:bg-[#071426] hover:text-[#22D3EE] transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStepDevice(1)}
                    aria-label="الجهاز التالي"
                    className="pointer-events-auto w-10 h-10 rounded-xl bg-white border border-[#E2E8F0] text-[#071426] flex items-center justify-center hover:bg-[#071426] hover:text-[#22D3EE] transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 sm:p-7 text-right bg-[#F8FAFC]">
                <p className="text-xs font-bold text-[#0EA5E9] mb-1">
                  {inspectedDevice.numberLabel} · {inspectedDevice.type}
                </p>
                <h3
                  id="device-modal-title"
                  className="font-display text-2xl font-black text-[#071426] mb-3"
                >
                  {inspectedDevice.name}
                </h3>
                <p className="text-[#475569] text-sm leading-relaxed mb-6">
                  {inspectedDevice.description}
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href={buildVoiceServiceFormUrl({
                      serviceType: 'تركيب راوتر أو جهاز',
                      deviceCategory: inspectedDevice.formCategory,
                      routerDevice: inspectedDevice.formRouterValue,
                      linkDevice: inspectedDevice.formLinkValue,
                    })}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 min-h-[46px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#071426] text-white font-bold text-sm hover:bg-[#0EA5E9] transition-colors whitespace-nowrap"
                  >
                    <span>طلب تركيب هذا الجهاز</span>
                    <ArrowUpLeft className="w-4 h-4 text-[#22D3EE]" />
                  </a>
                  <AppLink
                    to={`/request?tab=service&service=${encodeURIComponent('تركيب راوتر أو جهاز')}&device=${inspectedDevice.id}`}
                    onClick={() => setInspectedDevice(null)}
                    className="min-h-[46px] inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-white border border-[#E2E8F0] text-[#071426] font-bold text-xs hover:border-[#0EA5E9] transition-colors whitespace-nowrap"
                  >
                    تجهيز بالبوابة
                  </AppLink>
                  <button
                    type="button"
                    onClick={() => setInspectedDevice(null)}
                    className="min-h-[46px] px-4 py-2.5 rounded-xl bg-white border border-[#E2E8F0] text-[#475569] font-bold text-xs hover:border-[#071426] transition-colors"
                  >
                    إغلاق
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
