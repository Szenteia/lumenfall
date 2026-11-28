# Fali fénydíszek · 2026-11-13

[Lumenfall automation]

A Ködkő-romok ködlámpást, a Borostyáncsarnok parázstartót, a Kristálykripta saját kristálycsoportot kap. Statikus, eredeti Canvas-rajzok, külső asset és függőség nélkül. A fény dekoráció, nem új látótáv- vagy észlelési szabály.

A koordinátákból számolt stabil sorrendből legfeljebb nyolc, egymástól legalább négy Manhattan-lépésre lévő, járható mezővel szomszédos falmezőt választunk. Sem a mentés, sem a gameplay véletlengenerátora nem változik. A rajz a falmezőn belül marad. A díszek a meglévő háttér-cache részei; nincs új animációs ciklus.

Ellenőrzés: 124/124 teszt a mainre épülő ágon. A #44 (amely tartalmazza a #34/#36/#42 lépéseket), #38 és #40 helyi egyesített változatával 145/145 teszt. A fali fények módosítása tisztán alkalmazható az egyesített változatra; korábbi PR-okat nem másol a jelen PR-ba.

Külön Canvas-renderen mindhárom téma 17×13 és 21×15 méretű pályáját vizuálisan ellenőriztem, 400 px-re kicsinyítve. A minták megkülönböztethetők, a padló szabad marad. Ez nem valódi mobil/böngészős próba: a helyi Chromium indítása hibával leállt. Valódi mobil-, desktop- és több-böngészős ellenőrzés még szükséges.
