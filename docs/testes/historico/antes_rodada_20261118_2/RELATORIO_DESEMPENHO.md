# Relatório de desempenho — mensagens

Data do ensaio: 2026-11-18T05:50:09.664Z (UTC; America/Sao_Paulo = UTC−03:00).

| Métrica | Resultado |
|---|---:|
| Enviadas | 100 |
| Recebidas | 100 |
| Falhas | 0 |
| Mínima | 6.026 ms |
| Máxima | 16.132 ms |
| Média | 9.052 ms |
| Mediana | 8.699 ms |
| P95 | 12.003 ms |

## Método reproduzível

CT058 em scripts/api.cjs. Dois usuários fictícios autenticados via HTTP. Cliente Socket.IO do destinatário conectado à sala. Para cada uma de 100 mensagens sequenciais, o cronômetro monotônico performance.now() inicia imediatamente antes do POST /api/messages e termina quando o evento new_message correspondente ao conteúdo é recebido pelo cliente. Correlação por identificador da rodada e índice. Timeout por entrega: 5000 ms. Nenhuma amostra foi removida como aquecimento; todos os valores individuais constam no JSON/CSV. Falha = ausência do evento no prazo ou HTTP diferente de 201.

O intervalo inclui requisição HTTP, persistência PostgreSQL e emissão/recepção Socket.IO. Não é apenas latência de rede nem medida de ida e volta entre máquinas. O benchmark não mede tempo de renderização do React.

Mediana = média das posições centrais das 100 amostras ordenadas. P95 = método nearest-rank, posição ceil(0,95 × n). Foram reportadas 3 casas decimais, sem inferir precisão física equivalente.

## Ambiente

- Node v24.19.0; win32 10.0.26200, x64.
- CPU: Intel(R) Core(TM) i5-10400F CPU @ 2.90GHz; 12 processadores lógicos; RAM total 15.9 GiB.
- PostgreSQL: PostgreSQL 16.16 on x86_64-pc-linux-musl, compiled by gcc (Alpine 15.2.0) 15.2.0, 64-bit.
- Backend na porta 4333 e banco campusfacil_audit_20261118054512; conexão loopback local.
- Backend Fastify real, Prisma real, PostgreSQL real e Socket.IO real; sem mocks.

## Limitações

Uma rodada serial com um par de usuários. Não representa produção, rede móvel, WAN, usuários concorrentes, capacidade máxima, throughput, estabilidade sob carga ou SLA. Outros processos do computador podem afetar os tempos; a máquina não foi dedicada ao benchmark. Vulnerabilidades de autorização do Socket.IO permanecem mesmo com entrega rápida.

Dados: [amostras JSON](evidencias/desempenho-amostras.json), [amostras CSV](evidencias/desempenho-amostras.csv).
