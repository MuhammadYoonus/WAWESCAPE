import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";

export default function TourDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tour, setTour] = useState(null);
  const [form, setForm] = useState({ bookingDate: "", guests: 1, contactPhone: "", specialRequests: "" });
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.get(`/tours/${id}`).then(res => setTour(res.data)).catch(console.error);
  }, [id]);

  if (!tour) return <div className="container-page py-20">Loading tour...</div>;

  async function book(e) {
    e.preventDefault();
    if (!user) return navigate("/login");
    try {
      await api.post("/bookings", { ...form, tourId: tour._id });
      setMessage("Booking request submitted successfully!");
      setForm({ bookingDate: "", guests: 1, contactPhone: "", specialRequests: "" });
    } catch (error) {
      setMessage(error.response?.data?.message || "Booking failed");
    }
  }

  return (
    <section className="container-page py-10">
      <img src={tour.image} alt={tour.title} className="w-full h-[420px] object-cover rounded-3xl" />
      <div className="grid lg:grid-cols-[1fr_380px] gap-10 mt-10">
        <div>
          <span className="badge">{tour.location}</span>
          <h1 className="text-4xl md:text-5xl font-black mt-4">{tour.title}</h1>
          <p className="mt-3 text-slate-500">{tour.duration} · Maximum {tour.maxGuests} guests</p>
          <p className="mt-7 text-lg leading-8 text-slate-700">{tour.description}</p>

          <h2 className="text-2xl font-black mt-10">Itinerary</h2>
          <div className="mt-5 space-y-4">
            {tour.itinerary?.map((item, i) => (
              <div className="border rounded-2xl p-5" key={i}>
                <div className="font-bold text-emerald-700">{item.day} — {item.title}</div>
                <ul className="mt-2 list-disc pl-5 text-slate-600">{item.activities.map(a => <li key={a}>{a}</li>)}</ul>
              </div>
            ))}
          </div>
        </div>

        <aside className="card p-6 h-fit sticky top-24">
          <p className="text-sm text-slate-500">From</p>
          <p className="text-3xl font-black">LKR {tour.price.toLocaleString()}</p>
          <p className="text-sm text-slate-500">per guest</p>
          <form onSubmit={book} className="mt-6 space-y-4">
            <label>Travel date<input required type="date" value={form.bookingDate} onChange={e => setForm({...form, bookingDate: e.target.value})} /></label>
            <label>Guests<input required type="number" min="1" max={tour.maxGuests} value={form.guests} onChange={e => setForm({...form, guests: Number(e.target.value)})} /></label>
            <label>Phone<input required value={form.contactPhone} onChange={e => setForm({...form, contactPhone: e.target.value})} placeholder="+94..." /></label>
            <label>Special requests<textarea value={form.specialRequests} onChange={e => setForm({...form, specialRequests: e.target.value})} rows="3" /></label>
            {message && <p className="text-sm font-semibold text-emerald-700">{message}</p>}
            <button className="btn-primary w-full justify-center">Request Booking</button>
          </form>
          {!user && <p className="mt-3 text-xs text-slate-500 text-center">You will be asked to log in before booking.</p>}
        </aside>
      </div>
    </section>
  );
}
