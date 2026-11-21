import { useState } from 'react';
import {
  ArrowUpLeft,
  Check,
  Copy,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from 'lucide-react';
import { CONTACT_CONFIG, SITE_INFO } from '../config/site';

interface ContactItem {
  id: string;
  label: string;
  actionHint: string;
  valueDisplay: string;
  copyValue: string;
  ltrValue?: boolean;
  ariaLabel: string;
  href: string;
  external?: boolean;
  title?: string;
  Icon: typeof Phone;
}

const CONTACT_ITEMS: ContactItem[] = [
  {
    id: 'phone',
    label: 'اتصال',
    actionHint: 'الاتصال الهاتفي المباشر',
    valueDisplay: '776220188',
    copyValue: '776220188',
    ltrValue: true,
    ariaLabel: 'الاتصال الهاتفي',
    href: CONTACT_CONFIG.phoneHref,
    Icon: Phone,
  },
  {
    id: 'whatsapp',
    label: 'واتساب',
    actionHint: 'محادثة فورية عبر واتساب',
    valueDisplay: '+967 776 220 188',
    copyValue: '776220188',
    ltrValue: true,
    ariaLabel: 'التواصل عبر واتساب',
    href: CONTACT_CONFIG.whatsappHref,
    external: true,
    Icon: MessageCircle,
  },
  {
    id: 'email',
    label: 'البريد الإلكتروني',
    actionHint: 'إرسال رسالة بريدية',
    valueDisplay: 'a2006maer@gmail.com',
    copyValue: 'a2006maer@gmail.com',
    ltrValue: true,
    ariaLabel: 'إرسال بريد إلكتروني',
    href: CONTACT_CONFIG.emailHref,
    Icon: Mail,
  },
  {
    id: 'location',
    label: 'موقع الشبكة',
    actionHint: 'عرض الموقع على الخرائط',
    valueDisplay: 'سوق شبام، فندق شبام',
    copyValue: SITE_INFO.address,
    ariaLabel: `موقع الشبكة على خرائط Google - ${SITE_INFO.address}`,
    title: SITE_INFO.address,
    href: CONTACT_CONFIG.mapsHref,
    external: true,
    Icon: MapPin,
  },
];

export function ContactLinks() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (id: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedId(id);
      window.setTimeout(() => {
        setCopiedId((curr) => (curr === id ? null : curr));
      }, 2000);
    } catch {
      // Clipboard API unavailable
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[#E2E8F0] border border-[#E2E8F0] rounded-2xl overflow-hidden max-w-[1140px] mx-auto">
      {CONTACT_ITEMS.map((item, idx) => {
        const Icon = item.Icon;
        const isCopied = copiedId === item.id;
        return (
          <div
            key={item.id}
            className="group flex min-h-[230px] flex-col justify-between bg-white hover:bg-[#F8FAFC] text-right transition-colors duration-150 p-7"
          >
            <div>
              <div className="flex items-center justify-between">
                <div
                  aria-hidden="true"
                  className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#071426] text-[#22D3EE] group-hover:bg-[#0EA5E9] group-hover:text-white transition-colors duration-150"
                >
                  <Icon className="w-6 h-6" strokeWidth={1.85} />
                </div>
                <span className="font-mono-tech text-xs font-bold text-[#94A3B8] tabular-nums">
                  0{idx + 1}
                </span>
              </div>

              <div className="my-5">
                <span className="block font-display text-lg font-extrabold text-[#071426] mb-1">
                  {item.label}
                </span>
                <span className="block text-xs text-[#475569] mb-2">
                  {item.actionHint}
                </span>
                <span
                  dir={item.ltrValue ? 'ltr' : undefined}
                  className="block font-mono-tech text-xs font-bold text-[#0EA5E9] tabular-nums truncate text-right"
                >
                  {item.valueDisplay}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-4 border-t border-[#E2E8F0]">
              <a
                href={item.href}
                aria-label={item.ariaLabel}
                title={item.title}
                {...(item.external
                  ? { target: '_blank', rel: 'noopener noreferrer' }
                  : {})}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#071426] hover:text-[#0EA5E9] transition-colors focus-visible:outline-2 focus-visible:outline-[#0EA5E9]"
              >
                <span>فتح</span>
                <ArrowUpLeft className="w-4 h-4 transition-transform duration-150 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>

              <button
                type="button"
                onClick={() => void handleCopy(item.id, item.copyValue)}
                aria-label={`نسخ ${item.label}`}
                className={`min-h-[32px] px-2.5 py-1 rounded-lg border text-[11px] font-bold inline-flex items-center gap-1 transition-colors ${
                  isCopied
                    ? 'bg-[#071426] text-[#22D3EE] border-[#071426]'
                    : 'bg-[#F8FAFC] text-[#475569] border-[#E2E8F0] hover:border-[#0EA5E9] hover:text-[#071426]'
                }`}
              >
                {isCopied ? (
                  <>
                    <Check className="w-3 h-3" />
                    <span>تم النسخ</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>نسخ</span>
                  </>
                )}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
