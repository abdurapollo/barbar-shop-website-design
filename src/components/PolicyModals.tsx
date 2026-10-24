import React from 'react';
import { X, ShieldCheck, FileText, AlertTriangle } from 'lucide-react';

export type PolicyType = 'privacy' | 'terms' | 'cancellation' | null;

interface PolicyModalsProps {
  policy: PolicyType;
  onClose: () => void;
}

export const PolicyModals: React.FC<PolicyModalsProps> = ({ policy, onClose }) => {
  if (!policy) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-[#111317] border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-[#16181E]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
            <h3 className="text-base font-bold text-[#F5F3ED]">
              {policy === 'privacy' && 'Privacy Policy & Data Protection (UK GDPR)'}
              {policy === 'terms' && 'Terms & Conditions of Service'}
              {policy === 'cancellation' && 'Appointment Cancellation & Lateness Policy'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-neutral-300 leading-relaxed">
          {policy === 'privacy' && (
            <>
              <p>
                <strong>Data Controller:</strong> CITY OF FADES, operating at 1202 Leeds Road, Laisterdyke, Bradford, BD3 8LJ, United Kingdom. Telephone: 01274 010658.
              </p>
              <h4 className="font-bold text-white text-sm">1. Information We Collect</h4>
              <p>
                When booking an appointment through our platform, we collect your full name, telephone number, email address, and optional styling notes. We do NOT require customer registration, and we do not collect or store credit card details through this booking system.
              </p>
              <h4 className="font-bold text-white text-sm">2. Purpose of Processing</h4>
              <p>
                Your contact details are processed strictly for confirming, managing, and sending reminders regarding your barbershop appointment, and to notify you of schedule changes.
              </p>
              <h4 className="font-bold text-white text-sm">3. Data Retention &amp; Rights</h4>
              <p>
                Under UK GDPR, you have the right to request access to, rectification of, or erasure of your personal data. You may contact us anytime at the shop or via telephone to exercise these rights.
              </p>
            </>
          )}

          {policy === 'terms' && (
            <>
              <p>
                Welcome to CITY OF FADES. By booking an appointment or visiting our premises at 1202 Leeds Road, Bradford BD3 8LJ, you agree to these Terms of Service.
              </p>
              <h4 className="font-bold text-white text-sm">1. Service Provision &amp; Provisional Rates</h4>
              <p>
                All barbering services are performed by skilled professionals. Prices listed on this website represent current proposed rates and are confirmed at the time of your appointment. Payment is settled in shop upon completion of the service.
              </p>
              <h4 className="font-bold text-white text-sm">2. Conduct &amp; Safety</h4>
              <p>
                We maintain a respectful, safe, and hygienic environment for all clients and staff. We reserve the right to refuse service to anyone engaging in inappropriate conduct.
              </p>
            </>
          )}

          {policy === 'cancellation' && (
            <>
              <h4 className="font-bold text-white text-sm">1. 24-Hour Notice</h4>
              <p>
                We kindly request at least 24 hours notice for any cancellation or rescheduling. This allows our barbers to allocate the reserved time slot to waiting clients.
              </p>
              <h4 className="font-bold text-white text-sm">2. How to Cancel</h4>
              <p>
                You can easily cancel your booking online via the "My Booking" self-service lookup using your unique booking reference (e.g. COF-10294), or by telephoning the shop directly on <strong>01274 010658</strong>.
              </p>
              <h4 className="font-bold text-white text-sm">3. Late Arrivals (10-Minute Grace Period)</h4>
              <p>
                If you are running late, please notify us as soon as possible. We offer a 10-minute grace period. If you arrive later than 10 minutes past your scheduled start time, we may need to shorten your treatment or reschedule to avoid delaying subsequent appointments.
              </p>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-800 bg-[#16181E] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold rounded-lg"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
