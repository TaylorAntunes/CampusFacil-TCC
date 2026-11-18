# Responsividade — rodada atual

64 casos: oito páginas × quatro tamanhos × dois temas. A matriz foi executada com Chromium 159.0.8154.6 e Playwright 1.65.1, headless, contra frontend/backend/banco reais.

Viewports: 360×800, 390×844, 768×1024 e 1920×1080, em CSS pixels. Páginas: inicial pública, cadastro, login, explorar, perfil do prestador, chat, painel e solicitações. Temas light/dark. A landing foi aberta sem sessão; apenas chat/painel/solicitações receberam sessão fictícia pré-carregada para a matriz. O login real foi validado separadamente.

## Critérios efetivamente executados

- Rota carrega sem redirecionamento indevido nem erro JavaScript capturado.
- Elemento principal tem largura/altura positivas, display diferente de none e visibility diferente de hidden.
- Largura do documento/body não ultrapassa viewport em mais de 2 px.
- Tema esperado aplicado à raiz.
- PNG real de cada página e imagens adicionais do chatbot nos quatro tamanhos/temas.

A matriz foi executada uma vez pelo script ui.cjs, com os critérios explícitos de renderização acima. O arquivo responsividade-resultados.json é apenas o recorte dos mesmos 64 resultados CT092–CT155; não representa uma segunda execução.

| ID | Cenário | Resultado |
|---|---|---|
| CT092 | inicio 360x800 light | aprovado |
| CT093 | cadastro 360x800 light | aprovado |
| CT094 | login 360x800 light | aprovado |
| CT095 | explorar 360x800 light | aprovado |
| CT096 | prestador 360x800 light | aprovado |
| CT097 | chat 360x800 light | aprovado |
| CT098 | painel 360x800 light | aprovado |
| CT099 | solicitacoes 360x800 light | aprovado |
| CT100 | inicio 360x800 dark | aprovado |
| CT101 | cadastro 360x800 dark | aprovado |
| CT102 | login 360x800 dark | aprovado |
| CT103 | explorar 360x800 dark | aprovado |
| CT104 | prestador 360x800 dark | aprovado |
| CT105 | chat 360x800 dark | aprovado |
| CT106 | painel 360x800 dark | aprovado |
| CT107 | solicitacoes 360x800 dark | aprovado |
| CT108 | inicio 390x844 light | aprovado |
| CT109 | cadastro 390x844 light | aprovado |
| CT110 | login 390x844 light | aprovado |
| CT111 | explorar 390x844 light | aprovado |
| CT112 | prestador 390x844 light | aprovado |
| CT113 | chat 390x844 light | aprovado |
| CT114 | painel 390x844 light | aprovado |
| CT115 | solicitacoes 390x844 light | aprovado |
| CT116 | inicio 390x844 dark | aprovado |
| CT117 | cadastro 390x844 dark | aprovado |
| CT118 | login 390x844 dark | aprovado |
| CT119 | explorar 390x844 dark | aprovado |
| CT120 | prestador 390x844 dark | aprovado |
| CT121 | chat 390x844 dark | aprovado |
| CT122 | painel 390x844 dark | aprovado |
| CT123 | solicitacoes 390x844 dark | aprovado |
| CT124 | inicio 768x1024 light | aprovado |
| CT125 | cadastro 768x1024 light | aprovado |
| CT126 | login 768x1024 light | aprovado |
| CT127 | explorar 768x1024 light | aprovado |
| CT128 | prestador 768x1024 light | aprovado |
| CT129 | chat 768x1024 light | aprovado |
| CT130 | painel 768x1024 light | aprovado |
| CT131 | solicitacoes 768x1024 light | aprovado |
| CT132 | inicio 768x1024 dark | aprovado |
| CT133 | cadastro 768x1024 dark | aprovado |
| CT134 | login 768x1024 dark | aprovado |
| CT135 | explorar 768x1024 dark | aprovado |
| CT136 | prestador 768x1024 dark | aprovado |
| CT137 | chat 768x1024 dark | aprovado |
| CT138 | painel 768x1024 dark | aprovado |
| CT139 | solicitacoes 768x1024 dark | aprovado |
| CT140 | inicio 1920x1080 light | aprovado |
| CT141 | cadastro 1920x1080 light | aprovado |
| CT142 | login 1920x1080 light | aprovado |
| CT143 | explorar 1920x1080 light | aprovado |
| CT144 | prestador 1920x1080 light | aprovado |
| CT145 | chat 1920x1080 light | aprovado |
| CT146 | painel 1920x1080 light | aprovado |
| CT147 | solicitacoes 1920x1080 light | aprovado |
| CT148 | inicio 1920x1080 dark | aprovado |
| CT149 | cadastro 1920x1080 dark | aprovado |
| CT150 | login 1920x1080 dark | aprovado |
| CT151 | explorar 1920x1080 dark | aprovado |
| CT152 | prestador 1920x1080 dark | aprovado |
| CT153 | chat 1920x1080 dark | aprovado |
| CT154 | painel 1920x1080 dark | aprovado |
| CT155 | solicitacoes 1920x1080 dark | aprovado |

## Evidências e limites

Todos os PNGs estão em evidencias/capturas, com ID, página, largura e tema no nome. Capturas completas podem ser longas; abrir na escala original para leitura. Há visualização adicional em tamanho de viewport para facilitar figuras do TCC.

Recursos externos (fontes, imagens e avatares remotos) foram bloqueados para manter o teste local; podem aparecer ausentes/fallback. Não foram mockadas APIs locais. Não foi emulado hardware físico, teclado móvel, Safari ou navegador Android/iOS. Os critérios geométricos não verificam todas as sobreposições, contraste WCAG, navegação por teclado ou usabilidade. Algumas capturas foram abertas para inspeção visual; não se afirma inspeção humana exaustiva de cada pixel.

Reprodução: scripts/ui.cjs, após scripts/api.cjs criar as contas fictícias. Dados e sessão da matriz não pertencem à conta teste do projeto.
