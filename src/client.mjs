// Shared x402 client for the Blockchain IQ API (USDC on Base, x402 v2 "exact" scheme).
import { wrapFetchWithPayment, x402Client, decodePaymentResponseHeader } from "@x402/fetch";
import { ExactEvmScheme } from "@x402/evm/exact/client";

export const BASE_URL = "https://www.blockchainiq.co/api/x402/v1";

/** Build a paying fetch from any signer exposing { address, signTypedData }. */
export function createPayFetch(signer, { maxAmountPerPayment = 0.1 } = {}) {
  const client = x402Client.fromConfig({
    schemes: [{ network: "eip155:*", client: new ExactEvmScheme(signer) }],
    spendControls: { maxAmountPerPayment }, // dollars; brief is $0.01, event-risk $0.05
  });
  return wrapFetchWithPayment(fetch, client);
}

/** Call a resource and return { data, settlement } where settlement holds the tx hash. */
export async function callResource(payFetch, path, params = {}) {
  const url = new URL(`${BASE_URL}/${path}`);
  for (const [k, v] of Object.entries(params)) if (v !== undefined) url.searchParams.set(k, String(v));
  const res = await payFetch(url.toString());
  const body = await res.json().catch(() => ({}));
  if (res.status === 402) {
    const pr = res.headers.get("payment-required");
    let reason = "payment not accepted";
    try { reason = JSON.parse(Buffer.from(pr, "base64").toString()).error ?? reason; } catch {}
    throw new Error(`Blockchain IQ ${path}: payment rejected (${reason}). Fund the wallet with a little USDC on Base.`);
  }
  if (!res.ok) throw new Error(`Blockchain IQ ${path} failed: HTTP ${res.status} ${JSON.stringify(body).slice(0, 300)}`);
  const header = res.headers.get("payment-response");
  return { data: body.data ?? body, settlement: header ? decodePaymentResponseHeader(header) : null };
}
