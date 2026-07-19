"use client"


interface BackgroundEffectsProps {
  visualEffect?: 'rain' | 'fog' | 'neon' | 'office' | 'cave' | 'none' | 'snow' | 'thunderstorm' | 'smoke' | 'siren' | 'fire' | 'spotlight'
  sceneImageUrl?: string | null
}

export function BackgroundEffects({ visualEffect, sceneImageUrl }: BackgroundEffectsProps) {
  // We use key to force unmount/remount on effect change to restart animations if needed
  
  return (
    <div className="absolute inset-0 pointer-events-none z-[-1] overflow-hidden bg-[#020408]">
      {/* Dynamic AI Scene Image */}
      {sceneImageUrl && (
        <div 
          key={sceneImageUrl}
          className="absolute inset-0 opacity-40 mix-blend-screen transition-opacity duration-[3000ms] animate-ken-burns"
          style={{
            backgroundImage: `url(${sceneImageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      )}

      {visualEffect === 'rain' && (
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)', backgroundSize: '100% 200%', animation: 'rain 0.5s linear infinite' }} />
      )}

      {visualEffect === 'snow' && (
        <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '50px 50px', animation: 'snow 3s linear infinite' }} />
      )}

      {visualEffect === 'thunderstorm' && (
        <div className="absolute inset-0 opacity-0 bg-white pointer-events-none mix-blend-overlay" style={{ animation: 'thunder 7s infinite' }} />
      )}

      {visualEffect === 'smoke' && (
        <div className="absolute inset-0 opacity-40 pointer-events-none bg-gradient-to-t from-gray-600/30 via-gray-400/10 to-transparent" style={{ animation: 'smokeSwirl 10s ease-in-out infinite alternate' }} />
      )}

      {visualEffect === 'siren' && (
        <>
          <div className="absolute inset-0 opacity-0 bg-red-600/20 mix-blend-color pointer-events-none" style={{ animation: 'sirenRed 2s infinite' }} />
          <div className="absolute inset-0 opacity-0 bg-blue-600/20 mix-blend-color pointer-events-none" style={{ animation: 'sirenBlue 2s infinite 1s' }} />
        </>
      )}

      {visualEffect === 'fire' && (
        <div className="absolute bottom-0 left-0 right-0 h-1/2 opacity-30 pointer-events-none bg-gradient-to-t from-orange-600/40 via-yellow-500/20 to-transparent" style={{ animation: 'fireFlicker 0.1s infinite alternate' }} />
      )}

      {visualEffect === 'spotlight' && (
        <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] opacity-20 pointer-events-none bg-[conic-gradient(from_0deg,transparent_0deg,rgba(255,255,255,0.8)_20deg,transparent_40deg)] mix-blend-overlay origin-top" style={{ animation: 'spotlightSweep 8s ease-in-out infinite alternate' }} />
      )}

      {visualEffect === 'fog' && (
        <div className="absolute inset-0 opacity-30 pointer-events-none bg-gradient-to-t from-gray-500/20 to-transparent" style={{ animation: 'fogPulse 8s ease-in-out infinite alternate' }} />
      )}

      {visualEffect === 'neon' && (
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-alert/20 via-background to-background" style={{ animation: 'neonFlicker 4s infinite' }} />
      )}

      {visualEffect === 'cave' && (
        <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,0.9)] bg-black/40" />
      )}
      
      {visualEffect === 'office' && (
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-blue-900/10 to-transparent" />
      )}

      {/* Base overlay for blending */}
      <div className="absolute inset-0 bg-background mix-blend-multiply opacity-50 transition-opacity duration-1000" />

      <style jsx>{`
        @keyframes ken-burns {
          0% { transform: scale(1.0) translate(0, 0); }
          100% { transform: scale(1.1) translate(-2%, -2%); }
        }
        .animate-ken-burns {
          animation: ken-burns 60s ease-out forwards;
        }
        @keyframes rain {
          0% { background-position: 0% 0%; }
          100% { background-position: 0% 100%; }
        }
        @keyframes snow {
          0% { background-position: 0px 0px; }
          100% { background-position: 50px 50px; }
        }
        @keyframes thunder {
          0%, 95%, 98% { opacity: 0; }
          96%, 99% { opacity: 0.8; }
          97%, 100% { opacity: 0; }
        }
        @keyframes smokeSwirl {
          0% { opacity: 0.2; transform: scale(1) translate(0, 0) rotate(0deg); }
          100% { opacity: 0.6; transform: scale(1.2) translate(-20px, -20px) rotate(5deg); }
        }
        @keyframes sirenRed {
          0%, 100% { opacity: 0; }
          50% { opacity: 0.6; }
        }
        @keyframes sirenBlue {
          0%, 100% { opacity: 0; }
          50% { opacity: 0.6; }
        }
        @keyframes fireFlicker {
          0% { opacity: 0.2; transform: scaleY(1); }
          100% { opacity: 0.5; transform: scaleY(1.05); }
        }
        @keyframes spotlightSweep {
          0% { transform: rotate(-30deg); }
          100% { transform: rotate(30deg); }
        }
        @keyframes fogPulse {
          0% { opacity: 0.1; transform: scale(1); }
          100% { opacity: 0.4; transform: scale(1.05); }
        }
        @keyframes neonFlicker {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; }
          90% { opacity: 0.7; }
          95% { opacity: 0.9; }
        }
      `}</style>
    </div>
  )
}
