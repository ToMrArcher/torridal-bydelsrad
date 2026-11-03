# bydel.info – Torridal bydelsråd

Ny, statisk versjon av [bydel.info](https://www.bydel.info). Ingen database og ingen pakker – bare HTML, CSS og litt JavaScript, bygget med ett lite Python-skript.

## Bygg og se lokalt

```bash
python3 build.py
python3 -m http.server 8765 --directory site
```

Åpne <http://localhost:8765>.

## Mappene

- `src/pages/` – én fil per side. Øverst i hver fil står tittel, beskrivelse og tekst til toppfeltet.
- `src/layout.html` – toppmeny og bunn, felles for alle sider.
- `src/partials/` – åsene og toppfeltet på undersidene.
- `src/assets/` – stilark, skript og favicon.
- `site/` – ferdig bygget nettside (lages av `build.py`, skal ikke redigeres).

## Vanlige oppdateringer

- **Nytt møte:** oppdater «Neste møte» i `src/pages/index.html` (dato, saksliste og `data-countdown`/`data-start`/`data-end` i UTC), og legg en ny `<li class="post">` øverst i `src/pages/aktuelt.html`.
- **Ny protokoll:** legg en ny `<li class="doc">` øverst i riktig år i `src/pages/referater.html`.
- **Nytt styre:** endre `src/pages/styret.html`.

Bilder og dokumenter lenker foreløpig til filene på den gamle WordPress-siden (`usercontent.one`). Flytt dem inn i `src/assets/` før den gamle siden legges ned.

## Publisering

**Cloudflare Pages (gratis, produksjon):** koble repoet i Cloudflare-dashbordet med byggkommando `python3 build.py` og output-mappe `site`. Eller fra egen maskin: `python3 build.py && npx wrangler pages deploy`.

**GitHub Pages (forhåndsvisning):** `.github/workflows/pages.yml` bygger og publiserer ved hver push til `main`. Slå på under *Settings → Pages → Source: GitHub Actions*. Forhåndsvisningen bygges med `PREVIEW=1`, som ber søkemotorer la være å indeksere den.

Alle lenker er relative, så siden fungerer både på eget domene og under `brukernavn.github.io/repo/`.
