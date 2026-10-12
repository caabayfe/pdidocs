/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
        api.setState('runningTemplatesLoading', false);
    var templateList = api.data.get_running_dedupe_templates.output.templateDetails;
    var currentList = templateList.slice(api.state.runningBeginIndex,api.state.runningPageSize);
    api.setState('currentRunningTemplatesList',currentList);
    
}
