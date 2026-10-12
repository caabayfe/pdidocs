/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
    if (api.data.sub_ent_record.result == null) return true;
    const subscriptionType = api.data.sub_ent_record.result.subscription_type.displayValue;
    //Status will not be displayed for Display type subscriptions
    return (subscriptionType === 'Display' || (subscriptionType === 'Per-User' && !api.data.getallocationvisibiltystatus_1.output && !api.state.isSubscriptionAccountLevel));
}
