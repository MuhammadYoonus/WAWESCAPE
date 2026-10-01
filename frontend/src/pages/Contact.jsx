import PageHero from "../components/PageHero";
import { heroImages } from "../assets/images/imageCatalog";

export default function Contact() {
  return (
    <>
      <PageHero
        eyebrow="CONTACT"
        title="Plan your next Sri Lanka tour with WAWECAPE"
        text="Send a travel request, ask about a package, or customize a route for your group."
        image={heroImages.contact}
      />
      <section className="container-page py-14 grid lg:grid-cols-[1fr_420px] gap-10">
        <div className="card p-8">
          <h2 className="text-3xl font-black">Send an inquiry</h2>
          <form className="mt-7 grid gap-5">
            <label>Name<input placeholder="Your name" /></label>
            <label>Email<input type="email" placeholder="you@example.com" /></label>
            <label>Tour interest<select defaultValue="">
              <option value="" disabled>Select package type</option>
              <option>1 day tour</option>
              <option>2 day tour</option>
              <option>3 day tour</option>
              <option>Custom Sri Lanka tour</option>
            </select></label>
            <label>Message<textarea rows="5" placeholder="Tell us your dates, destination ideas and group size." /></label>
            <button type="button" className="btn-primary justify-center">Submit Inquiry</button>
          </form>
        </div>
        <aside className="card p-8 h-fit">
          <p className="eyebrow">WAWECAPE OFFICE</p>
          <h2 className="mt-3 text-3xl font-black">Local support for every journey</h2>
          <div className="mt-7 space-y-5 text-slate-700">
            <p><strong>Email:</strong><br />hello@wavecape.lk</p>
            <p><strong>Phone:</strong><br />+94 77 123 4567</p>
            <p><strong>Location:</strong><br />Sri Lanka</p>
          </div>
        </aside>
      </section>
    </>
  );
}
