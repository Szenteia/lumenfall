[Lumenfall automation]

# Közös látványverzió · 2026-11-24

A #67 napi javaslat alapján a meglévő #58 PR frissítése. A korábbi integráció és annak összes tesztje megmarad: [előző integráció](INTEGRATION_2026-11-19.md).

## Források

- #58 alap: 42372cb2c7a63560d40ac6e0351da0404b538636
- #60 falárnyék: 49b482ea45c302e66bb431462d24c99f3799d254
- #62 karakterfej: 0261998840aad75360c98c1bdf2559a9daa09a8e
- #64 sarokdísz: 7e4d61b112d9f058440929dc7bd6326a21553c1f
- #66 kardfény: 5bbe7650ba7440b264a0c8d1b96487984a9f7f54

Mind az öt helyi forrás HEAD fájlfája megegyezett a frissen ellenőrzött GitHub tree SHA-val. A main kiindulása változatlan: 504d283b4044bd98c5e97c3de93152914337e12d. A frissítés normál új commit, a #58 előzménye megmarad; nem zárja le az eredeti PR-okat és nem telepít.

## Összefésülés

- environment.js: a cellák és fali lámpások után sarokdíszek, falárnyékok, végül padlómozaikok, ugyanabban a statikus háttér-cache-ben.
- character.js: a korábbi járó láb/köpeny és támadási testpóz megmarad; a fej irányfüggő, a kardfény a forgatott penge mögött rajzolódik.
- main-animation.test.js: a korábbi csizma- és testpóz-ellenőrzések mellett az irányfüggő szemek és a kardfény megjelenése/megszakítása is ellenőrzött.
- character-motion.test.js: a korábbi rulesVersion:2 fixture megmarad, a régi körív helyett a kitöltött fénycsíkot ellenőrzi.
- Mind a négy forrás külön új modulja, tesztje és dokumentációja bekerült. A szimuláció, mentési séma és pontozás nem változott a #58 alaphoz képest.

## Ellenőrzések

- npm test: 172/172 sikeres, 0 kihagyott teszt az egyesített változaton.
- Valódi main modul DOM/Canvas modellben: mindhárom környezet, rules2 → rules3 → rules2 import, háttér-cache, mentés/HUD és pályaméret.
- Négy nézési irány járás/harc során, találat/halál, szünet/import/új futam/új akció/reduced-motion megszakítások; az animáció nem ír mentést és nem léptet kört.
- Natív Canvas szemrevételezés: mindhárom környezet, 17×13 és 21×15 pálya 350 px szélességben; nagy pálya 840×600 méretben; négy karakterirány és öt támadási fázis. Kapu, ládák, őrzők és taktikai szaggatott jelzések együtt látszanak.
- git diff --check.

Korlát: a Playwright Chromium futtatható fájlja hiányzik; a valódi böngészős indítás sikertelen volt. A Canvas szemrevételezés és modellteszt nem igazol böngésző-layoutot vagy fizikai eszközön mért teljesítményt. Kiadás előtt Chrome/Firefox/Safari, mobil touch/zoom/pan, mentésimport, gyors megszakítások és tényleges betöltési/képkocka-idő ellenőrzése szükséges. CI-sikert nem állítunk.
