# Kristályőr lépésanimáció · 2026-11-10

[Lumenfall automation]

A valóban elmozdult őrök a meglévő 180 ms-os mozgás során egyetlen járásciklust kapnak: váltakozó lábmozgást és finom köpenylengést. A saját, kódból rajzolt karakterhez nincs új asset vagy függőség.

A `motionPose` átmeneti `stride` értéke -1 és 1 közötti; a kezdő és záró képkockán pontosan nulla. A lábak legfeljebb 2, a köpenyszegély 1,5 logikai pixellel térnek el. A `drawMovingGuard` a megfelelő őr pózát adja át a rajzolónak. Az árnyék és a HP-sáv a mezők közötti eltolást követi, a járáslengést nem. A találati visszajelzés tovább működik.

Nincs új ütemező, mentett mező vagy játékszabály. A meglévő megszakítás és reduced-motion kezelés az egész pózt törli. Az álló és eltávolított őr nem kap járásciklust.

Ellenőrzés: `npm test`, valamint a #34/#36/#38 PR-okkal ideiglenesen egyesített változat tesztjei. A tényleges rajzolófüggvény 40/20 px-es képei vizuálisan ellenőrizve natív Canvasban. A Chromium indítása a környezet socket-jogosultsága miatt meghiúsult; valódi böngészős vagy fizikai mobilos próbát ez nem helyettesít.
