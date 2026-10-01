import { useFavorites } from "../hooks/useFavorites";

export default function FavoriteButton({ tour, className = "" }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const saved = isFavorite(tour.id);

  return (
    <button
      type="button"
      onClick={() => toggleFavorite(tour)}
      className={`favorite-button ${saved ? "favorite-button-active" : ""} ${className}`}
      aria-pressed={saved}
    >
      <span aria-hidden="true">{saved ? "♥" : "♡"}</span>
      {saved ? "Saved" : "Add to Favorites"}
    </button>
  );
}
