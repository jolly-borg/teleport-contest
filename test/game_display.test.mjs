import test from 'node:test';
import assert from 'node:assert/strict';

import { GameDisplay } from '../js/game_display.js';

function makeDisplay() {
    return new GameDisplay(null);
}

test('game_display: putstr_message updates topline fields', () => {
    const display = makeDisplay();
    display.putstr_message('Hello world   ');
    assert.equal(display.topMessage, 'Hello world');
    assert.equal(display.toplines, 'Hello world');
    assert.equal(display.toplin, 1);
    assert.equal(display.messages.length, 1);
    assert.equal(display.messages[0], 'Hello world');
});

test('game_display: message queue caps at 20 entries', () => {
    const display = makeDisplay();
    for (let i = 0; i < 25; i++) {
        display.putstr_message(`msg-${i}`);
    }
    assert.equal(display.messages.length, 20);
    assert.equal(display.messages[0], 'msg-5');
    assert.equal(display.messages[19], 'msg-24');
});
