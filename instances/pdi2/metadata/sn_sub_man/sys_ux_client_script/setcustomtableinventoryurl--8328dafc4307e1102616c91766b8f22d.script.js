/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
     const subscriptionEntitlementName = api.data.sub_ent_record.result.name.value;
     const productType = api.data.sub_ent_record.result.subscription_type.displayValue;
     const productTypeValue = api.data.sub_ent_record.result.subscription_type.value;
     const url = "/now/nav/ui/classic/params/target/ua_custom_table_inventory_list.do"+encodeURIComponent("?sysparm_query=^subscription_entitlement.name=" + subscriptionEntitlementName + "^ORsubscription_entitlement.nameISEMPTY^GROUPBYapp_name");
     api.setState('CustomTableInventoryUrl', url);
     api.setState('productType', productType);
     api.setState('productTypeValue', productTypeValue);
}
