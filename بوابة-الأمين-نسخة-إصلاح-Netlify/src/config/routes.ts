export type AppRoutePath =
  | '/'
  | '/about'
  | '/services'
  | '/internet-cards'
  | '/request'
  | '/support'
  | '/contact';

export const LEGACY_BLOGGER_ROUTE_MAP: Record<string, AppRoutePath> = {
  '/p/blog-page_18.html': '/about',
  '/p/blog-page_434.html': '/services',
  '/p/blog-page_395.html': '/internet-cards',
  '/p/blog-page_776.html': '/request',
  '/p/blog-page_579.html': '/support',
  '/p/blog-page_997.html': '/contact',
};

export interface RouteMeta {
  title: string;
  description: string;
}

export const ROUTE_META: Record<AppRoutePath, RouteMeta> = {
  '/': {
    title: 'بوابة الأمين للإنترنت | AL-AMEEN INTERNET PORTAL',
    description:
      'اتصال يربطك بالعالم. تعرف على خدمات شبكة الأمين للإنترنت اللاسلكي في مديرية الشحر، كروت الإنترنت، تركيب الأجهزة، الاشتراكات، والدعم الفني.',
  },
  '/about': {
    title: 'من نحن | بوابة الأمين للإنترنت',
    description:
      'تعرف على بوابة الأمين للإنترنت، رؤيتنا ورسالتنا وأهداف البوابة في خدمة مشتركي شبكة الأمين بمديرية الشحر – اليمن.',
  },
  '/services': {
    title: 'خدماتنا والأجهزة المتاحة | بوابة الأمين للإنترنت',
    description:
      'خدمات شبكة الأمين للإنترنت: تركيب راوتر أو جهاز، الدعم الفني، صيانة وإصلاح الأعطال، نقل الخدمة، ومعرض الأجهزة المتاحة للتركيب والربط.',
  },
  '/internet-cards': {
    title: 'كروت الإنترنت والباقات الشهرية | بوابة الأمين للإنترنت',
    description:
      'قائمة كروت الإنترنت المعتمدة (A1 إلى A6) والباقات الشهرية (الباقة الفضية والباقة الذهبية) مع إمكانية الطلب المباشر.',
  },
  '/request': {
    title: 'طلب خدمة أو اشتراك | بوابة الأمين للإنترنت',
    description:
      'اختر النموذج المناسب لتقديم طلب خدمة تركيب أو صيانة أو نقل خدمة، أو طلب اشتراك وكروت إنترنت من شبكة الأمين.',
  },
  '/support': {
    title: 'الدعم الفني | بوابة الأمين للإنترنت',
    description:
      'أرسل بلاغك الفني إلى فريق الدعم الفني في شبكة الأمين للإنترنت مع تحديد نوع الخدمة تلقائيًا.',
  },
  '/contact': {
    title: 'اتصل بنا | بوابة الأمين للإنترنت',
    description:
      'تواصل مع بوابة الأمين للإنترنت عبر الاتصال الهاتفي أو واتساب أو البريد الإلكتروني أو زيارة موقع الشبكة في الشحر.',
  },
};

export function resolveRoutePath(pathname: string): AppRoutePath {
  const normalized =
    pathname.length > 1 && pathname.endsWith('/')
      ? pathname.slice(0, -1)
      : pathname || '/';

  if (normalized in LEGACY_BLOGGER_ROUTE_MAP) {
    return LEGACY_BLOGGER_ROUTE_MAP[normalized];
  }

  if (normalized in ROUTE_META) {
    return normalized as AppRoutePath;
  }

  return '/';
}
