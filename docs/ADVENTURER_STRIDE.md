# A kalandozó lépése · 2026-11-14

[Lumenfall automation]

A tényleges mezőváltás meglévő 180 ms-os animációja egy váltott lépésciklust kap. A két csizma legfeljebb 2 px-t mozdul ellentétesen, a köpenyszegély legfeljebb 1,5 px-t leng. A fej, lámpás, fegyver és árnyék nem veszi át ezt az eltolást. Az eddigi bob és iránynézet megmarad.

A stride csak megjelenítési póz; nincs új mentésmező, játékszabály vagy renderciklus. Kezdéskor/végén, támadáskor, álló helyzetben és csak őrmozgáskor nulla. A rajzoló hiányzó/nem véges bemenetnél nullát, tartományon kívüli számnál legfeljebb ±1-et használ. A támadási póz letiltja a járást.

Ellenőrzés: 123/123 teszt main-alapon; 147/147 a #44 (benne #34/#36/#42), #38, #40 és #46 helyi kombinációjával. A #40 őr-stride mezőjét megtartva, a játékos stride a póz külön felső szintű mezője. A tényleges main modul DOM-modelljében a negyedciklus két csizmaeltolását is ellenőrizzük; a meglévő megszakítási/reduced-motion és mentéstesztek sikeresek.

Natív Canvas-kontaktlapon mind a négy irány, nyugalmi és két ellentétes póz, 40 és 20 px méret vizuálisan ellenőrizve. A Chromium indítása hibával leállt; valódi böngészős és fizikai mobilos próba nem futott. Kézi próba: négyirányú lépés, támadás, szünet/folytatás, import, lapváltás és reduced motion; a végállapotban ne maradjon járópóz. A PR önállóan mainre épül, nincs automatikus merge.
