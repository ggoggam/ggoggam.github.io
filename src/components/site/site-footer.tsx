import { ArrowUpRight, ArrowUp } from "lucide-react";
import { Link } from "@tanstack/react-router";

export type SiteFooterProps = {
  github: string;
  source: string;
};

export default function SiteFooter({ github, source }: SiteFooterProps) {
  return (
    <div className="container px-2 py-8 mx-auto text-gray-600 text-sm space-y-6">
      <ul className="flex flex-row gap-1">
        <li>
          <a href="#top" className="flex items-center gap-x-1">
            <ArrowUp />
            top
          </a>
        </li>
        <li>
          <a
            href={github}
            className="flex items-center gap-x-1"
            target="_blank"
            rel="noopener noreferrer"
          >
            <ArrowUpRight />
            github
          </a>
        </li>
        <li>
          <a
            href={source}
            className="flex items-center gap-x-1"
            target="_blank"
            rel="noopener noreferrer"
          >
            <ArrowUpRight />
            source
          </a>
        </li>
        <li>
          <Link to="/about" className="flex items-center gap-x-1">
            <ArrowUpRight />
            about
          </Link>
        </li>
      </ul>
      <p className="mx-auto text-xs text-center">
        © {new Date().getFullYear()} Created by ggoggam. All rights reserved.
      </p>
    </div>
  );
}
