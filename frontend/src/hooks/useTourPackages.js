import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../api";
import { tourToPackage } from "../data/tourPackages";
import { tourImageUrl } from "../utils/tourImage";

export function useTourPackages() {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = useCallback(() => setRefreshKey(key => key + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    api.get("/tours")
      .then(res => { if (!cancelled) setTours(res.data.map(tour => ({ ...tour, image: tourImageUrl(tour.image) }))); })
      .catch(() => { if (!cancelled) setError("New tour packages could not be loaded. Please try again."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [refreshKey]);

  useEffect(() => {
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, [refresh]);

  const allPackages = useMemo(() => tours.map(tourToPackage), [tours]);
  return { packages: allPackages, tours, loading, error, refresh };
}
