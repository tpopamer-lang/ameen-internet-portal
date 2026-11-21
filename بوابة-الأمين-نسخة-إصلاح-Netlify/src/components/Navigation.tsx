import { motion } from 'motion/react';
import { ChevronLeft } from 'lucide-react';
import { NAV_ITEMS } from '../config/site';
import { AppLink, useRouter } from '../context/RouterContext';

interface NavigationProps {
  onNavigate?: () => void;
  mobile?: boolean;
}

export function Navigation({ onNavigate, mobile = false }: NavigationProps) {
  const { currentPath } = useRouter();

  if (mobile) {
    return (
      <nav aria-label="القائمة الرئيسية للهاتف" className="flex flex-col gap-1">
        {NAV_ITEMS.map((item, idx) => {
          const isActive = currentPath === item.path;
          return (
            <AppLink
              key={item.path}
              to={item.path}
              onClick={onNavigate}
              aria-current={isActive ? 'page' : undefined}
              className={`min-h-[48px] flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all duration-150 active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-[#22D3EE] ${
                isActive
                  ? 'bg-[#0E294B] text-[#22D3EE] font-bold border border-[#22D3EE]/35'
                  : 'text-[#E2E8F0] font-medium border border-transparent hover:bg-white/5 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-3">
                <span className="font-mono-tech text-[11px] text-[#64748B]">
                  0{idx + 1}
                </span>
                <span>{item.label}</span>
              </span>
              <ChevronLeft
                className={`w-4 h-4 ${
                  isActive ? 'text-[#D6B56D]' : 'text-[#64748B]'
                }`}
              />
            </AppLink>
          );
        })}
      </nav>
    );
  }

  return (
    <nav
      aria-label="القائمة الرئيسية"
      className="flex items-center gap-4 xl:gap-6"
    >
      {NAV_ITEMS.map((item) => {
        const isActive = currentPath === item.path;
        return (
          <AppLink
            key={item.path}
            to={item.path}
            aria-current={isActive ? 'page' : undefined}
            className={`group relative py-2 text-[13px] xl:text-[13.5px] whitespace-nowrap shrink-0 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-[#22D3EE] rounded ${
              isActive
                ? 'text-[#22D3EE] font-bold'
                : 'text-[#CBD5E1] font-medium hover:text-white'
            }`}
          >
            <span>{item.label}</span>

            {!isActive && (
              <span
                aria-hidden="true"
                className="absolute bottom-0 inset-x-0 h-[1.5px] bg-white/40 scale-x-0 group-hover:scale-x-100 transition-transform duration-150 origin-center"
              />
            )}

            {isActive && (
              <motion.span
                layoutId="header-nav-underline"
                aria-hidden="true"
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="absolute bottom-0 inset-x-0 h-[2px] bg-[#22D3EE]"
              />
            )}
          </AppLink>
        );
      })}
    </nav>
  );
}
