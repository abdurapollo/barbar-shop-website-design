# CITY OF FADES — Bradford Barbershop & Online Booking Platform

A high-performance, client-ready website and real-time appointment booking engine built for **CITY OF FADES**, a barbershop located on Leeds Road, Bradford, UK.

---

## 📍 Verified Business Information

- **Business Name:** CITY OF FADES
- **Address:** 1202 Leeds Road, Laisterdyke, Bradford, BD3 8LJ, United Kingdom
- **Telephone:** `01274 010658`
- **Google Maps Listing:** [https://www.google.com/maps/place/CITY+OF+FADES/](https://www.google.com/maps/place/CITY+OF+FADES/)
- **Timezone:** `Europe/London` (Automatic BST / GMT local time)
- **Currency:** `GBP (£)`

---

## 🚀 Key Features

### 1. Public Experience & Design
- **Dark Luxury Aesthetic:** Deep obsidian canvas (`#0B0C0E`), warm ivory typography (`#F5F3ED`), restrained metallic bronze/gold accents (`#D4AF37`), hairline borders, and responsive vector barber illustrations.
- **Top Bar Contract:** Strict 3-zone header compliant with the Universal Frontend Design Constitution (single-line brand wordmark, 5 concise navigation links, and 1 primary booking action).
- **Zero-Pill Metadata:** Clean typographic separation (`·`, `/`) instead of clunky pill chips.
- **Transparent Owner Verification:** Newly configured initial services, prices, and opening hours are flagged with "Provisional" badges until owner confirmation.

### 2. Multi-Step Booking Flow
1. **Choose Service:** Fades, Scissor cuts, Beard grooming, Combos, or Junior cuts.
2. **Choose Barber:** Pick a specific master barber (Tariq, Hamza, Zayn) or "Any Available Barber".
3. **Select Date:** Interactive date picker with live open/closed day status.
4. **Select Time Slot:** Dynamically generated available time slots respecting shifts, buffers, and existing appointments.
5. **Customer Details:** Name, UK phone number, email, and styling notes. No mandatory account creation required.
6. **Review Summary:** Breakdown of duration, GBP price, appointment date/time, and 24-hour cancellation agreement.
7. **Atomic Reservation:** Revalidates availability at submission time to eliminate double-booking race conditions.
8. **Confirmation:** Instant confirmation with unique reference code (e.g. `COF-84920`), Add to Calendar (`.ics` download), directions link, and notification preview.

### 3. Customer Self-Service ("My Booking")
- Lookup appointment by 8-digit reference code or email address.
- View service details, barber, date, and time.
- Cancel eligible bookings with 1-click and optional reason note.

### 4. Admin Management Console (`/admin`)
- **Quick Access:** Click "Owner & Admin Portal" in the footer or press `Ctrl + Shift + A`.
- **Default Credentials:**
  - **Email:** `admin@cityoffades.co.uk`
  - **Password:** `BradfordFade2026!`
- **Dashboard KPIs:** Today's appointments, upcoming bookings, completed count, estimated revenue, and pending owner verification alerts.
- **Roster & Calendar:** Searchable appointments table with instant status management (`confirmed`, `completed`, `cancelled`, `no_show`).
- **Service CRUD:** Add, edit, price, duration, and owner sign-off toggles.
- **Barber Staff CRUD:** Working shifts, specialties, and chair availability.
- **Weekly Business Hours:** Modify open/close times for Europe/London timezone. Changes immediately update public availability.
- **Blocked Dates:** Add holidays and shop closures.
- **QA Test Suite:** Integrated 7-point automated test runner validating the availability engine, past date exclusion, and collision prevention.
- **Postgres / Supabase Schema:** 1-click download of the complete SQL migration file with RLS policies.

---

## 🗄️ Supabase PostgreSQL Backend Integration

This project is configured with your Supabase project:
- **Project ID:** `qawfzbofsdgyyqsjqqzu`
- **Supabase URL:** `https://qawfzbofsdgyyqsjqqzu.supabase.co`
- **Publishable Key:** `sb_publishable_pU3mAn5rqXYxADmevA2sDA_Ct9Xq8CJ`

### Quick Setup to Initialize the Remote Database:
1. Open your Supabase SQL Editor: [https://supabase.com/dashboard/project/qawfzbofsdgyyqsjqqzu/sql](https://supabase.com/dashboard/project/qawfzbofsdgyyqsjqqzu/sql)
2. In the Admin Portal of this application (press `Ctrl+Shift+A` or click the footer link, navigate to **Postgres / Supabase**), click **"Copy SQL Schema"**.
3. Paste the SQL script into your Supabase SQL Editor and click **Run**.
4. All client bookings created through the public booking flow will immediately be saved directly into `public.appointments` in your Supabase database, and the barbershop owner can view and manage them in either the Supabase Table Editor or the in-app Admin Dashboard.

### Relational Tables in Supabase:
- `public.profiles`: Supabase Auth profiles with RBAC (`admin`, `staff`, `customer`).
- `public.services`: Haircut and grooming roster with provisional confirmation flags.
- `public.staff`: Barber roster and specialisms.
- `public.staff_schedules`: Weekly recurring working shifts per barber.
- `public.business_hours`: Opening and closing hours per weekday for Europe/London timezone.
- `public.blocked_dates`: Full-day or partial-day shop closures and bank holidays.
- `public.appointments`: Bookings with historical service snapshot (`title`, `price`, `duration_minutes`), barber assignment, status lifecycle, and conflict index.
- `public.booking_settings`: Buffer times, slot intervals, cancellation notice hours, and lead times.
- `public.audit_logs`: Chronological log of administrative actions.

---

## 🧪 Automated Testing

Run the automated test suite directly in the Admin Console under the **QA Test Suite** tab or run `npm run lint` and `npm run build` in the terminal.

Tests verify:
1. `timeToMinutes` & `minutesToTime` conversion precision.
2. `calculateEndTime` adding duration without drift.
3. Reference code generation pattern (`COF-XXXXX`).
4. Rejection of appointments in the past.
5. Rejection of appointments beyond the booking horizon.
6. Exclusion of full-shop blocked dates.
7. Atomic slot collision prevention for overlapping requests.

---

## 🛠️ Local Development & Build

```bash
# Install dependencies
npm install

# Run development server (Port 3000)
npm run dev

# Run TypeScript typecheck
npm run lint

# Build for production
npm run build
```
