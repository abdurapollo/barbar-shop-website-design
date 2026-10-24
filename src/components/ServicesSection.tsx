import React, { useState } from 'react';
import { Service } from '../types';
import { Clock, Scissors, Info, ArrowUpRight, Sparkles } from 'lucide-react';

interface ServicesSectionProps {
  services: Service[];
  onSelectServiceToBook: (serviceId: string) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  services,
  onSelectServiceToBook
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories: { label: string; value: string }[] = [
    { label: 'All Services', value: 'all' },
    { label: 'Fades & Tapers', value: 'fades' },
    { label: 'Haircuts', value: 'haircuts' },
    { label: 'Beards & Shaves', value: 'beards' },
    { label: 'Full Packages', value: 'combos' },
    { label: 'Junior & Students', value: 'junior' },
  ];

  const filteredServices = activeCategory === 'all' 
    ? services.filter(s => s.is_active)
    : services.filter(s => s.is_active && s.category === activeCategory);

  return (
    <section id="services" className="relative py-16 lg:py-24 border-b border-neutral-800/80 bg-[#0E1013]/60 overflow-hidden">
      {/* Subtle ambient light */}
      <div className="absolute top-1/3 left-0 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#D4AF37] mb-2">
              <Scissors className="w-3.5 h-3.5" />
              <span>Menu &amp; Grooming Roster</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F5F3ED] tracking-tight">
              Services &amp; Pricing
            </h2>
            <p className="text-sm text-neutral-400 mt-2 max-w-xl">
              All prices shown in British Pounds (GBP). Book your preferred specialist online or pay in shop upon completion.
            </p>
          </div>

          {/* Owner Notice Alert */}
          <div className="p-3 bg-neutral-900/90 border border-neutral-800 rounded-lg text-xs text-neutral-400 max-w-md shadow-sm">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
              <span>Initial rates are provisional awaiting shop owner verification.</span>
            </div>
          </div>
        </div>

        {/* Category Filter Controls */}
        <div className="flex items-center gap-1.5 p-1.5 bg-neutral-900/90 rounded-xl border border-neutral-800/80 overflow-x-auto mb-8 max-w-fit shadow-md">
          {categories.map(cat => {
            const count = cat.value === 'all' 
              ? services.filter(s => s.is_active).length 
              : services.filter(s => s.is_active && s.category === cat.value).length;

            const isActive = activeCategory === cat.value;

            return (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`px-4 py-2 text-xs font-medium rounded-lg transition-all duration-200 whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                  isActive
                    ? 'bg-[#1D2128] text-[#F5F3ED] shadow-sm border border-[#D4AF37]/40 font-semibold'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800/40'
                }`}
              >
                <span>{cat.label}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-[#D4AF37]/20 text-[#D4AF37]' : 'bg-neutral-800 text-neutral-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Services Grid with Card Lift and Micro-animations */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map(service => (
            <div 
              key={service.id}
              className="card-lift group bg-[#121418] hover:bg-[#16181E] border border-neutral-800/80 rounded-xl p-6 transition-all duration-300 flex flex-col justify-between relative overflow-hidden"
            >
              {/* Subtle gold corner accent on hover */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#D4AF37]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

              <div>
                {/* Header: Title + Price */}
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h3 className="text-lg font-bold text-[#F5F3ED] group-hover:text-[#D4AF37] transition-colors leading-snug">
                    {service.title}
                  </h3>
                  <div className="text-xl font-bold font-mono text-[#F5F3ED] group-hover:text-[#D4AF37] transition-colors whitespace-nowrap shrink-0 tabular-nums">
                    £{service.price.toFixed(2)}
                  </div>
                </div>

                {/* Duration & Metadata */}
                <div className="flex items-center gap-2 text-xs text-neutral-400 mb-3">
                  <span className="flex items-center gap-1 font-mono text-neutral-300">
                    <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                    {service.duration_minutes} mins
                  </span>
                  <span aria-hidden="true" className="text-neutral-700">·</span>
                  <span className="capitalize">{service.category}</span>
                  {service.requires_owner_confirmation && (
                    <>
                      <span aria-hidden="true" className="text-neutral-700">·</span>
                      <span className="text-amber-500/90 text-[11px] font-medium">Provisional</span>
                    </>
                  )}
                </div>

                {/* Description */}
                <p className="text-xs text-neutral-400 leading-relaxed mb-6 group-hover:text-neutral-300 transition-colors">
                  {service.description}
                </p>
              </div>

              {/* Action Button */}
              <button
                onClick={() => onSelectServiceToBook(service.id)}
                className="w-full py-2.5 px-4 bg-neutral-900 group-hover:bg-[#D4AF37] text-neutral-200 group-hover:text-[#0B0C0E] border border-neutral-700/60 group-hover:border-transparent rounded-lg text-xs font-bold transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98] shadow-sm group-hover:shadow-[0_4px_16px_rgba(212,175,55,0.3)]"
              >
                <span>Book This Cut</span>
                <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
