import assert from 'node:assert/strict';
import {comparePeriods} from './generate-comparison.mjs';
const draw=(date,issue,main,special)=>({date,issue,main,special});
const c=comparePeriods({draws:[draw('2026-05-05','26/047',[1,2,3,4,5,6],7),draw('2026-05-02','26/046',[8,9,10,11,12,13],14),draw('2026-05-01','26/045',[1,2,3,4,5,6],7)]});
assert.equal(c.size,1);assert.equal(c.before.first,'26/046');assert.equal(c.after.first,'26/047');assert.equal(c.rows[0].mainDelta,100);assert.equal(c.rows[7].mainDelta,-100);assert.equal(c.rows[6].specialDelta,100);assert.equal(c.rows.reduce((n,r)=>n+r.main,0),6*c.size);assert.equal(c.rows.reduce((n,r)=>n+r.beforeMain,0),6*c.size);assert.equal(c.rows.reduce((n,r)=>n+r.special,0),c.size);assert.throws(()=>comparePeriods({draws:[]}));console.log('Comparison sample selection, totals and deltas PASS');
