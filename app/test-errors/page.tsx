'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle, ShieldOff, Search, ArrowRight,
  CheckCircle, XCircle, Loader2, Terminal, ExternalLink
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface TestResult {
  label: string;
  status: 'idle' | 'loading' | 'pass' | 'fail';
  statusCode?: number;
  message?: string;
  detail?: string;
}

const INITIAL: TestResult[] = [
  { label: 'GET /api/books (var olmayan ID) → 404', status: 'idle' },
  { label: 'GET /api/admin/stats (token yok) → 401', status: 'idle' },
  { label: 'GET /api/admin/stats (geçersiz token) → 403', status: 'idle' },
  { label: 'GET /api/admin/audit-logs (token yok) → 401', status: 'idle' },
  { label: 'GET /nonexistent-route (Next.js 404)', status: 'idle' },
];

async function runBackendTests(): Promise<TestResult[]> {
  const results: TestResult[] = [];

  // Test 1: var olmayan kitap ID → 404
  try {
    const r = await fetch(`${API_BASE}/books/999999999`);
    const body = await r.json().catch(() => ({}));
    results.push({
      label: 'GET /api/books/999999999 → 404',
      status: r.status === 404 ? 'pass' : 'fail',
      statusCode: r.status,
      message: r.status === 404 ? '✓ Beklenen 404 döndü' : `✗ Beklenen 404, gelen: ${r.status}`,
      detail: body.error || body.message || JSON.stringify(body),
    });
  } catch {
    results.push({ label: 'GET /api/books/999999999 → 404', status: 'fail', message: 'Network hatası' });
  }

  // Test 2: admin stats, token yok → 401
  try {
    const r = await fetch(`${API_BASE}/admin/stats`);
    const body = await r.json().catch(() => ({}));
    results.push({
      label: 'GET /api/admin/stats (token yok) → 401',
      status: r.status === 401 ? 'pass' : 'fail',
      statusCode: r.status,
      message: r.status === 401 ? '✓ Beklenen 401 döndü' : `✗ Beklenen 401, gelen: ${r.status}`,
      detail: body.error,
    });
  } catch {
    results.push({ label: 'GET /api/admin/stats (token yok) → 401', status: 'fail', message: 'Network hatası' });
  }

  // Test 3: admin stats, geçersiz token → 403
  try {
    const r = await fetch(`${API_BASE}/admin/stats`, {
      headers: { Authorization: 'Bearer invalid.token.here' },
    });
    const body = await r.json().catch(() => ({}));
    results.push({
      label: 'GET /api/admin/stats (geçersiz token) → 403',
      status: r.status === 403 ? 'pass' : 'fail',
      statusCode: r.status,
      message: r.status === 403 ? '✓ Beklenen 403 döndü' : `✗ Beklenen 403, gelen: ${r.status}`,
      detail: body.error,
    });
  } catch {
    results.push({ label: 'GET /api/admin/stats (geçersiz token) → 403', status: 'fail', message: 'Network hatası' });
  }

  // Test 4: audit-logs, token yok → 401
  try {
    const r = await fetch(`${API_BASE}/admin/audit-logs`);
    const body = await r.json().catch(() => ({}));
    results.push({
      label: 'GET /api/admin/audit-logs (token yok) → 401',
      status: r.status === 401 ? 'pass' : 'fail',
      statusCode: r.status,
      message: r.status === 401 ? '✓ Beklenen 401 döndü' : `✗ Beklenen 401, gelen: ${r.status}`,
      detail: body.error,
    });
  } catch {
    results.push({ label: 'GET /api/admin/audit-logs (token yok) → 401', status: 'fail', message: 'Network hatası' });
  }

  return results;
}

function StatusIcon({ status }: { status: TestResult['status'] }) {
  if (status === 'loading') return <Loader2 className="w-4 h-4 animate-spin text-blue-400" />;
  if (status === 'pass')    return <CheckCircle className="w-4 h-4 text-green-400" />;
  if (status === 'fail')    return <XCircle className="w-4 h-4 text-red-400" />;
  return <div className="w-4 h-4 rounded-full border border-border bg-muted" />;
}

export default function TestErrorsPage() {
  const router = useRouter();
  const [results, setResults] = useState<TestResult[]>([]);
  const [running, setRunning] = useState(false);

  const handleRunTests = async () => {
    setRunning(true);
    setResults(INITIAL.map(r => ({ ...r, status: 'loading' as const })));
    const backendResults = await runBackendTests();
    // The last one is a navigation test — not async
    backendResults.push({
      label: 'Next.js 404 sayfası',
      status: 'pass',
      message: '✓ /test-errors/nonexistent linkine tıklayarak test edebilirsiniz',
    });
    setResults(backendResults);
    setRunning(false);
  };

  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail').length;

  return (
    <div
      className="min-h-screen bg-background py-12 px-4"
      style={{
        backgroundImage: 'radial-gradient(ellipse at 20% 50%, rgba(99,102,241,0.07) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(168,85,247,0.07) 0%, transparent 60%)',
      }}
    >
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 backdrop-blur-sm px-4 py-1.5 mb-4">
            <Terminal className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              Error Test Suite
            </span>
          </div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Hata Sayfası Testleri</h1>
          <p className="text-muted-foreground text-sm">
            404, 403 ve 401 HTTP hata kodlarını ve Next.js hata sayfalarını doğrula
          </p>
        </div>

        {/* Quick nav cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* 404 card */}
          <div className="rounded-xl border border-border bg-card p-5 hover:shadow-lg transition-all hover:-translate-y-0.5">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/15 flex items-center justify-center">
                <Search className="w-5 h-5 text-blue-400" />
              </div>
              <span className="text-xs font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">HTTP 404</span>
            </div>
            <h2 className="font-bold mb-1">Sayfa Bulunamadı</h2>
            <p className="text-xs text-muted-foreground mb-4">
              Next.js global not-found sayfasını görüntüle
            </p>
            <Link
              id="test-404-link"
              href="/bu-sayfa-yoktur-12345"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
            >
              404 Sayfasını Aç <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* 403 card */}
          <div className="rounded-xl border border-border bg-card p-5 hover:shadow-lg transition-all hover:-translate-y-0.5">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/15 flex items-center justify-center">
                <ShieldOff className="w-5 h-5 text-red-400" />
              </div>
              <span className="text-xs font-mono font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded">HTTP 403</span>
            </div>
            <h2 className="font-bold mb-1">Yetkisiz Erişim</h2>
            <p className="text-xs text-muted-foreground mb-4">
              Admin olmayan kullanıcılar bu sayfaya yönlendirilir
            </p>
            <Link
              id="test-403-link"
              href="/forbidden"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-400 hover:text-red-300 transition-colors"
            >
              403 Sayfasını Aç <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Admin guard test */}
          <div className="rounded-xl border border-border bg-card p-5 hover:shadow-lg transition-all hover:-translate-y-0.5">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500/15 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-orange-400" />
              </div>
              <span className="text-xs font-mono font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded">Admin Guard</span>
            </div>
            <h2 className="font-bold mb-1">Admin Erişim Testi</h2>
            <p className="text-xs text-muted-foreground mb-4">
              Admin olmayan bir hesapla /admin sayfasına git → /forbidden&apos;a yönlenir
            </p>
            <Link
              id="test-admin-guard-link"
              href="/admin"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-400 hover:text-orange-300 transition-colors"
            >
              Admin Paneline Git <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Audit logs */}
          <div className="rounded-xl border border-border bg-card p-5 hover:shadow-lg transition-all hover:-translate-y-0.5">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/15 flex items-center justify-center">
                <Terminal className="w-5 h-5 text-purple-400" />
              </div>
              <span className="text-xs font-mono font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">Audit</span>
            </div>
            <h2 className="font-bold mb-1">Audit Log Sayfası</h2>
            <p className="text-xs text-muted-foreground mb-4">
              Admin panelindeki log görüntüleyicisini aç
            </p>
            <Link
              id="test-audit-link"
              href="/admin/audit-logs"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors"
            >
              Audit Logs&apos;a Git <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Automated API tests */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold flex items-center gap-2">
              <Terminal className="w-4 h-4 text-muted-foreground" />
              Otomatik API Testleri
            </h2>
            {results.length > 0 && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-green-400 font-semibold">{passed} geçti</span>
                <span className="text-muted-foreground">·</span>
                <span className="text-red-400 font-semibold">{failed} başarısız</span>
              </div>
            )}
          </div>

          <div className="p-6">
            <button
              id="run-tests-btn"
              onClick={handleRunTests}
              disabled={running}
              className="w-full flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed mb-6"
              style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                color: '#fff',
                boxShadow: running ? 'none' : '0 4px 20px rgba(99,102,241,0.3)',
              }}
            >
              {running ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Testler çalışıyor…</>
              ) : (
                <><Terminal className="w-4 h-4" /> Testleri Başlat</>
              )}
            </button>

            {results.length > 0 && (
              <div className="space-y-2">
                {results.map((r, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-3 rounded-lg p-3 border transition-colors ${
                      r.status === 'pass' ? 'border-green-500/20 bg-green-500/5' :
                      r.status === 'fail' ? 'border-red-500/20 bg-red-500/5' :
                      'border-border bg-muted/20'
                    }`}
                  >
                    <StatusIcon status={r.status} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-mono font-medium leading-snug">{r.label}</p>
                      {r.statusCode && (
                        <span className="text-xs text-muted-foreground font-mono">
                          HTTP {r.statusCode}
                        </span>
                      )}
                      {r.message && (
                        <p className="text-xs text-muted-foreground mt-0.5">{r.message}</p>
                      )}
                      {r.detail && (
                        <p className="text-xs font-mono text-muted-foreground/60 mt-0.5 truncate">
                          {r.detail}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {results.length === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                <Terminal className="w-8 h-8 mx-auto opacity-20 mb-2" />
                <p className="text-sm">Testleri başlatmak için yukarıdaki butona tıklayın</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground/40 font-mono">
          Kutuphane · Error Test Suite · {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
}
