# Desempenho do chat — nova medição

Instante da rodada: 2026-11-18T16:19:22.007Z (UTC). Fuso do relatório: America/Sao_Paulo (UTC−03:00).

| Métrica | Resultado |
|---|---:|
| Mensagens enviadas | 100 |
| Mensagens recebidas | 100 |
| Falhas | 0 |
| Mínima | 7.784 ms |
| Máxima | 14.677 ms |
| Média | 10.341 ms |
| Mediana | 10.090 ms |
| P95 | 12.560 ms |

## Método

CT058 em rodada_20261118_2/scripts/api.cjs: 100 mensagens sequenciais enviadas por HTTP autenticado; recebimento real no cliente Socket.IO de outro usuário. Cronômetro performance.now() no mesmo processo, do início do POST à chegada do evento correlacionado por conteúdo único (lote+índice). Timeout de entrega: 5000 ms. A medição inclui HTTP, gravação PostgreSQL e evento Socket.IO; não é apenas rede, não mede renderização da interface e não sincroniza relógios de máquinas diferentes. Nenhuma amostra foi descartada como aquecimento.

Falha = evento ausente no prazo ou HTTP diferente de 201. Mediana = média das duas posições centrais para n=100. P95 = nearest-rank, posição ceil(0,95×n) nas amostras ordenadas. Aprovação do caso significa entrega das 100 mensagens e registro das métricas; não foi definido um SLA de latência.

## Ambiente real

- win32 10.0.26200, x64; Node v24.19.0.
- CPU Intel(R) Core(TM) i5-10400F CPU @ 2.90GHz, 12 processadores lógicos; RAM total 15.9 GiB.
- PostgreSQL 16.16 on x86_64-pc-linux-musl, compiled by gcc (Alpine 15.2.0) 15.2.0, 64-bit.
- Backend/API em 127.0.0.1:4433; Socket.IO real; banco campusfacil_audit_20261118161837. Loopback na mesma máquina.
- Versões: fastify 5.6.1; @prisma/client 7.6.0; bcryptjs 3.0.2; socket.io 4.8.1; pg 8.20.0; zod 4.1.11.

## Limitações

Uma rodada, um par de usuários e envio serial. Não mede concorrência, throughput máximo, WAN, rede móvel, estabilidade prolongada, hardware dedicado ou capacidade de produção. Outros processos do computador podem alterar o tempo. Não converter estes números locais em garantia de desempenho externo.

Amostras verificáveis: [JSON](evidencias/rodada_20261118_2/desempenho-amostras.json), [CSV](evidencias/rodada_20261118_2/desempenho-amostras.csv). Nenhuma medição foi reaproveitada da avaliação anterior.
