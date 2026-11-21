import React, { createContext, useCallback, useContext, useState } from 'react';

interface VoiceRequestContextValue {
  isVoiceOpen: boolean;
  openVoiceModal: () => void;
  closeVoiceModal: () => void;
}

const VoiceRequestContext = createContext<VoiceRequestContextValue | null>(null);

export function VoiceRequestProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);

  const openVoiceModal = useCallback(() => setIsVoiceOpen(true), []);
  const closeVoiceModal = useCallback(() => setIsVoiceOpen(false), []);

  return (
    <VoiceRequestContext.Provider
      value={{ isVoiceOpen, openVoiceModal, closeVoiceModal }}
    >
      {children}
    </VoiceRequestContext.Provider>
  );
}

export function useVoiceRequest(): VoiceRequestContextValue {
  const ctx = useContext(VoiceRequestContext);
  if (!ctx) {
    throw new Error('useVoiceRequest must be used inside VoiceRequestProvider');
  }
  return ctx;
}
