import { ArrowUpLeft, Check, Ticket, Wifi } from 'lucide-react';
import { InternetCardOption, getInternetCardFormUrl } from '../config/forms';
import { AppLink } from '../context/RouterContext';

interface InternetCardProps {
  card: InternetCardOption;
  capacityPercent?: number;
  selected?: boolean;
  onSelect?: (card: InternetCardOption) => void;
}

export function InternetCard({
  card,
  capacityPercent = 50,
  selected = false,
  onSelect,
}: InternetCardProps) {
  const formUrl = getInternetCardFormUrl(card.formValue);

  return (
    <article
      onClick={() => onSelect?.(card)}
      className={`group relative flex flex-col justify-between bg-white rounded-2xl p-6 sm:p-7 transition-all duration-150 ${
        onSelect ? 'cursor-pointer' : ''
      } ${
        selected
          ? 'border-2 border-[#0EA5E9] ring-4 ring-[#0EA5E9]/10 -translate-y-0.5'
          : 'border border-[#E2E8F0] hover:border-[#0EA5E9] hover:-translate-y-1'
      }`}
    >
      <div>
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div
              aria-hidden="true"
              className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-colors duration-150 ${
                selected
                  ? 'bg-[#071426] text-[#22D3EE] border-[#071426]'
                  : 'bg-[#F1F5F9] border-[#E2E8F0] text-[#071426] group-hover:bg-[#071426] group-hover:text-[#22D3EE] group-hover:border-[#071426]'
              }`}
            >
              <Ticket className="w-5 h-5" strokeWidth={1.9} />
            </div>
            <div>
              <span className="block text-[11px] font-bold text-[#64748B]">
                كرت إنترنت
              </span>
              <h3 className="font-display text-xl font-extrabold text-[#071426] m-0">
                {card.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {selected && (
              <span
                aria-label="محدد حاليًا"
                className="w-7 h-7 rounded-lg bg-[#0EA5E9] text-white flex items-center justify-center"
              >
                <Check className="w-4 h-4" strokeWidth={2.5} />
              </span>
            )}
            <span
              dir="ltr"
              className={`font-mono-tech text-sm font-bold px-3 py-1 rounded-lg border transition-colors duration-150 tabular-nums ${
                selected
                  ? 'bg-[#071426] text-[#22D3EE] border-[#071426]'
                  : 'text-[#071426] bg-[#F1F5F9] border-[#E2E8F0] group-hover:bg-[#071426] group-hover:text-[#22D3EE] group-hover:border-[#071426]'
              }`}
            >
              {card.code}
            </span>
          </div>
        </div>

        {/* Price & Capacity Architectural Strip */}
        <div className="py-5 border-y border-[#E2E8F0] flex items-center justify-between gap-4 mb-5">
          <div>
            <span className="block text-[11px] font-medium text-[#64748B] mb-1">
              السعر المعتمد
            </span>
            <span className="font-display text-2xl sm:text-[26px] font-black text-[#071426] tabular-nums">
              {card.price}
            </span>
          </div>

          <div className="rounded-xl bg-[#030A14] text-white px-4 py-2.5 text-left border border-[#07162B]">
            <span className="flex items-center justify-end gap-1.5 text-[10.5px] text-[#94A3B8] mb-0.5">
              <span>السعة</span>
              <Wifi className="w-3 h-3 text-[#22D3EE]" />
            </span>
            <span
              dir="ltr"
              className="block font-mono-tech text-base font-bold text-[#22D3EE] tabular-nums"
            >
              {card.capacity}
            </span>
          </div>
        </div>

        {/* Relative Capacity Meter */}
        <div className="mb-6">
          <div className="h-1.5 w-full rounded-full bg-[#F1F5F9] overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${capacityPercent}%`,
                background: 'linear-gradient(90deg, #0EA5E9, #22D3EE)',
              }}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
        <a
          href={formUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 min-h-[46px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#071426] text-white font-bold text-[13px] hover:bg-[#0EA5E9] transition-colors duration-150 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#0EA5E9]"
        >
          <span>طلب هذا الكرت</span>
          <ArrowUpLeft className="w-4 h-4" />
        </a>

        <AppLink
          to={`/request?tab=subscription&card=${encodeURIComponent(card.id)}`}
          className="min-h-[46px] inline-flex items-center justify-center px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#071426] font-bold text-xs hover:border-[#0EA5E9] hover:text-[#0EA5E9] transition-colors whitespace-nowrap"
        >
          تجهيز
        </AppLink>
      </div>
    </article>
  );
}
