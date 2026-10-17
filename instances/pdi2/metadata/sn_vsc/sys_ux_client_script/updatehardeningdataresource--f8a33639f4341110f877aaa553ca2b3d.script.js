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
    var configs = api?.state?.updated_configs;
    /**
     * Send a signal to trigger job but only if the compliant status is changed
     */
    if(api.state.prevPage == "all_settings") {
        configs["triggerPaJob"] = true;
    }
    api.setState("hardening_settings", configs);
}
