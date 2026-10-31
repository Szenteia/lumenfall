# Termékterv

## Alapélmény

Stratégiai, megszakítható expedíciók. Saját kalandozó és céhkincstár. A játékos azzal versenyez, milyen értéket képes kimenteni a közös napi labirintusból. Kezdetben aszinkron verseny: nem szükséges egyszerre online lenni, és bármikor megállítható a játék. Élő PvP csak külön módként, későbbi döntés alapján.

## Elsődleges irányok · 2026-10-29-től

Tulajdonosi prioritás: nagyobb, látványosabb és változatosabb dungeonök, saját anime stílusú animált szereplőkkel. Eredeti világ és karakterek; ismert anime-szereplők átvétele nélkül. Minden napi feladat egy kicsi, önállóan befejezhető lépés.

1. Eredeti lámpáscéhes kalandozó, rövid lépés- és kardcsapás-animációval (ennek a változásnak a hatóköre). További őrzők, mozgás- és harci megjelenések külön lépésekben.
2. Eltérő vizuális dungeon-környezetek: saját fal-/padlórészletek, színvilágok és helyszínhangulatok, a taktikai olvashatóság megőrzésével.
3. Pályaméret növelése verziózott, mentéskompatibilis módon; előtte a fix 17×13 feltételezések és mobilos kamera/zoom/pan kezelése. A régi expedíció nem generálódhat újra.
4. Eltérő terem- és útvonalstruktúrák, összefüggő bejárhatósággal, elérhető kijárattal és zsákmánnyal, determinisztikus napi feltételekkel.

Gyors betöltés, mobil/desktop teljesítmény és mentéskompatibilitás minden lépés követelménye. A fenti sorrend munkairány, nem a még hiányzó funkciók elkészültének állítása. Valódi mobil- és több-böngészős próbák továbbra is szükségesek.

## Termek és folyosók · első szerkezeti lépés

Az új, 2-es pályaszabály három külön termet kapcsol össze szűk, elágazó folyosókkal, napi seed alapján változó nyomvonallal és teremméretekkel. Ez a terem-/útvonalstruktúra első bővítése, még 17×13 méretben; nagyobb térkép és mobilos kamera továbbra is külön lépés. Az 1-es pályaszabályú és örökölt mentések saját térképpel folytathatók; új expedíció kapja a 2-es szabályt.

## További tervezett lépések

- Lámpásmechanika: fényerő–észlelés–jutalom döntés; átlátható ellenséges szándékok.
- Három eltérő kezdő felszerelés; ranglistás módban egyenlő kezdő feltételek.
- Szerveroldali futamhitelesítés és globális napi ranglista.
- Céhes fejlődés, HU/EN felület, hang és akadálymentesítési finomítások.

A determinisztikus napi alap, a taktikai előnézetek, a mentésexport/import és az indítási mentésvédelem már a projekt részei.

## Napi ranglista tervezett szerződése

Időzóna: Europe/Budapest, nyári/téli időszámítással. A napi verseny éjfélkor zárul; a végleges lista az addig beérkezett és ellenőrzött eredményekből készül. A következő nap új seedet és külön versenyt kap. A lezárt lista nem változik új beküldéstől. A futamoknak dayId és rulesVersion azonosítójuk van.

Rangsor: kimentett érték csökkenő sorrendben; holtversenyben kevesebb kör, majd korábbi szerveroldali elfogadás. Egy játékos napi legjobb érvényes eredménye. Ranglistán nincsenek tartós statbónuszok a céhfejlődésből. A későbbi ranglistás futam kezdő állapotát a szerver adja; a kliens az akciósort küldi be, a szerver újraszimulálja. A localStorage pontszám soha nem hiteles ranglistaeredmény.

Felfüggesztett ranglistás futam: a mentés megmarad, de napi zárás után már nem kerülhet az előző napi versenybe; gyakorlóként folytatható. Nincs nyílt webszerverre titkos admin kulcsot tartalmazó frontend.

Szerveroldali tranzakció és dayId szerinti egyedi kulcs garantálja a lezárás idempotenciáját. Időzónás napváltás ellenőrzése minden eredményírásnál; külön szerveroldali ütemező éjfélkor lezár. Ezt a szolgáltatást még telepíteni kell; GitHub önmagában nem futtat folyamatos hiteles játék API-t. A tárhely és adatbázis kiválasztása külön megvalósítási lépés.

## Teljesítménycélok (mérés előtt célok)

Webes Canvas 2D alap; nincs WebGL követelmény vagy külső CDN. Eseményenkénti újrarajzolás; akció után rövid, véges animáció lehetséges. Üresjáratban nincs folyamatos render; csökkentett mozgás mellett azonnali állapotmegjelenítés. Chrome/Edge/Firefox/Safari, Android és iOS célzott tesztmátrix. Billentyűzet és touch, később gamepad. Jól olvasható UI 360 px-től, pálya zoom/pan kis képernyőre később. Assetekkel együtt külön betöltési keret és memória mérés.
