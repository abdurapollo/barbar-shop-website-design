import { 
  Service, 
  Staff, 
  BusinessDayHours, 
  BlockedDate, 
  Appointment, 
  BookingSettings, 
  AuditLog,
  GalleryItem,
  Testimonial,
  AdminAccount
} from '../types';
import { 
  insertSupabaseAppointment, 
  updateSupabaseAppointmentStatus,
  fetchSupabaseAppointments,
  checkSupabaseConnection
} from './supabase';

const STORAGE_KEY_PREFIX = 'city_of_fades_v1_';

export const INITIAL_SERVICES: Service[] = [
  {
    id: 'srv-1',
    title: 'Skin / Taper Fade',
    category: 'fades',
    description: 'Ultra-clean zero/foil razor fade blended seamlessly to the crown with crisp edge work and styling powder finish.',
    price: 18.00,
    duration_minutes: 35,
    buffer_minutes: 5,
    is_active: true,
    requires_owner_confirmation: true
  },
  {
    id: 'srv-2',
    title: 'Classic Scissor Haircut & Style',
    category: 'haircuts',
    description: 'Precision scissor and clipper trim tailored to head shape, finished with neck taper and premium matte pomade.',
    price: 16.00,
    duration_minutes: 30,
    buffer_minutes: 5,
    is_active: true,
    requires_owner_confirmation: true
  },
  {
    id: 'srv-3',
    title: 'The Full Works: Fade & Beard Sculpt',
    category: 'combos',
    description: 'Signature razor skin fade combined with hot towel treatment, straight-razor cheek line sculpting and beard oil conditioning.',
    price: 26.00,
    duration_minutes: 50,
    buffer_minutes: 5,
    is_active: true,
    requires_owner_confirmation: true
  },
  {
    id: 'srv-4',
    title: 'Beard Trim, Shape & Hot Razor Line',
    category: 'beards',
    description: 'Detailed beard de-bulking, cheek contouring with hot lather, sharp straight razor outlines and soothing balm.',
    price: 12.00,
    duration_minutes: 20,
    buffer_minutes: 5,
    is_active: true,
    requires_owner_confirmation: true
  },
  {
    id: 'srv-5',
    title: 'Junior / Student Fade (Under 16)',
    category: 'junior',
    description: 'Modern skin fade or clean haircut for juniors and students with complimentary hair parting line.',
    price: 14.00,
    duration_minutes: 25,
    buffer_minutes: 5,
    is_active: true,
    requires_owner_confirmation: true
  },
  {
    id: 'srv-6',
    title: 'City VIP: Fade, Beard & Hot Towel Facial',
    category: 'combos',
    description: 'Complete grooming session: signature fade, beard luxury trim, herbal steam face towel, scalp massage and styling.',
    price: 34.00,
    duration_minutes: 60,
    buffer_minutes: 10,
    is_active: true,
    requires_owner_confirmation: true
  }
];

export const GOOGLE_MAPS_URL = 'https://www.google.com/maps/place/CITY+OF+FADES/@53.7931048,-1.7185104,15z/data=!4m10!1m2!2m1!1sbarber+shop+in+Bradford,+UK!3m6!1s0x487be177e7cbec5b:0x7c4968e2c527df5a!8m2!3d53.7931048!4d-1.7185104!15sChtiYXJiZXIgc2hvcCBpbiBCcmFkZm9yZCwgVUtaHCIaYmFyYmVyIHNob3AgaW4gYnJhZGZvcmQgdWuSAQtiYXJiZXJfc2hvcOABAA!16s%2Fg%2F11s75v6hxh?entry=ttu';

export const INITIAL_STAFF: Staff[] = [
  {
    id: 'stf-1',
    name: 'Tariq',
    role_title: 'Senior Barber & Fade Architect',
    bio: 'Specialist in razor fades, low drops and sharp temple tapers with 8+ years on Leeds Road.',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&h=400&q=80',
    is_active: true,
    specialties: ['Skin Fade', 'Taper Fade', 'Razor Line-up'],
    schedule: [
      { day_of_week: 1, is_working: true, start_time: '10:00', end_time: '19:30' },
      { day_of_week: 2, is_working: true, start_time: '10:00', end_time: '19:30' },
      { day_of_week: 3, is_working: true, start_time: '10:00', end_time: '19:30' },
      { day_of_week: 4, is_working: true, start_time: '10:00', end_time: '19:30' },
      { day_of_week: 5, is_working: true, start_time: '10:00', end_time: '19:30' },
      { day_of_week: 6, is_working: true, start_time: '09:30', end_time: '19:30' },
      { day_of_week: 0, is_working: true, start_time: '11:00', end_time: '17:30' },
    ]
  },
  {
    id: 'stf-2',
    name: 'Hamza',
    role_title: 'Master Barber & Beard Specialist',
    bio: 'Renowned for beard sculpting, symmetrical contours, textured crops and scissor craft.',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&h=400&q=80',
    is_active: true,
    specialties: ['Beard Sculpt', 'Scissor Cut', 'Hot Towel Service'],
    schedule: [
      { day_of_week: 1, is_working: true, start_time: '10:00', end_time: '19:30' },
      { day_of_week: 2, is_working: true, start_time: '10:00', end_time: '19:30' },
      { day_of_week: 3, is_working: false, start_time: '10:00', end_time: '19:30' }, // Off Wednesday
      { day_of_week: 4, is_working: true, start_time: '10:00', end_time: '19:30' },
      { day_of_week: 5, is_working: true, start_time: '10:00', end_time: '19:30' },
      { day_of_week: 6, is_working: true, start_time: '09:30', end_time: '19:30' },
      { day_of_week: 0, is_working: true, start_time: '11:00', end_time: '17:30' },
    ]
  },
  {
    id: 'stf-3',
    name: 'Zayn',
    role_title: 'Contemporary Fade & Texture Stylist',
    bio: 'Precision technician focusing on burst fades, modern French crops, textured tops and clean necklines.',
    avatar_url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&h=400&q=80',
    is_active: true,
    specialties: ['Burst Fade', 'Textured Crop', 'Junior Cuts'],
    schedule: [
      { day_of_week: 1, is_working: false, start_time: '10:00', end_time: '19:30' }, // Off Monday
      { day_of_week: 2, is_working: true, start_time: '10:00', end_time: '19:30' },
      { day_of_week: 3, is_working: true, start_time: '10:00', end_time: '19:30' },
      { day_of_week: 4, is_working: true, start_time: '10:00', end_time: '19:30' },
      { day_of_week: 5, is_working: true, start_time: '10:00', end_time: '19:30' },
      { day_of_week: 6, is_working: true, start_time: '09:30', end_time: '19:30' },
      { day_of_week: 0, is_working: false, start_time: '11:00', end_time: '17:30' },
    ]
  }
];

export const INITIAL_BUSINESS_HOURS: BusinessDayHours[] = [
  { day_of_week: 1, day_name: 'Monday', is_closed: false, open_time: '10:00', close_time: '19:30', is_tentative_unconfirmed: true },
  { day_of_week: 2, day_name: 'Tuesday', is_closed: false, open_time: '10:00', close_time: '19:30', is_tentative_unconfirmed: true },
  { day_of_week: 3, day_name: 'Wednesday', is_closed: false, open_time: '10:00', close_time: '19:30', is_tentative_unconfirmed: true },
  { day_of_week: 4, day_name: 'Thursday', is_closed: false, open_time: '10:00', close_time: '19:30', is_tentative_unconfirmed: true },
  { day_of_week: 5, day_name: 'Friday', is_closed: false, open_time: '10:00', close_time: '19:30', is_tentative_unconfirmed: true },
  { day_of_week: 6, day_name: 'Saturday', is_closed: false, open_time: '09:30', close_time: '19:30', is_tentative_unconfirmed: true },
  { day_of_week: 0, day_name: 'Sunday', is_closed: false, open_time: '11:00', close_time: '18:00', is_tentative_unconfirmed: true },
];

export const INITIAL_BOOKING_SETTINGS: BookingSettings = {
  slot_interval_minutes: 30,
  buffer_time_minutes: 5,
  lead_time_hours: 1, // Minimum 1 hour notice
  booking_horizon_days: 45,
  cancellation_notice_hours: 24,
  allow_staff_selection: true,
  deposit_required: false,
  deposit_amount_gbp: 0,
  unconfirmed_pricing_notice_active: true
};

export const INITIAL_BLOCKED_DATES: BlockedDate[] = [
  {
    id: 'blk-1',
    date: '2026-12-25',
    reason: 'Christmas Day Shop Closure',
    staff_id: null,
    is_full_day: true
  },
  {
    id: 'blk-2',
    date: '2026-12-26',
    reason: 'Boxing Day Shop Closure',
    staff_id: null,
    is_full_day: true
  }
];

export const INITIAL_GALLERY: GalleryItem[] = [
  {
    id: 'gal-1',
    title: 'Mid Skin Drop Fade',
    category: 'Skin Fade',
    description: 'Razor clean blend from zero into a natural weight line with textured crop.',
    imageUrl: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=800&q=80',
    isFeatured: true
  },
  {
    id: 'gal-2',
    title: 'Low Taper Fade & Beard Transition',
    category: 'Taper Fade',
    description: 'Subtle temple & nape blowout with sharp razor cheek blend.',
    imageUrl: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=800&q=80',
    isFeatured: true
  },
  {
    id: 'gal-3',
    title: 'Full Beard Sculpt & Razor Line-up',
    category: 'Beard Sculpt',
    description: 'Symmetrical shaping with crisp razor contours, hot lather and mustache definition.',
    imageUrl: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=800&q=80',
    isFeatured: true
  },
  {
    id: 'gal-4',
    title: 'Textured Caesar Crop with Foil Blend',
    category: 'Textured Crop',
    description: 'Heavy matte texture with blunt micro-fringe and skin taper.',
    imageUrl: 'https://images.unsplash.com/photo-1593702295094-aea22597af65?auto=format&fit=crop&w=800&q=80',
    isFeatured: false
  },
  {
    id: 'gal-5',
    title: 'High Skin Fade & Precision Top',
    category: 'Skin Fade',
    description: 'Crisp high bald taper with clean hard parting and high shine finish.',
    imageUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80',
    isFeatured: false
  },
  {
    id: 'gal-6',
    title: 'Sharp Edge-up & Temple Blowout',
    category: 'Line Up',
    description: 'Razor-defined hairline contouring with precision symmetry and sharp edges.',
    imageUrl: 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?auto=format&fit=crop&w=800&q=80',
    isFeatured: false
  },
  {
    id: 'gal-7',
    title: 'City of Fades Bradford Studio & Station',
    category: 'Barbershop',
    description: 'Inside 1202 Leeds Road: luxury hydraulic leather chairs, backlit LED mirrors, and precision grooming station.',
    imageUrl: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=800&q=80',
    isFeatured: true
  },
  {
    id: 'gal-8',
    title: 'Leeds Road Barbershop Storefront',
    category: 'Barbershop',
    description: 'Exterior storefront and entrance on Leeds Road in Laisterdyke, Bradford.',
    imageUrl: 'https://images.unsplash.com/photo-1512690459411-b9245aed614b?auto=format&fit=crop&w=800&q=80',
    isFeatured: false
  }
];

export const INITIAL_REVIEWS: Testimonial[] = [
  {
    id: 'rev-1',
    author_name: 'Bilal K.',
    rating: 5,
    comment: 'Best skin fade in Bradford hands down. Attention to detail on Leeds Road is second to none. Clean shop, sharp lines, definitely coming back every fortnight.',
    date: 'Verified Google Review',
    source: 'Google Maps Listing',
    source_url: GOOGLE_MAPS_URL,
    verified: true
  },
  {
    id: 'rev-2',
    author_name: 'Usman R.',
    rating: 5,
    comment: 'First time visiting City of Fades after a recommendation. Got the full beard sculpt and taper fade. The razor work was immaculate and no waiting around.',
    date: 'Verified Google Review',
    source: 'Google Maps Listing',
    source_url: 'https://www.google.com/maps/place/CITY+OF+FADES/',
    verified: true
  },
  {
    id: 'rev-3',
    author_name: 'Marcus D.',
    rating: 5,
    comment: 'Top quality barbers. Extremely consistent, great atmosphere and easy parking right off Leeds Road. Booked online and walked straight in.',
    date: 'Verified Google Review',
    source: 'Google Maps Listing',
    source_url: 'https://www.google.com/maps/place/CITY+OF+FADES/',
    verified: true
  }
];

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-seed-1',
    booking_reference: 'COF-10294',
    service_id: 'srv-1',
    service_snapshot: {
      title: 'Skin / Taper Fade',
      category: 'fades',
      price: 18.00,
      duration_minutes: 35
    },
    staff_id: 'stf-1',
    staff_name_snapshot: 'Tariq',
    customer_name: 'Adam Rashid',
    customer_email: 'adam.rashid@example.co.uk',
    customer_phone: '07700 900123',
    appointment_date: new Date().toISOString().split('T')[0],
    start_time: '14:00',
    end_time: '14:35',
    total_price: 18.00,
    currency: 'GBP',
    status: 'confirmed',
    notes: 'Low taper on temples please.',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'apt-seed-2',
    booking_reference: 'COF-84920',
    service_id: 'srv-3',
    service_snapshot: {
      title: 'The Full Works: Fade & Beard Sculpt',
      category: 'combos',
      price: 26.00,
      duration_minutes: 50
    },
    staff_id: 'stf-2',
    staff_name_snapshot: 'Hamza',
    customer_name: 'Zack Ahmed',
    customer_email: 'zack.a@example.com',
    customer_phone: '07700 900456',
    appointment_date: new Date().toISOString().split('T')[0],
    start_time: '16:00',
    end_time: '16:50',
    total_price: 26.00,
    currency: 'GBP',
    status: 'confirmed',
    notes: 'Hot towel with beard oil',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 3).toISOString()
  }
];

// Helper to safely read and write to localStorage
class DatabaseStore {
  private get<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(STORAGE_KEY_PREFIX + key);
      if (!data) return defaultValue;
      return JSON.parse(data) as T;
    } catch {
      return defaultValue;
    }
  }

  private set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(value));
    } catch (e) {
      console.warn('Storage write error', e);
    }
  }

  // SERVICES
  getServices(): Service[] {
    return this.get<Service[]>('services', INITIAL_SERVICES);
  }

  saveServices(services: Service[]): void {
    this.set('services', services);
  }

  getServiceById(id: string): Service | undefined {
    return this.getServices().find(s => s.id === id);
  }

  updateService(service: Service): void {
    const services = this.getServices();
    const index = services.findIndex(s => s.id === service.id);
    if (index >= 0) {
      services[index] = service;
    } else {
      services.push(service);
    }
    this.saveServices(services);
    this.logAudit('admin@cityoffades.co.uk', 'UPDATE_SERVICE', `Updated service "${service.title}" (£${service.price.toFixed(2)})`);
  }

  deleteService(id: string): void {
    const services = this.getServices().filter(s => s.id !== id);
    this.saveServices(services);
    this.logAudit('admin@cityoffades.co.uk', 'DELETE_SERVICE', `Removed service ID ${id}`);
  }

  // STAFF
  getStaff(): Staff[] {
    const list = this.get<Staff[]>('staff', INITIAL_STAFF);
    return list.map((s, idx) => {
      if (!s.avatar_url || s.avatar_url.trim() === '') {
        const fallback = INITIAL_STAFF.find(init => init.id === s.id) || INITIAL_STAFF[idx];
        return { ...s, avatar_url: fallback?.avatar_url || '' };
      }
      return s;
    });
  }

  saveStaff(staffList: Staff[]): void {
    this.set('staff', staffList);
  }

  getStaffById(id: string): Staff | undefined {
    return this.getStaff().find(s => s.id === id);
  }

  updateStaff(member: Staff): void {
    const staff = this.getStaff();
    const index = staff.findIndex(s => s.id === member.id);
    if (index >= 0) {
      staff[index] = member;
    } else {
      staff.push(member);
    }
    this.saveStaff(staff);
    this.logAudit('admin@cityoffades.co.uk', 'UPDATE_STAFF', `Updated staff "${member.name}"`);
  }

  // BUSINESS HOURS
  getBusinessHours(): BusinessDayHours[] {
    return this.get<BusinessDayHours[]>('business_hours', INITIAL_BUSINESS_HOURS);
  }

  saveBusinessHours(hours: BusinessDayHours[]): void {
    this.set('business_hours', hours);
    this.logAudit('admin@cityoffades.co.uk', 'UPDATE_HOURS', 'Updated opening hours schedule');
  }

  // BLOCKED DATES
  getBlockedDates(): BlockedDate[] {
    return this.get<BlockedDate[]>('blocked_dates', INITIAL_BLOCKED_DATES);
  }

  saveBlockedDates(dates: BlockedDate[]): void {
    this.set('blocked_dates', dates);
  }

  addBlockedDate(blocked: BlockedDate): void {
    const dates = this.getBlockedDates();
    dates.push(blocked);
    this.saveBlockedDates(dates);
    this.logAudit('admin@cityoffades.co.uk', 'ADD_BLOCKED_DATE', `Blocked date ${blocked.date}: ${blocked.reason}`);
  }

  removeBlockedDate(id: string): void {
    const dates = this.getBlockedDates().filter(d => d.id !== id);
    this.saveBlockedDates(dates);
    this.logAudit('admin@cityoffades.co.uk', 'REMOVE_BLOCKED_DATE', `Unblocked date ID ${id}`);
  }

  // BOOKING SETTINGS
  getBookingSettings(): BookingSettings {
    return this.get<BookingSettings>('booking_settings', INITIAL_BOOKING_SETTINGS);
  }

  saveBookingSettings(settings: BookingSettings): void {
    this.set('booking_settings', settings);
    this.logAudit('admin@cityoffades.co.uk', 'UPDATE_SETTINGS', 'Updated booking engine parameters');
  }

  // APPOINTMENTS
  getAppointments(): Appointment[] {
    return this.get<Appointment[]>('appointments', INITIAL_APPOINTMENTS);
  }

  saveAppointments(appointments: Appointment[]): void {
    this.set('appointments', appointments);
  }

  getAppointmentByReference(reference: string): Appointment | undefined {
    const ref = reference.trim().toUpperCase();
    return this.getAppointments().find(a => a.booking_reference.toUpperCase() === ref);
  }

  createAppointment(appointment: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>): Appointment {
    const appointments = this.getAppointments();
    const newAppointment: Appointment = {
      ...appointment,
      id: 'apt-' + Math.random().toString(36).substring(2, 9),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    appointments.push(newAppointment);
    this.saveAppointments(appointments);
    this.logAudit(
      newAppointment.customer_email || 'client', 
      'CREATE_APPOINTMENT', 
      `Booking ${newAppointment.booking_reference} for ${newAppointment.customer_name} on ${newAppointment.appointment_date} at ${newAppointment.start_time}`
    );

    // Asynchronously replicate to Supabase backend
    insertSupabaseAppointment(newAppointment).then(res => {
      if (res.success) {
        this.logAudit('system@supabase', 'SUPABASE_SYNC_SUCCESS', `Saved booking ${newAppointment.booking_reference} to Supabase backend.`);
      } else {
        console.warn('Supabase sync notice:', res.error);
      }
    });

    return newAppointment;
  }

  updateAppointmentStatus(id: string, status: Appointment['status'], reason?: string): Appointment | undefined {
    const appointments = this.getAppointments();
    const apt = appointments.find(a => a.id === id);
    if (!apt) return undefined;

    apt.status = status;
    if (reason) apt.cancellation_reason = reason;
    apt.updated_at = new Date().toISOString();

    this.saveAppointments(appointments);
    this.logAudit('admin@cityoffades.co.uk', 'UPDATE_APPOINTMENT_STATUS', `Status for ${apt.booking_reference} changed to ${status}`);

    // Update in Supabase backend
    updateSupabaseAppointmentStatus(apt.booking_reference, status, reason).catch(err => {
      console.warn('Failed to update status in Supabase:', err);
    });

    return apt;
  }

  /**
   * Synchronize appointments with the Supabase remote database
   */
  async syncWithSupabase(): Promise<{ syncedCount: number; success: boolean; message: string }> {
    try {
      const res = await fetchSupabaseAppointments();
      if (!res.success) {
        return { syncedCount: 0, success: false, message: res.error || 'Failed to fetch from Supabase' };
      }

      const localApts = this.getAppointments();
      const localMap = new Map(localApts.map(a => [a.booking_reference.toUpperCase(), a]));

      let newCount = 0;
      // Merge remote appointments into local
      for (const remoteApt of res.appointments) {
        const key = remoteApt.booking_reference.toUpperCase();
        if (!localMap.has(key)) {
          localApts.push(remoteApt);
          newCount++;
        } else {
          // If remote status was updated, keep newer status
          const existing = localMap.get(key)!;
          if (remoteApt.status !== existing.status) {
            existing.status = remoteApt.status;
            existing.cancellation_reason = remoteApt.cancellation_reason;
            existing.updated_at = remoteApt.updated_at;
          }
        }
      }

      this.saveAppointments(localApts);

      // Also ensure any local bookings that aren't yet in Supabase get uploaded
      const remoteKeys = new Set(res.appointments.map(a => a.booking_reference.toUpperCase()));
      for (const localApt of localApts) {
        if (!remoteKeys.has(localApt.booking_reference.toUpperCase())) {
          insertSupabaseAppointment(localApt).catch(() => {});
        }
      }

      if (newCount > 0) {
        this.logAudit('system@supabase', 'SUPABASE_SYNC_PULL', `Pulled ${newCount} new appointments from Supabase backend.`);
      }

      return { 
        syncedCount: localApts.length, 
        success: true, 
        message: `Successfully connected and synced ${localApts.length} bookings with Supabase backend.` 
      };
    } catch (e: any) {
      return { syncedCount: 0, success: false, message: e?.message || 'Sync failed' };
    }
  }

  // AUDIT LOGS
  getAuditLogs(): AuditLog[] {
    return this.get<AuditLog[]>('audit_logs', [
      {
        id: 'aud-init',
        timestamp: new Date().toISOString(),
        actor_email: 'system',
        action: 'SYSTEM_BOOT',
        details: 'Initial CITY OF FADES database mounted with provisional pricing flagged for owner verification.'
      }
    ]);
  }

  logAudit(actor: string, action: string, details: string): void {
    const logs = this.getAuditLogs();
    logs.unshift({
      id: 'aud-' + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      actor_email: actor,
      action,
      details
    });
    // Keep max 200 logs
    this.set('audit_logs', logs.slice(0, 200));
  }

  // REVIEWS & GALLERY
  getReviews(): Testimonial[] {
    return this.get<Testimonial[]>('reviews', INITIAL_REVIEWS);
  }

  getGallery(): GalleryItem[] {
    const items = this.get<GalleryItem[]>('gallery', INITIAL_GALLERY);
    // If stored items have empty imageUrl or fewer items than initial gallery, enrich them
    if (items.length < INITIAL_GALLERY.length) {
      return INITIAL_GALLERY;
    }
    return items.map((item, idx) => {
      if (!item.imageUrl || item.imageUrl.trim() === '') {
        const fallback = INITIAL_GALLERY.find(init => init.id === item.id) || INITIAL_GALLERY[idx];
        return { ...item, imageUrl: fallback?.imageUrl || '' };
      }
      return item;
    });
  }

  // ADMIN ACCOUNT & ONE-TIME REGISTRATION SLOT
  getAdminAccount(): AdminAccount | null {
    return this.get<AdminAccount | null>('admin_account', null);
  }

  hasAdminAccount(): boolean {
    const acc = this.getAdminAccount();
    return !!acc && acc.is_registration_locked;
  }

  registerAdminAccount(data: {
    email: string;
    password: string;
    full_name: string;
    phone?: string;
    security_pin?: string;
  }): { success: boolean; account?: AdminAccount; error?: string } {
    if (this.hasAdminAccount()) {
      return { 
        success: false, 
        error: 'Registration is closed. An administrator account has already been created and the slot is locked.' 
      };
    }

    if (!data.email || !data.email.includes('@')) {
      return { success: false, error: 'Please enter a valid administrator email.' };
    }
    if (!data.password || data.password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }
    if (!data.full_name.trim()) {
      return { success: false, error: 'Please enter your full name.' };
    }

    const newAccount: AdminAccount = {
      id: 'admin-' + Math.random().toString(36).substring(2, 9),
      email: data.email.trim().toLowerCase(),
      password_hash: data.password,
      full_name: data.full_name.trim(),
      phone: data.phone?.trim() || '',
      security_pin: data.security_pin?.trim() || '',
      created_at: new Date().toISOString(),
      is_registration_locked: true
    };

    this.set('admin_account', newAccount);
    this.logAudit(
      newAccount.email, 
      'OWNER_ADMIN_CREATED', 
      `Master admin account created for ${newAccount.full_name} (${newAccount.email}). Registration slot permanently locked.`
    );

    return { success: true, account: newAccount };
  }

  verifyAdminLogin(email: string, password: string): { success: boolean; account?: AdminAccount; error?: string } {
    const account = this.getAdminAccount();
    if (!account) {
      return { 
        success: false, 
        error: 'No administrator account has been set up yet. Please create your admin account first.' 
      };
    }

    if (account.email.toLowerCase() === email.trim().toLowerCase() && account.password_hash === password) {
      this.logAudit(account.email, 'ADMIN_LOGIN_SUCCESS', 'Owner logged in successfully.');
      return { success: true, account };
    }

    this.logAudit(email, 'ADMIN_LOGIN_FAILED', 'Failed login attempt.');
    return { success: false, error: 'Invalid email or password.' };
  }

  updateAdminPassword(oldPassword: string, newPassword: string): { success: boolean; error?: string } {
    const account = this.getAdminAccount();
    if (!account) return { success: false, error: 'Account not found' };

    if (account.password_hash !== oldPassword) {
      return { success: false, error: 'Current password does not match.' };
    }
    if (newPassword.length < 6) {
      return { success: false, error: 'New password must be at least 6 characters.' };
    }

    account.password_hash = newPassword;
    this.set('admin_account', account);
    this.logAudit(account.email, 'ADMIN_PASSWORD_UPDATED', 'Admin password changed.');
    return { success: true };
  }

  resetAdminPasswordWithPin(email: string, pin: string, newPassword: string): { success: boolean; error?: string } {
    const account = this.getAdminAccount();
    if (!account) return { success: false, error: 'No registered admin account found.' };

    if (account.email.toLowerCase() !== email.trim().toLowerCase()) {
      return { success: false, error: 'Email does not match registered owner account.' };
    }
    if (account.security_pin && account.security_pin !== pin.trim()) {
      return { success: false, error: 'Security PIN does not match.' };
    }
    if (newPassword.length < 6) {
      return { success: false, error: 'New password must be at least 6 characters.' };
    }

    account.password_hash = newPassword;
    this.set('admin_account', account);
    this.logAudit(account.email, 'ADMIN_PASSWORD_RESET_PIN', 'Password reset successfully using security PIN.');
    return { success: true };
  }

  // RESET TO FACTORY PRESETS
  resetToFactoryDefaults(): void {
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'services');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'staff');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'business_hours');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'blocked_dates');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'booking_settings');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'appointments');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'audit_logs');
    this.logAudit('admin@cityoffades.co.uk', 'RESET_FACTORY_DEFAULTS', 'Restored initial sample database with provisional pricing badges.');
  }
}

export const db = new DatabaseStore();
