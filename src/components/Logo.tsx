import type { CSSProperties } from "react";

type Props = {
  size?: "lg" | "md" | "sm";
  variant?: "dark" | "light";
};

const fontSizes: Record<NonNullable<Props["size"]>, string> = {
  lg: "clamp(1.5rem, 4.5vw, 1.875rem)",
  md: "1rem",
  sm: "0.875rem",
};

export default function Logo({ size = "lg", variant = "dark" }: Props) {
  const fontSize = fontSizes[size];
  const hokeColor = variant === "dark" ? "#ffffff" : "#1a1a1a";
  const textStroke = `0.03em ${hokeColor}`;

  const base: CSSProperties = {
    fontFamily: "var(--font-dot-gothic), monospace",
    fontWeight: 400,
    lineHeight: 1,
    color: hokeColor,
    WebkitTextStroke: textStroke,
  };

  return (
    <span
      role="img"
      aria-label="ポケトレ板"
      style={{
        display: "inline-flex",
        alignItems: "baseline",
        fontSize,
        letterSpacing: "0.01em",
        userSelect: "none",
      }}
    >
      {/* ポ: ホ + Pokéball half-dakuten */}
      <span
        style={{
          ...base,
          position: "relative",
          display: "inline-block",
          paddingRight: "0.22em",
        }}
      >
        ホ
        <svg
          aria-hidden="true"
          style={{
            position: "absolute",
            top: "-0.08em",
            right: "0.1em",
            width: "0.28em",
            height: "0.28em",
            overflow: "visible",
          }}
          viewBox="0 0 12 12"
        >
          {/* Top half: red */}
          <path d="M0.5,6 A5.5,5.5,0,0,1,11.5,6 Z" fill="#E84C3D" />
          {/* Bottom half: white */}
          <path d="M0.5,6 A5.5,5.5,0,0,0,11.5,6 Z" fill="#ffffff" />
          {/* Outer border */}
          <circle cx="6" cy="6" r="5.5" fill="none" stroke="#1a1a1a" strokeWidth="1" />
          {/* Center divider */}
          <line x1="0.5" y1="6" x2="11.5" y2="6" stroke="#1a1a1a" strokeWidth="1" />
          {/* Center button */}
          <circle cx="6" cy="6" r="2.2" fill="#1a1a1a" />
          <circle cx="6" cy="6" r="1.2" fill="#ffffff" />
        </svg>
      </span>

      {/* ケ */}
      <span style={base}>ケ</span>

      {/* トレ: solid yellow */}
      <span
        style={{
          fontFamily: "var(--font-dot-gothic), monospace",
          fontWeight: 400,
          lineHeight: 1,
          color: "#FFD23F",
          WebkitTextStroke: "0.03em #FFD23F",
        }}
      >
        トレ
      </span>

      {/* 板: small, gray */}
      <span
        style={{
          fontFamily: "var(--font-dot-gothic), monospace",
          fontWeight: 400,
          lineHeight: 1,
          color: "#bbbbbb",
          fontSize: "0.6em",
          verticalAlign: "0.2em",
          marginLeft: "0.05em",
        }}
      >
        板
      </span>
    </span>
  );
}
