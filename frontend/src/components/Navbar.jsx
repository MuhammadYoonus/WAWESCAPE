import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { brandImages } from "../assets/images/imageCatalog";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const publicLinks = [
    ["/", "Home"], ["/destinations", "Destinations"], ["/packages", "Tour Packages"],
    ["/favorites", "Favorites"], ["/gallery", "Gallery"], ["/about", "About"],
    ["/contact", "Contact"], ["/feedback", "Feedback"]
  ];
  useEffect(() => { setOpen(false); }, [location.pathname, location.search]);

  return <header className="sticky top-0 z-50 bg-slate-950 text-white shadow-md">
    <nav aria-label="Main navigation" className="container-page flex min-h-20 flex-wrap items-center justify-between gap-x-6 gap-y-2 py-3 lg:flex-nowrap">
      <Link to="/" className="shrink-0"><img src={brandImages.headerLogo} alt="WAWESCAPE home" className="h-14 w-auto object-contain" /></Link>
      <button type="button" className="nav-action lg:hidden" aria-expanded={open} aria-controls="main-menu" onClick={() => setOpen(value => !value)}>{open ? "Close menu" : "Menu"}<span aria-hidden="true" className="ml-2">{open ? "×" : "☰"}</span></button>
      <div id="main-menu" className={`${open ? "flex" : "hidden"} max-h-[70vh] w-full flex-col gap-3 overflow-y-auto py-3 text-sm font-bold lg:flex lg:w-auto lg:flex-row lg:flex-wrap lg:items-center lg:justify-end lg:gap-x-4 lg:gap-y-2 lg:overflow-visible lg:py-0 lg:text-xs`} onKeyDown={event => { if (event.key === "Escape") setOpen(false); }}>
        {publicLinks.map(([to, label]) => <NavLink key={to} to={to} className="nav-link py-1" end={to === "/"}>{label}</NavLink>)}
        {user && <NavLink to="/bookings" className="nav-link py-1">My Bookings</NavLink>}
        {user?.role === "admin" && <NavLink to="/admin" className="nav-link py-1">Admin</NavLink>}
        {user ? <><span className="text-xs text-emerald-200">Hi, {user.name}</span><button onClick={() => { logout(); setOpen(false); navigate("/"); }} className="nav-action w-fit">Logout</button></> : <><NavLink to="/login" className="nav-link py-1">Login</NavLink><NavLink to="/register" className="nav-action w-fit">Register</NavLink></>}
      </div>
    </nav>
  </header>;
}
