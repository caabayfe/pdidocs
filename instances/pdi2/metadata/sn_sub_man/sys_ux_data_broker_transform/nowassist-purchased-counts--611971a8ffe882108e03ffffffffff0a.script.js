/**
 * Data broker to get NowAssist Purchased Counts
 * @param {object} input
 * @return {string}
 */
function transform(input) {
    return new NowAssistPurchasedCounts().getNowAssistPurchasedCounts();
}
