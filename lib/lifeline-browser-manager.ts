import type { ConnectedAPI, InitialAPI } from "@midnight-ntwrk/dapp-connector-api";
import { FetchZkConfigProvider } from "@midnight-ntwrk/midnight-js-fetch-zk-config-provider";
import { httpClientProofProvider } from "@midnight-ntwrk/midnight-js-http-client-proof-provider";
import { indexerPublicDataProvider } from "@midnight-ntwrk/midnight-js-indexer-public-data-provider";
import { setNetworkId, type NetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { fromHex, toHex, type ContractAddress } from "@midnight-ntwrk/midnight-js-protocol/compact-runtime";
import {
  Binding,
  type FinalizedTransaction,
  Proof,
  SignatureEnabled,
  Transaction,
  type TransactionId,
} from "@midnight-ntwrk/midnight-js-protocol/ledger";
import type { UnboundTransaction } from "@midnight-ntwrk/midnight-js-types";
import { filter, firstValueFrom, interval, map, take, timeout } from "rxjs";
import semver from "semver";
import { inMemoryPrivateStateProvider } from "@/lib/in-memory-private-state-provider";
import {
  LifelineMidnightAPI,
  type LifelineCircuitKey,
  type LifelineProviders,
} from "@/lib/lifeline-midnight-api";
import type { LifelinePrivateState } from "@/contracts/src/index";

const NETWORK_ID: NetworkId = "preprod";
const COMPATIBLE_CONNECTOR_API_VERSION = "4.x";
const SECRET_STORAGE_KEY = "lifeline-midnight-member-secret-v1";
const CONTRACT_STORAGE_KEY = "lifeline-midnight-contract-preprod";

const getCompatibleWallet = (): InitialAPI | undefined => {
  if (!window.midnight) return undefined;
  return Object.values(window.midnight).find(
    (wallet): wallet is InitialAPI =>
      !!wallet && typeof wallet === "object" && "apiVersion" in wallet &&
      semver.satisfies(wallet.apiVersion, COMPATIBLE_CONNECTOR_API_VERSION),
  );
};

const connectToWallet = async (): Promise<ConnectedAPI> => {
  const initialAPI = await firstValueFrom(
    interval(100).pipe(
      map(() => getCompatibleWallet()),
      filter((api): api is InitialAPI => !!api),
      take(1),
      timeout({ first: 5_000 }),
    ),
  ).catch(() => {
    throw new Error("No Lace wallet compatible with Midnight Connector 4.x was found.");
  });
  return initialAPI.connect(NETWORK_ID);
};

const getMemberSecret = (): Uint8Array => {
  const stored = localStorage.getItem(SECRET_STORAGE_KEY);
  if (stored) return Uint8Array.from(atob(stored), (character) => character.charCodeAt(0));
  const secret = crypto.getRandomValues(new Uint8Array(32));
  localStorage.setItem(SECRET_STORAGE_KEY, btoa(String.fromCharCode(...secret)));
  return secret;
};

const initializeProviders = async (): Promise<LifelineProviders> => {
  setNetworkId(NETWORK_ID);
  const connectedAPI = await connectToWallet();
  const configuration = await connectedAPI.getConfiguration();
  const proofServerUri = configuration.proverServerUri;
  if (!proofServerUri) throw new Error("Lace did not provide the local proof server URL.");
  const addresses = await connectedAPI.getShieldedAddresses();
  const zkConfigProvider = new FetchZkConfigProvider<LifelineCircuitKey>(window.location.origin, fetch.bind(window));

  return {
    privateStateProvider: inMemoryPrivateStateProvider<string, LifelinePrivateState>(),
    zkConfigProvider,
    proofProvider: httpClientProofProvider(proofServerUri, zkConfigProvider),
    publicDataProvider: indexerPublicDataProvider(configuration.indexerUri, configuration.indexerWsUri),
    walletProvider: {
      getCoinPublicKey: () => addresses.shieldedCoinPublicKey,
      getEncryptionPublicKey: () => addresses.shieldedEncryptionPublicKey,
      balanceTx: async (transaction: UnboundTransaction): Promise<FinalizedTransaction> => {
        const received = await connectedAPI.balanceUnsealedTransaction(toHex(transaction.serialize()));
        return Transaction.deserialize<SignatureEnabled, Proof, Binding>(
          "signature",
          "proof",
          "binding",
          fromHex(received.tx),
        );
      },
    },
    midnightProvider: {
      submitTx: async (transaction: FinalizedTransaction): Promise<TransactionId> => {
        await connectedAPI.submitTransaction(toHex(transaction.serialize()));
        return transaction.identifiers()[0];
      },
    },
  };
};

export class LifelineBrowserManager {
  private providersPromise: Promise<LifelineProviders> | undefined;
  private api: LifelineMidnightAPI | undefined;

  private getProviders(): Promise<LifelineProviders> {
    return this.providersPromise ?? (this.providersPromise = initializeProviders());
  }

  async deploy(): Promise<LifelineMidnightAPI> {
    const providers = await this.getProviders();
    this.api = await LifelineMidnightAPI.deploy(providers, getMemberSecret());
    localStorage.setItem(CONTRACT_STORAGE_KEY, this.api.deployedContractAddress);
    return this.api;
  }

  async join(contractAddress: ContractAddress): Promise<LifelineMidnightAPI> {
    if (this.api?.deployedContractAddress === contractAddress) return this.api;
    const providers = await this.getProviders();
    this.api = await LifelineMidnightAPI.join(providers, contractAddress, getMemberSecret());
    localStorage.setItem(CONTRACT_STORAGE_KEY, contractAddress);
    return this.api;
  }

  getStoredContractAddress(): ContractAddress | undefined {
    const configured = import.meta.env.VITE_LIFELINE_CONTRACT_ADDRESS?.trim();
    const stored = localStorage.getItem(CONTRACT_STORAGE_KEY)?.trim();
    return (configured || stored || undefined) as ContractAddress | undefined;
  }

  rememberContractAddress(contractAddress: string): void {
    if (contractAddress.trim()) localStorage.setItem(CONTRACT_STORAGE_KEY, contractAddress.trim());
  }

  clearSession(): void {
    this.providersPromise = undefined;
    this.api = undefined;
  }
}

export const lifelineBrowserManager = new LifelineBrowserManager();

export const commitmentFor = async (domain: string, value: string): Promise<Uint8Array> => {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${domain}:${value}`));
  return new Uint8Array(digest);
};

export const commitmentKeyFor = async (domain: string, value: string): Promise<string> =>
  toHex(await commitmentFor(domain, value));
