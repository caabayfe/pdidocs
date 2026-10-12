/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.setState("referenceLinkEventPayload", event.payload);
    if (event.payload.table == "sn_access_analyzer_request")
        helpers.modal.open("record_preview_modal");
}
