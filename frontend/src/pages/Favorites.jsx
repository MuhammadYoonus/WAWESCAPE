import { Link } from "react-router-dom";
import PageHero from "../components/PageHero";
import { heroImages } from "../assets/images/imageCatalog";
import { useFavorites } from "../hooks/useFavorites";

export default function Favorites() {
  const { favorites, removeFavorite } = useFavorites();

  return (
    <>
      <PageHero
        eyebrow="FAVORITES"
        title="Saved tours for your next Sri Lanka trip"
        text="Customers can keep interesting tours here while comparing package options."
        image={heroImages.gallery}
      />
      <section className="container-page py-14">
        {favorites.length === 0 ? (
          <div className="card p-10 text-center">
            <h2 className="text-3xl font-black">No favorite tours yet</h2>
            <p className="mt-3 text-slate-600">Add tours from the packages section and they will appear here.</p>
            <Link to="/packages" className="btn-primary mt-6">Browse Tour Packages</Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-7">
            {favorites.map(tour => (
              <article key={tour.id} className="card overflow-hidden">
                <img src={tour.image} alt={tour.title} className="h-56 w-full object-cover" />
                <div className="p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="badge">{tour.label}</span>
                    {tour.price && <span className="font-black text-emerald-700">{tour.price}</span>}
                  </div>
                  <h2 className="mt-4 text-2xl font-black">{tour.title}</h2>
                  <p className="mt-2 text-sm font-bold text-slate-500">{tour.route}</p>
                  {tour.description && <p className="mt-4 text-sm text-slate-600">{tour.description}</p>}
                  <button
                    type="button"
                    onClick={() => removeFavorite(tour.id)}
                    className="btn-outline mt-6"
                  >
                    Remove Favorite
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
