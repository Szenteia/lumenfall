# Őrzők rövid lépésanimációja

A tényleges őrzőlépés 180 ms-os, simított átmenettel jelenik meg. Mozgás, kardcsapás, várakozás és sikeres gyógyítás is kiválthatja. A mozdulatlan őrző statikus marad. Csökkentett mozgás mellett a végállapot azonnal látszik; az animáció soha nem késlelteti a következő bemenetet.

## Állapot és megjelenítés

A `guard-motion.js` a valódi akció előtt objektumazonosság szerint rögzíti az őrzők koordinátáit. Az akció után csak a még jelen lévő, ténylegesen mozgó objektumokhoz készít kezdő-/végpontot. Megölt őrző törlése és a felszabadult mezőre lépő túlélő nem keveredik össze; a tömbindex és a koordináta önmagában nem azonosító. Új állapotobjektum, például új expedíció, nem animálódik a korábbihoz képest.

A hivatkozás csak átmeneti megfeleltetés, nem kerül a mentésbe. A koordinátákat az animációvezérlő külön másolja; a képkockák nem olvassák a mozgó őrző aktuális koordinátáját animációs végpontként. Nincs új tartós azonosító, mentés-/szabályverzió vagy seed. A game.js és save.js változatlan.

A kör, HP, taktikai előnézet és mentés azonnal frissül. A képkockák kizárólag a jelenetet rajzolják. A meglévő véges `createCharacterMotion` kezeli a kalandozót és az őrzőket együtt: az őrző 180 ms-nál megérkezik, a 220 ms-os kardív még befejeződhet. Várakozás/gyógyítás közben a kalandozó helyben, változatlan tekintési iránnyal áll. Nincs második AI-szimuláció vagy állandó renderciklus.

A `drawMovingGuard` a meglévő rajzolót a HP-jelzéssel együtt eltolja, a valódi őrzőobjektumot nem cseréli le. Így a későbbi Kristályőr-rajzoló és találati egyezés is megtartható. A találati becsapódás a támadás célmezőjén marad. A taktikai keretek a valódi végállapotból következő kört jelzik, nem az animáció köztes pillanatát.

Gyors új akció az aktuális valódi állapotból indul; a korábbi átmenetet megszakítja. Generációvédelem szűri a későn érkező callbacket. Szünet, import megnyitása/megerősítése, új futam, rejtett lap és reduced-motion megszakít. Falnak lépés, sikertelen gyógyítás vagy őrzőmozgás nélküli várakozás nem indít új animációt.

## Nyitott PR-ok integrációja

Ez önálló main-alapú változás. A #18 környezetcache, #20 teremgenerátor, #22 Kristályőr és #24 térképnézet nem része ennek az ágnak. Összefésüléskor a #22 `drawGuard` hívását kell a `drawMovingGuard` callbackjébe helyezni, a `drawGuardImpact` hívást pedig utána, a játékos előtt megtartani. A character-motion.js-ben mind az új őrzőpozíciókat, mind #22 találati payloadját és annak másolását meg kell őrizni. A main.js akciókezelése az új jelenetleírást, a move() pedig #22 túlélő-célpont jelzését tartsa meg. #24 nézetfrissítése és #18 háttérelőkészítése továbbra is csak a HUD-rajzolásban fusson, nem képkockánként.

## Ellenőrzés

Node tesztek: négy irány, várakozás/gyógyítás, több őrző, fal és őrzőblokkolás, alternatív út, páros/páratlan kör, megölt célpont és tömbindex-eltolódás, hosszabb kardív, másolt frame-adatok, megszakítás és késő callback, reduced-motion, régi mentés. A tényleges main.js DOM/Canvas modellel futtatott tesztje azonnali szimulációt és mentést, változatlan képkockánkénti HUD/tárolást, keyboard/touch és modális útvonalakat ellenőriz. Ezek nem valódi böngészős tesztek.

Kézi böngészős terv:

1. Desktop és 360 px: várakozás/gyógyítás után több őrző folyamatosan mozog, a HP-jelzés velük marad; a kalandozó nem lép vagy csap tévesen.
2. Gyors input, kardcsapáskor elpusztuló őrző és helyére lépő másik: nincs visszatérő ellenfél vagy hibás találati reakció. Szünet/import/lapváltás után a valódi végállapot látszik.
3. Reduced-motion futás közbeni váltása, majd új akció; Performance felvételen legfeljebb 180/220 ms-os animációablak után nincs folyamatos frame-kérés.
4. A nyitott PR-okkal: Kristályőr és HP együtt mozog; találati sugarak a célmezőn maradnak, a túlélő nem kapja a megölt őrző reakcióját. 100/150/200%-os nézetben nincs képkockánkénti kameraigazítás. A három környezet és szűk folyosók olvashatók.
5. Fizikai Android/iOS, Safari/Firefox külön próba; v1/v2 export/import és újratöltés az azonnal elmentett végállapotot állítja vissza.

A PR a tényleges teszt- és összefésülési eredményeket közli; a kimaradt böngészős/eszközpróba nem állítható elvégzettnek.
