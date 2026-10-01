import { useState } from "react";
import PageHero from "../components/PageHero";
import api from "../api";
import { heroImages } from "../assets/images/imageCatalog";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", tourInterest: "", message: "" });
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setStatus("");
    setError("");

    try {
      await api.post("/inquiries", form);
      setStatus("Inquiry submitted successfully. Our team will contact you soon.");
      setForm({ name: "", email: "", tourInterest: "", message: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Inquiry submission failed");
    }
  }

  return (
    <>
      <PageHero
        eyebrow="CONTACT"
        title="Plan your next Sri Lanka tour with WAWECAPE"
        text="Send a travel request, ask about a package, or customize a route for your group."
        image={heroImages.contact}
      />
      <section className="container-page py-14 grid lg:grid-cols-[1fr_420px] gap-10">
        <div className="card p-8">
          <h2 className="text-3xl font-black">Send an inquiry</h2>
          <form onSubmit={submit} className="mt-7 grid gap-5">
            <label>Name<input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Your name" /></label>
            <label>Email<input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="you@example.com" /></label>
            <label>Tour interest<select required value={form.tourInterest} onChange={e => setForm({...form, tourInterest: e.target.value})}>
              <option value="" disabled>Select package type</option>
              <option>1 day tour</option>
              <option>2 day tour</option>
              <option>3 day tour</option>
              <option>Short tour</option>
              <option>Custom Sri Lanka tour</option>
            </select></label>
            <label>Message<textarea required rows="5" value={form.message} onChange={e => setForm({...form, message: e.target.value})} placeholder="Tell us your dates, destination ideas and group size." /></label>
            {status && <p className="rounded-xl bg-teal-50 p-4 text-sm font-bold text-emerald-700">{status}</p>}
            {error && <p className="rounded-xl bg-red-50 p-4 text-sm font-bold text-red-600">{error}</p>}
            <button className="btn-primary justify-center">Submit Inquiry</button>
          </form>
        </div>
        <aside className="card p-8 h-fit">
          <p className="eyebrow">WAWECAPE OFFICE</p>
          <h2 className="mt-3 text-3xl font-black">Local support for every journey</h2>
          <div className="mt-7 space-y-5 text-slate-700">
            <p><strong>Email:</strong><br />hello@wavecape.lk</p>
            <p><strong>Phone:</strong><br />+94 77 123 4567</p>
            <p><strong>Location:</strong><br />Sri Lanka</p>
          </div>
        </aside>
      </section>
    </>
  );
}
