import PageHero from "../components/PageHero";
import { galleryImages, heroImages } from "../assets/images/imageCatalog";

export default function Gallery() {
  return (
    <>
      <PageHero
        eyebrow="GALLERY"
        title="Sri Lanka moments from coast to hill country"
        text="A visual preview of the places WAWECAPE travelers can explore."
        image={heroImages.gallery}
      />
      <section className="container-page py-14">
        <div className="grid md:grid-cols-3 gap-5">
          {galleryImages.map(item => (
            <article key={item.title} className="tour-card-effect rounded-2xl">
              <img src={item.image} alt={item.title} className="h-72 w-full object-cover" />
              <div className="bg-slate-950 px-5 py-4 text-white">
                <h2 className="font-black">{item.title}</h2>
                <p className="text-sm text-slate-300">{item.region}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
