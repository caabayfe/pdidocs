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
    api.emit("PWD_RESET_UIB#PAGE_NAVIGATOR", {
        route: event.payload.route,
        token: event.payload.token,
        additionalInfo: event.payload.additionalInfo
    });
}
