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
    if (event.elementId == 'button_1' || (event.elementId == 'custom_1' && event.name == 'CANVAS_MODAL#CLOSED')) {
        helpers.modal.close("custom_1", {});
    }
    else {
        helpers.modal.close("custom_2", {});
    }
}
