import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { test } from "node:test";
import "dotenv/config";
import mysql from "mysql2/promise";

test("fresh setup and legacy booking migration preserve relationships and remain repeatable", {
  skip: process.env.RUN_MYSQL_INTEGRATION !== "1"
}, async () => {
  const name = `wavescape_test_${randomUUID().replaceAll("-", "")}`;
  const control = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost", port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root", password: process.env.DB_PASSWORD || ""
  });
  let db;
  try {
    await control.query(`CREATE DATABASE \`${name}\``);
    process.env.DB_NAME = name;
    db = await import("../src/db.js");
    await db.initDb();
    const [fresh] = await db.pool.query("SHOW COLUMNS FROM bookings");
    assert.ok(fresh.some(column => column.Field === "special_requests"));
    await db.pool.query("INSERT INTO users (id,name,email,password) VALUES (1,'Test','migration@example.invalid','test-only')");
    await db.pool.query(`INSERT INTO tours (id,title,slug,category,location,duration,price,image,short_description,description)
      VALUES (1,'Different tour','different-tour','day-tour','Galle','1 Day',100,'https://example.com/a.jpg','Different','Different')`);
    // Only the disposable database created above is modified for this legacy fixture.
    await db.pool.query("DROP TABLE bookings");
    await db.pool.query(`CREATE TABLE trips (id INT PRIMARY KEY, title VARCHAR(255), location VARCHAR(255),
      description TEXT, duration VARCHAR(100), price DECIMAL(10,2), image_url VARCHAR(500))`);
    await db.pool.query(`INSERT INTO trips VALUES (1,'Original booked trip','Ella','Legacy description','1 Day',123,'https://example.com/b.jpg')`);
    await db.pool.query(`CREATE TABLE bookings (id INT AUTO_INCREMENT PRIMARY KEY, trip_id INT NOT NULL,
      customer_name VARCHAR(255), email VARCHAR(255), phone VARCHAR(50) NOT NULL, travelers INT NOT NULL,
      travel_date DATE NOT NULL, total_amount DECIMAL(10,2) NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (trip_id) REFERENCES trips(id))`);
    await db.pool.query(`INSERT INTO bookings (trip_id,customer_name,email,phone,travelers,travel_date,total_amount)
      VALUES (1,'Test','migration@example.invalid','0770000000',2,'2027-01-01',246)`);
    await db.initDb();
    await db.initDb();
    const [migrated] = await db.pool.query(`SELECT b.*,t.title FROM bookings b JOIN tours t ON t.id=b.tour_id`);
    assert.equal(migrated.length, 1);
    assert.equal(migrated[0].title, "Original booked trip");
    assert.notEqual(migrated[0].tour_id, 1);
    assert.equal(migrated[0].user_id, 1);
    assert.equal(Number(migrated[0].total_price), 246);
    const [copied] = await db.pool.query("SELECT COUNT(*) AS n FROM tours WHERE slug='legacy-trip-1'");
    assert.equal(copied[0].n, 1);
  } finally {
    if (db) await db.pool.end();
    // name is generated here and cannot refer to the user's project database.
    if (/^wavescape_test_[a-f0-9]{32}$/.test(name)) await control.query(`DROP DATABASE IF EXISTS \`${name}\``);
    await control.end();
  }
});
