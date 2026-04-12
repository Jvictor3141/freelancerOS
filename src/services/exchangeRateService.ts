import type { CurrencyCode } from '../i18n/config'
import { SUPPORTED_CURRENCIES, isSupportedCurrency } from '../i18n/config'

export type ExchangeRates = Record<CurrencyCode, number>

type CachedRates = {
  fetchedAt: number
  baseCurrency: CurrencyCode
  rates: ExchangeRates
}

const CACHE_TTL_MS = 60 * 60 * 1000 // 1 hour
const CACHE_KEY_PREFIX = 'freelanceros:exchange-rates:'

// API: open.er-api.com — free, no key required, returns rates relative to base.
// Response shape: { result: 'success', rates: { USD: 1, BRL: 5.2, ... } }
function buildRateUrl(baseCurrency: CurrencyCode): string {
  return `https://open.er-api.com/v6/latest/${baseCurrency}`
}

function getCacheKey(baseCurrency: CurrencyCode): string {
  return `${CACHE_KEY_PREFIX}${baseCurrency}`
}

function readCache(baseCurrency: CurrencyCode): ExchangeRates | null {
  try {
    const raw = localStorage.getItem(getCacheKey(baseCurrency))
    if (!raw) return null

    const cached = JSON.parse(raw) as CachedRates
    const age = Date.now() - cached.fetchedAt

    if (age > CACHE_TTL_MS) return null

    return cached.rates
  } catch {
    return null
  }
}

function writeCache(baseCurrency: CurrencyCode, rates: ExchangeRates) {
  try {
    const entry: CachedRates = { fetchedAt: Date.now(), baseCurrency, rates }
    localStorage.setItem(getCacheKey(baseCurrency), JSON.stringify(entry))
  } catch {
    // localStorage might be unavailable (private mode quota exceeded)
  }
}

function readStaleFallback(baseCurrency: CurrencyCode): ExchangeRates | null {
  // Return cached data regardless of TTL as a last resort when the network fails.
  try {
    const raw = localStorage.getItem(getCacheKey(baseCurrency))
    if (!raw) return null
    return (JSON.parse(raw) as CachedRates).rates
  } catch {
    return null
  }
}

function extractRates(
  data: unknown,
  baseCurrency: CurrencyCode,
): ExchangeRates | null {
  if (
    typeof data !== 'object' ||
    data === null ||
    !('rates' in data) ||
    typeof (data as Record<string, unknown>).rates !== 'object'
  ) {
    return null
  }

  const raw = (data as { rates: Record<string, unknown> }).rates
  const rates: Partial<ExchangeRates> = {}

  for (const currency of SUPPORTED_CURRENCIES) {
    const value = raw[currency]
    if (typeof value === 'number' && value > 0) {
      rates[currency] = value
    }
  }

  // Ensure base currency is always 1 (API should include it but be defensive)
  rates[baseCurrency] = 1

  const allPresent = SUPPORTED_CURRENCIES.every((c) => typeof rates[c] === 'number')
  return allPresent ? (rates as ExchangeRates) : null
}

/**
 * Fetches exchange rates relative to `baseCurrency`.
 * Returns cached data if fresh (< 1 h). Falls back to stale cache on failure.
 * Throws only when neither the network nor any cached data is available.
 */
export async function fetchExchangeRates(
  baseCurrency: CurrencyCode,
): Promise<ExchangeRates> {
  const cached = readCache(baseCurrency)
  if (cached) return cached

  try {
    const response = await fetch(buildRateUrl(baseCurrency))

    if (!response.ok) {
      throw new Error(`Exchange rate API returned ${response.status}`)
    }

    const data: unknown = await response.json()
    const rates = extractRates(data, baseCurrency)

    if (!rates) {
      throw new Error('Exchange rate API returned unexpected shape')
    }

    writeCache(baseCurrency, rates)
    return rates
  } catch (err) {
    const stale = readStaleFallback(baseCurrency)
    if (stale) return stale

    throw err instanceof Error
      ? err
      : new Error('Não foi possível buscar as taxas de câmbio.')
  }
}

/**
 * Converts `amount` (in `fromCurrency`) to `baseCurrency` using the provided
 * rate table. Rates are relative to baseCurrency (1 base = N foreign).
 * Never mutates stored values — for display only.
 */
export function convertToBase(
  amount: number,
  fromCurrency: CurrencyCode,
  rates: ExchangeRates,
): number {
  const rate = rates[fromCurrency]
  if (!rate || rate === 0) return amount
  // 1 base = `rate` units of fromCurrency → amount / rate = amount in base
  return amount / rate
}

export function isSupportedExchangeCurrency(
  value: string,
): value is CurrencyCode {
  return isSupportedCurrency(value)
}
