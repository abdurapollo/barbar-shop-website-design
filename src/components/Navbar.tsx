import React, { useState, useEffect } from 'react';
import { Menu, X, CalendarCheck, PhoneCall, Sparkles } from 'lucide-react';

interface NavbarProps {
  onOpenBooking: () => void;
  onOpenManageBooking: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onOpenBooking, 
  onOpenManageBooking 
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        isScrolled 
          ? 'bg-[#0B0C0E]/95 backdrop-blur-md border-b border-[#D4AF37]/20 shadow-[0_4px_24px_rgba(0,0,0,0.7)]' 
          : 'bg-[#0B0C0E]/80 backdrop-blur-sm border-b border-neutral-800/80'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-20">
          
          {/* Zone 1: Brand Wordmark with subtle gold glow on hover */}
          <a 
            href="#top" 
            className="group flex items-center gap-2.5 text-xl sm:text-2xl font-extrabold tracking-widest text-[#F5F3ED] hover:text-[#D4AF37] transition-colors whitespace-nowrap shrink-0 uppercase"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            <span className="relative">
              CITY OF FADES
              <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#D4AF37] transition-all duration-300 group-hover:w-full" />
            </span>
          </a>

          {/* Zone 2: Navigation Links with Animated Underline Micro-Interactions */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-neutral-300">
            <a 
              href="#services" 
              className="relative py-1 text-neutral-300 hover:text-[#F5F3ED] transition-colors whitespace-nowrap after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 hover:after:w-full after:h-[2px] after:bg-[#D4AF37] after:transition-all after:duration-200"
            >
              Services
            </a>
            <a 
              href="#gallery" 
              className="relative py-1 text-neutral-300 hover:text-[#F5F3ED] transition-colors whitespace-nowrap after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 hover:after:w-full after:h-[2px] after:bg-[#D4AF37] after:transition-all after:duration-200"
            >
              Gallery
            </a>
            <a 
              href="#team" 
              className="relative py-1 text-neutral-300 hover:text-[#F5F3ED] transition-colors whitespace-nowrap after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 hover:after:w-full after:h-[2px] after:bg-[#D4AF37] after:transition-all after:duration-200"
            >
              Team
            </a>
            <a 
              href="#location" 
              className="relative py-1 text-neutral-300 hover:text-[#F5F3ED] transition-colors whitespace-nowrap after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 hover:after:w-full after:h-[2px] after:bg-[#D4AF37] after:transition-all after:duration-200"
            >
              Location &amp; Hours
            </a>
            <a 
              href="#faq" 
              className="relative py-1 text-neutral-300 hover:text-[#F5F3ED] transition-colors whitespace-nowrap after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 hover:after:w-full after:h-[2px] after:bg-[#D4AF37] after:transition-all after:duration-200"
            >
              FAQ
            </a>
            <button 
              onClick={onOpenManageBooking}
              className="text-neutral-400 hover:text-[#D4AF37] text-xs transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 py-1 px-2.5 rounded-md hover:bg-neutral-800/60 cursor-pointer"
              title="Lookup your appointment using your booking reference"
            >
              <CalendarCheck className="w-3.5 h-3.5" />
              <span>My Booking</span>
            </button>
          </nav>

          {/* Zone 3: Primary Action + Direct Contact */}
          <div className="hidden sm:flex items-center gap-4 shrink-0">
            <a 
              href="tel:01274010658" 
              className="hidden xl:flex items-center gap-2 text-xs text-neutral-300 hover:text-[#D4AF37] transition-all whitespace-nowrap shrink-0 font-mono py-1 px-2.5 rounded hover:bg-neutral-900 group"
            >
              <PhoneCall className="w-3.5 h-3.5 text-[#D4AF37] group-hover:scale-110 transition-transform" />
              <span>01274 010658</span>
            </a>
            
            <button
              onClick={onOpenBooking}
              className="btn-shimmer px-5 py-2.5 text-sm font-semibold text-[#0B0C0E] bg-[#D4AF37] hover:bg-[#E5C158] rounded-md transition-all shadow-[0_4px_16px_rgba(212,175,55,0.25)] hover:shadow-[0_6px_24px_rgba(212,175,55,0.4)] whitespace-nowrap shrink-0 active:scale-[0.98] cursor-pointer"
            >
              Book Appointment
            </button>
          </div>

          {/* Mobile menu trigger */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={onOpenBooking}
              className="btn-shimmer px-3.5 py-1.5 text-xs font-semibold text-[#0B0C0E] bg-[#D4AF37] rounded-md whitespace-nowrap shrink-0 active:scale-95"
            >
              Book
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-neutral-400 hover:text-white rounded-md focus:outline-none focus:ring-1 focus:ring-[#D4AF37] transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-[#D4AF37]" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer with smooth appearance */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-[#0F1115]/98 backdrop-blur-xl border-b border-[#D4AF37]/30 px-4 pt-3 pb-6 space-y-3 shadow-2xl transition-all">
          <nav className="flex flex-col space-y-2 text-sm font-medium text-neutral-200">
            <a 
              href="#services" 
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 px-3 rounded hover:bg-neutral-800/80 hover:text-[#D4AF37] transition-colors"
            >
              Services &amp; Pricing
            </a>
            <a 
              href="#gallery" 
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 px-3 rounded hover:bg-neutral-800/80 hover:text-[#D4AF37] transition-colors"
            >
              Gallery &amp; Cuts
            </a>
            <a 
              href="#team" 
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 px-3 rounded hover:bg-neutral-800/80 hover:text-[#D4AF37] transition-colors"
            >
              Barber Team
            </a>
            <a 
              href="#location" 
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 px-3 rounded hover:bg-neutral-800/80 hover:text-[#D4AF37] transition-colors"
            >
              Location &amp; Opening Hours
            </a>
            <a 
              href="#faq" 
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 px-3 rounded hover:bg-neutral-800/80 hover:text-[#D4AF37] transition-colors"
            >
              Frequently Asked Questions
            </a>
            <button 
              onClick={() => { setMobileMenuOpen(false); onOpenManageBooking(); }}
              className="w-full text-left py-2.5 px-3 rounded hover:bg-neutral-800/80 transition-colors text-[#D4AF37] flex items-center gap-2 cursor-pointer font-medium"
            >
              <CalendarCheck className="w-4 h-4" />
              Lookup / Manage Booking
            </button>
          </nav>
          
          <div className="pt-3 border-t border-neutral-800 text-xs text-neutral-400 space-y-1.5">
            <p>1202 Leeds Road, Bradford BD3 8LJ</p>
            <a href="tel:01274010658" className="text-[#D4AF37] font-mono block hover:underline">01274 010658</a>
          </div>
        </div>
      )}
    </header>
  );
};
