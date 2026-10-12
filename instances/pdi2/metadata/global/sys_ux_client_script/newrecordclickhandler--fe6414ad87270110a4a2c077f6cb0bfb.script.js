/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if (event.payload.table === 'sys_cs_auto_resolution_reminder') {
        helpers.modal.open("custom_1", {});
    }
    else if (event.payload.table === 'sys_cs_auto_resolution_intent_topic_map') {
        helpers.modal.open("custom_2", {});
    }
}
