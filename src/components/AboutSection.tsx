import React from 'react';
import { Scissors, MapPin, Award, CheckCircle2 } from 'lucide-react';
import { GOOGLE_MAPS_URL } from '../lib/db';

export const AboutSection: React.FC = () => {
  return (
    <section id="about" className="relative py-16 lg:py-24 border-b border-neutral-800/80 bg-[#0C0E12] overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Visual Left */}
          <div className="lg:col-span-5 space-y-4">
            <div className="card-sheen card-lift relative aspect-[4/3] rounded-xl overflow-hidden border border-neutral-800/80 bg-neutral-950 shadow-2xl group cursor-pointer">
              <img 
                src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=1000&q=80" 
                alt="Inside CITY OF FADES barbershop on Leeds Road, Bradford"
                referrerPolicy="no-referrer"
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />
              
              {/* Badge */}
              <div className="absolute top-3 left-3">
                <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-black/80 backdrop-blur-md text-[#D4AF37] border border-[#D4AF37]/40 rounded shadow-md">
                  Leeds Road Studio
                </span>
              </div>

              {/* Bottom tag */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-[#F5F3ED] group-hover:text-[#D4AF37] transition-colors">
                    Modern Barbershop Interior
                  </h4>
                  <p className="text-[11px] text-neutral-300">1202 Leeds Road, Bradford BD3 8LJ</p>
                </div>
                <a
                  href={GOOGLE_MAPS_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 bg-black/70 hover:bg-[#D4AF37] text-neutral-300 hover:text-black border border-neutral-700 hover:border-transparent rounded text-[10px] font-semibold transition-all duration-200"
                >
                  Google Maps
                </a>
              </div>
            </div>

            <div className="card-lift p-4 bg-neutral-900/60 border border-neutral-800/80 rounded-xl text-xs text-neutral-400 space-y-1 shadow-md">
              <div className="flex items-center gap-2 text-[#D4AF37] font-semibold">
                <MapPin className="w-3.5 h-3.5" />
                <span>Laisterdyke Community Roots</span>
              </div>
              <p>
                Situated at 1202 Leeds Road, CITY OF FADES bridges traditional grooming heritage with contemporary razor fade styling.
              </p>
            </div>
          </div>

          {/* Copy Right */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#D4AF37]">
              <Scissors className="w-3.5 h-3.5" />
              <span>Heritage &amp; Craft</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F5F3ED] tracking-tight leading-tight">
              A Barbershop Built on Craftsmanship &amp; Respect in Bradford.
            </h2>

            <div className="space-y-4 text-xs sm:text-sm text-neutral-300 leading-relaxed">
              <p>
                At CITY OF FADES, we believe a great haircut isn't just grooming—it's confidence, sharp geometry, and a welcoming neighborhood space. Located at 1202 Leeds Road in Laisterdyke, we serve clients from across Bradford, Pudsey, and West Yorkshire seeking razor-clean skin fades, bespoke beard contouring, and hot towel relaxation.
              </p>
              <p>
                Every client in our chair receives unhurried attention. We examine natural hair growth patterns, head contours, and personal lifestyle before selecting blade lengths and styling finishes. Whether you are coming in for an urgent weekend touch-up, a complete beard architectural sculpt, or your regular fortnightly skin fade, you can expect precision and genuine hospitality.
              </p>
            </div>

            {/* Core Values (Clean zero-pill layout with hover lift) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-neutral-800">
              <div className="p-3 rounded-lg bg-neutral-900/40 hover:bg-neutral-900/80 border border-neutral-800/60 hover:border-[#D4AF37]/30 transition-all duration-200">
                <span className="text-xs font-bold text-white block mb-1">Razor Symmetry</span>
                <span className="text-xs text-neutral-400 leading-relaxed">Crisp temple tapers, sharp nape lines, and seamless skin blends.</span>
              </div>
              <div className="p-3 rounded-lg bg-neutral-900/40 hover:bg-neutral-900/80 border border-neutral-800/60 hover:border-[#D4AF37]/30 transition-all duration-200">
                <span className="text-xs font-bold text-white block mb-1">Respect for Time</span>
                <span className="text-xs text-neutral-400 leading-relaxed">Live online slot reservations to eliminate endless shop queues.</span>
              </div>
              <div className="p-3 rounded-lg bg-neutral-900/40 hover:bg-neutral-900/80 border border-neutral-800/60 hover:border-[#D4AF37]/30 transition-all duration-200">
                <span className="text-xs font-bold text-white block mb-1">Bradford Pride</span>
                <span className="text-xs text-neutral-400 leading-relaxed">Proudly rooted in Leeds Road with accessible street parking and buses.</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
