import {
  FORMS_CONFIG,
  getServiceFormUrl,
} from './forms.ts';
import type { AppRoutePath } from './routes.ts';
import { CONTACT_CONFIG } from './site.ts';

export type AssistantActionId =
  | 'page_home'
  | 'page_about'
  | 'page_services'
  | 'page_internet_cards'
  | 'page_request'
  | 'page_support'
  | 'page_contact'
  | 'form_services'
  | 'form_subscriptions'
  | 'form_install_device'
  | 'form_support'
  | 'form_maintenance'
  | 'form_transfer'
  | 'contact_phone'
  | 'contact_whatsapp'
  | 'contact_email'
  | 'contact_maps';

export type AssistantActionKind =
  | 'route'
  | 'external'
  | 'phone'
  | 'whatsapp'
  | 'email'
  | 'maps';

export interface AssistantActionDef {
  id: AssistantActionId;
  label: string;
  kind: AssistantActionKind;
  routePath?: AppRoutePath;
  href?: string;
}

export const ASSISTANT_ACTIONS: Record<AssistantActionId, AssistantActionDef> = {
  page_home: {
    id: 'page_home',
    label: 'الصفحة الرئيسية',
    kind: 'route',
    routePath: '/',
  },
  page_about: {
    id: 'page_about',
    label: 'صفحة من نحن',
    kind: 'route',
    routePath: '/about',
  },
  page_services: {
    id: 'page_services',
    label: 'خدماتنا والأجهزة المتاحة',
    kind: 'route',
    routePath: '/services',
  },
  page_internet_cards: {
    id: 'page_internet_cards',
    label: 'صفحة كروت الإنترنت والباقات',
    kind: 'route',
    routePath: '/internet-cards',
  },
  page_request: {
    id: 'page_request',
    label: 'صفحة طلب خدمة أو اشتراك',
    kind: 'route',
    routePath: '/request',
  },
  page_support: {
    id: 'page_support',
    label: 'صفحة الدعم الفني',
    kind: 'route',
    routePath: '/support',
  },
  page_contact: {
    id: 'page_contact',
    label: 'صفحة اتصل بنا',
    kind: 'route',
    routePath: '/contact',
  },
  form_services: {
    id: 'form_services',
    label: 'فتح نموذج طلب الخدمة',
    kind: 'external',
    href: FORMS_CONFIG.services.requestBaseUrl,
  },
  form_subscriptions: {
    id: 'form_subscriptions',
    label: 'فتح نموذج الاشتراكات والكروت',
    kind: 'external',
    href: FORMS_CONFIG.subscriptions.requestBaseUrl,
  },
  form_install_device: {
    id: 'form_install_device',
    label: 'نموذج طلب تركيب راوتر أو جهاز',
    kind: 'external',
    href: getServiceFormUrl('تركيب راوتر أو جهاز'),
  },
  form_support: {
    id: 'form_support',
    label: 'نموذج بلاغ الدعم الفني',
    kind: 'external',
    href: getServiceFormUrl('الدعم الفني'),
  },
  form_maintenance: {
    id: 'form_maintenance',
    label: 'نموذج صيانة وإصلاح الأعطال',
    kind: 'external',
    href: getServiceFormUrl('صيانة وإصلاح الأعطال'),
  },
  form_transfer: {
    id: 'form_transfer',
    label: 'نموذج طلب نقل الخدمة',
    kind: 'external',
    href: getServiceFormUrl('نقل الخدمة'),
  },
  contact_phone: {
    id: 'contact_phone',
    label: 'اتصال مباشر: 776220188',
    kind: 'phone',
    href: CONTACT_CONFIG.phoneHref,
  },
  contact_whatsapp: {
    id: 'contact_whatsapp',
    label: 'تواصل عبر واتساب',
    kind: 'whatsapp',
    href: CONTACT_CONFIG.whatsappHref,
  },
  contact_email: {
    id: 'contact_email',
    label: 'إرسال بريد إلكتروني',
    kind: 'email',
    href: CONTACT_CONFIG.emailHref,
  },
  contact_maps: {
    id: 'contact_maps',
    label: 'موقع الشبكة على الخرائط',
    kind: 'maps',
    href: CONTACT_CONFIG.mapsHref,
  },
};

export const VALID_ACTION_IDS = Object.keys(
  ASSISTANT_ACTIONS
) as AssistantActionId[];

export function isValidActionId(value: string): value is AssistantActionId {
  return Object.prototype.hasOwnProperty.call(ASSISTANT_ACTIONS, value);
}
