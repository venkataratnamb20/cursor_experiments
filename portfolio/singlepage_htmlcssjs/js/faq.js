/**
 * FAQ accordion behavior (one open panel at a time).
 */

/**
 * Initialize FAQ accordion on a root element.
 * @param {ParentNode} root Container with .faq-trigger buttons.
 */
export function initFaq(root) {
  if (!root) {
    return;
  }

  const triggers = Array.from(root.querySelectorAll('.faq-trigger'));

  triggers.forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const panelId = trigger.getAttribute('aria-controls');
      const panel = panelId ? document.getElementById(panelId) : null;
      if (!panel) {
        return;
      }

      const isOpen = trigger.getAttribute('aria-expanded') === 'true';

      triggers.forEach((other) => {
        const otherPanelId = other.getAttribute('aria-controls');
        const otherPanel = otherPanelId
          ? document.getElementById(otherPanelId)
          : null;
        other.setAttribute('aria-expanded', 'false');
        if (otherPanel) {
          otherPanel.hidden = true;
        }
      });

      if (!isOpen) {
        trigger.setAttribute('aria-expanded', 'true');
        panel.hidden = false;
      }
    });
  });
}
