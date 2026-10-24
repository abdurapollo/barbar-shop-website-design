import React from 'react';
import { Staff } from '../types';
import { Scissors, Calendar, Award, Sparkles } from 'lucide-react';

interface TeamSectionProps {
  staffList: Staff[];
  onBookWithStaff: (staffId: string) => void;
}

export const TeamSection: React.FC<TeamSectionProps> = ({
  staffList,
  onBookWithStaff
}) => {
  const activeStaff = staffList.filter(s => s.is_active);

  return (
    <section id="team" className="relative py-16 lg:py-24 border-b border-neutral-800/80 bg-[#0C0E11] overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#D4AF37] mb-2">
            <Award className="w-3.5 h-3.5" />
            <span>Master Barbers</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F5F3ED] tracking-tight">
            The Bradford Craft Team
          </h2>
          <p className="text-sm text-neutral-400 mt-2">
            Specialist craftsmen dedicated to razor precision, symmetrical tapers, and client comfort.
          </p>
        </div>

        {/* Staff Grid with Card Lift and Avatar Rings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {activeStaff.map(barber => {
            const workingDaysCount = barber.schedule.filter(s => s.is_working).length;

            return (
              <div 
                key={barber.id}
                className="card-lift group bg-[#121418] hover:bg-[#16181E] border border-neutral-800/80 rounded-xl p-6 transition-all duration-300 flex flex-col justify-between relative overflow-hidden"
              >
                {/* Gold corner light */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#D4AF37]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                <div>
                  {/* Avatar / Monogram with glowing ring */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-neutral-900 border-2 border-[#D4AF37]/40 group-hover:border-[#D4AF37] group-hover:shadow-[0_0_20px_rgba(212,175,55,0.35)] flex items-center justify-center overflow-hidden text-xl font-bold text-[#D4AF37] font-mono shadow-inner shrink-0 relative transition-all duration-300">
                      {barber.avatar_url ? (
                        <img 
                          src={barber.avatar_url} 
                          alt={barber.name} 
                          referrerPolicy="no-referrer"
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : null}
                      <span className="absolute inset-0 flex items-center justify-center -z-0">
                        {barber.name.charAt(0)}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-[#F5F3ED] group-hover:text-[#D4AF37] transition-colors">
                          {barber.name}
                        </h3>
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Chair Active
                        </span>
                      </div>
                      <p className="text-xs text-[#D4AF37] font-medium">{barber.role_title}</p>
                      <p className="text-[11px] text-neutral-500 mt-0.5">{workingDaysCount} days / week in chair</p>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-xs text-neutral-400 leading-relaxed mb-4 group-hover:text-neutral-300 transition-colors">
                    {barber.bio}
                  </p>

                  {/* Specialties (Zero-Pill: typographic inline list) */}
                  <div className="border-t border-neutral-800/80 pt-3 mb-6">
                    <span className="text-[11px] text-neutral-500 uppercase tracking-wider block mb-1.5 font-semibold">Specialisms</span>
                    <div className="text-xs text-neutral-300 flex flex-wrap gap-1.5 items-center">
                      {barber.specialties.map((spec, i) => (
                        <React.Fragment key={spec}>
                          <span className="hover:text-[#D4AF37] transition-colors">{spec}</span>
                          {i < barber.specialties.length - 1 && <span className="text-neutral-600">·</span>}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Direct Booking Button with Slide Icon */}
                <button
                  onClick={() => onBookWithStaff(barber.id)}
                  className="w-full py-2.5 px-4 bg-neutral-900 group-hover:bg-[#D4AF37] text-neutral-200 group-hover:text-[#0B0C0E] border border-neutral-700/80 group-hover:border-transparent rounded-lg text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] shadow-sm group-hover:shadow-[0_4px_16px_rgba(212,175,55,0.3)]"
                >
                  <Calendar className="w-3.5 h-3.5 transition-transform duration-300 group-hover:scale-110" />
                  <span>Book with {barber.name}</span>
                </button>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
