# Játszható nagyobb dungeon

[Lumenfall automation]

A 3-as pályaszabály a változatlan expanded-ring-v1 generátort használja. A mentés version 2 és az exportburkolat version 1 marad; csak a rulesVersion választ új, 21×15-ös geometriát. Az eredeti W/H a régi generátorokhoz továbbra is 17/13. A width/height extra mezőket nem használjuk méretválasztásra. Diagnosztikai rooms/corridors adatok nem kerülnek a futamba.

Az expeditionSize közös hozzárendelését használja a mentés, a szimuláció, az előnézet és a nézet. Régi version 1 mentés először régi mérettel ellenőrződik, majd a megszokott rules 0 migrációt kapja. Régi térképet soha nem generálunk újra. Új futam a bank megtartásával már az új szabályt kapja.

A main méretváltáskor igazítja a bitmapet és setLayout nézetet, a háttérnek explicit méretet ad. Képkockánként nincs bitmap-átméretezés. A szünet és reduced motion meglévő vezérlése megmarad.

Függőségek: #34, #36, #42 változásai ezen az integrációs ágon szerepelnek; a korábbi PR-ok továbbra is külön nyitottak. #38/#40 megjelenítési változásai csak a külön kombinált ellenőrzésben szerepelnek. A főág/éles oldal automatikusan nem változik.

Teszt: npm test, 365 új futam generátor-egyezése és export/import körútja, régi generátorsnapshotok/fixture-ök, régi határon túli akciók/előnézetek és kétirányú import/Canvas-méretváltás a valódi main modul DOM-modelljében. Ez nem fizikai mobilteszt. Kézi böngészőteszt: új futam, négy sarok, zoom/pan 390px és desktop nézetben; szünet/újratöltés; régi mentés importja, majd új mentés visszaimportja.
