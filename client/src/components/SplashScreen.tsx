import { useEffect, useState } from "react";
import splashLogo from "@assets/generated_images/dagpulse_neon_gradient_logo.png";

interface SplashScreenProps {
  onComplete?: () => void;
  duration?: number;
}

export function SplashScreen({ onComplete, duration = 2500 }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setIsFading(true);
    }, duration - 500);

    const completeTimer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, duration);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [duration, onComplete]);

  if (!isVisible) return null;

  return (
    <div
      className={`splash-screen fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden transition-opacity duration-500 ${
        isFading ? "opacity-0" : "opacity-100"
      }`}
      data-testid="splash-screen"
    >
      {/* Deep gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a1a] via-[#0d1025] to-[#050510]" />

      {/* Animated network lines */}
      <div className="absolute inset-0 overflow-hidden">
        <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="lineGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00d9ff" stopOpacity="0" />
              <stop offset="50%" stopColor="#00d9ff" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#00d9ff" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="lineGradient2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#d400ff" stopOpacity="0" />
              <stop offset="50%" stopColor="#d400ff" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#d400ff" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Network lines */}
          <line x1="10%" y1="20%" x2="40%" y2="35%" stroke="url(#lineGradient1)" strokeWidth="1" className="animate-pulse-slow" />
          <line x1="60%" y1="15%" x2="85%" y2="40%" stroke="url(#lineGradient2)" strokeWidth="1" className="animate-pulse-slow" style={{ animationDelay: "0.5s" }} />
          <line x1="15%" y1="70%" x2="45%" y2="85%" stroke="url(#lineGradient1)" strokeWidth="1" className="animate-pulse-slow" style={{ animationDelay: "1s" }} />
          <line x1="55%" y1="65%" x2="90%" y2="80%" stroke="url(#lineGradient2)" strokeWidth="1" className="animate-pulse-slow" style={{ animationDelay: "1.5s" }} />
          <line x1="5%" y1="45%" x2="25%" y2="55%" stroke="url(#lineGradient1)" strokeWidth="1" className="animate-pulse-slow" style={{ animationDelay: "0.3s" }} />
          <line x1="75%" y1="50%" x2="95%" y2="60%" stroke="url(#lineGradient2)" strokeWidth="1" className="animate-pulse-slow" style={{ animationDelay: "0.8s" }} />
          {/* DAG connection nodes */}
          <circle cx="10%" cy="20%" r="2" fill="#00d9ff" className="animate-pulse-slow opacity-40" />
          <circle cx="40%" cy="35%" r="2" fill="#00d9ff" className="animate-pulse-slow opacity-40" style={{ animationDelay: "0.2s" }} />
          <circle cx="60%" cy="15%" r="2" fill="#d400ff" className="animate-pulse-slow opacity-40" style={{ animationDelay: "0.4s" }} />
          <circle cx="85%" cy="40%" r="2" fill="#d400ff" className="animate-pulse-slow opacity-40" style={{ animationDelay: "0.6s" }} />
          <circle cx="15%" cy="70%" r="2" fill="#00d9ff" className="animate-pulse-slow opacity-40" style={{ animationDelay: "0.8s" }} />
          <circle cx="90%" cy="80%" r="2" fill="#d400ff" className="animate-pulse-slow opacity-40" style={{ animationDelay: "1s" }} />
        </svg>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="particle absolute rounded-full"
            style={{
              width: `${2 + Math.random() * 4}px`,
              height: `${2 + Math.random() * 4}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: i % 2 === 0 ? "#00d9ff" : "#d400ff",
              opacity: 0.3 + Math.random() * 0.4,
              animation: `float-particle ${8 + Math.random() * 8}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      {/* Glow aura behind logo */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          {/* Outer glow ring */}
          <div
            className="absolute inset-0 -m-20 rounded-full opacity-30 blur-3xl animate-glow-pulse"
            style={{
              background: "radial-gradient(circle, rgba(0,217,255,0.4) 0%, rgba(212,0,255,0.3) 50%, transparent 70%)",
            }}
          />
          {/* Inner glow ring */}
          <div
            className="absolute inset-0 -m-12 rounded-full opacity-40 blur-2xl animate-glow-pulse"
            style={{
              background: "radial-gradient(circle, rgba(0,217,255,0.5) 0%, rgba(212,0,255,0.4) 40%, transparent 60%)",
              animationDelay: "0.5s",
            }}
          />
          {/* Core glow */}
          <div
            className="absolute inset-0 -m-6 rounded-full opacity-50 blur-xl animate-glow-pulse"
            style={{
              background: "radial-gradient(circle, rgba(0,217,255,0.6) 0%, transparent 50%)",
              animationDelay: "1s",
            }}
          />
        </div>
      </div>

      {/* Logo container with pulse animation */}
      <div className="relative z-10 flex items-center justify-center animate-logo-float">
        <div className="relative">
          {/* Logo glow effect */}
          <div
            className="absolute inset-0 blur-md opacity-60 animate-glow-pulse"
            style={{
              background: "radial-gradient(circle, rgba(0,217,255,0.3) 0%, transparent 70%)",
            }}
          />
          {/* Main logo */}
          <img
            src={splashLogo}
            alt="DAGPulse"
            className="relative z-10 w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 object-contain drop-shadow-2xl animate-logo-pulse"
            style={{
              filter: "drop-shadow(0 0 20px rgba(0,217,255,0.4)) drop-shadow(0 0 40px rgba(212,0,255,0.3))",
            }}
          />
        </div>
      </div>

      {/* Subtle vignette overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.4) 100%)",
        }}
      />

      <style>{`
        @keyframes float-particle {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0.3;
          }
          25% {
            transform: translateY(-20px) translateX(10px);
            opacity: 0.6;
          }
          50% {
            transform: translateY(-10px) translateX(-5px);
            opacity: 0.4;
          }
          75% {
            transform: translateY(-30px) translateX(15px);
            opacity: 0.5;
          }
        }

        @keyframes glow-pulse {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.05);
          }
        }

        @keyframes logo-pulse {
          0%, 100% {
            filter: drop-shadow(0 0 20px rgba(0,217,255,0.4)) drop-shadow(0 0 40px rgba(212,0,255,0.3));
          }
          50% {
            filter: drop-shadow(0 0 30px rgba(0,217,255,0.6)) drop-shadow(0 0 60px rgba(212,0,255,0.5));
          }
        }

        @keyframes logo-float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        .animate-glow-pulse {
          animation: glow-pulse 3s ease-in-out infinite;
        }

        .animate-logo-pulse {
          animation: logo-pulse 2s ease-in-out infinite;
        }

        .animate-logo-float {
          animation: logo-float 4s ease-in-out infinite;
        }

        .animate-pulse-slow {
          animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
}
