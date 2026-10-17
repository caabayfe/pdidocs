/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const { getScanDefinitionId, navigateToPage } = imports["sn_km_center.HealthScoreScanUIUtils"]();
    const sysId = getScanDefinitionId(api, event, helpers);
    navigateToPage(api, sysId, helpers);

}
