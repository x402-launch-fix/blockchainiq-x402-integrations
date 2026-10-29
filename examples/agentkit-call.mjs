// AgentKit sends a fire-and-forget telemetry event on wallet init; do not crash if it is rejected.
process.on("unhandledRejection", (e) => { if (!String(e?.stack).includes("sendAnalyticsEvent")) { console.error(e); process.exit(1); } });
import { AgentKit, ViemWalletProvider } from "@coinbase/agentkit";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";
import { blockchainIqActionProvider } from "../src/agentkit.mjs";

const walletClient = createWalletClient({ account: privateKeyToAccount(process.env.AGENT_PRIVATE_KEY), chain: base, transport: http() });
const agentkit = await AgentKit.from({ walletProvider: new ViemWalletProvider(walletClient), actionProviders: [blockchainIqActionProvider()] });
const action = agentkit.getActions().find((a) => a.name.endsWith("blockchainiq_brief"));
const out = JSON.parse(await action.invoke({}));
console.log("coins:", out.data?.coins?.map((c) => `${c.symbol} ${c.price}`).join(", "));
console.log("settlement:", out.settlement);
