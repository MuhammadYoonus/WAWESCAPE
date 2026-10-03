import { Link } from "react-router-dom";
import PageHero from "../components/PageHero";
import { heroImages } from "../assets/images/imageCatalog";
import { destinations } from "../data/travelContent";

export default function Destinations() {
  return (
    <>
      <PageHero
        eyebrow="TRAVEL DESTINATIONS"
        title="Places your customers can explore"
        text="A curated destination board for WAWECAPE travelers, covering beaches, wildlife, heritage cities and hill-country escapes across Sri Lanka."
        image={heroImages.destinations}
      />
      <section className="container-page py-14">

      <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-7">
        {destinations.map(destination => (
          <article key={destination.name} className="card overflow-hidden">
            <img src={destination.image} alt={destination.name} className="h-56 w-full object-cover" />
            <div className="p-6">
              <span className="badge">{destination.region}</span>
              <h2 className="mt-4 text-2xl font-black">{destination.name}</h2>
              <p className="mt-3 text-slate-600">{destination.summary}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {destination.bestFor.map(item => (
                  <span key={item} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-12 rounded-2xl bg-emerald-900 px-6 py-8 text-white md:flex md:items-center md:justify-between">
        <div>
          <p className="text-sm font-bold text-emerald-200">Need a ready tour package?</p>
          <h2 className="mt-2 text-3xl font-black">Match destinations with tour plans.</h2>
        </div>
        <Link to="/packages" className="btn-white mt-6 md:mt-0">View Packages</Link>
      </div>
    </section>
    </>
  );
}
