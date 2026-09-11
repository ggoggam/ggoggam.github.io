import { useEffect, useRef, type RefObject } from "react";

type ReadingProgressProps = {
  contentRef: RefObject<HTMLDivElement | null>;
  title: string;
};

type ReadingHeading = {
  title: string;
  offset: number;
};

// Inspired by Skiper UI's Scroll progress 003 (skiper95):
// https://skiper-ui.com/v1/skiper95. Implemented locally without its Pro source.
export default function ReadingProgress({ contentRef, title }: ReadingProgressProps) {
  const progressRef = useRef<HTMLDivElement>(null);
  const meterRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLSpanElement>(null);
  const numberRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const content = contentRef.current;
    const indicator = progressRef.current;
    const meter = meterRef.current;
    const label = titleRef.current;
    const number = numberRef.current;
    if (!content || !indicator || !meter || !label || !number) return;

    let frame = 0;
    let lastPercent = -1;
    let lastTitle = "";
    let needsMeasure = true;
    let end = 0;
    let headings: ReadingHeading[] = [];

    const update = () => {
      frame = 0;
      // Finish when the last lines clear the blurred reading edge. Comments
      // and the footer do not extend the reading distance.
      const readingInset = Math.min(160, window.innerHeight * 0.2);
      if (needsMeasure) {
        needsMeasure = false;
        const contentBox = content.getBoundingClientRect();
        // Long section titles stay in the desktop gutter rather than covering prose.
        const titleWidth = Math.max(
          48,
          indicator.getBoundingClientRect().left - contentBox.right - 26
        );
        indicator.style.setProperty("--reading-title-width", `${titleWidth}px`);
        end = contentBox.bottom + window.scrollY - window.innerHeight + readingInset;
        headings = Array.from(
          content.querySelectorAll<HTMLElement>("h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]")
        )
          .filter(
            (heading) => !heading.closest("[data-footnotes]") && heading.getClientRects().length
          )
          .map((heading) => {
            const label = heading.cloneNode(true) as HTMLElement;
            label.querySelectorAll("button, [aria-hidden='true']").forEach((node) => node.remove());
            const offset = Math.max(
              0,
              heading.getBoundingClientRect().top + window.scrollY - readingInset
            );
            return {
              title: label.textContent?.trim() || heading.id,
              offset,
            };
          });
      }
      const progress = end <= 0 ? 1 : Math.min(1, Math.max(0, window.scrollY / end));
      const percent = Math.round(progress * 100);
      let currentTitle = title;
      for (const heading of headings) {
        if (heading.offset <= window.scrollY + 1) currentTitle = heading.title;
      }
      if (currentTitle !== lastTitle || percent !== lastPercent) {
        meter.setAttribute("aria-valuetext", `${currentTitle} · ${percent}%`);
      }
      if (currentTitle !== lastTitle) {
        label.textContent = currentTitle;
        label.title = currentTitle;
        lastTitle = currentTitle;
      }

      indicator.style.setProperty("--reading-progress", `${progress * 100}%`);
      indicator.dataset.ready = "true";
      if (percent !== lastPercent) {
        meter.setAttribute("aria-valuenow", String(percent));
        number.textContent = `${percent}%`;
        lastPercent = percent;
      }
    };

    const scheduleUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    const scheduleMeasure = () => {
      needsMeasure = true;
      scheduleUpdate();
    };

    // Also measure after images, fonts, or interactive post content resize.
    const observer = new ResizeObserver(scheduleMeasure);
    observer.observe(content);
    observer.observe(document.body);
    const mutations = new MutationObserver(scheduleMeasure);
    mutations.observe(content, { childList: true, subtree: true, characterData: true });
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleMeasure);
    scheduleUpdate();

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      mutations.disconnect();
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleMeasure);
    };
  }, [contentRef, title]);

  return (
    <div ref={progressRef} className="reading-progress">
      <div
        ref={meterRef}
        className="reading-progress-track"
        role="progressbar"
        aria-label="Reading progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={0}
        aria-valuetext={`${title} · 0%`}
      >
        <div className="reading-progress-fill" />
      </div>
      <div className="reading-progress-marker" aria-hidden="true">
        <span className="reading-progress-label">
          <span ref={titleRef} className="reading-progress-title" title={title}>
            {title}
          </span>
          <span className="reading-progress-separator">·</span>
          <span ref={numberRef} className="reading-progress-number">
            0%
          </span>
        </span>
        <span className="reading-progress-line" />
      </div>
    </div>
  );
}
