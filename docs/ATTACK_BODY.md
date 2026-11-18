# Kalandozó támadási póz

[Lumenfall automation] A #55 kozmetikai lépés a meglévő 220 ms-os swing előrehaladásból számol. 0–25% között a test egy pixelt hátrahúzódik; 25–55% között három pixelt előrelendül; 55–100% között alapállásba tér vissza. A szakaszokat smoothstep köti össze. A köpeny félakkora ellenirányú helyi eltolással reagál, az árnyék rögzített. Az értékek 40 px mezőre vonatkoznak, Canvas-skálázással arányosak. A kardív és az őrök találati reakciója megmarad.

Hiányzó, nem véges, nem szám vagy 0–1 tartományon kívüli swing nyugalmi megjelenítést ad. Nincs új játékállapot, mentésmező, szabály, időzítő vagy animációs ciklus. A main és az animációs vezérlő nem változik; a korábbi megszakítások és reduced-motion viselkedés érvényes marad.

Tesztelés: 124/124 teszt az alapágra épülő változaton; 157/157 a #44 (benne #34/#36/#42), #38, #40, #46, #48, #50, #52, #54 helyi kombinációjában. A tesztek ellenőrzik a folytonosságot, határértékeket, négy irányt, hibás bemenetet, árnyékot, skálázást, Canvas-állapotot és a valódi main köztes támadási elmozdulását mentés/HUD-írás nélkül. A régi guardstep teszt az őrök rajzolási tartományában ellenőrzi az elmozdulás megszűnését, mert a játékos új támadási eltolása még 220 ms-ig tarthat.

Négy irány és öt póz 40/20 px-es natív Canvas-képsoron ellenőrizve. Valódi böngészős/mobilos próba nem futott: a Playwright Chromium végrehajtható fájlja hiányzik. A kép és modellteszt nem eszközös teljesítménymérés.

Integráció: #48 szintén módosítja a character.js fájlt. Meg kell tartani a stride alapú csizma- és köpenylengést, az új támadási eltolást pedig a köpeny pontjaira rá kell alkalmazni. Támadáskor a meglévő stride-kizárás megmarad. Más nyitott PR távoli ága nem módosult.
