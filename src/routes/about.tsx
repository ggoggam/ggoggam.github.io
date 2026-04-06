import { createFileRoute } from "@tanstack/react-router";
import { getImages } from "@/lib/images";
import { AboutFragment } from "@/components/about-fragment";

export const Route = createFileRoute("/about")({
  component: AboutPage,
});

function AboutPage() {
  const imageFileNames = getImages();
  return (
    <div className="space-y-8">
      <AboutFragment />
      <div className="space-y-4">
        <p className="font-mono text-sm">
          Here are some photos of my cat, <em>Ggoggam</em> (꼬깜).
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {imageFileNames.map((src, index) => (
            <img
              key={index}
              src={src}
              alt="image of ggoggam"
              loading="lazy"
              className="w-full aspect-square object-cover rounded"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
