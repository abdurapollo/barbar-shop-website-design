/**
 * Automated Test Suite for CITY OF FADES
 * Validates availability calculation, collision prevention, timezone consistency, and booking limits.
 */

import { 
  timeToMinutes, 
  minutesToTime, 
  calculateEndTime, 
  getAvailableSlots, 
  validateAndReserveSlot,
  generateBookingReference,
  getLondonToday
} from './availability';
import { db } from './db';

export interface TestResult {
  name: string;
  category: 'Availability Engine' | 'Collision Prevention' | 'Timezone & Formats' | 'Database Integrity';
  passed: boolean;
  message: string;
  durationMs: number;
}

export function runAllAppletTests(): TestResult[] {
  const results: TestResult[] = [];

  function record(name: string, category: TestResult['category'], fn: () => void) {
    const start = performance.now();
    try {
      fn();
      results.push({
        name,
        category,
        passed: true,
        message: 'Passed successfully',
        durationMs: Math.round((performance.now() - start) * 100) / 100
      });
    } catch (e: any) {
      results.push({
        name,
        category,
        passed: false,
        message: e?.message || 'Assertion failed',
        durationMs: Math.round((performance.now() - start) * 100) / 100
      });
    }
  }

  // 1. Time conversion helpers
  record('timeToMinutes converts "10:30" to 630', 'Timezone & Formats', () => {
    const mins = timeToMinutes('10:30');
    if (mins !== 630) throw new Error(`Expected 630, got ${mins}`);
  });

  record('minutesToTime converts 630 to "10:30"', 'Timezone & Formats', () => {
    const str = minutesToTime(630);
    if (str !== '10:30') throw new Error(`Expected "10:30", got "${str}"`);
  });

  record('calculateEndTime correctly adds 35 min duration to "14:15"', 'Timezone & Formats', () => {
    const end = calculateEndTime('14:15', 35);
    if (end !== '14:50') throw new Error(`Expected "14:50", got "${end}"`);
  });

  // 2. Booking reference format
  record('generateBookingReference matches pattern COF-XXXXX', 'Database Integrity', () => {
    const ref = generateBookingReference();
    if (!ref.startsWith('COF-') || ref.length !== 9) {
      throw new Error(`Invalid reference code format: ${ref}`);
    }
  });

  // 3. Prevent past bookings
  record('Availability engine rejects booking dates in the past', 'Availability Engine', () => {
    const result = getAvailableSlots('2020-01-01', 'srv-1', null);
    if (!result.isClosed || result.slots.length !== 0) {
      throw new Error('Past dates must return zero slots and isClosed = true');
    }
  });

  // 4. Booking horizon boundary
  record('Availability engine rejects booking beyond 90 days in the future', 'Availability Engine', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 90);
    const dateStr = futureDate.toISOString().split('T')[0];
    const result = getAvailableSlots(dateStr, 'srv-1', null);
    if (!result.isClosed) {
      throw new Error('Dates beyond booking horizon must be rejected');
    }
  });

  // 5. Blocked shop date exclusion
  record('Shop closure on Christmas Day (2026-12-25) returns zero slots', 'Availability Engine', () => {
    const result = getAvailableSlots('2026-12-25', 'srv-1', null);
    if (!result.isClosed) {
      throw new Error('Full shop blocked date must yield isClosed = true');
    }
  });

  // 6. Overlapping appointment collision test
  record('Existing appointment prevents duplicate slot for same barber', 'Collision Prevention', () => {
    const testDate = '2026-11-10';
    const testServiceId = 'srv-1';
    const testStaffId = 'stf-1';

    // Create a temporary appointment for Tariq at 11:00
    const tempApt = db.createAppointment({
      booking_reference: 'TEST-COLLISION',
      service_id: testServiceId,
      service_snapshot: { title: 'Test Cut', category: 'fades', price: 18, duration_minutes: 35 },
      staff_id: testStaffId,
      staff_name_snapshot: 'Tariq',
      customer_name: 'Test Customer',
      customer_email: 'test@example.com',
      customer_phone: '07700900000',
      appointment_date: testDate,
      start_time: '11:00',
      end_time: '11:35',
      total_price: 18,
      currency: 'GBP',
      status: 'confirmed'
    });

    try {
      // Validate slot at 11:00 for the same barber
      const validation = validateAndReserveSlot({
        dateStr: testDate,
        startTime: '11:00',
        serviceId: testServiceId,
        staffId: testStaffId
      });

      if (validation.success) {
        throw new Error('Validation should have rejected overlapping slot at 11:00 for barber stf-1');
      }
    } finally {
      // Clean up test appointment
      db.saveAppointments(db.getAppointments().filter(a => a.booking_reference !== 'TEST-COLLISION'));
    }
  });

  // 7. Atomic reservation validator success on open slot
  record('Atomic reservation succeeds on unoccupied slot', 'Collision Prevention', () => {
    const testDate = '2026-11-12';
    const validation = validateAndReserveSlot({
      dateStr: testDate,
      startTime: '10:00',
      serviceId: 'srv-1',
      staffId: null // any barber
    });

    if (!validation.success || !validation.assignedStaffId || !validation.endTime) {
      throw new Error(`Expected successful reservation, got ${JSON.stringify(validation)}`);
    }
  });

  return results;
}
