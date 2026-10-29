// Coinbase AgentKit action provider for the Blockchain IQ x402 API.
// Payments are signed by the AgentKit EVM wallet provider (EIP-3009, gasless for the payer).
import { customActionProvider } from "@coinbase/agentkit";
import { z } from "zod";
import { createPayFetch, callResource } from "./client.mjs";

const signerFrom = (walletProvider) => ({
  address: walletProvider.getAddress(),
  signTypedData: (typedData) => walletProvider.signTypedData(typedData),
});

export function blockchainIqActionProvider({ maxAmountPerPayment = 0.1 } = {}) {
  const run = (path, params) => async (walletProvider, args) => {
    const payFetch = createPayFetch(signerFrom(walletProvider), { maxAmountPerPayment });
    return JSON.stringify(await callResource(payFetch, path, params?.(args)));
  };
  return customActionProvider([
    { name: "blockchainiq_brief",
      description: "Get the Blockchain IQ crypto market brief (BTC/ETH/SOL/XRP, events in next 48h, risk flags). Pays $0.01 USDC on Base via x402.",
      schema: z.object({}), invoke: run("brief") },
    { name: "blockchainiq_event_risk",
      description: "Get Blockchain IQ scheduled macro and crypto event risk for the next N days. Pays $0.05 USDC on Base via x402.",
      schema: z.object({ days: z.number().int().min(1).max(30).optional() }), invoke: run("event-risk", (a) => ({ days: a?.days })) },
  ]);
}
