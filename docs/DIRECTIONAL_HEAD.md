[Lumenfall automation]

# Négyirányú kalandozófej · 2026-11-21 · #61

A saját lámpáscéhes karakter sötétkék haja és ezüst tincse négy nézetet kap.
Elöl két szem; balra/jobbra külön profilkontúr és egy szem; hátul zárt hajkontúr,
arc nélkül. A `headView(dx,dy)` kizárólag a pontos kardinális értékeket fogadja:
(0,-1) hátul, (-1,0) bal, (1,0) jobb; minden más bemenet előre néz.
A karakterrajzoló meglévő alapértékei (0,1) változatlanok.

A `drawAdventurerHead` a meglévő karakter-Canvas transzformációjában rajzol,
legfeljebb x=-10..10, y=-16..2 fejterületen. Saját transzformációt vagy időzítőt
nem indít; az egész karaktert nem tükrözi. A hívó save/restore párja állítja vissza
a Canvas stílusát. Csak a fejblokk változott: test, csizma, köpeny, lámpás,
fegyver és árnyék maradt. Nincs asset, függőség, mentésmező vagy játékszabály-változás.

## Integráció

Main-alap: 504d283b4044bd98c5e97c3de93152914337e12d.
A nyitott #58 (42372cb2c7a63560d40ac6e0351da0404b538636) és #60
(49b482ea45c302e66bb431462d24c99f3799d254) kódja nem része ennek a PR-nak.
Külön helyi kombinációban ellenőrizve: character.js-ben csak az új import és
az arc/haj régi blokkja helyére tett `drawAdventurerHead(ctx, dx, dy)` kell.
Megőrzendő az attackBodyPose, annak test-/köpenyeltolása, stride és minden
korábbi tesztállítás. A main-animation teszt közös változata az eyes megfigyelést
és irányciklust hozzáadja a meglévő rectangles megfigyeléshez és támadási teszthez.

## Ellenőrzés

- Main-alap: npm test, 124/124 sikeres.
- #58 + #60 + fejnézet külön kombináció: npm test, 165/165 sikeres.
- Nézetenként szemszám, oldal, eltérő hajkontúr, hátsó arc hiánya, fallback,
  befagyasztott póz, fejhatárok, 20/40/80 méretezés, Canvas egyensúly és felszerelés.
- Valós main-modul DOM/Canvas modellben: négyirányú járás/támadás köztes és
  végpóza, import utáni előrenézés, frame alatti mentés/HUD változatlanság.
  Megmaradtak a szünet, új futam, reduced-motion és háttércache regressziótesztjei.
- Natív Canvas kontaktlap: négy irány, nyugalom/járás/támadás, 40 és 20 px,
  mindhárom környezet a közös változattal. Szemrevételezve.
- Valódi böngészős/mobilos próba nem történt: a Playwright Chromium futtatható
  állománya hiányzik. A modellteszt és natív Canvas nem helyettesíti ezt.

Automatikus merge vagy élesítés nincs.
