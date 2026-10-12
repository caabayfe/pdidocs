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
    api.setState('isUpdateRecordInProgress', false);
    const eventName = event.name;
    let payload = {};
    payload.status = "success";

    if (eventName == "DATA_OP_FAILED") {
        payload.status = "failed";
    }

    api.emit("SOW_MODAL#ACTION_STATUS", payload);
    helpers.modal.close();
}
