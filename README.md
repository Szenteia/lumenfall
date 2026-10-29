# Lumenfall: Guilds of the Deep

SzenteiA saját, felülnézetes, taktikai dungeon játéka. Első játszható alap: 2026-10-21.

## Mozgás és kardcsapás előnézete

A négyirányú taktikai panel megmutatja, hogy a következő iránygomb lépést, kardcsapást vagy blokkolt próbálkozást jelentene, és mennyi HP maradna az őrzők válasza után. A „VÉGZETES” jelzés halálos kimenetelt jelez. A négy sor külön lehetőség, nem akciósorozat; az előnézet nem fogyaszt kört és nem módosít mentést. Falnak lépés nem indít őrzőkört. Őrzőre csapáskor a karakter a helyén marad, megöléskor is. A megszokott irányítás egy megnyomással működik.

## Visszatérés a kapuhoz

A „Kapu: legalább N mező” jelzés a legrövidebb, falakat kerülő, négyirányú út hosszát mutatja. Az őrzők és a harc további köröket jelenthetnek: ez térképi távolság, nem biztonságos kijutás vagy körszám-előrejelzés. A kapunál külön üzenet jelzi a kijutás lehetőségét; lezárt futamnál a jelzés eltűnik. A kijelzés nem lépteti vagy módosítja az expedíciót.

## Indítás

Node 22+ a tesztekhez, Python 3 a fejlesztői kiszolgálóhoz. Nincs telepítendő npm függőség.

```sh
npm test
npm run dev
```

Nyisd meg: http://localhost:5173 . Windows alatt, ha a python3 parancs nem található: `py -m http.server 5173` a projekt gyökerében. Statikus HTTPS tárhelyen is futtatható.

## Játékmenet

- WASD / nyilak, telefonon érintéses iránygombok. 760 px szélességig az iránygombok görgetés közben is a képernyő alján maradnak; a lap alján külön hely biztosítja, hogy a mentéskezelők és a lábléc felgörgethetők legyenek a sáv fölé.
- A fehér bábu a játékos, a rózsaszín bábuk az őrzők, az arany rombuszok az ereklyék.
- Az őrző felé lépés támadás. A falnak lépés nem fogyaszt kört.
- A közeli őrzők minden második körben közelednek; a szomszédos őrző minden körben visszaüt.
- Menj vissza a kezdő türkiz kapuhoz, és válaszd a kijutást a zsákmány megőrzéséhez.
- Elbukáskor az expedíció zsákmánya elvész, a céhkincstár megmarad.
- Automatikus localStorage mentés minden akció után. Szünet és mentés gomb. Háttérbe kerüléskor szünet.

## Jelenlegi határok

Ez működő egyjátékos prototípus, nem kész online játék. Naponként változó pálya, sematikus bábuk és magyar felület. Nincs még közös ranglista, szerver, fiók, felhőmentés vagy valódi PvP. A böngésző adatainak törlése törli a helyi mentést. Más eszközre jelenleg nem vihető át. Mobilos tényleges eszközteszt szükséges; kompatibilitási célokat nem kezelünk mért eredményként.

## Indítási mentésvédelem

Hibás vagy nem támogatott mentésnél a játék nem kezdi automatikusan felülírni a korábbi adatot. A helyreállítási ablakban letöltheted az eredeti szöveget biztonsági másolatként, vagy újrapróbálhatod az olvasást. Ez a nyers másolat nem garantáltan betölthető játékexport. Az újrakezdés külön megerősítést kér, és a céhkincstárat is lecseréli; csak sikeres tárhelyírás után indul el. Tárhelyhiba esetén a játék védetten vár. Escape/Mégse az újrakezdési kérdést vonja vissza; a védelem megmarad.

## Mappák

`src/game.js`: böngészőtől független játékszabályok. `src/main.js`: input, canvas, mentés. `style.css`: reszponzív UI. `tests/`: Node tesztek. `docs/`: termékterv és napi fejlesztési rend.

## Vizuális irány

Eredeti anime fantasy: indigókék kő, halvány arany céhpecsétek, türkiz lámpásmágia, kézzel rajzolt karakterportrék későbbi asset fázisban. Saját világ, céhek, karakterek és történetek. DanMachi hangulati inspiráció: a város és a mélység kapcsolata, kalandozói fejlődés, céhösszetartás. Dungeon Stalkers mechanikai inspiráció: zsákmány és kijutási kockázat. Saját megkülönböztető elem: a lámpás fénye erősebb jutalmat fed fel, de az őrzők is hamarabb észlelnek.


## Napi dungeon

Minden új expedíció a magyar naptári nap (Europe/Budapest, téli/nyári időszámítás) alapján kap pályát. Azonos nap és szabályverzió ugyanazt a térképet, őrzőket és ereklyéket adja minden eszközön. A napi címke az expedíció napját mutatja. Ez egyelőre helyi napi pálya az eszköz órája alapján; szerveroldali versenyhitelesítés később készül.

A mentés teljes futamállapotot tárol: éjfél után sem változik meg a folyamatban lévő térképed. Korábbi napi expedíció gyakorlóként folytatható; az új expedíció már az aktuális naphoz tartozik. A régi v1-es mentések automatikusan gyakorló mentésként folytatódnak, a pálya, a szereplők és a céhkincstár megmarad. Az eredeti localStorage kulcs változatlan.

`src/daily.js`: napazonosító és verziózott pályagenerátor. `src/save.js`: mentés-visszaállítás és v1 kompatibilitás. A generálás véges számú falelhelyezési próbát végez, és csak összefüggő járható területet tart meg.

## Mentés átvitele másik eszközre

A **Mentés letöltése** gomb JSON biztonsági másolatot készít az aktuális expedícióról és céhkincstárról. Vidd át a fájlt a másik eszközre, ott válaszd a **Mentés betöltése** gombot és a fájlt. Ellenőrizd az előnézetet, majd külön erősítsd meg a jelenlegi mentés cseréjét. A kincstár felülíródik, nem adódik össze. Csere előtt érdemes a célkészüléken is letölteni egy másolatot; a **Mégse** megőrzi a haladást. A betöltési ablak alatt a játék szünetel.

Legfeljebb 64 KiB-os Lumenfall export fogadható el. A korábbi v1 játékállapotot tartalmazó, azonosított export is migrálható; egy csupasz localStorage JSON nem exportfájl. Régebbi napi expedíció a saját pályáján, gyakorlóként folytatódik. Nincs automatikus felhőszinkronizálás vagy fájlfeltöltés. A helyi mentés és az importált pontszám nem hitelesített ranglistaeredmény. A letöltési visszajelzés a böngészőnek átadott kérést jelzi; a fájl tényleges mentését a letöltéseknél ellenőrizd.

## Saját kalandozó és rövid animációk

A játékos eredeti anime/chibi lámpáscéhes kalandozóként jelenik meg: türkiz köpeny, saját hajsziluett, lámpás és kard. A sikeres lépés 180 ms-os átmenetet, a támadás 220 ms-os kardívet kap. A kör és a mentés azonnal frissül; az animáció nem késlelteti a következő akciót. Üresjáratban nem fut rajzolási ciklus. A rendszer csökkentett mozgás beállításával statikus megjelenést használ; a mentésformátum változatlan.

A nagyobb, változatosabb dungeonök és további eredeti animált szereplők fejlesztési irányait a [termékterv](docs/ROADMAP.md) rögzíti. A mai karakterváltozás nem növeli a pályát. Technikai működés és kézi ellenőrzés: [karakteranimáció](docs/CHARACTER_ANIMATION.md).
