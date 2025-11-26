import React from "react";

type AnimatedWaveProps = {
  className?: string;
};

/**
 * AnimatedWave
 * ------------
 * Fondo decorativo con ondas SVG animadas.
 * No usa JS, solo animación propia del SVG.
 */
export const AnimatedWave: React.FC<AnimatedWaveProps> = ({ className }) => {
  return (
    <div
      className={
        "pointer-events-none absolute inset-x-0 -top-24 z-0 overflow-hidden " +
        (className ?? "")
      }
      aria-hidden="true"
    >
      <svg
        className="w-[200%] min-w-[1200px]"
        viewBox="0 0 1440 320"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="waveGradient" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.7" />
            <stop offset="50%" stopColor="#6366f1" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0.8" />
          </linearGradient>
        </defs>

        <path
          fill="url(#waveGradient)"
          d="M0,192L60,170.7C120,149,240,107,360,112C480,117,600,171,720,181.3C840,192,960,160,1080,144C1200,128,1320,128,1380,128L1440,128L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
        >
          <animateTransform
            attributeName="transform"
            type="translate"
            dur="24s"
            values="0 0; -180 10; 0 0"
            keyTimes="0; 0.5; 1"
            repeatCount="indefinite"
          />
        </path>
      </svg>
    </div>
  );
};
