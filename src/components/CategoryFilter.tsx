"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { CATEGORY_CONFIG, CATEGORY_ORDER } from "@/lib/categories";
import type { Category } from "@/lib/types";

type Props = {
  activeCategory: Category | null;
};

export default function CategoryFilter({ activeCategory }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const label = activeCategory
    ? CATEGORY_CONFIG[activeCategory].label
    : "すべて";

  const badgeClass = activeCategory
    ? CATEGORY_CONFIG[activeCategory].badgeClass
    : "bg-slate-900 text-white";

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border border-transparent transition-opacity hover:opacity-80 ${badgeClass}`}
      >
        {label}
        <span
          className={`text-[10px] transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        >
          ▼
        </span>
      </button>

      {open && (
        <div className="absolute top-full mt-1 left-0 bg-white border border-gray-200 rounded-xl shadow-lg z-50 min-w-52 overflow-hidden">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className={`block px-4 py-3 text-sm border-b border-gray-100 transition-colors hover:bg-gray-50 ${
              !activeCategory ? "font-semibold text-slate-900 bg-gray-50" : "text-gray-600"
            }`}
          >
            すべて
          </Link>
          {CATEGORY_ORDER.map((key) => (
            <Link
              key={key}
              href={`/?category=${key}`}
              onClick={() => setOpen(false)}
              className={`block px-4 py-3 text-sm border-b border-gray-100 last:border-b-0 transition-colors hover:bg-gray-50 ${
                activeCategory === key
                  ? "font-semibold text-slate-900 bg-gray-50"
                  : "text-gray-600"
              }`}
            >
              {CATEGORY_CONFIG[key].label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
