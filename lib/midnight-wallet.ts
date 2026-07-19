"use client";

import type { InitialAPI } from "@midnight-ntwrk/dapp-connector-api";

export type WalletMode = "disconnected" | "lace" | "demo";

declare global {
  interface Window {
    midnight?: Record<string, InitialAPI>;
  }
}

export type WalletConnection = {
  mode: WalletMode;
  label: string;
  network: string;
  proofServer?: string;
};

export async function connectMidnightWallet(): Promise<WalletConnection> {
  const wallets = typeof window !== "undefined" ? Object.values(window.midnight ?? {}) : [];
  const lace = wallets.find((wallet) => wallet && typeof wallet.connect === "function");

  if (!lace) {
    return { mode: "demo", label: "Demo local", network: "demo" };
  }

  const connected = await lace.connect("preprod");
  const [configuration, addresses] = await Promise.all([
    connected.getConfiguration(),
    connected.getShieldedAddresses(),
  ]);
  const publicKey = addresses.shieldedCoinPublicKey;

  return {
    mode: "lace",
    label: publicKey ? `${publicKey.slice(0, 7)}…${publicKey.slice(-4)}` : "Lace conectada",
    network: configuration.networkId ?? "preprod",
    proofServer: configuration.proverServerUri,
  };
}
