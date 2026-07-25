/* ================================================================
   OBJETIVOS
   ================================================================ */
function viewObjetivos(){
  return `
  <div class="section-head">
    <div><h2>Objetivos</h2><div class="section-sub">Metas de produtividade da curadoria</div></div>
    <button class="btn" id="newGoalBtn">+ Nova meta</button>
  </div>
  <div class="grid cols-2">
    ${DB.goals.length ? DB.goals.map(g=>{
      const pct = g.meta>0 ? Math.min(100, Math.round((g.atual/g.meta)*100)) : 0;
      return `<div class="card" data-id="${g.id}" style="cursor:pointer;">
        <div style="display:flex;justify-content:space-between;align-items:baseline;">
          <strong style="font-family:var(--font-display);font-size:16px;">${esc(g.titulo)}</strong>
          <span style="font-size:12px;color:#847d6c;">${g.atual||0} / ${g.meta} ${esc(g.unidade||'')}</span>
        </div>
        <div class="goal-bar-bg"><div class="goal-bar-fill" style="width:${pct}%;"></div></div>
        <div style="font-size:11px;color:#9a9280;margin-top:6px;">${esc(g.periodo||'')}</div>
      </div>`;
    }).join('') : `<div class="empty-state" style="grid-column:1/-1;"><span class="ic">◎</span>Nenhuma meta definida ainda.</div>`}
  </div>`;
}
function goalForm(g0){
  const g = g0 || {titulo:'',meta:5,atual:0,unidade:'itens',periodo:'Semanal'};
  return `
  <div class="modal-head"><h3>${g0?'Editar meta':'Nova meta'}</h3><button class="modal-close" onclick="closeModal()">✕</button></div>
  <form id="goalForm">
    <div class="field"><label>Título</label><input required name="titulo" value="${esc(g.titulo)}" placeholder="ex: Analisar 5 marcas por semana"></div>
    <div class="field-row">
      <div class="field"><label>Meta (número)</label><input type="number" name="meta" value="${g.meta}"></div>
      <div class="field"><label>Progresso atual</label><input type="number" name="atual" value="${g.atual}"></div>
    </div>
    <div class="field-row">
      <div class="field"><label>Unidade</label><input name="unidade" value="${esc(g.unidade)}"></div>
      <div class="field"><label>Período</label><select name="periodo">${['Semanal','Mensal','Trimestral'].map(p=>`<option ${g.periodo===p?'selected':''}>${p}</option>`).join('')}</select></div>
    </div>
    <div class="modal-actions">
      <div>${g0?`<button type="button" class="btn danger small" id="delGoalBtn">Excluir</button>`:''}</div>
      <button type="submit" class="btn small">Salvar</button>
    </div>
  </form>`;
}
function attachObjetivosEvents(){
  document.getElementById('newGoalBtn').addEventListener('click', ()=>openGoalModal());
  document.querySelectorAll('[data-id]').forEach(el=>el.addEventListener('click',()=>{
    const g = DB.goals.find(x=>x.id===el.dataset.id); if(g) openGoalModal(g);
  }));
}
function openGoalModal(g0){
  openModal(goalForm(g0));
  document.getElementById('goalForm').addEventListener('submit', async e=>{
    e.preventDefault();
    const obj = Object.fromEntries(new FormData(e.target).entries());
    obj.meta = Number(obj.meta)||0; obj.atual = Number(obj.atual)||0;
    if(g0){ Object.assign(g0, obj); } else { DB.goals.push({id:uid(), ...obj}); }
    await save('goals'); closeModal(); render(); toast('Meta salva');
  });
  if(g0){
    document.getElementById('delGoalBtn').addEventListener('click', async ()=>{
      DB.goals = DB.goals.filter(x=>x.id!==g0.id); await save('goals'); closeModal(); render(); toast('Meta excluída');
    });
  }
}
