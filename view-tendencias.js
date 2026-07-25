/* ================================================================
   TENDÊNCIAS
   ================================================================ */
function viewTendencias(){
  return `
  <div class="section-head">
    <div><h2>Tendências</h2><div class="section-sub">${DB.trends.length} tendências registradas</div></div>
    <button class="btn" id="newTrendBtn">+ Nova tendência</button>
  </div>
  <div class="grid cols-3">
    ${DB.trends.length ? DB.trends.map((t,i)=>`
      <div class="record-card" data-id="${t.id}">
        <div class="archive-no">TENDÊNCIA ${archiveNo(DB.trends,i)}</div>
        <h3>${esc(t.nome)}</h3>
        <div class="meta">${esc(t.temporada||'')} ${esc(t.ano||'')}${t.relevancia?' · Relevância: '+esc(t.relevancia):''}</div>
        <div class="meta" style="margin-top:4px;">${(t.relatedBrands||[]).length} marca(s) vinculada(s)</div>
        <div class="tag-row">${(t.cores||'').split(',').filter(Boolean).slice(0,4).map(c=>`<span class="tag">${esc(c.trim())}</span>`).join('')}</div>
      </div>`).join('') : `<div class="empty-state" style="grid-column:1/-1;"><span class="ic">✺</span>Nenhuma tendência registrada ainda.</div>`}
  </div>`;
}
function trendForm(t0){
  const t = t0 || {nome:'',temporada:'',ano:new Date().getFullYear(),origem:'',referencias:'',cores:'',tecidos:'',modelagens:'',silhuetas:'',estampas:'',materiais:'',aplicacaoComercial:'',relevancia:'Média',observacoes:'',relatedBrands:[]};
  return `
  <div class="modal-head"><h3>${t0?'Editar tendência':'Nova tendência'}</h3><button class="modal-close" onclick="closeModal()">✕</button></div>
  <form id="trendForm">
    <div class="field"><label>Nome</label><input required name="nome" value="${esc(t.nome)}"></div>
    <div class="field-row">
      <div class="field"><label>Temporada</label><input name="temporada" value="${esc(t.temporada)}" placeholder="Primavera/Verão"></div>
      <div class="field"><label>Ano</label><input name="ano" value="${esc(t.ano)}"></div>
    </div>
    <div class="field"><label>Origem / Referências</label><input name="origem" value="${esc(t.origem)}"></div>
    <div class="field-row">
      <div class="field"><label>Cores (separadas por vírgula)</label><input name="cores" value="${esc(t.cores)}"></div>
      <div class="field"><label>Tecidos</label><input name="tecidos" value="${esc(t.tecidos)}"></div>
    </div>
    <div class="field-row">
      <div class="field"><label>Modelagens / Silhuetas</label><input name="modelagens" value="${esc(t.modelagens)}"></div>
      <div class="field"><label>Estampas / Materiais</label><input name="estampas" value="${esc(t.estampas)}"></div>
    </div>
    <div class="field"><label>Marcas relacionadas <span style="text-transform:none;font-weight:400;">(essa tendência aparece na ficha dessas marcas)</span></label>
      ${multiCheckList('relatedBrands', DB.brands, t.relatedBrands)}
    </div>
    <div class="field-row">
      <div class="field"><label>Aplicação comercial</label><input name="aplicacaoComercial" value="${esc(t.aplicacaoComercial)}"></div>
      <div class="field"><label>Relevância</label><select name="relevancia">${['Alta','Média','Baixa'].map(r=>`<option ${t.relevancia===r?'selected':''}>${r}</option>`).join('')}</select></div>
    </div>
    <div class="field"><label>Observações</label><textarea name="observacoes">${esc(t.observacoes)}</textarea></div>
    <div class="modal-actions">
      <div>${t0?`<button type="button" class="btn danger small" id="delTrendBtn">Excluir</button>`:''}</div>
      <button type="submit" class="btn small">Salvar</button>
    </div>
  </form>`;
}
function attachTendenciasEvents(){
  document.getElementById('newTrendBtn').addEventListener('click', ()=>openTrendModal());
  document.querySelectorAll('.record-card').forEach(el=>el.addEventListener('click',()=>openTrendDetail(el.dataset.id)));
}
function openTrendModal(t0){
  openModal(trendForm(t0));
  document.getElementById('trendForm').addEventListener('submit', async e=>{
    e.preventDefault();
    const fd = new FormData(e.target);
    const obj = Object.fromEntries(fd.entries());
    delete obj.relatedBrands;
    obj.relatedBrands = fd.getAll('relatedBrands');
    if(t0){ Object.assign(t0, obj); } else { DB.trends.push({id:uid(), createdAt:new Date().toISOString(), ...obj}); }
    await save('trends'); closeModal(); closeDrawer(); render(); toast('Tendência salva');
  });
  if(t0){
    document.getElementById('delTrendBtn').addEventListener('click', async ()=>{
      DB.trends = DB.trends.filter(x=>x.id!==t0.id); await save('trends'); closeModal(); closeDrawer(); render(); toast('Tendência excluída');
    });
  }
}
function openTrendDetail(id){
  const t = DB.trends.find(x=>x.id===id); if(!t) return;
  const idx = DB.trends.indexOf(t);
  const brands = (t.relatedBrands||[]).map(bid=>DB.brands.find(b=>b.id===bid)).filter(Boolean);
  const contents = contentForTrend(t.id);
  const lib = libraryForTrend(t.id);
  openDrawer(`
    <button class="drawer-close" onclick="closeDrawer()">✕</button>
    <div class="archive-no">TENDÊNCIA ${archiveNo(DB.trends, idx)}</div>
    <h2>${esc(t.nome)}</h2>
    <div class="tag-row"><span class="tag">${esc(t.temporada)||''} ${esc(t.ano)||''}</span>${t.relevancia?`<span class="tag">Relevância ${esc(t.relevancia)}</span>`:''}</div>
    <div style="margin-top:16px;"><button class="btn small" id="editTrendBtn">Editar</button></div>
    <div class="dblock"><div class="dgrid">
      <div><div class="dlabel">Origem</div><div class="dval">${esc(t.origem)||'—'}</div></div>
      <div><div class="dlabel">Cores</div><div class="dval">${esc(t.cores)||'—'}</div></div>
      <div><div class="dlabel">Tecidos</div><div class="dval">${esc(t.tecidos)||'—'}</div></div>
      <div><div class="dlabel">Modelagens/Silhuetas</div><div class="dval">${esc(t.modelagens)||'—'}</div></div>
      <div><div class="dlabel">Estampas/Materiais</div><div class="dval">${esc(t.estampas)||'—'}</div></div>
      <div><div class="dlabel">Aplicação comercial</div><div class="dval">${esc(t.aplicacaoComercial)||'—'}</div></div>
    </div></div>
    <div class="dblock"><div class="dlabel">Observações</div><div class="dval">${esc(t.observacoes)||'—'}</div></div>

    <div class="dblock" style="border-top:2px solid var(--clay);">
      <div class="dlabel" style="color:var(--clay);">Marcas relacionadas</div>
      <div class="tag-row">${brands.length?brands.map(b=>relTag(b,'marcas')).join(''):'<span class="rel-empty">Nenhuma marca vinculada ainda.</span>'}</div>
    </div>
    <div class="dblock">
      <div class="dlabel">Conteúdos gerados a partir desta tendência</div>
      <div class="tag-row">${contents.length?contents.map(c=>relTag(c,'editorial')).join(''):'<span class="rel-empty">Nenhum conteúdo vinculado ainda.</span>'}</div>
    </div>
    <div class="dblock">
      <div class="dlabel">Referências na biblioteca</div>
      <div class="tag-row">${lib.length?lib.map(l=>relTag(l,'biblioteca')).join(''):'<span class="rel-empty">Nenhuma referência vinculada ainda.</span>'}</div>
    </div>
  `);
  attachGotoLinks();
  document.getElementById('editTrendBtn').addEventListener('click', ()=>openTrendModal(t));
}
