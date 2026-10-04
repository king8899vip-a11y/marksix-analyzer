import { readFile, writeFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const ENDPOINT = 'https://info.cld.hkjc.com/graphql/base/';

function fail(message) { throw new Error(message); }

function validateDraw(row) {
  if (!row || row.status !== 'Result') return null;
  const main = row.drawResult?.drawnNo;
  const special = row.drawResult?.xDrawnNo;
  if (!Array.isArray(main) || main.length !== 6) fail('HKJC returned invalid main numbers');
  const seven = [...main, special];
  if (!seven.every(n => Number.isInteger(n) && n >= 1 && n <= 49)) fail('HKJC returned number outside 1-49');
  if (new Set(seven).size !== 7) fail('HKJC returned duplicate numbers');
  const year = String(row.year ?? '');
  const no = Number(row.no);
  const date = String(row.drawDate ?? '').slice(0, 10);
  if (!/^\d{4}$/.test(year) || !Number.isInteger(no) || no < 1) fail('HKJC returned invalid issue');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) fail('HKJC returned invalid date');
  return {
    issue: `${year.slice(-2)}/${String(no).padStart(3,'0')}`,
    date,
    main: [...main].sort((a,b)=>a-b),
    special
  };
}

async function fetchOfficial() {
  const request = JSON.parse(await readFile(new URL('scripts/hkjc-request.json', root), 'utf8'));
  let lastError;
  for (let attempt=1; attempt<=4; attempt++) {
    try {
      const res = await fetch(ENDPOINT, {
        method:'POST',
        headers:{
          'content-type':'application/json',
          'accept':'application/json',
          'origin':'https://bet.hkjc.com',
          'referer':'https://bet.hkjc.com/',
          'user-agent':'Mozilla/5.0'
        },
        body:JSON.stringify(request),
        signal:AbortSignal.timeout(20000)
      });
      if (!res.ok) fail(`HKJC HTTP ${res.status}`);
      const json = await res.json();
      if (json.errors?.length) fail(`HKJC GraphQL: ${JSON.stringify(json.errors)}`);
      const rows = json.data?.lotteryDraws;
      if (!Array.isArray(rows)) fail('HKJC response missing lotteryDraws');
      const draws = rows.map(validateDraw).filter(Boolean);
      if (!draws.length) fail('HKJC returned no completed draws');
      return draws;
    } catch (e) {
      lastError=e;
      console.error(`Attempt ${attempt} failed: ${e.message}`);
      if (attempt<4) await new Promise(r=>setTimeout(r,2000*attempt));
    }
  }
  throw lastError;
}

async function main() {
  const historyUrl = new URL('data/history.json', root);
  const snapshotUrl = new URL('data/snapshot.json', root);
  const oldHistory = JSON.parse(await readFile(historyUrl,'utf8'));
  const snapshot = JSON.parse(await readFile(snapshotUrl,'utf8'));
  const fetched = await fetchOfficial();

  const merged = new Map((oldHistory.draws || []).map(d=>[d.issue,d]));
  for (const d of fetched) merged.set(d.issue,d);
  const draws=[...merged.values()].sort((a,b)=>b.date.localeCompare(a.date)||b.issue.localeCompare(a.issue));

  if (!draws.length) fail('Merged history is empty');
  if (oldHistory.draws?.[0] && draws[0].date < oldHistory.draws[0].date) fail('Official source regressed');

  const checkedAt=new Date().toISOString();
  const source='香港赛马会';
  const sourceUrl='https://bet.hkjc.com/ch/marksix/results';

  await writeFile(historyUrl, JSON.stringify({source,sourceUrl,checkedAt,draws},null,2)+'\n');
  snapshot.latest=draws[0];
  snapshot.checkedAt=checkedAt;
  snapshot.source=source;
  snapshot.sourceUrl=sourceUrl;
  await writeFile(snapshotUrl,JSON.stringify(snapshot,null,2)+'\n');
  console.log(`SUCCESS latest=${draws[0].issue} date=${draws[0].date} total=${draws.length}`);
}

main().catch(err=>{ console.error('UPDATER_FATAL:', err?.stack || err); process.exit(1); });
