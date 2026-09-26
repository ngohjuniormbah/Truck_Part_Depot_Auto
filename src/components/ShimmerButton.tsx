import React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';

interface ShimmerButtonProps extends HTMLMotionProps<'button'> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'dark';
  className?: string;
  shimmerColor?: string;
}

/**
 * 21st.dev signature Shimmer Button
 * Features a subtle sweeping light beam reflecting across the button surface
 * with crisp micro-interactions and tactile active feedback.
 */
export const ShimmerButton: React.FC<ShimmerButtonProps> = ({
  children,
  variant = 'primary',
  className = '',
  shimmerColor,
  ...props
}) => {
  let baseStyles =
    'relative inline-flex items-center justify-center font-bold text-xs uppercase tracking-wider rounded-lg overflow-hidden transition-all duration-300 cursor-pointer shadow-sm select-none whitespace-nowrap';

  if (variant === 'primary') {
    baseStyles += ' bg-white hover:bg-neutral-100 text-black px-7 py-3.5';
  } else if (variant === 'secondary') {
    baseStyles +=
      ' bg-neutral-900 border border-neutral-700 hover:border-neutral-500 hover:bg-neutral-800 text-white px-7 py-3.5';
  } else {
    baseStyles += ' bg-neutral-950 border border-neutral-800 text-white px-5 py-2.5';
  }

  const defaultSheen =
    variant === 'primary'
      ? 'linear-gradient(90deg, transparent, rgba(0,0,0,0.08), transparent)'
      : 'linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)';

  return (
    <motion.button
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.97 }}
      className={`${baseStyles} ${className}`}
      {...props}
    >
      {/* Sweeping Shimmer Reflection Beam */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 w-full h-full animate-shimmer-sweep"
        style={{
          background: shimmerColor || defaultSheen,
        }}
      />
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </motion.button>
  );
};
