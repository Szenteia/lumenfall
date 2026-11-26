# Csarnokdungeon integráció · 2026-11-26

[Lumenfall automation]

A #70 napi feladat a meglévő #58 PR ágát bővíti; nincs új integrációs PR vagy automatikus merge. Kiindulás: #58 dd013b668057c284fc884028eac18c9f6f05fedf, main 504d283b4044bd98c5e97c3de93152914337e12d. A #69 (903a78562ee5fcae15268d1cb19c68b84d5b4c82) öt új fájlja változatlanul átvéve, a generátor snapshotjával együtt. A korábbi látványelemek megmaradnak.

## Viselkedés

- Új futam: rulesVersion 4, 25×19, öt terem, központi csarnok és kerülőutak; a hall-v1 tiles/enemies/chests eredménye kerül az állapotba, diagnosztikai metaadat nélkül.
- Rules1/2 és örökölt mentés: 17×13; rules3: 21×15. Betöltés vagy napváltás nem generál új térképet. Korábbi szabály gyakorlóként folytatható, új futam a bankot megtartja.
- A közös expeditionSize vezérli a szimulációt, validálást és nézetet. Mentett width/height nem írhatja felül. A csarnok bitmapje 1000×760; meglévő Fit/zoom/követés és háttér-cache használható.

## Ellenőrzések

- npm test: 179/179 sikeres, nulla kihagyott teszt.
- 365 rules4 futam egyezik a hall-v1 eredményével, teljes export/import körúttal. A korábbi generátorok snapshotjai változatlanok.
- Rules1/2/3 mentés és napváltás, bankmegőrzés; hibás méret, perem, entitás és szabály elutasítása. Az importvédelmi tesztkészlet is sikeres.
- A régi pályahatáron túli mozgás, harc, gyógyítás, ládafelvétel, előnézet, kapuút és bankolás; mentés után azonos további szimuláció.
- Valódi main modul modellezett DOM/Canvas mellett: 17×13 → 25×19 → 21×15 → 17×13 import mindhárom környezetben, bitmap/HUD/cache, animációk, zoom/követés és mentésfüggetlen nézetkezelés.
- Natív Canvas képek szemrevételezése: három környezet 350 px szélességen, Kristálykripta 1000×760 méretben. A Fit nézetben apró szereplők miatt mobilon a meglévő nagyítás hasznos.
- git diff --check és a tesztelt/publikált Git-fájlfa egyezése publikáláskor ellenőrizendő.

## Korlátok

A Playwright Chromium indítása sikertelen: hiányzik a chromium_headless_shell-1234 futtatható fájl. A modelltesztek és natív Canvas képek nem valódi böngészős touch/pan tesztek és nem mobileszközös teljesítménymérések. Nem állítunk új böngészős jóváhagyást. A #58 korábbi botreview régebbi commitra vonatkozik.

A változás PR-ban vár ellenőrzésre; main, éles oldal és a többi forrás-PR nem módosul automatikusan.
