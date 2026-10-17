/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    const assistPurchasedCounts = api.data.nowassist_purchased_counts.output;
    const isUserAllocationDisplayEnabled = api.data.getallocationvisibiltystatus_1.output;

    if (!assistPurchasedCounts) {
        console.log("Error getting NowAssist purchased counts");
        return;
    }

    const assistPurchasedCount = assistPurchasedCounts.usage;
    const creatorsPurchasedCount = assistPurchasedCounts.creators;
    const shouldShowCreatorsTab = creatorsPurchasedCount > 0 && isUserAllocationDisplayEnabled;
    const shouldShowUsageTab = assistPurchasedCount > 0;
    api.setState('shouldShowAssistUsageTab', shouldShowUsageTab);
    api.setState('shouldShowAssistCreatorTab', shouldShowCreatorsTab);
}
