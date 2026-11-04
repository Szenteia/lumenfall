# Napi termek és folyosók

A 2-es pályaszabály három külön termet farag a kezdetben falakkal teli, 17×13-as térképből. A bal oldali érkezési terem tartalmazza a (2,6) kaput és a biztonságos 1..3 × 5..7 területet. Fent és lent jobb oldalon további, legalább 3×3-as termek keletkeznek. Egy változó oszlopban haladó, egy mező széles központi folyosó és három vízszintes bekötés kapcsolja össze őket. A teremszélesség/magasság, pozíciók, ajtó nélküli bejárati sorok és a folyosó oszlopa seedelt módon változik.

A megoldás első kis teremgenerátor, nem tetszőleges alaprajzok vagy nagyobb térképek rendszere. A folyosók elágaznak, a generátor nem ígér körbejárható útvonalhurkot. A teljes terület összefüggő; minden őrző és ereklye járható mezőre kerül, egymástól és a kaputól külön, legalább négy Manhattan-lépésre a kaputól. Három őrző (6/8/10 HP) és három ereklye, valamint a harc/jutalmak változatlanok.

## Verzió és kompatibilitás

A `generateDungeon(dayId, rulesVersion=RULES_VERSION)` explicit 1 és 2 pályaszabályt fogad, mást RangeError hibával elutasít. A seed névtere tartalmazza a verziót. A régi generátor saját 1-es seedje és az eredeti PRNG-hívási sorrend változatlan marad. A mai alapértelmezett RULES_VERSION=2; a createGame és nextRun ezt írja az új futamba.

A save JSON `version:2` formátuma és `lumenfall-save-v1` kulcsa változatlan. A restoreGame szabálylistával fogadja az 1-es és 2-es napi futamot; v1 migráció továbbra is dayId=null/rulesVersion=0. Nem regenerál térképet és nem címkéz át korábbi állapotot. A mentett térkép a hiteles helyi folytatási alap, az esetleg már összeszedett ereklyékkel, megmozdult vagy legyőzött őrzőkkel együtt. Ismeretlen verzió a meglévő helyreállítási védelembe kerül.

A korábbi napi szabály azonos napon is `Gyakorló · <nap> · korábbi pályaszabály` címkét kap; az aktuális 2-es szabály napi/korábbi nap szerinti címkéje megmarad. Nem állítunk szerveroldali versenyhitelesítést. Éjfél és újratöltés nem cserél futamot; csak nextRun indít új napot, bankmegőrzéssel.

## Tesztek és minták

A tests/fixtures/rules1-save.json a változtatás ELŐTT, a main 1-es generátorával és valódi step/rest akciókkal létrehozott állapot (2026-10-22, bank=77). Nem utólag 1-esnek átírt új pálya. A régi fixture mellett az új futamok visszaállítása/export-importja és az azt követő akcióazonosság is tesztelt.

Az eredeti 1-es generátor ujjlenyomata megmarad; a 2-es saját SHA-256 mintát kap. A két 365 napos vizsgálat külön ellenőrzi a régi generátort és az új termeket. Az új szerkezeti ellenőrzés 3×3 járható belsőt tartalmazó, egymástól elválasztott teremmagokat és falak közti valódi egyszéles átjárót keres a tényleges tiles-ban; nem csak generátor-metaadatot vizsgál. További teszt: teljes bejárhatóság, biztonságos érkezés, foglaltság, többféle elrendezés, hibás verzió, kaputávolság és taktikai előnézetek.

A tényleges main.js DOM/canvas modelltesztje a valódi rules1 mentés importját, címkéjét, utána az új állapot importját és a kezelők további működését is vizsgálja. A meglévő animáció/szünet/reduced-motion/hibás mentés tesztek változatlanul futnak. A modell nem böngésző- vagy eszközteszt.

## #18 környezet-PR integráció

A mai feature friss mainről indul, nem tartalmazza a környezet-PR kódját. #18 main.js bekötése a változatlan tiles formátumra rajzol, és a korábbi napi címke után fűzi a környezet nevét; a témaválasztás napból számol, a játékszabályverziótól függetlenül. Az új generátor sem változtatja a témaválasztást.

A #18 pontos `5e6d7883e2b4166652ca77bbf7f3d62e3440c821` headjének összes fájlját blobazonossággal ellenőriztük. Helyi git háromutas összefésülés a közös mainből: konfliktusmentes, a README és ROADMAP mindkét változása megmarad. A saját ágon 81/81, a kombinált ágon 87/87 teszt sikeres. A tényleges main.js régi szabályú mentésimportja a kombinált kódban is fut, a környezetcímkével együtt; a három környezet cache/import/új expedíció tesztjei is sikeresek. Távoli automatikus merge nincs. Ha később main/PR változik, az integrációt újra kell ellenőrizni.

## Kézi vizuális és böngészős terv

Több nap új térképén tekintsük át a három termet, szűkületeket, elérhető kaput és zsákmányt; #18 kombinációban mindhárom környezettel. Ha valódi böngésző elérhető: desktop/360 px, mozgás/harc, kaputávolság, előnézetek, kijutás, szünet/folytatás, régi mentés importja és újratöltés. Csak a ténylegesen végzett próbákat jelöljük sikeresnek. Natív Canvas kép nem igazolja a mobilos oldalelrendezést vagy fizikai eszközön a teljesítményt.
