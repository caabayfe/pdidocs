/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
var output = api.data.queue_registry_lookup.output;
    if(output == undefined) {
        api.setState('state_should_show_processing_framework_widgest', false);
        return;
    }
    var rowCount = api.data.queue_registry_lookup.output.data.GlideRecord_Query.sysevent_queue._rowCount;
    if (rowCount == 0){
        api.setState('state_should_show_processing_framework_widgest', false);
        return;
    }
    var visibility = api.data.queue_registry_lookup.output.data.GlideRecord_Query.sysevent_queue._results[0].automatic_processing.value;
    if (visibility == undefined) {
        api.setState('state_should_show_processing_framework_widgest', false);
        return;
    }
    api.setState('state_should_show_processing_framework_widgest', visibility);
}
