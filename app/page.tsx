// 'use client';
// import { useState } from 'react';

// export default function Home() {
//   const [input, setInput] = useState('');
//   const [output, setOutput] = useState('');

//   const handleGenerate = async () => {
//     setOutput("Generating...");

//     const res = await fetch("/api/generate", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json"
//       },
//       body: JSON.stringify({ input })
//     });

//     const data = await res.json();
//     setOutput(data.output);
//   };

//   return (
//     <div style={{ padding: '40px', fontFamily: 'Arial', maxWidth: '800px', margin: 'auto' }}>
      
//       {/* Header */}
//       <h1>🚀 AdGenie AI</h1>
//       <p>Generate high-converting ads for your Shopify products in seconds.</p>

//       {/* Input */}
//       <h3>Enter Product Details or URL</h3>
//       <textarea
//         placeholder="e.g. Vitamin C serum for glowing skin..."
//         value={input}
//         onChange={(e) => setInput(e.target.value)}
//         rows={6}
//         style={{ width: '100%', marginTop: '10px', padding: '10px' }}
//       />

//       {/* Button */}
//       <button
//         onClick={handleGenerate}
//         style={{
//           marginTop: '20px',
//           padding: '12px 20px',
//           cursor: 'pointer',
//           backgroundColor: '#000',
//           color: '#fff',
//           border: 'none'
//         }}
//       >
//         Generate Ads 🚀
//       </button>

//       {/* Output */}
//       {output && (
//         <div style={{ marginTop: '40px' }}>
//           <h2>✨ Generated Output</h2>
//           <div style={{ background: '#f5f5f5', padding: '20px', whiteSpace: 'pre-wrap' }}>
//             {output}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


'use client';
import { useState, useEffect } from 'react';

type Tone = 'persuasive' | 'playful' | 'luxury' | 'urgent';

interface ParsedAd { style: string; headline: string; body: string; cta: string; }

interface UsageState {
  remaining: number; freeLimit: number; priceINR: number;
  paidCredits: number; loaded: boolean;
}

const TONES: { value: Tone; label: string; desc: string }[] = [
  { value: 'persuasive', label: 'Persuasive',   desc: 'Benefits-led, compelling' },
  { value: 'playful',    label: 'Playful',       desc: 'Fun, witty, relatable'    },
  { value: 'luxury',     label: 'Luxury',        desc: 'Premium, aspirational'    },
  { value: 'urgent',     label: 'Urgent / sale', desc: 'FOMO, limited time'       },
];

const EXAMPLES = [
  { label: 'Skincare serum', text: 'Vitamin C serum for glowing skin, 30ml, cruelty-free, dermatologist tested, priced at ₹599' },
  { label: 'Headphones',     text: 'Wireless noise-cancelling headphones, 40hr battery, premium sound, foldable design, priced at ₹2999' },
  { label: 'Scented candle', text: 'Handmade soy candle, lavender & eucalyptus scent, 50hr burn time, gift-ready packaging, priced at ₹349' },
];

// ── FILL THESE IN ─────────────────────────────────────────────────────────────
const UPI_ID         = 'meenakshi.jangra2434@okicici';          // your UPI ID
const WHATSAPP_NUM   = '918059867121';           // your number with country code, no +
const UPI_QR_URL     = '';                       // optional: paste a URL to your UPI QR image
// ─────────────────────────────────────────────────────────────────────────────

export default function Home() {
  const [input, setInput]             = useState('');
  const [tone, setTone]               = useState<Tone>('persuasive');
  const [ads, setAds]                 = useState<ParsedAd[]>([]);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [copied, setCopied]           = useState<number | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [copiedUPI, setCopiedUPI]     = useState(false);
  const [usage, setUsage]             = useState<UsageState>({
    remaining: 5, freeLimit: 5, priceINR: 49, paidCredits: 20, loaded: false,
  });

  useEffect(() => {
    fetch('/api/usage')
      .then((r) => r.json())
      .then((d) => setUsage({ ...d, loaded: true }))
      .catch(() => setUsage((u) => ({ ...u, loaded: true })));
  }, []);

  const handleGenerate = async () => {
    if (!input.trim()) return;
    if (usage.loaded && usage.remaining <= 0) { setShowPaywall(true); return; }

    setLoading(true);
    setError('');
    setAds([]);

    try {
      const res  = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, tone }),
      });
      const data = await res.json();

      if (res.status === 402 || data.error === 'limit_reached') {
        setShowPaywall(true); return;
      }
      if (data.error) throw new Error(data.error);

      setAds(data.ads?.length > 0
        ? data.ads
        : [{ style: 'Generated', headline: '', body: data.output ?? '', cta: '' }]
      );
      if (typeof data.remaining === 'number') {
        setUsage((u) => ({ ...u, remaining: data.remaining }));
      }
    } catch (e) {
      console.error(e);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const adToText = (ad: ParsedAd) =>
    [ad.headline && `Headline: ${ad.headline}`, ad.body, ad.cta && `CTA: ${ad.cta}`]
      .filter(Boolean).join('\n\n');

  const handleCopy = (ad: ParsedAd, i: number) => {
    navigator.clipboard.writeText(adToText(ad)).catch(() => {});
    setCopied(i);
    setTimeout(() => setCopied(null), 1500);
  };

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(UPI_ID).catch(() => {});
    setCopiedUPI(true);
    setTimeout(() => setCopiedUPI(false), 2000);
  };

  const whatsappMsg  = encodeURIComponent(
    `Hi! I just paid ₹${usage.priceINR} for AdGenie. My IP will be in the message — please activate my ${usage.paidCredits} credits. Thanks!`
  );
  const whatsappLink = `https://wa.me/${WHATSAPP_NUM}?text=${whatsappMsg}`;

  const usagePct  = usage.loaded ? Math.min(100, (usage.remaining / usage.freeLimit) * 100) : 100;
  const pillClass = usage.remaining === 0 ? 'zero' : usage.remaining <= 2 ? 'low' : '';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,400;9..40,500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body { background: #f4f3f0; color: #1a1a18; font-family: 'DM Sans', sans-serif; min-height: 100vh; }

        .page { width: 80%; margin: 0 auto; padding: 3rem 1rem 5rem; }

        /* Header */
        .header { margin-bottom: 2.25rem; }
        .logo { display: flex; align-items: center; gap: 10px; margin-bottom: 0.5rem; }
        .logo-mark { width: 36px; height: 36px; background: #1a1a18; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .brand { font-family: 'Instrument Serif', serif; font-size: 23px; color: #1a1a18; letter-spacing: -0.3px; }
        .tagline { font-size: 14px; color: #888780; line-height: 1.5; }

        /* Usage bar */
        .usage-row { display: flex; align-items: center; gap: 10px; margin-top: 1rem; flex-wrap: wrap; }
        .usage-pill { font-size: 12px; font-weight: 500; padding: 3px 10px; border-radius: 20px; background: #e6f4ec; color: #276b40; transition: background 0.2s, color 0.2s; }
        .usage-pill.low  { background: #fef3e2; color: #b45309; }
        .usage-pill.zero { background: #fee2e2; color: #991b1b; }
        .usage-bar-wrap { flex: 1; height: 3px; background: rgba(0,0,0,0.08); border-radius: 2px; overflow: hidden; min-width: 60px; }
        .usage-bar { height: 100%; background: #1a1a18; border-radius: 2px; transition: width 0.4s ease, background 0.3s; }
        .usage-bar.low  { background: #b45309; }
        .usage-bar.zero { background: #991b1b; }
        .usage-hint { font-size: 12px; color: #b0afa8; }

        /* Card */
        .card { background: #fff; border: 0.5px solid rgba(0,0,0,0.09); border-radius: 16px; padding: 1.5rem; margin-bottom: 1rem; }
        .field-label { display: block; font-size: 11px; font-weight: 500; letter-spacing: 0.07em; text-transform: uppercase; color: #888780; margin-bottom: 0.6rem; }

        /* Textarea */
        .ag-textarea { width: 100%; min-height: 112px; resize: vertical; font-family: 'DM Sans', sans-serif; font-size: 15px; color: #1a1a18; background: #f4f3f0; border: 0.5px solid rgba(0,0,0,0.1); border-radius: 10px; padding: 12px 14px; outline: none; line-height: 1.65; transition: border-color 0.15s; }
        .ag-textarea:focus { border-color: rgba(0,0,0,0.32); background: #f0efec; }
        .ag-textarea::placeholder { color: #c2c0b8; }

        /* Chips */
        .chips { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; margin-top: 0.65rem; }
        .chips-label { font-size: 12px; color: #b0afa8; }
        .chip { font-size: 12px; font-family: 'DM Sans', sans-serif; padding: 4px 10px; border-radius: 20px; border: 0.5px solid rgba(0,0,0,0.12); color: #888780; background: transparent; cursor: pointer; transition: all 0.15s; }
        .chip:hover { background: #f4f3f0; color: #1a1a18; border-color: rgba(0,0,0,0.22); }

        .divider { height: 0.5px; background: rgba(0,0,0,0.07); margin: 1.25rem 0; }

        /* Tone */
        .tone-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .tone-btn { display: flex; flex-direction: column; gap: 2px; padding: 10px 12px; border-radius: 10px; border: 0.5px solid rgba(0,0,0,0.1); cursor: pointer; background: transparent; font-family: 'DM Sans', sans-serif; transition: all 0.15s; text-align: left; }
        .tone-btn:hover { background: #f4f3f0; border-color: rgba(0,0,0,0.18); }
        .tone-btn.active { border-color: rgba(0,0,0,0.32); background: #f0efec; }
        .tone-name { font-size: 13px; font-weight: 500; color: #888780; }
        .tone-btn.active .tone-name { color: #1a1a18; }
        .tone-desc { font-size: 11px; color: #b0afa8; }

        /* Footer */
        .card-footer { display: flex; align-items: center; justify-content: space-between; margin-top: 1.25rem; flex-wrap: wrap; gap: 10px; }
        .char-count { font-size: 12px; color: #b0afa8; }

        /* Generate btn */
        .btn-generate { font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500; padding: 10px 22px; border-radius: 10px; border: none; background: #1a1a18; color: #fff; cursor: pointer; transition: opacity 0.15s, transform 0.1s; }
        .btn-generate:hover:not(:disabled) { opacity: 0.82; }
        .btn-generate:active:not(:disabled) { transform: scale(0.98); }
        .btn-generate:disabled { opacity: 0.38; cursor: not-allowed; }

        /* Output */
        .output { margin-top: 1.5rem; }
        .output-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; }
        .output-title { font-family: 'Instrument Serif', serif; font-size: 19px; color: #1a1a18; }
        .output-badge { font-size: 11px; font-weight: 500; padding: 3px 9px; border-radius: 20px; background: #e6f4ec; color: #276b40; }

        /* Ad card */
        .ad-card { background: #fff; border: 0.5px solid rgba(0,0,0,0.09); border-radius: 14px; padding: 1.25rem 1.5rem; margin-bottom: 0.75rem; transition: border-color 0.15s; }
        .ad-card:hover { border-color: rgba(0,0,0,0.16); }
        .ad-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem; }
        .ad-style { font-size: 11px; font-weight: 500; letter-spacing: 0.07em; text-transform: uppercase; color: #b0afa8; }
        .ad-num { font-size: 11px; color: #c2c0b8; }
        .ad-headline { font-size: 16px; font-weight: 500; color: #1a1a18; margin-bottom: 0.5rem; line-height: 1.4; }
        .ad-body { font-size: 14px; color: #3d3d3a; line-height: 1.75; white-space: pre-wrap; }
        .ad-cta { display: inline-flex; align-items: center; gap: 5px; margin-top: 0.8rem; font-size: 13px; font-weight: 500; color: #1a1a18; background: #f4f3f0; border: 0.5px solid rgba(0,0,0,0.1); border-radius: 7px; padding: 5px 11px; }
        .ad-actions { display: flex; gap: 8px; margin-top: 1rem; padding-top: 0.75rem; border-top: 0.5px solid rgba(0,0,0,0.06); }
        .btn-copy { font-size: 12px; font-family: 'DM Sans', sans-serif; padding: 5px 12px; border-radius: 7px; border: 0.5px solid rgba(0,0,0,0.1); background: transparent; color: #888780; cursor: pointer; transition: all 0.15s; }
        .btn-copy:hover { background: #f4f3f0; color: #1a1a18; border-color: rgba(0,0,0,0.18); }
        .btn-copy.copied { color: #276b40; border-color: rgba(39,107,64,0.3); background: #f0f9f3; }

        /* Loading */
        .loading { display: flex; align-items: center; gap: 10px; padding: 1.5rem; font-size: 14px; color: #888780; }
        .dots { display: flex; gap: 4px; }
        .dot { width: 5px; height: 5px; border-radius: 50%; background: #c2c0b8; animation: pulse 1.2s ease-in-out infinite; }
        .dot:nth-child(2) { animation-delay: 0.2s; }
        .dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes pulse { 0%,80%,100% { opacity: 0.2; } 40% { opacity: 1; } }

        /* Error */
        .error-box { background: #fff; border: 0.5px solid rgba(200,60,60,0.3); border-radius: 10px; padding: 1rem 1.25rem; font-size: 14px; color: #a33030; }

        /* Paywall overlay */
        .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center; z-index: 100; padding: 1rem; animation: fadeIn 0.15s ease; overflow-y: auto; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        .paywall { background: #fff; border-radius: 18px; padding: 2rem 1.75rem; max-width: 380px; width: 100%; animation: slideUp 0.2s ease; }
        @keyframes slideUp { from { transform: translateY(12px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

        .paywall-title { font-family: 'Instrument Serif', serif; font-size: 22px; color: #1a1a18; margin-bottom: 0.4rem; }
        .paywall-sub { font-size: 14px; color: #888780; line-height: 1.6; margin-bottom: 1.5rem; }

        /* Steps */
        .steps { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1.5rem; }
        .step { display: flex; gap: 12px; align-items: flex-start; }
        .step-num { width: 24px; height: 24px; background: #1a1a18; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 500; flex-shrink: 0; margin-top: 1px; }
        .step-body { flex: 1; }
        .step-title { font-size: 13px; font-weight: 500; color: #1a1a18; margin-bottom: 4px; }
        .step-desc { font-size: 12px; color: #888780; line-height: 1.5; }

        /* UPI block */
        .upi-block { background: #f4f3f0; border-radius: 12px; padding: 1.1rem 1.25rem; margin-bottom: 0.75rem; }
        .upi-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
        .upi-label { font-size: 11px; font-weight: 500; letter-spacing: 0.06em; text-transform: uppercase; color: #b0afa8; margin-bottom: 5px; }
        .upi-id { font-size: 16px; font-weight: 500; color: #1a1a18; font-family: monospace; }
        .btn-upi-copy { font-size: 12px; font-family: 'DM Sans', sans-serif; padding: 5px 12px; border-radius: 7px; border: 0.5px solid rgba(0,0,0,0.14); background: #fff; color: #888780; cursor: pointer; flex-shrink: 0; transition: all 0.15s; white-space: nowrap; }
        .btn-upi-copy:hover { color: #1a1a18; border-color: rgba(0,0,0,0.25); }
        .btn-upi-copy.copied { color: #276b40; border-color: rgba(39,107,64,0.3); }

        .upi-amount { font-size: 13px; color: #888780; margin-top: 8px; }
        .upi-amount strong { color: #1a1a18; }

        /* QR */
        .qr-wrap { text-align: center; margin: 0.75rem 0; }
        .qr-wrap img { width: 140px; height: 140px; border-radius: 10px; border: 0.5px solid rgba(0,0,0,0.1); }

        /* WhatsApp btn */
        .btn-whatsapp { display: flex; align-items: center; justify-content: center; gap: 9px; width: 100%; font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 500; padding: 13px; border-radius: 11px; border: none; background: #25D366; color: #fff; cursor: pointer; transition: opacity 0.15s, transform 0.1s; margin-bottom: 0.75rem; text-decoration: none; }
        .btn-whatsapp:hover { opacity: 0.88; }
        .btn-whatsapp:active { transform: scale(0.98); }

        .btn-dismiss { width: 100%; font-family: 'DM Sans', sans-serif; font-size: 14px; padding: 10px; border-radius: 11px; border: 0.5px solid rgba(0,0,0,0.1); background: transparent; color: #888780; cursor: pointer; transition: all 0.15s; }
        .btn-dismiss:hover { background: #f4f3f0; color: #1a1a18; }

        .paywall-note { font-size: 11px; color: #c2c0b8; margin-top: 0.75rem; text-align: center; }

        @media (max-width: 480px) {
          .tone-grid { grid-template-columns: 1fr; }
          .page { padding: 1.75rem 1rem 4rem; }
          .paywall { padding: 1.5rem; }
        }
      `}</style>

      <div className="page">

        {/* Header */}
        <header className="header">
          <div className="logo">
            <div className="logo-mark">
              <svg width="60" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 16L10 5L16 16" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6.5 11.5H13.5" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="brand">Ad On Ai</span>
          </div>
          <p className="tagline">Generate high-converting Facebook ads for your products in seconds.</p>

          {usage.loaded && (
            <div className="usage-row">
              <span className={`usage-pill ${pillClass}`}>
                {usage.remaining} generation{usage.remaining !== 1 ? 's' : ''} left
              </span>
              <div className="usage-bar-wrap">
                <div className={`usage-bar ${pillClass}`} style={{ width: `${usagePct}%` }} />
              </div>
              {usage.remaining === 0 && (
                <span className="usage-hint">Pay ₹{usage.priceINR} for {usage.paidCredits} more</span>
              )}
            </div>
          )}
        </header>

        {/* Input card */}
        <div className="card">
          <label className="field-label" htmlFor="ag-input">Product details or URL</label>
          <textarea
            id="ag-input"
            className="ag-textarea"
            placeholder="Describe your product — name, key benefits, price, who it's for..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={4}
          />
          <div className="chips">
            <span className="chips-label">Try:</span>
            {EXAMPLES.map((ex) => (
              <button key={ex.label} className="chip" onClick={() => setInput(ex.text)}>
                {ex.label}
              </button>
            ))}
          </div>

          <div className="divider" />

          <label className="field-label">Ad tone</label>
          <div className="tone-grid">
            {TONES.map((t) => (
              <button
                key={t.value}
                className={`tone-btn${tone === t.value ? ' active' : ''}`}
                onClick={() => setTone(t.value)}
              >
                <span className="tone-name">{t.label}</span>
                <span className="tone-desc">{t.desc}</span>
              </button>
            ))}
          </div>

          <div className="card-footer">
            <span className="char-count">{input.length} character{input.length !== 1 ? 's' : ''}</span>
            <button
              className="btn-generate"
              onClick={handleGenerate}
              disabled={loading || !input.trim()}
            >
              {loading ? 'Generating…' : usage.loaded && usage.remaining === 0 ? 'Get more credits' : 'Generate ads'}
            </button>
          </div>
        </div>

        {/* Output */}
        {(loading || error || ads.length > 0) && (
          <div className="output">
            {loading && (
              <div className="loading">
                <div className="dots"><div className="dot"/><div className="dot"/><div className="dot"/></div>
                <span>Writing your ads…</span>
              </div>
            )}
            {error && <div className="error-box">{error}</div>}
            {!loading && ads.length > 0 && (
              <>
                <div className="output-header">
                  <span className="output-title">Generated ads</span>
                  <span className="output-badge">{ads.length} variant{ads.length !== 1 ? 's' : ''}</span>
                </div>
                {ads.map((ad, i) => (
                  <div key={i} className="ad-card">
                    <div className="ad-top">
                      <span className="ad-style">{ad.style || `Ad ${i + 1}`}</span>
                      <span className="ad-num">#{i + 1}</span>
                    </div>
                    {ad.headline && <div className="ad-headline">{ad.headline}</div>}
                    {ad.body     && <div className="ad-body">{ad.body}</div>}
                    {ad.cta      && (
                      <span className="ad-cta">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M2 10L10 2M10 2H4M10 2V8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        {ad.cta}
                      </span>
                    )}
                    <div className="ad-actions">
                      <button
                        className={`btn-copy${copied === i ? ' copied' : ''}`}
                        onClick={() => handleCopy(ad, i)}
                      >
                        {copied === i ? 'Copied' : 'Copy ad'}
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {/* Paywall modal */}
      {showPaywall && (
        <div className="overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowPaywall(false); }}>
          <div className="paywall">
            <h2 className="paywall-title">You&apos;ve used your free generations</h2>
            <p className="paywall-sub">
              Pay ₹{usage.priceINR} once and get {usage.paidCredits} more generations.
              No subscription, no account needed.
            </p>

            {/* Steps */}
            <div className="steps">
              <div className="step">
                <div className="step-num">1</div>
                <div className="step-body">
                  <div className="step-title">Pay ₹{usage.priceINR} to this UPI ID</div>
                  <div className="step-desc">Use GPay, PhonePe, Paytm or any UPI app</div>
                </div>
              </div>
              <div className="step">
                <div className="step-num">2</div>
                <div className="step-body">
                  <div className="step-title">Send payment screenshot on WhatsApp</div>
                  <div className="step-desc">Tap the button below — message is pre-filled</div>
                </div>
              </div>
              <div className="step">
                <div className="step-num">3</div>
                <div className="step-body">
                  <div className="step-title">Credits activated within a few hours</div>
                  <div className="step-desc">Refresh the page once you get a confirmation</div>
                </div>
              </div>
            </div>

            {/* UPI block */}
            <div className="upi-block">
              <div className="upi-label">UPI ID</div>
              <div className="upi-row">
                <span className="upi-id">{UPI_ID}</span>
                <button
                  className={`btn-upi-copy${copiedUPI ? ' copied' : ''}`}
                  onClick={handleCopyUPI}
                >
                  {copiedUPI ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div className="upi-amount">Amount: <strong>₹{usage.priceINR}</strong></div>
            </div>

            {/* Optional QR */}
            {UPI_QR_URL && (
              <div className="qr-wrap">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={UPI_QR_URL} alt="UPI QR code" />
              </div>
            )}

            {/* WhatsApp CTA */}
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 1.667A8.333 8.333 0 1 0 17.26 14.41l1.073 3.923-3.923-1.073A8.333 8.333 0 0 0 10 1.667Z" stroke="white" strokeWidth="1.4" strokeLinejoin="round"/>
                <path d="M7.5 8.333c0-.46.373-.833.833-.833h.834c.46 0 .833.373.833.833 0 .834.834 1.667.834 1.667s.833-.833 1.666-.833c.46 0 .833.373.833.833 0 .46-.372.833-.833.833A4.167 4.167 0 0 1 8.333 9.167c-.46 0-.833-.373-.833-.834Z" fill="white"/>
              </svg>
              Send screenshot on WhatsApp
            </a>

            <button className="btn-dismiss" onClick={() => setShowPaywall(false)}>
              Maybe later
            </button>
            <p className="paywall-note">Credits added manually · usually within a few hours</p>
          </div>
        </div>
      )}
    </>
  );
}