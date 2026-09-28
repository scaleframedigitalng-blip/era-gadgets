import React from 'react';
import { useStore } from '../context/StoreContext';
import { MessageCircle } from 'lucide-react';
import { generateGeneralWhatsAppUrl } from '../lib/utils';

export const FloatingWhatsApp: React.FC = () => {
  const { settings, currentView } = useStore();

  // Hide in admin view to avoid clutter
  if (currentView === 'admin' || currentView === 'checkout') return null;

  const url = generateGeneralWhatsAppUrl(
    settings?.whatsappNumber || '2348145550192',
    'Hello Era Gadgets! I would like to inquire about available phones and gadgets.'
  );

  return (
    <aside aria-label="WhatsApp Support" className="fixed bottom-6 right-6 z-30">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Era Gadgets on WhatsApp"
        className="group flex items-center gap-2.5 bg-neutral-900/90 hover:bg-neutral-950 text-white pl-3.5 pr-4 py-2.5 rounded-full shadow-[0_8px_24px_rgba(0,0,0,0.15)] backdrop-blur-md border border-white/10 transition-all duration-300 hover:scale-105 active:scale-95"
      >
        <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0">
          <MessageCircle className="w-3.5 h-3.5 fill-white stroke-none" />
        </div>
        <span className="text-xs font-semibold tracking-tight">Chat on WhatsApp</span>
      </a>
    </aside>
  );
};
