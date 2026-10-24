# Mentésátvitel · 2026-10-24

A `src/transfer.js` verziózott borítékot használ: `format: lumenfall-expedition`, `formatVersion: 1`, `state`. A közös `restoreGame` validátor kezeli a v1 → v2 migrációt és ellenőrzi a pálya zárt szélét, koordinátákat, szereplőket és játékmezőket. A fájlnév nem bizalmi határ. Az import helyi adat, nem szerver által hitelesített eredmény.

A dialógus megnyitásakor a játékakciók blokkolódnak. Fájlválasztás és ellenőrzés után még nincs tárhelyírás. A megerősítés szinkron `localStorage.setItem` sikere után cseréli a memóriában lévő állapotot és rajzolja újra a HUD-ot, a napcímkét és az előnézetet. Sikertelen íráskor a korábbi mentés marad. A bezárt vagy újabb olvasással felváltott kérés eredményét generációszámláló dobja el. A natív fájlválasztó megszakítása után a dialógus Mégse gombjával térhetsz vissza.

## Ellenőrzés

`npm test`: a korábbi 25 teszt mellett adatátviteli és DOM-szerződéstesztek. Lefedett: teljes állapot körútja, v1 migráció, napváltás, lezárt futam, formátum-/méret-/pályahibák, kincstár csere, tárhelyhiba, megerősítés, Mégse/Escape és késői aszinkron olvasás. A letöltés tesztje ellenőrzi a Blob típusát és az objektum-URL felszabadítását.

A DOM-szerződéstesztek kis Node-alapú tesztkörnyezettel futnak; nem valódi böngészőtesztek. Natív fájlválasztó, tényleges fájlletöltés, mobil elrendezés és Safari/Android eszközpróba ebben a változtatásban nem futott. Kézi ellenőrzés: export → másik böngésző → előnézet/Mégse → ismételt import/megerősítés → oldalfrissítés; érvénytelen fájl és letiltott tárhely esetén korábbi állapot megőrzése; billentyűzetes és 360 px-es használat. Élesítés csak a PR összeolvasztása után.
