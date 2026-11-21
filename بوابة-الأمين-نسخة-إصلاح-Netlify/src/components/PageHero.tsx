import { ChevronLeft } from 'lucide-react';
import { AppLink } from '../context/RouterContext';

interface PageHeroProps {
  eyebrow: string;
  title: string;
  description: string;
  breadcrumbLabel: string;
}

export function PageHero({
  eyebrow,
  title,
  description,
  breadcrumbLabel,
}: PageHeroProps) {
  return (
    <section className="relative overflow-hidden bg-[#030A14] text-white py-12 sm:py-16 lg:py-20 border-b border-white/10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 arch-grid-dark opacity-70"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(ellipse 65% 80% at 15% 15%, rgba(14, 165, 233, 0.16), transparent 60%), radial-gradient(ellipse 50% 70% at 90% 90%, rgba(214, 181, 109, 0.1), transparent 55%)',
        }}
      />

      <div className="relative z-10 w-[92%] max-w-[1280px] mx-auto">
        <nav
          aria-label="مسار الصفحة"
          className="flex items-center gap-2 text-xs text-[#94A3B8] mb-6"
        >
          <AppLink
            to="/"
            className="hover:text-[#22D3EE] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-[#22D3EE] rounded"
          >
            الرئيسية
          </AppLink>
          <ChevronLeft className="w-3.5 h-3.5 text-[#475569] shrink-0" />
          <span className="text-[#22D3EE] font-bold">{breadcrumbLabel}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
          <div className="lg:col-span-8">
            <p className="text-xs font-bold tracking-wide text-[#D6B56D] mb-2.5 m-0">
              {eyebrow}
            </p>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-[46px] font-black text-white leading-[1.2] mb-3.5 text-balance">
              {title}
            </h1>
            <p className="text-[#CBD5E1] text-sm sm:text-base lg:text-[17px] leading-relaxed max-w-2xl m-0">
              {description}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
