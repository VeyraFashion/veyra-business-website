import { ImageResponse } from "next/og";

export const size = {
  width: 64,
  height: 64,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          background: "#2f50f5",
          color: "#fbfaf6",
          fontFamily: "Arial, Helvetica, sans-serif",
          fontSize: 43,
          fontWeight: 900,
          letterSpacing: "-0.08em",
          lineHeight: 1,
        }}
      >
        <span style={{ transform: "translate(-1px, -1px)" }}>V</span>
        <span
          style={{
            position: "absolute",
            right: 0,
            bottom: 0,
            left: 0,
            height: 7,
            background: "#d9ff63",
          }}
        />
      </div>
    ),
    size,
  );
}
