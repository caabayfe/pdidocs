/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const hasSubscriptionLineItems = api.data.has_subscription_line_items.output.data.GlideRecord_Query.subscription_entitlement_item._rowCount > 1; // greater than 1 indicates consolidation has happened
    api.setState('hasSubscriptionLineItems', hasSubscriptionLineItems);
}
