/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
 
    const addonBaseProduct = api.data.get_base_product_for_addon.results[0];
    if (!addonBaseProduct)
        return;

    const addonBaseProductSysId = addonBaseProduct.sys_id.value;
    const addonBaseProductName = addonBaseProduct.name.value;
    api.setState('addonBaseProductSysId', addonBaseProductSysId);
    
    //Set id for subscribed groups and subscribed user tabs. If this is an add-on product, set the id to base product's sys id so that Subscribed Groups and Subscribed Users tab display the groups and users of base product
    api.setState('subscriptionIdForSubscribedGroupsAndUsers', addonBaseProductSysId);
    api.setState('addonBaseProductName', addonBaseProductName);
}
