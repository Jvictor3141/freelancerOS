import { useNavigate } from 'react-router-dom';
import { useLang } from './useLang';

type NavigateOptions = {
  replace?: boolean;
  state?: unknown;
};

/**
 * Language-aware navigation hook.
 * Automatically prefixes every path with the current /:lang segment.
 *
 * Usage:
 *   const navigate = useLangNavigate();
 *   navigate('/dashboard'); // → /pt/dashboard
 */
export function useLangNavigate() {
  const rawNavigate = useNavigate();
  const lang = useLang();

  return (to: string, options?: NavigateOptions) => {
    // Preserve query strings and hashes; only prefix the pathname.
    const cleanPath = to.startsWith('/') ? to : `/${to}`;
    rawNavigate(`/${lang}${cleanPath}`, options);
  };
}
