/**
 * Centralized Google Forms configuration and pre-fill URL builder.
 *
 * Verified live Google Forms inspection notes (tested against live form HTML):
 * 1) Services Form (entry.732587229):
 *    All 4 template values match the live Google Form options verbatim:
 *    - "تركيب راوتر أو جهاز"
 *    - "الدعم الفني"
 *    - "صيانة وإصلاح الأعطال"
 *    - "نقل الخدمة"
 *
 * 2) Subscriptions & Internet Cards Form:
 *    - Internet Cards field (entry.1172177438):
 *      Template values: "A1 – 100 ريال – 450 MB" ... "A6 – 1,500 ريال – 8,000 MB"
 *      Live Google Form options observed:
 *        "A1 – كرت 100 ريال | 450 MB"
 *        "A2 – كرت 200 ريال | 900 MB"
 *        "A3 – كرت 300 ريال | 1,300 MB"
 *        "A4 – كرت 500 ريال | 2,500 MB"
 *        "A5 – كرت 1,000 ريال | 5,000 MB"
 *        "A6 – كرت 1,500 ريال | 8,000 MB"
 *      (Note: entry.1172177438 is inside a conditional section opened by entry.1507827862 = "شراء كروت الانترنت")
 *
 *    - Monthly Packages field (entry.1816208247):
 *      Silver template value: "الفضية – 6,000 ريال – 35 GB" (matches live form verbatim)
 *      Gold template value:   "الذهبية – 13,000 ريال – 100 GB"
 *      Live Google Form option observed for Gold: "هبية – 13,000 ريال – 100 GB"
 *      (Note: entry.1816208247 is inside a conditional section opened by entry.1507827862 = "اشتراك جديد")
 *
 * Template values below are preserved verbatim as configured in the original template
 * and can be updated from this single file without touching any UI component.
 */

export const FORMS_CONFIG = {
  services: {
    baseUrl:
      'https://docs.google.com/forms/d/e/1FAIpQLScUmDGOfYqHZHJpUxHdYwpTwwRpu3id7FJNxysAp-tAY0QbVg/viewform',
    requestBaseUrl:
      'https://docs.google.com/forms/d/e/1FAIpQLScUmDGOfYqHZHJpUxHdYwpTwwRpu3id7FJNxysAp-tAY0QbVg/viewform?usp=header',
    entryId: 'entry.732587229',
  },
  subscriptions: {
    baseUrl:
      'https://docs.google.com/forms/d/e/1FAIpQLSdz5N0ArEtphfo7eWiYw5DLINskTDuepwHdm5ldOmu8M7BE8w/viewform',
    requestBaseUrl:
      'https://docs.google.com/forms/d/e/1FAIpQLSdz5N0ArEtphfo7eWiYw5DLINskTDuepwHdm5ldOmu8M7BE8w/viewform?usp=dialog',
    cardsEntryId: 'entry.1172177438',
    packagesEntryId: 'entry.1816208247',
  },
} as const;

export function buildPrefilledFormUrl(
  baseUrl: string,
  params: Record<string, string>
): string {
  const url = new URL(baseUrl);
  url.searchParams.set('usp', 'pp_url');
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return url.toString();
}

export interface ServiceOption {
  id: string;
  icon: string;
  title: string;
  description: string;
  actionLabel: string;
  formValue: string;
}

export const SERVICE_OPTIONS: ServiceOption[] = [
  {
    id: 'install-device',
    icon: '📡',
    title: 'تركيب راوتر أو جهاز',
    description: 'تركيب وتجهيز أجهزة الاتصال',
    actionLabel: 'طلب هذه الخدمة',
    formValue: 'تركيب راوتر أو جهاز',
  },
  {
    id: 'technical-support',
    icon: '🛠️',
    title: 'الدعم الفني',
    description: 'إرسال طلب مساعدة فنية',
    actionLabel: 'طلب هذه الخدمة',
    formValue: 'الدعم الفني',
  },
  {
    id: 'maintenance',
    icon: '🔧',
    title: 'صيانة وإصلاح الأعطال',
    description: 'الإبلاغ عن الأعطال وطلب الصيانة',
    actionLabel: 'طلب هذه الخدمة',
    formValue: 'صيانة وإصلاح الأعطال',
  },
  {
    id: 'transfer-service',
    icon: '🔄',
    title: 'نقل الخدمة',
    description: 'طلب نقل خدمة الإنترنت',
    actionLabel: 'طلب هذه الخدمة',
    formValue: 'نقل الخدمة',
  },
];

export interface InternetCardOption {
  id: string;
  code: string;
  title: string;
  price: string;
  capacity: string;
  formValue: string;
  liveFormValue: string;
}

export const INTERNET_CARDS: InternetCardOption[] = [
  {
    id: 'a1',
    code: 'A1',
    title: 'كرت A1',
    price: '100 ريال',
    capacity: '450 MB',
    formValue: 'A1 – 100 ريال – 450 MB',
    liveFormValue: 'A1 – كرت 100 ريال | 450 MB',
  },
  {
    id: 'a2',
    code: 'A2',
    title: 'كرت A2',
    price: '200 ريال',
    capacity: '900 MB',
    formValue: 'A2 – 200 ريال – 900 MB',
    liveFormValue: 'A2 – كرت 200 ريال | 900 MB',
  },
  {
    id: 'a3',
    code: 'A3',
    title: 'كرت A3',
    price: '300 ريال',
    capacity: '1,300 MB',
    formValue: 'A3 – 300 ريال – 1,300 MB',
    liveFormValue: 'A3 – كرت 300 ريال | 1,300 MB',
  },
  {
    id: 'a4',
    code: 'A4',
    title: 'كرت A4',
    price: '500 ريال',
    capacity: '2,500 MB',
    formValue: 'A4 – 500 ريال – 2,500 MB',
    liveFormValue: 'A4 – كرت 500 ريال | 2,500 MB',
  },
  {
    id: 'a5',
    code: 'A5',
    title: 'كرت A5',
    price: '1,000 ريال',
    capacity: '5,000 MB',
    formValue: 'A5 – 1,000 ريال – 5,000 MB',
    liveFormValue: 'A5 – كرت 1,000 ريال | 5,000 MB',
  },
  {
    id: 'a6',
    code: 'A6',
    title: 'كرت A6',
    price: '1,500 ريال',
    capacity: '8,000 MB',
    formValue: 'A6 – 1,500 ريال – 8,000 MB',
    liveFormValue: 'A6 – كرت 1,500 ريال | 8,000 MB',
  },
];

export interface MonthlyPackageOption {
  id: string;
  tier: 'silver' | 'gold';
  title: string;
  price: string;
  capacity: string;
  formValue: string;
  liveFormValue: string;
}

export const MONTHLY_PACKAGES: MonthlyPackageOption[] = [
  {
    id: 'silver',
    tier: 'silver',
    title: 'الباقة الفضية',
    price: '6,000 ريال',
    capacity: '35 GB',
    formValue: 'الفضية – 6,000 ريال – 35 GB',
    liveFormValue: 'الفضية – 6,000 ريال – 35 GB',
  },
  {
    id: 'gold',
    tier: 'gold',
    title: 'الباقة الذهبية',
    price: '13,000 ريال',
    capacity: '100 GB',
    formValue: 'الذهبية – 13,000 ريال – 100 GB',
    liveFormValue: 'هبية – 13,000 ريال – 100 GB',
  },
];

export function getServiceFormUrl(serviceValue: string): string {
  return buildPrefilledFormUrl(FORMS_CONFIG.services.baseUrl, {
    [FORMS_CONFIG.services.entryId]: serviceValue,
  });
}

export function getInternetCardFormUrl(cardValue: string): string {
  return buildPrefilledFormUrl(FORMS_CONFIG.subscriptions.baseUrl, {
    [FORMS_CONFIG.subscriptions.cardsEntryId]: cardValue,
  });
}

export function getMonthlyPackageFormUrl(packageValue: string): string {
  return buildPrefilledFormUrl(FORMS_CONFIG.subscriptions.baseUrl, {
    [FORMS_CONFIG.subscriptions.packagesEntryId]: packageValue,
  });
}

/**
 * Verified live entry IDs from the official Services Google Form
 * (1FAIpQLScUmDGOfYqHZHJpUxHdYwpTwwRpu3id7FJNxysAp-tAY0QbVg).
 * Only verified existing fields are included; no fabricated fields are added.
 */
export const SERVICES_FORM_VERIFIED_FIELDS = {
  fullNameEntryId: 'entry.612735033',
  phoneEntryId: 'entry.364429610',
  districtEntryId: 'entry.620603874',
  subscriberStatusEntryId: 'entry.1150219863',
  serviceTypeEntryId: 'entry.732587229',
  installCategoryEntryId: 'entry.1139417081',
  installRouterModelEntryId: 'entry.1543011072',
  installLinkDeviceEntryId: 'entry.857648292',
  supportProblemTypeEntryId: 'entry.1471444053',
  supportDetailsEntryId: 'entry.1635872221',
  maintenanceDeviceCategoryEntryId: 'entry.1926384027',
  maintenanceDeviceNameEntryId: 'entry.311862840',
  maintenanceDetailsEntryId: 'entry.860381899',
  transferRegisteredPhoneEntryId: 'entry.339859566',
  transferCurrentDistrictEntryId: 'entry.1628877413',
  transferNewDistrictEntryId: 'entry.2109955668',
  transferReasonEntryId: 'entry.540672525',
} as const;

export const SERVICES_FORM_ENUMS = {
  serviceTypes: [
    'تركيب راوتر أو جهاز',
    'الدعم الفني',
    'صيانة وإصلاح الأعطال',
    'نقل الخدمة',
  ] as const,
  subscriberStatuses: [
    'نعم، لدي اشتراك حالي.',
    'لا، أريد الاشتراك لأول مرة.',
    'كنت مشتركاً سابقاً.',
  ] as const,
  deviceCategories: [
    'أجهزة الراوتر والمودم (A)',
    'أجهزة الربط واللاقِطات (B)',
  ] as const,
  routerDevices: [
    'A1 – ONE (TP-Link)',
    'A2 – TWO (راوتر لاسلكي)',
    'A3 – THREE (مودم KT)',
    'A4 – FOUR (مودم LG)',
  ] as const,
  linkDevices: [
    'B1 – NanoStation',
    'B2 – PowerBeam',
    'B3 – LiteBeam',
    'B4 – NanoStation M5',
  ] as const,
  supportProblems: [
    'انقطاع الإنترنت بالكامل.',
    'بطء سرعة الإنترنت.',
    'ضعف إشارة الواي فاي.',
    'عدم القدرة على الاتصال بالشبكة.',
    'مشكلة في الراوتر أو المودم.',
    'مشكلة أخرى.',
  ] as const,
} as const;

export type OfficialServiceType =
  (typeof SERVICES_FORM_ENUMS.serviceTypes)[number];

export interface VoiceServiceDraft {
  serviceType?: OfficialServiceType | '';
  fullName?: string;
  phone?: string;
  district?: string;
  subscriberStatus?: string;
  deviceCategory?: string;
  routerDevice?: string;
  linkDevice?: string;
  supportProblemType?: string;
  details?: string;
  maintenanceDeviceName?: string;
  currentDistrict?: string;
  newDistrict?: string;
}

export function buildVoiceServiceFormUrl(draft: VoiceServiceDraft): string {
  const params: Record<string, string> = {};
  const f = SERVICES_FORM_VERIFIED_FIELDS;

  if (draft.fullName?.trim()) params[f.fullNameEntryId] = draft.fullName.trim();
  if (draft.phone?.trim()) params[f.phoneEntryId] = draft.phone.trim();
  if (draft.district?.trim()) params[f.districtEntryId] = draft.district.trim();
  if (draft.subscriberStatus?.trim()) {
    params[f.subscriberStatusEntryId] = draft.subscriberStatus.trim();
  }

  if (draft.serviceType?.trim()) {
    params[f.serviceTypeEntryId] = draft.serviceType.trim();
  }

  if (draft.serviceType === 'تركيب راوتر أو جهاز') {
    if (draft.deviceCategory?.trim()) {
      params[f.installCategoryEntryId] = draft.deviceCategory.trim();
    }
    if (draft.routerDevice?.trim()) {
      params[f.installRouterModelEntryId] = draft.routerDevice.trim();
    }
    if (draft.linkDevice?.trim()) {
      params[f.installLinkDeviceEntryId] = draft.linkDevice.trim();
    }
  } else if (draft.serviceType === 'الدعم الفني') {
    if (draft.supportProblemType?.trim()) {
      params[f.supportProblemTypeEntryId] = draft.supportProblemType.trim();
    }
    if (draft.details?.trim()) {
      params[f.supportDetailsEntryId] = draft.details.trim();
    }
  } else if (draft.serviceType === 'صيانة وإصلاح الأعطال') {
    if (draft.deviceCategory?.trim()) {
      params[f.maintenanceDeviceCategoryEntryId] = draft.deviceCategory.trim();
    }
    if (draft.maintenanceDeviceName?.trim()) {
      params[f.maintenanceDeviceNameEntryId] =
        draft.maintenanceDeviceName.trim();
    }
    if (draft.details?.trim()) {
      params[f.maintenanceDetailsEntryId] = draft.details.trim();
    }
  } else if (draft.serviceType === 'نقل الخدمة') {
    if (draft.phone?.trim()) {
      params[f.transferRegisteredPhoneEntryId] = draft.phone.trim();
    }
    if (draft.currentDistrict?.trim() || draft.district?.trim()) {
      params[f.transferCurrentDistrictEntryId] = (
        draft.currentDistrict ||
        draft.district ||
        ''
      ).trim();
    }
    if (draft.newDistrict?.trim()) {
      params[f.transferNewDistrictEntryId] = draft.newDistrict.trim();
    }
    if (draft.details?.trim()) {
      params[f.transferReasonEntryId] = draft.details.trim();
    }
  }

  return buildPrefilledFormUrl(FORMS_CONFIG.services.baseUrl, params);
}

