# Padlómozaikok

[Lumenfall automation] A #53 lépés három eredeti sík padlódíszt ad: törött körpecsét (mist), szögletes napmotívum (amber), kristályrozetta (crystal).

A kiválasztás soronként balról jobbra halad. Az első legfeljebb három teljesen járható 2×2 területet választja, a mozaikok között legalább egy mezőnyi réssel. A kapu (2,6) és négy közvetlen szomszédja kizárt. A geometria ellenőrzését a dungeonGrid végzi. Nincs megfelelő hely: nincs dísz. A sorrend csak a térképtől és mérettől függ; azonos geometria más témában is ugyanazokat a helyeket használja. A téma a motívumot és színt választja.

A díszek a meglévő háttér-cache részei, a padló után, a taktikai réteg és minden játékelem előtt rajzolódnak. Nem mentett állapotok, nem akadályok és nem interaktív tárgyak. Nincs új asset, függőség, gameplay RNG-hívás vagy renderciklus.

Ellenőrzés: 125/125 alapági teszt; a #44 (benne #34/#36/#42), #38, #40, #46, #48, #50 és #52 helyi kombinációjával 154/154. A rögzített térképek, hibás geometria, kapuvédelem, determinisztikus kiválasztás, motívumok, skálázás és cache-viselkedés tesztelve. A korábbi import- és animációs tesztek is sikeresek. Natív Canvas-képen mindhárom környezet, 17×13 és 21×15 geometria 350 px széles nézetben, szereplőkkel és szaggatott taktikai jelöléssel ellenőrizve. Valódi böngészős/mobilos teszt nem futott: a Playwright Chromium végrehajtható fájlja nem található. Mért mobilos teljesítményt nem állítunk.

Integrációkor a #46 fali dekorációs hívását és az új padlómozaik-hívást egyaránt meg kell tartani az environment.js-ben; mindkettő ugyanabba a háttér-cache-be kerül. A main és a többi karakter-/kapu-/ládamodul ebben a PR-ban nem változik.
