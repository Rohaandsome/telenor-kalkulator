# Telenor Priskalkulator

Priskalkulator for Telenorbutikken Asker. Beregner månedspris for abonnement, mobil (avbetaling/fullpris), forsikring og tilbehør (smartklokker/nettbrett) — med automatisk familierabatt.

## Kjøre lokalt (uten kodeverktøy)

Du trenger bare en nettleser (Chrome, Edge, Firefox o.l.) og filene fra dette repoet.

### Alternativ 1: Dobbeltklikk (enklest)

1. Last ned repoet som ZIP fra GitHub (grønn **Code**-knapp > **Download ZIP**)
2. Pakk ut ZIP-filen
3. Dobbeltklikk på `index.html` — den åpnes direkte i nettleseren

### Alternativ 2: Med Python (om du har det installert)

Åpne **Ledetekst** (cmd) eller **PowerShell** i mappen du pakket ut, og kjør:

```
python -m http.server 8080
```

Gå deretter til [http://localhost:8080](http://localhost:8080) i nettleseren.

### Alternativ 3: Med Node.js (om du har det installert)

Åpne **Ledetekst** (cmd) eller **PowerShell** i mappen og kjør:

```
npx serve -l 8080
```

Gå deretter til [http://localhost:8080](http://localhost:8080) i nettleseren.

## Oppdatere priser og produkter

Alle priser og produktlister ligger i `data.js`. Åpne filen i et tekstredigeringsprogram (f.eks. Notepad) og rediger direkte.

- **Mobiltelefoner** — `mobileData`-listen
- **Smartklokker** — `smartwatchData`-listen
- **Nettbrett** — `tabletData`-listen
- **Forsikringsnivåer** — `insuranceTiers`-listen
- **Abonnementer** — `plansInfo`-objektet

## Filstruktur

```
index.html   ← Selve nettsiden (HTML + design)
app.js       ← Logikk og kalkulering (Vue 3)
data.js      ← Alle priser, produkter og abonnementer
```
