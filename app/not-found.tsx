import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '404 - Sayfa Bulunamadı | Kutuphane',
  description: 'Aradığınız sayfa bulunamadı.',
};

export default function NotFound() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background overflow-hidden">
      {/* Ambient glow blobs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-purple-600/10 blur-[120px]" />
      </div>

      {/* Floating grid pattern */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center px-6 select-none">
        {/* Giant 404 */}
        <div className="relative mb-6">
          <span
            className="text-[160px] sm:text-[220px] font-black leading-none tracking-tighter"
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #a78bfa 40%, #38bdf8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 0 40px rgba(99,102,241,0.35))',
            }}
          >
            404
          </span>
          {/* Glitch shadow */}
          <span
            aria-hidden="true"
            className="absolute inset-0 text-[160px] sm:text-[220px] font-black leading-none tracking-tighter opacity-10 translate-x-1 translate-y-1"
            style={{ color: '#f43f5e' }}
          >
            404
          </span>
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 backdrop-blur-sm px-4 py-1.5 mb-5">
          <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            Sayfa Bulunamadı
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
          Ups! Yanlış yoldasınız.
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base max-w-md leading-relaxed mb-8">
          Aradığınız sayfa taşınmış, silinmiş veya hiç var olmamış olabilir.
          Endişelenmeyin, sizi doğru yere götürebiliriz.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Link
            id="not-found-home-btn"
            href="/"
            className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              color: '#fff',
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Ana Sayfaya Dön
          </Link>

          <Link
            id="not-found-books-btn"
            href="/books"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card/60 backdrop-blur-sm px-6 py-3 text-sm font-semibold text-foreground hover:bg-muted/70 transition-all duration-200 hover:-translate-y-0.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Kitaplara Gözat
          </Link>
        </div>

        {/* Error code footer */}
        <p className="mt-12 text-xs text-muted-foreground/40 font-mono">
          HTTP 404 · Kutuphane
        </p>
      </div>
    </div>
  );
}
