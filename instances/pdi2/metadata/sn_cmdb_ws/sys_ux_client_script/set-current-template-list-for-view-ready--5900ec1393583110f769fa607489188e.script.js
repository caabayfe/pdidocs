/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.setState('readyTemplatesLoading', false);
    var templateList = api.data.get_list_of_published_dedup_templates.output.template_details;
    var currentList = templateList.slice(api.state.readyBeginIndex,api.state.readyPageSize);
    api.setState('currentReadyTemplatesList',currentList);
    
}
