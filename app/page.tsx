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
import { useState } from 'react';

type Tone = 'persuasive' | 'playful' | 'luxury' | 'urgent';

interface ParsedAd {
  style: string;
  headline: string;
  body: string;
  cta: string;
}

const TONES: { value: Tone; label: string }[] = [
  { value: 'persuasive', label: 'Persuasive' },
  { value: 'playful',    label: 'Playful' },
  { value: 'luxury',     label: 'Luxury' },
  { value: 'urgent',     label: 'Urgent / sale' },
];

const EXAMPLES = [
  'Vitamin C serum for glowing skin, 30ml, cruelty-free, dermatologist tested',
  'Wireless noise-cancelling headphones, 40hr battery, premium sound, foldable design',
  'Handmade soy candle, lavender + eucalyptus scent, 50hr burn time, gift-ready packaging',
];

export default function Home() {
  const [input, setInput]     = useState('');
  const [tone, setTone]       = useState<Tone>('persuasive');
  const [ads, setAds]         = useState<ParsedAd[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [copied, setCopied]   = useState<number | null>(null);

  const handleGenerate = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError('');
    setAds([]);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, tone }),
      });
      const data = await res.json();

      if (data.error) throw new Error(JSON.stringify(data.error));

      if (data.ads && data.ads.length > 0) {
        setAds(data.ads);
      } else if (data.output) {
        // Graceful fallback: show raw output as a single card
        setAds([{ style: 'Generated', headline: '', body: data.output, cta: '' }]);
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
      .filter(Boolean)
      .join('\n\n');

  const handleCopy = (ad: ParsedAd, index: number) => {
    navigator.clipboard.writeText(adToText(ad)).catch(() => {});
    setCopied(index);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,400;9..40,500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #f7f6f3;
          color: #1a1a18;
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
        }

        .page {
          max-width: 720px;
          margin: 0 auto;
          padding: 3rem 1.25rem 4rem;
        }

        .header { margin-bottom: 2.5rem; }

        .logo {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 0.6rem;
        }

        .logo-icon {
          width: 34px;
          height: 34px;
          background: #1a1a18;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .brand {
          font-family: 'Instrument Serif', serif;
          font-size: 22px;
          color: #1a1a18;
          letter-spacing: -0.3px;
        }

        .tagline {
          font-size: 14px;
          color: #7a7a72;
          line-height: 1.5;
        }

        .card {
          background: #fff;
          border: 0.5px solid rgba(0,0,0,0.1);
          border-radius: 14px;
          padding: 1.5rem;
          margin-bottom: 1rem;
        }

        .field-label {
          display: block;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: #7a7a72;
          margin-bottom: 0.6rem;
        }

        .ag-textarea {
          width: 100%;
          min-height: 120px;
          resize: vertical;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          color: #1a1a18;
          background: #f7f6f3;
          border: 0.5px solid rgba(0,0,0,0.1);
          border-radius: 9px;
          padding: 12px 14px;
          outline: none;
          line-height: 1.65;
          transition: border-color 0.15s;
        }
        .ag-textarea:focus { border-color: rgba(0,0,0,0.35); }
        .ag-textarea::placeholder { color: #b0afa8; }

        .chips {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 6px;
          margin-top: 0.75rem;
        }
        .chips-label { font-size: 12px; color: #b0afa8; }

        .chip {
          font-size: 12px;
          font-family: 'DM Sans', sans-serif;
          padding: 4px 10px;
          border-radius: 20px;
          border: 0.5px solid rgba(0,0,0,0.12);
          color: #7a7a72;
          background: transparent;
          cursor: pointer;
          transition: all 0.15s;
        }
        .chip:hover {
          background: #f7f6f3;
          color: #1a1a18;
          border-color: rgba(0,0,0,0.22);
        }

        .divider {
          height: 0.5px;
          background: rgba(0,0,0,0.08);
          margin: 1.25rem 0;
        }

        .tone-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }

        .tone-option {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 10px 12px;
          border-radius: 9px;
          border: 0.5px solid rgba(0,0,0,0.1);
          cursor: pointer;
          background: transparent;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.15s;
          text-align: left;
        }
        .tone-option:hover { background: #f7f6f3; border-color: rgba(0,0,0,0.2); }
        .tone-option.active { border-color: rgba(0,0,0,0.35); background: #f7f6f3; }

        .tone-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          border: 1.5px solid rgba(0,0,0,0.25);
          flex-shrink: 0;
          transition: all 0.15s;
        }
        .tone-option.active .tone-dot { background: #1a1a18; border-color: #1a1a18; }

        .tone-label { font-size: 13px; color: #7a7a72; }
        .tone-option.active .tone-label { color: #1a1a18; font-weight: 500; }

        .card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 1.25rem;
          flex-wrap: wrap;
          gap: 10px;
        }

        .char-count { font-size: 12px; color: #b0afa8; }

        .btn-generate {
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 500;
          padding: 10px 22px;
          border-radius: 9px;
          border: none;
          background: #1a1a18;
          color: #fff;
          cursor: pointer;
          transition: opacity 0.15s, transform 0.1s;
        }
        .btn-generate:hover:not(:disabled) { opacity: 0.82; }
        .btn-generate:active:not(:disabled) { transform: scale(0.98); }
        .btn-generate:disabled { opacity: 0.4; cursor: not-allowed; }

        .output { margin-top: 1.5rem; }

        .output-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
        }
        .output-title {
          font-family: 'Instrument Serif', serif;
          font-size: 19px;
          color: #1a1a18;
        }
        .output-badge {
          font-size: 11px;
          font-weight: 500;
          padding: 3px 9px;
          border-radius: 20px;
          background: #e8f5ec;
          color: #2d7a47;
        }

        .ad-card {
          background: #fff;
          border: 0.5px solid rgba(0,0,0,0.1);
          border-radius: 14px;
          padding: 1.25rem 1.5rem;
          margin-bottom: 0.75rem;
        }

        .ad-style-badge {
          display: inline-block;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #7a7a72;
          margin-bottom: 0.65rem;
        }

        .ad-headline {
          font-size: 16px;
          font-weight: 500;
          color: #1a1a18;
          margin-bottom: 0.5rem;
          line-height: 1.4;
        }
        .ad-body {
          font-size: 14px;
          color: #3a3a35;
          line-height: 1.75;
          white-space: pre-wrap;
        }
        .ad-cta {
          display: inline-block;
          margin-top: 0.75rem;
          font-size: 13px;
          font-weight: 500;
          color: #1a1a18;
          background: #f7f6f3;
          border: 0.5px solid rgba(0,0,0,0.12);
          border-radius: 6px;
          padding: 4px 10px;
        }

        .ad-actions {
          display: flex;
          gap: 8px;
          margin-top: 1rem;
          padding-top: 0.75rem;
          border-top: 0.5px solid rgba(0,0,0,0.07);
        }
        .btn-copy {
          font-size: 12px;
          font-family: 'DM Sans', sans-serif;
          padding: 5px 12px;
          border-radius: 7px;
          border: 0.5px solid rgba(0,0,0,0.12);
          background: transparent;
          color: #7a7a72;
          cursor: pointer;
          transition: all 0.15s;
        }
        .btn-copy:hover { background: #f7f6f3; color: #1a1a18; border-color: rgba(0,0,0,0.2); }
        .btn-copy.copied { color: #2d7a47; border-color: rgba(45,122,71,0.3); }

        .loading {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 1.5rem;
          font-size: 14px;
          color: #7a7a72;
        }
        .dots { display: flex; gap: 4px; }
        .dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          background: #b0afa8;
          animation: pulse 1.2s ease-in-out infinite;
        }
        .dot:nth-child(2) { animation-delay: 0.2s; }
        .dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes pulse {
          0%, 80%, 100% { opacity: 0.25; }
          40% { opacity: 1; }
        }

        .error-box {
          background: #fff;
          border: 0.5px solid rgba(200,60,60,0.35);
          border-radius: 9px;
          padding: 1rem 1.25rem;
          font-size: 14px;
          color: #a33030;
        }

        @media (max-width: 480px) {
          .tone-grid { grid-template-columns: 1fr; }
          .page { padding: 2rem 1rem 3rem; }
        }
      `}</style>

      <div className="page">

        <header className="header">
          <div className="logo">
            <div className="logo-icon">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M3 14L9 4L15 14" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M5.5 10.5H12.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="brand">Ad On Ai</span>
          </div>
          <p className="tagline">Generate high-converting ads for your products in seconds.</p>
        </header>

        <div className="card">
          <label className="field-label" htmlFor="ag-input">Product details or URL</label>
          <textarea
            id="ag-input"
            className="ag-textarea"
            placeholder="e.g. Vitamin C serum that brightens skin tone and reduces dark spots, suitable for all skin types..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={5}
          />

          <div className="chips">
            <span className="chips-label">Try:</span>
            {EXAMPLES.map((ex) => (
              <button key={ex} className="chip" onClick={() => setInput(ex)}>
                {ex.split(',')[0]}
              </button>
            ))}
          </div>

          <div className="divider" />

          <label className="field-label">Ad tone</label>
          <div className="tone-grid">
            {TONES.map((t) => (
              <button
                key={t.value}
                className={`tone-option${tone === t.value ? ' active' : ''}`}
                onClick={() => setTone(t.value)}
              >
                <div className="tone-dot" />
                <span className="tone-label">{t.label}</span>
              </button>
            ))}
          </div>

          <div className="card-footer">
            <span className="char-count">
              {input.length} character{input.length !== 1 ? 's' : ''}
            </span>
            <button
              className="btn-generate"
              onClick={handleGenerate}
              disabled={loading || !input.trim()}
            >
              {loading ? 'Generating…' : 'Generate ads'}
            </button>
          </div>
        </div>

        {(loading || error || ads.length > 0) && (
          <div className="output">
            {loading && (
              <div className="loading">
                <div className="dots">
                  <div className="dot" /><div className="dot" /><div className="dot" />
                </div>
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
                    {ad.style && <span className="ad-style-badge">{ad.style}</span>}
                    {ad.headline && <div className="ad-headline">{ad.headline}</div>}
                    {ad.body     && <div className="ad-body">{ad.body}</div>}
                    {ad.cta      && <span className="ad-cta">{ad.cta}</span>}
                    <div className="ad-actions">
                      <button
                        className={`btn-copy${copied === i ? ' copied' : ''}`}
                        onClick={() => handleCopy(ad, i)}
                      >
                        {copied === i ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

      </div>
    </>
  );
}