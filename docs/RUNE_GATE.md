# Rúnakapu · 2026-11-15

[Lumenfall automation]

A (2,6) kijárat betűjelét eredeti, statikus Canvas-kapurajz váltja: íves keret, két alacsony kőpillér és elágazó céhrúna. A három környezet saját palettát kap. A forma egy mezőn belül marad; a kapu/ládák után következik a taktikai réteg, majd a szereplők. A téma állapotfrissítéskor kerül előkészítésre, animációs képkockákon újrahasználható.

Nincs új mentésmező, játékszabály, asset, függőség vagy időzítő. A kijutás továbbra is a megszokott gombbal, ugyanazon a mezőn történik.

Ellenőrzés: 123/123 teszt main-alapon; 149/149 a #44, #38, #40, #46, #48 helyi kombinációjával (#44 tartalmazza #34/#36/#42 munkáját). Rajzolótesztek három palettával, 20/40/80 px mérettel és mezőhatárokkal; a valódi main DOM-modellje import, animációs frame, szünet/folytatás és régi mentés alatt ellenőrzi az új kaput, karakter előtti rajzolással. A kijutás bankolási regressziótesztje is sikeres.

Natív Canvas-kontaktlapon három háttér, 40/20 px, karakter és taktikai átfedés vizuálisan ellenőrizve. Chromium indítása hibával leállt: valódi böngészős/fizikai mobilos próba még szükséges.

Integráció: önálló main-alapú PR. A main.js közös environment változóját és a drawRuneGate → ládák → drawWaitTargets → szereplők sorrendet meg kell tartani a #38/#44 beillesztésekor. Az őr-stride callback és a kalandozópóz változatlan marad. Automatikus merge nincs.
