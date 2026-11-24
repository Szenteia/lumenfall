[Lumenfall automation]

# Elvékonyodó kardfény · 2026-11-23 · #65

A korábbi állandó, két pixel vastag ív helyett kitöltött türkiz sarló követi
a pengét. A meglévő 220 ms-os swing az egyetlen bemenet: nincs új időzítő,
frame-ciklus, mentésmező, asset, függőség, RNG vagy harcszabály.

A swordTrail tiszta függvény. Csak 0 < swing < 1 véges számra ad rajzot.
Az erősség sin(π·swing), az alpha ennek 0.75-szöröse; mindkét végpontban
pontosan nincs rajz. A helyi ív -min(1.2,2.2·swing)..0 radián, tehát a
növekvő szögű penge mögött van, és induláskor nem előlegez meg hosszú csapást.
Tizenkét szakasz, 24 px külső sugár, 0..5 px sugárirányú vastagság:
a távoli vég nulla vastagságú, a penge felé fokozatosan szélesedik.
A 40 px alapkoordinátákat a meglévő karaktertranszformáció méretezi/forgatja.

A drawSwordTrail a penge és markolat ELŐTT rajzolódik; save/restore védi
az alphát és stílust. A penge, test, felszerelés geometriája változatlan.
Reduced-motion a meglévő vezérlővel azonnal nyugalmi pózra vált. Nincs tárolt
utókép; a szokásos teljes scene-törlés eltávolítja a fénycsíkot.

## Integráció

Önálló main-alap: 504d283b4044bd98c5e97c3de93152914337e12d.
Külön helyi kombinációban ellenőrzött PR-headek:
- #58: 42372cb2c7a63560d40ac6e0351da0404b538636
- #60: 49b482ea45c302e66bb431462d24c99f3799d254
- #62: 0261998840aad75360c98c1bdf2559a9daa09a8e
- #64: 7e4d61b112d9f058440929dc7bd6326a21553c1f

Kódjuk nem része ennek a PR-nak. A character.js-ben az új import, a penge
előtti drawSwordTrail hívás és a régi arc/stroke sor eltávolítása szükséges.
A stride, attackBodyPose, fejnézet és minden korábbi teszt megőrzendő.
A main-animation tesztben a trails megfigyelést hozzá kell adni a közös
rectangles/eyes megfigyeléshez. A korábbi arc-hívást elváró rajzolóteszt
most a kitöltött türkiz fénycsíkot ellenőrzi; más állítást nem töröltünk.

## Validálás

- npm test main-alapon: 124/124 sikeres.
- #58 + #60 + #62 + #64 külön kombináció: 172/172 sikeres.
- 99 köztes geometriai minta, végpontok/hibás bemenetek, sugár/vastagság/ív,
  elvékonyodás és erősödés/halványulás; determinisztikus eredmény.
- Négy irány, 20/40/80 px, befagyasztott póz, változatlan penge,
  rajzolási sorrend és alpha/stílus visszaállítás.
- Tényleges main modulban túlélő és legyőzött őr elleni támadás köztes és
  végpóza, frame alatti mentés/HUD változatlanság; szünet/import/új futam/
  akciócsere/reduced-motion után nincs fénycsík vagy függő frame.
  Korábbi háttércache-, mentés- és animációregressziók sikeresek.
- Natív Canvas képsor szemrevételezve: három háttérpaletta, négy irány,
  öt swing érték, 40/20 px, közeli őr és mezőkeret mellett.
- Valódi böngészős/fizikai mobilos próba nem futott: a Playwright Chromium
  futtatható állománya hiányzik. Eszközteljesítmény nincs mérve.

Nincs automatikus merge vagy élesítés.
