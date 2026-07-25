/* ================================================================
   PESQUISA DE MERCADO (visitas)
   ================================================================ */
function viewPesquisa(){
  return `
  <div class="section-head">
    <div><h2>Pesquisa de Mercado</h2><div class="section-sub">Registro de visitas a lojas e shoppings</div></div>
    <button class="btn" id="newVisitBtn">+ Nova visita</button>
  </div>
  <div class="grid cols-3">
    ${DB.market.length ? DB.market.map((m,i)=>`
      <div class="record-card" data-id="${m.id}">
        <div class="archive-no">VISITA ${archiveNo(DB.market,i)}</div>
        <h3>${esc(m.loja)}</h3>
        <div class="meta">${esc(m.shopping||'')}${m.cidade?' · '+esc(m.cidade):''} · ${fmtDate(m.data)}</div>
        <div class="meta" style="margin-top:6px;">${esc(m.faixaPreco)||''}</div>
      </div>`).join('') : `<div class="empty-state" style="grid-column:1/-1;"><span class="ic">⚲</span>Nenhuma visita registrada.</div>`}
  </div>`;
}
function visitForm(m0){
  const m = m0 || {shopping:'',loja:'',cidade:'',data:new Date().toISOString().slice(0,10),produtosObservados:'',faixaPreco:'',observacoes:'',insights:''};
  return `
  <div class="modal-head"><h3>${m0?'Editar visita':'Nova visita'}</h3><button class="modal-close" onclick="closeModal()">✕</button></div>
  <form id="visitForm">
    <div class="field-row">
      <div class="field"><label>Loja</label><input required name="loja" value="${esc(m.loja)}"></div>
      <div class="field"><label>Shopping</label><input name="shopping" value="${esc(m.shopping)}"></div>
    </div>
    <div class="field-row">
      <div class="field"><label>Cidade</label><input name="cidade" value="${esc(m.cidade)}"></div>
      <div class="field"><label>Data</label><input type="date" name="data" value="${m.data}"></div>
    </div>
    <div class="field"><label>Produtos observados</label><input name="produtosObservados" value="${esc(m.produtosObservados)}"></div>
    <div class="field"><label>Faixa de preço</label><input name="faixaPreco" value="${esc(m.faixaPreco)}"></div>
    <div class="field"><label>Observações</label><textarea name="observacoes">${esc(m.observacoes)}</textarea></div>
    <div class="field"><label>Insights</label><textarea name="insights">${esc(m.insights)}</textarea></div>
    <div class="modal-actions">
      <div>${m0?`<button type="button" class="btn danger small" id="delVisitBtn">Excluir</button>`:''}</div>
      <button type="submit" class="btn small">Salvar</button>
    </div>
  </form>`;
}
function attachPesquisaEvents(){
  document.getElementById('newVisitBtn').addEventListener('click', ()=>openVisitModal());
  document.querySelectorAll('.record-card').forEach(el=>el.addEventListener('click',()=>{
    const m = DB.market.find(x=>x.id===el.dataset.id); if(m) openVisitModal(m);
  }));
}
function openVisitModal(m0){
  openModal(visitForm(m0));
  document.getElementById('visitForm').addEventListener('submit', async e=>{
    e.preventDefault();
    const obj = Object.fromEntries(new FormData(e.target).entries());
    if(m0){ Object.assign(m0, obj); } else { DB.market.push({id:uid(), ...obj}); }
    await save('market'); closeModal(); render(); toast('Visita registrada');
  });
  if(m0){
    document.getElementById('delVisitBtn').addEventListener('click', async ()=>{
      DB.market = DB.market.filter(x=>x.id!==m0.id); await save('market'); closeModal(); render(); toast('Visita excluída');
    });
  }
}
