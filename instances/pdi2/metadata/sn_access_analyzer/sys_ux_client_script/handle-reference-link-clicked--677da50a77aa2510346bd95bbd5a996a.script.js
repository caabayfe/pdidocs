/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    api.setState("referenceLinkEventPayload", event.payload);
    const tablesToPreview = ["sn_access_analyzer_request", "sn_access_analyzer_access_result", "sn_access_analyzer_debug_log"];
    if (tablesToPreview.includes(event.payload.table))
        helpers.modal.open("record_preview_modal");
}
