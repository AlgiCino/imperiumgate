'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface PageTransitionProps {
  children: ReactNode;
}

// Optimized page variants for better performance
const pageVariants = {
  initial: {
    opacity: 0,
    y: 10,
  },
  in: {
    opacity: 1,
    y: 0,
  },
  out: {
    opacity: 0,
    y: -10,
  },
};

// Faster transition settings for better UX
const pageTransition = {
  type: 'tween',
  ease: [0.25, 0.46, 0.45, 0.94], // Custom easing for smoother feel
  duration: 0.3,
};

export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Header always visible; SplashScreen is handled in RootLayout */}
      <Header />
      
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={pathname}
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          transition={pageTransition}
          style={{ 
            minHeight: '100vh'
          }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
      
      <Footer />
    </>
  );
}
