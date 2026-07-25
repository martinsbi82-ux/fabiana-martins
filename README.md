# Caderno — Centro de Inteligência da Curadoria de Moda Brasileira

Aplicação web estática (HTML/CSS/JS puro) para organizar pesquisa, banco de marcas,
tendências, planejamento editorial, biblioteca de referências e agenda estratégica
da curadoria. Funciona como PWA (instalável, funciona offline) e guarda todos os
dados no próprio navegador — não depende de servidor, backend ou conexão para uso
diário.

## Estrutura do projeto

```
├── index.html          → ponto de entrada (obrigatório na raiz para o GitHub Pages)
├── manifest.json        → metadados do PWA (nome, ícone, cores)
├── sw.js                → service worker (cache offline)
├── css/
│   └── styles.css       → todo o visual do sistema
├── js/
│   ├── core.js           → dados, armazenamento (localStorage), navegação, relações
│   ├── view-dashboard.js
│   ├── view-agenda.js
│   ├── view-editorial.js
│   ├── view-marcas.js
│   ├── view-tendencias.js
│   ├── view-colecoes.js
│   ├── view-concorrentes.js
│   ├── view-pesquisa.js
│   ├── view-biblioteca.js
│   ├── view-moodboards.js
│   ├── view-objetivos.js
│   ├── view-relatorios.js
│   ├── view-busca.js
│   ├── view-assistente.js
│   └── main.js            → inicialização
└── icons/
    ├── icon-192.png
    └── icon-512.png
```

Todos os caminhos usados no projeto são **relativos** (`./css/...`, `./js/...`),
então funciona tanto na raiz de um domínio quanto em um subcaminho de projeto do
GitHub Pages (`usuario.github.io/nome-do-repositorio/`).

## Como publicar no GitHub Pages

1. Crie um repositório novo no GitHub (ex.: `caderno-curadoria`).
2. Envie **todo o conteúdo desta pasta** para a raiz do repositório (não dentro de
   uma subpasta) — o `index.html` precisa ficar na raiz.
3. No repositório, vá em **Settings → Pages**.
4. Em "Source", selecione a branch `main` (ou `master`) e a pasta `/ (root)`.
5. Salve. Em alguns minutos o site estará disponível em:
   `https://SEU-USUARIO.github.io/NOME-DO-REPOSITORIO/`

Não é necessário nenhum passo de build, instalação de dependências ou configuração
adicional — é um site estático puro.

## Onde ficam os dados

Tudo é salvo no `localStorage` do navegador que você estiver usando, sob chaves
como `caderno:brands`, `caderno:trends`, etc. Isso significa:

- Os dados **não são compartilhados** automaticamente entre computadores ou
  navegadores diferentes — cada navegador tem seu próprio arquivo.
- Limpar o cache/dados do navegador apaga o conteúdo salvo.
- Use o botão **"Exportar dados"** no topo do sistema regularmente para gerar um
  backup em `.json` — guarde esse arquivo em algum lugar seguro (Google Drive,
  por exemplo).

## Assistente de insights

O painel "Assistente" não faz chamadas para nenhuma IA externa — ele lê os dados
já cadastrados (marcas, tendências, agenda, conteúdo) e gera análises localmente,
por regras. Isso garante que funcione mesmo sem internet, uma vez que a página
tenha carregado.

## Uso como app (PWA)

No celular, ao abrir o link publicado no Chrome, aparece a opção "Adicionar à
tela inicial" — isso instala o Caderno como um app, com ícone próprio, e permite
uso mesmo com internet instável (o service worker guarda os arquivos do sistema
em cache).
