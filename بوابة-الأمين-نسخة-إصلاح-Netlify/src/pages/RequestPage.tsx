import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowUpLeft,
  Check,
  CheckCircle2,
  ClipboardList,
  Copy,
  Edit3,
  Mic,
  Ticket,
} from 'lucide-react';
import { DEVICES } from '../config/devices';
import {
  FORMS_CONFIG,
  INTERNET_CARDS,
  MONTHLY_PACKAGES,
  SERVICE_OPTIONS,
  SERVICES_FORM_ENUMS,
  buildVoiceServiceFormUrl,
  getInternetCardFormUrl,
  getMonthlyPackageFormUrl,
  getServiceFormUrl,
  type OfficialServiceType,
} from '../config/forms';
import { AppLink, useRouter } from '../context/RouterContext';
import { useVoiceRequest } from '../context/VoiceRequestContext';
import { PageHero } from '../components/PageHero';
import { Reveal } from '../components/Reveal';

type BuilderTab = 'service' | 'subscription';
type SubChoiceType = 'card' | 'package';

interface FormErrors {
  fullName?: string;
  phone?: string;
  district?: string;
  currentDistrict?: string;
  newDistrict?: string;
}

export function RequestPage() {
  const { currentSearch } = useRouter();
  const { openVoiceModal } = useVoiceRequest();

  const [activeTab, setActiveTab] = useState<BuilderTab>('service');

  // Service Builder State
  const [serviceType, setServiceType] = useState<OfficialServiceType>(
    'تركيب راوتر أو جهاز'
  );
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [district, setDistrict] = useState('');
  const [subscriberStatus, setSubscriberStatus] = useState<string>(
    SERVICES_FORM_ENUMS.subscriberStatuses[0]
  );
  const [deviceCategory, setDeviceCategory] = useState<string>(
    SERVICES_FORM_ENUMS.deviceCategories[0]
  );
  const [routerDevice, setRouterDevice] = useState<string>(
    SERVICES_FORM_ENUMS.routerDevices[0]
  );
  const [linkDevice, setLinkDevice] = useState<string>(
    SERVICES_FORM_ENUMS.linkDevices[0]
  );
  const [supportProblemType, setSupportProblemType] = useState<string>(
    SERVICES_FORM_ENUMS.supportProblems[0]
  );
  const [maintenanceDeviceName, setMaintenanceDeviceName] = useState('');
  const [currentDistrict, setCurrentDistrict] = useState('');
  const [newDistrict, setNewDistrict] = useState('');
  const [details, setDetails] = useState('');

  // Subscription Builder State
  const [subType, setSubType] = useState<SubChoiceType>('card');
  const [selectedCardId, setSelectedCardId] = useState<string>('a4');
  const [selectedPackageId, setSelectedPackageId] = useState<string>('silver');

  // Validation & Confirmation UI State
  const [errors, setErrors] = useState<FormErrors>({});
  const [confirmedSummary, setConfirmedSummary] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);

  // Sync deep link parameters (?tab=...&service=...&device=...&card=...&package=...)
  useEffect(() => {
    const params = new URLSearchParams(currentSearch);
    const tabParam = params.get('tab');
    const serviceParam = params.get('service');
    const deviceParam = params.get('device');
    const cardParam = params.get('card');
    const packageParam = params.get('package');

    if (tabParam === 'subscription' || cardParam || packageParam) {
      setActiveTab('subscription');
      if (cardParam && INTERNET_CARDS.some((c) => c.id === cardParam)) {
        setSubType('card');
        setSelectedCardId(cardParam);
      } else if (
        packageParam &&
        MONTHLY_PACKAGES.some((p) => p.id === packageParam)
      ) {
        setSubType('package');
        setSelectedPackageId(packageParam);
      }
      setConfirmedSummary(false);
      return;
    }

    if (tabParam === 'service' || serviceParam || deviceParam) {
      setActiveTab('service');
      if (
        serviceParam &&
        SERVICES_FORM_ENUMS.serviceTypes.includes(
          serviceParam as OfficialServiceType
        )
      ) {
        setServiceType(serviceParam as OfficialServiceType);
      }
      if (deviceParam) {
        const matched = DEVICES.find((d) => d.id === deviceParam);
        if (matched) {
          setServiceType('تركيب راوتر أو جهاز');
          setDeviceCategory(matched.formCategory);
          if (matched.formRouterValue) setRouterDevice(matched.formRouterValue);
          if (matched.formLinkValue) setLinkDevice(matched.formLinkValue);
        }
      }
      setConfirmedSummary(false);
    }
  }, [currentSearch]);

  const selectedCard = useMemo(
    () =>
      INTERNET_CARDS.find((c) => c.id === selectedCardId) ?? INTERNET_CARDS[0],
    [selectedCardId]
  );

  const selectedPackage = useMemo(
    () =>
      MONTHLY_PACKAGES.find((p) => p.id === selectedPackageId) ??
      MONTHLY_PACKAGES[0],
    [selectedPackageId]
  );

  const generatedServiceUrl = useMemo(() => {
    return buildVoiceServiceFormUrl({
      serviceType,
      fullName,
      phone,
      district: serviceType === 'نقل الخدمة' ? currentDistrict : district,
      subscriberStatus,
      deviceCategory:
        serviceType === 'تركيب راوتر أو جهاز' ||
        serviceType === 'صيانة وإصلاح الأعطال'
          ? deviceCategory
          : undefined,
      routerDevice:
        serviceType === 'تركيب راوتر أو جهاز' &&
        deviceCategory === SERVICES_FORM_ENUMS.deviceCategories[0]
          ? routerDevice
          : undefined,
      linkDevice:
        serviceType === 'تركيب راوتر أو جهاز' &&
        deviceCategory === SERVICES_FORM_ENUMS.deviceCategories[1]
          ? linkDevice
          : undefined,
      supportProblemType:
        serviceType === 'الدعم الفني' ? supportProblemType : undefined,
      maintenanceDeviceName:
        serviceType === 'صيانة وإصلاح الأعطال'
          ? maintenanceDeviceName
          : undefined,
      currentDistrict: serviceType === 'نقل الخدمة' ? currentDistrict : undefined,
      newDistrict: serviceType === 'نقل الخدمة' ? newDistrict : undefined,
      details,
    });
  }, [
    serviceType,
    fullName,
    phone,
    district,
    subscriberStatus,
    deviceCategory,
    routerDevice,
    linkDevice,
    supportProblemType,
    maintenanceDeviceName,
    currentDistrict,
    newDistrict,
    details,
  ]);

  const generatedSubscriptionUrl = useMemo(() => {
    return subType === 'card'
      ? getInternetCardFormUrl(selectedCard.formValue)
      : getMonthlyPackageFormUrl(selectedPackage.formValue);
  }, [subType, selectedCard, selectedPackage]);

  const validateServiceForm = (): boolean => {
    const nextErrors: FormErrors = {};
    if (fullName.trim().length < 2) {
      nextErrors.fullName = 'يرجى إدخال الاسم الكامل (حرفين على الأقل).';
    }
    const digitsOnly = phone.replace(/[\s+\-()]/g, '');
    if (!digitsOnly || !/^\d{7,15}$/.test(digitsOnly)) {
      nextErrors.phone = 'يرجى إدخال رقم هاتف صحيح (من 7 إلى 15 رقمًا).';
    }
    if (serviceType === 'نقل الخدمة') {
      if (currentDistrict.trim().length < 2) {
        nextErrors.currentDistrict = 'يرجى كتابة الحي أو المنطقة الحالية.';
      }
      if (newDistrict.trim().length < 2) {
        nextErrors.newDistrict = 'يرجى كتابة الحي أو المنطقة الجديدة.';
      }
    } else if (district.trim().length < 2) {
      nextErrors.district = 'يرجى إدخال الحي أو المنطقة السكنية.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handlePrepareRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'service') {
      if (!validateServiceForm()) {
        setConfirmedSummary(false);
        return;
      }
    }
    setErrors({});
    setConfirmedSummary(true);
  };

  const buildPlainSummaryText = (): string => {
    if (activeTab === 'subscription') {
      return subType === 'card'
        ? `طلب اشتراك: ${selectedCard.title} (${selectedCard.capacity} - ${selectedCard.price})`
        : `طلب اشتراك شهري: ${selectedPackage.title} (${selectedPackage.capacity} - ${selectedPackage.price})`;
    }
    const lines = [
      `نوع الخدمة: ${serviceType}`,
      `الاسم: ${fullName.trim()}`,
      `الهاتف: ${phone.trim()}`,
      serviceType === 'نقل الخدمة'
        ? `من: ${currentDistrict.trim()} -> إلى: ${newDistrict.trim()}`
        : `المنطقة: ${district.trim()}`,
    ];
    if (serviceType === 'تركيب راوتر أو جهاز') {
      lines.push(
        `الجهاز: ${
          deviceCategory === SERVICES_FORM_ENUMS.deviceCategories[0]
            ? routerDevice
            : linkDevice
        }`
      );
    } else if (serviceType === 'الدعم الفني') {
      lines.push(`المشكلة: ${supportProblemType}`);
    } else if (
      serviceType === 'صيانة وإصلاح الأعطال' &&
      maintenanceDeviceName.trim()
    ) {
      lines.push(`اسم الجهاز: ${maintenanceDeviceName.trim()}`);
    }
    if (details.trim()) lines.push(`تفاصيل إضافية: ${details.trim()}`);
    return lines.join('\n');
  };

  const handleCopySummary = async () => {
    try {
      await navigator.clipboard.writeText(buildPlainSummaryText());
      setCopiedSummary(true);
      window.setTimeout(() => setCopiedSummary(false), 2200);
    } catch {
      // Clipboard blocked in restricted browser contexts
    }
  };

  return (
    <div>
      <PageHero
        eyebrow="الطلبات الإلكترونية"
        title="طلب خدمة أو اشتراك"
        description="جهّز طلبك تفاعليًا داخل البوابة أو افتح نماذج Google الرسمية مباشرة."
        breadcrumbLabel="طلب خدمة"
      />

      <section className="py-14 sm:py-20 bg-white">
        <div className="w-[92%] max-w-[1080px] mx-auto space-y-10">
          {/* Voice Service Banner */}
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 text-center sm:text-right">
              <div
                aria-hidden="true"
                className="w-12 h-12 rounded-2xl bg-[#07182E] border border-[#32C5E8]/40 text-[#32C5E8] flex items-center justify-center shrink-0"
              >
                <Mic className="w-6 h-6" strokeWidth={1.9} />
              </div>
              <div>
                <h2 className="font-display text-base sm:text-lg font-extrabold text-[#07182E] m-0">
                  اطلب خدمتك بصوتك
                </h2>
                <p className="text-xs sm:text-sm text-[#5A6B7F] m-0 mt-0.5">
                  تحدث بصوتك باللغة العربية وسنجهّز طلبك ونملأ نموذج الخدمة لك تلقائيًا.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={openVoiceModal}
              className="w-full sm:w-auto min-h-[46px] inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl text-sm font-bold text-[#07182E] shadow-[0_8px_22px_rgba(50,197,232,0.25)] hover:brightness-105 active:scale-[0.98] transition-all whitespace-nowrap shrink-0"
              style={{
                background: 'linear-gradient(135deg, #32C5E8 0%, #86E6FC 100%)',
              }}
            >
              <Mic className="w-4 h-4" />
              <span>اطلب خدمتك بصوتك</span>
            </button>
          </div>

          {/* Interactive Guided Request Builder */}
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-3xl p-6 sm:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#E2E8F0]">
              <div>
                <p className="text-[#0EA5E9] font-bold text-xs tracking-wide mb-1 m-0">
                  منشئ الطلب التفاعلي
                </p>
                <h2 className="font-display text-xl sm:text-2xl font-black text-[#071426] m-0">
                  جهّز بيانات طلبك قبل الإرسال
                </h2>
              </div>

              <div
                role="tablist"
                aria-label="نوع الطلب"
                className="inline-flex items-center gap-1 p-1 bg-white border border-[#E2E8F0] rounded-xl self-start"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'service'}
                  onClick={() => {
                    setActiveTab('service');
                    setConfirmedSummary(false);
                  }}
                  className={`min-h-[40px] px-4 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                    activeTab === 'service'
                      ? 'bg-[#071426] text-[#22D3EE]'
                      : 'text-[#475569] hover:text-[#071426]'
                  }`}
                >
                  طلب خدمة (تركيب / صيانة / دعم)
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'subscription'}
                  onClick={() => {
                    setActiveTab('subscription');
                    setConfirmedSummary(false);
                  }}
                  className={`min-h-[40px] px-4 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                    activeTab === 'subscription'
                      ? 'bg-[#071426] text-[#22D3EE]'
                      : 'text-[#475569] hover:text-[#071426]'
                  }`}
                >
                  اشتراك أو كروت إنترنت
                </button>
              </div>
            </div>

            <form onSubmit={handlePrepareRequest} noValidate className="pt-6 space-y-6">
              {activeTab === 'service' ? (
                <>
                  {/* Step 1: Service Type */}
                  <div>
                    <label className="block text-xs font-extrabold text-[#071426] mb-2.5">
                      1. اختر نوع الخدمة المطلوبة
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {SERVICES_FORM_ENUMS.serviceTypes.map((st) => {
                        const isSelected = serviceType === st;
                        return (
                          <button
                            key={st}
                            type="button"
                            onClick={() => {
                              setServiceType(st);
                              setConfirmedSummary(false);
                            }}
                            className={`text-right p-4 rounded-xl border text-xs font-bold transition-all focus-visible:outline-2 focus-visible:outline-[#0EA5E9] ${
                              isSelected
                                ? 'bg-[#071426] text-white border-[#071426] shadow-sm'
                                : 'bg-white text-[#071426] border-[#E2E8F0] hover:border-[#0EA5E9]'
                            }`}
                          >
                            <span
                              className={`block text-[10px] mb-1 ${
                                isSelected ? 'text-[#22D3EE]' : 'text-[#64748B]'
                              }`}
                            >
                              {isSelected ? 'مختارة حاليًا' : 'اضغط للاختيار'}
                            </span>
                            <span>{st}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Step 2: Customer Core Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="req-fullname"
                        className="block text-xs font-bold text-[#071426] mb-1.5"
                      >
                        الاسم الكامل <span className="text-[#DC2626]">*</span>
                      </label>
                      <input
                        id="req-fullname"
                        type="text"
                        value={fullName}
                        onChange={(e) => {
                          setFullName(e.target.value);
                          if (errors.fullName) {
                            setErrors((p) => ({ ...p, fullName: undefined }));
                          }
                        }}
                        placeholder="أدخل اسمك الكامل"
                        className={`w-full min-h-[44px] rounded-xl bg-white border px-3.5 text-sm text-[#071426] focus:outline-none ${
                          errors.fullName
                            ? 'border-[#DC2626]'
                            : 'border-[#E2E8F0] focus:border-[#0EA5E9]'
                        }`}
                      />
                      {errors.fullName && (
                        <p className="mt-1 text-[11px] font-bold text-[#DC2626] flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{errors.fullName}</span>
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="req-phone"
                        className="block text-xs font-bold text-[#071426] mb-1.5"
                      >
                        رقم الهاتف للتواصل <span className="text-[#DC2626]">*</span>
                      </label>
                      <input
                        id="req-phone"
                        type="tel"
                        dir="ltr"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          if (errors.phone) {
                            setErrors((p) => ({ ...p, phone: undefined }));
                          }
                        }}
                        placeholder="77xxxxxxx"
                        className={`w-full min-h-[44px] rounded-xl bg-white border px-3.5 text-sm text-[#071426] text-right tabular-nums focus:outline-none ${
                          errors.phone
                            ? 'border-[#DC2626]'
                            : 'border-[#E2E8F0] focus:border-[#0EA5E9]'
                        }`}
                      />
                      {errors.phone && (
                        <p className="mt-1 text-[11px] font-bold text-[#DC2626] flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{errors.phone}</span>
                        </p>
                      )}
                    </div>

                    {serviceType === 'نقل الخدمة' ? (
                      <>
                        <div>
                          <label
                            htmlFor="req-curr-district"
                            className="block text-xs font-bold text-[#071426] mb-1.5"
                          >
                            المنطقة / الحي الحالي{' '}
                            <span className="text-[#DC2626]">*</span>
                          </label>
                          <input
                            id="req-curr-district"
                            type="text"
                            value={currentDistrict}
                            onChange={(e) => {
                              setCurrentDistrict(e.target.value);
                              if (errors.currentDistrict) {
                                setErrors((p) => ({
                                  ...p,
                                  currentDistrict: undefined,
                                }));
                              }
                            }}
                            placeholder="مثال: الشحر - السوق"
                            className={`w-full min-h-[44px] rounded-xl bg-white border px-3.5 text-sm text-[#071426] focus:outline-none ${
                              errors.currentDistrict
                                ? 'border-[#DC2626]'
                                : 'border-[#E2E8F0] focus:border-[#0EA5E9]'
                            }`}
                          />
                          {errors.currentDistrict && (
                            <p className="mt-1 text-[11px] font-bold text-[#DC2626] flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                              <span>{errors.currentDistrict}</span>
                            </p>
                          )}
                        </div>
                        <div>
                          <label
                            htmlFor="req-new-district"
                            className="block text-xs font-bold text-[#071426] mb-1.5"
                          >
                            المنطقة / الحي الجديد{' '}
                            <span className="text-[#DC2626]">*</span>
                          </label>
                          <input
                            id="req-new-district"
                            type="text"
                            value={newDistrict}
                            onChange={(e) => {
                              setNewDistrict(e.target.value);
                              if (errors.newDistrict) {
                                setErrors((p) => ({
                                  ...p,
                                  newDistrict: undefined,
                                }));
                              }
                            }}
                            placeholder="مثال: المنصورة"
                            className={`w-full min-h-[44px] rounded-xl bg-white border px-3.5 text-sm text-[#071426] focus:outline-none ${
                              errors.newDistrict
                                ? 'border-[#DC2626]'
                                : 'border-[#E2E8F0] focus:border-[#0EA5E9]'
                            }`}
                          />
                          {errors.newDistrict && (
                            <p className="mt-1 text-[11px] font-bold text-[#DC2626] flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                              <span>{errors.newDistrict}</span>
                            </p>
                          )}
                        </div>
                      </>
                    ) : (
                      <div>
                        <label
                          htmlFor="req-district"
                          className="block text-xs font-bold text-[#071426] mb-1.5"
                        >
                          المنطقة أو الحي <span className="text-[#DC2626]">*</span>
                        </label>
                        <input
                          id="req-district"
                          type="text"
                          value={district}
                          onChange={(e) => {
                            setDistrict(e.target.value);
                            if (errors.district) {
                              setErrors((p) => ({ ...p, district: undefined }));
                            }
                          }}
                          placeholder="مثال: الشحر – حي المنصورة"
                          className={`w-full min-h-[44px] rounded-xl bg-white border px-3.5 text-sm text-[#071426] focus:outline-none ${
                            errors.district
                              ? 'border-[#DC2626]'
                              : 'border-[#E2E8F0] focus:border-[#0EA5E9]'
                          }`}
                        />
                        {errors.district && (
                          <p className="mt-1 text-[11px] font-bold text-[#DC2626] flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>{errors.district}</span>
                          </p>
                        )}
                      </div>
                    )}

                    <div>
                      <label
                        htmlFor="req-sub-status"
                        className="block text-xs font-bold text-[#071426] mb-1.5"
                      >
                        حالة الاشتراك الحالية
                      </label>
                      <select
                        id="req-sub-status"
                        value={subscriberStatus}
                        onChange={(e) => setSubscriberStatus(e.target.value)}
                        className="w-full min-h-[44px] rounded-xl bg-white border border-[#E2E8F0] px-3.5 text-xs font-bold text-[#071426] focus:outline-none focus:border-[#0EA5E9]"
                      >
                        {SERVICES_FORM_ENUMS.subscriberStatuses.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Step 3: Conditional Fields per Service Type */}
                  {serviceType === 'تركيب راوتر أو جهاز' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#E2E8F0]">
                      <div>
                        <label
                          htmlFor="req-dev-cat"
                          className="block text-xs font-bold text-[#071426] mb-1.5"
                        >
                          فئة الجهاز المطلوب
                        </label>
                        <select
                          id="req-dev-cat"
                          value={deviceCategory}
                          onChange={(e) => setDeviceCategory(e.target.value)}
                          className="w-full min-h-[44px] rounded-xl bg-white border border-[#E2E8F0] px-3.5 text-xs font-bold text-[#071426] focus:outline-none focus:border-[#0EA5E9]"
                        >
                          {SERVICES_FORM_ENUMS.deviceCategories.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>

                      {deviceCategory ===
                      SERVICES_FORM_ENUMS.deviceCategories[0] ? (
                        <div>
                          <label
                            htmlFor="req-router-model"
                            className="block text-xs font-bold text-[#071426] mb-1.5"
                          >
                            موديل الراوتر / المودم (A)
                          </label>
                          <select
                            id="req-router-model"
                            value={routerDevice}
                            onChange={(e) => setRouterDevice(e.target.value)}
                            className="w-full min-h-[44px] rounded-xl bg-white border border-[#E2E8F0] px-3.5 text-xs font-bold text-[#071426] focus:outline-none focus:border-[#0EA5E9]"
                          >
                            {SERVICES_FORM_ENUMS.routerDevices.map((dev) => (
                              <option key={dev} value={dev}>
                                {dev}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <div>
                          <label
                            htmlFor="req-link-model"
                            className="block text-xs font-bold text-[#071426] mb-1.5"
                          >
                            جهاز الربط واللاقط (B)
                          </label>
                          <select
                            id="req-link-model"
                            value={linkDevice}
                            onChange={(e) => setLinkDevice(e.target.value)}
                            className="w-full min-h-[44px] rounded-xl bg-white border border-[#E2E8F0] px-3.5 text-xs font-bold text-[#071426] focus:outline-none focus:border-[#0EA5E9]"
                          >
                            {SERVICES_FORM_ENUMS.linkDevices.map((dev) => (
                              <option key={dev} value={dev}>
                                {dev}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  )}

                  {serviceType === 'الدعم الفني' && (
                    <div className="pt-2 border-t border-[#E2E8F0]">
                      <label
                        htmlFor="req-support-problem"
                        className="block text-xs font-bold text-[#071426] mb-1.5"
                      >
                        تصنيف المشكلة الفنية
                      </label>
                      <select
                        id="req-support-problem"
                        value={supportProblemType}
                        onChange={(e) => setSupportProblemType(e.target.value)}
                        className="w-full min-h-[44px] rounded-xl bg-white border border-[#E2E8F0] px-3.5 text-xs font-bold text-[#071426] focus:outline-none focus:border-[#0EA5E9]"
                      >
                        {SERVICES_FORM_ENUMS.supportProblems.map((prob) => (
                          <option key={prob} value={prob}>
                            {prob}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {serviceType === 'صيانة وإصلاح الأعطال' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#E2E8F0]">
                      <div>
                        <label
                          htmlFor="req-maint-cat"
                          className="block text-xs font-bold text-[#071426] mb-1.5"
                        >
                          فئة الجهاز المتعطل
                        </label>
                        <select
                          id="req-maint-cat"
                          value={deviceCategory}
                          onChange={(e) => setDeviceCategory(e.target.value)}
                          className="w-full min-h-[44px] rounded-xl bg-white border border-[#E2E8F0] px-3.5 text-xs font-bold text-[#071426] focus:outline-none focus:border-[#0EA5E9]"
                        >
                          {SERVICES_FORM_ENUMS.deviceCategories.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label
                          htmlFor="req-maint-name"
                          className="block text-xs font-bold text-[#071426] mb-1.5"
                        >
                          اسم أو نوع الجهاز (اختياري)
                        </label>
                        <input
                          id="req-maint-name"
                          type="text"
                          value={maintenanceDeviceName}
                          onChange={(e) =>
                            setMaintenanceDeviceName(e.target.value)
                          }
                          placeholder="مثال: TP-Link أو NanoStation M5"
                          className="w-full min-h-[44px] rounded-xl bg-white border border-[#E2E8F0] px-3.5 text-sm text-[#071426] focus:outline-none focus:border-[#0EA5E9]"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label
                      htmlFor="req-details"
                      className="block text-xs font-bold text-[#071426] mb-1.5"
                    >
                      {serviceType === 'نقل الخدمة'
                        ? 'سبب النقل أو ملاحظات إضافية (اختياري)'
                        : 'تفاصيل إضافية تساعد فريقنا (اختياري)'}
                    </label>
                    <textarea
                      id="req-details"
                      rows={2}
                      value={details}
                      onChange={(e) => setDetails(e.target.value)}
                      placeholder="اكتب أي تفاصيل أو وقت مفضل للتواصل..."
                      className="w-full rounded-xl bg-white border border-[#E2E8F0] p-3 text-sm text-[#071426] focus:outline-none focus:border-[#0EA5E9]"
                    />
                  </div>
                </>
              ) : (
                /* Subscription Builder Tab */
                <div className="space-y-6">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSubType('card');
                        setConfirmedSummary(false);
                      }}
                      className={`min-h-[42px] px-5 py-2 rounded-xl text-xs font-bold border transition-colors ${
                        subType === 'card'
                          ? 'bg-[#071426] text-[#22D3EE] border-[#071426]'
                          : 'bg-white text-[#071426] border-[#E2E8F0] hover:border-[#0EA5E9]'
                      }`}
                    >
                      كروت الإنترنت المعتمدة (A1 – A6)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSubType('package');
                        setConfirmedSummary(false);
                      }}
                      className={`min-h-[42px] px-5 py-2 rounded-xl text-xs font-bold border transition-colors ${
                        subType === 'package'
                          ? 'bg-[#071426] text-[#D6B56D] border-[#071426]'
                          : 'bg-white text-[#071426] border-[#E2E8F0] hover:border-[#0EA5E9]'
                      }`}
                    >
                      الباقات الشهرية (الفضية / الذهبية)
                    </button>
                  </div>

                  {subType === 'card' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {INTERNET_CARDS.map((card) => {
                        const isPicked = selectedCardId === card.id;
                        return (
                          <button
                            key={card.id}
                            type="button"
                            onClick={() => {
                              setSelectedCardId(card.id);
                              setConfirmedSummary(false);
                            }}
                            className={`text-right p-4 rounded-xl border transition-all ${
                              isPicked
                                ? 'bg-[#071426] text-white border-[#22D3EE]'
                                : 'bg-white text-[#071426] border-[#E2E8F0] hover:border-[#0EA5E9]'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span
                                className={`font-display font-extrabold text-sm ${
                                  isPicked ? 'text-white' : 'text-[#071426]'
                                }`}
                              >
                                {card.title}
                              </span>
                              <span
                                dir="ltr"
                                className={`font-mono-tech text-xs font-bold tabular-nums ${
                                  isPicked ? 'text-[#22D3EE]' : 'text-[#0EA5E9]'
                                }`}
                              >
                                {card.capacity}
                              </span>
                            </div>
                            <span
                              className={`block font-display text-lg font-black tabular-nums ${
                                isPicked ? 'text-[#D6B56D]' : 'text-[#071426]'
                              }`}
                            >
                              {card.price}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {MONTHLY_PACKAGES.map((pkg) => {
                        const isPicked = selectedPackageId === pkg.id;
                        return (
                          <button
                            key={pkg.id}
                            type="button"
                            onClick={() => {
                              setSelectedPackageId(pkg.id);
                              setConfirmedSummary(false);
                            }}
                            className={`text-right p-5 rounded-2xl border transition-all ${
                              isPicked
                                ? 'bg-[#071426] text-white border-[#D6B56D]'
                                : 'bg-white text-[#071426] border-[#E2E8F0] hover:border-[#0EA5E9]'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-display text-lg font-black">
                                {pkg.title}
                              </span>
                              <span
                                dir="ltr"
                                className={`font-mono-tech text-sm font-bold tabular-nums ${
                                  isPicked ? 'text-[#22D3EE]' : 'text-[#0EA5E9]'
                                }`}
                              >
                                {pkg.capacity}
                              </span>
                            </div>
                            <span
                              className={`block font-display text-2xl font-black tabular-nums ${
                                isPicked ? 'text-[#D6B56D]' : 'text-[#071426]'
                              }`}
                            >
                              {pkg.price}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="min-h-[48px] px-7 py-3 rounded-xl bg-[#071426] text-white font-bold text-sm hover:bg-[#0EA5E9] transition-colors inline-flex items-center gap-2 whitespace-nowrap"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#22D3EE]" />
                  <span>مراجعة وتجهيز الطلب</span>
                </button>
                <span className="text-xs text-[#64748B]">
                  سيتم توليد رابط النموذج الرسمي مع تعبئة بياناتك تلقائيًا.
                </span>
              </div>
            </form>

            {/* Confirmation Summary Card */}
            {confirmedSummary && (
              <div
                role="status"
                aria-live="polite"
                className="mt-6 bg-[#030A14] text-white border border-[#22D3EE]/50 rounded-2xl p-6 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#07162B] border border-[#22D3EE]/40 text-[#22D3EE] flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-display text-base sm:text-lg font-extrabold text-white m-0">
                        تم تجهيز الطلب بنجاح — راجع الملخص النهائي
                      </h3>
                      <p className="text-xs text-[#94A3B8] m-0">
                        اضغط على زر الإرسال لفتح نموذج Google الرسمي ببياناتك المعبأة.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setConfirmedSummary(false)}
                    className="min-h-[36px] px-3 py-1.5 rounded-lg border border-white/15 text-xs font-bold text-[#CBD5E1] hover:text-white inline-flex items-center gap-1.5 self-start sm:self-center"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>تعديل</span>
                  </button>
                </div>

                {activeTab === 'service' ? (
                  <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs m-0">
                    <div className="bg-[#07162B] rounded-xl p-3 border border-white/10">
                      <dt className="text-[#94A3B8] mb-0.5">نوع الخدمة</dt>
                      <dd className="m-0 font-bold text-[#22D3EE]">
                        {serviceType}
                      </dd>
                    </div>
                    <div className="bg-[#07162B] rounded-xl p-3 border border-white/10">
                      <dt className="text-[#94A3B8] mb-0.5">الاسم الكامل</dt>
                      <dd className="m-0 font-bold text-white">{fullName}</dd>
                    </div>
                    <div className="bg-[#07162B] rounded-xl p-3 border border-white/10">
                      <dt className="text-[#94A3B8] mb-0.5">رقم الهاتف</dt>
                      <dd dir="ltr" className="m-0 font-bold text-white text-right tabular-nums">
                        {phone}
                      </dd>
                    </div>
                    <div className="bg-[#07162B] rounded-xl p-3 border border-white/10">
                      <dt className="text-[#94A3B8] mb-0.5">
                        {serviceType === 'نقل الخدمة' ? 'المسار' : 'المنطقة'}
                      </dt>
                      <dd className="m-0 font-bold text-white">
                        {serviceType === 'نقل الخدمة'
                          ? `${currentDistrict} ← ${newDistrict}`
                          : district}
                      </dd>
                    </div>
                    {serviceType === 'تركيب راوتر أو جهاز' && (
                      <div className="bg-[#07162B] rounded-xl p-3 border border-white/10 sm:col-span-2">
                        <dt className="text-[#94A3B8] mb-0.5">الجهاز المختار</dt>
                        <dd className="m-0 font-bold text-[#D6B56D]">
                          {deviceCategory ===
                          SERVICES_FORM_ENUMS.deviceCategories[0]
                            ? routerDevice
                            : linkDevice}
                        </dd>
                      </div>
                    )}
                    {serviceType === 'الدعم الفني' && (
                      <div className="bg-[#07162B] rounded-xl p-3 border border-white/10 sm:col-span-2">
                        <dt className="text-[#94A3B8] mb-0.5">تصنيف المشكلة</dt>
                        <dd className="m-0 font-bold text-[#D6B56D]">
                          {supportProblemType}
                        </dd>
                      </div>
                    )}
                  </dl>
                ) : (
                  <div className="bg-[#07162B] rounded-xl p-4 border border-white/10 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <span className="block text-xs text-[#94A3B8]">
                        الاختيار المعتمد
                      </span>
                      <span className="font-display text-lg font-black text-white">
                        {subType === 'card'
                          ? selectedCard.title
                          : selectedPackage.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span
                        dir="ltr"
                        className="font-mono-tech text-sm font-bold text-[#22D3EE] tabular-nums"
                      >
                        {subType === 'card'
                          ? selectedCard.capacity
                          : selectedPackage.capacity}
                      </span>
                      <span className="font-display text-lg font-black text-[#D6B56D] tabular-nums">
                        {subType === 'card'
                          ? selectedCard.price
                          : selectedPackage.price}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <a
                    href={
                      activeTab === 'service'
                        ? generatedServiceUrl
                        : generatedSubscriptionUrl
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-[46px] inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#22D3EE] text-[#030A14] font-bold text-sm hover:bg-[#67E8F9] transition-colors whitespace-nowrap"
                  >
                    <span>فتح نموذج Google مع تعبئة بياناتك</span>
                    <ArrowUpLeft className="w-4 h-4" />
                  </a>

                  <button
                    type="button"
                    onClick={() => void handleCopySummary()}
                    className="min-h-[46px] inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-white/20 text-white text-xs font-bold hover:border-[#22D3EE] transition-colors whitespace-nowrap"
                  >
                    {copiedSummary ? (
                      <>
                        <Check className="w-4 h-4 text-[#22D3EE]" />
                        <span>تم نسخ الملخص</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>نسخ ملخص الطلب</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Original Dual Google Forms Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <a
              href={FORMS_CONFIG.services.requestBaseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col justify-between bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-7 sm:p-10 hover:border-[#0EA5E9] hover:bg-white transition-all duration-150 focus-visible:outline-2 focus-visible:outline-[#0EA5E9]"
            >
              <div>
                <div className="flex items-center justify-between mb-7">
                  <div
                    aria-hidden="true"
                    className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#071426] text-[#22D3EE] group-hover:bg-[#0EA5E9] group-hover:text-white transition-colors"
                  >
                    <ClipboardList className="w-6 h-6" strokeWidth={1.85} />
                  </div>
                  <span className="font-mono-tech text-xs font-bold text-[#94A3B8]">
                    01
                  </span>
                </div>

                <h2 className="font-display text-2xl font-black text-[#071426] mb-2.5">
                  طلب خدمة
                </h2>
                <p className="text-[#475569] text-sm sm:text-[15px] leading-relaxed mb-8">
                  تقديم طلب تركيب أو صيانة أو نقل خدمة.
                </p>
              </div>

              <span className="w-full min-h-[48px] inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#071426] text-white font-bold text-sm group-hover:bg-[#0EA5E9] transition-colors whitespace-nowrap">
                <span>فتح نموذج طلب الخدمة</span>
                <ArrowUpLeft className="w-4 h-4 text-[#22D3EE] group-hover:text-white transition-transform duration-150 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </a>

            <a
              href={FORMS_CONFIG.subscriptions.requestBaseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative overflow-hidden flex flex-col justify-between bg-[#030A14] text-white border border-white/15 rounded-2xl p-7 sm:p-10 hover:border-[#22D3EE] transition-all duration-150 focus-visible:outline-2 focus-visible:outline-[#22D3EE]"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 arch-grid-dark opacity-45"
              />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-7">
                  <div
                    aria-hidden="true"
                    className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#07162B] border border-[#22D3EE]/35 text-[#22D3EE]"
                  >
                    <Ticket className="w-6 h-6" strokeWidth={1.85} />
                  </div>
                  <span className="font-mono-tech text-xs font-bold text-[#D6B56D]">
                    02
                  </span>
                </div>

                <h2 className="font-display text-2xl font-black text-white mb-2.5">
                  اشتراك أو كروت إنترنت
                </h2>
                <p className="text-[#CBD5E1] text-sm sm:text-[15px] leading-relaxed mb-8">
                  طلب كروت الإنترنت أو الباقات الشهرية.
                </p>
              </div>

              <span className="relative z-10 w-full min-h-[48px] inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#22D3EE] text-[#030A14] font-bold text-sm group-hover:bg-[#67E8F9] transition-colors whitespace-nowrap">
                <span>فتح نموذج الاشتراكات</span>
                <ArrowUpLeft className="w-4 h-4 transition-transform duration-150 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </a>
          </div>

          {/* Direct Quick Shortcuts to Prefilled Options */}
          <Reveal delay={0.05}>
            <div className="border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 bg-[#F8FAFC]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                <h3 className="font-display text-base font-extrabold text-[#071426] m-0">
                  اختصارات الطلب المباشر
                </h3>
                <AppLink
                  to="/internet-cards"
                  className="text-xs font-bold text-[#0EA5E9] hover:underline whitespace-nowrap"
                >
                  استعراض جميع الكروت والباقات ←
                </AppLink>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {SERVICE_OPTIONS.map((service) => (
                  <a
                    key={service.id}
                    href={getServiceFormUrl(service.formValue)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between gap-2 px-4 py-3 rounded-xl bg-white border border-[#E2E8F0] hover:border-[#0EA5E9] text-xs font-bold text-[#071426] transition-colors"
                  >
                    <span className="truncate">{service.title}</span>
                    <ArrowUpLeft className="w-3.5 h-3.5 text-[#0EA5E9] shrink-0 transition-transform group-hover:-translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
