import { useRef, useState, type MouseEvent, type PointerEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { HairlineFigure } from "@/components/hairline-figure";
import { getBlogPosts, type PostMeta } from "@/lib/posts";

function shuffled<T>(items: T[]) {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * The home page's drawing: 책가도, whose compartments are filled at random on each load. Each
 * compartment also opens a blog post, dealt at random per load: the title shows under the
 * drawing while the pointer is on it, and a click opens it. On touch, the first tap on a
 * compartment shows its title and the second opens it.
 */
export function ArtGallery() {
  const navigate = useNavigate();
  const [posts] = useState(() => shuffled(getBlogPosts()));
  const dealt = useRef(new Map<string, PostMeta>());
  const [hovered, setHovered] = useState<PostMeta | null>(null);
  const shelfRef = useRef<string | null>(null);
  const armed = useRef<string | null>(null);

  // A compartment is named by the figure's read-out (`shelf 2·1`); it gets the next post the
  // first time the pointer reaches it.
  function postFor(key: string) {
    let post = dealt.current.get(key);
    if (!post && posts.length) {
      post = posts[dealt.current.size % posts.length];
      dealt.current.set(key, post);
    }
    return post;
  }

  function onRead(text: string) {
    const key = text.startsWith("shelf") ? text : null;
    shelfRef.current = key;
    setHovered((key && postFor(key)) || null);
  }

  // Runs before the figure sees the press, so it records what was chosen before this tap.
  function onPointerDownCapture(event: PointerEvent) {
    armed.current = event.pointerType === "mouse" ? "mouse" : shelfRef.current;
  }

  function onClick(event: MouseEvent) {
    const key = shelfRef.current;
    if (!key || (armed.current !== "mouse" && armed.current !== key)) return;
    const post = postFor(key);
    if (!post) return;
    if (event.metaKey || event.ctrlKey) window.open(post.url, "_blank");
    else navigate({ to: post.url });
  }

  return (
    <section className="home-gallery" aria-label="Drawing">
      <div className="art-gallery-piece">
        <HairlineFigure
          name="chaekgado"
          title="책가도"
          active
          onRead={onRead}
          stageProps={{
            onPointerDownCapture,
            onClick,
            style: hovered ? { cursor: "pointer" } : undefined,
          }}
        />
        <p className="art-hint" aria-hidden="true">
          {hovered?.title}
        </p>
      </div>
    </section>
  );
}
