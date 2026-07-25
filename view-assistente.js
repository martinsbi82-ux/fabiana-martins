/* ================================================================
   ASSISTENTE — painel de insights gerado localmente a partir dos seus
   dados (sem chamadas externas, funciona 100% offline no navegador)
   ================================================================ */
let insightHistory = [];

const INSIGHT_ACTIONS = [
  {label:'Marcas pendentes de decisão', fn:()=>{
    const list = DB.brands.filter(b=>b.status==='Em avaliação'||b.status==='Pesquisando');
    if(!list.length) return 'Nenhuma marca em "Pesquisando" ou "Em avaliação" no momento — o funil de análise está em dia.';
    const linhas = list.map(b=>{
      const t = trendsForBrand(b.id).length, c = collectionsForBrand(b.id).length;
      return `• ${b.nome} (${b.status}) — ${t} tendência(s) e ${c} coleção(ões) vinculadas${b.diferenciais?`. Diferencial: ${b.diferenciais}`:''}`;
    });
    return `${list.length} marca(s) aguardando decisão:\n\n${linhas.join('\n')}`;
  }},
  {label:'Prioridades da semana', fn:()=>{
    const pend = DB.tasks.filter(t=>!t.concluida).sort((a,b)=>{
      const ordem = {Alta:0,Média:1,Baixa:2};
      return (ordem[a.prioridade]??1) - (ordem[b.prioridade]??1) || (a.prazo||'').localeCompare(b.prazo||'');
    });
    if(!pend.length) return 'Nenhuma tarefa pendente — agenda limpa.';
    const linhas = pend.slice(0,8).map(t=>`• [${t.prioridade}] ${t.titulo} — ${t.categoria}, prazo ${fmtDate(t.prazo)}`);
    return `Ordem sugerida (por prioridade e prazo):\n\n${linhas.join('\n')}`;
  }},
  {label:'Marcas em múltiplas tendências', fn:()=>{
    const contagem = {};
    DB.trends.forEach(t=>(t.relatedBrands||[]).forEach(bid=>{ contagem[bid]=(contagem[bid]||0)+1; }));
    const destaques = Object.entries(contagem).filter(([,n])=>n>1).sort((a,b)=>b[1]-a[1]);
    if(!destaques.length) return 'Ainda não há marcas repetidas em mais de uma tendência. Vincule marcas às tendências na ficha de cada uma para começar a ver esse cruzamento.';
    const linhas = destaques.map(([bid,n])=>{
      const b = DB.brands.find(x=>x.id===bid);
      return `• ${b?b.nome:'(marca removida)'} aparece em ${n} tendências — candidata forte a ganhar destaque editorial.`;
    });
    return `Marcas que se repetem em várias tendências registradas:\n\n${linhas.join('\n')}`;
  }},
  {label:'Lacunas de conteúdo', fn:()=>{
    const semConteudo = DB.trends.filter(t=>contentForTrend(t.id).length===0);
    const marcasSemConteudo = DB.brands.filter(b=>contentForBrand(b.id).length===0 && (b.status==='Acompanhando'||b.status==='Aprovada'));
    let out = '';
    out += semConteudo.length ? `Tendências ainda sem nenhum conteúdo planejado:\n${semConteudo.map(t=>`• ${t.nome}`).join('\n')}\n\n` : 'Todas as tendências registradas já têm ao menos um conteúdo vinculado.\n\n';
    out += marcasSemConteudo.length ? `Marcas acompanhadas/aprovadas sem conteúdo ainda:\n${marcasSemConteudo.map(b=>`• ${b.nome}`).join('\n')}` : 'Todas as marcas acompanhadas ou aprovadas já geraram conteúdo.';
    return out;
  }},
  {label:'Panorama do portfólio de marcas', fn:()=>{
    if(!DB.brands.length) return 'Nenhuma marca cadastrada ainda.';
    const porCategoria = {};
    DB.brands.forEach(b=>{ const c=b.categoria||'Sem categoria'; porCategoria[c]=(porCategoria[c]||0)+1; });
    const linhas = Object.entries(porCategoria).sort((a,b)=>b[1]-a[1]).map(([c,n])=>`• ${c}: ${n} marca(s)`);
    return `Distribuição atual do portfólio por categoria:\n\n${linhas.join('\n')}\n\nUse isso para identificar excesso de concentração numa categoria ou espaços em branco a explorar.`;
  }},
];

function viewAssistente(){
  return `
  <div class="section-head"><div><h2>Assistente</h2><div class="section-sub">Insights gerados localmente a partir dos seus dados — sem servidor, sem internet</div></div></div>
  <div class="ai-quick" id="aiQuick">
    ${INSIGHT_ACTIONS.map((a,i)=>`<button data-i="${i}">${a.label}</button>`).join('')}
  </div>
  <div class="chat-box" id="chatBox">
    ${insightHistory.length ? insightHistory.map(m=>`<div class="chat-msg ${m.role}"><div class="who">${m.role==='user'?'Você pediu':'Assistente'}</div><div class="txt">${esc(m.text)}</div></div>`).join('')
      : `<div class="empty-state"><span class="ic">✦</span>Escolha uma das análises acima. Elas leem diretamente o Banco de Marcas, Tendências, Agenda e Editorial.</div>`}
  </div>
  <div style="font-size:11px;color:#9a9280;margin-top:10px;">Este painel não usa inteligência artificial externa — as respostas são geradas por regras que leem seus próprios dados, para funcionar mesmo sem conexão.</div>
  `;
}
function attachAssistenteEvents(){
  document.getElementById('aiQuick').querySelectorAll('button').forEach(btn=>{
    btn.addEventListener('click', ()=> runInsight(INSIGHT_ACTIONS[btn.dataset.i]));
  });
}
function runInsight(action){
  insightHistory.push({role:'user', text:action.label});
  insightHistory.push({role:'assistant', text:action.fn()});
  if(insightHistory.length > 20) insightHistory = insightHistory.slice(-20);
  render();
  const box = document.getElementById('chatBox');
  if(box) box.scrollTop = box.scrollHeight;
}
