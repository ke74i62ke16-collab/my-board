import { ImageResponse } from "next/og";

export const alt = "ポケトレ板 | ポケモンカード投資・コレクター掲示板";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// ロゴ + サブタイトルで使用する全文字
const CHARS = "ホケトレ板ポモンカードコタ掲示投資ー・";

async function loadFont() {
  try {
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=DotGothic16&display=swap&text=${encodeURIComponent(CHARS)}`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      }
    ).then((r) => r.text());

    const urls = [...css.matchAll(/src:\s*url\((.+?)\)\s*format/g)].map((m) => m[1]);
    const buffers = await Promise.all(urls.map((url) => fetch(url).then((r) => r.arrayBuffer())));
    return buffers.map((data) => ({ name: "DotGothic16", data, weight: 400 as const }));
  } catch {
    return [];
  }
}

export default async function Image() {
  const fonts = await loadFont();
  const F = "DotGothic16";
  const fs = 120; // base font size (px)

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#0f172a",
        }}
      >
        {/* オレンジのアクセントライン */}
        <div style={{ width: "100%", height: 8, backgroundColor: "#D85A30" }} />

        {/* メインコンテンツ */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 36,
          }}
        >
          {/* ロゴ: alignItems:"flex-end" + 板のmarginBottom で baseline に近似 */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              fontSize: fs,
              letterSpacing: "0.01em",
              lineHeight: 1,
            }}
          >
            {/* ポ = ホ + Pokéball半濁点SVG */}
            <div
              style={{
                position: "relative",
                display: "flex",
                paddingRight: Math.round(fs * 0.22),
              }}
            >
              <span style={{ color: "#ffffff", fontFamily: F, fontWeight: 400, lineHeight: 1 }}>
                ホ
              </span>
              <svg
                style={{
                  position: "absolute",
                  top: -Math.round(fs * 0.08),
                  right: Math.round(fs * 0.1),
                  width: Math.round(fs * 0.28),
                  height: Math.round(fs * 0.28),
                }}
                viewBox="0 0 12 12"
              >
                {/* 上半分: 赤 */}
                <path d="M0.5,6 A5.5,5.5,0,0,1,11.5,6 Z" fill="#E84C3D" />
                {/* 下半分: 白 */}
                <path d="M0.5,6 A5.5,5.5,0,0,0,11.5,6 Z" fill="#ffffff" />
                {/* 外枠 */}
                <circle cx="6" cy="6" r="5.5" fill="none" stroke="#1a1a1a" strokeWidth="1" />
                {/* 中央の仕切り線 (lineタグはSatori非対応のためrectで代替) */}
                <rect x="0.5" y="5.5" width="11" height="1" fill="#1a1a1a" />
                {/* 中央ボタン */}
                <circle cx="6" cy="6" r="2.2" fill="#1a1a1a" />
                <circle cx="6" cy="6" r="1.2" fill="#ffffff" />
              </svg>
            </div>

            {/* ケ: 白 */}
            <span style={{ color: "#ffffff", fontFamily: F, fontWeight: 400, lineHeight: 1 }}>
              ケ
            </span>

            {/* トレ: 黄色 */}
            <span style={{ color: "#FFD23F", fontFamily: F, fontWeight: 400, lineHeight: 1 }}>
              トレ
            </span>

            {/* 板: 小さめ・グレー。verticalAlign:0.2em の代わりに marginBottom で上方向にシフト */}
            <span
              style={{
                color: "#bbbbbb",
                fontFamily: F,
                fontWeight: 400,
                lineHeight: 1,
                fontSize: Math.round(fs * 0.6),
                marginLeft: Math.round(fs * 0.05),
                marginBottom: Math.round(fs * 0.6 * 0.2),
              }}
            >
              板
            </span>
          </div>

          {/* サブタイトル */}
          <div style={{ fontSize: 36, color: "#94a3b8", fontFamily: F }}>
            ポケモンカード投資・コレクター掲示板
          </div>
        </div>

        {/* ドメイン */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            paddingBottom: 52,
            fontSize: 26,
            color: "#475569",
          }}
        >
          poketore-bbs.com
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}
