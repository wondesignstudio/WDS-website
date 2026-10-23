import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// CSS sticky owns the transition. No wheel interception, scroll snapping, or
// JS-created pin spacers: the full page remains readable without JavaScript.
const hero = document.querySelector<HTMLElement>('[data-hero]');
if (hero) {
  // A sticky element can be inside the viewport yet covered by the next panel.
  // Return keyboard users to the actual scene when reverse-tabbing to its links.
  const revealFocusedHero = () => {
    const next = document.querySelector<HTMLElement>('[data-work-reveal]');
    const sequence = hero.closest<HTMLElement>('[data-work-sequence]');
    if (next && sequence && next.getBoundingClientRect().top < innerHeight - 1) {
      window.scrollTo({ top: sequence.getBoundingClientRect().top + scrollY, behavior: 'instant' });
    }
  };
  hero.addEventListener('focusin', revealFocusedHero);
  gsap.registerPlugin(ScrollTrigger);
  const media = gsap.matchMedia();
  media.add({ desktop: '(min-width: 601px)', reduce: '(prefers-reduced-motion: reduce)' }, (context) => {
    if (context.conditions?.reduce) return;
    const desktop = context.conditions?.desktop;
    const image = hero.querySelector('img');
    if (!image) return;
    gsap.fromTo(image, { scale: desktop ? 1.35 : 1, yPercent: 0 }, {
      scale: desktop ? 1.42 : 1.025, yPercent: desktop ? -3 : -1,
      ease: 'none', scrollTrigger: {
        trigger: '[data-work-reveal]', start: 'top bottom', end: 'top top',
        scrub: desktop ? 0.8 : true, invalidateOnRefresh: true,
      },
    });
  });
  window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  document.fonts.ready.then(() => ScrollTrigger.refresh());
  // Rebuild correctly on BFCache restore and clean up during Vite hot updates.
  window.addEventListener('pageshow', () => ScrollTrigger.refresh());
  if (import.meta.hot) import.meta.hot.dispose(() => {
    media.revert();
    hero.removeEventListener('focusin', revealFocusedHero);
  });
}
