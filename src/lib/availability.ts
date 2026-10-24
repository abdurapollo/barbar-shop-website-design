import { db } from './db';
import { TimeSlot } from '../types';

/**
 * Availability Engine for CITY OF FADES
 * Enforces business hours, barber shifts, buffer times, lead time, blocked dates, and collision prevention.
 */

// Helper: parse "HH:MM" into total minutes from midnight
export function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

// Helper: convert total minutes from midnight to "HH:MM"
export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// Helper: calculate end time given start time and duration
export function calculateEndTime(startTime: string, durationMinutes: number): string {
  const startMins = timeToMinutes(startTime);
  return minutesToTime(startMins + durationMinutes);
}

// Helper: get today's date in Europe/London formatted as YYYY-MM-DD
export function getLondonToday(): string {
  // Use Intl to format date according to Europe/London timezone
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/London',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  return formatter.format(new Date()); // YYYY-MM-DD
}

// Helper: get current London time as minutes from midnight
export function getLondonCurrentMinutes(): number {
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  const parts = formatter.format(new Date()).split(':').map(Number);
  return parts[0] * 60 + parts[1];
}

export interface AvailabilityResult {
  slots: TimeSlot[];
  isClosed: boolean;
  closureReason?: string;
}

export function getAvailableSlots(
  dateStr: string,
  serviceId: string,
  staffId: string | null = null
): AvailabilityResult {
  const service = db.getServiceById(serviceId);
  if (!service) {
    return { slots: [], isClosed: true, closureReason: 'Service not found.' };
  }

  const settings = db.getBookingSettings();
  const allStaff = db.getStaff().filter(s => s.is_active);
  const businessHours = db.getBusinessHours();
  const blockedDates = db.getBlockedDates();
  const appointments = db.getAppointments().filter(
    a => a.appointment_date === dateStr && a.status !== 'cancelled'
  );

  const todayStr = getLondonToday();
  const selectedDate = new Date(dateStr + 'T00:00:00Z');
  const todayDate = new Date(todayStr + 'T00:00:00Z');

  // 1. Cannot book in the past
  if (selectedDate < todayDate) {
    return { slots: [], isClosed: true, closureReason: 'Cannot book appointments in the past.' };
  }

  // 2. Cannot book beyond booking horizon
  const diffDays = Math.ceil((selectedDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays > settings.booking_horizon_days) {
    return {
      slots: [],
      isClosed: true,
      closureReason: `Bookings are open up to ${settings.booking_horizon_days} days in advance.`
    };
  }

  // 3. Check full-shop blocked dates
  const fullShopBlock = blockedDates.find(
    b => b.date === dateStr && (b.staff_id === null || b.staff_id === undefined) && b.is_full_day
  );
  if (fullShopBlock) {
    return { slots: [], isClosed: true, closureReason: `Closed: ${fullShopBlock.reason}` };
  }

  // 4. Check business opening hours for day of week
  // JavaScript Date getUTCDay() for normalized YYYY-MM-DD
  const dayOfWeek = selectedDate.getUTCDay();
  const todayHours = businessHours.find(h => h.day_of_week === dayOfWeek);

  if (!todayHours || todayHours.is_closed) {
    return {
      slots: [],
      isClosed: true,
      closureReason: `The shop is closed on ${todayHours?.day_name || 'this day'}.`
    };
  }

  const shopOpenMin = timeToMinutes(todayHours.open_time);
  const shopCloseMin = timeToMinutes(todayHours.close_time);
  const serviceDuration = service.duration_minutes;
  const bufferTime = Math.max(settings.buffer_time_minutes, service.buffer_minutes || 0);
  const slotInterval = settings.slot_interval_minutes || 30;

  // 5. Filter eligible barbers
  let candidateBarbers = allStaff;
  if (staffId) {
    candidateBarbers = allStaff.filter(s => s.id === staffId);
  }

  // Filter barbers working on this day of week and not on personal leave
  candidateBarbers = candidateBarbers.filter(barber => {
    // Check personal leave on this date
    const isStaffBlocked = blockedDates.some(
      b => b.date === dateStr && b.staff_id === barber.id && b.is_full_day
    );
    if (isStaffBlocked) return false;

    // Check staff schedule for this weekday
    const daySched = barber.schedule.find(s => s.day_of_week === dayOfWeek);
    return daySched && daySched.is_working;
  });

  if (candidateBarbers.length === 0) {
    return {
      slots: [],
      isClosed: true,
      closureReason: staffId 
        ? 'Selected barber is not scheduled to work on this day.' 
        : 'No barbers are scheduled to work on this day.'
    };
  }

  // 6. Generate candidate slots
  const slots: TimeSlot[] = [];
  const isToday = dateStr === todayStr;
  const currentLondonMins = getLondonCurrentMinutes();
  const minRequiredTime = currentLondonMins + (settings.lead_time_hours * 60);

  for (let startM = shopOpenMin; startM + serviceDuration <= shopCloseMin; startM += slotInterval) {
    const slotStartStr = minutesToTime(startM);
    const slotEndStr = minutesToTime(startM + serviceDuration);
    const slotEndWithBufferM = startM + serviceDuration + bufferTime;

    // Lead time rule for same-day bookings
    if (isToday && startM < minRequiredTime) {
      continue;
    }

    // Determine which candidate barbers are free during [startM, slotEndWithBufferM]
    const freeBarberIds: string[] = [];

    for (const barber of candidateBarbers) {
      const barberSched = barber.schedule.find(s => s.day_of_week === dayOfWeek);
      if (!barberSched) continue;

      const barberStartM = timeToMinutes(barberSched.start_time);
      const barberEndM = timeToMinutes(barberSched.end_time);

      // Must fit within barber's working shift
      if (startM < barberStartM || startM + serviceDuration > barberEndM) {
        continue;
      }

      // Check break time if configured
      if (barberSched.break_start && barberSched.break_end) {
        const breakStartM = timeToMinutes(barberSched.break_start);
        const breakEndM = timeToMinutes(barberSched.break_end);
        // Overlap with break
        if (startM < breakEndM && startM + serviceDuration > breakStartM) {
          continue;
        }
      }

      // Check existing appointments for this barber on this date
      const hasConflict = appointments.some(apt => {
        // If appointment is assigned to this barber OR was assigned to 'any' and grabbed this barber
        if (apt.staff_id !== null && apt.staff_id !== barber.id) {
          return false;
        }

        const aptStartM = timeToMinutes(apt.start_time);
        const aptEndM = timeToMinutes(apt.end_time);
        const aptEndWithBufferM = aptEndM + bufferTime;

        // Collision detection interval overlap: [startM, slotEndWithBufferM) vs [aptStartM, aptEndWithBufferM)
        return startM < aptEndWithBufferM && slotEndWithBufferM > aptStartM;
      });

      if (!hasConflict) {
        freeBarberIds.push(barber.id);
      }
    }

    slots.push({
      time: slotStartStr,
      available_staff_ids: freeBarberIds,
      is_available: freeBarberIds.length > 0,
      conflict_reason: freeBarberIds.length === 0 ? 'Fully booked' : undefined
    });
  }

  return {
    slots,
    isClosed: false
  };
}

/**
 * Atomic reservation validation at checkout submission time
 * Guarantees no two customers can double-book the same barber or slot.
 */
export function validateAndReserveSlot(params: {
  dateStr: string;
  startTime: string;
  serviceId: string;
  staffId: string | null;
}): { success: boolean; assignedStaffId: string; endTime: string; error?: string } {
  const service = db.getServiceById(params.serviceId);
  if (!service) {
    return { success: false, assignedStaffId: '', endTime: '', error: 'Service no longer available.' };
  }

  const duration = service.duration_minutes;
  const endTime = calculateEndTime(params.startTime, duration);

  // Re-run availability check atomically
  const availability = getAvailableSlots(params.dateStr, params.serviceId, params.staffId);
  if (availability.isClosed) {
    return { success: false, assignedStaffId: '', endTime, error: availability.closureReason || 'Shop closed.' };
  }

  const matchingSlot = availability.slots.find(s => s.time === params.startTime);
  if (!matchingSlot || !matchingSlot.is_available || matchingSlot.available_staff_ids.length === 0) {
    return {
      success: false,
      assignedStaffId: '',
      endTime,
      error: 'This time slot was just taken by another customer. Please choose another slot.'
    };
  }

  // Select assigned barber: if customer chose specific barber, use it; otherwise pick first available
  const assignedStaffId = params.staffId || matchingSlot.available_staff_ids[0];

  return {
    success: true,
    assignedStaffId,
    endTime
  };
}

/**
 * Generate human-friendly booking reference (e.g. "COF-79241")
 */
export function generateBookingReference(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let ref = 'COF-';
  for (let i = 0; i < 5; i++) {
    ref += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return ref;
}
