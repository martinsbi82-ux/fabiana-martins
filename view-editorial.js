/* ================================================================
   PLANEJAMENTO EDITORIAL (Kanban)
   ================================================================ */
const ED_STATUS = ['Ideia','Em produção','Revisão','Agendado','Publicado'];
const ED_TIPOS = ['Bastidores','Tendência','Marca','Editorial','Lifestyle','Curadoria','Processo','Educativo','Cases','Inspiração'];

function viewEditorial(){
  return `
  <div class="section-head">
    <div><h2>Planejamento Editorial</h2><div class="section-sub">Calendário de conteúdo — do rascunho à publicação</div></div>
    <button class="btn" id="newEdBtn">+ Nova publicação</button>
  </div>
  <div class="kanban">
    ${ED_STATUS.map(s=>{
      const items = DB.editorial.filter(e=>e.status===s);
      return `<div class="kanban-col">
        <div class="kanban-col-head">${s} · ${items.length}</div>
        ${items.map(e=>`<div class="kanban-card" data-id="${e.id}">
          <div class="plat">${esc(e.plataforma||'—')} · ${esc(e.formato||'')}</div>
          <div class="tit">${esc(e.tema)}</div>
          <div class="dt">${fmtDate(e.data)}${e.horario?' · '+esc(e.horario):''}</div>
          ${e.relatedBrand||e.relatedTrend?`<div class="dt" style="color:var(--clay);">${e.relatedBrand?esc(relLabel(DB.brands.find(b=>b.id===e.relatedBrand)||{})):''}${e.relatedBrand&&e.relatedTrend?' · ':''}${e.relatedTrend?esc(relLabel(DB.trends.find(t=>t.id===e.relatedTrend)||{})):''}</div>`:''}
        </div>`).join('') || '<div style="font-size:11.5px;color:#c2b89f;padding:6px 0;">vazio</div>'}
      </div>`;
    }).join('')}
  </div>`;
}
function edForm(item){
  const e = item || {data:new Date().toISOString().slice(0,10),horario:'',plataforma:'Instagram',formato:'Feed',tema:'',objetivo:'',cta:'',palavrasChave:'',legenda:'',status:'Ideia',tipo:'Curadoria',relatedBrand:'',relatedTrend:'',relatedCollection:''};
  return `
  <div class="modal-head"><h3>${item?'Editar publicação':'Nova publicação'}</h3><button class="modal-close" onclick="closeModal()">✕</button></div>
  <form id="edForm">
    <div class="field"><label>Tema</label><input required name="tema" value="${esc(e.tema)}"></div>
    <div class="field-row">
      <div class="field"><label>Data</label><input type="date" name="data" value="${e.data}"></div>
      <div class="field"><label>Horário</label><input name="horario" placeholder="ex: 18:00" value="${esc(e.horario)}"></div>
    </div>
    <div class="field-row">
      <div class="field"><label>Plataforma</label><input name="plataforma" value="${esc(e.plataforma)}"></div>
      <div class="field"><label>Formato</label><input name="formato" value="${esc(e.formato)}" placeholder="Feed, Reels, Stories..."></div>
    </div>
    <div class="field-row">
      <div class="field"><label>Tipo</label><select name="tipo">${ED_TIPOS.map(t=>`<option ${e.tipo===t?'selected':''}>${t}</option>`).join('')}</select></div>
      <div class="field"><label>Status</label><select name="status">${ED_STATUS.map(t=>`<option ${e.status===t?'selected':''}>${t}</option>`).join('')}</select></div>
    </div>
    <div class="field-row">
      <div class="field"><label>Marca relacionada</label>${singleSelect('relatedBrand', DB.brands, e.relatedBrand)}</div>
      <div class="field"><label>Tendência relacionada</label>${singleSelect('relatedTrend', DB.trends, e.relatedTrend)}</div>
    </div>
    <div class="field"><label>Coleção relacionada</label>${singleSelect('relatedCollection', DB.collections, e.relatedCollection)}</div>
    <div class="field"><label>Objetivo</label><input name="objetivo" value="${esc(e.objetivo)}"></div>
    <div class="field"><label>CTA</label><input name="cta" value="${esc(e.cta)}"></div>
    <div class="field"><label>Palavras-chave</label><input name="palavrasChave" value="${esc(e.palavrasChave)}"></div>
    <div class="field"><label>Legenda</label><textarea name="legenda">${esc(e.legenda)}</textarea></div>
    <div class="modal-actions">
      <div>${item?`<button type="button" class="btn danger small" id="delEdBtn">Excluir</button>`:''}</div>
      <button type="submit" class="btn small">Salvar</button>
    </div>
  </form>`;
}
function attachEditorialEvents(){
  document.getElementById('newEdBtn').addEventListener('click', ()=>openEdModal());
  document.querySelectorAll('.kanban-card').forEach(el=>el.addEventListener('click',()=>{
    const item = DB.editorial.find(x=>x.id===el.dataset.id); if(item) openEdModal(item);
  }));
}
function openEdModal(item){
  openModal(edForm(item));
  document.getElementById('edForm').addEventListener('submit', async ev=>{
    ev.preventDefault();
    const obj = Object.fromEntries(new FormData(ev.target).entries());
    if(item){ Object.assign(item, obj); } else { DB.editorial.push({id:uid(), ...obj}); }
    await save('editorial'); closeModal(); render(); toast('Publicação salva');
  });
  if(item){
    document.getElementById('delEdBtn').addEventListener('click', async ()=>{
      DB.editorial = DB.editorial.filter(x=>x.id!==item.id); await save('editorial'); closeModal(); render(); toast('Publicação excluída');
    });
  }
}
