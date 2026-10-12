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
    if (event.elementId == 'ok') {
        if (api.state.comments && api.state.comments.trim())
            helpers.modal.close();
    } else
        helpers.modal.close();
}
