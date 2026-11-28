# Őrzők támadási előrelendülése

[Lumenfall automation] 2026-11-27 · #71, a #58 integrációs ág frissítése.

A ténylegesen támadó őrzők teste röviden a játékos felé mozdul és visszatér. A HP-sáv, árnyék és taktikai jelzés a helyén marad. Várakozás, gyógyítás és lépés után 180 ms, játékos-kardcsapás mellett 220 ms a közös véges animáció. 40 px-es mezőn a teljes testeltolás legfeljebb 4 px; találati visszarúgással együtt is korlátozott.

A captureGuards a korábbi kört és az aktív állapotot is megjegyzi. A describeSceneMotion csak valódi, egy körös előrelépésnél, azonos játékállapotban jelöl támadónak egy helyben maradó, túlélő, a végső játékospozícióval szomszédos őrzőt. Ez a jelenlegi resolveEnemies szerződésén alapul: a szomszéd támad, a távolabbi őrző legfeljebb mozog, mozgás után ugyanabban a körben nem támad. E szabály későbbi változásakor az azonosítást is módosítani kell. Nem nettó HP-különbséget figyel, így gyógyítás és végzetes sebzés mellett is helyes.

A guardAttacks csak átmeneti megjelenítési adat. A game.js, generátorok, mentésséma és szabályverzió változatlan. Új akció, szünet, import, új futam, rejtett lap vagy reduced motion megszakítja a közös animációt; nincs állandó új ciklus vagy külső asset.

## Ellenőrzés

- 184/184 helyi teszt sikeres: támadóazonosítás, több támadó, nettó HP-növekedés, végzetes találat, megölt és közelebb lépő őrző, kör nélküli akciók.
- Négy irány, pontos kezdő/végpóz, elmozdulási korlát, rögzített HP-sáv, változatlan mentés és félbeszakítható animáció.
- Tényleges main modul DOM/Canvas modellben, mindhárom méreten: várakozás/gyógyítás/lépés/kardcsapás, azonnali végleges mentés és HUD, képkockánként változatlan háttér-cache, minden megszakítási út.
- Natív Canvas kontaktlap: három paletta × négy irány × kezdő/csúcs/végpóz; 1000 px és 350 px széles megjelenítés szemrevételezve.
- Playwright Chromium indítás megkísérelve, a chromium_headless_shell-1234 futtatható fájl hiányzik. Valódi böngészős/touch és fizikai mobileszközös teljesítménypróba nem futott.

Kiadás előtt böngészőben ellenőrizendő: több szomszédos őrző várakozásra egyszerre üt; gyógyítás után visszaütés látszik; megölt célpont nem támad; gyors akciók és szünet után nincs ottmaradó póz. Reduced motion mellett nincs elmozdulás. A változás PR-ban vár ellenőrzésre, nem automatikus éles kiadás.
