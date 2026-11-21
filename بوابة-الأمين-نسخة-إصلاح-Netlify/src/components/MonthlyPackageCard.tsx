import { ArrowUpLeft, Award, Check, Crown, Wifi } from 'lucide-react';
import { MonthlyPackageOption, getMonthlyPackageFormUrl } from '../config/forms';
import { AppLink } from '../context/RouterContext';

interface MonthlyPackageCardProps {
  pkg: MonthlyPackageOption;
  selected?: boolean;
  onSelect?: (pkg: MonthlyPackageOption) => void;
}

export function MonthlyPackageCard({
  pkg,
  selected = false,
  onSelect,
}: MonthlyPackageCardProps) {
  const formUrl = getMonthlyPackageFormUrl(pkg.formValue);
  const isGold = pkg.tier === 'gold';
  const TierIcon = isGold ? Crown : Award;

  return (
    <article
      onClick={() => onSelect?.(pkg)}
      className={`group relative overflow-hidden flex flex-col justify-between rounded-2xl p-7 sm:p-9 transition-all duration-150 ${
        onSelect ? 'cursor-pointer' : ''
      } ${
        isGold
          ? `bg-[#030A14] text-white ${
              selected
                ? 'border-2 border-[#D6B56D] ring-4 ring-[#D6B56D]/20 -translate-y-0.5'
                : 'border border-[#D6B56D]/50 hover:border-[#D6B56D] hover:-translate-y-1'
            }`
          : `bg-white text-[#071426] ${
              selected
                ? 'border-2 border-[#0EA5E9] ring-4 ring-[#0EA5E9]/15 -translate-y-0.5'
                : 'border border-[#E2E8F0] hover:border-[#0EA5E9] hover:-translate-y-1'
            }`
      }`}
    >
      {isGold && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 arch-grid-dark opacity-45"
        />
      )}

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span
              className={`block text-xs font-bold mb-1 ${
                isGold ? 'text-[#D6B56D]' : 'text-[#0EA5E9]'
              }`}
            >
              اشتراك شهري
            </span>
            <h3
              className={`font-display text-2xl sm:text-[26px] font-black m-0 ${
                isGold ? 'text-white' : 'text-[#071426]'
              }`}
            >
              {pkg.title}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {selected && (
              <span
                aria-label="الباقة محددة حاليًا"
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isGold
                    ? 'bg-[#D6B56D] text-[#030A14]'
                    : 'bg-[#0EA5E9] text-white'
                }`}
              >
                <Check className="w-4 h-4" strokeWidth={2.5} />
              </span>
            )}
            <div
              aria-hidden="true"
              className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
                isGold
                  ? 'bg-[#D6B56D]/15 border-[#D6B56D]/40 text-[#D6B56D]'
                  : 'bg-[#F1F5F9] border-[#E2E8F0] text-[#071426]'
              }`}
            >
              <TierIcon className="w-6 h-6" strokeWidth={1.85} />
            </div>
          </div>
        </div>

        <div
          className={`py-6 my-5 border-y flex items-center justify-between gap-4 ${
            isGold ? 'border-white/12' : 'border-[#E2E8F0]'
          }`}
        >
          <div>
            <span
              className={`block text-xs mb-1 ${
                isGold ? 'text-[#94A3B8]' : 'text-[#64748B]'
              }`}
            >
              الاشتراك الشهري
            </span>
            <div
              className={`font-display text-3xl font-black tabular-nums ${
                isGold ? 'text-[#D6B56D]' : 'text-[#071426]'
              }`}
            >
              {pkg.price}
            </div>
          </div>

          <div
            className={`rounded-xl px-4 py-3 text-left border ${
              isGold
                ? 'bg-[#07162B] border-[#22D3EE]/35'
                : 'bg-[#030A14] border-[#07162B] text-white'
            }`}
          >
            <span className="flex items-center justify-end gap-1.5 text-[11px] text-[#94A3B8] mb-0.5">
              <span>السعة المعتمدة</span>
              <Wifi className="w-3.5 h-3.5 text-[#22D3EE]" />
            </span>
            <div
              dir="ltr"
              className="font-mono-tech text-2xl font-bold text-[#22D3EE] tabular-nums"
            >
              {pkg.capacity}
            </div>
          </div>
        </div>
      </div>

      <div
        className="relative z-10 flex flex-wrap items-center gap-2.5"
        onClick={(e) => e.stopPropagation()}
      >
        <a
          href={formUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex-1 min-h-[48px] inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all duration-150 whitespace-nowrap ${
            isGold
              ? 'bg-[#D6B56D] text-[#030A14] hover:brightness-110'
              : 'bg-[#071426] text-white hover:bg-[#0EA5E9]'
          }`}
        >
          <span>طلب الباقة</span>
          <ArrowUpLeft className="w-4 h-4" />
        </a>

        <AppLink
          to={`/request?tab=subscription&package=${encodeURIComponent(pkg.id)}`}
          className={`min-h-[48px] inline-flex items-center justify-center px-4 py-3 rounded-xl font-bold text-xs border transition-colors whitespace-nowrap ${
            isGold
              ? 'bg-white/5 border-white/20 text-white hover:border-[#D6B56D]'
              : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#071426] hover:border-[#0EA5E9]'
          }`}
        >
          تجهيز بالبوابة
        </AppLink>
      </div>
    </article>
  );
}
