[Lumenfall automation]

# Fal menti padlóárnyékok

Csak 0-s padló és közvetlen 1-es falszomszéd közös szélén rajzolódik sáv.
40 px mezőn 3 px vastag, más méretnél arányos; középen szabad marad a mező.
A felső/alsó sávot az oldalsók nem fedik át, ezért a sarkok sem sötétednek kétszer.
Az átlós fal és a sor túloldalán található elem nem szomszéd.
A szín a környezet meglévő edge színe. Nincs blur, külső asset, RNG vagy gameplay változás.

A wallShadowRects a dungeonGrid explicit méretét használja; hibás méret, sparse vagy
nem bináris térkép esetén üres listát ad. A drawWallShadows helyreállítja a Canvas
állapotát, és nem módosít mentést vagy térképet. A háttér készítésekor fut, az
animációs képkockák továbbra is a kész hátteret másolják.

## Integráció

Önálló main-alapú PR, main kiindulás: 504d283b4044bd98c5e97c3de93152914337e12d.
A #58 (42372cb2c7a63560d40ac6e0351da0404b538636) külön helyi kombinációban tesztelve;
annak ágát ez a munka nem módosítja, kódját nem másolja a napi PR-ba.
Az environment.js összefésülésekor az új import mellett a csempék ciklusa után,
a drawFloorMosaics elé kerüljön a drawWallShadows hívás. Mindkét dekoráció és a fali
díszek megmaradnak. A kapu, ládák, taktikai jelzések és szereplők fölötte rajzolódnak.

## Ellenőrzés · 2026-11-20

- Main-alapon 125/125 npm test; a #58 közös változatában 162/162, kihagyott teszt nélkül.
- Négy irány, átló, sorhatár, sarok, szűk folyosó, üres és hibás térkép; explicit
  17×13, 21×15 és 15×21 méret; befagyasztott bemenet és determinisztikus kimenet.
- 20/40/80 px rajzolás, három paletta, szabad közép, nem átfedő sávok és Canvas-állapot.
- Valódi háttérrajzolóval cache-ellenőrzés: akció és frame nem épít újra; térkép,
  téma és méret változása igen. A meglévő mentési/main/animációs tesztek megmaradtak.
- Natív Canvas-képen három téma, két pályaméret, 350 px szélesség, dekorációk és
  szereplők szemrevételezve. A taktikai rajzoló a háttér után fut.
- Valódi böngészős és fizikai mobilos próba nem futott: a Playwright Chromium
  futtatható fájlja hiányzik. Ez nem mért eszközteljesítmény vagy natív layout-igazolás.

Kiadás előtt mobil/desktop böngészőben ellenőrizendő az egymezős folyosók, a
mozaikok és a taktikai jelzések olvashatósága, a zoom, régi mentés import és animáció.
Automatikus merge és élesítés nincs.
