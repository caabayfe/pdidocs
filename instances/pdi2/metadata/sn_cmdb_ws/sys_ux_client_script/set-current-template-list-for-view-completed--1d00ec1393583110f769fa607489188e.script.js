/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
        api.setState('completedTemplatesLoading', false);
   var templateList = api.data.get_list_of_run_completed_templates.output.templateDetails;
    var currentList = templateList.slice(api.state.completedBeginIndex,api.state.completedPageSize);
    api.setState('currentCompletedTemplatesList',currentList);
}
