export default function AnnouncementBar() {
  return (
    <div className="border-b border-zinc-900/80 bg-zinc-950 px-4 sm:px-6 lg:px-8 py-2.5 text-[11px] font-mono uppercase tracking-widest text-zinc-400 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-zinc-200">Live Auction Protocol 2026</span>
      </div>
      <div className="hidden sm:flex items-center gap-6 text-zinc-500">
        <span className="hover:text-zinc-300 transition-colors">CURATED LOTS</span>
        <span>·</span>
        <span className="hover:text-zinc-300 transition-colors">REAL-TIME SETTLEMENT</span>
        <span>·</span>
        <span className="hover:text-zinc-300 transition-colors">VERIFIED ORIGIN</span>
      </div>
      <span className="text-zinc-400 font-semibold">LOTS UPDATED LIVE</span>
    </div>
  );
}
