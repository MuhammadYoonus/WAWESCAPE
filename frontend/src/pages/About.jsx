import { Link } from "react-router-dom";
import PageHero from "../components/PageHero";
import { heroImages } from "../assets/images/imageCatalog";

export default function About() {
  return (
    <>
    <PageHero
      eyebrow="ABOUT US"
      title="A local travel team for real Sri Lankan journeys"
      text="WAWECAPE helps travelers discover Sri Lanka through reliable tours, clear packages and local support."
      image={heroImages.about}
    />
    <section className="container-page py-14">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <p className="eyebrow">OUR STORY</p>
          <h2 className="section-title">Built for practical, friendly travel planning</h2>
          <p className="mt-5 text-lg leading-8 text-slate-700">
            WAWECAPE is a local travel agency concept built around practical planning,
            friendly guidance and island experiences that feel personal. The goal is to
            help travelers discover Sri Lanka through reliable tours, clear packages and
            local support before and during the trip.
          </p>
          <div className="mt-8 grid sm:grid-cols-3 gap-4">
            {[
              ["Local", "Sri Lankan planning knowledge"],
              ["Flexible", "Customizable trip routes"],
              ["Trusted", "Support from inquiry to return"]
            ].map(([title, text]) => (
              <div key={title} className="rounded-xl bg-slate-50 p-5 border">
                <h2 className="font-black text-emerald-700">{title}</h2>
                <p className="mt-2 text-sm text-slate-600">{text}</p>
              </div>
            ))}
          </div>
          <Link to="/packages" className="btn-primary mt-8">Explore Packages</Link>
        </div>
        <img
          src={heroImages.about}
          alt="Sri Lankan travel landscape"
          className="h-[520px] w-full rounded-2xl object-cover"
        />
      </div>
    </section>
    </>
  );
}
