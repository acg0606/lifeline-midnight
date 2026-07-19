export async function createDemoProof(payload: unknown) {
  const bytes = new TextEncoder().encode(JSON.stringify(payload) + Date.now());
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  const hash = Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
  return { transactionId: `demo_${hash.slice(0, 24)}`, commitment: hash, network: "local-demo" };
}

export const LOCAL_DEMO_NETWORK = "local-demo";

