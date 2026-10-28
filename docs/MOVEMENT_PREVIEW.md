# Mozgás és kardcsapás előnézete · 2026-10-26

A `src/movement.js` négy külön JSON-állapotmásolaton futtatja a valódi `step()` műveletet. Nem tartalmaz külön harci feloldást. A célmezőn álló őrző a kardcsapás címkéjét határozza meg; az akció engedélyezését, a HP-t, a körfogyasztást, a jutalmat és az őrzők körvégi válaszát a játékmodul számolja. Mind a négy irány ugyanabból a kiindulási állapotból indul, nem akciólánc.

A `src/movement-view.js` egy passzív panelt illeszt a Gyógyítás gomb elé. A meglévő draw() frissíti, így mozgás, várakozás, gyógyítás, import, újratöltés vagy új futam után is az aktuális állapothoz tartozik. Nincs új interakció, időzítő vagy Canvas-jelölés. Falnak lépéskor nincs kör; kardcsapáskor a játékos helyben marad. Végzetes iránynál szöveges jelzés látszik. A HP-veszteség a tényleges csökkenés, nullánál lezárva.

## Ellenőrzés

`npm test`: **60/60** sikeres (47 meglévő + 13 új). Új esetek: négy független lépés; fal és pályahatár; túlélő/megölt célpont; másik őrző visszatámadása; ereklye és több támadó; páros/páratlan kör; végzetes lépés; fagyasztott napi és migrált v1 állapot változatlansága; tényleges akcióeredményekkel való egyezés; lezárt futam; passzív feliratok és frissítés. Három érintett futtatott JavaScript modul szintaxisellenőrzése sikeres.

A `tests/main-preview.test.js` az igazi main.js-t importálja egy Node DOM/canvas modellbe. Ellenőrzi a billentyűzetes és iránygombos események bekötését, a szünet/import akcióblokkolását, az import megerősítését és az előnézet/HUD frissülését, a gyógyítást, várakozást, kijutást és új futamot. Ez nem valódi böngésző- vagy fizikai érintőképernyős teszt.

Valódi böngészős, natív fájlkezelési és 360 px-es/mobileszközös vizuális ellenőrzés ebben a változtatásban nem futott. Kézi terv: desktop és 360 px szélesség; négy irány feliratának olvashatósága; előnézet utáni iránygomb/nyíl eredményének egyezése; fal, kardcsapás és végzetes helyzet; szünet/import alatt nincs akció; mentés/újratöltés után az aktuális állapot jelenik meg. A PR külön ágon marad; élesítés összeolvasztás után.
