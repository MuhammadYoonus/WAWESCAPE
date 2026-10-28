import { readFileSync } from "node:fs";

export async function migratePackageCatalog(pool) {
  await pool.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
    name VARCHAR(180) PRIMARY KEY, applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [applied] = await connection.query("SELECT name FROM schema_migrations WHERE name = ?", ["initial-package-catalog-v1"]);
    if (!applied.length) {
      const packages = JSON.parse(readFileSync(new URL("../data/packageCatalog.json", import.meta.url), "utf8"));
      for (const tour of packages) {
        await connection.query(`INSERT INTO tours
          (title,slug,category,location,duration,price,max_guests,image,short_description,description,itinerary,includes,excludes,active)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,true) ON DUPLICATE KEY UPDATE slug = VALUES(slug)`,
        [tour.title,tour.slug,tour.category,tour.location,tour.duration,tour.price,tour.maxGuests,tour.image,
          tour.shortDescription,tour.description,JSON.stringify(tour.itinerary),"[]","[]"]);
      }
      await connection.query("INSERT INTO schema_migrations (name) VALUES (?)", ["initial-package-catalog-v1"]);
    }
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally { connection.release(); }
}
