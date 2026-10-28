# Indítási mentésvédelem · 2026-10-28

A readStartup() csak olvas. Külön kezeli a hiányzó kulcsot (null), az érvényes és migrálható mentést, a jelen lévő hibás/üres/nem támogatott adatot és a tárhely-hozzáférés hibáját. Validátorkivétel sem kerüli meg a védelmet. Hibás adat mellett a main állapota null marad: save(), act(), keydown, szünet és visibilitychange nem ír és nem indít expedíciót. A mentésátviteli kezelők csak feloldás után kerülnek fel a felületre.

A helyreállítási dialógus nem zárható be úgy, hogy a védelem megszűnjön. Escape/Mégse az újrakezdés megerősítését vonja vissza. Az Újrapróbálás frissen olvassa a tárhelyet: érvényes állapotot visszaállít, továbbra is hibás vagy elérhetetlen adatnál megőrzi a védelmet. Ha a kulcs időközben eltűnt, új játékot ment, és csak siker után old fel.

Az eredeti nyers szöveg TXT másolata nem játékexport: szándékosan nem fut át az exportvalidátoron, így hibás és üres tartalom is megőrizhető. Az objektum-URL késleltetve felszabadul. A felirat csak letöltési kérésről számol be, a lemezre írást nem állítja igazoltnak. Olvasási hibánál nincs nem olvasott tartalomhoz letöltési lehetőség.

Újrakezdéshez két lépés szükséges: a csere választása és külön megerősítés. Az új állapot előbb localStorage.setItem()-mel íródik ki, és csak ezután cserélődik a memóriában lévő állapot. Kvótahibánál a korábbi adat és a védelem megmarad. Az új expedíció üres kincstárral indul; a felirat erre és az előzetes másolat készítésére is figyelmeztet.

## Ellenőrzés

- Main-alapú teljes készlet: **56/56** Node teszt (47 korábbi + 9 új).
- Hiányzó/érvényes v1/v2/üres/hibás/nem támogatott mentés és olvasási/validátorkivétel; automatikus írás/törlés hiánya; nyers másolat tartalomhűsége és URL felszabadítása; megerősítés, Escape/Mégse, újrapróbálás, kvótahiba és sikeres csere.
- Tényleges main.js Node DOM/canvas modellpróba: indulás, háttérbe váltás, iránygomb, billentyű és akciók nem írnak hibás/üres/olvashatatlan mentés mellett. Érvényes adat újbóli olvasása után HUD és akciók helyreállnak, szünet tovább működik.
- A három érintett futó JS modul és a kombinált main.js szintaxisellenőrzése sikeres.
- #10 + #12 + helyreállítás kombináció: **69/69** teszt sikeres. A #12 külön konfliktusmentesen összefésülhető.

## Összeolvasztási megjegyzés

A #10 e98120807f3ee10978b29c99b76a68783f66510c és a helyreállítás egyaránt módosítja a main.js indítási/rajzolási környezetét. A helyi háromutas összeolvasztásnál **src/main.js kézi feloldást igényelt**; ezt nem állítjuk konfliktusmentesnek. A tesztelt feloldás megtartotta a helyreállítás readStartup()/null-state őrét és ehhez adta a #10 három mozgás-előnézeti bekötését: import mountMovementPreview, mount a heal gombnál, renderMovementPreview(state) a null-állapotot visszautasító draw-őr után. A 69 teszt a feloldott kombináción futott. A nyitott PR-ok nem módosultak és nincsenek automatikusan merge-elve; más headeknél új ellenőrzés kell.

## Korlátok és kézi terv

Valódi böngészős, natív letöltési és 360 px-es/fizikai mobilos próba nem futott; a DOM-modell nem eszközteszt. Kézzel: hibás tesztmentés → újratöltés → védelem; háttérbe váltás/iránygomb nem ír; TXT másolat egyezik; megerősítés Mégse/Escape útja nem töröl; sikertelen tárhelyírás megőrzi az adatot; érvényes adat javítás utáni Újrapróbálása helyreállít; sikeres csere után játék és normál import működik. Desktop és 360 px nézetben a dialógus összes gombja görgetve elérhető legyen, a #12 sávja ne fogadjon akciót mögötte.
