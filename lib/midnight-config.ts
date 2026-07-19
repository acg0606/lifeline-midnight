export const midnightConfig = {
  mode: import.meta.env.VITE_LIFELINE_MODE ?? "midnight",
  network: import.meta.env.VITE_MIDNIGHT_NETWORK ?? "preprod",
  contractAddress: import.meta.env.VITE_LIFELINE_CONTRACT_ADDRESS ?? "",
};

export const isLiveMidnight = (): boolean => {
  const stored = typeof window !== "undefined" ? window.localStorage.getItem("lifeline-midnight-contract-preprod") : null;
  return midnightConfig.mode === "midnight" && (midnightConfig.contractAddress.length > 0 || !!stored);
};
