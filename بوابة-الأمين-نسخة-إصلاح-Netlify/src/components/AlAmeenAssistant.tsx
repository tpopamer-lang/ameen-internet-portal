import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  AlertCircle,
  ArrowUpLeft,
  ExternalLink,
  Mail,
  MapPin,
  MessageCircle,
  MessageSquareText,
  Mic,
  Phone,
  RotateCcw,
  Send,
  Sparkles,
  X,
} from 'lucide-react';
import {
  ASSISTANT_ACTIONS,
  isValidActionId,
  type AssistantActionDef,
  type AssistantActionId,
} from '../config/assistantActions';
import type { AppRoutePath } from '../config/routes';
import { useRouter } from '../context/RouterContext';
import { useVoiceRequest } from '../context/VoiceRequestContext';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  actionIds?: AssistantActionId[];
  isWelcome?: boolean;
}

const STORAGE_KEY = 'alameen_assistant_chat_v1';
const MAX_MESSAGE_CHARS = 500;

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content: 'مرحبًا بك في بوابة الأمين للإنترنت، كيف يمكنني مساعدتك؟',
  isWelcome: true,
};

const SUGGESTED_QUESTIONS: string[] = [
  'ما أسعار كروت الإنترنت؟',
  'ما الباقات الشهرية؟',
  'كيف أطلب خدمة؟',
  'كيف أتواصل مع الدعم الفني؟',
  'ما الأجهزة المتاحة للتركيب؟',
];

const ROUTE_TITLES: Record<AppRoutePath, string> = {
  '/': 'الصفحة الرئيسية',
  '/about': 'من نحن',
  '/services': 'خدماتنا والأجهزة المتاحة',
  '/internet-cards': 'كروت الإنترنت والباقات الشهرية',
  '/request': 'طلب خدمة أو اشتراك',
  '/support': 'الدعم الفني',
  '/contact': 'اتصل بنا',
};

function loadInitialMessages(): ChatMessage[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [WELCOME_MESSAGE];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return [WELCOME_MESSAGE];
    }
    const valid: ChatMessage[] = [];
    for (const item of parsed) {
      if (!item || typeof item !== 'object') continue;
      const obj = item as Partial<ChatMessage>;
      if (
        typeof obj.id === 'string' &&
        (obj.role === 'user' || obj.role === 'assistant') &&
        typeof obj.content === 'string' &&
        obj.content.trim().length > 0
      ) {
        const cleanActions = Array.isArray(obj.actionIds)
          ? obj.actionIds.filter(
              (a): a is AssistantActionId =>
                typeof a === 'string' && isValidActionId(a)
            )
          : undefined;
        valid.push({
          id: obj.id,
          role: obj.role,
          content: obj.content,
          actionIds: cleanActions,
          isWelcome: Boolean(obj.isWelcome),
        });
      }
    }
    return valid.length > 0 ? valid : [WELCOME_MESSAGE];
  } catch {
    return [WELCOME_MESSAGE];
  }
}

function renderInlineBold(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong key={i} className="font-bold text-[#07182E]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

function FormattedMessageText({ text, isUser }: { text: string; isUser?: boolean }) {
  const lines = text.split('\n');
  const blocks: Array<{ type: 'p' | 'ul'; items: string[] }> = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;
    const bulletMatch = line.match(/^[-•*]\s+(.*)$/);
    if (bulletMatch) {
      const last = blocks[blocks.length - 1];
      if (last && last.type === 'ul') {
        last.items.push(bulletMatch[1]);
      } else {
        blocks.push({ type: 'ul', items: [bulletMatch[1]] });
      }
    } else {
      blocks.push({ type: 'p', items: [line] });
    }
  }

  return (
    <div className="space-y-2 text-[13.5px] leading-[1.75] tabular-nums">
      {blocks.map((block, idx) =>
        block.type === 'ul' ? (
          <ul key={idx} className="space-y-1 pr-4 list-disc marker:text-[#32C5E8] m-0">
            {block.items.map((item, itemIdx) => (
              <li key={itemIdx}>{isUser ? item : renderInlineBold(item)}</li>
            ))}
          </ul>
        ) : (
          <p key={idx} className="m-0">
            {isUser ? block.items[0] : renderInlineBold(block.items[0])}
          </p>
        )
      )}
    </div>
  );
}

function getActionIcon(kind: AssistantActionDef['kind']) {
  switch (kind) {
    case 'phone':
      return Phone;
    case 'whatsapp':
      return MessageCircle;
    case 'email':
      return Mail;
    case 'maps':
      return MapPin;
    case 'external':
      return ExternalLink;
    case 'route':
    default:
      return ArrowUpLeft;
  }
}

export function AlAmeenAssistant() {
  const { currentPath, navigate } = useRouter();
  const { isVoiceOpen, openVoiceModal } = useVoiceRequest();
  const shouldReduceMotion = useReducedMotion();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(loadInitialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorState, setErrorState] = useState<{
    message: string;
    lastQuery?: string;
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const hasUserMessages = messages.some((m) => m.role === 'user');

  // Persist conversation temporarily in sessionStorage across navigation
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-24)));
    } catch {
      // Ignore storage quota issues
    }
  }, [messages]);

  // Auto-scroll to latest message when chat updates or opens
  useEffect(() => {
    if (!isOpen) return;
    messagesEndRef.current?.scrollIntoView({
      behavior: shouldReduceMotion ? 'auto' : 'smooth',
    });
  }, [messages, isLoading, errorState, isOpen, shouldReduceMotion]);

  // Focus input and handle Escape key when chat modal is open
  useEffect(() => {
    if (!isOpen) return;
    const focusTimer = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 120);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen]);

  const sendMessage = async (rawText: string, skipUserAppend = false) => {
    const trimmed = rawText.trim();
    if (!trimmed || isLoading) return;
    if (trimmed.length > MAX_MESSAGE_CHARS) {
      setErrorState({
        message: `الرسالة طويلة جدًا. يرجى اختصارها إلى ${MAX_MESSAGE_CHARS} حرفًا كحد أقصى.`,
      });
      return;
    }

    setErrorState(null);

    const historyPayload = messages
      .filter((m) => !m.isWelcome)
      .slice(-14)
      .map((m) => ({
        role: m.role,
        content: m.content,
      }));

    if (!skipUserAppend) {
      const userMsg: ChatMessage = {
        id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        role: 'user',
        content: trimmed,
      };
      setMessages((prev) => [...prev, userMsg]);
      setInput('');
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: trimmed,
          history: historyPayload,
          currentPath,
        }),
      });

      const data = (await response.json().catch(() => null)) as {
        reply?: unknown;
        actionIds?: unknown;
        message?: unknown;
      } | null;

      if (!response.ok) {
        const errText =
          data && typeof data.message === 'string'
            ? data.message
            : 'تعذر الوصول إلى المساعد حاليًا. يرجى المحاولة مرة أخرى.';
        setErrorState({
          message: errText,
          lastQuery: trimmed,
        });
        return;
      }

      const replyText =
        data && typeof data.reply === 'string' && data.reply.trim().length > 0
          ? data.reply.trim()
          : 'عذرًا، لم أتمكن من صياغة إجابة واضحة. يمكنك التواصل مع الدعم الفني لمساعدتك.';

      const validActionIds =
        data && Array.isArray(data.actionIds)
          ? data.actionIds.filter(
              (id): id is AssistantActionId =>
                typeof id === 'string' && isValidActionId(id)
            )
          : [];

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        role: 'assistant',
        content: replyText,
        actionIds: validActionIds,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setErrorState({
        message:
          'انقطع الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.',
        lastQuery: trimmed,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void sendMessage(input);
    }
  };

  const handleResetChat = () => {
    setMessages([WELCOME_MESSAGE]);
    setErrorState(null);
    setInput('');
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
    inputRef.current?.focus();
  };

  const handleRouteActionClick = (routePath: AppRoutePath) => {
    navigate(routePath);
    if (window.innerWidth < 640) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Floating AI Dock (Voice Request + Smart Assistant) */}
      <AnimatePresence>
        {!isOpen && !isVoiceOpen && (
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.92, y: 12 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-3 left-3 sm:bottom-6 sm:left-6 z-40 flex items-center gap-1.5 sm:gap-2 max-w-[calc(100vw-1.5rem)]"
          >
            <button
              type="button"
              onClick={openVoiceModal}
              aria-label="اطلب خدمتك بصوتك"
              className="min-h-[42px] sm:min-h-[50px] inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-2xl text-[#07182E] border border-[#32C5E8]/60 shadow-[0_12px_34px_rgba(50,197,232,0.3)] hover:-translate-y-0.5 hover:brightness-105 active:scale-[0.98] transition-all duration-200 focus-visible:outline-2 focus-visible:outline-white"
              style={{
                background: 'linear-gradient(135deg, #32C5E8 0%, #86E6FC 100%)',
              }}
            >
              <span
                aria-hidden="true"
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#07182E]/12 text-[#07182E] flex items-center justify-center shrink-0"
              >
                <Mic className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={2.2} />
              </span>
              <span className="font-display text-[11.5px] sm:text-[13px] font-extrabold whitespace-nowrap">
                اطلب خدمتك بصوتك
              </span>
            </button>

            <button
              type="button"
              onClick={() => setIsOpen(true)}
              aria-label="فتح مساعد الأمين الذكي"
              className="min-h-[42px] sm:min-h-[50px] inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-2xl bg-[#07182E] text-white border border-[#32C5E8]/55 shadow-[0_14px_38px_rgba(7,24,46,0.35)] hover:border-[#32C5E8] hover:-translate-y-0.5 hover:shadow-[0_18px_44px_rgba(50,197,232,0.28)] active:scale-[0.98] transition-all duration-200 focus-visible:outline-2 focus-visible:outline-[#32C5E8]"
              style={{
                backgroundImage:
                  'linear-gradient(135deg, #07182E 0%, #0B2545 60%, #123F73 100%)',
              }}
            >
              <span
                aria-hidden="true"
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#32C5E8]/15 border border-[#32C5E8]/40 text-[#32C5E8] flex items-center justify-center shrink-0"
              >
                <MessageSquareText className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={2} />
              </span>
              <span className="font-display text-[11.5px] sm:text-[13px] font-bold whitespace-nowrap">
                مساعد الأمين الذكي
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-labelledby="alameen-assistant-title"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-3 bottom-3 top-16 sm:top-auto sm:right-auto sm:left-6 sm:bottom-6 sm:w-[420px] sm:h-[min(630px,calc(100dvh-108px))] z-50 flex flex-col overflow-hidden rounded-3xl bg-[#F7FAFD] border border-[#DCE6F2] shadow-[0_28px_75px_rgba(3,12,24,0.42)]"
          >
            {/* Chat Header */}
            <header
              className="relative shrink-0 px-4 sm:px-5 py-3.5 text-white border-b border-[#32C5E8]/30 flex items-center justify-between gap-3"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 15% 15%, rgba(50, 197, 232, 0.22), transparent 55%), linear-gradient(135deg, #07182E 0%, #0B2545 65%, #123F73 100%)',
              }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  aria-hidden="true"
                  className="w-10 h-10 rounded-2xl bg-[#0B2545] border border-[#32C5E8]/45 text-[#32C5E8] flex items-center justify-center shadow-[0_6px_18px_rgba(50,197,232,0.2)] shrink-0"
                >
                  <Sparkles className="w-5 h-5" strokeWidth={1.9} />
                </div>
                <div className="min-w-0">
                  <h2
                    id="alameen-assistant-title"
                    className="font-display text-base font-bold text-white m-0 truncate"
                  >
                    مساعد الأمين الذكي
                  </h2>
                  <p className="text-[11px] text-[#AFC5DA] m-0 truncate">
                    خدمة عملاء بوابة الأمين للإنترنت
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={handleResetChat}
                  title="بدء محادثة جديدة"
                  aria-label="بدء محادثة جديدة"
                  className="min-h-[40px] px-2.5 rounded-xl border border-white/15 bg-white/5 text-[#D4E3F1] hover:text-white hover:border-[#32C5E8]/55 hover:bg-white/10 transition-colors inline-flex items-center gap-1.5 text-[11px] font-bold whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#32C5E8]"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#32C5E8]" />
                  <span>جديدة</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="إغلاق نافذة المحادثة"
                  className="min-w-[40px] min-h-[40px] rounded-xl border border-white/15 bg-white/5 text-white hover:text-[#32C5E8] hover:border-[#32C5E8] transition-colors flex items-center justify-center focus-visible:outline-2 focus-visible:outline-[#32C5E8]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </header>

            {/* Current Page Context Line */}
            <div className="shrink-0 px-4 py-2 bg-[#EEF4FA] border-b border-[#DCE6F2] flex items-center justify-between text-[11px] text-[#5A6B7F]">
              <span className="truncate">
                تتصفح الآن:{' '}
                <strong className="text-[#07182E] font-bold">
                  {ROUTE_TITLES[currentPath]}
                </strong>
              </span>
              <span className="text-[#1765A5] font-bold shrink-0">
                الشحر · اليمن
              </span>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {messages.map((msg) => {
                const isUser = msg.role === 'user';
                const actions = (msg.actionIds ?? [])
                  .map((id) => ASSISTANT_ACTIONS[id])
                  .filter(Boolean);

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      isUser ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-[88%] rounded-2xl px-4 py-3 ${
                        isUser
                          ? 'bg-[#07182E] text-white rounded-tl-sm shadow-[0_8px_22px_rgba(7,24,46,0.16)]'
                          : 'bg-white text-[#24364B] border border-[#DCE6F2] rounded-tr-sm shadow-[0_6px_20px_rgba(7,24,46,0.04)]'
                      }`}
                    >
                      <FormattedMessageText text={msg.content} isUser={isUser} />
                    </div>

                    {/* Interactive Site Links / Form Action Buttons */}
                    {!isUser && actions.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2 max-w-[92%]">
                        {actions.map((action) => {
                          const Icon = getActionIcon(action.kind);
                          if (action.kind === 'route' && action.routePath) {
                            return (
                              <button
                                key={action.id}
                                type="button"
                                onClick={() =>
                                  handleRouteActionClick(action.routePath!)
                                }
                                className="min-h-[38px] inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#07182E] text-white hover:bg-[#1765A5] active:scale-[0.98] transition-all shadow-sm whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#32C5E8]"
                              >
                                <span>{action.label}</span>
                                <Icon className="w-3.5 h-3.5 text-[#32C5E8]" />
                              </button>
                            );
                          }

                          const isExternalTab =
                            action.kind === 'external' ||
                            action.kind === 'whatsapp' ||
                            action.kind === 'maps';

                          return (
                            <a
                              key={action.id}
                              href={action.href}
                              {...(isExternalTab
                                ? {
                                    target: '_blank',
                                    rel: 'noopener noreferrer',
                                  }
                                : {})}
                              className={`min-h-[38px] inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all active:scale-[0.98] whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#32C5E8] ${
                                action.kind === 'whatsapp'
                                  ? 'bg-[#EEF8F6] border-[#128C7E]/35 text-[#0E6B60] hover:bg-[#128C7E] hover:text-white'
                                  : 'bg-[#EEF4FA] border-[#32C5E8]/45 text-[#123F73] hover:bg-[#32C5E8] hover:text-[#07182E]'
                              }`}
                            >
                              <span>{action.label}</span>
                              <Icon className="w-3.5 h-3.5" />
                            </a>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Ready-Made Suggested Questions */}
              {!hasUserMessages && !isLoading && (
                <div className="pt-1">
                  <p className="text-[11.5px] font-bold text-[#5A6B7F] mb-2">
                    أسئلة مقترحة:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTED_QUESTIONS.map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => void sendMessage(q)}
                        className="min-h-[38px] text-right px-3.5 py-1.5 rounded-xl text-xs font-medium bg-white border border-[#DCE6F2] text-[#07182E] hover:border-[#32C5E8] hover:bg-[#EEF4FA] active:scale-[0.98] transition-all focus-visible:outline-2 focus-visible:outline-[#32C5E8]"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Loading Indicator */}
              {isLoading && (
                <div className="flex items-start">
                  <div
                    role="status"
                    aria-live="polite"
                    className="bg-white border border-[#DCE6F2] rounded-2xl rounded-tr-sm px-4 py-3 shadow-[0_6px_20px_rgba(7,24,46,0.04)] flex items-center gap-2.5 text-xs text-[#5A6B7F]"
                  >
                    <span className="inline-flex items-center gap-1" aria-hidden="true">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#32C5E8] animate-bounce [animation-delay:-0.2s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1765A5] animate-bounce [animation-delay:-0.1s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D6B56D] animate-bounce" />
                    </span>
                    <span className="font-medium">جاري تجهيز الإجابة...</span>
                  </div>
                </div>
              )}

              {/* Error Banner */}
              {errorState && (
                <div
                  role="alert"
                  className="bg-[#FFF8EB] border border-[#D6B56D] rounded-2xl p-3.5 text-xs text-[#07182E] space-y-2.5"
                >
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-[#9A7426] shrink-0 mt-0.5" />
                    <p className="m-0 leading-relaxed">{errorState.message}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {errorState.lastQuery && (
                      <button
                        type="button"
                        onClick={() =>
                          void sendMessage(errorState.lastQuery!, true)
                        }
                        className="min-h-[34px] px-3 py-1 rounded-xl bg-[#07182E] text-white font-bold text-[11px] hover:bg-[#1765A5] transition-colors"
                      >
                        إعادة المحاولة
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRouteActionClick('/support')}
                      className="min-h-[34px] px-3 py-1 rounded-xl bg-white border border-[#DCE6F2] text-[#123F73] font-bold text-[11px] hover:border-[#32C5E8] transition-colors"
                    >
                      صفحة الدعم الفني
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRouteActionClick('/contact')}
                      className="min-h-[34px] px-3 py-1 rounded-xl bg-white border border-[#DCE6F2] text-[#123F73] font-bold text-[11px] hover:border-[#32C5E8] transition-colors"
                    >
                      اتصل بنا
                    </button>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form
              onSubmit={handleSubmit}
              className="shrink-0 p-3 bg-white border-t border-[#DCE6F2]"
            >
              <div className="flex items-end gap-2">
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    rows={1}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    maxLength={MAX_MESSAGE_CHARS}
                    placeholder="اكتب سؤالك هنا..."
                    aria-label="اكتب سؤالك لمساعد الأمين الذكي"
                    className="w-full min-h-[44px] max-h-[108px] resize-none rounded-2xl bg-[#F7FAFD] border border-[#DCE6F2] px-3.5 py-2.5 text-[13.5px] text-[#07182E] placeholder:text-[#7E90A4] focus:outline-none focus:border-[#32C5E8] focus:bg-white transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading || input.trim().length === 0}
                  aria-label="إرسال السؤال"
                  className="min-h-[44px] min-w-[44px] px-4 rounded-2xl bg-[#07182E] text-white font-bold text-xs inline-flex items-center justify-center gap-1.5 hover:bg-[#1765A5] disabled:opacity-45 disabled:cursor-not-allowed active:scale-[0.97] transition-all shrink-0 focus-visible:outline-2 focus-visible:outline-[#32C5E8]"
                >
                  <span>إرسال</span>
                  <Send className="w-3.5 h-3.5 text-[#32C5E8] -scale-x-100" />
                </button>
              </div>
              {input.length > MAX_MESSAGE_CHARS - 80 && (
                <p className="text-[10.5px] text-[#5A6B7F] mt-1 mb-0 text-left tabular-nums">
                  {input.length} / {MAX_MESSAGE_CHARS}
                </p>
              )}
            </form>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  );
}
