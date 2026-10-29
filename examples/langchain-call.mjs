import { blockchainIqTools } from "../src/langchain.mjs";
const [brief] = blockchainIqTools();
const out = JSON.parse(await brief.invoke({}));
console.log("coins:", out.data?.coins?.map((c) => `${c.symbol} ${c.price}`).join(", "));
console.log("settlement:", out.settlement);
