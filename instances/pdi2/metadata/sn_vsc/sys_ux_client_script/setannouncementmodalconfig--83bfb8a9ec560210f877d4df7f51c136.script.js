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
    var propValue = api.state.isToggleSelected;
    api.setState('propValSelected', propValue);
    api.data.configure_security_banner_announcement_settings.refresh({
        data: propValue
    });

}
