import { useCallback, useEffect, useRef, useState } from "react";
import api from "../api";
import AdminTourForm from "./AdminTourForm";
import { formatLkr } from "../data/tourPackages";
import { packageOptions } from "../data/tourPackages";

export default function AdminTourManager() {
  const [tours, setTours] = useState([]);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [query, setQuery] = useState("");
  const [duration, setDuration] = useState("all");
  const [visibility, setVisibility] = useState("all");
  const [sort, setSort] = useState("newest");
  const formRef = useRef(null);
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { setTours((await api.get("/tours", { params: { admin: true, q: query, duration, visibility, sort } })).data); }
    catch { setError("Unable to load tour packages. Please try again."); }
    finally { setLoading(false); }
  }, [query, duration, visibility, sort]);
  useEffect(() => { const timer = setTimeout(load, 200); return () => clearTimeout(timer); }, [load]);

  function edit(tour) {
    setEditing(tour); setMessage(""); setError("");
    formRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
  }
  async function remove() {
    setBusy(true); setError("");
    try {
      await api.delete(`/tours/${deleting._id}`);
      setMessage(`${deleting.title} was deleted.`);
      if (editing?._id === deleting._id) setEditing(null);
      setDeleting(null);
      await load();
    } catch (err) { setError(err.response?.data?.message || "Unable to delete tour. Please try again."); }
    finally { setBusy(false); }
  }

  return <>
    <section className="card mt-10 p-5 md:p-8" aria-labelledby="manage-tours-title">
      <h2 id="manage-tours-title" className="text-3xl font-black">Manage tour packages</h2>
      <p className="mt-3 text-slate-600">Edit package details or hide a booked tour to preserve its booking history.</p>
      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <label>Search managed tours<input type="search" maxLength={180} placeholder="Tour name or location" value={query} onChange={event => setQuery(event.target.value)} /></label>
        <label>Filter duration<select aria-label="Filter duration" value={duration} onChange={event => setDuration(event.target.value)}><option value="all">All durations</option>{packageOptions.map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label>Filter visibility<select aria-label="Filter visibility" value={visibility} onChange={event => setVisibility(event.target.value)}><option value="all">All tours</option><option value="published">Published</option><option value="hidden">Hidden</option></select></label>
        <label>Sort managed tours<select aria-label="Sort managed tours" value={sort} onChange={event => setSort(event.target.value)}><option value="newest">Newest first</option><option value="title-asc">Name: A to Z</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option></select></label>
      </div>
      {message && <p role="status" className="mt-4 rounded-xl bg-teal-50 p-4 font-semibold">{message}</p>}
      {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-red-600">{error}</p>}
      {loading ? <p className="mt-5" role="status">Loading tour packages...</p> : <>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead><tr className="border-b"><th className="p-3">Tour</th><th className="p-3">Duration</th><th className="p-3">Price per adult</th><th className="p-3">Visibility</th><th className="p-3">Actions</th></tr></thead>
            <tbody>{tours.map(tour => <tr className="border-b" key={tour._id}>
              <td className="p-3 font-bold">{tour.title}</td><td className="p-3 whitespace-nowrap">{tour.duration}</td>
              <td className="p-3 whitespace-nowrap">{formatLkr(tour.price)}</td><td className="p-3">{tour.active ? "Published" : "Hidden"}</td>
              <td className="p-3"><div className="flex gap-2"><button type="button" className="btn-outline" aria-label={`Edit ${tour.title}`} onClick={() => edit(tour)}>Edit</button><button type="button" className="btn-outline !text-red-600" aria-label={`Delete ${tour.title}`} onClick={() => { setDeleting(tour); setError(""); }}>Delete</button></div></td>
            </tr>)}</tbody>
          </table>
          {!tours.length && <p className="p-5 text-center">No tours yet. Add your first package below.</p>}
        </div>
        <button type="button" className="btn-outline mt-4" onClick={load}>Refresh tours</button>
      </>}
    </section>
    <div ref={formRef} className="scroll-mt-36"><AdminTourForm tour={editing} onCancel={() => setEditing(null)} onSaved={(tour, updated) => { setMessage(`${tour.title} was ${updated ? "updated" : "added"}.`); setEditing(null); load(); }} /></div>
    {deleting && <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-5" onKeyDown={event => { if (event.key === "Escape" && !busy) setDeleting(null); }}>
      <div role="dialog" aria-modal="true" aria-labelledby="delete-tour-title" className="card w-full max-w-lg p-6">
        <h2 id="delete-tour-title" className="text-2xl font-black">Delete {deleting.title}?</h2>
        <p className="mt-4 text-slate-600">This permanently removes the tour package. Tours with bookings cannot be deleted; you can hide them instead.</p>
        {error && <p role="alert" className="mt-4 text-red-600">{error}</p>}
        <div className="mt-6 flex flex-wrap gap-3"><button autoFocus type="button" disabled={busy} className="btn-outline" onClick={() => setDeleting(null)}>Keep tour</button><button type="button" disabled={busy} className="btn-primary !bg-red-700" onClick={remove}>{busy ? "Deleting..." : "Delete permanently"}</button></div>
      </div>
    </div>}
  </>;
}
