# Lumenfall: Guilds of the Deep

SzenteiA saját, felülnézetes, taktikai dungeon játéka. Első játszható alap: 2026-10-21.

## Indítás

Node 22+ a tesztekhez, Python 3 a fejlesztői kiszolgálóhoz. Nincs telepítendő npm függőség.

```sh
npm test
npm run dev
```

Nyisd meg: http://localhost:5173 . Windows alatt, ha a python3 parancs nem található: `py -m http.server 5173` a projekt gyökerében. Statikus HTTPS tárhelyen is futtatható.

## Játékmenet

- WASD / nyilak, telefonon érintéses iránygombok.
- A fehér bábu a játékos, a rózsaszín bábuk az őrzők, az arany rombuszok az ereklyék.
- Az őrző felé lépés támadás. A falnak lépés nem fogyaszt kört.
- A közeli őrzők minden második körben közelednek; a szomszédos őrző minden körben visszaüt.
- Menj vissza a kezdő türkiz kapuhoz, és válaszd a kijutást a zsákmány megőrzéséhez.
- Elbukáskor az expedíció zsákmánya elvész, a céhkincstár megmarad.
- Automatikus localStorage mentés minden akció után. Szünet és mentés gomb. Háttérbe kerüléskor szünet.

## Jelenlegi határok

Ez működő egyjátékos prototípus, nem kész online játék. Naponként változó pálya, sematikus bábuk és magyar felület. Nincs még közös ranglista, szerver, fiók, felhőmentés vagy valódi PvP. A böngésző adatainak törlése törli a helyi mentést. Más eszközre jelenleg nem vihető át. Mobilos tényleges eszközteszt szükséges; kompatibilitási célokat nem kezelünk mért eredményként.

## Mappák

`src/game.js`: böngészőtől független játékszabályok. `src/main.js`: input, canvas, mentés. `style.css`: reszponzív UI. `tests/`: Node tesztek. `docs/`: termékterv és napi fejlesztési rend.

## Vizuális irány

Eredeti anime fantasy: indigókék kő, halvány arany céhpecsétek, türkiz lámpásmágia, kézzel rajzolt karakterportrék későbbi asset fázisban. Saját világ, céhek, karakterek és történetek. DanMachi hangulati inspiráció: a város és a mélység kapcsolata, kalandozói fejlődés, céhösszetartás. Dungeon Stalkers mechanikai inspiráció: zsákmány és kijutási kockázat. Saját megkülönböztető elem: a lámpás fénye erősebb jutalmat fed fel, de az őrzők is hamarabb észlelnek.


## Napi dungeon

Minden új expedíció a magyar naptári nap (Europe/Budapest, téli/nyári időszámítás) alapján kap pályát. Azonos nap és szabályverzió ugyanazt a térképet, őrzőket és ereklyéket adja minden eszközön. A napi címke az expedíció napját mutatja. Ez egyelőre helyi napi pálya az eszköz órája alapján; szerveroldali versenyhitelesítés később készül.

A mentés teljes futamállapotot tárol: éjfél után sem változik meg a folyamatban lévő térképed. Korábbi napi expedíció gyakorlóként folytatható; az új expedíció már az aktuális naphoz tartozik. A régi v1-es mentések automatikusan gyakorló mentésként folytatódnak, a pálya, a szereplők és a céhkincstár megmarad. Az eredeti localStorage kulcs változatlan.

`src/daily.js`: napazonosító és verziózott pályagenerátor. `src/save.js`: mentés-visszaállítás és v1 kompatibilitás. A generálás véges számú falelhelyezési próbát végez, és csak összefüggő járható területet tart meg.
