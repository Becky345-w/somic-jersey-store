import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';
import { Shirt } from 'lucide-react';

export default function WelcomeScreen() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-blue-600 text-white"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5, type: 'spring' }}
            className="flex flex-col items-center"
          >
            <div className="bg-white p-6 rounded-3xl mb-6 shadow-2xl flex items-center justify-center">
              <motion.span 
                initial={{ rotate: -180, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ 
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                  delay: 0.3
                }}
                className="text-6xl font-black text-blue-600 leading-none select-none"
              >
                S
              </motion.span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-center px-4">
              Welcome to <br/> Somic's Jersey Store
            </h1>
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ delay: 0.8, duration: 1 }}
              className="h-1 bg-white mt-8 rounded-full max-w-xs"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
