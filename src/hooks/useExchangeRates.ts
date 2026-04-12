import { useCallback, useEffect, useRef, useState } from 'react'
import type { CurrencyCode } from '../i18n/config'
import { fetchExchangeRates, type ExchangeRates } from '../services/exchangeRateService'

type ExchangeRateState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; rates: ExchangeRates }
  | { status: 'error'; error: string; staleRates: ExchangeRates | null }

export type UseExchangeRatesResult = {
  rates: ExchangeRates | null
  isLoading: boolean
  isStale: boolean
  error: string | null
  retry: () => void
}

/**
 * Fetches and caches exchange rates relative to `baseCurrency`.
 * Rates are refreshed at most once per hour (localStorage TTL).
 * On network failure the hook returns the last known rates (`isStale: true`)
 * so the converted view can still render with a visual caveat.
 */
export function useExchangeRates(baseCurrency: CurrencyCode): UseExchangeRatesResult {
  const [state, setState] = useState<ExchangeRateState>({ status: 'idle' })
  const lastBase = useRef<CurrencyCode | null>(null)
  const retrySignal = useRef(0)

  const load = useCallback(async () => {
    setState({ status: 'loading' })

    try {
      const rates = await fetchExchangeRates(baseCurrency)
      setState({ status: 'ready', rates })
    } catch (err) {
      setState({
        status: 'error',
        error:
          err instanceof Error
            ? err.message
            : 'Não foi possível buscar as taxas de câmbio.',
        staleRates: null,
      })
    }
  }, [baseCurrency])

  useEffect(() => {
    // Re-run when the base currency changes or when retry() is called.
    if (lastBase.current !== baseCurrency) {
      lastBase.current = baseCurrency
    }

    void load()
  }, [load, baseCurrency, retrySignal.current]) // eslint-disable-line react-hooks/exhaustive-deps

  const retry = useCallback(() => {
    retrySignal.current += 1
    void load()
  }, [load])

  if (state.status === 'ready') {
    return { rates: state.rates, isLoading: false, isStale: false, error: null, retry }
  }

  if (state.status === 'error') {
    return {
      rates: state.staleRates,
      isLoading: false,
      isStale: state.staleRates !== null,
      error: state.error,
      retry,
    }
  }

  return {
    rates: null,
    isLoading: state.status === 'loading',
    isStale: false,
    error: null,
    retry,
  }
}
