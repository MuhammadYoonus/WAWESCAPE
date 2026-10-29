# WAWESCAPE - Sri Lankan Travel Agency

A full-stack web application for a local Sri Lankan travel agency. The project uses a React frontend, an Express/Node.js backend, and a MySQL database.

## Main features
- Public home page with Sri Lanka travel content
- Destination, package, gallery, feedback, about, contact, login and favorites pages
- Short tours, 1 day tours, 2 day tours and 3 day tour packages
- Short experiences: whale watching, Galle Fort, Coconut Tree Hill, Turtle Beach, Koggala Boat Safari, Jungle Beach, Weligama Beach, Udawalawa Safari and more
- Package booking page with travel date, guest count and contact information
- User registration/login with JWT
- Customer booking history
- Admin dashboard for booking details and inquiry details
- Admin Add Tour Package form publishes database-backed tours to the Tour Packages page
- Email/SMS booking confirmations for customers and admin
- Contact inquiry form saved to database
- Favorites saved in browser local storage
- MySQL database
- Express/Node.js REST API
- React frontend
- Tailwind CSS styling

## Technology mapping to the Web Development module
- HTML/CSS: React JSX and Tailwind CSS
- JavaScript framework: React.js
- Client-server architecture: React client communicates with Express API
- HTTP: REST API using GET, POST, PUT and DELETE
- Database: MySQL
- Backend: Node.js + Express.js
- Full-stack stack: React + Express + MySQL + Node.js

## Requirements
- Node.js 20+
- MySQL local installation
- Existing MySQL database named `wavescape_db`
- npm

## Run

Create the database once in MySQL before starting the backend:

```sql
CREATE DATABASE IF NOT EXISTS wavescape_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 1. Backend
```bash
cd backend
npm ci
copy .env.example .env
npm run seed
npm run dev
```

### 2. Frontend
Open another terminal:
```bash
cd frontend
npm ci
npm run dev
```

Frontend: http://localhost:5173
Backend: http://localhost:5001

After copying `.env.example`, replace the database password and JWT secret. Leave optional SMTP/Twilio credentials empty until you intend to use real notification services. Do not commit `.env` files. The local pre-migration database backup is excluded by `.gitignore`.

Seeded admin:
- Email: admin@wavecape.lk
- Password: Admin123!

Change this password before real deployment.

## Add a tour package

1. Log in as an admin and open the Admin dashboard.
2. In **Add a tour package**, enter the name, route, duration, price per adult, guest limit, image URL, descriptions and tour plan (one activity per line).
3. Click **Add Tour Package**. The tour is saved in MySQL and appears in its Short Tours, 1 Day, 2 Days or 3 Days section immediately on the next visit to Tour Packages.
4. Use **View the published tour package** in the success message to open the correct section. Customers can use **Book Plan** to book the saved tour.

All package listings now come from MySQL. The original 21 starter packages are imported once on first startup, retaining existing matching tours. Editing or deleting a package is not undone by restarting the application. Featured tours also appear on the home page. The booking API reads the price and guest limit from the database.

## Manage tour packages

The Admin dashboard lists published and hidden tours. **Edit** loads the package into the form; **Save Tour Changes** updates the same record. Turn off **Visible to customers** to stop new bookings without deleting history. **Delete** requires confirmation and is blocked when either type of booking references the tour. Unbooked tours can be permanently removed.

Both the public catalogue and admin list support database searches by name, location and description, duration filters, and price/name/newest sorting. The admin list also filters by visibility. Public search settings are kept in the URL so results can be revisited or shared.

Server validation checks real calendar dates (today or later in Sri Lanka), valid contact emails/phone numbers, nonnegative integer guest counts, capacity, field lengths and allowed statuses. Booking prices always come from the stored tour. Async failures return JSON messages; dashboards and booking history offer retry controls, and expired sessions are cleared safely.

On small screens the navigation collapses into a labeled menu. The sticky header occupies its own layout space, keeping login headings and hero content clear. Keyboard focus indicators, dialog focus containment and readable text contrast support accessible navigation.

## Database compatibility

Startup creates the required tables and upgrades older `trips`-based booking tables without deleting their records. Referenced legacy trips are copied into separate archived tour records; their numeric IDs are never assumed to identify a current tour. New tour bookings reference `tours` and retain special requests. Re-running the seed command adds missing sample tours without clearing bookings or overwriting existing tours.

Run `npm test` in each application folder. To verify fresh setup and legacy migration against an isolated temporary MySQL database, run `$env:RUN_MYSQL_INTEGRATION='1'; npm test` in the backend folder (PowerShell). This requires database creation privileges and never uses the project database as its test fixture.

## Environment
Backend `.env`:
```env
PORT=5001
JWT_SECRET=change_this_secret
CLIENT_URL=http://localhost:5173
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=wavescape_db
DB_PORT=3306
BRAND_NAME=WAWESCAPE
ADMIN_NOTIFICATION_EMAIL=admin@wavecape.lk
ADMIN_NOTIFICATION_PHONE=+94762840207
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
SMTP_FROM=WAWESCAPE <bookings@wavecape.lk>
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_FROM_PHONE=+10000000000
```

Email confirmations use SMTP settings. SMS confirmations use Twilio settings. If either set of credentials is missing, that channel is skipped so local development still works.

Frontend `.env`:
```env
VITE_API_URL=http://localhost:5001/api
```

## Suggested future extensions
- Online payment gateway
- Google Maps
- Cloud image storage
- Tour availability calendar
- Reviews and ratings
- Coupon system
- PDF invoices

## Project documentation

- [Personalized project report - 8 pages](docs/EG_2023_5990_Project_Report.pdf)
- [Database ERD PDF](docs/WAWESCAPE_ERD.pdf) and [Mermaid source](docs/ERD.md)
- [Testing and verification](docs/TESTING.md)
- [Demonstration recording guide](docs/DEMONSTRATION_GUIDE.md)
- [Interface screenshots](docs/screenshots/)

The report cover identifies **MBM Yoonus, EG/2023/5990**. To rebuild it, install `docs/requirements-report.txt`, make Poppler's `pdftoppm` available, and run `python docs/build_report.py`. The report generator checks the ten-page limit. A camera-on demonstration recording must still be made by the student; it is not included in this repository.
