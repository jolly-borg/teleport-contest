import test from 'node:test';
import assert from 'node:assert/strict';

import { initRng, rn2, rnd, rn1, rne, rnz, enableRngLog, getRngLog } from '../js/rng.js';
import { game, resetGame } from '../js/gstate.js';

const SEED = 123456789;

test('rng: deterministic rn2/rnd/rn1 sequence for fixed seed', () => {
    resetGame();
    initRng(SEED);
    assert.equal(rn2(10), 6);
    assert.equal(rn2(10), 3);
    assert.equal(rn2(10), 0);

    resetGame();
    initRng(SEED);
    assert.equal(rnd(10), 7);
    assert.equal(rnd(10), 4);
    assert.equal(rnd(10), 1);

    resetGame();
    initRng(SEED);
    assert.equal(rn1(10, 5), 11);
    assert.equal(rn1(10, 5), 8);
});

test('rng: rne/rnz stable for fixed seed and level', () => {
    resetGame();
    game.u = { ulevel: 1 };
    initRng(SEED);
    assert.equal(rne(4), 1);
    assert.equal(rne(4), 1);
    assert.equal(rne(4), 1);

    resetGame();
    game.u = { ulevel: 10 };
    initRng(SEED);
    assert.equal(rnz(1000), 503);
    assert.equal(rnz(1000), 897);
});

test('rng: logging captures core calls', () => {
    resetGame();
    game.u = { ulevel: 1 };
    initRng(SEED);
    enableRngLog();
    rn2(10);
    rnd(10);
    rne(4);
    rnz(1000);

    const log = getRngLog();
    assert.ok(log.length >= 4);
    assert.equal(log[0], 'rn2(10)=6');
    assert.equal(log[1], 'rnd(10)=4');
    assert.ok(log.some(entry => entry.startsWith('rne(4)=')));
    assert.ok(log.some(entry => entry.startsWith('rnz(1000)=')));
});
