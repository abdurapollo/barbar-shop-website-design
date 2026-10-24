import React, { useState } from 'react';
import { X, Search, Calendar, Clock, User, AlertCircle, CheckCircle, Phone, XCircle } from 'lucide-react';
import { Appointment } from '../types';
import { db } from '../lib/db';
import { sendCancellationNotification } from '../lib/notifications';

interface ManageBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAppointmentUpdated?: () => void;
}

export const ManageBookingModal: React.FC<ManageBookingModalProps> = ({
  isOpen,
  onClose,
  onAppointmentUpdated
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [searched, setSearched] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelPrompt, setShowCancelPrompt] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setActionMessage(null);
    setShowCancelPrompt(false);
    const query = searchQuery.trim().toUpperCase();

    // Search by reference or email
    const apt = db.getAppointmentByReference(query) || 
      db.getAppointments().find(a => a.customer_email.toLowerCase() === searchQuery.trim().toLowerCase());

    setAppointment(apt || null);
    setSearched(true);
  };

  const handleCancelBooking = async () => {
    if (!appointment) return;
    setIsProcessing(true);
    setActionMessage(null);

    try {
      const updated = db.updateAppointmentStatus(appointment.id, 'cancelled', cancelReason.trim() || 'Customer requested via self-service.');
      if (updated) {
        setAppointment({ ...updated });
        await sendCancellationNotification(updated, cancelReason.trim());
        setActionMessage({
          type: 'success',
          text: `Appointment ${updated.booking_reference} has been cancelled successfully.`
        });
        setShowCancelPrompt(false);
        if (onAppointmentUpdated) onAppointmentUpdated();
      }
    } catch {
      setActionMessage({
        type: 'error',
        text: 'Failed to cancel appointment. Please call the shop at 01274 010658.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-[#111317] border border-[#D4AF37]/35 rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.85),0_0_24px_rgba(212,175,55,0.12)] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-[#16181E]">
          <div>
            <h3 className="text-base font-bold text-[#F5F3ED]">Manage / Lookup Appointment</h3>
            <p className="text-xs text-neutral-400">View or cancel your booking with your reference code</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Enter Booking Ref (e.g. COF-10294) or Email"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 bg-[#16181E] border border-neutral-700/80 rounded-lg text-sm text-[#F5F3ED] placeholder-neutral-500 focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 bg-[#D4AF37] hover:bg-[#E5C158] text-[#0B0C0E] text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              Search
            </button>
          </form>

          {/* Quick preset suggestions */}
          <div className="text-[11px] text-neutral-400 flex items-center gap-1.5 flex-wrap">
            <span>Sample records to test:</span>
            <button
              type="button"
              onClick={() => { setSearchQuery('COF-10294'); }}
              className="font-mono text-[#D4AF37] hover:underline"
            >
              COF-10294
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => { setSearchQuery('COF-84920'); }}
              className="font-mono text-[#D4AF37] hover:underline"
            >
              COF-84920
            </button>
          </div>

          {actionMessage && (
            <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
              actionMessage.type === 'success' ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-300' : 'bg-red-950/60 border border-red-800 text-red-300'
            }`}>
              {actionMessage.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{actionMessage.text}</span>
            </div>
          )}

          {/* Appointment Result */}
          {appointment && (
            <div className="p-4 bg-[#16181E] border border-neutral-800 rounded-xl space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#D4AF37]">Reference</span>
                  <div className="text-lg font-bold font-mono text-[#F5F3ED]">{appointment.booking_reference}</div>
                </div>
                <div>
                  <span className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold uppercase ${
                    appointment.status === 'confirmed' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                    appointment.status === 'completed' ? 'bg-blue-950 text-blue-400 border border-blue-800' :
                    appointment.status === 'cancelled' ? 'bg-red-950 text-red-400 border border-red-800' :
                    'bg-neutral-800 text-neutral-300'
                  }`}>
                    {appointment.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-neutral-500 block">Service</span>
                  <span className="font-semibold text-neutral-200">{appointment.service_snapshot.title}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Barber</span>
                  <span className="font-semibold text-neutral-200">{appointment.staff_name_snapshot || 'Assigned'}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Date</span>
                  <span className="font-semibold text-neutral-200">{appointment.appointment_date}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Time</span>
                  <span className="font-semibold text-neutral-200 font-mono">{appointment.start_time} - {appointment.end_time}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Price</span>
                  <span className="font-semibold text-neutral-200 font-mono">£{appointment.total_price.toFixed(2)} GBP</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Customer</span>
                  <span className="font-semibold text-neutral-200 truncate block">{appointment.customer_name}</span>
                </div>
              </div>

              {appointment.cancellation_reason && (
                <div className="text-xs text-red-400 p-2 bg-red-950/30 rounded border border-red-900/40">
                  <strong>Cancellation reason:</strong> {appointment.cancellation_reason}
                </div>
              )}

              {/* Cancellation trigger */}
              {appointment.status === 'confirmed' && !showCancelPrompt && (
                <div className="pt-2 border-t border-neutral-800 flex items-center justify-between">
                  <span className="text-xs text-neutral-400">Need to change your plan?</span>
                  <button
                    type="button"
                    onClick={() => setShowCancelPrompt(true)}
                    className="text-xs text-red-400 hover:text-red-300 hover:underline cursor-pointer"
                  >
                    Cancel Appointment
                  </button>
                </div>
              )}

              {/* Cancellation prompt */}
              {showCancelPrompt && appointment.status === 'confirmed' && (
                <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg space-y-3">
                  <p className="text-xs text-neutral-300 font-medium">
                    Are you sure you want to cancel this booking?
                  </p>
                  <input
                    type="text"
                    placeholder="Reason for cancellation (optional)"
                    value={cancelReason}
                    onChange={e => setCancelReason(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#16181E] border border-neutral-700 rounded text-xs text-white"
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setShowCancelPrompt(false)}
                      className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white"
                    >
                      Keep Booking
                    </button>
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={handleCancelBooking}
                      className="px-3 py-1.5 text-xs bg-red-600 hover:bg-red-500 text-white rounded font-semibold cursor-pointer"
                    >
                      {isProcessing ? 'Cancelling...' : 'Confirm Cancellation'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {searched && !appointment && (
            <div className="p-6 bg-[#16181E] border border-neutral-800 rounded-xl text-center space-y-2">
              <AlertCircle className="w-6 h-6 text-neutral-500 mx-auto" />
              <p className="text-sm font-semibold text-neutral-300">No booking found matching that reference or email.</p>
              <p className="text-xs text-neutral-400">Please double-check your code or telephone the shop on 01274 010658.</p>
            </div>
          )}

          {/* Need help strip */}
          <div className="p-3 bg-neutral-900/60 border border-neutral-800 rounded-lg flex items-center justify-between text-xs text-neutral-400">
            <span>Need immediate help or urgent changes?</span>
            <a href="tel:01274010658" className="text-[#D4AF37] font-mono flex items-center gap-1 font-semibold">
              <Phone className="w-3.5 h-3.5" />
              01274 010658
            </a>
          </div>

        </div>

      </div>
    </div>
  );
};
