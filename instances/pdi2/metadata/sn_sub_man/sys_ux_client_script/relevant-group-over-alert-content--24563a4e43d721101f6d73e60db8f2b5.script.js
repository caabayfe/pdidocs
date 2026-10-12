/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const availableCount = api.data.sub_ent_record.result.purchased_count.displayValue;
    const allocatingCount = api.state.relevantUsersAllocatedCount;
    return helpers.translateSync('You have {0} subscriptions, but allocating {1} subscriptions would exceed the number of subscriptions purchased. You can still allocate now and review subscriptions allocated at renewal time.', availableCount, allocatingCount);
}
