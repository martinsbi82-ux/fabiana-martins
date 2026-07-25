/* ================================================================
   CONCORRENTES (tabela comparativa derivada do Banco de Marcas)
   ================================================================ */
function viewConcorrentes(){
  if(!DB.brands.length) return `<div class="empty-state"><span class="ic">⇄</span>Cadastre marcas no Banco de Marcas para compará-las aqui.</div>`;
  return `
  <div class="section-head"><div><h2>Concorrentes</h2><div class="section-sub">Comparativo entre as marcas cadastradas</div></div></div>
  <div class="table-wrap"><table>
    <thead><tr><th>Marca</th><th>Preço</th><th>Posicionamento</th><th>Estilo</th><th>Tecidos</th><th>Modelagens</th><th>Instagram</th><th>Diferenciais</th></tr></thead>
    <tbody>
      ${DB.brands.map(b=>`<tr>
        <td><strong>${esc(b.nome)}</strong></td>
        <td>${esc(b.preco)||'—'}</td>
        <td>${esc(b.posicionamento)||'—'}</td>
        <td>${esc(b.estilo)||'—'}</td>
        <td>${esc(b.tecidos)||'—'}</td>
        <td>${esc(b.modelagens)||'—'}</td>
        <td>${esc(b.instagram)||'—'}</td>
        <td>${esc(b.diferenciais)||'—'}</td>
      </tr>`).join('')}
    </tbody>
  </table></div>`;
}
