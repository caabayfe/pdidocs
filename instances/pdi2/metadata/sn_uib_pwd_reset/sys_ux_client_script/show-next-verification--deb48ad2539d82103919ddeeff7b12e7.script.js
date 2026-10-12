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
    api.emit("PWD_RESET_UIB#HANDLE_CLEAR_ALERT_NOTIFICATION_RELAY");
    api.emit("MACROPONENT_VIEWPORT_LOAD_REQUESTED", {
        viewportElementId: "viewport_1",
        route: event.payload.route,
        fields: {
            token: event.payload.token,
            verificationId: event.payload.verificationId,
            isLastVerification: event.payload.isLastVerification
        },
        params: null
    });
}
