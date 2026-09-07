import ThemeToggle from "./theme-toggle";

export type SiteFooterProps = {
  github: string;
  source: string;
};

export default function SiteFooter({ github, source }: SiteFooterProps) {
  return (
    <div className="footer-inner">
      <p className="footer-signature">© {new Date().getFullYear()} 꼬깜</p>
      <ul className="footer-links">
        <li>
          <a href={github} target="_blank" rel="noopener noreferrer" className="footer-link">
            github
          </a>
        </li>
        <li>
          <a href={source} target="_blank" rel="noopener noreferrer" className="footer-link">
            source
          </a>
        </li>
        <li>
          <ThemeToggle />
        </li>
      </ul>
    </div>
  );
}
