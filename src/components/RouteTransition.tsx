import type { PropsWithChildren } from 'react';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function RouteTransition({ children }: PropsWithChildren) {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [location.pathname]);

  return (
    <div key={location.pathname} className="motion-page">
      {children}
    </div>
  );
}
