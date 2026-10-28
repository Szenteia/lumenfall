# Mobil irányítósáv · 2026-10-27

760 px szélességig az eredeti Mozgás navigáció fixed pozícióban a nézet alján marad. Ugyanaz a négy data-dir gomb szerepel benne; sem új JavaScript, sem új eseménykezelő nincs. Az elrendezés két 44 px magas sorból, 6 px közből és kitöltésből áll, 120 px-es border-box kerettel. A gombok 56×44 CSS px méretűek, a fókuszkörvonalhoz marad hely.

Az alsó safe-area hozzáadódik a sáv magasságához és kitöltéséhez. A main alsó térköze ugyanezt a teljes magasságot plusz 14 px-t foglalja le, így az utolsó tartalom a sáv fölé görgethető. A scroll-padding-bottom segíti a fókuszba görgetést. A viewport-fit=cover engedélyezi az eszköz biztonsági margóinak használatát; oldalirányban is van safe-area kitöltés. Normál tartalmi görgetést, nagyítást nem tiltunk le.

A natív showModal() dialógus böngészői felső rétegben van, a sáv z-indexe nem emeli fölé. Kis képernyőn a dialógus nézetmagassághoz korlátozott és görgethető; a vh érték a dvh-t nem támogató böngészőknek is ad felső határt. A meglévő act()/keydown szünet- és importellenőrzése változatlan.

## Elvégzett ellenőrzések és korlátok

- A friss main-alapú ág összes **47/47** Node tesztje sikeres.
- A #10 aktuális e98120807f3ee10978b29c99b76a68783f66510c headjével helyi háromutas összefésülés konfliktusmentes; **60/60** kombinált teszt sikeres. Ez a tényleges main.js Node-modelltesztjében az iránygomb/billentyűzet bekötést és a szünet/import akcióblokkolását is lefedi; nem fizikai érintéses próba.
- HTML-szerkezet áttekintve: egyetlen eredeti Mozgás navigáció és négy eredeti iránygomb; minden src/*.js fájl változatlan. A módosítás elrendezésre, viewport beállításra és dokumentációra korlátozott.
- Helyi Chromium/Chrome tesztböngésző nem érhető el. A 360×640, 390×844, 640×360 és desktop viewportos render-/görgetéspróba, tényleges Android/iOS és safe-area eszközpróba **nem futott**. A szabálytesztek nem bizonyítják a mobilos elrendezést; a változat további vizuális ellenőrzésre szorul.

## Kézi ellenőrzés

1. Mobil viewportokban görgess a térképtől az oldal aljáig: a sáv maradjon alul, ne legyen vízszintes túlcsordulás. Az utolsó mentésgombok és a lábléc teljesen felhozhatók legyenek fölé; Tab fókusz ne bújjon mögé.
2. Minden iránygomb egyszeri megnyomása egy akció legyen; hosszú érintés ne indítson önálló ismétlést. Nyilak/WASD tovább működjenek.
3. Szünet és import ablakban a Mégse/Folytatás és a megerősítés görgetéssel is elérhető, a sáv mögött nincs akció. Állapot és helyi mentés megmarad.
4. Desktopon a navigáció maradjon az eredeti helyén. A #10-zel kombinálva a négyirányú előnézet se takarja vagy duplázza a kezelőket.

A PR külön main-alapú ágon marad. Nem függ #10 előzetes merge-elésétől; automatikus összeolvasztás nincs.
