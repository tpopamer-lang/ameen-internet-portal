import { MapPin, Mail, MessageCircle, Phone } from 'lucide-react';
import {
  CONTACT_CONFIG,
  FOOTER_CUSTOMER_LINKS,
  FOOTER_SITE_LINKS,
  SITE_INFO,
} from '../config/site';
import { AppLink } from '../context/RouterContext';

export function Footer() {
  return (
    <footer className="bg-[#030A14] text-[#94A3B8] border-t border-white/10">
      <div className="w-[92%] max-w-[1280px] mx-auto py-14 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12">
          {/* Brand Column */}
          <div className="md:col-span-5">
            <AppLink
              to="/"
              className="inline-flex items-center gap-3 text-white mb-5 focus-visible:outline-2 focus-visible:outline-[#22D3EE] rounded-lg"
            >
              <span
                aria-hidden="true"
                className="w-10 h-10 rounded-xl flex items-center justify-center border border-[#22D3EE]/35 bg-[#07162B] shrink-0"
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
              <span className="font-display text-lg font-extrabold text-white">
                {SITE_INFO.brandFirst}{' '}
                <span className="text-[#22D3EE]">الأمين للإنترنت</span>
              </span>
            </AppLink>

            <p className="text-sm text-[#94A3B8] leading-[1.85] max-w-md mb-5">
              {SITE_INFO.tagline} {SITE_INFO.activityNature}
            </p>

            <a
              href={CONTACT_CONFIG.mapsHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs text-[#D6B56D] hover:text-white transition-colors font-medium"
            >
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span>{SITE_INFO.addressDisplay}</span>
            </a>
          </div>

          {/* Site Links */}
          <div className="md:col-span-2">
            <h3 className="font-display text-sm font-bold text-white mb-4">
              روابط الموقع
            </h3>
            <ul className="space-y-2.5 m-0 p-0 list-none">
              {FOOTER_SITE_LINKS.map((link) => (
                <li key={link.path}>
                  <AppLink
                    to={link.path}
                    className="inline-flex items-center text-[13.5px] text-[#94A3B8] hover:text-[#22D3EE] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-[#22D3EE] rounded"
                  >
                    {link.label}
                  </AppLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Links */}
          <div className="md:col-span-2">
            <h3 className="font-display text-sm font-bold text-white mb-4">
              خدمات العملاء
            </h3>
            <ul className="space-y-2.5 m-0 p-0 list-none">
              {FOOTER_CUSTOMER_LINKS.map((link) => (
                <li key={link.path}>
                  <AppLink
                    to={link.path}
                    className="inline-flex items-center text-[13.5px] text-[#94A3B8] hover:text-[#22D3EE] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-[#22D3EE] rounded"
                  >
                    {link.label}
                  </AppLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Direct Channels */}
          <div className="md:col-span-3">
            <h3 className="font-display text-sm font-bold text-white mb-4">
              قنوات التواصل
            </h3>
            <ul className="space-y-2.5 m-0 p-0 list-none">
              <li>
                <a
                  href={CONTACT_CONFIG.phoneHref}
                  className="inline-flex items-center gap-2 text-[13.5px] text-[#94A3B8] hover:text-[#22D3EE] transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-[#22D3EE]" />
                  <span>اتصال هاتفي مباشر</span>
                </a>
              </li>
              <li>
                <a
                  href={CONTACT_CONFIG.whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[13.5px] text-[#94A3B8] hover:text-[#22D3EE] transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-[#22D3EE]" />
                  <span>محادثة واتساب</span>
                </a>
              </li>
              <li>
                <a
                  href={CONTACT_CONFIG.emailHref}
                  className="inline-flex items-center gap-2 text-[13.5px] text-[#94A3B8] hover:text-[#22D3EE] transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-[#D6B56D]" />
                  <span>البريد الإلكتروني</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#64748B]">
          <span>{SITE_INFO.copyright}</span>
          <span
            dir="ltr"
            className="font-mono-tech tracking-[1.5px] text-[11px] text-[#64748B]"
          >
            {SITE_INFO.fullNameEn}
          </span>
        </div>
      </div>
    </footer>
  );
}
