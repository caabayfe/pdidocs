/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {

    const containsAssistsSubEntOutput = api.data.contains_assists_in_subscription_entitlement.output;
    const containsAssistsSubEntItemOutput = api.data.contains_assists_in_subscription_entitlement_item.output;
    if (!containsAssistsSubEntOutput || !containsAssistsSubEntItemOutput)
        return;
    
    const containsAssistsInSubscriptionEntitlement = containsAssistsSubEntOutput.data.GlideAggregate_Query[0].count > 0;
    const containsAssistsInSubscriptionEntitlementItem = containsAssistsSubEntItemOutput.data.GlideAggregate_Query[0].count > 0;

    api.setState('containsAssists', containsAssistsInSubscriptionEntitlement || containsAssistsInSubscriptionEntitlementItem);

}
