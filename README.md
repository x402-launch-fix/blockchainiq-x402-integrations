# blockchainiq-x402-agent-tools

A **LangChain tool** and a **Coinbase AgentKit action provider** for the [Blockchain IQ x402 API](https://www.blockchainiq.co/api/x402/v1).
Agents pay per call in USDC on Base with the x402 standard: no account, no API key. Settlement is gasless for the payer (EIP-3009).

| Resource | Price | LangChain tool | AgentKit action |
|---|---|---|---|
| `brief` | $0.01 | `blockchainiq_brief` | `blockchainiq_brief` |
| `event-risk` | $0.05 | `blockchainiq_event_risk` | `blockchainiq_event_risk` |

Each call returns `{ data, settlement }`; `settlement` is the decoded `PAYMENT-RESPONSE` header (payer, network, transaction hash). A spend cap (`maxAmountPerPayment`, default $0.10) refuses anything dearer.

## Run it (one command, fresh wallet)

```bash
npm install
npm run wallet > .env            # prints a new key + address; send ~0.10 USDC on Base to the address
set -a; . ./.env; set +a
npm run langchain                # LangChain tool -> paid call to brief, prints the settlement tx hash
npm run agentkit                 # AgentKit action provider (ViemWalletProvider) -> paid call to brief
```

## LangChain

```js
import { blockchainIqTools } from "./src/langchain.mjs";
const tools = blockchainIqTools({ privateKey: process.env.AGENT_PRIVATE_KEY });
// pass `tools` to createReactAgent / bindTools like any other LangChain tool
```

## Coinbase AgentKit

```js
import { AgentKit, ViemWalletProvider } from "@coinbase/agentkit";
import { blockchainIqActionProvider } from "./src/agentkit.mjs";
const agentkit = await AgentKit.from({ walletProvider, actionProviders: [blockchainIqActionProvider()] });
```
The action provider signs x402 payments with the AgentKit EVM wallet provider itself, so it works with any EVM wallet provider (Viem, CDP, Privy).

Market data only, not investment advice. MIT licensed.
