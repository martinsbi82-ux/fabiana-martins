/* ================================================================
   BUSCA INTELIGENTE
   ================================================================ */
function viewBusca(){
  const q = searchTerm;
  const matchB = DB.brands.filter(b=>JSON.stringify(b).toLowerCase().includes(q));
  const matchT = DB.trends.filter(t=>JSON.stringify(t).toLowerCase().includes(q));
  const matchC = DB.collections.filter(c=>JSON.stringify(c).toLowerCase().includes(q));
  const matchL = DB.library.filter(l=>JSON.stringify(l).toLowerCase().includes(q));
  const total = matchB.length+matchT.length+matchC.length+matchL.length;
  if(total===0) return `<div class="empty-state"><span class="ic">⌕</span>Nenhum resultado para "${esc(q)}".</div>`;
  function section(title, list, cls){
    if(!list.length) return '';
    return `<div class="section-head" style="margin-top:22px;"><h2 style="font-size:16px;">${title} (${list.length})</h2></div>
      <div class="grid cols-3">${list.map(x=>`<div class="record-card" data-${cls}="${x.id}">
        <h3>${esc(x.nome||x.titulo||x.marca)}</h3>
        <div class="meta">${esc(x.categoria||x.temporada||'')}</div>
      </div>`).join('')}</div>`;
  }
  return section('Marcas', matchB, 'brand') + section('Tendências', matchT, 'trend') + section('Coleções', matchC, 'col') + section('Biblioteca', matchL, 'lib');
}
function attachBuscaEvents(){
  document.querySelectorAll('[data-brand]').forEach(el=>el.addEventListener('click',()=>openBrandDetail(el.dataset.brand)));
  document.querySelectorAll('[data-trend]').forEach(el=>el.addEventListener('click',()=>openTrendDetail(el.dataset.trend)));
  document.querySelectorAll('[data-col]').forEach(el=>el.addEventListener('click',()=>openColDetail(el.dataset.col)));
  document.querySelectorAll('[data-lib]').forEach(el=>el.addEventListener('click',()=>{ const l=DB.library.find(x=>x.id===el.dataset.lib); if(l) openLibModal(l); }));
}
