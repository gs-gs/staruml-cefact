function increment(value) {
    if (typeof value !== "number") {
        throw "not a number";
    }
    return value + 1;
}
module.exports = increment;