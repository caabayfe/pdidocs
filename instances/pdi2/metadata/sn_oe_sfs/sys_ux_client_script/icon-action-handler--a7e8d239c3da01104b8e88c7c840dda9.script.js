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
    api.setState('selectedIcon', event.payload);

    //open the File Upload Popup
    api.emit('MACROPONENT_VIEWPORT_LOAD_REQUESTED', {
        viewportElementId: 'viewport_bbk',
        route: 'form',
        params: {
            formPayload: event.payload
        }
    });
    api.setState('openIconPopup', true);
}
