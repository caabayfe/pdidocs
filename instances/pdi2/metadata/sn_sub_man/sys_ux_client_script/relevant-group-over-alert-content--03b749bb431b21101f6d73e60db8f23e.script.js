/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
    if (api.data.sub_ent_record.result == null) return "";
    const availableCount = api.data.sub_ent_record.result.purchased_count.displayValue;
    const allocatingCount = api.state.relevantUsersAllocatedCount;
    return helpers.translateSync('You have {0} subscriptions, but consuming {1} subscriptions would exceed the number of subscriptions purchased. You can still consume now and review subscriptions consumed at renewal time.', availableCount, allocatingCount);
}
