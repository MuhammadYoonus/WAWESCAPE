import { useEffect, useMemo } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import PageHero from "../components/PageHero";
import FavoriteButton from "../components/FavoriteButton";
import { heroImages } from "../assets/images/imageCatalog";
import { packageOptions } from "../data/tourPackages";
import { useTourPackages } from "../hooks/useTourPackages";

export default function Packages() {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedDays = searchParams.get("duration");
  const selectedDays = packageOptions.some(([value]) => value === requestedDays) ? requestedDays : "short";
  const { packages, loading, error, refresh } = useTourPackages();
  const { hash } = useLocation();
  const visiblePackages = useMemo(
    () => packages.filter(item => String(item.days) === selectedDays),
    [packages, selectedDays]
  );

  useEffect(() => {
    if (!loading && /^#tour-\d+$/.test(hash)) {
      document.getElementById(hash.slice(1))?.scrollIntoView({ block: "start" });
    }
  }, [loading, hash]);

  return (
    <>
    <PageHero
      eyebrow="TRAVEL PACKAGES"
      title="Choose short, 1, 2 or 3 day tours"
      text="Simple package options with clear tour plans, routes and starting prices for customers who want quick decisions before booking."
      image={heroImages.packages}
    />
    <section className="container-page py-14">
      <div className="grid lg:grid-cols-[1fr_360px] gap-10 items-end">
        <div>
          <p className="eyebrow">PACKAGE OPTIONS</p>
          <h2 className="section-title">Tour plans by duration</h2>
        </div>
        <div className="card p-5">
          <p className="text-sm font-bold text-slate-600">Select tour type</p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {packageOptions.map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setSearchParams({ duration: value })}
                aria-pressed={selectedDays === value}
                className={selectedDays === value ? "filter-active" : "filter"}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading && <p role="status" className="mt-6 text-slate-600">Loading tour packages...</p>}
      {error && <div role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4"><p className="text-red-600">{error}</p><button type="button" onClick={refresh} className="btn-outline mt-3">Try again</button></div>}
      {!loading && !error && !visiblePackages.length && <p className="card mt-10 p-8 text-center">No tours are available for this duration yet. Please choose another tour type.</p>}
      <div className="mt-10 grid md:grid-cols-2 xl:grid-cols-3 gap-5">
        {visiblePackages.map(pkg => (
          <article id={pkg.id} key={pkg.id} className="card tour-card-effect scroll-mt-36">
            <img src={pkg.image} alt={pkg.title} className="h-44 w-full object-cover" />
            <div className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="badge">{pkg.days === "short" ? "Short tour" : `${pkg.days} day tour`}</span>
                <span className="text-base font-black text-emerald-700">{pkg.price}</span>
              </div>
              <h2 className="mt-3 text-xl font-black">{pkg.title}</h2>
              <p className="mt-2 text-sm font-bold text-slate-500">{pkg.route}</p>
              <div className="mt-4 space-y-2">
                {pkg.plan.map((step, index) => (
                  <div key={index} className="flex gap-2 rounded-lg bg-slate-50 p-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-xs font-black text-white">
                      {index + 1}
                    </span>
                    <p className="text-sm font-semibold text-slate-700">{step}</p>
                  </div>
                ))}
              </div>
              <div className="package-actions">
                <FavoriteButton
                  className="w-full"
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
                <Link to={`/booking/${pkg.id}`} className="btn-primary">Book Plan</Link>
                <Link to="/destinations" className="btn-outline">Destinations</Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
    </>
  );
}
