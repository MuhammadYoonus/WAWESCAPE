export function buildTourQuery(query, adminView = false) {
  const where = adminView ? [] : ["active = true"];
  const values = [];
  if (adminView && ["published", "hidden"].includes(query.visibility)) {
    where.push("active = ?"); values.push(query.visibility === "published");
  }
  if (query.category && query.category !== "all") { where.push("category = ?"); values.push(query.category); }
  if (query.featured === "true") where.push("featured = true");
  const durations = { short: "Short tour", 1: "1 Day", 2: "2 Days", 3: "3 Days" };
  if (durations[query.duration]) { where.push("duration = ?"); values.push(durations[query.duration]); }
  if (typeof query.q === "string" && query.q.trim()) {
    const term = `%${query.q.trim().slice(0, 180).replace(/[!%_]/g, match => `!${match}`)}%`;
    where.push("(title LIKE ? ESCAPE '!' OR location LIKE ? ESCAPE '!' OR short_description LIKE ? ESCAPE '!')");
    values.push(term, term, term);
  }
  const orders = {
    recommended: "featured DESC, created_at DESC, id DESC",
    newest: "created_at DESC, id DESC", "price-asc": "price ASC, id DESC",
    "price-desc": "price DESC, id DESC", "title-asc": "title ASC, id DESC"
  };
  const order = Object.hasOwn(orders, query.sort) ? orders[query.sort] : orders.recommended;
  return { sql: `SELECT * FROM tours WHERE ${where.join(" AND ") || "1 = 1"} ORDER BY ${order}`, values };
}
