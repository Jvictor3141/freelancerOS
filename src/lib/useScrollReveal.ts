import type { RefObject } from 'react';
import { useEffect } from 'react';

type ScrollRevealOptions = {
  rootMargin?: string;
  selector?: string;
  threshold?: number;
};

export function useScrollReveal(
  rootRef: RefObject<HTMLElement | null>,
  options?: ScrollRevealOptions,
) {
  const rootMargin = options?.rootMargin ?? '0px 0px -10% 0px';
  const selector = options?.selector ?? '[data-scroll-reveal]';
  const threshold = options?.threshold ?? 0.12;

  useEffect(() => {
    const root = rootRef.current;

    if (!root || typeof window === 'undefined') {
      return;
    }

    const targets = Array.from(root.querySelectorAll<HTMLElement>(selector));

    if (targets.length === 0) {
      return;
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    if (reducedMotion.matches) {
      root.dataset.scrollDirection = 'down';
      root.style.setProperty('--landing-parallax', '0px');

      for (const target of targets) {
        target.dataset.inView = 'true';
      }

      return;
    }

    let animationFrame = 0;
    let lastScrollY = window.scrollY;

    const revealTarget = (target: HTMLElement) => {
      target.dataset.inView = 'true';
    };

    const syncScrollState = () => {
      const nextScrollY = window.scrollY;
      const delta = nextScrollY - lastScrollY;

      if (Math.abs(delta) > 2) {
        root.dataset.scrollDirection = delta > 0 ? 'down' : 'up';
      } else if (!root.dataset.scrollDirection) {
        root.dataset.scrollDirection = 'down';
      }

      lastScrollY = nextScrollY;

      const parallaxOffset = Math.min(Math.max(nextScrollY, 0), 720) * 0.18;
      root.style.setProperty('--landing-parallax', `${parallaxOffset.toFixed(1)}px`);
      animationFrame = 0;
    };

    const queueScrollStateSync = () => {
      if (animationFrame !== 0) {
        return;
      }

      animationFrame = window.requestAnimationFrame(syncScrollState);
    };

    const syncInitialVisibility = (target: HTMLElement) => {
      const rect = target.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      const hasReachedRevealPoint = rect.top <= viewportHeight * 0.88;

      target.dataset.inView = hasReachedRevealPoint ? 'true' : 'false';
    };

    root.dataset.scrollDirection = 'down';

    for (const target of targets) {
      syncInitialVisibility(target);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const target = entry.target as HTMLElement;

          if (!entry.isIntersecting) {
            continue;
          }

          revealTarget(target);
          observer.unobserve(target);
        }
      },
      {
        root: null,
        rootMargin,
        threshold,
      },
    );

    for (const target of targets) {
      if (target.dataset.inView === 'true') {
        continue;
      }

      observer.observe(target);
    }

    root.dataset.scrollReady = 'true';
    queueScrollStateSync();

    window.addEventListener('scroll', queueScrollStateSync, { passive: true });
    window.addEventListener('resize', queueScrollStateSync);

    return () => {
      if (animationFrame !== 0) {
        window.cancelAnimationFrame(animationFrame);
      }

      observer.disconnect();
      window.removeEventListener('scroll', queueScrollStateSync);
      window.removeEventListener('resize', queueScrollStateSync);
      root.removeAttribute('data-scroll-direction');
      root.removeAttribute('data-scroll-ready');
      root.style.removeProperty('--landing-parallax');
    };
  }, [rootMargin, rootRef, selector, threshold]);
}
