/**
 * Sticky / mobile navigation behavior.
 */

/**
 * Initialize site navigation.
 * @param {Document|ParentNode} root Document or container.
 */
export function initNav(root = document) {
  const toggle = root.querySelector('[data-nav-toggle]');
  const nav = root.querySelector('[data-nav]');

  if (!toggle || !nav) {
    return;
  }

  const setOpen = (open) => {
    nav.hidden = !open;
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  };

  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    setOpen(open);
  });

  nav.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', () => {
      setOpen(false);
    });
  });

  const sections = Array.from(
    document.querySelectorAll('main section[id]'),
  );
  const navLinks = Array.from(nav.querySelectorAll('a[href^="#"]'));

  if (sections.length === 0 || typeof IntersectionObserver === 'undefined') {
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }
        const id = entry.target.getAttribute('id');
        navLinks.forEach((link) => {
          const active = link.getAttribute('href') === `#${id}`;
          link.classList.toggle('is-active', active);
          if (active) {
            link.setAttribute('aria-current', 'location');
          } else {
            link.removeAttribute('aria-current');
          }
        });
      });
    },
    {
      rootMargin: '-40% 0px -50% 0px',
      threshold: 0,
    },
  );

  sections.forEach((section) => observer.observe(section));
}
