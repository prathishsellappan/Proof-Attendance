
if (process.env.HEDERA_OPERATOR_ID) {
    console.log("HEDERA_OPERATOR_ID is set: " + process.env.HEDERA_OPERATOR_ID);
} else {
    console.log("HEDERA_OPERATOR_ID is NOT set");
}
if (process.env.HEDERA_OPERATOR_KEY) {
    console.log("HEDERA_OPERATOR_KEY is set (value hidden)");
} else {
    console.log("HEDERA_OPERATOR_KEY is NOT set");
}
