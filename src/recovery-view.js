import { readStartup, replaceWithNewGame, downloadOriginal } from './recovery.js';

export function mountRecovery({ initial, getStorage, applyState, document = globalThis.document }) {
  const make = (tag, text) => { const node = document.createElement(tag); if (text) node.textContent = text; return node; };
  const dialog = make('dialog'); dialog.className = 'recovery-dialog';
  const title = make('h2', 'A korábbi mentés védve maradt.'); title.id = 'recovery-title';
  dialog.setAttribute('aria-labelledby', title.id);
  const message = make('p'); message.setAttribute('role', 'status');
  const hint = make('p', 'Előbb tölts le biztonsági másolatot. Ez eredeti, hibás vagy nem támogatott adat; nem garantáltan betölthető játékexport. Újrakezdéskor a céhkincstár is lecserélődik.');
  const download = make('button', 'Eredeti mentés letöltése');
  const retry = make('button', 'Újrapróbálás');
  const choose = make('button', 'Új játék indítása és a korábbi mentés cseréje');
  const confirmation = make('section'); confirmation.hidden = true;
  const warning = make('p', 'Biztosan lecseréled a korábbi mentést? Az új expedíció üres céhkincstárral indul.');
  const confirm = make('button', 'Igen, új játékra cserélem');
  const cancel = make('button', 'Mégse'); confirmation.append(warning, confirm, cancel);
  dialog.append(title, message, hint, download, retry, choose, confirmation); document.body.append(dialog);
  let current = initial, locked = true;
  const describe = () => {
    download.disabled = typeof current.raw !== 'string';
    message.textContent = current.kind === 'unavailable'
      ? 'A böngésző helyi tárhelye nem olvasható. Nem írtunk felül semmit. Engedélyezés után próbáld újra.'
      : 'A korábbi mentés hibás vagy nem támogatott. Nem írtuk felül. Válassz helyreállítási lehetőséget.';
  };
  const finish = state => { applyState(state); locked = false; dialog.close(); };
  // Escape can cancel the replacement question, but cannot bypass the save guard.
  dialog.addEventListener('cancel', event => { if (locked) { event.preventDefault(); confirmation.hidden = true; } });
  dialog.addEventListener('close', () => { if (locked && !dialog.open) dialog.showModal(); });
  choose.onclick = () => { if (!locked) return; confirmation.hidden = false; cancel.focus(); };
  cancel.onclick = () => { confirmation.hidden = true; choose.focus(); };
  confirm.onclick = () => {
    if (!locked || confirmation.hidden) return;
    let state;
    try { state = replaceWithNewGame(getStorage); }
    catch { message.textContent = 'Az új mentés nem írható. A korábbi adat megmaradt; a játék továbbra is védett.'; return; }
    finish(state);
  };
  retry.onclick = () => {
    if (!locked) return;
    confirmation.hidden = true;
    current = readStartup(getStorage); describe();
    if (current.kind === 'valid') finish(current.state);
    else if (current.kind === 'missing') {
      // A fresh read proved the key is now absent; there is no data to overwrite.
      let state;
      try { state = replaceWithNewGame(getStorage); }
      catch { message.textContent = 'A mentés nem írható. A játék védett állapotban maradt.'; return; }
      finish(state);
    }
  };
  download.onclick = () => {
    if (!locked || typeof current.raw !== 'string') return;
    try {
      downloadOriginal(current.raw, { document, URL: globalThis.URL, Blob: globalThis.Blob });
      message.textContent = 'Letöltés kérve. Ellenőrizd a böngésző letöltéseit. A korábbi mentés változatlan.';
    } catch { message.textContent = 'A letöltés nem indítható. A korábbi mentés továbbra is megmaradt.'; }
  };
  describe(); dialog.showModal();
  return { isLocked: () => locked };
}
