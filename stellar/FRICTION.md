# Caatinga friction log

Observed on 26 November 2026 with the npm distribution of Caatinga 3.14.0, Stellar CLI 28.0.0 and Rust 1.91.1.

| Step | Observation | How the demo handles it |
| --- | --- | --- |
| Scaffold | The minimal scaffold configures a generic verifier and ships a placeholder embedded key. | Added the Lifeline voting circuit. Run `zk build main --embed-vk` before compiling the contract. |
| Development ceremony | Rebuilding the circuit generates different proving and verification keys. | Build once per testnet release, then generate the proof and the verifier WASM from that build. |
| Identity funding | In our proxied environment Stellar CLI printed a funding error while identity creation exited successfully. | Funded the public address through official Friendbot and confirmed the contract deployment on the public testnet. The CLI also needed an HTTPS transport compatible with the environment's proxy. |
| Receipt capture | A read-only result can be returned by simulation. Our rejection paths deliberately return a structured result without a storage write. | The testnet test explicitly uses `--send yes`, queries each transaction by its hash, and verifies the tally after each attempt. |
| Reproduction | A checkout with an existing deployment artifact can skip deployment. | The reproduction guide uses a funded user-owned identity and `--force` to create a new testnet instance for each rebuilt key. |
