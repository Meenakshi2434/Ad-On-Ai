// import { NextRequest } from 'next/server';

// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json();
//     const { input } = body;

//     console.log("API KEY:", process.env.OPENAI_API_KEY);

//     const response = await fetch("https://api.openai.com/v1/chat/completions", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
//       },
//       body: JSON.stringify({
//         model: "gpt-4o-mini",
//         messages: [
//           {
//             role: "user",
//             content: `Act as a D2C marketing expert. Generate 3 ad copies for: ${input}`
//           }
//         ]
//       })
//     });

//     const data = await response.json();

//     console.log("OPENAI RESPONSE:", data);

//     // ✅ SAFETY CHECK
//     if (!data.choices) {
//       return Response.json({
//         error: "OpenAI error",
//         details: data
//       }, { status: 500 });
//     }

//     return Response.json({
//       output: data.choices[0].message.content
//     });

//   } catch (error) {
//     console.log("ERROR:", error);
//     return Response.json({ error: "Something went wrong" }, { status: 500 });
//   }
// }

// import { NextRequest } from 'next/server';

// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json();
//     const { input } = body;

//     const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
//         "HTTP-Referer": "http://localhost:3000", // required
//         "X-Title": "Shopify AI Tool"
//       },
//       body: JSON.stringify({
//         model: "openai/gpt-oss-120b:free",
//         messages: [
//           {
//             role: "user",
//             content: ` 
//             Act as a senior D2C marketing expert for ${input}.

// Generate 5 high-converting Facebook ad copies for the following product:

// [PRODUCT DETAILS]

// Instructions:
// - Each ad must be DIFFERENT in style:
//   1. Emotional storytelling
//   2. Problem-solution
//   3. Discount/offer focused
//   4. Premium branding
//   5. Urgency/FOMO

// - Keep language simple and realistic (avoid fake claims like "9/10 users")
// - Target Indian audience
// - Mention price naturally
// - Make ads scroll-stopping

// Format:

// Ad 1 (Emotional):
// Headline:
// Body:
// CTA:

// Ad 2 (Problem-Solution):
// ...

// Ad 3 (Discount):
// ...

// Ad 4 (Premium):
// ...

// Ad 5 (FOMO):
// ...`
//           }
//         ]
//       })
//     });

//     const data = await response.json();

//     console.log("OPENROUTER RESPONSE:", data);

//     if (!data.choices) {
//       return Response.json({ error: data }, { status: 500 });
//     }

//     return Response.json({
//       output: data.choices[0].message.content
//     });

//   } catch (error) {
//     console.log("ERROR:", error);
//     return Response.json({ error: "Something went wrong" }, { status: 500 });
//   }
// }
import { NextRequest } from 'next/server';
import { getUsage, incrementUsage } from '@/lib/usage';
import { getIP } from '@/lib/ip';

const TONE_INSTRUCTIONS: Record<string, string> = {
  persuasive: 'Focus on benefits and emotional appeal. Be conversational and compelling.',
  playful:    'Use a fun, witty tone. Light humour, punchy lines, relatable references.',
  luxury:     'Premium, aspirational tone. Minimal, refined language. No discount talk.',
  urgent:     'Create urgency and FOMO. Highlight limited time, stock, or offer expiry.',
};

export async function POST(req: NextRequest) {
  try {
    const ip   = getIP(req);
    const body = await req.json();
    const { input, tone = 'persuasive' } = body;

    if (!input?.trim()) {
      return Response.json({ error: 'Input is required' }, { status: 400 });
    }

    const usage = await getUsage(ip);
    if (!usage.canGenerate) {
      return Response.json({ error: 'limit_reached', remaining: 0 }, { status: 402 });
    }

    const toneInstruction = TONE_INSTRUCTIONS[tone] ?? TONE_INSTRUCTIONS.persuasive;

    const prompt = `
Act as a senior D2C marketing expert. Generate 5 high-converting Facebook ad copies for this product:

${input}

Tone for all ads: ${tone.toUpperCase()} — ${toneInstruction}

Instructions:
- Each ad must be DIFFERENT in style (emotional, problem-solution, discount, premium, urgency/FOMO)
- Keep language simple and realistic (no fake claims like "9/10 users")
- Target Indian audience, mention price naturally
- Make ads scroll-stopping

Use EXACTLY this format with no extra text before or after:

---AD1---
Style: Emotional
Headline: <headline here>
Body: <body copy here>
CTA: <cta here>

---AD2---
Style: Problem-Solution
Headline: <headline here>
Body: <body copy here>
CTA: <cta here>

---AD3---
Style: Discount / Offer
Headline: <headline here>
Body: <body copy here>
CTA: <cta here>

---AD4---
Style: Premium Branding
Headline: <headline here>
Body: <body copy here>
CTA: <cta here>

---AD5---
Style: Urgency / FOMO
Headline: <headline here>
Body: <body copy here>
CTA: <cta here>
`.trim();

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer':  process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
        'X-Title':       'AdGenie AI',
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b:free',
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();

    if (!data.choices) {
      console.error('OpenRouter error:', data);
      return Response.json({ error: 'AI service error' }, { status: 500 });
    }

    await incrementUsage(ip);

    const raw: string = data.choices[0].message.content;
    const ads = parseAds(raw);
    const updatedUsage = await getUsage(ip);

    return Response.json({ ads, output: raw, remaining: updatedUsage.remaining });

  } catch (error) {
    console.error('Generate error:', error);
    return Response.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

interface ParsedAd {
  style: string;
  headline: string;
  body: string;
  cta: string;
}

function parseAds(raw: string): ParsedAd[] {
  const blocks = raw.split(/---AD\d+---/).map((b) => b.trim()).filter(Boolean);
  return blocks.map((block) => {
    const get = (field: string) => {
      const match = block.match(new RegExp(`${field}:\\s*(.+?)(?=\\n[A-Z]|$)`, 'si'));
      return match ? match[1].trim() : '';
    };
    return { style: get('Style'), headline: get('Headline'), body: get('Body'), cta: get('CTA') };
  });
}