import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '403 - Yetkisiz Erişim | Kutuphane',
  description: 'Bu sayfaya erişim yetkiniz bulunmuyor.',
};

export default function ForbiddenPage() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background overflow-hidden">
      {/* Ambient glow */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-red-600/10 blur-[120px]" />
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full bg-orange-600/8 blur-[120px]" />
      </div>

      {/* Grid pattern */}
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
        {/* Shield icon */}
        <div className="relative mb-6">
          <div
            className="w-32 h-32 rounded-3xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(239,68,68,0.15) 0%, rgba(249,115,22,0.1) 100%)',
              border: '1px solid rgba(239,68,68,0.25)',
              boxShadow: '0 0 60px rgba(239,68,68,0.15)',
            }}
          >
            <svg
              className="w-16 h-16"
              fill="none"
              stroke="url(#shieldGrad)"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
            >
              <defs>
                <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="100%" stopColor="#f97316" />
                </linearGradient>
              </defs>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
              />
            </svg>
          </div>
          {/* Pulse ring */}
          <div
            aria-hidden="true"
            className="absolute inset-0 rounded-3xl animate-ping opacity-20"
            style={{ border: '2px solid #ef4444', animationDuration: '2s' }}
          />
        </div>

        {/* 403 number */}
        <div className="mb-4">
          <span
            className="text-7xl sm:text-8xl font-black leading-none tracking-tighter"
            style={{
              background: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 0 30px rgba(239,68,68,0.4))',
            }}
          >
            403
          </span>
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-1.5 mb-5">
          <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
          <span className="text-xs font-semibold text-red-400 uppercase tracking-widest">
            Erişim Reddedildi
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
          Bu alana giremezsiniz.
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base max-w-md leading-relaxed mb-8">
          Bu sayfaya erişmek için yeterli yetkiye sahip değilsiniz.
          Yönetici paneline sadece admin hesapları erişebilir.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Link
            id="forbidden-home-btn"
            href="/"
            className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-white transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
            style={{
              background: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Ana Sayfaya Dön
          </Link>

          <Link
            id="forbidden-login-btn"
            href="/login"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card/60 backdrop-blur-sm px-6 py-3 text-sm font-semibold text-foreground hover:bg-muted/70 transition-all duration-200 hover:-translate-y-0.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Farklı Hesapla Giriş Yap
          </Link>
        </div>

        {/* Error code footer */}
        <p className="mt-12 text-xs text-muted-foreground/40 font-mono">
          HTTP 403 Forbidden · Kutuphane
        </p>
      </div>
    </div>
  );
}
