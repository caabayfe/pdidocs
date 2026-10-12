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
    api.setState('cloneRequestIdSelectedItemId', event.payload.value);
    api.setState('cloneRequestIdSelectedItemLabel', event.payload.item.label);
    if (event.payload.value != 'clickToSelectCloneRequest') {
        api.setState('disableContinuebutton', false);
    } else {
        api.setState('disableContinuebutton', true);
    }
}
