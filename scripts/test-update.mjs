import assert from 'node:assert/strict';
import {validateDraw} from './update-results.mjs';
const valid={status:'Result',year:2026,no:1,drawDate:'2026-01-01',drawResult:{drawnNo:[6,5,4,3,2,1],xDrawnNo:7}};
assert.deepEqual(validateDraw(valid),{issue:'26/001',date:'2026-01-01',main:[1,2,3,4,5,6],special:7});
assert.equal(validateDraw({...valid,status:'Selling'}),null);
for(const row of [{...valid,no:1000},{...valid,drawDate:'2026-02-30'},{...valid,drawDate:'2099-01-01'},{...valid,drawResult:{drawnNo:[1,2,3,4,5,6],xDrawnNo:6}},{...valid,drawResult:{drawnNo:[1,2,3,4,5,50],xDrawnNo:7}}])assert.throws(()=>validateDraw(row));
console.log('Official data validation PASS');
