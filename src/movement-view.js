import { DIRECTIONS, previewDirections, directionSummary } from './movement.js';

export function mountMovementPreview(anchor) {
  const document = anchor.ownerDocument;
  const panel = document.createElement('section');
  panel.className = 'movement-preview';
  panel.setAttribute('aria-label', 'Mozgás és kardcsapás előnézete');
  const heading = document.createElement('h3');
  heading.textContent = 'Ha ebbe az irányba indulsz';
  const rows = DIRECTIONS.map(() => document.createElement('p'));
  const hint = document.createElement('p'); hint.className = 'movement-hint';
  hint.textContent = 'Egyetlen következő akció, az őrzők válaszával együtt. Az irányok külön lehetőségek.';
  panel.append(heading, ...rows, hint); anchor.before(panel);
  return state => {
    const previews = previewDirections(state);
    panel.hidden = previews === null;
    rows.forEach((row, index) => {
      const preview = previews?.[index];
      const text = preview ? directionSummary(preview) : '';
      if (row.textContent !== text) row.textContent = text;
      row.classList.toggle('is-fatal', preview?.fatal === true);
    });
  };
}
