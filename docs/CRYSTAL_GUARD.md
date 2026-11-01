# Eredeti Kristályőr és találati reakció

A guard.js saját Canvas 2D sokszögekből rajzolja mindhárom meglévő őrzőt: sötét páncél, lila köpeny, sisak, rózsás kristályrészlet. Nem új ellenféltípus, és a sérült HP nem befolyásolja a típusát. Nincs kép/font/CDN vagy új motor. A HP-sáv az aktuális hp értékét használja, az 1..10 tartományt a meglévő mentésvalidátor őrzi. Nem változik a játékegyensúly, szabályverzió vagy mentés.

## Célpont és életciklus

A describeDirection a step előtt másolt célkoordinátát ad. A main.move egy helyi objektumreferenciával ellenőrzi, hogy a valódi step után ugyanaz az őrző még az enemies tömbben van-e. A referenciát nem adja át az animációnak vagy mentésnek: csak koordináta és survived logikai érték kerül az átmeneti hit leírásba. Ez azért szükséges, mert egy másik őrző ugyanabban a körben beléphet a legyőzött célpont megüresedett mezőjére. Az új foglaló nem kap találati elbillenést.

A motionPose a meglévő 220 ms-os támadási ablakon belül szinuszos intenzitást ad; 0 ms-nál nulla, 110-nél maximum, 220-nál nincs hit. A túlélő célpont teste legfeljebb két képpontot billen a támadás irányába, és enyhén világosodik. Az árnyék és a HP-sáv rögzített marad. Mindkét kimenetnél négy rövid sugár jelzi a becsapódást. Halott őrzőt vagy HP-sávját nem rajzoljuk vissza. Nincs ismétlődő villogás vagy teljes képernyős effekt.

A vezérlő a hit leírást is másolja. A meglévő generációvédelem, gyors átmenetcsere, szünet/import/új futam/rejtett lap, reduced-motion és hiányzó frame API kezelése közös marad. Nincs új időzítő, külön renderciklus vagy üresjárati animáció. A rajzolás nem futtat harcot/előnézetet, és nem ír HUD-ot/mentést. A kör és a mentés az akciókor frissül, nem az animáció végén.

A várakozás, gyógyítás, előnézet, blokkolt/inaktív irány és betöltés nem indít találati jelzést. Őrzőmozgás vagy őrző-visszatámadás animációja ebben a lépésben nincs.

## Tesztek

Öt külön modulteszt: befagyasztott bemenet és Canvas állapotkezelése/fontfüggetlenség; aktuális HP és csak a túlélő célpontnak járó reakció; négyirányú túlélő/halálos találatok előzetes célrögzítése; rövid effektablak és inaktív esetek; közös ütemező adatmásolása és leállítása.

Egy külön teszt a tényleges main.js-t futtatja DOM/canvas modellben. A négy irány mindkét kimenetén, megüresedett mezőre lépő másik őrzőn, gyors bevitelen, szünet/import/laprejtés/új futam/reduced-motion esetén ellenőrzi a rajzolást és leállást. A képkockák közben a mentés, írásszám és HUD változatlan. A korábbi hibásmentés-védelmi és karakteranimációs tesztek is futnak. Ez nem valódi böngészőteszt.

## Integráció a nyitott PR-okkal

A main-alapú külön feature nem tartalmazza #18 környezet- vagy #20 teremgenerátor-kódját. A guard importja a meglévő importlista végére került, a rajzoló a main drawScene szereplőblokkját érinti. A háttér/téma és szabályverzió logikáját nem változtatja. A README új szakasza a már meglévő karakterleírás előtt áll, hogy a többi PR dokumentációjával összefésülhető maradjon.

A #18 `5e6d7883e2b4166652ca77bbf7f3d62e3440c821` és #20 `93667a3785bee7a72a53851fb5301a4526779d3c` headek minden fájlja blobazonossággal ellenőrizve. Helyi git háromutas összefésülés: külön mindkét ággal és a hármas kombinációval konfliktusmentes, a README és main.js bekötések megmaradnak. A saját készlet 81/81, a két páros változat egyaránt 87/87, a hármas 93/93 tesztje sikeres. A hármas változat a korábbi/új pályaszabályok importját és a három környezetet is vizsgálja. Távoli PR-t nem módosítottunk vagy merge-eltünk. Változó head esetén az ellenőrzést meg kell ismételni.

## Kézi vizuális és eszközpróba

Statikus, találati és legyőzött őrzőt tekintsünk át a játékos mellett, valódi HP-sávval és taktikai jelöléssel. #18 kombinációban mindhárom paletta, #20 mellett szűk folyosó is szerepeljen a vizuális próbában. Natív Canvas kontaktlap szemrevételezése önmagában nem böngészős oldalrender, és 360 px-es térképkép nem mobilos layout-teszt.

Ha elérhető valódi böngésző: desktop/360 px, billentyűzet/touch, gyors támadásváltás, szünet/import/visszavonás, csökkentett mozgás futás közbeni váltása és konzolhibák. Fizikai Android/iOS, Safari/Firefox és üresjárati Performance-mérés külön szükséges. A PR külön jelölje a ténylegesen végzett és kimaradt próbákat.

A három palettás natív kontaktlap ténylegesen szemrevételezve statikus/sérült/legyőzött őrzővel, HP-sávval, játékossal és terem-/folyosótérképpel. Valódi böngészős vagy fizikai mobilos próba nem futott; a natív képen referenciafont csak a meglévő kapu-/ereklyejeleket szolgálja, az új őrző nem használ fontot.
