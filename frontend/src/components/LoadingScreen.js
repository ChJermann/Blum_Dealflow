import { useState, useEffect } from 'react';

export default function LoadingScreen({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Initialisiere...');

  useEffect(() => {
    const statuses = [
      { at: 0, text: 'Initialisiere...' },
      { at: 15, text: 'Verbinde mit LIVAG Servern...' },
      { at: 35, text: 'Lade Benutzerdaten...' },
      { at: 60, text: 'Synchronisiere Deals...' },
      { at: 85, text: 'Abschliessen...' },
    ];

    // Total duration: 4 seconds = 4000ms
    // We'll update every 50ms, so 80 updates total
    // Each update adds ~1.25% progress
    const totalDuration = 4000;
    const updateInterval = 50;
    const totalUpdates = totalDuration / updateInterval;
    const progressPerUpdate = 100 / totalUpdates;

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => onComplete(), 200);
          return 100;
        }
        
        const newProgress = Math.min(prev + progressPerUpdate, 100);
        
        // Update status text
        for (let i = statuses.length - 1; i >= 0; i--) {
          if (newProgress >= statuses[i].at) {
            setStatus(statuses[i].text);
            break;
          }
        }
        
        return newProgress;
      });
    }, updateInterval);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-slate-900 flex flex-col items-center justify-center z-[99999]">
      {/* Logo */}
      <img 
        src="https://customer-assets.emergentagent.com/job_9070e371-71fc-4a23-b411-e6a30412bc7d/artifacts/04io5yv7_blum-logo.svg"
        alt="Blum"
        className="h-20 w-auto mb-16 opacity-90"
      />
      
      {/* Connection Text */}
      <div className="text-center mb-10">
        <h2 className="text-white text-2xl font-medium tracking-widest mb-3">
          CONNECTING TO LIVAG SERVERS
        </h2>
        <div className="flex items-center justify-center gap-2">
          <div className="w-2 h-2 bg-bronze rounded-full animate-pulse" />
          <span className="text-slate-400 text-sm">{status}</span>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="w-96">
        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-bronze to-[#C9A066] transition-all duration-50 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-3">
          <span className="text-slate-500 text-sm">Establishing secure connection...</span>
          <span className="text-bronze text-sm font-mono font-medium">{Math.round(progress)}%</span>
        </div>
      </div>
    </div>
  );
}
