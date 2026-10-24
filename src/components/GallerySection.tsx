import React, { useState } from 'react';
import { GalleryItem } from '../types';
import { Maximize2, X, Camera, ExternalLink, Sparkles } from 'lucide-react';
import { BarberArtworkCard } from './BarberVisuals';
import { GOOGLE_MAPS_URL } from '../lib/db';

interface GallerySectionProps {
  galleryItems: GalleryItem[];
  onOpenBooking: () => void;
}

export const GallerySection: React.FC<GallerySectionProps> = ({
  galleryItems,
  onOpenBooking
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [activeModalItem, setActiveModalItem] = useState<GalleryItem | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const filters = ['All', 'Skin Fade', 'Taper Fade', 'Beard Sculpt', 'Textured Crop', 'Line Up', 'Barbershop'];

  const filteredItems = selectedFilter === 'All'
    ? galleryItems
    : galleryItems.filter(item => item.category === selectedFilter);

  // Map category to illustration fallback variant
  const getVariant = (cat: string): 'fade' | 'beard' | 'crop' | 'razor' | 'chair' => {
    if (cat === 'Beard Sculpt') return 'beard';
    if (cat === 'Textured Crop') return 'crop';
    if (cat === 'Line Up') return 'razor';
    if (cat === 'Barbershop') return 'chair';
    return 'fade';
  };

  const handleImageError = (id: string) => {
    setImageErrors(prev => ({ ...prev, [id]: true }));
  };

  return (
    <section id="gallery" className="relative py-16 lg:py-24 border-b border-neutral-800/80 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#D4AF37] mb-2">
              <Camera className="w-3.5 h-3.5" />
              <span>Craftsmanship &amp; Portfolio</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F5F3ED] tracking-tight">
              Fade Gallery &amp; Styles
            </h2>
            <p className="text-sm text-neutral-400 mt-2 max-w-xl">
              Authentic barber craftsmanship from 1202 Leeds Road, Bradford. Razor skin fades, beard architectures, taper blowouts, and our modern shop atmosphere.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={GOOGLE_MAPS_URL}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 text-xs font-semibold text-[#D4AF37] hover:text-[#F5F3ED] bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-700/80 rounded-md transition-all inline-flex items-center gap-1.5 shadow-sm hover:border-[#D4AF37]/50"
            >
              <span>More Photos on Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={onOpenBooking}
              className="btn-shimmer px-5 py-2.5 text-xs font-bold text-[#0B0C0E] bg-[#D4AF37] hover:bg-[#E5C158] rounded-md transition-all duration-300 self-start md:self-auto shrink-0 cursor-pointer shadow-[0_4px_16px_rgba(212,175,55,0.25)] hover:shadow-[0_6px_20px_rgba(212,175,55,0.4)] active:scale-95"
            >
              Book Next Appointment
            </button>
          </div>
        </div>

        {/* Filter Controls (Segmented tabs with animated active styling) */}
        <div className="flex items-center gap-1.5 p-1.5 bg-neutral-900/90 rounded-xl border border-neutral-800/80 overflow-x-auto mb-8 max-w-fit shadow-md">
          {filters.map(filter => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 whitespace-nowrap cursor-pointer ${
                selectedFilter === filter
                  ? 'bg-[#1C2027] text-[#F5F3ED] border border-[#D4AF37]/40 shadow-sm font-semibold'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/40'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Gallery Grid with Sheen Sweeps and Smooth Zooms */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map(item => {
            const hasValidImage = item.imageUrl && !imageErrors[item.id];

            return (
              <div 
                key={item.id} 
                onClick={() => setActiveModalItem(item)}
                className="cursor-pointer group relative transition-transform duration-300"
              >
                {hasValidImage ? (
                  <div className="card-sheen card-lift relative w-full aspect-[4/3] rounded-xl overflow-hidden border border-neutral-800/80 bg-neutral-950 shadow-lg">
                    {/* Real Image with smooth zoom */}
                    <img 
                      src={item.imageUrl} 
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      onError={() => handleImageError(item.id)}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                    />

                    {/* Gradient Overlay for crisp typography */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent pointer-events-none" />

                    {/* Category Pill Tag */}
                    <div className="absolute top-3 left-3 z-10">
                      <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-black/80 backdrop-blur-md text-[#D4AF37] border border-[#D4AF37]/30 rounded shadow">
                        {item.category}
                      </span>
                    </div>

                    {/* Expand icon with hover pop */}
                    <div className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/80 backdrop-blur-md text-white/80 group-hover:text-[#D4AF37] opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110 shadow">
                      <Maximize2 className="w-3.5 h-3.5" />
                    </div>

                    {/* Bottom Metadata */}
                    <div className="absolute bottom-3 left-3 right-3 z-10">
                      <h4 className="text-sm font-bold text-[#F5F3ED] group-hover:text-[#D4AF37] transition-colors tracking-tight drop-shadow-md">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-neutral-300 line-clamp-1 mt-0.5 opacity-90">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="card-lift relative rounded-xl overflow-hidden border border-neutral-800">
                    <BarberArtworkCard
                      title={item.title}
                      subtitle={item.category}
                      variant={getVariant(item.category)}
                    />
                    <div className="absolute top-4 right-4 p-2 rounded-full bg-black/70 text-white/70 group-hover:text-[#D4AF37] opacity-0 group-hover:opacity-100 transition-opacity">
                      <Maximize2 className="w-4 h-4" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>

      {/* Lightbox Modal with Smooth Scale-In */}
      {activeModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md transition-opacity duration-300">
          <div className="relative w-full max-w-xl bg-[#111317] border border-[#D4AF37]/30 rounded-2xl p-6 shadow-[0_24px_64px_rgba(0,0,0,0.9)] space-y-4 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <span className="text-xs uppercase tracking-wider text-[#D4AF37] font-semibold flex items-center gap-2">
                <span>{activeModalItem.category}</span>
                <span className="text-neutral-600">·</span>
                <span className="text-neutral-400 font-normal">CITY OF FADES Bradford</span>
              </span>
              <button
                onClick={() => setActiveModalItem(null)}
                className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
                aria-label="Close image modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Visual */}
            <div className="w-full aspect-[4/3] rounded-xl overflow-hidden border border-neutral-800 bg-black relative shadow-inner">
              {activeModalItem.imageUrl && !imageErrors[activeModalItem.id] ? (
                <img 
                  src={activeModalItem.imageUrl} 
                  alt={activeModalItem.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <BarberArtworkCard
                  title={activeModalItem.title}
                  subtitle={activeModalItem.category}
                  variant={getVariant(activeModalItem.category)}
                />
              )}
            </div>

            {/* Details */}
            <div className="space-y-1.5">
              <h3 className="text-xl font-bold text-[#F5F3ED]">{activeModalItem.title}</h3>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">{activeModalItem.description}</p>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-between border-t border-neutral-800/80">
              <a
                href={GOOGLE_MAPS_URL}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-neutral-400 hover:text-[#D4AF37] flex items-center gap-1.5 transition-colors"
              >
                <span>View on Google Maps listing</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveModalItem(null)}
                  className="px-4 py-2 text-xs text-neutral-400 hover:text-white cursor-pointer transition-colors"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveModalItem(null);
                    onOpenBooking();
                  }}
                  className="btn-shimmer px-5 py-2 text-xs font-bold text-[#0B0C0E] bg-[#D4AF37] hover:bg-[#E5C158] rounded-md transition-all shadow-[0_4px_16px_rgba(212,175,55,0.3)] cursor-pointer active:scale-95"
                >
                  Book This Style
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </section>
  );
};
