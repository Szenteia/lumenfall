# Taktikai előnézetek és pályaméret

A `previewDirections(state, size)` és `previewWait(state, size)` opcionális belső méretparamétert fogad: `{width: 21, height: 15}`. Méret nélkül a jelenlegi 17×13-as pályával dolgoznak. A méret nem az expedíció JSON-mezőiből származik.

Az előnézetek ugyanazt a `size` értéket továbbítják a leválasztott állapotmásolaton futó valódi `step`/`rest` függvénynek. A négy irány négy független, egyetlen akcióból álló lehetőség. A közös `dungeonGrid` elutasítja a hibás vagy a mezőtömbbel nem egyező méretet; ilyenkor mindkét előnézet `null`, így nincs hamis biztonságjelzés. A meglévő nézeti komponensek ezt már elrejtett előnézetként kezelik.

Nincs állapot-/mentésírás, új kör vagy animáció; a visszaadott eredmények másolt adatok. A magyar feliratok és a jelenlegi main.js hívások változatlanok. A 21×15-ös pálya kizárólag tesztbemenet, a játék továbbra is 17×13.

A nagyobb játszható dungeon bekötéséhez még szükséges a méretfüggő háttér/Canvas/nézet kezelése, a verziózott generátor és mentés támogatása, valamint a megbízható méret továbbítása a UI hívásainál. Ez a változás nem fogad el nagyobb importált mentést.

## Ellenőrzés

A `tests/preview-size.test.js` a 21×15-ös szintetikus pályán a tényleges következő körrel hasonlítja össze az irányok és a várakozás eredményét. Ellenőrzi a régi határokon túli mozgást, harcot, zsákmányt, falakat/pályaszéleket, őrzők blokkolását, páros/páratlan és halálos kört, hibás méretet, megtévesztő állapotmezőket, fagyasztott bemenetet és leválasztott eredményeket. A teljes tesztkészlet megtartja a régi mentés-/generátor- és main.js modellteszteket is. Ezek nem böngészős vagy fizikai mobileszköztesztek.
