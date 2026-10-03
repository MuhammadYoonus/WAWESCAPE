import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";

export default function Admin() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [packageBookings, setPackageBookings] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [feedbackItems, setFeedbackItems] = useState([]);

  useEffect(() => {
    if (user?.role === "admin") {
      api.get("/bookings").then(res => setBookings(res.data));
      api.get("/package-bookings").then(res => setPackageBookings(res.data));
      api.get("/inquiries").then(res => setInquiries(res.data));
      api.get("/feedback?admin=true").then(res => setFeedbackItems(res.data));
    }
  }, [user]);

  if (user?.role !== "admin") return <Navigate to="/" />;
  const allBookings = [
    ...bookings.map(booking => ({ ...booking, kind: "tour" })),
    ...packageBookings.map(booking => ({ ...booking, kind: "package" }))
  ];

  async function updateStatus(id, status, kind) {
    const url = kind === "package" ? `/package-bookings/${id}/status` : `/bookings/${id}/status`;
    await api.put(url, { status });
    if (kind === "package") {
      setPackageBookings(bs => bs.map(b => b._id === id ? {...b, status} : b));
    } else {
      setBookings(bs => bs.map(b => b._id === id ? {...b, status} : b));
    }
  }

  async function updateInquiryStatus(id, status) {
    await api.put(`/inquiries/${id}/status`, { status });
    setInquiries(items => items.map(item => item._id === id ? {...item, status} : item));
  }

  async function updateFeedbackStatus(id, status) {
    await api.put(`/feedback/${id}/status`, { status });
    setFeedbackItems(items => items.map(item => item._id === id ? {...item, status} : item));
  }

  function customerName(booking) {
    return booking.contactName || booking.user?.name || "Customer";
  }

  function customerEmail(booking) {
    return booking.contactEmail || booking.user?.email || "No email";
  }

  function bookingTitle(booking) {
    return booking.kind === "package" ? booking.packageTitle : booking.tour?.title || "Tour booking";
  }

  function guestSummary(booking) {
    return `${booking.adults || 0} adults · ${booking.children || 0} children 4-12 · ${booking.infants || 0} below 3`;
  }

  return <section className="container-page py-14">
    <p className="eyebrow">MANAGEMENT</p><h1 className="section-title">Admin dashboard</h1>
    <div className="grid md:grid-cols-4 gap-5 mt-8">
      <div className="card p-6"><p className="text-slate-500">Total bookings</p><p className="text-4xl font-black mt-2">{allBookings.length}</p></div>
      <div className="card p-6"><p className="text-slate-500">Pending</p><p className="text-4xl font-black mt-2">{allBookings.filter(b=>b.status==="pending").length}</p></div>
      <div className="card p-6"><p className="text-slate-500">New inquiries</p><p className="text-4xl font-black mt-2">{inquiries.filter(i=>i.status==="new").length}</p></div>
      <div className="card p-6"><p className="text-slate-500">Feedback</p><p className="text-4xl font-black mt-2">{feedbackItems.length}</p></div>
    </div>
    <h2 className="mt-10 text-2xl font-black">Booking details</h2>
    <div className="card overflow-x-auto mt-8">
      <table className="w-full text-sm">
        <thead><tr className="border-b text-left"><th className="p-4">Customer</th><th>Booking</th><th>Date</th><th>Guests</th><th>Pickup</th><th>Contact</th><th>Status</th></tr></thead>
        <tbody>{allBookings.map(b => <tr className="border-b" key={`${b.kind}-${b._id}`}>
          <td className="p-4"><b>{customerName(b)}</b><br /><span className="text-slate-500">{customerEmail(b)}</span></td>
          <td>{bookingTitle(b)}<br /><span className="text-xs text-slate-500">{b.kind === "package" ? "Package booking" : "Tour booking"}</span></td>
          <td>{new Date(b.bookingDate).toLocaleDateString()}</td>
          <td>{b.guests}<br /><span className="text-xs text-slate-500">{guestSummary(b)}</span></td>
          <td>{b.pickupLocation || "No pickup location"}</td>
          <td>{b.contactPhone || "No phone"}<br /><span className="text-xs text-slate-500">{b.totalPrice ? `LKR ${b.totalPrice.toLocaleString()}` : b.packagePrice}</span></td>
          <td><select value={b.status} onChange={e=>updateStatus(b._id,e.target.value,b.kind)} className="!w-auto"><option>pending</option><option>confirmed</option><option>cancelled</option><option>completed</option></select></td>
        </tr>)}</tbody>
      </table>
    </div>
    <h2 className="mt-10 text-2xl font-black">Inquiry details</h2>
    <div className="card overflow-x-auto mt-8">
      <table className="w-full text-sm">
        <thead><tr className="border-b text-left"><th className="p-4">Customer</th><th>Interest</th><th>Message</th><th>Received</th><th>Status</th></tr></thead>
        <tbody>{inquiries.map(inquiry => <tr className="border-b align-top" key={inquiry._id}>
          <td className="p-4"><b>{inquiry.name}</b><br /><span className="text-slate-500">{inquiry.email}</span></td>
          <td>{inquiry.tourInterest}</td>
          <td className="max-w-md pr-4">{inquiry.message}</td>
          <td>{new Date(inquiry.createdAt).toLocaleDateString()}</td>
          <td><select value={inquiry.status} onChange={e=>updateInquiryStatus(inquiry._id,e.target.value)} className="!w-auto"><option>new</option><option>contacted</option><option>closed</option></select></td>
        </tr>)}</tbody>
      </table>
    </div>
    <h2 className="mt-10 text-2xl font-black">Feedback details</h2>
    <div className="card overflow-x-auto mt-8">
      <table className="w-full text-sm">
        <thead><tr className="border-b text-left"><th className="p-4">Customer</th><th>Trip</th><th>Rating</th><th>Feedback</th><th>Received</th><th>Status</th></tr></thead>
        <tbody>{feedbackItems.map(item => <tr className="border-b align-top" key={item._id}>
          <td className="p-4"><b>{item.name}</b><br /><span className="text-slate-500">{item.email || "No email"}</span></td>
          <td>{item.trip}</td>
          <td><span className="text-amber-500">{"★".repeat(item.rating)}</span></td>
          <td className="max-w-md pr-4">{item.text}</td>
          <td>{new Date(item.createdAt).toLocaleDateString()}</td>
          <td><select value={item.status} onChange={e=>updateFeedbackStatus(item._id,e.target.value)} className="!w-auto"><option>new</option><option>reviewed</option><option>hidden</option></select></td>
        </tr>)}</tbody>
      </table>
    </div>
  </section>;
}
