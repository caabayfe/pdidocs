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
     const {
        redirectToNewDashboard
    } = imports['sn_ci_analytics.VADasboardUtils'](api);
    if (api.context.app.ace_application_id == "68724d24436b111061d09a549cb8f249") {
        redirectToNewDashboard();
    }
}
