'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { fetchAPI } from '@/utils/api';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  CreditCard, Lock, CheckCircle2, XCircle, Loader2,
  ChevronDown, ChevronUp, ShoppingBag, Shield, Zap
} from 'lucide-react';

/* ─── Mock Card Utilities ─────────────────────────────────────── */
const detectCardType = (num: string): 'visa' | 'mastercard' | 'amex' | 'unknown' => {
  const n = num.replace(/\s/g, '');
  if (/^4/.test(n)) return 'visa';
  if (/^5[1-5]/.test(n)) return 'mastercard';
  if (/^3[47]/.test(n)) return 'amex';
  return 'unknown';
};

const formatCardNumber = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(.{4})/g, '$1 ').trim();
};

const formatExpiry = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 2) return digits.slice(0, 2) + '/' + digits.slice(2);
  return digits;
};

/* Test kartları — bu numaralara göre sonuç simüle edilir */
const TEST_CARDS: Record<string, { result: 'success' | 'fail'; label: string }> = {
  '4242424242424242': { result: 'success', label: '✅ Başarılı Ödeme' },
  '5555555555554444': { result: 'success', label: '✅ Başarılı Ödeme' },
  '4000000000000002': { result: 'fail', label: '❌ Kart Reddedildi' },
  '4000000000009995': { result: 'fail', label: '❌ Yetersiz Bakiye' },
};

const processPayment = (cardNumber: string): 'success' | 'fail' => {
  const digits = cardNumber.replace(/\s/g, '');
  const known = TEST_CARDS[digits];
  if (known) return known.result;
  // Başka kart numarası → Luhn kontrolü simülasyonu — son rakam tekse başarısız
  const lastDigit = parseInt(digits.slice(-1));
  return lastDigit % 2 === 0 ? 'fail' : 'success';
};

/* ─── Test Cards Info Panel ─────────────────────────────────────── */
const testCards = [
  { number: '4242 4242 4242 4242', type: 'Visa', result: 'Başarılı', color: 'text-green-400' },
  { number: '5555 5555 5555 4444', type: 'Mastercard', result: 'Başarılı', color: 'text-green-400' },
  { number: '4000 0000 0000 0002', type: 'Visa', result: 'Kart Reddedildi', color: 'text-red-400' },
  { number: '4000 0000 0000 9995', type: 'Visa', result: 'Yetersiz Bakiye', color: 'text-red-400' },
];

function TestCardsPanel() {
  const [open, setOpen] = useState(false);
  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${text} kopyalandı!`);
  };
  return (
    <div className="rounded-xl border border-dashed border-border bg-card/50 overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <span className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-yellow-500" />
          Test Kartları — Bu kartları kullanabilirsin
        </span>
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {open && (
        <div className="border-t border-border divide-y divide-border">
          {testCards.map(card => (
            <div
              key={card.number}
              onClick={() => copy(card.number)}
              className="flex items-center justify-between px-4 py-2.5 hover:bg-muted/50 cursor-pointer transition-colors group"
            >
              <div>
                <p className="font-mono text-sm tracking-wider group-hover:text-primary transition-colors">{card.number}</p>
                <p className="text-xs text-muted-foreground">{card.type}</p>
              </div>
              <Badge
                variant="outline"
                className={`text-xs ${card.color}`}
              >
                {card.result}
              </Badge>
            </div>
          ))}
          <p className="px-4 py-2 text-xs text-muted-foreground">
            Son kullanma: herhangi gelecek tarih (ör. 12/34) · CVC: herhangi 3 hane · Kopyalamak için tıkla
          </p>
        </div>
      )}
    </div>
  );
}

/* ─── Card Brand SVGs ─────────────────────────────────────────── */
function CardBrandIcon({ type }: { type: string }) {
  if (type === 'visa') return (
    <span className="text-blue-400 font-extrabold text-lg tracking-tighter">VISA</span>
  );
  if (type === 'mastercard') return (
    <span className="flex gap-0.5">
      <span className="w-5 h-5 rounded-full bg-red-500/80 block" />
      <span className="w-5 h-5 rounded-full bg-yellow-500/80 block -ml-2.5" />
    </span>
  );
  if (type === 'amex') return (
    <span className="text-blue-300 font-bold text-xs">AMEX</span>
  );
  return <CreditCard className="w-5 h-5 text-muted-foreground" />;
}

/* ─── Payment Status Overlay ─────────────────────────────────── */
type PaymentStatus = 'idle' | 'processing' | 'success' | 'error';

function PaymentOverlay({ status, onDone }: { status: PaymentStatus; onDone: () => void }) {
  if (status === 'idle') return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl p-10 flex flex-col items-center gap-4 shadow-2xl min-w-[280px]">
        {status === 'processing' && (
          <>
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" />
              <Lock className="absolute inset-0 m-auto w-6 h-6 text-primary" />
            </div>
            <p className="text-lg font-semibold">Ödeme İşleniyor...</p>
            <p className="text-sm text-muted-foreground text-center">Lütfen bekleyin, güvenli ödeme gerçekleştiriliyor</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center animate-in zoom-in-50">
              <CheckCircle2 className="w-9 h-9 text-green-400" />
            </div>
            <p className="text-lg font-semibold text-green-400">Ödeme Başarılı!</p>
            <p className="text-sm text-muted-foreground text-center">Siparişiniz alındı. Profilinize yönlendiriliyorsunuz...</p>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center animate-in zoom-in-50">
              <XCircle className="w-9 h-9 text-red-400" />
            </div>
            <p className="text-lg font-semibold text-red-400">Ödeme Başarısız</p>
            <p className="text-sm text-muted-foreground text-center">Kart bilgilerinizi kontrol edip tekrar deneyin.</p>
            <Button onClick={onDone} variant="outline" className="mt-2">Tekrar Dene</Button>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Main Checkout Page ─────────────────────────────────────── */
export default function CheckoutPage() {
  const { cart, totalPrice, clearCart } = useCart();
  const { user, token } = useAuth();
  const router = useRouter();

  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [cvcVisible, setCvcVisible] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle');

  const cardType = detectCardType(cardNumber);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
    if (cart.length === 0 && paymentStatus === 'idle') {
      router.push('/cart');
    }
  }, [user, cart, paymentStatus, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    const digits = cardNumber.replace(/\s/g, '');
    if (digits.length < 16) return toast.error('Geçersiz kart numarası');
    if (!cardHolder.trim()) return toast.error('Kart sahibi adı gerekli');
    if (expiry.length < 5) return toast.error('Son kullanma tarihi gerekli');
    if (cvc.length < 3) return toast.error('CVC gerekli');

    setPaymentStatus('processing');

    // Simulate processing delay
    await new Promise(r => setTimeout(r, 2200));

    const result = processPayment(cardNumber);

    if (result === 'fail') {
      setPaymentStatus('error');
      return;
    }

    // Success — create order in DB
    try {
      await fetchAPI('/orders', {
        method: 'POST',
        body: JSON.stringify({
          total_price: totalPrice,
          payment_card_last4: digits.slice(-4),
          items: cart.map(item => ({
            book_id: item.book_id,
            quantity: item.quantity,
          })),
        }),
      });

      setPaymentStatus('success');
      clearCart();

      await new Promise(r => setTimeout(r, 1800));
      router.push('/profile');
    } catch (err: any) {
      setPaymentStatus('error');
      toast.error(err.message || 'Sipariş oluşturulamadı');
    }
  };

  return (
    <>
      <PaymentOverlay
        status={paymentStatus}
        onDone={() => setPaymentStatus('idle')}
      />

      <div className="py-12 max-w-5xl mx-auto">
        <div className="mb-8 flex items-center gap-3">
          <Link href="/cart" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
            ← Sepete Dön
          </Link>
          <Separator orientation="vertical" className="h-4" />
          <h1 className="text-2xl font-bold tracking-tight">Ödeme</h1>
          <div className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
            <Shield className="w-3.5 h-3.5 text-green-500" />
            SSL ile korumalı
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* ─── Kart Formu ─── */}
          <div className="lg:col-span-3 space-y-6">

            {/* Test Cards Panel */}
            <TestCardsPanel />

            {/* Visual Card Preview */}
            <div
              className="relative h-48 rounded-2xl p-6 overflow-hidden select-none"
              style={{
                background: cardType === 'visa'
                  ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
                  : cardType === 'mastercard'
                    ? 'linear-gradient(135deg, #1a1a1a 0%, #2d1515 50%, #4a0000 100%)'
                    : 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
              }}
            >
              {/* Decorative circles */}
              <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/5" />
              <div className="absolute -right-4 top-12 w-24 h-24 rounded-full bg-white/5" />

              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div className="w-10 h-7 rounded bg-yellow-400/80 flex items-center justify-center">
                    <div className="w-6 h-4 rounded-sm border border-yellow-600/50 bg-gradient-to-b from-yellow-300 to-yellow-500" />
                  </div>
                  <CardBrandIcon type={cardType} />
                </div>

                <div>
                  <p className="font-mono text-xl tracking-[0.25em] text-white mb-3">
                    {cardNumber || '•••• •••• •••• ••••'}
                  </p>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-xs text-white/50 uppercase tracking-wider mb-0.5">Kart Sahibi</p>
                      <p className="text-sm text-white font-medium uppercase tracking-wide">
                        {cardHolder || 'AD SOYAD'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-white/50 uppercase tracking-wider mb-0.5">Son Kullanma</p>
                      <p className="text-sm text-white font-medium">{expiry || 'AA/YY'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">Kart Numarası</label>
                <div className="relative">
                  <input
                    id="card-number"
                    type="text"
                    inputMode="numeric"
                    placeholder="0000 0000 0000 0000"
                    maxLength={19}
                    value={cardNumber}
                    onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                    className="w-full h-12 rounded-lg border border-border bg-card px-4 pr-12 font-mono text-base tracking-wider focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/40"
                    required
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <CardBrandIcon type={cardType} />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">Kart Üzerindeki Ad</label>
                <input
                  id="card-holder"
                  type="text"
                  placeholder="Ad Soyad"
                  value={cardHolder}
                  onChange={e => setCardHolder(e.target.value.toUpperCase())}
                  className="w-full h-12 rounded-lg border border-border bg-card px-4 text-base uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/40 placeholder:normal-case"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-muted-foreground">Son Kullanma</label>
                  <input
                    id="card-expiry"
                    type="text"
                    inputMode="numeric"
                    placeholder="AA/YY"
                    maxLength={5}
                    value={expiry}
                    onChange={e => setExpiry(formatExpiry(e.target.value))}
                    className="w-full h-12 rounded-lg border border-border bg-card px-4 font-mono text-base tracking-wider focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/40"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-muted-foreground">CVC</label>
                  <div className="relative">
                    <input
                      id="card-cvc"
                      type={cvcVisible ? 'text' : 'password'}
                      inputMode="numeric"
                      placeholder="•••"
                      maxLength={4}
                      value={cvc}
                      onChange={e => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      className="w-full h-12 rounded-lg border border-border bg-card px-4 pr-10 font-mono text-base tracking-wider focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/40"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setCvcVisible(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Lock className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <Button
                id="checkout-submit"
                type="submit"
                size="lg"
                className="w-full h-14 text-base font-semibold relative overflow-hidden group mt-2"
                disabled={paymentStatus === 'processing'}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative flex items-center gap-2">
                  {paymentStatus === 'processing' ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> İşleniyor...</>
                  ) : (
                    <><Lock className="w-4 h-4" /> ₺{totalPrice.toFixed(2)} Öde</>
                  )}
                </span>
              </Button>

              <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-green-500" />
                256-bit SSL şifreleme ile korunmaktadır
              </p>
            </form>
          </div>

          {/* ─── Sipariş Özeti ─── */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 rounded-2xl border border-border bg-card overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <h2 className="font-semibold text-base flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4" />
                  Sipariş Özeti
                  <Badge variant="secondary" className="ml-auto">{cart.length} ürün</Badge>
                </h2>
              </div>

              <div className="divide-y divide-border max-h-72 overflow-y-auto">
                {cart.map(item => (
                  <div key={item.book_id} className="flex gap-3 px-5 py-3">
                    <div className="w-10 h-14 rounded overflow-hidden bg-muted flex-shrink-0 border border-border/50">
                      {item.image && (
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-2 leading-snug">{item.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Adet: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold whitespace-nowrap">
                      ₺{(parseFloat(item.price) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="px-5 py-4 space-y-3 border-t border-border bg-muted/30">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Ara Toplam</span>
                  <span>₺{totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Kargo</span>
                  <span className="text-green-500 font-medium">Ücretsiz</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Toplam</span>
                  <span>₺{totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
