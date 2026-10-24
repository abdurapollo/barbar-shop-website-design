import React, { useState } from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    question: "Do I need to book in advance or can I walk in?",
    answer: "Both are welcome! We offer online booking so you can guarantee a specific barber and exact slot without waiting. Walk-in clients are also accepted whenever a chair is free between booked appointments."
  },
  {
    question: "How do I cancel or reschedule an existing appointment?",
    answer: "You can click 'My Booking' at the top of this website and enter your 8-digit booking reference (e.g. COF-10294) to view or cancel your booking. We ask for at least 24 hours notice where possible so your slot can be offered to another client."
  },
  {
    question: "Do I have to pay online when booking?",
    answer: "No upfront payment or card details are required to secure your appointment online. You pay directly at the shop after your haircut via cash or debit/credit card."
  },
  {
    question: "What happens if I am running late for my booking?",
    answer: "Please call the barbershop directly on 01274 010658 as soon as you know you may be delayed. We maintain a 10-minute grace period before the slot may need to be adjusted or offered to waiting clients."
  },
  {
    question: "Is parking available at 1202 Leeds Road?",
    answer: "Yes, free on-street parking and dedicated parking bays are available along Leeds Road and in immediate adjacent residential side streets around Laisterdyke."
  },
  {
    question: "Why do initial services say 'Provisional'?",
    answer: "To ensure 100% transparency, our website marks newly configured services and initial menu prices as provisional until officially verified by the owner. The shop owner can confirm or update rates in the admin portal at any time."
  }
];

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="relative py-16 lg:py-24 border-b border-neutral-800/80 bg-[#0B0C0E] overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-64 bg-[#D4AF37]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#D4AF37] mb-2">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F5F3ED] tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-neutral-400 mt-2">
            Everything you need to know regarding bookings, arrivals, and shop policies.
          </p>
        </div>

        {/* Accordion list with smooth interactive animations */}
        <div className="space-y-3">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div 
                key={index}
                className={`bg-[#121418] rounded-xl overflow-hidden transition-all duration-300 ${
                  isOpen 
                    ? 'border-l-2 border-l-[#D4AF37] border-y border-r border-neutral-700/80 shadow-[0_4px_20px_rgba(0,0,0,0.5),0_0_15px_rgba(212,175,55,0.06)]' 
                    : 'border border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleFAQ(index)}
                  className="w-full py-4 px-6 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-none transition-colors"
                >
                  <span className={`text-sm font-bold transition-colors ${
                    isOpen ? 'text-[#D4AF37]' : 'text-[#F5F3ED] hover:text-white'
                  }`}>
                    {faq.question}
                  </span>
                  <div className={`p-1 rounded-full transition-all duration-300 ${
                    isOpen ? 'bg-[#D4AF37]/20 text-[#D4AF37] rotate-180' : 'text-neutral-400'
                  }`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                <div 
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-6 pb-4 pt-1 text-xs sm:text-sm text-neutral-400 leading-relaxed border-t border-neutral-800/60">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
