[Lumenfall automation]

# Tagolt falsarkok · 2026-11-22 · #63

A falmező akkor kap sarokszegélyt, ha az adott sarokhoz tartozó két
merőleges, közvetlen szomszéd padló. A diagonális mező nem feltétel;
pályán kívül nincs padló. A sorrend soronként, majd NW/NE/SE/SW.
A wallCorners a dungeonGrid explicit méretét használja, hibás geometrián,
sparse vagy nem 0/1 csempetömbön üres eredményt ad. Nem módosít térképet.

A rajzolás kitöltött sokszögekkel történik, vonalvastagság miatti túlnyúlás
nélkül. A 40 px alapon 1..11 saroktartományba eső szárak legfeljebb 4 px
vastagok, 10 px hosszúak. A középső [8,32] négyzet érintetlen; a fénydíszek
helye szabad marad. A másik három sarok csak e helyi koordinátákat tükrözi.
Kopott kő, bronzos kötés és kristályos él külön geometriát kap. A meglévő
cap/vein/edge palettát használjuk, visszafogott kontraszttal.

A drawDungeon a csempeciklus után hívja a drawWallCorners rajzolót.
A meglévő háttér-cache része: az animációs frame továbbra is csak másolja
a kész hátteret. Nincs új függőség, asset, időzítő, RNG, mentésmező,
pályaszabály vagy ütközési változás.

## Integráció

Önálló main-alap: 504d283b4044bd98c5e97c3de93152914337e12d.
Külön helyi kombinációban ellenőrzött források:
- #58: 42372cb2c7a63560d40ac6e0351da0404b538636
- #60: 49b482ea45c302e66bb431462d24c99f3799d254
- #62: 0261998840aad75360c98c1bdf2559a9daa09a8e

Ezek kódja nem része ennek a PR-nak. Közös environment.js-ben az új import
és a csempeciklus utáni drawWallCorners hívás megőrzendő, a drawWallShadows
és drawFloorMosaics előtt. A fali fénydíszek a csempeciklusban maradnak;
a sarokrajz a védett középső területükre nem lép be. A főmodul és a karakterek
változatlanok. Korábbi tesztállításokat nem töröltünk.

## Ellenőrzés

- Main-alap npm test: 125/125 sikeres.
- Külön #58 + #60 + #62 kombináció: 169/169 sikeres.
- Négy sarok, egyetlen szomszéd, átló, sorhatár/perem, több sarok;
  17×13/21×15/15×21, hibás/fagyasztott bemenet és tiltott ambient RNG.
- Három témamotívum, 20/40/80 px, falhatárok, védett fénydíszterület,
  Canvas save/restore és érvénytelen rajzolási méret.
- Tényleges háttér-cache rajzolása és újrahasználata; geometria/téma-váltás.
  Meglévő main-, mentés/import- és animációtesztek is sikeresek.
- Natív Canvas képen mindhárom környezet, 17×13 és 21×15 dungeon,
  350 px nézetszélesség, szereplők, ládák, fali fények és taktikai réteg
  szemrevételezve. A szegély visszafogott; nem takarja a padlót.
- Valódi böngészős és fizikai mobilos próba nem futott: hiányzik a
  Playwright Chromium futtatható állománya. Eszközteljesítmény nincs mérve.

Automatikus merge vagy élesítés nincs.
