# Nagyítható térképnézet

A 100/150/200% fokozat a meglévő Canvas CSS-szélességét módosítja. A belső bitmap marad 680×520; nem keletkezik új teljes pálya vagy háttércache nagyításonként. A viewport 17:13 arányú, határolt, overflow:auto felület. A szegély inset árnyék, nem vesz el két képpontot a számított arányból; így a teljes nézetnél nem keletkezik pusztán a szegély miatt tört képpontos túlcsordulás. Natív érintés/görgetés, böngészőzoom és oldalgörgetés megmarad; nincs saját pinch/drag motor vagy touch-action:none.

## Geometria és állapot

A map-view.js axisScroll függvénye egy tengelyen középre igazít, vagy a teljes játékoscella láthatóságához szükséges legkisebb eltolást számolja, a térkép szélei közé szorítva. A valós Canvas CSS-szélességét és viewport clientWidth/clientHeight értékeit használjuk; a vízszintes/függőleges scrollbar tényleges helyfoglalását is ezek tükrözik.

Nagyításváltáskor középre igazítás, Teljes térképnél 100% és nullázott scroll történik. Normál állapotfrissítéskor csak a játékoskoordináta változása követ, és az is csak szükség esetén. Import/új expedíció új állapotobjektum, ekkor középre igazít; puszta HUD-frissítés, várakozás vagy újrarajzolás nem rántja vissza a kézi pásztázást. ResizeObserver figyeli a nézetet, hiánya esetén window.resize a fallback. Nincs új időzítő, requestAnimationFrame vagy folyamatos kameraanimáció.

A kamerafokozat és scroll csak felületi állapot. Sem játékállapotot, sem localStorage-t nem módosít. A meglévő motion vezérlő és reduced-motion viselkedése változatlan; a nézet igazítása mindig azonnali. A draw() hívja a view.update-et, a drawScene() animációképkockái nem.

## Fókusz, modális állapot, hiányzó markup

A viewport tabindex=0, magyar névvel és súgóval. A saját kezelők natív gombok, legalább 44×44 CSS px célokkal és látható fókuszjelzéssel. A main ablak-szintű játékbillentyű-kezelője a viewportban vagy a nagyításkezelőn belüli event.target esetén visszatér, preventDefault nélkül: a nyíl natívan görgethet, és nem hajt végre egyidejű játékakciót. Más fókusznál a régi nyíl/WASD és a touch iránygombok megmaradnak.

A normál játék-akcióőrök és natív modális felső réteg tovább működnek. Null állapotnál a nagyítók tiltottak, szintetikus kattintásuk sem csinál semmit. A mentéshelyreállítás után a nézet frissül. Null/kezdeti nulla méret nem okoz osztási hibát. Ha átmenetileg a korábbi index.html marad cache-ben, a hiányzó nézet-markup miatt noop vezérlőt kap a játék és az eredeti teljes térképpel működik; nem omlik össze.

## Ellenőrzés

Öt modul-/geometriateszt és a tényleges main.js-t futtató DOM/canvas modellteszt készült. Vizsgált: három fokozat, korlátok, Fit, minimális követés, kézi pásztázás megőrzése, import és új expedíció, átméretezés observerrel/fallbackkel, fókusz, állapot/mentés sértetlensége, modális akcióblokkolás és tényleges új markup melletti hibás mentésvédelem. A régebbi főprogrammodell-tesztek régi markupot használnak és a progresszív fallbacket gyakorolják; az új feature-t a külön main-map-view teszt a teljes új nézetkezeléssel ellenőrzi.

A Node modell nem igazolja a CSS valódi elrendezését vagy a natív görgetést. Kézi böngészős terv: desktop és 360 px, mindhárom nagyítás, négy sarok elérése, scrollbar/touch, teljes térkép visszaállítás, Tab/nyíl/WASD és érintéses irányítás, oldal/nézet görgetése, tájolásváltás, import, modális ablakok és konzolhibák. Android/iOS és eltérő böngészők külön eszközpróbák. Kimaradt próbát nem állítunk sikeresnek.

## Integráció

A napi feature main-alapú; nem tartalmazza #18/#20/#22 kódját. A pontos #18 `5e6d7883e2b4166652ca77bbf7f3d62e3440c821`, #20 `93667a3785bee7a72a53851fb5301a4526779d3c`, #22 `bd9dab5283e2d32e7ba44df22fd583daee1fc9c4` headek forrásai blobazonossággal ellenőrizve. A végleges változattal három külön páros és egy teljes helyi git háromutas összefésülés konfliktusmentes. Saját ág 81/81, mindhárom páros 87/87, a teljes négyes 99/99 teszt sikeres. A README és main.js közös bekötései megmaradnak. A #18 háttércache-t a CSS-nagyítás nem érinti, a #22 szereplőrajzolása és a #20 változatlan 17×13 térképe ugyanazon Canvason működik. A README szakasza a Mappák elé került, hogy ne ugyanoda szúrjon be, mint #22. Nincs automatikus távoli merge.

A pályaméret még nem nőtt; a modul csak a nagyobb dungeonökhöz szükséges nézetkezelés első lépése.

Tényleges korlát: nincs elérhető helyi Chromium/Chrome. Valódi böngészős/viewportos, natív görgetési, fizikai mobilos és Performance-próba nem futott. A CSS és natív érintéses görgetés kézi ellenőrzése szükséges; Node modell alapján ezt nem állítjuk igazoltnak.
