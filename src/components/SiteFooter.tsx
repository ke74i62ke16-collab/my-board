import Link from "next/link";
import Logo from "@/components/Logo";

function XIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117Z" />
    </svg>
  );
}

export default function SiteFooter() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://poketore-bbs.com";
  const encodedUrl = encodeURIComponent(siteUrl);
  const encodedTitle = encodeURIComponent("ポケトレ板 | ポケモンカード投資・コレクター掲示板");
  const xHref = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
  const lineHref = `https://social-plugins.line.me/lineit/share?url=${encodedUrl}`;

  return (
    <footer className="mt-auto bg-slate-900 border-t border-slate-700/60">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-center sm:text-left">
            <Logo size="md" variant="dark" />
            <p className="text-xs text-slate-500 mt-2">© 2026 ポケトレ板</p>
          </div>
          <div className="flex items-center gap-4 flex-wrap justify-center sm:justify-end">
            <Link
              href="/terms"
              className="text-sm text-slate-400 hover:text-amber-400 transition-colors whitespace-nowrap"
            >
              利用規約
            </Link>
            <Link
              href="/privacy"
              className="text-sm text-slate-400 hover:text-amber-400 transition-colors whitespace-nowrap"
            >
              プライバシーポリシー
            </Link>
            <Link
              href="/contact"
              className="text-sm text-slate-400 hover:text-amber-400 transition-colors whitespace-nowrap"
            >
              お問い合わせ
            </Link>
            <a
              href={xHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Xでシェア"
              className="text-slate-400 hover:text-slate-200 transition-colors"
            >
              <XIcon />
            </a>
            <a
              href={lineHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LINEでシェア"
              className="transition-opacity hover:opacity-75"
            >
              <img
                src="/line-icon.svg"
                alt="LINEでシェア"
                width={20}
                height={20}
                style={{ borderRadius: "4px", filter: "grayscale(100%) brightness(0.8)" }}
              />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
