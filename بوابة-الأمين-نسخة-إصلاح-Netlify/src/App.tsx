import { AnimatePresence, MotionConfig, motion, useReducedMotion } from 'motion/react';
import { AlAmeenAssistant } from './components/AlAmeenAssistant';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { VoiceServiceModal } from './components/VoiceServiceModal';
import { RouterProvider, useRouter } from './context/RouterContext';
import { VoiceRequestProvider } from './context/VoiceRequestContext';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { HomePage } from './pages/HomePage';
import { InternetCardsPage } from './pages/InternetCardsPage';
import { RequestPage } from './pages/RequestPage';
import { ServicesPage } from './pages/ServicesPage';
import { SupportPage } from './pages/SupportPage';

function PageContent() {
  const { currentPath } = useRouter();
  const shouldReduceMotion = useReducedMotion();

  const renderPage = () => {
    switch (currentPath) {
      case '/about':
        return <AboutPage />;
      case '/services':
        return <ServicesPage />;
      case '/internet-cards':
        return <InternetCardsPage />;
      case '/request':
        return <RequestPage />;
      case '/support':
        return <SupportPage />;
      case '/contact':
        return <ContactPage />;
      case '/':
      default:
        return <HomePage />;
    }
  };

  if (shouldReduceMotion) {
    return <>{renderPage()}</>;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentPath}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      >
        {renderPage()}
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <RouterProvider>
        <VoiceRequestProvider>
          <div className="min-h-screen flex flex-col bg-[#F7FAFD] text-[#24364B]">
            <Header />
            <main className="flex-1">
              <PageContent />
            </main>
            <Footer />
            <AlAmeenAssistant />
            <VoiceServiceModal />
          </div>
        </VoiceRequestProvider>
      </RouterProvider>
    </MotionConfig>
  );
}
