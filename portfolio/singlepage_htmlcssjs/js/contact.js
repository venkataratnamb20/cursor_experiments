/**
 * Contact form validation and mailto helpers.
 */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate contact form fields.
 * @param {{name: string, email: string, message: string}} input Contact fields.
 * @returns {{success: boolean, errors: Record<string, string>}} Validation result.
 */
export function validateContact(input) {
  const errors = {};
  const name = (input.name || '').trim();
  const email = (input.email || '').trim();
  const message = (input.message || '').trim();

  if (name.length < 2) {
    errors.name = 'Name is required (at least 2 characters).';
  }

  if (!email) {
    errors.email = 'Email is required.';
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = 'Enter a valid email address.';
  }

  if (message.length < 10) {
    errors.message = 'Message must be at least 10 characters.';
  }

  return {
    success: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Build a mailto URL for the portfolio contact address.
 * @param {string} to Recipient email.
 * @param {{name: string, email: string, message: string}} fields Form fields.
 * @returns {string} Encoded mailto URL.
 */
export function buildMailtoUrl(to, fields) {
  const subject = `Portfolio inquiry from ${fields.name}`;
  const body = [
    `Name: ${fields.name}`,
    `Email: ${fields.email}`,
    '',
    fields.message,
  ].join('\n');

  const params = new URLSearchParams({
    subject,
    body,
  });

  return `mailto:${to}?${params.toString()}`;
}

/**
 * Wire contact form submit handling.
 * @param {HTMLFormElement} form Contact form element.
 * @param {string} recipientEmail Destination email.
 */
export function initContactForm(form, recipientEmail) {
  if (!form) {
    return;
  }

  const statusEl = form.querySelector('[data-contact-status]');

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const fields = {
      name: form.elements.namedItem('name')?.value || '',
      email: form.elements.namedItem('email')?.value || '',
      message: form.elements.namedItem('message')?.value || '',
    };

    clearFieldErrors(form);
    const result = validateContact(fields);

    if (!result.success) {
      let firstInvalid = null;
      Object.entries(result.errors).forEach(([field, message]) => {
        const errorEl = form.querySelector(`[data-error-for="${field}"]`);
        if (errorEl) {
          errorEl.textContent = message;
        }
        const input = form.elements.namedItem(field);
        if (input instanceof HTMLElement) {
          input.setAttribute('aria-invalid', 'true');
          if (!firstInvalid) {
            firstInvalid = input;
          }
        }
      });
      if (statusEl) {
        statusEl.textContent = 'Please fix the errors above.';
      }
      firstInvalid?.focus();
      return;
    }

    if (statusEl) {
      statusEl.textContent = 'Opening your email client…';
    }

    window.location.href = buildMailtoUrl(recipientEmail, fields);
  });
}

/**
 * Clear inline field errors on a form.
 * @param {HTMLFormElement} form Form element.
 */
function clearFieldErrors(form) {
  form.querySelectorAll('[data-error-for]').forEach((el) => {
    el.textContent = '';
  });
  Array.from(form.elements).forEach((el) => {
    if (el instanceof HTMLElement) {
      el.removeAttribute('aria-invalid');
    }
  });
}
