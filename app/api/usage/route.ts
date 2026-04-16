import { NextRequest } from 'next/server';
import { getUsage, FREE_LIMIT, PRICE_INR, PAID_CREDITS } from '@/lib/usage';
import { getIP } from '@/lib/ip';

export async function GET(req: NextRequest) {
  const ip    = getIP(req);
  const usage = await getUsage(ip);
  return Response.json({
    ...usage,
    freeLimit:   FREE_LIMIT,
    priceINR:    PRICE_INR,
    paidCredits: PAID_CREDITS,
  });
}