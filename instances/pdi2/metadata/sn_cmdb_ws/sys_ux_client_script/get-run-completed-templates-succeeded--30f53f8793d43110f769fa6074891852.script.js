/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.setState('completedTemplatesLoading', false);
    var result = api.data.get_list_of_run_completed_templates.output;
    api.setState('lastUpdatedInfo', result.lastUpdatedInfoText);
    api.setState('runCompletedTemplatesCount', result.templateDetails.length);
}
