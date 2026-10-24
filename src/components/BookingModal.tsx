import React, { useState, useEffect } from 'react';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  MapPin, 
  Phone, 
  Download, 
  Mail, 
  Scissors,
  ShieldCheck,
  Eye
} from 'lucide-react';
import { Service, Staff, Appointment, TimeSlot } from '../types';
import { db } from '../lib/db';
import { 
  getAvailableSlots, 
  validateAndReserveSlot, 
  generateBookingReference, 
  getLondonToday,
  calculateEndTime
} from '../lib/availability';
import { sendBookingConfirmationNotification } from '../lib/notifications';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedServiceId?: string | null;
  onBookingCreated?: (appointment: Appointment) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  preselectedServiceId,
  onBookingCreated
}) => {
  const [step, setStep] = useState<number>(1);
  const [services, setServices] = useState<Service[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  
  // Selection state
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  
  // Form fields
  const [customerName, setCustomerName] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [agreeToPolicy, setAgreeToPolicy] = useState<boolean>(true);

  // Availability query state
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [isDateClosed, setIsDateClosed] = useState<boolean>(false);
  const [closureReason, setClosureReason] = useState<string>('');
  const [isLoadingSlots, setIsLoadingSlots] = useState<boolean>(false);

  // Final confirmation state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionError, setSubmissionError] = useState<string>('');
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);
  const [showEmailPreview, setShowEmailPreview] = useState<boolean>(false);

  // Initialize data
  useEffect(() => {
    if (isOpen) {
      const activeServices = db.getServices().filter(s => s.is_active);
      const activeStaff = db.getStaff().filter(s => s.is_active);
      setServices(activeServices);
      setStaffList(activeStaff);

      if (preselectedServiceId && activeServices.some(s => s.id === preselectedServiceId)) {
        setSelectedServiceId(preselectedServiceId);
        setStep(2);
      } else if (activeServices.length > 0 && !selectedServiceId) {
        setSelectedServiceId(activeServices[0].id);
      }

      // Default date to today or tomorrow
      if (!selectedDate) {
        setSelectedDate(getLondonToday());
      }
    }
  }, [isOpen, preselectedServiceId]);

  // Fetch slots whenever date, service, or barber changes
  useEffect(() => {
    if (selectedDate && selectedServiceId) {
      setIsLoadingSlots(true);
      setSubmissionError('');
      try {
        const result = getAvailableSlots(selectedDate, selectedServiceId, selectedStaffId);
        setIsDateClosed(result.isClosed);
        setClosureReason(result.closureReason || '');
        setAvailableSlots(result.slots);

        // Reset selected time if current time is not in new slots
        if (!result.slots.some(s => s.time === selectedTime && s.is_available)) {
          setSelectedTime('');
        }
      } catch (err) {
        console.error('Error calculating slots', err);
      } finally {
        setIsLoadingSlots(false);
      }
    }
  }, [selectedDate, selectedServiceId, selectedStaffId]);

  if (!isOpen) return null;

  const currentService = services.find(s => s.id === selectedServiceId);
  const currentStaff = staffList.find(s => s.id === selectedStaffId);

  // Generate date options for the next 28 days
  const todayStr = getLondonToday();
  const dateOptions: { dateStr: string; label: string; weekday: string; isToday: boolean }[] = [];
  for (let i = 0; i < 28; i++) {
    const d = new Date(todayStr + 'T00:00:00Z');
    d.setUTCDate(d.getUTCDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const weekday = d.toLocaleDateString('en-GB', { weekday: 'short', timeZone: 'UTC' });
    const label = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
    dateOptions.push({
      dateStr,
      label,
      weekday,
      isToday: i === 0
    });
  }

  // Handle final submission with atomic collision check
  const handleConfirmBooking = async () => {
    setSubmissionError('');
    if (!customerName.trim()) {
      setSubmissionError('Please enter your full name.');
      return;
    }
    if (!customerEmail.trim() || !customerEmail.includes('@')) {
      setSubmissionError('Please provide a valid email address.');
      return;
    }
    if (!customerPhone.trim() || customerPhone.length < 8) {
      setSubmissionError('Please provide a valid contact telephone number.');
      return;
    }
    if (!agreeToPolicy) {
      setSubmissionError('Please agree to the 24-hour cancellation policy.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Re-validate availability atomically
      const validation = validateAndReserveSlot({
        dateStr: selectedDate,
        startTime: selectedTime,
        serviceId: selectedServiceId,
        staffId: selectedStaffId
      });

      if (!validation.success) {
        setSubmissionError(validation.error || 'This time slot is no longer available.');
        setIsSubmitting(false);
        return;
      }

      if (!currentService) {
        setSubmissionError('Service error.');
        setIsSubmitting(false);
        return;
      }

      const assignedStaff = staffList.find(s => s.id === validation.assignedStaffId);
      const reference = generateBookingReference();

      // 2. Persist to database
      const newAppointment = db.createAppointment({
        booking_reference: reference,
        service_id: currentService.id,
        service_snapshot: {
          title: currentService.title,
          category: currentService.category,
          price: currentService.price,
          duration_minutes: currentService.duration_minutes
        },
        staff_id: validation.assignedStaffId,
        staff_name_snapshot: assignedStaff?.name || 'Assigned Barber',
        customer_name: customerName.trim(),
        customer_email: customerEmail.trim(),
        customer_phone: customerPhone.trim(),
        appointment_date: selectedDate,
        start_time: selectedTime,
        end_time: validation.endTime,
        total_price: currentService.price,
        currency: 'GBP',
        status: 'confirmed',
        notes: notes.trim()
      });

      // 3. Send notification (sandbox simulated)
      await sendBookingConfirmationNotification(newAppointment);

      setConfirmedAppointment(newAppointment);
      setStep(8); // Success step
      if (onBookingCreated) {
        onBookingCreated(newAppointment);
      }
    } catch (err: any) {
      console.error('Booking failed', err);
      setSubmissionError('An unexpected error occurred while confirming your booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate .ICS calendar invite file download
  const handleDownloadCalendarIcs = () => {
    if (!confirmedAppointment) return;

    const startDateTime = confirmedAppointment.appointment_date.replace(/-/g, '') + 'T' + confirmedAppointment.start_time.replace(':', '') + '00';
    const endDateTime = confirmedAppointment.appointment_date.replace(/-/g, '') + 'T' + confirmedAppointment.end_time.replace(':', '') + '00';

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//CITY OF FADES//Barbershop Booking//EN',
      'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT',
      `SUMMARY:Barber Appointment: ${confirmedAppointment.service_snapshot.title} - CITY OF FADES`,
      `DESCRIPTION:Appointment Reference: ${confirmedAppointment.booking_reference}\\nBarber: ${confirmedAppointment.staff_name_snapshot}\\nPhone: 01274 010658`,
      `LOCATION:CITY OF FADES, 1202 Leeds Road, Laisterdyke, Bradford BD3 8LJ`,
      `DTSTART:${startDateTime}`,
      `DTEND:${endDateTime}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `CityOfFades_${confirmedAppointment.booking_reference}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-[#111317] border border-[#D4AF37]/35 rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.85),0_0_24px_rgba(212,175,55,0.12)] overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800/80 bg-[#16181E]">
          <div className="flex items-center gap-3">
            <span className="text-sm font-extrabold uppercase tracking-widest text-[#D4AF37]" style={{ fontFamily: 'var(--font-heading)' }}>
              CITY OF FADES
            </span>
            <span className="text-neutral-600">/</span>
            <span className="text-xs text-neutral-300 font-medium">
              {step === 8 ? 'Booking Confirmed' : `Step ${step} of 6`}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
            aria-label="Close booking modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body with Step Flow */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">

          {/* STEP 1: Select Service */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-[#F5F3ED]">Choose a Service</h3>
                <p className="text-xs text-neutral-400 mt-1">Select the haircut or grooming treatment you require.</p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {services.map(service => (
                  <div
                    key={service.id}
                    onClick={() => setSelectedServiceId(service.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                      selectedServiceId === service.id
                        ? 'border-[#D4AF37] bg-[#1A1D24] shadow-md'
                        : 'border-neutral-800 hover:border-neutral-700 bg-[#131518]'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#F5F3ED] text-sm">{service.title}</span>
                        {service.requires_owner_confirmation && (
                          <span className="text-[10px] text-amber-500/80">Provisional</span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-400 line-clamp-1">{service.description}</p>
                      <div className="flex items-center gap-2 text-xs text-neutral-500 font-mono">
                        <span>{service.duration_minutes} mins</span>
                        <span>·</span>
                        <span className="capitalize">{service.category}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-base font-bold font-mono text-[#F5F3ED] tabular-nums">
                        £{service.price.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-neutral-500">Pay in shop</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: Choose Barber */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-[#F5F3ED]">Select Barber</h3>
                <p className="text-xs text-neutral-400 mt-1">Choose your preferred barber or select "Any Available Barber" for the fastest slot.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Any Available Option */}
                <div
                  onClick={() => setSelectedStaffId(null)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    selectedStaffId === null
                      ? 'border-[#D4AF37] bg-[#1A1D24] shadow-md'
                      : 'border-neutral-800 hover:border-neutral-700 bg-[#131518]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-[#D4AF37]">
                      <Scissors className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#F5F3ED]">Any Available Barber</h4>
                      <p className="text-xs text-neutral-400 mt-0.5">Maximum slot flexibility</p>
                    </div>
                  </div>
                </div>

                {/* Individual Staff Cards */}
                {staffList.map(barber => (
                  <div
                    key={barber.id}
                    onClick={() => setSelectedStaffId(barber.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      selectedStaffId === barber.id
                        ? 'border-[#D4AF37] bg-[#1A1D24] shadow-md'
                        : 'border-neutral-800 hover:border-neutral-700 bg-[#131518]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center font-bold text-[#D4AF37] text-sm">
                        {barber.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#F5F3ED]">{barber.name}</h4>
                        <p className="text-xs text-neutral-400 truncate max-w-[160px]">{barber.role_title}</p>
                      </div>
                    </div>
                    <div className="mt-2 text-[11px] text-neutral-400">
                      {barber.specialties.join(' · ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3 & 4: Date & Available Time Slots */}
          {(step === 3 || step === 4) && (
            <div className="space-y-5">
              <div>
                <h3 className="text-xl font-bold text-[#F5F3ED]">Choose Date &amp; Time</h3>
                <p className="text-xs text-neutral-400 mt-1">Live availability in Europe/London local time.</p>
              </div>

              {/* Date Scroll Row */}
              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-2">Select Day</label>
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
                  {dateOptions.map(opt => (
                    <button
                      key={opt.dateStr}
                      type="button"
                      onClick={() => setSelectedDate(opt.dateStr)}
                      className={`flex flex-col items-center justify-center min-w-[70px] py-2.5 px-2 rounded-xl border transition-all shrink-0 cursor-pointer ${
                        selectedDate === opt.dateStr
                          ? 'border-[#D4AF37] bg-[#1A1D24] text-[#F5F3ED] shadow-sm'
                          : 'border-neutral-800 bg-[#131518] text-neutral-400 hover:text-white hover:border-neutral-700'
                      }`}
                    >
                      <span className="text-[10px] uppercase font-semibold text-neutral-500">{opt.weekday}</span>
                      <span className="text-sm font-bold my-0.5">{opt.label}</span>
                      {opt.isToday && <span className="text-[9px] text-[#D4AF37]">Today</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Slots Area */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-neutral-300">
                    Available Time Slots for {new Date(selectedDate + 'T00:00:00Z').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </label>
                  <span className="text-xs text-neutral-500 font-mono">
                    {currentService?.duration_minutes} min duration
                  </span>
                </div>

                {isLoadingSlots ? (
                  <div className="py-12 text-center text-xs text-neutral-400">
                    Calculating barber schedule &amp; opening hours...
                  </div>
                ) : isDateClosed ? (
                  <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl text-center space-y-2">
                    <AlertCircle className="w-6 h-6 text-amber-500 mx-auto" />
                    <p className="text-sm font-semibold text-[#F5F3ED]">{closureReason || 'No slots available'}</p>
                    <p className="text-xs text-neutral-400">Please choose another date above.</p>
                  </div>
                ) : availableSlots.filter(s => s.is_available).length === 0 ? (
                  <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-xl text-center space-y-2">
                    <Clock className="w-6 h-6 text-neutral-500 mx-auto" />
                    <p className="text-sm font-semibold text-neutral-300">All slots on this date are fully booked.</p>
                    <p className="text-xs text-neutral-400">Please select an alternative date or barber.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-56 overflow-y-auto pr-1">
                    {availableSlots.map(slot => (
                      <button
                        key={slot.time}
                        disabled={!slot.is_available}
                        type="button"
                        onClick={() => setSelectedTime(slot.time)}
                        className={`py-2 px-1 text-xs font-mono font-semibold rounded-lg border transition-all text-center cursor-pointer ${
                          !slot.is_available
                            ? 'opacity-30 border-neutral-800 bg-neutral-900 text-neutral-600 cursor-not-allowed line-through'
                            : selectedTime === slot.time
                            ? 'border-[#D4AF37] bg-[#D4AF37] text-[#0B0C0E] shadow-md font-bold'
                            : 'border-neutral-800 bg-[#16181E] text-neutral-200 hover:border-neutral-600'
                        }`}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 5: Customer Details */}
          {step === 5 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-[#F5F3ED]">Customer Contact Details</h3>
                <p className="text-xs text-neutral-400 mt-1">No account required. We will send your booking confirmation reference to this email.</p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tariq Khan"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#16181E] border border-neutral-700/80 rounded-lg text-sm text-[#F5F3ED] placeholder-neutral-500 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-neutral-300 block mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="name@example.co.uk"
                      value={customerEmail}
                      onChange={e => setCustomerEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#16181E] border border-neutral-700/80 rounded-lg text-sm text-[#F5F3ED] placeholder-neutral-500 focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-neutral-300 block mb-1">UK Phone Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="07xxx xxxxxx"
                      value={customerPhone}
                      onChange={e => setCustomerPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#16181E] border border-neutral-700/80 rounded-lg text-sm text-[#F5F3ED] placeholder-neutral-500 focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">Optional Notes for Barber</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Skin taper on neckline, low fade on temples"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[#16181E] border border-neutral-700/80 rounded-lg text-xs text-[#F5F3ED] placeholder-neutral-500 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: Review & Confirmation */}
          {step === 6 && currentService && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-[#F5F3ED]">Review &amp; Confirm</h3>
                <p className="text-xs text-neutral-400 mt-1">Please review your appointment summary before confirming.</p>
              </div>

              {submissionError && (
                <div className="p-3 bg-red-950/60 border border-red-800 rounded-lg text-xs text-red-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{submissionError}</span>
                </div>
              )}

              {/* Summary Card */}
              <div className="p-5 bg-[#16181E] border border-neutral-800 rounded-xl space-y-3">
                <div className="flex justify-between items-start pb-3 border-b border-neutral-800">
                  <div>
                    <h4 className="font-bold text-[#F5F3ED] text-base">{currentService.title}</h4>
                    <p className="text-xs text-neutral-400 mt-0.5">{currentService.duration_minutes} minutes duration</p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold font-mono text-[#D4AF37] tabular-nums">
                      £{currentService.price.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-neutral-500 block">Pay in shop</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-neutral-500 block">Date</span>
                    <span className="font-semibold text-neutral-200">
                      {new Date(selectedDate + 'T00:00:00Z').toLocaleDateString('en-GB', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Time Slot</span>
                    <span className="font-semibold text-neutral-200 font-mono">
                      {selectedTime} – {calculateEndTime(selectedTime, currentService.duration_minutes)} (UK)
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Barber</span>
                    <span className="font-semibold text-neutral-200">
                      {currentStaff?.name || 'Any Available Specialist'}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Location</span>
                    <span className="font-semibold text-neutral-200 truncate block">1202 Leeds Road, Bradford</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-neutral-800 text-xs">
                  <div className="flex justify-between text-neutral-400">
                    <span>Customer:</span>
                    <span className="text-neutral-200">{customerName}</span>
                  </div>
                  <div className="flex justify-between text-neutral-400">
                    <span>Contact:</span>
                    <span className="text-neutral-200 font-mono">{customerPhone} · {customerEmail}</span>
                  </div>
                </div>
              </div>

              {/* Policy Checkbox */}
              <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg text-xs space-y-2">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeToPolicy}
                    onChange={e => setAgreeToPolicy(e.target.checked)}
                    className="mt-0.5 rounded border-neutral-700 text-[#D4AF37] focus:ring-0"
                  />
                  <span className="text-neutral-300">
                    I understand that 24 hours notice is requested for cancellations. No deposit is taken today; payment is handled in shop after the service.
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* STEP 8: Success Screen */}
          {step === 8 && confirmedAppointment && (
            <div className="space-y-6 text-center py-4">
              <div className="w-14 h-14 rounded-full bg-emerald-950/80 border border-emerald-600/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h3 className="text-2xl font-extrabold text-[#F5F3ED]">Booking Confirmed!</h3>
                <p className="text-xs text-neutral-400">
                  We look forward to welcoming you at CITY OF FADES on Leeds Road.
                </p>
              </div>

              {/* Reference Banner */}
              <div className="p-4 bg-[#181B20] border border-dashed border-[#D4AF37] rounded-xl max-w-sm mx-auto">
                <span className="text-[10px] text-[#D4AF37] uppercase font-bold tracking-widest block mb-1">
                  Your Booking Reference
                </span>
                <span className="text-2xl font-mono font-extrabold text-[#F5F3ED] tracking-widest">
                  {confirmedAppointment.booking_reference}
                </span>
                <span className="text-[11px] text-neutral-400 block mt-1">
                  Quote this code on arrival or to manage your appointment online.
                </span>
              </div>

              {/* Summary Details */}
              <div className="p-4 bg-[#14161B] border border-neutral-800 rounded-xl text-left text-xs space-y-2 max-w-md mx-auto">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Service:</span>
                  <span className="font-semibold text-neutral-200">{confirmedAppointment.service_snapshot.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Appointment Date:</span>
                  <span className="font-semibold text-neutral-200">{confirmedAppointment.appointment_date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Time:</span>
                  <span className="font-semibold text-neutral-200 font-mono">
                    {confirmedAppointment.start_time} - {confirmedAppointment.end_time}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Barber:</span>
                  <span className="font-semibold text-neutral-200">{confirmedAppointment.staff_name_snapshot}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Total Price:</span>
                  <span className="font-semibold text-[#D4AF37] font-mono">£{confirmedAppointment.total_price.toFixed(2)} GBP</span>
                </div>
              </div>

              {/* Supabase backend status indicator */}
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-neutral-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Transmitted to Supabase Database (Project: qawfzbofsdgyyqsjqqzu)</span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleDownloadCalendarIcs}
                  className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Add to Calendar (.ics)</span>
                </button>

                <a
                  href="https://www.google.com/maps/place/CITY+OF+FADES/"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Google Maps Directions</span>
                </a>

                <button
                  type="button"
                  onClick={() => setShowEmailPreview(!showEmailPreview)}
                  className="px-4 py-2.5 bg-neutral-900 border border-neutral-700 text-[#D4AF37] rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{showEmailPreview ? 'Hide Email Preview' : 'Inspect Confirmation Email'}</span>
                </button>
              </div>

              {/* Email preview collapsible */}
              {showEmailPreview && (
                <div className="mt-4 p-4 bg-black/90 border border-neutral-700 rounded-xl text-left max-h-64 overflow-y-auto">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-800 text-[11px] text-neutral-400">
                    <span>Recipient: {confirmedAppointment.customer_email}</span>
                    <span className="text-amber-400">Sandbox Preview</span>
                  </div>
                  <div 
                    className="text-xs bg-white text-black p-4 rounded-lg overflow-x-auto"
                    dangerouslySetInnerHTML={{ 
                      __html: (window as any).__lastEmailHtml || 
                      `<p>Booking Confirmed for ${confirmedAppointment.customer_name} (${confirmedAppointment.booking_reference}) at 1202 Leeds Road, Bradford BD3 8LJ.</p>` 
                    }} 
                  />
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        {step < 8 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-800/80 bg-[#14161B]">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 text-xs font-semibold text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-3">
              {step < 6 ? (
                <button
                  type="button"
                  disabled={
                    (step === 1 && !selectedServiceId) ||
                    (step === 3 && (!selectedDate || !selectedTime)) ||
                    (step === 4 && !selectedTime) ||
                    (step === 5 && (!customerName.trim() || !customerEmail.trim() || !customerPhone.trim()))
                  }
                  onClick={() => {
                    if (step === 3 && !selectedTime) {
                      // Prompt user to select time
                      return;
                    }
                    setStep(step + 1);
                  }}
                  className="px-5 py-2.5 text-xs font-bold text-[#0B0C0E] bg-[#D4AF37] hover:bg-[#E5C158] disabled:opacity-40 disabled:pointer-events-none rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span>Continue</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isSubmitting || !agreeToPolicy}
                  onClick={handleConfirmBooking}
                  className="px-6 py-2.5 text-xs font-bold text-[#0B0C0E] bg-[#D4AF37] hover:bg-[#E5C158] disabled:opacity-50 disabled:pointer-events-none rounded-lg transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    <span>Reserving Slot...</span>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Confirm Appointment</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}

        {step === 8 && (
          <div className="px-6 py-4 border-t border-neutral-800 bg-[#14161B] text-center">
            <button
              onClick={onClose}
              className="px-6 py-2.5 text-xs font-bold text-[#0B0C0E] bg-[#D4AF37] hover:bg-[#E5C158] rounded-lg cursor-pointer"
            >
              Done / Return to Website
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
