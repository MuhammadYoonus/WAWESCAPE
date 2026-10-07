import { Link } from "react-router-dom";
import { brandImages } from "../assets/images/imageCatalog";

const facebookUrl = "https://www.facebook.com/your-page-name";
const instagramUrl = "https://www.instagram.com/your-page-name";
const whatsappUrl = "https://wa.me/94762840207";

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
            <Link to="/packages" className="hover:text-emerald-300">Tour packages</Link>
            <Link to="/favorites" className="hover:text-emerald-300">Favorite tours</Link>
            <Link to="/feedback" className="hover:text-emerald-300">Customer feedback</Link>
            <Link to="/about" className="hover:text-emerald-300">About WAWECAPE</Link>
          </div>
        </div>
        <div>
          <h4 className="font-bold">Contact</h4>
          <p className="mt-3 text-slate-400">admin@wavecape.lk<br />+94 76 284 0207<br />Sri Lanka</p>
          <div className="mt-5 flex gap-3">
            <a
              href={facebookUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="Visit WAWESCAPE on Facebook"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/70 text-white transition hover:border-emerald-300 hover:text-emerald-300"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
                <path d="M14 8.5h2V5h-2.6C10.4 5 9 6.8 9 9.5V12H7v3.5h2V22h4v-6.5h2.7L16 12h-3V9.8c0-.8.3-1.3 1-1.3Z" />
              </svg>
            </a>
            <a
              href={instagramUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="Visit WAWESCAPE on Instagram"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/70 text-white transition hover:border-emerald-300 hover:text-emerald-300"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
                <path d="M7.8 2h8.4A5.8 5.8 0 0 1 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8A5.8 5.8 0 0 1 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2Zm0 2A3.8 3.8 0 0 0 4 7.8v8.4A3.8 3.8 0 0 0 7.8 20h8.4a3.8 3.8 0 0 0 3.8-3.8V7.8A3.8 3.8 0 0 0 16.2 4H7.8Zm8.7 2.1a1.3 1.3 0 1 1 0 2.6 1.3 1.3 0 0 1 0-2.6ZM12 7.2A4.8 4.8 0 1 1 12 16.8 4.8 4.8 0 0 1 12 7.2Zm0 2A2.8 2.8 0 1 0 12 14.8 2.8 2.8 0 0 0 12 9.2Z" />
              </svg>
            </a>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="Chat with WAWESCAPE on WhatsApp"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/70 text-white transition hover:border-emerald-300 hover:text-emerald-300"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
                <path d="M12 2a9.9 9.9 0 0 0-8.5 15L2 22l5.2-1.4A10 10 0 1 0 12 2Zm0 2a8 8 0 0 1 0 16 7.8 7.8 0 0 1-4.1-1.1l-.4-.2-2.7.7.8-2.6-.3-.4A8 8 0 0 1 12 4Zm-3.1 4.2c-.2 0-.5.1-.7.4-.2.3-.9.9-.9 2.1s.9 2.4 1 2.6c.1.2 1.8 2.8 4.4 3.8 2.2.9 2.6.7 3.1.7.5 0 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2 0-.1-.2-.2-.5-.4l-1.7-.8c-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.6.1-.3-.1-1.1-.4-2-1.2-.8-.7-1.3-1.5-1.4-1.7-.1-.3 0-.4.1-.5l.4-.5c.1-.1.2-.3.3-.4.1-.2.1-.3 0-.5l-.8-1.9c-.2-.4-.4-.4-.6-.4h-.6Z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-slate-800 text-center py-5 text-sm text-slate-550">
        © 2026 WAWECAPE. Explore Sri Lanka.
      </div>
    </footer>
  );
}
