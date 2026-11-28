# Padlómozaik-változatok · 2026-11-28

[Lumenfall automation] A #72 napi lépés a #58 integrációs ágon témánként három különböző, eredeti vonalas mozaikot ad. A ködös környezet törött körei mellé céhlámpás és páros tört ívek, a borostyán rombusza mellé nyolcszirmú rozetta és lépcsős keret, a kristály rozetta mellé háromágú kristály és szilánkkoszorú kerül.

A selectFloorMosaics változatlanul választ legfeljebb három 2×2-es padlófoltot. A sorfolytonos kiválasztás sorszáma adja a 0/1/2 változatot: az első minta megmarad, nincs új véletlenszám, mentett mező vagy játékszabály. A kapukizárás és térköz változatlan. Az alakzatok 40 px-es mezőn a középponttól legfeljebb 32 px-re nyúlnak; a korábbi szín és 1 px-es vonalvastagság marad. A statikus háttércache rajzolja őket, nincs új asset vagy animációs ciklus.

## Ellenőrzés

- npm test: 187/187 sikeres, 0 kihagyott. Korábbi snapshotok változatlanok.
- Három téma × három méret (17×13, 21×15, 25×19) × három rajzlépték: eltérő geometriák, determinisztikus eredmény, rajzhatárok és kontextus-visszaállítás.
- 0–3 mozaikhely, hibás méret, null térkép és ismeretlen téma; a helyválasztás változatlan.
- RulesVersion 1–4 valódi futamain export/import után azonos rajz; szereplő- és zsákmányváltozás nem építi újra a hátteret, a játékállapot változatlan.
- Natív Canvas: mind a kilenc motívum közös lapját és mindhárom környezet teljes pályájának 350 px széles képét szemrevételeztem; a ködös teljes jelenetet 1000×760 méreten is. A mozaikok halvány háttérdíszek, a szereplők/tárgyak olvashatók maradnak.
- git diff --check sikeres.

Korlát: a Playwright Chromium indítása a hiányzó futtatható fájl miatt nem sikerült. A Canvas-képek nem valódi mobilböngészős tesztek; fizikai mobileszközön teljesítményt és érintéses működést nem mértem. Merge és éles telepítés nem történt.
