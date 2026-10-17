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
        key,
        color
    } = event.payload;

    api.setState('hideColorPicker', false);
    api.setState('selectedColor', {
        key,
        color
    });
}
