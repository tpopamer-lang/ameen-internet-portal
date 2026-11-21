import { useState } from 'react';
import {
  ArrowDownUp,
  ArrowUpLeft,
  CheckCircle2,
  LayoutGrid,
  Sparkles,
  TableProperties,
} from 'lucide-react';
import {
  INTERNET_CARDS,
  MONTHLY_PACKAGES,
  getInternetCardFormUrl,
  getMonthlyPackageFormUrl,
} from '../config/forms';
import { AppLink } from '../context/RouterContext';
import { InternetCard } from '../components/InternetCard';
import { MonthlyPackageCard } from '../components/MonthlyPackageCard';
import { PageHero } from '../components/PageHero';
import { Reveal } from '../components/Reveal';

const CARD_CAPACITY_PCT: Record<string, number> = {
  A1: 12,
  A2: 24,
  A3: 36,
  A4: 54,
  A5: 76,
  A6: 100,
};

interface UsageProfile {
  id: string;
  label: string;
  targetType: 'card' | 'package';
  targetId: string;
  note: string;
}

const USAGE_PROFILES: UsageProfile[] = [
  {
    id: 'light',
    label: 'تصفح ورسائل خفيفة',
    targetType: 'card',
    targetId: 'a2',
    note: 'مناسب للتصفح اليومي والواتساب بسعر اقتصادي.',
  },
  {
    id: 'daily',
    label: 'فيديو ومكالمات يومية',
    targetType: 'card',
    targetId: 'a4',
    note: 'سعة متوازنة 2,500 MB تناسب الاستخدام اليومي المتنوع.',
  },
  {
    id: 'heavy_card',
    label: 'تنزيل وبث بسعة عالية',
    targetType: 'card',
    targetId: 'a6',
    note: 'أعلى كرت بسعة 8,000 MB لتجربة ممتدة دون انقطاع.',
  },
  {
    id: 'home_silver',
    label: 'منزل أو مكتب (شهري)',
    targetType: 'package',
    targetId: 'silver',
    note: 'الباقة الفضية بسعة 35 GB مريحة للاستخدام المنزلي الشهري.',
  },
  {
    id: 'home_gold',
    label: 'عائلة أو استخدام مكثف',
    targetType: 'package',
    targetId: 'gold',
    note: 'الباقة الذهبية بسعة 100 GB لتشغيل عدة أجهزة طوال الشهر.',
  },
];

export function InternetCardsPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'compare'>('grid');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedProfileId, setSelectedProfileId] = useState<string>('daily');
  const [selectedChoice, setSelectedChoice] = useState<{
    type: 'card' | 'package';
    id: string;
  }>({ type: 'card', id: 'a4' });

  const sortedCards =
    sortOrder === 'asc' ? INTERNET_CARDS : [...INTERNET_CARDS].reverse();

  const selectedCard =
    selectedChoice.type === 'card'
      ? INTERNET_CARDS.find((c) => c.id === selectedChoice.id) ??
        INTERNET_CARDS[0]
      : null;
  const selectedPackage =
    selectedChoice.type === 'package'
      ? MONTHLY_PACKAGES.find((p) => p.id === selectedChoice.id) ??
        MONTHLY_PACKAGES[0]
      : null;

  const activeProfile =
    USAGE_PROFILES.find((p) => p.id === selectedProfileId) ?? USAGE_PROFILES[1];

  const handleChooseProfile = (profile: UsageProfile) => {
    setSelectedProfileId(profile.id);
    setSelectedChoice({ type: profile.targetType, id: profile.targetId });
  };

  return (
    <div>
      <PageHero
        eyebrow="الفئات المعتمدة"
        title="كروت الإنترنت"
        description="اختر الكرت المناسب لاحتياجك."
        breadcrumbLabel="كروت الإنترنت"
      />

      {/* Interactive Recommender + Selected Summary Bar */}
      <section className="py-10 bg-[#F8FAFC] border-b border-[#E2E8F0]">
        <div className="w-[92%] max-w-[1200px] mx-auto space-y-6">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 sm:p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#0EA5E9]" />
                <h2 className="font-display text-base sm:text-lg font-extrabold text-[#071426] m-0">
                  اختر نمط استخدامك لنقترح لك الأنسب
                </h2>
              </div>
              <span className="text-xs text-[#475569]">{activeProfile.note}</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {USAGE_PROFILES.map((profile) => {
                const isActive = selectedProfileId === profile.id;
                return (
                  <button
                    key={profile.id}
                    type="button"
                    onClick={() => handleChooseProfile(profile)}
                    className={`min-h-[40px] px-4 py-2 rounded-xl text-xs font-bold border transition-all whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#0EA5E9] ${
                      isActive
                        ? 'bg-[#071426] text-[#22D3EE] border-[#071426]'
                        : 'bg-[#F8FAFC] text-[#071426] border-[#E2E8F0] hover:border-[#0EA5E9]'
                    }`}
                  >
                    {profile.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Live Selection Confirmation Strip */}
          <div className="bg-[#030A14] text-white border border-white/15 rounded-2xl p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-[#07162B] border border-[#22D3EE]/35 text-[#22D3EE] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-[11px] font-bold text-[#94A3B8]">
                  الاختيار المحدد حاليًا
                </span>
                <div className="flex flex-wrap items-baseline gap-2.5 mt-0.5">
                  <span className="font-display text-lg font-black text-white">
                    {selectedCard
                      ? selectedCard.title
                      : selectedPackage?.title}
                  </span>
                  <span
                    dir="ltr"
                    className="font-mono-tech text-sm font-bold text-[#22D3EE] tabular-nums"
                  >
                    {selectedCard
                      ? selectedCard.capacity
                      : selectedPackage?.capacity}
                  </span>
                  <span className="font-display text-base font-extrabold text-[#D6B56D] tabular-nums">
                    {selectedCard
                      ? selectedCard.price
                      : selectedPackage?.price}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <a
                href={
                  selectedCard
                    ? getInternetCardFormUrl(selectedCard.formValue)
                    : getMonthlyPackageFormUrl(selectedPackage!.formValue)
                }
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-[#22D3EE] text-[#030A14] text-xs font-bold hover:bg-[#67E8F9] transition-colors whitespace-nowrap"
              >
                <span>فتح نموذج الاشتراكات الرسمي</span>
                <ArrowUpLeft className="w-4 h-4" />
              </a>
              <AppLink
                to={
                  selectedCard
                    ? `/request?tab=subscription&card=${encodeURIComponent(selectedCard.id)}`
                    : `/request?tab=subscription&package=${encodeURIComponent(selectedPackage!.id)}`
                }
                className="min-h-[44px] inline-flex items-center justify-center px-4 py-2 rounded-xl border border-white/20 text-white text-xs font-bold hover:border-[#22D3EE] transition-colors whitespace-nowrap"
              >
                تجهيز الطلب بالبوابة
              </AppLink>
            </div>
          </div>
        </div>
      </section>

      {/* Cards Section with Interactive Grid / Comparison Switch */}
      <section className="py-14 sm:py-20 bg-white">
        <div className="w-[92%] max-w-[1200px] mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-[#E2E8F0]">
            <div>
              <p className="text-[#0EA5E9] font-bold text-xs tracking-wide mb-1 m-0">
                قائمة الكروت المعتمدة
              </p>
              <h2 className="font-display text-xl sm:text-2xl font-black text-[#071426] m-0">
                اختر الفئة المناسبة لاستخدامك
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {viewMode === 'compare' && (
                <button
                  type="button"
                  onClick={() =>
                    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
                  }
                  className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-bold text-[#071426] inline-flex items-center gap-1.5 hover:border-[#0EA5E9] transition-colors whitespace-nowrap"
                >
                  <ArrowDownUp className="w-3.5 h-3.5 text-[#0EA5E9]" />
                  <span>
                    {sortOrder === 'asc'
                      ? 'الترتيب: الأقل سعرًا'
                      : 'الترتيب: الأعلى سعة'}
                  </span>
                </button>
              )}

              <div
                role="tablist"
                aria-label="طريقة عرض كروت الإنترنت"
                className="inline-flex items-center gap-1 p-1 bg-[#F1F5F9] border border-[#E2E8F0] rounded-xl self-start"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={viewMode === 'grid'}
                  onClick={() => setViewMode('grid')}
                  className={`min-h-[40px] px-4 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#0EA5E9] ${
                    viewMode === 'grid'
                      ? 'bg-[#071426] text-white'
                      : 'text-[#475569] hover:text-[#071426]'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>عرض البطاقات</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={viewMode === 'compare'}
                  onClick={() => setViewMode('compare')}
                  className={`min-h-[40px] px-4 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#0EA5E9] ${
                    viewMode === 'compare'
                      ? 'bg-[#071426] text-white'
                      : 'text-[#475569] hover:text-[#071426]'
                  }`}
                >
                  <TableProperties className="w-3.5 h-3.5" />
                  <span>جدول المقارنة</span>
                </button>
              </div>
            </div>
          </div>

          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {INTERNET_CARDS.map((card) => (
                <InternetCard
                  key={card.id}
                  card={card}
                  capacityPercent={CARD_CAPACITY_PCT[card.code] ?? 50}
                  selected={
                    selectedChoice.type === 'card' &&
                    selectedChoice.id === card.id
                  }
                  onSelect={(c) =>
                    setSelectedChoice({ type: 'card', id: c.id })
                  }
                />
              ))}
            </div>
          ) : (
            <div className="border border-[#E2E8F0] rounded-2xl overflow-hidden bg-white">
              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className="bg-[#030A14] text-white text-xs font-bold">
                      <th className="py-4 px-5">الرمز</th>
                      <th className="py-4 px-5">الفئة</th>
                      <th className="py-4 px-5">السعة المعتمدة</th>
                      <th className="py-4 px-5">السعر المعتمد</th>
                      <th className="py-4 px-5 text-left">الطلب المباشر</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0] text-sm">
                    {sortedCards.map((card) => {
                      const isRowSelected =
                        selectedChoice.type === 'card' &&
                        selectedChoice.id === card.id;
                      return (
                        <tr
                          key={card.id}
                          onClick={() =>
                            setSelectedChoice({ type: 'card', id: card.id })
                          }
                          className={`cursor-pointer transition-colors ${
                            isRowSelected ? 'bg-[#EEF6FD]' : 'hover:bg-[#F8FAFC]'
                          }`}
                        >
                          <td className="py-4 px-5">
                            <span
                              dir="ltr"
                              className={`inline-block font-mono-tech font-bold px-2.5 py-1 rounded-md tabular-nums ${
                                isRowSelected
                                  ? 'bg-[#071426] text-[#22D3EE]'
                                  : 'text-[#071426] bg-[#F1F5F9]'
                              }`}
                            >
                              {card.code}
                            </span>
                          </td>
                          <td className="py-4 px-5 font-display font-bold text-[#071426]">
                            {card.title}
                          </td>
                          <td
                            dir="ltr"
                            className="py-4 px-5 font-mono-tech font-bold text-[#0EA5E9] tabular-nums text-right"
                          >
                            {card.capacity}
                          </td>
                          <td className="py-4 px-5 font-display font-extrabold text-[#071426] tabular-nums">
                            {card.price}
                          </td>
                          <td
                            className="py-4 px-5 text-left"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <a
                              href={getInternetCardFormUrl(card.formValue)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex min-h-[38px] items-center justify-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#071426] text-white text-xs font-bold hover:bg-[#0EA5E9] transition-colors whitespace-nowrap"
                            >
                              <span>طلب هذا الكرت</span>
                              <ArrowUpLeft className="w-3.5 h-3.5" />
                            </a>
                          </td>
                        </tr>
                      );
                    })}

                    {MONTHLY_PACKAGES.map((pkg) => {
                      const isRowSelected =
                        selectedChoice.type === 'package' &&
                        selectedChoice.id === pkg.id;
                      return (
                        <tr
                          key={pkg.id}
                          onClick={() =>
                            setSelectedChoice({ type: 'package', id: pkg.id })
                          }
                          className={`cursor-pointer transition-colors ${
                            isRowSelected
                              ? 'bg-[#FAF5E8]'
                              : 'bg-[#F8FAFC] hover:bg-[#F1F5F9]'
                          }`}
                        >
                          <td className="py-4 px-5">
                            <span className="inline-block text-xs font-bold text-[#9A7426] bg-[#FAF5E8] border border-[#D6B56D]/45 px-2.5 py-1 rounded-md">
                              شهري
                            </span>
                          </td>
                          <td className="py-4 px-5 font-display font-bold text-[#071426]">
                            {pkg.title}
                          </td>
                          <td
                            dir="ltr"
                            className="py-4 px-5 font-mono-tech font-bold text-[#0EA5E9] tabular-nums text-right"
                          >
                            {pkg.capacity}
                          </td>
                          <td className="py-4 px-5 font-display font-extrabold text-[#071426] tabular-nums">
                            {pkg.price}
                          </td>
                          <td
                            className="py-4 px-5 text-left"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <a
                              href={getMonthlyPackageFormUrl(pkg.formValue)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex min-h-[38px] items-center justify-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#D6B56D] text-[#030A14] text-xs font-bold hover:brightness-105 transition-all whitespace-nowrap"
                            >
                              <span>طلب الباقة</span>
                              <ArrowUpLeft className="w-3.5 h-3.5" />
                            </a>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Monthly Packages Section */}
      <section className="py-16 sm:py-22 bg-[#F1F5F9] border-t border-[#E2E8F0]">
        <div className="w-[92%] max-w-[1200px] mx-auto">
          <Reveal>
            <div className="text-center mb-10">
              <p className="text-[#0EA5E9] font-bold text-xs tracking-wide mb-2">
                الاشتراكات الشهرية
              </p>
              <h2 className="font-display text-2xl sm:text-[34px] font-black text-[#071426] m-0">
                الباقات الشهرية
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[900px] mx-auto">
              {MONTHLY_PACKAGES.map((pkg) => (
                <MonthlyPackageCard
                  key={pkg.id}
                  pkg={pkg}
                  selected={
                    selectedChoice.type === 'package' &&
                    selectedChoice.id === pkg.id
                  }
                  onSelect={(p) =>
                    setSelectedChoice({ type: 'package', id: p.id })
                  }
                />
              ))}
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
