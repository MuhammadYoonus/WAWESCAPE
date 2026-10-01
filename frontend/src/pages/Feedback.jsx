import PageHero from "../components/PageHero";
import { heroImages } from "../assets/images/imageCatalog";
import { feedbacks } from "../data/travelContent";

export default function Feedback() {
  return (
    <>
    <PageHero
      eyebrow="CUSTOMER FEEDBACK"
      title="What travelers say about WAWECAPE"
      text="Customer feedback helps new travelers understand the care, timing and local knowledge behind each tour."
      image={heroImages.feedback}
    />
    <section className="container-page py-14">

      <div className="mt-10 grid md:grid-cols-3 gap-6">
        {feedbacks.map(feedback => (
          <article key={feedback.name} className="card p-6">
            <div className="text-amber-500 text-xl">{"★".repeat(feedback.rating)}</div>
            <p className="mt-5 text-slate-700 leading-7">"{feedback.text}"</p>
            <div className="mt-6 border-t pt-5">
              <h2 className="font-black">{feedback.name}</h2>
              <p className="text-sm text-slate-500">{feedback.trip}</p>
            </div>
          </article>
        ))}
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
