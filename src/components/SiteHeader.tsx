"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { SITE_TAGLINE } from "@/lib/config";
import Logo from "@/components/Logo";

export default function SiteHeader() {
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY;
      if (currentY <= 0) {
        setVisible(true);
      } else if (currentY < lastScrollY.current) {
        setVisible(true);
      } else if (currentY > lastScrollY.current) {
        setVisible(false);
      }
      lastScrollY.current = currentY;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className="bg-slate-900 sticky top-0 z-40 transition-transform duration-300"
      style={{ transform: visible ? "translateY(0)" : "translateY(-100%)" }}
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-5 sm:pt-6 pb-4">
        <Link href="/" className="inline-block">
          <div>
            <Logo size="lg" variant="dark" />
          </div>
          <p className="text-sm text-slate-400 mt-3 tracking-wide">
            {SITE_TAGLINE}
          </p>
        </Link>
      </div>
    </header>
  );
}
