import React from 'react';
import { MapPin, Phone, Navigation, Car, Bus, ExternalLink, Sparkles } from 'lucide-react';
import { BusinessDayHours } from '../types';
import { OpeningHoursSection } from './OpeningHoursSection';
import { GOOGLE_MAPS_URL } from '../lib/db';

interface FindUsSectionProps {
  businessHours: BusinessDayHours[];
}

export const FindUsSection: React.FC<FindUsSectionProps> = ({
  businessHours
}) => {
  return (
    <section id="location" className="relative py-16 lg:py-24 border-b border-neutral-800/80 bg-[#0B0C0E] overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#D4AF37] mb-2">
            <MapPin className="w-3.5 h-3.5" />
            <span>Bradford Barbershop Location</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F5F3ED] tracking-tight">
            Find Us on Leeds Road
          </h2>
          <p className="text-sm text-neutral-400 mt-2 max-w-2xl">
            Conveniently situated in Laisterdyke on the main Leeds Road arterial route connecting Bradford and Pudsey/Leeds.
          </p>
        </div>

        {/* 2-Column Grid: Location & Directions on Left, Hours & Map on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Contact Cards & Transit Tips */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Primary Address & Phone Card with Card Lift */}
            <div className="card-lift bg-[#121418] hover:bg-[#16181E] border border-neutral-800 rounded-xl p-6 space-y-4 shadow-lg transition-all duration-300">
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#D4AF37]">Shop Address</span>
                <h3 className="text-lg font-bold text-[#F5F3ED]">CITY OF FADES</h3>
                <p className="text-sm text-neutral-300 leading-relaxed">
                  1202 Leeds Road, Laisterdyke<br />
                  Bradford, BD3 8LJ<br />
                  West Yorkshire, United Kingdom
                </p>
              </div>

              <div className="pt-3 border-t border-neutral-800/80 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#D4AF37] block">Telephone Bookings &amp; Inquiries</span>
                <a 
                  href="tel:01274010658" 
                  className="group inline-flex items-center gap-2.5 text-lg font-mono font-bold text-[#F5F3ED] hover:text-[#D4AF37] transition-colors"
                >
                  <Phone className="w-4 h-4 text-[#D4AF37] group-hover:scale-110 transition-transform" />
                  <span>01274 010658</span>
                </a>
              </div>

              <div className="pt-2">
                <a
                  href={GOOGLE_MAPS_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-shimmer inline-flex items-center gap-2 px-4 py-2.5 bg-neutral-900 hover:bg-[#D4AF37] border border-neutral-700/80 hover:border-transparent rounded-lg text-xs font-bold text-[#F5F3ED] hover:text-[#0B0C0E] transition-all duration-300 shadow-sm"
                >
                  <Navigation className="w-3.5 h-3.5 text-[#D4AF37] group-hover:text-[#0B0C0E]" />
                  <span>Open in Google Maps</span>
                  <ExternalLink className="w-3 h-3 text-neutral-400" />
                </a>
              </div>
            </div>

            {/* Storefront Visual & Parking Information */}
            <div className="card-lift bg-[#121418] border border-neutral-800 rounded-xl overflow-hidden shadow-lg transition-all duration-300">
              <div className="relative aspect-[16/9] w-full bg-neutral-950 overflow-hidden group">
                <img 
                  src="https://images.unsplash.com/photo-1512690459411-b9245aed614b?auto=format&fit=crop&w=800&q=80" 
                  alt="City of Fades Bradford Barbershop Storefront Entrance" 
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />
                <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-xs">
                  <span className="font-bold text-[#F5F3ED]">1202 Leeds Road Storefront</span>
                  <span className="text-[10px] text-[#D4AF37] uppercase font-semibold">Street Entrance</span>
                </div>
              </div>

              <div className="p-5 space-y-3.5 text-xs">
                <h4 className="font-bold text-[#F5F3ED] text-sm">Getting Here &amp; Parking</h4>
                
                <div className="flex items-start gap-3 text-neutral-400 group/car">
                  <Car className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5 group-hover/car:scale-110 transition-transform" />
                  <div>
                    <strong className="text-neutral-200">Street Parking:</strong> Dedicated parking bays and side-street parking available along Leeds Road and adjacent streets.
                  </div>
                </div>

                <div className="flex items-start gap-3 text-neutral-400 group/bus">
                  <Bus className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5 group-hover/bus:scale-110 transition-transform" />
                  <div>
                    <strong className="text-neutral-200">Bus Connections:</strong> Frequent buses (including Leeds-Bradford lines 72 and X6) stop within 2 minutes walk of the shop.
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Opening Hours & Interactive Map */}
          <div className="lg:col-span-7 space-y-6">
            <OpeningHoursSection 
              businessHours={businessHours} 
            />

            {/* Google Maps Embed / Container with Hover Glow */}
            <div className="card-lift bg-[#121418] border border-neutral-800 rounded-xl overflow-hidden shadow-lg h-72 relative group">
              <iframe
                title="CITY OF FADES Google Maps Location"
                src="https://maps.google.com/maps?q=1202+Leeds+Road,+Bradford+BD3+8LJ,+UK&t=&z=15&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) contrast(100%)' }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <div className="absolute bottom-3 right-3">
                <a
                  href={GOOGLE_MAPS_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-[#0B0C0E]/90 hover:bg-[#0B0C0E] border border-neutral-700 hover:border-[#D4AF37]/50 text-xs font-semibold text-[#D4AF37] rounded-md shadow-lg flex items-center gap-1.5 transition-all group-hover:scale-105"
                >
                  <span>View Verified Google Place</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
