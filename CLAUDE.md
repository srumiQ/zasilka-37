# Kontext pro Clauda – Zásilka č. 37

Interaktivní narozeninové přání (jedna stránka pro mobil). Hostuje se na GitHub Pages z větve `main`,
takže každý push do `main` se během minuty projeví na veřejné adrese.

## Pravidla
- Všechno zůstává v jednom souboru `index.html` (CSS, vlastní SVG, JS). Žádné závislosti kromě písma z Google Fonts.
- Kód a názvy anglicky, komentáře a texty česky.
- Text od uživatele se do stránky zapisuje jen přes `textContent`.
- Projít se to má za 3–4 minuty. Každá obrazovka nejvýš 2–3 krátké věty.

## Tón
- Drzý humor s nadsázkou a černý humor mířený na oslavence (věk, játra, záda, útrata).
- Ne: vtipy o národnostech, o smrti psa, o přítelkyni, nic, co by naznačovalo průšvih v práci. Nic vulgárního.
- Obrazovka „Jeho svět“ a první část dopisu u stolu jsou bez vtipů schválně.

## Kde co je
- Hádanka: blok mezi `/*LOGIC-START*/` a `/*LOGIC-END*/` (`LEXICON`, `QUIPS`, `HINTS`, `evaluate`). Slovník má zůstat mezi 400 a 600 slovy.
- Přechody mezi obrazovkami: `go(name)` s háčky `enter.*` a `leave.*`; časovače přes `later()`.
- Přetahovaná o lano: konstanty `TUG_*`.
- Kotvy v adrese pro ladění: `#hra`, `#propusteno`, `#lano`, `#protokol`, `#svet`, `#stul`, `#konec`.

## Ověření před pushem
```powershell
node tests/logic.test.mjs
```
Pak projít stránku v prohlížeči na šířce 360–390 px (i výšku kolem 560 px).
