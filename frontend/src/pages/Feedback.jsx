import { useEffect, useState } from "react";
import api from "../api";
import PageHero from "../components/PageHero";
import { heroImages } from "../assets/images/imageCatalog";
import { feedbacks } from "../data/travelContent";

export default function Feedback() {
  const [liveFeedbacks, setLiveFeedbacks] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", trip: "", rating: 5, text: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/feedback").then(res => setLiveFeedbacks(res.data)).catch(console.error);
  }, []);

  const visibleFeedbacks = liveFeedbacks.length ? liveFeedbacks : feedbacks;

  async function submit(e) {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const { data } = await api.post("/feedback", form);
      setLiveFeedbacks(items => [data, ...items]);
      setForm({ name: "", email: "", trip: "", rating: 5, text: "" });
      setMessage("Thank you. Your feedback was submitted successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Feedback submission failed");
    }
  }

  return (
    <>
    <PageHero
      eyebrow="CUSTOMER FEEDBACK"
      title="What travelers say about WAWECAPE"
      text="Customer feedback helps new travelers understand the care, timing and local knowledge behind each tour."
      image={heroImages.feedback}
    />
    <section className="container-page py-14">
      <div className="grid lg:grid-cols-[1fr_420px] gap-10">
        <div>
          <p className="eyebrow">TRAVELER STORIES</p>
          <h2 className="section-title">Recent customer feedback</h2>
          <div className="mt-10 grid md:grid-cols-2 gap-6">
            {visibleFeedbacks.map(feedback => (
              <article key={feedback._id || feedback.name} className="card p-6">
                <div className="text-amber-500 text-xl">{"★".repeat(feedback.rating)}</div>
                <p className="mt-5 text-slate-700 leading-7">"{feedback.text}"</p>
                <div className="mt-6 border-t pt-5">
                  <h2 className="font-black">{feedback.name}</h2>
                  <p className="text-sm text-slate-500">{feedback.trip}</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <form onSubmit={submit} className="card p-8 h-fit">
          <h2 className="text-3xl font-black">Share feedback</h2>
          <div className="mt-7 grid gap-5">
            <label>Name<input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Your name" /></label>
            <label>Email<input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="you@example.com" /></label>
            <label>Tour / package<input required value={form.trip} onChange={e => setForm({...form, trip: e.target.value})} placeholder="Mirissa Whale Watching" /></label>
            <label>Rating<select required value={form.rating} onChange={e => setForm({...form, rating: Number(e.target.value)})}>
              <option value={5}>5 - Excellent</option>
              <option value={4}>4 - Very good</option>
              <option value={3}>3 - Good</option>
              <option value={2}>2 - Fair</option>
              <option value={1}>1 - Poor</option>
            </select></label>
            <label>Feedback<textarea required rows="5" value={form.text} onChange={e => setForm({...form, text: e.target.value})} placeholder="Tell us about your travel experience." /></label>
          </div>
          {message && <p className="mt-5 rounded-xl bg-teal-50 p-4 text-sm font-bold text-emerald-700">{message}</p>}
          {error && <p className="mt-5 rounded-xl bg-red-50 p-4 text-sm font-bold text-red-600">{error}</p>}
          <button className="btn-primary mt-6 w-full justify-center">Submit Feedback</button>
        </form>
      </div>

      <div className="mt-12 grid md:grid-cols-3 gap-5 rounded-2xl bg-slate-950 p-6 text-white">
        {[
          ["4.9/5", "Average tour rating"],
          ["1,200+", "Happy travelers"],
          ["24/7", "Local trip support"]
        ].map(([value, label]) => (
          <div key={label} className="rounded-xl border border-white/10 p-5">
            <div className="text-3xl font-black text-emerald-300">{value}</div>
            <p className="mt-1 text-sm text-slate-300">{label}</p>
          </div>
        ))}
      </div>
    </section>
    </>
  );
}
