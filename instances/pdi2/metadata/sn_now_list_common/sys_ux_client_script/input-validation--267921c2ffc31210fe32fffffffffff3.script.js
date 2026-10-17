/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    const titleMessage = await helpers.translate('List title is required.');
    if (api.state.currentTitleValue.trim() == '') {
        api.setState('alertMessage', [{
            "status": "critical",
            "icon": "triangle-exclamation-outline",
            "content": titleMessage
        }]);
    } else {
        api.setState('alertMessage', []);
    }
}
