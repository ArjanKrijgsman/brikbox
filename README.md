# BrikBox

Webapp die **modulaire, afsluitbare en stapelbare opbergdozen voor brikken (bouwsteentjes)** genereert als STL/3MF. Kies maat, indeling en thema; onderdelen die groter zijn dan je printbed worden automatisch gesplitst in stukken die in elkaar klikken.

> Status: in aanbouw. Het volledige ontwerp staat in [docs/ontwerpdocument.md](docs/ontwerpdocument.md).

## Ontwikkelen

Vereist: [Node.js](https://nodejs.org/) 24 LTS of nieuwer.

```bash
npm install
npm run dev        # ontwikkelserver op http://localhost:5173
npm test           # tests (vitest)
npm run build      # typecheck + productiebuild in dist/
```

## Structuur

```
src/
├── config/    # printerprofielen (printers.json), later schema en presets
├── geometry/  # generatoren: bak, deksel, nop, greep, schot, embleem, verbindingen
├── split/     # verboden zones, naadkeuze, verbindingen
├── export/    # stl, 3mf, zip, handleiding
├── worker/    # web worker voor het rekenwerk
└── ui/        # React-componenten
themes/        # alleen eigen/vrije thema-iconen (SVG)
test-prints/   # tolerantie-testprint
docs/          # ontwerpdocument en handleidingen
tests/         # vitest
```

## Een printer toevoegen

Voeg één regel toe aan [src/config/printers.json](src/config/printers.json) met het bouwvolume in mm (`[breedte, diepte, hoogte]`).

## Thema's en merken

Gebruik geen merknamen in de app of de repository en lever geen beschermde logo's van speelgoed-, game- of filmmerken mee. Gebruikers kunnen voor eigen gebruik hun eigen SVG uploaden in de app.
