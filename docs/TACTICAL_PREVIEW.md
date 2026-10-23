# Várakozás taktikai előnézete

A várakozás gomb felett megjelenő „Ha vársz” sor az egyetlen következő várakozás következményét mutatja: elveszített HP, megmaradó HP, mozduló őrzők száma és esetleges végzetes kimenetel. A szaggatott mezőkeretek a mozduló őrzők célmezőit jelölik. Mozgás vagy támadás után eltérhet a helyzet; az előnézet minden akció után újraszámolódik.

A HP-veszteség a tényleges, nullánál megálló HP-csökkenés: 2 HP-ról végzetes várakozásnál −2 HP szerepel. A szöveges VÉGZETES jelzés a színtől függetlenül jelzi a veszélyt. Lezárt és elbukott futamnál az előnézet rejtett.

`src/tactics.js` a valódi `rest()` műveletet futtatja a teljes menthető állapot JSON másolatán. Az eredeti állapotot, mentést, körszámot és gyógyitalokat nem módosítja. A kijelzés számítása nincs tárolva a mentésben, így v1 és a napi dungeon v2 állapotával is működik. Új harci szabály vagy függőség nincs.

`src/tactics-view.js` kezeli a szöveges, képernyőolvasó számára is elérhető összegzést és a Canvas jelölést. A UI eseményenként frissül, nincs időzítő vagy folyamatos animáció. A panel a meglévő várakozás gombhoz kapcsolódik, ezért az index.html módosítása nem szükséges.

## Ellenőrzés · 2026-10-23

A main-alapú ágon `npm test`: 16/16 sikeres, a korábbi öt szabályteszttel együtt. Az előnézet immutabilitása, egy/két támadó, páros/páratlan kör, blokkolt és alternatív mozgás, egymás után mozduló őrzők, végzetes várakozás és Canvas-célmezők ellenőrizve. A három érintett JS modul szintaxisellenőrzése sikeres.

A nyitott #2 PR (`8e65dc8`) forrásával helyi háromutas összefésülést végeztem: a main.js konfliktus nélkül egyesült. A kombinált napi-dungeon és taktikai előnézet változaton 25/25 teszt sikeres. Ez kompatibilitási próba, a #2 PR nem lett merge-elve vagy módosítva.

Ehhez az új ághoz tényleges böngészős, 360 px-es és fizikai mobilos ellenőrzés nem történt: helyi tesztböngésző és publikált ág-előnézet nincs. A korábbi éles oldal ellenőrzése nem bizonyítja az új UI működését. A PR merge nélkül marad; az élő játékot ez a változás még nem módosítja.
