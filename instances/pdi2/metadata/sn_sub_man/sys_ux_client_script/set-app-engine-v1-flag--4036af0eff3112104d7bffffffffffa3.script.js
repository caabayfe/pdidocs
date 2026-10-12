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
    if (api.data.check_app_engine_v1_subscription.output === "true") {
        api.setState("isAppEngineV1Subscription", true);
    }
}
