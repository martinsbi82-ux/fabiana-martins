/* ================================================================
   BIBLIOTECA
   ================================================================ */
const LIB_CATS = ['Artigos','Livros','Revistas','Podcasts','Vídeos','Pinterest','Instagram','Desfiles','Fashion Weeks'];
function viewBiblioteca(){
  return `
  <div class="section-head">
    <div><h2>Biblioteca</h2><div class="section-sub">Referências e materiais de estudo</div></div>
    <button class="btn" id="newLibBtn">+ Nova referência</button>
  </div>
  <div class="grid cols-3">
    ${DB.library.length ? DB.library.map(l=>`
      <div class="record-card" data-id="${l.id}">
        <div class="archive-no">${esc(l.categoria).toUpperCase()}</div>
        <h3>${esc(l.titulo)}</h3>
        <div class="meta">${esc(l.autorFonte)||''}</div>
        <div class="tag-row">${(l.tags||'').split(',').filter(Boolean).slice(0,3).map(t=>`<span class="tag">${esc(t.trim())}</span>`).join('')}</div>
      </div>`).join('') : `<div class="empty-state" style="grid-column:1/-1;"><span class="ic">▧</span>Nenhuma referência salva ainda.</div>`}
  </div>`;
}
function libForm(l0){
  const l = l0 || {titulo:'',categoria:'Artigos',autorFonte:'',link:'',tags:'',notas:'',relatedBrands:[],relatedTrends:[]};
  return `
  <div class="modal-head"><h3>${l0?'Editar referência':'Nova referência'}</h3><button class="modal-close" onclick="closeModal()">✕</button></div>
  <form id="libForm">
    <div class="field"><label>Título</label><input required name="titulo" value="${esc(l.titulo)}"></div>
    <div class="field-row">
      <div class="field"><label>Categoria</label><select name="categoria">${LIB_CATS.map(c=>`<option ${l.categoria===c?'selected':''}>${c}</option>`).join('')}</select></div>
      <div class="field"><label>Autor / Fonte</label><input name="autorFonte" value="${esc(l.autorFonte)}"></div>
    </div>
    <div class="field"><label>Link / Anexo</label><input name="link" value="${esc(l.link)}"></div>
    <div class="field"><label>Tags</label><input name="tags" value="${esc(l.tags)}"></div>
    <div class="field-row">
      <div class="field"><label>Marcas relacionadas</label>${multiCheckList('relatedBrands', DB.brands, l.relatedBrands)}</div>
      <div class="field"><label>Tendências relacionadas</label>${multiCheckList('relatedTrends', DB.trends, l.relatedTrends)}</div>
    </div>
    <div class="field"><label>Notas</label><textarea name="notas">${esc(l.notas)}</textarea></div>
    <div class="modal-actions">
      <div>${l0?`<button type="button" class="btn danger small" id="delLibBtn">Excluir</button>`:''}</div>
      <button type="submit" class="btn small">Salvar</button>
    </div>
  </form>`;
}
function attachBibliotecaEvents(){
  document.getElementById('newLibBtn').addEventListener('click', ()=>openLibModal());
  document.querySelectorAll('.record-card').forEach(el=>el.addEventListener('click',()=>{
    const l = DB.library.find(x=>x.id===el.dataset.id); if(l) openLibModal(l);
  }));
}
function openLibModal(l0){
  openModal(libForm(l0));
  document.getElementById('libForm').addEventListener('submit', async e=>{
    e.preventDefault();
    const fd = new FormData(e.target);
    const obj = Object.fromEntries(fd.entries());
    delete obj.relatedBrands; delete obj.relatedTrends;
    obj.relatedBrands = fd.getAll('relatedBrands');
    obj.relatedTrends = fd.getAll('relatedTrends');
    if(l0){ Object.assign(l0, obj); } else { DB.library.push({id:uid(), ...obj}); }
    await save('library'); closeModal(); render(); toast('Referência salva');
  });
  if(l0){
    document.getElementById('delLibBtn').addEventListener('click', async ()=>{
      DB.library = DB.library.filter(x=>x.id!==l0.id); await save('library'); closeModal(); render(); toast('Referência excluída');
    });
  }
}
