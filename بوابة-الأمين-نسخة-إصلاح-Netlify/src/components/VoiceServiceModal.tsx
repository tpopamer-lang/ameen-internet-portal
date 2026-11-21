import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  AlertCircle,
  ArrowUpLeft,
  CheckCircle2,
  Edit3,
  Keyboard,
  Mic,
  RotateCcw,
  Send,
  Square,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import {
  SERVICES_FORM_ENUMS,
  buildVoiceServiceFormUrl,
  type OfficialServiceType,
  type VoiceServiceDraft,
} from '../config/forms';
import { useVoiceRequest } from '../context/VoiceRequestContext';

interface VoiceTurn {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  audioBase64?: string;
}

type VoiceStage =
  | 'idle'
  | 'requesting_mic'
  | 'listening'
  | 'transcribing'
  | 'editing_transcript'
  | 'analyzing'
  | 'summary';

const VOICE_EXAMPLES: string[] = [
  'أبغى أركب راوتر في بيتي',
  'النت عندي خربان وما يشتغل',
  'أريد نقل خدمة الإنترنت لحي جديد',
];

function getSupportedRecorderMimeType(): string {
  if (typeof MediaRecorder === 'undefined') return '';
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/ogg;codecs=opus',
    'audio/ogg',
  ];
  for (const type of candidates) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }
  return '';
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      const commaIdx = result.indexOf(',');
      resolve(commaIdx >= 0 ? result.slice(commaIdx + 1) : result);
    };
    reader.onerror = () => reject(new Error('Failed to read audio blob'));
    reader.readAsDataURL(blob);
  });
}

export function VoiceServiceModal() {
  const { isVoiceOpen, closeVoiceModal } = useVoiceRequest();
  const shouldReduceMotion = useReducedMotion();

  const [stage, setStage] = useState<VoiceStage>('idle');
  const [turns, setTurns] = useState<VoiceTurn[]>([
    {
      id: 'voice-welcome',
      role: 'assistant',
      content:
        'مرحبًا بك في خدمة اطلب خدمتك بصوتك. اضغط على زر الميكروفون وتحدث بطبيعتك بالخدمة التي تحتاجها، وسأساعدك في تجهيز الطلب.',
    },
  ]);
  const [draft, setDraft] = useState<VoiceServiceDraft>({});
  const [transcriptText, setTranscriptText] = useState('');
  const [interimPreview, setInterimPreview] = useState('');
  const [typedInput, setTypedInput] = useState('');
  const [textFallbackMode, setTextFallbackMode] = useState(false);
  const [voiceOutputEnabled, setVoiceOutputEnabled] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [levels, setLevels] = useState<number[]>([
    0.25, 0.45, 0.7, 0.5, 0.85, 0.6, 0.4, 0.65, 0.35, 0.5,
  ]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [confirmedOpened, setConfirmedOpened] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const timerIdRef = useRef<number | null>(null);
  const speechRecRef = useRef<{ stop: () => void } | null>(null);
  const liveSpeechTextRef = useRef<string>('');
  const discardOnStopRef = useRef<boolean>(false);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const supportsRecording =
    typeof navigator !== 'undefined' &&
    Boolean(navigator.mediaDevices?.getUserMedia) &&
    typeof MediaRecorder !== 'undefined';

  const stopAudioPlayback = useCallback(() => {
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  const cleanupRecordingResources = useCallback(() => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    if (timerIdRef.current !== null) {
      window.clearInterval(timerIdRef.current);
      timerIdRef.current = null;
    }
    if (speechRecRef.current) {
      try {
        speechRecRef.current.stop();
      } catch {
        // Ignore stop errors
      }
      speechRecRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => undefined);
      audioContextRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
  }, []);

  const playBase64Wav = useCallback(
    (base64: string) => {
      stopAudioPlayback();
      const audio = new Audio(`data:audio/wav;base64,${base64}`);
      activeAudioRef.current = audio;
      setIsSpeaking(true);
      audio.onended = () => {
        setIsSpeaking(false);
        activeAudioRef.current = null;
      };
      audio.onerror = () => {
        setIsSpeaking(false);
        activeAudioRef.current = null;
      };
      audio.play().catch(() => {
        setIsSpeaking(false);
        activeAudioRef.current = null;
      });
    },
    [stopAudioPlayback]
  );

  const speakWithBrowserFallback = useCallback((text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ar-SA';
      utterance.rate = 0.98;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } catch {
      setIsSpeaking(false);
    }
  }, []);

  const speakAssistantReply = useCallback(
    async (turnId: string, text: string) => {
      if (!voiceOutputEnabled) return;
      try {
        const res = await fetch('/api/voice/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }),
        });
        if (!res.ok) {
          speakWithBrowserFallback(text);
          return;
        }
        const data = (await res.json()) as { audioBase64?: string };
        if (data?.audioBase64) {
          setTurns((prev) =>
            prev.map((t) =>
              t.id === turnId ? { ...t, audioBase64: data.audioBase64 } : t
            )
          );
          playBase64Wav(data.audioBase64);
        } else {
          speakWithBrowserFallback(text);
        }
      } catch {
        speakWithBrowserFallback(text);
      }
    },
    [voiceOutputEnabled, playBase64Wav, speakWithBrowserFallback]
  );

  // Scroll conversation automatically
  useEffect(() => {
    if (!isVoiceOpen) return;
    messagesEndRef.current?.scrollIntoView({
      behavior: shouldReduceMotion ? 'auto' : 'smooth',
    });
  }, [turns, stage, transcriptText, isVoiceOpen, shouldReduceMotion]);

  // Escape key & cleanup on close
  useEffect(() => {
    if (!isVoiceOpen) {
      discardOnStopRef.current = true;
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== 'inactive'
      ) {
        try {
          mediaRecorderRef.current.stop();
        } catch {
          // Ignore
        }
      }
      cleanupRecordingResources();
      stopAudioPlayback();
      return;
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeVoiceModal();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    isVoiceOpen,
    closeVoiceModal,
    cleanupRecordingResources,
    stopAudioPlayback,
  ]);

  const startListening = async () => {
    setErrorMsg(null);
    setConfirmedOpened(false);
    stopAudioPlayback();

    if (!supportsRecording) {
      setTextFallbackMode(true);
      setErrorMsg(
        'متصفحك لا يدعم تسجيل الصوت حاليًا. يمكنك كتابة طلبك بالأسفل وسنفهمه فورًا.'
      );
      return;
    }

    setStage('requesting_mic');
    setTranscriptText('');
    setInterimPreview('');
    liveSpeechTextRef.current = '';
    discardOnStopRef.current = false;
    audioChunksRef.current = [];
    setElapsedSec(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      // Real-time audio visualizer via Web Audio AnalyserNode
      try {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          audioContextRef.current = ctx;
          const source = ctx.createMediaStreamSource(stream);
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 32;
          source.connect(analyser);
          const dataArray = new Uint8Array(analyser.frequencyBinCount);

          const updateBars = () => {
            analyser.getByteFrequencyData(dataArray);
            const nextLevels = Array.from({ length: 10 }, (_, idx) => {
              const raw = dataArray[idx % dataArray.length] ?? 0;
              return Math.max(0.18, Math.min(1, raw / 190));
            });
            setLevels(nextLevels);
            rafIdRef.current = requestAnimationFrame(updateBars);
          };
          updateBars();
        }
      } catch {
        // Visualizer is progressive enhancement
      }

      // Optional live interim preview via Web Speech API if browser supports it
      try {
        const SpeechRecCtor =
          (
            window as unknown as {
              SpeechRecognition?: new () => {
                lang: string;
                interimResults: boolean;
                continuous: boolean;
                onresult: ((e: { results: ArrayLike<{ 0: { transcript: string } }> }) => void) | null;
                onerror: (() => void) | null;
                start: () => void;
                stop: () => void;
              };
              webkitSpeechRecognition?: new () => {
                lang: string;
                interimResults: boolean;
                continuous: boolean;
                onresult: ((e: { results: ArrayLike<{ 0: { transcript: string } }> }) => void) | null;
                onerror: (() => void) | null;
                start: () => void;
                stop: () => void;
              };
            }
          ).SpeechRecognition ||
          (
            window as unknown as {
              webkitSpeechRecognition?: new () => {
                lang: string;
                interimResults: boolean;
                continuous: boolean;
                onresult: ((e: { results: ArrayLike<{ 0: { transcript: string } }> }) => void) | null;
                onerror: (() => void) | null;
                start: () => void;
                stop: () => void;
              };
            }
          ).webkitSpeechRecognition;

        if (SpeechRecCtor) {
          const rec = new SpeechRecCtor();
          rec.lang = 'ar-YE';
          rec.interimResults = true;
          rec.continuous = true;
          rec.onresult = (event) => {
            let combined = '';
            for (let i = 0; i < event.results.length; i++) {
              combined += event.results[i][0]?.transcript ?? '';
            }
            const clean = combined.trim();
            if (clean) {
              liveSpeechTextRef.current = clean;
              setInterimPreview(clean);
            }
          };
          rec.onerror = () => undefined;
          rec.start();
          speechRecRef.current = rec;
        }
      } catch {
        // Browser speech preview optional
      }

      const preferredMime = getSupportedRecorderMimeType();
      const recorder = preferredMime
        ? new MediaRecorder(stream, { mimeType: preferredMime })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        cleanupRecordingResources();

        if (discardOnStopRef.current) {
          audioChunksRef.current = [];
          return;
        }

        const chunks = audioChunksRef.current;
        audioChunksRef.current = [];

        if (chunks.length === 0) {
          if (liveSpeechTextRef.current) {
            setTranscriptText(liveSpeechTextRef.current);
            setStage('editing_transcript');
          } else {
            setErrorMsg('لم يتم التقاط أي صوت. يرجى المحاولة مرة أخرى.');
            setStage('idle');
          }
          return;
        }

        const mime = recorder.mimeType || preferredMime || 'audio/webm';
        const blob = new Blob(chunks, { type: mime });
        setStage('transcribing');

        try {
          const audioBase64 = await blobToBase64(blob);
          const response = await fetch('/api/voice/transcribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ audioBase64, mimeType: mime }),
          });

          const data = (await response.json().catch(() => null)) as {
            transcript?: string;
            message?: string;
          } | null;

          if (!response.ok || !data?.transcript) {
            if (liveSpeechTextRef.current) {
              setTranscriptText(liveSpeechTextRef.current);
              setStage('editing_transcript');
              return;
            }
            setErrorMsg(
              data?.message ||
                'تعذر التعرف على الكلام بوضوح. يرجى إعادة المحاولة أو كتابة طلبك.'
            );
            setStage('idle');
            return;
          }

          setTranscriptText(data.transcript.trim());
          setStage('editing_transcript');
        } catch {
          if (liveSpeechTextRef.current) {
            setTranscriptText(liveSpeechTextRef.current);
            setStage('editing_transcript');
            return;
          }
          setErrorMsg(
            'انقطع الاتصال أثناء تحويل الصوت إلى نص. يرجى المحاولة مرة أخرى أو استخدام الكتابة.'
          );
          setStage('idle');
        }
      };

      recorder.start(250);
      setStage('listening');

      timerIdRef.current = window.setInterval(() => {
        setElapsedSec((prev) => {
          if (prev >= 45) {
            // Cap single clip at 45s to avoid oversized payloads
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err: unknown) {
      cleanupRecordingResources();
      const errName = err instanceof Error ? err.name : '';
      if (errName === 'NotAllowedError' || errName === 'PermissionDeniedError') {
        setErrorMsg(
          'تم رفض إذن الميكروفون. يمكنك السماح للميكروفون من إعدادات المتصفح أو استخدام خيار الكتابة بالأسفل.'
        );
      } else if (errName === 'NotFoundError') {
        setErrorMsg(
          'لم يتم العثور على ميكروفون متصل. يمكنك كتابة طلبك مباشرة بالأسفل.'
        );
      } else {
        setErrorMsg(
          'تعذر تشغيل الميكروفون حاليًا. يمكنك كتابة طلبك نصيًا بالأسفل.'
        );
      }
      setTextFallbackMode(true);
      setStage('idle');
    }
  };

  const stopRecording = () => {
    discardOnStopRef.current = false;
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== 'inactive'
    ) {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        cleanupRecordingResources();
        setStage('idle');
      }
    } else {
      cleanupRecordingResources();
      setStage('idle');
    }
  };

  const retryRecording = () => {
    discardOnStopRef.current = true;
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== 'inactive'
    ) {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // Ignore
      }
    }
    cleanupRecordingResources();
    void startListening();
  };

  const submitTextToAnalyze = async (rawText: string) => {
    const clean = rawText.trim();
    if (!clean) {
      setErrorMsg('يرجى التحدث أو كتابة تفاصيل طلبك أولاً.');
      return;
    }

    setErrorMsg(null);
    setConfirmedOpened(false);

    const historyPayload = turns
      .filter((t) => t.id !== 'voice-welcome')
      .slice(-14)
      .map((t) => ({ role: t.role, content: t.content }));

    const userTurn: VoiceTurn = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: clean,
    };

    setTurns((prev) => [...prev, userTurn]);
    setTranscriptText('');
    setTypedInput('');
    setStage('analyzing');

    try {
      const response = await fetch('/api/voice/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: clean,
          history: historyPayload,
          currentDraft: draft,
        }),
      });

      const data = (await response.json().catch(() => null)) as {
        assistantMessage?: string;
        updatedDraft?: VoiceServiceDraft;
        readyForConfirmation?: boolean;
        message?: string;
      } | null;

      if (!response.ok || !data?.assistantMessage) {
        setErrorMsg(
          data?.message ||
            'حدث خطأ أثناء تحليل الطلب. يرجى المحاولة مرة أخرى.'
        );
        setStage('idle');
        return;
      }

      if (data.updatedDraft) {
        setDraft(data.updatedDraft);
      }

      const assistantTurnId = `assistant-${Date.now()}`;
      const assistantTurn: VoiceTurn = {
        id: assistantTurnId,
        role: 'assistant',
        content: data.assistantMessage,
      };
      setTurns((prev) => [...prev, assistantTurn]);
      setStage(data.readyForConfirmation ? 'summary' : 'idle');

      void speakAssistantReply(assistantTurnId, data.assistantMessage);
    } catch {
      setErrorMsg(
        'انقطع الاتصال بالخادم أثناء تحليل الطلب. يرجى المحاولة مرة أخرى.'
      );
      setStage('idle');
    }
  };

  const handleResetAll = () => {
    discardOnStopRef.current = true;
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== 'inactive'
    ) {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // Ignore
      }
    }
    cleanupRecordingResources();
    stopAudioPlayback();
    setStage('idle');
    setDraft({});
    setTranscriptText('');
    setInterimPreview('');
    setTypedInput('');
    setErrorMsg(null);
    setConfirmedOpened(false);
    setTurns([
      {
        id: 'voice-welcome',
        role: 'assistant',
        content:
          'مرحبًا بك في خدمة اطلب خدمتك بصوتك. اضغط على زر الميكروفون وتحدث بطبيعتك بالخدمة التي تحتاجها، وسأساعدك في تجهيز الطلب.',
      },
    ]);
  };

  const formattedTime = `00:${String(elapsedSec).padStart(2, '0')}`;
  const prefilledFormUrl = buildVoiceServiceFormUrl(draft);

  return (
    <AnimatePresence>
      {isVoiceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeVoiceModal}
            className="absolute inset-0 bg-[#040E1C]/80 backdrop-blur-md"
            aria-hidden="true"
          />

          {/* Modal Container */}
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-labelledby="voice-service-modal-title"
            initial={
              shouldReduceMotion
                ? false
                : { opacity: 0, scale: 0.96, y: 16 }
            }
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={
              shouldReduceMotion
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.96, y: 14 }
            }
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-[640px] max-h-[min(88dvh,740px)] flex flex-col overflow-hidden rounded-3xl bg-[#F7FAFD] border border-[#32C5E8]/35 shadow-[0_30px_90px_rgba(2,10,22,0.58)]"
          >
            {/* Header */}
            <header
              className="shrink-0 px-5 py-4 text-white border-b border-[#32C5E8]/30 flex items-center justify-between gap-3"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 15% 15%, rgba(50, 197, 232, 0.24), transparent 55%), linear-gradient(135deg, #07182E 0%, #0B2545 60%, #123F73 100%)',
              }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  aria-hidden="true"
                  className="w-11 h-11 rounded-2xl bg-[#0B2545] border border-[#32C5E8]/50 text-[#32C5E8] flex items-center justify-center shadow-[0_8px_22px_rgba(50,197,232,0.22)] shrink-0"
                >
                  <Mic className="w-5 h-5" strokeWidth={2} />
                </div>
                <div className="min-w-0">
                  <h2
                    id="voice-service-modal-title"
                    className="font-display text-base sm:text-lg font-extrabold text-white m-0 truncate"
                  >
                    اطلب خدمتك بصوتك
                  </h2>
                  <p className="text-[11px] text-[#AFC5DA] m-0 truncate">
                    تحدث باللهجة العربية وسنجهز طلبك تلقائيًا
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    if (voiceOutputEnabled) stopAudioPlayback();
                    setVoiceOutputEnabled((v) => !v);
                  }}
                  aria-label={
                    voiceOutputEnabled
                      ? 'كتم الرد الصوتي'
                      : 'تفعيل الرد الصوتي'
                  }
                  title={
                    voiceOutputEnabled ? 'الرد الصوتي مفعّل' : 'الرد الصوتي صامت'
                  }
                  className="min-h-[40px] px-2.5 rounded-xl border border-white/15 bg-white/5 text-[#D4E3F1] hover:text-white hover:border-[#32C5E8]/50 transition-colors inline-flex items-center gap-1.5 text-[11px] font-bold focus-visible:outline-2 focus-visible:outline-[#32C5E8]"
                >
                  {voiceOutputEnabled ? (
                    <Volume2 className="w-4 h-4 text-[#32C5E8]" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-[#8FA8C2]" />
                  )}
                  <span className="hidden sm:inline">
                    {voiceOutputEnabled ? 'صوت' : 'صامت'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleResetAll}
                  aria-label="بدء طلب جديد"
                  title="بدء طلب جديد"
                  className="min-h-[40px] px-2.5 rounded-xl border border-white/15 bg-white/5 text-[#D4E3F1] hover:text-white hover:border-[#32C5E8]/50 transition-colors inline-flex items-center gap-1 text-[11px] font-bold focus-visible:outline-2 focus-visible:outline-[#32C5E8]"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#D6B56D]" />
                  <span className="hidden sm:inline">جديد</span>
                </button>

                <button
                  type="button"
                  onClick={closeVoiceModal}
                  aria-label="إغلاق نافذة الطلب الصوتي"
                  className="min-w-[40px] min-h-[40px] rounded-xl border border-white/15 bg-white/5 text-white hover:text-[#32C5E8] hover:border-[#32C5E8] transition-colors flex items-center justify-center focus-visible:outline-2 focus-visible:outline-[#32C5E8]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </header>

            {/* Body: Conversation + Active Stage */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {/* Conversation History */}
              <div className="space-y-3">
                {turns.map((turn) => {
                  const isUser = turn.role === 'user';
                  return (
                    <div
                      key={turn.id}
                      className={`flex flex-col ${
                        isUser ? 'items-end' : 'items-start'
                      }`}
                    >
                      <div
                        className={`max-w-[90%] rounded-2xl px-4 py-3 text-[13.5px] leading-[1.8] ${
                          isUser
                            ? 'bg-[#07182E] text-white rounded-tl-sm shadow-sm'
                            : 'bg-white text-[#24364B] border border-[#DCE6F2] rounded-tr-sm shadow-[0_6px_18px_rgba(7,24,46,0.04)]'
                        }`}
                      >
                        <p className="m-0">{turn.content}</p>
                        {!isUser && turn.audioBase64 && (
                          <button
                            type="button"
                            onClick={() => playBase64Wav(turn.audioBase64!)}
                            className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-[#1765A5] hover:text-[#07182E] transition-colors"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>إعادة الاستماع</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quick Voice/Text Examples before first turn */}
              {turns.length === 1 && stage === 'idle' && (
                <div className="bg-[#EEF4FA] border border-[#DCE6F2] rounded-2xl p-3.5">
                  <p className="text-[11.5px] font-bold text-[#123F73] mb-2 m-0">
                    أمثلة لما يمكنك قوله بصوتك:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {VOICE_EXAMPLES.map((ex) => (
                      <button
                        key={ex}
                        type="button"
                        onClick={() => void submitTextToAnalyze(ex)}
                        className="min-h-[36px] px-3 py-1 rounded-xl bg-white border border-[#DCE6F2] text-xs text-[#07182E] hover:border-[#32C5E8] hover:bg-[#F7FAFD] transition-colors"
                      >
                        «{ex}»
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Listening Stage UI */}
              {(stage === 'requesting_mic' || stage === 'listening') && (
                <div
                  className="rounded-3xl p-6 text-center text-white border border-[#32C5E8]/40 shadow-[0_18px_48px_rgba(7,24,46,0.25)]"
                  style={{
                    backgroundImage:
                      'radial-gradient(circle at 50% 20%, rgba(50, 197, 232, 0.24), transparent 60%), linear-gradient(145deg, #07182E 0%, #0B2545 100%)',
                  }}
                >
                  <div className="flex items-center justify-center gap-1.5 h-12 mb-4">
                    {levels.map((lvl, idx) => (
                      <span
                        key={idx}
                        aria-hidden="true"
                        className="w-1.5 rounded-full bg-[#32C5E8] transition-all duration-100"
                        style={{
                          height:
                            stage === 'listening'
                              ? `${Math.round(lvl * 44)}px`
                              : '10px',
                          opacity: stage === 'listening' ? 0.9 : 0.4,
                        }}
                      />
                    ))}
                  </div>

                  <p className="font-display text-lg font-extrabold text-white mb-1">
                    {stage === 'requesting_mic'
                      ? 'جاري طلب إذن الميكروفون...'
                      : 'تحدث الآن، أنا أستمع إليك'}
                  </p>
                  <p className="text-xs text-[#AFC5DA] tabular-nums mb-4">
                    {stage === 'listening'
                      ? `مدة التسجيل: ${formattedTime}`
                      : 'يرجى السماح بالوصول إلى الميكروفون من المتصفح'}
                  </p>

                  {interimPreview && (
                    <p className="text-xs text-[#86E6FC] bg-white/5 border border-white/10 rounded-xl p-2.5 mb-4">
                      {interimPreview}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={stopRecording}
                      disabled={stage !== 'listening'}
                      className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#32C5E8] text-[#07182E] font-bold text-sm hover:bg-[#86E6FC] disabled:opacity-50 active:scale-[0.98] transition-all"
                    >
                      <Square className="w-4 h-4 fill-current" />
                      <span>إيقاف التسجيل</span>
                    </button>

                    <button
                      type="button"
                      onClick={retryRecording}
                      className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-white/25 text-white font-bold text-xs hover:bg-white/10 transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>إعادة المحاولة</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Transcribing / Analyzing Indicator */}
              {(stage === 'transcribing' || stage === 'analyzing') && (
                <div
                  role="status"
                  aria-live="polite"
                  className="bg-white border border-[#DCE6F2] rounded-2xl p-4 flex items-center gap-3 text-sm text-[#07182E] shadow-sm"
                >
                  <span className="inline-flex items-center gap-1" aria-hidden="true">
                    <span className="w-2 h-2 rounded-full bg-[#32C5E8] animate-bounce [animation-delay:-0.2s]" />
                    <span className="w-2 h-2 rounded-full bg-[#1765A5] animate-bounce [animation-delay:-0.1s]" />
                    <span className="w-2 h-2 rounded-full bg-[#D6B56D] animate-bounce" />
                  </span>
                  <span className="font-bold">
                    {stage === 'transcribing'
                      ? 'جاري تحويل صوتك إلى نص عربي...'
                      : 'جاري فهم طلبك وتجهيز البيانات...'}
                  </span>
                </div>
              )}

              {/* Editable Recognized Text Panel */}
              {stage === 'editing_transcript' && (
                <div className="bg-white border-2 border-[#32C5E8] rounded-3xl p-4 sm:p-5 shadow-[0_14px_34px_rgba(23,101,165,0.12)] space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <label
                      htmlFor="voice-transcript-editor"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#123F73]"
                    >
                      <Edit3 className="w-4 h-4 text-[#32C5E8]" />
                      <span>الكلام الذي تم التعرف عليه (يمكنك تعديله):</span>
                    </label>
                  </div>

                  <textarea
                    id="voice-transcript-editor"
                    rows={3}
                    value={transcriptText}
                    onChange={(e) => setTranscriptText(e.target.value)}
                    className="w-full rounded-2xl bg-[#F7FAFD] border border-[#DCE6F2] p-3 text-sm text-[#07182E] focus:outline-none focus:border-[#32C5E8] focus:bg-white"
                  />

                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => void submitTextToAnalyze(transcriptText)}
                      disabled={transcriptText.trim().length === 0}
                      className="flex-1 min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-[#07182E] text-white font-bold text-xs sm:text-sm hover:bg-[#1765A5] disabled:opacity-45 transition-colors"
                    >
                      <span>إرسال وتأكيد الكلام</span>
                      <Send className="w-4 h-4 text-[#32C5E8] -scale-x-100" />
                    </button>

                    <button
                      type="button"
                      onClick={() => void startListening()}
                      className="min-h-[44px] inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl border border-[#DCE6F2] text-[#24364B] font-bold text-xs hover:border-[#32C5E8] transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>إعادة المحاولة</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Structured Review & Explicit Confirmation Card */}
              {(stage === 'summary' || draft.serviceType) &&
                stage !== 'listening' &&
                stage !== 'requesting_mic' &&
                stage !== 'transcribing' &&
                stage !== 'analyzing' && (
                  <div className="bg-white border border-[#DCE6F2] rounded-3xl p-4 sm:p-5 shadow-[0_12px_32px_rgba(7,24,46,0.06)] space-y-3.5">
                    <div className="flex items-center justify-between border-b border-[#E5EDF5] pb-3">
                      <h3 className="font-display text-base font-extrabold text-[#07182E] m-0">
                        ملخص طلب الخدمة للمراجعة
                      </h3>
                      <span className="text-[11px] font-bold text-[#1765A5]">
                        بيانات قابلة للتعديل
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="sm:col-span-2">
                        <label className="block font-bold text-[#5A6B7F] mb-1">
                          نوع الخدمة المطلوبة
                        </label>
                        <select
                          value={draft.serviceType || ''}
                          onChange={(e) =>
                            setDraft((prev) => ({
                              ...prev,
                              serviceType: e.target.value as OfficialServiceType,
                            }))
                          }
                          className="w-full min-h-[42px] rounded-xl bg-[#F7FAFD] border border-[#DCE6F2] px-3 text-xs font-bold text-[#07182E] focus:outline-none focus:border-[#32C5E8]"
                        >
                          <option value="">-- اختر الخدمة --</option>
                          {SERVICES_FORM_ENUMS.serviceTypes.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-[#5A6B7F] mb-1">
                          الاسم الكامل
                        </label>
                        <input
                          type="text"
                          value={draft.fullName || ''}
                          onChange={(e) =>
                            setDraft((prev) => ({
                              ...prev,
                              fullName: e.target.value,
                            }))
                          }
                          placeholder="اختياري — يمكن إكماله بالنموذج"
                          className="w-full min-h-[40px] rounded-xl bg-[#F7FAFD] border border-[#DCE6F2] px-3 text-xs text-[#07182E] focus:outline-none focus:border-[#32C5E8]"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-[#5A6B7F] mb-1">
                          رقم الهاتف
                        </label>
                        <input
                          type="tel"
                          dir="ltr"
                          value={draft.phone || ''}
                          onChange={(e) =>
                            setDraft((prev) => ({
                              ...prev,
                              phone: e.target.value,
                            }))
                          }
                          placeholder="77xxxxxxx"
                          className="w-full min-h-[40px] rounded-xl bg-[#F7FAFD] border border-[#DCE6F2] px-3 text-xs text-[#07182E] text-right focus:outline-none focus:border-[#32C5E8]"
                        />
                      </div>

                      {draft.serviceType === 'نقل الخدمة' ? (
                        <>
                          <div>
                            <label className="block font-bold text-[#5A6B7F] mb-1">
                              المنطقة الحالية
                            </label>
                            <input
                              type="text"
                              value={
                                draft.currentDistrict || draft.district || ''
                              }
                              onChange={(e) =>
                                setDraft((prev) => ({
                                  ...prev,
                                  currentDistrict: e.target.value,
                                  district: e.target.value,
                                }))
                              }
                              placeholder="الحي الحالي"
                              className="w-full min-h-[40px] rounded-xl bg-[#F7FAFD] border border-[#DCE6F2] px-3 text-xs text-[#07182E] focus:outline-none focus:border-[#32C5E8]"
                            />
                          </div>
                          <div>
                            <label className="block font-bold text-[#5A6B7F] mb-1">
                              المنطقة الجديدة
                            </label>
                            <input
                              type="text"
                              value={draft.newDistrict || ''}
                              onChange={(e) =>
                                setDraft((prev) => ({
                                  ...prev,
                                  newDistrict: e.target.value,
                                }))
                              }
                              placeholder="الحي الجديد"
                              className="w-full min-h-[40px] rounded-xl bg-[#F7FAFD] border border-[#DCE6F2] px-3 text-xs text-[#07182E] focus:outline-none focus:border-[#32C5E8]"
                            />
                          </div>
                        </>
                      ) : (
                        <div className="sm:col-span-2">
                          <label className="block font-bold text-[#5A6B7F] mb-1">
                            المنطقة أو الحي
                          </label>
                          <input
                            type="text"
                            value={draft.district || ''}
                            onChange={(e) =>
                              setDraft((prev) => ({
                                ...prev,
                                district: e.target.value,
                              }))
                            }
                            placeholder="مثلاً: الشحر - السوق / المنصورة..."
                            className="w-full min-h-[40px] rounded-xl bg-[#F7FAFD] border border-[#DCE6F2] px-3 text-xs text-[#07182E] focus:outline-none focus:border-[#32C5E8]"
                          />
                        </div>
                      )}

                      {draft.serviceType === 'الدعم الفني' && (
                        <div className="sm:col-span-2">
                          <label className="block font-bold text-[#5A6B7F] mb-1">
                            تصنيف المشكلة
                          </label>
                          <select
                            value={draft.supportProblemType || ''}
                            onChange={(e) =>
                              setDraft((prev) => ({
                                ...prev,
                                supportProblemType: e.target.value,
                              }))
                            }
                            className="w-full min-h-[40px] rounded-xl bg-[#F7FAFD] border border-[#DCE6F2] px-3 text-xs text-[#07182E] focus:outline-none focus:border-[#32C5E8]"
                          >
                            <option value="">-- غير محدد --</option>
                            {SERVICES_FORM_ENUMS.supportProblems.map((p) => (
                              <option key={p} value={p}>
                                {p}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      <div className="sm:col-span-2">
                        <label className="block font-bold text-[#5A6B7F] mb-1">
                          تفاصيل الطلب / الملاحظات
                        </label>
                        <textarea
                          rows={2}
                          value={draft.details || ''}
                          onChange={(e) =>
                            setDraft((prev) => ({
                              ...prev,
                              details: e.target.value,
                            }))
                          }
                          placeholder="التفاصيل المستخلصة من كلامك"
                          className="w-full rounded-xl bg-[#F7FAFD] border border-[#DCE6F2] p-2.5 text-xs text-[#07182E] focus:outline-none focus:border-[#32C5E8]"
                        />
                      </div>
                    </div>

                    <p className="text-[11.5px] text-[#5A6B7F] bg-[#EEF4FA] rounded-xl px-3 py-2 m-0">
                      لن يتم فتح أو إرسال الطلب إلا بعد موافقتك. بالضغط أدناه
                      سيُفتح نموذج Google Forms الرسمي معبّأً بالبيانات المتاحة.
                    </p>

                    {confirmedOpened && (
                      <div className="flex items-center gap-2 text-xs font-bold text-[#0E6B60] bg-[#EEF8F6] border border-[#128C7E]/30 rounded-xl px-3 py-2.5">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>
                          تم فتح نموذج الطلب الرسمي بالبيانات المعبأة مسبقًا.
                          أكمل الإرسال في النافذة المفتوحة.
                        </span>
                      </div>
                    )}

                    <a
                      href={prefilledFormUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setConfirmedOpened(true)}
                      className="w-full min-h-[48px] inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold text-[#07182E] shadow-[0_10px_28px_rgba(50,197,232,0.28)] hover:brightness-105 active:scale-[0.98] transition-all"
                      style={{
                        background:
                          'linear-gradient(135deg, #32C5E8 0%, #86E6FC 100%)',
                      }}
                    >
                      <span>تأكيد وفتح نموذج الطلب المعبّأ</span>
                      <ArrowUpLeft className="w-4 h-4" />
                    </a>
                  </div>
                )}

              {/* Error Alert */}
              {errorMsg && (
                <div
                  role="alert"
                  className="bg-[#FFF8EB] border border-[#D6B56D] rounded-2xl p-3.5 text-xs text-[#07182E] flex items-start gap-2.5"
                >
                  <AlertCircle className="w-4 h-4 text-[#9A7426] shrink-0 mt-0.5" />
                  <p className="m-0 leading-relaxed">{errorMsg}</p>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Footer Controls: Primary Mic Trigger + Text Input Fallback */}
            <footer className="shrink-0 p-3.5 sm:p-4 bg-white border-t border-[#DCE6F2] space-y-2.5">
              {stage !== 'listening' &&
                stage !== 'requesting_mic' &&
                stage !== 'transcribing' &&
                stage !== 'editing_transcript' && (
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => void startListening()}
                      disabled={stage === 'analyzing'}
                      className="flex-1 min-h-[48px] inline-flex items-center justify-center gap-2.5 px-5 py-2.5 rounded-2xl bg-[#07182E] text-white font-bold text-sm hover:bg-[#123F73] disabled:opacity-50 active:scale-[0.98] transition-all shadow-[0_8px_22px_rgba(7,24,46,0.18)]"
                    >
                      <Mic className="w-4 h-4 text-[#32C5E8]" />
                      <span>
                        {turns.length > 1
                          ? 'تحدث لإضافة تفاصيل أو الرد'
                          : 'اضغط للتحدث الآن'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTextFallbackMode((v) => !v)}
                      aria-label="الكتابة بدلًا من الصوت"
                      className="min-h-[48px] px-4 rounded-2xl border border-[#DCE6F2] bg-[#F7FAFD] text-[#123F73] font-bold text-xs inline-flex items-center gap-1.5 hover:border-[#32C5E8] transition-colors"
                    >
                      <Keyboard className="w-4 h-4 text-[#1765A5]" />
                      <span>كتابة</span>
                    </button>
                  </div>
                )}

              {(textFallbackMode || !supportsRecording) &&
                stage !== 'listening' &&
                stage !== 'requesting_mic' &&
                stage !== 'transcribing' && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      void submitTextToAnalyze(typedInput);
                    }}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="text"
                      value={typedInput}
                      onChange={(e) => setTypedInput(e.target.value)}
                      maxLength={500}
                      placeholder="اكتب طلبك هنا (مثلاً: أبغى أركب راوتر في الشحر)..."
                      aria-label="كتابة طلب الخدمة نصيًا"
                      className="flex-1 min-h-[44px] rounded-xl bg-[#F7FAFD] border border-[#DCE6F2] px-3.5 text-xs sm:text-sm text-[#07182E] focus:outline-none focus:border-[#32C5E8]"
                    />
                    <button
                      type="submit"
                      disabled={
                        stage === 'analyzing' || typedInput.trim().length === 0
                      }
                      className="min-h-[44px] px-4 rounded-xl bg-[#07182E] text-white font-bold text-xs inline-flex items-center gap-1.5 hover:bg-[#1765A5] disabled:opacity-45 transition-colors"
                    >
                      <span>إرسال</span>
                      <Send className="w-3.5 h-3.5 text-[#32C5E8] -scale-x-100" />
                    </button>
                  </form>
                )}
            </footer>
          </motion.section>
        </div>
      )}
    </AnimatePresence>
  );
}
