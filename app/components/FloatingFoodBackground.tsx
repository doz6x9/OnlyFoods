'use client';

import { motion } from 'framer-motion';
import { Pizza, Coffee, Utensils, Croissant, Carrot, Sandwich, IceCream } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function FloatingFoodBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const icons = [
    { Icon: Pizza, color: 'text-orange-200' },
    { Icon: Coffee, color: 'text-amber-200' },
    { Icon: Utensils, color: 'text-slate-200' },
    { Icon: Croissant, color: 'text-yellow-200' },
    { Icon: Carrot, color: 'text-orange-300' },
    { Icon: Sandwich, color: 'text-green-200' },
    { Icon: IceCream, color: 'text-pink-200' },
  ];

  // Generate random positions
  const items = Array.from({ length: 15 }).map((_, i) => {
    const IconData = icons[i % icons.length];
    return {
      id: i,
      Icon: IconData.Icon,
      color: IconData.color,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      duration: 15 + Math.random() * 20,
      delay: Math.random() * 5,
    };
  });

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {items.map((item) => (
        <motion.div
          key={item.id}
          className={`absolute ${item.color} opacity-20`}
          style={{ top: item.top, left: item.left }}
          animate={{
            y: [0, -50, 0],
            rotate: [0, 20, -20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: item.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: item.delay,
          }}
        >
          <item.Icon size={40 + Math.random() * 40} />
        </motion.div>
      ))}
    </div>
  );
}
