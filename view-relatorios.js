/* ================================================================
   RELATÓRIOS
   ================================================================ */
function viewRelatorios(){
  const catCount = {};
  DB.brands.forEach(b=>{ const c=b.categoria||'Sem categoria'; catCount[c]=(catCount[c]||0)+1; });
  const statusCount = {};
  DB.brands.forEach(b=>{ statusCount[b.status]=(statusCount[b.status]||0)+1; });
  const pubCount = {};
  DB.editorial.forEach(e=>{ if(e.status==='Publicado'){ const p=e.plataforma||'Outros'; pubCount[p]=(pubCount[p]||0)+1; } });
  const maxCat = Math.max(1,...Object.values(catCount));
  const maxStatus = Math.max(1,...Object.values(statusCount));
  const maxPub = Math.max(1,...Object.values(pubCount));

  function bars(obj, max){
    return Object.entries(obj).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`
      <div class="report-bar-row">
        <div class="report-bar-label">${esc(k)}</div>
        <div class="report-bar-track"><div class="report-bar-fill" style="width:${(v/max)*100}%;"></div></div>
        <div class="report-bar-val">${v}</div>
      </div>`).join('') || '<div class="empty-state">Sem dados ainda.</div>';
  }
  return `
  <div class="section-head"><div><h2>Relatórios</h2><div class="section-sub">Visão consolidada da curadoria</div></div></div>
  <div class="grid cols-4" style="margin-bottom:26px;">
    <div class="card stat-card"><div class="num">${DB.brands.length}</div><div class="lbl">Marcas cadastradas</div></div>
    <div class="card stat-card"><div class="num">${DB.editorial.filter(e=>e.status==='Publicado').length}</div><div class="lbl">Conteúdos publicados</div></div>
    <div class="card stat-card"><div class="num">${DB.trends.length}</div><div class="lbl">Tendências registradas</div></div>
    <div class="card stat-card"><div class="num">${DB.tasks.filter(t=>t.concluida).length}/${DB.tasks.length}</div><div class="lbl">Tarefas concluídas</div></div>
  </div>
  <div class="grid cols-2">
    <div class="card"><h3 style="font-family:var(--font-display);font-size:16px;margin-bottom:14px;">Marcas mais pesquisadas por categoria</h3>${bars(catCount,maxCat)}</div>
    <div class="card"><h3 style="font-family:var(--font-display);font-size:16px;margin-bottom:14px;">Marcas por status</h3>${bars(statusCount,maxStatus)}</div>
  </div>
  <div class="card" style="margin-top:16px;"><h3 style="font-family:var(--font-display);font-size:16px;margin-bottom:14px;">Conteúdos publicados por plataforma</h3>${bars(pubCount,maxPub)}</div>
  `;
}
