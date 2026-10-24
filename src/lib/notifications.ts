import { Appointment } from '../types';

export interface EmailNotification {
  id: string;
  recipient_email: string;
  recipient_name: string;
  subject: string;
  html_content: string;
  sent_at: string;
  status: 'sent_sandbox' | 'sent_production' | 'failed';
  provider: 'sandbox' | 'resend' | 'sendgrid' | 'smtp';
}

const NOTIFICATIONS_STORAGE_KEY = 'city_of_fades_email_logs';

export function getNotificationLogs(): EmailNotification[] {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveNotificationLog(log: EmailNotification) {
  try {
    const logs = getNotificationLogs();
    logs.unshift(log);
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(logs.slice(0, 50)));
  } catch (e) {
    console.warn('Failed to save notification log', e);
  }
}

export function generateBookingConfirmationEmailHtml(appointment: Appointment): string {
  const dateFormatted = new Date(appointment.appointment_date + 'T00:00:00Z').toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0B0C0E; color: #E8E5DE; margin: 0; padding: 24px; }
    .card { max-width: 560px; margin: 0 auto; background: #131518; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 32px; }
    .brand { font-size: 22px; font-weight: 800; letter-spacing: 2px; color: #D4AF37; margin-bottom: 8px; text-transform: uppercase; }
    .subtitle { font-size: 14px; color: #9CA3AF; margin-bottom: 24px; }
    .reference-box { background: #1A1D24; border: 1px dashed #D4AF37; border-radius: 8px; padding: 16px; text-align: center; margin-bottom: 24px; }
    .ref-code { font-size: 24px; font-weight: 700; letter-spacing: 3px; color: #F5F3ED; }
    .details-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 14px; }
    .label { color: #9CA3AF; }
    .value { font-weight: 600; color: #F5F3ED; }
    .address-card { background: #181B20; border-radius: 8px; padding: 16px; margin-top: 24px; font-size: 13px; line-height: 1.6; }
    .btn { display: inline-block; background: #D4AF37; color: #0B0C0E; font-weight: 700; text-decoration: none; padding: 12px 24px; border-radius: 6px; margin-top: 16px; font-size: 14px; }
    .footer { margin-top: 28px; font-size: 12px; color: #6B7280; text-align: center; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 16px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="brand">CITY OF FADES</div>
    <div class="subtitle">Appointment Booking Confirmation</div>

    <p>Hi ${appointment.customer_name},</p>
    <p>Your barber appointment at <strong>CITY OF FADES</strong> is confirmed. Please find your reservation details below:</p>

    <div class="reference-box">
      <div style="font-size: 12px; text-transform: uppercase; color: #D4AF37; margin-bottom: 4px;">Booking Reference</div>
      <div class="ref-code">${appointment.booking_reference}</div>
    </div>

    <div class="details-row">
      <span class="label">Service</span>
      <span class="value">${appointment.service_snapshot.title}</span>
    </div>
    <div class="details-row">
      <span class="label">Date</span>
      <span class="value">${dateFormatted}</span>
    </div>
    <div class="details-row">
      <span class="label">Time</span>
      <span class="value">${appointment.start_time} - ${appointment.end_time} (UK Local Time)</span>
    </div>
    <div class="details-row">
      <span class="label">Barber</span>
      <span class="value">${appointment.staff_name_snapshot || 'Next Available Barber'}</span>
    </div>
    <div class="details-row">
      <span class="label">Duration</span>
      <span class="value">${appointment.service_snapshot.duration_minutes} minutes</span>
    </div>
    <div class="details-row">
      <span class="label">Total (Pay in Shop)</span>
      <span class="value">£${appointment.total_price.toFixed(2)} GBP</span>
    </div>

    <div class="address-card">
      <strong style="color: #D4AF37;">Location:</strong><br>
      CITY OF FADES<br>
      1202 Leeds Road, Laisterdyke, Bradford BD3 8LJ, UK<br>
      Telephone: <strong>01274 010658</strong><br>
      <a href="https://www.google.com/maps/place/CITY+OF+FADES/" target="_blank" style="color: #D4AF37; text-decoration: underline;">Open Directions in Google Maps</a>
    </div>

    <p style="font-size: 13px; color: #9CA3AF; margin-top: 20px;">
      <strong>Cancellation Policy:</strong> If you need to reschedule or cancel, please provide at least 24 hours notice by looking up your reference on our website or calling the shop.
    </p>

    <div class="footer">
      CITY OF FADES · 1202 Leeds Road, Bradford BD3 8LJ · Tel: 01274 010658<br>
      This is an automated confirmation sent to ${appointment.customer_email}.
    </div>
  </div>
</body>
</html>
  `;
}

export function generateCancellationEmailHtml(appointment: Appointment, reason: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0B0C0E; color: #E8E5DE; margin: 0; padding: 24px; }
    .card { max-width: 560px; margin: 0 auto; background: #131518; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 32px; }
    .brand { font-size: 22px; font-weight: 800; letter-spacing: 2px; color: #D4AF37; margin-bottom: 8px; text-transform: uppercase; }
    .ref-code { font-size: 20px; font-weight: 700; color: #EF4444; }
  </style>
</head>
<body>
  <div class="card">
    <div class="brand">CITY OF FADES</div>
    <h3>Appointment Cancellation Notice</h3>
    <p>Hi ${appointment.customer_name},</p>
    <p>Your appointment <strong>${appointment.booking_reference}</strong> for <strong>${appointment.service_snapshot.title}</strong> on <strong>${appointment.appointment_date} at ${appointment.start_time}</strong> has been cancelled.</p>
    <p><strong>Reason:</strong> ${reason || 'Customer requested cancellation.'}</p>
    <p>To book a new slot at your convenience, please visit our online booking platform.</p>
    <p style="font-size: 13px; color: #9CA3AF;">CITY OF FADES · 1202 Leeds Road, Bradford BD3 8LJ · Phone: 01274 010658</p>
  </div>
</body>
</html>
  `;
}

export async function sendBookingConfirmationNotification(appointment: Appointment): Promise<EmailNotification> {
  const html = generateBookingConfirmationEmailHtml(appointment);
  const notification: EmailNotification = {
    id: 'ntf-' + Math.random().toString(36).substring(2, 9),
    recipient_email: appointment.customer_email,
    recipient_name: appointment.customer_name,
    subject: `Booking Confirmed: ${appointment.service_snapshot.title} at CITY OF FADES [${appointment.booking_reference}]`,
    html_content: html,
    sent_at: new Date().toISOString(),
    status: 'sent_sandbox',
    provider: 'sandbox'
  };

  saveNotificationLog(notification);
  return notification;
}

export async function sendCancellationNotification(appointment: Appointment, reason: string): Promise<EmailNotification> {
  const html = generateCancellationEmailHtml(appointment, reason);
  const notification: EmailNotification = {
    id: 'ntf-' + Math.random().toString(36).substring(2, 9),
    recipient_email: appointment.customer_email,
    recipient_name: appointment.customer_name,
    subject: `Booking Cancelled: ${appointment.booking_reference} - CITY OF FADES`,
    html_content: html,
    sent_at: new Date().toISOString(),
    status: 'sent_sandbox',
    provider: 'sandbox'
  };

  saveNotificationLog(notification);
  return notification;
}
