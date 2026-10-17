/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.emit('MACROPONENT_VIEWPORT_LOAD_REQUESTED', {
        viewportElementId: 'viewport_khh',
        route: 'overview',
        fields: null,
        params: null
    });
    api.emit('MACROPONENT_VIEWPORT_LOAD_REQUESTED', {
        viewportElementId: 'viewport_eyy',
        route: 'sow-landingPage-header',
        fields: null,
        params: null
    });
}
