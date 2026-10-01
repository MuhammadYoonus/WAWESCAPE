import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import FavoriteButton from "../components/FavoriteButton";
import TourCard from "../components/TourCard";
import { heroImages } from "../assets/images/imageCatalog";
import { destinations, feedbacks, packages } from "../data/travelContent";

export default function Home() {
  const [tours, setTours] = useState([]);

  useEffect(() => {
    api.get("/tours?featured=true").then(res => setTours(res.data)).catch(console.error);
  }, []);

  return (
    <>
      <section
        className="hero"
        style={{ backgroundImage: `linear-gradient(90deg, rgba(0, 95, 115, .9), rgba(10, 147, 150, .32)), url("${heroImages.home}")` }}
      >
        <div className="container-page py-28 md:py-36">
          <div className="max-w-3xl text-white">
            <span className="inline-block rounded-full bg-white/15 px-4 py-2 text-sm font-semibold">LOCAL SRI LANKAN TRAVEL AGENCY</span>
            <h1 className="mt-6 text-5xl md:text-7xl font-black leading-tight">See Sri Lanka.<br /><span className="text-emerald-300">Feel Sri Lanka.</span></h1>
            <p className="mt-6 text-lg md:text-xl text-slate-200 max-w-2xl">From whale watching in Mirissa to mountain journeys in Ella, discover authentic island experiences with WAWECAPE.</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/packages" className="btn-primary text-base">Explore Packages</Link>
              <Link to="/packages" className="btn-white text-base">View Packages</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <div className="grid md:grid-cols-4 gap-5">
          {[
            ["6+", "Destinations", "Beaches, wildlife, culture and mountains."],
            ["1-3", "Day packages", "Quick tours with clear daily plans."],
            ["4.9", "Guest rating", "Feedback from happy travelers."],
            ["24/7", "Support", "Local help before and during travel."]
          ].map(([value, title, text]) => (
            <div className="p-6 rounded-2xl bg-slate-50 border" key={title}>
              <div className="text-3xl font-black text-emerald-700">{value}</div><h3 className="mt-3 font-bold">{title}</h3><p className="mt-2 text-sm text-slate-600">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page pb-16">
        <div className="flex items-end justify-between mb-8">
          <div><p className="eyebrow">DESTINATIONS</p><h2 className="section-title">Top places to discover</h2></div>
          <Link to="/destinations" className="text-emerald-700 font-bold">View all</Link>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {destinations.slice(0, 3).map(destination => (
              <article key={destination.name} className="card tour-card-effect">
              <img src={destination.image} alt={destination.name} className="h-52 w-full object-cover" />
              <div className="p-5">
                <span className="badge">{destination.region}</span>
                <h3 className="mt-3 text-xl font-black">{destination.name}</h3>
                <p className="mt-2 text-sm text-slate-600">{destination.summary}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-slate-50 py-16">
        <div className="container-page">
          <div className="flex items-end justify-between mb-8">
          <div><p className="eyebrow">TOUR PACKAGES</p><h2 className="section-title">Short, 1, 2 and 3 day plans</h2></div>
            <Link to="/packages" className="text-emerald-700 font-bold">See packages</Link>
          </div>
          <div className="grid lg:grid-cols-3 gap-6">
            {packages.slice(0, 3).map(pkg => (
              <article key={pkg.id} className="card tour-card-effect p-6">
                <span className="badge">{pkg.days === "short" ? "Short tour" : `${pkg.days} day tour`}</span>
                <h3 className="mt-4 text-xl font-black">{pkg.title}</h3>
                <p className="mt-2 text-sm font-semibold text-slate-500">{pkg.route}</p>
                <p className="mt-4 text-2xl font-black text-emerald-700">{pkg.price}</p>
                <ul className="mt-5 space-y-2 text-sm text-slate-600">
                  {pkg.plan.slice(0, 2).map(item => <li key={item}>- {item}</li>)}
                </ul>
                <FavoriteButton
                  className="mt-5"
                  tour={{
                    id: pkg.id,
                    title: pkg.title,
                    image: pkg.image,
                    price: pkg.price,
                    route: pkg.route,
                    label: pkg.days === "short" ? "Short tour" : `${pkg.days} day tour`,
                    description: pkg.plan.join(" ")
                  }}
                />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="featured" className="container-page pb-16">
        <div className="flex items-end justify-between mb-8">
          <div><p className="eyebrow">HANDPICKED</p><h2 className="section-title">Popular experiences</h2></div>
          <Link to="/packages" className="text-emerald-700 font-bold">View packages</Link>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tours.map(tour => <TourCard key={tour._id} tour={tour} />)}
        </div>
      </section>

      <section className="container-page pb-16">
        <div className="grid lg:grid-cols-[360px_1fr] gap-8">
          <div>
            <p className="eyebrow">CUSTOMER FEEDBACK</p>
            <h2 className="section-title">Trusted by travelers</h2>
            <Link to="/feedback" className="btn-outline mt-6">Read More</Link>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {feedbacks.map(feedback => (
              <article key={feedback.name} className="card p-5">
                <div className="text-amber-500">{"★".repeat(feedback.rating)}</div>
                <p className="mt-4 text-sm text-slate-700">"{feedback.text}"</p>
                <h3 className="mt-5 font-black">{feedback.name}</h3>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
