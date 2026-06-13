function generatePaths({ position, count }) {
  return Array.from({ length: count }, (_, i) => {
    const offset = i * 5 * position;
    return {
      d: `M-${380 - offset} -${189 + i * 6}C-${380 - offset} -${189 + i * 6} -${312 - offset} ${216 - i * 6} ${152 - offset} ${343 - i * 6}C${616 - offset} ${470 - i * 6} ${684 - offset} ${875 - i * 6} ${684 - offset} ${875 - i * 6}`,
      width: 0.5 + i * 0.03,
      opacity: 0.1 + i * 0.03,
    };
  });
}

export default function FloatingPaths({ position = 1, count = 16 }) {
  const paths = generatePaths({ position, count });

  return (
    <div className="fp-abs">
      <svg
        className="w-full h-full"
        viewBox="0 0 800 900"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        {paths.map((p, i) => (
          <path
            key={i}
            d={p.d}
            stroke="currentColor"
            strokeWidth={p.width}
            strokeOpacity={p.opacity}
            fill="none"
            className="fp-path"
            style={{ animationDelay: `${i * 0.5}s` }}
          />
        ))}
      </svg>
    </div>
  );
}
