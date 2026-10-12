/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const hasEntitlementsRecords = api.data.has_entitlements.output.data.GlideRecord_Query.subscription_entitlement._rowCount !== 0;
    api.setState('hasEntitlementsRecords', hasEntitlementsRecords);
}
