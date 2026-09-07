# Revisão visual do frontend

Comparação feita com os componentes do commit original do repositório (`git show HEAD:src/components/...`). A integração anterior havia substituído Home, Portfolio e LoanDetail por uma lista técnica única.

## Alterações

- Home: resumo destacado, métricas em três cards, chamada para adicionar garantia e card de empréstimo.
- Portfolio e detalhe da ação: linhas com logos, valores, navegação e detalhes do mercado expansíveis.
- LoanDetail: cards próprios para cada empréstimo.
- TransactionForm: seleção visual por ação, valores destacados, atalhos percentuais no depósito, confirmação com ícone e confetti após recibo real.
- Activity: lista compacta com abertura dos detalhes da transação.
- WalletModal: opções visuais usando ChoiceRow e explicação expansível.
- Mantidos os componentes originais de marca, cores, tipografia, cards, botões, navegação e animações. Os contratos e o serviço de transações não foram alterados nesta revisão.

A composição segue os componentes originais, mas não é uma reprodução pixel a pixel. Mercados isolados, pagamento em USDC, autorização do adapter e cotação de venda exigem controles que não existiam no protótipo. Ganhos simulados e confirmações por timer não foram reintroduzidos.

## Verificação executada

- `npm run typecheck`: passou.
- `npm run lint`: sem erros; cinco avisos existentes em Button.tsx.
- `npm run build`: passou.
- `npm test`: cinco testes passaram.
- `npm run test:e2e`: seis testes passaram; quatro ciclos completos no Anvil, rejeição/troca de contexto e layout mobile/desktop.
- `npx playwright test -g 'original portfolio layout'`: passou após ajustar a captura para aguardar o fim das animações.
- `git diff --check`: passou.

Capturas inspecionadas em 390 e 1280 pixels de largura. Sem overflow horizontal no formulário. Os primeiros testes falharam porque ainda procuravam o texto antigo `Add collateral`; o seletor foi atualizado para o texto original `Add Collateral` e a suíte foi executada novamente.

Não foi executada uma comparação automatizada de pixels com o protótipo original. Não houve commit, push ou deploy.
