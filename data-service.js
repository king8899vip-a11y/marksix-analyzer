(function(){
  const fallbackUrl = './data/snapshot.json';
  const cfg = window.APP_CONFIG || {};
  const source = cfg.DATA_URL || fallbackUrl;
  async function getSnapshot(){
    const url = source + (source.includes('?') ? '&' : '?') + 't=' + Date.now();
    const res = await fetch(url, {cache:'no-store'});
    if(!res.ok) throw new Error('数据读取失败: ' + res.status);
    return res.json();
  }
  window.MarkSixData = { getSnapshot, source };
})();
