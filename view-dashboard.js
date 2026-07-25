/* ================================================================
   DASHBOARD
   ================================================================ */
function viewDashboard(){
  const today = new Date().toISOString().slice(0,10);
  const weekAhead = new Date(Date.now()+7*86400000).toISOString().slice(0,10);
  const upcomingTasks = DB.tasks.filter(t=>t.prazo>=today && t.prazo<=weekAhead && !t.concluida)
    .sort((a,b)=>a.prazo.localeCompare(b.prazo)).slice(0,5);
  const scheduledContent = DB.editorial.filter(e=>e.status==='Agendado').slice(0,5);
  const pendingBrands = DB.brands.filter(b=>b.status==='Pesquisando' || b.status==='Em avaliação').slice(0,5);
  const weekTrends = DB.trends.filter(t=>{
    if(!t.createdAt) return false;
    return (Date.now()-new Date(t.createdAt).getTime()) < 7*86400000;
  }).length;

  return `
  <div class="grid cols-4" style="margin-bottom:26px;">
    <div class="card stat-card"><div class="num">${DB.brands.length}</div><div class="lbl">Marcas cadastradas</div></div>
    <div class="card stat-card"><div class="num">${DB.trends.length}</div><div class="lbl">Tendências registradas</div></div>
    <div class="card stat-card"><div class="num">${DB.collections.length}</div><div class="lbl">Coleções acompanhadas</div></div>
    <div class="card stat-card"><div class="num">${weekTrends}</div><div class="lbl">Tendências esta semana</div></div>
  </div>

  <div class="grid cols-2">
    <div>
      <div class="section-head"><h2 style="font-size:18px;">Próximas tarefas</h2></div>
      ${upcomingTasks.length ? upcomingTasks.map(t=>`
        <div class="task-chip prio-${esc(t.prioridade)}" data-id="${t.id}">
          <div class="cat">${esc(t.categoria)} · ${fmtDate(t.prazo)}</div>
          <div>${esc(t.titulo)}</div>
        </div>`).join('') : `<div class="empty-state"><span class="ic">▤</span>Nenhuma tarefa nos próximos 7 dias.</div>`}

      <div class="section-head" style="margin-top:22px;"><h2 style="font-size:18px;">Marcas pendentes de análise</h2></div>
      ${pendingBrands.length ? pendingBrands.map((b,i)=>`
        <div class="task-chip" data-brand="${b.id}"><div class="cat">${esc(b.status)}</div><div>${esc(b.nome)}</div></div>
      `).join('') : `<div class="empty-state"><span class="ic">▣</span>Nenhuma marca pendente.</div>`}
    </div>

    <div>
      <div class="section-head"><h2 style="font-size:18px;">Conteúdos programados</h2></div>
      ${scheduledContent.length ? scheduledContent.map(e=>`
        <div class="task-chip" data-ed="${e.id}"><div class="cat">${esc(e.plataforma)} · ${fmtDate(e.data)}</div><div>${esc(e.tema)}</div></div>
      `).join('') : `<div class="empty-state"><span class="ic">▥</span>Nada agendado ainda.</div>`}

      <div class="section-head" style="margin-top:22px;"><h2 style="font-size:18px;">Prioridades</h2></div>
      ${DB.tasks.filter(t=>t.prioridade==='Alta' && !t.concluida).slice(0,5).map(t=>`
        <div class="task-chip prio-Alta" data-id="${t.id}"><div class="cat">${esc(t.categoria)}</div><div>${esc(t.titulo)}</div></div>
      `).join('') || `<div class="empty-state"><span class="ic">◎</span>Sem prioridades altas no momento.</div>`}
    </div>
  </div>
  `;
}
function attachDashboardEvents(){
  document.querySelectorAll('[data-brand]').forEach(el=>el.addEventListener('click',()=>openBrandDetail(el.dataset.brand)));
  document.querySelectorAll('[data-ed]').forEach(el=>el.addEventListener('click',()=>{ setView('editorial'); }));
  document.querySelectorAll('[data-id]').forEach(el=>{ if(el.dataset.id) el.addEventListener('click',()=>{ setView('agenda'); }); });
}
