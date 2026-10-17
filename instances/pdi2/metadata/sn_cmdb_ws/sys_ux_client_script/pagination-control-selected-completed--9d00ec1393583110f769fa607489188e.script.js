/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
 var pageNum = event.payload.value;
    var pageSize = api.state.completedPageSize;
    var begin = pageNum*pageSize;
    var end = begin+pageSize;

    var allArrays = api.data.get_list_of_run_completed_templates.output.templateDetails;
    var currentArrays = allArrays.slice(begin,end);
    api.setState('currentCompletedTemplatesList',currentArrays);
}
