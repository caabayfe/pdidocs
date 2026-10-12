/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.setState('runningTemplatesLoading', false);
    var result = api.data.get_running_dedupe_templates.output;
    api.setState('lastUpdatedInfo', result.lastUpdatedInfoText);
    api.setState('runningTemplatesCount', result.templateDetails.length);
}
