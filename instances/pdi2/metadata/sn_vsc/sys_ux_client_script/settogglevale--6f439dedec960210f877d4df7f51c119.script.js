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
    var getPropValue = api?.data?.read_security_banner_announcement_setting_property?.output;
    api.setState("isToggleSelected", getPropValue);
}
