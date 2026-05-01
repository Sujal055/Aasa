import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-paper flex flex-col items-center justify-center p-8 relative overflow-hidden pattern-bg">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-primary/6 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-secondary/6 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 text-center glass-card p-16 rounded-[48px] max-w-lg w-full"
      >
        <div className="text-7xl mb-6 animate-[float_3s_ease-in-out_infinite]">🐾</div>
        <div className="font-mono text-[10px] font-bold text-primary tracking-[5px] uppercase mb-4">Error 404</div>
        <h1 className="font-serif font-black text-5xl tracking-tight mb-4">Page Not Found</h1>
        <p className="text-white/40 leading-relaxed mb-10">
          This stray page seems to have wandered off. Let's get you back to safety.
        </p>
        <Link
          to="/"
          className="btn-p inline-flex items-center gap-3 !py-4 !px-8 !rounded-2xl"
        >
          <Home size={18} />
          Back to Home
        </Link>
        <div className="mt-8 font-mono text-[10px] text-white/20 uppercase tracking-[3px]">
          AASA · Sangli Municipal Corporation
        </div>
      </motion.div>
    </div>
  );
}
