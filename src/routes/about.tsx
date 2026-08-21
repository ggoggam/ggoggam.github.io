import { createFileRoute } from "@tanstack/react-router";
import { getImages } from "@/lib/images";
import { AboutFragment } from "@/components/about-fragment";
import { useSeo } from "@/lib/seo";

export const Route = createFileRoute("/about")({
  component: AboutPage,
});

type Project = {
  name: string;
  description: string;
  host: string;
  href: string;
};

const PROJECTS: Project[] = [
  {
    name: "hitch",
    description: "A collaborative trip planner: build an itinerary with the people coming along.",
    host: "hitch.ggoggam.dev",
    href: "https://hitch.ggoggam.dev",
  },
  {
    name: "daytwo",
    description: "A shared calendar for couples, so two schedules read as one.",
    host: "daytwo.ggoggam.dev",
    href: "https://daytwo.ggoggam.dev",
  },
];

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

      {/* The two things I actually built and run, on my own domain. A row here
          is the post-row construction with the host standing in for the date. */}
      <section aria-labelledby="projects" className="mt-14">
        <h2 id="projects" className="label mb-1 border-b border-rule pb-4">
          side projects
        </h2>
        <ul>
          {PROJECTS.map((project) => (
            <li key={project.href} className="border-b border-rule">
              <div className="flex flex-col gap-1.5 py-5 sm:flex-row sm:gap-6">
                <div className="min-w-0 flex-1">
                  <a
                    href={project.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="title-display block text-h3 no-underline decoration-rule-strong hover:underline"
                  >
                    {project.name}
                  </a>
                  <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                    {project.description}
                  </p>
                </div>
                <span className="label shrink-0 pt-[0.4em] text-2xs tracking-[0.06em]">
                  {project.host}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </section>

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
