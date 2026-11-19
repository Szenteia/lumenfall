# Kristályőr-paletták

[Lumenfall automation] A #51 napi lépés három környezethez igazítja az eredeti Kristályőr kozmetikai színeit: mist acél/türkiz, amber bronz/arany, crystal az eredeti rózsaszín/lila.

A `drawGuard` hatodik, opcionális argumentuma a környezet. Hiányzó vagy ismeretlen azonosító az eredeti palettát használja. Az ötödik argumentum a #40 lépésanimációjának fenntartott helye; integráláskor a mozgás callback stride értékét ott kell továbbadni, a környezetet továbbra is hatodikként.

A main az állapotfrissítéskor előkészített hátteret és környezetet használja a képkockákhoz. Nincs új mentésmező, véletlenszám-hívás, asset, függőség vagy animációs ciklus. A HP-sáv, árnyék, találati villanás és hatássugarak változatlanok.

Ellenőrzés: az alapágra épülő változat 122 tesztje sikeres; a #44 (benne #34/#36/#42), #38, #40, #46, #48 és #50 fejlesztésekkel összeállított helyi változat 150 tesztje sikeres. A tesztek lefedik a paletták eltérését, azonos geometriáját, jelzéseit, fallback viselkedését, import utáni témaváltást és animáció közbeni stabilitást. Natív Canvas képen 40 és 20 pixeles karakterek vizuális ellenőrzése megtörtént. Valódi böngészős/mobilos ellenőrzés nem történt: a Chromium nem indult el ebben a környezetben.
