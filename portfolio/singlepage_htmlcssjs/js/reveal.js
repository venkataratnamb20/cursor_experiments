/**
 * Scroll reveal using IntersectionObserver (transform + opacity only).
 */

/**
 * Initialize fade-up reveals. No-ops when reduced motion is preferred.
 * @param {ParentNode} root Root to search for .reveal elements.
 */
export function initReveal(root = document) {
  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const elements = Array.from(root.querySelectorAll('.reveal'));

  if (prefersReduced) {
    elements.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  if (typeof IntersectionObserver === 'undefined') {
    elements.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
  );

  elements.forEach((el) => observer.observe(el));
}
