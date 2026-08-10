/**
 * SEO helpers — keep canonical / Open Graph / JSON-LD aligned with site.origin.
 */

/**
 * Normalize a site origin (no trailing slash).
 * @param {string} origin Raw origin.
 * @returns {string} Normalized origin.
 */
export function normalizeOrigin(origin) {
  return String(origin || '')
    .trim()
    .replace(/\/+$/, '');
}

/**
 * Absolute URL for a path under the site origin.
 * @param {string} origin Site origin.
 * @param {string} path Path beginning with /.
 * @returns {string} Absolute URL.
 */
export function absoluteUrl(origin, path) {
  const base = normalizeOrigin(origin);
  const suffix = path.startsWith('/') ? path : `/${path}`;
  return `${base}${suffix}`;
}

/**
 * Apply site.origin to document head SEO tags when present.
 * @param {Document} doc Document root.
 * @param {{origin: string, ogImagePath?: string}} site Site config.
 * @param {{name?: string, title?: string, pitch?: string}} [profile] Profile for JSON-LD refresh.
 * @param {{email?: string}} [contact] Contact for JSON-LD refresh.
 */
export function hydrateSeo(doc, site, profile = {}, contact = {}) {
  if (!site?.origin || !doc) {
    return;
  }

  const origin = normalizeOrigin(site.origin);
  const home = absoluteUrl(origin, '/');
  const ogImage = absoluteUrl(origin, site.ogImagePath || '/assets/og-default.svg');

  const canonical = doc.querySelector('link[rel="canonical"]');
  if (canonical) {
    canonical.setAttribute('href', home);
  }

  const setMeta = (selector, content) => {
    const el = doc.querySelector(selector);
    if (el && content) {
      el.setAttribute('content', content);
    }
  };

  setMeta('meta[property="og:url"]', home);
  setMeta('meta[property="og:image"]', ogImage);

  const ld = doc.querySelector('script[type="application/ld+json"]');
  if (ld) {
    try {
      const data = JSON.parse(ld.textContent || '{}');
      data.url = home;
      if (profile.name) {
        data.name = profile.name;
      }
      if (profile.title) {
        data.jobTitle = profile.title;
      }
      if (profile.pitch) {
        data.description = profile.pitch;
      }
      if (contact.email) {
        data.email = `mailto:${contact.email}`;
      }
      ld.textContent = JSON.stringify(data, null, 2);
    } catch {
      /* leave existing JSON-LD if parse fails */
    }
  }
}
