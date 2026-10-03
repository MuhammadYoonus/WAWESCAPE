import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config();

export const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "wavescape_db",
  port: Number(process.env.DB_PORT || 3306),
  waitForConnections: true,
  connectionLimit: 10
});

export async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(180) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role ENUM('customer', 'admin') NOT NULL DEFAULT 'customer',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS tours (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(180) NOT NULL,
      slug VARCHAR(180) NOT NULL UNIQUE,
      category ENUM('day-tour', 'multi-day', 'round-tour', 'experience') NOT NULL,
      location VARCHAR(180) NOT NULL,
      duration VARCHAR(80) NOT NULL,
      price DECIMAL(10, 2) NOT NULL,
      max_guests INT NOT NULL DEFAULT 10,
      image TEXT NOT NULL,
      short_description TEXT NOT NULL,
      description TEXT NOT NULL,
      itinerary JSON NULL,
      includes JSON NULL,
      excludes JSON NULL,
      featured BOOLEAN NOT NULL DEFAULT false,
      active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS bookings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      tour_id INT NOT NULL,
      booking_date DATE NOT NULL,
      guests INT NOT NULL,
      total_price DECIMAL(10, 2) NOT NULL,
      contact_phone VARCHAR(40) NOT NULL,
      special_requests TEXT,
      status ENUM('pending', 'confirmed', 'cancelled', 'completed') NOT NULL DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (tour_id) REFERENCES tours(id) ON DELETE CASCADE
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS package_bookings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      package_id VARCHAR(120) NOT NULL,
      package_title VARCHAR(180) NOT NULL,
      package_route VARCHAR(255) NOT NULL,
      package_price VARCHAR(60) NOT NULL,
      booking_date DATE NOT NULL,
      guests INT NOT NULL,
      contact_name VARCHAR(120) NOT NULL,
      contact_email VARCHAR(180) NOT NULL,
      contact_phone VARCHAR(40) NOT NULL,
      special_requests TEXT,
      status ENUM('pending', 'confirmed', 'cancelled', 'completed') NOT NULL DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS inquiries (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(180) NOT NULL,
      tour_interest VARCHAR(120) NOT NULL,
      message TEXT NOT NULL,
      status ENUM('new', 'contacted', 'closed') NOT NULL DEFAULT 'new',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS feedback (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(180),
      trip VARCHAR(180) NOT NULL,
      rating INT NOT NULL,
      message TEXT NOT NULL,
      status ENUM('new', 'reviewed', 'hidden') NOT NULL DEFAULT 'new',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
}

function parseJson(value, fallback) {
  if (value == null) return fallback;
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

export function mapUser(row) {
  if (!row) return null;
  return {
    _id: String(row.id),
    id: String(row.id),
    name: row.name,
    email: row.email,
    password: row.password,
    role: row.role,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function mapTour(row) {
  if (!row) return null;
  return {
    _id: String(row.id),
    id: String(row.id),
    title: row.title,
    slug: row.slug,
    category: row.category,
    location: row.location,
    duration: row.duration,
    price: Number(row.price),
    maxGuests: Number(row.max_guests),
    image: row.image,
    shortDescription: row.short_description,
    description: row.description,
    itinerary: parseJson(row.itinerary, []),
    includes: parseJson(row.includes, []),
    excludes: parseJson(row.excludes, []),
    featured: Boolean(row.featured),
    active: Boolean(row.active),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function mapBooking(row) {
  if (!row) return null;
  const booking = {
    _id: String(row.id),
    id: String(row.id),
    bookingDate: row.booking_date,
    guests: Number(row.guests),
    totalPrice: Number(row.total_price),
    contactPhone: row.contact_phone,
    specialRequests: row.special_requests || "",
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };

  if (row.tour_title) {
    booking.tour = {
      _id: String(row.tour_id),
      id: String(row.tour_id),
      title: row.tour_title,
      location: row.tour_location,
      duration: row.tour_duration,
      image: row.tour_image,
      price: row.tour_price == null ? undefined : Number(row.tour_price)
    };
  }

  if (row.user_name) {
    booking.user = {
      _id: String(row.user_id),
      id: String(row.user_id),
      name: row.user_name,
      email: row.user_email
    };
  }

  return booking;
}

export function mapPackageBooking(row) {
  if (!row) return null;
  return {
    _id: String(row.id),
    id: String(row.id),
    packageId: row.package_id,
    packageTitle: row.package_title,
    packageRoute: row.package_route,
    packagePrice: row.package_price,
    bookingDate: row.booking_date,
    guests: Number(row.guests),
    contactName: row.contact_name,
    contactEmail: row.contact_email,
    contactPhone: row.contact_phone,
    specialRequests: row.special_requests || "",
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    user: row.user_name ? {
      _id: String(row.user_id),
      id: String(row.user_id),
      name: row.user_name,
      email: row.user_email
    } : undefined
  };
}

export function mapInquiry(row) {
  if (!row) return null;
  return {
    _id: String(row.id),
    id: String(row.id),
    name: row.name,
    email: row.email,
    tourInterest: row.tour_interest,
    message: row.message,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function mapFeedback(row) {
  if (!row) return null;
  return {
    _id: String(row.id),
    id: String(row.id),
    name: row.name,
    email: row.email || "",
    trip: row.trip,
    rating: Number(row.rating),
    text: row.message,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}
