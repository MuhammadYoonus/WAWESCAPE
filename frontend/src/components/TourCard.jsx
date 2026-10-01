import { Link } from "react-router-dom";
import FavoriteButton from "./FavoriteButton";

const labels = {
  "day-tour": "Day Tour",
  "multi-day": "Multi-Day",
  "round-tour": "Round Tour",
  experience: "Experience"
};

export default function TourCard({ tour }) {
  return (
    <article className="card tour-card-effect">
      <img src={tour.image} alt={tour.title} className="h-52 w-full object-cover" />
      <div className="p-5">
        <div className="flex justify-between gap-3 items-center">
          <span className="badge">{labels[tour.category]}</span>
          <span className="text-sm text-slate-500">{tour.duration}</span>
        </div>
        <h3 className="mt-3 text-xl font-bold">{tour.title}</h3>
        <p className="mt-2 text-slate-600 text-sm line-clamp-2">{tour.shortDescription}</p>
        <div className="mt-5 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500">From</span>
            <div className="font-black text-lg">LKR {tour.price.toLocaleString()}</div>
          </div>
          <Link to={`/tours/${tour._id}`} className="btn-primary">View Tour</Link>
        </div>
        <FavoriteButton
          className="mt-4 w-full justify-center"
          tour={{
            id: `api-${tour._id}`,
            title: tour.title,
            image: tour.image,
            price: `LKR ${tour.price.toLocaleString()}`,
            route: tour.location,
            label: labels[tour.category] || "Tour",
            description: tour.shortDescription
          }}
        />
      </div>
    </article>
  );
}
