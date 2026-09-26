import React, { useRef, useState } from 'react';
import { motion, HTMLMotionProps } from 'motion/react';

interface SpotlightCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
  isLight?: boolean;
}

/**
 * 21st.dev signature Spotlight Card
 * Captures mouse coordinates to project an interactive radial light sheen
 * across the card border and surface with smooth spring lift.
 */
export const SpotlightCard: React.FC<SpotlightCardProps> = ({
  children,
  className = '',
  spotlightColor,
  isLight = false,
  ...props
}) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseEnter = () => {
    setOpacity(1);
  };

  const handleMouseLeave = () => {
    setOpacity(0);
  };

  const defaultColor = isLight
    ? 'rgba(0, 0, 0, 0.05)'
    : 'rgba(255, 255, 255, 0.08)';

  return (
    <motion.div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      whileHover={{ y: -4, transition: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] } }}
      className={`relative overflow-hidden group transition-shadow duration-300 ${className}`}
      {...props}
    >
      {/* 21st.dev Radial Spotlight Layer */}
      <div
        className="pointer-events-none absolute -inset-px rounded-[inherit] transition-opacity duration-300 z-10"
        style={{
          opacity,
          background: `radial-gradient(450px circle at ${position.x}px ${position.y}px, ${spotlightColor || defaultColor}, transparent 60%)`,
        }}
      />
      {children}
    </motion.div>
  );
};
