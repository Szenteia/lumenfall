import { commitImport, downloadSave, importSummary, readSaveFile } from './transfer.js';

export function mountTransfer({ getState, applyState, storage, parent, onOpen = () => {}, document = globalThis.document }) {
  const make = (tag, text) => { const node = document.createElement(tag); if (text) node.textContent = text; return node; };
  const panel = make('section'); panel.className = 'save-transfer';
  const heading = make('h3', 'Mentés átvitele');
  const download = make('button', 'Mentés letöltése');
  const upload = make('button', 'Mentés betöltése');
  const status = make('p'); status.setAttribute('role', 'status');
  panel.append(heading, download, upload, status); parent.append(panel);
  const dialog = make('dialog'); dialog.className = 'import-dialog';
  const title = make('h2', 'Expedíció betöltése'); title.id = 'import-title';
  dialog.setAttribute('aria-labelledby', title.id);
  const hint = make('p', 'Előbb töltsd le a jelenlegi mentésed biztonsági másolatát. A betöltés a kincstárat is lecseréli.');
  const label = make('label', 'Mentésfájl (legfeljebb 64 KiB)');
  const input = make('input'); input.type = 'file'; input.accept = '.json,application/json'; label.append(input);
  const preview = make('p'); preview.setAttribute('role', 'status');
  const confirm = make('button', 'Betöltés és a jelenlegi mentés cseréje'); confirm.disabled = true;
  const cancel = make('button', 'Mégse');
  dialog.append(title, hint, label, preview, confirm, cancel); document.body.append(dialog);
  let candidate = null, generation = 0;
  const reset = () => { generation++; candidate = null; input.value = ''; confirm.disabled = true; preview.textContent = ''; };
  dialog.addEventListener('close', reset);
  dialog.addEventListener('cancel', reset);
  cancel.onclick = () => { reset(); dialog.close(); };
  download.onclick = () => {
    try {
      downloadSave(getState(), { document, URL: globalThis.URL, Blob: globalThis.Blob });
      status.textContent = 'Letöltés kérve. Ellenőrizd a böngésző letöltéseit.';
    } catch { status.textContent = 'A letöltés nem indítható. A jelenlegi expedíció megmaradt.'; }
  };
  upload.onclick = () => { onOpen(); reset(); dialog.showModal(); input.focus(); };
  input.onchange = async () => {
    const request = ++generation; candidate = null; confirm.disabled = true;
    if (!input.files?.length) { preview.textContent = 'Nem választottál fájlt.'; return; }
    preview.textContent = 'Mentés ellenőrzése…';
    try {
      const loaded = await readSaveFile(input.files[0]);
      if (request !== generation || !dialog.open) return;
      candidate = loaded; preview.textContent = importSummary(loaded); confirm.disabled = false;
    } catch (error) { if (request === generation && dialog.open) preview.textContent = error.message; }
  };
  confirm.onclick = () => {
    if (!candidate || !dialog.open) return;
    let loaded;
    try { loaded = commitImport(candidate, storage()); }
    catch { preview.textContent = 'A mentés nem írható a helyi tárhelyre. A jelenlegi expedíció megmaradt.'; return; }
    applyState(loaded); dialog.close();
    status.textContent = 'Mentés betöltve. Innen folytathatod az expedíciót.';
  };
  return { isOpen: () => dialog.open };
}
