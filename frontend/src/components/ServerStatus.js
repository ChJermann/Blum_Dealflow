export default function ServerStatus() {
  return (
    <div className="fixed bottom-4 left-4 flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-slate-200 z-40">
      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
      <span className="text-xs text-slate-600 font-medium">Connection to LIVAG Servers</span>
    </div>
  );
}
