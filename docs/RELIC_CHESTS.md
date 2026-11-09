# Eredeti ereklyeládák

A `drawChest(ctx,chest,theme,size=40)` külön Canvas 2D rajzoló. A meglévő anime fantasy karakterekhez igazodó, eredeti láda közös kontúrt, fedelet, pántokat, zárat és elágazó rúnajelet kap. Nincs font-, emoji-, képfájl- vagy hálózati függőség. A három paletta a meglévő környezet `id` mezőjére épül; hiányzó/ismeretlen téma a ködköves alapváltozatot adja.

A main az állapotfrissítéskor előkészített háttértémát tartja meg, és azt használja az animációs képkockákon is. A ládalista mindig a tényleges `state.chests`: felvétel után azonnal eltűnik a tárgy, az eredeti +30 jutalom és egy kör megmarad. A HUD ◆ jelölése változatlan. A rajzolási sorrend: háttér, kapu/ládák, taktikai jelzés, őrzők, találat és kalandozó. A tárgy legfeljebb 26×28 pixel a 40 pixeles cellán belül; a külső sáv szabad a figyelmeztetésekhez. A teljes Canvas-állapot save/restore közé zárt; koordináta és cellaméret explicit, nincs pályaméret-feltételezés.

Nincs új animációs ciklus, játékszabály, mentésmező, seed vagy generátorváltozás. A szereplők a tárgyak fölé rajzolódnak. A #34 térképnézet és #36 kísérleti generátor külön PR marad.

## Ellenőrzés

- Rajzolómodell mindhárom palettával, 20/40/80 px-es cellával és régi pályahatáron túli koordinátával; fagyasztott bemenet, geometriai határok, Canvas-stílus/alpha/transzformáció helyreállítása, alapváltozat.
- Tényleges main.js DOM/Canvas modell: kezdeti rajzolás, három környezet importja, felvétel és azonnali eltűnés, jutalom/kör, animációs frame, szünet/folytatás, örökölt mentés és új futam. A felvett láda későbbi frame-ben sem tér vissza; a háttér nem épül újra, a tárolás/HUD nem frissül frame-enként.
- A tényleges modulokkal készített natív Canvas-kontaktlap vizuálisan áttekintve: mindhárom háttér, 40 és 20 px cella, taktikai jelzés és őrzőátfedés, szomszédos kalandozó. Ez nem weboldal-/böngésző- vagy fizikai mobileszközpróba; ilyen próba nem futott.

Kézi ellenőrzés: 360 px széles és desktop ablakban a három környezet, zoom, tárgyfelvétel, import és folytatás; a tárgy és a figyelmeztetés felismerhetősége. A mentésformátum és a játszható 17×13 méret változatlan.
