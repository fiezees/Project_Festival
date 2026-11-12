import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * PageTransition — wraps a page with fade + slide-up enter / slide-down exit.
 * Usage: <PageTransition pageKey={activePage}> ... </PageTransition>
 * AnimatePresence must be the parent so exit animations fire properly.
 */
export default function PageTransition({ pageKey, children }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pageKey}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.35, ease: 'easeInOut' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
