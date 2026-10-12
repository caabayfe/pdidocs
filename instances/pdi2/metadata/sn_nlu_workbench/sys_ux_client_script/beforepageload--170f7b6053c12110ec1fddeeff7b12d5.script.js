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
    let blockcontext = api.state.blockcontext;
    const showPredictionServerNotification = blockcontext.showPredictionServerNotification;
    if (showPredictionServerNotification) {
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [{
                id: "prediction-server-alert",
                status: "critical",
                icon: "circle-close-fill",
                content: "Some features may not be available because the connection to NLU Service is not available. Please try again after sometime, if the issue persists log an issue with Support",
                action: {
                    type: "dismiss"
                }
            }]
        });
    }
    api.emit('ACE_PAGE_READY', {
        blockcontext
    });
}
