import React from 'react';
import { motion } from 'motion/react';

interface AnimatedBadgeProps {
  text: string;
  dotColor?: string;
  className?: string;
}

/**
 * 21st.dev signature Animated Glowing Badge
 * Features a pulsing radial beacon dot and sleek typography.
 */
export const AnimatedBadge: React.FC<AnimatedBadgeProps> = ({
  text,
  dotColor = 'bg-emerald-400',
  className = '',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900/90 border border-neutral-700/80 shadow-inner backdrop-blur-md text-[11px] font-semibold uppercase tracking-wider text-neutral-200 select-none ${className}`}
    >
      <span className="relative flex h-2 w-2">
        <span
          className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotColor}`}
        />
        <span className={`relative inline-flex rounded-full h-2 w-2 ${dotColor}`} />
      </span>
      <span>{text}</span>
    </motion.div>
  );
};
