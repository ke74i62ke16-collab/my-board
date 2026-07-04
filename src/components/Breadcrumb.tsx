import Link from "next/link";

type Crumb = { label: string; href?: string };

export default function Breadcrumb({ crumbs, right }: { crumbs: Crumb[]; right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <nav className="flex items-center gap-1.5 text-sm text-slate-500">
        {crumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-slate-300 select-none">/</span>}
            {crumb.href ? (
              <Link href={crumb.href} className="hover:text-amber-500 transition-colors">
                {crumb.label}
              </Link>
            ) : (
              <span className="text-slate-400">{crumb.label}</span>
            )}
          </span>
        ))}
      </nav>
      {right}
    </div>
  );
}
