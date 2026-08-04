import { createFileRoute } from "@tanstack/react-router";
import { getImages } from "@/lib/images";
import { AboutFragment } from "@/components/about-fragment";
import { useSeo } from "@/lib/seo";

export const Route = createFileRoute("/about")({
  component: AboutPage,
});

function AboutPage() {
  const photos = getImages();
  useSeo({
    title: "About",
    description: "About 꼬깜 — software engineer and cat enthusiast.",
    path: "/about",
  });

  return (
    <div>
      <AboutFragment />

      <section aria-labelledby="cat" className="mt-14">
        <h2 id="cat" className="label mb-5 border-b border-rule pb-4">
          꼬깜, the cat
        </h2>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {photos.map((photo, index) => (
            <li key={photo.webp400}>
              <picture>
                <source
                  type="image/webp"
                  srcSet={`${photo.webp400} 400w, ${photo.webp800} 800w`}
                  sizes="(min-width: 640px) 208px, 45vw"
                />
                <img
                  src={photo.jpg400}
                  /* Decorative: the heading above already says what these are,
                     and nine identical alt strings only add noise in a reader. */
                  alt=""
                  width={400}
                  height={400}
                  loading={index < 3 ? "eager" : "lazy"}
                  decoding="async"
                  className="aspect-square w-full rounded-sm border border-rule object-cover"
                />
              </picture>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
