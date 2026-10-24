import React from 'react';
import { MapPin, Phone, Clock, ArrowRight, ShieldAlert, Sparkles, Star, Award } from 'lucide-react';
import { GOOGLE_MAPS_URL } from '../lib/db';

interface HeroProps {
  onOpenBooking: () => void;
  unconfirmedNoticeActive: boolean;
}

export const Hero: React.FC<HeroProps> = ({ 
  onOpenBooking, 
  unconfirmedNoticeActive
}) => {
  return (
    <section id="top" className="relative pt-8 pb-16 lg:pt-16 lg:pb-24 border-b border-neutral-800/80 overflow-hidden">
      {/* Background ambient lighting with pulse-ambient effects */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#D4AF37]/10 rounded-full blur-[120px] pointer-events-none pulse-ambient" />
      <div className="absolute bottom-0 left-10 w-[420px] h-[420px] bg-[#D4AF37]/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-neutral-800/20 rounded-full blur-[90px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Floating Verified Trust Pill */}
        <div className="mb-6 inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-neutral-900/90 border border-[#D4AF37]/35 shadow-[0_2px_12px_rgba(212,175,55,0.15)] floating-subtle backdrop-blur-md">
          <div className="flex items-center text-[#D4AF37]">
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            <span className="flex items-center gap-0.5 text-xs font-semibold">
              <Star className="w-3 h-3 fill-[#D4AF37] text-[#D4AF37]" />
              4.8 Rated
            </span>
          </div>
          <span className="w-1 h-1 rounded-full bg-[#D4AF37]" />
          <span className="text-xs text-neutral-300 font-medium">1202 Leeds Road, Bradford</span>
          <span className="w-1 h-1 rounded-full bg-emerald-500" />
          <span className="text-[11px] text-emerald-400 font-semibold tracking-wide uppercase">Open Today</span>
        </div>

        {/* Provisional Owner Notice Banner if active */}
        {unconfirmedNoticeActive && (
          <div className="mb-8 p-3.5 bg-neutral-900/90 border border-[#D4AF37]/30 rounded-lg flex items-center gap-3 text-xs text-neutral-300 shadow-md">
            <ShieldAlert className="w-4 h-4 text-[#D4AF37] shrink-0" />
            <span>
              <strong className="text-[#F5F3ED]">Provisional Configuration Notice:</strong> Services and pricing are initial suggested entries awaiting owner sign-off.
            </span>
          </div>
        )}

        {/* 2-Column Split: Copy on Left, Visual Showcase on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          <div className="lg:col-span-7 space-y-6">
            
            {/* Zero-Pill Unboxed Location Metadata */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-neutral-400">
              <span className="text-[#D4AF37] font-semibold">1202 Leeds Road, Laisterdyke</span>
              <span aria-hidden="true" className="text-neutral-600">·</span>
              <span>Bradford BD3 8LJ</span>
              <span aria-hidden="true" className="text-neutral-600">·</span>
              <span>Europe/London</span>
            </div>

            {/* Headline with text-wrap: balance & golden gradient shimmer */}
            <h1 
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#F5F3ED] leading-[1.08]"
              style={{ textWrap: 'balance' }}
            >
              Precision Skin Fades &amp; Architectural Beard Craft in <span className="gold-gradient-text">Bradford.</span>
            </h1>

            {/* Subtitle / Proposition */}
            <p className="text-base sm:text-lg text-neutral-300 max-w-2xl leading-relaxed">
              Step into CITY OF FADES on Leeds Road. Modern barbering built on razor-sharp taper lines, custom beard contouring, and hot towel precision. Book online with zero wait or walk in.
            </p>

            {/* Primary Action Group with Shimmer & Spring States */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <button
                onClick={onOpenBooking}
                className="btn-shimmer group px-7 py-3.5 text-base font-bold text-[#0B0C0E] bg-[#D4AF37] hover:bg-[#E5C158] rounded-md transition-all duration-300 shadow-[0_8px_24px_rgba(212,175,55,0.3)] hover:shadow-[0_12px_32px_rgba(212,175,55,0.5)] flex items-center justify-center gap-2.5 cursor-pointer active:scale-[0.98]"
              >
                <span>Book Appointment</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>

              <a
                href="#services"
                className="group px-6 py-3.5 text-base font-medium text-[#F5F3ED] bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-700/80 hover:border-[#D4AF37]/50 rounded-md transition-all text-center cursor-pointer flex items-center justify-center gap-2"
              >
                <span>View Services &amp; Prices</span>
                <span className="text-[#D4AF37] group-hover:translate-y-0.5 transition-transform duration-300">↓</span>
              </a>
            </div>

            {/* Verified Location & Phone Trust Strip */}
            <div className="pt-6 border-t border-neutral-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-neutral-400">
              <div className="group flex items-start gap-2.5 p-2 rounded-lg hover:bg-neutral-900/50 transition-colors">
                <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                <div>
                  <div className="font-semibold text-neutral-200">1202 Leeds Road</div>
                  <div>Laisterdyke, Bradford</div>
                </div>
              </div>

              <div className="group flex items-start gap-2.5 p-2 rounded-lg hover:bg-neutral-900/50 transition-colors">
                <Phone className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                <div>
                  <div className="font-semibold text-neutral-200">Direct Telephone</div>
                  <a href="tel:01274010658" className="hover:text-[#D4AF37] font-mono transition-colors">01274 010658</a>
                </div>
              </div>

              <div className="group flex items-start gap-2.5 p-2 rounded-lg hover:bg-neutral-900/50 transition-colors">
                <Clock className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                <div>
                  <div className="font-semibold text-neutral-200">Open 7 Days</div>
                  <div>Mon-Sat 10:00 · Sun 11:00</div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Visual Bento Showcase with Sheen and Card Lift */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            
            {/* Primary Hero Cut Showcase */}
            <div className="card-sheen card-lift relative aspect-[16/10] sm:aspect-[4/3] rounded-xl overflow-hidden border border-neutral-800/80 bg-neutral-950 shadow-2xl group cursor-pointer">
              <img 
                src="https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=1000&q=80" 
                alt="Signature Skin Fade at City of Fades Bradford"
                referrerPolicy="no-referrer"
                loading="eager"
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent pointer-events-none" />
              
              {/* Top Floating Badge */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-black/80 backdrop-blur-md text-[#D4AF37] border border-[#D4AF37]/40 rounded shadow-md">
                  Signature Cut
                </span>
                <a
                  href={GOOGLE_MAPS_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 text-[10px] font-bold bg-black/85 backdrop-blur-md text-amber-400 border border-amber-500/40 rounded flex items-center gap-1 hover:border-[#D4AF37] hover:bg-black transition-all shadow-md"
                >
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>4.8 on Google Maps</span>
                </a>
              </div>

              {/* Bottom Captions */}
              <div className="absolute bottom-3 left-3 right-3">
                <div className="text-[11px] text-[#D4AF37] font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5" />
                  <span>Bradford Precision</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-[#F5F3ED] leading-tight group-hover:text-[#D4AF37] transition-colors">
                  Signature Zero Razor Skin Fade
                </h3>
                <p className="text-xs text-neutral-300 mt-0.5 opacity-90">
                  Seamless foil transition &amp; razor-sharp temple lines
                </p>
              </div>
            </div>

            {/* Split Lower Cards with Hover Sheen */}
            <div className="grid grid-cols-2 gap-4">
              
              {/* Beard Card */}
              <div className="card-sheen card-lift relative aspect-[4/3] rounded-xl overflow-hidden border border-neutral-800/80 bg-neutral-950 shadow-lg group cursor-pointer">
                <img 
                  src="https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=600&q=80" 
                  alt="Beard Contouring and Straight Razor Line"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none" />
                <div className="absolute bottom-2.5 left-2.5 right-2.5">
                  <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider block">Grooming</span>
                  <h4 className="text-xs sm:text-sm font-bold text-[#F5F3ED] leading-tight group-hover:text-[#D4AF37] transition-colors">
                    Beard Contouring
                  </h4>
                  <p className="text-[10px] text-neutral-300 line-clamp-1">Hot razor cheek sculpt</p>
                </div>
              </div>

              {/* Interior Studio Card */}
              <div className="card-sheen card-lift relative aspect-[4/3] rounded-xl overflow-hidden border border-neutral-800/80 bg-neutral-950 shadow-lg group cursor-pointer">
                <img 
                  src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=600&q=80" 
                  alt="CITY OF FADES Bradford Studio Interior"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none" />
                <div className="absolute bottom-2.5 left-2.5 right-2.5">
                  <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider block">1202 Leeds Rd</span>
                  <h4 className="text-xs sm:text-sm font-bold text-[#F5F3ED] leading-tight group-hover:text-[#D4AF37] transition-colors">
                    Modern Studio
                  </h4>
                  <p className="text-[10px] text-neutral-300 line-clamp-1">Luxury leather chairs</p>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
