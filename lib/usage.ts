import { kv } from '@vercel/kv';

export const FREE_LIMIT   = 5;
export const PAID_CREDITS = 20;
export const PRICE_INR    = 49;

function usageKey(ip: string)   { return `usage:${ip}`; }
function creditsKey(ip: string) { return `credits:${ip}`; }

export interface UsageInfo {
  used: number;
  credits: number;
  remaining: number;
  canGenerate: boolean;
}

export async function getUsage(ip: string): Promise<UsageInfo> {
  const [used, credits] = await Promise.all([
    kv.get<number>(usageKey(ip)).then((v) => v ?? 0),
    kv.get<number>(creditsKey(ip)).then((v) => v ?? 0),
  ]);
  const freeRemaining = Math.max(0, FREE_LIMIT - used);
  const remaining     = freeRemaining + credits;
  return { used, credits, remaining, canGenerate: remaining > 0 };
}

export async function incrementUsage(ip: string): Promise<void> {
  const credits = await kv.get<number>(creditsKey(ip)) ?? 0;
  if (credits > 0) {
    await kv.decr(creditsKey(ip));
  } else {
    await kv.incr(usageKey(ip));
  }
}

export async function addCredits(ip: string, amount: number): Promise<void> {
  await kv.incrby(creditsKey(ip), amount);
}