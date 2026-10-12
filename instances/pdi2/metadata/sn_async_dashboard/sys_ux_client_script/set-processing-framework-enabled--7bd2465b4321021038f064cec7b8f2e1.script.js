/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
var procesisngFrameworkEnabledRowCount = api.data.processing_framework_enabled.output.data.GlideRecord_Query.sys_status._rowCount;
    if (procesisngFrameworkEnabledRowCount == 0) {
        api.setState('state_is_processing_framework_enabled', false);
        return;
    }
    api.setState('state_is_processing_framework_enabled', true);

}
