import test from 'node:test';
import assert from 'node:assert/strict';

import { resetGame, game } from '../js/gstate.js';
import { distmin, dist2, depth, isok } from '../js/hacklib.js';

test('hacklib: distmin/dist2 basics', () => {
    assert.equal(distmin(0, 0, 0, 0), 0);
    assert.equal(distmin(0, 0, 3, 4), 4);
    assert.equal(dist2(0, 0, 3, 4), 25);
});

test('hacklib: depth uses dungeon depth_start when present', () => {
    resetGame();
    game.dungeons = [{ depth_start: 5 }];
    assert.equal(depth({ dnum: 0, dlevel: 1 }), 5);
    assert.equal(depth({ dnum: 0, dlevel: 3 }), 7);
});

test('hacklib: isok respects default 80x21 bounds', () => {
    assert.equal(isok(0, 0), false);
    assert.equal(isok(1, 0), true);
    assert.equal(isok(79, 20), true);
    assert.equal(isok(80, 20), false);
    assert.equal(isok(1, 21), false);
});
