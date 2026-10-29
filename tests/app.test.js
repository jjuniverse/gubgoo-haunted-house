import test from 'node:test';
import assert from 'node:assert/strict';
import { QUESTIONS, TYPES, resultType } from '../src/data.js';
import { resultText } from '../src/share.js';

test('every character is reachable through valid quiz responses', () => {
  const results = new Set();
  function walk(answers) {
    if (answers.length === QUESTIONS.length) return results.add(resultType(answers).id);
    for (const [, answer] of QUESTIONS[answers.length].a) walk([...answers, answer]);
  }
  walk([]);
  assert.deepEqual([...results].sort(), TYPES.map(type => type.id).sort());
});

test('ties resolve consistently when an answer is changed and restored', () => {
  assert.equal(resultType(['meeting', 'vampire']).id, 'meeting');
  assert.equal(resultType(['vampire', 'meeting']).id, 'meeting');
});

test('copied result describes the selected ghost and retains Pages subdirectory only', () => {
  for (const type of TYPES) {
    const text = resultText(type, 'https://jjuniverse.github.io/gubgoo-haunted-house/?private=value#token');
    for (const expected of [type.name, type.desc, type.habit, type.cure, type.match, 'Trick or Treat!']) assert.ok(text.includes(expected));
    assert.ok(text.endsWith('https://jjuniverse.github.io/gubgoo-haunted-house/'));
    assert.ok(!text.includes('private=value'));
    assert.ok(!text.includes('#token'));
  }
});
