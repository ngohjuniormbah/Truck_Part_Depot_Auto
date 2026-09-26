import React, { useEffect, useRef, useState } from 'react';
import { useInView } from 'motion/react';

interface NumberTickerProps {
  value: number;
  direction?: 'up' | 'down';
  delay?: number; // seconds
  decimalPlaces?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  duration?: number; // ms
}

/**
 * 21st.dev signature Number Ticker component
 * Interpolates numeric values with ease-out cubic curve when scrolled into view.
 */
export const NumberTicker: React.FC<NumberTickerProps> = ({
  value,
  direction = 'up',
  delay = 0,
  decimalPlaces = 0,
  prefix = '',
  suffix = '',
  className = '',
  duration = 1600,
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const [displayValue, setDisplayValue] = useState(direction === 'down' ? value : 0);

  useEffect(() => {
    if (!isInView) return;

    let startTimestamp: number | null = null;
    let animationFrameId: number;

    const timeout = setTimeout(() => {
      const startValue = direction === 'down' ? value : 0;
      const targetValue = direction === 'down' ? 0 : value;

      const step = (timestamp: number) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        // easeOutQuart
        const ease = 1 - Math.pow(1 - progress, 4);
        const current = startValue + (targetValue - startValue) * ease;
        setDisplayValue(current);

        if (progress < 1) {
          animationFrameId = requestAnimationFrame(step);
        } else {
          setDisplayValue(targetValue);
        }
      };

      animationFrameId = requestAnimationFrame(step);
    }, delay * 1000);

    return () => {
      clearTimeout(timeout);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isInView, value, direction, delay, duration]);

  const formatted = displayValue.toLocaleString(undefined, {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  });

  return (
    <span ref={ref} className={`tabular-nums font-bold ${className}`}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
};
