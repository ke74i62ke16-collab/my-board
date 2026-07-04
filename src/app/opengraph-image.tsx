import { ImageResponse } from "next/og";

export const alt = "ポケトレ板 | ポケモンカード投資・コレクター掲示板";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
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
            padding: "0 100px",
          }}
        >
          <div
            style={{
              fontSize: 100,
              fontWeight: 700,
              color: "#ffffff",
              marginBottom: 28,
              letterSpacing: "-0.01em",
            }}
          >
            ポケトレ板
          </div>
          <div
            style={{
              fontSize: 38,
              fontWeight: 400,
              color: "#94a3b8",
            }}
          >
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
    { ...size }
  );
}
