import React from 'react';
import { motion } from 'framer-motion';

/**
 * ScrollReveal — Reusable wrapper for fade-up on scroll animation.
 * Elements fade in & slide up when scrolled into view,
 * and fade out when scrolled back up (once: false).
 *
 * Props:
 *  - children   : Content to animate
 *  - delay      : Animation delay in seconds (default: 0)
 *  - duration   : Animation duration in seconds (default: 0.6)
 *  - y          : Vertical slide distance in px (default: 50)
 *  - amount     : Fraction of element visible before triggering (default: 0.15)
 *  - className  : Extra Tailwind classes for the wrapper div
 */
export default function ScrollReveal({
  children,
  delay = 0,
  duration = 0.6,
  y = 50,
  amount = 0.15,
  className = '',
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount }}
      transition={{ duration, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
