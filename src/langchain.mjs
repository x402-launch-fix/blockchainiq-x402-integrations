// LangChain tools for the Blockchain IQ x402 API.
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { privateKeyToAccount } from "viem/accounts";
import { createPayFetch, callResource } from "./client.mjs";

export function blockchainIqTools({ privateKey = process.env.AGENT_PRIVATE_KEY, account, maxAmountPerPayment } = {}) {
  const signer = account ?? privateKeyToAccount(privateKey);
  const payFetch = createPayFetch(signer, { maxAmountPerPayment });
  const brief = tool(
    async () => JSON.stringify(await callResource(payFetch, "brief")),
    { name: "blockchainiq_brief",
      description: "Crypto market brief (BTC, ETH, SOL, XRP prices and moves, events in the next 48h, risk flags) from Blockchain IQ. Costs $0.01 USDC on Base via x402. Market data only, not investment advice.",
      schema: z.object({}) });
  const eventRisk = tool(
    async ({ days }) => JSON.stringify(await callResource(payFetch, "event-risk", { days })),
    { name: "blockchainiq_event_risk",
      description: "Upcoming US data releases, central bank decisions, Treasury auctions and crypto/regulatory milestones with official sources, from Blockchain IQ. Costs $0.05 USDC on Base via x402.",
      schema: z.object({ days: z.number().int().min(1).max(30).optional().describe("Days ahead, default 7") }) });
  return [brief, eventRisk];
}
