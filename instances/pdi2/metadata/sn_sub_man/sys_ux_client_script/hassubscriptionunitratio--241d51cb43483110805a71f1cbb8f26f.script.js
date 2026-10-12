/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const hasSubscriptionUnitRatioRecords = api.data.has_subscription_unit_ratio.output.data.GlideRecord_Query.sku_metadata._rowCount !== 0;
    api.setState('hasSubscriptionUnitRatioRecords', hasSubscriptionUnitRatioRecords);
}
