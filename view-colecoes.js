/* ================================================================
   COLEÇÕES
   ================================================================ */
function viewColecoes(){
  return `
  <div class="section-head">
    <div><h2>Coleções</h2><div class="section-sub">Coleções analisadas por marca e temporada</div></div>
    <button class="btn" id="newColBtn">+ Nova coleção</button>
  </div>
  <div class="grid cols-3">
    ${DB.collections.length ? DB.collections.map((c,i)=>`
      <div class="record-card" data-id="${c.id}">
        <div class="archive-no">COLEÇÃO ${archiveNo(DB.collections,i)}</div>
        <h3>${esc(c.marca)}</h3>
        <div class="meta">${esc(c.temporada||'')} ${esc(c.ano||'')} · ${esc(c.qtdLooks||'?')} looks</div>
        <div class="tag-row">${(c.coresPrincipais||'').split(',').filter(Boolean).slice(0,4).map(t=>`<span class="tag">${esc(t.trim())}</span>`).join('')}</div>
      </div>`).join('') : `<div class="empty-state" style="grid-column:1/-1;"><span class="ic">▦</span>Nenhuma coleção cadastrada.</div>`}
  </div>`;
}
function colForm(c0){
  const c = c0 || {marca:'',temporada:'',ano:new Date().getFullYear(),qtdLooks:'',coresPrincipais:'',tecidosPrincipais:'',pecasChave:'',produtosComerciais:'',produtosConceito:'',insights:'',relatedBrands:[]};
  return `
  <div class="modal-head"><h3>${c0?'Editar coleção':'Nova coleção'}</h3><button class="modal-close" onclick="closeModal()">✕</button></div>
  <form id="colForm">
    <div class="field-row">
      <div class="field"><label>Marca (nome de exibição)</label><input required name="marca" value="${esc(c.marca)}"></div>
      <div class="field"><label>Quantidade de looks</label><input name="qtdLooks" value="${esc(c.qtdLooks)}"></div>
    </div>
    <div class="field"><label>Marcas cadastradas vinculadas</label>${multiCheckList('relatedBrands', DB.brands, c.relatedBrands)}</div>
    <div class="field-row">
      <div class="field"><label>Temporada</label><input name="temporada" value="${esc(c.temporada)}"></div>
      <div class="field"><label>Ano</label><input name="ano" value="${esc(c.ano)}"></div>
    </div>
    <div class="field"><label>Cores principais</label><input name="coresPrincipais" value="${esc(c.coresPrincipais)}"></div>
    <div class="field"><label>Tecidos principais</label><input name="tecidosPrincipais" value="${esc(c.tecidosPrincipais)}"></div>
    <div class="field"><label>Peças-chave</label><input name="pecasChave" value="${esc(c.pecasChave)}"></div>
    <div class="field-row">
      <div class="field"><label>Produtos comerciais</label><input name="produtosComerciais" value="${esc(c.produtosComerciais)}"></div>
      <div class="field"><label>Produtos conceito</label><input name="produtosConceito" value="${esc(c.produtosConceito)}"></div>
    </div>
    <div class="field"><label>Insights</label><textarea name="insights">${esc(c.insights)}</textarea></div>
    <div class="modal-actions">
      <div>${c0?`<button type="button" class="btn danger small" id="delColBtn">Excluir</button>`:''}</div>
      <button type="submit" class="btn small">Salvar</button>
    </div>
  </form>`;
}
function attachColecoesEvents(){
  document.getElementById('newColBtn').addEventListener('click', ()=>openColModal());
  document.querySelectorAll('.record-card').forEach(el=>el.addEventListener('click',()=>openColDetail(el.dataset.id)));
}
function openColModal(c0){
  openModal(colForm(c0));
  document.getElementById('colForm').addEventListener('submit', async e=>{
    e.preventDefault();
    const fd = new FormData(e.target);
    const obj = Object.fromEntries(fd.entries());
    delete obj.relatedBrands;
    obj.relatedBrands = fd.getAll('relatedBrands');
    if(c0){ Object.assign(c0, obj); } else { DB.collections.push({id:uid(), ...obj}); }
    await save('collections'); closeModal(); closeDrawer(); render(); toast('Coleção salva');
  });
  if(c0){
    document.getElementById('delColBtn').addEventListener('click', async ()=>{
      DB.collections = DB.collections.filter(x=>x.id!==c0.id); await save('collections'); closeModal(); closeDrawer(); render(); toast('Coleção excluída');
    });
  }
}
function openColDetail(id){
  const c = DB.collections.find(x=>x.id===id); if(!c) return;
  const idx = DB.collections.indexOf(c);
  const brands = brandsForCollection(c.id);
  const contents = contentForCollection(c.id);
  openDrawer(`
    <button class="drawer-close" onclick="closeDrawer()">✕</button>
    <div class="archive-no">COLEÇÃO ${archiveNo(DB.collections, idx)}</div>
    <h2>${esc(c.marca)}</h2>
    <div class="tag-row"><span class="tag">${esc(c.temporada)||''} ${esc(c.ano)||''}</span></div>
    <div style="margin-top:16px;"><button class="btn small" id="editColBtn">Editar</button></div>
    <div class="dblock"><div class="dgrid">
      <div><div class="dlabel">Looks</div><div class="dval">${esc(c.qtdLooks)||'—'}</div></div>
      <div><div class="dlabel">Cores principais</div><div class="dval">${esc(c.coresPrincipais)||'—'}</div></div>
      <div><div class="dlabel">Tecidos principais</div><div class="dval">${esc(c.tecidosPrincipais)||'—'}</div></div>
      <div><div class="dlabel">Peças-chave</div><div class="dval">${esc(c.pecasChave)||'—'}</div></div>
      <div><div class="dlabel">Produtos comerciais</div><div class="dval">${esc(c.produtosComerciais)||'—'}</div></div>
      <div><div class="dlabel">Produtos conceito</div><div class="dval">${esc(c.produtosConceito)||'—'}</div></div>
    </div></div>
    <div class="dblock"><div class="dlabel">Insights</div><div class="dval">${esc(c.insights)||'—'}</div></div>
    <div class="dblock" style="border-top:2px solid var(--clay);">
      <div class="dlabel" style="color:var(--clay);">Marcas vinculadas</div>
      <div class="tag-row">${brands.length?brands.map(b=>relTag(b,'marcas')).join(''):'<span class="rel-empty">Nenhuma marca vinculada ainda.</span>'}</div>
    </div>
    <div class="dblock">
      <div class="dlabel">Conteúdos vinculados</div>
      <div class="tag-row">${contents.length?contents.map(e=>relTag(e,'editorial')).join(''):'<span class="rel-empty">Nenhum conteúdo vinculado ainda.</span>'}</div>
    </div>
  `);
  attachGotoLinks();
  document.getElementById('editColBtn').addEventListener('click', ()=>openColModal(c));
}
