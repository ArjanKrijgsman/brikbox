# Tolerantie-testprint (fase 0)

Kleine proefstukken van alle kritische passingen van BrikBox, elk in **vijf varianten**. Door ze te printen en te passen weet je welke speling op jouw printer het beste werkt, voordat je een hele doos print.

**Het aantal verzonken puntjes op een stuk = het variantnummer** (1 puntje = variant 1, de krapste).

## Bestanden

| Bestand | Wat |
|---|---|
| `brikbox-testprint-pla.3mf` | Printplaat met alle PLA-onderdelen (21 stuks) |
| `brikbox-testprint-petg.3mf` | Printplaat met de PETG-onderdelen (6 stuks): klikarmen en de greep van het scharnier |
| `stl/` | Elk onderdeel los als STL, om een enkel stuk opnieuw te printen |

Gemaakt voor de Bambu Lab X1-Carbon (bed 256 × 256 mm), maar elke printer met minstens 250 × 250 mm bed past.

## Printen

1. Open het 3MF-bestand in Bambu Studio. De onderdelen liggen al goed: **niet draaien en niet schalen.**
2. Instellingen: 0,4 mm nozzle, profiel **0.20 mm Standard**, 15 % infill, **geen support**.
3. Kies voor elke plaat het juiste filament (PLA of PETG) en het bijbehorende standaardprofiel.
4. Laat de olifantspoot-compensatie op de standaardwaarde staan. Die gebruik je straks ook voor de echte dozen.

De groefschijven liggen bewust met de groef naar beneden, zoals in de bodem van de echte doos. Het plafond van de groef wordt overbrugd. Ziet dat er rommelig uit, meld het dan.

## Varianten

| Proefstuk | Wat varieert | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|---|
| Groef (5 schijven) | speling per kant rond de nopring | 0,10 | 0,15 | 0,20 | 0,25 | 0,30 mm |
| Schotgleuven (1 blok) | speling per kant rond het schot van 1,6 mm | 0,10 | 0,15 | 0,20 | 0,25 | 0,30 mm |
| Pengatmeter (1 balkje) | gatdiameter voor 1,75 mm filament | 1,85 | 1,95 | 2,05 | 2,15 | 2,25 mm |
| Klik (5 armen, PETG) | hoogte van de haak | 0,4 | 0,6 | 0,8 | 1,0 | 1,2 mm |
| Zwaluwstaart (5 paren A+B) | speling per kant | 0,10 | 0,15 | 0,20 | 0,25 | 0,30 mm |

Het **scharnier** (bakdeel in PLA + greepdeel in PETG) heeft geen varianten. Daarmee controleer je of het geheel werkt met de voorlopige gatmaten (1,95 mm klemmend, 2,25 mm draaiend).

## Testen: waar let je op?

**Nop + groef.** Zet de nop rechtop en druk een groefschijf er met de groef naar beneden op.
- Goed: schuift erop met lichte druk, zit zonder te wiebelen, en is met de hand weer los te halen.
- Te krap: past niet of moet je forceren. Te ruim: rammelt of schuift zijwaarts.

**Schotgleuven.** Schuif het losse schot van bovenaf in elke gleuf.
- Goed: glijdt makkelijk tot onderin en staat rechtop zonder veel speling.

**Pengatmeter.** Knip een recht stuk 1,75 mm filament af en steek het in elk gat. Je zoekt twee gaten:
- Het **klemmende** gat (voor de knokkels aan de bak): de pen gaat er met stevig duwen in en blijft vastzitten.
- Het **draaiende** gat (voor de knokkel van de greep): de pen draait vrij, maar zonder merkbare speling.

**Scharnier.** Leg de knokkel van het greepdeel tussen de twee knokkels van het bakdeel. Duw er een stuk filament doorheen en knip het aan beide kanten af.
- Goed: de pen blijft zitten en de greep draait soepel.

**Klik.** Schuif een klikarm in de houder tot hij vastklikt. Losmaken: duw de haak via de opening aan de zijkant omhoog.
- Goed: je voelt of hoort een duidelijke klik, en de arm blijft zitten als je er zacht aan trekt.
- Te zwak: geen klik of schiet zo los. Te sterk: heel zwaar of de arm buigt blijvend krom.

**Zwaluwstaart.** Druk deel A en deel B van hetzelfde nummer in elkaar.
- Goed: gaat met de hand en stevig duwen in elkaar, valt niet uit elkaar, en de bovenkanten liggen vlak.

## Resultaten doorgeven

Vul in welke variant het beste was. Bij twijfel tussen twee: noem ze allebei.

| Test | Beste variant | Opmerking |
|---|---|---|
| Nop + groef | | |
| Schotgleuven | | |
| Pengat klemmend | | |
| Pengat draaiend | | |
| Scharnier (werkt het?) | ja / nee | |
| Klik | | |
| Zwaluwstaart | | |
| Printkwaliteit groefplafond | goed / rommelig | |

De gekozen waarden komen in [`src/geometry/dimensions.ts`](../src/geometry/dimensions.ts) en gelden dan voor alle dozen die de app maakt.

## Opnieuw genereren

De bestanden worden gemaakt door [`src/geometry/testprint.ts`](../src/geometry/testprint.ts):

```bash
npm run testprint
```
