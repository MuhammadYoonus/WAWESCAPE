import { Link } from "react-router-dom";
import { brandImages } from "../assets/images/imageCatalog";

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-white mt-20">
      <div className="container-page py-12 grid md:grid-cols-3 gap-8">
        <div>
          <img src={brandImages.footerLogo} alt="WAWESCAPE" className="h-24 w-auto rounded-lg object-contain" />
          <p className="mt-3 text-slate-400">Local experiences. Island-wide adventures. Your Sri Lanka story starts here.</p>
        </div>
        <div>
          <h4 className="font-bold">Explore</h4>
          <div className="mt-3 grid gap-2 text-slate-400">
            <Link to="/destinations" className="hover:text-emerald-300">Destinations</Link>
            <Link to="/packages" className="hover:text-emerald-300">1, 2 and 3 day packages</Link>
            <Link to="/favorites" className="hover:text-emerald-300">Favorite tours</Link>
            <Link to="/feedback" className="hover:text-emerald-300">Customer feedback</Link>
            <Link to="/about" className="hover:text-emerald-300">About WAWECAPE</Link>
          </div>
        </div>
        <div>
          <h4 className="font-bold">Contact</h4>
          <p className="mt-3 text-slate-400">hello@wavecape.lk<br />+94 76 284 0207<br />Sri Lanka</p>
        </div>
      </div>
      <div className="border-t border-slate-800 text-center py-5 text-sm text-slate-500">
        © 2026 WAWECAPE. Explore Sri Lanka.
      </div>
    </footer>
  );
}
