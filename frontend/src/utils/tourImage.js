export function tourImageUrl(image) {
  if (!image?.startsWith("/tour-images/")) return image;
  const base = import.meta.env?.VITE_API_URL || "http://localhost:5001/api";
  const origin = typeof window === "undefined" ? "http://localhost:5173" : window.location.origin;
  return `${new URL(base, origin).origin}${image}`;
}
