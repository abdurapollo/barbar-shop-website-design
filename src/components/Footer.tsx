import React from 'react';
import { MapPin, Phone, ShieldCheck, Lock } from 'lucide-react';
import { PolicyType } from './PolicyModals';
import { GOOGLE_MAPS_URL } from '../lib/db';

interface FooterProps {
  onOpenBooking: () => void;
  onOpenManageBooking: () => void;
  onOpenPolicy: (type: PolicyType) => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenBooking,
  onOpenManageBooking,
  onOpenPolicy,
  onOpenAdmin
}) => {
  return (
    <footer className="bg-[#090A0C] border-t border-neutral-900 text-neutral-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          
          {/* Brand & Address Column */}
          <div className="md:col-span-2 space-y-4">
            <span 
              className="text-xl font-extrabold tracking-widest text-[#F5F3ED] block uppercase"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              CITY OF FADES
            </span>
            <p className="text-xs text-neutral-400 max-w-sm leading-relaxed">
              Premium barbershop in Bradford specialising in skin fades, architectural beard contouring, razor lines, and classic styling.
            </p>
            
            <div className="space-y-2 pt-2 text-xs">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                <span>1202 Leeds Road, Laisterdyke, Bradford BD3 8LJ, UK</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <a href="tel:01274010658" className="hover:text-[#D4AF37] font-mono">01274 010658</a>
              </div>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-[#F5F3ED]">Navigation</h4>
            <ul className="space-y-2">
              <li><a href="#services" className="hover:text-white transition-colors">Services &amp; Pricing</a></li>
              <li><a href="#gallery" className="hover:text-white transition-colors">Style Portfolio</a></li>
              <li><a href="#team" className="hover:text-white transition-colors">Barber Team</a></li>
              <li><a href="#location" className="hover:text-white transition-colors">Opening Hours</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
              <li>
                <button 
                  onClick={onOpenManageBooking} 
                  className="hover:text-[#D4AF37] transition-colors cursor-pointer text-left"
                >
                  Lookup Appointment
                </button>
              </li>
            </ul>
          </div>

          {/* Legal & Governance */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-[#F5F3ED]">Policies &amp; Access</h4>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => onOpenPolicy('privacy')} 
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Privacy Policy (UK GDPR)
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onOpenPolicy('terms')} 
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Terms &amp; Conditions
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onOpenPolicy('cancellation')} 
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Cancellation Policy
                </button>
              </li>
              <li className="pt-2 border-t border-neutral-900/80 mt-2">
                <button
                  onClick={onOpenAdmin}
                  className="inline-flex items-center gap-2 py-1 text-neutral-400 hover:text-[#D4AF37] text-xs transition-colors cursor-pointer group"
                >
                  <Lock className="w-3.5 h-3.5 text-[#D4AF37] group-hover:scale-110 transition-transform" />
                  <span className="font-medium text-neutral-300 group-hover:text-[#D4AF37]">
                    Admin Portal Sign In &amp; Setup
                  </span>
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar (Quiet copyright) */}
        <div className="pt-8 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-neutral-500">
          <div>
            &copy; {new Date().getFullYear()} CITY OF FADES · Bradford, UK. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <a 
              href={GOOGLE_MAPS_URL} 
              target="_blank" 
              rel="noreferrer"
              className="hover:text-[#D4AF37] transition-colors"
            >
              Google Maps Listing
            </a>
            <span>·</span>
            <span className="font-mono">Timezone: Europe/London</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
