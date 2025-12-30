import { useState, useEffect } from 'react';

export default function LoadingScreen({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Initialisiere...');

  useEffect(() => {
    // Predefined jump points with delays (total ~4 seconds)
    const steps = [
      { progress: 12, status: 'Initialisiere...', delay: 300 },
      { progress: 28, status: 'Verbinde mit LIVAG Servern...', delay: 600 },
      { progress: 35, status: 'Verbinde mit LIVAG Servern...', delay: 400 },
      { progress: 52, status: 'Lade Benutzerdaten...', delay: 500 },
      { progress: 58, status: 'Lade Benutzerdaten...', delay: 350 },
      { progress: 71, status: 'Synchronisiere Deals...', delay: 450 },
      { progress: 79, status: 'Synchronisiere Deals...', delay: 400 },
      { progress: 84, status: 'Synchronisiere Deals...', delay: 300 },
      { progress: 93, status: 'Abschliessen...', delay: 400 },
      { progress: 100, status: 'Abschliessen...', delay: 300 },
    ];

    let currentStep = 0;

    const runStep = () => {
      if (currentStep >= steps.length) {
        setTimeout(() => onComplete(), 200);
        return;
      }

      const step = steps[currentStep];
      setProgress(step.progress);
      setStatus(step.status);
      currentStep++;

      setTimeout(runStep, step.delay);
    };

    // Start after a brief initial delay
    setTimeout(runStep, 200);

    return () => {};
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
            className="h-full bg-gradient-to-r from-bronze to-[#C9A066]"
            style={{ width: `${progress}%`, transition: 'width 0.15s ease-out' }}
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
