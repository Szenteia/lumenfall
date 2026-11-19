> [Lumenfall automation] 2026-11-12: az alábbi korábbi előkészítési állapotot a PLAYABLE_EXPANDED.md integrációja kiegészíti. Az új szabály-3 futamok már 21×15 méretűek; a régi szabályok továbbra is 17×13-asak.

# Mentésgeometria · 2026-11-11

[Lumenfall automation]

A `validateDungeonGeometry(tiles, {width,height})` tiszta ellenőrző explicit méretet vár a megbízható hívótól. Hibánál null, siker esetén `{width,height,floor(x,y)}` az eredmény. A méretnek biztonságos egésznek kell lennie, és tartalmaznia kell a (2,6) kaput belső mezőként. Ellenőrzi a tömbhosszt, minden 0/1 elemet, a zárt falperemet és a járható kaput. Lyukas JavaScript-tömböt is elutasít. A vizsgálat O(width × height), a későbbi koordinátavizsgálat O(1). Nem módosítja a bemenetet; a visszaadott floor az eredeti tömböt olvassa, nem készít tartós validálási tanúsítványt egy később módosított pályáról.

A `restoreGame` ezzel ellenőrzi a pályát és az entitások járható belső koordinátáit. A hívó továbbra is a támogatott 17×13 méretet adja át: a mentés esetleges width/height mezői nem választanak geometriát. A többi entitás-, állapot- és verzióellenőrzés változatlan. A régi pályát nem generáljuk újra, a bankot nem írjuk át.

A modul külön tesztben 21×15 és 15×21 pályát is kezel, de a nagyobb mentések importja és indításkori betöltése továbbra is elutasított. A következő integrációhoz együtt szükséges a verziózott méretválasztás, az új generátor és a runtime összes méretfüggő hívásának bekötése. Ez még nem játszható pályabővítés.

Ellenőrzés: teljes npm test; geometriai hibák, régi mentések export/import köre és felülírás nélküli hibás import; külön helyi kombináció a nyitott PR-okkal, valamint a #36 generátor 365 napi pályájának geometriája. A változás nem érint rajzolást; valódi böngészős vagy fizikai mobilos teszt nem futott.
