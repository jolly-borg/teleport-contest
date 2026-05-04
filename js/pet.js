// pet.js — starting pet RNG consumption (dog.c makedog/pet_type).

import { rn2 } from './rng.js';
import { game } from './gstate.js';
import { getRolePetnum } from './roledata.js';

export function consume_pet_type_rng() {
    if (game.preferred_pet === 'n') return;
    const roleName = game.urole?.name?.m || '';
    const petnum = getRolePetnum(roleName);
    if (petnum !== 'NON_PM') return;
    if (game.preferred_pet === 'c' || game.preferred_pet === 'd') return;
    rn2(2);
}
