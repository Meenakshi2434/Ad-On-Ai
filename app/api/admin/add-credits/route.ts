import { NextRequest } from 'next/server';
import { addCredits, getUsage, PAID_CREDITS } from '@/lib/usage';

// Simple secret header so only you can call this.
// Set ADMIN_SECRET in your Vercel env vars to any long random string.
// Call it like:
//   curl -X POST https://yoursite.vercel.app/api/admin/add-credits \
//     -H "Content-Type: application/json" \
//     -H "x-admin-secret: YOUR_SECRET" \
//     -d '{"ip": "USER_IP_HERE", "credits": 20}'

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-admin-secret');
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { ip, credits = PAID_CREDITS } = body;

  if (!ip) {
    return Response.json({ error: 'ip is required' }, { status: 400 });
  }

  await addCredits(ip, credits);
  const updated = await getUsage(ip);

  return Response.json({
    success: true,
    ip,
    creditsAdded: credits,
    newRemaining: updated.remaining,
  });
}