import React, { useEffect, useState } from 'react';

interface AnimatedCheckProps {
    size?: number;
    color?: string; // Color of the circle and check
    delay?: number; // Delay in ms before starting animation
}

const AnimatedCheck: React.FC<AnimatedCheckProps> = ({
    size = 80,
    color = 'var(--glow-brand)',
    delay = 0
}) => {
    const [start, setStart] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setStart(true), delay);
        return () => clearTimeout(timer);
    }, [delay]);

    return (
        <div
            className={`relative flex items-center justify-center transition-opacity duration-500 ${start ? 'opacity-100' : 'opacity-0'}`}
            style={{ width: size, height: size }}
        >
            <svg
                className="checkmark"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 52 52"
                style={{ width: size, height: size }}
            >
                <circle
                    className="checkmark__circle"
                    cx="26"
                    cy="26"
                    r="25"
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                />
                <path
                    className="checkmark__check"
                    fill="none"
                    d="M14.1 27.2l7.1 7.2 16.7-16.8"
                    stroke={color}
                    strokeWidth="3"
                />
            </svg>
            <style>{`
        .checkmark__circle {
          stroke-dasharray: 166;
          stroke-dashoffset: 166;
          stroke-width: 2;
          stroke-miterlimit: 10;
          fill: none;
          animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
        }
        .checkmark__check {
          transform-origin: 50% 50%;
          stroke-dasharray: 48;
          stroke-dashoffset: 48;
          animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.6s forwards;
        }
        @keyframes stroke {
          100% {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
        </div>
    );
};

export default AnimatedCheck;
