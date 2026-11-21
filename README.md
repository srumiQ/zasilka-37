# Zásilka č. 37

Interaktivní narozeninové přání pro Tomáše k 37. narozeninám. Jedna stránka pro mobil, projde se za 3–4 minuty:
celní kontrola → hádanka (zima / teplo / přihořívá / hoří) → protokol o zabavení → jeho svět → stůl → konec.

## Spuštění

Stačí otevřít `index.html` v prohlížeči. Nic se neinstaluje, stránka nemá žádné závislosti kromě písma z Google Fonts
(bez internetu se použije náhradní písmo).

Lokální náhled na telefonu ve stejné Wi-Fi:

```powershell
python -m http.server 8737
```

a v telefonu otevřít `http://<IP počítače>:8737`.

## Sdílení (GitHub Pages)

Po nahrání do repozitáře a zapnutí Pages (Settings → Pages → Deploy from a branch → `main` / root) běží přání na adrese
`https://<účet>.github.io/<repozitář>/`. Příjemci stačí klepnout na odkaz, nic dalšího nepotřebuje.

- Stránka má `noindex`, takže ji vyhledávače nezařadí. Kdo ale zná odkaz, ten ji otevře.
- Přípona `#stul` (nebo `#hra`, `#protokol`, `#svet`, `#konec`) otevře rovnou danou obrazovku.

## Úpravy

Všechno je v `index.html`:

| Co | Kde |
|---|---|
| Barva Rokoušovy srsti | proměnné `--fur`, `--fur-d`, `--fur-l`, `--mask` nahoře ve stylu |
| Tajné slovo a uznané tvary | `WIN_FORMS` |
| Slovník a teploty | `LEXICON` (`[teplota, "slovo|další tvar …"]`) |
| Hlášky k tipům | `QUIPS` |
| Nápovědy po 5., 10. a 15. tipu | `HINTS` |
| Přetahovaná o lano (obtížnost, texty) | konstanty `TUG_*` a funkce `finishTug`, `enter.tug` |
| Karty protokolu | HTML sekce `s-protocol` |
| Dopis u stolu | HTML blok `letterA` v sekci `s-table` |
| Přání k narozeninám (po přípitku) | HTML blok `letterB` v sekci `s-table` |

## Test

Logika hádanky (slovník, tvary slov, teploty, nesmysly) má test, který čte přímo `index.html`:

```powershell
node tests/logic.test.mjs
```

## Závislosti

Žádné. Pro test stačí Node.js 18+.
