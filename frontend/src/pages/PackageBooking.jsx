import { useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import PageHero from "../components/PageHero";
import api from "../api";
import { heroImages } from "../assets/images/imageCatalog";
import { packages } from "../data/travelContent";
import { useAuth } from "../context/AuthContext";

export default function PackageBooking() {
  const { packageId } = useParams();
  const { user } = useAuth();
  const tourPackage = useMemo(
    () => packages.find(item => item.id === packageId),
    [packageId]
  );
  const [form, setForm] = useState({
    bookingDate: "",
    guests: 1,
    contactName: user?.name || "",
    contactEmail: user?.email || "",
    contactPhone: "",
    specialRequests: ""
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  if (!user) return <Navigate to="/login" />;

  if (!tourPackage) {
    return (
      <section className="container-page py-20">
        <div className="card p-10 text-center">
          <h1 className="text-3xl font-black">Tour package not found</h1>
          <Link to="/packages" className="btn-primary mt-6">Back to Packages</Link>
        </div>
      </section>
    );
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      await api.post("/package-bookings", {
        packageId: tourPackage.id,
        packageTitle: tourPackage.title,
        packageRoute: tourPackage.route,
        packagePrice: tourPackage.price,
        ...form
      });
      setMessage("Booking request submitted successfully. WAWESCAPE will contact you soon.");
      setForm(current => ({ ...current, bookingDate: "", guests: 1, contactPhone: "", specialRequests: "" }));
    } catch (err) {
      setError(err.response?.data?.message || "Booking request failed");
    }
  }

  return (
    <>
      <PageHero
        eyebrow="BOOKING REQUEST"
        title={`Book ${tourPackage.title}`}
        text="Choose your travel date and share your contact details so our team can confirm the plan."
        image={tourPackage.image || heroImages.packages}
      />
      <section className="container-page py-14 grid lg:grid-cols-[1fr_420px] gap-10">
        <form onSubmit={submit} className="card p-8">
          <h2 className="text-3xl font-black">Contact information</h2>
          <div className="mt-7 grid md:grid-cols-2 gap-5">
            <label>Full name<input required value={form.contactName} onChange={e => setForm({...form, contactName: e.target.value})} /></label>
            <label>Email<input required type="email" value={form.contactEmail} onChange={e => setForm({...form, contactEmail: e.target.value})} /></label>
            <label>Phone number<input required value={form.contactPhone} onChange={e => setForm({...form, contactPhone: e.target.value})} placeholder="+94..." /></label>
            <label>Travel date<input required type="date" value={form.bookingDate} onChange={e => setForm({...form, bookingDate: e.target.value})} /></label>
            <label>Guests<input required type="number" min="1" value={form.guests} onChange={e => setForm({...form, guests: Number(e.target.value)})} /></label>
            <label className="md:col-span-2">Special requests<textarea rows="5" value={form.specialRequests} onChange={e => setForm({...form, specialRequests: e.target.value})} placeholder="Pickup location, preferred time, children, dietary needs..." /></label>
          </div>
          {message && <p className="mt-5 rounded-xl bg-teal-50 p-4 text-sm font-bold text-emerald-700">{message}</p>}
          {error && <p className="mt-5 rounded-xl bg-red-50 p-4 text-sm font-bold text-red-600">{error}</p>}
          <button className="btn-primary mt-7 w-full justify-center">Submit Booking Request</button>
        </form>

        <aside className="card overflow-hidden h-fit">
          <img src={tourPackage.image} alt={tourPackage.title} className="h-64 w-full object-cover" />
          <div className="p-6">
            <span className="badge">{tourPackage.days === "short" ? "Short tour" : `${tourPackage.days} day tour`}</span>
            <h2 className="mt-4 text-2xl font-black">{tourPackage.title}</h2>
            <p className="mt-2 text-sm font-bold text-slate-500">{tourPackage.route}</p>
            <p className="mt-4 text-2xl font-black text-emerald-700">{tourPackage.price}</p>
            <div className="mt-6 space-y-3">
              {tourPackage.plan.map((step, index) => (
                <div key={step} className="flex gap-3 rounded-xl bg-slate-50 p-4">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-sm font-black text-white">
                    {index + 1}
                  </span>
                  <p className="text-sm font-semibold text-slate-700">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </>
  );
}
