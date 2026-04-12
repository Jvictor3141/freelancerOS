import { useLang } from './useLang';

/**
 * Returns a helper function that generates language-prefixed paths.
 *
 * Usage:
 *   const langPath = useLangPath();
 *   langPath('/dashboard'); // → /pt/dashboard
 */
export function useLangPath() {
  const lang = useLang();

  return (path: string): string => {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `/${lang}${cleanPath}`;
  };
}
