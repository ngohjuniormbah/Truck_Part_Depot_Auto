import React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';

interface FadeInProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  duration?: number;
  className?: string;
}

/**
 * 21st.dev signature smooth viewport Fade-In component
 */
export const FadeIn: React.FC<FadeInProps> = ({
  children,
  delay = 0,
  direction = 'up',
  duration = 0.5,
  className = '',
  ...props
}) => {
  const getOffset = () => {
    switch (direction) {
      case 'up':
        return { y: 20, x: 0 };
      case 'down':
        return { y: -20, x: 0 };
      case 'left':
        return { y: 0, x: 20 };
      case 'right':
        return { y: 0, x: -20 };
      default:
        return { y: 0, x: 0 };
    }
  };

  const offset = getOffset();

  return (
    <motion.div
      initial={{ opacity: 0, ...offset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};
