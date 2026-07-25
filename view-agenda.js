/* ================================================================
   AGENDA
   ================================================================ */
const CATS_AGENDA = ['Pesquisa','Curadoria','Conteúdo','Networking','Estudos','Reuniões','Eventos','Visitas','Organização'];
const PRIORIDADES = ['Alta','Média','Baixa'];
const ROTINA_SEMANAL = [
  {dia:'Segunda', foco:'Pesquisa de mercado', categoria:'Pesquisa'},
  {dia:'Terça', foco:'Análise de marcas', categoria:'Curadoria'},
  {dia:'Quarta', foco:'Atualização das fichas', categoria:'Curadoria'},
  {dia:'Quinta', foco:'Produção de conteúdo', categoria:'Conteúdo'},
  {dia:'Sexta', foco:'Planejamento da próxima semana', categoria:'Organização'},
  {dia:'Sábado', foco:'Pesquisa livre', categoria:'Pesquisa'},
  {dia:'Domingo', foco:'Revisão e organização', categoria:'Organização'},
];

function weekDates(){
  const now = new Date();
  const day = now.getDay(); // 0 sun
  const monday = new Date(now); monday.setDate(now.getDate() - ((day+6)%7));
  return Array.from({length:7},(_,i)=>{ const d=new Date(monday); d.setDate(monday.getDate()+i); return d.toISOString().slice(0,10); });
}
function viewAgenda(){
  const days = weekDates();
  const dayNames = ['Segunda','Terça','Quarta','Quinta','Sexta','Sábado','Domingo'];
  return `
  <div class="section-head">
    <div><h2>Agenda</h2><div class="section-sub">Calendário semanal de atividades da curadoria</div></div>
    <button class="btn" id="newTaskBtn">+ Nova atividade</button>
  </div>
  <div class="week-grid">
    ${days.map((d,i)=>{
      const items = DB.tasks.filter(t=>t.prazo===d).sort((a,b)=>(a.prioridade<b.prioridade?1:-1));
      const rotina = ROTINA_SEMANAL[i];
      return `<div class="day-col">
        <div class="day-head">${dayNames[i]}<br><span style="color:#c2b89f;">${fmtDate(d)}</span></div>
        <div class="routine-suggestion" data-suggest="${i}" data-date="${d}">
          <span class="rlabel">Rotina sugerida</span>${esc(rotina.foco)} <span class="radd">+</span>
        </div>
        ${items.map(t=>`<div class="task-chip prio-${esc(t.prioridade)}" data-id="${t.id}">
          <div class="cat">${esc(t.categoria)}</div>${esc(t.titulo)}
        </div>`).join('') || ''}
      </div>`;
    }).join('')}
  </div>
  <div class="section-head" style="margin-top:30px;"><h2 style="font-size:18px;">Rotina semanal</h2></div>
  <div class="grid cols-4" style="margin-bottom:8px;">
    ${ROTINA_SEMANAL.map(r=>`<div class="card" style="padding:12px 14px;">
      <div class="eyebrow-label" style="margin-bottom:2px;">${r.dia}</div>
      <div style="font-size:13px;">${esc(r.foco)}</div>
    </div>`).join('')}
  </div>

  <div class="section-head" style="margin-top:30px;"><h2 style="font-size:18px;">Todas as atividades</h2></div>
  ${DB.tasks.length ? DB.tasks.slice().sort((a,b)=>(a.prazo||'').localeCompare(b.prazo||'')).map(t=>`
    <div class="record-card" style="margin-bottom:10px;" data-id="${t.id}">
      <div class="archive-no">${esc(t.categoria)} · ${esc(t.prioridade)}</div>
      <h3 style="font-size:15px;">${esc(t.titulo)}</h3>
      <div class="meta">${fmtDate(t.prazo)}${t.duracao?' · '+esc(t.duracao):''}${t.concluida?' · ✓ concluída':''}</div>
    </div>`).join('') : `<div class="empty-state"><span class="ic">▤</span>Nenhuma atividade cadastrada ainda.</div>`}
  `;
}
function taskForm(task, prefill){
  const t = task || Object.assign({titulo:'',categoria:'Pesquisa',prioridade:'Média',prazo:new Date().toISOString().slice(0,10),duracao:'',observacoes:'',checklist:'',concluida:false}, prefill||{});
  return `
  <div class="modal-head"><h3>${task?'Editar atividade':'Nova atividade'}</h3><button class="modal-close" onclick="closeModal()">✕</button></div>
  <form id="taskForm">
    <div class="field"><label>Título</label><input required name="titulo" value="${esc(t.titulo)}"></div>
    <div class="field-row">
      <div class="field"><label>Categoria</label><select name="categoria">${CATS_AGENDA.map(c=>`<option ${t.categoria===c?'selected':''}>${c}</option>`).join('')}</select></div>
      <div class="field"><label>Prioridade</label><select name="prioridade">${PRIORIDADES.map(c=>`<option ${t.prioridade===c?'selected':''}>${c}</option>`).join('')}</select></div>
    </div>
    <div class="field-row">
      <div class="field"><label>Prazo</label><input type="date" name="prazo" value="${t.prazo}"></div>
      <div class="field"><label>Duração estimada</label><input name="duracao" placeholder="ex: 2h" value="${esc(t.duracao)}"></div>
    </div>
    <div class="field"><label>Checklist (uma linha por item)</label><textarea name="checklist">${esc(t.checklist)}</textarea></div>
    <div class="field"><label>Observações</label><textarea name="observacoes">${esc(t.observacoes)}</textarea></div>
    <div class="modal-actions">
      <div>${task?`<button type="button" class="btn danger small" id="delTaskBtn">Excluir</button>`:''}</div>
      <div style="display:flex;gap:8px;">
        ${task?`<button type="button" class="btn secondary small" id="toggleDoneBtn">${t.concluida?'Marcar pendente':'Marcar concluída'}</button>`:''}
        <button type="submit" class="btn small">Salvar</button>
      </div>
    </div>
  </form>`;
}
function attachAgendaEvents(){
  document.getElementById('newTaskBtn').addEventListener('click', ()=> openTaskModal());
  document.querySelectorAll('[data-id]').forEach(el=>el.addEventListener('click',()=>{
    const t = DB.tasks.find(x=>x.id===el.dataset.id); if(t) openTaskModal(t);
  }));
  document.querySelectorAll('[data-suggest]').forEach(el=>el.addEventListener('click',()=>{
    const rotina = ROTINA_SEMANAL[Number(el.dataset.suggest)];
    openTaskModal(null, {titulo:rotina.foco, categoria:rotina.categoria, prazo:el.dataset.date});
  }));
}
function openTaskModal(task, prefill){
  openModal(taskForm(task, prefill));
  document.getElementById('taskForm').addEventListener('submit', async e=>{
    e.preventDefault();
    const f = new FormData(e.target);
    const obj = Object.fromEntries(f.entries());
    if(task){ Object.assign(task, obj); }
    else { DB.tasks.push({id:uid(), ...obj, concluida:false}); }
    await save('tasks'); closeModal(); render(); toast('Atividade salva');
  });
  if(task){
    document.getElementById('delTaskBtn').addEventListener('click', async ()=>{
      DB.tasks = DB.tasks.filter(x=>x.id!==task.id); await save('tasks'); closeModal(); render(); toast('Atividade excluída');
    });
    document.getElementById('toggleDoneBtn').addEventListener('click', async ()=>{
      task.concluida = !task.concluida; await save('tasks'); closeModal(); render(); toast('Status atualizado');
    });
  }
}
