import { useEffect, useState } from "react";

const STORAGE_KEY = "wawescape-favorites";

function readFavorites() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveFavorites(favorites) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  window.dispatchEvent(new Event("favorites-updated"));
}

export function useFavorites() {
  const [favorites, setFavorites] = useState(readFavorites);

  useEffect(() => {
    function syncFavorites() {
      setFavorites(readFavorites());
    }

    window.addEventListener("storage", syncFavorites);
    window.addEventListener("favorites-updated", syncFavorites);

    return () => {
      window.removeEventListener("storage", syncFavorites);
      window.removeEventListener("favorites-updated", syncFavorites);
    };
  }, []);

  function isFavorite(id) {
    return favorites.some(item => item.id === id);
  }

  function toggleFavorite(tour) {
    const nextFavorites = isFavorite(tour.id)
      ? favorites.filter(item => item.id !== tour.id)
      : [...favorites, tour];

    saveFavorites(nextFavorites);
    setFavorites(nextFavorites);
  }

  function removeFavorite(id) {
    const nextFavorites = favorites.filter(item => item.id !== id);
    saveFavorites(nextFavorites);
    setFavorites(nextFavorites);
  }

  return { favorites, isFavorite, toggleFavorite, removeFavorite };
}
