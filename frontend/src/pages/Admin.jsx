import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";

export default function Admin() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [packageBookings, setPackageBookings] = useState([]);

  useEffect(() => {
    if (user?.role === "admin") {
      api.get("/bookings").then(res => setBookings(res.data));
      api.get("/package-bookings").then(res => setPackageBookings(res.data));
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

  return <section className="container-page py-14">
    <p className="eyebrow">MANAGEMENT</p><h1 className="section-title">Admin dashboard</h1>
    <div className="grid md:grid-cols-3 gap-5 mt-8">
      <div className="card p-6"><p className="text-slate-500">Total bookings</p><p className="text-4xl font-black mt-2">{allBookings.length}</p></div>
      <div className="card p-6"><p className="text-slate-500">Pending</p><p className="text-4xl font-black mt-2">{allBookings.filter(b=>b.status==="pending").length}</p></div>
      <div className="card p-6"><p className="text-slate-500">Confirmed</p><p className="text-4xl font-black mt-2">{allBookings.filter(b=>b.status==="confirmed").length}</p></div>
    </div>
    <div className="card overflow-x-auto mt-8">
      <table className="w-full text-sm">
        <thead><tr className="border-b text-left"><th className="p-4">Customer</th><th>Booking</th><th>Date</th><th>Guests</th><th>Status</th></tr></thead>
        <tbody>{allBookings.map(b => <tr className="border-b" key={`${b.kind}-${b._id}`}>
          <td className="p-4"><b>{b.user.name}</b><br /><span className="text-slate-500">{b.user.email}</span></td>
          <td>{b.kind === "package" ? b.packageTitle : b.tour.title}<br /><span className="text-xs text-slate-500">{b.kind === "package" ? "Package booking" : "Tour booking"}</span></td>
          <td>{new Date(b.bookingDate).toLocaleDateString()}</td><td>{b.guests}</td>
          <td><select value={b.status} onChange={e=>updateStatus(b._id,e.target.value,b.kind)} className="!w-auto"><option>pending</option><option>confirmed</option><option>cancelled</option><option>completed</option></select></td>
        </tr>)}</tbody>
      </table>
    </div>
  </section>;
}
