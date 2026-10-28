import { useEffect, useState } from "react";
import api from "../api";
import { Link, Navigate } from "react-router-dom";
import PageHero from "../components/PageHero";
import { useAuth } from "../context/AuthContext";
import { heroImages } from "../assets/images/imageCatalog";

export default function Bookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [packageBookings, setPackageBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    if (user) {
      setLoading(true); setError("");
      Promise.allSettled([api.get("/bookings/mine"), api.get("/package-bookings/mine")]).then(results => {
        if (cancelled) return;
        if (results[0].status === "fulfilled") setBookings(results[0].value.data);
        if (results[1].status === "fulfilled") setPackageBookings(results[1].value.data);
        if (results.some(result => result.status === "rejected")) setError("Some bookings could not be loaded. Please try again.");
        setLoading(false);
      });
    }
    return () => { cancelled = true; };
  }, [user, retryKey]);

  if (!user) return <Navigate to="/login" />;
  const hasBookings = bookings.length || packageBookings.length;
  const guestSummary = booking => `${booking.adults || 0} adults · ${booking.children || 0} children 4-12 · ${booking.infants || 0} below 3`;

  return <>
    <PageHero
      eyebrow="YOUR TRAVEL PLANS"
      title="My bookings"
      text="Review your confirmed and pending WAWESCAPE travel requests in one place."
      image={heroImages.bookings}
    />
    <section className="container-page py-14">
      <div className="space-y-5">
        {loading && <p role="status">Loading your bookings...</p>}
        {error && <div role="alert" className="card p-5"><p className="text-red-600">{error}</p><button className="btn-outline mt-3" onClick={() => setRetryKey(key => key + 1)}>Retry bookings</button></div>}
        {!loading && !error && !hasBookings && <div className="card p-8 text-center">No bookings yet. <Link to="/packages" className="text-emerald-700 font-bold">Explore tour packages</Link></div>}
        {bookings.map(b => <div className="card p-5 flex flex-col md:flex-row gap-5" key={b._id}>
          <img src={b.tour?.image || heroImages.bookings} alt={b.tour?.title || "Booked tour"} className="w-full md:w-40 h-28 object-cover rounded-xl" />
          <div className="flex-1"><h2 className="font-bold text-xl">{b.tour?.title || "Unavailable tour"}</h2><p className="text-slate-500">{b.tour?.location} · {new Date(b.bookingDate).toLocaleDateString()}</p><p className="mt-2">Guests: {b.guests} ({guestSummary(b)}) · Total: <b>LKR {b.totalPrice.toLocaleString()}</b></p><p className="mt-1 text-sm text-slate-500">Pickup: {b.pickupLocation || "Not provided"}</p></div>
          <span className="badge h-fit">{b.status}</span>
        </div>)}
        {packageBookings.map(b => <div className="card p-5 flex flex-col md:flex-row gap-5" key={`package-${b._id}`}>
          <div className="flex h-28 w-full items-center justify-center rounded-xl bg-slate-50 md:w-40">
            <span className="text-3xl font-black text-emerald-700">W</span>
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-xl">{b.packageTitle}</h2>
            <p className="text-slate-500">{b.packageRoute} · {new Date(b.bookingDate).toLocaleDateString()}</p>
            <p className="mt-2">Guests: {b.guests} ({guestSummary(b)}) · Total: <b>{b.totalPrice ? `LKR ${b.totalPrice.toLocaleString()}` : b.packagePrice}</b></p>
            <p className="mt-1 text-sm text-slate-500">Pickup: {b.pickupLocation || "Not provided"}</p>
            <p className="mt-1 text-sm text-slate-500">Contact: {b.contactPhone}</p>
          </div>
          <span className="badge h-fit">{b.status}</span>
        </div>)}
      </div>
    </section>
  </>;
}
