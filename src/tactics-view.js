import { waitSummary } from './tactics.js';

export function mountWaitPreview(button) {
  const panel = document.createElement('section');
  panel.className = 'wait-forecast';
  panel.setAttribute('aria-label', 'Várakozás taktikai előnézete');
  const summary = document.createElement('p');
  summary.id = 'wait-forecast-summary';
  summary.setAttribute('role', 'status');
  summary.setAttribute('aria-atomic', 'true');
  const hint = document.createElement('p');
  hint.id = 'wait-forecast-hint';
  hint.textContent = 'Szaggatott körvonal: őrző következő mezője, ha vársz. Mozgás vagy támadás más helyzetet eredményezhet.';
  panel.append(summary, hint);
  button.before(panel);
  button.setAttribute('aria-describedby', `${summary.id} ${hint.id}`);
  return preview => {
    panel.hidden = preview === null;
    panel.classList.toggle('is-fatal', preview?.fatal === true);
    const text = waitSummary(preview);
    if (summary.textContent !== text) summary.textContent = text;
  };
}

export function drawWaitTargets(ctx, preview, size) {
  if (!preview?.moves.length) return;
  ctx.save();
  ctx.strokeStyle = '#e6bf75';
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 3]);
  for (const { to } of preview.moves) {
    ctx.strokeRect(to.x * size + 5, to.y * size + 5, size - 10, size - 10);
  }
  ctx.restore();
}
