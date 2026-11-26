pragma circom 2.1.6;
include "poseidon2.circom";

template Unsigned7() {
    signal input value;
    signal bits[7];
    var sum = 0;
    for (var i = 0; i < 7; i++) {
        bits[i] <-- (value >> i) & 1;
        bits[i] * (bits[i] - 1) === 0;
        sum += bits[i] * (1 << i);
    }
    value === sum;
}

template RecoveryVote() {
    signal input secret;
    signal input allowance;
    signal input siblings[2];
    signal input directions[2];
    signal input cycle;
    signal input need;
    signal input weight;
    signal output root;
    signal output nullifier;
    signal output ballotTag;

    // In combination these checks enforce 1 <= weight <= allowance <= 100.
    component ranges[4];
    for (var i = 0; i < 4; i++) { ranges[i] = Unsigned7(); }
    ranges[0].value <== allowance;
    ranges[1].value <== 100 - allowance;
    ranges[2].value <== weight - 1;
    ranges[3].value <== allowance - weight;

    component credential = HashPair(1);
    credential.a <== secret;
    credential.b <== allowance;
    signal path[3];
    path[0] <== credential.digest;
    component parents[2];
    signal swap[2];
    for (var h = 0; h < 2; h++) {
        directions[h] * (directions[h] - 1) === 0;
        swap[h] <== directions[h] * (siblings[h] - path[h]);
        parents[h] = HashPair(2);
        parents[h].a <== path[h] + swap[h];
        parents[h].b <== siblings[h] - swap[h];
        path[h+1] <== parents[h].digest;
    }
    root <== path[2];
    component spent = HashPair(3);
    spent.a <== secret;
    spent.b <== cycle;
    nullifier <== spent.digest;
    component ballot = HashPair(4);
    ballot.a <== nullifier;
    ballot.b <== need;
    ballotTag <== ballot.digest;
}

component main {public [cycle, need, weight]} = RecoveryVote();
