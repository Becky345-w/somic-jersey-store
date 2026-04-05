import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export default function Hero() {
  return (
    <div className="relative bg-gray-900 overflow-hidden">
      <div className="absolute inset-0">
        <motion.img
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.4 }}
          transition={{ duration: 2, ease: "easeOut" }}
          src="https://fastly.picsum.photos/id/694/1200/600.jpg?hmac=0Hv_xR-nhR0FwpcIe06vHD8mSN4iuM3vDqD4ZIF4t40"
          alt="Football stadium"
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/80 to-transparent" />
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="max-w-2xl">
          <div className="inline-block bg-[#1a0b5e] text-white text-[8px] font-bold px-2 py-1 rounded-sm mb-6 uppercase tracking-widest">
            Official Store
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tighter mb-4 uppercase leading-[0.9] italic">
            Football <br />
            <span className="text-white">Season Kits</span>
          </h1>
          <p className="text-gray-300 text-lg md:text-xl mb-8 max-w-lg font-medium">
            Premium Authentic Football Jerseys. <br className="hidden md:block" />
            Nationwide Waybill & Fast Delivery.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="#categories"
              className="inline-flex items-center justify-center px-6 py-3 text-base font-black rounded-md text-white bg-[#1a0b5e] hover:bg-[#2a1b6e] transition-all uppercase tracking-wider shadow-lg"
            >
              Shop Now
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
