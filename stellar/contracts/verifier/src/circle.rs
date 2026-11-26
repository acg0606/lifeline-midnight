use super::{Fr, Groth16Verifier, Groth16VerifierArgs, Groth16VerifierClient, Proof};
use soroban_sdk::{contractimpl, contracttype, symbol_short, Env, Vec, U256};

#[contracttype]
#[derive(Clone)]
pub struct Round {
    pub cycle: u64,
    pub root: U256,
    pub first: U256,
    pub second: U256,
    pub first_total: u32,
    pub second_total: u32,
    pub spent: Vec<U256>,
    pub open: bool,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum VoteResult {
    Counted,
    InvalidProof,
    AlreadyVoted,
    WrongRound,
    UnknownNeed,
}

fn modulus(env: &Env) -> U256 {
    U256::from_parts(
        env,
        0x73eda753299d7d48,
        0x3339d80809a1d805,
        0x53bda402fffe5bfe,
        0xffffffff00000001,
    )
}

#[contractimpl]
impl Groth16Verifier {
    pub fn round(env: Env) -> Option<Round> {
        env.storage().instance().get(&symbol_short!("round"))
    }

    // One contract instance represents one circle. The previous round must be closed.
    pub fn open_round(env: Env, cycle: u64, root: U256, first: U256, second: U256) {
        Self::admin(env.clone()).unwrap().require_auth();
        if let Some(previous) = Self::round(env.clone()) {
            assert!(
                !previous.open && cycle > previous.cycle,
                "cycle must advance"
            );
        }
        let p = modulus(&env);
        assert!(
            cycle > 0 && first != second && first < p && second < p && root < p,
            "invalid round"
        );
        let round = Round {
            cycle,
            root,
            first,
            second,
            first_total: 0,
            second_total: 0,
            spent: Vec::new(&env),
            open: true,
        };
        env.storage()
            .instance()
            .set(&symbol_short!("round"), &round);
    }

    pub fn close_round(env: Env) {
        Self::admin(env.clone()).unwrap().require_auth();
        let mut round = Self::round(env.clone()).expect("missing round");
        round.open = false;
        env.storage()
            .instance()
            .set(&symbol_short!("round"), &round);
    }

    // Circom emits outputs first, followed by public inputs in declaration order.
    // [root, nullifier, ballotTag, cycle, need, weight]
    pub fn cast_vote(env: Env, proof: Proof, pub_signals: Vec<U256>) -> VoteResult {
        let Some(mut round) = Self::round(env.clone()) else {
            return VoteResult::WrongRound;
        };
        let p = modulus(&env);
        if pub_signals.len() != 6 || pub_signals.iter().any(|value| value >= p) {
            return VoteResult::InvalidProof;
        }
        if !round.open
            || pub_signals.get_unchecked(0) != round.root
            || pub_signals.get_unchecked(3).to_u128() != Some(round.cycle as u128)
        {
            return VoteResult::WrongRound;
        }
        let need = pub_signals.get_unchecked(4);
        if need != round.first && need != round.second {
            return VoteResult::UnknownNeed;
        }
        let Some(weight @ 1..=100) = pub_signals.get_unchecked(5).to_u128() else {
            return VoteResult::InvalidProof;
        };
        let mut signals = Vec::new(&env);
        for value in pub_signals.iter() {
            signals.push_back(Fr::from_u256(value));
        }
        if Self::verify_proof_embedded(env.clone(), proof, signals) != Ok(true) {
            return VoteResult::InvalidProof;
        }
        let nullifier = pub_signals.get_unchecked(1);
        if round.spent.contains(&nullifier) {
            return VoteResult::AlreadyVoted;
        }
        round.spent.push_back(nullifier);
        if need == round.first {
            round.first_total += weight as u32;
        } else {
            round.second_total += weight as u32;
        }
        env.storage()
            .instance()
            .set(&symbol_short!("round"), &round);
        VoteResult::Counted
    }
}
