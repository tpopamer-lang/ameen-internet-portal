import { useState } from 'react';
import { ArrowUpLeft, Expand, Router } from 'lucide-react';
import { DeviceItem } from '../config/devices';
import { buildVoiceServiceFormUrl } from '../config/forms';

interface DeviceCardProps {
  device: DeviceItem;
  onInspect?: (device: DeviceItem) => void;
}

export function DeviceCard({ device, onInspect }: DeviceCardProps) {
  const [imgError, setImgError] = useState(false);

  const installHref = buildVoiceServiceFormUrl({
    serviceType: 'تركيب راوتر أو جهاز',
    deviceCategory: device.formCategory,
    routerDevice: device.formRouterValue,
    linkDevice: device.formLinkValue,
  });

  return (
    <article className="group overflow-hidden bg-white border border-[#E2E8F0] rounded-2xl hover:border-[#0EA5E9] transition-colors duration-150 flex flex-col">
      <div
        onClick={() => onInspect?.(device)}
        role={onInspect ? 'button' : undefined}
        tabIndex={onInspect ? 0 : undefined}
        onKeyDown={(e) => {
          if (onInspect && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onInspect(device);
          }
        }}
        aria-label={onInspect ? `معاينة ${device.name} بحجم أكبر` : undefined}
        className={`relative h-[230px] p-6 flex items-center justify-center bg-[#FFFFFF] border-b border-[#E2E8F0] overflow-hidden ${
          onInspect
            ? 'cursor-pointer focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#0EA5E9]'
            : ''
        }`}
      >
        {!imgError ? (
          <img
            src={device.imageSrc}
            alt={device.imageAlt}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-contain block transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 text-[#475569]">
            <Router className="w-10 h-10 text-[#0EA5E9]" />
            <span className="text-xs font-bold">{device.name}</span>
          </div>
        )}

        {onInspect && (
          <span
            aria-hidden="true"
            className="absolute bottom-3 left-3 min-h-[34px] px-3 py-1 rounded-lg bg-[#030A14]/90 text-white text-[11px] font-bold inline-flex items-center gap-1.5 opacity-95 sm:opacity-0 sm:group-hover:opacity-100 group-hover:bg-[#0EA5E9] transition-all duration-150"
          >
            <Expand className="w-3.5 h-3.5" />
            <span>تكبير</span>
          </span>
        )}
      </div>

      <div className="p-6 text-right flex-1 flex flex-col justify-between bg-[#F8FAFC]/50">
        <div className="mb-5">
          <div className="flex items-center gap-2 text-xs mb-2 text-[#64748B]">
            <span className="font-bold text-[#0EA5E9] tabular-nums">
              {device.numberLabel}
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-medium">{device.type}</span>
          </div>

          <h3 className="font-display text-[18px] font-extrabold text-[#071426] mb-2 group-hover:text-[#0EA5E9] transition-colors">
            {device.name}
          </h3>

          <p className="text-[#475569] text-[13.5px] leading-[1.85] m-0">
            {device.description}
          </p>
        </div>

        <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-between gap-2">
          <a
            href={installHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[38px] items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#071426] text-white text-xs font-bold hover:bg-[#0EA5E9] transition-colors whitespace-nowrap"
          >
            <span>طلب تركيب</span>
            <ArrowUpLeft className="w-3.5 h-3.5 text-[#22D3EE]" />
          </a>

          {onInspect && (
            <button
              type="button"
              onClick={() => onInspect(device)}
              className="min-h-[38px] px-3 py-1.5 rounded-lg bg-white border border-[#E2E8F0] text-[#475569] hover:text-[#071426] hover:border-[#071426] text-xs font-bold transition-colors whitespace-nowrap"
            >
              التفاصيل
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
