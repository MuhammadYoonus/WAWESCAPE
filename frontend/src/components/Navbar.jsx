import { Link, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { brandImages } from "../assets/images/imageCatalog";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const publicLinks = [
    ["/", "Home"],
    ["/destinations", "Destinations"],
    ["/packages", "Tour Packages"],
    ["/favorites", "Favorites"],
    ["/gallery", "Gallery"],
    ["/about", "About"],
    ["/contact", "Contact"],
    ["/feedback", "Feedback"]
  ];

  useEffect(() => {
    const updateHeader = () => setScrolled(window.scrollY > 20);
    updateHeader();
    window.addEventListener("scroll", updateHeader);
    return () => window.removeEventListener("scroll", updateHeader);
  }, []);

  return (
    <header className={`fixed inset-x-0 top-0 z-50 text-white transition-all duration-300 ${
      scrolled
        ? "border-b border-white/10 bg-slate-950/95 shadow-lg backdrop-blur"
        : "border-b border-transparent bg-transparent shadow-none"
    }`}>
      <nav className="container-page flex min-h-20 flex-col gap-4 py-4 lg:flex-row lg:items-center lg:justify-between">
        <Link to="/" className="flex items-center gap-3">
          <img src={brandImages.headerLogo} alt="WAWESCAPE" className="h-16 w-auto object-contain md:h-20" />
        </Link>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-sm font-bold uppercase tracking-wide">
          {publicLinks.map(([to, label]) => (
            <NavLink key={to} to={to} className="nav-link">
              {label}
            </NavLink>
          ))}
          {user && <NavLink to="/bookings" className="nav-link">My Bookings</NavLink>}
          {user?.role === "admin" && <NavLink to="/admin" className="nav-link">Admin</NavLink>}
          {user ? (
            <>
              <span className="text-xs text-emerald-200">Hi, {user.name}</span>
              <button onClick={() => { logout(); navigate("/"); }} className="nav-action">Logout</button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="nav-link">Login</NavLink>
              <NavLink to="/register" className="nav-action">Register</NavLink>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
