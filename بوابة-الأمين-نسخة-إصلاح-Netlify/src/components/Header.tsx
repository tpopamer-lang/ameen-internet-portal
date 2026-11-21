import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowUpLeft, Menu, MessageCircle, Phone, X } from 'lucide-react';
import { CONTACT_CONFIG, SITE_INFO } from '../config/site';
import { AppLink } from '../context/RouterContext';
import { Navigation } from './Navigation';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 12);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-200 ${
          scrolled
            ? 'bg-[#030A14]/92 backdrop-blur-xl border-b border-white/12 shadow-[0_12px_36px_rgba(2,6,14,0.45)]'
            : 'bg-[#030A14]/88 backdrop-blur-md border-b border-white/8'
        }`}
      >
        <div className="w-[92%] max-w-[1280px] mx-auto">
          <div className="h-[56px] lg:h-[76px] flex items-center justify-between gap-4 lg:gap-8">
            {/* Zone 1: Brand Wordmark (Single Line, Clean) */}
            <AppLink
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="group flex items-center gap-3 text-white whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#22D3EE] rounded-lg py-1"
            >
              <span
                aria-hidden="true"
                className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl flex items-center justify-center border border-[#22D3EE]/35 bg-[#07162B] group-hover:border-[#22D3EE] transition-colors duration-200 shrink-0"
              >
                <svg
                  viewBox="0 0 28 28"
                  className="w-5 h-5"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6.5 21.5L14 6.5L21.5 21.5"
                    stroke="#22D3EE"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9.5 16.5H18.5"
                    stroke="#D6B56D"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <circle cx="14" cy="6.5" r="2.1" fill="#D6B56D" />
                </svg>
              </span>

              <span className="font-display text-[17px] sm:text-[18px] lg:text-[19px] font-extrabold tracking-tight text-white whitespace-nowrap shrink-0">
                {SITE_INFO.brandFirst}{' '}
                <span className="text-[#22D3EE]">الأمين للإنترنت</span>
              </span>
            </AppLink>

            {/* Zone 2: Desktop Navigation */}
            <div className="hidden lg:flex items-center justify-center">
              <Navigation />
            </div>

            {/* Zone 3: Primary Action + Mobile Drawer Trigger */}
            <div className="flex items-center gap-2.5 shrink-0">
              <AppLink
                to="/request"
                className="group hidden sm:inline-flex min-h-[42px] items-center justify-center gap-2 px-5 py-2 rounded-xl text-[13px] font-bold text-[#030A14] bg-[#22D3EE] hover:bg-[#67E8F9] active:scale-[0.98] transition-all duration-150 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-white"
              >
                <span>اطلب خدمتك الآن</span>
                <ArrowUpLeft className="w-3.5 h-3.5 transition-transform duration-150 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5" />
              </AppLink>

              <button
                type="button"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-navigation-drawer"
                aria-label={mobileMenuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
                className="lg:hidden min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-xl border border-white/15 bg-[#07162B] text-white hover:text-[#22D3EE] hover:border-[#22D3EE]/60 active:scale-[0.96] transition-all duration-150 focus-visible:outline-2 focus-visible:outline-[#22D3EE]"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile RTL Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => setMobileMenuOpen(false)}
              className="absolute inset-0 bg-[#02060E]/80 backdrop-blur-sm"
              aria-hidden="true"
            />

            <motion.aside
              id="mobile-navigation-drawer"
              aria-label="قائمة التنقل للهاتف"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="absolute top-0 right-0 bottom-0 w-[86%] max-w-[350px] bg-[#030A14] border-l border-white/12 shadow-[-20px_0_60px_rgba(0,0,0,0.65)] flex flex-col justify-between overflow-y-auto"
            >
              <div className="p-5">
                <div className="flex items-center justify-between gap-3 pb-4 mb-5 border-b border-white/10">
                  <div>
                    <div className="font-display text-base font-extrabold text-white">
                      {SITE_INFO.fullNameAr}
                    </div>
                    <div
                      dir="ltr"
                      className="font-mono-tech text-[10px] tracking-[1.4px] text-[#22D3EE] text-right mt-0.5"
                    >
                      {SITE_INFO.fullNameEn}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    aria-label="إغلاق القائمة"
                    className="min-w-[44px] min-h-[44px] rounded-xl border border-white/12 bg-white/5 text-white flex items-center justify-center hover:border-[#22D3EE] hover:text-[#22D3EE] transition-colors focus-visible:outline-2 focus-visible:outline-[#22D3EE]"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <Navigation mobile onNavigate={() => setMobileMenuOpen(false)} />
              </div>

              <div className="p-5 border-t border-white/10 bg-[#07162B]/65 space-y-3">
                <AppLink
                  to="/request"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full min-h-[46px] inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-[#030A14] bg-[#22D3EE] hover:bg-[#67E8F9] active:scale-[0.98] transition-all"
                >
                  <span>اطلب خدمتك الآن</span>
                  <ArrowUpLeft className="w-4 h-4" />
                </AppLink>

                <div className="grid grid-cols-2 gap-2.5">
                  <a
                    href={CONTACT_CONFIG.phoneHref}
                    className="min-h-[44px] inline-flex items-center justify-center gap-2 rounded-xl border border-white/12 bg-white/5 text-xs font-bold text-white hover:border-[#22D3EE]/60 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#22D3EE]" />
                    <span>اتصال</span>
                  </a>
                  <a
                    href={CONTACT_CONFIG.whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-[44px] inline-flex items-center justify-center gap-2 rounded-xl border border-white/12 bg-white/5 text-xs font-bold text-white hover:border-[#22D3EE]/60 transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-[#22D3EE]" />
                    <span>واتساب</span>
                  </a>
                </div>

                <p className="text-[11px] text-[#94A3B8] text-center m-0 pt-1">
                  {SITE_INFO.addressDisplay}
                </p>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
