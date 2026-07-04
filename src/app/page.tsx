import Link from 'next/link'

export default function Home() {
  const newSessionId = Math.random().toString(36).substring(2, 9)

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Rain background */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-40 animate-rain"
        style={{
          backgroundImage: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0) 100%)',
          backgroundSize: '10px 100px'
        }}
      />
      
      {/* CRT Scanline overlay */}
      <div className="absolute inset-0 crt-overlay z-50 opacity-20 mix-blend-overlay" />
      <div className="absolute inset-0 bg-red-900/5 mix-blend-overlay animate-flicker pointer-events-none" />

      <div className="max-w-2xl text-center space-y-16 z-10 flex flex-col items-center justify-center relative">
        {/* Minimalist Bat Symbol SVG */}
        <div className="w-64 h-32 md:w-96 md:h-48 relative animate-pulse flex items-center justify-center opacity-90 drop-shadow-[0_0_15px_rgba(255,0,0,0.3)] text-red-700">
          <svg viewBox="0 0 100 50" className="w-full h-full fill-current">
            <path d="M 50 45 Q 45 40 40 35 Q 30 25 10 20 Q 5 18 2 10 Q 15 15 25 10 Q 30 5 35 15 Q 38 18 42 12 Q 45 5 48 5 L 48 10 L 50 15 L 52 10 L 52 5 Q 55 5 58 12 Q 62 18 65 15 Q 70 5 75 10 Q 85 15 98 10 Q 95 18 90 20 Q 70 25 60 35 Q 55 40 50 45 Z" />
          </svg>
        </div>
        
        <div className="space-y-4">
          <h1 className="text-2xl md:text-3xl font-mono text-red-600 tracking-[0.5em] uppercase mb-2 font-bold drop-shadow-md">
            Gotham
          </h1>
          <p className="font-mono text-red-800/70 tracking-widest uppercase text-xs mb-12">
            A Narrative Simulation
          </p>
        </div>

        <div className="pt-8 flex flex-col items-center">
          <Link 
            href={`/gotham/${newSessionId}`}
            className="group relative inline-flex items-center justify-center px-12 py-4 font-mono text-sm tracking-[0.3em] text-red-500 uppercase border border-red-900/50 bg-black/50 hover:bg-red-900/20 hover:text-red-400 hover:border-red-500 transition-all duration-300 overflow-hidden"
          >
            <span className="relative z-10">Initialize Sequence</span>
            <div className="absolute inset-0 h-full w-0 bg-red-900/20 group-hover:w-full transition-all duration-500 ease-out" />
            <div className="absolute inset-0 border border-red-500/0 group-hover:border-red-500/50 animate-pulse transition-all duration-300" />
          </Link>
        </div>
      </div>
    </div>
  )
}
