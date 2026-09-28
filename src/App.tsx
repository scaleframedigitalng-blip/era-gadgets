import React, { useEffect, useState } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { SearchModal } from './components/SearchModal';
import { CartDrawer } from './components/CartDrawer';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { InvoiceView } from './components/InvoiceView';

import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { DealsPage } from './pages/DealsPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { ContactPage } from './pages/ContactPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { Order } from './types';
import { api } from './lib/api';

const AppContent: React.FC = () => {
  const { currentView, setCurrentView, settings, loading } = useStore();
  const [tokenOrder, setTokenOrder] = useState<Order | null>(null);
  const [tokenLoading, setTokenLoading] = useState(false);
  const [tokenError, setTokenError] = useState('');

  // Check URL params for secure customer invoice token (?invoice_token=...)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const invoiceToken = params.get('invoice_token') || params.get('token');
    if (invoiceToken) {
      setTokenLoading(true);
      api
        .getOrderByToken(invoiceToken)
        .then((ord) => {
          setTokenOrder(ord);
        })
        .catch((err) => {
          setTokenError('The requested invoice or order could not be located or has expired.');
        })
        .finally(() => {
          setTokenLoading(false);
        });
    }
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [currentView]);

  if (loading || tokenLoading) {
    return (
      <div className="min-h-screen bg-[#FBFBFB] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-neutral-950 flex items-center justify-center text-white font-bold text-xs shadow-md animate-pulse">
            ERA
          </div>
          <p className="text-xs font-semibold text-neutral-400 tracking-wider uppercase">
            Loading Era Gadgets...
          </p>
        </div>
      </div>
    );
  }

  // If customer is accessing their secure invoice link
  if (tokenOrder) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FBFBFB] text-neutral-950">
        <Navbar />
        <main className="flex-1 pt-24 sm:pt-28 pb-28 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <InvoiceView
            order={tokenOrder}
            settings={settings}
            onBack={() => {
              window.history.replaceState({}, '', '/');
              setTokenOrder(null);
              setCurrentView('shop');
            }}
          />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBFB] text-neutral-950">
      {/* Top sticky navigation (hidden on admin screen for clean workspace) */}
      {currentView !== 'admin' && <Navbar />}

      {/* Main View Router */}
      <main className="flex-1">
        {currentView === 'home' && <HomePage />}
        {currentView === 'shop' && <ShopPage />}
        {currentView === 'product' && <ProductDetailPage />}
        {currentView === 'deals' && <DealsPage />}
        {currentView === 'checkout' && <CheckoutPage />}
        {currentView === 'order-success' && <OrderConfirmationPage />}
        {currentView === 'contact' && <ContactPage />}
        {currentView === 'admin' && <AdminDashboard />}
      </main>

      {/* Global interactive overlays */}
      <SearchModal />
      <CartDrawer />
      <FloatingWhatsApp />

      {/* Footer */}
      {currentView !== 'admin' && <Footer />}
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}
