/* ================================================================
   BANCO DE MARCAS + FICHA DE ANÁLISE
   ================================================================ */
const BRAND_STATUS = ['Pesquisando','Acompanhando','Aprovada','Em avaliação','Descartada'];

function viewMarcas(){
  return `
  <div class="section-head">
    <div><h2>Banco de Marcas</h2><div class="section-sub">${DB.brands.length} marcas cadastradas</div></div>
    <button class="btn" id="newBrandBtn">+ Nova marca</button>
  </div>
  <div class="pill-select" id="brandFilterRow">
    <button class="active" data-status="Todas">Todas</button>
    ${BRAND_STATUS.map(s=>`<button data-status="${s}">${s}</button>`).join('')}
  </div>
  <div class="grid cols-3" id="brandGrid"></div>
  `;
}
function renderBrandGrid(filter){
  const grid = document.getElementById('brandGrid');
  let list = DB.brands;
  if(filter && filter!=='Todas') list = list.filter(b=>b.status===filter);
  grid.innerHTML = list.length ? list.map((b)=>{
    const idx = DB.brands.indexOf(b);
    return `<div class="record-card" data-id="${b.id}">
      <div class="archive-no">MARCA ${archiveNo(DB.brands, idx)}</div>
      <h3>${esc(b.nome)}</h3>
      <div class="meta">${esc(b.categoria||'')}${b.cidade?' · '+esc(b.cidade):''}${b.estado?'/'+esc(b.estado):''}</div>
      <div class="tag-row">
        <span class="tag status-${esc(b.status)}">${esc(b.status)}</span>
        ${(b.tags||'').split(',').filter(Boolean).slice(0,3).map(t=>`<span class="tag">${esc(t.trim())}</span>`).join('')}
      </div>
    </div>`;
  }).join('') : `<div class="empty-state" style="grid-column:1/-1;"><span class="ic">▣</span>Nenhuma marca nesta categoria ainda.</div>`;
  grid.querySelectorAll('.record-card').forEach(el=>el.addEventListener('click',()=>openBrandDetail(el.dataset.id)));
}
function attachMarcasEvents(){
  renderBrandGrid('Todas');
  document.getElementById('newBrandBtn').addEventListener('click', ()=>openBrandModal());
  document.querySelectorAll('#brandFilterRow button').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      document.querySelectorAll('#brandFilterRow button').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      renderBrandGrid(btn.dataset.status);
    });
  });
}
function brandForm(b0){
  const b = b0 || {nome:'',categoria:'',segmento:'',cidade:'',estado:'',instagram:'',site:'',contato:'',representante:'',preco:'',publico:'',posicionamento:'',estilo:'',tecidos:'',modelagens:'',cores:'',diferenciais:'',status:'Pesquisando',tags:'',observacoes:''};
  return `
  <div class="modal-head"><h3>${b0?'Editar marca':'Nova marca'}</h3><button class="modal-close" onclick="closeModal()">✕</button></div>
  <form id="brandForm">
    <div class="field-row">
      <div class="field"><label>Nome</label><input required name="nome" value="${esc(b.nome)}"></div>
      <div class="field"><label>Status</label><select name="status">${BRAND_STATUS.map(s=>`<option ${b.status===s?'selected':''}>${s}</option>`).join('')}</select></div>
    </div>
    <div class="field-row">
      <div class="field"><label>Categoria</label><input name="categoria" value="${esc(b.categoria)}" placeholder="Jeanswear, Alfaiataria..."></div>
      <div class="field"><label>Segmento</label><input name="segmento" value="${esc(b.segmento)}"></div>
    </div>
    <div class="field-row">
      <div class="field"><label>Cidade</label><input name="cidade" value="${esc(b.cidade)}"></div>
      <div class="field"><label>Estado</label><input name="estado" value="${esc(b.estado)}"></div>
    </div>
    <div class="field-row">
      <div class="field"><label>Instagram</label><input name="instagram" value="${esc(b.instagram)}"></div>
      <div class="field"><label>Site</label><input name="site" value="${esc(b.site)}"></div>
    </div>
    <div class="field-row">
      <div class="field"><label>Contato</label><input name="contato" value="${esc(b.contato)}"></div>
      <div class="field"><label>Representante</label><input name="representante" value="${esc(b.representante)}"></div>
    </div>
    <div class="field-row">
      <div class="field"><label>Preço</label><input name="preco" value="${esc(b.preco)}" placeholder="Faixa de preço"></div>
      <div class="field"><label>Público</label><input name="publico" value="${esc(b.publico)}"></div>
    </div>
    <div class="field"><label>Posicionamento</label><input name="posicionamento" value="${esc(b.posicionamento)}"></div>
    <div class="field-row">
      <div class="field"><label>Estilo</label><input name="estilo" value="${esc(b.estilo)}"></div>
      <div class="field"><label>Principais tecidos</label><input name="tecidos" value="${esc(b.tecidos)}"></div>
    </div>
    <div class="field-row">
      <div class="field"><label>Modelagens</label><input name="modelagens" value="${esc(b.modelagens)}"></div>
      <div class="field"><label>Cartela de cores</label><input name="cores" value="${esc(b.cores)}"></div>
    </div>
    <div class="field"><label>Diferenciais</label><textarea name="diferenciais">${esc(b.diferenciais)}</textarea></div>
    <div class="field"><label>Tags (separadas por vírgula)</label><input name="tags" value="${esc(b.tags)}"></div>
    <div class="field"><label>Observações</label><textarea name="observacoes">${esc(b.observacoes)}</textarea></div>
    <div class="modal-actions">
      <div>${b0?`<button type="button" class="btn danger small" id="delBrandBtn">Excluir</button>`:''}</div>
      <button type="submit" class="btn small">Salvar</button>
    </div>
  </form>`;
}
function openBrandModal(b0){
  openModal(brandForm(b0));
  document.getElementById('brandForm').addEventListener('submit', async e=>{
    e.preventDefault();
    const obj = Object.fromEntries(new FormData(e.target).entries());
    if(b0){ Object.assign(b0, obj); } else { DB.brands.push({id:uid(), createdAt:new Date().toISOString(), analise:{}, ...obj}); }
    await save('brands'); closeModal(); closeDrawer(); render(); toast('Marca salva');
  });
  if(b0){
    document.getElementById('delBrandBtn').addEventListener('click', async ()=>{
      DB.brands = DB.brands.filter(x=>x.id!==b0.id); await save('brands'); closeModal(); closeDrawer(); render(); toast('Marca excluída');
    });
  }
}
function openBrandDetail(id){
  const b = DB.brands.find(x=>x.id===id); if(!b) return;
  const idx = DB.brands.indexOf(b);
  const a = b.analise || {};
  openDrawer(`
    <button class="drawer-close" onclick="closeDrawer()">✕</button>
    <div class="archive-no">MARCA ${archiveNo(DB.brands, idx)}</div>
    <h2>${esc(b.nome)}</h2>
    <div class="tag-row"><span class="tag status-${esc(b.status)}">${esc(b.status)}</span>${(b.tags||'').split(',').filter(Boolean).map(t=>`<span class="tag">${esc(t.trim())}</span>`).join('')}</div>
    <div style="display:flex;gap:8px;margin-top:16px;">
      <button class="btn small" id="editBrandBtn">Editar cadastro</button>
      <button class="btn secondary small" id="editAnaliseBtn">Ficha de análise</button>
    </div>

    <div class="dblock"><div class="dlabel">Perfil</div>
      <div class="dgrid">
        <div><div class="dlabel">Categoria</div><div class="dval">${esc(b.categoria)||'—'}</div></div>
        <div><div class="dlabel">Cidade/UF</div><div class="dval">${esc(b.cidade)||'—'}${b.estado?'/'+esc(b.estado):''}</div></div>
        <div><div class="dlabel">Posicionamento</div><div class="dval">${esc(b.posicionamento)||'—'}</div></div>
        <div><div class="dlabel">Preço</div><div class="dval">${esc(b.preco)||'—'}</div></div>
        <div><div class="dlabel">Estilo</div><div class="dval">${esc(b.estilo)||'—'}</div></div>
        <div><div class="dlabel">Tecidos</div><div class="dval">${esc(b.tecidos)||'—'}</div></div>
      </div>
    </div>
    <div class="dblock"><div class="dlabel">Contato</div>
      <div class="dval">${esc(b.instagram)||'—'} ${b.site?'· '+esc(b.site):''}<br>${esc(b.contato)||''} ${b.representante?'· '+esc(b.representante):''}</div>
    </div>
    <div class="dblock"><div class="dlabel">Diferenciais</div><div class="dval">${esc(b.diferenciais)||'—'}</div></div>
    <div class="dblock"><div class="dlabel">Observações</div><div class="dval">${esc(b.observacoes)||'—'}</div></div>

    <div class="dblock" style="border-top:2px solid var(--clay);">
      <div class="dlabel" style="color:var(--clay);">Ficha de análise</div>
      <div class="dgrid" style="margin-top:10px;">
        <div><div class="dlabel">DNA / Propósito</div><div class="dval">${esc(a.dna)||'—'}</div></div>
        <div><div class="dlabel">Identidade visual</div><div class="dval">${esc(a.identidadeVisual)||'—'}</div></div>
        <div><div class="dlabel">Qualidade / Acabamento</div><div class="dval">${esc(a.qualidade)||'—'}</div></div>
        <div><div class="dlabel">Mix de produtos</div><div class="dval">${esc(a.mixProdutos)||'—'}</div></div>
        <div><div class="dlabel">Concorrentes</div><div class="dval">${esc(a.concorrentes)||'—'}</div></div>
        <div><div class="dlabel">Avaliação geral</div><div class="dval">${esc(a.avaliacao)||'—'}</div></div>
      </div>
      <div style="margin-top:12px;"><div class="dlabel">Insights e oportunidades</div><div class="dval">${esc(a.insights)||'—'}</div></div>
      <div style="margin-top:12px;"><div class="dlabel">Notas pessoais</div><div class="dval">${esc(a.notas)||'—'}</div></div>
      <div style="margin-top:8px;font-size:11.5px;color:#9a9280;">Última análise: ${a.dataAnalise?fmtDate(a.dataAnalise):'ainda não registrada'}</div>
    </div>

    <div class="dblock" style="border-top:2px solid var(--olive);">
      <div class="dlabel" style="color:var(--olive);">Tendências vinculadas a esta marca</div>
      <div class="tag-row">${trendsForBrand(b.id).length?trendsForBrand(b.id).map(t=>relTag(t,'tendencias')).join(''):'<span class="rel-empty">Nenhuma tendência vinculada ainda.</span>'}</div>
    </div>
    <div class="dblock">
      <div class="dlabel">Coleções desta marca</div>
      <div class="tag-row">${collectionsForBrand(b.id).length?collectionsForBrand(b.id).map(c=>relTag(c,'colecoes')).join(''):'<span class="rel-empty">Nenhuma coleção vinculada ainda.</span>'}</div>
    </div>
    <div class="dblock">
      <div class="dlabel">Conteúdos sobre esta marca</div>
      <div class="tag-row">${contentForBrand(b.id).length?contentForBrand(b.id).map(c=>relTag(c,'editorial')).join(''):'<span class="rel-empty">Nenhum conteúdo vinculado ainda.</span>'}</div>
    </div>
    <div class="dblock">
      <div class="dlabel">Referências na biblioteca</div>
      <div class="tag-row">${libraryForBrand(b.id).length?libraryForBrand(b.id).map(l=>relTag(l,'biblioteca')).join(''):'<span class="rel-empty">Nenhuma referência vinculada ainda.</span>'}</div>
    </div>
  `);
  document.getElementById('editBrandBtn').addEventListener('click', ()=>openBrandModal(b));
  document.getElementById('editAnaliseBtn').addEventListener('click', ()=>openAnaliseModal(b));
  attachGotoLinks();
}
function openAnaliseModal(b){
  const a = b.analise || {};
  openModal(`
    <div class="modal-head"><h3>Ficha de análise — ${esc(b.nome)}</h3><button class="modal-close" onclick="closeModal()">✕</button></div>
    <form id="analiseForm">
      <div class="field"><label>DNA / Propósito / História</label><textarea name="dna">${esc(a.dna)}</textarea></div>
      <div class="field"><label>Identidade visual</label><textarea name="identidadeVisual">${esc(a.identidadeVisual)}</textarea></div>
      <div class="field"><label>Qualidade e acabamento</label><textarea name="qualidade">${esc(a.qualidade)}</textarea></div>
      <div class="field"><label>Mix de produtos (jeans, malharia, linho, alfaiataria...)</label><textarea name="mixProdutos">${esc(a.mixProdutos)}</textarea></div>
      <div class="field"><label>Concorrentes diretos</label><input name="concorrentes" value="${esc(a.concorrentes)}"></div>
      <div class="field"><label>Insights e oportunidades</label><textarea name="insights">${esc(a.insights)}</textarea></div>
      <div class="field"><label>Avaliação geral</label><input name="avaliacao" value="${esc(a.avaliacao)}"></div>
      <div class="field"><label>Notas pessoais</label><textarea name="notas">${esc(a.notas)}</textarea></div>
      <div class="field"><label>Data da análise</label><input type="date" name="dataAnalise" value="${a.dataAnalise||new Date().toISOString().slice(0,10)}"></div>
      <div class="modal-actions"><div></div><button type="submit" class="btn small">Salvar ficha</button></div>
    </form>
  `);
  document.getElementById('analiseForm').addEventListener('submit', async e=>{
    e.preventDefault();
    const obj = Object.fromEntries(new FormData(e.target).entries());
    b.analise = obj;
    await save('brands'); closeModal(); openBrandDetail(b.id); toast('Ficha de análise salva');
  });
}
