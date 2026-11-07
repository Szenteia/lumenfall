# Térképnézet méretváltása

A `mountMapView` megtartja a meglévő `columns`/`rows` kezdőparamétereket, és `setLayout({width,height})` metódust ad vissza. Csak pozitív, biztonságos egész méreteket fogad el. Érvényes (akár változatlan) méretnél `true`, hibás méretnél `false` a visszatérési érték; hibás bemenet megőrzi az előző nézetet. Hibás kezdőméret esetén a konstruktor 17×13-ra áll. Régi markup miatti fallback esetén a metódus mindig `false`.

A hívó előbb állítsa be a megbízható, szabályverzióhoz tartozó pályát és a Canvas bitmap méretét, majd hívja a `setLayout`-ot és a szokásos `update(state)`-et. Példa egy **tesztpályára**, 40 px-es mezőkkel:

```js
canvas.width = 21 * 40;
canvas.height = 15 * 40;
mapView.setLayout({width: 21, height: 15});
mapView.update(state);
```

A nézetvezérlő nem módosít bitmapet, játékszabályt vagy mentést, és nem olvas méretet a mentett állapotból. A hívó felelőssége az egyező bitmap és elrendezés biztosítása. A viewport inline `aspectRatio` értéke felülírja a CSS 17/13 fallbackjét; a Canvas természetes képarányát a bitmap adja. A 100/150/200%-os nagyítás megmarad, valódi méretváltás középre követi az aktuális karaktert. Azonos méret ismétlése nem ír stílust és nem bontja meg a kézi görgetést. A natív touch, fókusz, egyszer létrehozott resize-megfigyelő és a Fit működése változatlan. Nulla szélességű/rejtett nézet a későbbi resize eseményen áll helyre.

## Ellenőrzés

Öt új DOM-geometriai modellteszt: 17×13 → 21×15 → 15×21 → 17×13; négy sarok és minden zoom; kézi görgetés; változatlan layout esetén nincs új stílusírás; resize és fallback 240/360/800/1024 px szélességen; hibás méretek; null állapot/rejtett viewport; változatlan bitmap és fagyasztott játékállapot. A korábbi tényleges main.js modelltesztek is futnak. Ezek nem helyettesítik a natív böngésző layoutját vagy a fizikai mobileszközpróbát.

Kézi böngészős ellenőrzéshez a fenti méretekkel és megfelelő bitmapekkel készített tesztpályán: teljes térkép 100%-on, mind a négy sarok 150/200%-on, natív húzás, Fit, telefon elforgatása, billentyűzetfókusz és játékvezérlés elkülönülése. Valós böngészős és fizikai mobilos próba ebben a fejlesztési körben nem futott.

## Hátralévő bekötés

A böngészőben játszható expedíció továbbra is 17×13. A nagyobb pálya elindítása külön lépés: verziózott determinisztikus generátor, mentésvalidálás és régi expedíciók megőrzése; a megbízható méret közös továbbítása a játéklogikába, előnézetekbe, háttérbe, látható Canvasba és térképnézetbe. A régi mentés nem generálható újra. A mai változás ezeket nem kapcsolja be.
