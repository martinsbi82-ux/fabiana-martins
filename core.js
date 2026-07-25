/* ============================================================
   CADERNO — Centro de Inteligência da Curadoria de Moda Brasileira
   Vanilla JS, persistência via localStorage (funciona 100% no navegador,
   sem servidor e sem dependências externas)
   ============================================================ */

const KEYS = {
  tasks:'caderno:tasks', editorial:'caderno:editorial', brands:'caderno:brands',
  trends:'caderno:trends', library:'caderno:library', moodboards:'caderno:moodboards',
  collections:'caderno:collections', market:'caderno:market', goals:'caderno:goals'
};

let DB = { tasks:[], editorial:[], brands:[], trends:[], library:[], moodboards:[], collections:[], market:[], goals:[] };
let currentView = 'dashboard';
let searchTerm = '';

/* ---------------- storage helpers (localStorage, síncrono) ---------------- */
async function loadAll(){
  for(const k of Object.keys(KEYS)){
    try{
      const raw = localStorage.getItem(KEYS[k]);
      DB[k] = raw ? JSON.parse(raw) : [];
    }catch(e){ DB[k] = []; }
  }
}
async function save(key){
  try{
    localStorage.setItem(KEYS[key], JSON.stringify(DB[key]));
  }catch(e){
    console.error('storage error', e);
    if(e && e.name === 'QuotaExceededError'){
      toast('Armazenamento cheio — remova imagens grandes dos moodboards ou exporte e limpe dados antigos');
    } else {
      toast('Não foi possível salvar os dados neste navegador');
    }
  }
}
function uid(){ return Date.now().toString(36)+Math.random().toString(36).slice(2,7); }
function archiveNo(list, idx){ return String(idx+1).padStart(3,'0'); }
function fmtDate(d){
  if(!d) return '—';
  try{ const dt=new Date(d+'T00:00:00'); return dt.toLocaleDateString('pt-BR',{day:'2-digit',month:'short',year:'numeric'}); }
  catch(e){ return d; }
}
function toast(msg){
  const t=document.getElementById('toast');
  t.textContent=msg; t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),2200);
}
function esc(s){ return (s||'').toString().replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

/* ---------------- relational helpers (marca ↔ tendência ↔ conteúdo ↔ coleção ↔ biblioteca) ---------------- */
function relLabel(item){ return item.nome || item.titulo || item.tema || item.marca || '(sem nome)'; }
function multiCheckList(name, items, selectedIds){
  selectedIds = selectedIds || [];
  if(!items.length) return `<div class="meta" style="padding:6px 0;">Nada cadastrado ainda.</div>`;
  return `<div class="rel-check-list">${items.map(it=>`
    <label class="rel-check"><input type="checkbox" name="${name}" value="${it.id}" ${selectedIds.includes(it.id)?'checked':''}> ${esc(relLabel(it))}</label>
  `).join('')}</div>`;
}
function singleSelect(name, items, selectedId){
  return `<select name="${name}"><option value="">— nenhum —</option>${items.map(it=>`<option value="${it.id}" ${selectedId===it.id?'selected':''}>${esc(relLabel(it))}</option>`).join('')}</select>`;
}
function relTag(item, view, extra){
  return `<span class="tag rel-tag" data-goto="${view}" data-goto-id="${item.id}">${esc(relLabel(item))}${extra?' · '+esc(extra):''}</span>`;
}
function attachGotoLinks(root){
  (root||document).querySelectorAll('[data-goto]').forEach(el=>{
    el.addEventListener('click', (ev)=>{
      ev.stopPropagation();
      const view = el.dataset.goto, id = el.dataset.gotoId;
      if(view==='marcas') openBrandDetail(id);
      if(view==='tendencias') openTrendDetail(id);
      if(view==='colecoes') openColDetail(id);
      if(view==='biblioteca'){ const l=DB.library.find(x=>x.id===id); if(l) openLibModal(l); }
      if(view==='editorial'){ setView('editorial'); }
    });
  });
}
/* backlinks: which records elsewhere point to this brand/trend/collection id */
function trendsForBrand(brandId){ return DB.trends.filter(t=>(t.relatedBrands||[]).includes(brandId)); }
function collectionsForBrand(brandId){ return DB.collections.filter(c=>(c.relatedBrands||[]).includes(brandId)); }
function contentForBrand(brandId){ return DB.editorial.filter(e=>e.relatedBrand===brandId); }
function libraryForBrand(brandId){ return DB.library.filter(l=>(l.relatedBrands||[]).includes(brandId)); }
function brandsForTrend(trendId){ return DB.brands.filter(b=>trendsForBrand(b.id).some(t=>t.id===trendId)); }
function contentForTrend(trendId){ return DB.editorial.filter(e=>e.relatedTrend===trendId); }
function libraryForTrend(trendId){ return DB.library.filter(l=>(l.relatedTrends||[]).includes(trendId)); }
function contentForCollection(colId){ return DB.editorial.filter(e=>e.relatedCollection===colId); }
function brandsForCollection(colId){ const c=DB.collections.find(x=>x.id===colId); return c ? DB.brands.filter(b=>(c.relatedBrands||[]).includes(b.id)) : []; }

/* ---------------- nav config ---------------- */
const NAV = [
  {group:'Visão geral', items:[
    {id:'dashboard', label:'Dashboard', ic:'◆'},
    {id:'assistente', label:'Assistente', ic:'✦'},
  ]},
  {group:'Planejamento', items:[
    {id:'agenda', label:'Agenda', ic:'▤'},
    {id:'editorial', label:'Planejamento Editorial', ic:'▥'},
    {id:'objetivos', label:'Objetivos', ic:'◎'},
  ]},
  {group:'Curadoria', items:[
    {id:'marcas', label:'Banco de Marcas', ic:'▣'},
    {id:'tendencias', label:'Tendências', ic:'✺'},
    {id:'colecoes', label:'Coleções', ic:'▦'},
    {id:'concorrentes', label:'Concorrentes', ic:'⇄'},
    {id:'pesquisa', label:'Pesquisa de Mercado', ic:'⚲'},
  ]},
  {group:'Conhecimento', items:[
    {id:'biblioteca', label:'Biblioteca', ic:'▧'},
    {id:'moodboards', label:'Moodboards', ic:'▨'},
    {id:'relatorios', label:'Relatórios', ic:'▩'},
  ]},
];

function renderNav(){
  const nav = document.getElementById('navList');
  nav.innerHTML = NAV.map(g=>`
    <div class="nav-group-label">${g.group}</div>
    ${g.items.map(it=>`<div class="nav-item ${currentView===it.id?'active':''}" data-view="${it.id}">
      <span class="ic">${it.ic}</span><span>${it.label}</span>
    </div>`).join('')}
  `).join('');
  nav.querySelectorAll('.nav-item').forEach(el=>{
    el.addEventListener('click', ()=>{ setView(el.dataset.view); });
  });
}

function setView(v){
  currentView = v;
  searchTerm='';
  document.getElementById('globalSearch').value='';
  renderNav();
  const titles = {};
  NAV.forEach(g=>g.items.forEach(it=>titles[it.id]=it.label));
  document.getElementById('viewTitle').textContent = titles[v] || v;
  document.getElementById('sidebar').classList.remove('open');
  render();
}

/* ---------------- modal / drawer helpers ---------------- */
function openModal(html){
  document.getElementById('modalBody').innerHTML = html;
  document.getElementById('modalOverlay').classList.add('open');
}
function closeModal(){ document.getElementById('modalOverlay').classList.remove('open'); }
function openDrawer(html){
  document.getElementById('drawerBody').innerHTML = html;
  document.getElementById('drawerOverlay').classList.add('open');
}
function closeDrawer(){ document.getElementById('drawerOverlay').classList.remove('open'); }

document.getElementById('modalOverlay').addEventListener('click', e=>{ if(e.target.id==='modalOverlay') closeModal(); });
document.getElementById('drawerOverlay').addEventListener('click', e=>{ if(e.target.id==='drawerOverlay') closeDrawer(); });
document.getElementById('menuToggle').addEventListener('click', ()=> document.getElementById('sidebar').classList.toggle('open'));

document.getElementById('globalSearch').addEventListener('input', e=>{
  searchTerm = e.target.value.trim().toLowerCase();
  if(searchTerm && currentView!=='busca'){ currentView='busca'; renderNav(); document.getElementById('viewTitle').textContent='Busca'; }
  if(!searchTerm && currentView==='busca'){ setView('dashboard'); return; }
  render();
});

document.getElementById('exportBtn').addEventListener('click', ()=>{
  const blob = new Blob([JSON.stringify(DB,null,2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'caderno-curadoria-export.json';
  a.click();
  toast('Dados exportados');
});

/* ---------------- master render ---------------- */
function render(){
  const c = document.getElementById('content');
  if(searchTerm){ c.innerHTML = viewBusca(); attachBuscaEvents(); return; }
  switch(currentView){
    case 'dashboard': c.innerHTML = viewDashboard(); attachDashboardEvents(); break;
    case 'assistente': c.innerHTML = viewAssistente(); attachAssistenteEvents(); break;
    case 'agenda': c.innerHTML = viewAgenda(); attachAgendaEvents(); break;
    case 'editorial': c.innerHTML = viewEditorial(); attachEditorialEvents(); break;
    case 'objetivos': c.innerHTML = viewObjetivos(); attachObjetivosEvents(); break;
    case 'marcas': c.innerHTML = viewMarcas(); attachMarcasEvents(); break;
    case 'tendencias': c.innerHTML = viewTendencias(); attachTendenciasEvents(); break;
    case 'colecoes': c.innerHTML = viewColecoes(); attachColecoesEvents(); break;
    case 'concorrentes': c.innerHTML = viewConcorrentes(); break;
    case 'pesquisa': c.innerHTML = viewPesquisa(); attachPesquisaEvents(); break;
    case 'biblioteca': c.innerHTML = viewBiblioteca(); attachBibliotecaEvents(); break;
    case 'moodboards': c.innerHTML = viewMoodboards(); attachMoodboardsEvents(); break;
    case 'relatorios': c.innerHTML = viewRelatorios(); break;
    default: c.innerHTML = '<div class="empty-state">Módulo em construção.</div>';
  }
}
