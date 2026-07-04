"use client";

import { useState } from "react";
import Link from "next/link";
import { CATEGORY_CONFIG, CATEGORY_ORDER } from "@/lib/categories";
import type { Category } from "@/lib/types";

type Props = {
  activeCategory: Category | null;
};

export default function CategoryNav({ activeCategory }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);

  const tabClass = (active: boolean) =>
    `shrink-0 px-4 py-3 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors ${
      active
        ? "border-amber-400 text-amber-400"
        : "border-transparent text-slate-400 hover:text-slate-200"
    }`;

  const mobileItemClass = (active: boolean) =>
    `block px-4 py-3 text-sm font-medium transition-colors ${
      active
        ? "text-amber-400 bg-slate-800"
        : "text-slate-300 hover:text-white hover:bg-slate-800"
    }`;

  const allLinks = [
    { href: "/", label: "すべて", active: !activeCategory },
    ...CATEGORY_ORDER.map((key) => ({
      href: `/?category=${key}`,
      label: CATEGORY_CONFIG[key].label,
      active: activeCategory === key,
    })),
  ];

  const activeLinkLabel = activeCategory ? CATEGORY_CONFIG[activeCategory].label : "すべて";

  return (
    <div className="bg-slate-900 border-b border-slate-700/60">
      {/* Desktop: horizontal scroll tabs (md+) */}
      <div className="hidden md:block max-w-3xl mx-auto px-4 sm:px-6">
        <div className="flex overflow-x-auto scrollbar-hide">
          {allLinks.map(({ href, label, active }) => (
            <Link key={href} href={href} className={tabClass(active)}>
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile: hamburger (md未満) */}
      <div className="md:hidden">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 flex items-center justify-between py-2.5">
          {!menuOpen && (
            <span className="text-sm font-medium text-amber-400">{activeLinkLabel}</span>
          )}
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="p-1.5 text-slate-400 hover:text-white transition-colors"
            aria-label="カテゴリメニューを開く"
          >
            {menuOpen ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-slate-700/60">
            {allLinks.map(({ href, label, active }) => (
              <Link
                key={href}
                href={href}
                className={mobileItemClass(active)}
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
