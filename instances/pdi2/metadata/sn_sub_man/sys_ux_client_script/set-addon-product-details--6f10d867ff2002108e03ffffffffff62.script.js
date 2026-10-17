/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const isAddonProduct = api.data.sub_ent_record.result.add_on.value;
    api.setState('isAddonProduct', isAddonProduct);

    if (!isAddonProduct)
    {
        //Set id for subscribed groups and subscribed user tabs
        api.setState('subscriptionIdForSubscribedGroupsAndUsers', api.context.props.sysId);
        return;
    }
        
    const addonBaseProductEntitlementId = api.data.sub_ent_record.result.base_entitlement_id.value;
    api.setState('addonBaseProductEntitlementId', addonBaseProductEntitlementId);
    
    api.data.get_base_product_for_addon.refresh();
}
