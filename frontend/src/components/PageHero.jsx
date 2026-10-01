export default function PageHero({ eyebrow, title, text, image }) {
  return (
    <section
      className="page-hero"
      style={{ backgroundImage: `linear-gradient(90deg, rgba(0, 95, 115, .88), rgba(10, 147, 150, .32)), url("${image}")` }}
    >
      <div className="container-page py-20 md:py-28 text-white">
        <p className="text-xs font-black tracking-[0.24em] text-emerald-200">{eyebrow}</p>
        <h1 className="mt-4 max-w-4xl text-4xl md:text-6xl font-black tracking-tight">{title}</h1>
        {text && <p className="mt-5 max-w-2xl text-lg text-slate-100">{text}</p>}
      </div>
    </section>
  );
}
