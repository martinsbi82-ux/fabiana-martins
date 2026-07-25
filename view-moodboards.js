/* ================================================================
   MOODBOARDS
   ================================================================ */
const MOOD_CATS = ['Primavera','Verão','Outono','Inverno','Jeans','Casual','Linho','Minimalismo','Boho','Contemporâneo','Editorial','Lifestyle'];
let currentMoodImages = [];
function viewMoodboards(){
  return `
  <div class="section-head">
    <div><h2>Moodboards</h2><div class="section-sub">Painéis visuais por estação e estilo</div></div>
    <button class="btn" id="newMoodBtn">+ Novo moodboard</button>
  </div>
  <div class="moodboard-grid">
    ${DB.moodboards.length ? DB.moodboards.map(m=>{
      const cover = (m.images && m.images[0]);
      return `<div class="mood-card" data-id="${m.id}">
        <div class="swatch" ${cover?`style="background-image:url('${cover}');background-size:cover;background-position:center;color:transparent;"`:''}>${cover?'':esc(m.categoria)}</div>
        <div class="mc-body"><div class="mc-cat">${esc(m.categoria)}${m.images&&m.images.length?` · ${m.images.length} imagens`:''}</div><h4>${esc(m.titulo)}</h4></div>
      </div>`;
    }).join('') : `<div class="empty-state" style="grid-column:1/-1;"><span class="ic">▨</span>Nenhum moodboard criado ainda.</div>`}
  </div>`;
}
function moodThumbsHtml(){
  return currentMoodImages.map((src,i)=>`
    <div class="mood-thumb"><img src="${src}"><button type="button" class="mood-thumb-del" data-idx="${i}">✕</button></div>
  `).join('');
}
function moodForm(m0){
  const m = m0 || {titulo:'',categoria:'Minimalismo',comentarios:'',links:''};
  currentMoodImages = (m0 && m0.images) ? m0.images.slice() : [];
  return `
  <div class="modal-head"><h3>${m0?'Editar moodboard':'Novo moodboard'}</h3><button class="modal-close" onclick="closeModal()">✕</button></div>
  <form id="moodForm">
    <div class="field"><label>Título</label><input required name="titulo" value="${esc(m.titulo)}"></div>
    <div class="field"><label>Categoria</label><select name="categoria">${MOOD_CATS.map(c=>`<option ${m.categoria===c?'selected':''}>${c}</option>`).join('')}</select></div>
    <div class="field">
      <label>Imagens</label>
      <input type="file" id="moodFileInput" accept="image/*" multiple>
      <div class="mood-thumb-row" id="moodThumbRow">${moodThumbsHtml()}</div>
    </div>
    <div class="field"><label>Links de imagens externas (opcional, um por linha)</label><textarea name="links">${esc(m.links)}</textarea></div>
    <div class="field"><label>Comentários</label><textarea name="comentarios">${esc(m.comentarios)}</textarea></div>
    <div class="modal-actions">
      <div>${m0?`<button type="button" class="btn danger small" id="delMoodBtn">Excluir</button>`:''}</div>
      <button type="submit" class="btn small">Salvar</button>
    </div>
  </form>`;
}
function refreshMoodThumbs(){
  const row = document.getElementById('moodThumbRow');
  if(!row) return;
  row.innerHTML = moodThumbsHtml();
  row.querySelectorAll('.mood-thumb-del').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      currentMoodImages.splice(Number(btn.dataset.idx),1);
      refreshMoodThumbs();
    });
  });
}
function attachMoodboardsEvents(){
  document.getElementById('newMoodBtn').addEventListener('click', ()=>openMoodModal());
  document.querySelectorAll('.mood-card').forEach(el=>el.addEventListener('click',()=>{
    const m = DB.moodboards.find(x=>x.id===el.dataset.id); if(m) openMoodModal(m);
  }));
}
function openMoodModal(m0){
  openModal(moodForm(m0));
  refreshMoodThumbs();
  document.getElementById('moodFileInput').addEventListener('change', async e=>{
    const files = Array.from(e.target.files || []);
    for(const file of files){
      if(file.size > 1_500_000){ toast('Imagem muito grande, escolha uma menor'); continue; }
      const dataUrl = await new Promise((res,rej)=>{
        const r = new FileReader();
        r.onload = ()=>res(r.result);
        r.onerror = rej;
        r.readAsDataURL(file);
      });
      currentMoodImages.push(dataUrl);
    }
    refreshMoodThumbs();
    e.target.value = '';
  });
  document.getElementById('moodForm').addEventListener('submit', async e=>{
    e.preventDefault();
    const obj = Object.fromEntries(new FormData(e.target).entries());
    obj.images = currentMoodImages.slice();
    if(m0){ Object.assign(m0, obj); } else { DB.moodboards.push({id:uid(), ...obj}); }
    try{
      await save('moodboards');
    }catch(err){
      toast('Não deu para salvar — as imagens podem estar pesadas demais');
      return;
    }
    closeModal(); render(); toast('Moodboard salvo');
  });
  if(m0){
    document.getElementById('delMoodBtn').addEventListener('click', async ()=>{
      DB.moodboards = DB.moodboards.filter(x=>x.id!==m0.id); await save('moodboards'); closeModal(); render(); toast('Moodboard excluído');
    });
  }
}
