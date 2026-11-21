export interface DeviceItem {
  id: string;
  numberLabel: string;
  name: string;
  type: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  formCategory: 'أجهزة الراوتر والمودم (A)' | 'أجهزة الربط واللاقِطات (B)';
  formRouterValue?: string;
  formLinkValue?: string;
}

export const DEVICES: DeviceItem[] = [
  {
    id: 'device-01',
    numberLabel: 'جهاز 01',
    name: 'TP-Link',
    type: 'راوتر لاسلكي',
    description:
      'يدعم حسب الإصدار سرعات لاسلكية تبدأ من 300 ميجابت/ثانية وتصل إلى فئات أعلى، مع هوائيات خارجية ومنافذ WAN وLAN.',
    imageSrc: '/assets/devices/device-01.jpg',
    imageAlt: 'TP-Link راوتر لاسلكي',
    formCategory: 'أجهزة الراوتر والمودم (A)',
    formRouterValue: 'A1 – ONE (TP-Link)',
  },
  {
    id: 'device-02',
    numberLabel: 'جهاز 02',
    name: 'TOTOLINK',
    type: 'راوتر لاسلكي',
    description:
      'فئة مناسبة للاستخدام المنزلي، وتتوفر بإصدارات تدعم سرعة 300 ميجابت/ثانية وهوائيات خارجية وأوضاع تشغيل متعددة.',
    imageSrc: '/assets/devices/device-02.jpg',
    imageAlt: 'TOTOLINK راوتر لاسلكي',
    formCategory: 'أجهزة الراوتر والمودم (A)',
    formRouterValue: 'A2 – TWO (راوتر لاسلكي)',
  },
  {
    id: 'device-03',
    numberLabel: 'جهاز 03',
    name: 'KT',
    type: 'راوتر / مودم',
    description:
      'أجهزة لتوزيع الإنترنت داخل المنزل أو المكتب، مع منافذ إيثرنت وهوائيات خارجية؛ وتختلف السرعة والمنافذ حسب الإصدار.',
    imageSrc: '/assets/devices/device-03.jpg',
    imageAlt: 'KT راوتر مودم',
    formCategory: 'أجهزة الراوتر والمودم (A)',
    formRouterValue: 'A3 – THREE (مودم KT)',
  },
  {
    id: 'device-04',
    numberLabel: 'جهاز 04',
    name: 'LG',
    type: 'راوتر / مودم',
    description:
      'حل عملي لتوزيع الاتصال سلكيًا ولاسلكيًا، مع منافذ شبكة وخصائص حماية وإدارة تختلف بحسب الطراز.',
    imageSrc: '/assets/devices/device-04.jpg',
    imageAlt: 'LG راوتر مودم',
    formCategory: 'أجهزة الراوتر والمودم (A)',
    formRouterValue: 'A4 – FOUR (مودم LG)',
  },
  {
    id: 'device-05',
    numberLabel: 'جهاز 05',
    name: 'Ubiquiti NanoStation M2',
    type: 'جهاز ربط لاسلكي خارجي',
    description:
      'يعمل على نطاق 2.4 جيجاهرتز، ويُستخدم لربط الشبكات لاسلكيًا، ويدعم التغذية عبر كابل الشبكة PoE.',
    imageSrc: '/assets/devices/device-05.jpg',
    imageAlt: 'Ubiquiti NanoStation M2 جهاز ربط لاسلكي خارجي',
    formCategory: 'أجهزة الربط واللاقِطات (B)',
    formLinkValue: 'B1 – NanoStation',
  },
  {
    id: 'device-06',
    numberLabel: 'جهاز 06',
    name: 'Ubiquiti PowerBeam',
    type: 'لاقط / جهاز ربط بعيد المدى',
    description:
      'هوائي اتجاهي بطبق عاكس لتركيز الإشارة وربط المواقع البعيدة، ويعمل غالبًا على نطاق 5 جيجاهرتز بحسب الإصدار.',
    imageSrc: '/assets/devices/device-06.jpg',
    imageAlt: 'Ubiquiti PowerBeam لاقط بعيد المدى',
    formCategory: 'أجهزة الربط واللاقِطات (B)',
    formLinkValue: 'B2 – PowerBeam',
  },
  {
    id: 'device-07',
    numberLabel: 'جهاز 07',
    name: 'Ubiquiti LiteBeam M5',
    type: 'لاقط لاسلكي خارجي',
    description:
      'يعمل على نطاق 5 جيجاهرتز، وهوائي اتجاهي عالي الكسب للربط بين النقاط، مع دعم PoE ونظام airOS.',
    imageSrc: '/assets/devices/device-07.jpg',
    imageAlt: 'Ubiquiti LiteBeam M5 لاقط لاسلكي خارجي',
    formCategory: 'أجهزة الربط واللاقِطات (B)',
    formLinkValue: 'B3 – LiteBeam',
  },
  {
    id: 'device-08',
    numberLabel: 'جهاز 08',
    name: 'Ubiquiti NanoStation M5',
    type: 'جهاز ربط لاسلكي خارجي',
    description:
      'يعمل على نطاق 5 جيجاهرتز، بهوائي مدمج ومنافذ إيثرنت مع دعم PoE، ويُستخدم للربط بين النقاط.',
    imageSrc: '/assets/devices/device-08.jpg',
    imageAlt: 'Ubiquiti NanoStation M5 جهاز ربط لاسلكي خارجي',
    formCategory: 'أجهزة الربط واللاقِطات (B)',
    formLinkValue: 'B4 – NanoStation M5',
  },
];

export const DEVICES_NOTE =
  'ملاحظة: أرقام الأجهزة من 01 إلى 08 هي أرقام تعريفية داخل هذه القائمة وليست أرقام موديلات. وقد تختلف المواصفات الفعلية بحسب إصدار الجهاز وموديله.';
