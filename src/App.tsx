import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface Heart {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  rotation: number;
  rotationSpeed: number;
  glowIntensity: number;
}

function App() {
  const [answered, setAnswered] = useState<'yes' | 'no' | null>(null);
  const [showMessage, setShowMessage] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heartsRef = useRef<Heart[]>([]);
  const animationFrameRef = useRef<number>();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const nextIdRef = useRef(0);

  const isMobile = window.innerWidth < 768;
  const heartCount = isMobile ? 25 : 50;


  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const createHeart = (): Heart => ({
      id: nextIdRef.current++,
      x: Math.random() * canvas.width,
      y: canvas.height + 50,
      size: Math.random() * 20 + 10,
      speed: Math.random() * 1 + 0.5,
      opacity: Math.random() * 0.4 + 0.3,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 2,
      glowIntensity: Math.random() * 0.5 + 0.3,
    });

    for (let i = 0; i < heartCount; i++) {
      const heart = createHeart();
      heart.y = Math.random() * canvas.height;
      heartsRef.current.push(heart);
    }

    const drawHeart = (ctx: CanvasRenderingContext2D, heart: Heart) => {
      ctx.save();

      ctx.translate(heart.x, heart.y);
      ctx.rotate((heart.rotation * Math.PI) / 180);

      if (heart.glowIntensity > 0.4) {
        ctx.shadowBlur = 20;
        ctx.shadowColor = `rgba(255, 150, 150, ${heart.opacity * heart.glowIntensity})`;
      }

      ctx.globalAlpha = heart.opacity * (answered ? 0.3 : 1);
      ctx.fillStyle = '#ff6b9d';

      ctx.beginPath();
      ctx.moveTo(0, heart.size * 0.3);
      ctx.bezierCurveTo(
        -heart.size * 0.5,
        -heart.size * 0.3,
        -heart.size,
        heart.size * 0.3,
        0,
        heart.size
      );
      ctx.bezierCurveTo(
        heart.size,
        heart.size * 0.3,
        heart.size * 0.5,
        -heart.size * 0.3,
        0,
        heart.size * 0.3
      );
      ctx.fill();

      ctx.restore();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      heartsRef.current.forEach((heart, index) => {
        heart.y -= heart.speed;
        heart.rotation += heart.rotationSpeed;

        if (heart.y < -50) {
          heartsRef.current[index] = createHeart();
        }

        drawHeart(ctx, heart);
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [heartCount, answered]);

  const handleAnswer = (answer: 'yes' | 'no') => {
    setAnswered(answer);
    setTimeout(() => {
      setShowMessage(true);
    }, 1200);
  };

  const handleRetry = () => {
    setAnswered(null);
    setShowMessage(false);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Beni seviyor musun?',
        text: answered === 'yes' ? 'Ben de seni çok seviyorum.' : 'Oysa ben seni çok seviyordum.',
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link kopyalandı!');
    }
  };

  useEffect(() => {
    audioRef.current = new Audio('/sarki.mp3');
    audioRef.current.loop = true;
    audioRef.current.volume = 0.3;

    audioRef.current.play().catch(() => {
      setIsMuted(true);
    });

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const toggleMute = () => {
    if (!audioRef.current) return;

    if (isMuted) {
      audioRef.current.play().catch(() => {});
      setIsMuted(false);
    } else {
      audioRef.current.pause();
      setIsMuted(true);
    }
  };

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-[#1a1a2e] via-[#2d3748] to-[#1a1a2e]">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ pointerEvents: 'none' }}
      />

      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/40" />

      <div
        className="absolute inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' /%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' /%3E%3C/svg%3E")',
        }}
      />

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_rgba(0,0,0,0.6)_100%)]" />

      <button
        onClick={toggleMute}
        className="absolute top-6 right-6 z-50 p-3 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 hover:scale-110"
        aria-label={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted ? <VolumeX className="w-5 h-5 text-white" /> : <Volume2 className="w-5 h-5 text-white" />}
      </button>

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div
          className={`text-center transition-all duration-1200 ease-out ${
            answered
              ? answered === 'yes'
                ? 'scale-95 opacity-0'
                : 'scale-95 opacity-0'
              : 'scale-100 opacity-100'
          }`}
          style={{
            transitionProperty: 'transform, opacity',
            transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {!answered && (
            <>
              <h1
                className="text-5xl md:text-7xl lg:text-8xl mb-12 md:mb-16 text-white drop-shadow-2xl"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontStyle: 'italic',
                  fontWeight: 300,
                  textShadow: '0 0 40px rgba(255, 255, 255, 0.3), 0 4px 20px rgba(0, 0, 0, 0.8)',
                  letterSpacing: '0.02em',
                  animation: prefersReducedMotion ? 'none' : 'fadeInScale 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                Beni seviyor musun?
              </h1>

              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <button
                  onClick={() => handleAnswer('yes')}
                  className="group relative px-12 py-5 text-2xl md:text-3xl font-medium text-white bg-gradient-to-r from-pink-500 to-rose-500 rounded-full shadow-2xl hover:shadow-pink-500/50 transition-all duration-500 hover:scale-110 hover:from-pink-400 hover:to-rose-400"
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    animation: prefersReducedMotion ? 'none' : 'gentleFadeIn 1.5s cubic-bezier(0.4, 0, 0.2, 1) 0.5s both',
                  }}
                >
                  <span className="relative z-10">Evet</span>
                  <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
                </button>

                <button
                  onClick={() => handleAnswer('no')}
                  className="group relative px-12 py-5 text-2xl md:text-3xl font-medium text-white bg-gradient-to-r from-slate-600 to-slate-700 rounded-full shadow-2xl hover:shadow-slate-500/50 transition-all duration-500 hover:scale-110 hover:from-slate-500 hover:to-slate-600"
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    animation: prefersReducedMotion ? 'none' : 'gentleFadeIn 1.5s cubic-bezier(0.4, 0, 0.2, 1) 0.7s both',
                  }}
                >
                  <span className="relative z-10">Hayır</span>
                  <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
                </button>
              </div>
            </>
          )}
        </div>

        <div
          className={`absolute inset-0 flex items-center justify-center transition-all duration-1200 ${
            showMessage ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
          }`}
          style={{
            transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <div className="text-center px-4 max-w-3xl">
            <h2
              className="text-4xl md:text-6xl lg:text-7xl text-white mb-8 drop-shadow-2xl"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontStyle: 'italic',
                fontWeight: 400,
                textShadow: '0 0 40px rgba(255, 255, 255, 0.3), 0 4px 20px rgba(0, 0, 0, 0.8)',
                letterSpacing: '0.02em',
                animation: showMessage && !prefersReducedMotion ? 'gentleFadeIn 2.5s cubic-bezier(0.4, 0, 0.2, 1) 0.3s both' : 'none',
              }}
            >
              {answered === 'yes' ? 'Ben de seni çok seviyorum.' : 'Oysa ben seni çok seviyordum.'}
            </h2>

            <div className="flex gap-4 justify-center mt-12">
              <button
                onClick={handleRetry}
                className="px-8 py-3 text-lg font-medium text-white bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-all duration-300 hover:scale-105"
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  animation: showMessage && !prefersReducedMotion ? 'gentleFadeIn 1.8s cubic-bezier(0.4, 0, 0.2, 1) 2s both' : 'none'
                }}
              >
                Tekrar
              </button>
              <button
                onClick={handleShare}
                className="px-8 py-3 text-lg font-medium text-white bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-all duration-300 hover:scale-105"
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  animation: showMessage && !prefersReducedMotion ? 'gentleFadeIn 1.8s cubic-bezier(0.4, 0, 0.2, 1) 2.2s both' : 'none'
                }}
              >
                Paylaş
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes gentleFadeIn {
          0% {
            opacity: 0;
            transform: scale(0.98);
            filter: blur(4px);
          }
          50% {
            opacity: 0.5;
            filter: blur(2px);
          }
          100% {
            opacity: 1;
            transform: scale(1);
            filter: blur(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
}

export default App;
