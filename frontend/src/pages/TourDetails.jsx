import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";

export default function TourDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tour, setTour] = useState(null);
  const [form, setForm] = useState({
    bookingDate: "",
    adults: 1,
    children: 0,
    infants: 0,
    pickupLocation: "",
    contactPhone: "",
    specialRequests: ""
  });
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
      setForm({ bookingDate: "", adults: 1, children: 0, infants: 0, pickupLocation: "", contactPhone: "", specialRequests: "" });
    } catch (error) {
      setMessage(error.response?.data?.message || "Booking failed");
    }
  }

  const totalGuests = Number(form.adults || 0) + Number(form.children || 0) + Number(form.infants || 0);
  const estimatedTotal = tour.price * (Number(form.adults || 0) + Number(form.children || 0) * 0.75);

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
            <label>Exact pickup location<input required value={form.pickupLocation} onChange={e => setForm({...form, pickupLocation: e.target.value})} placeholder="Hotel name, address, or landmark" /></label>
            <div className="grid grid-cols-3 gap-3">
              <label>Adults<input required type="number" min="1" max={tour.maxGuests} value={form.adults} onChange={e => setForm({...form, adults: Number(e.target.value)})} /></label>
              <label>Children 4-12<input required type="number" min="0" max={tour.maxGuests} value={form.children} onChange={e => setForm({...form, children: Number(e.target.value)})} /></label>
              <label>Below 3<input required type="number" min="0" max={tour.maxGuests} value={form.infants} onChange={e => setForm({...form, infants: Number(e.target.value)})} /></label>
            </div>
            <label>Phone<input required value={form.contactPhone} onChange={e => setForm({...form, contactPhone: e.target.value})} placeholder="+94..." /></label>
            <label>Special requests<textarea value={form.specialRequests} onChange={e => setForm({...form, specialRequests: e.target.value})} rows="3" /></label>
            <p className="rounded-xl bg-slate-50 p-3 text-sm font-semibold text-slate-700">
              Guests: {totalGuests} · Estimated total: <b>LKR {estimatedTotal.toLocaleString()}</b>
            </p>
            {message && <p className="text-sm font-semibold text-emerald-700">{message}</p>}
            <button className="btn-primary w-full justify-center">Request Booking</button>
          </form>
          {!user && <p className="mt-3 text-xs text-slate-500 text-center">You will be asked to log in before booking.</p>}
        </aside>
      </div>
    </section>
  );
}
