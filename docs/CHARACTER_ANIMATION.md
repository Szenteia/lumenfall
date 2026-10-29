# Eredeti lámpáscéhes kalandozó

A `src/character.js` saját Canvas 2D alakzatokkal rajzolja a szereplőt. Nincs kép-, font-, CDN- vagy motortöltés. A fej/haj, türkiz köpeny, csizma, lámpás és kard saját sziluett; nem ismert anime-karakter. Ez egy első, kis chibi karakterváltozat, az őrzők most még a régi jelekkel jelennek meg.

## Működés és invariánsok

A `describeDirection()` a valódi `step()` előtt rögzíti, hogy mozgás vagy kardcsapás következik; így a megölt ellenfél eltűnése sem veszíti el a támadás jelét. Csak a sikeres `step()` eredményéből indul animáció. A végső állapot azonnal mentődik és megjelenik a HUD-on. A következő bemenet nincs letiltva: az aktuális játékállapotból hajtódik végre, az előző animációt lecserélve.

A `character-motion.js` 180 ms mozgást vagy 220 ms kardívet ütemez. Az átmenet másolt primitív koordinátákat tartalmaz, nem a játékállapotot. A generációazonosító a már törölt, későn érkező callbacket is hatástalanná teszi. Az idő és az ütemező injektálható. Végén nincs új képkockakérés, üresjárati ciklus nincs.

A főprogram `draw()` függvénye frissíti a DOM-ot és a taktikai előnézeteket; a képkockák kizárólag a `drawScene()` rajzolását hívják a már kiszámolt előnézettel. Nem számolnak új köröket, nem hívják a mentést és nem módosítják a HUD-ot. A nézet és a tekintési irány nem kerül a JSON-mentésbe; v1/v2, szabályverzió és seed változatlan.

Szünet, importablak megnyitása, importált állapot, új expedíció, rejtett lap és helyreállítás utáni rajzolás megszakítja az átmenetet. A `prefers-reduced-motion` változás azonnal megszakít; bekapcsolt állapotban és frame API hiányában statikus megjelenés van. A matchMedia hiánya önmagában nem hiba.

## Ellenőrzés

A Node tesztek a tényleges főprogramot DOM/canvas modellel is futtatják. Ellenőrzik az egyszeri akcióvégrehajtást, azonnali mentést, képkockák közötti változatlan HUD/mentés/körszámot, a gyors bemenetet és leállításokat. Külön teszteli a túlélő/megölt célpont kardcsapását mind a négy irányba, a generációvédelmet, hiányzó API-t, csökkentett mozgást és állapottól független rajzolást. Ez nem valódi böngésző- vagy fizikai mobileszközteszt.

A karakter négy iránya és a kardív helyi natív Canvas kontaktlapon vizuálisan ellenőrizhető. Ez sem a weboldal valódi böngészős renderelése.

Kézi böngészős terv:

1. Desktop és 360 px szélesség: karakter/sziluett/kapu/ereklyék/előnézeti keretek elkülönülnek, nincs UI- vagy konzolhiba.
2. WASD/nyilak és touch: négy irány, fal, túlélő és megölt őrző; a támadó helyben marad, a HUD azonnal frissül.
3. Gyors egymás utáni bevitel: akciónként egy kör; szünet/import/új expedíció/lapváltás nem hagy korábbi átmenetet. Újratöltve a tényleges végállapot tér vissza.
4. Rendszerbeli csökkentett mozgás be/ki futás közben; statikus állapotban nincs animáció. DevTools Performance: rövid akcióablak után nincs requestAnimationFrame ciklus. Fizikai Android/iOS és Safari/Firefox külön próba szükséges.

A PR számoljon be a ténylegesen elvégzett ellenőrzésekről, és a kimaradt böngészős/eszközpróbákról.
