pragma circom 2.1.6;
include "round-constants.circom";

// Two data lanes and a fixed domain in the capacity lane. Returns lane zero.
template HashPair(domain) {
    signal input a;
    signal input b;
    signal output digest;
    signal state[65][3];
    signal mixed[64][3];
    signal square[64][3];
    signal fourth[64][3];
    var start = a + b + domain;
    state[0][0] <== a + start;
    state[0][1] <== b + start;
    state[0][2] <== domain + start;
    for (var r = 0; r < 64; r++) {
        var full = r < 4 || r >= 60;
        for (var i = 0; i < 3; i++) {
            if (full || i == 0) {
                var x = state[r][i] + RC(r, i);
                square[r][i] <== x*x;
                fourth[r][i] <== square[r][i]*square[r][i];
                mixed[r][i] <== fourth[r][i]*x;
            } else {
                square[r][i] <== 0;
                fourth[r][i] <== 0;
                mixed[r][i] <== state[r][i];
            }
        }
        var sum = mixed[r][0] + mixed[r][1] + mixed[r][2];
        for (var j = 0; j < 3; j++) {
            if (!full && j == 2) {
                state[r+1][j] <== sum + 2*mixed[r][j];
            } else {
                state[r+1][j] <== sum + mixed[r][j];
            }
        }
    }
    digest <== state[64][0];
}
