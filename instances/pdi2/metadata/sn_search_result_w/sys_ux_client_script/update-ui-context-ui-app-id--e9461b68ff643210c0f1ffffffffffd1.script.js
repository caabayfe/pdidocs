/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var uiContext = api.state.uiContext;
    var results = api.data.sys_ux_page_by_context.output.data.GlideRecord_Query.sys_ux_page_registry._results;
    // TODO - fix race condition to get correction app ID on context passed on search data broker call 
    // uiContext.uiApplicationId = results && results.length > 0 ? results[0].sys_id.value : "";
    // api.setState('uiContext', uiContext);
}
