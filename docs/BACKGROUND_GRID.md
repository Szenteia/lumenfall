# Dungeon-háttér és pályaméret

A háttér `prepare(state, layout)` hívása és a `drawDungeon(ctx, tiles, theme, cellSize, layout)` opcionális belső `{width, height}` méretet fogad. A közös `dungeonGrid` ellenőrzi a méretet és a mezőtömb hosszát; az alapértelmezés 17×13. Az expedíció mentett mezői nem határozzák meg a méretet. A 21×15-ös tesztpálya 40 px-es mezőkkel 840×600 px-es hátteret kap.

A gyorsítótár kulcsa a környezet, a két méret és a mezők elrendezése. A háttér egyetlen vásznat használ újra, az animációs képkocka a kész képet másolja. Érvénytelen bemenetnél a háttér elrejtve marad, és a vászon nem méreteződik át. Ugyanarra az érvényes elrendezésre visszatérve a gyorsítótárból újra megjelenhet.

A látható Canvas méretezése és a kamera/nagyítás bekötése külön lépés. A generátor, a mentés és a játszható 17×13-as pálya változatlan. A Canvas-modelltesztek az utolsó sor és oszlop festését, az azonos mezőtömb eltérő sorbeosztását, a gyorsítótárat és az érvénytelen méret kezelését ellenőrzik.
