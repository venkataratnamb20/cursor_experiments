/**
 * HTML render helpers for portfolio sections.
 */

/**
 * Escape text for safe HTML interpolation.
 * @param {string} value Raw string.
 * @returns {string} Escaped string.
 */
function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

/**
 * Render education entries.
 * @param {Array<{school: string, degree: string, period: string, detail: string}>} entries Education list.
 * @returns {string} HTML markup.
 */
export function renderEducation(entries) {
  return entries
    .map(
      (entry) => `
      <li class="timeline-item reveal">
        <p class="timeline-period mono">${escapeHtml(entry.period)}</p>
        <h3 class="timeline-title">${escapeHtml(entry.degree)}</h3>
        <p class="timeline-school">${escapeHtml(entry.school)}</p>
        <p class="timeline-detail">${escapeHtml(entry.detail)}</p>
      </li>`,
    )
    .join('');
}

/**
 * Render experience timeline (IC roles + optional portfolio demo).
 * @param {Array<object>} entries Experience list.
 * @returns {string} HTML markup.
 */
export function renderExperience(entries) {
  return entries
    .map((entry) => {
      const isDemo = entry.kind === 'demo';
      const badge = isDemo
        ? `<span class="experience-badge mono">${escapeHtml(entry.label || 'Portfolio demo')}</span>`
        : '';
      const bullets = (entry.bullets || [])
        .map((bullet) => `<li>${escapeHtml(bullet)}</li>`)
        .join('');

      return `
      <li class="timeline-item experience-item reveal${isDemo ? ' experience-item--demo' : ''}">
        <p class="timeline-period mono">${escapeHtml(entry.period)}${badge ? ` ${badge}` : ''}</p>
        <h3 class="timeline-title">${escapeHtml(entry.role)}</h3>
        <p class="timeline-school">${escapeHtml(entry.company)}</p>
        ${bullets ? `<ul class="experience-bullets">${bullets}</ul>` : ''}
      </li>`;
    })
    .join('');
}

/**
 * Render portfolio projects as rows.
 * @param {Array<object>} projects Project list.
 * @returns {string} HTML markup.
 */
export function renderProjects(projects) {
  return projects
    .map((project) => {
      const tags = project.tags
        .map((tag) => `<li class="tag">${escapeHtml(tag)}</li>`)
        .join('');
      const metrics = (project.metrics || [])
        .map(
          (metric) =>
            `<li class="metric mono"><span class="metric-value">${escapeHtml(metric.value)}</span> <span class="metric-label">${escapeHtml(metric.label)}</span></li>`,
        )
        .join('');
      const links = [
        project.githubUrl
          ? `<a class="text-link" href="${escapeHtml(project.githubUrl)}" rel="noopener noreferrer" target="_blank">GitHub</a>`
          : '',
        project.liveUrl
          ? `<a class="text-link" href="${escapeHtml(project.liveUrl)}" rel="noopener noreferrer" target="_blank">Live</a>`
          : '',
      ]
        .filter(Boolean)
        .join(' · ');
      const image = project.imageUrl
        ? `<div class="project-media"><img src="${escapeHtml(project.imageUrl)}" alt="${escapeHtml(project.title)}" width="640" height="360" loading="lazy" decoding="async" /></div>`
        : '';

      return `
      <article class="project-row reveal">
        ${image}
        <div class="project-main">
          <h3 class="project-title">${escapeHtml(project.title)}</h3>
          <p class="project-summary">${escapeHtml(project.summary)}</p>
          <ul class="tag-list" aria-label="Technologies">${tags}</ul>
          ${links ? `<p class="project-links">${links}</p>` : ''}
        </div>
        <ul class="metric-list" aria-label="Impact metrics">${metrics}</ul>
      </article>`;
    })
    .join('');
}

/**
 * Render FAQ accordion markup.
 * @param {Array<{question: string, answer: string}>} items FAQ entries.
 * @returns {string} HTML markup.
 */
export function renderFaq(items) {
  return items
    .map(
      (item, index) => `
      <div class="faq-item">
        <h3 class="faq-question">
          <button
            type="button"
            class="faq-trigger"
            id="faq-trigger-${index}"
            aria-expanded="false"
            aria-controls="faq-panel-${index}"
          >
            ${escapeHtml(item.question)}
          </button>
        </h3>
        <div class="faq-panel" id="faq-panel-${index}" role="region" aria-labelledby="faq-trigger-${index}" hidden>
          <p>${escapeHtml(item.answer)}</p>
        </div>
      </div>`,
    )
    .join('');
}

/**
 * Render resume highlight bullets.
 * @param {string[]} highlights Resume bullets.
 * @returns {string} HTML markup.
 */
export function renderResumeHighlights(highlights) {
  return highlights
    .map((item) => `<li class="reveal">${escapeHtml(item)}</li>`)
    .join('');
}
