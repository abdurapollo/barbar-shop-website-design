import React from 'react';

export const RazorScissorsIcon = ({ className = "w-6 h-6 text-[#D4AF37]" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="6" r="3" />
    <path d="M8.12 8.12 12 12m4.88 4.88L20 20M8.12 15.88 12 12m4.88-4.88L20 4" />
    <circle cx="6" cy="18" r="3" />
  </svg>
);

export const BarberPoleBadge = ({ className = "w-5 h-5 text-[#D4AF37]" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect width="8" height="18" x="8" y="3" rx="4" />
    <path d="m8 8 8 5M8 12l8 5" />
    <path d="M7 3h10M7 21h10" />
  </svg>
);

export const StraightRazorIcon = ({ className = "w-6 h-6 text-[#D4AF37]" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 13.5 12 4.5l3.5 3.5-9 9z" />
    <path d="M12 4.5 16.5 9l5-5-4.5-4.5z" />
    <path d="m14 16 6 6" />
  </svg>
);

export const BarberArtworkCard = ({ 
  title, 
  subtitle, 
  variant = 'fade' 
}: { 
  title: string; 
  subtitle: string; 
  variant?: 'fade' | 'beard' | 'crop' | 'razor' | 'chair';
}) => {
  return (
    <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-[#15171B] via-[#0E1013] to-[#0A0B0D] rounded-xl overflow-hidden border border-neutral-800/80 flex flex-col justify-between p-6 group transition-all duration-300 hover:border-[#D4AF37]/40 shadow-lg">
      {/* Background geometric grid texture */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:16px_16px]" />
      
      {/* Visual illustration center */}
      <div className="relative z-10 flex items-center justify-center my-auto">
        {variant === 'fade' && (
          <div className="w-24 h-24 rounded-full border border-[#D4AF37]/30 flex items-center justify-center bg-[#1A1D24] shadow-inner group-hover:scale-105 transition-transform duration-300">
            <svg className="w-12 h-12 text-[#D4AF37]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
              <path d="M12 2C7.5 2 4 5.5 4 10c0 3 1.5 5.5 3 7.5L8 21h8l1-3.5c1.5-2 3-4.5 3-7.5 0-4.5-3.5-8-8-8z" />
              <path d="M6 10c2-1 4-1.5 6-1.5s4 .5 6 1.5" strokeDasharray="2 2" />
              <path d="M7 14c1.5-.7 3.2-1 5-1s3.5.3 5 1" stroke="#D4AF37" strokeWidth="1.5" />
            </svg>
          </div>
        )}

        {variant === 'beard' && (
          <div className="w-24 h-24 rounded-full border border-[#D4AF37]/30 flex items-center justify-center bg-[#1A1D24] shadow-inner group-hover:scale-105 transition-transform duration-300">
            <svg className="w-12 h-12 text-[#D4AF37]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
              <path d="M5 6c0 5 2.5 10 7 13 4.5-3 7-8 7-13" />
              <path d="M8 8c1.5 2 2.5 3 4 3s2.5-1 4-3" />
              <path d="M12 14v4" />
              <path d="M9 11l-3 4" strokeDasharray="2 2" />
              <path d="M15 11l3 4" strokeDasharray="2 2" />
            </svg>
          </div>
        )}

        {variant === 'crop' && (
          <div className="w-24 h-24 rounded-full border border-[#D4AF37]/30 flex items-center justify-center bg-[#1A1D24] shadow-inner group-hover:scale-105 transition-transform duration-300">
            <svg className="w-12 h-12 text-[#D4AF37]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
              <path d="M4 11a8 8 0 0 1 16 0v2H4v-2z" />
              <path d="M4 13l2 8h12l2-8" />
              <path d="M7 8l2-3 3 2 3-2 2 3" stroke="#D4AF37" strokeWidth="1.5" />
            </svg>
          </div>
        )}

        {variant === 'razor' && (
          <div className="w-24 h-24 rounded-full border border-[#D4AF37]/30 flex items-center justify-center bg-[#1A1D24] shadow-inner group-hover:scale-105 transition-transform duration-300">
            <StraightRazorIcon className="w-12 h-12 text-[#D4AF37]" />
          </div>
        )}

        {variant === 'chair' && (
          <div className="w-24 h-24 rounded-full border border-[#D4AF37]/30 flex items-center justify-center bg-[#1A1D24] shadow-inner group-hover:scale-105 transition-transform duration-300">
            <svg className="w-12 h-12 text-[#D4AF37]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
              <path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3" />
              <path d="M3 11v5a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2z" />
              <path d="M12 18v4M8 22h8" />
            </svg>
          </div>
        )}
      </div>

      {/* Label and category text */}
      <div className="relative z-10 border-t border-neutral-800/80 pt-3">
        <div className="flex items-center justify-between text-xs text-neutral-400">
          <span>{subtitle}</span>
          <span className="text-[#D4AF37] tracking-wider uppercase text-[10px]">City of Fades</span>
        </div>
        <h4 className="text-sm font-semibold text-[#F5F3ED] mt-0.5 tracking-tight">{title}</h4>
      </div>
    </div>
  );
};
