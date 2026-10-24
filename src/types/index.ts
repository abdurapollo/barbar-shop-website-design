export type ServiceCategory = 'fades' | 'haircuts' | 'beards' | 'combos' | 'junior';

export interface Service {
  id: string;
  title: string;
  category: ServiceCategory;
  description: string;
  price: number; // in GBP
  duration_minutes: number;
  is_active: boolean;
  requires_owner_confirmation: boolean; // Flag marking initial proposed price/duration
  buffer_minutes: number;
}

export interface StaffScheduleDay {
  day_of_week: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  is_working: boolean;
  start_time: string; // "09:30"
  end_time: string; // "19:00"
  break_start?: string;
  break_end?: string;
}

export interface Staff {
  id: string;
  name: string;
  role_title: string;
  bio: string;
  avatar_url: string;
  is_active: boolean;
  specialties: string[];
  schedule: StaffScheduleDay[];
}

export interface BusinessDayHours {
  day_of_week: number; // 0 = Sunday, ..., 6 = Saturday
  day_name: string;
  is_closed: boolean;
  open_time: string; // "10:00"
  close_time: string; // "19:30"
  is_tentative_unconfirmed: boolean;
}

export interface BlockedDate {
  id: string;
  date: string; // "YYYY-MM-DD"
  reason: string;
  staff_id?: string | null; // null means entire shop
  is_full_day: boolean;
  start_time?: string;
  end_time?: string;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';

export interface Appointment {
  id: string;
  booking_reference: string; // e.g. "COF-78241"
  service_id: string;
  service_snapshot: {
    title: string;
    category: ServiceCategory;
    price: number;
    duration_minutes: number;
  };
  staff_id: string | null; // null = any available barber
  staff_name_snapshot?: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  appointment_date: string; // "YYYY-MM-DD"
  start_time: string; // "11:30"
  end_time: string; // "12:15"
  total_price: number;
  currency: 'GBP';
  status: AppointmentStatus;
  notes?: string;
  cancellation_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface TimeSlot {
  time: string; // "10:00"
  available_staff_ids: string[];
  is_available: boolean;
  conflict_reason?: string;
}

export interface BookingSettings {
  slot_interval_minutes: number; // e.g. 15, 30, 45, 60
  buffer_time_minutes: number; // e.g. 5, 10
  lead_time_hours: number; // e.g. 2 hours min notice
  booking_horizon_days: number; // e.g. 30 days
  cancellation_notice_hours: number; // e.g. 24 hours
  allow_staff_selection: boolean;
  deposit_required: boolean;
  deposit_amount_gbp: number;
  unconfirmed_pricing_notice_active: boolean;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor_email: string;
  action: string;
  details: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: 'Skin Fade' | 'Taper Fade' | 'Beard Sculpt' | 'Textured Crop' | 'Line Up' | 'Barbershop';
  description: string;
  imageUrl: string;
  isFeatured?: boolean;
}

export interface Testimonial {
  id: string;
  author_name: string;
  rating: number; // 1 to 5
  comment: string;
  date: string;
  source: 'Google Maps Listing';
  source_url: string;
  verified: boolean;
}

export interface AdminAccount {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  phone?: string;
  security_pin?: string;
  created_at: string;
  is_registration_locked: boolean;
}
