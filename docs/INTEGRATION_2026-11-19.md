[Lumenfall automation]

# Közös integráció · 2026-11-19

Main kiindulás: 504d283b4044bd98c5e97c3de93152914337e12d.
A napi #57 issue induláskor teljesen olvasható, 0 hozzászólással.
Egyetlen main célú PR; nincs automatikus merge, telepítés vagy eredeti PR-lezárás.

## Ellenőrzött források

- #56: ba1f58954c2c208c15f512210691fc6ce39a61a8
- #54: a11f59c580244cc717b4a6178bfcd31dfc734ea4
- #52: 073a2a360fa80d92053c8106d58b6c92bd604810
- #50: 4fbe45d12d1c108c6f032bc468ebd8d24411fad6
- #48: 8799f8c11ea895750ae09be87092e875ba3bbae8
- #46: a9b4d07a365c90613c6bc2913fec0f3fca5d80bd
- #44: 9126406edf311e02a58c4a999146e367bcfdc9f9
- #42: 894a8e824393d65167e572dda12c12873b50cfd2
- #40: d79d9a95144e53521e336a3dc869775f27448416
- #38: c1d0b3819c1428e10bfc0629a0988af49caa221d
- #36: c118143729382faf7b16a818b76b20d9a7caac58
- #34: cc821898b0651feebdd226f4af563244c12e74ab

A #44 fájlfájából indult az integráció, amely már tartalmazza #34/#36/#42 eredményeit. A többi nyolc PR mainhez viszonyított módosításai háromutas fájl-összefésüléssel kerültek be. A helyi források HEAD tree SHA-ja mind a kilenc közvetlen forrás esetén egyezett a frissen lekért GitHub commit tree SHA-val. A pontos SHA-lista őrzi a származást; a main célú commit nem zárja le az eredeti PR-okat.

## Konfliktusok és megőrzött szerződések

- main.js: közös expeditionSize, bitmap/zoom méret, background.prepare(state,layout) és environment. Kapu/ládák a taktikai réteg előtt, szereplők utána. drawGuard ötödik paramétere stride, hatodik environment.
- guard.js: #40 járási csizma/köpeny és #52 paletták együttesen; árnyék/HP változatlan.
- character.js: #48 láb-/köpenyszegély és #56 támadási test-/köpenyeltolás együtt. character-motion.js megtartja a játékos és minden őr külön stride értékét.
- environment.js: fali dekoráció és padlómozaik ugyanabban a statikus háttér-cache-ben.
- main-environment.test.js: #50 kapu/rétegsorrend/szünet állításai és #52 palettaellenőrzései együtt; mindhárom téma rules2→rules3→rules2 importtal, bitmap, mentés és frame-cache ellenőrzéssel.
- main-animation.test.js: járási negyedciklus csizmái és támadási köztes testpóz is ellenőrizve. main-guardstep őrrajzolási tartománya kizárja a játékos helyi támadási eltolását.
- main-chest régi geometriájú fixture explicit rulesVersion:2. A többi régi fixture #44 adaptációját megtartottuk. Minden forrás-PR dokumentációja és új tesztje bekerült, a módosított teszteket összefésültük.

## Validálás

- Teljes npm test: 158/158 sikeres, 0 kihagyott teszt.
- 365 napi generált új pálya mentési körútja; régi snapshotok, importvédelem, kincstár és régi határon túli akciók.
- Tényleges main modul DOM/Canvas modellben: méretváltás, zoom, mentésimport, ládafelvétel, kapu, paletta, animáció/megszakítás, reduced-motion, HUD/mentés/cache invariánsok.
- Új rules3 kijutás, bankolás, export/import és következő futam külön regresszió.
- Natív Canvas szemrevételezés: mindhárom téma 17×13 és 21×15 térképe, 350 px szélességben, díszekkel, kapuval, ládákkal és szereplőkkel.
- git diff --check; publikáláskor a GitHub tree azonos legyen a tesztelt helyi fájlfával.

Korlát: a Playwright Chromium futtatható fájlja hiányzik a környezetből, ezért valódi böngészős és fizikai mobilos próba nem futott. A modellteszt és Canvas-kép nem igazol natív layoutot vagy mért eszközteljesítményt. GitHub CI-sikert nem állítunk.

## Kiadás előtti kézi próba

Chrome/Firefox/Safari, 360 px mobil és desktop: régi mentés import→új futam→régi import; zoom/pan és touch; mindhárom környezet; járás/harc közbeni gyors akció, szünet, import és lapelrejtés; reduced-motion. Ellenőrizni kell az olvasható taktikai jelzéseket és a betöltési/képkocka-időket valódi eszközön.

