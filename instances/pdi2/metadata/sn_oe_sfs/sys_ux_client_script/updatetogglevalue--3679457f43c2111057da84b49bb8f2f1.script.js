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
    var toggleValue = event.payload.value;
    var isEnable = toggleValue ? toggleValue : false;

    api.setState('email_digest_enabled', isEnable);
}
