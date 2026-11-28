[Lumenfall automation]

# Központi csarnok · hall-v1

A #68 napi lépés önálló, 25×19-es szerkezeti prototípusa. Négy külső terem között körút fut, a központi ötödik csarnok külön északi és déli bejárattal rövidítést ad. A méretek, teremhelyek, folyosósávok és entitások a naphoz kötötten változnak. Saját pályaszerkezet; nem anime-helyszín másolata.

## Használat

`generateHallDungeon(dayId)` a `src/hall-dungeon.js` modulból; szigorú ISO napazonosító, hibára RangeError. Azonos nap azonos eredményt ad. A saját `hall-v1` generátorazonosító nem támogatott játék- vagy mentési rulesVersion.

Eredmény: width=25, height=19, generatorVersion, tiles (475 elem, 0 padló/1 fal), rooms (x/y/w/h), corridors (from/to teremindex és csak a termeken kívüli útvonalcellák), enemies és chests. Teremsorrend: nyugat, észak, kelet, dél, központi csarnok. A kapu a meglévő (2,6) koordináta. Három őr HP-ja 6/8/10, három láda külön mezőn; legalább egy láda a régi 21×15 területen kívül van.

A négy külső és két belső összeköttetés külön fenntartott sávokat használ. Nincs véletlen újrapróbálás; rögzített pályaméret, hat véges folyosó és véges keverés. A helyi PRNG nem használ Math.random-ot, és nem érinti a régi generátorok véletlensorrendjét. A kimenet minden híváskor új objektumokat/tömböket kap.

## Előnézet

`node scripts/preview-hall-dungeon.js` újragenerálja a [háromnapos szerkezeti előnézetet](HALL_DUNGEON_PREVIEW.svg). Kék: külső termek; türkiz: csarnok; arany: folyosók; G: kapu; E: őr; C: láda. Ez szerkezeti prototípus, nem az éles játék képe.

## Ellenőrzés · 2026-11-25

- 124/124 teljes main-alapú teszt sikeres.
- A #58 dd013b668057c284fc884028eac18c9f6f05fedf változatával külön helyi kombináció: 175/175 teszt sikeres.
- 365 nap: falperem, öt külön terem, teljes padló-BFS, kapu, két csarnokbejárat, hat egyedi elérhető entitás, távoli láda, metaadat/padló-egyezés és napi változatosság.
- Minden folyosó külön összeköti a jelzett két termet; teljes eltávolítása után is elérhető mind az öt terem a kaputól. Ez valódi teremközi kerülőút, nem a terem belső padlóciklusa.
- Rögzített SHA-256 snapshot, megismételhetőség, egymástól független kimenetek, hibás napok és szökőnap; Math.random tiltása mellett is működik.
- A háromnapos SVG szemrevételezve és újragenerálása byte-azonos; git diff --check sikeres.

## Hatókör és következő integráció

Ez main-alapú, kizárólag új fájlokat hozzáadó PR. A #58 és az eredeti PR-ok változatlanok. A játék belépési pontja nem importálja ezt a modult, így induláskor nem tölti le/futtatja. Régi szabályok, mentések, gameplay és pontozás változatlan.

A játszható 25×19-es bekötés későbbi lépés: külön verziózott méretválasztás, validálás, régi mentés folytatása, nézet/zoom/pan és mobilos próba kell hozzá. Valódi böngészős vagy fizikai mobilos teljesítménypróba ebben a szerkezeti lépésben nem futott; az SVG és a Node tesztek nem igazolnak eszközteljesítményt. Nincs automatikus merge vagy telepítés.
