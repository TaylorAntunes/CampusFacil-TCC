# Relatório de responsividade

64 casos executados: oito páginas × quatro resoluções × dois temas. 64 aprovados no critério medido; 0 reprovados.

## Configuração

Chromium 159.0.8154.6, Playwright 1.65.1, headless. Viewports em CSS pixels: 360×800, 390×844, 768×1024 e 1920×1080. Não foi emulado hardware físico, densidade de pixels de celular, teclado virtual ou browser móvel nativo. Temas light e dark.

Páginas: landing pública, cadastro, login, explorar, perfil público do prestador, chat, painel e solicitações. Apenas chat/painel/solicitações recebem sessão fictícia pré-carregada para a matriz; o login real foi validado separadamente em CT077. Os oito casos da landing foram repetidos sem token para evitar confundir a raiz autenticada (painel) com a página inicial pública.

## Critérios executados

- Página real carregada contra backend e banco de teste.
- Conteúdo principal presente; tema aplicado; ausência de redirecionamento indevido.
- Largura do documento/body não excede viewport em mais de 2 px.
- Captura PNG real da página completa; oito capturas adicionais do chatbot em quatro tamanhos e dois temas.
- Erros JavaScript detectados na execução da matriz original foram verificados.

Recursos externos (Google Fonts, avatares e imagens remotas) foram bloqueados para manter o ensaio local e controlado. Ícones/imagens remotos podem aparecer ausentes; isso é limitação do ambiente de teste, não falha automaticamente atribuída ao aplicativo. Não foram usados mocks das APIs locais.

## Resultado e limites

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

## Inspeção visual

Foram abertas para inspeção as capturas móveis do chat, painel, chatbot e landing. A captura completa pode ser muito longa; abrir o PNG em escala original para leitura. A inspeção não equivale a certificação de acessibilidade, contraste WCAG, usabilidade ou teste de todos os controles em cada resolução. O critério automatizado de largura também não detecta todas as sobreposições internas.

A matriz passa em geometria, mas permanecem falhas funcionais/de segurança do backend e dados deliberadamente inválidos criados para testá-las, como preço negativo e auto-solicitação. Esses registros aparecem em algumas capturas e não representam uso real.

Exemplos reais:

![Landing pública 360 claro](evidencias/capturas/CT92-inicio-publico-360-light.png)

![Chat móvel 360 claro](evidencias/capturas/CT097-chat-360-light.png)

Reprodução: scripts/ui.cjs e scripts/retest-landing.cjs. Todas as capturas estão em evidencias/capturas.
