import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import { formatLkr, packageOptions } from "../data/tourPackages";
import { heroImages } from "../assets/images/imageCatalog";
import { tourImageUrl } from "../utils/tourImage";

const emptyForm = {
  title: "", location: "", days: "short", price: "", maxGuests: 10,
  image: "", shortDescription: "", description: "", plan: "", featured: false, active: true
};

export default function AdminTourForm({ tour, onSaved, onCancel }) {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [published, setPublished] = useState(null);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    const dayMatch = tour?.duration.match(/^(\d+)\s*days?/i);
    setForm(tour ? {
      title: tour.title, location: tour.location, days: dayMatch ? dayMatch[1] : "short",
      price: tour.price, maxGuests: tour.maxGuests, image: tour.image,
      shortDescription: tour.shortDescription, description: tour.description,
      plan: tour.itinerary.flatMap(item => item.activities || []).join("\n"),
      featured: tour.featured, active: tour.active
    } : { ...emptyForm });
    setError(""); setPublished(null); setImageFailed(false);
  }, [tour]);

  function change(field, value) {
    setForm(current => ({ ...current, [field]: value }));
    setPublished(null);
    if (field === "image") setImageFailed(false);
  }

  async function submit(event) {
    event.preventDefault();
    if (saving) return;
    setError("");
    setPublished(null);
    const activities = form.plan.split("\n").map(line => line.trim()).filter(Boolean);
    if (!activities.length) {
      setError("Add at least one activity to the tour plan.");
      return;
    }
    setSaving(true);
    const duration = form.days === "short" ? "Short tour" : `${form.days} ${form.days === "1" ? "Day" : "Days"}`;
    try {
      const payload = {
        title: form.title.trim(), location: form.location.trim(), duration,
        category: form.days === "short" ? "experience" : form.days === "1" ? "day-tour" : "multi-day",
        price: Number(form.price), maxGuests: Number(form.maxGuests), image: form.image.trim(),
        shortDescription: form.shortDescription.trim(), description: form.description.trim(),
        itinerary: [{ day: "Tour plan", title: duration, activities }],
        featured: form.featured, active: form.active,
        ...(tour ? { slug: tour.slug, includes: tour.includes, excludes: tour.excludes } : {})
      };
      const { data } = tour ? await api.put(`/tours/${tour._id}`, payload) : await api.post("/tours", payload);
      setPublished({ title: data.title, days: form.days, id: data._id, active: data.active });
      setForm({ ...emptyForm });
      setImageFailed(false);
      onSaved?.(data, Boolean(tour));
    } catch (err) {
      setError(err.response?.data?.message || "Unable to add the tour. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return <section className="card mt-10 p-5 md:p-8" aria-labelledby="add-tour-title">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p className="eyebrow">TOUR PACKAGES</p>
        <h2 id="add-tour-title" className="mt-2 scroll-mt-36 text-3xl font-black">{tour ? "Edit tour package" : "Add a tour package"}</h2>
        <p className="mt-3 text-slate-600">{tour ? "Save changes to update this package for customers." : "Publish a tour directly to the Tour Packages page."}</p>
      </div>
      <Link to="/packages" className="btn-outline">View Tour Packages</Link>
    </div>
    <form onSubmit={submit} className="mt-7" aria-busy={saving}>
      <fieldset disabled={saving} className="grid min-w-0 gap-8 lg:grid-cols-[1fr_300px]">
        <div className="grid min-w-0 content-start gap-5 md:grid-cols-2">
          <label className="md:col-span-2">Tour name<input required maxLength={180} value={form.title} onChange={e => change("title", e.target.value)} placeholder="e.g. Ella Mountain Escape" /></label>
          <label className="md:col-span-2">Route or location<input required maxLength={180} value={form.location} onChange={e => change("location", e.target.value)} placeholder="e.g. Ella - Nine Arch Bridge - Ravana Falls" /></label>
          <label>Tour duration<select aria-label="Tour duration" value={form.days} onChange={e => change("days", e.target.value)}>{packageOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <label>Price per adult (LKR)<input required type="number" min="0.01" max="99999999.99" step="0.01" value={form.price} onChange={e => change("price", e.target.value)} placeholder="e.g. 18500" /></label>
          <label>Maximum guests<input required type="number" min="1" max="1000" step="1" value={form.maxGuests} onChange={e => change("maxGuests", e.target.value)} /></label>
          <label>Image URL<input required maxLength={2048} value={form.image} onChange={e => change("image", e.target.value)} placeholder="https://example.com/tour.jpg" /></label>
          <label className="md:col-span-2">Short description<textarea required maxLength={500} rows="2" value={form.shortDescription} onChange={e => change("shortDescription", e.target.value)} placeholder="A short introduction to the tour" /></label>
          <label className="md:col-span-2">Full description<textarea required maxLength={10000} rows="4" value={form.description} onChange={e => change("description", e.target.value)} placeholder="Describe the experience and what travelers can expect" /></label>
          <label className="md:col-span-2">Tour plan (one activity per line)<textarea required maxLength={15000} rows="5" value={form.plan} onChange={e => change("plan", e.target.value)} placeholder={"Hotel pickup\nGuided sightseeing\nLunch and return transfer"} /></label>
          <label className="md:col-span-2 flex items-center gap-3"><input type="checkbox" className="!mt-0 !w-auto" checked={form.featured} onChange={e => change("featured", e.target.checked)} />Also feature this tour on the home page</label>
          <label className="md:col-span-2 flex items-center gap-3"><input type="checkbox" className="!mt-0 !w-auto" checked={form.active} onChange={e => change("active", e.target.checked)} />Visible to customers and available for booking</label>
        </div>
        <aside className="h-fit rounded-xl border bg-slate-50 p-4">
          <p className="text-sm font-bold">Package preview</p>
          <img src={form.image && !imageFailed ? tourImageUrl(form.image) : heroImages.packages} onError={() => setImageFailed(true)} alt={form.title || "Tour package preview"} className="mt-4 h-44 w-full rounded-xl object-cover" />
          {imageFailed && <p className="mt-2 text-sm text-red-600">This image could not be loaded. Check the image URL.</p>}
          <span className="badge mt-4">{packageOptions.find(([value]) => value === form.days)?.[1]}</span>
          <h3 className="mt-3 break-words text-xl font-black">{form.title || "Your tour name"}</h3>
          <p className="mt-2 break-words text-sm text-slate-600">{form.location || "Tour route or location"}</p>
          <p className="mt-3 text-xl font-black text-emerald-700">{formatLkr(form.price || 0)}</p>
          <p className="mt-2 text-sm text-slate-500">Per adult · Up to {form.maxGuests || 0} guests</p>
        </aside>
      </fieldset>
      {error && <p role="alert" className="mt-5 rounded-xl bg-red-50 p-4 font-semibold text-red-600">{error}</p>}
      {published && <div role="status" className="mt-5 rounded-xl border border-emerald-200 bg-teal-50 p-4">
        <p className="font-bold">{published.title} was saved successfully{published.active ? "." : " as a hidden tour."}</p>
        {published.active && <Link to={`/packages?duration=${published.days}#tour-${published.id}`} className="mt-2 inline-block font-bold text-emerald-700 underline">View the published tour package</Link>}
      </div>}
      <button disabled={saving} className="btn-primary mt-6 disabled:cursor-wait disabled:opacity-60">{saving ? "Saving tour..." : tour ? "Save Tour Changes" : "Add Tour Package"}</button>
      {tour && <button type="button" disabled={saving} onClick={onCancel} className="btn-outline ml-3 mt-6">Cancel editing</button>}
    </form>
  </section>;
}
