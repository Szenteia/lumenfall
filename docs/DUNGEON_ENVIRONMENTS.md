# Saját dungeon-környezetek

A `src/environment.js` három saját Canvas 2D stílust tartalmaz: Ködkő-romok, Borostyáncsarnok és Kristálykripta. A közös kőfal-geometriához eltérő paletta és motívum társul: repedés, vízszintes berakás, illetve elágazó kristályér. A padlórészletek sötétek és többnyire a lapok sarkában vannak, hogy ne hasonlítsanak felvehető tárgyra vagy taktikai jelzésre. Azonos járhatóságot mutatnak; nincs díszítésből következő rejtett játékszabály.

## Választás és mentés

Az `environmentFor(dayId)` külön, stabil `lumenfall-visual-v1:` névtérrel számol egész hash-t, és a befagyasztott háromelemű témalistából választ. Nincs Math.random, rendszeridő vagy eszközidőzóna. Ez vizuális változat, nem a játék RULES_VERSION-je; a pályageneráló PRNG nincs érintve. A listát és a választást később se rendezzük át önkényesen, ha a régi futam látványát meg akarjuk őrizni.

Nap nélküli migrált v1 állapot a Ködkő-romok környezetet kapja. Mindig a mentett futam napját használjuk: régi nap importja vagy éjfél utáni folytatás nem kapja az aktuális nap témáját. Csak a nextRun választ új napot. Nincs új mentésmező, mentésverzió, online ranglista vagy hitelesített pontbeküldés.

## Háttér újrahasználása

A `createDungeonBackground()` egyetlen, DOM-ba nem illesztett 680×520-as Canvas felületet tart (nyers RGBA tartalma kb. 1,35 MiB). A `prepare()` kulcsa a kiválasztott téma és a teljes tiles tartalom. Új állapot frissítésekor ugyanazt a hátteret használhatja akkor is, ha az állapot vagy tömb referenciája más, de tartalma azonos. Megváltozott pálya vagy téma újrarajzolja ugyanazt a felületet. Nincs pályánként növekvő cache.

A főprogram draw() állapot/HUD-frissítése készíti elő a hátteret és fűzi a környezet nevét a meglévő napi/gyakorló címke után. A drawScene() csak a kész hátteret másolja át, majd a meglévő taktikai kereteket, kaput, tárgyakat és szereplőket rajzolja. A karakteranimáció így nem választ témát, nem generál dekorációt és nem ellenőriz tiles-kulcsot képkockánként. Nincs új renderciklus vagy animációs effekt.

A prepare(null) nem hoz létre képet; a főprogram védett, állapot nélküli mentéshelyreállítása nem fest régi hátteret. Az import, új futam és helyreállítás utáni draw() frissíti a helyszín nevét és a cache-t. A karakteranimáció/szünet/reduced-motion kezelése változatlan.

## Ellenőrzés és korlátok

A Node tesztek a determinisztikus 365 napos témaválasztást, mindhárom környezetet, befagyasztott napi/v1 állapot sértetlenségét, export/importot, napváltást, játékszimuláció azonosságát és a cache frissítését/újrahasználatát vizsgálják. Külön modellteszt futtatja a tényleges main.js-t három különböző környezetű importtal, eltérő térképpel, legacy mentéssel és új futammal; animáció közben sem háttér-újraépítés, sem mentésírás nem történhet.

Helyi natív Canvas összehasonlító képen mindhárom témát azonos térképpel, kapuval, őrzőkkel, ereklyékkel, kalandozóval és taktikai kerettel kell szemrevételezni. A referenciafonttal készült natív kép nem böngészős vagy fizikai mobilteszt, és a 360 px széles képre kicsinyítés nem igazolja az oldal mobilos elrendezését.

Kézi böngészős terv:

1. Három megfelelő nap mentésével mindhárom helyszín ellenőrzése desktopon és 360 px viewportban: fal/padló, szereplők, kapu, tárgyak és szaggatott célkeret elkülönül, helyszínnév nem takar más UI-t.
2. Mozgás és kardcsapás, gyors bemenet, szünet, reduced-motion, import/visszavonás és újratöltés. Nincs konzolhiba vagy korábbi expedícióból maradt háttér.
3. Korábbi napi és v1 mentés betöltése; bank, nap és teljes játékállapot megmarad. Új expedíció már az aktuális napot használja.
4. DevTools Performance/memória: háttér csak pálya-/témaváltáskor épül; akció után üresjáratban nincs rajzolási ciklus. Fizikai Android/iOS és több böngésző külön ellenőrzés.

A tényleges teszteredményeket és a kimaradt próbákat a PR rögzíti. Nagyobb pálya és új terem-/útvonalstruktúrák továbbra is külön fejlesztések.
