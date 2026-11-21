import {
  ArrowLeftRight,
  ArrowUpLeft,
  Headset,
  Router,
  SlidersHorizontal,
  Wrench,
} from 'lucide-react';
import { AppLink } from '../context/RouterContext';

interface ServiceCardProps {
  id?: string;
  icon: string;
  title: string;
  description: string;
  actionLabel: string;
  href: string;
  requestPath?: string;
  index?: number;
}

function getServiceVectorIcon(id?: string) {
  switch (id) {
    case 'install-device':
      return Router;
    case 'technical-support':
      return Headset;
    case 'maintenance':
      return Wrench;
    case 'transfer-service':
      return ArrowLeftRight;
    default:
      return Router;
  }
}

export function ServiceCard({
  id,
  title,
  description,
  actionLabel,
  href,
  requestPath,
  index = 0,
}: ServiceCardProps) {
  const numLabel = `0${index + 1}`;
  const Icon = getServiceVectorIcon(id);

  return (
    <article className="group relative flex flex-col justify-between bg-white hover:bg-[#F8FAFC] p-7 sm:p-9 transition-colors duration-150">
      <div>
        <div className="flex items-center justify-between mb-7">
          <div
            aria-hidden="true"
            className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#071426] text-[#22D3EE] group-hover:bg-[#0EA5E9] group-hover:text-white transition-colors duration-150"
          >
            <Icon className="w-6 h-6" strokeWidth={1.85} />
          </div>
          <span className="font-mono-tech text-xs font-bold text-[#94A3B8] group-hover:text-[#0EA5E9] transition-colors tabular-nums">
            {numLabel}
          </span>
        </div>

        <h3 className="font-display text-xl sm:text-[22px] font-extrabold text-[#071426] mb-2.5 group-hover:text-[#0EA5E9] transition-colors duration-150">
          {title}
        </h3>
        <p className="text-[#475569] text-sm sm:text-[15px] leading-[1.85] mb-8 m-0">
          {description}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5 pt-5 border-t border-[#E2E8F0]">
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#071426] text-white text-xs sm:text-sm font-bold hover:bg-[#0EA5E9] transition-colors duration-150 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#0EA5E9]"
        >
          <span>{actionLabel}</span>
          <ArrowUpLeft className="w-4 h-4 text-[#22D3EE]" />
        </a>

        {requestPath && (
          <AppLink
            to={requestPath}
            className="min-h-[44px] inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-[#E2E8F0] text-[#071426] text-xs font-bold hover:border-[#0EA5E9] hover:text-[#0EA5E9] transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#0EA5E9]"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>تجهيز الطلب</span>
          </AppLink>
        )}
      </div>
    </article>
  );
}
