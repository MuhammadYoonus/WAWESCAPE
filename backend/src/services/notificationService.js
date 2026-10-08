import nodemailer from "nodemailer";
import twilio from "twilio";

const brandName = process.env.BRAND_NAME || "WAWESCAPE";
const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.SMTP_FROM;
const adminPhone = process.env.ADMIN_NOTIFICATION_PHONE;

let mailTransporter;
let smsClient;

function getMailTransporter() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null;
  }

  if (!mailTransporter) {
    mailTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  return mailTransporter;
}

function getSmsClient() {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_FROM_PHONE) {
    return null;
  }

  if (!smsClient) {
    smsClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }

  return smsClient;
}

export async function sendBookingConfirmation(booking, options = {}) {
  const details = normalizeBooking(booking, options);
  const jobs = [
    sendCustomerEmail(details),
    sendAdminEmail(details),
    sendCustomerSms(details),
    sendAdminSms(details)
  ];

  const results = await Promise.allSettled(jobs);
  results
    .filter(result => result.status === "rejected")
    .forEach(result => console.error("Booking notification failed:", result.reason?.message || result.reason));
}

async function sendCustomerEmail(details) {
  const transporter = getMailTransporter();
  if (!transporter || !details.customerEmail) return;

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: details.customerEmail,
    subject: `${brandName} booking confirmation - ${details.title}`,
    text: customerMessage(details),
    html: messageHtml(customerMessage(details))
  });
}

async function sendAdminEmail(details) {
  const transporter = getMailTransporter();
  if (!transporter || !adminEmail) return;

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: adminEmail,
    subject: `New ${details.kind} booking - ${details.title}`,
    text: adminMessage(details),
    html: messageHtml(adminMessage(details))
  });
}

async function sendCustomerSms(details) {
  await sendSms(details.customerPhone, smsMessage(details, "customer"));
}

async function sendAdminSms(details) {
  await sendSms(adminPhone, smsMessage(details, "admin"));
}

async function sendSms(to, body) {
  const client = getSmsClient();
  if (!client || !to) return;

  await client.messages.create({
    from: process.env.TWILIO_FROM_PHONE,
    to,
    body
  });
}

function normalizeBooking(booking, options) {
  const isPackage = options.kind === "package";
  const customerName = booking.contactName || booking.user?.name || booking.customerName || "Customer";
  const customerEmail = booking.contactEmail || booking.user?.email || booking.email;
  const customerPhone = booking.contactPhone || booking.phone;
  const title = booking.packageTitle || booking.tour?.title || options.title || "Tour booking";
  const route = booking.packageRoute || booking.tour?.location || "";
  const totalAmount = booking.totalAmount || booking.totalPrice;

  return {
    id: booking._id || booking.id,
    kind: isPackage ? "package" : "tour",
    title,
    route,
    bookingDate: booking.bookingDate,
    customerName,
    customerEmail,
    customerPhone,
    pickupLocation: booking.pickupLocation,
    adults: booking.adults || 0,
    children: booking.children || 0,
    infants: booking.infants || 0,
    totalAmount,
    specialRequests: booking.specialRequests || ""
  };
}

function customerMessage(details) {
  return [
    `Hi ${details.customerName},`,
    "",
    `Thanks for booking ${details.title} with ${brandName}.`,
    "",
    bookingSummary(details),
    "",
    "Your booking is currently pending. Our team will contact you soon to confirm final details."
  ].join("\n");
}

function adminMessage(details) {
  return [
    `New ${details.kind} booking received.`,
    "",
    bookingSummary(details),
    "",
    `Customer: ${details.customerName}`,
    `Email: ${details.customerEmail || "Not provided"}`,
    `Phone: ${details.customerPhone || "Not provided"}`,
    details.specialRequests ? `Special requests: ${details.specialRequests}` : ""
  ].filter(Boolean).join("\n");
}

function bookingSummary(details) {
  return [
    `Booking ID: ${details.id}`,
    `Trip: ${details.title}`,
    details.route ? `Route/location: ${details.route}` : "",
    `Travel date: ${formatDate(details.bookingDate)}`,
    `Guests: ${details.adults} adults, ${details.children} children, ${details.infants} infants`,
    details.pickupLocation ? `Pickup: ${details.pickupLocation}` : "",
    details.totalAmount ? `Estimated total: LKR ${Number(details.totalAmount).toLocaleString("en-LK")}` : ""
  ].filter(Boolean).join("\n");
}

function smsMessage(details, recipient) {
  if (recipient === "admin") {
    return `New ${brandName} booking: ${details.title} for ${details.customerName} on ${formatDate(details.bookingDate)}. Phone: ${details.customerPhone || "N/A"}`;
  }

  return `${brandName}: Your booking for ${details.title} on ${formatDate(details.bookingDate)} is received and pending confirmation.`;
}

function messageHtml(message) {
  return `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a">${message
    .split("\n")
    .map(line => line ? `<p>${escapeHtml(line)}</p>` : "<br />")
    .join("")}</div>`;
}

function formatDate(value) {
  if (!value) return "Not provided";
  return new Date(value).toLocaleDateString("en-LK", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
