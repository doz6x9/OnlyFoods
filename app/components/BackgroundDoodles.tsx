'use client';

import { motion } from 'framer-motion';

export default function BackgroundDoodles() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden opacity-30">
      {/* Circle */}
      <motion.svg
        className="absolute top-20 left-[10%] text-orange-200"
        width="100"
        height="100"
        viewBox="0 0 100 100"
        animate={{
          y: [0, -20, 0],
          rotate: [0, 10, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <circle cx="50" cy="50" r="40" fill="currentColor" />
      </motion.svg>

      {/* Squiggle */}
      <motion.svg
        className="absolute bottom-40 right-[15%] text-blue-200"
        width="120"
        height="120"
        viewBox="0 0 100 100"
        animate={{
          y: [0, 20, 0],
          rotate: [0, -5, 0],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      >
        <path
          d="M10,50 Q30,20 50,50 T90,50"
          stroke="currentColor"
          strokeWidth="12"
          fill="none"
          strokeLinecap="round"
        />
      </motion.svg>

      {/* Triangle */}
      <motion.svg
        className="absolute top-1/3 right-[5%] text-red-100"
        width="80"
        height="80"
        viewBox="0 0 100 100"
        animate={{
          rotate: [0, 360],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        <polygon points="50,15 90,85 10,85" fill="currentColor" />
      </motion.svg>

      {/* Donut */}
      <motion.svg
        className="absolute bottom-20 left-[20%] text-yellow-100"
        width="150"
        height="150"
        viewBox="0 0 100 100"
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="15" fill="none" />
      </motion.svg>
    </div>
  );
}
