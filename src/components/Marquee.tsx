import React from 'react';

interface MarqueeProps {
  children: React.ReactNode;
  direction?: 'left' | 'right';
  speed?: number; // seconds for full cycle
  pauseOnHover?: boolean;
  className?: string;
}

/**
 * 21st.dev signature infinite scrolling Marquee ticker
 * Features hardware-accelerated continuous scrolling, pause-on-hover,
 * and delicate linear fade masks at both edges.
 */
export const Marquee: React.FC<MarqueeProps> = ({
  children,
  direction = 'left',
  speed = 28,
  pauseOnHover = true,
  className = '',
}) => {
  return (
    <div
      className={`group relative flex overflow-hidden select-none [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] ${className}`}
    >
      <div
        className={`flex min-w-full shrink-0 items-center justify-around gap-6 ${
          direction === 'left' ? 'animate-marquee-left' : 'animate-marquee-right'
        } ${pauseOnHover ? 'group-hover:[animation-play-state:paused]' : ''}`}
        style={{ animationDuration: `${speed}s` }}
      >
        {children}
      </div>
      <div
        aria-hidden="true"
        className={`flex min-w-full shrink-0 items-center justify-around gap-6 ${
          direction === 'left' ? 'animate-marquee-left' : 'animate-marquee-right'
        } ${pauseOnHover ? 'group-hover:[animation-play-state:paused]' : ''}`}
        style={{ animationDuration: `${speed}s` }}
      >
        {children}
      </div>
    </div>
  );
};
