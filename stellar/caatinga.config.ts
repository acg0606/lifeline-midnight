import { defineConfig } from "@caatinga/core";

export default defineConfig({
  project: "lifeline-stellar",
  defaultNetwork: "testnet",
  contracts: {
    verifier: {
      path: "./contracts/verifier",
      wasm: "./contracts/verifier/target/wasm32v1-none/release/verifier.wasm",
      // The verifier's constructor stores the account allowed to call upgrade();
      // `ctg deploy --source <identity>` fills in that identity's address.
      deployArgs: { admin: "${source.address}" }
    }
  },
  networks: {
    testnet: {
      rpcUrl: "https://soroban-testnet.stellar.org",
      networkPassphrase: "Test SDF Network ; September 2015"
    }
  },
  zk: {
    circuits: {
      main: {
        path: "./circuits",
        protocol: "groth16",
        curve: "bls12381",
        verifierContract: "verifier"
      }
    }
  }
});
