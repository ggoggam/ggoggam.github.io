export type SiteFooterProps = {
  github: string;
  source: string;
};

export default function SiteFooter({ github, source }: SiteFooterProps) {
  return (
    <div className="font-mono max-w-2xl w-full mx-auto px-6 py-8 text-sm text-gray-400 flex items-center justify-between">
      <p>&copy; {new Date().getFullYear()} ggoggam</p>
      <div className="flex gap-4">
        <a href={github} target="_blank" rel="noopener noreferrer">
          github
        </a>
        <a href={source} target="_blank" rel="noopener noreferrer">
          source
        </a>
      </div>
    </div>
  );
}
