import { gateDistance, gateSummary } from './gate.js';

export function mountGateDistance(button) {
  const document = button.ownerDocument;
  const panel = document.createElement('section'); panel.className = 'gate-distance';
  const summary = document.createElement('p'); summary.setAttribute('role', 'status');
  const hint = document.createElement('p');
  hint.textContent = 'Az őrzők és a harc további köröket jelenthetnek.';
  panel.append(summary, hint); button.before(panel);
  return state => {
    panel.hidden = state.status !== 'active';
    summary.textContent = panel.hidden ? '' : gateSummary(gateDistance(state));
  };
}
