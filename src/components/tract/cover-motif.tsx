import type { CoverMotif as Motif } from "@/lib/types";

/**
 * Generative cover artwork. Each motif is abstract geometry — light, depth,
 * strata, movement — standing in until commissioned artwork exists.
 * Drawn in a 300×400 box and scaled to fill its cover.
 */

const range = (count: number): number[] => Array.from({ length: count }, (_, index) => index);

function motifShapes(motif: Motif): React.ReactNode {
  switch (motif) {
    case "rings":
      return range(9).map((i) => (
        <circle key={i} cx={210} cy={150} r={22 + i * 26} opacity={1 - i * 0.1} />
      ));

    case "rays":
      return range(25).map((i) => {
        const angle = (Math.PI * (i + 0.5)) / 25;
        return (
          <line
            key={i}
            x1={150}
            y1={-10}
            x2={Number((150 - Math.cos(angle) * 520).toFixed(2))}
            y2={Number((-10 + Math.sin(angle) * 520).toFixed(2))}
            opacity={i % 2 ? 0.9 : 0.4}
          />
        );
      });

    case "strata":
      return range(11).map((i) => (
        <path
          key={i}
          d={`M-10 ${70 + i * 30} C 60 ${50 + i * 30 + (i % 3) * 9}, 130 ${96 + i * 30 - (i % 2) * 14}, 200 ${72 + i * 30} S 290 ${60 + i * 30 + (i % 4) * 6}, 320 ${78 + i * 30}`}
          opacity={0.35 + (i % 4) * 0.2}
        />
      ));

    case "arcs":
      return range(8).map((i) => (
        <path
          key={i}
          d={`M ${40 + i * 14} 400 V ${210 + i * 12} a ${110 - i * 14} ${110 - i * 14} 0 0 1 ${220 - i * 28} 0 V 400`}
          opacity={1 - i * 0.1}
        />
      ));

    case "waves":
      return range(12).map((i) => (
        <path
          key={i}
          d={`M-20 ${40 + i * 26} q 45 -26 90 0 t 90 0 t 90 0 t 90 0`}
          opacity={0.25 + ((i * 3) % 5) * 0.16}
        />
      ));

    case "eclipse":
      return (
        <>
          <circle cx={170} cy={150} r={96} />
          <circle cx={205} cy={132} r={96} fill="currentColor" fillOpacity={0.16} stroke="none" />
          {range(5).map((i) => (
            <circle key={i} cx={170} cy={150} r={112 + i * 20} opacity={0.5 - i * 0.09} />
          ))}
        </>
      );

    case "steps":
      return range(8).map((i) => (
        <rect
          key={i}
          x={60 + i * 14}
          y={96 + i * 34}
          width={Math.max(180 - i * 28, 8)}
          height={34}
          opacity={0.3 + i * 0.09}
          transform={`rotate(${i * 1.6} 150 ${96 + i * 34})`}
        />
      ));

    case "embers":
      return range(70).map((i) => {
        // Deterministic scatter, denser and brighter toward the base.
        const x = (i * 97) % 300;
        const y = 400 - (((i * 53) % 100) / 100) ** 1.7 * 380;
        const size = 1.2 + ((i * 31) % 7) * 0.55;
        return (
          <circle
            key={i}
            cx={x}
            cy={Number(y.toFixed(1))}
            r={Number(size.toFixed(2))}
            fill="currentColor"
            stroke="none"
            opacity={Number((0.2 + (y / 400) * 0.75).toFixed(2))}
          />
        );
      });

    case "orbit":
      return (
        <>
          <circle cx={120} cy={160} r={92} />
          <circle cx={190} cy={160} r={92} />
          <circle cx={120} cy={160} r={58} opacity={0.5} />
          <circle cx={190} cy={160} r={58} opacity={0.5} />
          <ellipse cx={155} cy={160} rx={150} ry={34} opacity={0.4} />
        </>
      );

    case "frames":
      return range(8).map((i) => (
        <rect
          key={i}
          x={34 + i * 15}
          y={30 + i * 17}
          width={232 - i * 30}
          height={300 - i * 34}
          rx={2}
          opacity={1 - i * 0.11}
        />
      ));

    case "horizon":
      return (
        <>
          {range(6).map((i) => (
            <path key={i} d={`M ${50 - i * 22} 236 a ${100 + i * 22} ${100 + i * 22} 0 0 1 ${200 + i * 44} 0`} opacity={1 - i * 0.15} />
          ))}
          {range(9).map((i) => (
            <line key={`l${i}`} x1={-10} x2={310} y1={236 + i * i * 2.4} y2={236 + i * i * 2.4} opacity={0.85 - i * 0.08} />
          ))}
        </>
      );

    case "divide":
      return (
        <>
          <path d="M-10 300 L 310 60 V 410 H -10 Z" fill="currentColor" fillOpacity={0.1} stroke="none" />
          {range(10).map((i) => (
            <line key={i} x1={-10} y1={300 - i * 30} x2={310} y2={60 - i * 30} opacity={0.9 - i * 0.08} />
          ))}
        </>
      );
  }
}

interface CoverMotifProps {
  motif: Motif;
  color: string;
  className?: string;
}

export function CoverMotif({ motif, color, className }: CoverMotifProps) {
  return (
    <svg
      viewBox="0 0 300 400"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
      className={className}
      style={{ color }}
      fill="none"
      stroke="currentColor"
      strokeWidth={1}
    >
      {motifShapes(motif)}
    </svg>
  );
}
