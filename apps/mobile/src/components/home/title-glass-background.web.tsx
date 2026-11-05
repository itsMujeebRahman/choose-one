export default function TitleGlassBackground({
  height,
}: {
  target: unknown;
  height: number;
}) {
  return (
    <div
      aria-hidden="true"
      style={{
        pointerEvents: "none",
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height,
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        background: "rgba(255,255,255,0.15)",
        maskImage:
          "linear-gradient(to bottom, black 0%, black 60%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(to bottom, black 0%, black 60%, transparent 100%)",
      }}
    />
  );
}
