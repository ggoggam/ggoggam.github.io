import { createFileRoute } from "@tanstack/react-router";
import { getImages } from "@/lib/images";

export const Route = createFileRoute("/about")({
  component: AboutPage,
});

function AboutPage() {
  const imageFileNames = getImages();
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">About</h1>
      <div className="space-y-4 leading-relaxed text-gray-700">
        <p>
          I am currently working as a research engineer at a medical artificial intelligence company
          (Lunit, if you are curious). Prior to this, I was a software engineer at an early stage
          startup, where I gained invaluable experience in building technology from ground up. While
          my main focus is on MLOps, my interests are broad, spanning user interfaces and
          experiences, backend, and computer science in general.
        </p>
        <p>
          Through this blog, I intend to share my insights and learnings from my past-time
          tinkerings, readings, and work. Occassionally, I dabble on topics in artificial
          intelligence. My recent research has centered on applying Bayesian methodologies to deep
          learning models, with a particular focus on language models. I am based in Seoul, South
          Korea, where I live with my black cat, <em>Ggoggam</em> (꼬깜).
        </p>
      </div>
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
  );
}
