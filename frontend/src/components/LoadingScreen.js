import { useState, useEffect } from 'react';

export default function LoadingScreen({ onComplete }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => onComplete(), 300);
          return 100;
        }
        // Faster at start, slower near end
        const increment = prev < 70 ? Math.random() * 15 + 5 : Math.random() * 5 + 1;
        return Math.min(prev + increment, 100);
      });
    }, 100);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-slate-900 flex flex-col items-center justify-center z-[9999]">
      {/* Logo */}
      <img 
        src="https://customer-assets.emergentagent.com/job_9070e371-71fc-4a23-b411-e6a30412bc7d/artifacts/04io5yv7_blum-logo.svg"
        alt="Blum"
        className="h-16 w-auto mb-12 opacity-90"
      />
      
      {/* Connection Text */}
      <div className="text-center mb-8">
        <h2 className="text-white text-xl font-medium tracking-wider mb-2">
          CONNECTING TO LIVAG SERVERS
        </h2>
        <div className="flex items-center justify-center gap-2">
          <div className="w-2 h-2 bg-bronze rounded-full animate-pulse" />
          <span className="text-slate-400 text-sm">Establishing secure connection...</span>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="w-80">
        <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-bronze to-[#C9A066] transition-all duration-100 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-slate-500 text-xs">Loading...</span>
          <span className="text-bronze text-xs font-mono">{Math.round(progress)}%</span>
        </div>
      </div>
    </div>
  );
}
