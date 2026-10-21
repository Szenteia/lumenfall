# Napi fejlesztés

Tulajdonos: Szenteia. Repository: Szenteia/lumenfall.

Kérés: 2026-10-22-től minden nap legkésőbb 12:00-ig javaslat; 14:00-kor megvalósítás, ha nincs felhasználói visszajelzés. Időzóna Europe/Budapest. A ChatGPT ütemezett feladatai végzik a fejlesztést; ez a fájl nem önállóan futó AI munkafolyamat.

## Javaslat

Először olvasd az aktuális kódot, a nyitott PR-okat, issue-kat és megjegyzéseket. Egyetlen kicsi, befejezhető, értékes lépést válassz. Hozz létre egy issue-t `Daily YYYY-MM-DD: <feature>` címmel. Írd le a játékosnak jelentkező változást, az elfogadási feltételeket és a tesztelést. Linkeld a felhasználónak. Már meglévő napi issue-t ne duplikálj.

## Megvalósítás

A napi issue beszélgetése az ellenőrizhető visszajelzési csatorna. A GitHub profil Szenteia, az issue szerzője önmagában nem bizonyít felhasználói visszajelzést, mert az automatizált írások is a fiók nevében jelenhetnek meg. A gépi bejegyzéseket `[Lumenfall automation]` előtaggal jelöld. Emberi választ ne hamisíts. Bármilyen nem automatizált tulajdonosi válasz esetén értelmezd azt a felhasználó kérésének megfelelően; a hallgatásból induló eredeti tervet ne hajtsd vakon tovább. A ChatGPT beszélgetésben látható legújabb utasítások is irányadók, de más futás beszélgetéséhez való hozzáférést ne feltételezz. A felhasználó számára egyértelmű legyen, hogy a GitHub issue hozzászólása a biztosan ellenőrizhető leállítási/módosítási csatorna.

Ha a kommenteket nem tudod teljesen ellenőrizni, ne feltételezz hallgatást. Ha nincs ellenkező jelzés, dolgozz feature branchen, végezd el a szükséges módosítást és releváns teszteket, majd nyiss PR-t. Nem kell új engedély a kért normál fejlesztésre. Ne merge-elj automatikusan: a kész napi eredmény a tesztelt commit és PR. Ne indíts egymásra épülő, eltérő base-ű PR-láncot ellenőrizetlenül; szükség esetén javítsd a már nyitott napi PR-t.

Ha az adott napnak nincs előzetes javaslata, ne találj ki visszamenőleg elfogadott feature-t. Küldj pótló javaslatot és jelezd a kimaradást. Ha a cél repository még nem létezik/nem elérhető, jelezd a konkrét blokkolót; ne módosíts másik meglévő projektet. Ne ígérj elvégzett munkát sikertelen írás esetén.

## Határok

Nincs fizetős infrastruktúra megrendelése, secret commitolása, más projektek módosítása vagy előzménytörlés. Nincs hamis leaderboard vagy tesztnek beállított, el nem végzett ellenőrzés. Minden kör végén rövid magyar riport: elkészült változás, tesztek, commit/PR link, blokkoló ha volt.
