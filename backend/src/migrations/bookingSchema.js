// Upgrade the older trips-based table without discarding existing records.
export async function migrateBookingSchema(db) {
  let [columns] = await db.query("SHOW COLUMNS FROM bookings");
  const names = new Set(columns.map(column => column.Field));
  const additions = {
    user_id: "INT NULL", tour_id: "INT NULL", booking_date: "DATE NULL",
    guests: "INT NOT NULL DEFAULT 1", total_price: "DECIMAL(10, 2) NOT NULL DEFAULT 0",
    contact_phone: "VARCHAR(40) NOT NULL DEFAULT ''", special_requests: "TEXT NULL",
    customer_name: "VARCHAR(255) NULL", email: "VARCHAR(255) NULL",
    updated_at: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
  };
  for (const [name, definition] of Object.entries(additions)) {
    if (!names.has(name)) await db.query(`ALTER TABLE bookings ADD COLUMN \`${name}\` ${definition}`);
  }
  if (names.has("trip_id")) {
    // Legacy trip IDs belong to a different table. Copy referenced trips under
    // their own slugs instead of assuming the same numeric tour ID is related.
    await db.query(`INSERT INTO tours
      (title, slug, category, location, duration, price, max_guests, image,
       short_description, description, itinerary, includes, excludes, featured, active)
      SELECT LEFT(tr.title, 180), CONCAT('legacy-trip-', tr.id), 'experience',
        LEFT(COALESCE(tr.location, ''), 180), LEFT(COALESCE(tr.duration, 'Short tour'), 80),
        tr.price, 1000, COALESCE(tr.image_url, ''),
        COALESCE(tr.description, tr.title), COALESCE(tr.description, tr.title),
        JSON_ARRAY(), JSON_ARRAY(), JSON_ARRAY(), false, false
      FROM trips tr
      WHERE EXISTS (SELECT 1 FROM bookings b WHERE b.trip_id = tr.id)
        AND NOT EXISTS (SELECT 1 FROM tours t WHERE t.slug = CONCAT('legacy-trip-', tr.id))`);
    await db.query(`UPDATE bookings b
      LEFT JOIN tours t ON t.slug = CONCAT('legacy-trip-', b.trip_id)
      LEFT JOIN users u ON u.email = b.email
      SET b.tour_id = COALESCE(b.tour_id, t.id), b.user_id = COALESCE(b.user_id, u.id),
          b.booking_date = COALESCE(b.booking_date, b.travel_date),
          b.guests = b.travelers, b.total_price = b.total_amount, b.contact_phone = COALESCE(b.phone, '')
      WHERE b.trip_id IS NOT NULL`);
    // Retain the old columns as historical data, but new rows use canonical fields.
    for (const column of columns.filter(column => ["trip_id", "phone", "travelers", "travel_date", "total_amount"].includes(column.Field))) {
      if (column.Null === "NO") await db.query(`ALTER TABLE bookings MODIFY COLUMN \`${column.Field}\` ${column.Type} NULL`);
    }
  }
  // Keep booking history when an account is removed and prevent deleting booked tours.
  const [keys] = await db.query(`SELECT CONSTRAINT_NAME, COLUMN_NAME, DELETE_RULE
    FROM information_schema.KEY_COLUMN_USAGE k
    JOIN information_schema.REFERENTIAL_CONSTRAINTS r
      USING (CONSTRAINT_SCHEMA, CONSTRAINT_NAME, TABLE_NAME)
    WHERE k.TABLE_SCHEMA = DATABASE() AND k.TABLE_NAME = 'bookings'
      AND k.COLUMN_NAME IN ('user_id', 'tour_id')`);
  for (const key of keys) {
    const expected = key.COLUMN_NAME === "user_id" ? "SET NULL" : "RESTRICT";
    if (key.DELETE_RULE !== expected && !(expected === "RESTRICT" && key.DELETE_RULE === "NO ACTION")) {
      await db.query(`ALTER TABLE bookings DROP FOREIGN KEY \`${key.CONSTRAINT_NAME}\``);
    }
  }
  const [userColumns] = await db.query("SHOW COLUMNS FROM bookings LIKE 'user_id'");
  if (userColumns[0].Null !== "YES") await db.query("ALTER TABLE bookings MODIFY COLUMN user_id INT NULL");
  const [remaining] = await db.query(`SELECT COLUMN_NAME FROM information_schema.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'bookings' AND REFERENCED_TABLE_NAME IS NOT NULL`);
  for (const [column, table, rule] of [["user_id", "users", "SET NULL"], ["tour_id", "tours", "RESTRICT"]]) {
    if (!remaining.some(key => key.COLUMN_NAME === column)) {
      await db.query(`ALTER TABLE bookings ADD CONSTRAINT fk_bookings_${column} FOREIGN KEY (${column}) REFERENCES ${table}(id) ON DELETE ${rule}`);
    }
  }
}
