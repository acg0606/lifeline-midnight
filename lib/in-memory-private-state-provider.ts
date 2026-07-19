import type { ContractAddress, SigningKey } from "@midnight-ntwrk/midnight-js-protocol/compact-runtime";
import type {
  ExportPrivateStatesOptions,
  ExportSigningKeysOptions,
  ImportPrivateStatesOptions,
  ImportPrivateStatesResult,
  ImportSigningKeysOptions,
  ImportSigningKeysResult,
  PrivateStateExport,
  PrivateStateId,
  PrivateStateProvider,
  SigningKeyExport,
} from "@midnight-ntwrk/midnight-js-types";

export const inMemoryPrivateStateProvider = <PSI extends PrivateStateId, PS = unknown>(): PrivateStateProvider<PSI, PS> => {
  const privateStates = new Map<ContractAddress, Map<PSI, PS>>();
  const signingKeys = new Map<ContractAddress, SigningKey>();
  let contractAddress: ContractAddress | null = null;

  const requireContractAddress = (): ContractAddress => {
    if (contractAddress === null) throw new Error("Contract address has not been configured yet.");
    return contractAddress;
  };

  const getScopedStates = (address: ContractAddress): Map<PSI, PS> => {
    let states = privateStates.get(address);
    if (!states) {
      states = new Map<PSI, PS>();
      privateStates.set(address, states);
    }
    return states;
  };

  const encode = <T>(value: T): string =>
    JSON.stringify(value, (_key, entry) => (entry instanceof Uint8Array ? { __bytes: Array.from(entry) } : entry));
  const decode = <T>(value: string): T =>
    JSON.parse(value, (_key, entry) =>
      entry && typeof entry === "object" && Array.isArray(entry.__bytes) ? Uint8Array.from(entry.__bytes) : entry,
    ) as T;

  return {
    setContractAddress(address: ContractAddress): void {
      contractAddress = address;
    },
    set(key: PSI, state: PS): Promise<void> {
      getScopedStates(requireContractAddress()).set(key, state);
      return Promise.resolve();
    },
    get(key: PSI): Promise<PS | null> {
      return Promise.resolve(getScopedStates(requireContractAddress()).get(key) ?? null);
    },
    remove(key: PSI): Promise<void> {
      getScopedStates(requireContractAddress()).delete(key);
      return Promise.resolve();
    },
    clear(): Promise<void> {
      privateStates.delete(requireContractAddress());
      return Promise.resolve();
    },
    setSigningKey(address: ContractAddress, key: SigningKey): Promise<void> {
      signingKeys.set(address, key);
      return Promise.resolve();
    },
    getSigningKey(address: ContractAddress): Promise<SigningKey | null> {
      return Promise.resolve(signingKeys.get(address) ?? null);
    },
    removeSigningKey(address: ContractAddress): Promise<void> {
      signingKeys.delete(address);
      return Promise.resolve();
    },
    clearSigningKeys(): Promise<void> {
      signingKeys.clear();
      return Promise.resolve();
    },
    exportPrivateStates(_options?: ExportPrivateStatesOptions): Promise<PrivateStateExport> {
      const address = requireContractAddress();
      const states = Object.fromEntries(Array.from(getScopedStates(address).entries()).map(([key, value]) => [key, encode(value)]));
      return Promise.resolve({
        format: "midnight-private-state-export",
        encryptedPayload: encode({ address, states }),
        salt: "lifeline-browser-session",
      });
    },
    importPrivateStates(data: PrivateStateExport, options?: ImportPrivateStatesOptions): Promise<ImportPrivateStatesResult> {
      const states = getScopedStates(requireContractAddress());
      const strategy = options?.conflictStrategy ?? "error";
      const payload = decode<{ states?: Record<string, string> }>(data.encryptedPayload);
      let imported = 0;
      let skipped = 0;
      let overwritten = 0;
      for (const [rawId, serialized] of Object.entries(payload.states ?? {})) {
        const id = rawId as PSI;
        if (states.has(id)) {
          if (strategy === "skip") {
            skipped++;
            continue;
          }
          if (strategy === "error") return Promise.reject(new Error(`Private state conflict: ${id}`));
          overwritten++;
        } else {
          imported++;
        }
        states.set(id, decode<PS>(serialized));
      }
      return Promise.resolve({ imported, skipped, overwritten });
    },
    exportSigningKeys(_options?: ExportSigningKeysOptions): Promise<SigningKeyExport> {
      return Promise.resolve({
        format: "midnight-signing-key-export",
        encryptedPayload: encode({ keys: Object.fromEntries(signingKeys.entries()) }),
        salt: "lifeline-browser-session",
      });
    },
    importSigningKeys(data: SigningKeyExport, options?: ImportSigningKeysOptions): Promise<ImportSigningKeysResult> {
      const strategy = options?.conflictStrategy ?? "error";
      const payload = decode<{ keys?: Record<string, SigningKey> }>(data.encryptedPayload);
      let imported = 0;
      let skipped = 0;
      let overwritten = 0;
      for (const [address, key] of Object.entries(payload.keys ?? {})) {
        if (signingKeys.has(address)) {
          if (strategy === "skip") {
            skipped++;
            continue;
          }
          if (strategy === "error") return Promise.reject(new Error(`Key conflict: ${address}`));
          overwritten++;
        } else {
          imported++;
        }
        signingKeys.set(address, key);
      }
      return Promise.resolve({ imported, skipped, overwritten });
    },
  };
};
