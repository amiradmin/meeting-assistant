import React, { useState, useEffect } from "react";

const SVGGauge = ({ value = 0, size = 140, label = "" }) => {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    const end = Math.max(0, Math.min(100, Number(value) || 0));
    let animationFrame;

    const animate = () => {
      setAnimatedValue(prev => {
        const delta = (end - prev) * 0.1;
        if (Math.abs(delta) < 0.1) return end;
        return prev + delta;
      });
      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value]);

  const radius = (size / 2) - 10;
  const cx = size / 2;
  const cy = size / 2;
  const startAngle = -135;
  const endAngle = 135;
  const angleRange = endAngle - startAngle;
  const angle = startAngle + (animatedValue / 100) * angleRange;

  const polarToCartesian = (cx, cy, r, aDeg) => {
    const a = (aDeg - 90) * Math.PI / 180;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  };

  const zones = [
    { start: -135, end: -45, color: "#2ecc71" },
    { start: -45, end: 45, color: "#f1c40f" },
    { start: 45, end: 135, color: "#e74c3c" },
  ];

  const zonePaths = zones.map((z, i) => {
    const s = polarToCartesian(cx, cy, radius, z.start);
    const e = polarToCartesian(cx, cy, radius, z.end);
    const largeArc = z.end - z.start > 180 ? 1 : 0;
    return <path key={i} d={`M ${s.x} ${s.y} A ${radius} ${radius} 0 ${largeArc} 1 ${e.x} ${e.y}`} fill="none" stroke={z.color} strokeWidth="10" strokeLinecap="round" />;
  });

  const needleTip = polarToCartesian(cx, cy, radius - 12, angle);
  const needleBaseLeft = polarToCartesian(cx, cy, 6, angle - 90);
  const needleBaseRight = polarToCartesian(cx, cy, 6, angle + 90);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {zonePaths}
      <path d={`M ${needleBaseLeft.x} ${needleBaseLeft.y} L ${needleTip.x} ${needleTip.y} L ${needleBaseRight.x} ${needleBaseRight.y} Z`} fill="#34495e" />
      <circle cx={cx} cy={cy} r="6" fill="#fff" stroke="#34495e" strokeWidth="2" />
      <text x={cx} y={cy + radius * 0.4} textAnchor="middle" fontSize={12} fill="#4b5563">{label}</text>
    </svg>
  );
};

export default SVGGauge;
