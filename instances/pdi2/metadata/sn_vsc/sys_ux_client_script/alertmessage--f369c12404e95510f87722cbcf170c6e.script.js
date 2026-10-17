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
    if (api.data.vsc_update_hardening_settings_1.output == 'error') {
        api.setState("hideAlert", false);
    } else {
        api.setState("hideAlert", true);
    }
}
