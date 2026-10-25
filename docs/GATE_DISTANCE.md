# Kijárat távolságjelző · 2026-10-25

A `src/gate.js` szélességi bejárással keresi a legrövidebb négyirányú utat a (2,6) kapuig. Minden járható mező legfeljebb egyszer kerül a sorba: idő- és tárigény O(W×H). A szomszédok koordinátáit külön ellenőrzi, így a sorok végei között nem lehet átugrani. Az eredeti állapotot nem írja, nem lépteti a játékot. A szám térképi minimum: őrzők, sebzés, várakozás és harc nincsenek szimulálva. Nem garantált kijutás.

A `src/gate-view.js` a meglévő Kijutás gomb elé helyez szöveges jelzést és állandó magyarázatot. A fő felület meglévő `draw()` függvénye frissíti. Nincs új időzítő vagy folyamatos render; a várakozás előnézete külön marad. Lezárt futam elrejti a kijelzést. A stílus teljes szélességet és szövegtörést használ.

## Elvégzett ellenőrzések

- Friss main-alapú változat: `npm test` **33/33** (25 meglévő + 8 új).
- Rögzített térképek: 0 és 1 lépés, 6 lépéses kerülőút 2 helyett, egyenlő alternatívák, belső pályaszél, elzárt kapu és sorvégi átugrás tiltása.
- Őrző/ereklye nem módosítja a geometriai minimumot; fagyasztott napi és migrált örökölt mentés változatlan; állapotfüggő feliratok és újrarajzolás.
- Nyitott #6 PR `7e35e106392cc906615ccbc32b9971a523a6464d` forrásával helyi háromutas összefésülés konfliktusmentes, beleértve main.js, style.css és README.md. Kombinált tesztkészlet: **47/47** sikeres.
- A kombinált tényleges main.js bekötés külön Node DOM/canvas modellpróbája sikeres: importablak alatt akciók blokkolva; csak megerősítéskor változik a mentés; betöltés után a távolság, kincstár és gyakorló napcímke frissül; utána a játék folytatható.
- Main.js szintaxisellenőrzése sikeres mindkét változatban.

Ezek Node-alapú ellenőrzések, nem valódi böngészős vagy mobileszköztesztek. Natív böngészős/érintéses és 360 px-es vizuális próba ebben a fejlesztésben nem futott. Kézi terv: elmozdulás → távolság változik; fal miatti kerülő; mentés/újratöltés; kapunál kijutás → jelzés eltűnik; új expedíció → jelzés visszatér; 360 px-en szöveg nem lóg ki. #6-tal együtt import után is ellenőrizendő. A PR nem igényli #6 előzetes merge-elését, és nem merge-eljük automatikusan.
