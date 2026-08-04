export type SiteFooterProps = {
  github: string;
  source: string;
};

export default function SiteFooter({ github, source }: SiteFooterProps) {
  return (
    <div className="mx-auto flex w-full max-w-measure flex-col gap-3 px-6 py-8 sm:flex-row sm:items-baseline sm:justify-between">
      <p className="label">© {new Date().getFullYear()} ggoggam</p>
      <ul className="flex items-baseline gap-1 sm:-mr-2">
        <li>
          <a
            href={github}
            target="_blank"
            rel="noopener noreferrer"
            className="label block px-2 py-1 no-underline transition-colors hover:text-ink"
          >
            github
          </a>
        </li>
        <li>
          <a
            href={source}
            target="_blank"
            rel="noopener noreferrer"
            className="label block px-2 py-1 no-underline transition-colors hover:text-ink"
          >
            source
          </a>
        </li>
      </ul>
    </div>
  );
}
