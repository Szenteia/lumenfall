# Termékterv

## Alapélmény

Stratégiai, megszakítható expedíciók. Saját kalandozó és céhkincstár. A játékos azzal versenyez, milyen értéket képes kimenteni a közös napi labirintusból. Kezdetben aszinkron verseny: nem szükséges egyszerre online lenni, és bármikor megállítható a játék. Élő PvP csak külön módként, későbbi döntés alapján.

## Következő kis lépések

1. Determinisztikus napi pálya: ugyanaz a seed minden játékosnak, elérhető kijárat és ereklyék tesztekkel.
2. Lámpásmechanika: fényerő–észlelés–jutalom döntés; átlátható ellenséges szándékok.
3. Három eltérő kezdő felszerelés; ranglistás módban egyenlő kezdő feltételek.
4. Több böngészőn és valódi mobilokon input, szünet, mentés és teljesítmény tesztelése; mentésexport/import.
5. Szerveroldali futamhitelesítés és globális napi ranglista.
6. Céhes fejlődés, eredeti karaktergrafika, HU/EN felület, hang és akadálymentesítési finomítások.

## Napi ranglista tervezett szerződése

Időzóna: Europe/Budapest, nyári/téli időszámítással. A napi verseny éjfélkor zárul; a végleges lista az addig beérkezett és ellenőrzött eredményekből készül. A következő nap új seedet és külön versenyt kap. A lezárt lista nem változik új beküldéstől. A futamoknak dayId és rulesVersion azonosítójuk van.

Rangsor: kimentett érték csökkenő sorrendben; holtversenyben kevesebb kör, majd korábbi szerveroldali elfogadás. Egy játékos napi legjobb érvényes eredménye. Ranglistán nincsenek tartós statbónuszok a céhfejlődésből. A későbbi ranglistás futam kezdő állapotát a szerver adja; a kliens az akciósort küldi be, a szerver újraszimulálja. A localStorage pontszám soha nem hiteles ranglistaeredmény.

Felfüggesztett ranglistás futam: a mentés megmarad, de napi zárás után már nem kerülhet az előző napi versenybe; gyakorlóként folytatható. Nincs nyílt webszerverre titkos admin kulcsot tartalmazó frontend.

Szerveroldali tranzakció és dayId szerinti egyedi kulcs garantálja a lezárás idempotenciáját. Időzónás napváltás ellenőrzése minden eredményírásnál; külön szerveroldali ütemező éjfélkor lezár. Ezt a szolgáltatást még telepíteni kell; GitHub önmagában nem futtat folyamatos hiteles játék API-t. A tárhely és adatbázis kiválasztása külön megvalósítási lépés.

## Teljesítménycélok (mérés előtt célok)

Webes Canvas 2D alap; nincs WebGL követelmény vagy külső CDN. Eseményenkénti újrarajzolás, üresjáratban nincs folyamatos render. Chrome/Edge/Firefox/Safari, Android és iOS célzott tesztmátrix. Billentyűzet és touch, később gamepad. Jól olvasható UI 360 px-től, pálya zoom/pan kis képernyőre később. Assetekkel együtt külön betöltési keret és memória mérés.
