import test from 'node:test';
import assert from 'node:assert/strict';

import { resetGame, game } from '../js/gstate.js';
import {
    init_rect_globals,
    init_rect,
    get_rect_cnt,
    get_rect,
    rect_bounds,
    split_rects,
} from '../js/rect.js';
import { COLNO, ROWNO } from '../js/const.js';

function rectInside(r, bounds) {
    return r.lx >= bounds.lx && r.ly >= bounds.ly
        && r.hx <= bounds.hx && r.hy <= bounds.hy;
}

function rectContained(r, target) {
    return r.lx >= target.lx && r.ly >= target.ly
        && r.hx <= target.hx && r.hy <= target.hy;
}

test('rect: init_rect creates a full-map rectangle', () => {
    resetGame();
    init_rect_globals();
    init_rect();
    assert.equal(get_rect_cnt(), 1);

    const full = game.nhrect[0];
    assert.equal(full.lx, 0);
    assert.equal(full.ly, 0);
    assert.equal(full.hx, COLNO - 1);
    assert.equal(full.hy, ROWNO - 1);

    const inner = { lx: 1, ly: 1, hx: 5, hy: 5 };
    assert.ok(get_rect(inner));
});

test('rect: rect_bounds returns the union', () => {
    const r1 = { lx: 0, ly: 0, hx: 1, hy: 1 };
    const r2 = { lx: 2, ly: 3, hx: 4, hy: 5 };
    const out = { lx: 0, ly: 0, hx: 0, hy: 0 };
    rect_bounds(r1, r2, out);
    assert.deepEqual(out, { lx: 0, ly: 0, hx: 4, hy: 5 });
});

test('rect: split_rects keeps rectangles in bounds and excludes carve-out', () => {
    resetGame();
    init_rect_globals();
    init_rect();

    const base = game.nhrect[0];
    const carve = { lx: 10, ly: 5, hx: 20, hy: 10 };
    split_rects(base, carve);

    assert.ok(get_rect_cnt() >= 1);
    for (let i = 0; i < game.rect_cnt; i++) {
        const r = game.nhrect[i];
        assert.ok(rectInside(r, { lx: 0, ly: 0, hx: COLNO - 1, hy: ROWNO - 1 }));
        assert.ok(!rectContained(r, carve));
    }
});
