import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';

export const getAppBaseUrl = () => {
    return window.location.origin;
};
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import StorePage from './pages/StorePage';
import DashboardPage from './pages/DashboardPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import PricingPage from './pages/PricingPage';
import { AppProvider } from './contexts/AppContext';
import CreatorSitePage from './pages/CreatorSitePage'; 
import EditEBookPage from './pages/EditEBookPage'; 
import EbookStudioPage from './pages/EbookStudioPage';
import EbookReaderPage from './pages/EbookReaderPage';
import HostingPreviewPage from './pages/HostingPreviewPage';
import LoadingScreen from './components/LoadingScreen';
import { useAppContext } from './contexts/AppContext';
import { AnimatePresence, motion } from 'framer-motion';

// Policy Pages
import ContactPage from './pages/ContactPage';
import ShippingPolicyPage from './pages/ShippingPolicyPage';
import RefundPolicyPage from './pages/RefundPolicyPage';
import TermsPage from './pages/TermsPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';

const AnimatedRoutes = () => {
    const location = useLocation();

    React.useLayoutEffect(() => {
        window.scrollTo(0, 0);
    }, [location.pathname]);
    
    return (
        <AnimatePresence>
            <motion.div 
                key={location.pathname} 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex-grow flex flex-col"
            >
                  <Routes location={location}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/store" element={<StorePage />} />
                    <Route path="/pricing" element={<PricingPage />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/dashboard/:tab" element={<DashboardPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/s/:slug" element={<CreatorSitePage />} />
                    <Route path="/site/:username" element={<HostingPreviewPage />} />
                    <Route path="/edit-ebook/:bookId" element={<EditEBookPage />} />
                    <Route path="/ebook-studio" element={<EbookStudioPage />} />
                    <Route path="/read/:bookId" element={<EbookReaderPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/shipping-policy" element={<ShippingPolicyPage />} />
                    <Route path="/refund-policy" element={<RefundPolicyPage />} />
                    <Route path="/terms-and-conditions" element={<TermsPage />} />
                    <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                  </Routes>
            </motion.div>
        </AnimatePresence>
    );
};

const AppContent: React.FC = () => {
  const { isInitialAuthCheck } = useAppContext();
  const location = useLocation();
  
  const isDashboardRoute = location.pathname.startsWith('/dashboard') || 
                           location.pathname.startsWith('/ebook-studio') ||
                           location.pathname.startsWith('/read/') ||
                           location.pathname.startsWith('/edit-ebook/');

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 font-sans text-zinc-100 overflow-x-hidden relative selection:bg-zinc-100/10">
      <div className="flex-grow relative z-10 flex flex-col w-full"> 
        {!isDashboardRoute && <Navbar />}
        <main className="flex-grow flex flex-col">
            <AnimatedRoutes />
        </main>
        {!isDashboardRoute && <Footer />}
      </div>
      <Analytics />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AppProvider>
  );
};

export default App;
