// Test logiky hádanky. Spuštění: node tests/logic.test.mjs
// Vytáhne z index.html blok mezi LOGIC-START a LOGIC-END a ověří slovník i vyhodnocení tipů.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import assert from 'node:assert/strict';

const here = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(here, '..', 'index.html'), 'utf8');
const match = html.match(/\/\*LOGIC-START\*\/([\s\S]*?)\/\*LOGIC-END\*\//);
assert.ok(match, 'blok LOGIC-START/LOGIC-END v index.html chybí');

const api = new Function(match[1] + '\nreturn { evaluate, normalize, stem, tierOf, isNonsense, LEXICON, QUIPS, LINES, HINTS, EXACT, WIN_FORMS };')();
const { evaluate, normalize, tierOf, LEXICON, QUIPS, LINES, HINTS, EXACT } = api;

let passed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log('  ok  ' + name); }
  catch (error) { console.error('FAIL  ' + name + '\n      ' + error.message); process.exitCode = 1; }
}
const temp = word => evaluate(word).temp;

// ── slovník ──
const canonical = [];
const seenForms = new Map();
const clashes = [];
for (const [score, group] of LEXICON) {
  for (const item of group.split(' ')) {
    const forms = item.split('|').map(normalize);
    canonical.push({ key: forms[0], score });
    for (const form of new Set(forms)) {
      if (seenForms.has(form) && seenForms.get(form) !== forms[0]) clashes.push(form + ' (' + seenForms.get(form) + ' × ' + forms[0] + ')');
      seenForms.set(form, forms[0]);
    }
  }
}

test('slovník má 400–600 slov', () => {
  console.log('      slov: ' + canonical.length + ', uznaných tvarů: ' + seenForms.size);
  assert.ok(canonical.length >= 400 && canonical.length <= 600, 'počet slov: ' + canonical.length);
});
test('žádný tvar nepatří dvěma slovům', () => assert.deepEqual(clashes, []));
test('žádné prázdné slovo a teploty 2–99', () => {
  for (const { key, score } of canonical) {
    assert.ok(key.length > 0, 'prázdné slovo');
    assert.ok(score >= 2 && score <= 99, key + ': ' + score);
  }
});
test('každá hláška patří slovu ze slovníku', () => {
  const keys = new Set(canonical.map(c => c.key));
  const orphans = Object.keys(QUIPS).filter(word => !keys.has(normalize(word)));
  assert.deepEqual(orphans, []);
});
test('hlášek je aspoň 30 a jsou krátké', () => {
  const quips = Object.values(QUIPS);
  console.log('      hlášek: ' + quips.length);
  assert.ok(quips.length >= 30);
  const long = quips.filter(q => q.length > 75);
  assert.deepEqual(long, []);
});
test('hláška neslibuje jinou teplotu, než slovo má', () => {
  const wrong = [];
  for (const [word, quip] of Object.entries(QUIPS)) {
    const tier = tierOf(EXACT.get(normalize(word)).temp);
    const expected = /^Hoří/.test(quip) ? 'fire' : /^(Přihořívá|Skoro!)/.test(quip) ? 'hot' : /^Teplo[.!]/.test(quip) ? 'warm' : /^(Zima|Skoro teplo)/.test(quip) ? 'cold' : null;
    if (expected && expected !== tier) wrong.push(word + ': ' + tier + ' × „' + quip + '“');
  }
  assert.deepEqual(wrong, []);
});
test('hlášky neprozrazují tajné slovo', () => {
  const leaks = [...Object.values(QUIPS), ...Object.values(LINES).flat(), ...HINTS].filter(text => /roko|rocky/i.test(text));
  assert.deepEqual(leaks, []);
});

// ── výhra ──
test('tajné slovo a uznané tvary', () => {
  for (const word of ['ROKOUŠ', 'rokouš', 'Rokous', 'ROCKY', 'rocky', 'Roky', '  rokouš  ', 'Rokoušek', 'rocky balboa']) {
    const result = evaluate(word);
    assert.ok(result.win, word + ' má být výhra');
    assert.equal(result.temp, 100);
  }
  assert.equal(evaluate('rokouš').alias, false);
  assert.equal(evaluate('rocky').alias, true);
});
test('skloňované tvary tajného slova se uznají, podobná slova ne', () => {
  for (const word of ['Rokoušovi', 'rokouška', 'Rockyho', 'rockymu']) assert.ok(evaluate(word).win, word + ' má být výhra');
  for (const word of ['rokoko', 'rok', 'rock', 'rokle', 'roku']) assert.ok(!evaluate(word).win, word + ' nemá být výhra');
});

// ── teploty podle zadání ──
const inRange = (word, low, high) => { const t = temp(word); assert.ok(t >= low && t <= high, word + ': ' + t + ' % mimo ' + low + '–' + high); };
test('90–99: buldoček, buldok, frenchie, pejsek', () => ['buldoček', 'buldok', 'frenchie', 'pejsek'].forEach(w => inRange(w, 90, 99)));
test('70–89: pes, štěně, mazlíček, miláček, dítě, chlupáč, čumák, tlapka', () =>
  ['pes', 'štěně', 'mazlíček', 'miláček', 'dítě', 'chlupáč', 'čumák', 'tlapka'].forEach(w => inRange(w, 70, 89)));
test('40–69: zvíře, kočka, vodítko, granule, pelíšek, gauč, chrápání, domov, rodina, princezna, kost', () =>
  ['zvíře', 'kočka', 'vodítko', 'granule', 'pelíšek', 'gauč', 'chrápání', 'domov', 'rodina', 'princezna', 'kost'].forEach(w => inRange(w, 40, 69)));
test('25–45: jiná zvířata a domácnost', () => ['kráva', 'medvěd', 'křeslo', 'koberec', 'ryba', 'okno'].forEach(w => inRange(w, 25, 45)));
test('10–30: člověk, bytost, tvor, věc, jídlo, maso, jerky, kuchyně, láska, Francie, boxer', () =>
  ['člověk', 'bytost', 'tvor', 'věc', 'jídlo', 'maso', 'jerky', 'kuchyně', 'láska', 'Francie', 'boxer'].forEach(w => inRange(w, 10, 30)));
test('2–12: ostatní', () => ['auto', 'pivo', 'siboney', 'celník', 'cigarety', 'server', 'vlak'].forEach(w => inRange(w, 2, 12)));
test('přirozená cesta stoupá: věc → člověk → zvíře → pes → buldoček → rocky', () => {
  const path = ['věc', 'člověk', 'zvíře', 'pes', 'buldoček'].map(temp);
  for (let i = 1; i < path.length; i++) assert.ok(path[i] > path[i - 1], path.join(' → '));
  assert.ok(evaluate('rocky').win);
});

// ── tvary slov ──
test('diakritika a velikost písmen nevadí', () => {
  assert.equal(temp('BULDOČEK'), temp('buldocek'));
  assert.equal(temp('Štěně'), temp('stene'));
  assert.equal(evaluate('GAUČ').key, 'gauc');
});
test('množné číslo a běžné tvary', () => {
  const pairs = [['psi', 'pes'], ['psa', 'pes'], ['kočky', 'kočka'], ['štěňata', 'štěně'], ['zvířata', 'zvíře'], ['buldočci', 'buldoček'], ['granulí', 'granule'],
    ['pejsci', 'pejsek'], ['tlapky', 'tlapka'], ['gauči', 'gauč'], ['panáky', 'panák'], ['cigaretu', 'cigarety'], ['kosti', 'kost'], ['děti', 'dítě'], ['piva', 'pivo'],
    ['celníci', 'celník'], ['mazlíčci', 'mazlíček'], ['chlupy', 'chlup'], ['hry', 'hra'], ['prasata', 'prase']];
  for (const [form, base] of pairs) assert.equal(evaluate(form).key, evaluate(base).key, form + ' → ' + base);
});
test('useknuté tříznakové slovo se nepočítá za jiné', () => {
  for (const word of ['mám', 'bot', 'dom', 'kon']) assert.ok(!evaluate(word).known, word + ' nemá trefit delší slovo');
  for (const word of ['rumy', 'vodu', 'lesy', 'syna']) assert.ok(evaluate(word).known, word + ' má být známý tvar');
});
test('víceslovný tip bere nejteplejší slovo', () => {
  assert.equal(evaluate('francouzský buldoček').key, 'buldocek');
  assert.equal(evaluate('domácí mazlíček').key, 'mazlicek');
});

// ── neznámá slova a nesmysly ──
test('neznámé slovo má 1–8 % a vždy stejně', () => {
  for (const word of ['kalkulačka', 'parlament', 'trombón', 'žárovka', 'elektrárna', 'družstvo', 'množství', 'skvrna', 'čtvrtka', 'krk']) {
    const first = evaluate(word);
    assert.ok(!first.known && !first.nonsense, word + ' má být neznámé slovo');
    assert.ok(first.temp >= 1 && first.temp <= 8, word + ': ' + first.temp);
    assert.equal(evaluate(word).temp, first.temp);
  }
});
test('nesmysl dostane nulu', () => {
  for (const word of ['asdfgh', 'xxxx', 'qwerty', 'bbbb', 'x', 'kkkk', '12345', 'hjkl', 'aaa']) assert.equal(temp(word), 0, word);
});
test('prázdný tip se nepočítá', () => {
  assert.equal(evaluate(''), null);
  assert.equal(evaluate('   '), null);
  assert.equal(evaluate('…'), null);
});
test('značky ve vstupu nic nerozbijí', () => {
  const result = evaluate('<b>pes</b>');
  assert.equal(result.key, 'pes');
  assert.ok(evaluate('"; alert(1)//').temp <= 8);
});

// ── nápovědy ──
test('tři nápovědy a hlášky ze zadání', () => {
  assert.equal(HINTS.length, 3);
  assert.equal(evaluate('člověk').quip, 'Člověk to není… i když chrápe úplně stejně.');
  assert.equal(evaluate('siboney').quip, 'Na zdraví. Ale tudy cesta nevede.');
  assert.equal(evaluate('gauč').quip, 'Přihořívá. Tam totiž obvykle leží.');
  assert.equal(evaluate('pivo').quip, 'To pije Martin. Ty ne, víme.');
});

console.log(process.exitCode ? '\nNěkteré testy selhaly.' : '\nVše v pořádku (' + passed + ' testů).');
