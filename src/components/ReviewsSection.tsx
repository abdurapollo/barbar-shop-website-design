import React from 'react';
import { Testimonial } from '../types';
import { Star, ExternalLink, ShieldCheck, Quote } from 'lucide-react';
import { GOOGLE_MAPS_URL } from '../lib/db';

interface ReviewsSectionProps {
  reviews: Testimonial[];
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({ reviews }) => {
  return (
    <section className="relative py-16 lg:py-24 border-b border-neutral-800/80 bg-[#0E1013]/60 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/3 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#D4AF37] mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Authentic Client Reputation</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F5F3ED] tracking-tight">
              Customer Feedback
            </h2>
            <p className="text-sm text-neutral-400 mt-2 max-w-xl">
              Authentic feedback from visitors to our 1202 Leeds Road barbershop. We never publish fabricated scores or unverified reviews.
            </p>
          </div>

          <a
            href={GOOGLE_MAPS_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700/80 hover:border-[#D4AF37]/50 rounded-lg text-xs font-semibold text-[#D4AF37] transition-all shrink-0 shadow-sm hover:scale-[1.02]"
          >
            <span>View All Reviews on Google Maps</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Reviews Grid with Card Lift and Quote Accents */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map(rev => (
            <div
              key={rev.id}
              className="card-lift group bg-[#121418] hover:bg-[#16181E] border border-neutral-800/80 rounded-xl p-6 flex flex-col justify-between relative overflow-hidden transition-all duration-300 shadow-md"
            >
              {/* Background Quote Mark */}
              <Quote className="absolute right-3 top-3 w-16 h-16 text-neutral-800/20 group-hover:text-[#D4AF37]/10 transition-colors pointer-events-none" />

              <div>
                {/* 5-Star Row with animated glow on hover */}
                <div className="flex items-center gap-1 text-[#D4AF37] mb-3">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star 
                      key={i} 
                      className="w-4 h-4 fill-[#D4AF37] group-hover:scale-110 transition-transform duration-200" 
                      style={{ transitionDelay: `${i * 40}ms` }}
                    />
                  ))}
                </div>

                {/* Comment quote */}
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed mb-6 italic relative z-10">
                  "{rev.comment}"
                </p>
              </div>

              {/* Attribution (Attributable Testimonials rule) */}
              <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs relative z-10">
                <div>
                  <span className="font-bold text-[#F5F3ED] group-hover:text-[#D4AF37] transition-colors block">
                    {rev.author_name}
                  </span>
                  <span className="text-[11px] text-neutral-500">{rev.date}</span>
                </div>
                <span className="text-[10px] text-[#D4AF37] uppercase font-semibold px-2 py-0.5 bg-[#D4AF37]/10 rounded border border-[#D4AF37]/20">
                  Google Maps
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
