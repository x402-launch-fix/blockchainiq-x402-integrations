import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
const pk = generatePrivateKey();
console.log(`AGENT_PRIVATE_KEY=${pk}\n# address: ${privateKeyToAccount(pk).address}  (fund with ~0.10 USDC on Base)`);
