import Link from "next/link";

interface RelatedLinkProps {
  href: string;
  label: string;
}

export function RelatedLink({ href, label }: RelatedLinkProps) {
  return (
    <Link
      href={href}
      className="font-medium text-cyan-700 underline decoration-cyan-200 underline-offset-4 hover:text-cyan-900"
    >
      {label}
    </Link>
  );
}
