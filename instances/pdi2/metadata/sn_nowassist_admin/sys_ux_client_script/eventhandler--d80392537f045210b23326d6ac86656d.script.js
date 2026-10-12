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
    if (event.name === 'NOW_CHECKBOX#CHECKED_SET') {
        if (event.elementId === 'checkbox_2' && event.payload.value) {
            api.setState('selectAll', true);
        }
    }
    
}
