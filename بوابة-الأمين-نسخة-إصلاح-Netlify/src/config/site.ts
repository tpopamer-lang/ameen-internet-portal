export interface NavItem {
  label: string;
  path: string;
}

export const SITE_INFO = {
  brandFirst: 'بوابة',
  brandAccent: 'الأمين',
  fullNameAr: 'بوابة الأمين للإنترنت',
  fullNameEn: 'AL-AMEEN INTERNET PORTAL',
  tagline: 'اتصال يربطك بالعالم.',
  activityNature:
    'شبكة إنترنت لاسلكية تقدم خدمات الاشتراكات وكروت الإنترنت وتركيب أجهزة الاتصال والصيانة والدعم الفني.',
  serviceArea: 'مديرية الشحر – اليمن',
  address: 'سوق شبام، فندق شبام، الشحر، اليمن',
  addressDisplay: 'سوق شبام، فندق شبام – الشحر – اليمن',
  copyright: 'جميع الحقوق محفوظة © بوابة الأمين للإنترنت',
} as const;

export const CONTACT_CONFIG = {
  phoneHref: 'tel:776220188',
  whatsappHref: 'https://wa.me/967776220188',
  emailHref: 'mailto:a2006maer@gmail.com',
  mapsHref:
    'https://www.google.com/maps/search/?api=1&query=' +
    encodeURIComponent('سوق شبام، فندق شبام، الشحر، اليمن'),
} as const;

export const NAV_ITEMS: NavItem[] = [
  { label: 'الرئيسية', path: '/' },
  { label: 'من نحن', path: '/about' },
  { label: 'خدماتنا', path: '/services' },
  { label: 'كروت الإنترنت', path: '/internet-cards' },
  { label: 'طلب خدمة', path: '/request' },
  { label: 'الدعم الفني', path: '/support' },
  { label: 'اتصل بنا', path: '/contact' },
];

export const FOOTER_SITE_LINKS: NavItem[] = [
  { label: 'الرئيسية', path: '/' },
  { label: 'من نحن', path: '/about' },
  { label: 'خدماتنا', path: '/services' },
  { label: 'كروت الإنترنت', path: '/internet-cards' },
];

export const FOOTER_CUSTOMER_LINKS: NavItem[] = [
  { label: 'طلب خدمة', path: '/request' },
  { label: 'الدعم الفني', path: '/support' },
  { label: 'اتصل بنا', path: '/contact' },
];

export const ABOUT_CONTENT = {
  title: 'من نحن؟',
  intro:
    'مرحبًا بكم في بوابة الأمين للإنترنت. هذه البوابة الإلكترونية تعرّف الزوار بخدمات شبكة الأمين وتسهّل الوصول إلى معلومات الاشتراكات ووسائل التواصل والدعم الفني.',
  visionTitle: 'رؤيتنا',
  visionText:
    'تقديم تجربة رقمية واضحة ومنظمة تساعد العملاء على التعرف على الخدمات والتواصل بسهولة.',
  missionTitle: 'رسالتنا',
  missionText:
    'توفير قناة إلكترونية لعرض الخدمات والباقات واستقبال الطلبات والاستفسارات ومتابعتها.',
  goalsTitle: 'أهداف البوابة',
  goals: [
    'التعريف بنشاط شبكة الأمين وخدماتها.',
    'عرض كروت الإنترنت والباقات المعتمدة.',
    'تسهيل استقبال طلبات الاشتراك والخدمات.',
    'تنظيم الاستفسارات وطلبات الدعم الفني.',
  ],
  footerNote:
    'نعمل على خدمة عملائنا في مديرية الشحر – اليمن، ومقر الشبكة في سوق شبام، فندق شبام – الشحر – اليمن.',
} as const;
