import { createClient } from '@supabase/supabase-js';
import { Appointment } from '../types';

export const SUPABASE_PROJECT_ID = 'qawfzbofsdgyyqsjqqzu';
export const SUPABASE_URL = 
  import.meta.env.VITE_SUPABASE_URL || `https://${SUPABASE_PROJECT_ID}.supabase.co`;
export const SUPABASE_ANON_KEY = 
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_pU3mAn5rqXYxADmevA2sDA_Ct9Xq8CJ';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

export interface SupabaseHealth {
  connected: boolean;
  tableExists: boolean;
  errorMessage?: string;
  projectId: string;
  url: string;
}

/**
 * Test connectivity to the Supabase backend and verify table availability
 */
export async function checkSupabaseConnection(): Promise<SupabaseHealth> {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('id, booking_reference')
      .limit(1);

    if (error) {
      // If error code is 42P01, the table doesn't exist yet in the database
      if (error.code === '42P01' || error.message.includes('relation "appointments" does not exist') || error.message.includes('relation "public.appointments" does not exist')) {
        return {
          connected: true,
          tableExists: false,
          errorMessage: 'Table "appointments" does not exist yet. Please run the SQL schema in your Supabase SQL Editor.',
          projectId: SUPABASE_PROJECT_ID,
          url: SUPABASE_URL
        };
      }

      return {
        connected: false,
        tableExists: false,
        errorMessage: error.message || 'Supabase query error',
        projectId: SUPABASE_PROJECT_ID,
        url: SUPABASE_URL
      };
    }

    return {
      connected: true,
      tableExists: true,
      projectId: SUPABASE_PROJECT_ID,
      url: SUPABASE_URL
    };
  } catch (err: any) {
    return {
      connected: false,
      tableExists: false,
      errorMessage: err?.message || 'Network error connecting to Supabase',
      projectId: SUPABASE_PROJECT_ID,
      url: SUPABASE_URL
    };
  }
}

/**
 * Fetch appointments from Supabase backend
 */
export async function fetchSupabaseAppointments(): Promise<{ appointments: Appointment[]; success: boolean; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('appointment_date', { ascending: true });

    if (error) {
      return { appointments: [], success: false, error: error.message };
    }

    if (!data) {
      return { appointments: [], success: true };
    }

    // Map Supabase rows to our domain model
    const appointments: Appointment[] = data.map((row: any) => ({
      id: row.id,
      booking_reference: row.booking_reference,
      service_id: row.service_id || 'srv-1',
      service_snapshot: typeof row.service_snapshot === 'string' 
        ? JSON.parse(row.service_snapshot) 
        : (row.service_snapshot || {
            title: row.service_title || 'Barber Service',
            category: 'fades',
            price: Number(row.total_price) || 18,
            duration_minutes: Number(row.duration_minutes) || 30
          }),
      staff_id: row.staff_id || null,
      staff_name_snapshot: row.staff_name_snapshot || 'Assigned Barber',
      customer_name: row.customer_name,
      customer_email: row.customer_email,
      customer_phone: row.customer_phone,
      appointment_date: String(row.appointment_date).split('T')[0],
      start_time: String(row.start_time).substring(0, 5),
      end_time: String(row.end_time).substring(0, 5),
      total_price: Number(row.total_price),
      currency: 'GBP',
      status: row.status || 'confirmed',
      notes: row.notes || undefined,
      cancellation_reason: row.cancellation_reason || undefined,
      created_at: row.created_at || new Date().toISOString(),
      updated_at: row.updated_at || new Date().toISOString()
    }));

    return { appointments, success: true };
  } catch (err: any) {
    return { appointments: [], success: false, error: err?.message };
  }
}

/**
 * Save appointment into Supabase database
 */
export async function insertSupabaseAppointment(appointment: Appointment): Promise<{ success: boolean; error?: string }> {
  try {
    const payload = {
      booking_reference: appointment.booking_reference,
      service_id: appointment.service_id,
      service_snapshot: appointment.service_snapshot,
      staff_id: appointment.staff_id,
      staff_name_snapshot: appointment.staff_name_snapshot,
      customer_name: appointment.customer_name,
      customer_email: appointment.customer_email,
      customer_phone: appointment.customer_phone,
      appointment_date: appointment.appointment_date,
      start_time: appointment.start_time,
      end_time: appointment.end_time,
      total_price: appointment.total_price,
      currency: appointment.currency,
      status: appointment.status,
      notes: appointment.notes || null,
      cancellation_reason: appointment.cancellation_reason || null
    };

    const { data, error } = await supabase
      .from('appointments')
      .insert([payload])
      .select();

    if (error) {
      console.warn('Supabase insert failed:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.warn('Supabase insert exception:', err);
    return { success: false, error: err?.message };
  }
}

/**
 * Update appointment status in Supabase
 */
export async function updateSupabaseAppointmentStatus(
  bookingReference: string, 
  status: Appointment['status'], 
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('appointments')
      .update({
        status,
        cancellation_reason: reason || null,
        updated_at: new Date().toISOString()
      })
      .eq('booking_reference', bookingReference);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}
