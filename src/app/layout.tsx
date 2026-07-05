import type { Metadata } from "next";
import { Geist, Geist_Mono, DotGothic16 } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const dotGothic16 = DotGothic16({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dot-gothic",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://poketore-bbs.com";
const description =
  "ポケモンカードの投資・相場・コレクション情報を共有する匿名掲示板。高騰情報、買取価格、開封報告など気軽に投稿できます。";

export const metadata: Metadata = {
  title: "ポケトレ板 | ポケモンカード投資・コレクター掲示板",
  description,
  openGraph: {
    title: "ポケトレ板",
    description,
    type: "website",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "ポケトレ板",
    description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} ${dotGothic16.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-PHHSDNTDDV"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-PHHSDNTDDV');
          `}
        </Script>
        {children}
      </body>
    </html>
  );
}
