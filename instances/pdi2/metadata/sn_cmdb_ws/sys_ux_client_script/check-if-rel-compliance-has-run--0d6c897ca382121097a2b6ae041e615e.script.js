/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var result = api.data.get_rel_compliance_score.results;

    var showComplianceScore = false;

    if (result.length > 0) {
        showComplianceScore = true;
        api.data.cmdb_health__cmdb_health_rest_api.refresh();
    }

    api.setState("showComplianceWidgets", showComplianceScore);
}
