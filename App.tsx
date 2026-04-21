
import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
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

// Policy Pages
import ContactPage from './pages/ContactPage';
import ShippingPolicyPage from './pages/ShippingPolicyPage';
import RefundPolicyPage from './pages/RefundPolicyPage';
import TermsPage from './pages/TermsPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';

const AnimatedRoutes = () => {
    const location = useLocation();

    // Scroll to top whenever the route changes
    React.useLayoutEffect(() => {
        window.scrollTo(0, 0);
    }, [location.pathname]);
    
    return (
        <div key={location.pathname} className="flex-grow flex flex-col animate-page-enter will-change-transform origin-top">
              <Routes location={location}>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/store" element={<StorePage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                {/* Internal Creator Page */}
                <Route path="/s/:slug" element={<CreatorSitePage />} />
                {/* Standalone Hosting Preview */}
                <Route path="/site/:username" element={<HostingPreviewPage />} />
                
                <Route path="/edit-ebook/:bookId" element={<EditEBookPage />} />
                <Route path="/ebook-studio" element={<EbookStudioPage />} />
                <Route path="/read/:bookId" element={<EbookReaderPage />} />
                
                {/* Policy Routes */}
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/shipping-policy" element={<ShippingPolicyPage />} />
                <Route path="/refund-policy" element={<RefundPolicyPage />} />
                <Route path="/terms-and-conditions" element={<TermsPage />} />
                <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
              </Routes>
        </div>
    );
};

const AppContent: React.FC = () => {
  const { isInitialAuthCheck } = useAppContext();

  if (isInitialAuthCheck) {
    return <LoadingScreen />;
  }

  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen bg-black font-sans text-foreground overflow-x-hidden relative">
        
        {/* === Foreground Content === */}
        <div className="flex-grow relative z-10 flex flex-col w-full"> 
          <Navbar />
          <main className="flex-grow flex flex-col">
              <AnimatedRoutes />
          </main>
          <Footer />
        </div>
        
      </div>
    </BrowserRouter>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
