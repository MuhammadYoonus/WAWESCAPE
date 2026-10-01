import { useEffect, useState } from "react";
import api from "../api";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Bookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [packageBookings, setPackageBookings] = useState([]);

  useEffect(() => {
    if (user) {
      api.get("/bookings/mine").then(res => setBookings(res.data));
      api.get("/package-bookings/mine").then(res => setPackageBookings(res.data));
    }
  }, [user]);

  if (!user) return <Navigate to="/login" />;
  const hasBookings = bookings.length || packageBookings.length;

  return <section className="container-page py-14">
    <p className="eyebrow">YOUR TRAVEL PLANS</p><h1 className="section-title">My bookings</h1>
    <div className="mt-8 space-y-5">
      {!hasBookings && <div className="card p-8 text-center">No bookings yet. <Link to="/packages" className="text-emerald-700 font-bold">Explore tour packages</Link></div>}
      {bookings.map(b => <div className="card p-5 flex flex-col md:flex-row gap-5" key={b._id}>
        <img src={b.tour.image} className="w-full md:w-40 h-28 object-cover rounded-xl" />
        <div className="flex-1"><h2 className="font-bold text-xl">{b.tour.title}</h2><p className="text-slate-500">{b.tour.location} · {new Date(b.bookingDate).toLocaleDateString()}</p><p className="mt-2">Guests: {b.guests} · Total: <b>LKR {b.totalPrice.toLocaleString()}</b></p></div>
        <span className="badge h-fit">{b.status}</span>
      </div>)}
      {packageBookings.map(b => <div className="card p-5 flex flex-col md:flex-row gap-5" key={`package-${b._id}`}>
        <div className="flex h-28 w-full items-center justify-center rounded-xl bg-slate-50 md:w-40">
          <span className="text-3xl font-black text-emerald-700">W</span>
        </div>
        <div className="flex-1">
          <h2 className="font-bold text-xl">{b.packageTitle}</h2>
          <p className="text-slate-500">{b.packageRoute} · {new Date(b.bookingDate).toLocaleDateString()}</p>
          <p className="mt-2">Guests: {b.guests} · Package: <b>{b.packagePrice}</b></p>
          <p className="mt-1 text-sm text-slate-500">Contact: {b.contactPhone}</p>
        </div>
        <span className="badge h-fit">{b.status}</span>
      </div>)}
    </div>
  </section>;
}
